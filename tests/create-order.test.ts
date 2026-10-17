// Testes locais (sem rede, sem banco) das travas puras do create-order.
// Rodar: node --test tests/create-order.test.ts   (Node 24 roda TypeScript direto)
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkStock, clientIp, rateLimitMessage, rateRules, RATE_LIMITS } from "../supabase/functions/create-order/guards.ts";
import { calcBundles, calcFreight, parseBundles, planPoints, unitPrice } from "../supabase/functions/create-order/pricing.ts";

const hdr = (h: Record<string, string>) => (k: string) => h[k] ?? null;

test("clientIp: prefere cabeçalhos da borda ao x-forwarded-for", () => {
  assert.equal(clientIp(hdr({ "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "9.9.9.9, 2.2.2.2" })), "1.1.1.1");
  assert.equal(clientIp(hdr({ "x-real-ip": "3.3.3.3", "x-forwarded-for": "9.9.9.9" })), "3.3.3.3");
  assert.equal(clientIp(hdr({ "x-forwarded-for": " 4.4.4.4 , 5.5.5.5" })), "4.4.4.4");
  assert.equal(clientIp(hdr({})), "unknown");
});

test("rateRules: IP + CPF + telefone + teto geral, chaves sem dado pessoal", async () => {
  const rules = await rateRules("200.1.2.3", "123.456.789-09", "(11) 98888-7777", "segredo");
  const n = RATE_LIMITS.ip.length + RATE_LIMITS.cpf.length + RATE_LIMITS.phone.length + RATE_LIMITS.global.length;
  assert.equal(rules.length, n);
  const all = JSON.stringify(rules);
  assert.ok(!all.includes("12345678909") && !all.includes("200.1.2.3") && !all.includes("988887777"));
  assert.ok(rules.every((r) => r.window > 0 && r.max > 0 && r.key.length <= 120));
  assert.equal(new Set(rules.map((r) => r.key)).size, rules.length);
});

test("rateRules: mesma pessoa gera a mesma chave; +55 e sem +55 contam juntos", async () => {
  const a = await rateRules("1.2.3.4", "12345678909", "11988887777", "s");
  const b = await rateRules("1.2.3.4", "123.456.789-09", "+55 (11) 98888-7777", "s");
  assert.deepEqual(a, b);
  const c = await rateRules("1.2.3.4", "12345678909", "11988887777", "outro-segredo");
  assert.notDeepEqual(a.map((r) => r.key).filter((k) => !k.startsWith("all")), c.map((r) => r.key).filter((k) => !k.startsWith("all")));
});

test("rateRules: pedido manual sem CPF/telefone e IP desconhecido só usa o teto geral", async () => {
  const rules = await rateRules("unknown", "", "", "s");
  assert.deepEqual(rules.map((r) => r.key), RATE_LIMITS.global.map((g) => `${g.name}:-`));
  const soIp = await rateRules("8.8.8.8", null, "123", "s");
  assert.equal(soIp.length, RATE_LIMITS.ip.length + RATE_LIMITS.global.length);
});

test("limites são folgados para cliente legítimo", () => {
  const min = (l: { window: number; max: number }[]) => Math.min(...l.map((x) => x.max));
  assert.ok(min(RATE_LIMITS.ip) >= 10, "IP compartilhado (CGNAT) precisa de folga");
  assert.ok(min(RATE_LIMITS.cpf) >= 5 && min(RATE_LIMITS.phone) >= 5);
  assert.ok(min(RATE_LIMITS.global) >= 100);
});

test("rateLimitMessage: em português, com minutos ou horas", () => {
  assert.match(rateLimitMessage(30), /Aguarde 1 minuto\(s\)/);
  assert.match(rateLimitMessage(9 * 60 + 1), /Aguarde 10 minuto\(s\)/);
  assert.match(rateLimitMessage(5 * 3600), /Aguarde 5 hora\(s\)/);
  assert.match(rateLimitMessage(NaN as unknown as number), /Muitos pedidos/);
});

// ── Estoque ──
const ids = ["tirzepatida", "tesamorelin", "ghkcu", "semcontrole"];

test("estoque: pedido do carrinho já reservado passa mesmo com saldo 0 (levou as últimas)", () => {
  const r = checkStock([{ peptideId: "tirzepatida", qty: 3 }], ids, [{ product_id: "tirzepatida", quantity: 0 }]);
  assert.deepEqual(r, { ok: true });
});

test("estoque: produto sem linha em stock ou quantity null = sem controle", () => {
  assert.deepEqual(checkStock([{ peptideId: "semcontrole", qty: 99 }], ids, []), { ok: true });
  assert.deepEqual(checkStock([{ peptideId: "ghkcu", qty: 5 }], ids, [{ product_id: "ghkcu", quantity: null }]), { ok: true });
});

test("estoque: saldo negativo recusa com 409 e nome do produto", () => {
  const r = checkStock([{ peptideId: "ghkcu", qty: 1, name: "GHK-Cu 50mg" }, { peptideId: "tirzepatida", qty: 1 }], ids,
    [{ product_id: "ghkcu", quantity: -2 }, { product_id: "tirzepatida", quantity: 4 }]);
  assert.equal(r.ok, false);
  if (!r.ok) { assert.equal(r.status, 409); assert.match(r.error, /Sem estoque de GHK-Cu 50mg/); }
});

test("estoque: produto que não existe no banco recusa com 400 (antes entrava com preço 0)", () => {
  const r = checkStock([{ peptideId: "tirzepatida", qty: 1 }, { peptideId: "removido", qty: 1, name: "Produto Velho" }], ids, []);
  assert.equal(r.ok, false);
  if (!r.ok) { assert.equal(r.status, 400); assert.match(r.error, /Produto indisponível: Produto Velho/); }
});

test("estoque: pack + unidade do mesmo produto e combo (linhas por item) passam com saldo >= 0", () => {
  const items = [
    { peptideId: "tirzepatida", qty: 3, _packId: "pack3" }, // pack: qty já em unidades
    { peptideId: "tirzepatida", qty: 1 },
    { peptideId: "tesamorelin", qty: 1 }, // combo emagrecimento = linhas normais
  ];
  assert.deepEqual(checkStock(items, ids, [{ product_id: "tirzepatida", quantity: 0 }, { product_id: "tesamorelin", quantity: 2 }]), { ok: true });
});

test("estoque: linha de stock com lixo é ignorada (não derruba pedido)", () => {
  const rows = [{ product_id: "tirzepatida", quantity: "abc" as unknown as number }, null as unknown as { product_id: string; quantity: number }];
  assert.deepEqual(checkStock([{ peptideId: "tirzepatida", qty: 1 }], ids, rows), { ok: true });
});

// ── Regressão das travas de preço existentes (pricing.ts não mudou) ──
test("pricing: preço do banco, pack, promo, frete, combos e pontos seguem iguais", () => {
  const prod = { id: "tirzepatida", price: 400, packs: [{ id: "p3", discount: 10 }], promo: 0 };
  assert.equal(unitPrice(prod), 400);
  assert.equal(unitPrice(prod, "p3"), 360);
  assert.equal(unitPrice({ ...prod, promo: 25 }), 300);
  assert.equal(calcFreight("SP", 600, false), 0);
  assert.equal(calcFreight("RJ", 600, false), 60);
  assert.equal(calcFreight("RJ", 10, true), 0);
  const items = [
    { peptideId: "tirzepatida", qty: 1, unit_price: 349, validated: true },
    { peptideId: "tesamorelin", qty: 1, unit_price: 249, validated: true },
  ];
  const b = calcBundles(items, ["bundle-emagre"], parseBundles(undefined));
  assert.equal(b.total, 49);
  assert.deepEqual(planPoints(250, 300, 5, 1000), { used: 200, discount: 10 });
  assert.equal(planPoints(500, 300, 5, 1000).error, "Pontos insuficientes");
});
