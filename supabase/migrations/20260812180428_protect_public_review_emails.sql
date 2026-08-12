begin;

do $$
begin
  if to_regclass('public.avaliacoes') is null then
    raise exception 'A tabela public.avaliacoes não existe; migração interrompida.';
  end if;

  if not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'criar_avaliacao'
      and p.prosecdef
  ) then
    raise exception 'A função pública criar_avaliacao deve ser SECURITY DEFINER antes de retirar o INSERT anónimo.';
  end if;

  if (select count(*) from auth.users where is_anonymous is not true) <> 1 then
    raise exception 'Esperava exatamente uma conta administrativa existente; migração interrompida.';
  end if;
end
$$;

-- O projeto tem uma única conta de gestão criada manualmente. A autorização
-- fica em app_metadata, que não pode ser alterada pelo próprio utilizador.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where is_anonymous is not true;

alter table public.avaliacoes enable row level security;

-- O formulário público usa a função criar_avaliacao; a tabela não precisa de
-- INSERT/UPDATE/DELETE para o papel anónimo. O SELECT fica limitado também ao
-- nível das colunas, impedindo que o email seja devolvido mesmo por engano.
revoke all privileges on table public.avaliacoes from anon;

grant select (
  id,
  criado_em,
  nome,
  localidade,
  classificacao,
  comentario,
  produto_slug,
  ocasiao,
  estado,
  aprovada_em
) on table public.avaliacoes to anon;

grant select on table public.avaliacoes to authenticated;
grant update (estado, aprovada_em) on table public.avaliacoes to authenticated;
grant delete on table public.avaliacoes to authenticated;

drop policy if exists "avaliacoes_public_read_approved" on public.avaliacoes;
drop policy if exists "publico le avaliacoes aprovadas" on public.avaliacoes;

create policy "avaliacoes_public_read_approved"
on public.avaliacoes
for select
to anon
using (estado = 'aprovada');

drop policy if exists "admin_manage_reviews" on public.avaliacoes;
drop policy if exists "admin gere avaliacoes" on public.avaliacoes;

create policy "admin_manage_reviews"
on public.avaliacoes
for all
to authenticated
using (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
)
with check (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
  and estado in ('pendente', 'aprovada', 'rejeitada')
);

do $$
begin
  if has_column_privilege('anon', 'public.avaliacoes', 'email', 'SELECT') then
    raise exception 'O papel anon ainda possui acesso de leitura ao email das avaliações.';
  end if;
end
$$;

notify pgrst, 'reload schema';

commit;
