begin;

-- =====================================================================
-- Cupões: desconto aplicado na encomenda, uso único e só para quem avaliou
-- =====================================================================
--   * 6% de desconto sobre os produtos com preço (não inclui a entrega),
--     gravado na encomenda e já descontado no total estimado.
--   * Cada cupão só pode ser usado numa encomenda (encomendas canceladas
--     libertam o cupão).
--   * Só é aceite se o email da encomenda for o mesmo email indicado na
--     avaliação que gerou o cupão.
-- =====================================================================

alter table public.definicoes_lancamento
  add column if not exists cupao_desconto_percentagem numeric(5, 2) not null default 6;

alter table public.encomendas
  add column if not exists desconto_percentagem numeric(5, 2),
  add column if not exists desconto_valor numeric(10, 2);

-- Uso único: não pode haver duas encomendas activas com o mesmo cupão.
create unique index if not exists encomendas_cupao_uso_unico
  on public.encomendas (cupao)
  where cupao is not null and estado <> 'cancelado';

-- Sem email não é possível associar o cupão a quem avaliou, por isso só
-- geramos cupão quando a avaliação traz email.
create or replace function public.avaliacoes_antes_de_inserir()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_aprovacao_automatica boolean;
  v_cupoes_activos boolean;
  v_lancamento timestamptz;
begin
  select avaliacoes_aprovacao_automatica, avaliacoes_cupoes_activos, lancamento_em
    into v_aprovacao_automatica, v_cupoes_activos, v_lancamento
    from public.definicoes_lancamento
   where id;

  perform set_config('pali.ultimo_cupao', '', true);

  if coalesce(v_aprovacao_automatica, false) then
    new.estado := 'aprovada';
    new.aprovada_em := now();
  end if;

  if coalesce(v_cupoes_activos, false)
     and coalesce(trim(new.email), '') <> ''
     and (
       v_lancamento is null
       or now() between v_lancamento and v_lancamento + interval '24 hours'
     ) then
    new.cupao := 'PALI' || lpad(nextval('public.avaliacoes_cupao_seq')::text, 2, '0');
    new.cupao_valido_ate := now() + interval '1 year';
    perform set_config('pali.ultimo_cupao', new.cupao, true);
  end if;

  return new;
end;
$function$;

-- Validação com o email de quem encomenda.
create or replace function public.validar_cupao(p_cupao text, p_email text)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select exists (
    select 1
      from public.avaliacoes a
     where a.cupao = upper(trim(coalesce(p_cupao, '')))
       and a.estado <> 'rejeitada'
       and a.cupao_valido_ate >= now()
       and lower(trim(a.email)) = lower(trim(coalesce(p_email, '')))
       and not exists (
         select 1
           from public.encomendas e
          where e.cupao = a.cupao
            and e.estado <> 'cancelado'
       )
  );
$function$;

revoke all on function public.validar_cupao(text, text) from public;
grant execute on function public.validar_cupao(text, text) to anon, authenticated;

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
    insert into public.encomenda_itens (
      encomenda_id, produto_slug, produto_nome,
      categoria, quantidade, preco_unitario, personalizacao
    ) values (
      v_id,
      left(coalesce(v_item->>'slug', 'desconhecido'), 120),
      left(coalesce(v_item->>'nome', 'Produto'), 200),
      left(coalesce(v_item->>'categoria', ''), 120),
      greatest(1, least(coalesce((v_item->>'quantidade')::int, 1), 999)),
      (v_item->>'preco')::numeric,
      case
        when jsonb_typeof(v_item->'personalizacao') = 'object'
          then v_item->'personalizacao'
        else '{}'::jsonb
      end
    );

    v_total := v_total + coalesce(
      (v_item->>'preco')::numeric *
      greatest(1, least(coalesce((v_item->>'quantidade')::int, 1), 999)),
      0
    );
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

-- A versão antiga (só com o código) deixa de ser usada.
drop function if exists public.validar_cupao(text);

notify pgrst, 'reload schema';

commit;
