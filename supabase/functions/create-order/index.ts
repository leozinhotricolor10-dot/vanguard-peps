import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { calcBundles, calcFreight, parseBundles, parseRedeem, planPoints, unitPrice, type PricedItem } from "./pricing.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization",
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: CORS_HEADERS });

// Devolve pontos debitados quando o pedido não chega a ser gravado
async function refundPoints(cpf: string, pts: number) {
  for (let i = 0; i < 3; i++) {
    const { data } = await supabase.from("customers").select("points").eq("cpf", cpf).maybeSingle();
    if (!data) return;
    const cur = data.points || 0;
    const { data: upd } = await supabase.from("customers").update({ points: cur + pts })
      .eq("cpf", cpf).eq("points", cur).select("cpf");
    if (upd?.length) return;
  }
  console.error("[create-order] Falha ao estornar pontos", cpf.slice(0, 3) + "***", pts);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") return reply({ ok: false, error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return reply({ ok: false, error: "Invalid JSON" }, 400);
  }

  const order = body as {
    buyer_name: string;
    phone: string;
    email?: string;
    cpf?: string;
    address: { estado: string; [k: string]: string };
    items: { peptideId: string; qty: number; _packId?: string }[];
    payment: string;
    coupon_code?: string;
    notes?: string;
    bundles?: unknown; // ids dos combos aplicados no carrinho
    points?: unknown; // pontos VG que o cliente quer resgatar
  };

  if (!Array.isArray(order.items) || !order.items.length || !order.buyer_name || !order.payment || !order.address) {
    return reply({ ok: false, error: "Missing required fields" }, 400);
  }
  // Quantidade inteira e positiva (quantidade negativa baixaria o total); aceita "2" como 2
  order.items = order.items.map((i) => ({ ...i, qty: Number(i?.qty) }));
  if (order.items.some((i) => !Number.isInteger(i.qty) || i.qty < 1 || i.qty > 999)) {
    return reply({ ok: false, error: "Quantidade inválida" }, 400);
  }

  // Preços, combos e regra de pontos vêm do banco — fonte da verdade
  const productIds = [...new Set(order.items.map((i) => i.peptideId))];
  const [{ data: dbProducts, error: prodErr }, { data: cfgRows }] = await Promise.all([
    supabase.from("products").select("id, price, packs, promo").in("id", productIds),
    supabase.from("site_config").select("key, value").in("key", ["bundles", "points_config"]),
  ]);

  if (prodErr || !dbProducts) return reply({ ok: false, error: "Failed to fetch products" }, 500);
  const cfg = (k: string) => (cfgRows || []).find((r) => r.key === k)?.value;

  // Validate each item price against DB
  let validatedSubtotal = 0;
  const validatedItems = order.items.map((item) => {
    const dbProd = dbProducts.find((p) => p.id === item.peptideId);
    if (!dbProd) return { ...item, unit_price: 0, validated: false };
    const price = unitPrice(dbProd, item._packId);
    validatedSubtotal += item.qty * price;
    return { ...item, unit_price: price, price, validated: true };
  });

  // Validate coupon server-side
  let couponDiscount = 0;
  let couponCode: string | null = null;
  if (order.coupon_code) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", String(order.coupon_code).toUpperCase())
      .eq("active", true)
      .maybeSingle();

    if (
      coupon &&
      !(coupon.expires_at && new Date(coupon.expires_at) < new Date()) &&
      !(coupon.min_order && validatedSubtotal < coupon.min_order)
    ) {
      couponDiscount =
        coupon.type === "percent"
          ? Math.round(validatedSubtotal * coupon.value / 100)
          : Math.min(coupon.value, validatedSubtotal);
      couponCode = coupon.code;
    }
  }

  // Combos: só os cadastrados, com os itens no pedido, preço do servidor
  const bundleCalc = calcBundles(validatedItems as PricedItem[], order.bundles, parseBundles(cfg("bundles")));
  const bundleDiscount = bundleCalc.total;

  // Frete pela mesma regra de antes (subtotal dos itens; PIX = grátis)
  const freight = calcFreight(order.address.estado, validatedSubtotal, order.payment === "pix");
  const itemsAfterDiscounts = Math.max(0, validatedSubtotal - couponDiscount - bundleDiscount);

  // Pontos: saldo conferido no servidor e debitado aqui (o site não chama mais o "redeem" depois)
  const cpfClean = String(order.cpf ?? "").replace(/\D/g, "");
  let pointsUsed = 0;
  let pointsDiscount = 0;
  if (Math.floor(Number(order.points) || 0) > 0) {
    if (cpfClean.length !== 11) return reply({ ok: false, error: "Informe o CPF para usar pontos" }, 400);
    const { data: cust } = await supabase.from("customers").select("points").eq("cpf", cpfClean).maybeSingle();
    const balance = cust?.points || 0;
    const plan = planPoints(order.points, balance, parseRedeem(cfg("points_config")), itemsAfterDiscounts);
    if (plan.error) return reply({ ok: false, error: plan.error }, 400);
    if (plan.used > 0) {
      // Trava otimista: só debita se o saldo ainda for o que foi lido
      const { data: upd } = await supabase.from("customers").update({ points: balance - plan.used })
        .eq("cpf", cpfClean).eq("points", balance).select("cpf");
      if (!upd?.length) return reply({ ok: false, error: "Saldo de pontos mudou, tente novamente" }, 409);
      pointsUsed = plan.used;
      pointsDiscount = plan.discount;
    }
  }

  const validatedTotal = itemsAfterDiscounts - pointsDiscount + freight;

  // Generate secure order code server-side
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "VG-";
  const arr = new Uint8Array(6);
  crypto.getRandomValues(arr);
  for (const b of arr) code += chars[b % chars.length];

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const randSuffix = Math.random().toString(36).slice(2, 6);
  const orderId = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${randSuffix}`;

  const { error: insertErr } = await supabase.from("orders").insert({
    id: orderId,
    code,
    buyer_name: order.buyer_name,
    phone: order.phone,
    email: order.email || null,
    cpf: order.cpf || null,
    address: order.address,
    items: validatedItems,
    subtotal: validatedSubtotal,
    freight,
    coupon_code: couponCode,
    coupon_discount: couponDiscount,
    bundle_discount: bundleDiscount,
    bundles: bundleCalc.applied.length ? bundleCalc.applied : null,
    points_used: pointsUsed,
    points_discount: pointsDiscount,
    total: validatedTotal,
    payment: order.payment,
    notes: order.notes || null,
    status: "pendente",
  });

  if (insertErr) {
    console.error("[create-order] Insert error:", insertErr.message);
    if (pointsUsed > 0) await refundPoints(cpfClean, pointsUsed);
    return reply({ ok: false, error: insertErr.message }, 500);
  }

  return reply({
    ok: true, code, orderId, validatedTotal, validatedSubtotal, freight,
    couponDiscount, bundleDiscount, bundlesApplied: bundleCalc.applied, pointsUsed, pointsDiscount,
  });
});
