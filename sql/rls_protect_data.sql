-- Vanguard — fecha as tabelas com dados de clientes e do negócio.
-- Rodar no Supabase: SQL Editor → colar tudo → Run.
-- O site já usa as Edge Functions public-api (loja) e admin-db (admin com senha),
-- que acessam o banco com a service role e não dependem destas políticas.

-- 1. Dados pessoais e do negócio: RLS ligado e nenhuma política
--    (visitante com a chave pública não lê nem grava nada)
do $$
declare
  t text;
  r record;
begin
  foreach t in array array['orders','preorders','customers','coupons','expenses',
                           'import_history','purchase_order_caps','admin_rate_limits']
  loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      for r in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
        execute format('drop policy %I on public.%I', r.policyname, t);
      end loop;
    end if;
  end loop;
end $$;

-- 2. Catálogo: qualquer um lê, só o servidor grava
do $$
declare
  t text;
  r record;
begin
  foreach t in array array['products','stock','site_config']
  loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      for r in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
        execute format('drop policy %I on public.%I', r.policyname, t);
      end loop;
      execute format('create policy "leitura publica" on public.%I for select using (true)', t);
    end if;
  end loop;
end $$;

-- 3. As funções de estoque do carrinho continuam funcionando para a loja
do $$
declare
  f regprocedure;
begin
  for f in
    select p.oid::regprocedure
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('decrement_stock', 'increment_stock')
  loop
    execute format('alter function %s security definer set search_path = public', f);
  end loop;
end $$;

-- 4. Conferência: deve listar as tabelas com rls = true
select c.relname as tabela, c.relrowsecurity as rls,
       (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname) as politicas
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by 1;
