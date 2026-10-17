// Teste do handler real do create-order (index.ts) sem rede: o esbuild empacota a função
// trocando os imports jsr: por um Supabase falso em memória. Nada chama a produção.
// Rodar: node --test tests/create-order.handler.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ── Supabase falso ──
function makeDb(seed) {
  const db = structuredClone(seed);
  const calls = [];
  const from = (table) => {
    const q = { table, op: "select", filters: [], payload: null };
    const rows = () => (db[table] || []).filter((r) => q.filters.every(([k, v, kind]) => kind === "in" ? v.includes(r[k]) : r[k] === v));
    const run = () => {
      calls.push({ table, op: q.op, payload: q.payload, filters: q.filters });
      if (q.op === "select") return { data: rows(), error: null };
      if (q.op === "insert") {
        if (db.__failInsert) return { data: null, error: { message: "insert falhou" } };
        (db[table] ||= []).push(q.payload); return { data: null, error: null };
      }
      if (q.op === "update") {
        const hit = rows(); hit.forEach((r) => Object.assign(r, q.payload));
        return { data: hit.map((r) => ({ cpf: r.cpf })), error: null };
      }
    };
    const api = {
      select() { return api; },
      update(p) { q.op = "update"; q.payload = p; return api; },
      insert(p) { q.op = "insert"; q.payload = p; return Promise.resolve(run()); },
      in(k, v) { q.filters.push([k, v, "in"]); return api; },
      eq(k, v) { q.filters.push([k, v, "eq"]); return api; },
      maybeSingle() { const r = run(); return Promise.resolve({ data: r.data?.[0] ?? null, error: r.error }); },
      then(res, rej) { return Promise.resolve(run()).then(res, rej); },
    };
    return api;
  };
  const rl = new Map();
  const rpc = async (name, args) => {
    calls.push({ rpc: name, args });
    if (name !== "order_rate_hit") return { data: null, error: { message: "rpc desconhecida" } };
    if (db.__noRateFn) return { data: null, error: { message: "function order_rate_hit does not exist" } };
    // Mesma regra do SQL (janela fixa; sem tempo real no teste)
    let worst = 0;
    for (const r of args.p_rules) {
      const n = (rl.get(r.key) || 0) + 1; rl.set(r.key, n);
      if (n > r.max) worst = Math.max(worst, r.window);
    }
    return { data: worst ? { ok: false, retry_after: worst } : { ok: true }, error: null };
  };
  return { db, calls, client: { from, rpc } };
}

let tmp, modUrl;
async function loadHandler() {
  if (modUrl) return;
  tmp = mkdtempSync(path.join(tmpdir(), "co-test-"));
  const out = path.join(tmp, "fn.mjs");
  await build({
    entryPoints: [path.join(root, "supabase/functions/create-order/index.ts")],
    bundle: true, format: "esm", platform: "neutral", outfile: out, logLevel: "silent",
    plugins: [{
      name: "stub-jsr",
      setup(b) {
        b.onResolve({ filter: /^jsr:/ }, (a) => ({ path: a.path, namespace: "stub" }));
        b.onLoad({ filter: /.*/, namespace: "stub" }, (a) => ({
          contents: a.path.includes("supabase-js") ? "export const createClient = () => globalThis.__fakeSb;" : "",
          loader: "js",
        }));
      },
    }],
  });
  modUrl = pathToFileURL(out).href;
}

async function handlerWith(seed, env = {}) {
  await loadHandler();
  const fake = makeDb(seed);
  let handler;
  globalThis.__fakeSb = { from: (t) => fake.client.from(t), rpc: (...a) => fake.client.rpc(...a) };
  globalThis.Deno = {
    env: { get: (k) => ({ SUPABASE_URL: "http://local.invalid", SUPABASE_SERVICE_ROLE_KEY: "chave-local-teste", ...env })[k] },
    serve: (h) => { handler = h; },
  };
  await import(modUrl + "?v=" + Math.random()); // novo módulo por teste
  const call = async (body, headers = {}) => {
    const res = await handler(new Request("http://local.invalid/create-order", {
      method: "POST", headers: { "content-type": "application/json", "cf-connecting-ip": "10.0.0.1", ...headers },
      body: JSON.stringify(body),
    }));
    return { status: res.status, headers: res.headers, body: await res.json() };
  };
  return { call, ...fake };
}

const SEED = () => ({
  products: [
    { id: "tirzepatida", price: 349, packs: [{ id: "p3", qty: 3, discount: 10 }], promo: 0 },
    { id: "tesamorelin", price: 249, packs: [], promo: 0 },
    { id: "ghkcu", price: 299, packs: [], promo: 0 },
  ],
  site_config: [],
  stock: [{ product_id: "tirzepatida", quantity: 0 }, { product_id: "tesamorelin", quantity: 5 }, { product_id: "ghkcu", quantity: -1 }],
  customers: [{ cpf: "52998224725", points: 300 }],
  coupons: [],
  orders: [],
});
const ORDER = (over = {}) => ({
  buyer_name: "Cliente Teste", phone: "(11) 90000-0000", cpf: "529.982.247-25",
  address: { estado: "SP", rua: "x", numero: "1", cidade: "y", cep: "00000000" },
  items: [{ peptideId: "tirzepatida", qty: 1 }], payment: "pix", bundles: [], points: 0, ...over,
});

test.after(() => { if (tmp) rmSync(tmp, { recursive: true, force: true }); });

test("carrinho já reservado (saldo 0 depois da reserva) grava o pedido normalmente", async () => {
  const h = await handlerWith(SEED());
  const r = await h.call(ORDER());
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.ok, true);
  assert.equal(h.db.orders.length, 1);
  assert.equal(h.db.orders[0].total, 349);
});

test("versão antiga do site (sem bundles/points) continua funcionando, com frete", async () => {
  const h = await handlerWith(SEED());
  const { bundles, points, ...old } = ORDER({ items: [{ peptideId: "tesamorelin", qty: 2 }], payment: "cartao" });
  const r = await h.call(old);
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.validatedSubtotal, 498);
  assert.equal(r.body.freight, 60);
  assert.equal(r.body.validatedTotal, 558);
});

test("saldo negativo recusa com 409 ANTES de debitar pontos ou gravar", async () => {
  const h = await handlerWith(SEED());
  const r = await h.call(ORDER({ items: [{ peptideId: "ghkcu", qty: 1, name: "GHK-Cu 50mg" }], points: 200 }));
  assert.equal(r.status, 409);
  assert.match(r.body.error, /Sem estoque de GHK-Cu 50mg/);
  assert.equal(h.db.customers[0].points, 300, "pontos não podem ser debitados");
  assert.equal(h.db.orders.length, 0);
});

test("produto inexistente recusa com 400", async () => {
  const h = await handlerWith(SEED());
  const r = await h.call(ORDER({ items: [{ peptideId: "nao-existe", qty: 1 }] }));
  assert.equal(r.status, 400);
  assert.match(r.body.error, /Produto indisponível/);
  assert.equal(h.db.orders.length, 0);
});

test("rate limit: 429 em português com Retry-After depois de muitos pedidos do mesmo CPF", async () => {
  const h = await handlerWith(SEED());
  const statuses = [];
  for (let i = 0; i < 8; i++) {
    // IP diferente a cada vez: quem barra é o CPF (limite de 6 em 10 min)
    const r = await h.call(ORDER(), { "cf-connecting-ip": `10.0.1.${i}` });
    statuses.push(r.status);
    if (r.status === 429) {
      assert.match(r.body.error, /Muitos pedidos em pouco tempo/);
      assert.ok(Number(r.headers.get("retry-after")) > 0);
    }
  }
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 200, 429, 429]);
  assert.equal(h.db.orders.length, 6);
});

test("rate limit: mesmo IP com CPFs diferentes barra no 16º (IP compartilhado tem folga)", async () => {
  const h = await handlerWith(SEED());
  let first429 = -1;
  for (let i = 0; i < 17; i++) {
    const r = await h.call(ORDER({ cpf: "", phone: "" }));
    if (r.status === 429 && first429 < 0) first429 = i + 1;
  }
  assert.equal(first429, 16);
});

test("rate limit: 429 não debita pontos", async () => {
  const h = await handlerWith(SEED());
  for (let i = 0; i < 6; i++) await h.call(ORDER({ items: [{ peptideId: "tesamorelin", qty: 1 }] }), { "cf-connecting-ip": `10.0.2.${i}` });
  const r = await h.call(ORDER({ items: [{ peptideId: "tesamorelin", qty: 1 }], points: 200 }), { "cf-connecting-ip": "10.0.2.99" });
  assert.equal(r.status, 429);
  assert.equal(h.db.customers[0].points, 300);
});

test("sem a função SQL (ainda não aplicada) o pedido passa — não derruba vendas", async () => {
  const h = await handlerWith({ ...SEED(), __noRateFn: true });
  for (let i = 0; i < 10; i++) {
    const r = await h.call(ORDER());
    assert.equal(r.status, 200);
  }
});

test("travas antigas seguem: qty inválida, pontos insuficientes, estorno se o insert falhar", async () => {
  const h = await handlerWith(SEED());
  assert.equal((await h.call(ORDER({ items: [{ peptideId: "tesamorelin", qty: -1 }] }))).status, 400);
  assert.equal((await h.call(ORDER({ items: [{ peptideId: "tesamorelin", qty: 1.5 }] }))).status, 400);
  const pts = await h.call(ORDER({ items: [{ peptideId: "tesamorelin", qty: 1 }], points: 400 }), { "cf-connecting-ip": "10.0.3.1" });
  assert.equal(pts.status, 400);
  assert.match(pts.body.error, /Pontos insuficientes/);

  const f = await handlerWith({ ...SEED(), __failInsert: true });
  const r = await f.call(ORDER({ items: [{ peptideId: "tesamorelin", qty: 1 }], points: 200 }));
  assert.equal(r.status, 500);
  assert.equal(f.db.customers[0].points, 300, "pontos estornados");
});

test("chaves do rate limit não levam CPF/telefone/IP em claro", async () => {
  const h = await handlerWith(SEED());
  await h.call(ORDER());
  const rl = h.calls.find((c) => c.rpc === "order_rate_hit");
  const s = JSON.stringify(rl.args);
  assert.ok(!s.includes("52998224725") && !s.includes("10.0.0.1") && !s.includes("900000000"));
});
