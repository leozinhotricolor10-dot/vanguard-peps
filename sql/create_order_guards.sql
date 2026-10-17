-- Rate limit do create-order (out/2026) — AINDA NÃO APLICADO em produção.
-- Rodar no Supabase: SQL Editor → colar tudo → Run (antes ou depois do deploy da função:
-- sem esta função SQL o create-order só registra um aviso no log e deixa o pedido passar).
--
-- Contadores por janela fixa. A chave já chega com HMAC (ex.: "ip10m:9f3a…"), sem CPF/IP em claro.
-- Tabela com RLS ligado e nenhuma política: só a service role (Edge Function) mexe.

create table if not exists public.order_rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  hits         integer     not null default 0,
  updated_at   timestamptz not null default now()
);

alter table public.order_rate_limits enable row level security;
do $$
declare r record;
begin
  for r in select policyname from pg_policies where schemaname = 'public' and tablename = 'order_rate_limits' loop
    execute format('drop policy %I on public.order_rate_limits', r.policyname);
  end loop;
end $$;
revoke all on public.order_rate_limits from anon, authenticated;

-- Registra 1 tentativa em cada regra e diz se alguma estourou.
-- p_rules = [{"key": text, "window": segundos, "max": n}, ...]  (até 10 regras)
-- Retorno: {"ok": true}  ou  {"ok": false, "retry_after": segundos}
-- Atômico: INSERT … ON CONFLICT trava a linha, então pedidos simultâneos não "furam" o limite.
create or replace function public.order_rate_hit(p_rules jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r     jsonb;
  k     text;
  w     integer;
  m     integer;
  rec   public.order_rate_limits%rowtype;
  retry integer;
  worst integer := 0;
begin
  if p_rules is null or jsonb_typeof(p_rules) <> 'array' or jsonb_array_length(p_rules) > 10 then
    raise exception 'order_rate_hit: regras inválidas';
  end if;

  for r in select value from jsonb_array_elements(p_rules) loop
    k := left(r->>'key', 120);
    w := nullif(r->>'window', '')::integer;
    m := nullif(r->>'max', '')::integer;
    continue when k is null or k = '' or w is null or m is null or w <= 0 or w > 604800 or m <= 0;

    insert into public.order_rate_limits as t (key, window_start, hits, updated_at)
    values (k, now(), 1, now())
    on conflict (key) do update set
      -- no SET, t.* é a linha antiga: janela vencida recomeça do zero
      hits         = case when t.window_start <= now() - make_interval(secs => w) then 1 else t.hits + 1 end,
      window_start = case when t.window_start <= now() - make_interval(secs => w) then now() else t.window_start end,
      updated_at   = now()
    returning * into rec;

    if rec.hits > m then
      retry := greatest(1, ceil(extract(epoch from (rec.window_start + make_interval(secs => w) - now())))::integer);
      worst := greatest(worst, retry);
    end if;
  end loop;

  -- Limpeza ocasional (a maior janela é de 1 dia)
  if random() < 0.05 then
    delete from public.order_rate_limits where updated_at < now() - interval '2 days';
  end if;

  if worst > 0 then
    return jsonb_build_object('ok', false, 'retry_after', worst);
  end if;
  return jsonb_build_object('ok', true);
end $$;

-- Só a service role chama (o Supabase dá EXECUTE para anon/authenticated por padrão em funções novas)
revoke all on function public.order_rate_hit(jsonb) from public, anon, authenticated;
grant execute on function public.order_rate_hit(jsonb) to service_role;

-- Conferência: rls = true, politicas = 0, anon sem EXECUTE
select c.relname as tabela, c.relrowsecurity as rls,
       (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname) as politicas,
       has_function_privilege('anon', 'public.order_rate_hit(jsonb)', 'execute') as anon_executa
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'order_rate_limits';
