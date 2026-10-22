// ── Reset de dados (uso unico por ID) ────────────────────────────────────────
// Quando o dono zera os dados de negocio no banco, as copias em localStorage dos aparelhos
// (principalmente do admin) reenviariam/mostrariam dados antigos. Trocar DATA_RESET_ID faz cada
// aparelho limpar essas copias UMA vez na proxima abertura (loja e admin, / e /antigo/).
// Nao mexe em: vg-products, vg-coupons, vg-promo, vg-bundles, vg-customers, vg-preorders, vg-me-*,
// vg-articles, vg-notices, carrinho, checkout, preferencias, sessao, dismiss de banners.
const DATA_RESET_ID = '20261017';
const DATA_RESET_KEYS = ['vg-imports', 'vg-expenses', 'vg-purchase-orders', 'vg-stock-lots', 'vg-shipping-costs', 'vg-orders', 'vg-stock'];
(function applyDataReset() {
  try {
    if (localStorage.getItem('vg-data-reset') === DATA_RESET_ID) return;
    DATA_RESET_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
    localStorage.setItem('vg-data-reset', DATA_RESET_ID);
  } catch (e) {}
})();

// ── Supabase ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://aumubzvdhzvtnqfzqeqd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_crfA-iUkVR2mnibsWQ2ZDA_wpwOBBY_';
let sb = null;
try {
  const _sbLib = window.supabase || window.Supabase || window.supabaseJs;
  if (_sbLib && _sbLib.createClient) {
    sb = _sbLib.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
} catch(e) {
  console.warn('[Supabase] Falha ao inicializar:', e.message);
}
if (!sb) console.warn('[Supabase] Sem conexao — usando localStorage como fallback');

// ── Acesso a dados protegidos ────────────────────────────────────────────────
// As tabelas com dados de clientes/negócio ficam fechadas por RLS. O admin (com senha)
// lê e grava pela Edge Function admin-db; a loja usa só a public-api, que não expõe dados pessoais.
let ADMIN_PW = ''; // senha do admin só em memória, definida no login
// tabela → coluna-chave (igual à admin-db)
const ADMIN_TABLE_KEYS = {
  orders: 'id', preorders: 'id', customers: 'cpf', coupons: 'id', expenses: 'id', import_history: 'id',
  purchase_order_caps: 'id', raffles: 'id', products: 'id', stock: 'product_id', site_config: 'key',
};

async function callAdminDb(payload) {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-db`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
      body: JSON.stringify({ password: ADMIN_PW, ...payload }),
    });
    return await res.json();
  } catch (e) { return { data: null, error: { message: e.message } }; }
}

// Imita o encadeamento do supabase-js (from().select().eq()...) e traduz para as ações fixas da admin-db
function adminQuery(table) {
  const key = ADMIN_TABLE_KEYS[table];
  const ops = [];
  const run = async () => {
    const op = ops.find(o => ['select', 'insert', 'update', 'upsert', 'delete'].includes(o.m));
    const eqs = ops.filter(o => o.m === 'eq').map(o => o.a);
    const one = ops.some(o => o.m === 'single' || o.m === 'maybeSingle');
    const keyEq = eqs.find(([c]) => c === key);
    const pick = (data) => one ? (Array.isArray(data) ? (data[0] ?? null) : data) : data;
    if (!op) return { data: null, error: { message: 'Consulta sem operação' } };
    if (op.m === 'select') {
      if (keyEq && eqs.length === 1) {
        const r = await callAdminDb({ action: 'get', table, value: keyEq[1] });
        return { data: one ? r.data : (r.data ? [r.data] : []), error: r.error };
      }
      const r = await callAdminDb({ action: 'list', table });
      if (r.error) return r;
      const rows = (r.data || []).filter(row => eqs.every(([c, v]) => row[c] === v));
      const lim = ops.find(o => o.m === 'limit');
      return { data: pick(lim ? rows.slice(0, lim.a[0]) : rows), error: null };
    }
    if (op.m === 'insert' || op.m === 'upsert') {
      const r = await callAdminDb({ action: op.m, table, rows: op.a[0] });
      return { data: pick(r.data), error: r.error };
    }
    if (!keyEq) return { data: null, error: { message: `Filtro por ${key} obrigatório em ${table}` } };
    const r = await callAdminDb(op.m === 'update'
      ? { action: 'update', table, value: keyEq[1], patch: op.a[0] }
      : { action: 'delete', table, value: keyEq[1] });
    return { data: pick(r.data), error: r.error };
  };
  const builder = new Proxy({}, {
    get(_, prop) {
      if (prop === 'then') return (res, rej) => run().then(res, rej);
      return (...a) => { ops.push({ m: prop, a }); return builder; };
    },
  });
  return builder;
}

// Com o admin logado, as tabelas protegidas passam pela admin-db
if (sb) {
  const _from = sb.from.bind(sb);
  sb.from = (table) => (ADMIN_PW && ADMIN_TABLE_KEYS[table]) ? adminQuery(table) : _from(table);
}

async function publicApi(action, payload = {}) {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/public-api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
      body: JSON.stringify({ action, ...payload }),
    });
    return await res.json();
  } catch (e) { return { error: e.message }; }
}

const DEFAULT_STOCK = {
  tirzepatida:10, retatrutida:10, ghkcu:10, glow:10, snap8:10,
  tesamorelin:10, epithalon:10, pt141:10, selank:10
};

function loadStock() {
  try {
    const saved = localStorage.getItem("vg-stock");
    if (!saved) return DEFAULT_STOCK;
    const parsed = JSON.parse(saved);
    return { ...DEFAULT_STOCK, ...parsed };
  } catch { return DEFAULT_STOCK; }
}

function saveStock(s) {
  localStorage.setItem("vg-stock", JSON.stringify(s));
  if (!sb) return;
  const rows = Object.entries(s).map(([product_id, quantity]) => ({ product_id, quantity }));
  sb.from('stock').upsert(rows, { onConflict: 'product_id' }).then(({ error }) => {
    if (error) console.warn('[Supabase] Stock sync error:', error.message);
  });
}

// ── persistence ──────────────────────────────────────────────────────────────
// orders: [{ id, peptideId, buyerName, qty, createdAt }]
function loadOrders() {
  try { return JSON.parse(localStorage.getItem("vg-orders") || "[]").filter(o => !o._preorder); } catch { return []; }
}
function saveOrders(orders) {
  localStorage.setItem("vg-orders", JSON.stringify(orders));
}

