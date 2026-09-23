begin;

-- Cupão de desconto indicado pelo cliente ao finalizar a encomenda.
-- Só são aceites cupões que existam (gerados pelas avaliações). O desconto
-- em si é aplicado pela Pali Cakes no orçamento final.

alter table public.encomendas
  add column if not exists cupao text;

-- =====================================================================
-- Regras dos cupões
--   * Só são gerados nas primeiras 24 horas a contar da data de lançamento.
--     Enquanto a data não estiver definida, são sempre gerados (testes).
--     Definir a data de lançamento (hora de Portugal):
--       update public.definicoes_lancamento
--          set lancamento_em = '2026-10-01 10:00:00+01';
--   * Cada cupão pode ser usado durante 1 ano a partir da avaliação.
-- =====================================================================

alter table public.definicoes_lancamento
  add column if not exists lancamento_em timestamptz;

alter table public.avaliacoes
  add column if not exists cupao_valido_ate timestamptz;

update public.avaliacoes
   set cupao_valido_ate = criado_em + interval '1 year'
 where cupao is not null
   and cupao_valido_ate is null;

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

  -- Guarda o cupão gerado nesta transacção, para a função pública o devolver.
  perform set_config('pali.ultimo_cupao', '', true);

  if coalesce(v_aprovacao_automatica, false) then
    new.estado := 'aprovada';
    new.aprovada_em := now();
  end if;

  if coalesce(v_cupoes_activos, false)
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

create or replace function public.criar_avaliacao_com_cupao(
  p_nome text,
  p_email text,
  p_localidade text,
  p_classificacao integer,
  p_comentario text,
  p_produto_slug text,
  p_ocasiao text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_aprovacao_automatica boolean;
  v_cupao text;
  v_valido_ate timestamptz;
begin
  perform public.criar_avaliacao(
    p_nome => p_nome,
    p_email => p_email,
    p_localidade => p_localidade,
    p_classificacao => p_classificacao::smallint,
    p_comentario => p_comentario,
    p_produto_slug => p_produto_slug,
    p_ocasiao => p_ocasiao
  );

  v_cupao := nullif(current_setting('pali.ultimo_cupao', true), '');

  if v_cupao is not null then
    select cupao_valido_ate into v_valido_ate
      from public.avaliacoes
     where cupao = v_cupao;
  end if;

  select avaliacoes_aprovacao_automatica
    into v_aprovacao_automatica
    from public.definicoes_lancamento
   where id;

  return jsonb_build_object(
    'publicada', coalesce(v_aprovacao_automatica, false),
    'cupao', v_cupao,
    'valido_ate', v_valido_ate
  );
end;
$function$;

-- Verificação pública usada pelo checkout, antes de enviar a encomenda.
-- O cupão tem de existir, não pertencer a uma avaliação rejeitada e estar
-- dentro do prazo de 1 ano.
create or replace function public.validar_cupao(p_cupao text)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select exists (
    select 1
      from public.avaliacoes
     where cupao = upper(trim(coalesce(p_cupao, '')))
       and estado <> 'rejeitada'
       and cupao_valido_ate >= now()
  );
$function$;

revoke all on function public.validar_cupao(text) from public;
grant execute on function public.validar_cupao(text) to anon, authenticated;

-- A função criar_encomenda ganha um parâmetro novo. Apagamos todas as
-- versões anteriores para não ficarem duas assinaturas em simultâneo
-- (o PostgREST pode não conseguir escolher entre elas).
do $$
declare
  v_assinatura regprocedure;
begin
  for v_assinatura in
    select p.oid::regprocedure
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname = 'criar_encomenda'
  loop
    execute format('drop function %s', v_assinatura);
  end loop;
end
$$;

create function public.criar_encomenda(
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
  v_id    uuid;
  v_ref   text;
  v_item  jsonb;
  v_total numeric := 0;
  v_cupao text := nullif(upper(trim(coalesce(p_cupao, ''))), '');
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

  if v_cupao is not null and not public.validar_cupao(v_cupao) then
    raise exception 'Cupão inválido.';
  end if;

  insert into public.encomendas (
    cliente_nome, cliente_telefone, cliente_email,
    metodo_entrega, morada, codigo_postal, localidade,
    data_evento, tipo_celebracao, observacoes, horario_preferido,
    imagens_referencia, cupao
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
    v_cupao
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

  update public.encomendas
     set total_estimado = nullif(v_total, 0)
   where id = v_id;

  return v_ref;
end;
$function$;

revoke all on function public.criar_encomenda(text, text, text, text, text, text, text, date, text, text, jsonb, text, jsonb, text) from public;
grant execute on function public.criar_encomenda(text, text, text, text, text, text, text, date, text, text, jsonb, text, jsonb, text) to anon, authenticated;

notify pgrst, 'reload schema';

commit;
