import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Pool de remetentes do Melhor Envios, guardada num bucket privado.
// Só lê/grava com a senha de admin (mesma do verify-admin).
const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const BUCKET = "admin-private";
const FILE = "me-senders.json";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: CORS_HEADERS });

async function readPool() {
  const { data, error } = await supabase.storage.from(BUCKET).download(FILE);
  if (error || !data) return [];
  try { return JSON.parse(await data.text()); } catch { return []; }
}

async function writePool(pool: unknown[]) {
  await supabase.storage.createBucket(BUCKET, { public: false }).catch(() => {});
  const blob = new Blob([JSON.stringify(pool)], { type: "application/json" });
  const { error } = await supabase.storage.from(BUCKET).upload(FILE, blob, { upsert: true });
  if (error) throw error;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
  if (!ADMIN_PASSWORD) return json({ ok: false, error: "Not configured" }, 500);

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  const { data: rl } = await supabase
    .from("admin_rate_limits")
    .select("attempts, locked_until")
    .eq("ip", ip)
    .maybeSingle();
  if (rl?.locked_until && new Date(rl.locked_until) > new Date()) {
    return json({ ok: false, locked: true }, 429);
  }

  let body: { password?: string; action?: string; pool?: unknown };
  try { body = await req.json(); } catch { return json({ ok: false, error: "Invalid JSON" }, 400); }

  // Sem senha = página antiga/em cache, não um chute: recusa sem contar tentativa
  if (!body.password) return json({ ok: false, error: "Unauthorized" }, 401);
  if (body.password !== ADMIN_PASSWORD) {
    const attempts = (rl?.attempts || 0) + 1;
    const locked_until = attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS).toISOString() : null;
    await supabase.from("admin_rate_limits").upsert(
      { ip, attempts, locked_until, updated_at: new Date().toISOString() },
      { onConflict: "ip" },
    );
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  try {
    if (body.action === "get") return json({ ok: true, pool: await readPool() });
    if (body.action === "set") {
      if (!Array.isArray(body.pool)) return json({ ok: false, error: "pool must be an array" }, 400);
      await writePool(body.pool);
      return json({ ok: true });
    }
    return json({ ok: false, error: "Unknown action" }, 400);
  } catch (err) {
    return json({ ok: false, error: (err as Error).message }, 500);
  }
});
