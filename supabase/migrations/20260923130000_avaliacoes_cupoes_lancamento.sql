begin;

-- =====================================================================
-- Lançamento: cupões por avaliação + publicação automática
-- =====================================================================
-- Cada avaliação recebe um cupão sequencial (PALI01, PALI02, …) que é
-- mostrado à pessoa logo após enviar. Até ao lançamento, as avaliações
-- ficam publicadas sem precisar de aprovação.
--
-- Interruptores (uma linha de SQL para ligar/desligar):
--   Voltar a exigir aprovação:
--     update public.definicoes_lancamento set avaliacoes_aprovacao_automatica = false;
--   Parar de gerar cupões:
--     update public.definicoes_lancamento set avaliacoes_cupoes_activos = false;
--   Recomeçar a numeração em PALI01 (ex.: no dia do lançamento, depois de
--   apagar as avaliações de teste):
--     update public.avaliacoes set cupao = null;
--     alter sequence public.avaliacoes_cupao_seq restart with 1;
-- =====================================================================

create table if not exists public.definicoes_lancamento (
  id boolean primary key default true check (id),
  avaliacoes_aprovacao_automatica boolean not null default true,
  avaliacoes_cupoes_activos boolean not null default true
);

insert into public.definicoes_lancamento (id)
values (true)
on conflict (id) do nothing;

alter table public.definicoes_lancamento enable row level security;

revoke all privileges on table public.definicoes_lancamento from anon;
grant select, update on table public.definicoes_lancamento to authenticated;

drop policy if exists "admin gere definicoes de lancamento" on public.definicoes_lancamento;

create policy "admin gere definicoes de lancamento"
on public.definicoes_lancamento
for all
to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

-- Cupão da avaliação. Não é concedido ao papel anon (as permissões de
-- leitura públicas são por coluna), por isso nunca aparece no site.
alter table public.avaliacoes
  add column if not exists cupao text;

create unique index if not exists avaliacoes_cupao_unico
  on public.avaliacoes (cupao)
  where cupao is not null;

create sequence if not exists public.avaliacoes_cupao_seq start with 1;

create or replace function public.avaliacoes_antes_de_inserir()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_aprovacao_automatica boolean;
  v_cupoes_activos boolean;
begin
  select avaliacoes_aprovacao_automatica, avaliacoes_cupoes_activos
    into v_aprovacao_automatica, v_cupoes_activos
    from public.definicoes_lancamento
   where id;

  if coalesce(v_aprovacao_automatica, false) then
    new.estado := 'aprovada';
    new.aprovada_em := now();
  end if;

  if coalesce(v_cupoes_activos, false) then
    new.cupao := 'PALI' || lpad(nextval('public.avaliacoes_cupao_seq')::text, 2, '0');
  end if;

  return new;
end;
$function$;

drop trigger if exists avaliacoes_antes_de_inserir on public.avaliacoes;

create trigger avaliacoes_antes_de_inserir
before insert on public.avaliacoes
for each row
execute function public.avaliacoes_antes_de_inserir();

-- Endpoint público usado pelo formulário: reaproveita a função existente
-- criar_avaliacao (validações e limite de envios) e devolve o cupão gerado
-- nesta mesma sessão, para ser mostrado à pessoa.
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
  v_cupoes_activos boolean;
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

  select avaliacoes_aprovacao_automatica, avaliacoes_cupoes_activos
    into v_aprovacao_automatica, v_cupoes_activos
    from public.definicoes_lancamento
   where id;

  return jsonb_build_object(
    'publicada', coalesce(v_aprovacao_automatica, false),
    'cupao',
      case
        when coalesce(v_cupoes_activos, false)
          then 'PALI' || lpad(currval('public.avaliacoes_cupao_seq')::text, 2, '0')
        else null
      end
  );
end;
$function$;

revoke all on function public.criar_avaliacao_com_cupao(text, text, text, integer, text, text, text) from public;
grant execute on function public.criar_avaliacao_com_cupao(text, text, text, integer, text, text, text) to anon, authenticated;

-- Verificação: cria uma avaliação de teste e desfaz tudo. Se a chamada à
-- criar_avaliacao falhar (ex.: assinatura diferente), a migração pára aqui.
do $$
begin
  begin
    perform public.criar_avaliacao_com_cupao(
      'Teste da migração', null, null, 5,
      'Avaliação de teste criada e desfeita pela migração.', null, null
    );
    raise exception 'desfazer_teste';
  exception
    when others then
      if sqlerrm <> 'desfazer_teste' then
        raise exception 'A verificação da função criar_avaliacao_com_cupao falhou: %', sqlerrm;
      end if;
  end;
end
$$;

-- O teste acima gastou um número da sequência; recomeçar em PALI01.
alter sequence public.avaliacoes_cupao_seq restart with 1;

notify pgrst, 'reload schema';

commit;
