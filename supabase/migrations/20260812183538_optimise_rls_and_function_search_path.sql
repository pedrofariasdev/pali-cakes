begin;

-- Evita que objetos maliciosos injetados no search_path sejam resolvidos pela
-- função de trigger que mantém as datas de atualização.
alter function public.tocar_atualizado_em()
  set search_path = pg_catalog, public;

-- Colocar auth.jwt() num SELECT isolado permite que o Postgres avalie a claim
-- uma única vez por consulta, em vez de repetir a chamada para cada linha.
alter policy "admin_manage_reviews"
on public.avaliacoes
using (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
)
with check (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
  and estado in ('pendente', 'aprovada', 'rejeitada')
);

alter policy "admin_read_orders"
on public.encomendas
using (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
);

alter policy "admin_update_order_status"
on public.encomendas
using (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
)
with check (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
  and estado in ('novo', 'confirmado', 'em_producao', 'pronto', 'entregue', 'cancelado')
);

alter policy "admin_read_order_items"
on public.encomenda_itens
using (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
);

alter policy "admin gere categorias"
on public.categorias
using (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
)
with check (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
);

alter policy "admin gere produtos"
on public.produtos
using (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
)
with check (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
);

alter policy "admin gere zonas"
on public.zonas_entrega
using (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
)
with check (
  (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
);

notify pgrst, 'reload schema';

commit;
