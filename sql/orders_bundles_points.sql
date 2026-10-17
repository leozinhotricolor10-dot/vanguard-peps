-- Combos e pontos validados no servidor (create-order) — out/2026
-- Colunas novas no pedido: desconto de combo, combos aplicados, pontos resgatados e o desconto deles.
alter table public.orders add column if not exists bundle_discount integer not null default 0;
alter table public.orders add column if not exists bundles jsonb;
alter table public.orders add column if not exists points_used integer not null default 0;
alter table public.orders add column if not exists points_discount integer not null default 0;

-- Combos e regra de pontos ficam em site_config (leitura pública já liberada; escrita só pela admin-db):
--   key 'bundles'        → JSON [{id,name,desc,items:[product_id],price,badge,active}]
--   key 'points_config'  → JSON {rate, redeem}  (redeem = R$ por 100 pontos)
insert into public.site_config (key, value) values
  ('bundles', '[{"id":"bundle-emagre","name":"Stack Emagrecimento Total","desc":"Tirzepatida 15mg + Tesamorelin 5mg — protocolo duplo GLP-1 e queima visceral","items":["tirzepatida","tesamorelin"],"price":549,"badge":"🔥 Economize R$ 49","active":true},{"id":"bundle-beleza","name":"Stack Beleza & Pele","desc":"GHK-Cu 50mg + SNAP-8 10mg — colágeno e antienvelhecimento","items":["ghkcu","snap8"],"price":549,"badge":"💎 Economize R$ 40","active":true},{"id":"bundle-longe","name":"Stack Longevidade Premium","desc":"Epithalon 10mg + Selank 5mg — longevidade celular e equilíbrio mental","items":["epithalon","selank"],"price":399,"badge":"⭐ Economize R$ 49","active":true}]'),
  ('points_config', '{"rate":1,"redeem":5}')
on conflict (key) do nothing;
