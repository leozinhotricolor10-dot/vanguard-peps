import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization",
};

function calcFreight(estado: string, subtotal: number, isPix: boolean): number {
  if (isPix) return 0;
  if (subtotal >= 1000) return 0;
  if (estado === "SP" && subtotal >= 600) return 0;
  return 60;
}

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

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: CORS_HEADERS,
    });
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
  };

  if (!order.items?.length || !order.buyer_name || !order.payment || !order.address) {
    return new Response(JSON.stringify({ ok: false, error: "Missing required fields" }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  // Fetch current prices from DB — source of truth
  const productIds = [...new Set(order.items.map((i) => i.peptideId))];
  const { data: dbProducts, error: prodErr } = await supabase
    .from("products")
    .select("id, price, packs, promo")
    .in("id", productIds);

  if (prodErr || !dbProducts) {
    return new Response(JSON.stringify({ ok: false, error: "Failed to fetch products" }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }

  // Validate each item price against DB
  let validatedSubtotal = 0;
  const validatedItems = order.items.map((item) => {
    const dbProd = dbProducts.find((p) => p.id === item.peptideId);
    if (!dbProd) return { ...item, unit_price: 0, validated: false };

    let unitPrice: number;
    if (item._packId) {
      const pack = (dbProd.packs || []).find((pk: { id: string; discount: number }) => pk.id === item._packId);
      unitPrice = pack
        ? Math.round(dbProd.price * (1 - pack.discount / 100))
        : dbProd.price;
    } else {
      // Use DB promo if set, otherwise base price (ignores client-side promo overrides)
      const promo = Number(dbProd.promo) || 0;
      unitPrice = promo > 0 ? Math.round(dbProd.price * (1 - promo / 100)) : dbProd.price;
    }

    validatedSubtotal += (item.qty || 0) * unitPrice;
    return { ...item, unit_price: unitPrice, price: unitPrice, validated: true };
  });

  // Validate coupon server-side
  let couponDiscount = 0;
  let couponCode: string | null = null;
  if (order.coupon_code) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", order.coupon_code.toUpperCase())
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

  const freight = calcFreight(order.address.estado, validatedSubtotal, order.payment === "pix");
  const validatedTotal = validatedSubtotal - couponDiscount + freight;

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
    total: validatedTotal,
    payment: order.payment,
    notes: order.notes || null,
    status: "pendente",
  });

  if (insertErr) {
    console.error("[create-order] Insert error:", insertErr.message);
    return new Response(JSON.stringify({ ok: false, error: insertErr.message }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }

  return new Response(
    JSON.stringify({ ok: true, code, orderId, validatedTotal, validatedSubtotal, freight }),
    { headers: CORS_HEADERS },
  );
});
