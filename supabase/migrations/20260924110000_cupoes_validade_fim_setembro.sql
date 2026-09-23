begin;

-- =====================================================================
-- Validade dos cupões: deixa de ser 1 ano e passa a ser uma data fixa,
-- o fim de setembro de 2026 (hora de Portugal).
--
-- Para mudar a data no futuro:
--   update public.definicoes_lancamento
--      set cupoes_validos_ate = '2026-10-31 23:59:59+00';
--   update public.avaliacoes
--      set cupao_valido_ate = (select cupoes_validos_ate from public.definicoes_lancamento)
--    where cupao is not null;
-- =====================================================================

alter table public.definicoes_lancamento
  add column if not exists cupoes_validos_ate timestamptz
  not null default '2026-09-30 23:59:59+01';

update public.definicoes_lancamento
   set cupoes_validos_ate = '2026-09-30 23:59:59+01';

-- Cupões já gerados passam a ter a mesma data limite.
update public.avaliacoes
   set cupao_valido_ate = '2026-09-30 23:59:59+01'
 where cupao is not null;

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
  v_validos_ate timestamptz;
begin
  select avaliacoes_aprovacao_automatica, avaliacoes_cupoes_activos,
         lancamento_em, cupoes_validos_ate
    into v_aprovacao_automatica, v_cupoes_activos, v_lancamento, v_validos_ate
    from public.definicoes_lancamento
   where id;

  perform set_config('pali.ultimo_cupao', '', true);

  if coalesce(v_aprovacao_automatica, false) then
    new.estado := 'aprovada';
    new.aprovada_em := now();
  end if;

  -- Só gera cupão com email, dentro da janela de 24h do lançamento e
  -- enquanto a data limite de utilização ainda não passou.
  if coalesce(v_cupoes_activos, false)
     and coalesce(trim(new.email), '') <> ''
     and (v_validos_ate is null or now() < v_validos_ate)
     and (
       v_lancamento is null
       or now() between v_lancamento and v_lancamento + interval '24 hours'
     ) then
    new.cupao := 'PALI' || lpad(nextval('public.avaliacoes_cupao_seq')::text, 2, '0');
    new.cupao_valido_ate := v_validos_ate;
    perform set_config('pali.ultimo_cupao', new.cupao, true);
  end if;

  return new;
end;
$function$;

notify pgrst, 'reload schema';

commit;
