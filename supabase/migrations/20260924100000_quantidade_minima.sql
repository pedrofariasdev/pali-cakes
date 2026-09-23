begin;

-- =====================================================================
-- Quantidade mínima por produto
-- =====================================================================
-- O cliente vê o mínimo na página do produto, o seletor começa nesse valor
-- e o carrinho não deixa descer abaixo dele. A função criar_encomenda
-- garante o mínimo também no servidor.
-- =====================================================================

alter table public.produtos
  add column if not exists quantidade_minima integer not null default 1;

alter table public.produtos
  drop constraint if exists produtos_quantidade_minima_valida;

alter table public.produtos
  add constraint produtos_quantidade_minima_valida
  check (quantidade_minima between 1 and 99);

-- ---------------------------------------------------------------------
-- Produtos que ainda não existiam. Ficam escondidos (sem foto nem preço);
-- basta completar no admin e marcar "Visível no site".
-- ---------------------------------------------------------------------
insert into public.produtos (
  slug, nome, descricao, categoria_slug, imagem_url, imagens,
  preco, preco_label, destaque, ativo, ordem, opcoes, quantidade_minima
)
select novo.slug, novo.nome, novo.descricao, 'miniaturas', '', '[]'::jsonb,
       null, 'Sob consulta', false, false, novo.ordem, '{}'::jsonb, novo.minimo
  from (
    values
      ('dubai-chewy-cookie', 'Dubai chewy cookie',
       'Dubai chewy cookie artesanal, feito por encomenda.', 31, 4),
      ('brownies-unidade', 'Brownie (unidade)',
       'Brownie artesanal vendido à unidade.', 32, 4),
      ('cakesicles', 'Cakesicles',
       'Cakesicles decorados à medida da sua celebração.', 33, 6),
      ('cookies', 'Cookies',
       'Cookies artesanais, feitos por encomenda.', 34, 6),
      ('microfones', 'Microfones',
       'Doces em forma de microfone, decorados à medida da sua celebração.', 35, 4)
  ) as novo(slug, nome, descricao, ordem, minimo)
 where not exists (
   select 1 from public.produtos p where p.slug = novo.slug
 );

-- ---------------------------------------------------------------------
-- Mínimos dos produtos já existentes.
-- ---------------------------------------------------------------------
update public.produtos as p
   set quantidade_minima = m.minimo
  from (
    values
      ('coxinhas-de-morango', 4),
      ('morango-do-amor', 4),
      ('brownies-artesanais', 4),
      ('dubai-chewy-cookie', 4),
      ('brigadeiros', 12),
      ('brownies-unidade', 4),
      ('mini-brownie', 12),
      ('cakesicles', 6),
      ('cake-pops', 6),
      ('cookies', 6),
      ('microfones', 4),
      ('cupcakes', 6)
  ) as m(slug, minimo)
 where p.slug = m.slug;

-- ---------------------------------------------------------------------
-- criar_encomenda: mesma função, agora a garantir o mínimo de cada produto.
-- ---------------------------------------------------------------------
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
    select coalesce(max(quantidade_minima), 1)
      into v_minimo
      from public.produtos
     where slug = v_item->>'slug';

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
