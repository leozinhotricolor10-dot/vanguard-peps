// Travas do create-order que não dependem do banco (rate limit e estoque) — puras, testáveis no Node.
// O index.ts lê o banco e só usa estas funções para decidir.

// ── Rate limit ───────────────────────────────────────────────────────────────
// Janelas fixas por chave. Limites folgados: a loja tem poucos pedidos por dia e o
// IP pode ser compartilhado (rede móvel/CGNAT), então o IP tem o teto mais alto.
// O pedido manual do admin também passa por aqui (vem do IP do admin, sem CPF às vezes).
export type RateRule = { key: string; window: number; max: number };

export const RATE_LIMITS = {
  ip: [{ name: "ip10m", window: 10 * 60, max: 15 }, { name: "ip1d", window: 24 * 3600, max: 60 }],
  cpf: [{ name: "cpf10m", window: 10 * 60, max: 6 }, { name: "cpf1d", window: 24 * 3600, max: 20 }],
  phone: [{ name: "tel10m", window: 10 * 60, max: 6 }, { name: "tel1d", window: 24 * 3600, max: 20 }],
  // Teto geral contra enxurrada vinda de muitos IPs (muito acima do volume real da loja)
  global: [{ name: "all1h", window: 3600, max: 120 }],
};

// IP do cliente. cf-connecting-ip / x-real-ip são postos pela borda; o 1º item do
// x-forwarded-for pode vir do próprio cliente, por isso fica por último.
export function clientIp(get: (h: string) => string | null | undefined): string {
  const pick = (v: string | null | undefined) => (v || "").trim();
  return pick(get("cf-connecting-ip")) || pick(get("x-real-ip")) ||
    pick((get("x-forwarded-for") || "").split(",")[0]) || "unknown";
}

async function hmacHex(secret: string, text: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(text)));
  return Array.from(sig.slice(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Regras para este pedido. CPF/telefone/IP vão para o banco só como HMAC (sem dado pessoal na tabela).
// CPF só conta com 11 dígitos e telefone com 10+ (pedido manual sem esses campos não é barrado por eles).
export async function rateRules(ip: string, cpf: unknown, phone: unknown, secret: string): Promise<RateRule[]> {
  const out: RateRule[] = [];
  const add = async (kind: "ip" | "cpf" | "phone" | "global", value: string) => {
    const h = kind === "global" ? "-" : await hmacHex(secret, `${kind}:${value}`);
    for (const r of RATE_LIMITS[kind]) out.push({ key: `${r.name}:${h}`, window: r.window, max: r.max });
  };
  if (ip && ip !== "unknown") await add("ip", ip);
  const cpfD = String(cpf ?? "").replace(/\D/g, "");
  if (cpfD.length === 11) await add("cpf", cpfD);
  let telD = String(phone ?? "").replace(/\D/g, "");
  if (telD.length >= 12 && telD.startsWith("55")) telD = telD.slice(2); // +55 e sem +55 contam juntos
  if (telD.length >= 10) await add("phone", telD);
  await add("global", "");
  return out;
}

export function rateLimitMessage(retryAfterSec: number): string {
  const min = Math.max(1, Math.ceil((Number(retryAfterSec) || 60) / 60));
  const quando = min >= 60 ? `${Math.ceil(min / 60)} hora(s)` : `${min} minuto(s)`;
  return `Muitos pedidos em pouco tempo. Aguarde ${quando} e tente de novo, ou fale com a gente no WhatsApp.`;
}

// ── Estoque ──────────────────────────────────────────────────────────────────
// IMPORTANTE: no carrinho o navegador JÁ reservou (rpc decrement_stock) antes de chamar o
// create-order, então `stock.quantity` aqui é o que sobrou DEPOIS da reserva deste cliente.
// Exigir quantity >= qty recusaria quem levou as últimas unidades. Já os formulários de pedido
// manual (admin e link do cliente) não reservam nada, e o servidor não consegue distinguir os
// fluxos. Por isso esta checagem só recusa o que é errado em qualquer fluxo:
//   1. produto que não existe no banco (antes entrava com preço 0);
//   2. produto com controle de estoque cujo saldo está NEGATIVO (já vendeu além do que tinha).
// Produto sem linha em `stock` (ou quantity null) = sem controle de estoque, igual ao site.
// Packs: a linha do pack já traz qty em unidades (pack.qty); combos são linhas normais por item.
export type StockRow = { product_id: string; quantity: number | null };
export type StockItem = { peptideId: string; qty: number; name?: unknown };

export function checkStock(items: StockItem[], productIds: string[], stockRows: StockRow[]):
  { ok: true } | { ok: false; status: number; error: string } {
  const known = new Set(productIds);
  const label = (it: StockItem) => (typeof it.name === "string" && it.name.trim() ? it.name.trim().slice(0, 80) : String(it.peptideId));
  const missing = items.find((it) => !known.has(it.peptideId));
  if (missing) {
    return { ok: false, status: 400, error: `Produto indisponível: ${label(missing)}. Remova do carrinho e tente de novo.` };
  }
  const qtyOf = new Map<string, number>();
  for (const r of stockRows || []) {
    if (r && typeof r.product_id === "string" && r.quantity !== null && r.quantity !== undefined && Number.isFinite(Number(r.quantity))) {
      qtyOf.set(r.product_id, Number(r.quantity));
    }
  }
  for (const it of items) {
    const q = qtyOf.get(it.peptideId);
    if (q !== undefined && q < 0) {
      return { ok: false, status: 409, error: `Sem estoque de ${label(it)} no momento. Remova do carrinho ou use "Reservar".` };
    }
  }
  return { ok: true };
}
