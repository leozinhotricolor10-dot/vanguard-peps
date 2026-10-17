import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ME_TOKEN = Deno.env.get("MELHORENVIOS_TOKEN")!;
const ME_BASE  = "https://www.melhorenvio.com.br/api/v2";
// Ambiente de teste: etiquetas fictícias, sem cobrança
const ME_SANDBOX_TOKEN = Deno.env.get("MELHORENVIOS_SANDBOX_TOKEN");
const ME_SANDBOX_BASE  = "https://sandbox.melhorenvio.com.br/api/v2";

// Senha de admin (mesma do verify-admin / me-senders) + rate limit por IP
const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

// Só as rotas que o site usa. `public` = liberada sem senha (cotação de frete na loja).
const ROUTES: { method: string; re: RegExp; public?: boolean }[] = [
  { method: "POST", re: /^\/me\/shipment\/calculate$/, public: true },
  { method: "GET",  re: /^\/me$/ },
  { method: "GET",  re: /^\/me\/orders(\?per_page=\d{1,3}&page=\d{1,5})?$/ },
  { method: "GET",  re: /^\/me\/orders\/[A-Za-z0-9-]{1,64}$/ },
  { method: "POST", re: /^\/me\/cart$/ },
  { method: "POST", re: /^\/me\/shipment\/(checkout|generate|print)$/ },
  { method: "GET",  re: /^\/me\/shipment\/[A-Za-z0-9-]{1,64}\/tracking$/ },
];

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

async function checkAdmin(req: Request, password: unknown): Promise<Response | null> {
  if (!ADMIN_PASSWORD) return json({ error: "Not configured" }, 500);
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
    return json({ error: "Locked", locked: true }, 429);
  }
  // Sem senha = página antiga/em cache, não um chute: recusa sem contar tentativa
  if (!password) return json({ error: "Unauthorized" }, 401);
  if (password !== ADMIN_PASSWORD) {
    const attempts = (rl?.attempts || 0) + 1;
    const locked_until = attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS).toISOString() : null;
    await supabase.from("admin_rate_limits").upsert(
      { ip, attempts, locked_until, updated_at: new Date().toISOString() },
      { onConflict: "ip" },
    );
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { path, method: rawMethod, body, env, password } = await req.json();
    const method = String(rawMethod || "GET").toUpperCase();
    const sandbox = env === "sandbox";

    const route = typeof path === "string"
      ? ROUTES.find(r => r.method === method && r.re.test(path))
      : undefined;
    if (!route) return json({ error: "Route not allowed" }, 403);

    // Cotação pública só em produção; qualquer outra coisa exige senha de admin
    if (!route.public || sandbox) {
      const denied = await checkAdmin(req, password);
      if (denied) return denied;
    }

    if (sandbox && !ME_SANDBOX_TOKEN) {
      return json({ error: "MELHORENVIOS_SANDBOX_TOKEN não configurado no Supabase" }, 400);
    }

    const meRes = await fetch(`${sandbox ? ME_SANDBOX_BASE : ME_BASE}${path}`, {
      method,
      headers: {
        "Authorization": `Bearer ${sandbox ? ME_SANDBOX_TOKEN : ME_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "VanguardPeptides/1.0",
      },
      body: method !== "GET" && body ? JSON.stringify(body) : undefined,
    });

    const data = await meRes.json();
    return json(data, meRes.status);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
