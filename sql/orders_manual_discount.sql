-- Desconto manual do admin no pedido (out/2026) — A APLICAR pelo dono no SQL Editor do Supabase.
-- Aditivo e idempotente: só cria a coluna se não existir; pedidos antigos ficam com 0.
-- O admin (detalhe do pedido) grava aqui pela admin-db e recalcula:
--   total = subtotal − coupon_discount − bundle_discount − points_discount − manual_discount + freight
-- Antes desta coluna o site tentava gravar em "discount", que não existe (o desconto não persistia).
alter table public.orders add column if not exists manual_discount numeric(10,2) not null default 0;

-- Conferência: deve devolver 1 linha (manual_discount | numeric | 0)
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'orders' and column_name = 'manual_discount';
