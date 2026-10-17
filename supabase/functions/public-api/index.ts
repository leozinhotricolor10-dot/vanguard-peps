import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// O que a loja (visitante, sem senha) precisa do banco, sem expor dados pessoais.
// As tabelas ficam fechadas por RLS; isto roda com a service role e devolve só o necessário.
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: CORS_HEADERS });
const cleanCpf = (v: unknown) => String(v ?? "").replace(/\D/g, "");
const str = (v: unknown, max = 200) => String(v ?? "").slice(0, max);

// deno-lint-ignore no-explicit-any
type Body = Record<string, any>;

async function snapshot() {
  // Só o necessário para calcular estoque reservado na loja — sem nomes, CPF, endereço ou valores
  const [orders, preorders, imports, caps] = await Promise.all([
    supabase.from("orders").select("id,status,items").in("status", ["pendente", "pago", "enviado"]),
    supabase.from("preorders").select("id,product_id,qty,status").in("status", ["pending", "notified"]),
    supabase.from("import_history").select("id,status,data"),
    supabase.from("purchase_order_caps").select("id,product_id,qty,status"),
  ]);
  return {
    orders: (orders.data || []).map((o) => ({
      id: o.id,
      status: o.status,
      items: (o.items || []).map((i: Body) => ({ peptideId: i.peptideId, qty: i.qty })),
    })),
    preorders: preorders.data || [],
    imports: (imports.data || []).map((r) => ({
      id: r.data?.id ?? r.id,
      status: r.data?.status ?? r.status,
      items: (r.data?.items || []).map((i: Body) => ({ sku: i.sku, vials: i.vials, boxes: i.boxes })),
    })),
    caps: caps.data || [],
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let b: Body;
  try { b = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  try {
    switch (b.action) {
      case "snapshot":
        return json(await snapshot());

      case "track": {
        const code = str(b.code, 20).toUpperCase();
        if (!/^VG-[A-Z0-9]{6}$/.test(code)) return json({ orders: [] });
        const { data } = await supabase.from("orders")
          .select("id,code,buyer_name,status,created_at,items,total,payment,tracking_code")
          .eq("code", code);
        // Só o primeiro nome no rastreio público
        return json({ orders: (data || []).map((o) => ({ ...o, buyer_name: str(o.buyer_name).split(" ")[0] })) });
      }

      case "points": {
        const cpf = cleanCpf(b.cpf);
        if (cpf.length !== 11) return json({ points: 0 });
        const { data } = await supabase.from("customers").select("points").eq("cpf", cpf).maybeSingle();
        return json({ points: data?.points ?? 0 });
      }

      case "redeem": {
        const cpf = cleanCpf(b.cpf);
        const pts = Math.floor(Number(b.pts) || 0);
        if (cpf.length !== 11 || pts <= 0) return json({ ok: false });
        const { data } = await supabase.from("customers").select("points").eq("cpf", cpf).maybeSingle();
        if (!data || (data.points || 0) < pts) return json({ ok: false, error: "Pontos insuficientes" });
        await supabase.from("customers").update({ points: (data.points || 0) - pts }).eq("cpf", cpf);
        return json({ ok: true });
      }

      case "coupon": {
        const code = str(b.code, 40).trim().toUpperCase();
        // Sem % ou _ (curingas do ilike): só letras, números e hífen
        if (!/^[A-Z0-9-]{1,40}$/.test(code)) return json({ coupon: null });
        const { data } = await supabase.from("coupons")
          .select("id,code,type,value,min_order,expires_at,active")
          .ilike("code", code).eq("active", true).maybeSingle();
        return json({ coupon: data || null });
      }

      case "preorder_add": {
        const e = b.entry || {};
        const qty = Math.floor(Number(e.qty) || 0);
        if (!/^[a-f0-9]{32}$/.test(str(e.token)) || !e.product_id || qty < 1 || qty > 50 || !str(e.name).trim()) {
          return json({ ok: false, error: "Dados inválidos" }, 400);
        }
        const { error } = await supabase.from("preorders").insert({
          id: str(e.id, 60), token: e.token, product_id: str(e.product_id, 60), product_name: str(e.product_name),
          name: str(e.name), whatsapp: str(e.whatsapp, 30), qty, status: "pending",
          date: str(e.date, 20), ts: Number(e.ts) || Date.now(), notified_at: null, reminder_sent: false,
        });
        return json({ ok: !error, error: error?.message });
      }

      case "preorder_get": {
        const token = str(b.token, 64);
        if (!/^[a-f0-9]{32}$/.test(token)) return json({ preorder: null });
        const { data } = await supabase.from("preorders").select("*").eq("token", token).maybeSingle();
        return json({ preorder: data || null });
      }

      case "preorder_update": {
        // O cliente só mexe na própria reserva (precisa do token) e só em quantidade/cancelar/concluir
        const token = str(b.token, 64);
        if (!/^[a-f0-9]{32}$/.test(token)) return json({ ok: false }, 400);
        const f = b.fields || {};
        const patch: Body = {};
        if (f.qty != null) {
          const qty = Math.floor(Number(f.qty) || 0);
          if (qty < 1 || qty > 50) return json({ ok: false }, 400);
          patch.qty = qty;
        }
        if (f.status != null) {
          if (!["cancelled", "completed", "expired"].includes(f.status)) return json({ ok: false }, 400);
          patch.status = f.status;
        }
        if (!Object.keys(patch).length) return json({ ok: true });
        const { error } = await supabase.from("preorders").update(patch).eq("token", token);
        return json({ ok: !error, error: error?.message });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
