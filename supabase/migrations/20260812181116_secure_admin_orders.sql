begin;

do $$
begin
  if to_regclass('public.encomendas') is null
     or to_regclass('public.encomenda_itens') is null then
    raise exception 'As tabelas de encomendas esperadas não existem; migração interrompida.';
  end if;

  if not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'criar_encomenda'
      and p.prosecdef
  ) then
    raise exception 'A função pública criar_encomenda deve ser SECURITY DEFINER antes de retirar o INSERT anónimo.';
  end if;
end
$$;

alter table public.encomendas enable row level security;
alter table public.encomenda_itens enable row level security;

-- A criação pública é feita exclusivamente pela função criar_encomenda.
-- Visitantes não devem consultar nem alterar dados pessoais diretamente.
revoke all privileges on table public.encomendas from anon;
revoke all privileges on table public.encomenda_itens from anon;

-- O projeto não permite registo público de utilizadores. As contas
-- authenticated são criadas manualmente para a equipa administrativa.
grant select on table public.encomendas to authenticated;
grant update (estado) on table public.encomendas to authenticated;
grant select on table public.encomenda_itens to authenticated;

drop policy if exists "admin_read_orders" on public.encomendas;
drop policy if exists "admin_update_order_status" on public.encomendas;
drop policy if exists "admin_read_order_items" on public.encomenda_itens;
drop policy if exists "admin le encomendas" on public.encomendas;
drop policy if exists "admin le itens" on public.encomenda_itens;
drop policy if exists "anon cria encomendas" on public.encomendas;
drop policy if exists "anon cria itens" on public.encomenda_itens;

create policy "admin_read_orders"
on public.encomendas
for select
to authenticated
using (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
);

create policy "admin_update_order_status"
on public.encomendas
for update
to authenticated
using (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
)
with check (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
  and
  estado in ('novo', 'confirmado', 'em_producao', 'pronto', 'entregue', 'cancelado')
);

create policy "admin_read_order_items"
on public.encomenda_itens
for select
to authenticated
using (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
);

notify pgrst, 'reload schema';

commit;
