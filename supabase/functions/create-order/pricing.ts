// Cálculo de preço do pedido — puro (sem banco), para poder testar fora do Deno.
// Fonte da verdade: produtos/combos/regra de pontos lidos do banco pelo index.ts.

export type DbProduct = { id: string; price: number; packs?: { id: string; discount: number }[] | null; promo?: number | null };
export type Bundle = { id: string; name: string; desc?: string; items: string[]; price: number; badge?: string | null; active?: boolean };
export type PricedItem = { peptideId: string; qty: number; _packId?: string | null; unit_price: number; validated: boolean };

// Mesmos 3 combos que existiam fixos no site (usados se site_config.bundles não existir ou for inválido)
export const SEED_BUNDLES: Bundle[] = [
  { id: "bundle-emagre", name: "Stack Emagrecimento Total", desc: "Tirzepatida 15mg + Tesamorelin 5mg — protocolo duplo GLP-1 e queima visceral", items: ["tirzepatida", "tesamorelin"], price: 549, badge: "🔥 Economize R$ 49", active: true },
  { id: "bundle-beleza", name: "Stack Beleza & Pele", desc: "GHK-Cu 50mg + SNAP-8 10mg — colágeno e antienvelhecimento", items: ["ghkcu", "snap8"], price: 549, badge: "💎 Economize R$ 40", active: true },
  { id: "bundle-longe", name: "Stack Longevidade Premium", desc: "Epithalon 10mg + Selank 5mg — longevidade celular e equilíbrio mental", items: ["epithalon", "selank"], price: 399, badge: "⭐ Economize R$ 49", active: true },
];

export function calcFreight(estado: string, subtotal: number, isPix: boolean): number {
  if (isPix) return 0;
  if (subtotal >= 1000) return 0;
  if (estado === "SP" && subtotal >= 600) return 0;
  return 60;
}

export function unitPrice(dbProd: DbProduct, packId?: string | null): number {
  if (packId) {
    const pack = (dbProd.packs || []).find((pk) => pk.id === packId);
    return pack ? Math.round(dbProd.price * (1 - pack.discount / 100)) : dbProd.price;
  }
  // Promo do banco (ignora promo do navegador)
  const promo = Number(dbProd.promo) || 0;
  return promo > 0 ? Math.round(dbProd.price * (1 - promo / 100)) : dbProd.price;
}

// site_config.bundles (texto JSON) → lista validada. Ausente/inválido → seed; "[]" → nenhum combo.
export function parseBundles(raw: unknown): Bundle[] {
  let v: unknown = raw;
  if (typeof raw === "string") { try { v = JSON.parse(raw); } catch { return SEED_BUNDLES; } }
  if (!Array.isArray(v)) return SEED_BUNDLES;
  return v.filter((b): b is Bundle =>
    !!b && typeof b === "object" && typeof b.id === "string" && b.id.length > 0 &&
    Array.isArray(b.items) && b.items.length >= 2 && b.items.every((i: unknown) => typeof i === "string") &&
    typeof b.price === "number" && Number.isFinite(b.price) && b.price > 0
  );
}

export function parseRedeem(raw: unknown): number {
  try {
    const v = typeof raw === "string" ? JSON.parse(raw) : raw;
    const r = Number((v as { redeem?: unknown })?.redeem);
    if (Number.isFinite(r) && r > 0 && r <= 1000) return r;
  } catch { /* usa o padrão */ }
  return 5;
}

// Combos: cada id aplicado consome 1 de cada item (fora de packs); desconto = soma dos preços do servidor − preço do combo
export function calcBundles(items: PricedItem[], bundleIds: unknown, bundles: Bundle[]) {
  const have: Record<string, number> = {};
  const price: Record<string, number> = {};
  for (const it of items) {
    if (!it.validated || it._packId) continue;
    have[it.peptideId] = (have[it.peptideId] || 0) + it.qty;
    price[it.peptideId] = it.unit_price;
  }
  const ids = Array.isArray(bundleIds) ? bundleIds.filter((x) => typeof x === "string").slice(0, 20) : [];
  const applied: { id: string; name: string; price: number; full: number; discount: number }[] = [];
  for (const id of ids) {
    const b = bundles.find((x) => x.id === id);
    if (!b || b.active === false) continue;
    if (!b.items.every((i) => (have[i] || 0) >= 1)) continue;
    const full = b.items.reduce((s, i) => s + price[i], 0);
    const discount = Math.max(0, full - b.price);
    if (discount <= 0) continue;
    b.items.forEach((i) => { have[i]--; });
    applied.push({ id: b.id, name: b.name, price: b.price, full, discount });
  }
  return { total: applied.reduce((s, x) => s + x.discount, 0), applied };
}

// Pontos: só centenas valem (cada 100 = R$ redeem); não passa do saldo nem do valor do pedido
export function planPoints(requested: unknown, balance: number, redeem: number, maxDiscount: number):
  { used: number; discount: number; error?: string } {
  const req = Math.floor(Number(requested) || 0);
  if (req <= 0) return { used: 0, discount: 0 };
  let hundreds = Math.floor(req / 100);
  if (hundreds <= 0) return { used: 0, discount: 0 };
  if (hundreds * 100 > Math.max(0, balance || 0)) return { used: 0, discount: 0, error: "Pontos insuficientes" };
  const maxHundreds = Math.floor(Math.max(0, maxDiscount) / redeem);
  hundreds = Math.min(hundreds, maxHundreds);
  return { used: hundreds * 100, discount: Math.floor(hundreds * redeem) };
}
