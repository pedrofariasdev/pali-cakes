begin;

do $$
begin
  if to_regclass('public.categorias') is null
     or to_regclass('public.produtos') is null
     or to_regclass('public.zonas_entrega') is null then
    raise exception 'As tabelas administrativas do catálogo não existem; migração interrompida.';
  end if;
end
$$;

alter table public.categorias enable row level security;
alter table public.produtos enable row level security;
alter table public.zonas_entrega enable row level security;

drop policy if exists "admin gere categorias" on public.categorias;
drop policy if exists "admin gere produtos" on public.produtos;
drop policy if exists "admin gere zonas" on public.zonas_entrega;

create policy "admin gere categorias"
on public.categorias
for all
to authenticated
using (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
)
with check (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
);

create policy "admin gere produtos"
on public.produtos
for all
to authenticated
using (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
)
with check (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
);

create policy "admin gere zonas"
on public.zonas_entrega
for all
to authenticated
using (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
)
with check (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
);

notify pgrst, 'reload schema';

commit;
