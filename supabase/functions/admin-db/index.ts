import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Operações do admin nas tabelas protegidas por RLS, com a service role.
// Só ações fixas (list/get/insert/update/upsert/delete), em tabelas listadas,
// filtrando apenas pela coluna-chave de cada tabela. Exige a senha de admin.
const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// tabela → [coluna-chave, coluna de ordenação da listagem]
const TABLES: Record<string, [string, string]> = {
  orders: ["id", "created_at"],
  preorders: ["id", "created_at"],
  customers: ["cpf", "points"],
  coupons: ["id", "created_at"],
  expenses: ["id", "created_at"],
  import_history: ["id", "created_at"],
  purchase_order_caps: ["id", "created_at"],
  products: ["id", "sort_order"],
  stock: ["product_id", "product_id"],
  site_config: ["key", "key"],
};
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: CORS_HEADERS });
const fail = (message: string, status = 400) => json({ data: null, error: { message } }, status);
const isRow = (v: unknown) => !!v && typeof v === "object" && !Array.isArray(v);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return fail("Method not allowed", 405);
  if (!ADMIN_PASSWORD) return fail("Not configured", 500);

  let body: { password?: string; action?: string; table?: string; value?: unknown; patch?: unknown; rows?: unknown };
  try { body = await req.json(); } catch { return fail("Invalid JSON"); }

  // Sem senha = página antiga/em cache, não um chute: recusa sem contar tentativa
  if (!body.password) return fail("Unauthorized", 401);

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  const { data: rl } = await supabase
    .from("admin_rate_limits")
    .select("attempts, locked_until")
    .eq("ip", ip)
    .maybeSingle();
  if (rl?.locked_until && new Date(rl.locked_until) > new Date()) return fail("Locked", 429);
  if (body.password !== ADMIN_PASSWORD) {
    const attempts = (rl?.attempts || 0) + 1;
    const locked_until = attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS).toISOString() : null;
    await supabase.from("admin_rate_limits").upsert(
      { ip, attempts, locked_until, updated_at: new Date().toISOString() },
      { onConflict: "ip" },
    );
    return fail("Unauthorized", 401);
  }

  const { action, table } = body;
  const def = table ? TABLES[table] : undefined;
  if (!table || !def) return fail("Table not allowed", 403);
  const [key, orderCol] = def;
  const value = body.value;
  const hasValue = typeof value === "string" || typeof value === "number";

  try {
    let res;
    switch (action) {
      case "list":
        res = await supabase.from(table).select("*").order(orderCol, { ascending: orderCol === "sort_order" || orderCol === key });
        break;
      case "get":
        if (!hasValue) return fail("Missing key value");
        res = await supabase.from(table).select("*").eq(key, value).maybeSingle();
        break;
      case "insert": {
        const rows = Array.isArray(body.rows) ? body.rows : [body.rows];
        if (!rows.length || !rows.every(isRow)) return fail("Invalid rows");
        res = await supabase.from(table).insert(rows).select();
        break;
      }
      case "upsert": {
        const rows = Array.isArray(body.rows) ? body.rows : [body.rows];
        if (!rows.length || !rows.every(isRow)) return fail("Invalid rows");
        res = await supabase.from(table).upsert(rows, { onConflict: key }).select();
        break;
      }
      case "update":
        if (!hasValue || !isRow(body.patch)) return fail("Invalid update");
        res = await supabase.from(table).update(body.patch as Record<string, unknown>).eq(key, value).select();
        break;
      case "delete":
        if (!hasValue) return fail("Missing key value");
        res = await supabase.from(table).delete().eq(key, value);
        break;
      default:
        return fail("Unknown action");
    }
    return json({ data: res.data ?? null, error: res.error ? { message: res.error.message } : null });
  } catch (err) {
    return fail((err as Error).message, 500);
  }
});
