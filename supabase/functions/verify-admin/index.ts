import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization",
};

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: CORS_HEADERS,
    });
  }

  if (!ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ ok: false, error: "Not configured" }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  // Check existing rate limit record
  const { data: rl } = await supabase
    .from("admin_rate_limits")
    .select("attempts, locked_until")
    .eq("ip", ip)
    .maybeSingle();

  if (rl?.locked_until && new Date(rl.locked_until) > new Date()) {
    return new Response(JSON.stringify({ ok: false, locked: true }), {
      status: 429,
      headers: CORS_HEADERS,
    });
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  const { password } = body;
  const isCorrect = password === ADMIN_PASSWORD;

  if (isCorrect) {
    await supabase.from("admin_rate_limits").upsert(
      { ip, attempts: 0, locked_until: null, updated_at: new Date().toISOString() },
      { onConflict: "ip" },
    );
    return new Response(JSON.stringify({ ok: true }), { headers: CORS_HEADERS });
  }

  const attempts = (rl?.attempts || 0) + 1;
  const locked_until =
    attempts >= MAX_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_MS).toISOString()
      : null;

  await supabase.from("admin_rate_limits").upsert(
    { ip, attempts, locked_until, updated_at: new Date().toISOString() },
    { onConflict: "ip" },
  );

  return new Response(
    JSON.stringify({ ok: false, locked: !!locked_until }),
    { headers: CORS_HEADERS },
  );
});
