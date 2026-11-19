-- Vanguard — fecha a escrita no bucket de fotos de produto (product-images).
-- Antes: INSERT/UPDATE/DELETE em storage.objects liberados ao role public só com
-- bucket_id = 'product-images' → qualquer um com a chave pública subia/trocava/apagava fotos.
-- Depois: só a service role escreve (admin-db, ações storage_sign_upload/storage_remove, com senha).
-- A leitura pública ("Public read product images") continua, a loja precisa dela.
--
-- APLICAR SÓ DEPOIS de publicar a admin-db nova e testar o envio de foto no admin.
-- Rodar no Supabase: SQL Editor → colar tudo → Run.

drop policy if exists "Admin upload product images" on storage.objects;
drop policy if exists "Admin update product images" on storage.objects;
drop policy if exists "Admin delete product images" on storage.objects;

-- Conferência: deve sobrar só a de leitura (cmd = SELECT) para product-images.
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
  and (coalesce(qual, '') || coalesce(with_check, '')) like '%product-images%';
