begin;

-- =====================================================================
-- Tamanhos com preço e quantidade mínima próprios
-- =====================================================================
-- opcoes.tamanhos = [{ "nome": "Mini", "preco": 1.5, "quantidade_minima": 12 }, …]
-- Ao trocar de tamanho no site mudam o preço e o mínimo. A encomenda guarda
-- o tamanho em personalizacao.tamanho e o servidor usa o mínimo desse tamanho.
-- =====================================================================

-- Brownies artesanais: o grupo "Tamanho" (sem preço) passa a tamanhos com
-- preço (a preencher no admin) e mínimos Mini 12 / Normal 4 / Inteiro 1.
update public.produtos
   set opcoes = jsonb_set(
         coalesce(opcoes, '{}'::jsonb),
         '{tamanhos}',
         '[
           {"nome": "Mini", "preco": null, "quantidade_minima": 12},
           {"nome": "Normal", "preco": null, "quantidade_minima": 4},
           {"nome": "Inteiro", "preco": null, "quantidade_minima": 1}
         ]'::jsonb
       )
       || jsonb_build_object(
         'grupos_variantes',
         coalesce(
           (
             select jsonb_agg(g)
               from jsonb_array_elements(
                      case
                        when jsonb_typeof(opcoes->'grupos_variantes') = 'array'
                          then opcoes->'grupos_variantes'
                        else '[]'::jsonb
                      end
                    ) as g
              where lower(g->>'nome') <> 'tamanho'
           ),
           '[]'::jsonb
         )
       ),
       quantidade_minima = 1
 where slug = 'brownies-artesanais';

-- criar_encomenda: igual à anterior, mas com o mínimo por tamanho.
create or replace function public.criar_encomenda(
  p_cliente_nome text,
  p_cliente_telefone text,
  p_cliente_email text,
  p_metodo_entrega text,
  p_morada text,
  p_codigo_postal text,
  p_localidade text,
  p_data_evento date,
  p_tipo_celebracao text,
  p_observacoes text,
  p_itens jsonb,
  p_horario_preferido text default null,
  p_imagens_referencia jsonb default '[]'::jsonb,
  p_cupao text default null
)
returns text
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_id         uuid;
  v_ref        text;
  v_item       jsonb;
  v_total      numeric := 0;
  v_cupao      text := nullif(upper(trim(coalesce(p_cupao, ''))), '');
  v_percentual numeric;
  v_desconto   numeric;
  v_minimo     integer;
  v_quantidade integer;
begin
  if coalesce(trim(p_cliente_nome), '') = '' then
    raise exception 'O nome é obrigatório.';
  end if;

  if coalesce(trim(p_cliente_telefone), '') = '' then
    raise exception 'O telefone é obrigatório.';
  end if;

  if p_metodo_entrega not in ('levantamento', 'entrega') then
    raise exception 'Método de entrega inválido.';
  end if;

  if jsonb_typeof(p_itens) <> 'array'
     or jsonb_array_length(p_itens) = 0 then
    raise exception 'A encomenda não tem produtos.';
  end if;

  if jsonb_array_length(p_itens) > 50 then
    raise exception 'Demasiados produtos numa só encomenda.';
  end if;

  if v_cupao is not null then
    if not public.validar_cupao(v_cupao, p_cliente_email) then
      raise exception 'Cupão inválido.';
    end if;

    select cupao_desconto_percentagem
      into v_percentual
      from public.definicoes_lancamento
     where id;

    v_percentual := coalesce(v_percentual, 6);
  end if;

  insert into public.encomendas (
    cliente_nome, cliente_telefone, cliente_email,
    metodo_entrega, morada, codigo_postal, localidade,
    data_evento, tipo_celebracao, observacoes, horario_preferido,
    imagens_referencia, cupao, desconto_percentagem
  ) values (
    left(trim(p_cliente_nome), 120),
    left(trim(p_cliente_telefone), 40),
    nullif(left(trim(coalesce(p_cliente_email, '')), 160), ''),
    p_metodo_entrega,
    nullif(left(trim(coalesce(p_morada, '')), 240), ''),
    nullif(left(trim(coalesce(p_codigo_postal, '')), 20), ''),
    nullif(left(trim(coalesce(p_localidade, '')), 120), ''),
    p_data_evento,
    nullif(left(trim(coalesce(p_tipo_celebracao, '')), 60), ''),
    nullif(left(trim(coalesce(p_observacoes, '')), 2000), ''),
    nullif(left(trim(coalesce(p_horario_preferido, '')), 120), ''),
    case
      when jsonb_typeof(p_imagens_referencia) = 'array'
        then p_imagens_referencia
      else '[]'::jsonb
    end,
    v_cupao,
    v_percentual
  )
  returning id, referencia into v_id, v_ref;

  for v_item in select * from jsonb_array_elements(p_itens)
  loop
    -- Mínimo do tamanho escolhido (se existir); senão, o mínimo do produto.
    select coalesce(
             (
               select (t->>'quantidade_minima')::int
                 from jsonb_array_elements(
                        case
                          when jsonb_typeof(p.opcoes->'tamanhos') = 'array'
                            then p.opcoes->'tamanhos'
                          else '[]'::jsonb
                        end
                      ) as t
                where t->>'nome' = v_item->'personalizacao'->>'tamanho'
                limit 1
             ),
             p.quantidade_minima
           )
      into v_minimo
      from public.produtos p
     where p.slug = v_item->>'slug'
     limit 1;

    v_minimo := greatest(1, least(coalesce(v_minimo, 1), 99));

    v_quantidade := greatest(
      v_minimo,
      least(coalesce((v_item->>'quantidade')::int, 1), 999)
    );

    insert into public.encomenda_itens (
      encomenda_id, produto_slug, produto_nome,
      categoria, quantidade, preco_unitario, personalizacao
    ) values (
      v_id,
      left(coalesce(v_item->>'slug', 'desconhecido'), 120),
      left(coalesce(v_item->>'nome', 'Produto'), 200),
      left(coalesce(v_item->>'categoria', ''), 120),
      v_quantidade,
      (v_item->>'preco')::numeric,
      case
        when jsonb_typeof(v_item->'personalizacao') = 'object'
          then v_item->'personalizacao'
        else '{}'::jsonb
      end
    );

    v_total := v_total + coalesce((v_item->>'preco')::numeric * v_quantidade, 0);
  end loop;

  v_desconto := case
    when v_percentual is not null and v_total > 0
      then round(v_total * v_percentual / 100, 2)
    else null
  end;

  update public.encomendas
     set total_estimado = nullif(v_total - coalesce(v_desconto, 0), 0),
         desconto_valor = v_desconto
   where id = v_id;

  return v_ref;
end;
$function$;

notify pgrst, 'reload schema';

commit;
