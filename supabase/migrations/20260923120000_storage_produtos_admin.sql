begin;

-- Nenhum produto tem ainda uma foto guardada no Storage: os uploads feitos no
-- admin para o bucket "produtos" estavam a ser recusados. Esta migração garante
-- que o bucket existe, é público (para as fotos aparecerem no site) e que a
-- conta de administração pode enviar, substituir e apagar fotos.

insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do update set public = true;

drop policy if exists "admin envia fotos de produtos" on storage.objects;
drop policy if exists "admin actualiza fotos de produtos" on storage.objects;
drop policy if exists "admin apaga fotos de produtos" on storage.objects;
drop policy if exists "admin le fotos de produtos" on storage.objects;

create policy "admin envia fotos de produtos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'produtos'
  and (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
);

create policy "admin actualiza fotos de produtos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'produtos'
  and (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
)
with check (
  bucket_id = 'produtos'
  and (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
);

create policy "admin apaga fotos de produtos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'produtos'
  and (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
);

-- SELECT para o admin, necessário para substituir/apagar ficheiros através da
-- API (o público continua a ver as fotos pelo URL público do bucket).
create policy "admin le fotos de produtos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'produtos'
  and (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
);

commit;
