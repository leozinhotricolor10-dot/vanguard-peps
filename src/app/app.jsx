const { useState, useMemo } = React;

// ── Catálogo Adina (148 produtos) ─────────────────────────────────────────────
const ADINA_CATALOG = {
  'SM2':{name:'Semaglutide',spec:'2mg',priceUsd:28},'SM5':{name:'Semaglutide',spec:'5mg',priceUsd:38},'SM10':{name:'Semaglutide',spec:'10mg',priceUsd:55},'SM15':{name:'Semaglutide',spec:'15mg',priceUsd:65},'SM20':{name:'Semaglutide',spec:'20mg',priceUsd:75},'SM30':{name:'Semaglutide',spec:'30mg',priceUsd:90},
  'TR5':{name:'Tirzepatide',spec:'5mg',priceUsd:40},'TR10':{name:'Tirzepatide',spec:'10mg',priceUsd:55},'TR15':{name:'Tirzepatide',spec:'15mg',priceUsd:70},'TR20':{name:'Tirzepatide',spec:'20mg',priceUsd:85},'TR30':{name:'Tirzepatide',spec:'30mg',priceUsd:100},'TR40':{name:'Tirzepatide',spec:'40mg',priceUsd:120},'TR50':{name:'Tirzepatide',spec:'50mg',priceUsd:140},'TR60':{name:'Tirzepatide',spec:'60mg',priceUsd:160},'TR100':{name:'Tirzepatide',spec:'100mg',priceUsd:240},
  'RT5':{name:'Retatrutide',spec:'5mg',priceUsd:50},'RT10':{name:'Retatrutide',spec:'10mg',priceUsd:90},'RT15':{name:'Retatrutide',spec:'15mg',priceUsd:120},'RT20':{name:'Retatrutide',spec:'20mg',priceUsd:150},'RT30':{name:'Retatrutide',spec:'30mg',priceUsd:185},'RT40':{name:'Retatrutide',spec:'40mg',priceUsd:235},'RT50':{name:'Retatrutide',spec:'50mg',priceUsd:285},'RT60':{name:'Retatrutide',spec:'60mg',priceUsd:320},
  'H10':{name:'HGH 191AA',spec:'10iu',priceUsd:48},'H12':{name:'HGH 191AA',spec:'12iu',priceUsd:55},'H15':{name:'HGH 191AA',spec:'15iu',priceUsd:68},'H24':{name:'HGH 191AA',spec:'24iu',priceUsd:100},'H36':{name:'HGH 191AA',spec:'36iu',priceUsd:150},
  'MT1':{name:'MT-1',spec:'10mg',priceUsd:45},'ML10':{name:'MT-2 Melanotan',spec:'10mg',priceUsd:45},'P41':{name:'PT-141',spec:'10mg',priceUsd:50},'GND2':{name:'Gonadorelin',spec:'2mg',priceUsd:40},
  'DS5':{name:'DSIP',spec:'5mg',priceUsd:40},'DS10':{name:'DSIP',spec:'10mg',priceUsd:75},'DS15':{name:'DSIP',spec:'15mg',priceUsd:105},
  'SK5':{name:'Selank',spec:'5mg',priceUsd:44},'SK10':{name:'Selank',spec:'10mg',priceUsd:70},'SK30':{name:'Selank',spec:'30mg',priceUsd:105},'NSK30':{name:'NA Selank Amidate',spec:'30mg',priceUsd:150},
  'OT2':{name:'Oxytocin',spec:'2mg',priceUsd:30},'OT5':{name:'Oxytocin',spec:'5mg',priceUsd:60},'OT10':{name:'Oxytocin',spec:'10mg',priceUsd:90},
  'ET10':{name:'Epithalon',spec:'10mg',priceUsd:40},'ET40':{name:'Epithalon',spec:'40mg',priceUsd:110},'ET50':{name:'Epithalon',spec:'50mg',priceUsd:140},
  'BC5':{name:'BPC-157',spec:'5mg',priceUsd:45},'BC10':{name:'BPC-157',spec:'10mg',priceUsd:68},'BC20':{name:'BPC-157',spec:'20mg',priceUsd:100},
  'BB10':{name:'BPC 5mg+TB 5mg',spec:'10mg',priceUsd:98},'BB20':{name:'BPC 10mg+TB 10mg',spec:'20mg',priceUsd:160},
  'AE1':{name:'ACE-031',spec:'1mg',priceUsd:50},'AR50':{name:'AICAR',spec:'50mg',priceUsd:55},'AR100':{name:'AICAR',spec:'100mg',priceUsd:105},
  'AP2':{name:'Adipotide',spec:'2mg',priceUsd:70},'AP5':{name:'Adipotide',spec:'5mg',priceUsd:130},
  'XA5':{name:'Semax',spec:'5mg',priceUsd:44},'XA10':{name:'Semax',spec:'10mg',priceUsd:70},'XA30':{name:'Semax',spec:'30mg',priceUsd:105},'NXA30':{name:'NA Semax Amidate',spec:'30mg',priceUsd:150},'XS20':{name:'Semax+Selank Blend',spec:'20mg',priceUsd:105},
  '2S10':{name:'SS-31',spec:'10mg',priceUsd:85},'2S50':{name:'SS-31',spec:'50mg',priceUsd:240},
  'G25':{name:'GHRP-2',spec:'5mg',priceUsd:30},'G210':{name:'GHRP-2',spec:'10mg',priceUsd:50},'G65':{name:'GHRP-6',spec:'5mg',priceUsd:30},'G610':{name:'GHRP-6',spec:'10mg',priceUsd:50},
  'CND2':{name:'CJC-1295 no DAC',spec:'2mg',priceUsd:40},'CND5':{name:'CJC-1295 no DAC',spec:'5mg',priceUsd:70},'CND10':{name:'CJC-1295 no DAC',spec:'10mg',priceUsd:130},'CP10':{name:'CJC-1295 no DAC+Ipa',spec:'10mg',priceUsd:90},
  'CD2':{name:'CJC-1295 DAC',spec:'2mg',priceUsd:80},'CD5':{name:'CJC-1295 DAC',spec:'5mg',priceUsd:130},'CD10':{name:'CJC-1295 DAC',spec:'10mg',priceUsd:230},
  'BT5':{name:'TB-500',spec:'5mg',priceUsd:70},'BT10':{name:'TB-500',spec:'10mg',priceUsd:115},'B10F':{name:'TB-500 Fragment',spec:'10mg',priceUsd:100},
  'FM2':{name:'MGF',spec:'2mg',priceUsd:40},'FMP2':{name:'PEG MGF',spec:'2mg',priceUsd:80},
  'SMO5':{name:'Sermorelin',spec:'5mg',priceUsd:65},'SMO10':{name:'Sermorelin',spec:'10mg',priceUsd:120},
  'G10K':{name:'HCG',spec:'10000IU',priceUsd:120},'G5K':{name:'HCG',spec:'5000IU',priceUsd:65},'G2K':{name:'HCG',spec:'2000IU',priceUsd:48},
  '5AD':{name:'AOD9604',spec:'5mg',priceUsd:85},'10AD':{name:'AOD9604',spec:'10mg',priceUsd:160},
  'IG01':{name:'IGF-1LR3',spec:'0.1mg',priceUsd:50},'IG1':{name:'IGF-1LR3',spec:'1mg',priceUsd:170},
  'TSM5':{name:'Tesamorelin',spec:'5mg',priceUsd:100},'TSM10':{name:'Tesamorelin',spec:'10mg',priceUsd:160},'TSM20':{name:'Tesamorelin',spec:'20mg',priceUsd:280},
  'IP5':{name:'Ipamorelin',spec:'5mg',priceUsd:40},'IP10':{name:'Ipamorelin',spec:'10mg',priceUsd:60},
  'HX2':{name:'Hexarelin',spec:'2mg',priceUsd:42},'HX5':{name:'Hexarelin',spec:'5mg',priceUsd:75},'HX10':{name:'Hexarelin',spec:'10mg',priceUsd:150},
  'CU50':{name:'GHK-Cu',spec:'50mg',priceUsd:35},'CU100':{name:'GHK-Cu',spec:'100mg',priceUsd:60},'GH50':{name:'GHK Basic',spec:'50mg',priceUsd:50},'AU100':{name:'AHK-CU',spec:'100mg',priceUsd:75},
  'KS5':{name:'KissPeptin-10',spec:'5mg',priceUsd:55},'KS10':{name:'KissPeptin-10',spec:'10mg',priceUsd:90},
  'TY10':{name:'Thymalin',spec:'10mg',priceUsd:65},'TA5':{name:'Thymosin Alpha-1',spec:'5mg',priceUsd:85},'TA10':{name:'Thymosin Alpha-1',spec:'10mg',priceUsd:135},
  'MS10':{name:'MOTS-c',spec:'10mg',priceUsd:60},'MS40':{name:'MOTS-c',spec:'40mg',priceUsd:165},
  'F410':{name:'FOXO4',spec:'10mg',priceUsd:280},'LL37':{name:'LL37',spec:'5mg',priceUsd:80},'MT10':{name:'Melatonin',spec:'10mg',priceUsd:60},
  'FR2':{name:'HGH Fragment 176-191',spec:'2mg',priceUsd:55},'FR5':{name:'HGH Fragment 176-191',spec:'5mg',priceUsd:90},'FR10':{name:'HGH Fragment 176-191',spec:'10mg',priceUsd:150},
  'DR5':{name:'Dermorphin',spec:'5mg',priceUsd:55},'GTT':{name:'Glutathione',spec:'1500mg',priceUsd:90},
  '5AM':{name:'5-Amino-1MQ',spec:'5mg',priceUsd:60},'10AM':{name:'5-Amino-1MQ',spec:'10mg',priceUsd:100},'50AM':{name:'5-Amino-1MQ',spec:'50mg',priceUsd:150},
  'CGL5':{name:'Cagrilintide',spec:'5mg',priceUsd:100},'CGL10':{name:'Cagrilintide',spec:'10mg',priceUsd:175},'CGL20':{name:'Cagrilintide',spec:'20mg',priceUsd:240},
  'RA10':{name:'Ara-290',spec:'10mg',priceUsd:63},'NP810':{name:'SNAP-8',spec:'10mg',priceUsd:50},
  'MDT5':{name:'Mazdutide',spec:'5mg',priceUsd:100},'MDT10':{name:'Mazdutide',spec:'10mg',priceUsd:150},
  'NJ3100':{name:'NAD+',spec:'100mg',priceUsd:50},'NJ500':{name:'NAD+',spec:'500mg',priceUsd:90},'NJ1000':{name:'NAD+',spec:'1000mg',priceUsd:160},
  'BBG70':{name:'BPC+GHK-Cu+TB-500 Blend',spec:'70mg',priceUsd:180},'SUR10':{name:'Survodutide',spec:'10mg',priceUsd:260},
  'CS10':{name:'Cagrilintide+Semaglutide',spec:'10mg',priceUsd:150},'RC10':{name:'Retatrutide+Cagrilintide',spec:'10mg',priceUsd:170},
  'VP5':{name:'VIP',spec:'5mg',priceUsd:100},'VP10':{name:'VIP',spec:'10mg',priceUsd:150},
  'KP5':{name:'KPV',spec:'5mg',priceUsd:45},'KP10':{name:'KPV',spec:'10mg',priceUsd:65},
  'PE10':{name:'PE 22-28',spec:'10mg',priceUsd:100},'NET5':{name:'N-Acetyl Epitalon Amidate',spec:'5mg',priceUsd:80},
  'KL80':{name:'BPC+GHK+TB500+KPV Blend',spec:'80mg',priceUsd:190},
  'LL5':{name:'Liraglutide',spec:'5mg',priceUsd:75},'LL10':{name:'Liraglutide',spec:'10mg',priceUsd:120},'LL30':{name:'Liraglutide',spec:'30mg',priceUsd:180},
  'BA10':{name:'Bac Water',spec:'10mL',priceUsd:15},'BA03':{name:'Bac Water',spec:'3mL',priceUsd:10},
  'AA10':{name:'Acetic Acid Water',spec:'10mL',priceUsd:15},'AA03':{name:'Acetic Acid Water',spec:'3mL',priceUsd:10},
};

// Pool de remetentes padrão — preencha com dados reais pelo painel Admin → Etiquetas → Remetentes
const DEFAULT_ME_POOL = [];
// CPFs fictícios usados pela antiga pool padrão — nunca recuperar do histórico do ME
// Pool do modo Teste (sandbox do Melhor Envios) — nunca usada em produção
const TEST_ME_POOL = [
  { _test:true, name:'[TESTE] Remetente Um',   document:'11144477735', phone:'11900000001', email:'teste1@example.com', address:'Avenida Paulista', number:'1000', complement:'', district:'Bela Vista',   city:'São Paulo', state:'SP', postal_code:'01310100' },
  { _test:true, name:'[TESTE] Remetente Dois', document:'22255588846', phone:'11900000002', email:'teste2@example.com', address:'Rua Augusta',      number:'200',  complement:'', district:'Consolação',   city:'São Paulo', state:'SP', postal_code:'01305000' },
  { _test:true, name:'[TESTE] Remetente Três', document:'33366699957', phone:'11900000003', email:'teste3@example.com', address:'Rua Vergueiro',    number:'300',  complement:'', district:'Liberdade',    city:'São Paulo', state:'SP', postal_code:'01504000' },
];
const isTestSender = s => !!s && (s._test || BLOCKED_SENDER_DOCS.has((s.document||'').replace(/\D/g,'')) || ['11144477735','22255588846','33366699957'].includes((s.document||'').replace(/\D/g,'')));
const BLOCKED_SENDER_DOCS = new Set(['35128476928','47291385628','61835924719','84617259309','29574816346','53926471891','76483192509','18749536273']);

const CATEGORIES = [
  { id: "all",          name: "Todos",               icon: "🧬", color: "rgba(0,229,195,0.15)" },
  { id: "emagrecedores",name: "Emagrecedores",        icon: "💉", color: "rgba(0,229,195,0.15)" },
  { id: "beleza",       name: "Beleza & Pele",        icon: "✨", color: "rgba(124,58,237,0.2)" },
  { id: "corpo",        name: "Corpo & Metabolismo",  icon: "🔥", color: "rgba(255,107,53,0.15)" },
  { id: "longevidade",  name: "Longevidade",          icon: "⚡", color: "rgba(0,168,255,0.15)" },
  { id: "libido",       name: "Libido",               icon: "💆", color: "rgba(236,72,153,0.15)" },
  { id: "neuro",        name: "Neuro & Foco",         icon: "🧠", color: "rgba(99,102,241,0.2)" },
  { id: "insumos",      name: "Insumos & Acessórios", icon: "🧪", color: "rgba(100,200,150,0.15)" },
];

const DEFAULT_PEPTIDES = [
  { id: "tirzepatida", sku: "TZ15",   name: "Tirzepatida 15mg",    desc: "Agonista dual GIP/GLP-1 para perda de peso avançada",             category: "emagrecedores", price: 299, hot: true,  badge: "🔥 Mais Vendido" },
  { id: "retatrutida", sku: "RT15",   name: "Retatrutida 15mg",    desc: "Agonista triplo GIP/GLP-1/Glucagon de nova geração",              category: "emagrecedores", price: 399, hot: false, badge: "✨ Novo" },
  { id: "ghkcu",       sku: "CU50",   name: "GHK-Cu 50mg",         desc: "Peptídeo cúprico para colágeno, pele e cabelo",                  category: "beleza",        price: 299, hot: true,  badge: "🔥 Popular" },
  { id: "glow",        sku: "BBG70",  name: "GLOW Blend 70mg",     desc: "BPC-157 + TB-500 + GHK-Cu — stack completo recuperação e beleza", compounds: "BPC-157 · TB-500 · GHK-Cu", category: "beleza", price: 699, hot: false, badge: "⭐ Destaque" },
  { id: "snap8",       sku: "SNAP10", name: "SNAP-8 10mg",         desc: "Botox natural, reduz linhas de expressão",                       category: "beleza",        price: 290, hot: false, badge: null },
  { id: "tesamorelin", sku: "TSM5",   name: "Tesamorelin 5mg",     desc: "Queima de gordura visceral sem efeitos GLP-1",                   category: "corpo",         price: 299, hot: false, badge: "⚡ Limitado" },
  { id: "epithalon",   sku: "EPT10",  name: "Epithalon 10mg",      desc: "Longevidade celular, telômeros, sono e energia",                 category: "longevidade",   price: 249, hot: false, badge: null },
  { id: "pt141",       sku: "P41",    name: "PT-141 10mg",         desc: "Modulador de libido masculino e feminino",                       category: "libido",        price: 280, hot: false, badge: null },
  { id: "selank",      sku: "SLK5",   name: "Selank 5mg",          desc: "Ansiolítico peptídico, foco e clareza mental",                   category: "neuro",         price: 199, hot: false, badge: "✨ Novo" },
  { id: "agua-bact",   sku: "AGUA5",  name: "Água Bacteriostática 5ml", desc: "Solvente estéril para reconstituição de peptídeos — compatível com todos os produtos do catálogo", category: "insumos", price: 25, hot: false, badge: null },
  { id: "kit-reconst", sku: "KIT01",  name: "Kit de Reconstituição", desc: "Água bacteriostática + lenços de álcool + frasco vazio estéril — tudo que você precisa para reconstituir seus peptídeos com segurança", category: "insumos", price: 49, hot: false, badge: "📦 Kit Completo" },
];

// Combos: cadastrados no admin (aba COMBOS) e salvos em site_config.bundles — a Edge Function
// create-order lê a mesma lista para validar o desconto. Estes 3 são o seed/fallback (iguais ao create-order/pricing.ts).
const DEFAULT_BUNDLES = [
  { id: "bundle-emagre",   name: "Stack Emagrecimento Total", desc: "Tirzepatida 15mg + Tesamorelin 5mg — protocolo duplo GLP-1 e queima visceral", items: ["tirzepatida","tesamorelin"], price: 549, badge: "🔥 Economize R$ 49", active: true },
  { id: "bundle-beleza",   name: "Stack Beleza & Pele",       desc: "GHK-Cu 50mg + SNAP-8 10mg — colágeno e antienvelhecimento",                    items: ["ghkcu","snap8"],            price: 549, badge: "💎 Economize R$ 40", active: true },
  { id: "bundle-longe",    name: "Stack Longevidade Premium", desc: "Epithalon 10mg + Selank 5mg — longevidade celular e equilíbrio mental",         items: ["epithalon","selank"],        price: 399, badge: "⭐ Economize R$ 49", active: true },
];
// Mesma validação do servidor: ausente/inválido → seed; "[]" → nenhum combo
function parseBundlesCfg(raw) {
  let v = raw;
  if (typeof raw === 'string') { try { v = JSON.parse(raw); } catch { return DEFAULT_BUNDLES; } }
  if (!Array.isArray(v)) return DEFAULT_BUNDLES;
  return v.filter(b => b && typeof b.id === 'string' && b.id && Array.isArray(b.items) && b.items.length >= 2
    && b.items.every(i => typeof i === 'string') && typeof b.price === 'number' && isFinite(b.price) && b.price > 0);
}
// Descontos que o create-order validou e gravou no pedido (para o admin exibir)
function orderDiscounts(o) {
  return {
    coupon: Number(o.coupon_discount) || 0, couponCode: o.coupon_code || null,
    bundle: Number(o.bundle_discount) || 0, bundles: Array.isArray(o.bundles) ? o.bundles : [],
    points: Number(o.points_discount) || 0, pointsUsed: Number(o.points_used) || 0,
    manual: Number(o.manual_discount) || 0, // desconto manual do admin (sql/orders_manual_discount.sql)
  };
}
// Subtotal dos itens de um pedido do admin (pedidos antigos podem não ter "subtotal" gravado)
function orderItemsSubtotal(o, products) {
  if (o._subtotal != null && !isNaN(parseFloat(o._subtotal))) return parseFloat(o._subtotal);
  const items = o._items && o._items.length ? o._items : [{ peptideId: o.peptideId, qty: o.qty || 1 }];
  return items.reduce((s, it) => { const p = products.find(x => x.id === it.peptideId); return s + (it.price || (p ? p.price : 0)) * (it.qty || 1); }, 0);
}
// Total = subtotal − cupom − combo − pontos − desconto manual (nunca abaixo de 0) + frete.
// Mesma conta do create-order (itens após descontos, depois o frete).
function orderTotalWith(subtotal, freight, d, manual) {
  const dd = d || {};
  const items = Math.max(0, (Number(subtotal) || 0) - (dd.coupon || 0) - (dd.bundle || 0) - (dd.points || 0) - (Number(manual) || 0));
  return Math.round((items + (Number(freight) || 0)) * 100) / 100;
}
function loadBundlesCache() {
  try { const s = localStorage.getItem('vg-bundles'); return s ? parseBundlesCfg(s) : DEFAULT_BUNDLES; } catch { return DEFAULT_BUNDLES; }
}

// Mais vendidos: site_config.bestsellers = texto JSON com lista de SKUs (ou ids) em ordem.
// Vazio/ausente/invalido -> BESTSELLERS_DEFAULT. Aceita SKU (sem diferenciar maiusculas) ou id do produto.
const BESTSELLERS_DEFAULT = ['TZ15', 'RT15', 'CU50'];
const BESTSELLERS_MAX = 4;
function parseBestsellersCfg(raw) {
  try {
    const v = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(v)) return [];
    return v.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()).slice(0, BESTSELLERS_MAX);
  } catch { return []; }
}
function loadBestsellersCache() {
  try { const s = localStorage.getItem('vg-bestsellers'); return s ? parseBestsellersCfg(s) : []; } catch { return []; }
}
function resolveBestsellers(keys, products) {
  const list = keys && keys.length ? keys : BESTSELLERS_DEFAULT;
  const seen = new Set(); const out = [];
  list.forEach(k => {
    const key = String(k).toLowerCase();
    const p = (products || []).find(x => String(x.sku || '').toLowerCase() === key || String(x.id).toLowerCase() === key);
    if (p && !seen.has(p.id)) { seen.add(p.id); out.push(p); }
  });
  return out.slice(0, BESTSELLERS_MAX);
}

function validarCPF(cpf) {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(d[i]) * (10 - i);
  let r = (s * 10) % 11; if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(d[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(d[i]) * (11 - i);
  r = (s * 10) % 11; if (r === 10 || r === 11) r = 0;
  return r === parseInt(d[10]);
}

function loadProducts() {
  try { const s = localStorage.getItem("vg-products"); return s ? JSON.parse(s) : DEFAULT_PEPTIDES; } catch { return DEFAULT_PEPTIDES; }
}
function saveProducts(p) {
  localStorage.setItem("vg-products", JSON.stringify(p));
  if (!sb) return;
  const rows = p.map((prod, i) => ({
    id: prod.id, sku: prod.sku || prod.id.toUpperCase(),
    name: prod.name, description: prod.desc || '',
    category: prod.category, price: prod.price,
    hot: prod.hot || false, badge: prod.badge || null,
    compounds: prod.compounds || null,
    cost_per_vial: prod._custoVial || null,
    packs: prod.packs || [],
    promo: parseFloat(prod.promo) || 0,
    image_url: prod.image_url || null,
    sort_order: i, updated_at: new Date().toISOString()
  }));
  sb.from('products').upsert(rows, { onConflict: 'id' })
    .then(({ error }) => { if (error) console.warn('[Supabase] Products sync error:', error.message); });
}

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
  purchase_order_caps: 'id', products: 'id', stock: 'product_id', site_config: 'key',
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

// ── CALCULATOR DATA ────────────────────────────────────────────────────────────
const CALC_PEP_DB = {
  tirzepatide:{ name:'Tirzepatida',  tags:['Injetável','GLP-1/GIP'] },
  retatrutide:{ name:'Retatrutida',  tags:['Injetável','GLP-1'] },
  ghkcu:      { name:'GHK-Cu',       tags:['Injetável','Tópico','Pele'] },
  snap8:      { name:'SNAP-8',       tags:['Tópico','Creme/Sérum'] },
  tesamorelin:{ name:'Tesamorelin',  tags:['Injetável','GHRH'] },
  epithalon:  { name:'Epithalon',    tags:['Injetável','Longevidade'] },
  pt141:      { name:'PT-141',       tags:['Injetável','Libido'] },
  selank:     { name:'Selank',       tags:['Nasal','Ansiolítico'] },
  bpc157:     { name:'BPC-157',      tags:['Injetável','Reparo'] },
  tb500:      { name:'TB-500',       tags:['Injetável','Sistêmico'] },
  semaglutide:{ name:'Semaglutida',  tags:['Injetável','GLP-1'] },
  ipamorelin: { name:'Ipamorelin',   tags:['Injetável','GH'] },
  cjc1295:    { name:'CJC-1295',     tags:['Injetável','GHRH'] },
  semax:      { name:'Semax',        tags:['Nasal','Cognitivo'] },
  aod9604:    { name:'AOD-9604',     tags:['Injetável','Lipólise'] },
  motsc:      { name:'MOTS-c',       tags:['Injetável','Mitocondrial'] },
  humanin:    { name:'Humanin',      tags:['Injetável','Longevidade'] },
  foxo4dri:   { name:'FOXO4-DRI',    tags:['Injetável','Senolítico'] },
  thymosinA1: { name:'Timosina α1',  tags:['Injetável','Imunidade'] },
  mt2:        { name:'Melanotan II', tags:['Injetável','Melanocortina'] },
};

const CALC_DOSES = {
  bpc157:     { doses:[200,300,500,1000], freqs:[{l:'1x/dia',t:1},{l:'2x/dia',t:2},{l:'3x/dia',t:3}], dfi:1, vials:[2,5,10,60], unit:'mcg' },
  tb500:      { doses:[2000,5000],        freqs:[{l:'2x/sem',t:0.29},{l:'1x/sem',t:0.14},{l:'Quinzenal',t:0.07}], dfi:0, vials:[2,5,10,60], unit:'mcg' },
  ghkcu:      { doses:[1000,2000],        freqs:[{l:'1x/dia',t:1},{l:'2x/dia',t:2}], dfi:0, vials:[5,10,50,60], unit:'mcg' },
  snap8:      { topical:true, conc:'3–8%', veh:'creme/sérum' },
  semaglutide:{ doses:[250,500,1000,2400],freqs:[{l:'1x/sem',t:0.14}], dfi:0, vials:[1,2.4], unit:'mcg' },
  tirzepatide:{ doses:[2500,5000,10000,15000],freqs:[{l:'1x/sem',t:0.14}], dfi:0, vials:[2.5,5,10,15], unit:'mcg' },
  tesamorelin:{ doses:[1000,2000],        freqs:[{l:'1x/dia',t:1}], dfi:0, vials:[2,5], unit:'mcg' },
  retatrutide:{ doses:[2000,4000,8000,12000],freqs:[{l:'1x/sem',t:0.14}], dfi:0, vials:[2,5,12], unit:'mcg' },
  ipamorelin: { doses:[100,200,300],      freqs:[{l:'1x/dia',t:1},{l:'2x/dia',t:2},{l:'3x/dia',t:3}], dfi:1, vials:[2,5], unit:'mcg' },
  cjc1295:    { doses:[100,200,300],      freqs:[{l:'3x/dia',t:3},{l:'2x/dia',t:2},{l:'1x/sem (DAC)',t:0.14}], dfi:0, vials:[2,5], unit:'mcg' },
  epithalon:  { doses:[5000,10000],       freqs:[{l:'1x/dia (ciclo)',t:1},{l:'2x/dia (ciclo)',t:2}], dfi:0, vials:[10,20,60], unit:'mcg' },
  pt141:      { doses:[1000,2000],        freqs:[{l:'Pontual (uso)',t:1},{l:'2x/sem',t:0.29}], dfi:0, vials:[2,10], unit:'mcg' },
  selank:     { doses:[250,500,1000],     freqs:[{l:'1x/dia',t:1},{l:'2x/dia',t:2}], dfi:1, vials:[5,10,60], unit:'mcg', nasal:true },
  semax:      { doses:[200,300,600],      freqs:[{l:'1x/dia',t:1},{l:'2x/dia',t:2}], dfi:1, vials:[2,5], unit:'mcg', nasal:true },
  aod9604:    { doses:[300,500],          freqs:[{l:'1x/dia',t:1},{l:'2x/dia',t:2}], dfi:0, vials:[2,5], unit:'mcg' },
  motsc:      { doses:[5000,10000],       freqs:[{l:'1x/sem',t:0.14},{l:'2x/sem',t:0.29}], dfi:0, vials:[5,10,60], unit:'mcg' },
  humanin:    { doses:[2000,5000,10000],  freqs:[{l:'1x/sem',t:0.14},{l:'2x/sem',t:0.29}], dfi:0, vials:[5,10,60], unit:'mcg' },
  foxo4dri:   { doses:[1000,3000,5000],   freqs:[{l:'3x/sem (ciclo)',t:0.43}], dfi:0, vials:[5,10,60], unit:'mcg' },
  thymosinA1: { doses:[1600,3200],        freqs:[{l:'2x/sem',t:0.29},{l:'3x/sem',t:0.43}], dfi:0, vials:[5], unit:'mcg' },
  mt2:        { doses:[250,500,1000],     freqs:[{l:'Carregamento diário',t:1},{l:'Manutenção 2x/sem',t:0.29}], dfi:0, vials:[5,10,60], unit:'mcg' },
};


const PROTOCOLS = {
  tirzepatide: {
    doseMin: '2,5 mg', doseMax: '15 mg',
    freq: '1x por semana', ciclo: '12–24 semanas',
    inicio: 'Começar em 2,5 mg/sem por 4 semanas antes de aumentar',
    nota: 'Titular a dose a cada 4 semanas conforme tolerância. Injeção subcutânea no abdômen, coxa ou braço. Manter hidratação e proteína ≥1,2g/kg.'
  },
  retatrutide: {
    doseMin: '2 mg', doseMax: '12 mg',
    freq: '1x por semana', ciclo: '16–24 semanas',
    inicio: 'Começar com 2 mg/sem e titular mensalmente',
    nota: 'Agonista triplo GLP-1/GIP/glucagon. Potente efeito lipolítico. Monitorar náusea nas primeiras semanas. Injeção subcutânea.'
  },
  ghkcu: {
    doseMin: '1 mg', doseMax: '2 mg',
    freq: '1–2x por dia', ciclo: '4–8 semanas',
    inicio: 'Começar com 1 mg/dia e avaliar resposta',
    nota: 'Injeção subcutânea próxima à área alvo (cicatrizes, articulações). Uso tópico em paralelo amplifica os resultados.'
  },
  snap8: {
    doseMin: '3%', doseMax: '8%',
    freq: '1–2x por dia', ciclo: 'Uso contínuo',
    inicio: 'Aplicar em creme/sérum 1x/dia nas primeiras 2 semanas',
    nota: 'Análogo do Argireline. Uso exclusivamente tópico. Aplicar na área de expressão facial. Evitar contato com os olhos.'
  },
  tesamorelin: {
    doseMin: '1 mg', doseMax: '2 mg',
    freq: '1x por dia', ciclo: '12–26 semanas',
    inicio: 'Dose padrão de 2 mg/dia para gordura visceral',
    nota: 'GHRH aprovado pela FDA para lipodistrofia. Injeção subcutânea no abdômen. Melhor resultado quando injetado em jejum ou pré-sono.'
  },
  epithalon: {
    doseMin: '5 mg', doseMax: '10 mg',
    freq: '1–2x por dia (em ciclo)', ciclo: '10–20 dias, 2x/ano',
    inicio: 'Ciclo de 10 dias: 10 mg/dia divididos em 2 doses',
    nota: 'Peptídeo pineal e telomerase. Injeção subcutânea ou IV. Ciclos curtos com intervalo de meses são mais eficazes. Avaliar após 2 ciclos.'
  },
  pt141: {
    doseMin: '1 mg', doseMax: '2 mg',
    freq: 'Conforme necessidade (uso pontual)', ciclo: 'Não contínuo',
    inicio: 'Dose inicial de 1 mg, 45–60 min antes da atividade',
    nota: 'Agonista de melanocortina (MC3R/MC4R). Injeção subcutânea. Efeito esperado em 30–90 min. Pode causar rubor facial e náusea leve nas primeiras doses.'
  },
  selank: {
    doseMin: '250 mcg', doseMax: '1 mg',
    freq: '1–2x por dia', ciclo: '2–4 semanas',
    inicio: 'Começar com 250 mcg/dia, intranasalmente',
    nota: 'Ansiolítico/nootrópico. Uso intranasal (spray). Efeito percebido rapidamente. Ciclos curtos com pausas de 1–2 semanas são recomendados.'
  },
  bpc157: {
    doseMin: '200 mcg', doseMax: '1 mg',
    freq: '1–2x por dia', ciclo: '4–12 semanas',
    inicio: 'Injetar preferencialmente próximo à área lesionada',
    nota: 'Peptídeo de reparo tecidual. Injeção subcutânea ou intramuscular. Sistêmico ou local. Resultados visíveis a partir de 2–4 semanas.'
  },
  tb500: {
    doseMin: '2 mg', doseMax: '5 mg',
    freq: '2x por semana (fase carga), 1x/sem manutenção', ciclo: '4–6 semanas carga + manutenção',
    inicio: 'Fase de carga: 2,5 mg, 2x/sem por 4–6 semanas',
    nota: 'Fração da Timosina-β4. Ação sistêmica anti-inflamatória e de reparo. Injeção SC ou IM. Excelente para lesões musculares e articulares crônicas.'
  },
  semaglutide: {
    doseMin: '0,25 mg', doseMax: '2,4 mg',
    freq: '1x por semana', ciclo: '16–52 semanas',
    inicio: 'Começar com 0,25 mg/sem por 4 semanas, titular a cada mês',
    nota: 'GLP-1 de longa ação. Injeção subcutânea 1x/semana. Titular gradualmente para minimizar efeitos GI. Manter proteína elevada na dieta.'
  },
  ipamorelin: {
    doseMin: '100 mcg', doseMax: '300 mcg',
    freq: '1–3x por dia', ciclo: '8–16 semanas',
    inicio: 'Melhor utilizado em jejum ou pré-sono (200 mcg)',
    nota: 'Secretagogo de GH seletivo. Injeção subcutânea. Combinação clássica com CJC-1295 potencializa o pulso de GH. Não causa pico de cortisol ou prolactina.'
  },
  cjc1295: {
    doseMin: '100 mcg', doseMax: '300 mcg',
    freq: '1–3x por dia (sem DAC) / 1x/sem (com DAC)', ciclo: '8–16 semanas',
    inicio: 'Sem DAC: 100–200 mcg pré-sono. Com DAC: 2 mg/sem',
    nota: 'GHRH de longa ação. Injeção subcutânea. Combinação com Ipamorelin é a mais popular. Com DAC, meia-vida estendida para ~8 dias.'
  },
  semax: {
    doseMin: '200 mcg', doseMax: '600 mcg',
    freq: '1–2x por dia', ciclo: '2–4 semanas',
    inicio: 'Começar com 200 mcg/dia intranasal, avaliar resposta cognitiva',
    nota: 'Análogo do ACTH(4-7). Uso intranasal. Efeito nootrópico e neuroprotetor. Ciclos de 2 semanas com pausa de 1 semana são bem tolerados.'
  },
  aod9604: {
    doseMin: '300 mcg', doseMax: '500 mcg',
    freq: '1–2x por dia', ciclo: '12–16 semanas',
    inicio: 'Injetar em jejum, preferencialmente próximo à área de gordura alvo',
    nota: 'Fragmento do HGH com efeito lipolítico. Injeção subcutânea. Eficaz combinado com dieta calórica controlada. Sem efeitos sobre IGF-1.'
  },
  motsc: {
    doseMin: '5 mg', doseMax: '10 mg',
    freq: '1–2x por semana', ciclo: '8–12 semanas',
    inicio: 'Começar com 5 mg/sem e ajustar conforme resposta metabólica',
    nota: 'Peptídeo mitocondrial. Injeção subcutânea ou IV. Melhora sensibilidade à insulina e metabolismo energético. Melhor associado com exercício.'
  },
  humanin: {
    doseMin: '2 mg', doseMax: '10 mg',
    freq: '1–2x por semana', ciclo: '8–12 semanas',
    inicio: 'Dose de 2 mg/sem como início, titular conforme tolerância',
    nota: 'Peptídeo mitocondrial com ação neuroprotetora e anti-apoptótica. Injeção subcutânea. Resultados metabólicos e cognitivos observados a partir de 4–6 semanas.'
  },
  foxo4dri: {
    doseMin: '1 mg', doseMax: '5 mg',
    freq: '3x por semana (durante ciclo)', ciclo: '3–4 semanas, intervalos longos',
    inicio: 'Protocolo de Klein: 1 mg/dia por 3 dias consecutivos/semana',
    nota: 'Peptídeo senolítico — elimina células senescentes. Ciclos curtos com pausas de meses. Injeção subcutânea ou IV. Uso ainda experimental em humanos.'
  },
  thymosinA1: {
    doseMin: '1,6 mg', doseMax: '3,2 mg',
    freq: '2–3x por semana', ciclo: '4–12 semanas',
    inicio: 'Dose padrão de 1,6 mg, 2x/semana por 4 semanas',
    nota: 'Imunomodulador derivado do timo. Injeção subcutânea. Utilizado em terapias de imunodeficiência. Aumentar para 3,2 mg em protocolos de fortalecimento imune.'
  },
  mt2: {
    doseMin: '250 mcg', doseMax: '1 mg',
    freq: 'Diário (carga) / 2x/sem (manutenção)', ciclo: 'Carga: 2–4 semanas / Manutenção: indefinido',
    inicio: 'Carga: 0,25–0,5 mg/dia até atingir bronzeado desejado',
    nota: 'Agonista de melanocortina. Injeção subcutânea. Requer exposição solar para ativar pigmentação. Pode causar náusea e ereção espontânea no início do uso.'
  },
};

// Guia educativo por produto — exibido em accordion na página do produto
const PRODUCT_GUIDES = {
  ghkcu: [
    {
      title: '💧 Reconstituição (como preparar)',
      body: `Para vial de 50 mg:
• 5 ml de água bacteriostática → 10 mg/ml → 1 mg a cada 10 u na seringa de insulina
• 10 ml → 5 mg/ml → 500 mcg a cada 10 u
• 20 ml → 2,5 mg/ml → 250 mcg a cada 10 u
• 25 ml → 2 mg/ml → 100 mcg a cada 5 u

Para vial de 100 mg:
• 10 ml → 10 mg/ml → 1 mg a cada 10 u
• 20 ml → 5 mg/ml → 500 mcg a cada 10 u
• 25 ml → 4 mg/ml → 200 mcg a cada 5 u

Use seringa de insulina U-100. Gire suavemente o vial — não agite. Armazene refrigerado (2–8 °C) após reconstituído.`
    },
    {
      title: '📋 Protocolos de Uso',
      body: `Dose baixa diária (100–500 mcg SC)
Indicações: rejuvenescimento da pele, crescimento capilar leve, cicatrização de feridas, manutenção anti-idade.
• Iniciantes: 100–200 mcg/dia
• Intermediário: 300 mcg/dia
• Avançado: até 500 mcg/dia
Aplicar subcutâneo próximo à área alvo (face, couro cabeludo, cicatrizes).

Dose intermitente (1–2 mg SC, 2–3x/semana)
Indicações: anti-idade sistêmica, crescimento capilar mais agressivo, reparo de lesões, pós-cirúrgico.
• 1 mg por aplicação, 2–3x/semana, OU
• 2 mg por aplicação, 2x/semana (teto por injeção)

Uso tópico em paralelo potencializa resultados na pele e no cabelo.`
    },
    {
      title: '🔄 Ciclo Recomendado',
      body: `Protocolo padrão: 8 semanas ON / 8 semanas OFF
• Ciclos mais longos que 8 semanas podem reduzir a resposta
• Janela OFF permite reset dos receptores e evita acúmulo
• Reavaliar resultados ao final de cada ciclo antes de repetir

Combinações comuns:
• GHK-Cu + BPC-157 → reparo tecidual + regeneração
• GHK-Cu + Tesamorelin → anti-idade sistêmica
• GHK-Cu tópico + injetável → máximo efeito na pele/cabelo`
    },
    {
      title: '⚠️ Segurança e Doses Máximas',
      body: `Limites importantes:
• Teto diário: ≤ 1 mg/dia (dose baixa contínua)
• Teto por injeção: ≤ 2 mg (nunca injetar mais de 2 mg de uma vez)
• Não combinar dose diária alta + intermitente no mesmo dia

Efeitos colaterais possíveis:
• Irritação, vermelhidão ou coceira no local da injeção
• Gosto metálico na boca logo após aplicar (passageiro)
• Queda transitória de pressão em doses altas

Contraindicações:
• Alergia a cobre
• Doença de Wilson (acúmulo de cobre)
• Gravidez e amamentação

⚠️ Conteúdo educativo. Não substitui orientação médica. Research use only.`
    }
  ]
};

const ALERTS = {
  tirzepatide: {
    exames: ['Glicemia em jejum / HbA1c', 'Perfil lipídico', 'Função renal (creatinina)', 'Peso e IMC mensal'],
    contraindicacoes: ['Histórico de pancreatite', 'Carcinoma medular da tireoide (pessoal ou familiar)', 'Síndrome MEN2', 'Gravidez ou amamentação'],
    alertas: ['Náusea e vômito nas primeiras semanas — titular lentamente', 'Risco de hipoglicemia se combinado com insulina', 'Monitorar frequência cardíaca (taquicardia relatada)'],
  },
  retatrutide: {
    exames: ['Glicemia / HbA1c', 'Lipase e amilase (pancreatite)', 'TSH e T4 livre', 'Peso e circunferência abdominal'],
    contraindicacoes: ['Pancreatite ativa ou histórico', 'Carcinoma de tireoide', 'Gravidez', 'Insuficiência renal grave'],
    alertas: ['Efeito mais potente que semaglutida — titular com cuidado', 'Pode causar perda de massa magra — manter treino e proteína alta', 'Monitorar sintomas GI: diarreia, constipação'],
  },
  ghkcu: {
    exames: ['Nenhum exame específico obrigatório', 'Hemograma para uso prolongado', 'Cobre sérico (uso > 12 semanas)'],
    contraindicacoes: ['Câncer ativo (estimula crescimento celular)', 'Gravidez', 'Hipersensibilidade ao cobre'],
    alertas: ['Excesso de cobre pode causar toxicidade — ciclar o uso', 'Não usar em lesões com infecção ativa', 'Evitar dose excessiva para não inibir os próprios efeitos'],
  },
  snap8: {
    exames: ['Nenhum exame específico'],
    contraindicacoes: ['Hipersensibilidade a peptídeos', 'Pele com feridas abertas ou infeccionada', 'Uso próximo aos olhos'],
    alertas: ['Uso exclusivamente tópico — nunca injetável', 'Testar em pequena área antes do uso amplo', 'Evitar combinar com ácidos muito concentrados'],
  },
  tesamorelin: {
    exames: ['IGF-1 basal e durante uso', 'Glicemia e insulina de jejum', 'Cortisol (interferência no eixo)', 'Exame de lipodistrofia por imagem se disponível'],
    contraindicacoes: ['Câncer ativo ou histórico recente', 'Gravidez', 'Hipotireoidismo não tratado', 'Retinopatia diabética'],
    alertas: ['Pode elevar glicemia — monitorar em diabéticos', 'Pode aumentar IGF-1 — não usar se elevado', 'Evitar injeção em pele irritada ou com lipohipertrofia'],
  },
  epithalon: {
    exames: ['Nenhum exame essencial para ciclos curtos', 'Hemograma completo antes de ciclos longos', 'Painel hormonal (GH/IGF-1) se uso frequente'],
    contraindicacoes: ['Câncer ativo (estimula telomerase)', 'Doenças autoimunes graves', 'Gravidez'],
    alertas: ['Ciclos muito frequentes podem ser contraprodutivos', 'Uso IV deve ser feito com assepsia rigorosa', 'Dados em humanos ainda limitados — uso experimental'],
  },
  pt141: {
    exames: ['Pressão arterial (pode elevar PA)', 'Avaliação cardiovascular prévia'],
    contraindicacoes: ['Hipertensão não controlada', 'Doenças cardiovasculares graves', 'Uso concomitante de nitratos', 'Gravidez'],
    alertas: ['Pode causar rubor, náusea e cefaleias nas primeiras doses', 'Não combinar com inibidores de PDE5 (Viagra, Cialis)', 'Evitar dose excessiva — priapismo relatado em homens'],
  },
  selank: {
    exames: ['Nenhum exame específico para ciclos curtos', 'Avaliação psiquiátrica em uso prolongado'],
    contraindicacoes: ['Gravidez e amamentação', 'Epilepsia não controlada', 'Uso concomitante de benzodiazepínicos em dose alta'],
    alertas: ['Não interromper abruptamente após uso prolongado', 'Pode potencializar sedativos — cuidado com álcool', 'Dados de longo prazo limitados em humanos'],
  },
  bpc157: {
    exames: ['Nenhum exame obrigatório para ciclos curtos', 'Hemograma e função hepática para uso > 12 semanas'],
    contraindicacoes: ['Câncer ativo (potencial de estimular crescimento vascular)', 'Gravidez', 'Cirurgias recentes em áreas com tumor'],
    alertas: ['Evitar em histórico de câncer recente', 'Pode acelerar cicatrização em excessso — monitorar feridas', 'Manter refrigerado após reconstituição (usar em até 30 dias)'],
  },
  tb500: {
    exames: ['Nenhum exame essencial para ciclos padrão', 'Hemograma em uso prolongado', 'Marcadores inflamatórios (PCR, VHS)'],
    contraindicacoes: ['Câncer ativo', 'Gravidez', 'Trombocitose (excesso de plaquetas)'],
    alertas: ['Pode mascarar inflamação — não usar em infecções ativas', 'Conservar refrigerado e protegido da luz', 'Evitar injeção intravascular acidental'],
  },
  semaglutide: {
    exames: ['Glicemia em jejum / HbA1c', 'Perfil lipídico', 'Função renal e hepática', 'Lipase e amilase'],
    contraindicacoes: ['Carcinoma medular da tireoide', 'Síndrome MEN2', 'Pancreatite ativa', 'Gravidez'],
    alertas: ['Titular obrigatoriamente — nunca iniciar na dose máxima', 'Pode causar desaceleração do esvaziamento gástrico', 'Monitorar perda de massa magra — proteína e treino são essenciais'],
  },
  ipamorelin: {
    exames: ['IGF-1 basal e periódico', 'Glicemia em jejum', 'Cortisol (menor impacto, mas avaliar)'],
    contraindicacoes: ['Câncer ativo (GH estimula crescimento)', 'Retinopatia diabética', 'Hipotireoidismo não tratado', 'Gravidez'],
    alertas: ['Não usar pós-refeição — insulina reduz eficácia', 'Verificar IGF-1 se > 3 meses de uso', 'Combinar com CJC-1295 aumenta potência — reduzir dose individual'],
  },
  cjc1295: {
    exames: ['IGF-1', 'Glicemia', 'GH basal (se disponível)', 'Cortisol matinal'],
    contraindicacoes: ['Câncer ativo', 'Acromegalia ou histórico', 'Gravidez', 'Diabetes tipo 1 descontrolado'],
    alertas: ['Com DAC: meia-vida longa, monitorar supersupressão', 'Evitar dose noturna excessiva — pode causar sonhos vívidos', 'IGF-1 acima do normal: pausar e reavaliar'],
  },
  semax: {
    exames: ['Nenhum exame obrigatório para ciclos curtos', 'Avaliação neurológica/psiquiátrica prévia se histórico de transtornos'],
    contraindicacoes: ['Epilepsia não controlada', 'Esquizofrenia ou psicose', 'Gravidez', 'Hipertensão grave'],
    alertas: ['Pode causar ansiedade em doses altas', 'Efeitos cognitivos variam individualmente', 'Dados de longo prazo limitados — usar em ciclos'],
  },
  aod9604: {
    exames: ['Glicemia e insulina em jejum', 'Perfil lipídico basal', 'Peso e composição corporal'],
    contraindicacoes: ['Câncer ativo', 'Gravidez', 'Hipersensibilidade a análogos do GH'],
    alertas: ['Eficácia reduzida sem déficit calórico', 'Não eleva IGF-1 — seguro nesse aspecto', 'Resultados mais lentos que GH — expectativa realista'],
  },
  motsc: {
    exames: ['Glicemia / HbA1c', 'Perfil lipídico', 'Função mitocondrial indireta (lactato, piruvato)'],
    contraindicacoes: ['Gravidez', 'Doenças mitocondriais hereditárias graves', 'Câncer ativo (metabolismo energético)'],
    alertas: ['Substância muito nova — dados humanos limitados', 'Potencial interação com metformina', 'Exercício físico potencializa os efeitos'],
  },
  humanin: {
    exames: ['Glicemia e insulina', 'Marcadores inflamatórios (IL-6, TNF-α)', 'Cognição basal (se uso nootrópico)'],
    contraindicacoes: ['Câncer ativo', 'Gravidez', 'Insuficiência hepática grave'],
    alertas: ['Evidências ainda majoritariamente in vitro e animal', 'Conservar a -20°C antes da reconstituição', 'Uso experimental — acompanhamento médico altamente recomendado'],
  },
  foxo4dri: {
    exames: ['Hemograma completo', 'Função hepática e renal', 'Marcadores de senescência se disponíveis (p21, p16)'],
    contraindicacoes: ['Câncer ativo (senólise pode liberar citocinas inflamatórias)', 'Doenças autoimunes ativas', 'Gravidez', 'Pós-operatório recente'],
    alertas: ['Pode causar fadiga intensa nas primeiras doses (senescence burst)', 'Nunca iniciar ciclo sem check-up médico completo', 'Intervalos longos entre ciclos são obrigatórios'],
  },
  thymosinA1: {
    exames: ['Hemograma com diferencial', 'Imunoglobulinas (IgG, IgM, IgA)', 'Subpopulações linfocitárias (CD4/CD8)', 'PCR e VHS'],
    contraindicacoes: ['Transplantados em imunossupressão (risco de rejeição)', 'Doenças autoimunes ativas graves', 'Gravidez'],
    alertas: ['Monitorar resposta imune em imunodeficientes — pode ser vigorosa', 'Não usar concomitante com quimioterapia sem orientação médica', 'Reações no local da injeção são comuns'],
  },
  mt2: {
    exames: ['Dermatoscopia pré-uso (avaliar nevos existentes)', 'Pressão arterial', 'Avaliação urológica em homens (função erétil)'],
    contraindicacoes: ['Histórico de melanoma ou nevos atípicos', 'Hipertensão não controlada', 'Doenças cardiovasculares', 'Gravidez'],
    alertas: ['Risco de escurecimento/mudança de nevos — acompanhar dermatologicamente', 'Pode causar ereções prolongadas — reduzir dose', 'Proteger nevos com protetor solar durante o uso'],
  },
};


const DEFAULT_ARTICLES = [
  {
    id: 'art-ghkcu',
    emoji: '✨',
    tag: 'Beleza & Pele',
    title: 'GHK-Cu: o peptídeo do cobre que rejuvenesce a pele',
    subtitle: 'Descubra como o GHK-Cu age na síntese de colágeno, reparo celular e reversão dos sinais do envelhecimento.',
    date: '18 Fev 2025',
    relatedProductId: 'ghkcu',
    body: `<h3>O que é o GHK-Cu?</h3>
<p>O GHK-Cu (Glicil-L-Histidil-L-Lisina Cobre) é um peptídeo tripleto naturalmente presente no plasma humano, saliva e urina. Descoberto em 1973 pelo Dr. Loren Pickart, ele é responsável por sinalizar ao organismo que é hora de regenerar e renovar tecidos.</p>
<h3>Como funciona no organismo</h3>
<p>O GHK-Cu age em múltiplas frentes:</p>
<ul>
<li><strong>Síntese de colágeno</strong> — estimula fibroblastos a produzirem colágeno I, III e IV, aumentando firmeza e elasticidade.</li>
<li><strong>Atividade antioxidante</strong> — neutraliza radicais livres e reduz inflamação crônica de baixo grau.</li>
<li><strong>Reparo de DNA</strong> — ativa genes de reparo celular, com efeitos observados em mais de 4.000 genes humanos.</li>
<li><strong>Angiogênese</strong> — estimula formação de novos vasos sanguíneos, melhorando nutrição e oxigenação da pele.</li>
</ul>
<h3>Resultados esperados em pesquisa</h3>
<p>Estudos in vitro e in vivo demonstram redução de rugas finas, melhora na densidade da pele, cicatrização acelerada e crescimento capilar. Efeitos observados tipicamente entre 4–8 semanas de uso consistente.</p>
<h3>Como é administrado</h3>
<p>Via subcutânea ou intradérmica, frequência de 1–2x/semana. A reconstituição deve ser feita com água bacteriostática e o produto mantido refrigerado após aberto.</p>`
  },
  {
    id: 'art-tirz',
    emoji: '⚡',
    tag: 'Emagrecedores',
    title: 'Tirzepatida: a revolução dual GIP/GLP-1 no controle de peso',
    subtitle: 'Entenda o mecanismo de ação do agonista duplo que está redefinindo os estudos de obesidade e metabolismo.',
    date: '15 Fev 2025',
    relatedProductId: 'tirzepatida',
    body: `<h3>O que é a Tirzepatida?</h3>
<p>A Tirzepatida é um peptídeo agonista dual dos receptores GIP (peptídeo insulinotrópico dependente de glicose) e GLP-1 (peptídeo semelhante ao glucagon tipo 1). Essa dupla ação a diferencia de moléculas anteriores, com resultados superiores em estudos de controle de peso.</p>
<h3>Mecanismo de ação</h3>
<p>A ação simultânea em dois receptores cria um efeito sinérgico:</p>
<ul>
<li><strong>GLP-1</strong> — retarda o esvaziamento gástrico, reduz apetite e melhora sensibilidade à insulina.</li>
<li><strong>GIP</strong> — potencializa a secreção de insulina e pode reduzir efeitos adversos gastrointestinais do GLP-1 isolado.</li>
</ul>
<h3>Protocolo em estudos</h3>
<p>Administração subcutânea semanal, iniciando em doses baixas (2,5 mg/semana) com titulação gradual a cada 4 semanas para minimizar efeitos adversos como náuseas e vômitos.</p>
<h3>Perfil de segurança</h3>
<p>Os principais efeitos observados em pesquisa são gastrointestinais: náusea, diarreia e vômito, geralmente transitórios e correlacionados ao período de titulação. A titulação lenta é fundamental para adaptação.</p>`
  },
  {
    id: 'art-bpc',
    emoji: '🔧',
    tag: 'Recuperação',
    title: 'BPC-157: o peptídeo da cura que acelera a recuperação tecidual',
    subtitle: 'Do intestino aos tendões: como o BPC-157 age nos diferentes tecidos e por que é um dos peptídeos mais estudados em regeneração.',
    date: '10 Fev 2025',
    relatedProductId: 'glow',
    body: `<h3>O que é o BPC-157?</h3>
<p>O BPC-157 (Body Protection Compound 157) é um pentadecapeptídeo derivado de uma proteína de proteção gástrica. Composto por 15 aminoácidos, demonstra estabilidade excepcional e amplo espectro de ação em modelos de pesquisa.</p>
<h3>Mecanismos de regeneração</h3>
<p>O BPC-157 atua por múltiplas vias:</p>
<ul>
<li><strong>Angiogênese acelerada</strong> — estimula formação de novos vasos, essencial para o reparo de tendões e ligamentos, tecidos de vascularização naturalmente baixa.</li>
<li><strong>Upregulation do receptor EGR-1</strong> — amplifica expressão de fatores de crescimento locais.</li>
<li><strong>Proteção gastrointestinal</strong> — cicatrização de úlceras, modulação do eixo intestino-cérebro.</li>
<li><strong>Ação anti-inflamatória</strong> — redução de marcadores inflamatórios sem imunossupressão.</li>
</ul>
<h3>Aplicações mais estudadas</h3>
<p>As áreas com maior volume de pesquisa incluem: lesões de tendões e ligamentos, úlceras gástricas, lesões musculares, reparo ósseo e neuroproteção.</p>
<h3>Vias de administração</h3>
<p>Subcutânea (próximo ao local da lesão quando possível) ou oral para efeitos gastrointestinais. Ciclos típicos de 4–8 semanas com dose diária ou a cada dois dias.</p>`
  }
];

const BANNER_BG = "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAQABgADASIAAhEBAxEB/8QAHQABAAIDAQEBAQAAAAAAAAAAAAECAwQFBgcICf/EAF4QAAIBAgUCBAMDBwYJBwgHCQABAgMRBAUSITEGQRMiUWEHcYEUMpEjM0JSobHBCBVicrLRFiQ0Q3OCkuHwJTVTY4OTohdEVHSUwtLxCRg2RVVkdYSzZaOktCYoN//EABoBAQEBAQEBAQAAAAAAAAAAAAABAgMEBQb/xAAzEQEBAAIBAwICCQIHAQEAAAAAAQIRAxIhMQRBE1EUIjJCUmGRoeFxgQUjM5LB0fAVsf/aAAwDAQACEQMRAD8A/GqJANAAABBIAAAAAAAAAEEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACSAAAAkgAACSAAAAkAAQAAAJAEAkgAASBAAAkgkgACSAAJIAkgkAQCSAAJAEAkgAAAAJI7ABYkgASCAJIJAEAAACQBAJIAkAAQCQBAJAAgkgCSCQBAJIAkgkgAAAAAAAkgCQAAIJIAkgAACSAJAIAAkgACQAAAEAkgAAAAJIAAfIAAAAAAAAAASQAAAAAAASAIAAAAAAAABJAAAAASAIBJAEkAAAAAAAAAAAAAAAAAAAAAIJAEEgAACAJAAAAAAAAAAAAgCQAAAAAAAAAAAAAAAAAAAAAAAAB3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASCAJIAAkgkgCSCSAAAAAAAAABJAAkAgAAAAAAkgEgQCSAAAAD3JIAAAACSAJIAAAkgACSAJIAAkgkgAAAJIAAAAAAAAJIAAAACSAAAAkgACQQAAAAAACQCAJIAAAkAACAJIAAkgAAAAAAAAAAAAAAAAkgAAAAAAAAAAAAAAAAAAAAJIAAAAAAAAAAAAAAAAAAAAAAAAAAAAQSQBJBJAAkgAACQABAEggkAQSAIJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIEAkAQAAAAAAAACSAJIAAAAAAAAAAAAACSAJIJAAgkAQSABAJIAkgkAQAAAJIAAAAAAAAAAAAAAAJIAAkgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACCQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAABBIAAAAAAIBJAAAASAAAAAAAAQSAIJBAEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQBAAAAkgACQBAJIAkgkAQAAJIAAAAACSAAJAEAkACCSAJIJAAAAAABAJIAkAACCQBAJIAkgkgAAAAAAAkgAAAAAAAAACSAAAAAAAAAAAAAAAAAAAAAAAASBAJIAkgEgQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQSAAAAAAAAABBIAgAASCCQBBIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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";

const FAQ_SECTIONS = [
  {
    title: 'Sobre os Produtos',
    items: [
      { q: 'O que são peptídeos de pesquisa?', a: 'São compostos sintéticos utilizados em estudos científicos. Não são medicamentos e não se destinam ao consumo humano ou animal.' },
      { q: 'Os produtos vêm com certificado de pureza?', a: 'Sim. Todos os produtos possuem 99% de pureza garantida. O laudo analítico está disponível mediante solicitação.' },
      { q: 'Preciso de receita para comprar?', a: 'Não. Os produtos são vendidos exclusivamente para fins de pesquisa científica, sem exigência de receita médica.' },
    ]
  },
  {
    title: 'Reconstituição e Armazenamento',
    items: [
      { q: 'Como reconstituir o peptídeo?', a: 'Use a água bacteriostática inclusa no pedido. Injete o líquido pela parede do frasco, sem agitar — apenas gire suavemente até dissolver completamente.' },
      { q: 'Como armazenar após reconstituído?', a: 'Mantenha refrigerado entre 2–8°C, protegido da luz. Utilize em até 30 dias após a reconstituição.' },
      { q: 'Posso congelar antes de reconstituir?', a: 'Sim. O produto liofilizado pode ser armazenado a -20°C por até 24 meses sem perda de qualidade.' },
    ]
  },
  {
    title: 'Pagamento e Entrega',
    items: [
      { q: 'Quais formas de pagamento?', a: 'Aceitamos PIX à vista, cartão de crédito em 2x ou 3x via Mercado Pago.' },
      { q: 'Qual o prazo de entrega?', a: 'SP capital: mesmo dia ou dia seguinte. Demais estados: 2 a 5 dias úteis após a confirmação do pagamento.' },
      { q: 'Como funciona o frete grátis?', a: 'Pedidos acima de R$600 têm frete grátis para SP. Acima de R$1.000, frete grátis para qualquer estado do Brasil.' },
    ]
  },
  {
    title: 'Dúvidas Gerais',
    items: [
      { q: 'Posso cancelar meu pedido?', a: 'Sim, enquanto o pedido ainda não foi enviado. Entre em contato pelo WhatsApp assim que possível.' },
      { q: 'A água bacteriostática vem inclusa?', a: 'Sim. A água bacteriostática para reconstituição está incluída gratuitamente em todos os pedidos.' },
      { q: 'Como acompanho meu pedido?', a: 'Após a confirmação, você receberá atualizações de status diretamente pelo WhatsApp.' },
    ]
  },
];
function formatDose(val, unit) {
  unit = unit || 'mcg';
  const rounded = parseFloat(val.toPrecision(10));
  if (unit === 'mcg') {
    if (rounded >= 1000) {
      const mg = rounded / 1000;
      return (Number.isInteger(mg) ? mg.toFixed(0) : mg.toFixed(2)) + ' mg';
    }
    return (Number.isInteger(rounded) ? rounded.toFixed(0) : parseFloat(rounded.toFixed(2))) + ' mcg';
  }
  return parseFloat(rounded.toFixed(4)) + ' ' + unit;
}


function SyringeViz({ uiRaw, syringeSize, dose, doseLabel }) {
  const W = 640, H = 130;
  const padL = 20, padR = 20;
  const rulerX = padL, rulerW = W - padL - padR;
  const rulerY = 38, rulerH = 48;   // taller ruler box
  const overLimit = uiRaw > syringeSize;
  const fillColor = overLimit ? '#e74c3c' : '#3b9eff';
  const pct   = Math.min(1, uiRaw / syringeSize);
  const fillW = rulerW * pct;

  // ticks — 3 levels
  const ticks = [];
  const stepMin = syringeSize <= 50 ? 1 : 2;
  const stepMid = syringeSize <= 50 ? 5 : 10;
  const stepMaj = syringeSize <= 50 ? 10 : 20;
  for (let t = 0; t <= syringeSize; t += stepMin) {
    const x     = rulerX + (t / syringeSize) * rulerW;
    const major = t % stepMaj === 0;
    const mid   = !major && t % stepMid === 0;
    ticks.push({ t, x, major, mid });
  }

  // tick heights (from bottom of ruler box upwards)
  const hMaj = rulerH,       yMaj = rulerY;
  const hMid = rulerH * 0.6, yMid = rulerY + rulerH * 0.4;
  const hMin = rulerH * 0.3, yMin = rulerY + rulerH * 0.7;

  return (
    <div style={{marginTop:20}}>
      {overLimit ? (
        <div style={{background:'rgba(231,76,60,0.1)',border:'1px solid rgba(231,76,60,0.4)',borderRadius:8,padding:'8px 14px',fontSize:'0.78rem',color:'#e74c3c',marginBottom:10}}>
          ⚠️ Dose excede a seringa de {syringeSize} UI — use uma seringa maior
        </div>
      ) : (
        <div style={{fontSize:'0.88rem',color:'var(--text)',marginBottom:10}}>
          Para ter uma dose de <strong style={{color:'var(--accent)'}}>{doseLabel}</strong> puxe a seringa até <strong style={{color:fillColor}}>{uiRaw.toFixed(1)} UI</strong>
        </div>
      )}
      <div style={{background:'#ffffff',borderRadius:10,padding:'14px 16px',boxShadow:'0 2px 12px rgba(0,0,0,0.18)'}}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block',overflow:'visible'}}>
          {/* White ruler body */}
          <rect x={rulerX} y={rulerY} width={rulerW} height={rulerH} rx={3} fill="#ffffff" stroke="#c8cdd2" strokeWidth={1.5} />

          {/* Blue fill */}
          <clipPath id="rc">
            <rect x={rulerX} y={rulerY} width={rulerW} height={rulerH} rx={3} />
          </clipPath>
          <rect x={rulerX} y={rulerY} width={Math.max(0, fillW)} height={rulerH} fill={fillColor} opacity={0.85} clipPath="url(#rc)" />

          {/* Plunger stopper rectangle */}
          <rect x={rulerX + fillW - 5} y={rulerY - 4} width={10} height={rulerH + 8} rx={3} fill={overLimit ? '#e74c3c' : '#1a6abf'} />

          {/* Ticks drawn ON TOP of fill */}
          {ticks.map(({t, x, major, mid}) => {
            if (major) return (
              <g key={t}>
                <line x1={x} y1={rulerY} x2={x} y2={rulerY + rulerH}
                      stroke="#222" strokeWidth={1.8} />
                <text x={x} y={rulerY + rulerH + 22} textAnchor="middle"
                      fill="#222" fontSize={16} fontFamily="Arial,sans-serif" fontWeight="700">{t}</text>
              </g>
            );
            if (mid) return (
              <line key={t} x1={x} y1={yMid} x2={x} y2={rulerY + rulerH}
                    stroke="#555" strokeWidth={1.4} />
            );
            return (
              <line key={t} x1={x} y1={yMin} x2={x} y2={rulerY + rulerH}
                    stroke="#999" strokeWidth={0.9} />
            );
          })}

          {/* Border on top of everything */}
          <rect x={rulerX} y={rulerY} width={rulerW} height={rulerH} rx={3} fill="none" stroke="#aab0b8" strokeWidth={1.5} />
        </svg>
      </div>
    </div>
  );
}

function CalcView() {
  const { useState: us, useRef: ur } = React;
  const [search, setSearch] = us('');
  const [dropOpen, setDropOpen] = us(false);
  const [selId, setSelId] = us(null);
  const [dose, setDose] = us(null);
  const [freq, setFreq] = us(null);
  const [vial, setVial] = us(null);
  const [bacMl, setBacMl] = us(2);
  const [manualDose, setManualDose] = us('');
  const [syringeSize, setSyringeSize] = us(100);
  const [manualVial, setManualVial] = us('');
  const wrapRef = ur(null);

  const selPep = selId ? CALC_PEP_DB[selId] : null;
  const db     = selId ? CALC_DOSES[selId] : null;

  const allPeps = Object.entries(CALC_PEP_DB);
  const filtered = search.trim().length > 0
    ? allPeps.filter(([id, p]) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.tags||[]).join(' ').toLowerCase().includes(search.toLowerCase()))
    : allPeps;

  function selectPep(id) {
    setSelId(id);
    setSearch('');
    setDropOpen(false);
    setDose(null);
    setFreq(null);
    setManualDose('');
    setManualVial('');
    const d = CALC_DOSES[id];
    if (d && !d.topical) {
      setFreq(d.freqs[d.dfi]);
      setVial(d.vials[0]);
    } else {
      setVial(null);
    }
  }

  function clearSel() {
    setSelId(null); setSearch(''); setDose(null); setFreq(null); setVial(null); setManualDose(''); setManualVial('');
  }

  // Detecta se o peptídeo usa escala mg (doses >= 1000 mcg)
  const isMgScale = db && db.doses && db.doses.every(d => d >= 500);

  // Formata mostrando mg + mcg quando valor é grande o suficiente
  function fmtDual(val) {
    if (!val && val !== 0) return '—';
    const unit = db?.unit || 'mcg';
    if (unit === 'mcg' && val >= 100) {
      const mg = val / 1000;
      const mgStr = (Number.isInteger(mg * 100) ? parseFloat(mg.toFixed(1)) : parseFloat(mg.toFixed(2))) + ' mg';
      const mcgStr = Math.round(val) + ' mcg';
      return mgStr + ' · ' + mcgStr;
    }
    return formatDose(val, unit);
  }

  // Results calc
  let results = null;
  let recon = null;
  if (dose && freq && !db?.topical) {
    const unit = db?.unit || 'mcg';
    const daily = dose * freq.t;
    results = {
      doseAppl: fmtDual(dose),
      freqLabel: freq.l,
      daily: fmtDual(daily),
      weekly: fmtDual(daily * 7),
      monthly: fmtDual(daily * 30),
    };
    if (vial) {
      const vialMcg = vial * 1000;
      const concMcgMl = vialMcg / (parseFloat(bacMl) || 2);
      const volMl = dose / concMcgMl;
      const volUl = volMl * 1000;
      const ui = volMl * 100;
      const daysPerVial = vialMcg / (dose * freq.t);
      recon = {
        conc: concMcgMl >= 1000 ? (concMcgMl/1000).toFixed(2)+' mg/mL' : concMcgMl.toFixed(0)+' mcg/mL',
        vol: volUl >= 1000 ? volMl.toFixed(3)+' mL' : volUl.toFixed(1)+' µL',
        ui: ui.toFixed(1)+' UI',
        uiRaw: ui,
        duration: daysPerVial >= 1 ? Math.round(daysPerVial)+' dias' : Math.round(daysPerVial*24)+' horas',
        barPct: Math.min(100, (daysPerVial/90)*100),
      };
    }
  }

  return (
    <div className="calc-body">
      {/* LEFT */}
      <div>
        {/* Peptide selector */}
        <div className="calc-card">
          <div className="calc-card-title">🔬 Peptídeo</div>
          <div className="calc-search-wrap" ref={wrapRef}>
            <input className="calc-input" placeholder="Buscar peptídeo..."
              value={search}
              onChange={e=>{ setSearch(e.target.value); setDropOpen(true); }}
              onFocus={()=>setDropOpen(true)}
            />
            {dropOpen && (
              <div className="calc-dropdown">
                {filtered.length === 0
                  ? <div className="calc-drop-item" style={{color:'var(--muted)'}}>Nenhum resultado</div>
                  : filtered.slice(0,14).map(([id, p]) => (
                    <div key={id} className="calc-drop-item" onMouseDown={()=>selectPep(id)}>
                      <span>{p.name}</span>
                      <em>{(p.tags||[])[0]||''}</em>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
          {selPep && (
            <div className="calc-chip-selected">
              <div>
                <div className="calc-chip-name">{selPep.name}</div>
                <div className="calc-chip-cat">{(selPep.tags||[]).join(' · ')}</div>
              </div>
              <button className="calc-chip-clear" onClick={clearSel}>×</button>
            </div>
          )}
        </div>

        {/* Dose */}
        {selId && db && !db.topical && (
          <div className="calc-card">
            <div className="calc-card-title">💉 Dose por Aplicação</div>
            <div className="calc-label">Doses mais comuns:</div>
            <div className="chips-grid">
              {db.doses.map(d => (
                <button key={d} className={`calc-chip-btn ${dose===d&&!manualDose?'active':''}`}
                  onClick={()=>{ setDose(d); setManualDose(''); }}>
                  {formatDose(d, db.unit)}
                </button>
              ))}
            </div>
            <div className="calc-manual-wrap">
              <input type="number" className="calc-manual-input" placeholder="Outra dose..."
                value={manualDose} min="0"
                onChange={e=>{ setManualDose(e.target.value); const v=parseFloat(e.target.value); if(!isNaN(v)&&v>0) setDose(isMgScale ? v * 1000 : v); }}
              />
              <div className="calc-manual-unit">{isMgScale ? 'mg' : (db.unit||'mcg')}</div>
            </div>
          </div>
        )}

        {/* Topical notice */}
        {selId && db && db.topical && (
          <div className="calc-topical-notice">
            🧴 <strong>Peptídeo tópico.</strong> Concentração típica: <strong>{db.conc}</strong>. Não há dose em mcg por aplicação — use na seção de reconstituição para calcular a concentração do seu veículo cosmético <em>({db.veh})</em>.
          </div>
        )}

        {/* Freq */}
        {selId && db && !db.topical && dose && (
          <div className="calc-card">
            <div className="calc-card-title">⏱️ Frequência</div>
            <div className="chips-grid">
              {db.freqs.map((f, i) => (
                <button key={i} className={`calc-chip-btn ${freq?.l===f.l?'active':''}`}
                  onClick={()=>setFreq(f)}>
                  {f.l}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div>
        {!results && (
          <div className="calc-card">
            <div className="calc-placeholder">
              <div className="calc-placeholder-icon">🧮</div>
              <div className="calc-placeholder-text">Selecione um peptídeo e configure a dose para ver os cálculos</div>
            </div>
          </div>
        )}

        {results && (
          <div className="calc-card">
            <div className="calc-card-title">📊 Resultado</div>

            <div className="calc-result-row">
              <span className="calc-result-label">Dose por aplicação</span>
              <span className="calc-result-value accent">{results.doseAppl}</span>
            </div>
            <div className="calc-result-row">
              <span className="calc-result-label">Frequência</span>
              <span className="calc-result-value">{results.freqLabel}</span>
            </div>
            <div className="calc-result-row">
              <span className="calc-result-label">Dose diária total</span>
              <span className="calc-result-value">{results.daily}</span>
            </div>
            <div className="calc-result-row">
              <span className="calc-result-label">Dose semanal total</span>
              <span className="calc-result-value">{results.weekly}</span>
            </div>
            <div className="calc-result-row">
              <span className="calc-result-label">Dose mensal (30 dias)</span>
              <span className="calc-result-value">{results.monthly}</span>
            </div>

            {/* Reconstitution */}
            <div className="calc-recon">
              <div className="calc-recon-title">💧 Reconstituição com Água Bacteriostática</div>

              <div className="calc-label">Tamanho do frasco:</div>
              <div className="chips-grid">
                {db.vials.map(v => (
                  <button key={v} className={`calc-chip-btn ${vial===v&&!manualVial?'active':''}`}
                    onClick={()=>{ setVial(v); setManualVial(''); }}>
                    {v} mg
                  </button>
                ))}
              </div>
              <div className="calc-manual-wrap" style={{marginBottom:12}}>
                <input type="number" className="calc-manual-input" placeholder="Outro tamanho..."
                  value={manualVial} min="0" step="0.5"
                  onChange={e=>{ setManualVial(e.target.value); const v=parseFloat(e.target.value); if(!isNaN(v)&&v>0) setVial(v); }}
                />
                <div className="calc-manual-unit">mg</div>
              </div>

              <div className="calc-bac-row">
                <span className="calc-bac-label">Volume de BAC water:</span>
                <input type="text" inputMode="decimal" className="calc-bac-input" value={bacMl}
                  onChange={e=>{ const v = e.target.value; if (/^\d*\.?\d*$/.test(v)) setBacMl(v); }}
                  onBlur={e=>{ const v = parseFloat(e.target.value); if (!v||v<0.1) setBacMl(2); else setBacMl(v); }} />
                <span className="calc-manual-unit">mL</span>
              </div>

              {recon && (
                <div className="calc-recon-result">
                  <div className="calc-recon-row">
                    <span className="calc-recon-key">Concentração</span>
                    <span className="calc-recon-val">{recon.conc}</span>
                  </div>
                  <div className="calc-recon-row">
                    <span className="calc-recon-key">Volume por dose</span>
                    <span className="calc-recon-val">{recon.vol}</span>
                  </div>
                  <div className="calc-recon-row">
                    <span className="calc-recon-key">Unidades na seringa (UI)</span>
                    <span className="calc-recon-val">{recon.ui}</span>
                  </div>
                  <div className="calc-recon-row" style={{paddingTop:8,borderTop:'1px solid rgba(255,255,255,0.06)',marginTop:4}}>
                    <span className="calc-recon-key">Duração do frasco</span>
                    <span className="calc-recon-val">{recon.duration}</span>
                  </div>
                  <div className="calc-duration-bar">
                    <div className="calc-duration-fill" style={{width: recon.barPct+'%'}}></div>
                  </div>

                  {/* Syringe Size Selector */}
                  <div style={{marginTop:18,paddingTop:14,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                    <div className="calc-label" style={{marginBottom:8}}>💉 Tamanho da seringa:</div>
                    <div className="chips-grid">
                      {[{v:30,l:'0,3 mL (30 UI)',s:'30 UI'},{v:50,l:'0,5 mL (50 UI)',s:'50 UI'},{v:100,l:'1,0 mL (100 UI)',s:'100 UI'}].map(s => (
                        <button key={s.v} className={`calc-chip-btn syringe-chip ${syringeSize===s.v?'active':''}`} onClick={()=>setSyringeSize(s.v)}>
                          <span className="syringe-chip-full">{s.l}</span>
                          <span className="syringe-chip-short">{s.s}</span>
                        </button>
                      ))}
                    </div>
                    <SyringeViz uiRaw={recon.uiRaw} syringeSize={syringeSize} doseLabel={results.doseAppl} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROTOCOL BLOCK */}
        {selId && PROTOCOLS[selId] && (
          <div className="calc-card" style={{marginTop:16}}>
            <div className="calc-protocol">
              <div className="calc-disclaimer">⚠️ As informações abaixo são de caráter exclusivamente educativo e não constituem prescrição médica, diagnóstico ou recomendação de uso. Consulte sempre um profissional de saúde qualificado antes de utilizar qualquer substância.</div>
              <div className="calc-protocol-title">Protocolos e Boas Práticas</div>
              <div className="calc-protocol-grid">
                <div className="calc-prot-item">
                  <div className="calc-prot-label">Dose Mínima</div>
                  <div className="calc-prot-val"><span>{PROTOCOLS[selId].doseMin}</span></div>
                </div>
                <div className="calc-prot-item">
                  <div className="calc-prot-label">Dose Máxima</div>
                  <div className="calc-prot-val"><span>{PROTOCOLS[selId].doseMax}</span></div>
                </div>
                <div className="calc-prot-item">
                  <div className="calc-prot-label">Frequência</div>
                  <div className="calc-prot-val">{PROTOCOLS[selId].freq}</div>
                </div>
                <div className="calc-prot-item">
                  <div className="calc-prot-label">Duração do Ciclo</div>
                  <div className="calc-prot-val">{PROTOCOLS[selId].ciclo}</div>
                </div>
              </div>
              <div className="calc-prot-item" style={{marginBottom:8}}>
                <div className="calc-prot-label">Como Iniciar</div>
                <div className="calc-prot-val" style={{marginTop:4}}>{PROTOCOLS[selId].inicio}</div>
              </div>
              <div className="calc-prot-note">💡 {PROTOCOLS[selId].nota}</div>

              {/* ALERTS BLOCK */}
              {ALERTS[selId] && (
                <div style={{marginTop:14}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.58rem",color:"var(--accent)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
                    <span style={{display:"inline-block",width:3,height:10,background:"rgba(255,120,80,0.8)",borderRadius:2}}></span>
                    Cuidados e Alertas
                  </div>

                  <div style={{marginBottom:10}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.58rem",color:"#9aaa88",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>🔬 Exames para Monitorar</div>
                    {ALERTS[selId].exames.map((e,i) => (
                      <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:4,fontSize:"0.78rem",color:"#a8bfc9"}}>
                        <span style={{color:"var(--accent)",marginTop:2,flexShrink:0}}>·</span>{e}
                      </div>
                    ))}
                  </div>

                  <div style={{marginBottom:10}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.58rem",color:"#9aaa88",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>🚫 Contraindicações</div>
                    {ALERTS[selId].contraindicacoes.map((c,i) => (
                      <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:4,fontSize:"0.78rem",color:"#a8bfc9"}}>
                        <span style={{color:"rgba(255,80,80,0.7)",marginTop:2,flexShrink:0}}>·</span>{c}
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.58rem",color:"#9aaa88",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>⚠️ Alertas de Uso</div>
                    {ALERTS[selId].alertas.map((a,i) => (
                      <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:4,fontSize:"0.78rem",color:"#a8bfc9"}}>
                        <span style={{color:"rgba(255,160,30,0.8)",marginTop:2,flexShrink:0}}>·</span>{a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Senha admin verificada server-side via Edge Function (hash nunca exposto no código)

function PortalView({ po, preorders, persistPreorders, cancelPreorderByToken, showToast, setPortalToken, setView, orders, stock, persistOrders, saveStock, setStock, setCheckoutOpen, setCheckout, setMyName }) {
  const statusInfo = {
    pending:   {icon:'⏳', label:'Aguardando estoque',  color:'#ffaa00'},
    notified:  {icon:'🔔', label:'Produto disponível!', color:'#00b4d8'},
    completed: {icon:'✅', label:'Concluída',           color:'#6bcb77'},
    expired:   {icon:'⏰', label:'Expirada',           color:'#888'},
    cancelled: {icon:'✕', label:'Cancelada',           color:'#ff5050'},
  };
  const si = statusInfo[po.status || 'pending'];
  const isActive = ['pending','notified'].includes(po.status || 'pending');
  const canFinish = po.status === 'notified';

  const [editQty, setEditQty] = React.useState(po.qty);
  const [editMode, setEditMode] = React.useState(false);

  const [timeLeft, setTimeLeft] = React.useState(() => {
    if (po.status !== 'notified' || !po.notifiedAt) return null;
    return Math.max(0, 12*60*60*1000 - (Date.now() - po.notifiedAt));
  });
  React.useEffect(() => {
    if (!timeLeft) return;
    const t = setInterval(() => setTimeLeft(ms => {
      const next = ms - 1000;
      if (next <= 0) { clearInterval(t); return 0; }
      return next;
    }), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtTime = (ms) => {
    const h = Math.floor(ms/3600000);
    const m = Math.floor((ms%3600000)/60000);
    const s = Math.floor((ms%60000)/1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const reducePreorderQty = (token, qty) => {
    const original = preorders.find(x => x.token === token);
    if (!original || qty >= original.qty) return; // nunca permite aumentar
    persistPreorders(preorders.map(x => x.token === token ? {...x, qty: Math.max(1, qty)} : x));
  };

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{maxWidth:480,width:'100%',background:'var(--card)',borderRadius:16,overflow:'hidden',boxShadow:'0 8px 40px rgba(0,0,0,0.5)'}}>
        <div style={{background:'linear-gradient(135deg,rgba(0,229,195,0.12),rgba(0,229,195,0.04))',padding:'28px 28px 20px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{fontSize:"0.65rem",fontFamily:"'Space Mono',monospace",color:"var(--muted)",letterSpacing:'0.08em',marginBottom:8}}>VANGUARD PEPTIDES · PORTAL DE RESERVA</div>
          <div style={{fontSize:"1.5rem",fontWeight:800,marginBottom:4}}>Minha Reserva</div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.65rem",color:"var(--muted)"}}>#{String(po.id).slice(-8)}</div>
        </div>
        <div style={{padding:'24px 28px',display:'flex',flexDirection:'column',gap:18}}>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:`rgba(0,0,0,0.2)`,borderRadius:10,border:`1px solid ${si.color}40`}}>
            <span style={{fontSize:'1.4rem'}}>{si.icon}</span>
            <div>
              <div style={{fontWeight:700,color:si.color}}>{si.label}</div>
              {canFinish && timeLeft !== null && (
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.65rem",color:timeLeft<3600000?"#ff5050":"var(--muted)"}}>
                  Expira em: {fmtTime(timeLeft)}
                </div>
              )}
            </div>
          </div>
          <div style={{background:'rgba(255,255,255,0.03)',borderRadius:10,padding:'14px 16px'}}>
            <div style={{fontSize:"0.7rem",color:"var(--muted)",marginBottom:4}}>PRODUTO</div>
            <div style={{fontWeight:700,fontSize:"1.05rem"}}>{po.productName}</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.75rem",color:"var(--accent)",marginTop:4}}>
              {editMode ? (
                <span style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{color:"var(--muted)"}}>Quantidade:</span>
                  <input type="number" min="1" max={po.qty} value={editQty}
                    onChange={e=>setEditQty(Math.min(po.qty, Math.max(1, parseInt(e.target.value)||1)))}
                    style={{width:60,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:6,color:'#fff',padding:'3px 8px',fontFamily:"'Space Mono',monospace",fontSize:'0.75rem'}} />
                  <button onClick={()=>{ reducePreorderQty(po.token, editQty); setEditMode(false); showToast('Quantidade atualizada','success'); }}
                    style={{padding:'3px 10px',background:'var(--accent)',border:'none',borderRadius:6,color:'#000',fontWeight:700,fontSize:'0.68rem',cursor:'pointer'}}>OK</button>
                  <button onClick={()=>setEditMode(false)} style={{padding:'3px 10px',background:'transparent',border:'1px solid rgba(255,255,255,0.2)',borderRadius:6,color:'var(--muted)',fontSize:'0.68rem',cursor:'pointer'}}>✕</button>
                </span>
              ) : (
                <span style={{display:'flex',alignItems:'center',gap:8}}>
                  <span>×{po.qty} unidade(s)</span>
                  {isActive && <button onClick={()=>setEditMode(true)} style={{padding:'2px 10px',background:'transparent',border:'1px solid rgba(255,255,255,0.15)',borderRadius:6,color:'var(--muted)',fontSize:'0.65rem',cursor:'pointer'}}>✏️ Reduzir</button>}
                </span>
              )}
            </div>
          </div>
          <div style={{background:'rgba(255,255,255,0.03)',borderRadius:10,padding:'14px 16px'}}>
            <div style={{fontSize:"0.7rem",color:"var(--muted)",marginBottom:6}}>DADOS DA RESERVA</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div><div style={{fontSize:"0.65rem",color:"var(--muted)"}}>Nome</div><div style={{fontSize:"0.9rem",fontWeight:600}}>{po.name}</div></div>
              <div><div style={{fontSize:"0.65rem",color:"var(--muted)"}}>WhatsApp</div><div style={{fontSize:"0.9rem",fontFamily:"'Space Mono',monospace"}}>{po.whatsapp}</div></div>
              <div><div style={{fontSize:"0.65rem",color:"var(--muted)"}}>Data da reserva</div><div style={{fontSize:"0.85rem",fontFamily:"'Space Mono',monospace"}}>{po.date}</div></div>
              <div><div style={{fontSize:"0.65rem",color:"var(--muted)"}}>Status</div><div style={{fontSize:"0.85rem",fontFamily:"'Space Mono',monospace",color:si.color}}>{si.label}</div></div>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {canFinish && (
              <button onClick={async (e)=>{
                if (e.currentTarget.disabled) return;
                e.currentTarget.disabled = true;
                // Adicionar ao carrinho
                const _now = new Date();
                const _pad = n=>String(n).padStart(2,'0');
                const _rand = Math.random().toString(36).slice(2,6);
                const _oid = `${_now.getFullYear()}${_pad(_now.getMonth()+1)}${_pad(_now.getDate())}${_pad(_now.getHours())}${_pad(_now.getMinutes())}${_pad(_now.getSeconds())}_${_rand}`;
                const newOrder = { id: _oid, peptideId: po.productId, buyerName: po.name, qty: po.qty, createdAt: new Date().toISOString() };
                persistOrders([...orders.filter(o=>!o._supabase), newOrder]);
                // Decremento atômico via RPC
                if (sb && stock[po.productId] != null) {
                  const { data: newQty2, error } = await sb.rpc('decrement_stock', {
                    p_product_id: po.productId, p_qty: po.qty
                  });
                  if (error || newQty2 === -1) {
                    showToast('Estoque insuficiente no momento 😅', 'error');
                    return;
                  }
                  const ns = { ...stock, [po.productId]: newQty2 };
                  localStorage.setItem('vg-stock', JSON.stringify(ns));
                  setStock(ns);
                } else {
                  const ns = {...stock};
                  if (ns[po.productId] != null) ns[po.productId] = Math.max(0, ns[po.productId] - po.qty);
                  saveStock(ns);
                  setStock(ns);
                }
                // Sincronizar nome para myOrders filtrar corretamente
                setMyName(po.name);
                localStorage.setItem('vg-nome', po.name);
                // Marcar reserva como concluída
                persistPreorders(preorders.map(x=>x.id===po.id?{...x,status:'completed'}:x));
                setPortalToken(null);
                window.history.replaceState({},'',window.location.pathname);
                // Ir para carrinho e abrir checkout
                setView('cart');
                // Layout novo: o #/carrinho abre a tela de checkout da loja nova (o modal antigo fica fechado)
                setTimeout(()=>{ if (setCheckout) setCheckout(c=>({...c, nomeCompleto: c.nomeCompleto || po.name})); if (!IS_NOVO) setCheckoutOpen(true); }, 100);
                showToast('Produto adicionado! Preencha seus dados para finalizar 🛒','success');
              }}
                style={{padding:'14px',background:'linear-gradient(135deg,var(--accent),#00c896)',border:'none',borderRadius:10,color:'#000',fontWeight:800,fontSize:'1rem',cursor:'pointer',letterSpacing:'0.03em'}}>
                🛒 Concluir Compra
              </button>
            )}
            {isActive && (
              <button onClick={()=>{ if(window.confirm('Tem certeza que deseja cancelar esta reserva?')) { cancelPreorderByToken(po.token); showToast('Reserva cancelada','info'); } }}
                style={{padding:'10px',background:'transparent',border:'1px solid rgba(255,80,80,0.35)',borderRadius:10,color:'#ff5050',fontWeight:600,fontSize:'0.85rem',cursor:'pointer'}}>
                Cancelar reserva
              </button>
            )}
            <button onClick={()=>{ setPortalToken(null); window.history.replaceState({},'',window.location.pathname); }}
              style={{padding:'10px',background:'transparent',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'var(--muted)',fontSize:'0.85rem',cursor:'pointer'}}>
              ← Voltar à loja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('[ErrorBoundary]', error, info); }
  render() {
    if (this.state.hasError) {
      return React.createElement('div', {style:{color:'#00e5c3',fontFamily:'Space Mono,monospace',padding:40,textAlign:'center'}},
        React.createElement('div', {style:{fontSize:'2rem',marginBottom:16}}, '⚠️'),
        React.createElement('div', {style:{marginBottom:8}}, 'Erro ao carregar a página'),
        React.createElement('div', {style:{fontSize:'0.7rem',color:'#aaa',marginBottom:24}}, this.state.error?.message || ''),
        React.createElement('button', {
          onClick:()=>window.location.reload(),
          style:{background:'rgba(0,229,195,0.15)',border:'1px solid #00e5c3',color:'#00e5c3',padding:'10px 24px',borderRadius:6,cursor:'pointer',fontFamily:'inherit'}
        }, '↺ RECARREGAR')
      );
    }
    return this.props.children;
  }
}

// ── NOVO LAYOUT (vanguardpep.com/novo) ──────────────────────────────────────
// Mesma lógica do site (carrinho, estoque, cupom, pedido), só a aparência muda.
const NV_SLUG = (window.location.pathname.match(/^\/p\/([^/]+)/) || [])[1] ? decodeURIComponent(window.location.pathname.match(/^\/p\/([^/]+)/)[1]).toLowerCase() : null;
// ROLLBACK: trocar NOVO_NO_INICIO para false (e dar push) faz "/" voltar ao layout antigo;
// /novo e /p/<código> continuam no novo. O layout antigo fica sempre em /antigo/ (rota de segurança).
const NOVO_NO_INICIO = true;
const IS_ANTIGO = /^\/antigo(\/|$)/.test(window.location.pathname);
// Loja nova em "/" (com NOVO_NO_INICIO), em /novo e nas páginas de produto /p/<código>
const IS_NOVO = !IS_ANTIGO && (NOVO_NO_INICIO || /\/novo\/?$/.test(window.location.pathname) || !!NV_SLUG);
const NV_HOME = NOVO_NO_INICIO ? '/' : '/novo/';
// /novo virou o site principal: dist/novo/index.html já redireciona; isto cobre cópias em cache
if (NOVO_NO_INICIO && /^\/novo\/?$/.test(window.location.pathname)) {
  try { window.history.replaceState(window.history.state, '', '/' + window.location.search + window.location.hash); } catch {}
}
const nvSlugOf = p => String(p.sku || p.id).toLowerCase();
// Links antigos com hash (#/produto/<id>, #/faq, #/carrinho...) abrem a tela equivalente do layout novo
const NV_HASH_SCREENS = { faq: 'faq', calcular: 'calc', calc: 'calc', blog: 'artigos', artigos: 'artigos', carrinho: 'checkout', cart: 'checkout', frete: 'frete', rastrear: 'rastrear', pedido: 'rastrear' };
const nvStateFromUrl = () => {
  if (/^\/p\//.test(window.location.pathname))
    return { s: 'produto', pid: decodeURIComponent(window.location.pathname.split('/')[2] || '').toLowerCase() };
  const h = window.location.hash.replace(/^#\/?/, '');
  if (h.startsWith('produto/')) return { s: 'produto', pid: decodeURIComponent(h.slice(8)) };
  return NV_HASH_SCREENS[h] ? { s: NV_HASH_SCREENS[h] } : {};
};

// Combos (BUNDLES): o preço "cheio" é a soma dos preços atuais; o desconto do combo
// só vale enquanto todos os itens estiverem no carrinho (1 de cada por combo aplicado).
function nvBundleFull(b, products, effectivePrice) {
  const ps = b.items.map(id => products.find(p => p.id === id));
  if (ps.some(p => !p)) return null;
  return ps.reduce((s, p) => s + effectivePrice(p), 0);
}
// Corpo dos artigos: aceita texto puro ou HTML simples; só tags de texto passam (nada de script/atributos)
const NV_ART_TAGS = { H2: 'h3', H3: 'h3', H4: 'h3', P: 'p', UL: 'ul', OL: 'ol', LI: 'li', STRONG: 'strong', B: 'strong', EM: 'em', I: 'em', BR: 'br', BLOCKQUOTE: 'blockquote' };
function nvArticleBody(body) {
  const src = String(body || '');
  if (!/<[a-z][\s\S]*>/i.test(src)) {
    return src.split(/\n\s*\n/).map((t, i) => t.trim() && <p key={i}>{t.trim()}</p>);
  }
  let doc;
  try { doc = new DOMParser().parseFromString(src, 'text/html'); } catch { return <p>{src.replace(/<[^>]+>/g, '')}</p>; }
  const walk = (node, key) => {
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1) return null;
    const kids = Array.from(node.childNodes).map((c, i) => walk(c, i));
    const tag = NV_ART_TAGS[node.tagName];
    if (tag === 'br') return <br key={key} />;
    return tag ? React.createElement(tag, { key }, kids) : <React.Fragment key={key}>{kids}</React.Fragment>;
  };
  return Array.from(doc.body.childNodes).map((c, i) => walk(c, i)).filter(x => !(typeof x === 'string' && !x.trim()));
}
const nvReadMin = body => Math.max(1, Math.round(String(body || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 200));

function calcBundleDiscount(bundleIds, cart, products, effectivePrice, bundles) {
  const have = {};
  cart.forEach(o => { if (!o._packId) have[o.peptideId] = (have[o.peptideId] || 0) + (o.qty || 0); });
  const applied = [];
  for (const id of bundleIds || []) {
    const b = (bundles || []).find(x => x.id === id);
    if (!b || b.active === false || !b.items.every(i => (have[i] || 0) >= 1)) continue;
    const full = nvBundleFull(b, products, effectivePrice);
    if (full === null || full <= b.price) continue; // igual ao servidor: combo sem desconto não conta
    b.items.forEach(i => { have[i]--; });
    applied.push({ id: b.id, name: b.name, discount: full - b.price });
  }
  return { total: applied.reduce((s, x) => s + x.discount, 0), applied };
}

const NOVO_CSS = `
.novo-mode>nav,.novo-mode>.hero-banner,.novo-mode>.app,.novo-mode>.site-footer,.novo-mode>.mobile-bottom-nav{display:none!important}
.nv{--bg:#050a0e;--bg2:#0a1219;--bg3:#0f1c28;--ac:#00e5c3;--tx:#e2eaf0;--mu:#a9bfcb;--mu2:#7d9aa8;--ln:rgba(0,229,195,.12);--warn:#ffc46b;--err:#ff9f80;
  min-height:100vh;background:var(--bg);color:var(--tx);font-family:'DM Sans',sans-serif;position:relative;z-index:1}
.nv *{box-sizing:border-box}
.nv button,.nv input{font-family:inherit}
.nv a{color:var(--ac);text-decoration:none}
.nv-wrap{max-width:1100px;margin:0 auto;padding:0 16px}
.nv-top{position:sticky;top:0;z-index:20;background:rgba(5,10,14,.94);border-bottom:1px solid var(--ln);backdrop-filter:blur(6px)}
.nv-top .nv-wrap{display:flex;align-items:center;gap:8px;height:60px}
.nv .nv-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:20px;letter-spacing:.5px;background:none;border:none;color:var(--tx);cursor:pointer;padding:0}
.nv-links{display:none;gap:4px;margin-left:16px}
.nv-links button{height:40px;padding:0 12px;border:none;background:none;color:var(--mu);font-size:14px;cursor:pointer;border-radius:10px}
.nv-links button:hover{color:var(--tx)}
.nv-ico{width:44px;height:44px;border-radius:12px;border:none;background:transparent;color:var(--tx);display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative}
.nv-cartbtn{background:rgba(0,229,195,.1);color:var(--ac)}
.nv-badge{position:absolute;top:4px;right:4px;min-width:18px;height:18px;border-radius:9px;background:var(--ac);color:#04110e;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px}
.nv-strip{display:flex;justify-content:space-between;gap:8px;padding:10px 16px;background:var(--bg2);font-size:12px;color:var(--mu);max-width:1100px;margin:0 auto}
.nv-h1{font-family:'Syne',sans-serif;font-weight:800;font-size:30px;line-height:1.08;letter-spacing:-.5px;margin:0}
.nv-sub{margin:0;font-size:15px;line-height:1.45;color:var(--mu)}
.nv-search{display:flex;align-items:center;gap:10px;height:48px;padding:0 14px;border-radius:14px;background:var(--bg3);border:1px solid var(--ln);color:var(--mu2)}
.nv-search input{flex:1;min-width:0;height:100%;border:none;outline:none;background:transparent;color:var(--tx);font-size:16px}
.nv-chips{display:flex;gap:8px;overflow-x:auto;padding:12px 0;scrollbar-width:none}
.nv-chip{flex-shrink:0;height:40px;padding:0 16px;border-radius:20px;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;background:transparent;color:#c7d6de;border:1px solid rgba(0,229,195,.2)}
.nv-chip.on{background:var(--ac);color:#04110e;border-color:var(--ac)}
.nv-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding-bottom:24px}
.nv-card{display:flex;flex-direction:column;gap:10px;padding:0 0 10px;border-radius:16px;background:var(--bg2);border:1px solid rgba(0,229,195,.1);overflow:hidden;min-width:0}
.nv-ph{display:flex;align-items:center;justify-content:center;width:100%;color:rgba(0,229,195,.55);background:radial-gradient(70% 55% at 50% 45%,rgba(0,229,195,.12),transparent 70%),#070d12}
.nv-img{display:block;width:100%;height:auto;background:#050709}
.nv-pic{position:relative;display:block;width:100%;padding:0;border:none;background:#050709;cursor:pointer;overflow:hidden}
.nv-pic .nv-img,.nv-pic .nv-ph{aspect-ratio:4/5;object-fit:cover;object-position:50% 45%}
.nv-card.out .nv-pic .nv-img,.nv-card.out .nv-pic .nv-ph{filter:brightness(.62) saturate(.7)}
.nv-card.out .nv-pic::after{content:'';position:absolute;inset:0;background:rgba(5,10,14,.15)}
.nv-cfoot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 10px}
.nv-cfoot .nv-qty{flex-direction:row;gap:6px}
.nv-cfoot .nv-qty button{width:36px;height:40px}
.nv-cfoot .nv-add{width:44px;height:44px}
.nv-cfoot .nv-res{height:40px;padding:0 10px}
.nv-pdp{display:flex;flex-direction:column;gap:6px}
.nv-pdp-pic{width:100%;max-width:300px;margin:12px auto 0;border-radius:18px;overflow:hidden;border:1px solid var(--ln);background:#050709}
.nv-pdp-pic .nv-img,.nv-pdp-pic .nv-ph{aspect-ratio:4/5;object-fit:cover;object-position:50% 45%}
.nv-thumb{width:48px;height:60px;flex-shrink:0;border-radius:8px;overflow:hidden;border:1px solid var(--ln);background:#050709}
.nv-thumb .nv-img,.nv-thumb .nv-ph{width:100%;height:100%;aspect-ratio:auto;object-fit:cover;object-position:50% 45%}
.nv-thumb .nv-img{transform:scale(1.45)}
.nv-thumb .nv-ph svg{width:60%}
.nv-card.out{border-style:dashed;border-color:rgba(169,191,203,.3)}
.nv-cbody{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.nv-tag{align-self:flex-start;font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#ffb38f}
.nv-name{margin:0;font-size:15px;font-weight:600;line-height:1.25;background:none;border:none;color:var(--tx);padding:0;text-align:left;cursor:pointer}
.nv-desc{font-size:12px;line-height:1.35;color:var(--mu);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.nv-price{font-family:'Space Mono',monospace;font-size:15px;font-weight:700;margin-top:2px}
.nv-old{font-size:12px;font-weight:400;color:var(--mu2);text-decoration:line-through;margin-left:6px}
.nv-add{width:48px;height:48px;flex-shrink:0;border-radius:14px;border:1px solid rgba(0,229,195,.35);background:rgba(0,229,195,.08);color:var(--ac);display:flex;align-items:center;justify-content:center;cursor:pointer}
.nv-res{height:40px;padding:0 12px;flex-shrink:0;border-radius:12px;border:1px solid rgba(255,196,107,.5);background:transparent;color:var(--warn);font-size:13px;font-weight:700;cursor:pointer}
.nv-qty{display:flex;flex-direction:column;align-items:center;gap:2px;flex-shrink:0}
.nv-qty button{width:44px;height:34px;border-radius:10px;font-size:20px;cursor:pointer}
.nv-qty .p{border:none;background:var(--ac);color:#04110e;font-weight:700}
.nv-qty .m{border:1px solid rgba(0,229,195,.3);background:transparent;color:var(--ac)}
.nv-qty span{font-family:'Space Mono',monospace;font-size:13px;font-weight:700}
.nv-bar{position:fixed;left:0;right:0;bottom:0;z-index:15;padding:12px 16px 18px;background:linear-gradient(rgba(5,10,14,0),#050a0e 35%)}
.nv-barbtn{max-width:640px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;width:100%;height:58px;padding:0 20px;border-radius:16px;background:var(--ac);color:#04110e;border:none;cursor:pointer;font-weight:700;font-size:15px}
.nv-btn{height:56px;width:100%;border-radius:16px;border:none;background:var(--ac);color:#04110e;font-size:16px;font-weight:700;cursor:pointer}
.nv-btn:disabled{opacity:.6;cursor:wait}
.nv-btn2{height:50px;width:100%;border-radius:14px;border:1px solid rgba(0,229,195,.35);background:transparent;color:var(--ac);font-size:15px;font-weight:700;cursor:pointer}
.nv-back{display:flex;align-items:center;gap:8px;height:56px}
.nv-back h2{margin:0;font-family:'Syne',sans-serif;font-weight:700;font-size:18px}
.nv-box{padding:14px 16px;border-radius:16px;background:var(--bg2);border:1px solid rgba(0,229,195,.1)}
.nv-sec{display:flex;flex-direction:column;gap:12px;margin-top:22px}
.nv-sech{margin:0;display:flex;align-items:center;gap:10px;font-size:16px;font-weight:700}
.nv-num{width:24px;height:24px;border-radius:12px;background:var(--ac);color:#04110e;font-size:13px;display:flex;align-items:center;justify-content:center}
.nv-f{display:flex;flex-direction:column;gap:6px;min-width:0}
.nv-f label{font-size:13px;color:var(--mu)}
.nv-f input{height:50px;padding:0 14px;border-radius:12px;border:1px solid rgba(0,229,195,.18);background:var(--bg3);color:var(--tx);font-size:16px;outline:none;min-width:0;width:100%}
.nv-f input:focus{border-color:var(--ac)}
.nv-f.err input{border:1.5px solid #ff8a65}
.nv-f .msg{font-size:13px;color:var(--err)}
.nv-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.nv-pay{display:flex;align-items:center;gap:12px;min-height:64px;padding:12px 14px;border-radius:14px;cursor:pointer;background:var(--bg2);border:1.5px solid rgba(0,229,195,.14);color:var(--tx);text-align:left;width:100%}
.nv-pay.on{background:rgba(0,229,195,.08);border-color:var(--ac)}
.nv-dot{width:20px;height:20px;flex-shrink:0;border-radius:10px;border:2px solid #5a7a8a}
.nv-pay.on .nv-dot{border:6px solid var(--ac)}
.nv-row{display:flex;justify-content:space-between;font-size:14px;color:var(--mu)}
.nv-row b{font-family:'Space Mono',monospace;font-weight:400;color:var(--tx)}
.nv-total{display:flex;justify-content:space-between;align-items:baseline;padding-top:8px;border-top:1px solid var(--ln)}
.nv-check{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border-radius:12px;background:var(--bg2);border:1px solid var(--ln);cursor:pointer;font-size:13px;line-height:1.5;color:var(--mu);text-align:left}
.nv-check input{width:20px;height:20px;margin:1px 0 0;accent-color:#00e5c3;flex-shrink:0}
.nv-line{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:14px;padding:6px 0}
.nv-mini{display:flex;align-items:center;gap:4px}
.nv-mini button{width:34px;height:34px;border-radius:9px;border:1px solid rgba(0,229,195,.3);background:transparent;color:var(--ac);font-size:16px;cursor:pointer}
.nv-step{display:flex;gap:12px}
.nv-step i{display:flex;flex-direction:column;align-items:center;font-style:normal}
.nv-step i b{width:14px;height:14px;border-radius:7px;border:2px solid #3d5663}
.nv-step i b.on{background:var(--ac);border-color:var(--ac)}
.nv-step i u{width:2px;height:34px;background:rgba(0,229,195,.2)}
.nv-faq button{width:100%;min-height:56px;padding:14px 0;border:none;background:none;color:var(--tx);display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;font-size:15px;font-weight:600;cursor:pointer}
.nv-sorteio{position:relative;margin:12px auto 0;max-width:1068px;border-radius:16px;overflow:hidden;background:var(--bg2);border:1px solid var(--ln)}
.nv-sorteio-img{display:block;width:100%;padding:0;border:none;background:none;cursor:pointer}
.nv-sorteio-img img{display:block;width:100%;height:auto;aspect-ratio:2/3}
.nv-sorteio-t{display:none}
.nv-sorteio-x{position:absolute;top:8px;right:8px;z-index:2;width:34px;height:34px;border-radius:17px;border:1px solid rgba(255,255,255,.25);background:rgba(5,10,14,.7);color:#fff;font-size:20px;line-height:1;cursor:pointer}
@media (min-width:760px){
.nv-sorteio{display:grid;grid-template-columns:280px 1fr;align-items:center;gap:36px;padding:20px 48px 20px 20px;background:radial-gradient(120% 140% at 100% 0,rgba(0,229,195,.14),transparent 55%),var(--bg2)}
.nv-sorteio-img{width:280px;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.45)}
.nv-sorteio-t{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.nv-sorteio-tag{font-size:12px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--ac)}
.nv-sorteio-t h2{margin:0;font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(24px,2.6vw,32px);line-height:1.1;color:var(--tx)}
.nv-sorteio-t ul{margin:0;padding-left:18px;color:var(--mu);font-size:16px;line-height:1.6}
.nv-sorteio-t b{color:var(--tx)}
.nv-sorteio-t p{margin:0;font-size:13px;color:var(--mu2)}
.nv-sorteio-t .nv-btn{width:auto;padding:0 28px}
}
.nv-pwa{display:flex;align-items:center;gap:10px;margin:12px auto 0;max-width:1068px;padding:10px 12px;border-radius:12px;background:var(--bg2);border:1px solid var(--ln);font-size:13px;color:var(--mu);line-height:1.4}
.nv-pwa b{color:var(--tx)}
.nv-pwa .nv-pwa-t{flex:1;min-width:0}
.nv-pwa button{height:34px;padding:0 12px;border-radius:9px;border:1px solid rgba(0,229,195,.3);background:transparent;color:var(--ac);font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}
.nv-pwa button.nv-pwa-x{width:34px;padding:0;color:var(--mu);border-color:transparent;font-size:18px}
.nv-foot{border-top:1px solid var(--ln);margin-top:40px;padding:24px 0 140px;font-size:13px;color:var(--mu)}
.nv-h2{margin:0;font-family:'Syne',sans-serif;font-weight:700;font-size:20px}
.nv-combos{display:flex;gap:12px;overflow-x:auto;margin:0 -16px;padding:0 16px 6px;scroll-snap-type:x mandatory;scrollbar-width:none}
.nv-combo{flex:0 0 270px;scroll-snap-align:start;padding:16px;border-radius:18px;background:var(--bg2);border:1px solid rgba(0,229,195,.18);display:flex;flex-direction:column;gap:10px;overflow:hidden}
.nv-cimg{display:block;width:calc(100% + 32px);margin:-16px -16px 2px;max-width:none;height:auto;aspect-ratio:5/4;object-fit:cover;background:#050709;border-radius:18px 18px 0 0}
.nv-ccol{display:flex;align-items:flex-end;justify-content:center;overflow:hidden;padding:10% 0 0}
.nv-cvial{position:relative;display:block;flex:0 1 52%;min-width:0;margin:0 -9%;-webkit-mask-image:linear-gradient(90deg,transparent,#000 28%,#000 72%,transparent);mask-image:linear-gradient(90deg,transparent,#000 28%,#000 72%,transparent)}
.nv-cvial .nv-img,.nv-cvial .nv-ph{width:100%;height:auto;aspect-ratio:2/3;object-fit:cover}
.nv-pill{align-self:flex-start;padding:4px 8px;border-radius:6px;background:rgba(0,229,195,.14);color:#5ff3dc;font-size:11px;font-weight:700}
.nv-sku{height:30px;padding:0 8px;border-radius:8px;border:none;background:var(--bg3);font-family:'Space Mono',monospace;font-size:11px;font-weight:700;color:var(--ac);cursor:pointer}
.nv-art{display:flex;flex-direction:column;gap:14px;padding:4px 4px 0}
.nv-art h3{margin:10px 0 0;font-size:19px;font-weight:700;line-height:1.3}
.nv-art p,.nv-art li{margin:0;font-size:16px;line-height:1.65;color:#c7d6de}
.nv-art ul,.nv-art ol{margin:0;padding-left:22px;display:flex;flex-direction:column;gap:6px}
.nv-art strong{color:var(--tx)}
.nv-art blockquote{margin:0;padding-left:14px;border-left:2px solid var(--ln);color:var(--mu)}
.nv-kick{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--ac)}
@property --nv-a{syntax:'<angle>';initial-value:0deg;inherits:false}
.nv-hotrow{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:6px 2px 14px;margin:0 -2px;scrollbar-width:none}
.nv-hotrow::-webkit-scrollbar{display:none}
.nv-hot{flex:0 0 74%;max-width:300px;scroll-snap-align:start;padding:2px;border-radius:20px;position:relative;
  background:conic-gradient(from var(--nv-a),#00e5c3,#00a8ff,#7c5cff,#00e5c3 55%,#00e5c3 75%,#00a8ff);
  box-shadow:0 0 18px rgba(0,229,195,.22);animation:nv-spin 5s linear infinite}
.nv-hotin{position:relative;display:flex;flex-direction:column;gap:10px;height:100%;padding:0 0 12px;border-radius:18px;background:var(--bg2);overflow:hidden;min-width:0}
.nv-hotin.out .nv-pic .nv-img,.nv-hotin.out .nv-pic .nv-ph{filter:brightness(.62) saturate(.7)}
.nv-hotbadge{position:absolute;top:10px;left:10px;z-index:2;padding:5px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.3px;color:#04110e;background:linear-gradient(90deg,#00e5c3,#7ff5e0);box-shadow:0 2px 10px rgba(0,0,0,.4)}
.nv-hotname{font-size:17px;font-weight:700}
@keyframes nv-spin{to{--nv-a:360deg}}
@media (prefers-reduced-motion:reduce){.nv-hot{animation:none}}
.nv-hotrow.nv-marq{scroll-snap-type:none;overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;touch-action:pan-x pan-y;cursor:grab}
.nv-hotrow.nv-marq.drag{cursor:grabbing}
.nv-hotrow.nv-marq .nv-hot{scroll-snap-align:none;flex:0 0 min(74vw,280px);max-width:280px}
@media (min-width:760px){
  .nv-hotrow.nv-marq{display:flex;overflow-x:auto;padding-bottom:14px}
  .nv-hotrow.nv-marq .nv-hot{flex:0 0 290px;max-width:290px}
}
@media (min-width:760px){
  .nv-hotrow{overflow:visible;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));padding-bottom:6px}
  .nv-hot{flex:none;max-width:none}
  .nv-hotname{font-size:19px}
}
.nv-alist{display:flex;flex-direction:column}
.nv-alist button{display:flex;flex-direction:column;gap:4px;padding:14px 0;border:none;border-top:1px solid var(--ln);background:none;color:var(--tx);text-align:left;cursor:pointer;width:100%}
.nv-alist button:last-child{border-bottom:1px solid var(--ln)}
.nv-sheet{position:fixed;inset:0;z-index:40;background:rgba(0,0,0,.6);display:flex;align-items:flex-end;justify-content:center}
.nv-sheet>div{width:100%;max-width:520px;max-height:92vh;overflow:auto;background:var(--bg);border-radius:22px 22px 0 0;border:1px solid var(--ln);padding:20px 16px 24px;display:flex;flex-direction:column;gap:14px}
@media (min-width:760px){
  .nv-links{display:flex}
  .nv-h1{font-size:44px}
  .nv-grid{grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
  .nv-narrow{max-width:640px;margin:0 auto}
}
@media (min-width:900px){
  .nv-pdp-wrap{max-width:980px}
  .nv-pdp{display:grid;grid-template-columns:minmax(0,400px) minmax(0,1fr);column-gap:48px;align-items:start}
  .nv-pdp-pic{margin:18px 0 0;position:sticky;top:80px;max-width:none}
  .nv-pdp-pic .nv-img,.nv-pdp-pic .nv-ph{aspect-ratio:2/3}
  .nv-pdp-info{padding-top:18px}
}`;

// ── ADMIN NO /novo ───────────────────────────────────────────────────────────
// Casca nova (menu lateral em 4 grupos / abas embaixo no celular) por cima das
// abas antigas do admin: a lógica de cada aba é a mesma do site antigo.
// Só vale com IS_NOVO (classe .novo-admin no root); o admin em /antigo/ segue o antigo.
const NVA_GROUPS = [
  { id: 'vendas', label: 'Vendas', icon: <><path d="M5 4h14v16H5z" /><path d="M9 9h6M9 13h6" /></>, items: [
    { id: 'pedidos', label: 'Pedidos', tab: 'pedidos' },
    { id: 'preorders', label: 'Pré-orders', tab: 'preorders' },
    { id: 'clientes', label: 'Clientes', tab: 'clientes' },
    { id: 'cupons', label: 'Cupons', tab: 'cupons' },
  ] },
  { id: 'envios', label: 'Envios', icon: <><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /></>, items: [
    { id: 'etiquetas', label: 'Etiquetas', tab: 'pedidos' }, // pedidos pagos (botão Etiqueta)
    { id: 'remetentes', label: 'Remetentes', action: 'senders' }, // abre o mesmo modal do botão 📮
    { id: 'mapa', label: 'Mapa', tab: 'mapa' },
  ] },
  { id: 'catalogo', label: 'Catálogo', icon: <path d="M9 3h6v4l4 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2l4-12z" />, items: [
    // Itens com `tabs` juntam abas antigas: a casca mostra sub-abas internas (NovaAdminInnerTabs)
    { id: 'produtos', label: 'Produtos e estoque', tab: 'produtos', tabs: [{ tab: 'produtos', label: 'Produtos' }, { tab: 'estoque', label: 'Estoque' }] },
    { id: 'importacao', label: 'Importações', tab: 'importacao' },
    { id: 'combos', label: 'Combos e destaques', tab: 'combos' },
    { id: 'artigos', label: 'Artigos e avisos', tab: 'artigos', tabs: [{ tab: 'artigos', label: 'Artigos' }, { tab: 'avisos', label: 'Avisos' }] },
  ] },
  { id: 'gestao', label: 'Gestão', icon: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>, items: [
    { id: 'financeiro', label: 'Financeiro', tab: 'financeiro' },
    { id: 'config', label: 'Config', tab: 'config' },
  ] },
];
const NVA_ITEMS = NVA_GROUPS.flatMap(g => g.items.map(i => ({ ...i, group: g.id })));
// Item ativo: "Etiquetas" é a aba Pedidos filtrada em "pago"
function nvaActiveItem(adminTab, sec, statusFilter) {
  if (adminTab === 'pedidos' && sec === 'etiquetas' && statusFilter === 'pago') return 'etiquetas';
  const it = NVA_ITEMS.find(i => i.tab === adminTab || (i.tabs && i.tabs.some(t => t.tab === adminTab)));
  return it ? it.id : 'pedidos';
}

const NOVO_ADMIN_CSS = `
.novo-admin{--muted:#8fa9b6;--card:#0a1219;--border:rgba(0,229,195,.12)}
.novo-admin>nav,.novo-admin>.hero-banner,.novo-admin>.site-footer,.novo-admin>.mobile-bottom-nav,.novo-admin>.app>aside{display:none!important}
.novo-admin>.app{display:block;padding:0 0 0 232px;max-width:none;margin:0;min-height:100vh}
.novo-admin>.app>main{max-width:1180px;padding:24px 28px 48px;margin:0;min-width:0}
.novo-admin .admin-tabs,.novo-admin .view .page-tag{display:none!important}
.novo-admin .page-title{font-size:26px;letter-spacing:-.3px;background:none;-webkit-text-fill-color:#e2eaf0;color:#e2eaf0;margin:0}
.nva-side{position:fixed;top:0;left:0;bottom:0;width:232px;z-index:60;overflow-y:auto;padding:20px 14px;background:#0a1219;border-right:1px solid rgba(0,229,195,.1);display:flex;flex-direction:column;gap:18px;font-family:'DM Sans',sans-serif;scrollbar-width:thin;scrollbar-color:rgba(0,229,195,.2) transparent}
.nva-brand{font-family:'Syne',sans-serif;font-weight:800;font-size:18px;padding:0 8px;color:#e2eaf0}
.nva-brand span{font-family:'Space Mono',monospace;font-size:10px;font-weight:400;color:#7d9aa8;margin-left:4px}
.nva-grp{display:flex;flex-direction:column;gap:2px}
.nva-gl{padding:0 8px 6px;font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#7d9aa8}
.nva-it{display:flex;justify-content:space-between;align-items:center;width:100%;height:40px;padding:0 10px;border-radius:10px;border:none;background:none;color:#c7d6de;font-family:inherit;font-size:14px;text-align:left;cursor:pointer}
.nva-it:hover{background:rgba(0,229,195,.05)}
.nva-it.on{background:rgba(0,229,195,.1);color:#00e5c3;font-weight:600}
.nva-it b,.nva-tabs b,.nva-sub b{font-family:'Space Mono',monospace;font-size:12px;font-weight:700;color:#ffb38f}
.nva-foot{margin-top:auto;display:flex;flex-direction:column;gap:8px;padding:0 8px}
.nva-foot button,.nva-exit{height:40px;padding:0 12px;border-radius:10px;border:1px solid rgba(0,229,195,.3);background:transparent;color:#00e5c3;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer}
.nva-foot span{font-family:'Space Mono',monospace;font-size:10px;color:#5a7a8a}
.nva-tabs,.nva-sub,.nva-exit{display:none}
.novo-admin .admin-stat{background:#0a1219;border-radius:14px;padding:14px 16px}
.novo-admin .admin-stat-label{font-family:'DM Sans',sans-serif;font-size:12px;letter-spacing:0;text-transform:none;color:#a9bfcb}
.novo-admin .admin-stat-value{font-family:'Space Mono',monospace;font-size:22px;font-weight:700;color:#e2eaf0}
.novo-admin .admin-action-btn{font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;min-height:40px;padding:8px 14px;border-radius:10px;border-color:rgba(0,229,195,.2);color:#c7d6de}
.novo-admin .admin-action-btn:hover{border-color:rgba(0,229,195,.45);color:#00e5c3}
.novo-admin .admin-table{background:#0a1219;border-radius:14px;border-color:rgba(0,229,195,.1)}
.novo-admin .admin-table-header{font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;letter-spacing:0;text-transform:none;color:#a9bfcb;background:#0a1219}
.nvp-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin:16px 0 20px}
.nvp-kpis>div{display:flex;flex-direction:column;gap:4px;padding:14px 16px;border-radius:14px;background:#0a1219;border:1px solid rgba(0,229,195,.1);min-width:0}
.nvp-kpis span{font-size:12px;color:#a9bfcb}
.nvp-kpis b{font-family:'Space Mono',monospace;font-size:22px;color:#e2eaf0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nvp-kpis b.nvp-c-warn{color:#ffb38f}.nvp-kpis b.nvp-c-ok{color:#00e5c3}
.novo-admin .nvp-search input{height:42px;font-size:14px!important;background:#0f1c28!important;border-color:rgba(0,229,195,.18)!important}
.novo-admin .nvp-filters{gap:8px!important}
.novo-admin .nvp-filters button{height:36px;padding:0 14px!important;border-radius:18px!important;font-family:'DM Sans',sans-serif!important;font-size:13px!important;font-weight:600}
.nvp-wrap{display:grid;grid-template-columns:minmax(0,1fr);gap:20px;align-items:start}
/* base (celular e tablet): um card por pedido; >=1100px vira linha + painel de detalhe */
.nvp-list{display:flex;flex-direction:column;gap:10px;min-width:0}
.nvp-empty{padding:32px 20px;text-align:center;color:#a9bfcb;font-size:14px;border-radius:14px;background:#0a1219}
.nvp-row{display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:16px;background:#0a1219;border:1px solid rgba(0,229,195,.1);min-width:0}
.nvp-head{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"who tot" "who st";gap:4px 10px;align-items:start;min-width:0;padding:0;border:none;background:none;color:#e2eaf0;font-family:'DM Sans',sans-serif;text-align:left;cursor:pointer}
.nvp-head .nvp-who{grid-area:who}.nvp-head .nvp-tot{grid-area:tot;justify-self:end}.nvp-head .nvp-stc{grid-area:st;justify-self:end}
.nvp-row .nvp-next{height:46px;border-radius:12px;font-size:14px}
.nvp-who{display:flex;flex-direction:column;gap:2px;min-width:0}
.nvp-who b{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nvp-who small{font-size:12px;color:#a9bfcb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nvp-who code,.nvp-ph code{font-family:'Space Mono',monospace;color:#00e5c3;font-weight:700}
.nvp-tot{font-family:'Space Mono',monospace;font-size:13px;font-weight:700;white-space:nowrap}
.nvp-pill{display:inline-block;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:700;white-space:nowrap}
.nvp-st-pendente{background:rgba(255,107,53,.14);color:#ffb38f}
.nvp-st-pago{background:rgba(0,229,195,.14);color:#5ff3dc}
.nvp-st-enviado{background:rgba(0,168,255,.14);color:#7cc9ff}
.nvp-st-entregue{background:rgba(169,191,203,.12);color:#c7d6de}
.nvp-st-extraviado{background:rgba(255,80,80,.14);color:#ff8a8a}
.nvp-acts{display:flex;flex-direction:column;gap:6px;min-width:0}
.nvp-next{height:36px;padding:0 12px;border-radius:10px;border:1px solid rgba(0,229,195,.3);background:transparent;color:#00e5c3;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nvp-next.primary{border-color:#00e5c3;background:#00e5c3;color:#04110e}
.nvp-next:hover{filter:brightness(1.08)}
.nvp-sec{display:flex;flex-wrap:wrap;gap:0 14px}
.nvp-sec button,.nvp-link{padding:2px 0;min-height:34px;border:none;background:none;color:#8fc9bf;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;text-align:left}
.nvp-sec button:hover,.nvp-link:hover{color:#00e5c3;text-decoration:underline}
.nvp-sec .nvp-del,.nvp-link.nvp-del{color:#d08a8a}
.nvp-total{display:flex;justify-content:flex-end;gap:24px;padding:14px 16px;border-radius:14px;background:#0a1219;font-family:'Space Mono',monospace;font-size:13px;color:#a9bfcb}
.nvp-total b{color:#00e5c3}
.nvp-panel{display:none}
@media (min-width:1100px){
  .nvp-wrap{grid-template-columns:minmax(0,1fr) 320px}
  .nvp-list{gap:0;border-radius:14px;border:1px solid rgba(0,229,195,.1);background:#0a1219;overflow:hidden}
  .nvp-empty,.nvp-total{border-radius:0}
  .nvp-total{border-top:1px solid rgba(0,229,195,.1)}
  .nvp-row{display:grid;grid-template-columns:minmax(0,1fr) 170px;gap:12px;align-items:center;padding:10px 16px;border:none;border-top:1px solid rgba(0,229,195,.08);border-radius:0;background:none}
  .nvp-row:first-child{border-top:none}
  .nvp-row.on{background:rgba(0,229,195,.06)}
  .nvp-head{grid-template-columns:minmax(0,1fr) 100px 96px;grid-template-areas:"who tot st";align-items:center;gap:12px;padding:4px 0}
  .nvp-head .nvp-tot,.nvp-head .nvp-stc{justify-self:start}
  .nvp-row .nvp-next{height:36px;border-radius:10px;font-size:13px}
  .nvp-row .nvp-sec{gap:0 10px}
  .nvp-row .nvp-sec button{min-height:24px}
  .nvp-panel{display:flex;flex-direction:column;gap:14px;position:sticky;top:20px;padding:18px;border-radius:16px;background:#0a1219;border:1px solid rgba(0,229,195,.14);min-width:0}
  .nvp-ph{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:16px}
  .nvp-prog{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}
  .nvp-prog span{height:5px;border-radius:3px;background:#1d3140}
  .nvp-prog span.on{background:#00e5c3}
  .nvp-sect{display:flex;flex-direction:column;gap:4px;padding-top:12px;border-top:1px solid rgba(0,229,195,.1);font-size:13px;color:#c7d6de;overflow-wrap:anywhere}
  .nvp-sect b{font-size:15px;color:#e2eaf0}
  .nvp-lbl{font-size:12px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#a9bfcb}
  .nvp-mut{color:#a9bfcb;font-size:12px}
  .nvp-sum{display:flex;justify-content:space-between;padding-top:6px;font-size:15px;font-weight:700;color:#e2eaf0}
  .nvp-sum b{font-family:'Space Mono',monospace}
  .nvp-pacts{gap:8px}
  .nvp-pacts .nvp-next{height:42px;font-size:14px}
  .nvp-pacts .nvp-next.primary{height:46px}
}
.nva-inner{display:flex;gap:4px;margin:16px 0 18px;padding:4px;border-radius:12px;background:#0a1219;border:1px solid rgba(0,229,195,.12);width:max-content;max-width:100%}
.nva-inner button{height:38px;padding:0 18px;border-radius:9px;border:none;background:transparent;color:#a9bfcb;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer}
.nva-inner button:hover{color:#e2eaf0}
.nva-inner button.on{background:rgba(0,229,195,.14);color:#00e5c3}
@media (max-width:759px){
  .nva-inner{width:auto;margin:0 0 14px}
  .nva-inner button{flex:1}
  .nvp-kpis{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0 0 14px}
  .nvp-kpis>div{padding:10px 12px;border-radius:12px}
  .nvp-kpis b{font-size:18px}
  .nva-side{display:none}
  .novo-admin>.app{padding:0}
  .novo-admin>.app>main{padding:14px 16px 96px;width:100%;max-width:100%}
  .nva-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));position:fixed;left:0;right:0;bottom:0;z-index:60;padding:6px 8px calc(10px + env(safe-area-inset-bottom));background:#0a1219;border-top:1px solid rgba(0,229,195,.12)}
  .nva-tabs button{position:relative;height:52px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border:none;background:none;color:#a9bfcb;font-family:'DM Sans',sans-serif;font-size:11px;cursor:pointer}
  .nva-tabs button.on{color:#00e5c3;font-weight:700}
  .nva-tabs b{position:absolute;top:2px;left:calc(50% + 8px);font-size:10px}
  .nva-sub{display:flex;gap:8px;overflow-x:auto;margin:12px -16px 14px;padding:0 16px;scrollbar-width:none}
  .nva-sub button{flex-shrink:0;height:38px;padding:0 14px;border-radius:19px;border:1px solid rgba(0,229,195,.2);background:transparent;color:#c7d6de;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;white-space:nowrap;cursor:pointer}
  .nva-sub button.on{background:#00e5c3;color:#04110e;border-color:#00e5c3}
  .nva-sub button.on b{color:#04110e}
  .nva-exit{display:inline-flex;align-items:center}
  .novo-admin .page-title{font-size:22px}
  /* abas antigas com grade fixa que estouravam a 375px */
  .novo-admin .notice-editor-row{grid-template-columns:1fr!important}
  .novo-admin .fin-cards{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  .novo-admin .nva-wrapgrid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  .novo-admin .nva-scrollx{overflow-x:auto}
  .novo-admin .nva-scrollx>*{min-width:680px}
}`;

function NovaAdminShell({ active, onPick, badges, onExit, versionTag }) {
  const grp = NVA_GROUPS.find(g => g.items.some(i => i.id === active)) || NVA_GROUPS[0];
  const groupBadge = g => g.items.reduce((s, i) => s + (badges[i.id] || 0), 0);
  return <>
    <div className="nva-side" role="navigation" aria-label="Admin">
      <div className="nva-brand">VANGUARD<span>admin</span></div>
      {NVA_GROUPS.map(g => (
        <div className="nva-grp" key={g.id}>
          <span className="nva-gl">{g.label}</span>
          {g.items.map(it => (
            <button key={it.id} className={'nva-it' + (it.id === active ? ' on' : '')} aria-current={it.id === active ? 'page' : undefined} onClick={() => onPick(it)}>
              {it.label}{badges[it.id] > 0 && <b>{badges[it.id]}</b>}
            </button>
          ))}
        </div>
      ))}
      <div className="nva-foot">
        <button onClick={onExit}>← Ver loja</button>
        <span>{versionTag}</span>
      </div>
    </div>
    <div className="nva-tabs" role="navigation" aria-label="Seções do admin">
      {NVA_GROUPS.map(g => (
        <button key={g.id} className={g.id === grp.id ? 'on' : ''} aria-current={g.id === grp.id ? 'page' : undefined} onClick={() => { if (g.id !== grp.id) onPick(g.items[0]); }}>
          <NvIcon d={g.icon} />{g.label}{groupBadge(g) > 0 && <b>{groupBadge(g)}</b>}
        </button>
      ))}
    </div>
  </>;
}

// Sub-abas do grupo atual (só no celular; no desktop o menu lateral já mostra tudo)
function NovaAdminSub({ active, onPick, badges }) {
  const grp = NVA_GROUPS.find(g => g.items.some(i => i.id === active)) || NVA_GROUPS[0];
  return (
    <div className="nva-sub" role="navigation" aria-label={grp.label}>
      {grp.items.map(it => (
        <button key={it.id} className={it.id === active ? 'on' : ''} aria-pressed={it.id === active} onClick={() => onPick(it)}>
          {it.label}{badges[it.id] > 0 && <> <b>{badges[it.id]}</b></>}
        </button>
      ))}
    </div>
  );
}

// Abas internas de um item que junta duas abas antigas (Produtos/Estoque, Artigos/Avisos)
function NovaAdminInnerTabs({ active, adminTab, setAdminTab }) {
  const it = NVA_ITEMS.find(i => i.id === active);
  if (!it || !it.tabs) return null;
  return (
    <div className="nva-inner" role="tablist" aria-label={it.label}>
      {it.tabs.map(t => (
        <button key={t.tab} role="tab" aria-selected={adminTab === t.tab} className={adminTab === t.tab ? 'on' : ''} onClick={() => { if (adminTab !== t.tab) { setAdminTab(t.tab); window.scrollTo(0, 0); } }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

const nvFmt =v => 'R$ ' + (Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function NvIcon({ d, size = 22, w = 1.9 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
}
const NV_ICONS = {
  back: <path d="M15 6l-6 6 6 6" />,
  cart: <><path d="M6 6h15l-1.5 9h-12z" /><path d="M6 6L5 3H2" /><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /></>,
  box: <><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12l5 5 9-10" />,
  chev: <path d="M6 9l6 6 6-6" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
};

// Carrossel continuo "Mais vendidos": rAF mexe no scrollLeft (leve), copias aria-hidden emendam o loop.
// Pausa: hover (mouse), toque/arraste, roda/scroll manual; retoma ~2,5s depois. reduced-motion = estatico.
function NvMarquee({ items, render }) {
  const ref = React.useRef(null);
  const [reduced] = React.useState(() => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } });
  const [sets, setSets] = React.useState(3);
  const n = items.length;
  React.useEffect(() => {
    if (reduced) return;
    const calc = () => setSets(Math.max(3, Math.ceil((window.innerWidth || 1200) / (Math.max(n, 1) * 300)) + 2));
    calc(); window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [reduced, n]);
  // copias nao focaveis (aria-hidden) - roda a cada render pois os botoes podem ser recriados
  React.useEffect(() => {
    const el = ref.current; if (!el || reduced) return;
    el.querySelectorAll('[data-copy="1"] button, [data-copy="1"] a, [data-copy="1"] input, [data-copy="1"] select').forEach(x => x.setAttribute('tabindex', '-1'));
  });
  React.useEffect(() => {
    const el = ref.current; if (!el || reduced || n === 0) return;
    const SPEED = 32; // px/s
    let raf = 0, last = 0, pos = 0, setPos = -1, holdUntil = 0, hover = false, down = false, loop = 0, drag = null, moved = false;
    const hold = (ms) => { holdUntil = Math.max(holdUntil, performance.now() + (ms || 2500)); };
    const measure = () => {
      const kids = el.children;
      if (kids.length > n) loop = kids[n].offsetLeft - kids[0].offsetLeft; // largura de um conjunto (com gap)
      if (loop > 0 && (el.scrollLeft < loop - 1)) { pos = el.scrollLeft + loop; el.scrollLeft = pos; setPos = el.scrollLeft; }
    };
    const wrap = (v) => { if (loop <= 0) return v; while (v >= 2 * loop) v -= loop; while (v < loop) v += loop; return v; };
    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      if (loop <= 0) { measure(); return; }
      if (Math.abs(el.scrollLeft - setPos) > 2) { // usuario mexeu (toque/roda/arraste)
        hold(); pos = el.scrollLeft;
      }
      if (hover || down || t < holdUntil || document.hidden) { pos = el.scrollLeft; setPos = el.scrollLeft; const w = wrap(pos); if (w !== pos) { pos = w; el.scrollLeft = w; setPos = el.scrollLeft; } return; }
      pos = wrap(pos + SPEED * dt);
      el.scrollLeft = pos; setPos = el.scrollLeft;
    };
    const onEnter = (e) => { if (e.pointerType === 'mouse') hover = true; };
    const onLeave = (e) => { if (e.pointerType === 'mouse') { hover = false; hold(1500); } };
    const onDown = (e) => {
      if (e.pointerType === 'mouse') { if (e.button !== 0) return; drag = { x: e.clientX, s: el.scrollLeft }; moved = false; down = true; }
      else { down = true; }
    };
    const onMove = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 5) { moved = true; el.classList.add('drag'); }
      if (moved) el.scrollLeft = drag.s - dx;
    };
    const onUp = () => { if (down) { down = false; hold(); } if (drag) { drag = null; el.classList.remove('drag'); } };
    const onClickCap = (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } };
    const onWheel = () => hold();
    const onFocusIn = () => hold(6000);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { loop = 0; }) : null;
    if (ro) ro.observe(el);
    el.addEventListener('pointerenter', onEnter); el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointerdown', onDown); el.addEventListener('wheel', onWheel, { passive: true });
    el.addEventListener('click', onClickCap, true); el.addEventListener('focusin', onFocusIn);
    window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onUp);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); if (ro) ro.disconnect();
      el.removeEventListener('pointerenter', onEnter); el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointerdown', onDown); el.removeEventListener('wheel', onWheel);
      el.removeEventListener('click', onClickCap, true); el.removeEventListener('focusin', onFocusIn);
      window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onUp);
    };
  }, [reduced, n, sets]);
  if (reduced) return <div className="nv-hotrow">{items.map((p, i) => render(p, i, p.id, false))}</div>;
  const out = [];
  for (let s = 0; s < sets; s++) items.forEach((p, i) => out.push(render(p, i, p.id + '~' + s, s > 0)));
  return <div className="nv-hotrow nv-marq" ref={ref}>{out}</div>;
}

function NvProdImg({ p, eager, ratio, className, alt }) {
  const [bad, setBad] = React.useState(false);
  const src = p && p.image_url;
  React.useEffect(() => { setBad(false); }, [src]);
  const r = ratio === 'tall' ? [800, 1200] : [800, 1000];
  if (!src || bad) {
    return (
      <div className={'nv-ph ' + (className || '')} role="img" aria-label={alt || 'Frasco Vanguard Labs'} style={{ aspectRatio: r[0] + '/' + r[1] }}>
        <svg viewBox="0 0 24 24" width="44%" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 3h6v3H9z" /><path d="M8 6h8v2.5l1 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19v-9l1-1.5z" /><path d="M9.5 13l2.5 4 2.5-4" strokeWidth="1.6" /></svg>
      </div>
    );
  }
  return <img className={'nv-img ' + (className || '')} src={src} alt={alt || ('Frasco ' + p.name + ' Vanguard Labs')} width={r[0]} height={r[1]} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setBad(true)} />;
}
function NvComboImg({ b }) {
  const [bad, setBad] = React.useState(false);
  React.useEffect(() => { setBad(false); }, [b.id]);
  const label = 'Frascos do combo ' + b.name;
  if (!bad) return <img className="nv-cimg" src={'/assets/combos/' + encodeURIComponent(b.id) + '-v1.webp'} alt={label} width={1000} height={800} loading="lazy" decoding="async" onError={() => setBad(true)} />;
  const ps = b.prods.slice(0, 4);
  return (
    <div className="nv-cimg nv-ccol" role="img" aria-label={label}>
      {ps.map(p => <span key={p.id} className="nv-cvial" style={{ zIndex: ps.length - Math.abs(ps.indexOf(p) - (ps.length - 1)) }}><NvProdImg p={p} ratio="tall" alt="" /></span>)}
    </div>
  );
}
function NvInstallBanner() {
  const KEY = 'vg-pwa-dismiss';
  const [evt, setEvt] = React.useState(() => window.__vgInstallEvt || null);
  const [gone, setGone] = React.useState(() => { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } });
  React.useEffect(() => {
    const h = () => setEvt(window.__vgInstallEvt || null);
    window.addEventListener('vg-install-ready', h);
    return () => window.removeEventListener('vg-install-ready', h);
  }, []);
  let standalone = false, ios = false;
  try {
    standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
    const ua = window.navigator.userAgent || '';
    ios = /iPhone|iPad|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  } catch (e) {}
  if (gone || standalone || (!evt && !ios)) return null;
  const dismiss = () => { setGone(true); try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} };
  const install = async () => {
    const e = evt; if (!e) return;
    try { e.prompt(); await e.userChoice; } catch (err) {}
    window.__vgInstallEvt = null; setEvt(null); dismiss();
  };
  return (
    <div className="nv-wrap"><div className="nv-pwa" role="region" aria-label="Instalar app">
      <span className="nv-pwa-t">{evt ? <><b>Instale o app da Vanguard</b> na tela inicial do celular.</> : <><b>Instale o app:</b> toque em Compartilhar e depois em &quot;Adicionar à Tela de Início&quot;.</>}</span>
      {evt && <button onClick={install}>Instalar app</button>}
      <button className="nv-pwa-x" onClick={dismiss} aria-label="Dispensar">×</button>
    </div></div>
  );
}

// ── Banner de campanha (sorteio) — para trocar/encerrar edite só estas constantes ──
const SORTEIO = {
  id: 'sorteio-ghkcu-2026-10',            // muda a cada campanha (reabre o banner p/ quem fechou)
  img: '/assets/sorteio-ghkcu.webp', w: 800, h: 1200,
  sku: 'CU50',                            // produto aberto ao clicar
  ate: '2026-10-31T23:59:00-03:00',       // fim da vigência (horário de Brasília)
  alt: 'Sorteio da Vanguard Labs: 2 vials de GHK-Cu 50mg para nossos clientes. Participa quem comprou nos últimos 30 dias e quem comprar até o final do mês.',
};
function NvSorteio({ products, go }) {
  const KEY = 'vg-sorteio-' + SORTEIO.id;
  const [gone, setGone] = React.useState(() => { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } });
  let now = Date.now();
  try { if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && window.__vgNow) now = +window.__vgNow; } catch (e) {}
  if (gone || now > new Date(SORTEIO.ate).getTime()) return null;
  const prod = products.find(p => (p.sku || '').toUpperCase() === SORTEIO.sku);
  const open = () => { if (prod) go('produto', prod.id); };
  const dismiss = () => { setGone(true); try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} };
  return (
    <div className="nv-wrap"><div className="nv-sorteio" role="region" aria-label="Sorteio de GHK-Cu 50mg">
      <button className="nv-sorteio-x" onClick={dismiss} aria-label="Fechar banner do sorteio">×</button>
      <button className="nv-sorteio-img" onClick={open} aria-label="Ver GHK-Cu 50mg" disabled={!prod}>
        <img src={SORTEIO.img} width={SORTEIO.w} height={SORTEIO.h} alt={SORTEIO.alt} loading="eager" decoding="async" />
      </button>
      <div className="nv-sorteio-t">
        <span className="nv-sorteio-tag">Sorteio</span>
        <h2>2 vials de GHK-Cu 50mg para nossos clientes</h2>
        <ul>
          <li>Quem comprou com a gente <b>nos últimos 30 dias</b></li>
          <li>Quem comprar <b>até o final do mês</b></li>
        </ul>
        <p>Participação automática, sem cadastro.</p>
        {prod && <button className="nv-btn" onClick={open}>Ver GHK-Cu 50mg</button>}
      </div>
    </div></div>
  );
}

function NovaLoja(P) {
  const { products, categories, effectivePrice, availableStock, myOrders, myTotal, cartCount,
    quickAdd, updateQtyInCart, removeFromCart, addPackToCart, savePreorder,
    addBundleToCart, bundleInfo, bundles, bestsellers, articles,
    pointsBalance, setPointsBalance, appliedPoints, setAppliedPoints, pointsConfig, checkPoints,
    checkout, updateCheckout, fetchCep, checkoutErrors, calcFreight,
    couponInput, setCouponInput, appliedCoupon, setAppliedCoupon, applyCouponCode,
    disclaimer, setDisclaimer, isSubmitting, submitOrder, orderSuccessCode, setOrderSuccessCode,
    trackQuery, setTrackQuery, searchOrders, trackResults, trackLoading, statusLabel,
    freteDestCep, setFreteDestCep, freteResults, freteLoading, freteError, calcularFrete,
    notices, onVersionTap, versionTag } = P;

  const initial = (window.history.state && window.history.state.nv) || nvStateFromUrl();
  const [screen, setScreen] = React.useState(initial.s || 'loja');
  const [pid, setPid] = React.useState(initial.pid || null);
  const [cat, setCat] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [pre, setPre] = React.useState(null); // { product, name, whatsapp, qty }
  const [faqOpen, setFaqOpen] = React.useState('0-0');
  const [doneCode, setDoneCode] = React.useState(null);

  function go(s, id) {
    const depth = ((window.history.state && window.history.state.nv && window.history.state.nv.d) || 0) + 1;
    // Produto ganha endereço próprio (/p/<código>); o resto fica na home da loja nova
    const prod = s === 'produto' && products.find(p => p.id === id);
    const url = prod ? '/p/' + nvSlugOf(prod) : NV_HOME;
    window.history.pushState({ nv: { s, pid: id || null, d: depth } }, '', url);
    setScreen(s); setPid(id || null); window.scrollTo(0, 0);
  }
  React.useEffect(() => {
    const onPop = e => { const st = (e.state && e.state.nv) || nvStateFromUrl(); setScreen(st.s || 'loja'); setPid(st.pid || null); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  // Pedido salvo → tela de confirmação
  React.useEffect(() => {
    if (orderSuccessCode) { setDoneCode(orderSuccessCode); setOrderSuccessCode(null); go('done'); }
  }, [orderSuccessCode]);

  const qtyOf = id => myOrders.filter(o => o.peptideId === id && !o._packId).reduce((s, o) => s + (o.qty || 0), 0);
  const lineOf = id => myOrders.find(o => o.peptideId === id && !o._packId);
  const visible = products.filter(p => (cat === 'all' || p.category === cat) &&
    (!q.trim() || (p.name + ' ' + (p.desc || '') + ' ' + (p.sku || '')).toLowerCase().includes(q.trim().toLowerCase())));
  const hot = resolveBestsellers(bestsellers, products);
  const product = pid ? products.find(p => p.id === pid || nvSlugOf(p) === String(pid).toLowerCase()) : null;

  const isPix = checkout.pagamento === 'pix';
  const freightRaw = calcFreight(checkout.estado, myTotal);
  const freight = isPix ? { value: 0, label: 'Grátis' } : { ...freightRaw, label: freightRaw.value ? nvFmt(freightRaw.value) : 'Grátis' };
  const couponDiscount = appliedCoupon ? (appliedCoupon.type === 'percent' ? Math.round(myTotal * appliedCoupon.value / 100) : Math.min(appliedCoupon.value, myTotal)) : 0;
  const bundleDiscount = (bundleInfo && bundleInfo.total) || 0;
  // Pontos VG: mesma regra do App (cada 100 pts = R$ pointsConfig.redeem)
  const ptsValue = pts => Math.floor((pts || 0) / 100) * ((pointsConfig && pointsConfig.redeem) || 5);
  const pointsDiscount = ptsValue(appliedPoints);
  const totalFinal = myTotal - couponDiscount - bundleDiscount - pointsDiscount + freight.value;
  // CPF salvo de visita anterior: consulta o saldo ao abrir o checkout
  React.useEffect(() => {
    if (screen === 'checkout' && pointsBalance == null && (checkout.cpf || '').replace(/\D/g, '').length === 11) checkPoints(checkout.cpf);
  }, [screen]);
  // Combos exibíveis: todos os itens no catálogo e preço do combo abaixo da soma atual
  const combos = (bundles || []).filter(b => b.active !== false).map(b => {
    const full = nvBundleFull(b, products, effectivePrice);
    if (full === null || full <= b.price) return null;
    const items = b.items.map(id => products.find(p => p.id === id));
    return { ...b, full, prods: items, out: items.some(p => availableStock(p.id) === 0) };
  }).filter(Boolean);

  const Back = ({ title, to = 'loja' }) => (
    <div className="nv-back">
      <button className="nv-ico" onClick={() => (window.history.state && window.history.state.nv && window.history.state.nv.d) ? window.history.back() : go(to)} aria-label="Voltar"><NvIcon d={NV_ICONS.back} /></button>
      <h2>{title}</h2>
    </div>
  );
  const Field = ({ k, label, hint, msg, ...rest }) => (
    <div className={'nv-f' + (checkoutErrors[k] ? ' err' : '')}>
      <label htmlFor={'nv-' + k}>{label}{hint && <span style={{ color: 'var(--mu2)' }}> {hint}</span>}</label>
      <input id={'nv-' + k} value={checkout[k] || ''} aria-invalid={!!checkoutErrors[k]} onChange={e => updateCheckout(k, e.target.value)} {...rest} />
      {checkoutErrors[k] && msg && <span className="msg">{msg}</span>}
    </div>
  );

  const header = (
    <header className="nv-top">
      <div className="nv-wrap">
        <button className="nv-logo" onClick={() => go('loja')}>VANGUARD</button>
        <div role="navigation" className="nv-links" aria-label="Principal">
          <button onClick={() => go('rastrear')}>Rastrear pedido</button>
          <button onClick={() => go('calc')}>Calculadora</button>
          <button onClick={() => go('artigos')}>Artigos</button>
          <button onClick={() => go('faq')}>Dúvidas</button>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button className="nv-ico" onClick={() => go('rastrear')} aria-label="Rastrear pedido"><NvIcon d={NV_ICONS.box} /></button>
          <button className="nv-ico nv-cartbtn" onClick={() => go('checkout')} aria-label={`Carrinho, ${cartCount} itens`}>
            <NvIcon d={NV_ICONS.cart} />
            {cartCount > 0 && <span className="nv-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );

  const footer = (
    <div role="contentinfo" className="nv-foot">
      <div className="nv-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' }}>
        <span>Produtos destinados exclusivamente a pesquisa.</span>
        <span style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <a href="#" onClick={e => { e.preventDefault(); go('artigos'); }}>Artigos</a>
          <a href="#" onClick={e => { e.preventDefault(); go('faq'); }}>Dúvidas</a>
          <a href="#" onClick={e => { e.preventDefault(); go('frete'); }}>Simular frete</a>
          <a href="https://wa.me/447418333521" target="_blank" rel="noreferrer">WhatsApp</a>
          <a href={NOVO_NO_INICIO ? '/antigo/' : '/'}>Versão anterior do site</a>
          <span onClick={onVersionTap} style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, opacity: .6, userSelect: 'none' }}>{versionTag}</span>
        </span>
      </div>
    </div>
  );

  const cartBar = cartCount > 0 && screen !== 'checkout' && screen !== 'done' && (
    <div className="nv-bar">
      <button className="nv-barbtn" onClick={() => go('checkout')}>
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, textAlign: 'left' }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{cartCount} {cartCount === 1 ? 'item' : 'itens'}</span>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 17 }}>{nvFmt(myTotal - bundleDiscount)}</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Finalizar <NvIcon d={NV_ICONS.arrow} size={18} w={2.4} /></span>
      </button>
    </div>
  );

  const addControls = p => {
    const avail = availableStock(p.id);
    if (avail === 0) return <button className="nv-res" onClick={() => setPre({ product: p, name: checkout.nomeCompleto || '', whatsapp: checkout.telefone || '', qty: 1 })}>Reservar</button>;
    const n = qtyOf(p.id);
    if (!n) return <button className="nv-add" onClick={() => quickAdd(p)} aria-label={'Adicionar ' + p.name}><NvIcon d={NV_ICONS.plus} w={2.2} /></button>;
    const line = lineOf(p.id);
    return (
      <div className="nv-qty">
        <button className="p" onClick={() => quickAdd(p)} aria-label="Mais um">+</button>
        <span>{n}</span>
        <button className="m" onClick={() => line && updateQtyInCart(line.id, -1)} aria-label="Menos um">−</button>
      </div>
    );
  };

  const priceLine = p => {
    const ep = effectivePrice(p);
    return <span className="nv-price">{nvFmt(ep)}{ep < p.price && <span className="nv-old">{nvFmt(p.price)}</span>}</span>;
  };

  const arts = (articles || []).filter(a => a && a.title);
  const article = screen === 'artigo' && pid ? arts.find(a => a.id === pid) : null;
  const artList = list => (
    <div className="nv-alist">
      {list.map(a => (
        <button key={a.id} onClick={() => go('artigo', a.id)}>
          {a.tag && <span className="nv-kick">{a.tag}</span>}
          <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{a.title}</span>
          {a.subtitle && <span className="nv-desc">{a.subtitle}</span>}
        </button>
      ))}
    </div>
  );

  let body = null;

  if (screen === 'loja') {
    const activeNotices = (notices || []).slice(0, 1);
    body = (
      <div className="nv-wrap">
        {activeNotices.map(n => <div key={n.id} style={{ marginTop: 14, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,196,107,.08)', border: '1px solid rgba(255,196,107,.3)', fontSize: 14 }}>{n.text}</div>)}
        <div style={{ paddingTop: 14 }}>
          <label htmlFor="nv-busca" style={{ position: 'absolute', left: -9999 }}>Buscar produto</label>
          <div className="nv-search"><NvIcon d={NV_ICONS.search} size={18} w={2} /><input id="nv-busca" placeholder="Buscar: tirzepatida, GHK-Cu..." value={q} onChange={e => setQ(e.target.value)} /></div>
        </div>
        <div role="navigation" className="nv-chips" aria-label="Categorias">
          {categories.map(c => <button key={c.id} className={'nv-chip' + (cat === c.id ? ' on' : '')} aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{c.id === 'all' ? 'Todos' : c.name}</button>)}
        </div>
        {cat === 'all' && !q.trim() && hot.length > 0 && (
          <section className="nv-sec nv-hotsec" style={{ marginTop: 4, marginBottom: 20 }} aria-label="Mais vendidos">
            <h2 className="nv-h2">Mais vendidos</h2>
            <NvMarquee items={hot} render={(p, idx, key, copy) => {
                const out = availableStock(p.id) === 0;
                return (
                  <div key={key} className="nv-hot" {...(copy ? { 'aria-hidden': 'true', 'data-copy': '1' } : {})}>
                    <article className={'nv-hotin' + (out ? ' out' : '')}>
                      <span className="nv-hotbadge">🔥 Mais vendido</span>
                      <button className="nv-pic" onClick={() => go('produto', p.id)} aria-label={'Ver ' + p.name} tabIndex={-1}><NvProdImg p={p} eager={idx < 3} /></button>
                      <div className="nv-cbody" style={{ padding: '0 12px' }}>
                        {out && <span className="nv-tag" style={{ color: 'var(--warn)' }}>Lote esgotado</span>}
                        <button className="nv-name nv-hotname" onClick={() => go('produto', p.id)}>{p.name}</button>
                        {priceLine(p)}
                      </div>
                      <div className="nv-cfoot" style={{ padding: '0 12px' }}>{addControls(p)}</div>
                    </article>
                  </div>
                );
              }} />
          </section>
        )}
        {cat === 'all' && !q.trim() && combos.length > 0 && (
          <section className="nv-sec" style={{ marginTop: 4, marginBottom: 18 }} aria-label="Combos">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 className="nv-h2">Combos</h2>
              <span style={{ fontSize: 13, color: 'var(--mu)' }}>{combos.length > 1 ? 'arraste para o lado' : ''}</span>
            </div>
            <div className="nv-combos">
              {combos.map(b => (
                <article key={b.id} className="nv-combo">
                  <NvComboImg b={b} />
                  <span className="nv-pill">Economize {nvFmt(b.full - b.price)}</span>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{b.name}</h3>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {b.prods.map(p => <button key={p.id} className="nv-sku" onClick={() => go('produto', p.id)}>{p.sku || p.name}</button>)}
                  </div>
                  <span style={{ fontSize: 13, lineHeight: 1.4, color: 'var(--mu)' }}>{b.desc}</span>
                  <span className="nv-price" style={{ fontSize: 18 }}>{nvFmt(b.price)}<span className="nv-old">{nvFmt(b.full)}</span></span>
                  {b.out
                    ? <button className="nv-btn2" style={{ height: 46, marginTop: 'auto', borderColor: 'rgba(255,196,107,.5)', color: 'var(--warn)', cursor: 'default' }} disabled>Item esgotado</button>
                    : <button className="nv-btn" style={{ height: 46, fontSize: 14, marginTop: 'auto' }} onClick={() => addBundleToCart(b)}>Adicionar combo</button>}
                </article>
              ))}
            </div>
          </section>
        )}
        <section className="nv-grid" aria-label="Produtos">
          {visible.length === 0 && <div className="nv-box" style={{ gridColumn: '1/-1' }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Nada encontrado para "{q}".</div>
            <a href="https://wa.me/447418333521" target="_blank" rel="noreferrer">Pedir esse produto pelo WhatsApp</a>
          </div>}
          {visible.map((p, idx) => {
            const out = availableStock(p.id) === 0;
            return (
              <article key={p.id} className={'nv-card' + (out ? ' out' : '')}>
                <button className="nv-pic" onClick={() => go('produto', p.id)} aria-label={'Ver ' + p.name} tabIndex={-1}><NvProdImg p={p} eager={idx < 4} /></button>
                <div className="nv-cbody" style={{ padding: '0 10px' }}>
                  {out ? <span className="nv-tag" style={{ color: 'var(--warn)' }}>Lote esgotado</span> : p.badge && <span className="nv-tag">{p.badge.replace(/^[^\wÀ-ú]+\s*/, '')}</span>}
                  <button className="nv-name" onClick={() => go('produto', p.id)}>{p.name}</button>
                  {priceLine(p)}
                </div>
                <div className="nv-cfoot">{addControls(p)}</div>
              </article>
            );
          })}
        </section>
        {cat === 'all' && !q.trim() && arts.length > 0 && (
          <section className="nv-sec" style={{ marginTop: 18 }} aria-label="Artigos">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 className="nv-h2">Artigos</h2>
              {arts.length > 3 && <a href="#" onClick={e => { e.preventDefault(); go('artigos'); }} style={{ fontSize: 14, fontWeight: 600 }}>Ver todos</a>}
            </div>
            {artList(arts.slice(0, 3))}
          </section>
        )}
      </div>
    );
  }

  if (screen === 'artigos') {
    body = (
      <div className="nv-wrap nv-narrow" style={{ paddingBottom: 20 }}>
        <Back title="Artigos" />
        <p className="nv-sub" style={{ margin: '6px 0 16px' }}>Leituras curtas sobre os peptídeos do catálogo.</p>
        {arts.length ? artList(arts) : <div className="nv-box">Nenhum artigo publicado ainda.</div>}
      </div>
    );
  }

  if (screen === 'artigo' && article) {
    const a = article;
    const rel = a.relatedProductId ? products.find(p => p.id === a.relatedProductId || p.name.toLowerCase().includes((a.relatedProductId || '').replace(/[0-9]/g, '').toLowerCase())) : null;
    const others = arts.filter(x => x.id !== a.id).slice(0, 2);
    body = (
      <div className="nv-wrap nv-narrow" style={{ paddingBottom: 20 }}>
        <Back title="Artigos" to="artigos" />
        <article className="nv-art">
          <span className="nv-kick">{[a.tag, nvReadMin(a.body) + ' min de leitura'].filter(Boolean).join(' · ')}</span>
          <h1 className="nv-h1" style={{ fontSize: 28, lineHeight: 1.12 }}>{a.title}</h1>
          {a.subtitle && <p style={{ color: 'var(--mu)' }}>{a.subtitle}</p>}
          {a.date && <span style={{ fontSize: 13, color: 'var(--mu2)' }}>{a.date}</span>}
          {nvArticleBody(a.body)}
          {rel && (
            <button className="nv-pay" style={{ marginTop: 6 }} onClick={() => go('produto', rel.id)}>
              <span className="nv-sku" style={{ height: 'auto', padding: '8px', display: 'flex', alignItems: 'center' }}>{rel.sku || 'VG'}</span>
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 12, color: 'var(--mu)' }}>Produto citado</span>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{rel.name}</span>
                {priceLine(rel)}
              </span>
              <span style={{ color: 'var(--ac)', display: 'flex' }}><NvIcon d={NV_ICONS.arrow} size={20} w={2} /></span>
            </button>
          )}
          <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--mu2)' }}>Conteúdo informativo para pesquisa. Não substitui orientação profissional.</p>
        </article>
        {others.length > 0 && (
          <section className="nv-sec">
            <h2 className="nv-sech" style={{ fontSize: 15 }}>Leia também</h2>
            {artList(others)}
          </section>
        )}
      </div>
    );
  }

  if (screen === 'produto' && product) {
    const p = product;
    const out = availableStock(p.id) === 0;
    const packs = p.packs || [];
    body = (
      <div className="nv-wrap nv-narrow nv-pdp-wrap">
        <Back title={p.name} />
        <div className="nv-pdp">
        <div className={'nv-pdp-pic' + (out ? ' out' : '')} style={out ? { filter: 'brightness(.6)' } : undefined}><NvProdImg p={p} eager ratio="tall" /></div>
        <div className="nv-pdp-info">
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
          {p.badge && <span className="nv-tag">{p.badge.replace(/^[^\wÀ-ú]+\s*/, '')}</span>}
          <h1 className="nv-h1" style={{ fontSize: 28 }}>{p.name}</h1>
          {p.compounds && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: 'var(--ac)' }}>{p.compounds}</span>}
          {p.desc && <p className="nv-sub">{p.desc}</p>}
          <div style={{ fontSize: 22 }}>{priceLine(p)}</div>
        </section>
        {packs.length > 0 && !out && (
          <section className="nv-sec">
            <h2 className="nv-sech" style={{ fontSize: 15 }}>Protocolos com desconto</h2>
            {packs.map(pk => {
              const unit = Math.round(effectivePrice(p) * (1 - (pk.discount || 0) / 100));
              return (
                <button key={pk.id} className="nv-pay" onClick={() => addPackToCart(p, pk)}>
                  <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{pk.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--mu)' }}>{pk.qty} frascos{pk.discount ? ` · ${pk.discount}% off` : ''}{pk.desc ? ` · ${pk.desc}` : ''}</span>
                  </span>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>{nvFmt(unit * pk.qty)}</span>
                </button>
              );
            })}
          </section>
        )}
        <section className="nv-sec" style={{ paddingBottom: 30 }}>
          {out
            ? <button className="nv-btn" style={{ background: 'transparent', border: '1px solid rgba(255,196,107,.5)', color: 'var(--warn)' }} onClick={() => setPre({ product: p, name: checkout.nomeCompleto || '', whatsapp: checkout.telefone || '', qty: 1 })}>Reservar no próximo lote</button>
            : <button className="nv-btn" onClick={() => quickAdd(p)}>{qtyOf(p.id) ? `Adicionar mais um (${qtyOf(p.id)} no carrinho)` : 'Adicionar ao carrinho'}</button>}
          <button className="nv-btn2" onClick={() => go('calc')}>Abrir calculadora de dose</button>
          <button className="nv-btn2" style={{ border: 'none', color: 'var(--mu)', height: 44 }} onClick={async () => {
            const url = 'https://vanguardpep.com/p/' + nvSlugOf(p);
            try { if (navigator.share) await navigator.share({ title: p.name, url }); else { await navigator.clipboard.writeText(url); alert('Link copiado: ' + url); } } catch {}
          }}>Compartilhar link deste produto</button>
        </section>
        </div>
        </div>
      </div>
    );
  }

  if (screen === 'checkout') {
    body = (
      <div className="nv-wrap nv-narrow" style={{ paddingBottom: 30 }}>
        <Back title="Finalizar pedido" />
        {myOrders.length === 0 ? (
          <div className="nv-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', padding: 28 }}>
            <span style={{ color: '#5a7a8a' }}><NvIcon d={NV_ICONS.cart} size={40} w={1.6} /></span>
            <b>Seu carrinho está vazio</b>
            <button className="nv-btn" style={{ height: 48 }} onClick={() => go('loja')}>Ver produtos</button>
          </div>
        ) : <>
          <section className="nv-box">
            {myOrders.map(o => {
              const p = products.find(x => x.id === o.peptideId);
              const unit = o._packPrice !== undefined ? o._packPrice : effectivePrice(p);
              return (
                <div key={o.id} className="nv-line">
                  {p && <span className="nv-thumb"><NvProdImg p={p} /></span>}
                  <span style={{ flex: 1, minWidth: 0 }}>{p ? p.name : 'Produto'}{o._packName ? ` · ${o._packName}` : ''}<br /><span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: 'var(--mu)' }}>{nvFmt(unit)} cada</span></span>
                  {o._packId
                    ? <button className="nv-ico" style={{ width: 36, height: 36 }} onClick={() => removeFromCart(o.id)} aria-label="Remover"><NvIcon d={NV_ICONS.x} size={18} /></button>
                    : <span className="nv-mini">
                        <button onClick={() => updateQtyInCart(o.id, -1)} aria-label="Menos um">−</button>
                        <span style={{ minWidth: 22, textAlign: 'center', fontFamily: "'Space Mono',monospace" }}>{o.qty}</span>
                        <button onClick={() => p && quickAdd(p)} aria-label="Mais um">+</button>
                      </span>}
                </div>
              );
            })}
            {Object.values((bundleInfo ? bundleInfo.applied : []).filter(b => b.discount > 0).reduce((acc, b) => {
              acc[b.id] = acc[b.id] ? { ...acc[b.id], n: acc[b.id].n + 1, discount: acc[b.id].discount + b.discount } : { ...b, n: 1 };
              return acc;
            }, {})).map(b => (
              <div key={b.id} className="nv-line" style={{ borderTop: '1px solid var(--ln)', marginTop: 4, paddingTop: 10 }}>
                <span style={{ flex: 1, minWidth: 0, color: 'var(--ac)' }}>{b.n > 1 ? b.n + '× ' : ''}Combo {b.name}</span>
                <b style={{ fontFamily: "'Space Mono',monospace", fontWeight: 400, color: 'var(--ac)' }}>− {nvFmt(b.discount)}</b>
              </div>
            ))}
          </section>

          <section className="nv-sec">
            <h2 className="nv-sech"><span className="nv-num">1</span>Seus dados</h2>
            {Field({ k: 'nomeCompleto', label: 'Nome completo', autoComplete: 'name', msg: 'Informe seu nome.' })}
            <div className="nv-2">
              {Field({ k: 'telefone', label: 'WhatsApp', inputMode: 'tel', autoComplete: 'tel', placeholder: '(11) 90000-0000', msg: 'Informe o WhatsApp.' })}
              {Field({ k: 'cpf', label: 'CPF', inputMode: 'numeric', placeholder: '000.000.000-00', msg: 'CPF inválido.',
                onChange: e => {
                  const v = e.target.value;
                  updateCheckout('cpf', v);
                  // CPF mudou: pontos aplicados de outro CPF deixam de valer
                  if (appliedPoints) setAppliedPoints(0);
                  if (v.replace(/\D/g, '').length === 11) checkPoints(v); else setPointsBalance(null);
                } })}
            </div>
            {Field({ k: 'email', label: 'E-mail', hint: '(para o rastreio)', inputMode: 'email', autoComplete: 'email', placeholder: 'voce@email.com', msg: 'E-mail inválido.' })}
          </section>

          <section className="nv-sec">
            <h2 className="nv-sech"><span className="nv-num">2</span>Entrega</h2>
            <div className="nv-2">
              <div className={'nv-f' + (checkoutErrors.cep ? ' err' : '')}>
                <label htmlFor="nv-cep">CEP</label>
                <input id="nv-cep" inputMode="numeric" autoComplete="postal-code" value={checkout.cep || ''} placeholder="00000-000"
                  onChange={e => { updateCheckout('cep', e.target.value); if (e.target.value.replace(/\D/g, '').length === 8) fetchCep(e.target.value); }} />
                {checkoutErrors.cep && <span className="msg">CEP inválido.</span>}
              </div>
              {Field({ k: 'numero', label: 'Número', inputMode: 'numeric', msg: 'Informe o número.' })}
            </div>
            {checkout.rua
              ? <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 12, background: 'rgba(0,229,195,.06)', fontSize: 14, lineHeight: 1.4 }}>
                  <span style={{ color: 'var(--ac)' }}><NvIcon d={NV_ICONS.check} size={18} w={2} /></span>
                  <span>{checkout.rua} — {checkout.bairro}<br /><span style={{ color: 'var(--mu)' }}>{checkout.cidade}/{checkout.estado}</span></span>
                </div>
              : <div className="nv-2">
                  {Field({ k: 'rua', label: 'Rua', msg: 'Informe a rua.' })}
                  {Field({ k: 'bairro', label: 'Bairro' })}
                  {Field({ k: 'cidade', label: 'Cidade', msg: 'Informe a cidade.' })}
                  {Field({ k: 'estado', label: 'UF', maxLength: 2, msg: 'Informe a UF.' })}
                </div>}
            {Field({ k: 'complemento', label: 'Complemento', hint: '(opcional)', placeholder: 'Apto, bloco...' })}
          </section>

          <section className="nv-sec">
            <h2 className="nv-sech"><span className="nv-num">3</span>Pagamento</h2>
            {[{ v: 'pix', t: 'PIX', s: 'Frete grátis · aprovação na hora', tag: 'Recomendado' }, { v: '2x', t: 'Cartão em 2x', s: freightRaw.value ? `Frete ${nvFmt(freightRaw.value)}` : 'Frete grátis neste pedido' }].map(m => (
              <button key={m.v} className={'nv-pay' + (checkout.pagamento === m.v ? ' on' : '')} aria-pressed={checkout.pagamento === m.v} onClick={() => updateCheckout('pagamento', m.v)}>
                <span className="nv-dot" />
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 15, fontWeight: 700 }}>{m.t}</span><span style={{ fontSize: 13, color: 'var(--mu)' }}>{m.s}</span></span>
                {m.tag && <span style={{ padding: '4px 8px', borderRadius: 6, background: 'var(--ac)', color: '#04110e', fontSize: 11, fontWeight: 700 }}>{m.tag}</span>}
              </button>
            ))}
            {checkoutErrors.pagamento && <span style={{ fontSize: 13, color: 'var(--err)' }}>Escolha a forma de pagamento.</span>}
            {appliedCoupon
              ? <div className="nv-line" style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(0,229,195,.08)', border: '1px solid rgba(0,229,195,.3)' }}>
                  <span><b style={{ fontFamily: "'Space Mono',monospace", color: 'var(--ac)' }}>{appliedCoupon.code}</b> · −{nvFmt(couponDiscount)}</span>
                  <button onClick={() => { setAppliedCoupon(null); setCouponInput(''); }} style={{ height: 40, border: 'none', background: 'none', color: 'var(--mu)', cursor: 'pointer' }}>Remover</button>
                </div>
              : <div style={{ display: 'flex', gap: 8 }}>
                  <label htmlFor="nv-cupom" style={{ position: 'absolute', left: -9999 }}>Cupom</label>
                  <input id="nv-cupom" placeholder="Cupom de desconto" value={couponInput} onChange={e => setCouponInput(e.target.value)}
                    style={{ flex: 1, minWidth: 0, height: 48, padding: '0 14px', borderRadius: 12, border: '1px solid rgba(0,229,195,.18)', background: 'var(--bg3)', color: 'var(--tx)', fontSize: 15, outline: 'none' }} />
                  <button onClick={applyCouponCode} style={{ height: 48, padding: '0 16px', borderRadius: 12, border: '1px solid rgba(0,229,195,.35)', background: 'transparent', color: 'var(--ac)', fontWeight: 700, cursor: 'pointer' }}>Aplicar</button>
                </div>}
            {(() => {
              const bal = pointsBalance ? (pointsBalance.points || 0) : 0;
              if (pointsBalance == null) return <span style={{ fontSize: 13, color: 'var(--mu2)' }}>Tem pontos VG? Informe o CPF acima para ver o saldo.</span>;
              if (appliedPoints > 0) return (
                <div className="nv-line" style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,196,107,.08)', border: '1px solid rgba(255,196,107,.35)' }}>
                  <span><b style={{ fontFamily: "'Space Mono',monospace", color: 'var(--warn)' }}>{appliedPoints} pts</b> · −{nvFmt(pointsDiscount)}</span>
                  <button onClick={() => setAppliedPoints(0)} style={{ height: 40, border: 'none', background: 'none', color: 'var(--mu)', cursor: 'pointer' }}>Remover</button>
                </div>
              );
              if (bal < 100) return <span style={{ fontSize: 13, color: 'var(--mu2)' }}>{bal > 0 ? `Você tem ${bal} pontos VG — o resgate começa em 100 pontos.` : 'Nenhum ponto VG neste CPF ainda. Este pedido já acumula pontos.'}</span>;
              const all = bal - (bal % 100);
              const opts = [...new Set([100, 200, 500].filter(p => p <= bal).concat(all))];
              return (
                <div className="nv-box" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{ fontSize: 14 }}>Você tem <b style={{ color: 'var(--warn)' }}>{bal} pontos VG</b> · valem até <b style={{ color: 'var(--warn)' }}>{nvFmt(ptsValue(all))}</b></span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {opts.map(p => (
                      <button key={p} onClick={() => setAppliedPoints(p)} style={{ height: 40, padding: '0 12px', borderRadius: 10, border: '1px solid rgba(255,196,107,.45)', background: 'transparent', color: 'var(--warn)', fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        {p === all && p !== 100 && p !== 200 && p !== 500 ? `Usar tudo (${p})` : `${p} pts`} · −{nvFmt(ptsValue(p))}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </section>

          <section className="nv-sec">
            <div className="nv-row"><span>Subtotal</span><b>{nvFmt(myTotal)}</b></div>
            {bundleDiscount > 0 && <div className="nv-row"><span>Combos</span><b style={{ color: 'var(--ac)' }}>− {nvFmt(bundleDiscount)}</b></div>}
            {pointsDiscount > 0 && <div className="nv-row"><span>Pontos VG ({appliedPoints} pts)</span><b style={{ color: 'var(--warn)' }}>− {nvFmt(pointsDiscount)}</b></div>}
            {couponDiscount > 0 && <div className="nv-row"><span>Cupom</span><b style={{ color: 'var(--ac)' }}>− {nvFmt(couponDiscount)}</b></div>}
            <div className="nv-row"><span>Frete</span><b>{checkout.pagamento ? freight.label : '—'}</b></div>
            <div className="nv-total"><span style={{ fontSize: 16, fontWeight: 700 }}>Total</span><span style={{ fontFamily: "'Space Mono',monospace", fontSize: 22, fontWeight: 700 }}>{nvFmt(totalFinal)}</span></div>
            <label className="nv-check">
              <input type="checkbox" checked={!!disclaimer} onChange={() => setDisclaimer(d => !d)} />
              <span><b style={{ color: 'var(--tx)' }}>Aviso legal</b><br />Declaro que tenho 18 anos ou mais e que este produto é adquirido exclusivamente para fins de pesquisa científica.</span>
            </label>
            <button className="nv-btn" disabled={isSubmitting} onClick={submitOrder}>{isSubmitting ? 'Salvando pedido...' : `Enviar pedido · ${nvFmt(totalFinal)}`}</button>
            <span style={{ textAlign: 'center', fontSize: 12, color: 'var(--mu2)' }}>Abrimos o WhatsApp com seu pedido para combinar o pagamento.</span>
          </section>
        </>}
      </div>
    );
  }

  if (screen === 'done') {
    body = (
      <div className="nv-wrap nv-narrow" style={{ paddingTop: 48, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 36, background: 'rgba(0,229,195,.12)', border: '1.5px solid var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ac)' }}><NvIcon d={NV_ICONS.check} size={34} w={2.4} /></div>
          <h1 className="nv-h1" style={{ fontSize: 28 }}>Pedido recebido!</h1>
          <p className="nv-sub">Abrimos o WhatsApp com o seu pedido. O pagamento é combinado por lá.</p>
        </div>
        {doneCode && <div className="nv-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--mu)' }}>Código do pedido</span>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 18, fontWeight: 700, letterSpacing: 1, color: 'var(--ac)' }}>{doneCode}</span>
        </div>}
        <button className="nv-btn2" onClick={() => { setTrackQuery(doneCode || ''); go('rastrear'); if (doneCode) searchOrders(doneCode); }}>Acompanhar pedido</button>
        <button className="nv-btn2" style={{ border: 'none', color: 'var(--mu)' }} onClick={() => go('loja')}>Voltar para a loja</button>
      </div>
    );
  }

  if (screen === 'rastrear') {
    body = (
      <div className="nv-wrap nv-narrow" style={{ paddingBottom: 30 }}>
        <Back title="Rastrear pedido" />
        <div className="nv-f">
          <label htmlFor="nv-cod">Código do pedido (veio no WhatsApp)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input id="nv-cod" value={trackQuery} placeholder="VG-XXXXXX" onChange={e => setTrackQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchOrders()} style={{ fontFamily: "'Space Mono',monospace", letterSpacing: 1 }} />
            <button onClick={() => searchOrders()} disabled={trackLoading} style={{ height: 50, padding: '0 18px', borderRadius: 12, border: 'none', background: 'var(--ac)', color: '#04110e', fontWeight: 700, cursor: 'pointer' }}>{trackLoading ? '...' : 'Buscar'}</button>
          </div>
        </div>
        {trackResults && trackResults.length === 0 && <div className="nv-box" style={{ marginTop: 16 }}>Nenhum pedido com esse código. Confira o código no WhatsApp.</div>}
        {(trackResults || []).map(o => {
          const steps = ['pendente', 'pago', 'enviado', 'entregue'];
          const at = steps.indexOf(o.status);
          return (
            <section key={o.id} className="nv-box" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 16, fontWeight: 700, color: 'var(--ac)' }}>{o.code}</span>
                <span style={{ padding: '5px 10px', borderRadius: 8, background: 'rgba(0,168,255,.14)', color: '#7cc9ff', fontSize: 12, fontWeight: 700 }}>{statusLabel(o.status)}</span>
              </div>
              <div>
                {['Pedido recebido', 'Pagamento confirmado', 'Enviado', 'Entregue'].map((t, i) => (
                  <div key={t} className="nv-step">
                    <i><b className={i <= at ? 'on' : ''} />{i < 3 && <u />}</i>
                    <span style={{ fontSize: 15, fontWeight: 600, marginTop: -3, color: i <= at ? 'var(--tx)' : 'var(--mu)' }}>{t}</span>
                  </div>
                ))}
              </div>
              {o.tracking_code && <>
                <div className="nv-line" style={{ borderTop: '1px solid var(--ln)', paddingTop: 12 }}><span style={{ color: 'var(--mu)' }}>Rastreio</span><b style={{ fontFamily: "'Space Mono',monospace" }}>{o.tracking_code}</b></div>
                <a className="nv-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 50 }} href={`https://melhorrastreio.com.br/rastreio/${o.tracking_code}`} target="_blank" rel="noreferrer">Ver rastreio completo</a>
              </>}
            </section>
          );
        })}
      </div>
    );
  }

  if (screen === 'frete') {
    // Simulador de frete (o mesmo do #/frete antigo: Melhor Envios, cotação pública, mostra o pior prazo + 5 dias)
    const maxDays = freteResults && freteResults.length ? Math.max(...freteResults.map(s => s.delivery_time || 0)) : 0;
    body = (
      <div className="nv-wrap nv-narrow" style={{ paddingBottom: 30 }}>
        <Back title="Simular frete" />
        <p className="nv-sub" style={{ margin: '0 0 14px' }}>Consulte o prazo de entrega para o seu CEP. No PIX o frete é grátis.</p>
        <div className="nv-f">
          <label htmlFor="nv-frete-cep">CEP de entrega</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input id="nv-frete-cep" inputMode="numeric" value={freteDestCep} placeholder="00000-000"
              onChange={e => setFreteDestCep(e.target.value.replace(/[^\d-]/g, '').slice(0, 9))}
              onKeyDown={e => e.key === 'Enter' && calcularFrete()} style={{ fontFamily: "'Space Mono',monospace", letterSpacing: 1, minWidth: 0 }} />
            <button onClick={() => calcularFrete()} disabled={freteLoading} style={{ height: 50, padding: '0 18px', borderRadius: 12, border: 'none', background: 'var(--ac)', color: '#04110e', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>{freteLoading ? '...' : 'Calcular'}</button>
          </div>
        </div>
        {freteError && <div className="nv-box" role="alert" style={{ marginTop: 16, color: '#ff8a8a', borderColor: 'rgba(255,80,80,.3)' }}>{freteError}</div>}
        {freteResults && freteResults.length > 0 && (
          <section className="nv-box" style={{ marginTop: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', color: 'var(--mu2)' }}>Estimativa de entrega</span>
            <b style={{ fontSize: 40, lineHeight: 1.1, color: 'var(--ac)' }}>até {maxDays + 5}</b>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: 'var(--mu)' }}>dias úteis após o envio</span>
            <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--mu)', marginTop: 6 }}>Na maioria dos casos chega antes. Este é o prazo máximo, no pior cenário para a sua região.</span>
          </section>
        )}
        <button className="nv-btn2" style={{ marginTop: 18, width: '100%' }} onClick={() => go('loja')}>Ver produtos</button>
      </div>
    );
  }

  if (screen === 'calc') {
    body = <div className="nv-wrap nv-narrow"><Back title="Calculadora de dose" /><CalcView /></div>;
  }

  if (screen === 'faq') {
    body = (
      <div className="nv-wrap nv-narrow">
        <Back title="Dúvidas" />
        {FAQ_SECTIONS.map((sec, si) => (
          <section key={si} style={{ marginTop: 18 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', color: 'var(--mu2)' }}>{sec.title}</h2>
            {sec.items.map((it, ii) => {
              const id = si + '-' + ii, open = faqOpen === id;
              return (
                <div key={id} className="nv-faq" style={{ borderBottom: '1px solid var(--ln)' }}>
                  <button aria-expanded={open} onClick={() => setFaqOpen(open ? null : id)}>
                    <span>{it.q}</span>
                    <span style={{ color: 'var(--ac)', transform: open ? 'rotate(180deg)' : 'none', display: 'flex' }}><NvIcon d={NV_ICONS.chev} size={18} w={2} /></span>
                  </button>
                  {open && <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.55, color: 'var(--mu)' }}>{it.a}</p>}
                </div>
              );
            })}
          </section>
        ))}
      </div>
    );
  }

  if (!body) body = (
    <div className="nv-wrap nv-narrow" style={{ paddingTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {screen === 'artigo' && <p className="nv-sub">Artigo não encontrado.</p>}
      {screen === 'produto' && <p className="nv-sub">{products.length ? 'Produto não encontrado. Ele pode ter saído do catálogo.' : 'Carregando produto...'}</p>}
      <button className="nv-btn2" onClick={() => go('loja')}>Ver todos os produtos</button>
    </div>
  );

  return (
    <div className="nv">
      <style>{NOVO_CSS}</style>
      {header}
      {screen === 'loja' && <NvSorteio products={products} go={go} />}
      {screen === 'loja' && <NvInstallBanner />}
      {screen === 'loja' && <div className="nv-strip"><span>PIX com <b style={{ color: 'var(--ac)' }}>frete grátis</b></span><span>Envio rápido</span><span>Pureza ≥ 99%</span></div>}
      <div role="main">{body}</div>
      {footer}
      {cartBar}
      {pre && (
        <div className="nv-sheet" onClick={e => { if (e.target === e.currentTarget) setPre(null); }}>
          <div role="dialog" aria-label="Reservar produto">
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', color: 'var(--warn)' }}>Lote esgotado</span>
            <h2 className="nv-h1" style={{ fontSize: 24 }}>Garanta {pre.product.name} no próximo lote</h2>
            <p className="nv-sub">Sem pagar agora. Quando o lote chegar, avisamos no WhatsApp por ordem de reserva.</p>
            <div className="nv-f"><label htmlFor="nv-pn">Seu nome</label><input id="nv-pn" value={pre.name} onChange={e => setPre({ ...pre, name: e.target.value })} /></div>
            <div className="nv-f"><label htmlFor="nv-pw">WhatsApp</label><input id="nv-pw" inputMode="tel" value={pre.whatsapp} onChange={e => setPre({ ...pre, whatsapp: e.target.value })} /></div>
            <div className="nv-line"><span style={{ fontWeight: 600 }}>Quantidade</span>
              <span className="nv-mini"><button onClick={() => setPre({ ...pre, qty: Math.max(1, pre.qty - 1) })} aria-label="Menos um">−</button><span style={{ minWidth: 26, textAlign: 'center', fontFamily: "'Space Mono',monospace" }}>{pre.qty}</span><button onClick={() => setPre({ ...pre, qty: Math.min(20, pre.qty + 1) })} aria-label="Mais um">+</button></span>
            </div>
            <button className="nv-btn" onClick={() => {
              if (!pre.name.trim() || pre.whatsapp.replace(/\D/g, '').length < 10) return;
              savePreorder(pre.product, { name: pre.name.trim(), whatsapp: pre.whatsapp, qty: pre.qty });
              setPre(null);
            }}>Entrar na lista</button>
            <button className="nv-btn2" style={{ border: 'none', color: 'var(--mu)' }} onClick={() => setPre(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [orders, setOrders] = useState(loadOrders);
  const [products, setProducts] = useState(loadProducts);
  const [stock, setStock] = useState(loadStock);
  // ── HASH ROUTING ─────────────────────────────────────────────────────────────
  function parseHash(hash) {
    const h = (hash || window.location.hash).replace(/^#\/?/, '');
    if (!h || h === 'catalogo' || h === 'catalog') return { view: 'catalog', productSlug: null };
    if (h === 'blog' || h === 'artigos') return { view: 'blog', productSlug: null };
    if (h === 'faq') return { view: 'faq', productSlug: null };
    if (h === 'carrinho' || h === 'cart') return { view: 'cart', productSlug: null };
    if (h === 'calcular' || h === 'calc') return { view: 'calc', productSlug: null };
    if (h === 'frete') return { view: 'frete', productSlug: null };
    if (h === 'admin') return { view: 'admin', productSlug: null };
    if (h.startsWith('produto/')) return { view: 'detail', productSlug: h.replace('produto/', '') };
    return { view: 'catalog', productSlug: null };
  }

  const hashInit = parseHash();
  const [view, setViewState] = useState(hashInit.view);
  const [activeCat, setActiveCat] = useState("all");

  function setView(v, product) {
    setViewState(v);
    let hash = '';
    if (v === 'catalog')     hash = '#/catalogo';
    else if (v === 'blog')   hash = '#/blog';
    else if (v === 'faq')    hash = '#/faq';
    else if (v === 'cart')   hash = '#/carrinho';
    else if (v === 'calc')   hash = '#/calcular';
    else if (v === 'frete')  hash = '#/frete';
    else if (v === 'admin')  hash = '#/admin';
    else if (v === 'detail' && product) hash = `#/produto/${product.id}`;
    else if (v === 'detail' && selectedProduct) hash = `#/produto/${selectedProduct.id}`;
    else hash = '#/catalogo';
    window.history.pushState(null, '', hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  React.useEffect(() => {
    // Restore product on deep link to /produto/slug
    const { view: initView, productSlug } = parseHash();
    if (initView === 'detail' && productSlug && products.length) {
      const found = products.find(p => p.id === productSlug);
      if (found) { setSelectedProduct(found); setViewState('detail'); }
      else setViewState('catalog');
    }
    // Handle browser back/forward
    function onPop() {
      const { view: v, productSlug: slug } = parseHash();
      setViewState(v);
      if (v === 'detail' && slug) {
        const found = products.find(p => p.id === slug);
        if (found) setSelectedProduct(found);
      }
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);  // eslint-disable-line
  const [myName, setMyName] = useState(() => localStorage.getItem("vg-nome") || "");
  const [toast, setToast]   = useState(null);
  const toastTimerRef = React.useRef(null);
  const [modal, setModal]   = useState(null);
  const [formQty, setFormQty] = useState(1);
  const [formName, setFormName] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const adminLockRef = React.useRef({ attempts: 0, until: 0 }); // session-only, cannot be cleared via localStorage
  const adminPwRef = React.useRef(''); // senha só em memória, usada p/ ler/gravar a pool de remetentes no Supabase
  const [adminTab, setAdminTab] = useState("pedidos");
  const [prodForm, setProdForm] = useState(null); // null = fechado, {} = novo, {id} = editando
  const [packForm, setPackForm] = useState(null); // null = fechado, {} = novo pack em edição
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameModalInput, setNameModalInput] = useState("");
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem("vg-welcomed") && !localStorage.getItem("vg-nome"));
  const [isLoading, setIsLoading] = useState(!!sb);
  const [checkout, setCheckout] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vg-checkout') || 'null') || { nomeCompleto:'', cpf:'', telefone:'', email:'', cep:'', estado:'', cidade:'', bairro:'', rua:'', numero:'', complemento:'', pagamento:'', observacoes:'' }; } catch { return { nomeCompleto:'', cpf:'', telefone:'', email:'', cep:'', estado:'', cidade:'', bairro:'', rua:'', numero:'', complemento:'', pagamento:'', observacoes:'' }; }
  });
  const [checkoutErrors, setCheckoutErrors] = useState({});
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [notifyInputs, setNotifyInputs] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [prevView, setPrevView] = useState(null);
  const [notices, setNotices] = useState(()=>{ try { return JSON.parse(localStorage.getItem('vg-notices')||JSON.stringify([{ id:1, type:'warn', text:'Devido à alta demanda de alguns produtos, recomendamos que você faça a reserva do seu pedido para não correr o risco de ficar sem.' }])); } catch { return [{ id:1, type:'warn', text:'Devido à alta demanda de alguns produtos, recomendamos que você faça a reserva do seu pedido para não correr o risco de ficar sem.' }]; } });
  const [dismissedNotices, setDismissedNotices] = useState([]);
  const [noticeInput, setNoticeInput] = useState({type:'warn',text:''});
  const [preorders, setPreorders] = useState(()=>{ try { return JSON.parse(localStorage.getItem('vg-preorders')||'[]'); } catch { return []; } });
  const [portalToken, setPortalToken] = useState(()=>{
    const params = new URLSearchParams(window.location.search);
    return params.get('preorder') || null;
  });
  const [manualOrderView] = useState(()=>{
    const params = new URLSearchParams(window.location.search);
    return params.get('pedido') !== null;
  });
  const [manualForm, setManualForm] = useState({ nomeCompleto:'', cpf:'', telefone:'', email:'', cep:'', rua:'', numero:'', complemento:'', bairro:'', cidade:'', estado:'', pagamento:'pix', observacoes:'' });
  const [manualItems, setManualItems] = useState([]); // [{peptideId, qty}]
  const [manualErrors, setManualErrors] = useState({});
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(null); // {code, total}
  const [openFaq, setOpenFaq] = useState(null);
  const [openGuide, setOpenGuide] = useState(null);
  const [prodSearch, setProdSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [artForm, setArtForm] = useState(null);
  const [adminPoForm, setAdminPoForm] = useState(null);
  const [adminPoEditModal, setAdminPoEditModal] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [editItemsMode, setEditItemsMode] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null); // form de dados do cliente/endereço do pedido (antes da etiqueta)
  const canEditCustomer = o => !!o && !o.me_order_id && !['enviado','entregue','cancelado'].includes(o.status||'pendente');
  function openEditCustomer(o) {
    const a = o._address || o.address || {};
    setEditCustomer({ buyerName: o.buyerName||'', cpf: o._cpf||'', phone: o._phone||'', email: o._email||'', cep: a.cep||'', rua: a.rua||'', numero: a.numero||'', complemento: a.complemento||'', bairro: a.bairro||'', cidade: a.cidade||'', estado: a.estado||'' });
  }
  async function editCustomerCep(v) {
    setEditCustomer(f => ({ ...f, cep: v }));
    const clean = v.replace(/\D/g, '');
    if (clean.length !== 8) return;
    try {
      const d = await (await fetch(`https://viacep.com.br/ws/${clean}/json/`)).json();
      if (!d.erro) setEditCustomer(f => ({ ...f, rua: d.logradouro || f.rua, bairro: d.bairro || f.bairro, cidade: d.localidade || f.cidade, estado: d.uf || f.estado }));
    } catch {}
  }
  async function saveEditCustomer() {
    const f = editCustomer, o = orderDetail;
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) { showToast('E-mail inválido', 'error'); return; }
    if (f.cpf && !validarCPF(f.cpf)) { showToast('CPF inválido', 'error'); return; }
    const address = { ...(o._address || o.address || {}), rua: f.rua.trim(), numero: f.numero.trim(), complemento: f.complemento.trim(), bairro: f.bairro.trim(), cidade: f.cidade.trim(), estado: normUF(f.estado), cep: f.cep.trim() };
    const patch = { buyer_name: f.buyerName.trim(), cpf: f.cpf.trim(), phone: f.phone.trim(), email: f.email.trim(), address };
    if (sb && o._supabase) {
      const { error } = await sb.from('orders').update(patch).eq('id', o.id);
      if (error) { showToast('Erro ao salvar: ' + error.message, 'error'); return; }
    }
    const updated = { ...o, buyerName: patch.buyer_name, _cpf: patch.cpf, _phone: patch.phone, _email: patch.email, _address: address, address };
    persistOrders(orders.map(x => x.id === o.id ? updated : x));
    setOrderDetail(updated); setEditCustomer(null);
    showToast('Dados do pedido atualizados');
  }
  const [editItems, setEditItems] = useState([]);
  const [addItemProductId, setAddItemProductId] = useState('');
  const [discountInput, setDiscountInput] = useState(null); // null = fechado, string = editando
  const [discountSaving, setDiscountSaving] = useState(false);
  const MANUAL_ORDER_EMPTY = { name:'', cpf:'', phone:'', email:'', cep:'', rua:'', numero:'', complemento:'', bairro:'', cidade:'', estado:'', payment:'pix', notes:'', items:[] };
  const [manualOrderModal, setManualOrderModal] = useState(false);
  const [manualOrder, setManualOrder] = useState(MANUAL_ORDER_EMPTY);
  const [manualCustomerSearch, setManualCustomerSearch] = useState('');
  const [manualOrderSubmitting, setManualOrderSubmitting] = useState(false);
  const [manualAddItemId, setManualAddItemId] = useState('');
  const [manualPasteOpen, setManualPasteOpen] = useState(false);
  const [manualPasteText, setManualPasteText] = useState('');
  const [legalModal, setLegalModal] = useState(null); // 'privacy' | 'terms'
  const [preorderModal, setPreorderModal] = useState(null); // {peptide}
  const [preorderLocked, setPreorderLocked] = useState(()=> localStorage.getItem('vg-preorder-locked') === 'true');
  const [preorderForm, setPreorderForm] = useState({name:'', whatsapp:'', qty:1});
  const [trackModal, setTrackModal] = useState(false);
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResults, setTrackResults] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [orderSuccessCode, setOrderSuccessCode] = useState(null);
  const [coupons, setCoupons] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-coupons')||'[]'); } catch { return []; } });
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState(null);
  const [productPromo, setProductPromo] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-promo')||'{}'); } catch { return {}; } });
  const [importForm, setImportForm] = useState({ label:'', date: new Date().toLocaleDateString('pt-BR'), cambio:'', freteUsd:'', fedexBrl:'', desconto:'', outrosBrl:'', invoiceTotal:'', items:[{sku:'',name:'',spec:'',boxes:'',priceUsd:'',precoSugOverride:'',precoVenda:''}] });
  const [importHistory, setImportHistory] = useState(()=>{ try { return JSON.parse(localStorage.getItem('vg-imports')||'[]'); } catch { return []; } });
  const [stockLots, setStockLots] = useState(()=>{ try { return JSON.parse(localStorage.getItem('vg-stock-lots')||'{}'); } catch { return {}; } });
  const [editingImportId, setEditingImportId] = useState(null);
  const [despesas, setDespesas] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-expenses')||'[]'); } catch { return []; } });
  const [despesaForm, setDespesaForm] = useState({ desc:'', valor:'', categoria:'outros', data: new Date().toLocaleDateString('pt-BR') });
  const [shippingCosts, setShippingCosts] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-shipping-costs')||'{}'); } catch { return {}; } });
  const [purchaseOrders, setPurchaseOrders] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-purchase-orders')||'[]'); } catch { return []; } });
  const [poForm, setPoForm] = useState({ productId:'', qty:'', note:'' });
  const [adminPwModal, setAdminPwModal] = useState(false);
  const [adminPwInput, setAdminPwInput] = useState('');
  const [showStickyDetailCta, setShowStickyDetailCta] = useState(false);
  const detailActionsRef = React.useRef(null);
  function persistDespesas(d) { setDespesas(d); localStorage.setItem('vg-expenses', JSON.stringify(d)); }
  function persistShippingCosts(s) { setShippingCosts(s); localStorage.setItem('vg-shipping-costs', JSON.stringify(s)); }
  function persistPurchaseOrders(pos) { setPurchaseOrders(pos); localStorage.setItem('vg-purchase-orders', JSON.stringify(pos)); }
  function addPurchaseOrder() {
    if (!poForm.productId || !poForm.qty || parseInt(poForm.qty) <= 0) { showToast('Selecione o produto e a quantidade', 'error'); return; }
    const newPo = { id: Date.now().toString(), productId: poForm.productId, qty: parseInt(poForm.qty), note: poForm.note, status: 'pending', date: new Date().toLocaleDateString('pt-BR') };
    persistPurchaseOrders([...purchaseOrders, newPo]);
    if (sb) sb.from('purchase_order_caps').insert({ id: newPo.id, product_id: newPo.productId, qty: newPo.qty, note: newPo.note||null, status: newPo.status, date_str: newPo.date }).then(({error})=>{ if(error) console.warn('[Supabase] PO insert:', error.message); });
    setPoForm({ productId:'', qty:'', note:'' });
    showToast('Pedido de reposição registrado ✓');
  }
  function receivePurchaseOrder(id) {
    const po = purchaseOrders.find(p => p.id === id);
    if (!po) return;
    persistPurchaseOrders(purchaseOrders.map(p => p.id === id ? { ...p, status: 'received' } : p));
    if (sb) sb.from('purchase_order_caps').update({ status: 'received' }).eq('id', id).then(({error})=>{ if(error) console.warn('[Supabase] PO update:', error.message); });
    const pName = products.find(p => p.id === po.productId)?.name || po.productId;
    showToast(`Pedido de "${pName}" marcado como recebido ✓`);
  }
  function removePurchaseOrder(id) {
    persistPurchaseOrders(purchaseOrders.filter(p => p.id !== id));
    if (sb) sb.from('purchase_order_caps').delete().eq('id', id).then(({error})=>{ if(error) console.warn('[Supabase] PO delete:', error.message); });
  }
  const [cambioInfo, setCambioInfo] = useState({ loading: false, hora: null, error: null });
  const [meSettings, setMeSettings] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-me-settings')||'null'); } catch { return null; } });
  const [etiquetaModal, setEtiquetaModal] = useState(null); // order being processed
  const [etiquetaStep, setEtiquetaStep] = useState('idle'); // idle | settings | select | confirm | loading | done | error
  const [etiquetaResult, setEtiquetaResult] = useState(null);
  const [etiquetaError, setEtiquetaError] = useState('');
  const [meServices, setMeServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [mePool, setMePool] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-me-pool')||'null') || DEFAULT_ME_POOL; } catch { return DEFAULT_ME_POOL; } });
  async function callSendersApi(action, pool) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/me-senders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
      body: JSON.stringify({ password: adminPwRef.current, action, pool }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }
  const persistPool = p => {
    setMePool(p); localStorage.setItem('vg-me-pool', JSON.stringify(p));
    if (adminPwRef.current) callSendersApi('set', p).catch(e => { console.warn('[me-senders] save:', e.message); showToast('Pool salva só neste navegador — falha ao sincronizar', 'error'); });
  };
  React.useEffect(() => {
    if (!adminUnlocked || !adminPwRef.current) return;
    callSendersApi('get').then(({ pool }) => {
      if (Array.isArray(pool) && pool.length) { setMePool(pool); localStorage.setItem('vg-me-pool', JSON.stringify(pool)); }
      else if (mePool.length) callSendersApi('set', mePool).catch(() => {}); // primeira sync: sobe a pool local
    }).catch(e => console.warn('[me-senders] load:', e.message));
  }, [adminUnlocked]);
  const [meEnv, setMeEnvState] = useState(() => { try { return localStorage.getItem('vg-me-env') === 'sandbox' ? 'sandbox' : 'prod'; } catch { return 'prod'; } });
  const isSandbox = meEnv === 'sandbox';
  const [meTestPool, setMeTestPool] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-me-pool-test')||'null') || TEST_ME_POOL; } catch { return TEST_ME_POOL; } });
  const persistTestPool = p => { const t = p.map(x => ({ ...x, _test: true })); setMeTestPool(t); localStorage.setItem('vg-me-pool-test', JSON.stringify(t)); };
  const activePool = isSandbox ? meTestPool : mePool.filter(x => !isTestSender(x));
  const persistActivePool = p => isSandbox ? persistTestPool(p) : persistPool(p);
  function setMeEnv(env) {
    setMeEnvState(env); localStorage.setItem('vg-me-env', env);
    // remetente ativo é separado por ambiente: produção usa o salvo, teste começa vazio
    if (env === 'sandbox') setMeSettings(null);
    else { try { const s = JSON.parse(localStorage.getItem('vg-me-settings')||'null'); setMeSettings(isTestSender(s) ? null : s); } catch { setMeSettings(null); } }
    setMeBalance(null);
  }
  const [poolRecovering, setPoolRecovering] = useState(false);
  async function recoverPoolFromME() {
    setPoolRecovering(true);
    try {
      const found = [];
      for (let page = 1, last = 1; page <= last; page++) {
        const r = await callME(`/me/orders?per_page=100&page=${page}`);
        last = r.last_page || 1;
        for (const o of (r.data || [])) {
          const f = o.from || {}; const doc = (f.document || '').replace(/\D/g, '');
          if (!f.name || doc.length !== 11 || !validarCPF(doc) || BLOCKED_SENDER_DOCS.has(doc)) continue;
          const key = doc + '|' + (f.postal_code || '');
          if (found.some(x => x.document + '|' + x.postal_code === key)) continue;
          found.push({ name: f.name, document: doc, phone: f.phone || '', email: f.email || '', address: f.address || '', number: f.number || '', complement: f.complement || '', district: f.district || '', city: f.city || '', state: normUF(f.state_abbr || f.state || ''), postal_code: (f.postal_code || '').replace(/\D/g, '') });
        }
      }
      const fresh = found.filter(x => !mePool.some(m => (m.document || '').replace(/\D/g, '') === x.document && (m.postal_code || '').replace(/\D/g, '') === x.postal_code));
      if (fresh.length) { persistPool([...mePool, ...fresh]); showToast(`${fresh.length} remetente(s) recuperado(s) do Melhor Envios`); }
      else showToast('Nenhum remetente novo no histórico do Melhor Envios');
    } catch (e) { showToast('Erro ao consultar Melhor Envios: ' + e.message, 'error'); }
    setPoolRecovering(false);
  }
  const [meBalance, setMeBalance] = useState(null); // null | { value, loading, error }
  async function fetchMeBalance() {
    setMeBalance({ loading: true });
    try {
      const res = await callME('/me', 'GET', null, meEnv);
      const full = JSON.stringify(res);
      console.log('[ME /me full]', full);
      const val = res?.accounts?.[0]?.balance ?? null;
      if (val === null) throw new Error(full);
      const numVal = parseFloat(val);
      setMeBalance({ value: numVal });
      if (numVal < 20) addNotif('balance', '⚠️ Saldo ME baixo', `Carteira Melhor Envios: R$ ${numVal.toFixed(2)}. Adicione saldo para gerar etiquetas.`);
    } catch(e) {
      setMeBalance({ error: e.message });
    }
  }
  const [declNome, setDeclNome] = useState('Peptídeo');
  const [declQtd, setDeclQtd] = useState('1');
  const [declValor, setDeclValor] = useState('');
  const [freteDestCep, setFreteDestCep] = useState('');
  const [freteResults, setFreteResults] = useState(null);
  const [freteLoading, setFreteLoading] = useState(false);
  const [freteError, setFreteError] = useState('');
  const [freteOriginCep, setFreteOriginCep] = useState('');

  const [declPeso, setDeclPeso] = useState('0.3');
  const [declLarg, setDeclLarg] = useState('6');
  const [declAlt, setDeclAlt] = useState('5');
  const [declComp, setDeclComp] = useState('12');
  const [editingRem, setEditingRem] = useState(false);
  const [editTrackInput, setEditTrackInput] = useState(null); // null = fechado, string = editando
  const [meForm, setMeForm] = useState({ name:'', phone:'', email:'', document:'', address:'', number:'', complement:'', district:'', city:'', state:'', postal_code:'' });
  const [customers, setCustomers] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-customers')||'[]'); } catch { return []; } });
  const [appliedPoints, setAppliedPoints] = useState(0);
  // Combos cadastrados (site_config.bundles; cache local + seed DEFAULT_BUNDLES)
  const [bundles, setBundles] = useState(loadBundlesCache);
  const [bestsellers, setBestsellers] = useState(loadBestsellersCache); // site_config.bestsellers (SKUs/ids em ordem)
  const [bundleForm, setBundleForm] = useState(null); // admin: combo em edição
  // Combos adicionados pelo /novo (ids de bundles); desconto calculado em bundleInfo
  const [cartBundles, setCartBundlesState] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-cart-bundles') || '[]'); } catch { return []; } });
  function setCartBundles(ids) { setCartBundlesState(ids); try { localStorage.setItem('vg-cart-bundles', JSON.stringify(ids)); } catch {} }
  const [pointsBalance, setPointsBalance] = useState(null); // null | {cpf,points,...}
  const [pointsConfig, setPointsConfig] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-points-config')||'null') || { rate: 1, redeem: 5 }; } catch { return { rate: 1, redeem: 5 }; } });
  const [pixModal, setPixModal] = useState(null); // order | null
  const [pixCode, setPixCode] = useState('');
  const [clientList, setClientList] = useState([]); // aba Clientes
  const [adjustModal, setAdjustModal] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState('');
  const [cfgRate, setCfgRate] = useState(() => String(JSON.parse(localStorage.getItem('vg-points-config')||'null')?.rate || 1));
  const [cfgRedeem, setCfgRedeem] = useState(() => String(JSON.parse(localStorage.getItem('vg-points-config')||'null')?.redeem || 5));
  const [disclaimer, setDisclaimer] = useState(false);
  const [adminStatusFilter, setAdminStatusFilter] = useState('all');
  const [waAuto, setWaAuto] = useState(() => { try { return localStorage.getItem('vg-wa-auto') === '1'; } catch { return false; } }); // abrir WhatsApp ao mudar status (padrão: desligado)
  function toggleWaAuto(v) { setWaAuto(v); try { localStorage.setItem('vg-wa-auto', v ? '1' : '0'); } catch {} }
  const [nvaSec, setNvaSec] = useState('pedidos'); // item do menu do admin no /novo (Etiquetas = Pedidos filtrado)
  const [nvaSelOrder, setNvaSelOrder] = useState(null); // pedido aberto no painel lateral (Pedidos no /novo, desktop largo)
  const [adminSearch, setAdminSearch] = useState('');
  const [adminPage, setAdminPage] = useState(1);
  const [groupByClient, setGroupByClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInStock, setFilterInStock] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [carouselTouchX, setCarouselTouchX] = useState(null);

  // ── Notifications ──────────────────────────────────────────────────────────
  const [notifs, setNotifs] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-notifs')||'[]'); } catch { return []; } });
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifs.filter(n => !n.read).length;

  function addNotif(type, title, body, meta={}) {
    const n = { id: Date.now().toString(36) + Math.random().toString(36).slice(2), type, title, body, meta, ts: Date.now(), read: false };
    setNotifs(prev => {
      const dup = prev.find(x => x.type === type && x.body === body && (Date.now() - x.ts) < 30000);
      if (dup) return prev;
      const updated = [n, ...prev].slice(0, 60);
      localStorage.setItem('vg-notifs', JSON.stringify(updated));
      return updated;
    });
  }

  function markAllRead() {
    setNotifs(prev => { const u = prev.map(n => ({ ...n, read: true })); localStorage.setItem('vg-notifs', JSON.stringify(u)); return u; });
  }

  function clearNotifs() { setNotifs([]); localStorage.removeItem('vg-notifs'); }

  function timeAgo(ts) {
    const d = Date.now() - ts;
    if (d < 60000) return 'agora';
    if (d < 3600000) return `${Math.floor(d/60000)}min`;
    if (d < 86400000) return `${Math.floor(d/3600000)}h`;
    return `${Math.floor(d/86400000)}d`;
  }

  function loadArticles() { try { return JSON.parse(localStorage.getItem('vg-articles') || 'null') || DEFAULT_ARTICLES; } catch { return DEFAULT_ARTICLES; } }
  const [articles, setArticles] = useState(loadArticles);
  function persistArticles(a) { setArticles(a); localStorage.setItem('vg-articles', JSON.stringify(a)); }

  function statusLabel(s) {
    const k = s || 'pendente';
    return k === 'pendente'   ? '🟡 PENDENTE'
         : k === 'pago'       ? '✅ PAGO'
         : k === 'enviado'    ? '📦 ENVIADO'
         : k === 'entregue'   ? '🎉 ENTREGUE'
         : k === 'extraviado' ? '⚠️ EXTRAVIADO'
         : k.toUpperCase();
  }

  async function setOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    persistOrders(updated);
    addNotif('status', `🔄 ${order.buyerName || 'Pedido'} → ${newStatus}`, `${order._code || orderId} marcado como ${newStatus}`, { orderId });
    if (sb) {
      const { error } = await sb.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) {
        console.warn('[Supabase] Order status error:', error.message);
        showToast('Erro ao atualizar status. Revertendo...', 'error');
        persistOrders(orders);
      }
    }
  }

  async function markExtraviado(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    if (!window.confirm(`Marcar pedido ${order._code || orderId} como EXTRAVIADO?\n\nIsso registra os vials como perda total (100% prejuízo) no financeiro.`)) return;
    await setOrderStatus(orderId, 'extraviado');
    showToast('Pedido marcado como extraviado', 'error');
  }

  // Mensagem pronta de WhatsApp conforme o status do pedido (pago/enviado/entregue)
  function openStatusWhatsApp(order) {
    const newStatus = order.status;
    if (!['pago','enviado','entregue'].includes(newStatus) || !order._phone) return;
    const digits = order._phone.replace(/\D/g, '');
    const intlPhone = digits.startsWith('55') ? digits : '55' + digits;
    const firstName = (order.buyerName || 'Cliente').split(' ')[0];
    const code = order._code || '';
    const total = order._total ? `R$ ${order._total.toLocaleString('pt-BR')}` : '';
    const msg = newStatus === 'pago'
      ? `✅ *Olá, ${firstName}! Seu pagamento foi confirmado.*${code ? `\n\n📋 *Pedido:* ${code}` : ''}${total ? `\n💰 *Total:* ${total}` : ''}\n\nEstamos preparando seu pedido e avisaremos assim que for enviado. Qualquer dúvida, é só chamar!\n\n_Vanguard Peptides_ 🧬`
      : newStatus === 'enviado'
      ? `📦 *Olá, ${firstName}! Seu pedido foi enviado!*${code ? `\n\n📋 *Pedido:* ${code}` : ''}${total ? `\n💰 *Total:* ${total}` : ''}${order.tracking_code ? `\n\n🔍 *Código de rastreio:*\n${order.tracking_code}\n\n📲 Acompanhe aqui: https://melhorrastreio.com.br/rastreio/${order.tracking_code}` : `\n\nPara acompanhar, acesse vanguardpep.com → 📦 PEDIDO${code ? ` e use o código *${code}*` : ''}.`}\n\nQualquer dúvida é só chamar! 🙏\n\n_Vanguard Peptides_ 🧬`
      : `🎉 *Olá, ${firstName}! Seu pedido foi entregue!*${code ? `\n\n📋 *Pedido:* ${code}` : ''}\n\nEsperamos que você aproveite muito! Se tiver qualquer dúvida sobre o uso, estamos aqui para ajudar.\n\nObrigado pela confiança! 🙏\n\n_Vanguard Peptides_ 🧬`;
    window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // Pedido entregue por motoboy (DDD 11 / Grande SP): não precisa de etiqueta do Melhor Envios
  function isMotoboyOrder(order) {
    const d = ((order && (order._phone || order.phone)) || '').replace(/\D/g, '');
    return (d.startsWith('55') ? d.slice(2, 4) : d.slice(0, 2)) === '11';
  }

  async function cycleStatus(orderId) {
    const cycle = ['pendente','pago','enviado','entregue'];
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    if (order.status === 'extraviado') { showToast('Pedido extraviado — use o botão no detalhe para reverter','error'); return; }
    const idx = cycle.indexOf(order.status || 'pendente');
    const newStatus = cycle[(idx+1) % cycle.length];
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    persistOrders(updated);
    addNotif('status', `🔄 ${order.buyerName || 'Pedido'} → ${newStatus}`, `${order._code || orderId} marcado como ${newStatus}`, { orderId });
    // Sync to Supabase
    if (sb) {
      const { error } = await sb.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) {
        console.warn('[Supabase] Order status error:', error.message);
        showToast('Erro ao atualizar status. Revertendo...', 'error');
        persistOrders(orders);
        return;
      }
    }
    // WhatsApp automático (opcional) para pago/enviado/entregue
    if (waAuto) openStatusWhatsApp({ ...order, status: newStatus });
    if (newStatus === 'pago') awardPoints(order);
  }

  function persistOrders(o) { setOrders(o); saveOrders(o); }

  // Busca no Melhor Envios o código de rastreio de um pedido com etiqueta (o ME costuma liberar o código depois de gerar)
  const [trackFetching, setTrackFetching] = useState(false);
  async function fetchTrackingFromME(order, silent = false) {
    if (!order?.me_order_id || !adminPwRef.current) return;
    setTrackFetching(true);
    try {
      const r = await callME(`/me/orders/${order.me_order_id}`, 'GET');
      const code = (r?.tracking || r?.self_tracking || '').trim();
      if (code) {
        if (sb) await sb.from('orders').update({ tracking_code: code }).eq('id', order.id);
        setOrders(prev => { const u = prev.map(o => o.id === order.id ? { ...o, tracking_code: code } : o); saveOrders(u); return u; });
        setOrderDetail(d => d && d.id === order.id ? { ...d, tracking_code: code } : d);
        showToast('Rastreio vinculado: ' + code, 'success');
      } else if (!silent) showToast(r?.error ? 'Erro no Melhor Envios: ' + r.error : 'Melhor Envios ainda não liberou o código. Tente mais tarde.', r?.error ? 'error' : 'success');
    } catch (e) { if (!silent) showToast('Erro ao consultar Melhor Envios: ' + e.message, 'error'); }
    setTrackFetching(false);
  }
  React.useEffect(() => {
    if (orderDetail?.me_order_id && !orderDetail.tracking_code) fetchTrackingFromME(orderDetail, true);
  }, [orderDetail?.id]);

  async function saveTrackingManual(orderId, code) {
    const trimmed = (code||'').trim();
    if (sb) await sb.from('orders').update({ tracking_code: trimmed }).eq('id', orderId);
    const updated = orders.map(o => o.id === orderId ? { ...o, tracking_code: trimmed } : o);
    persistOrders(updated);
    setOrderDetail(d => ({ ...d, tracking_code: trimmed }));
    setEditTrackInput(null);
    showToast('Rastreio salvo!', 'success');
  }

  function sendTrackingWhatsApp(order) {
    const firstName = (order.buyerName||'Cliente').split(' ')[0];
    const code = order._code || order.code || '';
    const track = order.tracking_code;
    const msg = `📦 *Olá, ${firstName}!*\n\n🔍 *Código de rastreio do seu pedido${code?` ${code}`:''}:*\n${track}\n\n📲 Acompanhe aqui: https://melhorrastreio.com.br/rastreio/${track}\n\nQualquer dúvida é só chamar! 🙏\n\n_Vanguard Peptides_ 🧬`;
    const digits = (order._phone||order.phone||'').replace(/\D/g,'');
    const intl = digits.startsWith('55') ? digits : '55'+digits;
    window.open(`https://wa.me/${intl}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  const ME_PROXY = `https://aumubzvdhzvtnqfzqeqd.supabase.co/functions/v1/melhorenvios-proxy`;
  const ME_ANON  = 'sb_publishable_crfA-iUkVR2mnibsWQ2ZDA_wpwOBBY_';
  const BR_STATE_MAP = {'acre':'AC','alagoas':'AL','amapa':'AP','amapá':'AP','amazonas':'AM','bahia':'BA','ceara':'CE','ceará':'CE','distrito federal':'DF','espirito santo':'ES','espírito santo':'ES','goias':'GO','goiás':'GO','maranhao':'MA','maranhão':'MA','mato grosso do sul':'MS','mato grosso':'MT','minas gerais':'MG','para':'PA','pará':'PA','paraiba':'PB','paraíba':'PB','parana':'PR','paraná':'PR','pernambuco':'PE','piaui':'PI','piauí':'PI','rio de janeiro':'RJ','rio grande do norte':'RN','rio grande do sul':'RS','rondonia':'RO','rondônia':'RO','roraima':'RR','santa catarina':'SC','sao paulo':'SP','são paulo':'SP','sergipe':'SE','tocantins':'TO'};
  function normUF(s) { if (!s) return ''; const t = s.trim().toUpperCase(); if (t.length === 2) return t; const k = s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); return BR_STATE_MAP[k] || t.slice(0,2); }

  async function callME(path, method = 'GET', body = null, env = 'prod') {
    const res = await fetch(ME_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': ME_ANON },
      body: JSON.stringify({ path, method, body, env, password: adminPwRef.current }),
    });
    return res.json();
  }

  React.useEffect(() => {
    if (!sb) return;
    sb.from('site_config').select('value').eq('key','origin_cep').single()
      .then(({ data }) => { if (data?.value) setFreteOriginCep(data.value); });
    // Combos e regra de pontos: mesma fonte que a Edge Function create-order usa
    sb.from('site_config').select('key,value').in('key', ['bundles', 'points_config', 'bestsellers'])
      .then(({ data, error }) => {
        if (error || !Array.isArray(data)) return;
        const bs = data.find(r => r.key === 'bestsellers');
        if (bs) { const l = parseBestsellersCfg(bs.value); setBestsellers(l); try { localStorage.setItem('vg-bestsellers', JSON.stringify(l)); } catch {} }
        const b = data.find(r => r.key === 'bundles');
        if (b) { const list = parseBundlesCfg(b.value); setBundles(list); try { localStorage.setItem('vg-bundles', JSON.stringify(list)); } catch {} }
        const pc = data.find(r => r.key === 'points_config');
        if (pc) {
          try {
            const v = JSON.parse(pc.value); const rate = Number(v.rate), redeem = Number(v.redeem);
            if (rate > 0 && redeem > 0) {
              const cfg = { rate, redeem };
              setPointsConfig(cfg); setCfgRate(String(rate)); setCfgRedeem(String(redeem));
              try { localStorage.setItem('vg-points-config', JSON.stringify(cfg)); } catch {}
            }
          } catch {}
        }
      });
  }, []);

  async function calcularFrete() {
    const dest = freteDestCep.replace(/\D/g,'');
    if (dest.length !== 8) { setFreteError('CEP inválido. Digite os 8 dígitos.'); return; }
    if (!freteOriginCep) { setFreteError('CEP de origem não configurado. Configure no painel admin.'); return; }
    setFreteLoading(true); setFreteError(''); setFreteResults(null);
    try {
      const body = {
        from: { postal_code: freteOriginCep.replace(/\D/g,'') },
        to: { postal_code: dest },
        products: [{ id:'1', width:6, height:5, length:12, weight:0.3, insurance_value:200, quantity:1 }],
        services: '1,2,3,7,8,9',
        options: { receipt:false, own_hand:false, collect:false }
      };
      const res = await callME('/me/shipment/calculate', 'POST', body);
      const available = Array.isArray(res) ? res.filter(s => !s.error && s.price) : [];
      if (!available.length) throw new Error('Nenhum serviço disponível para este CEP.');
      setFreteResults(available);
    } catch(e) {
      setFreteError(e.message);
    }
    setFreteLoading(false);
  }

  async function gerarEtiqueta(order) {
    // Pick random sender from pool; fall back to meSettings if pool empty
    const fallback = meSettings && (isSandbox ? isTestSender(meSettings) : !isTestSender(meSettings)) ? [meSettings] : [];
    const pool = activePool.length ? activePool : fallback;
    if (!pool.length) { setEtiquetaModal(order); setEtiquetaStep('settings'); setMeForm({ name:'', phone:'', email:'', document:'', address:'', number:'', complement:'', district:'', city:'', state:'', postal_code:'' }); return; }
    const sender = pool[Math.floor(Math.random() * pool.length)];
    setMeSettings(sender); // update active sender so confirm step shows it
    setMeForm({...sender});
    setEtiquetaModal(order);
    setEtiquetaStep('loading');
    setEtiquetaError('');
    try {
      const addr = order._address || order.address || {};
      const fromCep = sender.postal_code.replace(/\D/g,'');
      const toCep = (addr.cep||'').replace(/\D/g,'');
      const calcBody = { from: { postal_code: fromCep }, to: { postal_code: toCep }, products: [{ id:'1', width: parseFloat(declLarg)||6, height: parseFloat(declAlt)||5, length: parseFloat(declComp)||12, weight: parseFloat(declPeso)||0.3, insurance_value: parseFloat(declValor)||order._total||100, quantity: parseInt(declQtd)||1 }], services:'1,2,3,7,8,9,15', options:{ receipt:false, own_hand:false, collect:false } };
      const calcRes = await callME('/me/shipment/calculate', 'POST', calcBody, meEnv);
      const availableRaw = Array.isArray(calcRes) ? calcRes.filter(s=>!s.error && s.price) : [];
      if (!availableRaw.length) throw new Error('[CALC] Nenhum serviço disponível para esta rota.\n' + JSON.stringify(calcRes));
      // Priorizar JET Express (id 15): mostra primeiro e auto-seleciona se disponível
      const isJet = s => { const id = parseInt(s.id); const name = ((s.company?.name||'')+' '+(s.name||'')).toLowerCase(); return id === 15 || name.includes('jet'); };
      const available = [...availableRaw].sort((a,b) => (isJet(b)?1:0) - (isJet(a)?1:0));
      setMeServices(available);
      const jetService = available.find(isJet);
      setSelectedService(jetService || null);
      setDeclValor(String(order._total || ''));
      setEditingRem(false);
      setEtiquetaStep('select');
      fetchMeBalance();
    } catch(e) {
      setEtiquetaError(e.message);
      setEtiquetaStep('error');
    }
  }

  async function confirmarEtiqueta() {
    const order = etiquetaModal;
    const sender = meSettings;
    const service = selectedService;
    if (!service) return;
    if (!isSandbox && isTestSender(sender)) { setEtiquetaError('Remetente de teste/fictício não pode ser usado em produção. Troque o remetente.'); setEtiquetaStep('error'); return; }
    setEtiquetaStep('loading');
    setEtiquetaError('');
    try {
      const addr = order._address || order.address || {};
      const fromCep = sender.postal_code.replace(/\D/g,'');
      const toCep   = (addr.cep||'').replace(/\D/g,'');

      // ME exige e-mail válido no destinatário; pedidos manuais podem não ter — usa o do remetente
      const isEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
      const custEmail = (order._email||order.email||'').trim();
      const toEmail = isEmail(custEmail) ? custEmail : (sender.email||'').trim();
      const cartBody = {
        service: service.id,
        from: { name: sender.name, phone: sender.phone.replace(/\D/g,''), email: sender.email, document: sender.document.replace(/\D/g,''), address: sender.address, number: sender.number, complement: sender.complement||'', district: sender.district, city: sender.city, state_abbr: normUF(sender.state), country_id: 'BR', postal_code: fromCep, note: '' },
        to: { name: order.buyerName||'Cliente', phone: (order._phone||'').replace(/\D/g,''), email: toEmail, document: (order._cpf||'').replace(/\D/g,''), address: addr.rua||'', number: addr.numero||'', complement: addr.complemento||'', district: addr.bairro||'', city: addr.cidade||'', state_abbr: normUF(addr.estado), country_id: 'BR', postal_code: toCep, note: '' },
        products: [{ name: declNome||'Peptídeo', quantity: parseInt(declQtd)||1, unitary_value: parseFloat(declValor)||order._total||100, weight: parseFloat(declPeso)||0.3 }],
        volumes: [{ height: parseFloat(declAlt)||5, width: parseFloat(declLarg)||6, length: parseFloat(declComp)||12, weight: parseFloat(declPeso)||0.3 }],
        options: { insurance_value: parseFloat(declValor)||order._total||100, receipt: false, own_hand: false, reverse: false, non_commercial: true, tags: [{ tag: order._code||order.id, url: null }] },
      };
      const cartRes = await callME('/me/cart', 'POST', cartBody, meEnv);
      if (!cartRes.id) { const errs = cartRes.errors ? Object.entries(cartRes.errors).map(([k,v])=>`${k}: ${Array.isArray(v)?v[0]:v}`).join('\n') : null; throw new Error(errs || cartRes.message || 'Erro ao criar envio'); }
      const meOrderId = cartRes.id;

      const checkoutRes = await callME('/me/shipment/checkout', 'POST', { orders: [meOrderId] }, meEnv);
      if (!checkoutRes.purchase) throw new Error(checkoutRes.error || checkoutRes.message || 'Falha no checkout');

      const genRes = await callME('/me/shipment/generate', 'POST', { orders: [meOrderId] }, meEnv);

      const printRes = await callME('/me/shipment/print', 'POST', { mode: 'public', orders: [meOrderId] }, meEnv);
      const labelUrl = printRes.url || printRes;

      const trackCode = cartRes.tracking || genRes[meOrderId]?.tracking || '';

      if (isSandbox) { // modo teste: não grava nada no pedido real nem no financeiro
        setEtiquetaResult({ meOrderId, trackCode, labelUrl: typeof labelUrl === 'string' ? labelUrl : '' });
        setEtiquetaStep('done'); return;
      }
      const shippingCost = service.price ? parseFloat(service.price) : 0;
      if (sb) await sb.from('orders').update({ me_order_id: meOrderId, tracking_code: trackCode, label_url: typeof labelUrl === 'string' ? labelUrl : '' }).eq('id', order.id);
      const updated = orders.map(o => o.id === order.id ? { ...o, me_order_id: meOrderId, tracking_code: trackCode, label_url: typeof labelUrl === 'string' ? labelUrl : '', shipping_cost: shippingCost } : o);
      persistOrders(updated);
      // Registrar custo de envio para financeiro
      if (shippingCost > 0) {
        const sc = { ...shippingCosts, [order.id]: { cost: shippingCost, carrier: service.name || service.company?.name || 'Transportadora', orderId: order.id, date: new Date().toLocaleDateString('pt-BR') } };
        persistShippingCosts(sc);
      }

      setEtiquetaResult({ meOrderId, trackCode, labelUrl: typeof labelUrl === 'string' ? labelUrl : '' });
      setEtiquetaStep('done');
    } catch(e) {
      setEtiquetaError(e.message);
      setEtiquetaStep('error');
    }
  }

  async function saveMeSettings() {
    const s = { ...meForm, state: (meForm.state||'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,2) };
    if (isSandbox) { s._test = true; setMeSettings(s); }
    else if (isTestSender(s)) { showToast('CPF de teste/fictício não pode ser remetente em produção', 'error'); return; }
    else { setMeSettings(s); localStorage.setItem('vg-me-settings', JSON.stringify(s)); }
    // After saving settings, fetch available services for this order
    const order = etiquetaModal;
    if (order?._poolOnly) { setEtiquetaModal(null); setEtiquetaStep('idle'); showToast(`Remetente ativo: ${s.name}`); return; }
    if (!order) { setEtiquetaStep('confirm'); return; }
    setEtiquetaStep('loading');
    setEtiquetaError('');
    try {
      const addr = order._address || order.address || {};
      const fromCep = s.postal_code.replace(/\D/g,'');
      const toCep = (addr.cep||'').replace(/\D/g,'');
      const calcBody = { from: { postal_code: fromCep }, to: { postal_code: toCep }, products: [{ id:'1', width: parseFloat(declLarg)||6, height: parseFloat(declAlt)||5, length: parseFloat(declComp)||12, weight: parseFloat(declPeso)||0.3, insurance_value: parseFloat(declValor)||order._total||100, quantity: parseInt(declQtd)||1 }], services:'1,2,3,7,8,9,15', options:{ receipt:false, own_hand:false, collect:false } };
      const calcRes = await callME('/me/shipment/calculate', 'POST', calcBody, meEnv);
      const availableRaw = Array.isArray(calcRes) ? calcRes.filter(s=>!s.error && s.price) : [];
      if (!availableRaw.length) throw new Error('[CALC] Nenhum serviço disponível para esta rota.\n' + JSON.stringify(calcRes));
      // Priorizar JET Express (id 15): mostra primeiro e auto-seleciona se disponível
      const isJet = s => { const id = parseInt(s.id); const name = ((s.company?.name||'')+' '+(s.name||'')).toLowerCase(); return id === 15 || name.includes('jet'); };
      const available = [...availableRaw].sort((a,b) => (isJet(b)?1:0) - (isJet(a)?1:0));
      setMeServices(available);
      const jetService = available.find(isJet);
      setSelectedService(jetService || null);
      setDeclValor(String(order._total || ''));
      setEtiquetaStep('select');
    } catch(e) {
      setEtiquetaError(e.message);
      setEtiquetaStep('error');
    }
  }

  async function clearAllOrders() {
    if (!window.confirm("Apagar TODOS os pedidos? O estoque será restaurado automaticamente.")) return;
    const prevOrders = orders;
    const prevStock = stock;
    try {
      if (sb) {
        const supabaseOrders = orders.filter(o => o._supabase);
        for (const o of supabaseOrders) {
          const items = o._items || [{ peptideId: o.peptideId, qty: o.qty }];
          for (const item of items) {
            if (item.peptideId && item.qty > 0 && stock[item.peptideId] != null) {
              const { data: nq, error: incErr } = await sb.rpc('increment_stock', { p_product_id: item.peptideId, p_qty: item.qty });
              if (incErr) throw new Error(incErr.message);
              if (nq != null) setStock(prev => ({ ...prev, [item.peptideId]: nq }));
            }
          }
          const { error: delErr } = await sb.from('orders').delete().eq('id', o.id);
          if (delErr) throw new Error(delErr.message);
        }
      }
      persistOrders([]);
      showToast("Pedidos apagados", "info");
    } catch (err) {
      console.warn('[clearAllOrders] Error:', err.message);
      showToast('Erro ao apagar pedidos. Revertendo...', 'error');
      persistOrders(prevOrders);
      setStock(prevStock);
    }
  }
  function persistProducts(p) { setProducts(p); saveProducts(p); }
  function persistStock(s) { setStock(s); saveStock(s); }

  // ── Rastreamento de pedidos ───────────────────────────────────────────────
  async function searchOrders(overrideQuery) {
    const raw = (overrideQuery || trackQuery).trim().toUpperCase();
    if (!raw) return;
    if (!sb) { showToast('Indisponível no momento', 'error'); return; }
    // Aceitar somente código VG- para evitar enumeração de CPF
    const q = raw.startsWith('VG') ? (raw.startsWith('VG-') ? raw : 'VG-' + raw.replace(/^VG-?/,'')) : raw;
    if (!q.startsWith('VG-') || q.length < 8) {
      showToast('Informe o código do pedido (VG-XXXXXX)', 'error');
      setTrackLoading(false);
      return;
    }
    setTrackLoading(true);
    setTrackResults(null);
    const r = await publicApi('track', { code: q });
    const data = r.orders;
    setTrackLoading(false);
    if (r.error || !data) { setTrackResults([]); return; }
    setTrackResults(data.map(o => ({
      id: o.id, code: o.code, date: o.created_at, status: o.status || 'pendente',
      items: o.items || [], total: o.total, buyerName: o.buyer_name, payment: o.payment,
      tracking_code: o.tracking_code,
    })));
  }

  // ── Câmbio automático ─────────────────────────────────────────────────────
  async function fetchCambio() {
    setCambioInfo(c => ({ ...c, loading: true, error: null }));
    try {
      const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
      const data = await res.json();
      const ask = parseFloat(data.USDBRL.ask).toFixed(2);
      const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setImportForm(f => ({ ...f, cambio: ask }));
      setCambioInfo({ loading: false, hora, error: null });
    } catch {
      setCambioInfo({ loading: false, hora: null, error: 'Falha ao buscar câmbio' });
    }
  }

  React.useEffect(() => {
    if (adminTab === 'importacao' && !importForm.cambio) { fetchCambio(); }
  }, [adminTab]);

  // ── Sticky detail CTA: mostra quando botão principal sai da tela ──────────
  React.useEffect(() => {
    if (view !== 'detail' || !detailActionsRef.current) { setShowStickyDetailCta(false); return; }
    const obs = new IntersectionObserver(([entry]) => setShowStickyDetailCta(!entry.isIntersecting), { threshold: 0 });
    obs.observe(detailActionsRef.current);
    return () => obs.disconnect();
  }, [view, selectedProduct]);

  // ── Supabase: carregar products + realtime ────────────────────────────────
  React.useEffect(() => {
    if (!sb) return;
    // Safety timeout: if Supabase hangs, stop showing loading overlay after 8s
    const loadingTimeout = setTimeout(() => setIsLoading(false), 8000);
    try {
      function convertProducts(data) {
        return data.map(p => ({
          id: p.id, sku: p.sku || '', name: p.name || '', desc: p.description || '',
          category: p.category || 'emagrecedores', price: Number(p.price) || 0,
          hot: p.hot || false, badge: p.badge || null,
          compounds: p.compounds || null,
          _custoVial: p.cost_per_vial ? Number(p.cost_per_vial) : null,
          packs: p.packs || [],
          image_url: p.image_url || null,
          promo: Number(p.promo) || 0,
        }));
      }
      function syncPromosFromData(data) {
        const promos = {};
        data.forEach(p => { const v = Number(p.promo) || 0; if (v > 0) promos[p.id] = v; });
        setProductPromo(promos);
        localStorage.setItem('vg-promo', JSON.stringify(promos));
      }
      sb.from('products').select('*').order('sort_order', { ascending: true }).then(({ data, error }) => {
        clearTimeout(loadingTimeout);
        setIsLoading(false);
        if (error) { console.warn('[Supabase] Products fetch error:', error.message); return; }
        if (data && data.length > 0) {
          const converted = convertProducts(data);
          setProducts(converted);
          localStorage.setItem('vg-products', JSON.stringify(converted));
          syncPromosFromData(data);
        }
      });
      const prodChannel = sb.channel('products-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          sb.from('products').select('*').order('sort_order', { ascending: true }).then(({ data }) => {
            if (data && data.length > 0) {
              const converted = convertProducts(data);
              setProducts(converted);
              localStorage.setItem('vg-products', JSON.stringify(converted));
              syncPromosFromData(data);
            }
          });
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') console.log('[Supabase] Produtos em tempo real conectados!');
        });
      return () => { clearTimeout(loadingTimeout); sb.removeChannel(prodChannel); };
    } catch(e) { clearTimeout(loadingTimeout); setIsLoading(false); console.warn('[Supabase] Products effect error:', e.message); }
  }, []);

  // ── Supabase: sync stock on mount + real-time subscription ────────────────
  React.useEffect(() => {
    // 1) Fetch current stock from Supabase and merge with local defaults
    if (!sb) return;
    try { sb.from('stock').select('product_id, quantity').then(({ data, error }) => {
      if (error) { console.warn('[Supabase] Fetch error:', error.message); showToast('Problema de conexão — usando dados locais', 'error'); return; }
      // Always merge even if empty — remote = {} means no rows, fall back to DEFAULT_STOCK only
      const remote = {};
      (data || []).forEach(row => { remote[row.product_id] = row.quantity; });
      const merged = { ...DEFAULT_STOCK, ...remote };
      setStock(merged);
      localStorage.setItem('vg-stock', JSON.stringify(merged));
    });

    // 2) Subscribe to real-time changes (quando admin atualiza estoque, todos veem)
    const channel = sb.channel('stock-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock' }, (payload) => {
        if (payload.new && payload.new.product_id !== undefined) {
          const qty = payload.new.quantity;
          setStock(prev => {
            const updated = { ...prev, [payload.new.product_id]: qty };
            localStorage.setItem('vg-stock', JSON.stringify(updated));
            return updated;
          });
          if (qty <= 3) {
            const pName = products.find(p => p.id === payload.new.product_id)?.name || payload.new.product_id;
            addNotif('stock', '⚠️ Estoque baixo', `${pName}: ${qty} unidade${qty !== 1 ? 's' : ''} restante${qty !== 1 ? 's' : ''}`, { productId: payload.new.product_id });
          }
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('[Supabase] Estoque em tempo real conectado!');
      });

    return () => sb.removeChannel(channel);
  } catch(e) { console.warn('[Supabase] Stock effect error:', e.message); }
  }, []);

  // ── Supabase: carregar customers ────────────────────────────────────────
  React.useEffect(() => {
    if (!sb) { setClientList(customers); return; }
    if (!adminUnlocked) return;
    sb.from('customers').select('*').order('points', { ascending: false }).then(({ data }) => {
      if (data) { setClientList(data); persistCustomers(data); }
    });
  }, [adminUnlocked]);

  // ── Supabase: carregar cupons ────────────────────────────────────────────
  React.useEffect(() => {
    if (!sb || !adminUnlocked) return;
    sb.from('coupons').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data && data.length > 0) {
        setCoupons(data.map(r => ({ id: r.id, code: r.code, type: r.type, value: r.value, minOrder: r.min_order, expiresAt: r.expires_at, active: r.active })));
      } else {
        // Migrar localStorage → Supabase
        const local = (() => { try { return JSON.parse(localStorage.getItem('vg-coupons')||'[]'); } catch { return []; } })();
        if (local.length > 0) {
          Promise.all(local.map(c => sb.from('coupons').insert({ code: c.code, type: c.type||'percent', value: c.value, min_order: c.minOrder||0, expires_at: c.expiresAt||null, active: c.active!==false }))).then(() => {
            sb.from('coupons').select('*').order('created_at', { ascending: false }).then(({ data: d2 }) => {
              if (d2) setCoupons(d2.map(r => ({ id: r.id, code: r.code, type: r.type, value: r.value, minOrder: r.min_order, expiresAt: r.expires_at, active: r.active })));
            });
          });
        }
      }
    });
  }, [adminUnlocked]);

  // ── Supabase: carregar despesas ──────────────────────────────────────────
  React.useEffect(() => {
    if (!sb || !adminUnlocked) return;
    sb.from('expenses').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data && data.length > 0) {
        setDespesas(data.map(r => ({ id: r.id, desc: r.description, valor: r.value, categoria: r.category, data: r.expense_date })));
      } else {
        // Migrar localStorage → Supabase
        const local = (() => { try { return JSON.parse(localStorage.getItem('vg-expenses')||'[]'); } catch { return []; } })();
        if (local.length > 0) {
          Promise.all(local.map(d => sb.from('expenses').insert({ description: d.desc, value: d.valor, category: d.categoria||'outros', expense_date: d.data||'' }))).then(() => {
            sb.from('expenses').select('*').order('created_at', { ascending: false }).then(({ data: d2 }) => {
              if (d2) setDespesas(d2.map(r => ({ id: r.id, desc: r.description, valor: r.value, categoria: r.category, data: r.expense_date })));
            });
          });
        }
      }
    });
  }, [adminUnlocked]);

  // ── Supabase: carregar histórico de importação e caps de reserva ──────────
  React.useEffect(() => {
    if (!sb || !adminUnlocked) return;
    // Import history
    sb.from('import_history').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) { console.warn('[Supabase] Import history fetch error:', error.message); return; }
      if (data && data.length > 0) {
        const hist = data.map(r => r.data);
        setImportHistory(hist);
        localStorage.setItem('vg-imports', JSON.stringify(hist));
      } else {
        // Migrar localStorage → Supabase na primeira vez
        const local = (() => { try { return JSON.parse(localStorage.getItem('vg-imports')||'[]'); } catch { return []; } })();
        if (local.length > 0) {
          Promise.all(local.map(h => sb.from('import_history').upsert({ id: String(h.id), data: h, status: h.status||'aguardando' }, { onConflict: 'id' })));
        }
      }
    });
    // Purchase order caps
    sb.from('purchase_order_caps').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) { console.warn('[Supabase] PO caps fetch error:', error.message); return; }
      if (data && data.length > 0) {
        const caps = data.map(r => ({ id: r.id, productId: r.product_id, qty: r.qty, note: r.note||'', status: r.status, date: r.date_str }));
        setPurchaseOrders(caps);
        localStorage.setItem('vg-purchase-orders', JSON.stringify(caps));
      } else {
        const local = (() => { try { return JSON.parse(localStorage.getItem('vg-purchase-orders')||'[]'); } catch { return []; } })();
        if (local.length > 0) {
          Promise.all(local.map(p => sb.from('purchase_order_caps').upsert({ id: String(p.id), product_id: p.productId, qty: p.qty, note: p.note||null, status: p.status||'pending', date_str: p.date||'' }, { onConflict: 'id' })));
        }
      }
    });
  }, [adminUnlocked]);

  // ── Tracking polling: check ME tracking events when admin unlocks ──────────
  React.useEffect(() => {
    if (!adminUnlocked) return;
    const enviados = orders.filter(o => o.status === 'enviado' && o.me_order_id);
    if (!enviados.length) return;
    let seen = {};
    try { seen = JSON.parse(localStorage.getItem('vg-tracking-seen')||'{}'); } catch {}
    const KEY_EVENTS = ['alfandega','customs','falhou','ausente','aguardando retirada','endereço incorreto','devolvido','retido'];
    (async () => {
      for (const order of enviados.slice(0, 8)) {
        try {
          const res = await callME(`/me/shipment/${order.me_order_id}/tracking`, 'GET');
          const events = Array.isArray(res) ? res : (res?.tracking || []);
          for (const ev of events) {
            const evId = `${order.me_order_id}|${ev.created_at||''}|${(ev.message||ev.description||'').slice(0,40)}`;
            if (seen[evId]) continue;
            const msg = (ev.message || ev.description || ev.status || '').toLowerCase();
            if (KEY_EVENTS.some(k => msg.includes(k))) {
              addNotif('tracking', `📍 Rastreio: ${order._code||''}`, ev.message || ev.description || ev.status, { orderId: order.id });
              seen[evId] = true;
            }
          }
        } catch { /* ignore per-order errors */ }
      }
      try { localStorage.setItem('vg-tracking-seen', JSON.stringify(seen)); } catch {}
    })();
  }, [adminUnlocked]);

  // ── Supabase: carregar pedidos e pré-orders + realtime ────────────────────
  function fetchOrdersFromSupabase() {
    if (!sb) return;
    sb.from('orders').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) { console.warn('[Supabase] Orders fetch error:', error.message); return; }
      if (data && data.length > 0) {
        const converted = data.map(o => ({
          id: o.id,
          peptideId: o.items && o.items[0] ? (o.items[0].peptideId || '') : '',
          buyerName: o.buyer_name || '',
          qty: o.items ? o.items.reduce((s, i) => s + (i.qty || 0), 0) : 1,
          createdAt: o.created_at,
          status: o.status || 'pendente',
          _supabase: true,
          _items: o.items,
          _total: o.total,
          _subtotal: o.subtotal,
          _freight: o.freight,
          _phone: o.phone,
          _email: o.email,
          _cpf: o.cpf,
          _address: o.address,
          _payment: o.payment,
          _notes: o.notes,
          _code: o.code,
          _discounts: orderDiscounts(o),
          me_order_id: o.me_order_id,
          tracking_code: o.tracking_code,
          label_url: o.label_url,
        }));
        setOrders(prev => {
          const localCart = prev.filter(o => !o._supabase);
          // Pedidos novos desde a última atualização (substitui o realtime, que o RLS bloqueia)
          const known = new Set(prev.filter(o => o._supabase && o._code !== undefined).map(o => o.id));
          if (known.size) converted.filter(o => !known.has(o.id)).forEach(o => {
            showToast('Novo pedido recebido! 🛒', 'success');
            addNotif('order', '🛒 Novo pedido recebido!', `${o.buyerName || 'Cliente'}${o._total ? ` • R$ ${parseFloat(o._total).toLocaleString('pt-BR')}` : ''}${o._code ? ` • ${o._code}` : ''}`, { orderId: o.id });
          });
          const merged = [...localCart, ...converted];
          saveOrders(merged);
          return merged;
        });
      }
    });
  }

  function fetchPreordersFromSupabase() {
    if (!sb) return;
    sb.from('preorders').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) { console.warn('[Supabase] Preorders fetch error:', error.message); return; }
      if (!data) return;
      const converted = data.map(po => ({
        id: po.id, token: po.token || '', productId: po.product_id || '', productName: po.product_name || '',
        name: po.name || '', whatsapp: po.whatsapp || '', qty: po.qty || 1, status: po.status || 'pending',
        date: po.date || '', ts: po.ts || Date.now(),
        notifiedAt: po.notified_at ? new Date(po.notified_at).getTime() : null,
        reminderSent: po.reminder_sent || false,
      }));
      setPreorders(prev => {
        const localOnly = prev.filter(p => p._mine && !converted.find(c => c.id === p.id));
        const merged = [...localOnly, ...converted];
        localStorage.setItem('vg-preorders', JSON.stringify(merged));
        return merged;
      });
    });
  }

  // Loja (sem senha): só o necessário para calcular estoque reservado, sem dados pessoais
  async function loadPublicSnapshot() {
    const snap = await publicApi('snapshot');
    if (!snap || snap.error) { console.warn('[public-api] snapshot:', snap && snap.error); return; }
    const conv = (snap.orders || []).map(o => ({
      id: o.id, peptideId: o.items && o.items[0] ? (o.items[0].peptideId || '') : '', buyerName: '',
      qty: (o.items || []).reduce((s, i) => s + (i.qty || 0), 0), status: o.status, _supabase: true, _items: o.items,
    }));
    setOrders(prev => { const merged = [...prev.filter(o => !o._supabase), ...conv]; saveOrders(merged); return merged; });
    setPreorders(prev => {
      // Mantém os detalhes só das reservas feitas neste aparelho
      const mine = prev.filter(p => p._mine || (p.token && myName && (p.name || '').toLowerCase() === myName.toLowerCase()));
      const server = (snap.preorders || []).map(po => {
        const local = mine.find(m => m.id === po.id);
        return local ? { ...local, qty: po.qty, status: po.status, _mine: true }
          : { id: po.id, productId: po.product_id, qty: po.qty || 1, status: po.status, name: '', token: '' };
      });
      const merged = [...mine.filter(m => !server.some(x => x.id === m.id)).map(m => ({ ...m, _mine: true })), ...server];
      localStorage.setItem('vg-preorders', JSON.stringify(merged));
      return merged;
    });
    const hist = (snap.imports || []);
    setImportHistory(hist);
    localStorage.setItem('vg-imports', JSON.stringify(hist));
    const caps = (snap.caps || []).map(r => ({ id: r.id, productId: r.product_id, qty: r.qty, note: '', status: r.status }));
    setPurchaseOrders(caps);
    localStorage.setItem('vg-purchase-orders', JSON.stringify(caps));
  }

  // Re-fetch sempre que admin é desbloqueado, e a cada 30s enquanto o admin estiver aberto
  React.useEffect(() => {
    if (!adminUnlocked) return;
    fetchOrdersFromSupabase(); fetchPreordersFromSupabase();
    const t = setInterval(() => { fetchOrdersFromSupabase(); fetchPreordersFromSupabase(); }, 30000);
    return () => clearInterval(t);
  }, [adminUnlocked]);

  React.useEffect(() => {
    if (!sb) return;
    try {
    // Dados pessoais em cache de versões antigas do site
    try { localStorage.removeItem('vg-customers'); } catch {}
    loadPublicSnapshot();
    if (portalToken) publicApi('preorder_get', { token: portalToken }).then(r => {
      const po = r && r.preorder;
      if (!po) return;
      const conv = {
        id: po.id, token: po.token, productId: po.product_id, productName: po.product_name, name: po.name,
        whatsapp: po.whatsapp, qty: po.qty, status: po.status, date: po.date, ts: po.ts,
        notifiedAt: po.notified_at ? new Date(po.notified_at).getTime() : null, reminderSent: po.reminder_sent || false, _mine: true,
      };
      setPreorders(prev => [conv, ...prev.filter(x => x.id !== po.id)]);
    });

    // Realtime: novos pedidos e atualizações de status aparecem no admin automaticamente
    const ordersChannel = sb.channel('orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.new) {
          const o = payload.new;
          const converted = {
            id: o.id, peptideId: o.items && o.items[0] ? (o.items[0].peptideId || '') : '',
            buyerName: o.buyer_name || '', qty: o.items ? o.items.reduce((s,i)=>s+(i.qty||0),0) : 1,
            createdAt: o.created_at, status: o.status || 'pendente',
            _supabase: true, _items: o.items, _total: o.total,
            _subtotal: o.subtotal, _freight: o.freight, _cpf: o.cpf,
            _phone: o.phone, _email: o.email, _address: o.address,
            _payment: o.payment, _notes: o.notes, _code: o.code, _discounts: orderDiscounts(o),
            me_order_id: o.me_order_id, tracking_code: o.tracking_code, label_url: o.label_url,
          };
          setOrders(prev => [converted, ...prev.filter(x => x.id !== o.id)]);
          showToast('Novo pedido recebido! 🛒', 'success');
          addNotif('order', '🛒 Novo pedido recebido!', `${o.buyer_name || 'Cliente'}${o.total ? ` • R$ ${parseFloat(o.total).toLocaleString('pt-BR')}` : ''}${o.code ? ` • ${o.code}` : ''}`, { orderId: o.id });
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.new) {
          const o = payload.new;
          setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: o.status } : x));
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.old && payload.old.id) {
          setOrders(prev => prev.filter(x => x.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'preorders' }, (payload) => {
        if (payload.new) {
          const po = payload.new;
          const converted = {
            id: po.id, token: po.token, productId: po.product_id, productName: po.product_name,
            name: po.name, whatsapp: po.whatsapp, qty: po.qty, status: po.status,
            date: po.date, ts: po.ts, notifiedAt: null, reminderSent: false,
          };
          setPreorders(prev => [converted, ...prev.filter(x => x.id !== po.id)]);
          showToast('Nova reserva recebida! 📋', 'success');
          addNotif('preorder', '📋 Nova pré-order!', `${po.name || 'Cliente'} reservou ${po.product_name || 'produto'}${po.qty && po.qty > 1 ? ` ×${po.qty}` : ''}`, { preorderId: po.id });
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('[Supabase] Pedidos em tempo real conectados!');
      });

    return () => sb.removeChannel(ordersChannel);
    } catch(e) { console.warn('[Supabase] Orders effect error:', e.message); }
  }, []);

  // Freight calculation
  function calcFreight(estado, total) {
    if (total >= 1000) return { value: 0, label: 'Frete grátis', reason: 'Pedido acima de R$ 1.000' };
    if (estado === 'SP' && total >= 600) return { value: 0, label: 'Frete grátis', reason: 'SP + pedido acima de R$ 600 • Entrega no mesmo dia ou dia seguinte' };
    if (estado === 'SP') return { value: 60, label: 'R$ 60,00', reason: 'Via transportadora • Entrega no mesmo dia ou dia seguinte' };
    return { value: 60, label: 'R$ 60,00', reason: 'Via transportadora' };
  }

  async function fetchCep(cep) {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const d = await r.json();
      if (d.erro) {
        showToast('CEP não encontrado. Verifique e tente novamente.', 'error');
      } else {
        setCheckout(c => ({ ...c, estado: d.uf, cidade: d.localidade, bairro: d.bairro, rua: d.logradouro }));
        showToast('Endereço preenchido automaticamente ✓');
      }
    } catch {
      showToast('Erro ao buscar CEP. Verifique sua conexão.', 'error');
    }
  }

  function validateCheckout() {
    const errs = {};
    if (!(checkout.nomeCompleto || '').trim()) errs.nomeCompleto = true;
    if (!validarCPF(checkout.cpf || '')) errs.cpf = true;
    if (!(checkout.telefone || '').trim()) errs.telefone = true;
    if (checkout.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkout.email.trim())) errs.email = true;
    if (!/^\d{8}$/.test((checkout.cep || '').replace(/\D/g,''))) errs.cep = true;
    if (!(checkout.rua || '').trim()) errs.rua = true;
    if (!(checkout.numero || '').trim()) errs.numero = true;
    if (!(checkout.cidade || '').trim()) errs.cidade = true;
    if (!(checkout.estado || '').trim()) errs.estado = true;
    if (!checkout.pagamento) errs.pagamento = true;
    setCheckoutErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function saveCheckoutData(data) {
    setCheckout(data);
    localStorage.setItem('vg-checkout', JSON.stringify(data));
  }

  function updateCheckout(field, value) {
    const updated = { ...checkout, [field]: value };
    saveCheckoutData(updated);
  }

  async function sendToWhatsApp() {
    if (isSubmitting) return;
    if (!validateCheckout()) { showToast("Preencha todos os campos obrigatórios", "error"); return; }
    if (!disclaimer) { showToast("Confirme o aviso legal para prosseguir", "error"); return; }
    setIsSubmitting(true);
    try {
      const freightRaw = calcFreight(checkout.estado, myTotal);
      const isPix = checkout.pagamento === 'pix';
      // Valores locais (prévia); depois do create-order são trocados pelos que o servidor validou e gravou
      let freight = isPix ? { value: 0, label: 'Frete grátis', reason: 'Frete grátis no PIX' } : freightRaw;
      let subtotalFinal = myTotal;
      let couponDiscount = appliedCoupon ? (appliedCoupon.type === 'percent' ? Math.round(myTotal * appliedCoupon.value / 100) : Math.min(appliedCoupon.value, myTotal)) : 0;
      let pointsUsed = Math.floor(appliedPoints / 100) * 100;
      let pointsDiscount = Math.floor(appliedPoints / 100) * (pointsConfig.redeem || 5);
      let bundleDiscount = bundleInfo.total;
      const noteOf = list => list.filter(b => b.discount > 0).map(b => `Combo ${b.name}: -R$ ${b.discount.toLocaleString('pt-BR')}`).join(' | ');
      let bundleNote = noteOf(bundleInfo.applied);
      let totalFinal = myTotal - couponDiscount - bundleDiscount - pointsDiscount + freight.value;
      const itens = myOrders.map(o => {
        const p = products.find(x => x.id === o.peptideId);
        if (!p) return `• [produto removido] ×${o.qty}`;
        return `• ${p.name} ×${o.qty||0} = R$ ${(p.price * (o.qty||0)).toLocaleString('pt-BR')}`;
      }).join('\n');
      const pagamentoLabel = checkout.pagamento === 'pix' ? 'PIX (à vista)' : 'Cartão 2x (juros Mercado Pago)';
      const buildMsg = () => `🧬 *PEDIDO VANGUARD PEPTIDES*

👤 *Dados do Cliente*
Nome: ${checkout.nomeCompleto}
CPF: ${checkout.cpf}
Telefone: ${checkout.telefone}
E-mail: ${checkout.email}

📦 *Endereço de Entrega*
${checkout.rua}, ${checkout.numero}${checkout.complemento ? ' — '+checkout.complemento : ''}
${checkout.bairro} — ${checkout.cidade}/${checkout.estado}
CEP: ${checkout.cep}

🛒 *Itens*
${itens}

💳 *Pagamento:* ${pagamentoLabel}

💰 *Resumo*
Subtotal: R$ ${subtotalFinal.toLocaleString('pt-BR')}
Frete: ${freight.value === 0 ? 'GRÁTIS' : 'R$ ' + freight.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}${freight.reason ? ' (' + freight.reason + ')' : ''}${bundleDiscount > 0 ? '\n🎁 ' + bundleNote.split(' | ').join('\n🎁 ') : ''}${couponDiscount > 0 ? '\n🏷️ Cupom '+appliedCoupon.code+': -R$ '+couponDiscount.toLocaleString('pt-BR') : ''}${pointsDiscount > 0 ? '\n⭐ Pontos VG ('+pointsUsed+' pts): -R$ '+pointsDiscount.toLocaleString('pt-BR') : ''}
*Total: R$ ${totalFinal.toLocaleString('pt-BR')}*${checkout.observacoes ? '\n\n📝 *Obs:* ' + checkout.observacoes : ''}`;

      // Salvar pedido via Edge Function (preços validados server-side)
      let orderCode = null;
      if (myOrders.length > 0) {
        const orderItems = myOrders.map(o => ({
          peptideId: o.peptideId, name: (products.find(x=>x.id===o.peptideId)||{}).name||o.peptideId,
          qty: o.qty, _packId: o._packId||null,
        }));
        try {
          const createRes = await fetch('https://aumubzvdhzvtnqfzqeqd.supabase.co/functions/v1/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
            body: JSON.stringify({
              buyer_name: checkout.nomeCompleto,
              phone: checkout.telefone,
              email: checkout.email,
              cpf: checkout.cpf,
              address: { rua: checkout.rua, numero: checkout.numero, complemento: checkout.complemento,
                          bairro: checkout.bairro, cidade: checkout.cidade, estado: checkout.estado, cep: checkout.cep },
              items: orderItems,
              payment: checkout.pagamento,
              coupon_code: appliedCoupon ? appliedCoupon.code : null,
              // Combos e pontos são validados e gravados pelo servidor (que também debita os pontos)
              bundles: bundleInfo.applied.map(b => b.id),
              points: pointsUsed,
              notes: checkout.observacoes || null,
            }),
          });
          const createData = await createRes.json();
          if (!createData.ok) {
            showToast("Erro ao salvar pedido: " + (createData.error || 'tente novamente'), "error");
            if (/pontos/i.test(createData.error || '')) { setAppliedPoints(0); checkPoints(checkout.cpf); }
            return;
          }
          orderCode = createData.code;
          if (typeof createData.validatedTotal === 'number') {
            subtotalFinal = createData.validatedSubtotal;
            if (createData.freight !== freight.value) freight = { value: createData.freight, reason: '' };
            couponDiscount = createData.couponDiscount || 0;
            bundleDiscount = createData.bundleDiscount || 0;
            bundleNote = noteOf(createData.bundlesApplied || []);
            pointsUsed = createData.pointsUsed || 0;
            pointsDiscount = createData.pointsDiscount || 0;
            totalFinal = createData.validatedTotal;
          }
          // Atualiza o saldo local (o débito real já foi feito no servidor)
          if (pointsUsed > 0) {
            const clean = (checkout.cpf || '').replace(/\D/g, '');
            persistCustomers(customers.map(c => c.cpf === clean ? { ...c, points: Math.max(0, (c.points || 0) - pointsUsed) } : c));
          }
        } catch {
          showToast("Erro de conexão ao salvar pedido. Tente novamente.", "error");
          return;
        }
      }

      // Adiciona código ao final da mensagem WhatsApp (só para pedidos reais)
      const msg = buildMsg();
      const msgComCodigo = orderCode
        ? msg + `\n\n🔑 *Código do pedido:* \`${orderCode}\`\n_Use este código em vanguardpep.com → 📦 PEDIDO para acompanhar o status_`
        : msg;

      // Só abre WhatsApp e limpa carrinho após save confirmado
      window.open(`https://wa.me/447418333521?text=${encodeURIComponent(msgComCodigo)}`, '_blank');
      persistOrders(orders.filter(o => o._supabase || (o.buyerName || '').toLowerCase() !== myName.toLowerCase()));
      localStorage.removeItem('vg-checkout');
      setCheckoutOpen(false);
      setCheckoutStep(1);
      setDisclaimer(false);
      setAppliedCoupon(null);
      setCouponInput('');
      setAppliedPoints(0);
      setPointsBalance(null);
      setCartBundles([]);
      if (orderCode) setOrderSuccessCode(orderCode);
      setView("catalog");
    } finally {
      setIsSubmitting(false);
    }
  }

  function dismissNotice(id) {
    setDismissedNotices(d => [...d, id]);
  }
  function addNotice(notice) {
    const n = [...notices, { id: Date.now(), ...notice }];
    setNotices(n);
    localStorage.setItem('vg-notices', JSON.stringify(n));
  }
  function removeNotice(id) {
    const n = notices.filter(x=>x.id!==id);
    setNotices(n);
    localStorage.setItem('vg-notices', JSON.stringify(n));
  }
  function generateOrderCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'VG-';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  // Clientes já cadastrados (a partir de pedidos antigos com endereço), deduplicados por CPF/nome
  function pastCustomers() {
    const seen = {};
    orders.filter(o => o._supabase).forEach(o => {
      const key = (o._cpf || '').replace(/\D/g,'') || (o.buyerName||'').trim().toLowerCase();
      if (!key) return;
      const ts = o.createdAt ? new Date(o.createdAt).getTime() : 0;
      if (!seen[key] || ts > seen[key]._ts) {
        seen[key] = { name:o.buyerName||'', cpf:o._cpf||'', phone:o._phone||'', email:o._email||'', address:o._address||null, _ts:ts };
      }
    });
    return Object.values(seen).sort((a,b)=>b._ts-a._ts);
  }

  function fillManualFromCustomer(c) {
    const a = c.address || {};
    setManualOrder(m => ({ ...m,
      name: c.name||'', cpf: c.cpf||'', phone: c.phone||'', email: c.email||'',
      cep: a.cep||'', rua: a.rua||'', numero: a.numero||'', complemento: a.complemento||'',
      bairro: a.bairro||'', cidade: a.cidade||'', estado: a.estado||'',
    }));
    setManualCustomerSearch('');
    showToast('Dados do cliente preenchidos ✓','success');
  }

  // Pedidos manuais (admin e link "Formulário de Pedido") não passam pelo carrinho, então reservam
  // aqui, com a mesma RPC do carrinho (decrement_stock: nunca deixa o saldo negativo, devolve -1).
  // Só produtos com controle de estoque (linha em stock). Se faltar algum, devolve o que já reservou.
  async function releaseOrderStock(reserved) {
    if (!sb || !reserved || !reserved.length) return;
    for (const r of reserved) {
      try {
        const { data: back, error } = await sb.rpc('increment_stock', { p_product_id: r.pid, p_qty: r.qty });
        if (error) { console.warn('[Estoque] devolução falhou:', r.pid, error.message); continue; }
        if (back != null) setStock(prev => { const s = { ...prev, [r.pid]: back }; try { localStorage.setItem('vg-stock', JSON.stringify(s)); } catch {} return s; });
      } catch (e) { console.warn('[Estoque] devolução falhou:', r.pid, e && e.message); }
    }
  }
  async function reserveOrderStock(items) {
    const agg = {};
    (items || []).forEach(it => { const q = Math.max(0, parseInt(it.qty, 10) || 0); if (it.peptideId && q) agg[it.peptideId] = (agg[it.peptideId] || 0) + q; });
    const reserved = [];
    for (const [pid, qty] of Object.entries(agg)) {
      if (!sb || stock[pid] == null) continue; // sem controle de estoque
      let nq = null, error = null;
      try { ({ data: nq, error } = await sb.rpc('decrement_stock', { p_product_id: pid, p_qty: qty })); } catch (e) { error = e; }
      if (error || nq === -1) {
        await releaseOrderStock(reserved);
        const p = products.find(x => x.id === pid);
        return { ok: false, reserved: [], error: error ? 'Não foi possível reservar o estoque. Tente de novo.' : `Estoque insuficiente de ${p ? p.name : pid}` };
      }
      reserved.push({ pid, qty });
      if (nq != null) setStock(prev => { const s = { ...prev, [pid]: nq }; try { localStorage.setItem('vg-stock', JSON.stringify(s)); } catch {} return s; });
    }
    return { ok: true, reserved };
  }

  // Editar itens de um pedido do admin: ajusta o estoque só pela diferença (antes × depois).
  // Aumentos baixam (decrement_stock, via reserveOrderStock) ANTES de gravar e voltam se a gravação
  // falhar; reduções/remoções devolvem (increment_stock) só DEPOIS de gravar. Só produtos com linha em stock.
  const itemsSavingRef = React.useRef(false);
  function stockDiffOfEdit(oldItems, newItems) {
    const sum = list => (list || []).reduce((m, it) => { const q = parseInt(it.qty, 10) || 0; if (it.peptideId && q > 0) m[it.peptideId] = (m[it.peptideId] || 0) + q; return m; }, {});
    const a = sum(oldItems), b = sum(newItems);
    const add = [], back = [];
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach(pid => {
      if (stock[pid] == null) return; // sem controle de estoque
      const d = (b[pid] || 0) - (a[pid] || 0);
      if (d > 0) add.push({ peptideId: pid, qty: d });
      else if (d < 0) back.push({ pid, qty: -d });
    });
    return { add, back };
  }
  async function saveOrderItemsEdit() {
    if (itemsSavingRef.current) return; // evita baixar duas vezes com clique duplo
    if (editItems.length === 0) { showToast('Pedido precisa de ao menos 1 item', 'error'); return; }
    const od = orderDetail;
    const oldItems = od._items && od._items.length ? od._items : [{ peptideId: od.peptideId, qty: od.qty || 1 }];
    const { add, back } = od._supabase ? stockDiffOfEdit(oldItems, editItems) : { add: [], back: [] };
    if (add.length || back.length) {
      const nm = pid => (products.find(p => p.id === pid) || {}).name || pid;
      const lines = [
        ...add.map(x => `− baixar ${x.qty} de ${nm(x.peptideId)}`),
        ...back.map(x => `+ devolver ${x.qty} de ${nm(x.pid)}`),
      ];
      if (!window.confirm(`Salvar itens do pedido ${od._code || '#' + od.id}?\n\nAjuste de estoque:\n${lines.join('\n')}`)) return;
    }
    itemsSavingRef.current = true;
    try {
      const newSubtotal = editItems.reduce((s, it) => { const p2 = products.find(x => x.id === it.peptideId); return s + (it.price || (p2 ? p2.price : 0)) * (it.qty || 1); }, 0);
      const isPix = (od._payment || '').toLowerCase().includes('pix');
      const newFreight = isPix ? 0 : (od._freight ?? 60);
      const newTotal = orderTotalWith(newSubtotal, newFreight, od._discounts, od._discounts && od._discounts.manual);
      const resv = await reserveOrderStock(add);
      if (!resv.ok) { showToast(resv.error + ' — pedido não alterado', 'error'); return; }
      if (sb) {
        let error = null;
        try { ({ error } = await sb.from('orders').update({ items: editItems, subtotal: newSubtotal, freight: newFreight, total: newTotal }).eq('id', od.id)); } catch (e) { error = e; }
        if (error) {
          await releaseOrderStock(resv.reserved);
          showToast('Erro ao salvar no servidor: ' + (error.message || error) + ' — estoque não alterado', 'error');
          return;
        }
      }
      await releaseOrderStock(back);
      const updated = { ...od, _items: editItems, _subtotal: newSubtotal, _freight: newFreight, _total: newTotal,
        qty: editItems.reduce((s, it) => s + (parseInt(it.qty, 10) || 0), 0), peptideId: editItems[0].peptideId };
      persistOrders(orders.map(o => o.id === od.id ? updated : o));
      setOrderDetail(updated);
      setEditItemsMode(false);
      showToast('Pedido atualizado ✓' + (add.length || back.length ? ' (estoque ajustado)' : ''), 'success');
    } finally { itemsSavingRef.current = false; }
  }

  async function createManualOrder() {
    if (manualOrderSubmitting) return;
    if (!manualOrder.name.trim()) { showToast('Informe o nome do cliente','error'); return; }
    if (!manualOrder.items.length) { showToast('Adicione pelo menos um produto','error'); return; }
    setManualOrderSubmitting(true);
    let resv = null;
    try {
      const orderItems = manualOrder.items.map(it => {
        const p = products.find(x=>x.id===it.peptideId);
        return { peptideId: it.peptideId, name: p?p.name:it.peptideId, qty: it.qty||1, _packId: it._packId||null };
      });
      // Baixa o estoque antes de criar (o create-order recusa só saldo negativo, então passa)
      resv = await reserveOrderStock(orderItems);
      if (!resv.ok) { showToast(resv.error, 'error'); resv = null; return; }
      const res = await fetch('https://aumubzvdhzvtnqfzqeqd.supabase.co/functions/v1/create-order', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'apikey': SUPABASE_KEY },
        body: JSON.stringify({
          buyer_name: manualOrder.name.trim(),
          phone: manualOrder.phone || '',
          email: manualOrder.email || null,
          cpf: manualOrder.cpf || null,
          address: { rua:manualOrder.rua, numero:manualOrder.numero, complemento:manualOrder.complemento,
                     bairro:manualOrder.bairro, cidade:manualOrder.cidade, estado:manualOrder.estado, cep:manualOrder.cep },
          items: orderItems,
          payment: manualOrder.payment,
          notes: manualOrder.notes ? ('[PEDIDO MANUAL] ' + manualOrder.notes) : '[PEDIDO MANUAL]',
        }),
      });
      const data = await res.json();
      if (!data.ok) { await releaseOrderStock(resv.reserved); resv = null; showToast('Erro ao criar pedido: ' + (data.error||'tente novamente'),'error'); return; }
      resv = null; // pedido gravado: a reserva fica com ele (remover o pedido devolve o estoque)
      showToast('Pedido manual criado ✓ ' + data.code,'success');
      setManualOrderModal(false);
      setManualOrder(MANUAL_ORDER_EMPTY);
      setManualCustomerSearch('');
      setManualAddItemId('');
      fetchOrdersFromSupabase();
    } catch {
      if (resv) { await releaseOrderStock(resv.reserved); resv = null; }
      showToast('Erro de conexão ao criar pedido','error');
    } finally {
      setManualOrderSubmitting(false);
    }
  }

  // Parser de texto colado → preenche campos do pedido manual
  function parseAndFillManualOrder(raw) {
    if (!raw || !raw.trim()) { showToast('Cole o texto do cliente primeiro','error'); return; }
    const text = raw.replace(/\r/g, '');
    const found = {};
    let foundCount = 0;
    const mark = (k,v) => { if (v && !found[k]) { found[k] = v; foundCount++; } };

    // CPF: 11 dígitos com ou sem máscara
    const cpfMatch = text.match(/(\d{3}[.\s-]?\d{3}[.\s-]?\d{3}[.\s-]?\d{2})/);
    if (cpfMatch) mark('cpf', cpfMatch[1].replace(/\D/g,''));

    // CEP: 8 dígitos com ou sem hífen
    const cepMatch = text.match(/(\d{5}-?\d{3})\b/);
    if (cepMatch) mark('cep', cepMatch[1].replace(/\D/g,''));

    // E-mail
    const emailMatch = text.match(/[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/);
    if (emailMatch) mark('email', emailMatch[0]);

    // Telefone: 10 ou 11 dígitos, opcionalmente com (DDD), espaços, hífens, +55
    const phoneMatch = text.match(/(?:\+?55\s?)?\(?\d{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}/);
    if (phoneMatch) {
      const digits = phoneMatch[0].replace(/\D/g,'');
      // Remove "55" do início se ficou com 12-13 dígitos
      const clean = digits.length >= 12 && digits.startsWith('55') ? digits.slice(2) : digits;
      if (clean.length >= 10) mark('phone', clean);
    }

    // Parse linha-a-linha pra labels comuns
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const labelMap = [
      ['name',       /^(?:nome(?:\s+completo)?|cliente)\s*[:=-]\s*(.+)$/i],
      ['rua',        /^(?:rua|endere[çc]o|logradouro|av(?:enida)?\.?)\s*[:=-]\s*(.+)$/i],
      ['numero',     /^(?:n[úu]mero|n[ºo°]?|num)\s*[:=-]?\s*(\d+\w*)/i],
      ['complemento',/^(?:complemento|compl|apto?|apartamento|bloco)\s*[:=-]\s*(.+)$/i],
      ['bairro',     /^(?:bairro)\s*[:=-]\s*(.+)$/i],
      ['cidade',     /^(?:cidade|munic[íi]pio)\s*[:=-]\s*(.+)$/i],
      ['estado',     /^(?:estado|uf)\s*[:=-]\s*([A-Za-z]{2,})/i],
    ];
    for (const line of lines) {
      for (const [field, re] of labelMap) {
        const m = line.match(re);
        if (m) {
          let v = m[1].trim();
          if (field === 'estado') v = v.toUpperCase().slice(0,2);
          mark(field, v);
          break;
        }
      }
    }

    // Padrão "Rua X, 123 - Bairro - Cidade/UF" em uma linha
    if (!found.rua || !found.numero || !found.cidade) {
      const fullAddr = text.match(/((?:Rua|R\.|Av\.?|Avenida|Travessa|Tv\.?|Alameda|Al\.?|Estrada|Rod\.?|Rodovia)[^\n,]+),\s*(\d+\w*)([^\n]*)/i);
      if (fullAddr) {
        mark('rua', fullAddr[1].trim());
        mark('numero', fullAddr[2]);
        const rest = fullAddr[3] || '';
        const cityUfMatch = rest.match(/([A-Za-zÀ-ú\s]+?)\s*[\/-]\s*([A-Za-z]{2})\b/);
        if (cityUfMatch) {
          mark('cidade', cityUfMatch[1].trim());
          mark('estado', cityUfMatch[2].toUpperCase());
        }
      }
    }

    // Nome: se ainda não achou, primeira linha de 2+ palavras só com letras
    if (!found.name) {
      for (const line of lines) {
        if (/^[A-Za-zÀ-ú\s']{4,}$/.test(line) && line.split(/\s+/).length >= 2) {
          mark('name', line);
          break;
        }
      }
    }

    // Pagamento: detecta menção a PIX ou cartão
    const lower = text.toLowerCase();
    if (/\bpix\b/.test(lower)) mark('payment', 'pix');
    else if (/cart[ãa]o|2x|cr[ée]dito/.test(lower)) mark('payment', 'cartao');

    if (foundCount === 0) {
      showToast('Não encontrei nenhum campo reconhecível','error');
      return;
    }

    setManualOrder(m => ({ ...m, ...found }));
    setManualPasteOpen(false);
    setManualPasteText('');
    showToast(`${foundCount} campo${foundCount!==1?'s':''} preenchido${foundCount!==1?'s':''} ✓`,'success');

    // Se achou CEP, busca endereço automaticamente caso rua/cidade não tenham vindo
    if (found.cep && (!found.rua || !found.cidade)) {
      fetch(`https://viacep.com.br/ws/${found.cep}/json/`).then(r=>r.json()).then(d=>{
        if (!d || d.erro) return;
        setManualOrder(m => ({ ...m,
          estado: m.estado || d.uf || '',
          cidade: m.cidade || d.localidade || '',
          bairro: m.bairro || d.bairro || '',
          rua: m.rua || d.logradouro || '',
        }));
      }).catch(()=>{});
    }
  }

  function effectivePrice(p) {
    if (!p) return 0;
    const promo = productPromo[p.id] || p.promo || 0;
    return promo > 0 ? Math.round(p.price * (1 - promo / 100)) : p.price;
  }

  function persistCoupons(c) { setCoupons(c); localStorage.setItem('vg-coupons', JSON.stringify(c)); }
  function persistCustomers(c) { setCustomers(c); localStorage.setItem('vg-customers', JSON.stringify(c)); }

  async function awardPoints(order) {
    const cpf = (order._cpf || order.cpf || '').replace(/\D/g,'');
    if (!cpf || cpf.length !== 11) return;
    const pts = Math.floor(Math.abs(order._total || 0) * (pointsConfig.rate || 1));
    if (pts <= 0) return;
    if (sb) {
      const { data: ex, error: selErr } = await sb.from('customers').select('points,total_spent').eq('cpf', cpf).maybeSingle();
      if (selErr) { console.warn('[Points] select error:', selErr.message); }
      if (ex) {
        const { error: updErr } = await sb.from('customers').update({ points: (ex.points||0)+pts, total_spent: (ex.total_spent||0)+(order._total||0), name: order.buyerName||'', phone: order._phone||'', email: order._email||'' }).eq('cpf', cpf);
        if (updErr) { console.warn('[Points] update error:', updErr.message); return; }
      } else {
        const { error: insErr } = await sb.from('customers').insert({ cpf, name: order.buyerName||'', phone: order._phone||'', email: order._email||'', points: pts, total_spent: order._total||0 });
        if (insErr) { console.warn('[Points] insert error:', insErr.message); return; }
      }
    }
    const upd = customers.find(c=>c.cpf===cpf) ? customers.map(c=>c.cpf===cpf?{...c,points:(c.points||0)+pts,total_spent:(c.total_spent||0)+(order._total||0)}:c) : [...customers,{cpf,name:order.buyerName||'',phone:order._phone||'',email:order._email||'',points:pts,total_spent:order._total||0}];
    persistCustomers(upd);
    showToast(`⭐ +${pts} pontos VG creditados!`, 'success');
  }

  // Ref para cancelar checkPoints stale em caso de digitação rápida
  const _checkPointsReq = React.useRef(0);
  async function checkPoints(cpf) {
    const clean = (cpf||'').replace(/\D/g,'');
    if (clean.length < 11) { setPointsBalance(null); return; }
    const reqId = ++_checkPointsReq.current;
    let data = null;
    if (sb) {
      // Só o saldo de pontos — o CPF não devolve nome/telefone/e-mail de ninguém
      const r = await publicApi('points', { cpf: clean });
      if (reqId !== _checkPointsReq.current) return; // resposta stale, ignora
      if (!r.error && r.points) data = { cpf: clean, points: r.points };
    } else {
      data = customers.find(c=>c.cpf===clean)||null;
    }
    setPointsBalance(data ? { ...data, points: data.points ?? 0 } : { cpf: clean, points: 0 });
    if (data) {
      const updates = {};
      if (data.name && !checkout.nomeCompleto) updates.nomeCompleto = data.name;
      if (data.phone && !checkout.telefone) updates.telefone = data.phone;
      if (data.email && !checkout.email) updates.email = data.email;
      if (Object.keys(updates).length > 0) {
        saveCheckoutData({ ...checkout, cpf, ...updates });
        showToast('Dados preenchidos automaticamente ✓', 'success');
      }
    }
  }

  async function applyCouponCode() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    let c = coupons.find(x => x.code.toUpperCase() === code && x.active !== false);
    if (!c && sb) {
      const r = await publicApi('coupon', { code });
      const k = r && r.coupon;
      if (k) c = { id: k.id, code: k.code, type: k.type, value: k.value, minOrder: k.min_order, expiresAt: k.expires_at, active: k.active };
    }
    if (!c) { showToast('Cupom inválido ou inexistente', 'error'); return; }
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) { showToast('Cupom expirado', 'error'); return; }
    if (c.minOrder && myTotal < c.minOrder) { showToast(`Pedido mínimo R$ ${c.minOrder.toLocaleString('pt-BR')} para este cupom`, 'error'); return; }
    setAppliedCoupon(c);
    showToast(`Cupom ${c.code} aplicado! ✓`, 'success');
  }

  function generateToken() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  function savePreorder(peptide, form, silent = false) {
    if (preorderLocked) { showToast('Reservas encerradas — produto já disponível para compra!', 'error'); return; }
    const incomingQty = parseInt(form.qty)||1;
    // Agrupar: se já existe reserva ativa do mesmo cliente+produto, incrementar qty
    const existing = preorders.find(p =>
      ['pending','notified'].includes(p.status||'pending') &&
      p.productId === peptide.id &&
      (p.name||'').toLowerCase() === (form.name||'').toLowerCase()
    );
    if (existing) {
      const newQty = (existing.qty||0) + incomingQty;
      const updated = preorders.map(p => p.id === existing.id ? {...p, qty: newQty} : p);
      setPreorders(updated);
      localStorage.setItem('vg-preorders', JSON.stringify(updated));
      if (sb) {
        if (ADMIN_PW) sb.from('preorders').update({ qty: newQty }).eq('id', existing.id)
          .then(({ error }) => { if (error) console.warn('[Supabase] Preorder merge error:', error.message); });
        else if (existing.token) publicApi('preorder_update', { token: existing.token, fields: { qty: newQty } });
      }
      if (!silent) showToast(`Reserva de ${peptide.name} atualizada: ×${newQty} total 🔔`, 'success');
      return;
    }
    const token = generateToken();
    const entry = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2,7),
      token,
      productId: peptide.id,
      productName: peptide.name,
      name: form.name,
      whatsapp: form.whatsapp,
      qty: incomingQty,
      date: new Date().toLocaleDateString('pt-BR'),
      ts: Date.now(),
      status: 'pending',
      notifiedAt: null,
      reminderSent: false,
      _mine: true,
    };
    const updated = [...preorders, entry];
    setPreorders(updated);
    localStorage.setItem('vg-preorders', JSON.stringify(updated));
    // Salvar no Supabase
    if (sb) publicApi('preorder_add', { entry: {
      id: entry.id, token: entry.token, product_id: entry.productId,
      product_name: entry.productName, name: entry.name, whatsapp: entry.whatsapp,
      qty: entry.qty, date: entry.date, ts: entry.ts,
    } }).then(r => { if (!r.ok) { console.warn('[Supabase] Preorder save error:', r.error); showToast('Erro ao salvar pré-order no servidor: ' + (r.error || 'tente de novo'), 'error'); } });
    // Notify STORE about new pre-order (só se não vier do checkout, que já envia msg)
    if (!silent) {
      const reservaNum = '#' + (Date.now()+'').slice(-6);
      const msg = encodeURIComponent(
        '📋 *Nova reserva recebida!*\n\n' +
        '👤 *Cliente:* ' + form.name + '\n' +
        '📱 *WhatsApp:* ' + form.whatsapp + '\n' +
        '💊 *Produto:* ' + peptide.name + '\n' +
        '🔢 *Quantidade:* ' + (parseInt(form.qty)||1) + ' unidade(s)\n' +
        '🔖 *Reserva:* ' + reservaNum
      );
      window.open('https://wa.me/447418333521?text=' + msg, '_blank');
    }
  }

  function removePreorder(id) {
    const updated = preorders.filter(p=>p.id!==id);
    setPreorders(updated);
    localStorage.setItem('vg-preorders', JSON.stringify(updated));
    if (sb) sb.from('preorders').delete().eq('id', id)
      .then(({ error }) => { if (error) console.warn('[Supabase] Delete preorder error:', error.message); });
  }

  function persistPreorders(list) {
    const before = new Map(preorders.map(p => [p.id, p]));
    setPreorders(list);
    localStorage.setItem('vg-preorders', JSON.stringify(list));
    // Sync só do que mudou: admin grava tudo; o cliente só a própria reserva (pelo token)
    if (!sb) return;
    list.forEach(po => {
      const b = before.get(po.id);
      if (b && b.status === po.status && b.qty === po.qty && b.notifiedAt === po.notifiedAt && b.reminderSent === po.reminderSent) return;
      if (ADMIN_PW) {
        sb.from('preorders').update({
          status: po.status, qty: po.qty,
          notified_at: po.notifiedAt ? new Date(po.notifiedAt).toISOString() : null,
          reminder_sent: po.reminderSent || false
        }).eq('id', po.id).then(({ error }) => {
          if (error) console.warn('[Supabase] Preorder update error:', error.message);
        });
      } else if (po.token) {
        publicApi('preorder_update', { token: po.token, fields: { qty: po.qty, status: po.status } });
      }
    });
  }

  function availableStock(productId) {
    // If product has no stock control (key absent), it's always available (null = unlimited)
    if (!(productId in stock)) return null;
    const total = stock[productId] ?? 0;
    const reservedByPreorders = preorders
      .filter(po => po.productId === productId && ['pending','notified'].includes(po.status || 'pending'))
      .reduce((sum, po) => sum + (po.qty || 1), 0);
    const baseAvail = Math.max(0, total - reservedByPreorders);
    // Purchase order cap: from standalone POs + pending import history entries
    const standaloneCap = purchaseOrders
      .filter(po => po.productId === productId && po.status === 'pending')
      .reduce((sum, po) => sum + (po.qty || 0), 0);
    const productSku = products.find(p => p.id === productId)?.sku;
    const importCap = productSku ? importHistory
      .filter(h => h.status && h.status !== 'entregue' && h.status !== 'apreendida')
      .reduce((sum, h) => {
        const item = (h.items || []).find(it => it.sku === productSku);
        return sum + (item ? parseInt(item.vials) || parseInt(item.boxes) * 10 || 0 : 0);
      }, 0) : 0;
    const poCapQty = standaloneCap + importCap;
    if (poCapQty > 0) {
      // For cap logic: count confirmed Supabase orders per-product + client's own cart
      const confirmedReservations = orders
        .filter(o => {
          if (!o._supabase) return o.peptideId === productId;
          return ['pendente','pago','enviado'].includes(o.status || 'pendente');
        })
        .reduce((sum, o) => {
          if (!o._supabase) return sum + (o.qty || 0);
          const items = o._items && o._items.length > 0 ? o._items : [{peptideId: o.peptideId, qty: o.qty || 1}];
          const match = items.find(it => it.peptideId === productId);
          return sum + (match ? (match.qty || 1) : 0);
        }, 0);
      const liveReservations = confirmedReservations
        + preorders
          .filter(po => po.productId === productId && ['pending','notified'].includes(po.status || 'pending'))
          .reduce((sum, po) => sum + (po.qty || 1), 0);
      const capAvail = Math.max(0, poCapQty - liveReservations);
      // Stock beyond the cap is from already-delivered imports — freely available
      const uncappedStock = Math.max(0, baseAvail - poCapQty);
      // Never return MORE than what's physically in stock
      // But if stock > 0 and cap is still open, show at least capAvail
      return baseAvail > 0 ? Math.min(baseAvail, capAvail + uncappedStock) : 0;
    }
    return baseAvail;
  }

  function notifyPreorder(po) {
    const now = Date.now();
    const expireAt = now + 12*60*60*1000;
    const updated = preorders.map(p => p.id===po.id ? {...p, status:'notified', notifiedAt:now, reminderSent:false} : p);
    persistPreorders(updated);
    const firstName = (po.name || 'Cliente').split(' ')[0];
    const portalLink = window.location.origin + window.location.pathname + '?preorder=' + po.token;
    const msg = encodeURIComponent(
      '🎉 *Produto disponível!*\n\n' +
      'Olá ' + firstName + '! Seu produto reservado chegou ao estoque.\n\n' +
      '📦 *' + po.productName + '* (×' + po.qty + ')\n\n' +
      '⏰ Você tem *12 horas* para confirmar.\n\n' +
      '💸 *Pagando via PIX o frete é grátis!*\n\n' +
      '👇 Clique para concluir sua compra:\n' +
      portalLink
    );
    const wnum = (po.whatsapp || '').replace(/\D/g,'');
    window.open('https://wa.me/55' + wnum + '?text=' + msg, '_blank');
    showToast('WhatsApp aberto para ' + (po.name || 'cliente'), 'success');
  }

  function sendReminder(po) {
    const updated = preorders.map(p => p.id===po.id ? {...p, reminderSent:true} : p);
    persistPreorders(updated);
    const portalLinkR = window.location.origin + window.location.pathname + '?preorder=' + po.token;
    const msg = encodeURIComponent(
      '⏰ *Lembrete — Sua reserva expira em 2 horas!*\n\n' +
      'Olá ' + (po.name || 'Cliente').split(' ')[0] + ', não esqueça de confirmar sua compra de *' + po.productName + '* (×' + po.qty + ').\n\n' +
      '💸 *Pagando via PIX o frete é grátis!*\n\n' +
      '👇 Acesse agora para finalizar:\n' +
      portalLinkR
    );
    const wnum = (po.whatsapp || '').replace(/\D/g,'');
    window.open('https://wa.me/55' + wnum + '?text=' + msg, '_blank');
  }

  function checkPreorderExpiry() {
    const now = Date.now();
    let changed = false;
    const updated = preorders.map(po => {
      if (po.status === 'notified' && po.notifiedAt) {
        const elapsed = now - po.notifiedAt;
        const total12h = 12*60*60*1000;
        // Mark expired
        if (elapsed >= total12h) { changed = true; return {...po, status:'expired'}; }
        // Auto-send reminder at 10h (2h before expiry)
        if (elapsed >= 10*60*60*1000 && !po.reminderSent) {
          sendReminder(po);
          changed = true;
          return {...po, reminderSent:true};
        }
      }
      return po;
    });
    if (changed) persistPreorders(updated);
  }

  function cancelPreorderByToken(token) {
    const updated = preorders.map(po => po.token===token ? {...po, status:'cancelled'} : po);
    persistPreorders(updated);
  }

  function reducePreorderQty(token, newQty) {
    const updated = preorders.map(po => {
      if (po.token !== token) return po;
      if (newQty >= po.qty) return po; // never allow increase
      return {...po, qty: Math.max(1, newQty)};
    });
    persistPreorders(updated);
  }

  function showToast(msg, type = "success") {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }

  function saveName(n) { setMyName(n); localStorage.setItem("vg-nome", n); }

  function handleWelcomeConfirm() {
    const n = nameModalInput.trim();
    if (!n) return;
    saveName(n);
    localStorage.setItem("vg-welcomed", "1");
    setShowWelcome(false);
  }

  function handleNameConfirm() {
    const n = nameModalInput.trim();
    if (!n) return;
    saveName(n);
    setShowNameModal(false);
  }

  // Cart for current user
  const myOrders = useMemo(() => orders.filter(o => !o._supabase && (o.buyerName || '').toLowerCase() === myName.toLowerCase()), [orders, myName]);
  const myTotal  = useMemo(() => myOrders.reduce((s, o) => { const p = products.find(x => x.id === o.peptideId); const unitPrice = o._packPrice !== undefined ? o._packPrice : effectivePrice(p); return s + (o.qty||0) * unitPrice; }, 0), [myOrders, productPromo]);
  const cartCount = myOrders.reduce((s, o) => s + (o.qty || 0), 0);
  // Desconto de combo só no /novo (o site antigo não mostra combos)
  const bundleInfo = useMemo(() => IS_NOVO ? calcBundleDiscount(cartBundles, myOrders, products, effectivePrice, bundles) : { total: 0, applied: [] }, [cartBundles, myOrders, products, productPromo, bundles]);
  React.useEffect(() => {
    // Combo cujo item saiu do carrinho deixa de valer (não volta sozinho)
    if (IS_NOVO && bundleInfo.applied.length !== cartBundles.length) setCartBundles(bundleInfo.applied.map(b => b.id));
  }, [bundleInfo]);

  // Adiciona 1 de cada item do combo numa única gravação do carrinho
  async function addBundleToCart(bundle) {
    let name = myName.trim();
    if (!name) { name = (checkout.nomeCompleto || '').trim() || 'Cliente'; saveName(name); }
    const items = bundle.items.map(id => products.find(p => p.id === id));
    if (items.some(p => !p)) { showToast('Combo indisponível no momento', 'error'); return; }
    const mine = o => !o._supabase && !o._packId && (o.buyerName || '').toLowerCase() === name.toLowerCase();
    for (const p of items) {
      const avail = availableStock(p.id);
      if (avail !== null && avail <= 0) { showToast(`${p.name} esgotado — combo indisponível`, 'error'); return; }
    }
    let newStock = { ...stock };
    const done = [];
    for (const p of items) {
      if (sb && stock[p.id] != null) {
        const { data: q, error } = await sb.rpc('decrement_stock', { p_product_id: p.id, p_qty: 1 });
        if (error || q === -1) {
          // devolve o que já foi reservado deste combo
          for (const d of done) { const { data: back } = await sb.rpc('increment_stock', { p_product_id: d, p_qty: 1 }); if (back != null) newStock[d] = back; }
          localStorage.setItem('vg-stock', JSON.stringify(newStock)); setStock(newStock);
          showToast(`Estoque insuficiente de ${p.name} 😅`, 'error'); return;
        }
        newStock[p.id] = q; done.push(p.id);
      }
    }
    if (done.length) { localStorage.setItem('vg-stock', JSON.stringify(newStock)); setStock(newStock); }
    let next = [...orders];
    const _now = new Date(); const _pad = n => String(n).padStart(2, '0');
    items.forEach((p, i) => {
      const ex = next.find(o => mine(o) && o.peptideId === p.id);
      if (ex) next = next.map(o => o === ex ? { ...o, qty: (o.qty || 0) + 1 } : o);
      else next.push({ id: `${_now.getFullYear()}${_pad(_now.getMonth() + 1)}${_pad(_now.getDate())}${_pad(_now.getHours())}${_pad(_now.getMinutes())}${_pad(_now.getSeconds())}_${Math.random().toString(36).slice(2, 6)}${i}`, peptideId: p.id, buyerName: name, qty: 1, createdAt: _now.toISOString() });
    });
    persistOrders(next);
    setCartBundles([...cartBundles, bundle.id]);
    showToast(`Combo "${bundle.name}" adicionado ✓`);
  }

  function openModal(peptide) {
    setModal({ peptide });
    setFormName(myName);
    setFormQty(1);
  }

  async function addPackToCart(product, pack) {
    const name = myName.trim();
    if (!name) { showToast('Informe seu nome primeiro', 'error'); return; }
    const existing = orders.find(o => !o._supabase && o.peptideId === product.id && (o.buyerName||'').toLowerCase() === name.toLowerCase());
    if (existing) { showToast('Remova o produto do carrinho antes de adicionar um pack', 'error'); return; }
    const avail = availableStock(product.id);
    if (avail !== null && avail >= 0 && avail < pack.qty) { showToast(`Estoque insuficiente para este pack (disponível: ${avail})`, 'error'); return; }
    const packUnitPrice = Math.round(effectivePrice(product) * (1 - pack.discount / 100));
    const _now = new Date(); const _pad = n=>String(n).padStart(2,'0'); const _rand = Math.random().toString(36).slice(2,6);
    const newOrder = { id: `${_now.getFullYear()}${_pad(_now.getMonth()+1)}${_pad(_now.getDate())}${_pad(_now.getHours())}${_pad(_now.getMinutes())}${_pad(_now.getSeconds())}_${_rand}`, peptideId: product.id, buyerName: name, qty: pack.qty, createdAt: new Date().toISOString(), _packId: pack.id, _packName: pack.name, _packPrice: packUnitPrice };
    if (sb && stock[product.id] != null) {
      const { data: newQty, error } = await sb.rpc('decrement_stock', { p_product_id: product.id, p_qty: pack.qty });
      if (error || newQty === -1) { showToast('Estoque insuficiente para este pack 😅', 'error'); return; }
      const newStock = { ...stock, [product.id]: newQty };
      localStorage.setItem('vg-stock', JSON.stringify(newStock));
      setStock(newStock);
    }
    persistOrders([...orders, newOrder]);
    saveName(name);
    showToast(`Pack "${pack.name}" adicionado ao carrinho ✓`, 'success');
  }

  // Novo layout: adiciona 1 unidade direto, sem o modal de nome/quantidade
  async function quickAdd(product, qty = 1) {
    let name = myName.trim();
    if (!name) { name = (checkout.nomeCompleto || '').trim() || 'Cliente'; saveName(name); }
    const avail = availableStock(product.id);
    if (avail === 0) { showToast('Produto esgotado — use Reservar', 'error'); return; }
    const existing = orders.find(o => !o._supabase && !o._packId && o.peptideId === product.id && (o.buyerName || '').toLowerCase() === name.toLowerCase());
    if (existing) { await updateQtyInCart(existing.id, qty); return; }
    if (avail !== null && avail < qty) { showToast(`Estoque insuficiente — apenas ${avail} disponível(is)`, 'error'); return; }
    if (sb && stock[product.id] != null) {
      const { data: newQty, error } = await sb.rpc('decrement_stock', { p_product_id: product.id, p_qty: qty });
      if (error || newQty === -1) { showToast('Estoque insuficiente — outro cliente acabou de reservar 😅', 'error'); return; }
      const newStock = { ...stock, [product.id]: newQty };
      localStorage.setItem('vg-stock', JSON.stringify(newStock));
      setStock(newStock);
    }
    const _now = new Date(); const _pad = n => String(n).padStart(2, '0'); const _rand = Math.random().toString(36).slice(2, 6);
    const id = `${_now.getFullYear()}${_pad(_now.getMonth() + 1)}${_pad(_now.getDate())}${_pad(_now.getHours())}${_pad(_now.getMinutes())}${_pad(_now.getSeconds())}_${_rand}`;
    persistOrders([...orders, { id, peptideId: product.id, buyerName: name, qty, createdAt: _now.toISOString() }]);
    showToast(`${product.name} adicionado ✓`);
  }

  function versionTap() {
    const now = Date.now();
    const taps = (window.__vtaps || []).filter(t => now - t < 2000);
    taps.push(now);
    window.__vtaps = taps;
    if (taps.length >= 5) { window.__vtaps = []; adminUnlocked ? setView('admin') : handleAdminUnlock(); }
  }

  async function handleAddToCart() {
    const name = formName.trim();
    if (!name || formQty < 1) return;
    const avail = availableStock(modal.peptide.id);
    const _now = new Date(); const _pad = n=>String(n).padStart(2,'0'); const _rand = Math.random().toString(36).slice(2,6);
    const _orderId = `${_now.getFullYear()}${_pad(_now.getMonth()+1)}${_pad(_now.getDate())}${_pad(_now.getHours())}${_pad(_now.getMinutes())}${_pad(_now.getSeconds())}_${_rand}`;

    if (avail === 0) { showToast('Produto esgotado — use o botão Reservar', 'error'); setModal(null); return; }

    const existing = orders.find(o => !o._supabase && o.peptideId === modal.peptide.id && (o.buyerName || '').toLowerCase() === name.toLowerCase());
    const alreadyInCart = existing ? existing.qty : 0;
    if (avail > 0 && (alreadyInCart + formQty) > avail) {
      showToast(`Estoque insuficiente — apenas ${avail - alreadyInCart} unidade(s) disponível(is)`, 'error');
      return;
    }
    let newOrders;
    if (existing) {
      newOrders = orders.map(o => o === existing ? { ...o, qty: (o.qty || 0) + formQty } : o);
      showToast(`${modal.peptide.name} atualizado no carrinho ✓`);
    } else {
      newOrders = [...orders, { id: _orderId, peptideId: modal.peptide.id, buyerName: name, qty: formQty, createdAt: new Date().toISOString() }];
      showToast(`${modal.peptide.name} adicionado ao carrinho ✓`);
    }
    saveName(name);

    // Decremento atômico via Supabase RPC
    if (sb && stock[modal.peptide.id] != null) {
      const { data: newQty, error } = await sb.rpc('decrement_stock', { p_product_id: modal.peptide.id, p_qty: formQty });
      if (error || newQty === -1) { showToast('Estoque insuficiente — outro cliente acabou de reservar 😅', 'error'); return; }
      const newStock = { ...stock, [modal.peptide.id]: newQty };
      localStorage.setItem('vg-stock', JSON.stringify(newStock));
      setStock(newStock);
    } else {
      const newStock = { ...stock };
      if (newStock[modal.peptide.id] != null) newStock[modal.peptide.id] = Math.max(0, newStock[modal.peptide.id] - formQty);
      saveStock(newStock); setStock(newStock);
    }

    persistOrders(newOrders);
    setModal(null);
  }

  async function updateQtyInCart(orderId, delta) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const newQty = order.qty + delta;
    if (delta > 0) {
      const avail = availableStock(order.peptideId);
      if (avail <= 0) {
        showToast(`Estoque esgotado para este produto`, 'error');
        return;
      }
    }
    if (newQty <= 0) {
      // Devolver ao estoque via RPC
      if (sb && stock[order.peptideId] != null) {
        const { data: newQty2, error: incErr } = await sb.rpc('increment_stock', { p_product_id: order.peptideId, p_qty: order.qty });
        if (incErr) {
          console.warn('[Supabase] increment_stock error:', incErr.message);
        } else if (newQty2 != null) {
          const newStock = { ...stock, [order.peptideId]: newQty2 };
          localStorage.setItem('vg-stock', JSON.stringify(newStock));
          setStock(newStock);
        }
      } else {
        const newStock = { ...stock };
        if (newStock[order.peptideId] != null) newStock[order.peptideId] += order.qty;
        saveStock(newStock);
        setStock(newStock);
      }
      persistOrders(orders.filter(o => o.id !== orderId));
      showToast("Item removido do carrinho", "info");
    } else {
      if (sb && stock[order.peptideId] != null) {
        if (delta > 0) {
          // Adicionar unidade: decrementa estoque no banco
          const { data: newQty2, error } = await sb.rpc('decrement_stock', {
            p_product_id: order.peptideId, p_qty: delta
          });
          if (error || newQty2 === -1) {
            showToast('Estoque insuficiente — outro cliente acabou de reservar 😅', 'error');
            return;
          }
          const newStock = { ...stock, [order.peptideId]: newQty2 };
          localStorage.setItem('vg-stock', JSON.stringify(newStock));
          setStock(newStock);
        } else {
          // Reduzir unidade: devolve ao estoque no banco
          const { data: newQty2, error: incErr2 } = await sb.rpc('increment_stock', { p_product_id: order.peptideId, p_qty: Math.abs(delta) });
          if (incErr2) {
            console.warn('[Supabase] increment_stock error:', incErr2.message);
          } else if (newQty2 != null) {
            const newStock = { ...stock, [order.peptideId]: newQty2 };
            localStorage.setItem('vg-stock', JSON.stringify(newStock));
            setStock(newStock);
          }
        }
      } else {
        const newStock = { ...stock };
        if (newStock[order.peptideId] != null) newStock[order.peptideId] = Math.max(0, newStock[order.peptideId] - delta);
        saveStock(newStock);
        setStock(newStock);
      }
      persistOrders(orders.map(o => o.id === orderId ? { ...o, qty: newQty } : o));
    }
  }

  async function removeFromCart(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      if (sb && stock[order.peptideId] != null) {
        const { data: newQty2, error: incErr } = await sb.rpc('increment_stock', { p_product_id: order.peptideId, p_qty: order.qty });
        if (incErr) {
          console.warn('[Supabase] increment_stock error:', incErr.message);
        } else if (newQty2 != null) {
          const newStock = { ...stock, [order.peptideId]: newQty2 };
          localStorage.setItem('vg-stock', JSON.stringify(newStock));
          setStock(newStock);
        }
      } else {
        const newStock = { ...stock };
        if (newStock[order.peptideId] != null) newStock[order.peptideId] += order.qty;
        saveStock(newStock);
        setStock(newStock);
      }
    }
    persistOrders(orders.filter(o => o.id !== orderId));
    showToast("Item removido", "info");
  }

  // Abre o modal da pool de remetentes (botão 📮 REMETENTES e menu Envios › Remetentes no /novo)
  function openSenderPool() {
    setEtiquetaModal({ _poolOnly: true }); setEtiquetaStep('settings');
    setMeForm({ name:'', phone:'', email:'', document:'', address:'', number:'', complement:'', district:'', city:'', state:'', postal_code:'' });
  }

  function handleAdminUnlock() {
    const lock = adminLockRef.current;
    if (Date.now() < lock.until) {
      const mins = Math.ceil((lock.until - Date.now()) / 60000);
      showToast(`Bloqueado. Tente em ${mins} min.`, "error"); return;
    }
    setAdminPwInput('');
    setAdminPwModal(true);
  }

  async function submitAdminPassword() {
    const pw = adminPwInput.trim();
    if (!pw) return;
    const lock = adminLockRef.current;
    if (Date.now() < lock.until) {
      const mins = Math.ceil((lock.until - Date.now()) / 60000);
      showToast(`Bloqueado. Tente em ${mins} min.`, "error"); return;
    }
    let res;
    try {
      res = await fetch('https://aumubzvdhzvtnqfzqeqd.supabase.co/functions/v1/verify-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
        },
        body: JSON.stringify({ password: pw }),
      });
    } catch (err) {
      console.error('[verify-admin] network error:', err);
      showToast("Sem conexão com o servidor. Verifique sua internet.", "error");
      return;
    }
    let data;
    try {
      data = await res.json();
    } catch (err) {
      const status = res.status;
      console.error('[verify-admin] parse error, status:', status, err);
      if (status === 401 || status === 403) showToast(`Função não autorizada (${status}). Redeploy com --no-verify-jwt.`, "error");
      else if (status >= 500) showToast(`Erro no servidor (${status}). Verifique ADMIN_PASSWORD.`, "error");
      else showToast(`Resposta inválida do servidor (${status}).`, "error");
      return;
    }
    if (data.ok) {
      adminLockRef.current = { attempts: 0, until: 0 };
      adminPwRef.current = pw; ADMIN_PW = pw;
      setAdminPwModal(false); setAdminPwInput('');
      setAdminUnlocked(true); showToast("Admin desbloqueado ✓"); setView("admin");
    } else {
      const attempts = (lock.attempts || 0) + 1;
      const until = attempts >= 5 ? Date.now() + 15 * 60 * 1000 : 0;
      adminLockRef.current = { attempts, until };
      setAdminPwInput('');
      if (data.locked || attempts >= 5) { setAdminPwModal(false); showToast("Muitas tentativas — bloqueado por 15 min!", "error"); }
      else showToast(`Código incorreto! (${attempts}/5)`, "error");
    }
  }

  async function adminRemove(orderId) {
    const order = orders.find(o => o.id === orderId);
    const prevOrders = orders;
    const prevStock = stock;
    if (order && sb && order._supabase) {
      const items = order._items || [{ peptideId: order.peptideId, qty: order.qty }];
      // Restaura estoque de todos os itens de forma atômica
      await Promise.all(items.map(async item => {
        if (item.peptideId && item.qty > 0 && stock[item.peptideId] != null) {
          const { data: newQty } = await sb.rpc('increment_stock', { p_product_id: item.peptideId, p_qty: item.qty });
          if (newQty != null) setStock(prev => ({ ...prev, [item.peptideId]: newQty }));
        }
      }));
      const { error } = await sb.from('orders').delete().eq('id', orderId);
      if (error) {
        console.warn('[Supabase] Delete order error:', error.message);
        showToast('Erro ao remover pedido no servidor. Verifique as permissões do banco.', 'error');
        setStock(prevStock);
        return;
      }
    }
    persistOrders(orders.filter(o => o.id !== orderId));
    showToast("Pedido removido", "info");
  }

  function copyWhatsApp() {
    const grouped = {};
    orders.forEach(o => {
      // Pedidos Supabase com múltiplos itens: expandir cada item individualmente
      const itemList = (o._supabase && o._items && o._items.length > 0)
        ? o._items.map(i => ({ peptideId: i.peptideId, qty: i.qty, buyerName: o.buyerName }))
        : [{ peptideId: o.peptideId, qty: o.qty, buyerName: o.buyerName }];
      itemList.forEach(item => {
        const p = products.find(x => x.id === item.peptideId);
        const pName = p ? p.name : item.peptideId;
        if (!grouped[pName]) grouped[pName] = [];
        grouped[pName].push({ buyerName: item.buyerName, qty: item.qty });
      });
    });
    let text = "🧬 *VANGUARD PEPTIDES — PEDIDOS*\n\n";
    Object.entries(grouped).forEach(([pName, items]) => {
      const total = items.reduce((s, i) => s + i.qty, 0);
      text += `*${pName}* (${total} und)\n`;
      items.forEach(i => { text += `• ${i.buyerName} ×${i.qty}\n`; });
      text += "\n";
    });
    navigator.clipboard.writeText(text).then(() => showToast("Lista copiada! 📋")).catch(() => showToast("Erro ao copiar", "error"));
  }

  // ── totals for admin ──
  const totalRevenue = useMemo(() => orders.reduce((s, o) => {
    if (o._supabase && o._total != null) return s + o._total;
    return s + (o.qty || 0) * (products.find(p => p.id === o.peptideId)?.price || 0);
  }, 0), [orders, products]);
  const totalUnits   = useMemo(() => orders.reduce((s, o) => s + (o.qty || 0), 0), [orders]);
  const totalBuyers  = useMemo(() => new Set(orders.map(o => (o.buyerName || '').toLowerCase())).size, [orders]);

  // ── cat groups ──
  const catGroups = CATEGORIES.filter(c => c.id !== "all").map(c => ({
    cat: c,
    peptides: (activeCat === "all" ? products : products.filter(p => p.category === activeCat)).filter(p => p.category === c.id)
  })).filter(g => g.peptides.length);

  function peptideCartQty(peptideId) {
    return myOrders.filter(o => o.peptideId === peptideId).reduce((s, o) => s + (o.qty || 0), 0);
  }

  // Expiry + reminder check every 60s
  React.useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      let list; try { list = JSON.parse(localStorage.getItem('vg-preorders')||'[]'); } catch { list = []; }
      let changed = false;
      const updated = list.map(po => {
        if (po.status === 'notified' && po.notifiedAt) {
          const elapsed = now - po.notifiedAt;
          if (elapsed >= 24*60*60*1000) { changed = true; return {...po, status:'expired'}; }
          if (elapsed >= 22*60*60*1000 && !po.reminderSent) {
            changed = true;
            return {...po, reminderSent:true};
          }
        }
        return po;
      });
      if (changed) {
        localStorage.setItem('vg-preorders', JSON.stringify(updated));
        setPreorders(updated);
      }
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const novoActive = IS_NOVO && view !== 'admin' && !portalToken && !manualOrderView;
  // Admin dentro do /novo: casca nova por cima das abas antigas (o admin em /antigo/ segue o antigo)
  const novoAdmin = IS_NOVO && view === 'admin' && adminUnlocked && !portalToken && !manualOrderView;
  const nvaActive = nvaActiveItem(adminTab, nvaSec, adminStatusFilter);
  const nvaBadges = novoAdmin ? {
    pedidos: orders.filter(o => o._supabase && (o.status || 'pendente') === 'pendente').length,
    etiquetas: orders.filter(o => o._supabase && o.status === 'pago' && !o.label_url && !isMotoboyOrder(o)).length,
  } : {};
  function nvaPick(it) {
    if (it.action === 'senders') { openSenderPool(); return; }
    if (it.id === 'etiquetas') setAdminStatusFilter('pago');
    else if (it.id === 'pedidos' && nvaActive !== 'pedidos') setAdminStatusFilter('all'); // vindo de outra seção, sem o filtro de Etiquetas
    setNvaSec(it.id);
    setAdminTab(it.tab);
    window.scrollTo(0, 0);
  }
  // ── Pedidos no /novo: próximo passo de cada pedido ──
  // Só chama as funções que o admin antigo já usa (cycleStatus, gerarEtiqueta, modal PIX,
  // sendTrackingWhatsApp, adminRemove); a única coisa nova é a confirmação antes de agir.
  const NVA_ST = { pendente: 'Aguardando', pago: 'Pago', enviado: 'Enviado', entregue: 'Entregue', extraviado: 'Extraviado' };
  const NVA_NEXT = { pendente: 'pago', pago: 'enviado', enviado: 'entregue' };
  function nvaAdvance(order) {
    const next = NVA_NEXT[order.status || 'pendente'];
    if (!next) return;
    const wa = order._phone && waAuto ? '\n\nAbre o WhatsApp do cliente com a mensagem automática.' : '';
    if (!window.confirm(`${order._code || '#' + order.id} · ${order.buyerName || 'Cliente'}\n\nMarcar como ${NVA_ST[next].toUpperCase()}?${wa}`)) return;
    cycleStatus(order.id);
  }
  function nvaWhats(order) {
    const digits = (order._phone || '').replace(/\D/g, '');
    const intl = digits.startsWith('55') ? digits : '55' + digits;
    if (['pago','enviado','entregue'].includes(order.status)) { openStatusWhatsApp(order); return; }
    window.open(`https://wa.me/${intl}`, '_blank');
  }
  function nvaRemove(order) {
    if (!window.confirm(`Remover o pedido ${order._code || '#' + order.id} (${order.buyerName || 'Cliente'})?\n\nO estoque dos itens volta para a loja.`)) return;
    if (nvaSelOrder === order.id) setNvaSelOrder(null);
    adminRemove(order.id);
  }
  function nvaSteps(order) {
    const st = order.status || 'pendente';
    const sec = [];
    let main;
    if (st === 'pendente') {
      main = { label: 'Marcar como pago', run: () => nvaAdvance(order), primary: true };
      sec.push({ label: 'Cobrar PIX', run: () => { setPixCode(''); setPixModal(order); } });
    } else if (st === 'pago' && isMotoboyOrder(order)) {
      main = { label: 'Marcar como enviado', run: () => nvaAdvance(order), primary: true };
    } else if (st === 'pago' && !order.label_url) {
      main = { label: 'Gerar etiqueta', run: () => gerarEtiqueta(order), primary: true };
      sec.push({ label: 'Marcar como enviado', run: () => nvaAdvance(order) });
    } else if (st === 'pago') {
      main = { label: 'Marcar como enviado', run: () => nvaAdvance(order), primary: true };
      sec.push({ label: 'Reimprimir etiqueta', run: () => gerarEtiqueta(order) });
    } else if (st === 'enviado') {
      main = { label: 'Marcar como entregue', run: () => nvaAdvance(order), primary: true };
    } else {
      main = { label: 'Ver detalhes', run: () => setOrderDetail(order), primary: false };
    }
    if (order.tracking_code) sec.push({ label: 'Enviar rastreio', run: () => sendTrackingWhatsApp(order) });
    if (order._phone) sec.push({ label: 'WhatsApp', run: () => nvaWhats(order) });
    return { main, sec };
  }
  function nvaWhen(iso) {
    const d = iso ? new Date(iso) : null;
    if (!d || isNaN(d)) return '';
    const t = new Date();
    const hm = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === t.toDateString()) return 'hoje ' + hm;
    const y = new Date(t); y.setDate(t.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return 'ontem ' + hm;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
  function nvaItemsText(order) {
    const items = order._items && order._items.length > 0 ? order._items : [{ peptideId: order.peptideId, qty: order.qty || 1 }];
    return items.map(it => { const p2 = products.find(x => x.id === it.peptideId); return `${it.qty || 1}× ${p2 ? p2.name : (it.name || it.peptideId || '—')}`; });
  }
  return (
    <div className={novoActive ? 'novo-mode' : novoAdmin ? 'novo-admin' : ''}>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {novoAdmin && <style>{NOVO_ADMIN_CSS}</style>}
      {novoAdmin && <NovaAdminShell active={nvaActive} onPick={nvaPick} badges={nvaBadges} onExit={() => { setView('catalog'); window.scrollTo(0, 0); }} versionTag="v2.a1e782c" />}

      {novoActive && <NovaLoja
        products={products} categories={CATEGORIES} effectivePrice={effectivePrice} availableStock={availableStock}
        myOrders={myOrders} myTotal={myTotal} cartCount={cartCount}
        quickAdd={quickAdd} updateQtyInCart={updateQtyInCart} removeFromCart={removeFromCart} addPackToCart={addPackToCart} savePreorder={savePreorder}
        addBundleToCart={addBundleToCart} bundleInfo={bundleInfo} bundles={bundles} bestsellers={bestsellers} articles={articles}
        pointsBalance={pointsBalance} setPointsBalance={setPointsBalance} appliedPoints={appliedPoints} setAppliedPoints={setAppliedPoints} pointsConfig={pointsConfig} checkPoints={checkPoints}
        checkout={checkout} updateCheckout={updateCheckout} fetchCep={fetchCep} checkoutErrors={checkoutErrors} calcFreight={calcFreight}
        couponInput={couponInput} setCouponInput={setCouponInput} appliedCoupon={appliedCoupon} setAppliedCoupon={setAppliedCoupon} applyCouponCode={applyCouponCode}
        disclaimer={disclaimer} setDisclaimer={setDisclaimer} isSubmitting={isSubmitting} submitOrder={sendToWhatsApp}
        orderSuccessCode={orderSuccessCode} setOrderSuccessCode={setOrderSuccessCode}
        trackQuery={trackQuery} setTrackQuery={setTrackQuery} searchOrders={searchOrders} trackResults={trackResults} trackLoading={trackLoading} statusLabel={statusLabel}
        freteDestCep={freteDestCep} setFreteDestCep={setFreteDestCep} freteResults={freteResults} freteLoading={freteLoading} freteError={freteError} calcularFrete={calcularFrete}
        notices={notices.filter(n => !dismissedNotices.includes(n.id))} onVersionTap={versionTap} versionTag="v2.a1e782c"
      />}

      {/* ── CUSTOMER PORTAL ── */}
      {portalToken && (() => {
        const po = preorders.find(x => x.token === portalToken);
        if (!po) return (
          <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16,padding:24}}>
            <div style={{fontSize:"2rem"}}>🔍</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.9rem",color:"var(--muted)"}}>Reserva não encontrada ou expirada.</div>
            <button onClick={()=>{setPortalToken(null);window.history.replaceState({},'',window.location.pathname);}} style={{padding:"10px 24px",background:"var(--accent)",border:"none",borderRadius:8,color:"#000",fontWeight:700,cursor:"pointer"}}>Voltar à loja</button>
          </div>
        );
        return <PortalView po={po} preorders={preorders} persistPreorders={persistPreorders} cancelPreorderByToken={cancelPreorderByToken} showToast={showToast} setPortalToken={setPortalToken} setView={setView} orders={orders} stock={stock} persistOrders={persistOrders} saveStock={saveStock} setStock={setStock} setCheckoutOpen={setCheckoutOpen} setCheckout={setCheckout} setMyName={setMyName} />;
      })()}



      {/* ── MANUAL ORDER VIEW ── */}
      {manualOrderView && !portalToken && (() => {
        if (manualSuccess) return (
          <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:20,padding:24,textAlign:'center'}}>
            <div style={{fontSize:'3rem'}}>✅</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.4rem',fontWeight:700,color:'var(--accent)'}}>Pedido enviado!</div>
            <div style={{color:'var(--muted)',fontSize:'0.9rem',maxWidth:380}}>Seu pedido foi registrado com sucesso. Guarde o código abaixo para acompanhar o status.</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:'1.6rem',fontWeight:700,color:'var(--accent)',background:'rgba(0,229,195,0.08)',border:'1px solid rgba(0,229,195,0.25)',borderRadius:12,padding:'14px 32px',letterSpacing:2}}>{manualSuccess.code}</div>
            <div style={{color:'var(--muted)',fontSize:'0.85rem'}}>Total: <strong style={{color:'var(--text)'}}>R$ {manualSuccess.total.toLocaleString('pt-BR')}</strong></div>
            <div style={{color:'var(--muted)',fontSize:'0.78rem',maxWidth:340}}>Em breve o vendedor entrará em contato pelo WhatsApp para confirmar o pagamento.</div>
          </div>
        );
        const mf = manualForm;
        const setMf = (field, val) => setManualForm(f => ({...f, [field]: val}));
        const availableProducts = products.filter(p => availableStock(p.id) === null || availableStock(p.id) > 0);

        function toggleItem(pId) {
          setManualItems(prev => prev.find(x=>x.peptideId===pId) ? prev.filter(x=>x.peptideId!==pId) : [...prev, {peptideId:pId, qty:1}]);
        }
        function setItemQty(pId, qty) {
          setManualItems(prev => prev.map(x => x.peptideId===pId ? {...x, qty: Math.max(1, parseInt(qty)||1)} : x));
        }

        const isPix = mf.pagamento === 'pix';
        const subtotal = manualItems.reduce((s, item) => {
          const p = products.find(x=>x.id===item.peptideId);
          return s + (p ? effectivePrice(p) * item.qty : 0);
        }, 0);
        const freightInfo = calcFreight(mf.estado, subtotal);
        const freight = isPix ? 0 : freightInfo.value;
        const pixDiscount = isPix ? Math.round(subtotal * 0.10) : 0;
        const total = subtotal - pixDiscount + freight;

        async function fetchCepManual(cep) {
          const clean = cep.replace(/\D/g,'');
          if (clean.length !== 8) return;
          try {
            const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
            const d = await r.json();
            if (!d.erro) setManualForm(f => ({...f, estado: d.uf, cidade: d.localidade, bairro: d.bairro, rua: d.logradouro}));
          } catch {}
        }

        async function submitManualOrder() {
          const errs = {};
          if (!mf.nomeCompleto.trim()) errs.nomeCompleto = true;
          if (!mf.telefone.trim()) errs.telefone = true;
          if (!mf.pagamento) errs.pagamento = true;
          if (!mf.cep.replace(/\D/g,'').length === 8) errs.cep = true;
          if (!mf.rua.trim()) errs.rua = true;
          if (!mf.numero.trim()) errs.numero = true;
          if (!mf.cidade.trim()) errs.cidade = true;
          if (!mf.estado.trim()) errs.estado = true;
          if (manualItems.length === 0) errs.items = true;
          setManualErrors(errs);
          if (Object.keys(errs).length > 0) { showToast('Preencha todos os campos obrigatórios', 'error'); return; }
          if (manualSubmitting) return;
          setManualSubmitting(true);
          let resv = null;
          try {
            const orderItems = manualItems.map(item => ({ peptideId: item.peptideId, name: (products.find(x=>x.id===item.peptideId)||{}).name||item.peptideId, qty: item.qty }));
            // Reserva o estoque como o carrinho faz; devolve se o pedido não for gravado
            resv = await reserveOrderStock(orderItems);
            if (!resv.ok) { showToast(resv.error, 'error'); resv = null; setManualSubmitting(false); return; }
            const res = await fetch('https://aumubzvdhzvtnqfzqeqd.supabase.co/functions/v1/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
              body: JSON.stringify({
                buyer_name: mf.nomeCompleto,
                phone: mf.telefone,
                email: mf.email || null,
                cpf: mf.cpf || null,
                address: { rua: mf.rua, numero: mf.numero, complemento: mf.complemento, bairro: mf.bairro, cidade: mf.cidade, estado: mf.estado, cep: mf.cep },
                items: orderItems,
                payment: mf.pagamento,
                notes: mf.observacoes || null,
              }),
            });
            const data = await res.json();
            if (!data.ok) { await releaseOrderStock(resv.reserved); resv = null; showToast('Erro ao registrar pedido: ' + (data.error||'tente novamente'), 'error'); setManualSubmitting(false); return; }
            resv = null;
            setManualSuccess({ code: data.code, total: data.validatedTotal });
          } catch {
            if (resv) { await releaseOrderStock(resv.reserved); resv = null; }
            showToast('Erro de conexão. Tente novamente.', 'error'); setManualSubmitting(false);
          }
        }

        const inputStyle = (err) => ({ width:'100%', background:'rgba(255,255,255,0.04)', border:`1px solid ${err?'#ff6b35':'rgba(0,229,195,0.15)'}`, borderRadius:8, padding:'10px 14px', color:'var(--text)', fontSize:'0.88rem', fontFamily:"'DM Sans',sans-serif", outline:'none' });
        const labelStyle = { fontSize:'0.75rem', color:'var(--muted)', fontFamily:"'Space Mono',monospace", letterSpacing:'0.5px', marginBottom:4, display:'block' };
        const sectionStyle = { background:'rgba(10,18,25,0.85)', border:'1px solid rgba(0,229,195,0.1)', borderRadius:12, padding:20, marginBottom:16 };

        return (
          <div style={{minHeight:'100vh',padding:'80px 16px 40px',maxWidth:560,margin:'0 auto'}}>
            <div style={{marginBottom:24}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:700,color:'var(--accent)',marginBottom:4}}>Formulário de Pedido</div>
              <div style={{color:'var(--muted)',fontSize:'0.82rem'}}>Preencha os dados abaixo para registrar seu pedido. Após enviar, o vendedor entrará em contato para confirmar o pagamento.</div>
            </div>

            {/* Produtos */}
            <div style={sectionStyle}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'var(--accent)',letterSpacing:'1px',marginBottom:14}}>PRODUTOS</div>
              {manualErrors.items && <div style={{color:'#ff6b35',fontSize:'0.78rem',marginBottom:10}}>Selecione ao menos um produto</div>}
              {availableProducts.length === 0 && <div style={{color:'var(--muted)',fontSize:'0.85rem'}}>Nenhum produto disponível no momento.</div>}
              {availableProducts.map(p => {
                const selected = manualItems.find(x=>x.peptideId===p.id);
                const price = effectivePrice(p);
                return (
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid rgba(0,229,195,0.07)'}}>
                    <input type="checkbox" checked={!!selected} onChange={()=>toggleItem(p.id)} style={{accentColor:'var(--accent)',width:18,height:18,cursor:'pointer',flexShrink:0}} />
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'0.88rem',fontWeight:600,color:selected?'var(--text)':'var(--muted)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</div>
                      <div style={{fontSize:'0.75rem',color:'var(--accent)',fontFamily:"'Space Mono',monospace"}}>R$ {price.toLocaleString('pt-BR')}/amp</div>
                    </div>
                    {selected && (
                      <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                        <button onClick={()=>setItemQty(p.id, selected.qty-1)} style={{width:28,height:28,border:'1px solid rgba(0,229,195,0.3)',borderRadius:6,background:'transparent',color:'var(--accent)',cursor:'pointer',fontSize:'1rem',lineHeight:1}}>−</button>
                        <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.85rem',color:'var(--text)',minWidth:20,textAlign:'center'}}>{selected.qty}</span>
                        <button onClick={()=>setItemQty(p.id, selected.qty+1)} style={{width:28,height:28,border:'1px solid rgba(0,229,195,0.3)',borderRadius:6,background:'transparent',color:'var(--accent)',cursor:'pointer',fontSize:'1rem',lineHeight:1}}>+</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Dados pessoais */}
            <div style={sectionStyle}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'var(--accent)',letterSpacing:'1px',marginBottom:14}}>DADOS PESSOAIS</div>
              <div style={{display:'grid',gap:12}}>
                <div><label style={labelStyle}>NOME COMPLETO *</label><input style={inputStyle(manualErrors.nomeCompleto)} value={mf.nomeCompleto} onChange={e=>setMf('nomeCompleto',e.target.value)} placeholder="Seu nome completo" /></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div><label style={labelStyle}>TELEFONE / WHATSAPP *</label><input style={inputStyle(manualErrors.telefone)} value={mf.telefone} onChange={e=>setMf('telefone',e.target.value)} placeholder="(11) 99999-9999" /></div>
                  <div><label style={labelStyle}>CPF</label><input style={inputStyle(false)} value={mf.cpf} onChange={e=>setMf('cpf',e.target.value)} placeholder="000.000.000-00" /></div>
                </div>
                <div><label style={labelStyle}>E-MAIL</label><input style={inputStyle(false)} value={mf.email} onChange={e=>setMf('email',e.target.value)} placeholder="seu@email.com" type="email" /></div>
              </div>
            </div>

            {/* Endereço */}
            <div style={sectionStyle}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'var(--accent)',letterSpacing:'1px',marginBottom:14}}>ENDEREÇO DE ENTREGA</div>
              <div style={{display:'grid',gap:12}}>
                <div><label style={labelStyle}>CEP *</label><input style={inputStyle(manualErrors.cep)} value={mf.cep} onChange={e=>{ setMf('cep',e.target.value); if(e.target.value.replace(/\D/g,'').length===8) fetchCepManual(e.target.value); }} placeholder="00000-000" /></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:12}}>
                  <div><label style={labelStyle}>RUA *</label><input style={inputStyle(manualErrors.rua)} value={mf.rua} onChange={e=>setMf('rua',e.target.value)} placeholder="Rua..." /></div>
                  <div style={{width:90}}><label style={labelStyle}>NÚMERO *</label><input style={inputStyle(manualErrors.numero)} value={mf.numero} onChange={e=>setMf('numero',e.target.value)} placeholder="123" /></div>
                </div>
                <div><label style={labelStyle}>COMPLEMENTO</label><input style={inputStyle(false)} value={mf.complemento} onChange={e=>setMf('complemento',e.target.value)} placeholder="Apto, bloco..." /></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div><label style={labelStyle}>BAIRRO</label><input style={inputStyle(false)} value={mf.bairro} onChange={e=>setMf('bairro',e.target.value)} placeholder="Bairro" /></div>
                  <div><label style={labelStyle}>CIDADE *</label><input style={inputStyle(manualErrors.cidade)} value={mf.cidade} onChange={e=>setMf('cidade',e.target.value)} placeholder="São Paulo" /></div>
                </div>
                <div style={{width:100}}><label style={labelStyle}>ESTADO *</label><input style={inputStyle(manualErrors.estado)} value={mf.estado} onChange={e=>setMf('estado',e.target.value.toUpperCase())} placeholder="SP" maxLength={2} /></div>
              </div>
            </div>

            {/* Pagamento */}
            <div style={sectionStyle}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'var(--accent)',letterSpacing:'1px',marginBottom:14}}>FORMA DE PAGAMENTO</div>
              <div style={{display:'grid',gap:10}}>
                {[{v:'pix',l:'PIX',sub:'10% de desconto + frete grátis'},{v:'boleto',l:'Boleto / Transferência',sub:'Frete calculado após confirmação'},{v:'cartao',l:'Cartão (2x sem juros)',sub:'Parcelamento disponível'}].map(opt=>(
                  <div key={opt.v} onClick={()=>setMf('pagamento',opt.v)} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',border:`1px solid ${mf.pagamento===opt.v?'rgba(0,229,195,0.5)':'rgba(0,229,195,0.1)'}`,borderRadius:10,cursor:'pointer',background:mf.pagamento===opt.v?'rgba(0,229,195,0.06)':'transparent',transition:'all 0.15s'}}>
                    <div style={{width:16,height:16,borderRadius:'50%',border:`2px solid ${mf.pagamento===opt.v?'var(--accent)':'rgba(0,229,195,0.3)'}`,background:mf.pagamento===opt.v?'var(--accent)':'transparent',flexShrink:0}} />
                    <div>
                      <div style={{fontSize:'0.88rem',fontWeight:600,color:mf.pagamento===opt.v?'var(--accent)':'var(--text)'}}>{opt.l}</div>
                      <div style={{fontSize:'0.72rem',color:'var(--muted)'}}>{opt.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div style={sectionStyle}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'var(--accent)',letterSpacing:'1px',marginBottom:10}}>OBSERVAÇÕES</div>
              <textarea value={mf.observacoes} onChange={e=>setMf('observacoes',e.target.value)} placeholder="Informações adicionais (opcional)..." rows={3} style={{...inputStyle(false),resize:'vertical'}} />
            </div>

            {/* Resumo */}
            {manualItems.length > 0 && (
              <div style={{...sectionStyle,background:'rgba(0,229,195,0.04)'}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'var(--accent)',letterSpacing:'1px',marginBottom:12}}>RESUMO</div>
                {manualItems.map(item => {
                  const p = products.find(x=>x.id===item.peptideId);
                  if (!p) return null;
                  return <div key={item.peptideId} style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem',marginBottom:6}}>
                    <span style={{color:'var(--text)'}}>{p.name} ×{item.qty}</span>
                    <span style={{color:'var(--muted)',fontFamily:"'Space Mono',monospace"}}>R$ {(effectivePrice(p)*item.qty).toLocaleString('pt-BR')}</span>
                  </div>;
                })}
                <div style={{borderTop:'1px solid rgba(0,229,195,0.1)',marginTop:10,paddingTop:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.8rem',color:'var(--muted)',marginBottom:4}}>
                    <span>Subtotal</span><span style={{fontFamily:"'Space Mono',monospace"}}>R$ {subtotal.toLocaleString('pt-BR')}</span>
                  </div>
                  {isPix && pixDiscount > 0 && <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.8rem',color:'var(--accent)',marginBottom:4}}>
                    <span>Desconto PIX 10%</span><span style={{fontFamily:"'Space Mono',monospace"}}>− R$ {pixDiscount.toLocaleString('pt-BR')}</span>
                  </div>}
                  {!isPix && freight > 0 && <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.8rem',color:'var(--muted)',marginBottom:4}}>
                    <span>Frete</span><span style={{fontFamily:"'Space Mono',monospace"}}>R$ {freight.toLocaleString('pt-BR')}</span>
                  </div>}
                  {(isPix || freight === 0) && !isPix && <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.8rem',color:'var(--accent)',marginBottom:4}}>
                    <span>Frete</span><span style={{fontFamily:"'Space Mono',monospace"}}>Grátis</span>
                  </div>}
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'1rem',fontWeight:700,color:'var(--accent)',marginTop:6}}>
                    <span>Total</span><span style={{fontFamily:"'Space Mono',monospace"}}>R$ {total.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            )}

            <button onClick={submitManualOrder} disabled={manualSubmitting} style={{width:'100%',padding:'16px',background:manualSubmitting?'rgba(0,229,195,0.3)':'var(--accent)',border:'none',borderRadius:12,color:'#050a0e',fontWeight:700,fontSize:'1rem',fontFamily:"'Syne',sans-serif",cursor:manualSubmitting?'not-allowed':'pointer',letterSpacing:'0.5px'}}>
              {manualSubmitting ? 'Enviando...' : 'CONFIRMAR PEDIDO →'}
            </button>
            <div style={{textAlign:'center',color:'var(--muted)',fontSize:'0.72rem',marginTop:12}}>Após confirmar, o vendedor entrará em contato pelo WhatsApp para finalizar o pagamento.</div>
          </div>
        );
      })()}

      {!portalToken && !manualOrderView && <>


      {/* CHECKOUT MODAL */}
      {checkoutOpen && (() => {
        const freightRaw = calcFreight(checkout.estado, myTotal);
        const isPix = checkout.pagamento === 'pix';
        const freight = isPix ? { value: 0, label: 'Frete grátis', reason: 'Frete grátis no PIX' } : freightRaw;
        const couponDiscount = appliedCoupon ? (appliedCoupon.type === 'percent' ? Math.round(myTotal * appliedCoupon.value / 100) : Math.min(appliedCoupon.value, myTotal)) : 0;
        const pointsDiscount = Math.floor(appliedPoints / 100) * (pointsConfig.redeem || 5);
        const totalFinal = myTotal - couponDiscount - pointsDiscount + freight.value;
        const isFree = freight.value === 0;
        return (
          <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget){ setCheckoutOpen(false); setCheckoutStep(1); } }}>
            <div className="checkout-modal">
              <div className="modal-title">📦 Finalizar Pedido</div>

              {/* STEPPER */}
              {(() => {
                const steps = [
                  { label: 'Dados' },
                  { label: 'Endereço' },
                  { label: 'Pagamento' },
                  { label: 'Revisão' },
                ];
                return (
                  <div className="checkout-stepper">
                    {steps.map((s, i) => {
                      const n = i + 1;
                      const state = n < checkoutStep ? 'done' : n === checkoutStep ? 'active' : 'pending';
                      return (
                        <div key={n} className="checkout-step-item">
                          <div className="checkout-step-wrapper">
                            <div className={`checkout-step-bubble ${state}`}>
                              {state === 'done' ? '✓' : n}
                            </div>
                            <div className={`checkout-step-label ${state}`}>{s.label}</div>
                          </div>
                          {i < steps.length - 1 && <div className={`checkout-step-line ${n < checkoutStep ? 'done' : ''}`} />}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* PASSO 1 — Dados Pessoais */}
              {checkoutStep === 1 && (
                <div className="checkout-section">
                  <div className="checkout-section-title">👤 Dados Pessoais</div>
                  <div className="input-group">
                    <label>Nome completo *</label>
                    <input placeholder="Seu nome completo" value={checkout.nomeCompleto}
                      className={checkoutErrors.nomeCompleto ? 'error' : ''}
                      onChange={e=>updateCheckout('nomeCompleto', e.target.value)} />
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label>CPF *</label>
                      <input placeholder="000.000.000-00" value={checkout.cpf}
                        className={checkoutErrors.cpf ? 'error' : ''}
                        onChange={e=>{ updateCheckout('cpf', e.target.value); const clean=e.target.value.replace(/\D/g,''); if(clean.length===11){ checkPoints(e.target.value); if(!validarCPF(e.target.value)) setCheckoutErrors(prev=>({...prev,cpf:true})); else setCheckoutErrors(prev=>({...prev,cpf:false})); } else setPointsBalance(null); }} />
                      {checkoutErrors.cpf && (checkout.cpf||'').replace(/\D/g,'').length===11 && (
                        <span style={{color:'#e05555',fontSize:'0.7rem',marginTop:3,display:'block'}}>CPF inválido — verifique os números</span>
                      )}
                    </div>
                    <div className="input-group">
                      <label>Telefone *</label>
                      <input placeholder="(00) 00000-0000" value={checkout.telefone}
                        className={checkoutErrors.telefone ? 'error' : ''}
                        onChange={e=>updateCheckout('telefone', e.target.value)} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>E-mail <span style={{color:'var(--muted)',fontSize:'0.75rem'}}>(opcional)</span></label>
                    <input placeholder="seu@email.com" type="email" value={checkout.email}
                      className={checkoutErrors.email ? 'error' : ''}
                      onChange={e=>updateCheckout('email', e.target.value)} />
                  </div>
                  <div className="checkout-nav">
                    <button className="checkout-nav-back" onClick={()=>{ setCheckoutOpen(false); setCheckoutStep(1); }}>cancelar</button>
                    <button className="checkout-nav-next" onClick={()=>{
                      const errs = {};
                      if (!(checkout.nomeCompleto||'').trim()) errs.nomeCompleto = true;
                      if (!validarCPF(checkout.cpf||'')) errs.cpf = true;
                      if (!(checkout.telefone||'').trim()) errs.telefone = true;
                      if (checkout.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkout.email.trim())) errs.email = true;
                      setCheckoutErrors(errs);
                      if (Object.keys(errs).length === 0) setCheckoutStep(2);
                      else showToast("Preencha os campos obrigatórios", "error");
                    }}>Continuar →</button>
                  </div>
                </div>
              )}

              {/* PASSO 2 — Endereço */}
              {checkoutStep === 2 && (
                <div className="checkout-section">
                  <div className="checkout-section-title">📍 Endereço de Entrega</div>
                  <div className="input-row">
                    <div className="input-group">
                      <label>CEP *</label>
                      <input placeholder="00000-000" value={checkout.cep}
                        className={checkoutErrors.cep ? 'error' : ''}
                        onChange={e=>{ updateCheckout('cep', e.target.value); fetchCep(e.target.value); }} />
                    </div>
                    <div className="input-group">
                      <label>Estado</label>
                      <input placeholder="SP" value={checkout.estado}
                        className={checkoutErrors.estado ? 'error' : ''}
                        onChange={e=>updateCheckout('estado', e.target.value.toUpperCase())} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Cidade</label>
                    <input placeholder="São Paulo" value={checkout.cidade}
                      className={checkoutErrors.cidade ? 'error' : ''}
                      onChange={e=>updateCheckout('cidade', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Bairro</label>
                    <input placeholder="Centro" value={checkout.bairro}
                      onChange={e=>updateCheckout('bairro', e.target.value)} />
                  </div>
                  <div className="input-row">
                    <div className="input-group" style={{flex:2}}>
                      <label>Rua / Avenida *</label>
                      <input placeholder="Rua Exemplo" value={checkout.rua}
                        className={checkoutErrors.rua ? 'error' : ''}
                        onChange={e=>updateCheckout('rua', e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label>Número *</label>
                      <input placeholder="123" value={checkout.numero}
                        className={checkoutErrors.numero ? 'error' : ''}
                        onChange={e=>updateCheckout('numero', e.target.value)} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Complemento</label>
                    <input placeholder="Apto, bloco, referência..." value={checkout.complemento}
                      onChange={e=>updateCheckout('complemento', e.target.value)} />
                  </div>
                  <div className="checkout-nav">
                    <button className="checkout-nav-back" onClick={()=>setCheckoutStep(1)}>← Voltar</button>
                    <button className="checkout-nav-next" onClick={()=>{
                      const errs = {};
                      if (!/^\d{8}$/.test((checkout.cep||'').replace(/\D/g,''))) errs.cep = true;
                      if (!(checkout.rua||'').trim()) errs.rua = true;
                      if (!(checkout.numero||'').trim()) errs.numero = true;
                      if (!(checkout.cidade||'').trim()) errs.cidade = true;
                      if (!(checkout.estado||'').trim()) errs.estado = true;
                      setCheckoutErrors(errs);
                      if (Object.keys(errs).length === 0) setCheckoutStep(3);
                      else showToast("Preencha os campos obrigatórios", "error");
                    }}>Continuar →</button>
                  </div>
                </div>
              )}

              {/* PASSO 3 — Pagamento + Descontos */}
              {checkoutStep === 3 && (
                <div>
                  <div className="checkout-section">
                    <div className="checkout-section-title">💳 Forma de Pagamento</div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                      <div onClick={()=>updateCheckout('pagamento','pix')} className="pix-card" style={{
                        border: `2px solid ${checkoutErrors.pagamento ? 'rgba(255,107,53,0.5)' : 'rgba(0,229,195,0.45)'}`,
                        borderRadius:12, padding:'14px 10px', cursor:'pointer', textAlign:'center',
                        background: checkout.pagamento==='pix' ? 'rgba(0,229,195,0.12)' : 'rgba(0,229,195,0.04)',
                        transition:'background 0.18s', position:'relative', overflow:'hidden'
                      }}>
                        <div style={{position:'absolute',top:6,left:8,background:'linear-gradient(135deg,#ff3b3b,#ff6a00)',color:'#fff',fontSize:'0.5rem',fontWeight:700,fontFamily:"'Space Mono',monospace",padding:'2px 7px',borderRadius:20,letterSpacing:'0.5px',boxShadow:'0 2px 8px rgba(255,60,0,0.45)'}}>★ RECOMENDADO</div>
                        <div style={{position:'absolute',top:6,right:8,background:'var(--accent)',color:'#000',fontSize:'0.55rem',fontWeight:700,fontFamily:"'Space Mono',monospace",padding:'2px 6px',borderRadius:20}}>FRETE GRÁTIS</div>
                        <div style={{fontSize:'1.5rem', marginBottom:4, marginTop:10}}>⚡</div>
                        <div style={{fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.9rem', color:'var(--accent)'}}>PIX</div>
                        <div style={{fontSize:'0.65rem', color:'var(--accent)', marginTop:2, fontWeight:700}}>À vista</div>
                        <div style={{fontSize:'0.62rem',color:'var(--accent)',marginTop:6,fontFamily:"'Space Mono',monospace",opacity:0.85}}>
                          🚚 frete grátis no PIX
                        </div>
                      </div>
                      {(() => {
                        const MP_RECEBER_HORA = 0.0498;
                        const MP_PARCELAMENTO = 0.0459;
                        const totalComJuros = Math.round(myTotal * (1 + MP_RECEBER_HORA) * (1 + MP_PARCELAMENTO));
                        const juros = totalComJuros - myTotal;
                        const parcela = Math.round(totalComJuros / 2);
                        return (
                          <div onClick={()=>updateCheckout('pagamento','2x')} style={{
                            border: `1px solid ${checkout.pagamento==='2x' ? 'rgba(0,229,195,0.4)' : (checkoutErrors.pagamento ? 'rgba(255,107,53,0.5)' : 'var(--border)')}`,
                            borderRadius:12, padding:'14px 10px', cursor:'pointer', textAlign:'center',
                            background: checkout.pagamento==='2x' ? 'rgba(0,229,195,0.07)' : 'rgba(255,255,255,0.02)',
                            transition:'all 0.18s'
                          }}>
                            <div style={{fontSize:'1.5rem', marginBottom:4}}>💳</div>
                            <div style={{fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.9rem', color: checkout.pagamento==='2x' ? 'var(--accent)' : 'var(--text)'}}>2x Cartão</div>
                            <div style={{fontSize:'0.72rem', fontWeight:700, color:'var(--text)', marginTop:4, fontFamily:"'Space Mono',monospace"}}>2x R$ {parcela.toLocaleString('pt-BR')}</div>
                            <div style={{fontSize:'0.58rem', color:'#ff7a7a', marginTop:3}}>+R$ {juros.toLocaleString('pt-BR')} de juros MP</div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  {checkout.pagamento === '2x' && (() => {
                    const freightSaving = freightRaw.value > 0 ? freightRaw.value : 60;
                    return (
                      <div style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',background:'rgba(255,165,0,0.07)',border:'1px solid rgba(255,165,0,0.35)',borderRadius:12,marginBottom:4,animation:'slideIn 0.2s ease'}}>
                        <div style={{fontSize:'1.6rem',flexShrink:0}}>🚚</div>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'0.88rem',color:'#ffcc00',marginBottom:2}}>Vai perder o frete grátis?</div>
                          <div style={{fontSize:'0.75rem',color:'var(--muted)',lineHeight:1.4}}>No PIX o frete é grátis — você economiza <strong style={{color:'#ffaa00'}}>R$ {freightSaving.toLocaleString('pt-BR')}</strong> agora.</div>
                        </div>
                        <button onClick={()=>updateCheckout('pagamento','pix')} style={{flexShrink:0,padding:'8px 14px',background:'linear-gradient(135deg,#ffaa00,#ff8800)',border:'none',borderRadius:9,color:'#000',fontFamily:"'Space Mono',monospace",fontSize:'0.62rem',fontWeight:700,cursor:'pointer',letterSpacing:'0.5px',whiteSpace:'nowrap'}}>USAR PIX</button>
                      </div>
                    );
                  })()}
                  <div className="checkout-section">
                    <div className="checkout-section-title">🏷️ Cupom de Desconto</div>
                    {appliedCoupon
                      ? <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'rgba(255,150,0,0.07)',border:'1px solid rgba(255,150,0,0.3)',borderRadius:8}}>
                          <span style={{color:'#ff9600',fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:'0.85rem'}}>{appliedCoupon.code} <span style={{color:'var(--muted)',fontWeight:400,fontSize:'0.72rem'}}>{appliedCoupon.type==='percent'?`-${appliedCoupon.value}%`:`-R$ ${appliedCoupon.value}`}</span></span>
                          <button onClick={()=>{setAppliedCoupon(null);setCouponInput('');}} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.85rem'}}>✕</button>
                        </div>
                      : <div className="coupon-row">
                          <input className="coupon-input" placeholder="Código do cupom" value={couponInput} onChange={e=>setCouponInput(e.target.value.toUpperCase())} onKeyDown={e=>e.key==='Enter'&&applyCouponCode()} />
                          <button onClick={applyCouponCode} style={{padding:'9px 16px',background:'rgba(255,150,0,0.1)',border:'1px solid rgba(255,150,0,0.3)',borderRadius:8,color:'#ff9600',fontWeight:700,fontSize:'0.75rem',cursor:'pointer',whiteSpace:'nowrap',fontFamily:"'Space Mono',monospace"}}>APLICAR</button>
                        </div>
                    }
                  </div>
                  <div className="checkout-section">
                    <div className="checkout-section-title">⭐ Vanguard Points</div>
                    {pointsBalance === null
                      ? <div style={{fontSize:'0.75rem',color:'var(--muted)'}}>CPF informado no passo 1 será usado para verificar seu saldo.</div>
                      : (pointsBalance.points ?? 0) >= 100
                        ? appliedPoints > 0
                          ? <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'rgba(255,200,0,0.07)',border:'1px solid rgba(255,200,0,0.3)',borderRadius:8}}>
                              <span style={{color:'#ffc800',fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:'0.85rem'}}>⭐ {appliedPoints} pts <span style={{fontWeight:400,color:'var(--muted)',fontSize:'0.72rem'}}>→ -R$ {(Math.floor(appliedPoints/100)*(pointsConfig.redeem||5)).toLocaleString('pt-BR')}</span></span>
                              <button onClick={()=>setAppliedPoints(0)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.85rem'}}>✕</button>
                            </div>
                          : <div>
                              <div style={{fontSize:'0.78rem',color:'var(--muted)',marginBottom:8}}>Você tem <strong style={{color:'#ffc800'}}>{pointsBalance.points ?? 0} pontos</strong> → vale até <strong style={{color:'#ffc800'}}>R$ {Math.floor((pointsBalance.points??0)/100)*(pointsConfig.redeem||5)}</strong> de desconto</div>
                              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                                {[100,200,500].filter(p=>p<=pointsBalance.points).map(p=>(
                                  <button key={p} onClick={()=>setAppliedPoints(p)} style={{padding:'6px 12px',background:'rgba(255,200,0,0.1)',border:'1px solid rgba(255,200,0,0.3)',borderRadius:8,color:'#ffc800',fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>{p} pts → -R$ {Math.floor(p/100)*(pointsConfig.redeem||5)}</button>
                                ))}
                                {pointsBalance.points >= 100 && <button onClick={()=>setAppliedPoints(pointsBalance.points - (pointsBalance.points % 100))} style={{padding:'6px 12px',background:'rgba(255,200,0,0.1)',border:'1px solid rgba(255,200,0,0.3)',borderRadius:8,color:'#ffc800',fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>Usar tudo ({pointsBalance.points-(pointsBalance.points%100)} pts)</button>}
                              </div>
                            </div>
                        : <div style={{fontSize:'0.75rem',color:'var(--muted)'}}>{(pointsBalance.points??0) > 0 ? `Você tem ${pointsBalance.points??0} pts — mínimo 100 pts para resgatar.` : 'Nenhum ponto acumulado neste CPF ainda.'}</div>
                    }
                  </div>
                  <div className="checkout-nav">
                    <button className="checkout-nav-back" onClick={()=>setCheckoutStep(2)}>← Voltar</button>
                    <button className="checkout-nav-next" onClick={()=>{
                      if (!checkout.pagamento) { setCheckoutErrors({pagamento:true}); showToast("Escolha uma forma de pagamento", "error"); return; }
                      setCheckoutErrors({});
                      setCheckoutStep(4);
                    }}>Revisar pedido →</button>
                  </div>
                </div>
              )}

              {/* PASSO 4 — Revisão + Enviar */}
              {checkoutStep === 4 && (
                <div>
                  <div className="checkout-section">
                    <div className="checkout-section-title">💰 Resumo do Pedido</div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.83rem',color:'var(--muted)',marginBottom:8}}>
                      <span>Subtotal ({myOrders.reduce((s,o)=>s+(o.qty||0),0)} itens)</span>
                      <span style={{color:'var(--text)',fontFamily:"'Space Mono',monospace"}}>R$ {myTotal.toLocaleString('pt-BR')}</span>
                    </div>
                    {isPix && (
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.83rem',marginBottom:8,padding:'8px 12px',background:'rgba(0,229,195,0.06)',border:'1px solid rgba(0,229,195,0.2)',borderRadius:8}}>
                        <span style={{color:'var(--accent)'}}>💚 Frete grátis no PIX</span>
                        <span style={{color:'var(--accent)',fontFamily:"'Space Mono',monospace",fontWeight:700}}>GRÁTIS</span>
                      </div>
                    )}
                    {couponDiscount > 0 && (
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.83rem',marginBottom:8,padding:'8px 12px',background:'rgba(255,150,0,0.06)',border:'1px solid rgba(255,150,0,0.2)',borderRadius:8}}>
                        <span style={{color:'#ff9600'}}>🏷️ Cupom {appliedCoupon.code}</span>
                        <span style={{color:'#ff9600',fontFamily:"'Space Mono',monospace",fontWeight:700}}>-R$ {couponDiscount.toLocaleString('pt-BR')}</span>
                      </div>
                    )}
                    {pointsDiscount > 0 && (
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.83rem',marginBottom:8,padding:'8px 12px',background:'rgba(255,200,0,0.06)',border:'1px solid rgba(255,200,0,0.2)',borderRadius:8}}>
                        <span style={{color:'#ffc800'}}>⭐ Pontos VG ({appliedPoints} pts)</span>
                        <span style={{color:'#ffc800',fontFamily:"'Space Mono',monospace",fontWeight:700}}>-R$ {pointsDiscount.toLocaleString('pt-BR')}</span>
                      </div>
                    )}
                    <div className={`freight-box ${isFree?'free':'paid'}`}>
                      <div className="freight-label">
                        <strong>{isFree ? '🎉 Frete Grátis' : '🚚 Frete'}</strong>
                        <small>{freight.reason}</small>
                      </div>
                      <div className={`freight-value ${isFree?'free':'paid'}`}>{isFree ? 'GRÁTIS' : 'R$ 60'}</div>
                    </div>
                    {!isFree && myTotal < 600 && (
                      <div style={{fontSize:'0.75rem',color:'var(--muted)',marginTop:6,padding:'8px 12px',background:'rgba(0,168,255,0.04)',border:'1px solid rgba(0,168,255,0.12)',borderRadius:8}}>
                        💡 Faltam <strong style={{color:'var(--accent2)'}}>R$ {(600 - myTotal).toLocaleString('pt-BR')}</strong> para frete grátis em SP, ou <strong style={{color:'var(--accent)'}}>R$ {(1000 - myTotal).toLocaleString('pt-BR')}</strong> para frete grátis em qualquer estado.
                      </div>
                    )}
                    <div className="order-total-row">
                      <span className="order-total-label">Total final</span>
                      <span className="order-total-value">R$ {totalFinal.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="checkout-section">
                    <div className="checkout-section-title">📝 Observações</div>
                    <div className="input-group">
                      <label>Alguma instrução especial? (opcional)</label>
                      <input placeholder="Ex: pode entregar após 18h, portão azul..." value={checkout.observacoes||''}
                        onChange={e=>updateCheckout('observacoes', e.target.value)} />
                    </div>
                  </div>
                  <div style={{
                    background: disclaimer ? 'rgba(0,229,195,0.04)' : 'rgba(255,107,53,0.04)',
                    border: `1px solid ${disclaimer ? 'rgba(0,229,195,0.2)' : 'rgba(255,107,53,0.2)'}`,
                    borderRadius:10, padding:'14px 16px', marginBottom:16, cursor:'pointer',
                    display:'flex', gap:12, alignItems:'flex-start', transition:'all 0.2s'
                  }} onClick={()=>setDisclaimer(d=>!d)}>
                    <div style={{
                      width:20, height:20, borderRadius:5, flexShrink:0, marginTop:1,
                      border: `2px solid ${disclaimer ? 'var(--accent)' : 'rgba(255,107,53,0.5)'}`,
                      background: disclaimer ? 'var(--accent)' : 'transparent',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'0.75rem', color:'#050a0e', fontWeight:700, transition:'all 0.2s'
                    }}>{disclaimer ? '✓' : ''}</div>
                    <div style={{fontSize:'0.77rem', color:'var(--muted)', lineHeight:1.6}}>
                      <strong style={{color:'var(--text)'}}>Aviso Legal *</strong><br/>
                      Declaro que tenho 18 anos ou mais e que este produto é adquirido exclusivamente para fins de pesquisa científica. Não me responsabilizo pelo uso indevido dos compostos.
                    </div>
                  </div>
                  <button className="modal-confirm-btn" onClick={sendToWhatsApp} disabled={myOrders.length===0||isSubmitting} style={{opacity:isSubmitting?0.7:1}}>
                    {isSubmitting ? 'SALVANDO PEDIDO...' : 'ENVIAR PEDIDO VIA WHATSAPP →'}
                  </button>
                  <button className="checkout-nav-back" style={{width:'100%',marginTop:8}} onClick={()=>setCheckoutStep(3)}>← Voltar</button>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* NAV */}
      <nav>
        <div className="logo" onClick={()=>setView("catalog")} style={{cursor:"pointer"}}>
          <div className="logo-dot"></div>
          VANGUARD
          <span className="logo-sub">PEPTIDES</span>
          <span onClick={()=>{
            const now = Date.now();
            const key = '__vtaps';
            const taps = (window[key] || []).filter(t => now - t < 2000);
            taps.push(now);
            window[key] = taps;
            if (taps.length >= 5) { window[key] = []; adminUnlocked ? setView('admin') : handleAdminUnlock(); }
          }} style={{fontSize:'0.5rem',fontFamily:"'Space Mono',monospace",color:'var(--muted)',letterSpacing:'0.05em',marginLeft:6,opacity:0.6,alignSelf:'flex-end',marginBottom:2,cursor:'default',userSelect:'none'}}>v2.a1e782c</span>
        </div>
        <div className="nav-right">
          <button className={`nav-btn ${view==="catalog"?"active":""}`} onClick={()=>setView("catalog")}>CATÁLOGO</button>
          <button className={`nav-btn ${view==="calc"?"active":""}`} onClick={()=>setView("calc")}>💊 CALC</button>
          <button className={`nav-btn ${view==="faq"?"active":""}`} onClick={()=>setView("faq")}>FAQ</button>
          <button className="nav-btn" onClick={()=>{ const cpf=(()=>{try{return JSON.parse(localStorage.getItem('vg-checkout')||'{}').cpf||'';}catch{return '';}})(); setTrackModal(true); if(cpf){setTrackQuery(cpf);searchOrders(cpf);}else{setTrackResults(null);setTrackQuery('');} }}>📦 PEDIDO</button>
          <button className={`cart-nav-btn ${view==="cart"?"active":""}`} onClick={()=>setView("cart")}>
            🛒 CARRINHO
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          {adminUnlocked && <button className="nav-btn" onClick={()=>setView("admin")} style={{opacity:0.7}}>
            ⚙️{orders.filter(o=>(o.status||'pendente')==='pendente').length > 0 && <span style={{marginLeft:5,background:'var(--accent)',color:'#050a0e',borderRadius:10,padding:'1px 6px',fontSize:'0.6rem',fontWeight:700}}>{orders.filter(o=>(o.status||'pendente')==='pendente').length}</span>}
          </button>}
        </div>
      </nav>

      {/* HERO BANNER — full width, fora do grid */}
      {view === 'catalog' && !portalToken && (
        <div className="hero-banner" style={{backgroundImage:`url(${BANNER_BG})`, backgroundSize:'cover', backgroundPosition:'center right'}}>
          <div className="hero-banner-grid" />
          <div className="hero-banner-overlay" />
          <div className="hero-banner-content">
            <div className="hero-eyebrow">Vanguard Labs · Research Grade</div>
            <h1 className="hero-title">
              Peptídeos de<br/>
              <span>alta pureza.</span><br/>
              Ciência real.
            </h1>
            <p className="hero-sub">
              Compostos sintetizados com 99% de pureza para fins de pesquisa científica avançada. Entrega rápida, água bacteriostática inclusa.
            </p>
            <div className="hero-badges">
              <div className="hero-badge"><span>✓</span> 99% Pureza</div>
              <div className="hero-badge"><span>✓</span> BAC Water inclusa</div>
              <div className="hero-badge"><span>✓</span> Entrega SP mesmo dia</div>
              <div className="hero-badge"><span>✓</span> Research Use Only</div>
            </div>
          </div>
        </div>
      )}

      <div className="app">
        {/* SIDEBAR */}
        <aside>
          <label className="name-input-label">Seu nome</label>
          <input className="name-input" value={myName} onChange={e=>saveName(e.target.value)} placeholder="Como quer ser identificado" />

          <div className="sidebar-section-title">Categorias</div>
          {CATEGORIES.map(c => {
            const count = c.id === "all" ? products.length : products.filter(p => p.category === c.id).length;
            return (
              <button key={c.id} className={`cat-btn ${activeCat===c.id?"active":""}`}
                onClick={()=>{ setActiveCat(c.id); setView("catalog"); }}>
                <div className="cat-btn-icon" style={{background: c.color}}>{c.icon}</div>
                <span className="cat-btn-name">{c.name}</span>
                <span className="cat-btn-count">{count}</span>
              </button>
            );
          })}

          {myName && myTotal > 0 && <>
            <div className="sidebar-divider"></div>
            <div className="cart-mini" onClick={()=>setView("cart")}>
              <div className="cart-mini-label">MEU CARRINHO</div>
              <div className="cart-mini-total">R$ {myTotal.toLocaleString("pt-BR")}</div>
              <div className="cart-mini-sub">{myOrders.length} produto{myOrders.length!==1?"s":""} · sem frete</div>
            </div>
          </>}

          <div style={{flex:1}}></div>

        </aside>

        {/* MAIN */}
        <main>
          {/* CATALOG */}
          <div className={`view ${view==="catalog"?"visible":""}`}>


  

            {/* NOTICE BOARD */}
            {notices.filter(n=>!dismissedNotices.includes(n.id)).length > 0 && (
              <div className="notice-board">
                {notices.filter(n=>!dismissedNotices.includes(n.id)).map(n=>(
                  <div key={n.id} className={`notice-item ${n.type}`}>
                    <div className="notice-icon">
                      {n.type==='warn' || n.type==='alert'
                        ? <span className="notice-icon-blink">{n.type==='alert'?'🚨':'⚠️'}</span>
                        : 'ℹ️'}
                    </div>
                    <div className="notice-text">{n.text}</div>
                    <button className="notice-dismiss" onClick={()=>dismissNotice(n.id)}>✕</button>
                  </div>
                ))}
              </div>
            )}

            

            <div className="page-tag">▸ CATÁLOGO</div>
            <div className="page-title">{activeCat === 'all' ? 'Peptídeos Premium' : CATEGORIES.find(c=>c.id===activeCat)?.name}</div>
            <div className="page-sub">
              {activeCat === 'all'
                ? 'Adicione produtos ao carrinho e finalize seu pedido.'
                : (() => { const n = products.filter(p=>p.category===activeCat).length; return `${n} produto${n!==1?'s':''} nesta categoria`; })()
              }
            </div>

            {/* BANNER FRETE */}
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',marginBottom:10,background:'rgba(0,229,195,0.04)',border:'1px solid rgba(0,229,195,0.15)',borderRadius:10,fontSize:'0.75rem',color:'var(--muted)'}}>
              <span style={{fontSize:'1rem'}}>🚚</span>
              <span><strong style={{color:'var(--text)'}}>Frete fixo R$&nbsp;60</strong> para todo o Brasil &nbsp;·&nbsp; <strong style={{color:'var(--text)'}}>Grátis</strong> para RMSP acima de R$&nbsp;300</span>
            </div>

            {/* BOTÃO CATÁLOGO COMPLETO NO WHATSAPP — somente admin */}
            {adminUnlocked && <button onClick={()=>{
              const lines = ['🧪 *CATÁLOGO COMPLETO — VANGUARD PEPTIDES*', ''];
              const cats = CATEGORIES.filter(c => c.id !== 'all');
              cats.forEach(cat => {
                const items = products.filter(p => p.category === cat.id);
                if (!items.length) return;
                lines.push(`${cat.icon} *${cat.name.toUpperCase()}*`);
                items.forEach(p => {
                  const price = effectivePrice(p);
                  const stockLabel = availableStock(p.id) > 0 ? '' : ' _(sob encomenda)_';
                  lines.push(`• ${p.name} — R$ ${price.toLocaleString('pt-BR')}${stockLabel}`);
                });
                lines.push('');
              });
              const semCat = products.filter(p => !cats.some(c => c.id === p.category));
              if (semCat.length) {
                lines.push('📦 *OUTROS*');
                semCat.forEach(p => {
                  const price = effectivePrice(p);
                  const stockLabel = availableStock(p.id) > 0 ? '' : ' _(sob encomenda)_';
                  lines.push(`• ${p.name} — R$ ${price.toLocaleString('pt-BR')}${stockLabel}`);
                });
                lines.push('');
              }
              lines.push('💧 Água bacteriostática inclusa');
              lines.push('🚚 Frete R$ 60 Brasil · grátis RMSP > R$ 300');
              lines.push('💳 PIX com 10% de desconto');
              lines.push('');
              lines.push('Olá! Gostaria de fazer um pedido 👋');
              const msg = encodeURIComponent(lines.join('\n'));
              window.open(`https://wa.me/447418333521?text=${msg}`, '_blank');
            }} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'12px 16px',marginBottom:18,background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.35)',borderRadius:10,color:'#25d366',fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.5px',cursor:'pointer',transition:'background 0.15s'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(37,211,102,0.14)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(37,211,102,0.08)'}>
              <span style={{fontSize:'1rem'}}>📋</span>
              <span>CATÁLOGO COMPLETO NO WHATSAPP</span>
            </button>}

            {/* SEARCH BAR */}
            <div className="search-bar-wrap">
              <span className="search-bar-icon">🔍</span>
              <input
                className="search-bar-input"
                placeholder="O que você procura? Ex: Semaglutide, BPC-157..."
                value={searchQuery}
                onChange={e=>{ setSearchQuery(e.target.value); setActiveCat('all'); }}
              />
              {searchQuery && <button className="search-bar-clear" onClick={()=>setSearchQuery('')}>✕</button>}
            </div>

            {/* FEATURED CAROUSEL - only on all tab with no search */}
            {activeCat==='all' && !searchQuery && (() => {
              const hotProducts = products.filter(p => p.hot || (productPromo[p.id]||0) > 0);
              if (!hotProducts.length) return null;
              const maxIdx = hotProducts.length - 1;
              return (
                <div className="featured-section">
                  <div className="featured-title">🔥 Em Destaque</div>
                  <div className="featured-sub">Os mais procurados da semana</div>
                  <div className="carousel-wrap">
                    <div className="carousel-track-outer"
                      onTouchStart={e=>setCarouselTouchX(e.touches[0].clientX)}
                      onTouchEnd={e=>{
                        if(carouselTouchX===null) return;
                        const dx = e.changedTouches[0].clientX - carouselTouchX;
                        if(dx < -40) setCarouselIdx(i=>Math.min(maxIdx,i+1));
                        else if(dx > 40) setCarouselIdx(i=>Math.max(0,i-1));
                        setCarouselTouchX(null);
                      }}>
                      <div className="carousel-track" style={{transform:`translateX(calc(-${carouselIdx * 274}px))`}}>
                        {hotProducts.map((p,i)=>{
                          const promo = productPromo[p.id]||0;
                          return (
                          <div key={p.id} className="carousel-card" onClick={()=>{ setSelectedProduct(p); setView('detail', p); }}>
                            {(PRODUCT_IMAGES[p.id] || p.image_url)
                              ? <img src={PRODUCT_IMAGES[p.id] || p.image_url} className="carousel-card-img" alt={p.name} />
                              : <div style={{height:160,background:'rgba(0,229,195,0.05)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.5rem'}}>⚗️</div>
                            }
                            {promo > 0
                              ? <div className="promo-badge" style={{position:'absolute',top:10,left:10,zIndex:3}}>🔥 -{promo}% PROMO</div>
                              : <div className="product-hot-badge" style={{top:10,left:10,right:'auto'}}>🔥 HOT</div>
                            }
                            <div className="carousel-card-body">
                              <div className="carousel-card-name">{p.name}</div>
                              <div style={{fontSize:'0.72rem',color:'var(--muted)',marginBottom:8}}>{(p.desc||'').substring(0,60)}{(p.desc||'').length>60?'...':''}</div>
                              {promo > 0
                                ? <div className="carousel-card-price price-promo" style={{marginBottom:2}}><span className="price-original">R$ {p.price.toLocaleString('pt-BR')}</span>R$ {effectivePrice(p).toLocaleString('pt-BR')}</div>
                                : <div className="carousel-card-price" style={{marginBottom:2}}>R$ {effectivePrice(p).toLocaleString('pt-BR')}</div>
                              }
                              <div style={{fontSize:'0.63rem',color:'#00e5c3',fontFamily:"'Space Mono',monospace",opacity:0.85}}>🚚 Frete grátis no PIX</div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                    {carouselIdx > 0 && <button className="carousel-btn prev" onClick={()=>setCarouselIdx(i=>Math.max(0,i-1))}>‹</button>}
                    {carouselIdx < maxIdx && <button className="carousel-btn next" onClick={()=>setCarouselIdx(i=>Math.min(maxIdx,i+1))}>›</button>}
                    <div className="carousel-dots">
                      {hotProducts.map((_,i)=>(
                        <div key={i} className={`carousel-dot ${i===carouselIdx?'active':''}`} onClick={()=>setCarouselIdx(i)} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* CATEGORY PILLS - below carousel, above products */}
            {!searchQuery && (
              <div className="cat-pills" style={{overflowX:'auto',paddingBottom:4}}>
                <button className={`cat-pill ${filterInStock?'active':''}`} onClick={()=>setFilterInStock(v=>!v)}
                  style={filterInStock ? {borderColor:'rgba(0,229,195,0.6)',background:'rgba(0,229,195,0.12)',color:'var(--accent)'} : {}}>
                  <span>✅</span> Em estoque <span className="cat-pill-count">{products.filter(p=>availableStock(p.id)>0).length}</span>
                </button>
                <button className={`cat-pill ${activeCat==='all'?'active':''}`} onClick={()=>setActiveCat('all')}>
                  <span>⚡</span> Todos <span className="cat-pill-count">{products.length}</span>
                </button>
                {CATEGORIES.filter(c=>c.id!=='all').map(cat=>{
                  const cnt = products.filter(p=>p.category===cat.id).length;
                  return (
                    <button key={cat.id} className={`cat-pill ${activeCat===cat.id?'active':''}`} onClick={()=>setActiveCat(cat.id)}>
                      <span>{cat.icon}</span> {cat.name} <span className="cat-pill-count">{cnt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {activeCat !== 'all' && !searchQuery && (
              <button className="detail-back" style={{marginBottom:20,display:'inline-flex'}} onClick={()=>setActiveCat('all')}>← Todos os produtos</button>
            )}

            <div className="products-grid">
              {(()=>{
                let filtered = activeCat === 'all' ? products : products.filter(p=>p.category===activeCat);
                if (searchQuery) filtered = products.filter(p=>(p.name||'').toLowerCase().includes(searchQuery.toLowerCase()) || (p.desc||'').toLowerCase().includes(searchQuery.toLowerCase()));
                if (filterInStock) filtered = filtered.filter(p=>availableStock(p.id)>0);
                return filtered.map(peptide => {
                const inCartQty = peptideCartQty(peptide.id);
                const cartOrder = myOrders.find(o => o.peptideId === peptide.id);
                return (
                  <div key={peptide.id} className={`product-card ${inCartQty>0?"in-cart":""} ${availableStock(peptide.id)===0?"esgotado":""}`} style={{position:'relative'}}>
                    {availableStock(peptide.id)===0 && <div className="esgotado-badge">ESGOTADO</div>}
                    {(productPromo[peptide.id]||0) > 0 && availableStock(peptide.id)>0 && <div className="promo-badge">🔥 -{productPromo[peptide.id]}% PROMO</div>}
                    {peptide.hot && availableStock(peptide.id)>0 && !(productPromo[peptide.id]>0) && <div className="product-hot-badge">🔥 HOT</div>}
                    {peptide.badge && !peptide.hot && availableStock(peptide.id)>0 && !(productPromo[peptide.id]>0) && <div className="product-label-badge">{peptide.badge}</div>}
                    {(PRODUCT_IMAGES[peptide.id] || peptide.image_url) && <img src={PRODUCT_IMAGES[peptide.id] || peptide.image_url} className="product-card-img" alt={peptide.name} style={{cursor:'pointer'}} onClick={()=>{ setSelectedProduct(peptide); setView('detail', peptide); }} />}
                    {peptide.sku && <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:"var(--muted)",marginBottom:6}}>{peptide.sku}</div>}
                    <div className="product-card-name" style={{cursor:"pointer"}} onClick={()=>{ setSelectedProduct(peptide); setView("detail", peptide); }}>{peptide.name} <span style={{fontSize:"0.6rem",color:"var(--accent)",fontFamily:"'Space Mono',monospace",opacity:0.7}}>ver mais ›</span></div>
                    {peptide.compounds && <div style={{fontSize:"0.65rem",color:"var(--accent)",opacity:0.75,marginBottom:"4px",marginTop:"-2px",letterSpacing:"0.02em"}}>{peptide.compounds}</div>}
                    <div className="product-card-desc">{peptide.desc}</div>
                    {(productPromo[peptide.id]||0) > 0
                      ? <div className="product-card-price price-promo" style={{marginBottom:4}}><span className="price-original">R$ {peptide.price.toLocaleString('pt-BR')}</span>R$ {effectivePrice(peptide).toLocaleString('pt-BR')} <span>/ampola</span></div>
                      : <div className="product-card-price" style={{marginBottom:4}}>R$ {peptide.price.toLocaleString("pt-BR")} <span>/ampola</span></div>
                    }
                    <div style={{fontSize:'0.68rem',color:'#00e5c3',fontFamily:"'Space Mono',monospace",marginBottom:10,opacity:0.85}}>
                      🚚 Frete grátis no PIX
                    </div>

                    {(() => { const avail = availableStock(peptide.id); return avail > 0 && avail <= 5 ? (
                      <div style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",color:'#ffaa1e',background:'rgba(255,170,30,0.08)',border:'1px solid rgba(255,170,30,0.25)',borderRadius:20,padding:'3px 10px',marginBottom:6}}>
                        ⚠️ Últimas {avail} unidade{avail===1?'':'s'}
                      </div>
                    ) : null; })()}

                    {inCartQty > 0 && cartOrder && (
                      <div className="in-cart-indicator">
                        <span className="in-cart-text">✓ NO CARRINHO</span>
                        <div className="in-cart-qty-controls">
                          <button className="qty-control-btn" onClick={()=>updateQtyInCart(cartOrder.id, -1)}>−</button>
                          <span className="qty-control-num">{inCartQty}</span>
                          <button className="qty-control-btn" onClick={()=>updateQtyInCart(cartOrder.id, +1)} disabled={(availableStock(peptide.id)+inCartQty)<=inCartQty} style={{opacity:(availableStock(peptide.id)+inCartQty)<=inCartQty?0.3:1}}>+</button>
                        </div>
                      </div>
                    )}

                    <button className="add-to-cart-btn" onClick={()=>openModal(peptide)} disabled={availableStock(peptide.id)===0}>
                      {availableStock(peptide.id)===0 ? "PRODUTO ESGOTADO" : inCartQty > 0 ? "+ ADICIONAR MAIS" : "ADICIONAR AO CARRINHO"}
                    </button>
                    {availableStock(peptide.id)===0 && (
                      notifyInputs[peptide.id]==='sent'
                        ? <div style={{textAlign:"center",fontSize:"0.75rem",color:"var(--accent)",marginTop:8,fontFamily:"'Space Mono',monospace"}}>✓ Avisaremos você!</div>
                        : notifyInputs[peptide.id]==='open'
                          ? <div className="notify-input-wrap">
                              <input className="notify-input" placeholder="Seu WhatsApp ou e-mail" id={`notify-${peptide.id}`} />
                              <button className="notify-send-btn" onClick={()=>{
                                const val = document.getElementById(`notify-${peptide.id}`).value.trim();
                                if (!val) return;
                                let list; try { list = JSON.parse(localStorage.getItem('vg-notify')||'[]'); } catch { list = []; }
                                list.push({ product: peptide.name, contact: val, date: new Date().toLocaleDateString('pt-BR') });
                                localStorage.setItem('vg-notify', JSON.stringify(list));
                                setNotifyInputs(n=>({...n,[peptide.id]:'sent'}));
                              }}>Enviar</button>
                            </div>
                          : preorderLocked
                            ? null
                            : <button className="preorder-btn" onClick={()=>{ setPreorderForm({name: myName||'', whatsapp:'', qty:1}); setPreorderModal({peptide}); }}>
                              🔔 RESERVAR QUANDO DISPONÍVEL
                            </button>
                    )}
                  </div>
                );
              });
            })()}
            </div>


          </div>



          {/* FAQ */}
          <div className={`view ${view==="faq"?"visible":""}`}>
            <div className="page-tag">▸ FAQ</div>
            <div className="page-title">Perguntas Frequentes</div>
            <div className="page-sub">Tudo o que você precisa saber sobre nossos produtos e pedidos.</div>

            {FAQ_SECTIONS.map((section, si) => (
              <div className="faq-section" key={si}>
                <div className="faq-section-title">{section.title}</div>
                {section.items.map((item, ii) => {
                  const key = `${si}-${ii}`;
                  return (
                    <div key={key} className={`faq-item ${openFaq===key?'open':''}`}>
                      <div className="faq-question" onClick={()=>setOpenFaq(openFaq===key?null:key)}>
                        <span>{item.q}</span>
                        <span className="faq-chevron">▼</span>
                      </div>
                      <div className="faq-answer">{item.a}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>


          {/* PRODUCT DETAIL */}
          <div className={`view ${view==="detail"?"visible":""}`}>
            <div className="view-detail-wrap">
            {selectedProduct && (()=>{
              const p = selectedProduct;
              const proto = PROTOCOLS[Object.keys(CALC_PEP_DB).find(k => CALC_PEP_DB[k].name.toLowerCase().includes(p.name.split(' ')[0].toLowerCase()))];
              const inCartQty = peptideCartQty(p.id);
              return (
                <>
                  <button className="detail-back" onClick={()=>setView("catalog")}>← Voltar ao catálogo</button>
                  <button onClick={()=>{
                    const url = window.location.origin + window.location.pathname + `#/produto/${p.id}`;
                    if (navigator.share) navigator.share({ title: p.name, url });
                    else { navigator.clipboard.writeText(url); showToast('Link copiado! 🔗'); }
                  }} style={{float:'right',background:'transparent',border:'1px solid var(--border)',color:'var(--muted)',fontFamily:"'Space Mono',monospace",fontSize:'0.62rem',padding:'6px 12px',borderRadius:8,cursor:'pointer',marginTop:2}}>
                    🔗 Compartilhar
                  </button>

                  <div className="detail-hero">
                    {/* LEFT — imagem */}
                    <div>
                      {(PRODUCT_IMAGES[p.id] || p.image_url)
                        ? <img src={PRODUCT_IMAGES[p.id] || p.image_url} className="detail-hero-img" alt={p.name} />
                        : <div className="detail-hero-img-placeholder">🧪</div>
                      }
                    </div>

                    {/* RIGHT — info */}
                    <div>
                      <div className="detail-header" style={{border:'none',paddingBottom:0,marginBottom:16}}>
                        <div>
                          {p.sku && <div className="detail-sku">{p.sku}</div>}
                          <div className="detail-title">{p.name}</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          {(productPromo[p.id]||0) > 0 ? (
                            <>
                              <div className="promo-badge" style={{marginBottom:6}}>🔥 -{productPromo[p.id]}% PROMO</div>
                              <div className="detail-price price-promo"><span className="price-original" style={{fontSize:'0.95rem'}}>R$ {p.price.toLocaleString('pt-BR')}</span>R$ {effectivePrice(p).toLocaleString('pt-BR')} <span>/ampola</span></div>
                            </>
                          ) : (
                            <div className="detail-price">R$ {p.price.toLocaleString('pt-BR')} <span>/ampola</span></div>
                          )}
                          <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.62rem",color:"var(--accent)",marginTop:4}}>✓ 99% Pureza · BAC Water inclusa</div>
                        </div>
                      </div>

                      <div className="detail-desc" style={{marginBottom:16}}>{p.desc}</div>

                      {p.category && (
                        <div className="detail-tags" style={{marginBottom:20}}>
                          <span className="detail-tag">{p.category}</span>
                          <span className="detail-tag">Research Use Only</span>
                          <span className="detail-tag">Liofilizado</span>
                        </div>
                      )}

                      <div className="detail-actions" ref={detailActionsRef}>
                        <button className="detail-add-btn" onClick={()=>{ openModal(p); }} disabled={availableStock(p.id)===0}>
                          {availableStock(p.id)===0 ? 'PRODUTO ESGOTADO' : inCartQty > 0 ? '+ ADICIONAR MAIS' : '🛒 ADICIONAR AO CARRINHO'}
                        </button>
                        <button className="detail-calc-btn" onClick={()=>{ setPrevView("detail"); setView("calc"); }}>
                          💊 Abrir Calculadora
                        </button>
                      </div>
                      {!preorderLocked && availableStock(p.id) === 0 && <button className="preorder-btn" style={{marginTop:8}} onClick={()=>{ setPreorderForm({name: myName||'', whatsapp:'', qty:1}); setPreorderModal({peptide: p}); }}>
                        🔔 RESERVAR QUANDO DISPONÍVEL
                      </button>}
                    </div>
                  </div>

                  {/* Sticky CTA — só renderiza quando botão principal saiu da tela */}
                  {showStickyDetailCta && <div className="detail-sticky-cta">
                    <div className="detail-sticky-cta-info">
                      <div className="detail-sticky-cta-name">{p.name}</div>
                      <div className="detail-sticky-cta-price">R$ {effectivePrice(p).toLocaleString('pt-BR')} <span style={{fontSize:'0.6rem',color:'var(--muted)',fontFamily:"'DM Sans',sans-serif"}}>/ampola</span></div>
                    </div>
                    <button className="detail-add-btn" onClick={()=>{ openModal(p); }} disabled={availableStock(p.id)===0}>
                      {availableStock(p.id)===0 ? 'ESGOTADO' : inCartQty > 0 ? '+ MAIS' : '🛒 COMPRAR'}
                    </button>
                  </div>}

                  {proto && (
                    <>
                      <div className="detail-section-title">Protocolo de Referência</div>
                      <div className="detail-info-grid">
                        <div className="detail-info-item">
                          <div className="detail-info-label">Dose Mínima</div>
                          <div className="detail-info-val teal">{proto.doseMin}</div>
                        </div>
                        <div className="detail-info-item">
                          <div className="detail-info-label">Dose Máxima</div>
                          <div className="detail-info-val teal">{proto.doseMax}</div>
                        </div>
                        <div className="detail-info-item">
                          <div className="detail-info-label">Frequência</div>
                          <div className="detail-info-val">{proto.freq}</div>
                        </div>
                        <div className="detail-info-item">
                          <div className="detail-info-label">Ciclo</div>
                          <div className="detail-info-val">{proto.ciclo}</div>
                        </div>
                      </div>
                      <div className="calc-prot-note" style={{marginTop:12}}>💡 {proto.nota}</div>
                      <div className="calc-disclaimer" style={{marginTop:10}}>⚠️ Informações de caráter exclusivamente educativo. Não constituem prescrição médica. Consulte sempre um profissional de saúde.</div>
                    </>
                  )}

                  {PRODUCT_GUIDES[p.id] && (
                    <div style={{marginTop:28}}>
                      <div className="detail-section-title">Guia de Uso</div>
                      {PRODUCT_GUIDES[p.id].map((sec, i) => {
                        const key = `${p.id}-${i}`;
                        return (
                          <div key={key} className={`guide-item ${openGuide===key?'open':''}`}>
                            <div className="guide-question" onClick={()=>setOpenGuide(openGuide===key?null:key)}>
                              <span>{sec.title}</span>
                              <span className="guide-chevron">▼</span>
                            </div>
                            <div className="guide-answer">{sec.body}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
            </div>{/* /view-detail-wrap */}
          </div>


          {/* ARTICLE PAGE */}
          <div className={`view ${view==="article"?"visible":""}`}>
            {selectedArticle && (()=>{
              const art = selectedArticle;
              const related = art.relatedProductId ? products.find(p=>p.id===art.relatedProductId || p.name.toLowerCase().includes((art.relatedProductId||'').replace(/[0-9]/g,'').toLowerCase())) : null;
              return (
                <>
                  <button className="detail-back" onClick={()=>setView("catalog")}>← Voltar ao catálogo</button>
                  <div className="article-hero-emoji">{art.emoji}</div>
                  <div className="article-meta">
                    <span className="article-meta-tag">{art.tag}</span>
                    <span className="article-meta-date">{art.date}</span>
                  </div>
                  <div className="article-page-title">{art.title}</div>
                  <div className="article-page-subtitle">{art.subtitle}</div>
                  <div className="article-body" style={{whiteSpace:'pre-wrap'}}>{art.body}</div>
                  {related && (
                    <div className="article-cta">
                      <div className="article-cta-title">🧪 PRODUTO RELACIONADO</div>
                      <div className="article-cta-text"><strong style={{color:"var(--text)"}}>{related.name}</strong> — {related.desc}</div>
                      <button className="article-cta-btn" onClick={()=>openModal(related)}>
                        🛒 ADICIONAR AO CARRINHO — R$ {related.price.toLocaleString("pt-BR")}
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* CART */}
          <div className={`view ${view==="cart"?"visible":""}`}>
            <div className="page-tag">▸ CARRINHO</div>
            <div className="page-title">{myName || "Carrinho"}</div>
            <div className="page-sub">Revise seus produtos antes de confirmar o pedido.</div>

            {!myName && (
              <div className="cart-empty">
                <div className="cart-empty-icon">👤</div>
                <div className="cart-empty-title">Quem é você?</div>
                <div className="cart-empty-sub">Precisamos do seu nome para identificar o pedido.</div>
                <button className="btn-primary" style={{marginTop:18,maxWidth:200,margin:'18px auto 0',display:'block'}}
                  onClick={()=>{ setNameModalInput(myName); setShowNameModal(true); }}>
                  Inserir meu nome
                </button>
              </div>
            )}

            {myName && myOrders.length === 0 && (
              <div className="cart-empty">
                <div className="cart-empty-icon">🛒</div>
                <div className="cart-empty-title">Carrinho vazio</div>
                <div className="cart-empty-sub">Vá ao catálogo e adicione seus peptídeos.</div>
              </div>
            )}

            {myName && myOrders.length > 0 && (() => {
              return (
                <div>
                  <div className="cart-items">
                    {myOrders.map(order => {
                      const p = products.find(x => x.id === order.peptideId);
                      if (!p) return null;
                      const cat = CATEGORIES.find(c => c.id === p.category);
                      return (
                        <div key={order.id} className="cart-item-card">
                          <div className="cart-item-emoji" style={{background: cat?.color || "rgba(0,229,195,0.15)"}}>{cat?.icon}</div>
                          <div className="cart-item-info">
                            <div className="cart-item-name">{p.name}</div>
                            <div className="cart-item-buyer">R$ {p.price}/ampola</div>
                          </div>
                          <div className="cart-item-qty-wrap">
                            <button className="qty-control-btn" onClick={()=>updateQtyInCart(order.id, -1)}>−</button>
                            <span className="qty-control-num" style={{fontSize:"0.9rem",minWidth:24}}>{order.qty}</span>
                            <button className="qty-control-btn" onClick={()=>updateQtyInCart(order.id, +1)} disabled={availableStock(order.peptideId)===0} style={{opacity:availableStock(order.peptideId)===0?0.3:1}}>+</button>
                          </div>
                          <div className="cart-item-price">{`R$ ${(p.price * (order.qty||0)).toLocaleString("pt-BR")}`}</div>
                          <button className="cart-item-remove" onClick={()=>removeFromCart(order.id)} title="Remover">✕</button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="cart-summary">
                    {myOrders.map(order => {
                      const p = products.find(x => x.id === order.peptideId);
                      if (!p) return null;
                      return (
                        <div key={order.id} className="cart-summary-row">
                          <span>{p.name} ×{order.qty || 0}</span>
                          <span>R$ {(p.price * (order.qty||0)).toLocaleString("pt-BR")}</span>
                        </div>
                      );
                    })}
                    <div className="cart-summary-total">
                      <div className="cart-summary-total-label">Total (s/ frete)</div>
                      <div className="cart-summary-total-value">R$ {myTotal.toLocaleString("pt-BR")}</div>
                    </div>
                  </div>

                  <div className="cart-note">
                    💧 <strong>Água bacteriostática inclusa gratuitamente</strong> em todos os pedidos. Frete calculado e informado após confirmação.
                  </div>

                  <button className="checkout-btn" onClick={()=>{ if (!checkout.nomeCompleto && myName) setCheckout(c=>({...c, nomeCompleto: myName})); setCheckoutOpen(true); }}>
                    FINALIZAR PEDIDO →
                  </button>
                </div>
              );
            })()}

            {/* MINHAS RESERVAS */}
            {myName && (() => {
              const myPreorders = preorders.filter(p =>
                ['pending','notified'].includes(p.status||'pending') &&
                (p.name||'').toLowerCase() === myName.toLowerCase()
              );
              if (myPreorders.length === 0) return null;
              return (
                <div style={{marginTop: 24}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.65rem",color:"#ffaa00",letterSpacing:"1.5px",marginBottom:12}}>🔔 MINHAS RESERVAS</div>
                  {myPreorders.map(po => (
                    <div key={po.id} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:'rgba(255,165,0,0.04)',border:'1px solid rgba(255,165,0,0.2)',borderRadius:10,marginBottom:8}}>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:'0.88rem'}}>{po.productName}</div>
                        <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.62rem",color:'var(--muted)',marginTop:2}}>
                          {po.status === 'notified' ? '🔔 Disponível — aguardando sua confirmação' : '⏳ Aguardando chegada do estoque'}
                        </div>
                        <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.58rem",color:'var(--muted)',marginTop:2}}>{po.date}</div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <button onClick={()=>{
                          const newQty = Math.max(1, (po.qty||1) - 1);
                          const updated = preorders.map(x => x.id===po.id ? {...x,qty:newQty} : x);
                          persistPreorders(updated);
                        }} style={{width:26,height:26,background:'rgba(255,165,0,0.12)',border:'1px solid rgba(255,165,0,0.3)',borderRadius:6,color:'#ffaa00',fontSize:'1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                        <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.8rem",color:"#ffaa00",fontWeight:700,minWidth:20,textAlign:'center'}}>{po.qty}</span>
                        <button onClick={()=>{
                          const newQty = (po.qty||1) + 1;
                          const updated = preorders.map(x => x.id===po.id ? {...x,qty:newQty} : x);
                          persistPreorders(updated);
                        }} style={{width:26,height:26,background:'rgba(255,165,0,0.12)',border:'1px solid rgba(255,165,0,0.3)',borderRadius:6,color:'#ffaa00',fontSize:'1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                      </div>
                      <button onClick={()=>{
                        if (window.confirm(`Cancelar reserva de ${po.productName}?`)) {
                          persistPreorders(preorders.map(x => x.id===po.id ? {...x,status:'cancelled'} : x));
                          showToast('Reserva cancelada','info');
                        }
                      }} style={{padding:'5px 10px',background:'rgba(255,80,80,0.1)',border:'1px solid rgba(255,80,80,0.3)',borderRadius:6,color:'#ff5050',fontSize:'0.68rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>
                        Cancelar
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* SIMULADOR DE FRETE */}
          <div className={`view ${view==="frete"?"visible":""}`}>
            <div style={{maxWidth:480,margin:'0 auto',padding:'32px 16px'}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:"var(--accent)",letterSpacing:"3px",marginBottom:8}}>VANGUARD PEPTIDES</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:"1.5rem",fontWeight:800,marginBottom:6}}>Simulador de Frete</div>
              <div style={{color:"var(--muted)",fontSize:"0.85rem",marginBottom:28}}>Consulte o prazo e o valor do envio para o seu CEP.</div>

              <div style={{display:'flex',gap:8,marginBottom:16}}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Digite seu CEP (ex: 01310-100)"
                  value={freteDestCep}
                  onChange={e => setFreteDestCep(e.target.value.replace(/[^\d-]/g,'').slice(0,9))}
                  onKeyDown={e => e.key==='Enter' && calcularFrete()}
                  style={{flex:1,padding:'12px 14px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,color:'var(--text)',fontSize:'0.9rem',fontFamily:"'DM Sans',sans-serif",outline:'none'}}
                />
                <button onClick={calcularFrete} disabled={freteLoading} style={{padding:'12px 20px',background:'var(--accent)',border:'none',borderRadius:10,color:'#000',fontWeight:700,cursor:'pointer',fontFamily:"'Space Mono',monospace",fontSize:'0.7rem',whiteSpace:'nowrap',opacity:freteLoading?0.6:1}}>
                  {freteLoading ? '...' : 'CALCULAR'}
                </button>
              </div>

              {freteError && <div style={{padding:'10px 14px',background:'rgba(255,80,80,0.1)',border:'1px solid rgba(255,80,80,0.3)',borderRadius:8,color:'#ff6b6b',fontSize:'0.82rem',marginBottom:16}}>{freteError}</div>}

              {freteResults && (()=>{
                const maxDays = Math.max(...freteResults.map(s => s.delivery_time||0));
                const worstCase = maxDays + 5;
                return (
                  <div style={{textAlign:'center',padding:'28px 20px',background:'rgba(0,229,195,0.04)',border:'1px solid rgba(0,229,195,0.15)',borderRadius:14}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.58rem",color:"var(--muted)",letterSpacing:"2px",marginBottom:12}}>ESTIMATIVA DE ENTREGA</div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:"3rem",fontWeight:800,color:"var(--accent)",lineHeight:1}}>até {worstCase}</div>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.75rem",color:"var(--muted)",marginTop:6,marginBottom:20}}>dias úteis após o envio</div>
                    <div style={{fontSize:"0.82rem",color:"var(--muted)",lineHeight:1.6}}>
                      Na maioria dos casos chega antes. Este é o prazo máximo considerando o pior cenário de entrega para a sua região.
                    </div>
                  </div>
                );
              })()}

              <div style={{marginTop:32,paddingTop:20,borderTop:'1px solid rgba(255,255,255,0.06)',textAlign:'center'}}>
                <button onClick={()=>setView('catalog')} style={{background:'none',border:'none',color:'var(--muted)',fontSize:'0.78rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>
                  ← Voltar ao catálogo
                </button>
              </div>
            </div>
          </div>

          {/* ADMIN */}
          <div className={`view ${view==="admin"?"visible":""}`}>
            {!adminUnlocked ? (
              <div style={{textAlign:'center',padding:'60px 20px'}}>
                <div style={{fontSize:'3rem',marginBottom:16}}>🔒</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.2rem',fontWeight:700,marginBottom:12}}>Acesso restrito</div>
                <div style={{color:'var(--muted)',fontSize:'0.85rem',marginBottom:24}}>Esta área é exclusiva para administradores.</div>
                <button onClick={handleAdminUnlock} style={{padding:'12px 32px',background:'var(--accent)',border:'none',borderRadius:10,color:'#000',fontWeight:700,cursor:'pointer',fontFamily:"'Space Mono',monospace",fontSize:'0.75rem',letterSpacing:'0.05em'}}>
                  🔑 ENTRAR COMO ADMIN
                </button>
              </div>
            ) : <>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:0}}>
              <div>
                <div className="page-tag">▸ ADMINISTRADOR</div>
                <div className="page-title">{novoAdmin ? (NVA_ITEMS.find(i => i.id === nvaActive) || {}).label : 'Painel Admin'}</div>
              </div>
              {/* 🔔 Bell icon */}
              <div style={{position:'relative',marginTop:novoAdmin?0:8,display:'flex',gap:8,alignItems:'center'}}>
                {novoAdmin && <button className="nva-exit" onClick={()=>{ setView('catalog'); window.scrollTo(0,0); }}>← Loja</button>}
                <button
                  onClick={() => { setNotifOpen(o => { if (!o) markAllRead(); return !o; }); }}
                  style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'8px 13px',cursor:'pointer',color:'var(--text)',fontSize:'1.1rem',position:'relative',lineHeight:1}}>
                  🔔
                  {unreadCount > 0 && (
                    <span style={{position:'absolute',top:-6,right:-6,background:'#e74c3c',color:'#fff',borderRadius:'50%',fontSize:'0.6rem',fontWeight:700,minWidth:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Space Mono',monospace",padding:'0 3px'}}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <>
                  <div onClick={()=>setNotifOpen(false)} style={{position:'fixed',inset:0,zIndex:1999}} />
                  <div style={{position:'absolute',right:0,top:'calc(100% + 8px)',width:320,background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,boxShadow:'0 8px 32px rgba(0,0,0,0.5)',zIndex:2000,maxHeight:440,display:'flex',flexDirection:'column'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 16px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
                      <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',letterSpacing:'1.5px',textTransform:'uppercase',color:'var(--muted)'}}>NOTIFICAÇÕES</span>
                      <button onClick={clearNotifs} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--muted)',fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",padding:0}}>Limpar tudo</button>
                    </div>
                    <div style={{overflowY:'auto',flex:1}}>
                      {notifs.length === 0 ? (
                        <div style={{padding:'28px 16px',textAlign:'center',color:'var(--muted)',fontSize:'0.8rem'}}>Nenhuma notificação</div>
                      ) : notifs.map(n => (
                        <div key={n.id} style={{padding:'11px 16px',borderBottom:'1px solid rgba(255,255,255,0.04)',background:n.read?'transparent':'rgba(0,229,195,0.04)',transition:'background 0.2s'}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:'0.8rem',fontWeight:600,marginBottom:2,lineHeight:1.3}}>{n.title}</div>
                              <div style={{fontSize:'0.72rem',color:'var(--muted)',lineHeight:1.4,wordBreak:'break-word'}}>{n.body}</div>
                            </div>
                            <div style={{fontSize:'0.6rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace",whiteSpace:'nowrap',flexShrink:0,marginTop:2}}>{timeAgo(n.ts)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  </>
                )}
              </div>
            </div>

            {novoAdmin && <NovaAdminSub active={nvaActive} onPick={nvaPick} badges={nvaBadges} />}
            {novoAdmin && <NovaAdminInnerTabs active={nvaActive} adminTab={adminTab} setAdminTab={setAdminTab} />}
            {novoAdmin && adminTab === 'pedidos' && (() => {
              const ao = sb ? orders.filter(o => o._supabase) : orders;
              const n = s => ao.filter(o => (o.status || 'pendente') === s).length;
              return (
                <div className="nvp-kpis">
                  <div><span>Aguardando pagamento</span><b className="nvp-c-warn">{n('pendente')}</b></div>
                  <div><span>Pagos para enviar</span><b className="nvp-c-ok">{n('pago')}</b></div>
                  <div><span>Em trânsito</span><b>{n('enviado')}</b></div>
                  <div><span>Receita bruta</span><b>R$ {totalRevenue.toLocaleString('pt-BR')}</b></div>
                </div>
              );
            })()}
            <label style={{display:'flex',alignItems:'center',gap:8,fontSize:'0.72rem',color:'var(--muted)',margin:'0 0 12px',cursor:'pointer'}}><input type="checkbox" checked={waAuto} onChange={e=>toggleWaAuto(e.target.checked)} /> Abrir WhatsApp ao mudar status (desligado: use o botão 💬 do pedido)</label>
            {!novoAdmin && <div className="admin-grid" style={{marginBottom:24}}>
              <div className="admin-stat"><div className="admin-stat-label">Compradores</div><div className="admin-stat-value">{totalBuyers}</div></div>
              <div className="admin-stat"><div className="admin-stat-label">Total unidades</div><div className="admin-stat-value">{totalUnits}</div></div>
              <div className="admin-stat"><div className="admin-stat-label">Receita bruta</div><div className="admin-stat-value">R$ {totalRevenue.toLocaleString("pt-BR")}</div></div>
              <div className="admin-stat"><div className="admin-stat-label">Produtos</div><div className="admin-stat-value">{products.length}</div></div>
            </div>}

            {/* TABS */}
            <div className="admin-tabs">
              <button className={`admin-tab ${adminTab==="pedidos"?"active":""}`} onClick={()=>setAdminTab("pedidos")}>📋 PEDIDOS</button>
              <button className={`admin-tab ${adminTab==="estoque"?"active":""}`} onClick={()=>setAdminTab("estoque")}>📦 ESTOQUE</button>
              <button className={`admin-tab ${adminTab==="produtos"?"active":""}`} onClick={()=>setAdminTab("produtos")}>⚗️ PRODUTOS</button>
              <button className={`admin-tab ${adminTab==="combos"?"active":""}`} onClick={()=>setAdminTab("combos")}>🎁 COMBOS</button>
              <button className={`admin-tab ${adminTab==="artigos"?"active":""}`} onClick={()=>setAdminTab("artigos")}>📝 ARTIGOS</button>
              <button className={`admin-tab ${adminTab==="preorders"?"active":""}`} onClick={()=>setAdminTab("preorders")}>📋 PRÉ-ORDERS</button>
              <button className={`admin-tab ${adminTab==="avisos"?"active":""}`} onClick={()=>setAdminTab("avisos")}>📢 AVISOS</button>
              <button className={`admin-tab ${adminTab==="financeiro"?"active":""}`} onClick={()=>setAdminTab("financeiro")}>💰 FINANCEIRO</button>
              <button className={`admin-tab ${adminTab==="importacao"?"active":""}`} onClick={()=>setAdminTab("importacao")}>📦 IMPORTAÇÃO</button>
  <button className={`admin-tab ${adminTab==="cupons"?"active":""}`} onClick={()=>setAdminTab("cupons")}>🏷️ CUPONS</button>
              <button className={`admin-tab ${adminTab==="clientes"?"active":""}`} onClick={()=>setAdminTab("clientes")}>👥 CLIENTES</button>
              <button className={`admin-tab ${adminTab==="mapa"?"active":""}`} onClick={()=>setAdminTab("mapa")}>🗺️ MAPA</button>
              <button className="admin-tab" onClick={openSenderPool}>📮 REMETENTES</button>
              <button className={`admin-tab ${adminTab==="config"?"active":""}`} onClick={()=>setAdminTab("config")}>⚙️ CONFIG</button>
            </div>

            {/* TAB: PEDIDOS */}
            {adminTab==="pedidos" && <>
              <div className="admin-actions">
                <button className="admin-action-btn" onClick={async ()=>{
                  if (!sb) return;
                  const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: false });
                  if (error) { showToast('Erro ao atualizar pedidos', 'error'); return; }
                  if (data) {
                    const converted = data.map(o => ({
                      id: o.id, peptideId: o.items && o.items[0] ? (o.items[0].peptideId||'') : '',
                      buyerName: o.buyer_name||'', qty: o.items ? o.items.reduce((s,i)=>s+(i.qty||0),0) : 1,
                      createdAt: o.created_at, status: o.status||'pendente',
                      _supabase: true, _items: o.items, _total: o.total, _subtotal: o.subtotal,
                      _freight: o.freight, _cpf: o.cpf, _phone: o.phone, _email: o.email,
                      _address: o.address, _payment: o.payment, _notes: o.notes, _code: o.code, _discounts: orderDiscounts(o),
                      me_order_id: o.me_order_id, tracking_code: o.tracking_code, label_url: o.label_url,
                    }));
                    const mergedRefresh = [...orders.filter(o=>!o._supabase), ...converted];
                    setOrders(mergedRefresh);
                    saveOrders(mergedRefresh);
                    showToast(`Pedidos atualizados ✓ — ${data.length} pedido${data.length!==1?'s':''} no Supabase`, 'success');
                    console.log('[Admin] Pedidos Supabase:', data.map(o=>({id:o.id,code:o.code,status:o.status,buyer:o.buyer_name,created:o.created_at})));
                  }
                }}>🔄 Atualizar</button>
                <button className="admin-action-btn" onClick={copyWhatsApp}>📋 Copiar lista WhatsApp</button>
                <button className={`admin-action-btn${groupByClient?' active':''}`} onClick={()=>setGroupByClient(g=>!g)} style={groupByClient?{borderColor:'rgba(0,229,195,0.5)',color:'var(--accent)',background:'rgba(0,229,195,0.08)'}:{}}>👥 Agrupar por cliente</button>
                <button className="admin-action-btn" onClick={()=>{
                  const disponíveis = products.filter(p => {
                    const av = availableStock(p.id);
                    return av === null || av > 0;
                  });
                  if (!disponíveis.length) { showToast('Nenhum produto em estoque', 'error'); return; }
                  const linhas = disponíveis.map(p => {
                    const av = availableStock(p.id);
                    const estoqueLabel = av === null ? '' : ` (${av} disp.)`;
                    return `✅ *${p.name}*${estoqueLabel}\n💲 R$ ${effectivePrice(p).toLocaleString('pt-BR')} /ampola\n🌐 vanguardpep.com/#/produto/${p.id}`;
                  }).join('\n\n');
                  const msg = `⭐ *VANGUARD PEPTIDES — EM ESTOQUE*\n\n${linhas}\n\n📱 Acesse o catálogo completo em *vanguardpep.com*\nDúvidas? É só chamar! 🙏`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                }}>📦 Catálogo WA</button>
                <button className="admin-action-btn" onClick={()=>{
                  const link = window.location.origin + window.location.pathname + '?pedido';
                  navigator.clipboard.writeText(link).then(()=>showToast('Link copiado ✓ — envie ao cliente pelo WhatsApp','success')).catch(()=>{ prompt('Copie o link:', link); });
                }}>📋 Link Pedido Manual</button>
                <button className="admin-action-btn" onClick={()=>{ setManualOrder(MANUAL_ORDER_EMPTY); setManualCustomerSearch(''); setManualAddItemId(''); setManualOrderModal(true); }} style={{borderColor:'rgba(0,229,195,0.5)',color:'var(--accent)',background:'rgba(0,229,195,0.08)'}}>＋ Pedido Manual</button>
                <button className="admin-action-btn danger" onClick={clearAllOrders}>🗑️ Limpar tudo</button>
              </div>
              {(() => {
                const adminOrders = sb ? orders.filter(o => o._supabase) : orders;
                const adminSearchLower = adminSearch.trim().toLowerCase();
                const filteredOrders = adminOrders
                  .filter(o => adminStatusFilter === 'all' || (o.status||'pendente') === adminStatusFilter)
                  .filter(o => {
                    if (!adminSearchLower) return true;
                    const name = (o.buyerName||'').toLowerCase();
                    const cpf = (o._cpf||'').replace(/\D/g,'');
                    const phone = (o._phone||'').replace(/\D/g,'');
                    const code = (o._code||'').toLowerCase();
                    const productNames = (o._items||[{peptideId:o.peptideId}]).map(i => {
                      const p2 = products.find(x=>x.id===i.peptideId);
                      return p2 ? p2.name.toLowerCase() : '';
                    }).join(' ');
                    const q = adminSearchLower.replace(/\D/g,'');
                    return name.includes(adminSearchLower) || code.includes(adminSearchLower) || productNames.includes(adminSearchLower) || (q && (cpf.includes(q) || phone.includes(q)));
                  });
                const statusCounts = {
                  pendente: adminOrders.filter(o=>(o.status||'pendente')==='pendente').length,
                  pago: adminOrders.filter(o=>o.status==='pago').length,
                  enviado: adminOrders.filter(o=>o.status==='enviado').length,
                  entregue: adminOrders.filter(o=>o.status==='entregue').length,
                  extraviado: adminOrders.filter(o=>o.status==='extraviado').length,
                };
                if (adminOrders.length === 0) return (
                  <div style={{textAlign:"center",color:"var(--muted)",padding:40,fontSize:"0.85rem"}}>Nenhum pedido ainda</div>
                );
                return (
                <div>
                  <div className="nvp-search" style={{position:'relative',marginBottom:12}}>
                    <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--muted)',fontSize:'0.85rem',pointerEvents:'none'}}>🔍</span>
                    <input
                      type="text"
                      value={adminSearch}
                      onChange={e=>{ setAdminSearch(e.target.value); setAdminPage(1); }}
                      placeholder="Buscar por nome, CPF, telefone, código VG ou produto..."
                      style={{width:'100%',boxSizing:'border-box',padding:'9px 36px 9px 34px',borderRadius:10,border:'1px solid var(--border)',background:'rgba(255,255,255,0.04)',color:'var(--text)',fontSize:'0.82rem',fontFamily:"'DM Sans',sans-serif",outline:'none'}}
                    />
                    {adminSearch && <button onClick={()=>{ setAdminSearch(''); setAdminPage(1); }} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.9rem',lineHeight:1}}>✕</button>}
                  </div>
                  <div className="nvp-filters" style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
                    {[
                      {id:'all',label:'Todos',count:adminOrders.length},
                      {id:'pendente',label:'🟡 Pendente',count:statusCounts.pendente},
                      {id:'pago',label:'✅ Pago',count:statusCounts.pago},
                      {id:'enviado',label:'📦 Enviado',count:statusCounts.enviado},
                      {id:'entregue',label:'🎉 Entregue',count:statusCounts.entregue},
                      {id:'extraviado',label:'⚠️ Extraviado',count:statusCounts.extraviado},
                    ].map(f=>(
                      <button key={f.id} onClick={()=>{ setAdminStatusFilter(f.id); setAdminPage(1); }}
                        style={{padding:'5px 12px',borderRadius:20,border:'1px solid',cursor:'pointer',fontSize:'0.72rem',fontFamily:"'Space Mono',monospace",
                          borderColor: adminStatusFilter===f.id ? 'var(--accent)' : 'var(--border)',
                          background: adminStatusFilter===f.id ? 'rgba(0,229,195,0.1)' : 'transparent',
                          color: adminStatusFilter===f.id ? 'var(--accent)' : 'var(--muted)'}}>
                        {f.label} <span style={{opacity:0.7}}>({f.count})</span>
                      </button>
                    ))}
                  </div>
                {(adminSearch || adminStatusFilter !== 'all') && (
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.65rem',color:'var(--muted)',marginBottom:8,paddingLeft:2}}>
                    {filteredOrders.length} resultado{filteredOrders.length!==1?'s':''} encontrado{filteredOrders.length!==1?'s':''}
                  </div>
                )}
                {(() => {
                  const ADMIN_PAGE_SIZE = 20;

                  // ── GROUPED VIEW ──────────────────────────────────────────
                  if (groupByClient) {
                    // Only group pendente + pago; others fall through as singles
                    const groupable = filteredOrders.filter(o => ['pendente','pago'].includes(o.status||'pendente'));
                    const nonGroupable = filteredOrders.filter(o => !['pendente','pago'].includes(o.status||'pendente'));
                    const grouped = {};
                    groupable.forEach(o => {
                      const key = (o.buyerName||'').trim().toLowerCase();
                      if (!grouped[key]) grouped[key] = [];
                      grouped[key].push(o);
                    });
                    // Sort: multi-order clients first
                    const groupEntries = Object.values(grouped).sort((a,b) => b.length - a.length);
                    if (filteredOrders.length === 0) return (
                      <div style={{textAlign:'center',color:'var(--muted)',padding:'32px 20px',fontSize:'0.82rem'}}>
                        {adminSearch ? `Nenhum pedido encontrado para "${adminSearch}"` : 'Nenhum pedido nesta categoria'}
                      </div>
                    );
                    return (
                      <div>
                        {groupEntries.map(group => {
                          const rep = group[0];
                          const firstName = (rep.buyerName||'Cliente').split(' ')[0];
                          const phone = (rep._phone||'').replace(/\D/g,'');
                          const ddd = phone.startsWith('55') ? phone.slice(2,4) : phone.slice(0,2);
                          const isMotoboy = ddd === '11';
                          const intl = phone.startsWith('55') ? phone : '55'+phone;
                          const groupTotal = group.reduce((s,o) => s + (parseFloat(o._total)||0), 0);
                          const allItems = group.flatMap(o => o._items && o._items.length > 0 ? o._items : [{peptideId:o.peptideId,qty:o.qty||1}]);
                          // Merge same peptide items
                          const mergedItems = [];
                          allItems.forEach(it => {
                            const ex = mergedItems.find(x=>x.peptideId===it.peptideId);
                            if (ex) ex.qty += (it.qty||1);
                            else mergedItems.push({...it, qty:it.qty||1});
                          });
                          const isMulti = group.length > 1;
                          const waMsg = `📦 *Olá, ${firstName}! Aqui está o resumo dos seus pedidos Vanguard Peptides.*\n\n🧬 *Itens:*\n${mergedItems.map(it=>{const p2=products.find(x=>x.id===it.peptideId);return `• ${p2?p2.name:(it.name||it.peptideId)} ×${it.qty}`;}).join('\n')}\n\n💰 *Total combinado: R$ ${groupTotal.toLocaleString('pt-BR')}*\n\n📋 *Pedidos:* ${group.map(o=>o._code||('#'+o.id)).join(', ')}\n\nVamos enviar tudo junto! Qualquer dúvida é só chamar 🙏\n\n_Vanguard Peptides_ 🧬`;
                          return (
                            <div key={rep.buyerName} style={{marginBottom:12,border:`1px solid ${isMulti?'rgba(0,229,195,0.3)':'rgba(0,229,195,0.1)'}`,borderRadius:12,overflow:'hidden',background:isMulti?'rgba(0,229,195,0.03)':'transparent'}}>
                              {/* Group header */}
                              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1px solid rgba(0,229,195,0.1)',background:isMulti?'rgba(0,229,195,0.06)':'rgba(255,255,255,0.02)',flexWrap:'wrap',gap:8}}>
                                <div style={{display:'flex',alignItems:'center',gap:10}}>
                                  {isMulti && <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',fontWeight:700,background:'rgba(0,229,195,0.15)',color:'var(--accent)',border:'1px solid rgba(0,229,195,0.4)',borderRadius:20,padding:'2px 10px'}}>{group.length} PEDIDOS</span>}
                                  <span style={{fontWeight:700,fontSize:'0.9rem',color:'var(--text)'}}>{rep.buyerName}</span>
                                  {ddd && <span style={{fontSize:'0.55rem',fontFamily:"'Space Mono',monospace",fontWeight:700,padding:'1px 6px',borderRadius:20,
                                    background: isMotoboy ? 'rgba(255,180,0,0.12)' : 'rgba(100,160,255,0.1)',
                                    border: isMotoboy ? '1px solid rgba(255,180,0,0.4)' : '1px solid rgba(100,160,255,0.3)',
                                    color: isMotoboy ? '#ffb800' : '#78aaff'
                                  }}>{isMotoboy ? '🛵 MOTOBOY' : '🚚 TRANSP.'}</span>}
                                </div>
                                <div style={{display:'flex',alignItems:'center',gap:8}}>
                                  <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.82rem',fontWeight:700,color:'var(--accent)'}}>R$ {groupTotal.toLocaleString('pt-BR')}</span>
                                  {phone && isMulti && <button onClick={()=>window.open(`https://wa.me/${intl}?text=${encodeURIComponent(waMsg)}`,'_blank')} style={{padding:'4px 12px',borderRadius:8,border:'1px solid rgba(37,211,102,0.4)',background:'rgba(37,211,102,0.1)',color:'#25d366',fontSize:'0.68rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>💬 WA agrupado</button>}
                                  {phone && <button onClick={()=>window.open(`https://wa.me/${intl}`,'_blank')} style={{padding:'4px 12px',borderRadius:8,border:'1px solid rgba(37,211,102,0.25)',background:'rgba(37,211,102,0.06)',color:'#25d366',fontSize:'0.68rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>💬 WA</button>}
                                </div>
                              </div>
                              {/* Merged items */}
                              <div style={{padding:'8px 16px',borderBottom:'1px solid rgba(0,229,195,0.07)',display:'flex',flexWrap:'wrap',gap:'6px 16px'}}>
                                {mergedItems.map((it,idx)=>{ const p2=products.find(x=>x.id===it.peptideId); return <span key={idx} style={{fontSize:'0.8rem',color:'var(--text)'}}>{p2?p2.name:(it.name||it.peptideId)} <span style={{color:'var(--accent)',fontFamily:"'Space Mono',monospace"}}>×{it.qty}</span></span>; })}
                              </div>
                              {/* Individual orders */}
                              {group.map(order => {
                                const items = order._items && order._items.length > 0 ? order._items : [{peptideId:order.peptideId,qty:order.qty||1}];
                                const orderTotal = order._total || 0;
                                return (
                                  <div key={order.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 16px',borderBottom:'1px solid rgba(0,229,195,0.05)',flexWrap:'wrap',gap:8}}>
                                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                                      {order._code && <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.62rem',fontWeight:700,color:'var(--accent)',background:'rgba(0,229,195,0.08)',border:'1px solid rgba(0,229,195,0.2)',borderRadius:6,padding:'2px 7px'}}>{order._code}</span>}
                                      <span className={`order-status ${order.status||'pendente'}`} onClick={()=>cycleStatus(order.id)} title="Clique para avançar status" style={{fontSize:'0.65rem',padding:'3px 8px'}}>
                                        {statusLabel(order.status)}
                                        {(order.status||'pendente')!=='extraviado' && <span className="status-cycle">▶</span>}
                                      </span>
                                      <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'var(--muted)'}}>R$ {parseFloat(orderTotal).toLocaleString('pt-BR')}</span>
                                    </div>
                                    <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                                      <button className="admin-remove-btn" style={{background:'rgba(0,229,195,0.08)',color:'var(--accent)',borderColor:'rgba(0,229,195,0.3)'}} onClick={()=>setOrderDetail(order)}>detalhes</button>
                                      {(order.status||'pendente')==='pendente' && <button className="admin-remove-btn" style={{background:'rgba(139,0,0,0.15)',color:'#e05555',borderColor:'rgba(139,0,0,0.3)',fontSize:'0.6rem'}} onClick={()=>{ setPixCode(''); setPixModal(order); }}>💳 PIX</button>}
                                      {(order.status||'pendente')==='pago' && !isMotoboyOrder(order) && <button className="admin-remove-btn" style={{background:'rgba(0,180,255,0.1)',color:'#5bc8ff',borderColor:'rgba(0,180,255,0.3)',fontSize:'0.6rem'}} onClick={()=>gerarEtiqueta(order)}>{order.label_url ? '🏷️ Reimpr.' : '🏷️ Etiqueta'}</button>}
                                      <button className="admin-remove-btn" onClick={()=>adminRemove(order.id)}>remover</button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                        {nonGroupable.map(order => {
                          const items = order._items && order._items.length > 0 ? order._items : [{peptideId:order.peptideId,qty:order.qty||1}];
                          const orderTotal = order._total || 0;
                          const totalQty = items.reduce((s,i)=>s+(i.qty||1),0);
                          return (
                            <div key={order.id} className="admin-table-row">
                              <div>
                                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3,flexWrap:'wrap'}}>
                                  {order._code && <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.62rem',fontWeight:700,color:'var(--accent)',background:'rgba(0,229,195,0.08)',border:'1px solid rgba(0,229,195,0.25)',borderRadius:6,padding:'2px 7px',letterSpacing:'0.5px'}}>{order._code}</span>}
                                </div>
                                {items.map((it,idx)=>{const p2=products.find(x=>x.id===it.peptideId);return <div key={idx} className="admin-row-name" style={{fontSize:'0.75rem'}}>{p2?p2.name:(it.name||it.peptideId)} ×{it.qty||1}</div>;})}
                                <div className="admin-row-buyer">{order.buyerName}</div>
                              </div>
                              <div><span className={`order-status ${order.status||'pendente'}`} onClick={()=>cycleStatus(order.id)} title="Clique para avançar status">{statusLabel(order.status)}{(order.status||'pendente')!=='extraviado' && <span className="status-cycle">▶</span>}</span></div>
                              <div className="admin-row-qty">×{totalQty}</div>
                              <div className="admin-row-total">R$ {parseFloat(orderTotal).toLocaleString('pt-BR')}</div>
                              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                                <button className="admin-remove-btn" style={{background:'rgba(0,229,195,0.08)',color:'var(--accent)',borderColor:'rgba(0,229,195,0.3)'}} onClick={()=>setOrderDetail(order)}>detalhes</button>
                                <button className="admin-remove-btn" onClick={()=>adminRemove(order.id)}>remover</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  // ── NORMAL PAGINATED VIEW ─────────────────────────────────
                  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ADMIN_PAGE_SIZE));
                  const safePage = Math.min(adminPage, totalPages);
                  const pagedOrders = filteredOrders.slice((safePage-1)*ADMIN_PAGE_SIZE, safePage*ADMIN_PAGE_SIZE);
                  return (<>
                {novoAdmin ? (() => {
                  // /novo: cards no celular, linhas + painel de detalhe no desktop largo
                  const sel = filteredOrders.find(o => o.id === nvaSelOrder) || pagedOrders[0] || null;
                  const pick = order => {
                    if (window.matchMedia && window.matchMedia('(min-width:1100px)').matches) setNvaSelOrder(order.id);
                    else setOrderDetail(order);
                  };
                  const pill = order => { const st = order.status || 'pendente'; return <span className={'nvp-pill nvp-st-' + st}>{NVA_ST[st] || st}</span>; };
                  return (
                    <div className="nvp-wrap">
                      <div className="nvp-list">
                        {pagedOrders.length === 0 && (
                          <div className="nvp-empty">{adminSearch ? `Nenhum pedido encontrado para "${adminSearch}"` : 'Nenhum pedido nesta categoria'}</div>
                        )}
                        {pagedOrders.map(order => {
                          const { main, sec } = nvaSteps(order);
                          const items = nvaItemsText(order);
                          const tot = parseFloat(order._total) || 0;
                          return (
                            <div key={order.id} className={'nvp-row' + (sel && sel.id === order.id ? ' on' : '')}>
                              <button className="nvp-head" onClick={() => pick(order)} aria-label={`Abrir pedido ${order._code || order.id} de ${order.buyerName || 'cliente'}`}>
                                <span className="nvp-who">
                                  <b>{order.buyerName || 'Cliente'}</b>
                                  <small><code>{order._code || '#' + order.id}</code> · {nvaWhen(order.createdAt)}</small>
                                  <small className="nvp-items">{items.join(' · ')}{isMotoboyOrder(order) && ' · 🏍️ Motoboy'}</small>
                                </span>
                                <span className="nvp-tot">{nvFmt(tot)}</span>
                                <span className="nvp-stc">{pill(order)}</span>
                              </button>
                              <div className="nvp-acts">
                                <button className={'nvp-next' + (main.primary ? ' primary' : '')} onClick={main.run}>{main.label}</button>
                                <div className="nvp-sec">
                                  {sec.map(s => <button key={s.label} onClick={s.run}>{s.label}</button>)}
                                  <button className="nvp-del" onClick={() => nvaRemove(order)}>Remover</button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div className="nvp-total"><span>Total geral</span><b>R$ {totalRevenue.toLocaleString('pt-BR')}</b></div>
                      </div>
                      {sel && (() => {
                        const { main, sec } = nvaSteps(sel);
                        const st = sel.status || 'pendente';
                        const stepIdx = ['pendente', 'pago', 'enviado', 'entregue'].indexOf(st);
                        const a = sel._address || {};
                        const line1 = [a.rua, a.numero, a.complemento].filter(Boolean).join(', ') + (a.bairro ? ' — ' + a.bairro : '');
                        const line2 = [a.cidade && (a.cidade + (a.estado ? '/' + a.estado : '')), a.cep].filter(Boolean).join(' · ');
                        return (
                          <aside className="nvp-panel" aria-label="Detalhes do pedido">
                            <div className="nvp-ph"><code>{sel._code || '#' + sel.id}</code>{pill(sel)}</div>
                            {stepIdx >= 0 && <div className="nvp-prog" aria-hidden="true">{[0, 1, 2, 3].map(i => <span key={i} className={i <= stepIdx ? 'on' : ''} />)}</div>}
                            <div className="nvp-sect">
                              <span className="nvp-lbl">Cliente</span>
                              <b>{sel.buyerName || 'Cliente'}</b>
                              {line1.trim() && <span>{line1}</span>}
                              {line2 && <span>{line2}</span>}
                              {(sel._email || sel._phone) && <span className="nvp-mut">{[sel._email, sel._phone].filter(Boolean).join(' · ')}</span>}
                            </div>
                            <div className="nvp-sect">
                              <span className="nvp-lbl">Itens</span>
                              {nvaItemsText(sel).map((t, i) => <span key={i}>{t}</span>)}
                              {parseFloat(sel._freight) > 0 && <span className="nvp-mut">Frete {nvFmt(sel._freight)}</span>}
                              {(() => { const d = sel._discounts || {}; const parts = [['Cupom', d.coupon], ['Combo', d.bundle], ['Pontos', d.points], ['Desconto manual', d.manual]].filter(([, v]) => v > 0);
                                return parts.length ? <span className="nvp-mut">{parts.map(([l, v]) => `${l} −${nvFmt(v)}`).join(' · ')}</span> : null; })()}
                              <div className="nvp-sum"><span>Total</span><b>{nvFmt(sel._total)}</b></div>
                              <span className="nvp-mut">{nvaWhen(sel.createdAt)}{sel._payment ? ' · ' + sel._payment : ''}{sel.tracking_code ? ' · rastreio ' + sel.tracking_code : ''}</span>
                            </div>
                            <div className="nvp-sect nvp-pacts">
                              <button className={'nvp-next' + (main.primary ? ' primary' : '')} onClick={main.run}>{main.label}</button>
                              {sec.map(s => <button key={s.label} className="nvp-next" onClick={s.run}>{s.label}</button>)}
                              <button className="nvp-link" onClick={() => setOrderDetail(sel)}>Abrir detalhe completo</button>
                              <button className="nvp-link nvp-del" onClick={() => nvaRemove(sel)}>Remover pedido</button>
                            </div>
                          </aside>
                        );
                      })()}
                    </div>
                  );
                })() : (
                <div className="admin-table">
                  <div className="admin-table-header">
                    <span>Produto</span>
                    <span>Status</span>
                    <span>Qtd</span>
                    <span>Total</span>
                    <span></span>
                  </div>
                  {pagedOrders.length === 0 && (
                    <div style={{textAlign:'center',color:'var(--muted)',padding:'32px 20px',fontSize:'0.82rem'}}>
                      {adminSearch ? `Nenhum pedido encontrado para "${adminSearch}"` : 'Nenhum pedido nesta categoria'}
                    </div>
                  )}
                  {pagedOrders.map(order => {
                    const items = order._items && order._items.length > 0 ? order._items : [{peptideId: order.peptideId, qty: order.qty || 1}];
                    const firstP = products.find(x => x.id === items[0].peptideId);
                    const firstPName = firstP ? firstP.name : (items[0].name || items[0].peptideId || '—');
                    const orderTotal = order._total || items.reduce((s,i) => { const p2 = products.find(x=>x.id===i.peptideId); return s + (p2 ? p2.price*(i.qty||1) : 0); }, 0);
                    const totalQty = items.reduce((s,i) => s + (i.qty||1), 0);
                    const phone = (order._phone || '').replace(/\D/g,'');
                    const ddd = phone.startsWith('55') ? phone.slice(2,4) : phone.slice(0,2);
                    const isMotoboy = ddd === '11';
                    return (
                      <div key={order.id} className="admin-table-row">
                        <div>
                          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3,flexWrap:'wrap'}}>
                            {order._code && <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.62rem',fontWeight:700,color:'var(--accent)',background:'rgba(0,229,195,0.08)',border:'1px solid rgba(0,229,195,0.25)',borderRadius:6,padding:'2px 7px',letterSpacing:'0.5px'}}>{order._code}</span>}
                            {order.id && <div className="order-id-badge" style={{margin:0}}>#{order.id}</div>}
                          </div>
                          {items.length > 1
                            ? items.map((it,idx) => { const p2 = products.find(x=>x.id===it.peptideId); return <div key={idx} className="admin-row-name" style={{fontSize:'0.75rem'}}>{p2?p2.name:(it.name||it.peptideId)} ×{it.qty||1}</div>; })
                            : <div className="admin-row-name">{firstPName}</div>
                          }
                          <div style={{display:'flex',alignItems:'center',gap:6,marginTop:2}}>
                            <div className="admin-row-buyer">{order.buyerName}</div>
                            {ddd && <span style={{fontSize:'0.55rem',fontFamily:"'Space Mono',monospace",fontWeight:700,padding:'1px 6px',borderRadius:20,
                              background: isMotoboy ? 'rgba(255,180,0,0.12)' : 'rgba(100,160,255,0.1)',
                              border: isMotoboy ? '1px solid rgba(255,180,0,0.4)' : '1px solid rgba(100,160,255,0.3)',
                              color: isMotoboy ? '#ffb800' : '#78aaff'
                            }}>{isMotoboy ? '🛵 MOTOBOY' : '🚚 TRANSP.'}</span>}
                          </div>
                        </div>
                        <div>
                          <div style={{color:"#a8bfc9",fontSize:"0.82rem",marginBottom:4}}>{order.buyerName}</div>
                          <span
                            className={`order-status ${order.status||'pendente'}`}
                            onClick={()=>cycleStatus(order.id)}
                            title="Clique para avançar status"
                          >
                            {statusLabel(order.status)}
                            {(order.status||'pendente')!=='extraviado' && <span className="status-cycle">▶</span>}
                          </span>
                        </div>
                        <div className="admin-row-qty">×{totalQty}</div>
                        <div className="admin-row-total">R$ {orderTotal.toLocaleString("pt-BR")}</div>
                        <div style={{display:'flex',flexDirection:'column',gap:4}}>
                          <button className="admin-remove-btn" style={{background:'rgba(0,229,195,0.08)',color:'var(--accent)',borderColor:'rgba(0,229,195,0.3)'}} onClick={()=>setOrderDetail(order)}>detalhes</button>
                          {(order.status||'pendente')==='pendente' && <button className="admin-remove-btn" style={{background:'rgba(139,0,0,0.15)',color:'#e05555',borderColor:'rgba(139,0,0,0.3)',fontSize:'0.6rem'}} onClick={()=>{ setPixCode(''); setPixModal(order); }}>💳 PIX</button>}
                          {(order.status||'pendente')==='pago' && !isMotoboyOrder(order) && <button className="admin-remove-btn" style={{background:'rgba(0,180,255,0.1)',color:'#5bc8ff',borderColor:'rgba(0,180,255,0.3)',fontSize:'0.6rem'}} onClick={()=>gerarEtiqueta(order)}>{order.label_url ? '🏷️ Reimpr.' : '🏷️ Etiqueta'}</button>}
                          {order.tracking_code && <button className="admin-remove-btn" style={{background:'rgba(255,180,0,0.1)',color:'#ffb800',borderColor:'rgba(255,180,0,0.3)',fontSize:'0.6rem'}} onClick={()=>{ const firstName=(order.buyerName||'Cliente').split(' ')[0]; const code=order._code||''; const msg=`📦 *Olá, ${firstName}!*\n\n🔍 *Código de rastreio do seu pedido${code?` ${code}`:''}:*\n${order.tracking_code}\n\n📲 Acompanhe aqui: https://melhorrastreio.com.br/rastreio/${order.tracking_code}\n\nQualquer dúvida é só chamar! 🙏\n\n_Vanguard Peptides_ 🧬`; const digits=(order._phone||'').replace(/\D/g,''); const intl=digits.startsWith('55')?digits:'55'+digits; window.open(`https://wa.me/${intl}?text=${encodeURIComponent(msg)}`,'_blank'); }}>📲 Rastreio</button>}
                          {order._phone && <button className="admin-remove-btn" style={{background:'rgba(37,211,102,0.1)',color:'#25d366',borderColor:'rgba(37,211,102,0.3)',fontSize:'0.6rem'}} onClick={()=>nvaWhats(order)}>💬 Mensagem</button>}
                          <button className="admin-remove-btn" onClick={()=>adminRemove(order.id)}>remover</button>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{padding:"14px 20px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:24,fontFamily:"'Space Mono',monospace",fontSize:"0.78rem"}}>
                    <span style={{color:"var(--muted)"}}>TOTAL GERAL</span>
                    <span style={{color:"var(--accent)",fontWeight:700}}>R$ {totalRevenue.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
                )}
                {totalPages > 1 && (
                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:14}}>
                    <button onClick={()=>setAdminPage(p=>Math.max(1,p-1))} disabled={safePage===1}
                      style={{padding:'6px 14px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:safePage===1?'var(--muted)':'var(--text)',cursor:safePage===1?'default':'pointer',fontSize:'0.78rem'}}>
                      ← Anterior
                    </button>
                    <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.68rem',color:'var(--muted)'}}>
                      {safePage} / {totalPages}
                    </span>
                    <button onClick={()=>setAdminPage(p=>Math.min(totalPages,p+1))} disabled={safePage===totalPages}
                      style={{padding:'6px 14px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:safePage===totalPages?'var(--muted)':'var(--text)',cursor:safePage===totalPages?'default':'pointer',fontSize:'0.78rem'}}>
                      Próximo →
                    </button>
                  </div>
                )}
                  </>);
                })()}
                </div>
                );
              })()}

              {/* LISTA DE AVISOS DE REPOSIÇÃO */}
              {(() => {
                let notifyList; try { notifyList = JSON.parse(localStorage.getItem('vg-notify')||'[]'); } catch { notifyList = []; }
                if (!notifyList.length) return null;
                function removeNotify(idx) {
                  const updated = notifyList.filter((_,i2)=>i2!==idx);
                  localStorage.setItem('vg-notify', JSON.stringify(updated));
                  showToast('Aviso removido','info');
                  setAdminTab('__tmp');
                  setTimeout(()=>setAdminTab('pedidos'),0);
                }
                return (
                  <div style={{marginTop:24}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:"#ffaa1e",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:12,paddingLeft:4}}>
                      🔔 Avisos de Reposição ({notifyList.length})
                    </div>
                    {notifyList.map((n,i) => (
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",background:"rgba(255,160,30,0.04)",border:"1px solid rgba(255,160,30,0.15)",borderRadius:8,marginBottom:6,fontSize:"0.82rem"}}>
                        <div>
                          <div style={{color:"var(--text)",fontWeight:600,marginBottom:2}}>{n.product}</div>
                          <div style={{color:"var(--muted)",fontFamily:"'Space Mono',monospace",fontSize:"0.68rem"}}>{n.contact}</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                          <div style={{color:"var(--muted)",fontFamily:"'Space Mono',monospace",fontSize:"0.6rem"}}>{n.date}</div>
                          <button className="admin-remove-btn" onClick={()=>removeNotify(i)}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </>}

            {/* TAB: ESTOQUE */}
            {adminTab==="estoque" && <>
              {/* ── DIAGNÓSTICO DE ESTOQUE ── */}
              {(() => {
                const rows = products.map(p => {
                  const rawStock = stock[p.id] ?? null;
                  const preorderRes = preorders
                    .filter(po => po.productId === p.id && ['pending','notified'].includes(po.status||'pending'))
                    .reduce((s,po)=>s+(po.qty||1),0);
                  const baseAvail = rawStock === null ? null : Math.max(0, rawStock - preorderRes);
                  const standaloneCap = purchaseOrders.filter(po=>po.productId===p.id&&po.status==='pending').reduce((s,po)=>s+(po.qty||0),0);
                  const importCap = p.sku ? importHistory.filter(h=>h.status&&h.status!=='entregue').reduce((sum,h)=>{ const it=(h.items||[]).find(i=>i.sku===p.sku); return sum+(it?parseInt(it.vials)||parseInt(it.boxes)*10||0:0); },0) : 0;
                  const poCapQty = standaloneCap + importCap;
                  const liveRes = poCapQty > 0 ? orders
                    .filter(o => {
                      if (!o._supabase) return o.peptideId === p.id;
                      return ['pendente','pago','enviado'].includes(o.status||'pendente');
                    })
                    .reduce((sum,o)=>{ if(!o._supabase) return sum+(o.qty||0); const items=o._items&&o._items.length>0?o._items:[{peptideId:o.peptideId,qty:o.qty||1}]; const match=items.find(it=>it.peptideId===p.id); return sum+(match?(match.qty||1):0); },0) + preorderRes : 0;
                  const capAvail = poCapQty > 0 ? Math.max(0, poCapQty - liveRes) : null;
                  const uncapped = poCapQty > 0 && baseAvail !== null ? Math.max(0, baseAvail - poCapQty) : null;
                  const finalAvail = availableStock(p.id);
                  const isProblematic = finalAvail === 0 && (rawStock === null || rawStock > 0);
                  return { p, rawStock, preorderRes, baseAvail, standaloneCap, importCap, poCapQty, liveRes, capAvail, uncapped, finalAvail, isProblematic };
                });
                const problems = rows.filter(r => r.isProblematic);
                return (
                  <div style={{marginBottom:20,border:`1px solid ${problems.length>0?'rgba(255,100,50,0.4)':'rgba(0,229,195,0.15)'}`,borderRadius:12,overflow:'hidden'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 16px',background:problems.length>0?'rgba(255,100,50,0.06)':'rgba(0,229,195,0.04)',borderBottom:'1px solid rgba(0,229,195,0.1)'}}>
                      <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.62rem',color:problems.length>0?'#ff6b35':'var(--accent)',letterSpacing:'1px'}}>
                        🔬 DIAGNÓSTICO{problems.length>0?` — ${problems.length} produto${problems.length>1?'s':''} com problema`:'  — tudo OK'}
                      </div>
                      <button onClick={async ()=>{
                        if(!sb){showToast('Supabase não conectado','error');return;}
                        const {data,error}=await sb.from('stock').select('product_id,quantity');
                        if(error){showToast('Erro ao buscar estoque: '+error.message,'error');return;}
                        const remote={};(data||[]).forEach(r=>{remote[r.product_id]=r.quantity;});
                        const merged={...DEFAULT_STOCK,...remote};
                        setStock(merged);localStorage.setItem('vg-stock',JSON.stringify(merged));
                        showToast('Estoque re-sincronizado do Supabase ✓','success');
                      }} style={{padding:'4px 12px',background:'rgba(0,229,195,0.1)',border:'1px solid rgba(0,229,195,0.3)',borderRadius:8,color:'var(--accent)',fontSize:'0.65rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>🔄 Re-sync Supabase</button>
                    </div>
                    <div style={{overflowX:'auto'}}>
                      <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.72rem',fontFamily:"'Space Mono',monospace"}}>
                        <thead>
                          <tr style={{borderBottom:'1px solid rgba(0,229,195,0.1)'}}>
                            {['Produto','Supabase','Pré-orders','Base','Cap','Vivas','Final','Status'].map(h=>(
                              <th key={h} style={{padding:'6px 10px',textAlign:'left',color:'var(--muted)',fontWeight:400,whiteSpace:'nowrap'}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map(({p,rawStock,preorderRes,baseAvail,poCapQty,liveRes,finalAvail,isProblematic})=>(
                            <tr key={p.id} style={{borderBottom:'1px solid rgba(0,229,195,0.05)',background:isProblematic?'rgba(255,100,50,0.04)':'transparent'}}>
                              <td style={{padding:'6px 10px',color:isProblematic?'#ff6b35':'var(--text)',fontWeight:isProblematic?700:400}}>{p.name.split(' ')[0]}</td>
                              <td style={{padding:'6px 10px',color:rawStock===0?'#ff5050':rawStock===null?'var(--muted)':'#4ade80'}}>{rawStock===null?'∞':rawStock}</td>
                              <td style={{padding:'6px 10px',color:preorderRes>0?'#ffaa00':'var(--muted)'}}>{preorderRes>0?`-${preorderRes}`:'0'}</td>
                              <td style={{padding:'6px 10px',color:baseAvail===0?'#ff5050':baseAvail===null?'var(--muted)':'var(--text)'}}>{baseAvail===null?'∞':baseAvail}</td>
                              <td style={{padding:'6px 10px',color:poCapQty>0?'#78aaff':'var(--muted)'}}>{poCapQty>0?poCapQty:'—'}</td>
                              <td style={{padding:'6px 10px',color:liveRes>0?'#ffaa00':'var(--muted)'}}>{poCapQty>0?liveRes:'—'}</td>
                              <td style={{padding:'6px 10px',fontWeight:700,color:finalAvail===0?'#ff5050':finalAvail<=3?'#ffaa00':'#4ade80'}}>{finalAvail===null?'∞':finalAvail}</td>
                              <td style={{padding:'6px 10px'}}>{isProblematic?<span style={{color:'#ff6b35'}}>⚠️ ESGOTADO</span>:finalAvail===0?<span style={{color:'#ff5050'}}>ESGOTADO</span>:<span style={{color:'#4ade80'}}>OK</span>}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {problems.length > 0 && (
                      <div style={{padding:'10px 16px',background:'rgba(255,100,50,0.04)',borderTop:'1px solid rgba(255,100,50,0.15)'}}>
                        {problems.map(({p,rawStock,preorderRes,poCapQty,liveRes})=>(
                          <div key={p.id} style={{fontSize:'0.72rem',color:'#ff9060',marginBottom:6}}>
                            <strong>{p.name}:</strong>{' '}
                            {rawStock===0?'Estoque Supabase = 0 — ajuste o número acima e salve.':''}
                            {rawStock>0&&preorderRes>=rawStock?`${preorderRes} pré-orders bloqueando ${rawStock} unidades — cancele pré-orders antigas na aba PRÉ-ORDERS.`:''}
                            {rawStock>0&&preorderRes<rawStock&&poCapQty>0&&liveRes>=poCapQty?`Cap de importação (${poCapQty}) totalmente consumido por ${liveRes} reservas.`:''}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="stock-table">
                {products.map(p => {
                  const qty = stock[p.id] ?? null;
                  const qtyClass = qty === null ? 'ok' : qty === 0 ? 'zero' : qty <= 3 ? 'low' : 'ok';
                  return (
                    <div key={p.id} className="stock-row">
                      <div>
                        <div className="stock-name">{p.name}</div>
                        <div className="stock-sku">{p.sku || p.id.toUpperCase()}</div>
                      </div>
                      <div className={`stock-qty ${qtyClass}`}>
                        {qty === null ? '∞' : qty}
                      </div>
                      <div className="stock-ctrl">
                        <button className="stock-btn" onClick={()=>{
                          const cur = stock[p.id] ?? 0;
                          persistStock({...stock, [p.id]: Math.max(0, cur-1)});
                        }}>−</button>
                        <input type="number" className="stock-input" min="0"
                          value={stock[p.id] ?? ''}
                          placeholder="∞"
                          onChange={e=>{
                            const v = e.target.value;
                            if (v === '') {
                              const ns = {...stock}; delete ns[p.id]; persistStock(ns);
                              if (sb) sb.from('stock').delete().eq('product_id', p.id).then(({ error }) => { if (error) console.warn('[Supabase] Delete stock error:', error.message); });
                              showToast(`Estoque de "${p.name}" removido (sem controle)`, 'info');
                            } else {
                              const n = parseInt(v); if(!isNaN(n) && n>=0) persistStock({...stock, [p.id]: n});
                            }
                          }}
                        />
                        <button className="stock-btn" onClick={()=>{
                          const cur = stock[p.id] ?? 0;
                          persistStock({...stock, [p.id]: cur+1});
                        }}>+</button>
                      </div>
                      <div style={{fontSize:"0.7rem",fontFamily:"'Space Mono',monospace",marginTop:4}}>
                        {(()=>{
                          const tot = stock[p.id];
                          const preorderRes = preorders.filter(po=>po.productId===p.id&&['pending','notified'].includes(po.status||'pending')).reduce((s,po)=>s+(po.qty||1),0);
                          const baseAvail = Math.max(0,(tot??0)-preorderRes);
                          // Cap total = standalone POs + import-based
                          const standaloneCap = purchaseOrders.filter(po=>po.productId===p.id&&po.status==='pending').reduce((s,po)=>s+(po.qty||0),0);
                          const importCap = p.sku ? importHistory.filter(h=>h.status&&h.status!=='entregue').reduce((s,h)=>{ const it=(h.items||[]).find(i=>i.sku===p.sku); return s+(it?parseInt(it.vials)||parseInt(it.boxes)*10||0:0); },0) : 0;
                          const totalCap = standaloneCap + importCap;
                          const liveRes = totalCap > 0 ? (
                            orders.filter(o=>o.peptideId===p.id&&(!o._supabase||['pendente','pago','enviado'].includes(o.status||'pendente'))).reduce((s,o)=>s+(o.qty||0),0)
                            + preorders.filter(po=>po.productId===p.id&&['pending','notified'].includes(po.status||'pending')).reduce((s,po)=>s+(po.qty||1),0)
                          ) : 0;
                          const remaining = totalCap > 0 ? Math.max(0, totalCap - liveRes) : null;
                          if(totalCap > 0) {
                            const pct = Math.round(liveRes/totalCap*100);
                            const col = remaining===0 ? '#ff5050' : pct>=70 ? '#ffaa00' : '#4ade80';
                            return <div>
                              <div style={{color:col}}>{remaining===0 ? '🔴 CHEIO' : `🟢 ${remaining} disponíve${remaining===1?'l':'is'} p/ reservar`}</div>
                              <div style={{color:'var(--muted)',fontSize:'0.62rem',marginTop:2}}>{liveRes}/{totalCap} reservado{liveRes!==1?'s':''}{importCap>0?' (via import)':''}</div>
                              <div style={{height:3,background:'rgba(255,255,255,0.07)',borderRadius:2,marginTop:4}}>
                                <div style={{height:'100%',width:`${pct}%`,background:col,borderRadius:2}} />
                              </div>
                            </div>;
                          }
                          if(tot===undefined) return <span style={{color:'var(--muted)'}}>Sem controle</span>;
                          if(tot===0) return <span style={{color:'#ff5050'}}>ESGOTADO</span>;
                          if(preorderRes>0) return <span style={{color:'#ffaa00'}}>{baseAvail} disp. ({preorderRes} reserv.)</span>;
                          if(tot<=3) return <span style={{color:'var(--warn)'}}>BAIXO ({tot})</span>;
                          return <span style={{color:'#6bcb77'}}>{tot} OK</span>;
                        })()}
                      </div>
                      {/* Lotes de origem */}
                      {(stockLots[p.id]||[]).length > 0 && (
                        <div style={{marginTop:6,display:'flex',flexWrap:'wrap',gap:3}}>
                          {(stockLots[p.id]||[]).map((lot,i)=>(
                            <span key={i} style={{fontSize:'0.58rem',fontFamily:"'Space Mono',monospace",background:'rgba(120,170,255,0.07)',border:'1px solid rgba(120,170,255,0.2)',borderRadius:4,padding:'1px 6px',color:'#78aaff'}}
                              title={`Importação de ${lot.date}`}>
                              📦 {lot.date} +{lot.qty}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{marginTop:12,fontSize:"0.75rem",color:"var(--muted)",textAlign:"center"}}>
                Campo vazio = sem controle de estoque (produto sempre disponível) · 0 = ESGOTADO
              </div>

              {/* PEDIDOS DE REPOSIÇÃO */}
              <div style={{marginTop:24,borderTop:'1px solid var(--border)',paddingTop:18}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.62rem',color:'var(--accent)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:14}}>📦 Pedidos de Reposição</div>
                <div style={{fontSize:'0.72rem',color:'var(--muted)',marginBottom:12}}>Registre o que pediu ao fornecedor. O sistema vai limitar as reservas dos clientes à quantidade do pedido.</div>

                {/* Form */}
                <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap',alignItems:'flex-end'}}>
                  <div style={{flex:2,minWidth:140}}>
                    <div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:3,textTransform:'uppercase',letterSpacing:'0.5px'}}>Produto</div>
                    <select value={poForm.productId} onChange={e=>setPoForm(f=>({...f,productId:e.target.value}))} style={{width:'100%',padding:'8px 10px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:'0.78rem',boxSizing:'border-box'}}>
                      <option value="">Selecionar produto...</option>
                      {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div style={{flex:1,minWidth:70}}>
                    <div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:3,textTransform:'uppercase',letterSpacing:'0.5px'}}>Qtd</div>
                    <input type="number" min="1" value={poForm.qty} onChange={e=>setPoForm(f=>({...f,qty:e.target.value}))} placeholder="0" style={{width:'100%',padding:'8px 10px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:'0.78rem',boxSizing:'border-box'}} />
                  </div>
                  <div style={{flex:2,minWidth:120}}>
                    <div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:3,textTransform:'uppercase',letterSpacing:'0.5px'}}>Nota (opcional)</div>
                    <input value={poForm.note} onChange={e=>setPoForm(f=>({...f,note:e.target.value}))} placeholder="ex: Pedido #123, Frete EMS" style={{width:'100%',padding:'8px 10px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:'0.78rem',boxSizing:'border-box'}} />
                  </div>
                  <button onClick={addPurchaseOrder} style={{padding:'9px 14px',background:'var(--accent)',border:'none',borderRadius:8,color:'#000',fontWeight:700,fontSize:'0.78rem',cursor:'pointer',fontFamily:"'Space Mono',monospace",whiteSpace:'nowrap'}}>+ Registrar</button>
                </div>

                {/* List */}
                {purchaseOrders.length === 0 && <div style={{textAlign:'center',color:'var(--muted)',fontSize:'0.78rem',padding:'20px 0'}}>Nenhum pedido de reposição registrado</div>}
                {purchaseOrders.map(po => {
                  const prod = products.find(p=>p.id===po.productId);
                  const liveRes = orders
                    .filter(o=>o.peptideId===po.productId&&(!o._supabase||['pendente','pago','enviado'].includes(o.status||'pendente')))
                    .reduce((s,o)=>s+(o.qty||0),0);
                  const pct = Math.min(100, Math.round(liveRes / po.qty * 100));
                  const barColor = pct >= 90 ? '#ff5050' : pct >= 60 ? '#ffaa00' : '#4ade80';
                  return (
                    <div key={po.id} style={{border:'1px solid var(--border)',borderRadius:10,padding:'12px 14px',marginBottom:10,background: po.status==='received' ? 'rgba(255,255,255,0.02)' : 'rgba(0,229,195,0.03)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:'0.88rem',color: po.status==='received' ? 'var(--muted)' : 'var(--text)'}}>{prod?.name || po.productId}</div>
                          <div style={{fontSize:'0.65rem',color:'var(--muted)',marginTop:2}}>{po.date}{po.note ? ` · ${po.note}` : ''}</div>
                        </div>
                        <div style={{textAlign:'right',flexShrink:0,marginLeft:12}}>
                          {po.status === 'pending' ? (
                            <>
                              <div style={{fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:'0.88rem',color:barColor}}>{liveRes}/{po.qty}</div>
                              <div style={{fontSize:'0.65rem',color:barColor}}>{pct}% reservado</div>
                            </>
                          ) : (
                            <div style={{fontSize:'0.72rem',color:'#4ade80',fontFamily:"'Space Mono',monospace"}}>✅ Recebido</div>
                          )}
                        </div>
                      </div>
                      {po.status === 'pending' && (
                        <div style={{height:5,background:'rgba(255,255,255,0.07)',borderRadius:3,marginBottom:10}}>
                          <div style={{height:'100%',width:`${pct}%`,background:barColor,borderRadius:3,transition:'width 0.3s'}} />
                        </div>
                      )}
                      <div style={{display:'flex',gap:6}}>
                        {po.status === 'pending' && (
                          <button onClick={()=>receivePurchaseOrder(po.id)} style={{flex:1,padding:'7px',background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.3)',borderRadius:7,color:'#4ade80',fontFamily:"'Space Mono',monospace",fontSize:'0.68rem',fontWeight:700,cursor:'pointer'}}>✅ MERCADORIA RECEBIDA — Encerrar Cap</button>
                        )}
                        <button onClick={()=>removePurchaseOrder(po.id)} style={{padding:'7px 12px',background:'rgba(255,80,80,0.07)',border:'1px solid rgba(255,80,80,0.2)',borderRadius:7,color:'#ff5050',fontFamily:"'Space Mono',monospace",fontSize:'0.68rem',cursor:'pointer'}}>🗑️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>}

            {/* TAB: PRODUTOS */}
            {adminTab==="produtos" && (() => {
              const emptyForm = { sku:'', name:'', desc:'', category:'emagrecedores', price:'' };
              const editing = prodForm && prodForm.id ? products.find(p=>p.id===prodForm.id) : null;
              const form = prodForm || {};

              function saveProd() {
                if (!form.name?.trim() || !form.price) { showToast("Nome e preço são obrigatórios", "error"); return; }
                const price = parseFloat(form.price);
                if (isNaN(price)) { showToast("Preço inválido", "error"); return; }
                const promoVal = parseFloat(form.promo) || 0;
                const prodId = editing ? editing.id : (form.name||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,20) + Date.now();
                // Save promo separately
                const newPromo = { ...productPromo };
                if (promoVal > 0) newPromo[prodId] = promoVal; else delete newPromo[prodId];
                setProductPromo(newPromo);
                localStorage.setItem('vg-promo', JSON.stringify(newPromo));
                if (editing) {
                  persistProducts(products.map(p => p.id===editing.id ? {...p, ...form, price, promo: promoVal} : p));
                  showToast("Produto atualizado ✓");
                } else {
                  persistProducts([...products, { id: prodId, sku: form.sku||prodId.toUpperCase(), name: form.name, desc: form.desc||'', category: form.category||'emagrecedores', price, promo: promoVal }]);
                  showToast("Produto criado ✓");
                }
                setProdForm(null);
              }

              return <>
                {/* FORM MODAL */}
                {prodForm !== null && (
                  <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget){ setProdForm(null); setPackForm(null); } }} style={{alignItems:'flex-start',paddingTop:24,paddingBottom:24}}>
                  <div className="prod-form" style={{maxHeight:'calc(100vh - 48px)',overflowY:'auto',width:'100%',maxWidth:600,margin:'0 auto'}}>
                    <div className="prod-form-title">{editing ? '✏️ Editar Produto' : '＋ Novo Produto'}</div>
                    <div className="prod-form-grid">
                      <div className="prod-form-group">
                        <label>SKU</label>
                        <input placeholder="ex: RT15" value={form.sku||''} onChange={e=>setProdForm(f=>({...f,sku:e.target.value}))} />
                      </div>
                      <div className="prod-form-group">
                        <label>Preço (R$) *</label>
                        <input type="number" placeholder="299" value={form.price||''} onChange={e=>setProdForm(f=>({...f,price:e.target.value}))} />
                      </div>
                      <div className="prod-form-group prod-form-full">
                        <label>Nome do produto *</label>
                        <input placeholder="Retatrutida 15mg" value={form.name||''} onChange={e=>setProdForm(f=>({...f,name:e.target.value}))} />
                      </div>
                      <div className="prod-form-group prod-form-full">
                        <label>Descrição</label>
                        <textarea placeholder="Breve descrição do produto..." value={form.desc||''} onChange={e=>setProdForm(f=>({...f,desc:e.target.value}))} />
                      </div>
                      <div className="prod-form-group">
                        <label>Categoria</label>
                        <select value={form.category||'emagrecedores'} onChange={e=>setProdForm(f=>({...f,category:e.target.value}))}>
                          {CATEGORIES.filter(c=>c.id!=="all").map(c=>(
                            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="prod-form-group">
                        <label>🔥 Promoção (%)</label>
                        <input type="number" min="0" max="99" placeholder="0 = sem promoção" value={form.promo||productPromo[form.id||'']||''} onChange={e=>setProdForm(f=>({...f,promo:e.target.value}))} />
                        {(parseFloat(form.promo)||0) > 0 && form.price && <div style={{fontSize:'0.65rem',color:'#ff9600',marginTop:3}}>De R$ {parseFloat(form.price).toLocaleString('pt-BR')} por R$ {Math.round(parseFloat(form.price)*(1-(parseFloat(form.promo)||0)/100)).toLocaleString('pt-BR')}</div>}
                      </div>
                      <div className="prod-form-group">
                        <label>Badge (ex: ✨ Novo)</label>
                        <select value={form.badge||''} onChange={e=>setProdForm(f=>({...f,badge:e.target.value||null}))}>
                          <option value="">— Sem badge —</option>
                          <option value="✨ Novo">✨ Novo</option>
                          <option value="⭐ Destaque">⭐ Destaque</option>
                          <option value="⚡ Limitado">⚡ Limitado</option>
                          <option value="💎 Premium">💎 Premium</option>
                          <option value="🔬 Research">🔬 Research</option>
                        </select>
                      </div>
                      <div className="prod-form-group prod-form-full">
                        <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
                          <input type="checkbox" checked={!!form.hot} onChange={e=>setProdForm(f=>({...f,hot:e.target.checked}))} style={{width:16,height:16,accentColor:'var(--warn)',cursor:'pointer'}} />
                          <span>🔥 Produto em destaque (aparece no carousel "Em Alta" e com badge HOT)</span>
                        </label>
                      </div>
                      <div className="prod-form-group prod-form-full">
                        <label>🖼️ Imagem do produto</label>
                        <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                          {form.image_url && (
                            <img src={form.image_url} alt="" style={{width:64,height:64,objectFit:'cover',borderRadius:8,border:'1px solid var(--border)',flexShrink:0}} />
                          )}
                          <div style={{flex:1}}>
                            <label style={{display:'inline-flex',alignItems:'center',gap:7,padding:'8px 14px',background:'rgba(0,229,195,0.08)',border:'1px solid rgba(0,229,195,0.25)',borderRadius:8,cursor:'pointer',fontSize:'0.78rem',color:'var(--accent)',fontFamily:"'Space Mono',monospace",fontWeight:700}}>
                              {form._imgUploading ? '⏳ Enviando...' : '📤 Selecionar imagem'}
                              <input type="file" accept="image/*" style={{display:'none'}} disabled={!!form._imgUploading} onChange={async e => {
                                const file = e.target.files?.[0];
                                if (!file || !sb) return;
                                setProdForm(f=>({...f,_imgUploading:true}));
                                const ext = file.name.split('.').pop();
                                const path = `${form.id || ('new-' + Date.now())}.${ext}`;
                                const { error } = await sb.storage.from('product-images').upload(path, file, { upsert: true, contentType: file.type });
                                if (error) { showToast('Erro no upload: ' + error.message, 'error'); setProdForm(f=>({...f,_imgUploading:false})); return; }
                                const { data: { publicUrl } } = sb.storage.from('product-images').getPublicUrl(path);
                                setProdForm(f=>({...f, image_url: publicUrl, _imgUploading:false}));
                                showToast('Imagem enviada ✓');
                              }} />
                            </label>
                            {form.image_url && (
                              <button onClick={()=>setProdForm(f=>({...f,image_url:null}))} style={{marginLeft:8,background:'none',border:'none',color:'#ff5050',cursor:'pointer',fontSize:'0.75rem',fontFamily:"'Space Mono',monospace"}}>✕ remover</button>
                            )}
                            <div style={{fontSize:'0.62rem',color:'var(--muted)',marginTop:5}}>JPG, PNG ou WebP · máx 5MB</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* PACKS DE PROTOCOLO */}
                    {editing && (
                      <div style={{marginTop:20,paddingTop:16,borderTop:'1px solid var(--border)'}}>
                        <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--accent)',letterSpacing:'1.5px',marginBottom:12}}>📦 PACKS DE PROTOCOLO</div>
                        {(form.packs||[]).length === 0 && !packForm && (
                          <div style={{fontSize:'0.75rem',color:'var(--muted)',marginBottom:10}}>Nenhum pack cadastrado.</div>
                        )}
                        {(form.packs||[]).map(pk => (
                          <div key={pk.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:'rgba(0,229,195,0.04)',border:'1px solid rgba(0,229,195,0.12)',borderRadius:8,marginBottom:6,fontSize:'0.78rem'}}>
                            <div style={{flex:1}}>
                              <span style={{fontWeight:700,color:'var(--text)'}}>{pk.name}</span>
                              <span style={{color:'var(--muted)',marginLeft:8}}>{pk.qty} ampolas · -{pk.discount}%</span>
                              {pk.desc && <span style={{color:'var(--muted)',marginLeft:8,fontSize:'0.68rem'}}>— {pk.desc}</span>}
                            </div>
                            <span style={{fontFamily:"'Space Mono',monospace",color:'var(--accent)',fontSize:'0.75rem'}}>
                              R$ {Math.round(effectivePrice(form) * (1 - pk.discount/100) * pk.qty).toLocaleString('pt-BR')}
                            </span>
                            <button onClick={()=>{ const updated = (form.packs||[]).filter(x=>x.id!==pk.id); setProdForm(f=>({...f,packs:updated})); }} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.85rem',padding:'0 4px'}}>✕</button>
                          </div>
                        ))}
                        {packForm ? (
                          <div style={{background:'rgba(0,229,195,0.03)',border:'1px solid rgba(0,229,195,0.15)',borderRadius:10,padding:14,marginTop:8}}>
                            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:8,marginBottom:8}}>
                              <div><div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:3}}>Nome do pack *</div><input placeholder="Protocolo Completo" value={packForm.name||''} onChange={e=>setPackForm(f=>({...f,name:e.target.value}))} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'7px 10px',color:'var(--text)',fontSize:'0.8rem',width:'100%',boxSizing:'border-box'}} /></div>
                              <div><div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:3}}>Qtd (ampolas) *</div><input type="number" min="2" placeholder="5" value={packForm.qty||''} onChange={e=>setPackForm(f=>({...f,qty:e.target.value}))} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'7px 10px',color:'var(--text)',fontSize:'0.8rem',width:'100%',boxSizing:'border-box'}} /></div>
                              <div><div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:3}}>Desconto % *</div><input type="number" min="1" max="99" placeholder="15" value={packForm.discount||''} onChange={e=>setPackForm(f=>({...f,discount:e.target.value}))} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'7px 10px',color:'var(--text)',fontSize:'0.8rem',width:'100%',boxSizing:'border-box'}} /></div>
                            </div>
                            <div style={{marginBottom:10}}><div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:3}}>Descrição (opcional)</div><input placeholder="ex: Ciclo de 12–24 semanas" value={packForm.desc||''} onChange={e=>setPackForm(f=>({...f,desc:e.target.value}))} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'7px 10px',color:'var(--text)',fontSize:'0.8rem',width:'100%',boxSizing:'border-box'}} /></div>
                            {packForm.name && packForm.qty && packForm.discount && form.price && (
                              <div style={{fontSize:'0.68rem',color:'var(--accent)',fontFamily:"'Space Mono',monospace",marginBottom:10}}>
                                {packForm.qty}x por R$ {Math.round(parseFloat(form.price)*(1-parseFloat(packForm.discount)/100)*parseFloat(packForm.qty)).toLocaleString('pt-BR')} (economiza R$ {Math.round(parseFloat(form.price)*parseFloat(packForm.qty) - parseFloat(form.price)*(1-parseFloat(packForm.discount)/100)*parseFloat(packForm.qty)).toLocaleString('pt-BR')})
                              </div>
                            )}
                            <div style={{display:'flex',gap:8}}>
                              <button onClick={()=>{
                                if (!packForm.name?.trim() || !packForm.qty || !packForm.discount) { showToast('Preencha nome, qtd e desconto','error'); return; }
                                const newPack = { id: Date.now().toString(), name: packForm.name.trim(), qty: parseInt(packForm.qty), discount: parseFloat(packForm.discount), desc: packForm.desc?.trim()||'' };
                                setProdForm(f=>({...f, packs:[...(f.packs||[]), newPack]}));
                                setPackForm(null);
                                showToast('Pack adicionado ✓','success');
                              }} style={{padding:'7px 14px',background:'var(--accent)',border:'none',borderRadius:6,color:'#050a0e',fontWeight:700,fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>Salvar Pack</button>
                              <button onClick={()=>setPackForm(null)} style={{padding:'7px 14px',background:'transparent',border:'1px solid var(--border)',borderRadius:6,color:'var(--muted)',fontSize:'0.72rem',cursor:'pointer'}}>Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={()=>setPackForm({name:'',qty:'',discount:'',desc:''})} style={{marginTop:4,padding:'7px 14px',background:'rgba(0,229,195,0.06)',border:'1px solid rgba(0,229,195,0.2)',borderRadius:8,color:'var(--accent)',fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Space Mono',monospace",fontWeight:700}}>＋ Adicionar Pack</button>
                        )}
                      </div>
                    )}

                    <div style={{display:"flex",gap:8,marginTop:16}}>
                      <button className="admin-action-btn" onClick={saveProd}>💾 Salvar</button>
                      <button className="admin-action-btn" style={{background:"transparent"}} onClick={()=>{ setProdForm(null); setPackForm(null); }}>Cancelar</button>
                    </div>
                  </div>
                  </div>
                )}

                {/* LIST */}
                <div style={{display:"flex",gap:10,alignItems:'center',marginBottom:12}}>
                  <div style={{flex:1,position:'relative'}}>
                    <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:'0.85rem',color:'var(--muted)',pointerEvents:'none'}}>🔍</span>
                    <input
                      placeholder="Buscar por SKU, nome ou categoria..."
                      value={prodSearch}
                      onChange={e=>setProdSearch(e.target.value)}
                      style={{width:'100%',padding:'9px 34px 9px 34px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:'0.82rem',fontFamily:"'DM Sans',sans-serif"}}
                    />
                    {prodSearch && <button onClick={()=>setProdSearch('')} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.9rem',padding:4}}>✕</button>}
                  </div>
                  <button className="admin-action-btn" onClick={()=>setProdForm({sku:'',name:'',desc:'',category:'emagrecedores',price:''})}>＋ Novo Produto</button>
                </div>
                <div className="prod-list">
                  {(()=>{
                    const q = prodSearch.trim().toLowerCase();
                    const filtered = q
                      ? products.filter(p =>
                          (p.sku||'').toLowerCase().includes(q) ||
                          (p.name||'').toLowerCase().includes(q) ||
                          (p.category||'').toLowerCase().includes(q)
                        )
                      : products;
                    const sorted = [...filtered].sort((a,b) => (a.sku||'zzz').localeCompare(b.sku||'zzz', 'pt-BR', { numeric: true, sensitivity: 'base' }));
                    if (sorted.length === 0) return <div style={{padding:'20px',textAlign:'center',color:'var(--muted)',fontSize:'0.82rem'}}>Nenhum produto encontrado.</div>;
                    return sorted.map(p=>(
                      <div key={p.id} className="prod-list-row">
                        <div className="prod-list-sku">{p.sku||'—'}</div>
                        <div>
                          <div className="prod-list-name">{p.name}</div>
                          <div className="prod-list-cat">{CATEGORIES.find(c=>c.id===p.category)?.icon} {CATEGORIES.find(c=>c.id===p.category)?.name}</div>
                        </div>
                        <div className="prod-list-price">R$ {p.price.toLocaleString("pt-BR")}</div>
                        <div style={{display:'flex',gap:4,alignItems:'center'}}>
                          {p.hot && <span style={{fontSize:'0.65rem',background:'rgba(255,69,0,0.15)',border:'1px solid rgba(255,69,0,0.3)',color:'#ff6030',padding:'2px 7px',borderRadius:20,fontFamily:"'Space Mono',monospace"}}>🔥 HOT</span>}
                          {p.badge && !p.hot && <span style={{fontSize:'0.62rem',background:'rgba(0,229,195,0.08)',border:'1px solid rgba(0,229,195,0.2)',color:'var(--accent)',padding:'2px 7px',borderRadius:20,fontFamily:"'Space Mono',monospace"}}>{p.badge}</span>}
                        </div>
                        <button className="prod-edit-btn" onClick={()=>setProdForm({...p, price: p.price.toString()})}>editar</button>
                        <button className="prod-del-btn" onClick={()=>{
                          if(!window.confirm(`Remover "${p.name}"?`)) return;
                          const pendingOrders = orders.filter(o => o.peptideId === p.id || (o._items||[]).some(i=>i.peptideId===p.id));
                          if(pendingOrders.length > 0 && !window.confirm(`⚠️ Este produto tem ${pendingOrders.length} pedido(s) pendente(s). Deseja remover mesmo assim?`)) return;
                          if(sb) sb.from('products').delete().eq('id', p.id).then(({error})=>{ if(error) console.warn('[Supabase] Delete product error:', error.message); });
                          persistProducts(products.filter(x=>x.id!==p.id));
                          showToast("Produto removido", "info");
                        }}>excluir</button>
                      </div>
                    ));
                  })()}
                </div>
                <div style={{marginTop:10,textAlign:"right"}}>
                  <button style={{background:"none",border:"none",color:"var(--muted)",fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Space Mono',monospace"}}
                    onClick={()=>{ if(window.confirm("Restaurar lista padrão de produtos?")){ persistProducts(DEFAULT_PEPTIDES); showToast("Produtos restaurados", "info"); }}}>
                    ↺ Restaurar padrão
                  </button>
                </div>
              </>;
            })()}

            {adminTab==="artigos" && (()=>{
              const editingArt = artForm && artForm.id ? articles.find(a=>a.id===artForm.id) : null;
              const form = artForm || {};

              function saveArt() {
                if (!form.title?.trim()) { showToast("Título obrigatório", "error"); return; }
                if (editingArt) {
                  persistArticles(articles.map(a => a.id===editingArt.id ? {...a,...form} : a));
                  showToast("Artigo atualizado ✓");
                } else {
                  const id = 'art-' + Date.now() + '-' + Math.random().toString(36).slice(2,7);
                  const today = new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
                  persistArticles([{id, emoji:form.emoji||'📄', tag:form.tag||'Geral', title:form.title, subtitle:form.subtitle||'', date:today, relatedProductId:form.relatedProductId||'', body:form.body||''}, ...articles]);
                  showToast("Artigo publicado ✓");
                }
                setArtForm(null);
              }

              return <>
                <div className="admin-action-row" style={{marginBottom:16}}>
                  <button className="admin-action-btn" onClick={()=>setArtForm({emoji:'📄',tag:'',title:'',subtitle:'',body:'',relatedProductId:''})}>＋ Novo Artigo</button>
                </div>

                {artForm !== null && (
                  <div className="art-form">
                    <div className="art-form-title">{editingArt ? '✏️ Editar Artigo' : '＋ Novo Artigo'}</div>
                    <div className="art-form-group">
                      <label>Emoji</label>
                      <input placeholder="ex: ✨" value={form.emoji||''} onChange={e=>setArtForm(f=>({...f,emoji:e.target.value}))} style={{maxWidth:80}} />
                    </div>
                    <div className="art-form-group">
                      <label>Tag / Categoria</label>
                      <input placeholder="ex: Beleza & Pele" value={form.tag||''} onChange={e=>setArtForm(f=>({...f,tag:e.target.value}))} />
                    </div>
                    <div className="art-form-group">
                      <label>Título</label>
                      <input placeholder="Título do artigo" value={form.title||''} onChange={e=>setArtForm(f=>({...f,title:e.target.value}))} />
                    </div>
                    <div className="art-form-group">
                      <label>Subtítulo / Resumo</label>
                      <input placeholder="Breve descrição exibida no card" value={form.subtitle||''} onChange={e=>setArtForm(f=>({...f,subtitle:e.target.value}))} />
                    </div>
                    <div className="art-form-group">
                      <label>Produto relacionado (ID ou parte do nome)</label>
                      <input placeholder="ex: ghkcu ou tirzepatide" value={form.relatedProductId||''} onChange={e=>setArtForm(f=>({...f,relatedProductId:e.target.value}))} />
                    </div>
                    <div className="art-form-group">
                      <label>Conteúdo (HTML básico: &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;strong&gt;)</label>
                      <textarea placeholder="<h3>Título</h3><p>Parágrafo...</p>" value={form.body||''} onChange={e=>setArtForm(f=>({...f,body:e.target.value}))} style={{minHeight:200}} />
                    </div>
                    <div className="art-form-actions">
                      <button className="admin-action-btn" onClick={saveArt}>{editingArt ? 'Salvar alterações' : 'Publicar artigo'}</button>
                      <button className="admin-action-btn" style={{background:"none",border:"1px solid var(--border)",color:"var(--muted)"}} onClick={()=>setArtForm(null)}>Cancelar</button>
                    </div>
                  </div>
                )}

                {articles.length === 0
                  ? <div style={{textAlign:"center",color:"var(--muted)",padding:40,fontSize:"0.85rem"}}>Nenhum artigo ainda</div>
                  : articles.map(art => (
                    <div key={art.id} className="art-list-item">
                      <div className="art-list-info">
                        <span className="art-list-emoji">{art.emoji}</span>
                        <div>
                          <div className="art-list-title">{art.title}</div>
                          <div className="art-list-tag">{art.tag} · {art.date}</div>
                        </div>
                      </div>
                      <div className="art-list-actions">
                        <button className="admin-action-btn" style={{padding:"6px 12px",fontSize:"0.68rem"}} onClick={()=>setArtForm({...art})}>✏️ Editar</button>
                        <button className="admin-remove-btn" onClick={()=>{ if(window.confirm("Remover artigo?")) persistArticles(articles.filter(a=>a.id!==art.id)); }}>remover</button>
                      </div>
                    </div>
                  ))
                }

                <div style={{marginTop:10,textAlign:"right"}}>
                  <button style={{background:"none",border:"none",color:"var(--muted)",fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Space Mono',monospace"}}
                    onClick={()=>{ if(window.confirm("Restaurar artigos padrão?")){ persistArticles(DEFAULT_ARTICLES); showToast("Artigos restaurados", "info"); }}}>
                    ↺ Restaurar padrão
                  </button>
                </div>
              </>;
            })()}

            {/* TAB: PRÉ-ORDERS */}
            {adminTab==="preorders" && (()=>{
              // Run expiry check on every render of this tab
              const now = Date.now();
              const statusLabel = {
                pending: {txt:'🟡 Aguardando', color:'#ffaa00'},
                notified: {txt:'🔵 Notificado', color:'#00b4d8'},
                completed: {txt:'✅ Concluído', color:'#6bcb77'},
                expired: {txt:'⏰ Expirado', color:'#888'},
                cancelled: {txt:'✕ Cancelado', color:'#ff5050'},
              };
              const pendingList = preorders.filter(po=>(po.status||'pending')==='pending');
              const notifiedList = preorders.filter(po=>po.status==='notified');
              const doneList = preorders.filter(po=>['completed','expired','cancelled'].includes(po.status));

              // Summary chips
              const byProduct = {};
              preorders.filter(po=>['pending','notified'].includes(po.status||'pending')).forEach(po => {
                if (!byProduct[po.productName]) byProduct[po.productName] = 0;
                byProduct[po.productName] += (po.qty || 0);
              });

              return <>
                <div className="admin-actions" style={{flexWrap:'wrap',gap:8}}>
                  <button className="admin-action-btn" onClick={()=>setAdminPoForm({productId:'',name:'',whatsapp:'',qty:1})}>＋ Nova Reserva Manual</button>
                  <button className="admin-action-btn" onClick={checkPreorderExpiry}>🔄 Verificar prazos</button>
                  <button className="admin-action-btn" style={{background: preorderLocked ? 'rgba(0,229,195,0.12)' : 'rgba(255,80,80,0.12)', borderColor: preorderLocked ? 'rgba(0,229,195,0.4)' : 'rgba(255,80,80,0.4)', color: preorderLocked ? 'var(--accent)' : '#ff5050'}} onClick={()=>{ const next = !preorderLocked; setPreorderLocked(next); localStorage.setItem('vg-preorder-locked', String(next)); showToast(next ? '🔒 Novas reservas bloqueadas' : '🔓 Novas reservas liberadas', next ? 'error' : 'success'); }}>{preorderLocked ? '🔓 Liberar Pré-Orders' : '🔒 Travar Pré-Orders'}</button>
                  <button className="admin-action-btn danger" onClick={()=>{ if(window.confirm("Limpar pré-orders concluídas/expiradas/canceladas?")){ const toDelete = preorders.filter(po=>['completed','expired','cancelled'].includes(po.status||'pending')); toDelete.forEach(po=>{ if(sb) sb.from('preorders').delete().eq('id',po.id).then(({error})=>{ if(error) console.warn('[Supabase] Delete preorder error:',error.message); }); }); persistPreorders(preorders.filter(po=>['pending','notified'].includes(po.status||'pending'))); showToast("Histórico limpo","info"); }}}>🗑️ Limpar concluídas</button>
                  <button className="admin-action-btn" onClick={async ()=>{
                    if(!window.confirm('Remover pedidos fantasma (sem itens, criados por pré-orders)?')) return;
                    const {data, error} = await sb.from('orders').select('id,items').eq('status','pendente');
                    if(error) { showToast('Erro: '+error.message,'error'); return; }
                    const phantoms = (data||[]).filter(o => !o.items || o.items.length === 0);
                    if(phantoms.length === 0) { showToast('Nenhum pedido fantasma encontrado','info'); return; }
                    for (const p of phantoms) { await sb.from('orders').delete().eq('id',p.id); }
                    showToast(`${phantoms.length} pedido(s) fantasma removido(s) ✓`,'success');
                  }}>🗑️ Limpar pedidos fantasma</button>
                </div>

                {/* FORMULÁRIO MANUAL */}
                {adminPoForm !== null && (
                  <div style={{background:'rgba(0,229,195,0.05)',border:'1px solid rgba(0,229,195,0.2)',borderRadius:12,padding:'16px 18px',marginBottom:16}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.65rem",color:'var(--accent)',letterSpacing:'1.5px',marginBottom:12}}>＋ NOVA RESERVA MANUAL</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                      <div>
                        <div style={{fontSize:'0.72rem',color:'var(--muted)',marginBottom:4}}>Produto</div>
                        <select value={adminPoForm.productId} onChange={e=>setAdminPoForm(f=>({...f,productId:e.target.value}))}
                          style={{width:'100%',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:'var(--text)',fontSize:'0.8rem',fontFamily:"'DM Sans',sans-serif"}}>
                          <option value="">Selecione...</option>
                          {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{fontSize:'0.72rem',color:'var(--muted)',marginBottom:4}}>Quantidade</div>
                        <input type="number" min="1" value={adminPoForm.qty}
                          onChange={e=>setAdminPoForm(f=>({...f,qty:parseInt(e.target.value)||1}))}
                          style={{width:'100%',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:'var(--text)',fontSize:'0.8rem'}} />
                      </div>
                      <div>
                        <div style={{fontSize:'0.72rem',color:'var(--muted)',marginBottom:4}}>Nome do cliente</div>
                        <input value={adminPoForm.name} onChange={e=>setAdminPoForm(f=>({...f,name:e.target.value}))}
                          placeholder="Ex: Gustavo"
                          style={{width:'100%',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:'var(--text)',fontSize:'0.8rem'}} />
                      </div>
                      <div>
                        <div style={{fontSize:'0.72rem',color:'var(--muted)',marginBottom:4}}>WhatsApp</div>
                        <input value={adminPoForm.whatsapp} onChange={e=>setAdminPoForm(f=>({...f,whatsapp:e.target.value}))}
                          placeholder="74999710520"
                          style={{width:'100%',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:'var(--text)',fontSize:'0.8rem'}} />
                      </div>
                    </div>
                    <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                      <button onClick={()=>setAdminPoForm(null)}
                        style={{padding:'7px 16px',background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',fontSize:'0.75rem',cursor:'pointer'}}>
                        Cancelar
                      </button>
                      <button onClick={()=>{
                        const p = products.find(x=>x.id===adminPoForm.productId);
                        if(!p) { showToast('Selecione um produto','error'); return; }
                        if(!(adminPoForm.name||'').trim()) { showToast('Informe o nome','error'); return; }
                        if(!(adminPoForm.whatsapp||'').trim()) { showToast('Informe o WhatsApp','error'); return; }
                        savePreorder(p, adminPoForm);
                        setAdminPoForm(null);
                        showToast('Reserva criada ✓','success');
                      }}
                        style={{padding:'7px 20px',background:'var(--accent)',border:'none',borderRadius:8,color:'#000',fontWeight:700,fontSize:'0.75rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>
                        Salvar Reserva
                      </button>
                    </div>
                  </div>
                )}

                {/* MODAL EDITAR RESERVA */}
                {adminPoEditModal !== null && (
                  <div style={{background:'rgba(255,165,0,0.05)',border:'1px solid rgba(255,165,0,0.3)',borderRadius:12,padding:'16px 18px',marginBottom:16}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.65rem",color:'#ffaa00',letterSpacing:'1.5px',marginBottom:12}}>✏️ EDITAR RESERVA</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                      <div>
                        <div style={{fontSize:'0.72rem',color:'var(--muted)',marginBottom:4}}>Produto</div>
                        <select value={adminPoEditModal.productId} onChange={e=>{const p=products.find(x=>x.id===e.target.value);setAdminPoEditModal(f=>({...f,productId:e.target.value,productName:p?p.name:f.productName}));}}
                          style={{width:'100%',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:'var(--text)',fontSize:'0.8rem'}}>
                          {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{fontSize:'0.72rem',color:'var(--muted)',marginBottom:4}}>Quantidade</div>
                        <input type="number" min="1" value={adminPoEditModal.qty}
                          onChange={e=>setAdminPoEditModal(f=>({...f,qty:parseInt(e.target.value)||1}))}
                          style={{width:'100%',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:'var(--text)',fontSize:'0.8rem'}} />
                      </div>
                      <div>
                        <div style={{fontSize:'0.72rem',color:'var(--muted)',marginBottom:4}}>Nome do cliente</div>
                        <input value={adminPoEditModal.name||''} onChange={e=>setAdminPoEditModal(f=>({...f,name:e.target.value}))}
                          style={{width:'100%',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:'var(--text)',fontSize:'0.8rem'}} />
                      </div>
                      <div>
                        <div style={{fontSize:'0.72rem',color:'var(--muted)',marginBottom:4}}>WhatsApp</div>
                        <input value={adminPoEditModal.whatsapp||''} onChange={e=>setAdminPoEditModal(f=>({...f,whatsapp:e.target.value}))}
                          style={{width:'100%',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:'var(--text)',fontSize:'0.8rem'}} />
                      </div>
                    </div>
                    <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                      <button onClick={()=>setAdminPoEditModal(null)}
                        style={{padding:'7px 16px',background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',fontSize:'0.75rem',cursor:'pointer'}}>
                        Cancelar
                      </button>
                      <button onClick={()=>{
                        persistPreorders(preorders.map(x=>x.id===adminPoEditModal.id?{...adminPoEditModal}:x));
                        if(sb) sb.from('preorders').update({
                          product_id: adminPoEditModal.productId,
                          product_name: adminPoEditModal.productName,
                          qty: adminPoEditModal.qty,
                          name: adminPoEditModal.name,
                          whatsapp: adminPoEditModal.whatsapp
                        }).eq('id',adminPoEditModal.id).then(({error})=>{if(error) console.warn('[Supabase] Update preorder:',error.message);});
                        setAdminPoEditModal(null);
                        showToast('Reserva atualizada ✓','success');
                      }}
                        style={{padding:'7px 20px',background:'#ffaa00',border:'none',borderRadius:8,color:'#000',fontWeight:700,fontSize:'0.75rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>
                        Salvar Alterações
                      </button>
                    </div>
                  </div>
                )}

                {/* Product demand chips */}
                {Object.keys(byProduct).length > 0 && (
                  <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
                    {Object.entries(byProduct).map(([name,qty])=>(
                      <div key={name} style={{background:"rgba(255,165,0,0.1)",border:"1px solid rgba(255,165,0,0.3)",borderRadius:20,padding:"4px 12px",fontFamily:"'Space Mono',monospace",fontSize:"0.65rem",color:"#ffaa00"}}>
                        {qty}x {name}
                      </div>
                    ))}
                  </div>
                )}

                {preorders.length === 0 && (
                  <div style={{textAlign:"center",color:"var(--muted)",padding:40,fontSize:"0.85rem"}}>Nenhuma reserva ainda</div>
                )}

                {/* PENDING SECTION */}
                {pendingList.length > 0 && (
                  <div style={{marginBottom:20}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.7rem",color:"#ffaa00",marginBottom:8,letterSpacing:'0.05em'}}>⏳ AGUARDANDO ESTOQUE ({pendingList.length})</div>
                    {pendingList.map((po,i)=>{
                      const p = products.find(x=>x.id===po.productId);
                      return (
                        <div key={po.id||i} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"rgba(255,165,0,0.04)",border:"1px solid rgba(255,165,0,0.18)",borderRadius:10,marginBottom:8,flexWrap:'wrap'}}>
                          <div style={{flex:1,minWidth:160}}>
                            <div style={{fontWeight:600,marginBottom:2}}>{po.productName}</div>
                            <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.65rem",color:"var(--muted)"}}>{po.name} · {po.whatsapp}</div>
                            <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:"var(--muted)"}}>{po.date}</div>
                          </div>
                          <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.8rem",color:"#ffaa00",fontWeight:700}}>×{po.qty}</div>
                          <button
                            onClick={()=>notifyPreorder(po)}
                            style={{padding:"7px 14px",background:"linear-gradient(135deg,#00b4d8,#0077b6)",border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:"0.72rem",cursor:"pointer",whiteSpace:"nowrap"}}>
                            📲 Avisar cliente
                          </button>
                          <button onClick={()=>setAdminPoEditModal({...po})}
                            style={{padding:"5px 10px",background:"rgba(255,165,0,0.12)",border:"1px solid rgba(255,165,0,0.35)",borderRadius:6,color:"#ffaa00",fontSize:"0.68rem",cursor:"pointer"}}>
                            ✏️ Editar
                          </button>
                          <button className="admin-remove-btn" title="Remover" onClick={()=>persistPreorders(preorders.map(x=>x.id===po.id?{...x,status:'cancelled'}:x))}>✕</button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* NOTIFIED SECTION */}
                {notifiedList.length > 0 && (
                  <div style={{marginBottom:20}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.7rem",color:"#00b4d8",marginBottom:8,letterSpacing:'0.05em'}}>🔔 NOTIFICADOS — AGUARDANDO CONCLUSÃO ({notifiedList.length})</div>
                    {notifiedList.map((po,i)=>{
                      const elapsed = now - (po.notifiedAt||now);
                      const remaining = Math.max(0, 24*60*60*1000 - elapsed);
                      const hoursLeft = Math.floor(remaining / 3600000);
                      const minsLeft = Math.floor((remaining % 3600000) / 60000);
                      const isUrgent = hoursLeft < 3;
                      const portalUrl = window.location.origin + window.location.pathname + '?preorder=' + po.token;
                      return (
                        <div key={po.id||i} style={{padding:"12px 14px",background:"rgba(0,180,216,0.05)",border:`1px solid ${isUrgent?"rgba(255,80,80,0.4)":"rgba(0,180,216,0.25)"}`,borderRadius:10,marginBottom:8}}>
                          <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                            <div style={{flex:1,minWidth:160}}>
                              <div style={{fontWeight:600,marginBottom:2}}>{po.productName}</div>
                              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.65rem",color:"var(--muted)"}}>{po.name} · {po.whatsapp}</div>
                            </div>
                            <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.8rem",color:"#ffaa00",fontWeight:700}}>×{po.qty}</div>
                            <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.65rem",color:isUrgent?"#ff5050":"#00b4d8",fontWeight:700}}>
                              ⏱ {hoursLeft}h {minsLeft}m restantes
                            </div>
                            {!po.reminderSent && (
                              <button onClick={()=>sendReminder(po)} style={{padding:"5px 10px",background:"rgba(255,165,0,0.15)",border:"1px solid rgba(255,165,0,0.4)",borderRadius:6,color:"#ffaa00",fontSize:"0.68rem",cursor:"pointer"}}>
                                📩 Lembrete
                              </button>
                            )}
                            <button onClick={()=>{ navigator.clipboard.writeText(portalUrl); showToast('Link copiado!','success'); }} style={{padding:"5px 10px",background:"rgba(0,180,216,0.12)",border:"1px solid rgba(0,180,216,0.3)",borderRadius:6,color:"#00b4d8",fontSize:"0.68rem",cursor:"pointer"}}>
                              🔗 Copiar link
                            </button>
                            <button onClick={()=>setAdminPoEditModal({...po})}
                              style={{padding:"5px 10px",background:"rgba(255,165,0,0.12)",border:"1px solid rgba(255,165,0,0.35)",borderRadius:6,color:"#ffaa00",fontSize:"0.68rem",cursor:"pointer"}}>
                              ✏️ Editar
                            </button>
                            <button onClick={()=>persistPreorders(preorders.map(x=>x.id===po.id?{...x,status:'expired'}:x))} style={{padding:"5px 10px",background:"rgba(255,80,80,0.1)",border:"1px solid rgba(255,80,80,0.3)",borderRadius:6,color:"#ff5050",fontSize:"0.68rem",cursor:"pointer"}}>
                              Expirar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* HISTORY SECTION */}
                {doneList.length > 0 && (
                  <div>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.7rem",color:"var(--muted)",marginBottom:8,letterSpacing:'0.05em'}}>📁 HISTÓRICO ({doneList.length})</div>
                    {doneList.map((po,i)=>{
                      const s = statusLabel[po.status] || statusLabel.pending;
                      return (
                        <div key={po.id||i} style={{display:'flex',alignItems:'center',gap:10,padding:"8px 14px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,marginBottom:6,opacity:0.75}}>
                          <div style={{flex:1,minWidth:160}}>
                            <div style={{fontSize:"0.85rem",fontWeight:600}}>{po.productName}</div>
                            <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:"var(--muted)"}}>{po.name} · {po.date}</div>
                          </div>
                          <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.72rem",color:"#888"}}>×{po.qty}</div>
                          <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.65rem",color:s.color,fontWeight:700}}>{s.txt}</div>
                          <button className="admin-remove-btn" onClick={()=>removePreorder(po.id)}>✕</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>;
            })()}

            {/* TAB: AVISOS */}
            {adminTab==="avisos" && <>
              <div className="notice-editor">
                <div className="notice-editor-title">Novo Aviso</div>
                <div className="notice-editor-row">
                  <select className="notice-type-select" value={noticeInput.type} onChange={e=>setNoticeInput(n=>({...n,type:e.target.value}))}>
                    <option value="warn">⚡ Atenção</option>
                    <option value="info">ℹ️ Info</option>
                    <option value="alert">🚨 Urgente</option>
                  </select>
                  <input className="notice-text-input" placeholder="Texto do aviso..." value={noticeInput.text} onChange={e=>setNoticeInput(n=>({...n,text:e.target.value}))} />
                  <button className="notice-add-btn" onClick={()=>{
                    if(!noticeInput.text.trim()) return;
                    addNotice(noticeInput);
                    setNoticeInput({type:'warn',text:''});
                    showToast('Aviso publicado ✓');
                  }}>Publicar</button>
                </div>
              </div>
              {notices.length === 0
                ? <div style={{textAlign:"center",color:"var(--muted)",padding:40,fontSize:"0.85rem"}}>Nenhum aviso publicado</div>
                : <div className="notice-list-admin">
                    {notices.map(n=>(
                      <div key={n.id} className="notice-admin-item">
                        <span>{n.type==='info'?'ℹ️':n.type==='warn'?'⚠️':n.type==='alert'?'🚨':'📌'}</span>
                        <span style={{flex:1}}>{n.text}</span>
                        <button className="notice-admin-remove" onClick={()=>removeNotice(n.id)}>✕ Remover</button>
                      </div>
                    ))}
                  </div>
              }
            </>}

            {/* TAB: FINANCEIRO */}
            {adminTab==="financeiro" && (()=>{
              const fmt = v => `R$ ${v.toLocaleString('pt-BR')}`;

              // Revenue using _total (real amount paid) or calculate from _items
              const sbOrders = orders.filter(o => o._supabase);
              const ordsByStatus = s => sbOrders.filter(o=>(o.status||'pendente')===s);
              const revForOrds = ords => ords.reduce((a,o)=>{
                if(o._total) return a + o._total;
                const items = o._items && o._items.length ? o._items : [{peptideId:o.peptideId, qty:o.qty||1}];
                return a + items.reduce((s2,it)=>{ const p=products.find(x=>x.id===it.peptideId); return s2+(p?p.price*(it.qty||1):0); },0);
              },0);
              const revByStatus = s => revForOrds(ordsByStatus(s));
              const confirmed = revByStatus('pago') + revByStatus('enviado') + revByStatus('entregue');
              const pending   = revByStatus('pendente');
              const totalOrds = sbOrders.length;
              const ticket    = totalOrds ? Math.round((confirmed+pending)/totalOrds) : 0;
              const preorderProj = preorders.reduce((a,po)=>{ const p=products.find(x=>x.id===po.productId); return a+(p?p.price*(po.qty||0):0); },0);

              // COGS — confirmed orders where product has _custoVial
              const confirmedOrds = [...ordsByStatus('pago'), ...ordsByStatus('enviado'), ...ordsByStatus('entregue')];
              const cogsForOrds = ords => ords.reduce((a,o)=>{
                const items = o._items && o._items.length ? o._items : [{peptideId:o.peptideId, qty:o.qty||1}];
                return a + items.reduce((s2,it)=>{ const p=products.find(x=>x.id===it.peptideId); return s2+(p&&p._custoVial?p._custoVial*(it.qty||1):0); },0);
              },0);
              const cogs = cogsForOrds(confirmedOrds);
              const hasCost = cogs > 0;
              const lucroLiq = confirmed - cogs;

              // Perdas por extravio — vials de pedidos extraviados são perda total
              const extraviadoOrds = ordsByStatus('extraviado');
              const perdaExtravioRevenue = revForOrds(extraviadoOrds);
              const perdaExtravioCogs = cogsForOrds(extraviadoOrds);

              // Estoque em trânsito — agregado por SKU das importações não-entregues
              const transitBySku = {};
              importHistory.filter(h => { const st = h.status||'aguardando'; return st !== 'entregue' && st !== 'apreendida'; }).forEach(h => {
                (h.items||[]).forEach(it => {
                  if (!it.sku) return;
                  const vials = parseInt(it.vials) || (parseInt(it.boxes)||0)*10;
                  const preco = parseFloat(it.precoVenda) || parseFloat(it.precoSug) || 0;
                  if (!transitBySku[it.sku]) transitBySku[it.sku] = { sku: it.sku, name: it.name || it.sku, vials: 0, rev: 0 };
                  transitBySku[it.sku].vials += vials;
                  transitBySku[it.sku].rev += vials * preco;
                });
              });
              const transitList = Object.values(transitBySku).sort((a,b)=>b.rev-a.rev);
              const transitTotalRev = transitList.reduce((s,t)=>s+t.rev, 0);
              const transitTotalVials = transitList.reduce((s,t)=>s+t.vials, 0);
              const margemMedia = confirmed > 0 && hasCost ? Math.round((lucroLiq/confirmed)*100) : null;

              // Per-product data for confirmed orders
              const prodData = {};
              confirmedOrds.forEach(o=>{
                const items = o._items && o._items.length ? o._items : [{peptideId:o.peptideId, qty:o.qty||1}];
                items.forEach(it=>{
                  const p=products.find(x=>x.id===it.peptideId); if(!p) return;
                  if(!prodData[p.id]) prodData[p.id]={name:p.name,rev:0,cogs:0,qty:0,price:p.price,custo:p._custoVial||0};
                  prodData[p.id].rev += p.price*(it.qty||1);
                  prodData[p.id].cogs += (p._custoVial||0)*(it.qty||1);
                  prodData[p.id].qty += (it.qty||1);
                });
              });
              const prodLucList = Object.values(prodData).sort((a,b)=>b.rev-a.rev);

              // Ranking across all statuses
              const allProdRev = {}; const allProdQty = {};
              sbOrders.forEach(o=>{
                const items = o._items && o._items.length ? o._items : [{peptideId:o.peptideId, qty:o.qty||1}];
                items.forEach(it=>{ const p=products.find(x=>x.id===it.peptideId); if(!p) return; allProdRev[p.name]=(allProdRev[p.name]||0)+p.price*(it.qty||1); allProdQty[p.name]=(allProdQty[p.name]||0)+(it.qty||1); });
              });
              const allRankList = Object.entries(allProdRev).sort((a,b)=>b[1]-a[1]);
              const allMaxRev = allRankList[0]?allRankList[0][1]:1;

              // Estoque valorizado (stock × custo/vial)
              const estoqueValorizado = products.reduce((a,p)=>a+(p._custoVial||0)*(stock[p.id]??0),0);
              const estoqueVendaTotal = products.reduce((a,p)=>a+(p.price||0)*(stock[p.id]??0),0);
              const estoqueLucroLatente = estoqueVendaTotal - estoqueValorizado;

              // Taxa de conversão pré-orders
              const poTotal = preorders.length;
              const poConcluidas = preorders.filter(po=>po.status==='completed').length;
              const taxaConversao = poTotal > 0 ? Math.round((poConcluidas/poTotal)*100) : 0;

              const poByProd = {};
              preorders.forEach(po=>{ const p=products.find(x=>x.id===po.productId); if(!p) return; if(!poByProd[p.name]) poByProd[p.name]={qty:0,proj:0}; poByProd[p.name].qty+=(po.qty||0); poByProd[p.name].proj+=p.price*(po.qty||0); });

              const days7 = Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); return d; });
              const trendData = days7.map(d=>{
                const ds = d.toLocaleDateString('pt-BR');
                const dayOrds = sbOrders.filter(o=>o.createdAt && new Date(o.createdAt).toLocaleDateString('pt-BR')===ds);
                return { label: d.toLocaleDateString('pt-BR',{weekday:'short'}), rev: revForOrds(dayOrds) };
              });
              const maxTrend = Math.max(...trendData.map(d=>d.rev),1);

              // ── DESPESAS ──────────────────────────────────────────────────
              // 1) Frete de saída (ME labels)
              const totalFreteEnvio = Object.values(shippingCosts).reduce((s,e)=>s+(e.cost||0), 0);

              // 2) Taxas MP — calculadas por pedido confirmado baseado no pagamento
              const calcMpFee = o => {
                const pay = JSON.stringify(o._payment || '').toLowerCase();
                if (pay.includes('pix')) return 0;
                const base = o._total || 0;
                if (pay.includes('2x') || pay.includes('parcel')) return base * (1.0498 * 1.0459 - 1);
                return base * 0.0498; // receber na hora
              };
              const totalTaxasMP = confirmedOrds.reduce((s,o)=>s+calcMpFee(o), 0);

              // 3) Frete absorvido em pedidos PIX (loja paga o frete)
              const FRETE_FIXO = 60;
              const pixOrdsConfirmed = confirmedOrds.filter(o => JSON.stringify(o._payment||'').toLowerCase().includes('pix'));
              const totalFretePixAbsorvido = pixOrdsConfirmed.reduce((s,o) => {
                // Se já tem custo real de envio (ME label), não duplicar
                if (shippingCosts[o.id]) return s;
                return s + FRETE_FIXO;
              }, 0);

              // 4) Despesas manuais
              const totalDespManuais = despesas.reduce((s,d)=>s+(parseFloat(d.valor)||0), 0);

              // 4) Custo de importações
              const importCustoH = h => (parseFloat(h.totalOrderUsd)||0) * (parseFloat(h.cambio)||0) + (parseFloat(h.overheadBrl)||0);
              const totalImportCost = importHistory.reduce((s,h) => s + importCustoH(h), 0);

              // Perdas por apreensão — importação retida na alfândega = 100% prejuízo
              const apreendidasList = importHistory.filter(h => h.status === 'apreendida');
              const perdaApreensao = apreendidasList.reduce((s,h) => s + importCustoH(h), 0);

              // 5) P&L — extravio: COGS perdido entra como despesa
              //         apreensão: custo total da importação entra como despesa (só quando hasCost,
              //         pois sem hasCost o totalImportCost já inclui apreendidas)
              const totalDespesas = (hasCost ? cogs : totalImportCost) + totalFreteEnvio + totalFretePixAbsorvido + totalTaxasMP + totalDespManuais + perdaExtravioCogs + (hasCost ? perdaApreensao : 0);
              const lucroOperacional = confirmed - totalDespesas;
              const margemOperacional = confirmed > 0 ? (lucroOperacional / confirmed) * 100 : 0;

              // Despesas CRUD
              async function addDespesa() {
                const v = parseFloat(despesaForm.valor);
                if (!despesaForm.desc || isNaN(v) || v <= 0) { showToast('Preencha descrição e valor','error'); return; }
                if (sb) {
                  const { data } = await sb.from('expenses').insert({ description: despesaForm.desc, value: v, category: despesaForm.categoria||'outros', expense_date: despesaForm.data }).select().single();
                  if (data) setDespesas(ds => [{ id:data.id, desc:data.description, valor:data.value, categoria:data.category, data:data.expense_date }, ...ds]);
                } else {
                  persistDespesas([{ id: Date.now(), ...despesaForm, valor: v }, ...despesas]);
                }
                setDespesaForm({ desc:'', valor:'', categoria:'outros', data: new Date().toLocaleDateString('pt-BR') });
                showToast('Despesa registrada ✓', 'success');
              }
              async function removeDespesa(id) {
                if (sb) { await sb.from('expenses').delete().eq('id', id); setDespesas(ds => ds.filter(d=>d.id!==id)); }
                else { persistDespesas(despesas.filter(d=>d.id!==id)); }
              }

              const DESP_CATS = { operacional:'⚙️ Operacional', embalagem:'📦 Embalagem', marketing:'📣 Marketing', outros:'📌 Outros' };

              return (
                <>
                  {/* ── P&L PANEL ── */}
                  <div style={{background:'rgba(0,0,0,0.25)',border:'1px solid rgba(0,229,195,0.2)',borderRadius:14,padding:'16px 20px',marginBottom:20}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--accent)',letterSpacing:'1.5px',marginBottom:14}}>💼 RESULTADO OPERACIONAL</div>
                    {[
                      { label:'Receita bruta (confirmada)', val: confirmed, color:'#4cffb0', sign:'+' },
                      hasCost
                        ? { label:'(-) CMV — custo das mercadorias vendidas', val: cogs, color:'#ff5050', sign:'-', sub: totalImportCost>0?'✓ Custo/vial reflete importações — veja breakdown abaixo':null }
                        : { label:'(-) Custo de importações (total lotes)', val: totalImportCost, color:'#ff5050', sign:'-', sub: totalImportCost===0?'Nenhuma importação registrada ainda':null },
                      { label:'(-) Frete de envio (ME)', val: totalFreteEnvio, color:'#ffa040', sign:'-', sub: totalFreteEnvio===0?'Será registrado ao gerar etiquetas':null },
                      { label:'(-) Frete absorvido — PIX', val: totalFretePixAbsorvido, color:'#ffa040', sign:'-', sub: pixOrdsConfirmed.length > 0 ? `${pixOrdsConfirmed.length} pedido${pixOrdsConfirmed.length>1?'s':''} PIX × R$ ${FRETE_FIXO} (sem etiqueta ME gerada)` : 'Nenhum pedido PIX confirmado ainda' },
                      { label:'(-) Taxas Mercado Pago', val: totalTaxasMP, color:'#ffa040', sign:'-', sub:'Estimado por tipo de pagamento' },
                      { label:'(-) Despesas manuais', val: totalDespManuais, color:'#ffa040', sign:'-', sub: despesas.length===0?'Nenhuma lançada ainda':null },
                    ].map((row,i)=>(
                      <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                        <div>
                          <span style={{fontSize:'0.8rem',color:'var(--text)'}}>{row.label}</span>
                          {row.sub && <span style={{display:'block',fontSize:'0.6rem',color:'var(--muted)',marginTop:1}}>{row.sub}</span>}
                        </div>
                        <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.8rem',color:row.val>0?row.color:'var(--muted)',fontWeight:700}}>
                          {row.val > 0 ? `${row.sign} R$${row.val.toLocaleString('pt-BR',{minimumFractionDigits:2})}` : '—'}
                        </span>
                      </div>
                    ))}
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'10px 0 0',marginTop:4}}>
                      <span style={{fontFamily:"'Syne',sans-serif",fontSize:'1rem',fontWeight:800,color:'var(--text)'}}>LUCRO OPERACIONAL</span>
                      <div style={{textAlign:'right'}}>
                        <span style={{fontFamily:"'Space Mono',monospace",fontSize:'1.1rem',fontWeight:700,color:lucroOperacional>=0?'#4cffb0':'#ff5050'}}>
                          R${lucroOperacional.toLocaleString('pt-BR',{minimumFractionDigits:2})}
                        </span>
                        <span style={{display:'block',fontSize:'0.68rem',color:lucroOperacional>=0?'#4cffb0':'#ff5050',fontFamily:"'Space Mono',monospace"}}>
                          {margemOperacional.toFixed(1)}% de margem
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── BREAKDOWN IMPORTAÇÕES ── */}
                  {importHistory.length > 0 && (
                    <div style={{marginBottom:20}}>
                      <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--muted)',letterSpacing:'1.5px',marginBottom:10}}>📦 IMPORTAÇÕES — CUSTO vs RECEITA RECUPERADA</div>
                      {importHistory.map(h => {
                        const prodCost = (parseFloat(h.totalOrderUsd)||0) * (parseFloat(h.cambio)||0);
                        const overhead = parseFloat(h.overheadBrl)||0;
                        const totalCusto = prodCost + overhead;
                        const st = h.status || 'aguardando';
                        const stColor = st==='entregue'?'#4ade80':st==='alfandega'?'#ff9f43':st==='em_transito'?'#78aaff':'#ffaa00';

                        // SKUs deste lote
                        const lotSkus = (h.items||[]).map(it=>(it.sku||'').toUpperCase()).filter(Boolean);
                        // Produtos do catálogo que batem com os SKUs deste lote
                        const lotProds = products.filter(p => lotSkus.includes((p.sku||'').toUpperCase()));
                        const lotProdIds = new Set(lotProds.map(p=>p.id));
                        // Receita das ordens confirmadas deste lote
                        const receitaLote = confirmedOrds.reduce((s,o) => {
                          const items = o._items && o._items.length ? o._items : [{peptideId:o.peptideId, qty:o.qty||1}];
                          return s + items.reduce((s2,it) => {
                            if (!lotProdIds.has(it.peptideId)) return s2;
                            const p = products.find(x=>x.id===it.peptideId);
                            return s2 + (p ? p.price*(it.qty||1) : 0);
                          }, 0);
                        }, 0);
                        const saldo = receitaLote - totalCusto;
                        const pct = totalCusto > 0 ? Math.round((receitaLote/totalCusto)*100) : 0;
                        const barW = Math.min(100, pct);

                        return (
                          <div key={h.id} style={{background:'rgba(255,255,255,0.02)',border:'1px solid var(--border)',borderRadius:10,padding:'12px 16px',marginBottom:8}}>
                            {/* Header */}
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                              <div style={{display:'flex',alignItems:'center',gap:8}}>
                                <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.65rem',color:'var(--accent)'}}>{h.date}</span>
                                <span style={{fontSize:'0.58rem',fontWeight:700,padding:'1px 7px',borderRadius:20,color:stColor,border:`1px solid ${stColor}`,background:`${stColor}18`,fontFamily:"'Space Mono',monospace"}}>{st}</span>
                              </div>
                              <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',fontWeight:700,color: saldo>=0?'#4cffb0':'#ff5050'}}>
                                {saldo>=0?'+':''}{saldo.toLocaleString('pt-BR',{minimumFractionDigits:2})}
                              </span>
                            </div>
                            {/* Barra de recuperação */}
                            <div style={{marginBottom:8}}>
                              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.6rem',fontFamily:"'Space Mono',monospace",marginBottom:3}}>
                                <span style={{color:'var(--muted)'}}>Recuperado: <strong style={{color: pct>=100?'#4cffb0':'#ffaa00'}}>R$ {receitaLote.toLocaleString('pt-BR',{minimumFractionDigits:2})} ({pct}%)</strong></span>
                                <span style={{color:'#ff5050'}}>Custo: R$ {totalCusto.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                              </div>
                              <div style={{height:6,borderRadius:4,background:'rgba(255,255,255,0.06)',overflow:'hidden'}}>
                                <div style={{height:'100%',width:`${barW}%`,borderRadius:4,background: pct>=100?'#4cffb0':'linear-gradient(90deg,#ffaa00,#ff8800)',transition:'width 0.4s'}} />
                              </div>
                            </div>
                            {/* SKUs */}
                            <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                              {(h.items||[]).map((it,i)=>(
                                <span key={i} style={{fontSize:'0.62rem',fontFamily:"'Space Mono',monospace",background:'rgba(0,229,195,0.06)',border:'1px solid rgba(0,229,195,0.15)',borderRadius:4,padding:'2px 7px',color:'var(--muted)'}}>
                                  {it.sku} ×{it.vials||((it.boxes||0)*10)} vials
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      <div style={{display:'flex',justifyContent:'space-between',paddingTop:8,borderTop:'1px solid var(--border)'}}>
                        <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'#ff5050',fontWeight:700}}>Total investido: R$ {totalImportCost.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                        <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color: confirmed>=totalImportCost?'#4cffb0':'#ffaa00',fontWeight:700}}>
                          Recuperado: {totalImportCost>0?Math.round((confirmed/totalImportCost)*100):0}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ── DESPESAS MANUAIS ── */}
                  <div style={{marginBottom:20}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--muted)',letterSpacing:'1.5px',marginBottom:10}}>📌 LANÇAR DESPESA</div>
                    <div className="nva-wrapgrid" style={{display:'grid',gridTemplateColumns:'1fr 110px 130px 90px auto',gap:8,alignItems:'flex-end',marginBottom:8}}>
                      <div>
                        <div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:3}}>Descrição</div>
                        <input style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'7px 10px',color:'var(--text)',fontSize:'0.8rem',width:'100%'}}
                          placeholder="ex: Embalagem bubble wrap"
                          value={despesaForm.desc} onChange={e=>setDespesaForm(f=>({...f,desc:e.target.value}))} />
                      </div>
                      <div>
                        <div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:3}}>Valor (R$)</div>
                        <input style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'7px 10px',color:'var(--text)',fontSize:'0.8rem',width:'100%'}} type="number" min="0" placeholder="0.00"
                          value={despesaForm.valor} onChange={e=>setDespesaForm(f=>({...f,valor:e.target.value}))} />
                      </div>
                      <div>
                        <div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:3}}>Categoria</div>
                        <select style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'7px 10px',color:'var(--text)',fontSize:'0.8rem',width:'100%'}}
                          value={despesaForm.categoria} onChange={e=>setDespesaForm(f=>({...f,categoria:e.target.value}))}>
                          {Object.entries(DESP_CATS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:3}}>Data</div>
                        <input style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'7px 10px',color:'var(--text)',fontSize:'0.8rem',width:'100%'}}
                          value={despesaForm.data} onChange={e=>setDespesaForm(f=>({...f,data:e.target.value}))} />
                      </div>
                      <button onClick={addDespesa} style={{padding:'7px 16px',background:'var(--accent)',border:'none',borderRadius:6,color:'#000',fontWeight:700,fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Space Mono',monospace",whiteSpace:'nowrap'}}>
                        + Adicionar
                      </button>
                    </div>
                    {/* Lista de despesas manuais */}
                    {despesas.length > 0 && (
                      <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
                        {despesas.map(d=>(
                          <div key={d.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 14px',borderBottom:'1px solid rgba(255,255,255,0.03)',fontSize:'0.78rem'}}>
                            <div style={{display:'flex',alignItems:'center',gap:10,flex:1,minWidth:0}}>
                              <span style={{fontSize:'0.72rem'}}>{DESP_CATS[d.categoria]||'📌'}</span>
                              <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.desc}</span>
                              <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.62rem',color:'var(--muted)',flexShrink:0}}>{d.data}</span>
                            </div>
                            <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0,marginLeft:12}}>
                              <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.78rem',color:'#ff5050',fontWeight:700}}>R${parseFloat(d.valor).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                              <button onClick={()=>removeDespesa(d.id)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.85rem',padding:0}}>✕</button>
                            </div>
                          </div>
                        ))}
                        <div style={{padding:'8px 14px',background:'rgba(255,80,80,0.04)',display:'flex',justifyContent:'space-between',fontSize:'0.72rem',fontFamily:"'Space Mono',monospace"}}>
                          <span style={{color:'var(--muted)'}}>Total despesas manuais</span>
                          <span style={{color:'#ff5050',fontWeight:700}}>R${totalDespManuais.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                        </div>
                      </div>
                    )}
                    {/* Perdas por apreensão alfandegária */}
                    {apreendidasList.length > 0 && (
                      <div style={{marginTop:10,padding:'10px 14px',background:'rgba(255,80,80,0.06)',border:'1px solid rgba(255,80,80,0.25)',borderRadius:10}}>
                        <div style={{fontSize:'0.6rem',color:'#ff5050',fontFamily:"'Space Mono',monospace",letterSpacing:'1.5px',marginBottom:8}}>🛃 PERDAS POR APREENSÃO — {apreendidasList.length} importaç{apreendidasList.length!==1?'ões':'ão'}</div>
                        {apreendidasList.map(h => {
                          const custo = importCustoH(h);
                          return (
                            <div key={h.id} style={{display:'flex',justifyContent:'space-between',fontSize:'0.7rem',fontFamily:"'Space Mono',monospace",marginBottom:3}}>
                              <span style={{color:'var(--muted)'}}>{h.label||h.date} · {h.date}</span>
                              <span style={{color:'#ff5050',fontWeight:700}}>R${Math.round(custo).toLocaleString('pt-BR')}</span>
                            </div>
                          );
                        })}
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.75rem',fontFamily:"'Space Mono',monospace",marginTop:6,paddingTop:6,borderTop:'1px solid rgba(255,80,80,0.2)'}}>
                          <span style={{color:'var(--muted)'}}>Total apreendido (100% prejuízo)</span>
                          <span style={{color:'#ff5050',fontWeight:700}}>R${Math.round(perdaApreensao).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    )}
                    {/* Perdas por extravio */}
                    {extraviadoOrds.length > 0 && (
                      <div style={{marginTop:10,padding:'10px 14px',background:'rgba(255,80,80,0.06)',border:'1px solid rgba(255,80,80,0.25)',borderRadius:10}}>
                        <div style={{fontSize:'0.6rem',color:'#ff5050',fontFamily:"'Space Mono',monospace",letterSpacing:'1.5px',marginBottom:6}}>⚠️ PERDAS POR EXTRAVIO — {extraviadoOrds.length} pedido{extraviadoOrds.length!==1?'s':''}</div>
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.72rem',fontFamily:"'Space Mono',monospace"}}>
                          <span style={{color:'var(--muted)'}}>Faturamento perdido</span>
                          <span style={{color:'#ff8080'}}>R${perdaExtravioRevenue.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                        </div>
                        {hasCost && perdaExtravioCogs > 0 && (
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.72rem',fontFamily:"'Space Mono',monospace",marginTop:3}}>
                            <span style={{color:'var(--muted)'}}>CMV (vials perdidos)</span>
                            <span style={{color:'#ff5050',fontWeight:700}}>R${perdaExtravioCogs.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Fretes ME registrados */}
                    {Object.keys(shippingCosts).length > 0 && (
                      <div style={{marginTop:10}}>
                        <div style={{fontSize:'0.6rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace",marginBottom:6}}>📦 FRETES ME GERADOS — R${totalFreteEnvio.toLocaleString('pt-BR',{minimumFractionDigits:2})} total</div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                          {Object.values(shippingCosts).map((s,i)=>(
                            <span key={i} style={{fontSize:'0.65rem',fontFamily:"'Space Mono',monospace",background:'rgba(255,160,64,0.07)',border:'1px solid rgba(255,160,64,0.2)',borderRadius:6,padding:'3px 8px',color:'var(--muted)'}}>
                              {s.date} · {s.carrier} · R${s.cost.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cards principais */}
                  <div className="fin-cards">
                    <div className="fin-card green">
                      <div className="fin-card-label">Faturamento Confirmado</div>
                      <div className="fin-card-value">{fmt(confirmed)}</div>
                      <div className="fin-card-sub">Pago + Enviado + Entregue</div>
                    </div>
                    <div className="fin-card yellow">
                      <div className="fin-card-label">Em Aberto</div>
                      <div className="fin-card-value">{fmt(pending)}</div>
                      <div className="fin-card-sub">{ordsByStatus('pendente').length} pedido{ordsByStatus('pendente').length!==1?'s':''} pendente{ordsByStatus('pendente').length!==1?'s':''}</div>
                    </div>
                    {hasCost ? <>
                      <div className="fin-card" style={{borderColor:'rgba(76,255,176,0.3)',background:'rgba(76,255,176,0.04)'}}>
                        <div className="fin-card-label">Lucro Líquido</div>
                        <div className="fin-card-value" style={{color:lucroLiq>=0?'#4cffb0':'#ff5050'}}>{fmt(Math.round(lucroLiq))}</div>
                        <div className="fin-card-sub">CMV: {fmt(Math.round(cogs))}</div>
                      </div>
                      <div className="fin-card" style={{borderColor:'rgba(255,150,0,0.3)',background:'rgba(255,150,0,0.04)'}}>
                        <div className="fin-card-label">Margem Média</div>
                        <div className="fin-card-value" style={{color:'#ff9600'}}>{margemMedia}%</div>
                        <div className="fin-card-sub">Sobre faturamento confirmado</div>
                      </div>
                    </> : <>
                      <div className="fin-card purple">
                        <div className="fin-card-label">Projeção Pré-Orders</div>
                        <div className="fin-card-value">{fmt(preorderProj)}</div>
                        <div className="fin-card-sub">{preorders.length} reserva{preorders.length!==1?'s':''} em fila</div>
                      </div>
                      <div className="fin-card blue">
                        <div className="fin-card-label">Ticket Médio</div>
                        <div className="fin-card-value">{fmt(ticket)}</div>
                        <div className="fin-card-sub">{totalOrds} pedido{totalOrds!==1?'s':''} no total</div>
                      </div>
                    </>}
                  </div>

                  {/* Segunda linha quando há dados de custo */}
                  {hasCost && <div className="fin-cards" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
                    <div className="fin-card purple">
                      <div className="fin-card-label">Projeção Pré-Orders</div>
                      <div className="fin-card-value">{fmt(preorderProj)}</div>
                      <div className="fin-card-sub">{preorders.length} reserva{preorders.length!==1?'s':''} em fila</div>
                    </div>
                    <div className="fin-card blue">
                      <div className="fin-card-label">Ticket Médio</div>
                      <div className="fin-card-value">{fmt(ticket)}</div>
                      <div className="fin-card-sub">{totalOrds} pedido{totalOrds!==1?'s':''} no total</div>
                    </div>
                    <div className="fin-card" style={{borderColor:'rgba(0,200,100,0.3)',background:'rgba(0,200,100,0.04)'}}>
                      <div className="fin-card-label">Estoque em Caixa</div>
                      <div className="fin-card-value" style={{color:'#00c864'}}>{fmt(Math.round(estoqueVendaTotal))}</div>
                      <div className="fin-card-sub" style={{lineHeight:1.6}}>
                        <span style={{color:'#ff7070'}}>Custo: {fmt(Math.round(estoqueValorizado))}</span><br/>
                        <span style={{color:'#4cffb0'}}>Lucro latente: {fmt(Math.round(estoqueLucroLatente))}</span>
                      </div>
                    </div>
                  </div>}

                  {/* Estoque em Trânsito */}
                  {transitList.length > 0 && (
                    <div className="fin-section">
                      <div className="fin-section-title">📦 Estoque em Trânsito (chegando)</div>
                      <div style={{padding:'16px 20px',background:'rgba(255,170,0,0.04)',border:'1px solid rgba(255,170,0,0.25)',borderRadius:12}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:14,paddingBottom:12,borderBottom:'1px solid rgba(255,170,0,0.15)'}}>
                          <div>
                            <div style={{fontSize:'0.62rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace",letterSpacing:'1.5px',marginBottom:4}}>FATURAMENTO ESTIMADO TOTAL</div>
                            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.6rem',fontWeight:800,color:'#ffc107'}}>{fmt(Math.round(transitTotalRev))}</div>
                          </div>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontSize:'0.62rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace",letterSpacing:'1.5px',marginBottom:4}}>VIALS</div>
                            <div style={{fontFamily:"'Space Mono',monospace",fontSize:'1.2rem',fontWeight:700,color:'var(--text)'}}>{transitTotalVials.toLocaleString('pt-BR')}</div>
                          </div>
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:6}}>
                          {transitList.map(t => (
                            <div key={t.sku} style={{display:'grid',gridTemplateColumns:'auto 1fr auto auto',alignItems:'center',gap:12,fontSize:'0.78rem'}}>
                              <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.65rem',background:'rgba(255,170,0,0.1)',border:'1px solid rgba(255,170,0,0.25)',borderRadius:4,padding:'2px 7px',color:'#ffc107'}}>{t.sku}</span>
                              <span style={{color:'var(--text)'}}>{t.name}</span>
                              <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'var(--accent)'}}>×{t.vials}</span>
                              <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.78rem',fontWeight:700,color:'#4cffb0',minWidth:90,textAlign:'right'}}>{fmt(Math.round(t.rev))}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Por Status */}
                  <div className="fin-section">
                    <div className="fin-section-title">Por Status</div>
                    <div className="fin-status-grid">
                      {[{status:'pendente',emoji:'🟡',label:'Pendente'},{status:'pago',emoji:'✅',label:'Pago'},{status:'enviado',emoji:'📦',label:'Enviado'},{status:'entregue',emoji:'🎉',label:'Entregue'},{status:'extraviado',emoji:'⚠️',label:'Extraviado'}].map(({status,emoji,label})=>{
                        const isExtravio = status === 'extraviado';
                        return (
                        <div className="fin-status-card" key={status} style={isExtravio?{borderColor:'rgba(255,80,80,0.35)',background:'rgba(255,80,80,0.04)'}:{}}>
                          <div className="fin-status-emoji">{emoji}</div>
                          <div className="fin-status-label" style={isExtravio?{color:'#ff5050'}:{}}>{label}</div>
                          <div className="fin-status-count">{ordsByStatus(status).length}</div>
                          <div className="fin-status-revenue" style={isExtravio?{color:'#ff5050'}:{}}>{fmt(revByStatus(status))}</div>
                          {isExtravio && hasCost && perdaExtravioCogs > 0 && <div style={{fontSize:'0.62rem',color:'#ff8080',marginTop:4,fontFamily:"'Space Mono',monospace"}}>Perda CMV: {fmt(Math.round(perdaExtravioCogs))}</div>}
                        </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lucratividade por Produto — só aparece quando há _custoVial */}
                  {hasCost && prodLucList.length > 0 && (
                    <div className="fin-section">
                      <div className="fin-section-title">Lucratividade por Produto</div>
                      {prodLucList.map(p=>{
                        const lucro = p.rev - p.cogs;
                        const margem = p.rev > 0 && p.cogs > 0 ? Math.round((lucro/p.rev)*100) : null;
                        return (
                          <div className="fin-luc-row" key={p.name}>
                            <div className="fin-luc-name">{p.name}</div>
                            <div className="fin-luc-qty">×{p.qty}</div>
                            <div className="fin-luc-rev">{fmt(Math.round(p.rev))}</div>
                            {p.custo > 0 ? <>
                              <div className="fin-luc-custo">CMV {fmt(Math.round(p.cogs))}</div>
                              <div className="fin-luc-lucro" style={{color:lucro>=0?'#4cffb0':'#ff5050'}}>{fmt(Math.round(lucro))}</div>
                              <div className="fin-luc-margem" style={{color:margem>=30?'#4cffb0':margem>=15?'#ffc107':'#ff5050'}}>{margem}%</div>
                            </> : <div className="fin-luc-no-cost">custo não definido</div>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Ranking de Produtos */}
                  <div className="fin-section">
                    <div className="fin-section-title">Ranking de Produtos</div>
                    {allRankList.length === 0
                      ? <div style={{color:"var(--muted)",fontSize:"0.85rem"}}>Nenhum pedido ainda</div>
                      : allRankList.map(([name,rev],i)=>(
                        <div className="fin-rank-row" key={name}>
                          <div className="fin-rank-pos">#{i+1}</div>
                          <div className="fin-rank-name">{name}</div>
                          <div className="fin-rank-bar-wrap"><div className="fin-rank-bar" style={{width:`${(rev/allMaxRev)*100}%`}} /></div>
                          <div className="fin-rank-qty">×{allProdQty[name]}</div>
                          <div className="fin-rank-rev">{fmt(rev)}</div>
                        </div>
                      ))
                    }
                  </div>

                  {/* Taxa de Conversão Pré-Orders */}
                  <div className="fin-section">
                    <div className="fin-section-title">Taxa de Conversão — Pré-Orders</div>
                    <div style={{padding:'16px 20px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:20}}>
                        <div style={{flex:1}}>
                          <div style={{height:8,background:'rgba(255,255,255,0.06)',borderRadius:4,overflow:'hidden'}}>
                            <div style={{height:'100%',width:`${taxaConversao}%`,background:'linear-gradient(90deg,var(--accent),#00ffd6)',borderRadius:4,transition:'width 0.6s ease'}} />
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:'0.72rem',color:'var(--muted)'}}>
                            <span>✅ {poConcluidas} convertidas</span>
                            <span>⏳ {poTotal - poConcluidas} abertas/expiradas</span>
                          </div>
                        </div>
                        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'2rem',fontWeight:800,color:'var(--accent)',minWidth:70,textAlign:'right'}}>{taxaConversao}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Projeção Pré-Orders por Produto */}
                  <div className="fin-section">
                    <div className="fin-section-title">Projeção Pré-Orders por Produto</div>
                    {Object.keys(poByProd).length === 0
                      ? <div style={{color:"var(--muted)",fontSize:"0.85rem"}}>Nenhuma reserva ainda</div>
                      : Object.entries(poByProd).sort((a,b)=>b[1].proj-a[1].proj).map(([name,{qty,proj}])=>(
                        <div className="fin-preorder-row" key={name}>
                          <div className="fin-preorder-name">{name}</div>
                          <div className="fin-preorder-qty">{qty} reserva{qty!==1?'s':''}</div>
                          <div className="fin-preorder-proj">{fmt(proj)}</div>
                        </div>
                      ))
                    }
                  </div>

                  {/* Últimos 7 Dias */}
                  <div className="fin-section">
                    <div className="fin-section-title">Últimos 7 Dias</div>
                    <div className="fin-trend-grid">
                      {trendData.map((d,i)=>(
                        <div className="fin-trend-day" key={i}>
                          <div className="fin-trend-val">{d.rev>0?`R$${(d.rev/1000).toFixed(1)}k`:'-'}</div>
                          <div className="fin-trend-bar-wrap">
                            <div className="fin-trend-bar-fill" style={{height:`${(d.rev/maxTrend)*100}%`}} />
                          </div>
                          <div className="fin-trend-label">{d.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}

            {/* TAB: IMPORTAÇÃO */}
            {adminTab==="importacao" && (()=>{
              const cambio       = parseFloat(importForm.cambio)       || 0;
              const freteUsd     = parseFloat(importForm.freteUsd)     || 0;
              const fedexBrl     = parseFloat(importForm.fedexBrl)     || 0;
              const desconto     = parseFloat(importForm.desconto)     || 0;
              const outrosBrl    = parseFloat(importForm.outrosBrl)    || 0;
              const invoiceTotal = parseFloat(importForm.invoiceTotal) || 0;
              const overheadBrl  = freteUsd * cambio + fedexBrl + outrosBrl;

              const validItems = importForm.items.map((it,i)=>({...it,_idx:i})).filter(it => it.sku && it.boxes && it.priceUsd);
              const totalOrderUsd = validItems.reduce((s,it) => s + (parseFloat(it.boxes)||0)*(parseFloat(it.priceUsd)||0)*(1 - desconto/100), 0);
              const totalOrderBrl = totalOrderUsd * cambio;
              const totalCustoCalculado = totalOrderBrl + overheadBrl;

              const calcs = validItems.map(it => {
                const boxes            = parseFloat(it.boxes)    || 0;
                const priceUsdOriginal = parseFloat(it.priceUsd) || 0;
                const priceUsd         = priceUsdOriginal * (1 - desconto / 100);
                const vials            = boxes * 10;
                const itemUsd          = boxes * priceUsd;
                const share            = totalOrderUsd > 0 ? itemUsd / totalOrderUsd : 0;
                // Breakdown detalhado por componente
                const custoUsdBrl  = vials > 0 ? (priceUsd / 10) * cambio : 0;
                const freteAloc    = vials > 0 ? (freteUsd * cambio * share) / vials : 0;
                const fedexAloc    = vials > 0 ? (fedexBrl * share) / vials : 0;
                const outrosAloc   = vials > 0 ? (outrosBrl * share) / vials : 0;
                const overAlloc    = overheadBrl * share;
                const custoVial    = custoUsdBrl + freteAloc + fedexAloc + outrosAloc;
                const custoLote    = custoVial * vials;
                const precoSugAuto = custoVial > 0 ? Math.ceil(custoVial / 0.20) : 0;
                const precoSug     = it.precoSugOverride ? parseInt(it.precoSugOverride) : precoSugAuto;
                // Cotação
                const precoVenda   = parseFloat(it.precoVenda) || precoSug || 0;
                const margemBruta  = precoVenda > 0 ? precoVenda - custoVial : null;
                const margem       = precoVenda > 0 && custoVial > 0 ? ((precoVenda - custoVial) / precoVenda) * 100 : null;
                const markup       = precoVenda > 0 && custoVial > 0 ? ((precoVenda - custoVial) / custoVial) * 100 : null;
                const statusCot    = margem === null ? null : margem >= 80 ? 'Excelente' : margem >= 60 ? 'Bom' : margem >= 40 ? 'Regular' : 'Baixo';
                const colorCot     = margem === null ? '#888' : margem >= 80 ? '#4cffb0' : margem >= 60 ? '#00e5c3' : margem >= 40 ? '#ffc107' : '#ff5050';
                // Simulador: quantos vials para quitar o lote
                const vialsParaQuitar = precoVenda > 0 && custoLote > 0 ? Math.ceil(custoLote / precoVenda) : null;
                return { ...it, vials, itemUsd, priceUsdOriginal, priceUsd, share, custoVial, custoUsdBrl, freteAloc, fedexAloc, outrosAloc, overAlloc, custoLote, precoSug, precoSugAuto, precoVenda, margemBruta, margem, markup, statusCot, colorCot, vialsParaQuitar };
              });

              function updateItem(idx, field, val) {
                const items = importForm.items.map((it,i) => {
                  if (i !== idx) return it;
                  const updated = { ...it, [field]: val };
                  if (field === 'sku') {
                    const cat = ADINA_CATALOG[val.toUpperCase()];
                    if (cat) {
                      updated.name = cat.name; updated.spec = cat.spec; updated.priceUsd = String(cat.priceUsd); updated.sku = val.toUpperCase();
                      // Match por SKU exato — evita colidir variantes que compartilham o mesmo base name (ex: RT15, RT20, RT50 todos "Retatrutide")
                      const existing = products.find(p => (p.sku || '').toUpperCase() === val.toUpperCase());
                      if (existing && existing.price) updated.precoSugOverride = String(existing.price);
                    }
                  }
                  return updated;
                });
                setImportForm(f => ({ ...f, items }));
              }

              function addItem() { setImportForm(f => ({ ...f, items: [...f.items, {sku:'',name:'',spec:'',boxes:'',priceUsd:'',precoSugOverride:'',precoVenda:''}] })); }
              function removeItem(idx) { setImportForm(f => ({ ...f, items: f.items.filter((_,i)=>i!==idx) })); }

              function applyPrices() {
                if (calcs.length === 0) { showToast('Nenhum item calculado','error'); return; }
                let updated = 0; let added = 0;
                // Match por SKU exato — cada variante (RT15, RT20, RT50...) tem seu próprio preço
                const isMatch = (p, c) => !!(p.sku && c.sku && p.sku.toUpperCase() === c.sku.toUpperCase());
                // Atualiza produtos existentes
                const newProducts = products.map(p => {
                  const match = calcs.find(c => c.sku && isMatch(p, c));
                  if (match) { updated++; return { ...p, price: match.precoSug, _custoVial: match.custoVial }; }
                  return p;
                });
                // Adiciona produtos novos que não existem no catálogo
                calcs.forEach(c => {
                  if (!c.sku || !c.precoSug) return;
                  const exists = products.find(p => isMatch(p, c));
                  if (!exists) {
                    added++;
                    newProducts.push({
                      id: 'imp-' + Date.now() + '-' + Math.random().toString(36).slice(2,6),
                      sku: c.sku,
                      name: `${c.name} ${c.spec || ''}`.trim(),
                      desc: c.spec || '',
                      price: c.precoSug,
                      _custoVial: c.custoVial,
                      category: 'emagrecedores',
                      stock: 0,
                      hot: false,
                      badge: null,
                      compounds: null,
                    });
                  }
                });
                persistProducts(newProducts);
                const parts = [];
                if (updated > 0) parts.push(`${updated} preço${updated!==1?'s':''} atualizado${updated!==1?'s':''}`);
                if (added > 0) parts.push(`${added} produto${added!==1?'s':''} novo${added!==1?'s':''} adicionado${added!==1?'s':''}`);
                showToast((parts.join(' · ') || 'Sem alterações') + ' no catálogo ✓', 'success');
              }

              function editImport(h) {
                setImportForm({
                  label: h.label || '',
                  date: h.date || '',
                  cambio: String(h.cambio || ''),
                  freteUsd: String(h.freteUsd || ''),
                  fedexBrl: String(h.fedexBrl || ''),
                  desconto: String(h.desconto || ''),
                  outrosBrl: String(h.outrosBrl || ''),
                  invoiceTotal: String(h.invoiceTotal || ''),
                  items: (h.items||[]).map(it => ({
                    sku: it.sku || '',
                    name: it.name || '',
                    spec: it.spec || '',
                    boxes: String(it.boxes || ''),
                    priceUsd: String(it.priceUsdOriginal || it.priceUsd || ''),
                    precoSugOverride: String(it.precoSug || ''),
                    precoVenda: String(it.precoVenda || it.precoSug || ''),
                  }))
                });
                setEditingImportId(h.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                showToast('Importação carregada para edição ✏️', 'success');
              }

              function cancelEdit() {
                setEditingImportId(null);
                setImportForm({ label:'', date: new Date().toLocaleDateString('pt-BR'), cambio:'', freteUsd:'', fedexBrl:'', desconto:'', outrosBrl:'', invoiceTotal:'', items:[{sku:'',name:'',spec:'',boxes:'',priceUsd:'',precoSugOverride:'',precoVenda:''}] });
              }

              const IMPORT_STATUS = {
                aguardando:  { label: '⏳ Aguardando',   color: '#ffaa00', next: 'em_transito' },
                em_transito: { label: '✈️ Em Trânsito',  color: '#78aaff', next: 'alfandega' },
                alfandega:   { label: '🛃 Alfândega',    color: '#ff9f43', next: 'entregue' },
                entregue:    { label: '✅ Entregue',      color: '#4ade80', next: null },
                apreendida:  { label: '⚠️ Apreendida',   color: '#ff5050', next: null },
              };
              function markImportApreendida(id) {
                const lote = importHistory.find(h => h.id === id);
                if (!lote) return;
                const custo = (parseFloat(lote.totalOrderUsd)||0) * (parseFloat(lote.cambio)||0) + (parseFloat(lote.overheadBrl)||0);
                if (!window.confirm(`Marcar importação "${lote.label||lote.date}" como APREENDIDA?\n\nIsso registra ~R$${Math.round(custo).toLocaleString('pt-BR')} como perda total (100% prejuízo).\nO estoque NÃO será atualizado.`)) return;
                updateImportStatus(id, 'apreendida');
              }
              function updateImportStatus(id, newStatus) {
                const hist = importHistory.map(h => h.id === id ? { ...h, status: newStatus } : h);
                setImportHistory(hist);
                localStorage.setItem('vg-imports', JSON.stringify(hist));
                const updated = hist.find(h => h.id === id);
                if (sb && updated) sb.from('import_history').update({ status: newStatus, data: updated }).eq('id', String(id)).then(({error})=>{ if(error) console.warn('[Supabase] Import status:', error.message); });

                if (newStatus === 'entregue') {
                  const lote = importHistory.find(h => h.id === id);
                  if (lote) {
                    // Adicionar vials ao estoque
                    const newStock = { ...stock };
                    const addedItems = [];
                    (lote.items || []).forEach(it => {
                      const sku = (it.sku || '').toUpperCase();
                      const vials = parseInt(it.vials) || (parseInt(it.boxes) || 0) * 10;
                      if (!vials) return;
                      const prod = products.find(p => (p.sku || '').toUpperCase() === sku);
                      if (!prod) return;
                      newStock[prod.id] = (newStock[prod.id] || 0) + vials;
                      addedItems.push({ name: prod.name, vials });
                    });
                    persistStock(newStock);

                    // Registrar rastreabilidade do lote
                    let lots; try { lots = JSON.parse(localStorage.getItem('vg-stock-lots') || '{}'); } catch { lots = {}; }
                    (lote.items || []).forEach(it => {
                      const sku = (it.sku || '').toUpperCase();
                      const vials = parseInt(it.vials) || (parseInt(it.boxes) || 0) * 10;
                      if (!vials) return;
                      const prod = products.find(p => (p.sku || '').toUpperCase() === sku);
                      if (!prod) return;
                      if (!lots[prod.id]) lots[prod.id] = [];
                      lots[prod.id].push({ lotId: id, date: lote.date, qty: vials });
                    });
                    localStorage.setItem('vg-stock-lots', JSON.stringify(lots));
                    setStockLots(lots);

                    if (addedItems.length) {
                      showToast(`✅ Estoque atualizado: ${addedItems.map(x=>`${x.name} +${x.vials}`).join(', ')}`, 'success');
                    } else {
                      showToast('Status: Entregue — nenhum SKU encontrado no catálogo para dar entrada automática', 'info');
                    }
                  }
                } else {
                  showToast(`Status: ${IMPORT_STATUS[newStatus]?.label || newStatus}`);
                }
              }
              function saveImport() {
                if (calcs.length === 0) { showToast('Preencha SKU, caixas e preço USD de pelo menos um produto','error'); return; }
                const isEditing = !!editingImportId;
                const existingStatus = isEditing ? (importHistory.find(h => h.id === editingImportId)?.status || 'aguardando') : 'aguardando';
                const entry = {
                  id: editingImportId || Date.now(),
                  label: (importForm.label || '').trim(),
                  date: importForm.date, cambio, freteUsd, fedexBrl, desconto, outrosBrl, invoiceTotal,
                  overheadBrl, totalOrderUsd,
                  status: existingStatus,
                  items: calcs
                };
                let hist;
                if (isEditing) {
                  hist = importHistory.map(h => h.id === editingImportId ? entry : h);
                } else {
                  hist = [entry, ...importHistory].slice(0, 20);
                }
                setImportHistory(hist);
                localStorage.setItem('vg-imports', JSON.stringify(hist));
                if (sb) sb.from('import_history').upsert({ id: String(entry.id), data: entry, status: entry.status||'aguardando' }, { onConflict: 'id' }).then(({error})=>{ if(error) console.warn('[Supabase] Import save:', error.message); });
                setEditingImportId(null);
                if (!isEditing) {
                  setImportForm({ label:'', date: new Date().toLocaleDateString('pt-BR'), cambio: importForm.cambio, freteUsd:'', fedexBrl:'', desconto:'', outrosBrl:'', invoiceTotal:'', items:[{sku:'',name:'',spec:'',boxes:'',priceUsd:'',precoSugOverride:'',precoVenda:''}] });
                }
                showToast(isEditing ? 'Importação atualizada ✓' : 'Importação salva ✓', 'success');
                setTimeout(()=>{ document.querySelector('.admin-content')?.scrollTo({ top: 99999, behavior: 'smooth' }); }, 100);
              }

              const inputStyle = { background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:6, padding:'7px 10px', color:'var(--text)', fontSize:'0.8rem', fontFamily:"'DM Sans',sans-serif", width:'100%' };
              const labelStyle = { fontSize:'0.65rem', color:'var(--muted)', marginBottom:3, display:'block' };

              return <>
                {/* BANNER: modo edição */}
                {editingImportId && (
                  <div style={{background:'rgba(255,193,7,0.1)',border:'1px solid rgba(255,193,7,0.4)',borderRadius:10,padding:'10px 16px',marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{fontSize:'0.78rem',color:'#ffc107',fontFamily:"'Space Mono',monospace"}}>✏️ Editando importação salva — alterações sobrescreverão o registro original</span>
                    <button onClick={cancelEdit} style={{background:'none',border:'1px solid rgba(255,193,7,0.4)',borderRadius:6,color:'#ffc107',cursor:'pointer',fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",padding:'4px 10px'}}>✕ Cancelar</button>
                  </div>
                )}

                {/* PARÂMETROS */}
                <div style={{background:'rgba(0,229,195,0.04)',border:'1px solid rgba(0,229,195,0.15)',borderRadius:12,padding:'14px 16px',marginBottom:14}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px',marginBottom:12}}>📋 PARÂMETROS DA IMPORTAÇÃO</div>
                  <div style={{marginBottom:10}}>
                    <label style={labelStyle}>Nome da importação <span style={{opacity:0.5}}>(opcional)</span></label>
                    <input style={inputStyle} placeholder="ex: Compra com a Molly" value={importForm.label||''} onChange={e=>setImportForm(f=>({...f,label:e.target.value}))} />
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr',gap:10}}>
                    <div><label style={labelStyle}>Data</label><input style={inputStyle} value={importForm.date} onChange={e=>setImportForm(f=>({...f,date:e.target.value}))} /></div>
                    <div>
                      <label style={labelStyle}>
                        Câmbio (R$/USD)
                        {cambioInfo.hora && <span style={{marginLeft:6,color:'var(--accent)',fontSize:'0.58rem'}}>✓ {cambioInfo.hora}</span>}
                        {cambioInfo.error && <span style={{marginLeft:6,color:'#ff5050',fontSize:'0.58rem'}}>{cambioInfo.error}</span>}
                      </label>
                      <div style={{display:'flex',gap:5}}>
                        <input style={{...inputStyle,flex:1}} type="number" placeholder="5.80" value={importForm.cambio} onChange={e=>setImportForm(f=>({...f,cambio:e.target.value}))} />
                        <button onClick={fetchCambio} disabled={cambioInfo.loading} title="Atualizar câmbio" style={{background:'rgba(0,229,195,0.1)',border:'1px solid rgba(0,229,195,0.3)',borderRadius:6,color:'var(--accent)',cursor:'pointer',padding:'0 8px',fontSize:'0.8rem',flexShrink:0}}>
                          {cambioInfo.loading ? '⏳' : '🔄'}
                        </button>
                      </div>
                    </div>
                    <div><label style={labelStyle}>Frete USD</label><input style={inputStyle} type="number" placeholder="0.00" value={importForm.freteUsd} onChange={e=>setImportForm(f=>({...f,freteUsd:e.target.value}))} /></div>
                    <div><label style={labelStyle}>Taxa FedEx (R$)</label><input style={inputStyle} type="number" placeholder="0.00" value={importForm.fedexBrl} onChange={e=>setImportForm(f=>({...f,fedexBrl:e.target.value}))} /></div>
                    <div>
                      <label style={labelStyle}>Desconto Fornecedor %</label>
                      <div style={{display:'flex',alignItems:'center',gap:5}}>
                        <input style={{...inputStyle,flex:1}} type="number" min="0" max="100" placeholder="0" value={importForm.desconto} onChange={e=>setImportForm(f=>({...f,desconto:e.target.value}))} />
                        <span style={{fontSize:'0.75rem',color:'var(--muted)',flexShrink:0}}>%</span>
                      </div>
                      {desconto > 0 && <div style={{fontSize:'0.6rem',color:'#4cffb0',marginTop:3}}>-{desconto}% aplicado</div>}
                    </div>
                  </div>
                  {/* Segunda linha: outros custos + valor real */}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginTop:10}}>
                    <div>
                      <label style={labelStyle}>Outros custos (R$) <span style={{color:'var(--muted)',fontSize:'0.58rem'}}>embalagem, taxas, etc.</span></label>
                      <input style={inputStyle} type="number" placeholder="0.00" value={importForm.outrosBrl} onChange={e=>setImportForm(f=>({...f,outrosBrl:e.target.value}))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Valor real pago (R$) <span style={{color:'var(--muted)',fontSize:'0.58rem'}}>invoice/boleto</span></label>
                      <input style={inputStyle} type="number" placeholder="0.00" value={importForm.invoiceTotal} onChange={e=>setImportForm(f=>({...f,invoiceTotal:e.target.value}))} />
                    </div>
                    <div style={{display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
                      {(() => {
                        if (!invoiceTotal || !totalCustoCalculado) return null;
                        const diff = invoiceTotal - totalCustoCalculado;
                        const ok = Math.abs(diff) < totalCustoCalculado * 0.02;
                        return (
                          <div style={{background: ok ? 'rgba(76,255,176,0.07)' : 'rgba(255,80,80,0.07)', border: `1px solid ${ok?'rgba(76,255,176,0.3)':'rgba(255,80,80,0.3)'}`, borderRadius:8, padding:'8px 12px'}}>
                            <div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:4,fontFamily:"'Space Mono',monospace"}}>RECONCILIAÇÃO</div>
                            <div style={{fontSize:'0.72rem',fontFamily:"'Space Mono',monospace"}}>
                              <span style={{color:'var(--muted)'}}>Calc: </span><span style={{color:'var(--text)'}}>R${totalCustoCalculado.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                              <span style={{color:'var(--muted)',margin:'0 6px'}}>|</span>
                              <span style={{color:'var(--muted)'}}>Real: </span><span style={{color:'var(--text)'}}>R${invoiceTotal.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                            </div>
                            <div style={{fontSize:'0.72rem',fontFamily:"'Space Mono',monospace",marginTop:3,color:ok?'#4cffb0':diff>0?'#ff5050':'#ffc107'}}>
                              {ok ? '✓ Bate!' : diff > 0 ? `▲ Diferença de R$${diff.toLocaleString('pt-BR',{minimumFractionDigits:2})} a mais` : `▼ Diferença de R$${Math.abs(diff).toLocaleString('pt-BR',{minimumFractionDigits:2})} a menos`}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  {/* Sumário overhead */}
                  {overheadBrl > 0 && (
                    <div style={{marginTop:10,fontSize:'0.72rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace",borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:8}}>
                      Custo total calculado: <span style={{color:'var(--accent)',fontWeight:700}}>R$ {totalCustoCalculado.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                      {totalOrderUsd > 0 && <> = Produtos USD {totalOrderUsd.toLocaleString('en-US',{minimumFractionDigits:2})} × {cambio}</>}
                      {overheadBrl > 0 && <> + Overhead R${overheadBrl.toLocaleString('pt-BR',{minimumFractionDigits:2})}</>}
                      {desconto > 0 && <> · <span style={{color:'#4cffb0'}}>Desc. {desconto}%</span></>}
                    </div>
                  )}
                </div>

                {/* ITENS */}
                <div className="nva-scrollx" style={{marginBottom:14}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px',marginBottom:10}}>📦 PRODUTOS DO PEDIDO</div>
                  <div style={{display:'grid',gridTemplateColumns:'90px 1fr 60px 70px 80px 90px 90px 32px',gap:6,marginBottom:6,paddingBottom:6,borderBottom:'1px solid var(--border)'}}>
                    {['SKU','Nome','Spec','Caixas','$/cx','Custo/vial','Preço sug.',''].map((h,i)=>(
                      <div key={i} style={{fontSize:'0.6rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace"}}>{h}</div>
                    ))}
                  </div>
                  {importForm.items.map((it,idx) => {
                    const calc = calcs.find(c=>c._idx===idx);
                    return (
                      <div key={idx}>
                        <div style={{display:'grid',gridTemplateColumns:'90px 1fr 60px 70px 80px 90px 90px 32px',gap:6,marginBottom:2,alignItems:'center'}}>
                          <input style={{...inputStyle,fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',textTransform:'uppercase'}} placeholder="RT15" value={it.sku}
                            onChange={e=>updateItem(idx,'sku',e.target.value)}
                            onBlur={e=>{ if(!ADINA_CATALOG[e.target.value.toUpperCase()]) return; updateItem(idx,'sku',e.target.value); }} />
                          <input style={{...inputStyle,fontSize:'0.75rem'}} placeholder="Nome auto" value={it.name} onChange={e=>updateItem(idx,'name',e.target.value)} />
                          <input style={{...inputStyle,fontSize:'0.72rem'}} placeholder="15mg" value={it.spec} onChange={e=>updateItem(idx,'spec',e.target.value)} />
                          <input style={{...inputStyle,textAlign:'center'}} type="number" min="1" placeholder="10" value={it.boxes} onChange={e=>updateItem(idx,'boxes',e.target.value)} />
                          <input style={{...inputStyle,textAlign:'right'}} type="number" placeholder="120" value={it.priceUsd} onChange={e=>updateItem(idx,'priceUsd',e.target.value)} />
                          <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'#aaa',textAlign:'right',paddingRight:4}}>
                            {calc ? `R$${calc.custoVial.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}` : '—'}
                          </div>
                          <input style={{...inputStyle,textAlign:'right',color:'var(--accent)',fontWeight:700,fontFamily:"'Space Mono',monospace",fontSize:'0.78rem'}} type="number" min="0"
                            placeholder={calc ? String(calc.precoSugAuto) : '—'}
                            value={it.precoSugOverride}
                            onChange={e=>updateItem(idx,'precoSugOverride',e.target.value)} />
                          <button onClick={()=>removeItem(idx)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.9rem',padding:0}}>✕</button>
                        </div>
                        {/* Breakdown de custo por produto */}
                        {calc && calc.custoVial > 0 && (
                          <div style={{gridColumn:'1/-1',marginBottom:8,paddingLeft:4,fontSize:'0.6rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace",display:'flex',gap:10,flexWrap:'wrap'}}>
                            <span>Produto: <span style={{color:'var(--text)'}}>R${calc.custoUsdBrl.toFixed(2)}</span></span>
                            {calc.freteAloc > 0 && <span>Frete: <span style={{color:'var(--text)'}}>R${calc.freteAloc.toFixed(2)}</span></span>}
                            {calc.fedexAloc > 0 && <span>FedEx: <span style={{color:'var(--text)'}}>R${calc.fedexAloc.toFixed(2)}</span></span>}
                            {calc.outrosAloc > 0 && <span>Outros: <span style={{color:'var(--text)'}}>R${calc.outrosAloc.toFixed(2)}</span></span>}
                            <span style={{color:'rgba(255,255,255,0.15)'}}>|</span>
                            <span>{calc.vials} vials · Custo lote: <span style={{color:'var(--accent)'}}>R${calc.custoLote.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button onClick={addItem} style={{marginTop:6,padding:'6px 14px',background:'none',border:'1px dashed var(--border)',borderRadius:8,color:'var(--muted)',fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>
                    ＋ Adicionar produto
                  </button>
                </div>

                {/* COTAÇÃO — ANÁLISE DE MARGEM */}
                {calcs.length > 0 && (
                  <div style={{background:'rgba(0,0,0,0.2)',border:'1px solid rgba(0,229,195,0.15)',borderRadius:12,padding:'14px 16px',marginBottom:14}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px',marginBottom:12}}>📊 COTAÇÃO — ANÁLISE DE MARGEM</div>
                    {/* Header */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 100px 110px 100px 80px 80px 90px',gap:8,marginBottom:6,paddingBottom:6,borderBottom:'1px solid var(--border)'}}>
                      {['Produto','Custo/Vial','Preço Venda','Mg. Bruta','Markup','Margem','Status'].map((h,i)=>(
                        <div key={i} style={{fontSize:'0.58rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace"}}>{h}</div>
                      ))}
                    </div>
                    {calcs.map((c,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 100px 110px 100px 80px 80px 90px',gap:8,marginBottom:6,alignItems:'center'}}>
                        <div style={{fontSize:'0.8rem',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name || c.sku}</div>
                        <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'var(--muted)'}}>R${c.custoVial.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                        <input
                          style={{...inputStyle,textAlign:'right',color:'#fff',fontFamily:"'Space Mono',monospace",fontSize:'0.78rem',padding:'5px 8px'}}
                          type="number" min="0" placeholder={String(c.precoSug)}
                          value={importForm.items[c._idx]?.precoVenda || ''}
                          onChange={e=>updateItem(c._idx,'precoVenda',e.target.value)} />
                        <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:c.margemBruta>0?'#4cffb0':'var(--muted)'}}>
                          {c.margemBruta !== null && c.precoVenda > 0 ? `R$${c.margemBruta.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}` : '—'}
                        </div>
                        <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:c.colorCot}}>
                          {c.markup !== null && c.precoVenda > 0 ? `${Math.round(c.markup)}%` : '—'}
                        </div>
                        <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:c.colorCot}}>
                          {c.margem !== null && c.precoVenda > 0 ? `${Math.round(c.margem)}%` : '—'}
                        </div>
                        <div style={{fontSize:'0.65rem',fontFamily:"'Space Mono',monospace",fontWeight:700,color:c.colorCot}}>
                          {c.statusCot || '—'}
                        </div>
                      </div>
                    ))}
                    {/* SIMULADOR */}
                    {calcs.some(c=>c.vialsParaQuitar) && (
                      <div style={{marginTop:14,paddingTop:12,borderTop:'1px solid rgba(255,255,255,0.07)'}}>
                        <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.58rem",color:'var(--muted)',letterSpacing:'1px',marginBottom:8}}>⚡ SIMULADOR — FATURAMENTO MÍNIMO PARA QUITAR O PEDIDO</div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 120px 120px 140px',gap:8,marginBottom:4}}>
                          {['Produto','Custo do Lote','Receita (vender tudo)','Vials para quitar'].map((h,i)=>(
                            <div key={i} style={{fontSize:'0.58rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace"}}>{h}</div>
                          ))}
                        </div>
                        {calcs.filter(c=>c.vials>0).map((c,i)=>(
                          <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 120px 120px 140px',gap:8,marginBottom:4,alignItems:'center'}}>
                            <div style={{fontSize:'0.75rem'}}>{c.name||c.sku}</div>
                            <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'var(--muted)'}}>R${c.custoLote.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>
                            <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'#4cffb0'}}>
                              {c.precoVenda > 0 ? `R$${(c.precoVenda*c.vials).toLocaleString('pt-BR',{minimumFractionDigits:2})}` : '—'}
                            </div>
                            <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'var(--accent)'}}>
                              {c.vialsParaQuitar ? `${c.vialsParaQuitar} de ${c.vials} vials` : '—'}
                            </div>
                          </div>
                        ))}
                        <div style={{marginTop:8,paddingTop:8,borderTop:'1px solid rgba(255,255,255,0.05)',fontFamily:"'Space Mono',monospace",fontSize:'0.7rem',display:'flex',gap:20,flexWrap:'wrap'}}>
                          <span style={{color:'var(--muted)'}}>Total custo lote: <span style={{color:'var(--accent)',fontWeight:700}}>R${calcs.reduce((s,c)=>s+c.custoLote,0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></span>
                          {calcs.some(c=>c.precoVenda>0) && <span style={{color:'var(--muted)'}}>Receita total (vender tudo): <span style={{color:'#4cffb0',fontWeight:700}}>R${calcs.reduce((s,c)=>s+(c.precoVenda>0?c.precoVenda*c.vials:0),0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></span>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AÇÕES */}
                <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
                  <button onClick={saveImport} style={{padding:'8px 18px',background:editingImportId?'rgba(255,193,7,0.15)':'rgba(0,229,195,0.1)',border:`1px solid ${editingImportId?'rgba(255,193,7,0.4)':'rgba(0,229,195,0.3)'}`,borderRadius:8,color:editingImportId?'#ffc107':'var(--accent)',fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Space Mono',monospace",fontWeight:700}}>
                    {editingImportId ? '💾 Atualizar importação' : '💾 Salvar importação'}
                  </button>
                  <button onClick={applyPrices} style={{padding:'8px 18px',background:'var(--accent)',border:'none',borderRadius:8,color:'#000',fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Space Mono',monospace",fontWeight:700}}>
                    ✅ Aplicar preços ao catálogo
                  </button>
                  {editingImportId && (
                    <button onClick={cancelEdit} style={{padding:'8px 18px',background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>
                      ✕ Novo pedido
                    </button>
                  )}
                </div>

                {/* HISTÓRICO */}
                {importHistory.length > 0 && (
                  <div>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--muted)',letterSpacing:'1.5px',marginBottom:8}}>📁 HISTÓRICO DE IMPORTAÇÕES</div>
                    {importHistory.map(h=>(
                      <div key={h.id} style={{padding:'10px 14px',background: editingImportId===h.id ? 'rgba(255,193,7,0.06)' : 'rgba(255,255,255,0.02)',border:`1px solid ${editingImportId===h.id?'rgba(255,193,7,0.4)':'var(--border)'}`,borderRadius:8,marginBottom:6,fontSize:'0.78rem'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                          <div style={{flex:1}}>
                            {h.label && <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:'0.82rem',fontWeight:600,color:'var(--text)',marginBottom:4}}>{h.label}</div>}
                            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                              <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.65rem',color:'var(--accent)'}}>{h.date}</span>
                              {(() => {
                                const st = h.status || 'aguardando';
                                const cfg = IMPORT_STATUS[st];
                                return (
                                  <span
                                    onClick={()=>{ if(cfg?.next) updateImportStatus(h.id, cfg.next); }}
                                    style={{fontFamily:"'Space Mono',monospace",fontSize:'0.55rem',fontWeight:700,padding:'2px 8px',borderRadius:20,color:cfg?.color,border:`1px solid ${cfg?.color}`,background:`${cfg?.color}18`,cursor:cfg?.next?'pointer':'default',whiteSpace:'nowrap',userSelect:'none',letterSpacing:'0.5px'}}
                                    title={cfg?.next ? `Avançar para: ${IMPORT_STATUS[cfg.next]?.label}` : 'Pedido entregue'}
                                  >{cfg?.label}{cfg?.next ? ' ›' : ''}</span>
                                );
                              })()}
                            </div>
                            <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--muted)'}}>
                              Câmbio: {h.cambio} · USD {h.totalOrderUsd?.toFixed(2)} · Overhead: R${h.overheadBrl?.toFixed(2)}
                              {h.invoiceTotal > 0 && <> · Invoice: R${parseFloat(h.invoiceTotal).toFixed(2)}</>}
                            </span>
                          </div>
                          <div style={{display:'flex',gap:6,flexShrink:0,marginLeft:10}}>
                            <button onClick={()=>editImport(h)} style={{background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:6,color:'var(--muted)',cursor:'pointer',fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",padding:'3px 10px'}}>
                              ✏️ Editar
                            </button>
                            {(h.status||'aguardando') === 'apreendida' ? (
                              <button onClick={()=>{ if(window.confirm('Reverter status para Em Trânsito?')) updateImportStatus(h.id, 'em_transito'); }} style={{background:'rgba(100,160,255,0.08)',border:'1px solid rgba(100,160,255,0.3)',borderRadius:6,color:'#78aaff',cursor:'pointer',fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",padding:'3px 10px'}}>
                                ↩️ Reverter
                              </button>
                            ) : (h.status||'aguardando') !== 'entregue' && (
                              <button onClick={()=>markImportApreendida(h.id)} style={{background:'rgba(255,80,80,0.07)',border:'1px solid rgba(255,80,80,0.3)',borderRadius:6,color:'#ff5050',cursor:'pointer',fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",padding:'3px 10px'}}>
                                ⚠️ Apreender
                              </button>
                            )}
                          </div>
                        </div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                          {(h.items||[]).map((it,i)=>{
                            const hasCot = it.precoVenda && it.margem != null;
                            const vials = parseInt(it.vials) || (parseInt(it.boxes)||0)*10;
                            return (
                              <span key={i} style={{fontSize:'0.65rem',fontFamily:"'Space Mono',monospace",background:'rgba(0,229,195,0.06)',border:'1px solid rgba(0,229,195,0.15)',borderRadius:4,padding:'2px 8px',color:'var(--muted)'}}>
                                {it.sku} <span style={{color:'var(--accent)'}}>×{vials}</span> · R${it.precoSug}
                                {hasCot && <span style={{color: it.margem>=80?'#4cffb0':it.margem>=60?'#00e5c3':it.margem>=40?'#ffc107':'#ff5050'}}> · {Math.round(it.margem)}%</span>}
                              </span>
                            );
                          })}
                        </div>
                        {(() => {
                          const st = h.status||'aguardando';
                          if (st === 'entregue') return null;
                          if (st === 'apreendida') {
                            const custo = (parseFloat(h.totalOrderUsd)||0)*(parseFloat(h.cambio)||0) + (parseFloat(h.overheadBrl)||0);
                            return <div style={{marginTop:6,fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",color:'#ff5050'}}>⚠️ Perda total (apreendida): R${Math.round(custo).toLocaleString('pt-BR')}</div>;
                          }
                          const estRev = (h.items||[]).reduce((s,it)=>{
                            const vials = parseInt(it.vials) || (parseInt(it.boxes)||0)*10;
                            const preco = parseFloat(it.precoVenda) || parseFloat(it.precoSug) || 0;
                            return s + vials*preco;
                          }, 0);
                          if (estRev <= 0) return null;
                          return (
                            <div style={{marginTop:6,fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",color:'#4cffb0'}}>
                              💰 Faturamento estimado: R${estRev.toLocaleString('pt-BR')}
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                )}
              </>;
            })()}

            {/* TAB: CLIENTES */}
            {adminTab==="clientes" && (()=>{
              function saveConfig() {
                const r = parseFloat(cfgRate); const d = parseFloat(cfgRedeem);
                if (isNaN(r)||r<=0||isNaN(d)||d<=0) { showToast('Valores inválidos','error'); return; }
                const cfg = { rate: r, redeem: d };
                setPointsConfig(cfg); localStorage.setItem('vg-points-config', JSON.stringify(cfg));
                // site_config.points_config: a loja e o create-order (que calcula o desconto) leem daqui
                if (sb) sb.from('site_config').upsert({ key: 'points_config', value: JSON.stringify(cfg) })
                  .then(({ error }) => showToast(error ? 'Salvo só neste navegador: ' + error.message : 'Configuração salva!', error ? 'error' : 'success'));
                else showToast('Configuração salva!', 'success');
              }

              async function saveAdjust() {
                const delta = parseInt(adjustDelta);
                if (isNaN(delta)) return;
                const newPts = Math.max(0, (adjustModal.points||0) + delta);
                if (sb) await sb.from('customers').update({ points: newPts }).eq('cpf', adjustModal.cpf);
                const upd = clientList.map(c=>c.cpf===adjustModal.cpf?{...c,points:newPts}:c);
                setClientList(upd); persistCustomers(upd);
                setAdjustModal(null); setAdjustDelta('');
                showToast('Pontos atualizados!', 'success');
              }

              return <>
                {/* Config de conversão */}
                <div style={{padding:'14px',background:'var(--bg2)',borderRadius:12,marginBottom:16,border:'1px solid var(--border)'}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--accent)',letterSpacing:'1.5px',marginBottom:10}}>⚙️ CONVERSÃO DE PONTOS</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                    <div>
                      <label style={{fontSize:'0.62rem',color:'var(--muted)',display:'block',marginBottom:3}}>Pontos por R$1 gasto</label>
                      <input type="number" step="0.1" min="0.1" style={{width:'100%',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:6,padding:'7px 10px',color:'var(--text)',fontSize:'0.82rem'}} value={cfgRate} onChange={e=>setCfgRate(e.target.value)} />
                      <div style={{fontSize:'0.6rem',color:'var(--muted)',marginTop:2}}>ex: 0.5 = 1 pt a cada R$2</div>
                    </div>
                    <div>
                      <label style={{fontSize:'0.62rem',color:'var(--muted)',display:'block',marginBottom:3}}>R$ por 100 pontos resgatados</label>
                      <input type="number" step="1" min="1" style={{width:'100%',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:6,padding:'7px 10px',color:'var(--text)',fontSize:'0.82rem'}} value={cfgRedeem} onChange={e=>setCfgRedeem(e.target.value)} />
                      <div style={{fontSize:'0.6rem',color:'var(--muted)',marginTop:2}}>ex: 3 = R$3 a cada 100 pts</div>
                    </div>
                  </div>
                  <div style={{fontSize:'0.7rem',color:'var(--muted)',marginBottom:8,padding:'8px',background:'rgba(0,229,195,0.04)',borderRadius:6,border:'1px solid rgba(0,229,195,0.1)'}}>
                    Com estas taxas: pedido de <strong style={{color:'var(--text)'}}>R$800</strong> gera <strong style={{color:'#ffc800'}}>{Math.floor(800*(parseFloat(cfgRate)||1))} pts</strong> → vale <strong style={{color:'#ffc800'}}>R$ {Math.floor(Math.floor(800*(parseFloat(cfgRate)||1))/100)*(parseFloat(cfgRedeem)||5)}</strong> de desconto futuro ({(Math.floor(Math.floor(800*(parseFloat(cfgRate)||1))/100)*(parseFloat(cfgRedeem)||5)/800*100).toFixed(1)}% de retorno)
                  </div>
                  <button onClick={saveConfig} style={{padding:'7px 18px',background:'var(--accent)',border:'none',borderRadius:8,color:'#000',fontWeight:700,fontSize:'0.75rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>SALVAR CONFIG</button>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.65rem',color:'var(--muted)'}}>{clientList.length} cliente{clientList.length!==1?'s':''} cadastrado{clientList.length!==1?'s':''}</div>
                  <button onClick={()=>{ if(sb) sb.from('customers').select('*').order('points',{ascending:false}).then(({data})=>{if(data){setClientList(data);persistCustomers(data);}}); }} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',fontSize:'0.7rem',padding:'4px 10px',fontFamily:"'Space Mono',monospace"}}>↻ Recarregar</button>
                </div>
                {clientList.length === 0
                  ? <div style={{textAlign:'center',color:'var(--muted)',padding:'40px 0',fontSize:'0.85rem'}}>Nenhum cliente ainda. Os clientes aparecem aqui quando um pedido é marcado como pago.</div>
                  : <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {clientList.map(c=>(
                        <div key={c.cpf} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'var(--bg2)',borderRadius:10,gap:12}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:600,fontSize:'0.85rem',marginBottom:2}}>{c.name||'—'}</div>
                            <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.65rem',color:'var(--muted)'}}>{c.cpf}</div>
                            {c.phone && <div style={{fontSize:'0.7rem',color:'var(--muted)'}}>{c.phone}</div>}
                          </div>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontFamily:"'Space Mono',monospace",fontWeight:700,color:'#ffc800',fontSize:'0.9rem'}}>⭐ {c.points||0} pts</div>
                            <div style={{fontSize:'0.65rem',color:'var(--muted)'}}>R$ {(c.total_spent||0).toLocaleString('pt-BR')} gasto</div>
                          </div>
                          <button onClick={()=>{ setAdjustModal(c); setAdjustDelta(''); }} style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',cursor:'pointer',fontSize:'0.7rem',padding:'4px 10px',whiteSpace:'nowrap'}}>✏️ Ajustar</button>
                        </div>
                      ))}
                    </div>
                }
                {adjustModal && (
                  <div className="modal-overlay" onClick={()=>setAdjustModal(null)}>
                    <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:360}}>
                      <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--accent)',letterSpacing:'1.5px',marginBottom:12}}>AJUSTAR PONTOS</div>
                      <div style={{marginBottom:12,fontSize:'0.82rem'}}><strong>{adjustModal.name||adjustModal.cpf}</strong> — saldo atual: <strong style={{color:'#ffc800'}}>{adjustModal.points||0} pts</strong></div>
                      <label style={{fontSize:'0.65rem',color:'var(--muted)',display:'block',marginBottom:4}}>Ajuste (+100 para adicionar, -50 para remover)</label>
                      <input type="number" style={{width:'100%',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:'var(--text)',fontSize:'0.85rem',marginBottom:12}} value={adjustDelta} onChange={e=>setAdjustDelta(e.target.value)} placeholder="ex: +200 ou -100" />
                      <div style={{fontSize:'0.72rem',color:'var(--muted)',marginBottom:12}}>Novo saldo: <strong style={{color:'#ffc800'}}>{Math.max(0,(adjustModal.points||0)+(parseInt(adjustDelta)||0))} pts</strong></div>
                      <button onClick={saveAdjust} style={{width:'100%',padding:'10px',background:'var(--accent)',border:'none',borderRadius:10,color:'#000',fontWeight:700,fontSize:'0.82rem',cursor:'pointer',fontFamily:"'Space Mono',monospace",marginBottom:8}}>SALVAR</button>
                      <button onClick={()=>setAdjustModal(null)} style={{width:'100%',padding:'9px',background:'none',border:'1px solid var(--border)',borderRadius:10,color:'var(--muted)',fontSize:'0.78rem',cursor:'pointer'}}>Cancelar</button>
                    </div>
                  </div>
                )}
              </>;
            })()}

            {/* TAB: CUPONS */}
            {adminTab==="cupons" && (()=>{
              const iStyle = { background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:6, padding:'7px 10px', color:'var(--text)', fontSize:'0.82rem', fontFamily:"'DM Sans',sans-serif", width:'100%' };
              const lStyle = { fontSize:'0.65rem', color:'var(--muted)', marginBottom:3, display:'block' };
              const editing = couponForm?.id && coupons.find(c=>c.id===couponForm.id);

              async function saveCoupon() {
                if (!couponForm.code?.trim()) { showToast('Código obrigatório','error'); return; }
                if (!couponForm.value || parseFloat(couponForm.value) <= 0) { showToast('Valor inválido','error'); return; }
                const row = { code: couponForm.code.trim().toUpperCase(), type: couponForm.type||'percent', value: parseFloat(couponForm.value), min_order: parseFloat(couponForm.minOrder)||0, expires_at: couponForm.expiresAt||null, active: couponForm.active!==false };
                if (sb) {
                  if (editing) {
                    await sb.from('coupons').update(row).eq('id', couponForm.id);
                    setCoupons(cs => cs.map(c => c.id===couponForm.id ? {...c, ...row, minOrder:row.min_order, expiresAt:row.expires_at} : c));
                  } else {
                    const { data } = await sb.from('coupons').insert(row).select().single();
                    if (data) setCoupons(cs => [{ id:data.id, code:data.code, type:data.type, value:data.value, minOrder:data.min_order, expiresAt:data.expires_at, active:data.active }, ...cs]);
                  }
                } else {
                  const entry = { id: editing ? couponForm.id : Date.now(), ...row, minOrder:row.min_order, expiresAt:row.expires_at };
                  persistCoupons(editing ? coupons.map(c=>c.id===entry.id?entry:c) : [...coupons, entry]);
                }
                setCouponForm(null);
                showToast(editing ? 'Cupom atualizado ✓' : 'Cupom criado ✓', 'success');
              }

              return <>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px'}}>🏷️ GERENCIAR CUPONS</div>
                  <button onClick={()=>setCouponForm({code:'',type:'percent',value:'',minOrder:'',expiresAt:'',active:true})} style={{padding:'7px 14px',background:'rgba(255,150,0,0.1)',border:'1px solid rgba(255,150,0,0.3)',borderRadius:8,color:'#ff9600',fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Space Mono',monospace",fontWeight:700}}>＋ Novo Cupom</button>
                </div>

                {couponForm && (
                  <div style={{background:'rgba(255,150,0,0.04)',border:'1px solid rgba(255,150,0,0.2)',borderRadius:12,padding:'16px',marginBottom:20}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'#ff9600',letterSpacing:'1.5px',marginBottom:14}}>{editing?'✏️ EDITAR CUPOM':'＋ NOVO CUPOM'}</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:10}}>
                      <div><label style={lStyle}>Código *</label><input style={{...iStyle,textTransform:'uppercase',fontFamily:"'Space Mono',monospace",letterSpacing:'2px'}} placeholder="VANGUARD10" value={couponForm.code} onChange={e=>setCouponForm(f=>({...f,code:e.target.value.toUpperCase()}))} /></div>
                      <div><label style={lStyle}>Tipo</label>
                        <select style={iStyle} value={couponForm.type} onChange={e=>setCouponForm(f=>({...f,type:e.target.value}))}>
                          <option value="percent">% Porcentagem</option>
                          <option value="fixed">R$ Valor fixo</option>
                        </select>
                      </div>
                      <div><label style={lStyle}>Desconto ({couponForm.type==='percent'?'%':'R$'}) *</label><input style={iStyle} type="number" min="1" placeholder={couponForm.type==='percent'?'10':'50'} value={couponForm.value} onChange={e=>setCouponForm(f=>({...f,value:e.target.value}))} /></div>
                      <div><label style={lStyle}>Pedido mínimo (R$)</label><input style={iStyle} type="number" min="0" placeholder="0 = sem mínimo" value={couponForm.minOrder} onChange={e=>setCouponForm(f=>({...f,minOrder:e.target.value}))} /></div>
                      <div><label style={lStyle}>Validade (opcional)</label><input style={iStyle} type="date" value={couponForm.expiresAt||''} onChange={e=>setCouponForm(f=>({...f,expiresAt:e.target.value}))} /></div>
                      <div style={{display:'flex',alignItems:'center',gap:8,paddingTop:18}}>
                        <input type="checkbox" id="coupon-active" checked={couponForm.active!==false} onChange={e=>setCouponForm(f=>({...f,active:e.target.checked}))} style={{width:16,height:16,accentColor:'#ff9600',cursor:'pointer'}} />
                        <label htmlFor="coupon-active" style={{fontSize:'0.78rem',cursor:'pointer'}}>Ativo</label>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={saveCoupon} style={{padding:'8px 18px',background:'#ff9600',border:'none',borderRadius:8,color:'#000',fontSize:'0.72rem',fontWeight:700,cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>💾 Salvar</button>
                      <button onClick={()=>setCouponForm(null)} style={{padding:'8px 14px',background:'transparent',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',fontSize:'0.72rem',cursor:'pointer'}}>Cancelar</button>
                    </div>
                  </div>
                )}

                {coupons.length === 0
                  ? <div style={{textAlign:'center',color:'var(--muted)',padding:'40px 0',fontSize:'0.85rem'}}>Nenhum cupom cadastrado</div>
                  : <div>
                    {coupons.map(c => {
                      const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                      return (
                        <div key={c.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',background:'var(--card)',border:`1px solid ${c.active&&!expired?'rgba(255,150,0,0.25)':'var(--border)'}`,borderRadius:10,marginBottom:8,opacity:c.active&&!expired?1:0.5}}>
                          <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.9rem',fontWeight:700,color:c.active&&!expired?'#ff9600':'var(--muted)',minWidth:100}}>{c.code}</div>
                          <div style={{flex:1,fontSize:'0.78rem',color:'var(--muted)'}}>
                            <span style={{color:'var(--text)',fontWeight:600}}>{c.type==='percent'?`-${c.value}%`:`-R$ ${c.value}`}</span>
                            {c.minOrder > 0 && <span> · mín. R$ {c.minOrder}</span>}
                            {c.expiresAt && <span> · até {new Date(c.expiresAt).toLocaleDateString('pt-BR')}</span>}
                            {expired && <span style={{color:'#ff5050'}}> · EXPIRADO</span>}
                          </div>
                          <div style={{fontSize:'0.65rem',fontFamily:"'Space Mono',monospace",color:c.active&&!expired?'var(--accent)':'var(--muted)'}}>{c.active&&!expired?'ATIVO':'INATIVO'}</div>
                          <button onClick={async()=>{ const na=!c.active; if(sb) await sb.from('coupons').update({active:na}).eq('id',c.id); setCoupons(cs=>cs.map(x=>x.id===c.id?{...x,active:na}:x)); if(!sb) persistCoupons(coupons.map(x=>x.id===c.id?{...x,active:na}:x)); }} style={{background:'none',border:'1px solid var(--border)',borderRadius:6,color:'var(--muted)',cursor:'pointer',fontSize:'0.65rem',padding:'3px 8px',fontFamily:"'Space Mono',monospace"}}>{c.active?'PAUSAR':'ATIVAR'}</button>
                          <button onClick={()=>setCouponForm({...c,value:String(c.value),minOrder:String(c.minOrder||''),expiresAt:c.expiresAt||''})} style={{background:'none',border:'1px solid var(--border)',borderRadius:6,color:'var(--muted)',cursor:'pointer',fontSize:'0.65rem',padding:'3px 8px'}}>✏️</button>
                          <button onClick={async()=>{ if(!confirm('Excluir cupom '+c.code+'?')) return; if(sb) await sb.from('coupons').delete().eq('id',c.id); setCoupons(cs=>cs.filter(x=>x.id!==c.id)); if(!sb) persistCoupons(coupons.filter(x=>x.id!==c.id)); }} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.85rem'}}>✕</button>
                        </div>
                      );
                    })}
                  </div>
                }
              </>;
            })()}

            {/* TAB: COMBOS — salvos em site_config.bundles (a loja e o create-order leem daqui) */}
            {adminTab==="combos" && (()=>{
              const iStyle = { background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:6, padding:'7px 10px', color:'var(--text)', fontSize:'0.82rem', fontFamily:"'DM Sans',sans-serif", width:'100%' };
              const lStyle = { fontSize:'0.65rem', color:'var(--muted)', marginBottom:3, display:'block' };
              const fullOf = items => items.reduce((s, id) => { const p = products.find(x => x.id === id); return p ? s + effectivePrice(p) : s; }, 0);
              const missing = items => items.filter(id => !products.find(x => x.id === id));
              const editing = bundleForm && bundleForm.id && bundles.some(b => b.id === bundleForm.id);

              async function persistBundles(list, okMsg) {
                if (!sb) { showToast('Sem conexão com o banco', 'error'); return false; }
                const { error } = await sb.from('site_config').upsert({ key: 'bundles', value: JSON.stringify(list) });
                if (error) { showToast('Erro ao salvar combos: ' + error.message, 'error'); return false; }
                setBundles(list);
                try { localStorage.setItem('vg-bundles', JSON.stringify(list)); } catch {}
                showToast(okMsg, 'success');
                return true;
              }
              async function saveBundle() {
                const f = bundleForm;
                const name = (f.name || '').trim();
                const price = Math.round(parseFloat(f.price));
                if (!name) { showToast('Nome obrigatório', 'error'); return; }
                if ((f.items || []).length < 2) { showToast('Escolha pelo menos 2 produtos', 'error'); return; }
                if (!(price > 0)) { showToast('Preço inválido', 'error'); return; }
                const id = editing ? f.id : ('bundle-' + name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) + '-' + Math.random().toString(36).slice(2, 6));
                const row = { id, name, desc: (f.desc || '').trim(), items: [...f.items], price, badge: (f.badge || '').trim() || null, active: f.active !== false };
                const list = editing ? bundles.map(b => b.id === id ? row : b) : [...bundles, row];
                if (await persistBundles(list, editing ? 'Combo atualizado ✓' : 'Combo criado ✓')) setBundleForm(null);
              }

              // Mais vendidos: site_config.bestsellers (lista de SKUs/ids em ordem; vazio = padrao TZ15, RT15, CU50)
              const keyOf = p => p.sku || p.id;
              const bsSel = resolveBestsellers(bestsellers, products);
              const bsUsingDefault = !(bestsellers && bestsellers.length);
              async function persistBestsellers(keys, okMsg) {
                if (!sb) { showToast('Sem conexão com o banco', 'error'); return; }
                const list = keys.slice(0, BESTSELLERS_MAX);
                const { error } = await sb.from('site_config').upsert({ key: 'bestsellers', value: JSON.stringify(list) });
                if (error) { showToast('Erro ao salvar mais vendidos: ' + error.message, 'error'); return; }
                setBestsellers(list);
                try { localStorage.setItem('vg-bestsellers', JSON.stringify(list)); } catch {}
                showToast(okMsg, 'success');
              }
              const bsKeys = bsSel.map(keyOf);
              const bsMove = (i, d) => { const k = [...bsKeys]; const j = i + d; if (j < 0 || j >= k.length) return; [k[i], k[j]] = [k[j], k[i]]; persistBestsellers(k, 'Ordem salva ✓'); };
              const btnS = { background:'none', border:'1px solid var(--border)', borderRadius:6, color:'var(--muted)', cursor:'pointer', fontSize:'0.7rem', padding:'3px 8px' };

              return <>
                <div style={{background:'rgba(0,229,195,0.04)',border:'1px solid rgba(0,229,195,0.2)',borderRadius:12,padding:'16px',marginBottom:24}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px',marginBottom:6}}>🔥 MAIS VENDIDOS (destaque no topo da loja)</div>
                  <div style={{fontSize:'0.75rem',color:'var(--muted)',marginBottom:12,lineHeight:1.5}}>Até {BESTSELLERS_MAX} produtos, na ordem abaixo. Eles aparecem em destaque no topo da loja e continuam na lista normal. {bsUsingDefault ? 'Hoje está no padrão (TZ15, RT15, CU50) porque nada foi escolhido.' : 'Remova todos para voltar ao padrão.'}</div>
                  {bsSel.map((p, i) => (
                    <div key={p.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,marginBottom:6}}>
                      <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.7rem',color:'var(--accent)',width:18}}>{i+1}</span>
                      <span style={{flex:1,fontSize:'0.82rem'}}>{p.name} <span style={{color:'var(--muted)',fontSize:'0.7rem'}}>{p.sku||p.id}</span></span>
                      <button type="button" disabled={i===0} onClick={()=>bsMove(i,-1)} style={{...btnS,opacity:i===0?0.35:1}} aria-label="Subir">▲</button>
                      <button type="button" disabled={i===bsSel.length-1} onClick={()=>bsMove(i,1)} style={{...btnS,opacity:i===bsSel.length-1?0.35:1}} aria-label="Descer">▼</button>
                      <button type="button" onClick={()=>persistBestsellers(bsKeys.filter((_,x)=>x!==i), 'Removido ✓')} style={{...btnS,border:'none'}} aria-label="Remover">✕</button>
                    </div>
                  ))}
                  {bsSel.length < BESTSELLERS_MAX && (
                    <>
                      <div style={{fontSize:'0.65rem',color:'var(--muted)',margin:'10px 0 6px'}}>Adicionar produto</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        {products.filter(p => !bsSel.some(x => x.id === p.id)).map(p => (
                          <button key={p.id} type="button" onClick={()=>persistBestsellers([...bsKeys, keyOf(p)], 'Adicionado ✓')}
                            style={{padding:'5px 10px',borderRadius:14,fontSize:'0.72rem',cursor:'pointer',background:'transparent',border:'1px solid var(--border)',color:'var(--muted)'}}>＋ {p.name}</button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px'}}>🎁 COMBOS (loja /novo)</div>
                  <button onClick={()=>setBundleForm({ name:'', desc:'', items:[], price:'', badge:'', active:true })} style={{padding:'7px 14px',background:'rgba(0,229,195,0.1)',border:'1px solid rgba(0,229,195,0.3)',borderRadius:8,color:'var(--accent)',fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Space Mono',monospace",fontWeight:700}}>＋ Novo Combo</button>
                </div>
                <div style={{fontSize:'0.75rem',color:'var(--muted)',marginBottom:16,lineHeight:1.5}}>O cliente paga o preço do combo quando todos os itens estão no carrinho (1 de cada). O desconto é a soma dos preços atuais menos o preço do combo, e é conferido pelo servidor ao gravar o pedido. Combo com preço maior ou igual à soma não aparece na loja.</div>

                {bundleForm && (
                  <div style={{background:'rgba(0,229,195,0.04)',border:'1px solid rgba(0,229,195,0.2)',borderRadius:12,padding:'16px',marginBottom:20}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px',marginBottom:14}}>{editing?'✏️ EDITAR COMBO':'＋ NOVO COMBO'}</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:10,marginBottom:10}}>
                      <div><label style={lStyle}>Nome *</label><input style={iStyle} placeholder="Stack Emagrecimento" value={bundleForm.name} onChange={e=>setBundleForm(f=>({...f,name:e.target.value}))} /></div>
                      <div><label style={lStyle}>Preço do combo (R$) *</label><input style={iStyle} type="number" min="1" value={bundleForm.price} onChange={e=>setBundleForm(f=>({...f,price:e.target.value}))} /></div>
                      <div><label style={lStyle}>Selo (opcional)</label><input style={iStyle} placeholder="🔥 Mais vendido" value={bundleForm.badge||''} onChange={e=>setBundleForm(f=>({...f,badge:e.target.value}))} /></div>
                    </div>
                    <div style={{marginBottom:10}}><label style={lStyle}>Descrição</label><input style={iStyle} value={bundleForm.desc||''} onChange={e=>setBundleForm(f=>({...f,desc:e.target.value}))} /></div>
                    <label style={lStyle}>Produtos do combo * (mín. 2)</label>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:10}}>
                      {products.map(p => { const on = bundleForm.items.includes(p.id); return (
                        <button key={p.id} type="button" onClick={()=>setBundleForm(f=>({...f,items:on?f.items.filter(x=>x!==p.id):[...f.items,p.id]}))}
                          style={{padding:'5px 10px',borderRadius:14,fontSize:'0.72rem',cursor:'pointer',background:on?'rgba(0,229,195,0.18)':'transparent',border:`1px solid ${on?'var(--accent)':'var(--border)'}`,color:on?'var(--accent)':'var(--muted)'}}>
                          {on?'✓ ':''}{p.name} · R$ {effectivePrice(p)}
                        </button>); })}
                    </div>
                    {bundleForm.items.length >= 2 && (() => { const full = fullOf(bundleForm.items); const pr = parseFloat(bundleForm.price) || 0; return (
                      <div style={{fontSize:'0.78rem',marginBottom:10,color: pr > 0 && pr < full ? 'var(--accent)' : '#ffaa00'}}>
                        Soma atual: R$ {full.toLocaleString('pt-BR')}{pr > 0 && (pr < full ? ` · cliente economiza R$ ${(full - pr).toLocaleString('pt-BR')}` : ' · preço não é menor que a soma: o combo não aparece na loja')}
                      </div>); })()}
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                      <input type="checkbox" id="bundle-active" checked={bundleForm.active!==false} onChange={e=>setBundleForm(f=>({...f,active:e.target.checked}))} style={{width:16,height:16,accentColor:'#00e5c3',cursor:'pointer'}} />
                      <label htmlFor="bundle-active" style={{fontSize:'0.78rem',cursor:'pointer'}}>Ativo (aparece na loja)</label>
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={saveBundle} style={{padding:'8px 18px',background:'var(--accent)',border:'none',borderRadius:8,color:'#000',fontSize:'0.72rem',fontWeight:700,cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>💾 Salvar</button>
                      <button onClick={()=>setBundleForm(null)} style={{padding:'8px 14px',background:'transparent',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',fontSize:'0.72rem',cursor:'pointer'}}>Cancelar</button>
                    </div>
                  </div>
                )}

                {bundles.length === 0
                  ? <div style={{textAlign:'center',color:'var(--muted)',padding:'40px 0',fontSize:'0.85rem'}}>Nenhum combo cadastrado</div>
                  : bundles.map(b => {
                    const full = fullOf(b.items); const miss = missing(b.items);
                    const visible = b.active !== false && !miss.length && b.price < full;
                    return (
                      <div key={b.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',background:'var(--card)',border:`1px solid ${visible?'rgba(0,229,195,0.25)':'var(--border)'}`,borderRadius:10,marginBottom:8,opacity:visible?1:0.6,flexWrap:'wrap'}}>
                        <div style={{flex:1,minWidth:200}}>
                          <div style={{fontWeight:600,fontSize:'0.88rem'}}>{b.name}{b.badge && <span style={{marginLeft:8,fontSize:'0.7rem',color:'var(--muted)'}}>{b.badge}</span>}</div>
                          <div style={{fontSize:'0.72rem',color:'var(--muted)',marginTop:2}}>{b.items.map(id => (products.find(p => p.id === id) || {}).name || `${id} (removido)`).join(' + ')}</div>
                          <div style={{fontSize:'0.72rem',marginTop:2,fontFamily:"'Space Mono',monospace"}}>
                            R$ {b.price.toLocaleString('pt-BR')} <span style={{color:'var(--muted)'}}>· soma R$ {full.toLocaleString('pt-BR')}</span>
                            {miss.length ? <span style={{color:'#ff5050'}}> · produto removido</span> : b.price >= full ? <span style={{color:'#ffaa00'}}> · sem desconto (não aparece)</span> : <span style={{color:'var(--accent)'}}> · −R$ {(full - b.price).toLocaleString('pt-BR')}</span>}
                          </div>
                        </div>
                        <div style={{fontSize:'0.65rem',fontFamily:"'Space Mono',monospace",color:b.active!==false?'var(--accent)':'var(--muted)'}}>{b.active!==false?'ATIVO':'PAUSADO'}</div>
                        <button onClick={()=>persistBundles(bundles.map(x=>x.id===b.id?{...x,active:x.active===false}:x), b.active===false?'Combo ativado ✓':'Combo pausado ✓')} style={{background:'none',border:'1px solid var(--border)',borderRadius:6,color:'var(--muted)',cursor:'pointer',fontSize:'0.65rem',padding:'3px 8px',fontFamily:"'Space Mono',monospace"}}>{b.active!==false?'PAUSAR':'ATIVAR'}</button>
                        <button onClick={()=>setBundleForm({...b,price:String(b.price),desc:b.desc||'',badge:b.badge||''})} style={{background:'none',border:'1px solid var(--border)',borderRadius:6,color:'var(--muted)',cursor:'pointer',fontSize:'0.65rem',padding:'3px 8px'}}>✏️</button>
                        <button onClick={()=>{ if(confirm('Excluir combo "'+b.name+'"?')) persistBundles(bundles.filter(x=>x.id!==b.id), 'Combo excluído ✓'); }} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.85rem'}}>✕</button>
                      </div>
                    );
                  })}
              </>;
            })()}

            {/* TAB: REGIOES */}
            {adminTab==="mapa" && (()=>{
              // Cidades da RMSP (~50km de SBC) — zona motoboy
              const RMSP = new Set([
                'sao paulo','santo andre','sao bernardo do campo','sao caetano do sul',
                'diadema','maua','ribeirao pires','rio grande da serra',
                'guarulhos','osasco','carapicuiba','barueri','santana de parnaiba',
                'itapevi','jandira','cajamar','taboao da serra','embu das artes',
                'embu guacu','embu-guacu','itapecerica da serra','sao lourenco da serra',
                'cotia','vargem grande paulista','franco da rocha','francisco morato',
                'caieiras','mairipora','aruja','santa isabel','suzano',
                'ferraz de vasconcelos','poa','itaquaquecetuba','mogi das cruzes',
                'biritiba mirim','salesopolis','guararema',
              ]);
              function normCity(s){ return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); }
              function cityZone(city,uf){
                if(uf!=='SP') return 'correios';
                return RMSP.has(normCity(city))?'motoboy':'sp-interior';
              }
              // Estima zona pelo DDD do WhatsApp (pré-orders não têm endereço)
              function dddZone(wpp){
                const d=(wpp||'').replace(/\D/g,'');
                let local=d;
                if(local.startsWith('55')&&local.length>=12) local=local.slice(2);
                const ddd=parseInt(local.substring(0,2));
                if(ddd===11) return 'motoboy';
                if(ddd>=12&&ddd<=19) return 'sp-interior';
                return 'correios';
              }

              // Stats pedidos confirmados
              const byCity={}, orderZone={motoboy:0,'sp-interior':0,correios:0};
              let totalOrders=0;
              orders.forEach(o=>{
                const addr=o._address||{};
                const uf=normUF(addr.estado||'');
                const city=addr.cidade?addr.cidade.trim():'';
                if(city&&uf){
                  const k=city+' / '+uf;
                  byCity[k]=(byCity[k]||0)+1;
                  orderZone[cityZone(city,uf)]++;
                  totalOrders++;
                }
              });
              const topCities=Object.entries(byCity).sort((a,b)=>b[1]-a[1]).slice(0,10);

              // Stats pré-orders ativas (estimativa por DDD)
              const activePO=preorders.filter(p=>p.status==='pending'||p.status==='notified');
              const poZone={motoboy:0,'sp-interior':0,correios:0};
              activePO.forEach(po=>{ poZone[dddZone(po.whatsapp)]++; });
              const totalPO=activePO.length;

              // Produtos mais reservados
              const byProduct={};
              activePO.forEach(p=>{
                const k=p.productName||p.product_name||'Produto sem nome';
                if(!byProduct[k]) byProduct[k]={qty:0,reservas:0};
                byProduct[k].qty+=parseInt(p.qty)||1;
                byProduct[k].reservas++;
              });
              const topPO=Object.entries(byProduct).sort((a,b)=>b[1].qty-a[1].qty).slice(0,10);
              const pending=preorders.filter(p=>p.status==='pending').length;
              const notified=preorders.filter(p=>p.status==='notified').length;
              const completed=preorders.filter(p=>p.status==='completed').length;

              const zoneStyle={
                motoboy:      {color:'rgb(96,165,250)', bg:'rgba(59,130,246,0.12)', border:'rgba(59,130,246,0.35)', icon:'🛵', label:'RMSP — MOTOBOY',    sub:'Grande SP (~50km de SBC)'},
                'sp-interior':{color:'rgb(52,211,153)', bg:'rgba(16,185,129,0.1)',  border:'rgba(52,211,153,0.3)',  icon:'🚗', label:'SP INTERIOR',        sub:'Correios / fora da Grande SP'},
                correios:     {color:'#ff9600',         bg:'rgba(251,146,60,0.1)',  border:'rgba(251,146,60,0.3)',  icon:'📮', label:'OUTROS ESTADOS',     sub:'Via Melhor Envios'},
              };

              return <>
                {/* PEDIDOS CONFIRMADOS */}
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                  <div style={{fontSize:'1rem',fontWeight:700,color:'var(--text)'}}>Pedidos por Zona de Entrega</div>
                  <div style={{fontSize:'0.65rem',fontFamily:"'Space Mono',monospace",color:'var(--muted)',background:'var(--bg2)',padding:'2px 8px',borderRadius:20}}>{totalOrders} mapeados</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
                  {Object.entries(zoneStyle).map(([zone,s])=>(
                    <div key={zone} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:12,padding:'12px 14px'}}>
                      <div style={{fontSize:'0.55rem',fontFamily:"'Space Mono',monospace",color:s.color,marginBottom:5,letterSpacing:'0.07em'}}>{s.icon} {s.label}</div>
                      <div style={{fontSize:'1.8rem',fontWeight:700,color:s.color,lineHeight:1}}>{orderZone[zone]}</div>
                      <div style={{fontSize:'0.62rem',color:'var(--muted)',marginTop:4}}>{totalOrders>0?Math.round(orderZone[zone]/totalOrders*100):0}% · {s.sub}</div>
                    </div>
                  ))}
                </div>

                {topCities.length>0&&<>
                  <div style={{fontSize:'0.65rem',fontFamily:"'Space Mono',monospace",color:'var(--muted)',marginBottom:10,letterSpacing:'0.08em'}}>TOP CIDADES — PEDIDOS</div>
                  <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:28}}>
                    {topCities.map(([cityKey,count],i)=>{
                      const parts=cityKey.split(' / ');
                      const zone=cityZone(parts[0],parts[1]||'');
                      const s=zoneStyle[zone];
                      const bar=Math.round((count/topCities[0][1])*100);
                      return (
                        <div key={cityKey} style={{display:'flex',alignItems:'center',gap:10}}>
                          <div style={{width:20,fontSize:'0.6rem',color:'var(--muted)',textAlign:'right',fontFamily:"'Space Mono',monospace",flexShrink:0}}>#{i+1}</div>
                          <div style={{flex:1}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                              <div style={{display:'flex',alignItems:'center',gap:6}}>
                                <span style={{fontSize:'0.78rem',color:'var(--text)'}}>{cityKey}</span>
                                <span style={{fontSize:'0.52rem',fontFamily:"'Space Mono',monospace",color:s.color,background:s.bg,border:`1px solid ${s.border}`,borderRadius:4,padding:'1px 5px'}}>{s.icon} {zone==='motoboy'?'MOTOBOY':zone==='sp-interior'?'INTERIOR':'CORREIOS'}</span>
                              </div>
                              <span style={{fontSize:'0.72rem',fontFamily:"'Space Mono',monospace",color:s.color,fontWeight:700,flexShrink:0,marginLeft:8}}>{count}</span>
                            </div>
                            <div style={{height:4,borderRadius:2,background:'rgba(255,255,255,0.07)',overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${bar}%`,borderRadius:2,background:s.color,transition:'width 0.3s'}}/>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>}
                {totalOrders===0&&<div style={{textAlign:'center',color:'var(--muted)',padding:24,fontSize:'0.82rem',marginBottom:20}}>Nenhum pedido com endereço ainda.</div>}

                {/* PRÉ-ORDERS */}
                <div style={{borderTop:'1px solid var(--border)',paddingTop:24,marginBottom:16,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                  <div style={{fontSize:'1rem',fontWeight:700,color:'var(--text)'}}>Pré-Orders por Zona</div>
                  <div style={{fontSize:'0.65rem',fontFamily:"'Space Mono',monospace",color:'var(--muted)',background:'var(--bg2)',padding:'2px 8px',borderRadius:20}}>{totalPO} ativas</div>
                  <div style={{fontSize:'0.6rem',color:'var(--muted)',fontStyle:'italic'}}>estimado por DDD do WhatsApp</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
                  {Object.entries(zoneStyle).map(([zone,s])=>(
                    <div key={zone} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:12,padding:'12px 14px'}}>
                      <div style={{fontSize:'0.55rem',fontFamily:"'Space Mono',monospace",color:s.color,marginBottom:5,letterSpacing:'0.07em'}}>{s.icon} {s.label}</div>
                      <div style={{fontSize:'1.8rem',fontWeight:700,color:s.color,lineHeight:1}}>{poZone[zone]}</div>
                      <div style={{fontSize:'0.62rem',color:'var(--muted)',marginTop:4}}>{totalPO>0?Math.round(poZone[zone]/totalPO*100):0}% estimado</div>
                    </div>
                  ))}
                </div>

                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:24}}>
                  {[
                    {v:pending,  label:'AGUARDANDO', color:'#fbbf24', bg:'rgba(251,191,36,0.08)',  border:'rgba(251,191,36,0.25)'},
                    {v:notified, label:'NOTIFICADO',  color:'rgb(96,165,250)', bg:'rgba(96,165,250,0.08)', border:'rgba(96,165,250,0.25)'},
                    {v:completed,label:'CONVERTIDO',  color:'#34d399', bg:'rgba(52,211,153,0.08)', border:'rgba(52,211,153,0.25)'},
                  ].map(({v,label,color,bg,border})=>(
                    <div key={label} style={{background:bg,border:`1px solid ${border}`,borderRadius:10,padding:'10px 14px',textAlign:'center'}}>
                      <div style={{fontSize:'1.5rem',fontWeight:700,color}}>{v}</div>
                      <div style={{fontSize:'0.6rem',fontFamily:"'Space Mono',monospace",color:'var(--muted)',marginTop:2}}>{label}</div>
                    </div>
                  ))}
                </div>

                {topPO.length>0&&<>
                  <div style={{fontSize:'0.65rem',fontFamily:"'Space Mono',monospace",color:'var(--muted)',marginBottom:10,letterSpacing:'0.08em'}}>PRODUTOS MAIS RESERVADOS</div>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {topPO.map(([name,{qty,reservas}],i)=>{
                      const bar=Math.round((qty/topPO[0][1].qty)*100);
                      return (
                        <div key={name} style={{display:'flex',alignItems:'center',gap:10}}>
                          <div style={{width:20,fontSize:'0.6rem',color:'var(--muted)',textAlign:'right',fontFamily:"'Space Mono',monospace",flexShrink:0}}>#{i+1}</div>
                          <div style={{flex:1}}>
                            <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                              <span style={{fontSize:'0.78rem',color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'65%'}}>{name}</span>
                              <span style={{fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",color:'#fbbf24',fontWeight:700,flexShrink:0,marginLeft:8}}>{qty} vial{qty!==1?'s':''} · {reservas} reserva{reservas!==1?'s':''}</span>
                            </div>
                            <div style={{height:4,borderRadius:2,background:'rgba(255,255,255,0.07)',overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${bar}%`,borderRadius:2,background:'linear-gradient(90deg,#fbbf24,#f59e0b)',transition:'width 0.3s'}}/>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>}
                {activePO.length===0&&<div style={{textAlign:'center',color:'var(--muted)',padding:32,fontSize:'0.82rem'}}>Nenhuma pré-order ativa no momento.</div>}
              </>;
            })()}

            {/* TAB: CONFIG */}
            {adminTab==="config" && <>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:"var(--accent)",letterSpacing:"2px",marginBottom:16}}>⚙️ CONFIGURAÇÕES</div>

              {/* CEP Origem Simulador */}
              <div style={{padding:'16px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,marginBottom:16}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.62rem",color:"var(--accent)",letterSpacing:"1.5px",marginBottom:6}}>📍 CEP DE ORIGEM — SIMULADOR DE FRETE</div>
                <div style={{fontSize:"0.78rem",color:"var(--muted)",marginBottom:12}}>CEP usado como origem no simulador público <code style={{color:'var(--accent)'}}>vanguardpep.com/#/frete</code>. Configure com o seu CEP de envio.</div>
                <div style={{display:'flex',gap:8}}>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 09750-000"
                    value={freteOriginCep}
                    onChange={e=>setFreteOriginCep(e.target.value.replace(/[^\d-]/g,'').slice(0,9))}
                    style={{flex:1,padding:'10px 12px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,color:'var(--text)',fontSize:'0.88rem',fontFamily:"'Space Mono',monospace"}}
                  />
                  <button onClick={async()=>{
                    const cep = freteOriginCep.replace(/\D/g,'');
                    if(cep.length!==8){showToast('CEP inválido','error');return;}
                    if(sb) await sb.from('site_config').upsert({key:'origin_cep',value:freteOriginCep});
                    showToast('CEP de origem salvo!','success');
                  }} style={{padding:'10px 18px',background:'var(--accent)',border:'none',borderRadius:8,color:'#000',fontWeight:700,cursor:'pointer',fontFamily:"'Space Mono',monospace",fontSize:'0.72rem'}}>
                    SALVAR
                  </button>
                </div>
                <div style={{marginTop:10,fontSize:'0.72rem',color:'var(--muted)'}}>
                  Link do simulador para enviar ao cliente: <button onClick={()=>{navigator.clipboard.writeText('https://vanguardpep.com/#/frete');showToast('Link copiado!','success');}} style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:'0.72rem',padding:0,fontFamily:"'Space Mono',monospace"}}>copiar link</button>
                </div>
              </div>
            </>}

            </>}
          </div>

          {/* CALCULADORA */}
          <div className={`view ${view==="calc"?"visible":""}`}>
            {prevView && <button className="detail-back" onClick={()=>{ setView(prevView); setPrevView(null); }}>← Voltar ao produto</button>}
            <div className="page-tag">▸ CALCULADORA</div>
            <div className="page-title">Calculadora de Dose</div>
            <div className="page-sub">Calcule dose, reconstituição com água bacteriostática e duração do frasco.</div>
            <CalcView />
          </div>
        </main>

      </div>

      {/* MODAL RESERVA SIMPLES */}
      {preorderModal && (
        <div className="preorder-modal-overlay" onClick={()=>setPreorderModal(null)}>
          <div className="preorder-modal" onClick={e=>e.stopPropagation()}>
            <div className="preorder-modal-title">🔔 Fazer Reserva</div>
            <div className="preorder-modal-sub">Quando o produto chegar em estoque, você será avisado pelo WhatsApp para confirmar o pedido.</div>
            <div className="preorder-modal-product">{preorderModal.peptide.name}</div>
            <div className="preorder-field">
              <label>Seu nome</label>
              <input value={preorderForm.name} onChange={e=>setPreorderForm(f=>({...f,name:e.target.value}))} placeholder="Ex: Ana Silva" autoFocus />
            </div>
            <div className="preorder-field">
              <label>WhatsApp (com DDD)</label>
              <input value={preorderForm.whatsapp} onChange={e=>setPreorderForm(f=>({...f,whatsapp:e.target.value}))} placeholder="74999710520" type="tel" />
            </div>
            <div className="preorder-field">
              <label>Quantidade</label>
              <input type="number" min="1" max="10" value={preorderForm.qty} onChange={e=>setPreorderForm(f=>({...f,qty:parseInt(e.target.value)||1}))} />
            </div>
            <div className="preorder-modal-btns">
              <button className="preorder-cancel-btn" onClick={()=>setPreorderModal(null)}>Cancelar</button>
              <button className="preorder-confirm-btn" onClick={()=>{
                const name = (preorderForm.name||'').trim();
                const whatsapp = (preorderForm.whatsapp||'').trim();
                if (!name) { showToast('Informe seu nome','error'); return; }
                if (!whatsapp) { showToast('Informe seu WhatsApp','error'); return; }
                savePreorder(preorderModal.peptide, {name, whatsapp, qty: preorderForm.qty||1});
                saveName(name);
                setPreorderModal(null);
                showToast(`Reserva de ${preorderModal.peptide.name} registrada! Você será avisado pelo WhatsApp 🔔`, 'success');
              }}>Confirmar Reserva</button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN PASSWORD MODAL */}
      {adminPwModal && (
        <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget){ setAdminPwModal(false); setAdminPwInput(''); } }}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:360}}>
            <div style={{textAlign:'center',marginBottom:20}}>
              <div style={{fontSize:'2rem',marginBottom:8}}>🔒</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:700}}>Acesso Admin</div>
              <div style={{color:'var(--muted)',fontSize:'0.8rem',marginTop:4}}>Digite o código de administrador</div>
            </div>
            <input
              type="password"
              autoFocus
              value={adminPwInput}
              onChange={e=>setAdminPwInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter') submitAdminPassword(); if(e.key==='Escape'){ setAdminPwModal(false); setAdminPwInput(''); } }}
              placeholder="••••••••"
              style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:10,color:'var(--text)',fontSize:'1.1rem',padding:'12px 16px',outline:'none',boxSizing:'border-box',textAlign:'center',letterSpacing:'0.2em',marginBottom:16}}
            />
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>{ setAdminPwModal(false); setAdminPwInput(''); }} style={{flex:1,padding:'11px',background:'transparent',border:'1px solid var(--border)',color:'var(--muted)',borderRadius:10,cursor:'pointer',fontFamily:"'Space Mono',monospace",fontSize:'0.7rem'}}>Cancelar</button>
              <button onClick={submitAdminPassword} style={{flex:1,padding:'11px',background:'var(--accent)',border:'none',color:'#000',borderRadius:10,cursor:'pointer',fontFamily:"'Space Mono',monospace",fontSize:'0.7rem',fontWeight:700}}>ENTRAR</button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAIL MODAL */}
      {orderDetail && (
        <div className="modal-overlay" onClick={()=>{ setOrderDetail(null); setEditItemsMode(false); setDiscountInput(null); setEditCustomer(null); }}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:480,maxHeight:'85vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px'}}>DETALHES DO PEDIDO</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.75rem",color:'var(--muted)',marginTop:2}}>#{orderDetail.id}</div>
              </div>
              <span className={`order-status ${orderDetail.status||'pendente'}`} style={{cursor:'default'}}>
                {statusLabel(orderDetail.status)}
              </span>
            </div>

            {/* Cliente */}
            <div style={{background:'var(--bg2)',borderRadius:10,padding:'12px 14px',marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1px'}}>👤 CLIENTE</div>
                {canEditCustomer(orderDetail) && !editCustomer && <button onClick={()=>openEditCustomer(orderDetail)} style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:'0.7rem',padding:0}}>✏️ editar</button>}
              </div>
              {editCustomer ? <>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[['buyerName','Nome',2],['cpf','CPF',1],['phone','Telefone',1],['email','E-mail',2],['cep','CEP',1],['estado','UF',1],['rua','Rua',2],['numero','Número',1],['complemento','Complemento',1],['bairro','Bairro',1],['cidade','Cidade',1]].map(([k,lbl,span])=>(
                    <div key={k} style={{gridColumn:`span ${span}`}}>
                      <label style={{fontSize:'0.6rem',color:'var(--muted)',display:'block',marginBottom:2}}>{lbl}</label>
                      <input value={editCustomer[k]} onChange={e=> k==='cep' ? editCustomerCep(e.target.value) : setEditCustomer(f=>({...f,[k]: k==='estado' ? e.target.value.toUpperCase().slice(0,2) : e.target.value}))}
                        style={{width:'100%',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:6,padding:'6px 10px',color:'var(--text)',fontSize:'0.78rem',boxSizing:'border-box'}} />
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:8,marginTop:10}}>
                  <button onClick={()=>setEditCustomer(null)} style={{flex:1,padding:'8px',background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',fontSize:'0.72rem',cursor:'pointer'}}>Cancelar</button>
                  <button onClick={saveEditCustomer} style={{flex:1,padding:'8px',background:'var(--accent)',border:'none',borderRadius:8,color:'#000',fontWeight:700,fontSize:'0.72rem',cursor:'pointer'}}>💾 Salvar</button>
                </div>
              </> : <>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 12px',fontSize:'0.82rem'}}>
                <div><span style={{color:'var(--muted)',fontSize:'0.7rem'}}>Nome</span><div>{orderDetail.buyerName||'—'}</div></div>
                <div><span style={{color:'var(--muted)',fontSize:'0.7rem'}}>CPF</span><div style={{fontFamily:"'Space Mono',monospace"}}>{orderDetail._cpf||'—'}</div></div>
                <div><span style={{color:'var(--muted)',fontSize:'0.7rem'}}>Telefone</span><div style={{fontFamily:"'Space Mono',monospace"}}>{orderDetail._phone||'—'}</div></div>
                <div><span style={{color:'var(--muted)',fontSize:'0.7rem'}}>E-mail</span><div style={{fontSize:'0.75rem',wordBreak:'break-all'}}>{orderDetail._email||'—'}</div></div>
                {(()=>{ const a = orderDetail._address || orderDetail.address; return <div style={{gridColumn:'span 2'}}><span style={{color:'var(--muted)',fontSize:'0.7rem'}}>Endereço</span><div style={{fontSize:'0.75rem'}}>{a && a.rua ? `${a.rua}, ${a.numero||'s/n'}${a.complemento?' — '+a.complemento:''} · ${a.bairro||''} · ${a.cidade||''}/${a.estado||''} · CEP ${a.cep||''}` : '—'}</div></div>; })()}
              </div>
              </>}
            </div>

            {/* Itens */}
            <div style={{background:'var(--bg2)',borderRadius:10,padding:'12px 14px',marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1px'}}>🛒 ITENS</div>
                {(orderDetail.status||'pendente')==='pendente' && !editItemsMode && (
                  <button onClick={()=>{ setEditItems((orderDetail._items||[{peptideId:orderDetail.peptideId,qty:orderDetail.qty||1}]).map(it=>({...it}))); setEditItemsMode(true); setAddItemProductId(''); }}
                    style={{background:'none',border:'none',color:'var(--accent)',fontSize:'0.62rem',cursor:'pointer',padding:0}}>✏️ editar itens</button>
                )}
              </div>

              {editItemsMode ? (<>
                {/* EDITOR */}
                {editItems.map((it,i)=>{
                  const p2 = products.find(x=>x.id===it.peptideId);
                  const unitPrice = it.price || (p2?p2.price:0);
                  return (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:'1px solid var(--border)',fontSize:'0.82rem'}}>
                      <div style={{flex:1}}>
                        <div>{p2?p2.name:it.peptideId}</div>
                        <div style={{color:'var(--muted)',fontSize:'0.68rem',fontFamily:"'Space Mono',monospace"}}>R$ {unitPrice.toLocaleString('pt-BR')} / un</div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:4}}>
                        <button onClick={()=>setEditItems(ei=>ei.map((x,j)=>j===i?{...x,qty:Math.max(1,(x.qty||1)-1)}:x))}
                          style={{width:24,height:24,borderRadius:6,border:'1px solid var(--border)',background:'rgba(255,255,255,0.05)',color:'var(--text)',cursor:'pointer',fontSize:'0.9rem',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                        <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.82rem',minWidth:20,textAlign:'center'}}>{it.qty||1}</span>
                        <button onClick={()=>setEditItems(ei=>ei.map((x,j)=>j===i?{...x,qty:(x.qty||1)+1}:x))}
                          style={{width:24,height:24,borderRadius:6,border:'1px solid var(--border)',background:'rgba(255,255,255,0.05)',color:'var(--text)',cursor:'pointer',fontSize:'0.9rem',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                      </div>
                      <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.78rem',color:'var(--accent)',minWidth:60,textAlign:'right'}}>R$ {(unitPrice*(it.qty||1)).toLocaleString('pt-BR')}</span>
                      <button onClick={()=>setEditItems(ei=>ei.filter((_,j)=>j!==i))}
                        style={{background:'none',border:'none',color:'#ff5050',cursor:'pointer',fontSize:'0.85rem',padding:'0 2px'}}>✕</button>
                    </div>
                  );
                })}
                {/* Adicionar produto */}
                <div style={{display:'flex',gap:6,marginTop:10}}>
                  <select value={addItemProductId} onChange={e=>setAddItemProductId(e.target.value)}
                    style={{flex:1,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:7,padding:'7px 10px',color:'var(--text)',fontSize:'0.78rem'}}>
                    <option value="">+ Adicionar produto...</option>
                    {products.filter(p=>!editItems.find(it=>it.peptideId===p.id)).map(p=>(
                      <option key={p.id} value={p.id}>{p.name} — R$ {p.price.toLocaleString('pt-BR')}</option>
                    ))}
                  </select>
                  <button onClick={()=>{ if(!addItemProductId) return; const p2=products.find(x=>x.id===addItemProductId); if(!p2) return; setEditItems(ei=>[...ei,{peptideId:p2.id,qty:1,price:p2.price}]); setAddItemProductId(''); }}
                    style={{padding:'7px 14px',background:'rgba(0,229,195,0.1)',border:'1px solid rgba(0,229,195,0.3)',borderRadius:7,color:'var(--accent)',fontWeight:700,fontSize:'0.75rem',cursor:'pointer'}}>OK</button>
                </div>
                {/* Total preview */}
                {(() => {
                  const newSubtotal = editItems.reduce((s,it)=>{ const p2=products.find(x=>x.id===it.peptideId); return s+(it.price||(p2?p2.price:0))*(it.qty||1); },0);
                  const isPix = (orderDetail._payment||'').toLowerCase().includes('pix');
                  const newFreight = isPix ? 0 : (orderDetail._freight ?? 60);
                  const newTotal = orderTotalWith(newSubtotal, newFreight, orderDetail._discounts, orderDetail._discounts && orderDetail._discounts.manual);
                  return (
                    <div style={{marginTop:10,padding:'8px 10px',background:'rgba(0,229,195,0.05)',border:'1px solid rgba(0,229,195,0.15)',borderRadius:8,fontSize:'0.78rem'}}>
                      <div style={{display:'flex',justifyContent:'space-between',color:'var(--muted)',marginBottom:3}}><span>Subtotal</span><span style={{fontFamily:"'Space Mono',monospace"}}>R$ {newSubtotal.toLocaleString('pt-BR')}</span></div>
                      <div style={{display:'flex',justifyContent:'space-between',color:'var(--muted)',marginBottom:6}}><span>Frete</span><span style={{fontFamily:"'Space Mono',monospace"}}>{newFreight===0?'GRÁTIS':'R$ '+newFreight.toLocaleString('pt-BR')}</span></div>
                      <div style={{display:'flex',justifyContent:'space-between',fontWeight:700}}><span>Novo Total</span><span style={{fontFamily:"'Space Mono',monospace",color:'var(--accent)'}}>R$ {newTotal.toLocaleString('pt-BR')}</span></div>
                      {orderDetail._supabase && (() => { const { add, back } = stockDiffOfEdit(orderDetail._items && orderDetail._items.length ? orderDetail._items : [{ peptideId: orderDetail.peptideId, qty: orderDetail.qty || 1 }], editItems);
                        const nm = pid => (products.find(p => p.id === pid) || {}).name || pid;
                        const parts = [...add.map(x => `−${x.qty} ${nm(x.peptideId)}`), ...back.map(x => `+${x.qty} ${nm(x.pid)}`)];
                        return parts.length ? <div style={{marginTop:6,color:'#ffaa00',fontSize:'0.72rem'}}>Estoque ao salvar: {parts.join(' · ')}</div> : null; })()}
                    </div>
                  );
                })()}
                <div style={{display:'flex',gap:8,marginTop:10}}>
                  <button onClick={()=>setEditItemsMode(false)}
                    style={{flex:1,padding:'8px',background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',fontSize:'0.75rem',cursor:'pointer'}}>Cancelar</button>
                  <button onClick={saveOrderItemsEdit}
                    style={{flex:2,padding:'8px',background:'rgba(0,229,195,0.12)',border:'1px solid rgba(0,229,195,0.35)',borderRadius:8,color:'var(--accent)',fontWeight:700,fontSize:'0.75rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>SALVAR ALTERAÇÕES</button>
                </div>
              </>) : (<>
                {(orderDetail._items||[{peptideId:orderDetail.peptideId,qty:orderDetail.qty}]).map((it,i)=>{
                  const p2 = products.find(x=>x.id===it.peptideId);
                  const unitPrice = it.price || (p2 ? p2.price : 0);
                  return (
                    <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid var(--border)',fontSize:'0.82rem'}}>
                      <div>
                        <div>{p2?p2.name:it.peptideId}</div>
                        <div style={{color:'var(--muted)',fontSize:'0.7rem',fontFamily:"'Space Mono',monospace"}}>R$ {unitPrice.toLocaleString('pt-BR')} × {it.qty||1}</div>
                      </div>
                      <div style={{fontFamily:"'Space Mono',monospace",fontWeight:700,color:'var(--accent)'}}>R$ {(unitPrice*(it.qty||1)).toLocaleString('pt-BR')}</div>
                    </div>
                  );
                })}
                <div style={{marginTop:8,display:'flex',flexDirection:'column',gap:3,fontSize:'0.78rem'}}>
                  {orderDetail._subtotal != null && <div style={{display:'flex',justifyContent:'space-between',color:'var(--muted)'}}><span>Subtotal</span><span style={{fontFamily:"'Space Mono',monospace"}}>R$ {orderDetail._subtotal.toLocaleString('pt-BR')}</span></div>}
                  {orderDetail._freight != null && <div style={{display:'flex',justifyContent:'space-between',color:'var(--muted)'}}><span>Frete</span><span style={{fontFamily:"'Space Mono',monospace"}}>{orderDetail._freight===0?'GRÁTIS':'R$ '+orderDetail._freight.toLocaleString('pt-BR')}</span></div>}
                  {(() => { const d = orderDetail._discounts; if (!d) return null; const row = (k, label, v) => v > 0 && <div key={k} style={{display:'flex',justifyContent:'space-between',color:'#ffaa00'}}><span>{label}</span><span style={{fontFamily:"'Space Mono',monospace"}}>− R$ {v.toLocaleString('pt-BR')}</span></div>;
                    return <>{row('c', 'Cupom ' + (d.couponCode || ''), d.coupon)}{d.bundles.length ? d.bundles.map((b, i) => row('b' + i, 'Combo ' + b.name, b.discount)) : row('b', 'Combos', d.bundle)}{row('p', `Pontos VG (${d.pointsUsed} pts)`, d.points)}{row('m', 'Desconto manual', d.manual)}</>; })()}
                  {orderDetail._total != null && <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:'0.85rem',paddingTop:4,borderTop:'1px solid var(--border)'}}><span>Total</span><span style={{fontFamily:"'Space Mono',monospace",color:'var(--accent)'}}>R$ {orderDetail._total.toLocaleString('pt-BR')}</span></div>}
                </div>
              </>)}
            </div>

            {/* Endereço */}
            {orderDetail._address && (
              <div style={{background:'var(--bg2)',borderRadius:10,padding:'12px 14px',marginBottom:10}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1px',marginBottom:8}}>📍 ENDEREÇO</div>
                <div style={{fontSize:'0.82rem',lineHeight:1.6}}>
                  {orderDetail._address.rua}{orderDetail._address.numero?', '+orderDetail._address.numero:''}{orderDetail._address.complemento?' — '+orderDetail._address.complemento:''}<br/>
                  {orderDetail._address.bairro && <>{orderDetail._address.bairro}<br/></>}
                  {orderDetail._address.cidade}{orderDetail._address.estado?' / '+orderDetail._address.estado:''}<br/>
                  <span style={{fontFamily:"'Space Mono',monospace",color:'var(--muted)',fontSize:'0.75rem'}}>CEP: {orderDetail._address.cep}</span>
                </div>
              </div>
            )}

            {/* Desconto manual (coluna orders.manual_discount; total = subtotal − cupom − combo − pontos − manual + frete) */}
            {(() => {
              const dd = orderDetail._discounts || {};
              const curManual = dd.manual || 0;
              const subtotalNow = orderItemsSubtotal(orderDetail, products);
              const freightNow = parseFloat(orderDetail._freight) || 0;
              const parseDisc = () => Math.max(0, Math.round((parseFloat(String(discountInput).replace(',', '.')) || 0) * 100) / 100);
              return (
            <div style={{background:'var(--bg2)',borderRadius:10,padding:'12px 14px',marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:discountInput!==null||curManual?8:0}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'#ffaa00',letterSpacing:'1px'}}>🏷️ DESCONTO MANUAL</div>
                {discountInput===null && <button onClick={()=>setDiscountInput(String(curManual||''))}
                  style={{background:'none',border:'none',color:'#ffaa00',fontSize:'0.62rem',cursor:'pointer',padding:0}}>
                  {curManual ? '✏️ editar' : '+ aplicar desconto'}
                </button>}
              </div>
              {discountInput!==null ? (
                <div>
                  <div style={{fontSize:'0.72rem',color:'var(--muted)',marginBottom:6}}>Valor do desconto (R$)</div>
                  <div style={{display:'flex',gap:6,marginBottom:6}}>
                    <input autoFocus type="number" min="0" step="0.01" value={discountInput} onChange={e=>setDiscountInput(e.target.value)}
                      placeholder="ex: 30"
                      style={{flex:1,minWidth:0,padding:'8px 10px',background:'var(--surface)',border:'1px solid rgba(255,170,0,0.4)',borderRadius:7,color:'var(--text)',fontSize:'0.85rem'}}
                      onKeyDown={e=>{ if(e.key==='Escape') setDiscountInput(null); }} />
                    <button disabled={discountSaving} onClick={async ()=>{
                      const disc = parseDisc();
                      const newTotal = orderTotalWith(subtotalNow, freightNow, dd, disc);
                      setDiscountSaving(true);
                      try {
                        if (sb && orderDetail._supabase) {
                          const { error } = await sb.from('orders').update({ manual_discount: disc, total: newTotal }).eq('id', orderDetail.id);
                          if (error) {
                            const noCol = /manual_discount/i.test(error.message || '');
                            showToast(noCol ? 'Falta aplicar o SQL sql/orders_manual_discount.sql no Supabase — desconto não salvo' : 'Erro ao salvar desconto: ' + error.message, 'error');
                            return;
                          }
                        }
                        const updated = {...orderDetail, _discounts: { ...dd, manual: disc }, _total: newTotal};
                        persistOrders(orders.map(o=>o.id===orderDetail.id?updated:o));
                        setOrderDetail(updated);
                        setDiscountInput(null);
                        showToast(disc>0?`Desconto de R$ ${disc.toLocaleString('pt-BR')} aplicado ✓`:'Desconto removido','success');
                      } finally { setDiscountSaving(false); }
                    }} style={{padding:'8px 14px',background:'rgba(255,170,0,0.15)',border:'1px solid rgba(255,170,0,0.4)',borderRadius:7,color:'#ffaa00',fontWeight:700,fontSize:'0.75rem',cursor:discountSaving?'wait':'pointer'}}>✓</button>
                    <button onClick={()=>setDiscountInput(null)} style={{padding:'8px 10px',background:'none',border:'1px solid var(--border)',borderRadius:7,color:'var(--muted)',fontSize:'0.75rem',cursor:'pointer'}}>✕</button>
                  </div>
                  <div style={{fontSize:'0.72rem',color:'#ffaa00'}}>Novo total: <strong>R$ {orderTotalWith(subtotalNow, freightNow, dd, parseDisc()).toLocaleString('pt-BR')}</strong>
                    {(dd.coupon || dd.bundle || dd.points) ? <span style={{color:'var(--muted)'}}> (já descontados cupom/combo/pontos)</span> : null}</div>
                </div>
              ) : curManual > 0 ? (
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'0.82rem'}}>
                  <span style={{color:'var(--muted)'}}>Desconto aplicado</span>
                  <span style={{fontFamily:"'Space Mono',monospace",fontWeight:700,color:'#ffaa00'}}>− R$ {curManual.toLocaleString('pt-BR')}</span>
                </div>
              ) : null}
            </div>
              );
            })()}

            {/* Pagamento + Obs */}
            <div style={{display:'grid',gridTemplateColumns: orderDetail._notes ? '1fr 1fr' : '1fr',gap:10,marginBottom:16}}>
              {orderDetail._payment && (
                <div style={{background:'var(--bg2)',borderRadius:10,padding:'12px 14px'}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1px',marginBottom:6}}>💳 PAGAMENTO</div>
                  <div style={{fontSize:'0.82rem'}}>{orderDetail._payment}</div>
                </div>
              )}
              {orderDetail._notes && (
                <div style={{background:'var(--bg2)',borderRadius:10,padding:'12px 14px'}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1px',marginBottom:6}}>📝 OBS</div>
                  <div style={{fontSize:'0.82rem'}}>{orderDetail._notes}</div>
                </div>
              )}
              <div style={{background:'var(--bg2)',borderRadius:10,padding:'12px 14px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1px'}}>📦 ENVIO</div>
                  <button onClick={()=>setEditTrackInput(orderDetail.tracking_code||'')} style={{background:'none',border:'none',color:'var(--accent)',fontSize:'0.62rem',cursor:'pointer',padding:0}}>{orderDetail.tracking_code ? '✏️ editar' : '+ adicionar rastreio'}</button>
                </div>
                {editTrackInput !== null ? (
                  <div style={{display:'flex',gap:6,marginBottom:8}}>
                    <input autoFocus value={editTrackInput} onChange={e=>setEditTrackInput(e.target.value)} placeholder="Cole o código de rastreio" style={{flex:1,padding:'7px 10px',background:'var(--surface)',border:'1px solid var(--accent)',borderRadius:7,color:'var(--text)',fontSize:'0.78rem'}} onKeyDown={e=>{ if(e.key==='Enter') saveTrackingManual(orderDetail.id, editTrackInput); if(e.key==='Escape') setEditTrackInput(null); }} />
                    <button onClick={()=>saveTrackingManual(orderDetail.id, editTrackInput)} style={{padding:'7px 12px',background:'var(--accent)',border:'none',borderRadius:7,color:'#000',fontWeight:700,fontSize:'0.72rem',cursor:'pointer'}}>✓</button>
                    <button onClick={()=>setEditTrackInput(null)} style={{padding:'7px 10px',background:'none',border:'1px solid var(--border)',borderRadius:7,color:'var(--muted)',fontSize:'0.72rem',cursor:'pointer'}}>✕</button>
                  </div>
                ) : orderDetail.tracking_code ? (
                  <div style={{marginBottom:8}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                      <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.78rem',color:'var(--text)',flex:1}}>{orderDetail.tracking_code}</span>
                      <button onClick={()=>{navigator.clipboard.writeText(orderDetail.tracking_code);showToast('Código copiado!','success');}} style={{background:'none',border:'1px solid var(--border)',borderRadius:6,color:'var(--accent)',fontSize:'0.65rem',cursor:'pointer',padding:'3px 8px'}}>copiar</button>
                      <a href={`https://melhorrastreio.com.br/rastreio/${orderDetail.tracking_code}`} target="_blank" rel="noreferrer" style={{background:'none',border:'1px solid var(--border)',borderRadius:6,color:'var(--accent)',fontSize:'0.65rem',cursor:'pointer',padding:'3px 8px',textDecoration:'none'}}>rastrear</a>
                    </div>
                    <button onClick={()=>sendTrackingWhatsApp(orderDetail)} style={{width:'100%',padding:'8px',background:'#25d366',border:'none',borderRadius:8,color:'#fff',fontWeight:700,fontSize:'0.75rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>📲 ENVIAR RASTREIO NO WHATSAPP</button>
                  </div>
                ) : (
                  <div style={{fontSize:'0.72rem',color:'var(--muted)'}}>
                    Nenhum rastreio cadastrado.
                    {orderDetail.me_order_id && <button onClick={()=>fetchTrackingFromME(orderDetail)} disabled={trackFetching} style={{display:'block',width:'100%',marginTop:8,padding:'7px',background:'rgba(0,229,195,0.08)',border:'1px solid rgba(0,229,195,0.25)',borderRadius:8,color:'var(--accent)',fontSize:'0.72rem',cursor:trackFetching?'wait':'pointer'}}>{trackFetching ? 'Buscando...' : '🔄 Buscar rastreio no Melhor Envios'}</button>}
                  </div>
                )}
                {orderDetail.label_url && (
                  <a href={orderDetail.label_url} target="_blank" rel="noreferrer" style={{display:'block',padding:'7px 12px',background:'rgba(0,229,195,0.08)',border:'1px solid rgba(0,229,195,0.2)',borderRadius:8,color:'var(--accent)',fontSize:'0.72rem',textAlign:'center',textDecoration:'none',marginTop:8}}>🖨️ Imprimir etiqueta</a>
                )}
              </div>
            </div>

            {/* Marcar como extraviado / reverter */}
            {(orderDetail.status||'pendente') === 'extraviado' ? (
              <button onClick={async()=>{ await setOrderStatus(orderDetail.id, 'enviado'); setOrderDetail(o=>({...o,status:'enviado'})); showToast('Status revertido para Enviado','success'); }}
                style={{width:'100%',padding:'10px',background:'rgba(100,160,255,0.08)',border:'1px solid rgba(100,160,255,0.3)',borderRadius:10,color:'#78aaff',cursor:'pointer',fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',marginBottom:8}}>
                ↩️ REVERTER EXTRAVIO → ENVIADO
              </button>
            ) : ['pago','enviado','entregue'].includes(orderDetail.status||'pendente') && (
              <button onClick={async()=>{ await markExtraviado(orderDetail.id); setOrderDetail(o=>({...o,status:'extraviado'})); }}
                style={{width:'100%',padding:'10px',background:'rgba(255,48,48,0.08)',border:'1px solid rgba(255,48,48,0.35)',borderRadius:10,color:'#ff5050',cursor:'pointer',fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',marginBottom:8}}>
                ⚠️ MARCAR COMO EXTRAVIADO (100% prejuízo)
              </button>
            )}
            <button onClick={()=>{ setOrderDetail(null); setEditItemsMode(false); setDiscountInput(null); }} style={{width:'100%',padding:'11px',background:'none',border:'1px solid var(--border)',borderRadius:10,color:'var(--muted)',cursor:'pointer',fontFamily:"'Space Mono',monospace",fontSize:'0.72rem'}}>Fechar</button>
          </div>
        </div>
      )}

      {/* NOVO PEDIDO MANUAL */}
      {manualOrderModal && (()=>{
        const iSt = { background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:7, padding:'8px 10px', color:'var(--text)', fontSize:'0.82rem', fontFamily:"'DM Sans',sans-serif", width:'100%', boxSizing:'border-box' };
        const lSt = { fontSize:'0.62rem', color:'var(--muted)', marginBottom:3, display:'block' };
        const upd = (f,v) => setManualOrder(m=>({...m,[f]:v}));
        const matches = manualCustomerSearch.trim().length >= 2 ? pastCustomers().filter(c=>{
          const q = manualCustomerSearch.trim().toLowerCase(); const qd = q.replace(/\D/g,'');
          return (c.name||'').toLowerCase().includes(q) || (qd && ((c.cpf||'').replace(/\D/g,'').includes(qd) || (c.phone||'').replace(/\D/g,'').includes(qd)));
        }).slice(0,6) : [];
        const subtotal = manualOrder.items.reduce((s,it)=>{ const p=products.find(x=>x.id===it.peptideId); return s+(p?effectivePrice(p):0)*(it.qty||1); },0);
        return (
        <div className="modal-overlay" onClick={()=>setManualOrderModal(false)} style={{alignItems:'flex-start',paddingTop:24,paddingBottom:24}}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:560,maxHeight:'90vh',overflowY:'auto',width:'100%'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:800}}>＋ Novo Pedido Manual</div>
              <button onClick={()=>setManualOrderModal(false)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'1.1rem'}}>✕</button>
            </div>

            {/* Copiar lista / colar resposta */}
            <div style={{display:'flex',gap:6,marginBottom:14}}>
              <button onClick={()=>{
                const msg = `Olá! Para eu registrar seu pedido, por favor me envie:\n\n👤 *Dados pessoais*\n• Nome completo\n• CPF\n• E-mail\n• Telefone\n\n📦 *Endereço de entrega*\n• CEP\n• Rua e número\n• Complemento (se houver)\n• Bairro\n• Cidade / Estado\n\n🛒 *Pedido*\n• Produto(s) e quantidade\n• Forma de pagamento (PIX ou Cartão 2x)\n\nAssim que receber, te envio o código do pedido. 🙏\n_Vanguard Peptides_ 🧬`;
                const phone = (manualOrder.phone||'').replace(/\D/g,'');
                if (phone) {
                  const intl = phone.startsWith('55') ? phone : '55' + phone;
                  window.open(`https://wa.me/${intl}?text=${encodeURIComponent(msg)}`, '_blank');
                } else {
                  navigator.clipboard.writeText(msg).then(()=>showToast('Mensagem copiada — cole no WhatsApp do cliente','success')).catch(()=>{ prompt('Copie a mensagem:', msg); });
                }
              }} style={{flex:1,padding:'9px',background:'rgba(37,211,102,0.1)',border:'1px solid rgba(37,211,102,0.35)',borderRadius:8,color:'#25d366',cursor:'pointer',fontSize:'0.72rem',fontFamily:"'Space Mono',monospace",fontWeight:700}}>
                📋 {manualOrder.phone ? 'Enviar via WhatsApp' : 'Copiar lista p/ cliente'}
              </button>
              <button onClick={()=>setManualPasteOpen(o=>!o)} style={{flex:1,padding:'9px',background:'rgba(0,229,195,0.1)',border:'1px solid rgba(0,229,195,0.35)',borderRadius:8,color:'var(--accent)',cursor:'pointer',fontSize:'0.72rem',fontFamily:"'Space Mono',monospace",fontWeight:700}}>
                📥 {manualPasteOpen ? 'Fechar' : 'Colar resposta do cliente'}
              </button>
            </div>
            {manualPasteOpen && (
              <div style={{marginBottom:14,padding:10,background:'rgba(0,229,195,0.04)',border:'1px solid rgba(0,229,195,0.2)',borderRadius:8}}>
                <label style={lSt}>Cole abaixo a mensagem do cliente — o sistema tenta reconhecer CPF, e-mail, telefone, CEP, endereço, nome, etc.</label>
                <textarea value={manualPasteText} onChange={e=>setManualPasteText(e.target.value)} placeholder={`Ex.:\nJoão da Silva\nCPF 123.456.789-00\njoao@email.com\n(11) 99999-9999\nCEP 01310-100\nRua Augusta, 100, apto 5\nConsolação - São Paulo/SP\nPIX`} style={{...iSt,minHeight:140,resize:'vertical',fontFamily:"'DM Sans',sans-serif"}} />
                <div style={{display:'flex',gap:6,marginTop:8}}>
                  <button onClick={()=>parseAndFillManualOrder(manualPasteText)} style={{flex:1,padding:'9px',background:'var(--accent)',border:'none',borderRadius:7,color:'#000',fontWeight:700,fontSize:'0.75rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>✨ Preencher campos</button>
                  <button onClick={()=>setManualPasteText('')} style={{padding:'9px 14px',background:'none',border:'1px solid var(--border)',borderRadius:7,color:'var(--muted)',cursor:'pointer',fontSize:'0.72rem'}}>Limpar</button>
                </div>
              </div>
            )}

            <div style={{position:'relative',marginBottom:14}}>
              <label style={lSt}>🔁 Reaproveitar cliente (busca por nome, CPF ou telefone)</label>
              <input style={iSt} placeholder="Digite para buscar pedidos anteriores..." value={manualCustomerSearch} onChange={e=>setManualCustomerSearch(e.target.value)} />
              {matches.length > 0 && (
                <div style={{position:'absolute',top:'100%',left:0,right:0,zIndex:10,background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,marginTop:4,overflow:'hidden',boxShadow:'0 8px 24px rgba(0,0,0,0.4)'}}>
                  {matches.map((c,i)=>(
                    <div key={i} onClick={()=>fillManualFromCustomer(c)} style={{padding:'9px 12px',cursor:'pointer',borderBottom:'1px solid var(--border)',fontSize:'0.8rem'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(0,229,195,0.07)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <div style={{fontWeight:600}}>{c.name||'—'}</div>
                      <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.65rem',color:'var(--muted)'}}>{c.cpf||'sem CPF'}{c.phone?' · '+c.phone:''}{c.address && c.address.cidade?' · '+c.address.cidade+'/'+(c.address.estado||''):''}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.58rem',color:'var(--accent)',letterSpacing:'1.5px',marginBottom:8}}>👤 CLIENTE</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
              <div style={{gridColumn:'1 / -1'}}><label style={lSt}>Nome *</label><input style={iSt} value={manualOrder.name} onChange={e=>upd('name',e.target.value)} /></div>
              <div><label style={lSt}>CPF</label><input style={iSt} value={manualOrder.cpf} onChange={e=>upd('cpf',e.target.value)} placeholder="só números" /></div>
              <div><label style={lSt}>Telefone</label><input style={iSt} value={manualOrder.phone} onChange={e=>upd('phone',e.target.value)} placeholder="(11) 99999-9999" /></div>
              <div style={{gridColumn:'1 / -1'}}><label style={lSt}>E-mail</label><input style={iSt} value={manualOrder.email} onChange={e=>upd('email',e.target.value)} /></div>
            </div>

            <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.58rem',color:'var(--accent)',letterSpacing:'1.5px',marginBottom:8}}>📦 ENDEREÇO</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:8,marginBottom:14}}>
              <div>
                <label style={lSt}>CEP</label>
                <div style={{display:'flex',gap:4}}>
                  <input style={{...iSt,flex:1}} value={manualOrder.cep} onChange={e=>upd('cep',e.target.value)} placeholder="00000-000" />
                  <button onClick={async()=>{ const clean=(manualOrder.cep||'').replace(/\D/g,''); if(clean.length!==8){showToast('CEP inválido','error');return;} try{ const r=await fetch(`https://viacep.com.br/ws/${clean}/json/`); const d=await r.json(); if(d.erro){showToast('CEP não encontrado','error');return;} setManualOrder(m=>({...m,estado:d.uf||m.estado,cidade:d.localidade||m.cidade,bairro:d.bairro||m.bairro,rua:d.logradouro||m.rua})); showToast('Endereço preenchido ✓','success'); }catch{showToast('Erro ao buscar CEP','error');} }} style={{padding:'0 10px',background:'rgba(0,229,195,0.1)',border:'1px solid rgba(0,229,195,0.3)',borderRadius:7,color:'var(--accent)',cursor:'pointer',fontSize:'0.8rem',flexShrink:0}}>🔍</button>
                </div>
              </div>
              <div><label style={lSt}>Rua</label><input style={iSt} value={manualOrder.rua} onChange={e=>upd('rua',e.target.value)} /></div>
              <div><label style={lSt}>Número</label><input style={iSt} value={manualOrder.numero} onChange={e=>upd('numero',e.target.value)} /></div>
              <div><label style={lSt}>Complemento</label><input style={iSt} value={manualOrder.complemento} onChange={e=>upd('complemento',e.target.value)} /></div>
              <div><label style={lSt}>Bairro</label><input style={iSt} value={manualOrder.bairro} onChange={e=>upd('bairro',e.target.value)} /></div>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:8}}>
                <div><label style={lSt}>Cidade</label><input style={iSt} value={manualOrder.cidade} onChange={e=>upd('cidade',e.target.value)} /></div>
                <div><label style={lSt}>UF</label><input style={iSt} value={manualOrder.estado} onChange={e=>upd('estado',e.target.value.toUpperCase().slice(0,2))} maxLength={2} /></div>
              </div>
            </div>

            <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.58rem',color:'var(--accent)',letterSpacing:'1.5px',marginBottom:8}}>🛒 PRODUTOS</div>
            {manualOrder.items.map((it,i)=>{
              const p = products.find(x=>x.id===it.peptideId);
              const unit = p?effectivePrice(p):0;
              return (
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:'1px solid var(--border)',fontSize:'0.82rem'}}>
                  <div style={{flex:1}}>
                    <div>{p?p.name:it.peptideId}</div>
                    <div style={{color:'var(--muted)',fontSize:'0.66rem',fontFamily:"'Space Mono',monospace"}}>R$ {unit.toLocaleString('pt-BR')} / un</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:4}}>
                    <button onClick={()=>setManualOrder(m=>({...m,items:m.items.map((x,j)=>j===i?{...x,qty:Math.max(1,(x.qty||1)-1)}:x)}))} style={{width:24,height:24,borderRadius:6,border:'1px solid var(--border)',background:'rgba(255,255,255,0.05)',color:'var(--text)',cursor:'pointer'}}>−</button>
                    <span style={{fontFamily:"'Space Mono',monospace",minWidth:20,textAlign:'center'}}>{it.qty||1}</span>
                    <button onClick={()=>setManualOrder(m=>({...m,items:m.items.map((x,j)=>j===i?{...x,qty:(x.qty||1)+1}:x)}))} style={{width:24,height:24,borderRadius:6,border:'1px solid var(--border)',background:'rgba(255,255,255,0.05)',color:'var(--text)',cursor:'pointer'}}>+</button>
                  </div>
                  <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.78rem',color:'var(--accent)',minWidth:64,textAlign:'right'}}>R$ {(unit*(it.qty||1)).toLocaleString('pt-BR')}</span>
                  <button onClick={()=>setManualOrder(m=>({...m,items:m.items.filter((_,j)=>j!==i)}))} style={{background:'none',border:'none',color:'#ff5050',cursor:'pointer',fontSize:'0.85rem'}}>✕</button>
                </div>
              );
            })}
            <div style={{display:'flex',gap:6,marginTop:10,marginBottom:14}}>
              <select value={manualAddItemId} onChange={e=>setManualAddItemId(e.target.value)} style={{flex:1,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:7,padding:'8px 10px',color:'var(--text)',fontSize:'0.8rem'}}>
                <option value="">+ Adicionar produto...</option>
                {products.filter(p=>!manualOrder.items.find(it=>it.peptideId===p.id)).map(p=>(
                  <option key={p.id} value={p.id}>{p.name} — R$ {effectivePrice(p).toLocaleString('pt-BR')}</option>
                ))}
              </select>
              <button onClick={()=>{ if(!manualAddItemId)return; setManualOrder(m=>({...m,items:[...m.items,{peptideId:manualAddItemId,qty:1}]})); setManualAddItemId(''); }} style={{padding:'8px 14px',background:'rgba(0,229,195,0.1)',border:'1px solid rgba(0,229,195,0.3)',borderRadius:7,color:'var(--accent)',fontWeight:700,fontSize:'0.75rem',cursor:'pointer'}}>OK</button>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
              <div><label style={lSt}>Pagamento</label>
                <select style={iSt} value={manualOrder.payment} onChange={e=>upd('payment',e.target.value)}>
                  <option value="pix">PIX (à vista)</option>
                  <option value="cartao">Cartão 2x</option>
                </select>
              </div>
              <div><label style={lSt}>Observações</label><input style={iSt} value={manualOrder.notes} onChange={e=>upd('notes',e.target.value)} placeholder="opcional" /></div>
            </div>

            <div style={{background:'rgba(0,229,195,0.05)',border:'1px solid rgba(0,229,195,0.15)',borderRadius:8,padding:'10px 12px',marginBottom:14,fontSize:'0.8rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',color:'var(--muted)'}}><span>Subtotal estimado</span><span style={{fontFamily:"'Space Mono',monospace"}}>R$ {subtotal.toLocaleString('pt-BR')}</span></div>
              <div style={{fontSize:'0.64rem',color:'var(--muted)',marginTop:4}}>Frete e total finais são calculados no servidor ao salvar (PIX = frete grátis).</div>
            </div>

            <button onClick={createManualOrder} disabled={manualOrderSubmitting} style={{width:'100%',padding:'12px',background:'var(--accent)',border:'none',borderRadius:10,color:'#000',fontWeight:700,fontSize:'0.85rem',cursor:manualOrderSubmitting?'wait':'pointer',fontFamily:"'Space Mono',monospace",marginBottom:8,opacity:manualOrderSubmitting?0.6:1}}>
              {manualOrderSubmitting ? 'CRIANDO...' : '✓ CRIAR PEDIDO'}
            </button>
            <button onClick={()=>setManualOrderModal(false)} style={{width:'100%',padding:'10px',background:'none',border:'1px solid var(--border)',borderRadius:10,color:'var(--muted)',cursor:'pointer',fontFamily:"'Space Mono',monospace",fontSize:'0.72rem'}}>Cancelar</button>
          </div>
        </div>
        );
      })()}

      {/* SUCESSO — CÓDIGO DO PEDIDO */}
      {orderSuccessCode && !novoActive && !novoAdmin && (
        <div className="modal-overlay" onClick={()=>setOrderSuccessCode(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:400,textAlign:'center'}}>
            <div style={{fontSize:'2.5rem',marginBottom:12}}>🎉</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.2rem',fontWeight:800,marginBottom:6}}>Pedido enviado!</div>
            <p style={{fontSize:'0.82rem',color:'var(--muted)',marginBottom:24}}>Guarde o código abaixo. Você pode usá-lo a qualquer momento para acompanhar o status do seu pedido.</p>
            <div style={{background:'rgba(0,229,195,0.08)',border:'2px solid var(--accent)',borderRadius:12,padding:'18px 24px',marginBottom:20}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--muted)',letterSpacing:'2px',marginBottom:8}}>SEU CÓDIGO DE PEDIDO</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:'2rem',fontWeight:900,color:'var(--accent)',letterSpacing:'4px'}}>{orderSuccessCode}</div>
            </div>
            <p style={{fontSize:'0.75rem',color:'var(--muted)',marginBottom:20}}>Este código também foi enviado na mensagem do WhatsApp.</p>
            <button onClick={()=>setOrderSuccessCode(null)} style={{width:'100%',padding:'12px',background:'var(--accent)',border:'none',borderRadius:10,color:'#000',fontWeight:700,fontSize:'0.88rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>
              ENTENDI
            </button>
          </div>
        </div>
      )}

      {/* RASTREAMENTO DE PEDIDO */}
      {trackModal && (
        <div className="modal-overlay" onClick={()=>setTrackModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:480}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px'}}>📦 RASTREAR PEDIDO</div>
              <button onClick={()=>setTrackModal(false)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'1.1rem'}}>✕</button>
            </div>
            <p style={{fontSize:'0.82rem',color:'var(--muted)',marginBottom:16}}>Digite o código <span style={{fontFamily:"'Space Mono',monospace",color:'var(--accent)'}}>VG-XXXXXX</span> que você recebeu no WhatsApp ao finalizar o pedido.</p>
            <div style={{display:'flex',gap:8,marginBottom:20}}>
              <input
                style={{flex:1,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 14px',color:'var(--text)',fontSize:'0.88rem',fontFamily:"'DM Sans',sans-serif"}}
                placeholder="Código VG-XXXXXX"
                value={trackQuery}
                onChange={e=>setTrackQuery(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&searchOrders()}
                autoFocus
              />
              <button onClick={()=>searchOrders()} disabled={trackLoading} style={{padding:'10px 18px',background:'var(--accent)',border:'none',borderRadius:8,color:'#000',fontWeight:700,fontSize:'0.82rem',cursor:'pointer',fontFamily:"'Space Mono',monospace",whiteSpace:'nowrap'}}>
                {trackLoading ? '...' : 'BUSCAR'}
              </button>
            </div>

            {trackLoading && (
              <div style={{textAlign:'center',color:'var(--muted)',fontSize:'0.82rem',padding:'20px 0'}}>Buscando seus pedidos...</div>
            )}
            {trackResults === null && !trackLoading && (
              <div style={{textAlign:'center',color:'var(--muted)',fontSize:'0.82rem',padding:'20px 0'}}>⬆ Informe seu CPF acima</div>
            )}
            {trackResults && trackResults.length === 0 && (
              <div style={{textAlign:'center',color:'var(--muted)',fontSize:'0.82rem',padding:'20px 0'}}>Nenhum pedido encontrado. Verifique os dados e tente novamente.</div>
            )}
            {trackResults && trackResults.length > 0 && (
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--muted)',letterSpacing:'1px'}}>
                  {trackResults[0].buyerName && <span style={{color:'var(--text)',fontWeight:700}}>{trackResults[0].buyerName.split(' ')[0]}</span>}
                  {' — '}{trackResults.length} pedido{trackResults.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
            {trackResults && trackResults.length > 0 && trackResults.map(o => {
              const STATUS = { pendente:{emoji:'🟡',label:'Aguardando confirmação',color:'#ffc107'}, pago:{emoji:'✅',label:'Pagamento confirmado',color:'#4cffb0'}, enviado:{emoji:'🚚',label:'A caminho',color:'#64a0ff'}, entregue:{emoji:'🎉',label:'Entregue',color:'var(--accent)'}, cancelado:{emoji:'❌',label:'Cancelado',color:'#ff5050'} };
              const s = STATUS[o.status] || STATUS.pendente;
              return (
                <div key={o.id} style={{background:'var(--bg2)',border:`1px solid ${s.color}33`,borderRadius:12,padding:'14px 16px',marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.62rem',color:'var(--muted)'}}>
                      {o.code && <span style={{color:'var(--accent)',marginRight:8}}>{o.code}</span>}
                      {new Date(o.date).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'})}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6,background:`${s.color}22`,border:`1px solid ${s.color}44`,borderRadius:20,padding:'3px 10px'}}>
                      <span>{s.emoji}</span>
                      <span style={{fontSize:'0.72rem',fontWeight:700,color:s.color,fontFamily:"'Space Mono',monospace"}}>{s.label}</span>
                    </div>
                  </div>
                  <div style={{fontSize:'0.82rem',marginBottom:8}}>
                    {(o.items||[]).map((it,i)=>{
                      const p = products.find(x=>x.id===it.peptideId);
                      return <div key={i} style={{display:'flex',justifyContent:'space-between',color:'var(--text)',marginBottom:2}}>
                        <span>{p?p.name:(it.peptideId||'Produto')}</span>
                        <span style={{color:'var(--muted)'}}>×{it.qty||1}</span>
                      </div>;
                    })}
                  </div>
                  {o.total > 0 && <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.75rem',color:'var(--accent)',textAlign:'right',borderTop:'1px solid var(--border)',paddingTop:8,marginTop:6}}>
                    Total: R$ {o.total.toLocaleString('pt-BR')}
                  </div>}
                  {o.tracking_code && (
                    <div style={{marginTop:10,padding:'10px 12px',background:'rgba(0,229,195,0.05)',border:'1px solid rgba(0,229,195,0.2)',borderRadius:8}}>
                      <div style={{fontSize:'0.62rem',color:'var(--muted)',marginBottom:4}}>🔍 Código de rastreio</div>
                      <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.78rem',color:'var(--text)',marginBottom:8,letterSpacing:'0.5px'}}>{o.tracking_code}</div>
                      <a href={`https://melhorrastreio.com.br/rastreio/${o.tracking_code}`} target="_blank" rel="noreferrer" style={{display:'block',padding:'7px',background:'var(--accent)',borderRadius:7,color:'#000',fontWeight:700,fontSize:'0.72rem',textAlign:'center',textDecoration:'none',fontFamily:"'Space Mono',monospace"}}>📲 ACOMPANHAR ENTREGA</a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LEGAL MODAL */}
      {legalModal && (
        <div className="modal-overlay" onClick={()=>setLegalModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:520,maxHeight:'80vh',overflowY:'auto'}}>
            {legalModal==='privacy' && <>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px',marginBottom:12}}>POLÍTICA DE PRIVACIDADE</div>
              <div style={{fontSize:'0.82rem',lineHeight:1.8,color:'var(--muted)'}}>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>Coleta de dados:</strong> Coletamos nome, CPF, telefone, e-mail e endereço exclusivamente para processamento dos pedidos.</p>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>Uso dos dados:</strong> Seus dados são usados apenas para entrega e comunicação sobre seu pedido. Não compartilhamos com terceiros.</p>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>Armazenamento:</strong> Os dados são armazenados de forma segura e podem ser solicitados para exclusão a qualquer momento via <a href="mailto:admin@vanguardpep.com" style={{color:'var(--accent)'}}>admin@vanguardpep.com</a>.</p>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>LGPD:</strong> Em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018). Para exercer seus direitos, entre em contato pelo e-mail acima.</p>
                <p><strong style={{color:'var(--text)'}}>Contato DPO:</strong> admin@vanguardpep.com</p>
              </div>
            </>}
            {legalModal==='terms' && <>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px',marginBottom:12}}>TERMOS DE USO</div>
              <div style={{fontSize:'0.82rem',lineHeight:1.8,color:'var(--muted)'}}>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>Finalidade:</strong> Todos os produtos comercializados pela Vanguard Labs são destinados exclusivamente a pesquisa científica in vitro. Não são medicamentos nem suplementos.</p>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>Responsabilidade:</strong> O comprador assume total responsabilidade pelo uso, armazenamento e manuseio dos produtos adquiridos.</p>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>Idade mínima:</strong> Venda restrita a maiores de 18 anos.</p>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>Pagamento:</strong> Os pedidos são confirmados após envio via WhatsApp e confirmação do pagamento.</p>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>Entrega:</strong> Prazos são estimados e podem variar conforme localidade e transportadora.</p>
                <p><strong style={{color:'var(--text)'}}>Contato:</strong> admin@vanguardpep.com</p>
              </div>
            </>}
            {legalModal==='research' && <>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px',marginBottom:12}}>RESEARCH USE ONLY</div>
              <div style={{fontSize:'0.82rem',lineHeight:1.8,color:'var(--muted)'}}>
                <p style={{marginBottom:10}}>Os peptídeos disponibilizados pela Vanguard Labs são produzidos e comercializados <strong style={{color:'var(--text)'}}>exclusivamente para fins de pesquisa científica</strong>.</p>
                <p style={{marginBottom:10}}>Estes produtos <strong style={{color:'var(--text)'}}>NÃO foram avaliados pela ANVISA</strong> para uso humano ou animal. Não são medicamentos, suplementos alimentares ou produtos terapêuticos registrados.</p>
                <p>Ao adquirir qualquer produto, o comprador declara estar ciente desta condição e assume total responsabilidade pelo uso.</p>
              </div>
            </>}
            <button onClick={()=>setLegalModal(null)} style={{width:'100%',marginTop:20,padding:'10px',background:'none',border:'1px solid var(--border)',borderRadius:10,color:'var(--muted)',cursor:'pointer',fontFamily:"'Space Mono',monospace",fontSize:'0.72rem'}}>Fechar</button>
          </div>
        </div>
      )}

      {/* PIX MODAL */}
      {pixModal && (
        <div className="modal-overlay" onClick={()=>setPixModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:460}}>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--accent)',letterSpacing:'1.5px',marginBottom:16}}>💳 COBRANÇA PIX</div>

            {/* Info do pedido */}
            <div style={{padding:'10px 14px',background:'rgba(0,229,195,0.05)',border:'1px solid rgba(0,229,195,0.15)',borderRadius:10,marginBottom:14,fontSize:'0.82rem'}}>
              <div style={{fontWeight:700,color:'var(--accent)',marginBottom:2}}>{pixModal.buyerName}</div>
              <div style={{color:'var(--muted)',fontSize:'0.72rem'}}>{pixModal._phone||'—'} · CPF {pixModal._cpf||'—'}</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontWeight:700,color:'var(--text)',marginTop:6,fontSize:'1rem'}}>
                R$ {(() => { const tot = pixModal._total || 0; return tot.toLocaleString('pt-BR',{minimumFractionDigits:2}); })()}
              </div>
            </div>

            {/* Passo 1 — gerar no DominiPay */}
            <div style={{fontSize:'0.72rem',color:'var(--muted)',marginBottom:8}}>1. Gere a cobrança no DominiPay e copie o código PIX</div>
            <button onClick={()=>{ const tot = pixModal._total||0; navigator.clipboard.writeText(tot.toLocaleString('pt-BR',{minimumFractionDigits:2})); showToast('Valor copiado!','success'); setTimeout(()=>window.open('https://admin.dominipay.com.br/dashboard','_blank'),400); }} style={{width:'100%',padding:'10px',background:'rgba(139,0,0,0.12)',border:'1px solid rgba(220,80,80,0.3)',borderRadius:10,color:'#e05555',fontWeight:700,fontSize:'0.82rem',cursor:'pointer',fontFamily:"'Space Mono',monospace",marginBottom:14}}>
              💳 ABRIR DOMINIPAY (copia valor)
            </button>

            {/* Passo 2 — colar código e enviar */}
            <div style={{fontSize:'0.72rem',color:'var(--muted)',marginBottom:6}}>2. Cole o código PIX aqui e envie para o cliente</div>
            <textarea
              placeholder="Cole o código PIX aqui (copia e cola do DominiPay)..."
              value={pixCode}
              onChange={e=>setPixCode(e.target.value)}
              style={{width:'100%',minHeight:80,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 10px',color:'var(--text)',fontSize:'0.75rem',fontFamily:"'Space Mono',monospace",resize:'vertical',boxSizing:'border-box',marginBottom:10}}
            />
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <button
                disabled={!pixCode.trim()}
                onClick={()=>{
                  const firstName = (pixModal.buyerName||'Cliente').split(' ')[0];
                  const tot = (pixModal._total||0).toLocaleString('pt-BR',{minimumFractionDigits:2});
                  const code = pixModal._code||'';
                  const msg = `✅ *Olá, ${firstName}! Segue o PIX para pagamento do seu pedido Vanguard Peptides.*${code?`\n\n📋 *Pedido:* ${code}`:''}
💰 *Valor:* R$ ${tot}

_Vou te mandar o código PIX agora, é só copiar e colar no seu banco!_
⚠️ _O código expira em 10 minutos!_
_Vanguard Peptides_ 🧬`;
                  const digits = (pixModal._phone||'').replace(/\D/g,'');
                  const intl = digits.startsWith('55') ? digits : '55'+digits;
                  window.open(`https://wa.me/${intl}?text=${encodeURIComponent(msg)}`,'_blank');
                }}
                style={{flex:1,padding:'11px',background: pixCode.trim() ? 'var(--accent)' : 'rgba(0,229,195,0.2)',border:'none',borderRadius:10,color: pixCode.trim() ? '#000' : 'var(--muted)',fontWeight:700,fontSize:'0.78rem',cursor: pixCode.trim() ? 'pointer' : 'default',fontFamily:"'Space Mono',monospace",transition:'all 0.2s'}}
              >
                📲 ENVIAR MENSAGEM
              </button>
              <button
                disabled={!pixCode.trim()}
                onClick={()=>{ navigator.clipboard.writeText(pixCode.trim()); showToast('Código PIX copiado! Cole no WhatsApp.','success'); }}
                style={{flex:1,padding:'11px',background: pixCode.trim() ? 'rgba(255,200,0,0.12)' : 'rgba(255,200,0,0.04)',border:`1px solid ${pixCode.trim()?'rgba(255,200,0,0.4)':'rgba(255,200,0,0.1)'}`,borderRadius:10,color: pixCode.trim() ? '#ffc800' : 'var(--muted)',fontWeight:700,fontSize:'0.78rem',cursor: pixCode.trim() ? 'pointer' : 'default',fontFamily:"'Space Mono',monospace",transition:'all 0.2s'}}
              >
                📋 COPIAR CÓDIGO
              </button>
            </div>
            <div style={{fontSize:'0.65rem',color:'var(--muted)',textAlign:'center',marginBottom:8}}>Envie a mensagem → vá ao WhatsApp → cole o código como segunda mensagem</div>
            <button onClick={()=>setPixModal(null)} style={{width:'100%',padding:'9px',background:'none',border:'1px solid var(--border)',borderRadius:10,color:'var(--muted)',fontSize:'0.78rem',cursor:'pointer'}}>Fechar</button>
          </div>
        </div>
      )}

      {/* ETIQUETA MODAL */}
      {etiquetaModal && (
        <div className="modal-overlay" onClick={()=>{ if(etiquetaStep!=='loading'){ setEtiquetaModal(null); setEtiquetaStep('idle'); setEtiquetaResult(null); }}}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:480}}>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--accent)',letterSpacing:'1.5px',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
              <span>{etiquetaModal._poolOnly ? '📮 REMETENTES' : '🏷️ GERAR ETIQUETA'}</span>
              {(etiquetaModal._poolOnly || etiquetaStep==='settings')
                ? <div style={{display:'flex',border:'1px solid var(--border)',borderRadius:6,overflow:'hidden'}}>
                    {[['prod','PRODUÇÃO'],['sandbox','TESTE']].map(([v,l])=>(
                      <button key={v} onClick={()=>setMeEnv(v)} style={{padding:'4px 10px',border:'none',cursor:'pointer',fontSize:'0.58rem',fontFamily:"'Space Mono',monospace",fontWeight:700,background: meEnv===v ? (v==='sandbox'?'#ff9800':'var(--accent)') : 'transparent',color: meEnv===v ? '#000' : 'var(--muted)'}}>{l}</button>
                    ))}
                  </div>
                : isSandbox && <span style={{background:'#ff9800',color:'#000',borderRadius:4,padding:'2px 8px',fontWeight:700}}>MODO TESTE</span>}
            </div>
            {isSandbox && <div style={{fontSize:'0.66rem',color:'#ff9800',background:'rgba(255,152,0,0.08)',border:'1px solid rgba(255,152,0,0.25)',borderRadius:8,padding:'8px 10px',marginBottom:12}}>🧪 Modo teste — usa o sandbox do Melhor Envios. Etiquetas são fictícias, sem cobrança, e nada é gravado no pedido.</div>}

            {/* STEP: settings / pool manager */}
            {etiquetaStep==='settings' && <>
              <div style={{fontSize:'0.68rem',color:'var(--muted)',marginBottom:10,letterSpacing:'0.5px',textTransform:'uppercase'}}>🎲 Pool de Remetentes{isSandbox ? ' de Teste' : ''} ({activePool.length})</div>
              <div style={{maxHeight:180,overflowY:'auto',display:'flex',flexDirection:'column',gap:6,marginBottom:10}}>
                {activePool.map((r,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',background:'rgba(0,229,195,0.04)',border:'1px solid rgba(0,229,195,0.12)',borderRadius:8,fontSize:'0.72rem'}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{r.name}</div>
                      <div style={{color:'var(--muted)',fontSize:'0.62rem'}}>{r.district} · {r.postal_code}</div>
                    </div>
                    <button onClick={()=>{ if (window.confirm(`Remover ${r.name} da pool de remetentes?`)) persistActivePool(activePool.filter((_,j)=>j!==i)); }} style={{background:'none',border:'none',color:'#ff5050',cursor:'pointer',fontSize:'0.85rem',padding:'0 4px',flexShrink:0}}>✕</button>
                  </div>
                ))}
                {activePool.length===0 && <div style={{fontSize:'0.72rem',color:'var(--muted)',textAlign:'center',padding:'10px 0'}}>Pool vazio — adicione remetentes abaixo ou preencha manualmente.</div>}
              </div>
              {isSandbox
                ? <button onClick={()=>persistTestPool(TEST_ME_POOL)} style={{width:'100%',padding:'8px',background:'rgba(255,152,0,0.08)',border:'1px solid rgba(255,152,0,0.3)',borderRadius:8,color:'#ff9800',fontSize:'0.72rem',cursor:'pointer',marginBottom:12}}>↺ Restaurar pool de teste ({TEST_ME_POOL.length} remetentes fictícios)</button>
                : <button onClick={recoverPoolFromME} disabled={poolRecovering} style={{width:'100%',padding:'8px',background:'rgba(0,229,195,0.08)',border:'1px solid rgba(0,229,195,0.25)',borderRadius:8,color:'var(--accent)',fontSize:'0.72rem',cursor:poolRecovering?'wait':'pointer',marginBottom:12}}>{poolRecovering ? 'Buscando no Melhor Envios...' : '↺ Recuperar remetentes do histórico do Melhor Envios'}</button>}
              <div style={{fontSize:'0.68rem',color:'var(--muted)',marginBottom:8,letterSpacing:'0.5px',textTransform:'uppercase'}}>Adicionar novo remetente</div>
              {[['name','Nome completo',null,null],['document','CPF','00000000000','11 dígitos sem pontos'],['phone','Telefone','11999999999','DDD + número'],['email','E-mail',null,null],['postal_code','CEP','00000000','8 dígitos'],['address','Rua',null,null],['number','Número',null,null],['complement','Complemento',null,null],['district','Bairro',null,null],['city','Cidade',null,null],['state','UF (sigla)','SP','2 letras: SP, RJ, MG...']].map(([k,lbl,ph,hint])=>(
                <div key={k} style={{marginBottom:6}}>
                  <label style={{fontSize:'0.6rem',color:'var(--muted)',display:'block',marginBottom:2}}>{lbl}{hint && <span style={{marginLeft:6,opacity:0.6}}>{hint}</span>}</label>
                  <input style={{width:'100%',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'6px 10px',color:'var(--text)',fontSize:'0.78rem',boxSizing:'border-box'}}
                    placeholder={ph||''}
                    maxLength={k==='state'?2:undefined}
                    value={meForm[k]||''} onChange={e=>setMeForm(f=>({...f,[k]: k==='state' ? e.target.value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,2) : e.target.value}))} />
                </div>
              ))}
              <div style={{display:'flex',gap:8,marginTop:10}}>
                <button onClick={()=>{ if(!meForm.name||!meForm.document||!meForm.postal_code) return; if(!isSandbox && isTestSender(meForm)) { showToast('CPF de teste/fictício não pode entrar na pool de produção','error'); return; } persistActivePool([...activePool,{...meForm,state:(meForm.state||'').toUpperCase().slice(0,2)}]); setMeForm({name:'',phone:'',email:'',document:'',address:'',number:'',complement:'',district:'',city:'',state:'',postal_code:''}); }} style={{flex:1,padding:'9px',background:'rgba(0,229,195,0.12)',border:'1px solid rgba(0,229,195,0.3)',borderRadius:8,color:'var(--accent)',fontWeight:700,fontSize:'0.75rem',cursor:'pointer'}}>+ ADICIONAR AO POOL</button>
                <button onClick={saveMeSettings} style={{flex:1,padding:'9px',background:'var(--accent)',border:'none',borderRadius:8,color:'#000',fontWeight:700,fontSize:'0.75rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>{etiquetaModal._poolOnly ? 'DEFINIR COMO ATIVO' : 'USAR ESTE AGORA'}</button>
              </div>
            </>}

            {/* STEP: select service */}
            {etiquetaStep==='select' && etiquetaModal && <>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                <div style={{fontSize:'0.72rem',color:'var(--muted)'}}>Escolha o serviço para <strong style={{color:'var(--text)'}}>{etiquetaModal.buyerName}</strong>:</div>
                <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 10px',background:'rgba(0,229,195,0.06)',border:'1px solid rgba(0,229,195,0.2)',borderRadius:8,flexShrink:0}}>
                  {meBalance?.loading && <span style={{fontSize:'0.65rem',color:'var(--muted)'}}>⏳ carregando...</span>}
                  {meBalance?.error && <span onClick={()=>alert('[ME /me erro]\n'+meBalance.error)} style={{fontSize:'0.65rem',color:'#ff5050',cursor:'pointer'}} title="Clique para ver detalhes">⚠️ saldo</span>}
                  {meBalance?.value != null && <>
                    <span style={{fontSize:'0.6rem',color:'var(--muted)'}}>💰 carteira</span>
                    <span style={{fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:'0.78rem',color: meBalance.value < 20 ? '#ff9800' : 'var(--accent)'}}>R$ {meBalance.value.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                  </>}
                  <button onClick={fetchMeBalance} title="Atualizar saldo" style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.7rem',padding:0,lineHeight:1}}>↻</button>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
                {meServices.map(svc=>(
                  <button key={svc.id} onClick={()=>{ setSelectedService(svc); setEtiquetaStep('confirm'); }} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'rgba(0,229,195,0.04)',border:'1px solid rgba(0,229,195,0.15)',borderRadius:10,cursor:'pointer',textAlign:'left',width:'100%',transition:'border-color 0.15s'}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,229,195,0.5)'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(0,229,195,0.15)'}>
                    {svc.company?.picture && <img src={svc.company.picture} alt={svc.company.name||''} style={{width:32,height:32,objectFit:'contain',borderRadius:4,flexShrink:0}} />}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:'0.8rem',color:'var(--text)'}}>{svc.company?.name} — {svc.name}</div>
                      <div style={{fontSize:'0.68rem',color:'var(--muted)',marginTop:2}}>
                        Prazo: {svc.custom_delivery_time ?? svc.delivery_time ?? '?'} dias úteis
                        {svc.delivery_range && ` (${svc.delivery_range.min}–${svc.delivery_range.max})`}
                      </div>
                    </div>
                    <div style={{fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:'0.85rem',color:'var(--accent)',flexShrink:0}}>
                      R$ {Number(svc.price||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}
                    </div>
                  </button>
                ))}
              </div>
              <div style={{fontSize:'0.62rem',color:'var(--muted)',textAlign:'center',marginBottom:8}}>Remetente: <strong style={{color:'var(--text)'}}>{meSettings?.name}</strong> · <button onClick={()=>{ setMeForm(meSettings); setEtiquetaStep('settings'); }} style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:'0.62rem',padding:0}}>alterar</button></div>
            </>}

            {/* STEP: confirm */}
            {etiquetaStep==='confirm' && etiquetaModal && <>
              <div style={{marginBottom:14,padding:'10px 14px',background:'rgba(0,229,195,0.05)',border:'1px solid rgba(0,229,195,0.2)',borderRadius:10,fontSize:'0.78rem'}}>
                <div style={{color:'var(--accent)',fontWeight:700,marginBottom:4}}>{etiquetaModal.buyerName}</div>
                {(()=>{ const a = etiquetaModal._address || etiquetaModal.address || {}; return <>
                  <div style={{color:'var(--muted)'}}>{a.rua||'—'}, {a.numero||'s/n'} — {a.bairro||'—'}</div>
                  <div style={{color:'var(--muted)'}}>{a.cidade||'—'}/{a.estado||'—'} · CEP {a.cep||'—'}</div>
                  <div style={{color:'var(--muted)'}}>E-mail: {etiquetaModal._email||<span style={{color:'#ff9800'}}>sem e-mail (usa o do remetente)</span>}</div>
                </>; })()}
                <button onClick={()=>{ const o = etiquetaModal; setEtiquetaModal(null); setEtiquetaStep('idle'); setOrderDetail(o); openEditCustomer(o); }} style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:'0.68rem',padding:0,marginTop:4}}>✏️ editar dados do cliente</button>
                {selectedService && <div style={{color:'var(--muted)',marginTop:4}}>Serviço: <strong style={{color:'var(--text)'}}>{selectedService.company?.name} — {selectedService.name}</strong> · R$ {Number(selectedService.price||0).toLocaleString('pt-BR',{minimumFractionDigits:2})} · {selectedService.custom_delivery_time ?? selectedService.delivery_time ?? '?'}d úteis</div>}
              </div>
              <div style={{fontSize:'0.68rem',color:'var(--muted)',marginBottom:6,letterSpacing:'0.5px',textTransform:'uppercase'}}>📄 Declaração de conteúdo</div>
              <div style={{display:'flex',gap:8,marginBottom:8}}>
                <div style={{flex:3}}>
                  <div style={{fontSize:'0.62rem',color:'var(--muted)',marginBottom:4}}>Nome do conteúdo</div>
                  <input value={declNome} onChange={e=>setDeclNome(e.target.value)} placeholder="Ex: Suplemento" style={{width:'100%',padding:'8px 10px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:'0.8rem',boxSizing:'border-box'}} />
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.62rem',color:'var(--muted)',marginBottom:4}}>Qtd</div>
                  <input type="number" min="1" step="1" value={declQtd} onChange={e=>setDeclQtd(e.target.value)} placeholder="1" style={{width:'100%',padding:'8px 10px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:'0.8rem',boxSizing:'border-box'}} />
                </div>
                <div style={{flex:2}}>
                  <div style={{fontSize:'0.62rem',color:'var(--muted)',marginBottom:4}}>Valor declarado (R$)</div>
                  <input type="number" min="0" step="0.01" value={declValor} onChange={e=>setDeclValor(e.target.value)} placeholder="0.00" style={{width:'100%',padding:'8px 10px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:'0.8rem',boxSizing:'border-box'}} />
                </div>
              </div>
              <div style={{fontSize:'0.68rem',color:'var(--muted)',marginBottom:6,letterSpacing:'0.5px',textTransform:'uppercase'}}>📦 Embalagem</div>
              <div style={{display:'flex',gap:8,marginBottom:14}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.62rem',color:'var(--muted)',marginBottom:4}}>Peso (kg)</div>
                  <input type="number" min="0.1" step="0.1" value={declPeso} onChange={e=>setDeclPeso(e.target.value)} placeholder="0.3" style={{width:'100%',padding:'8px 10px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:'0.8rem',boxSizing:'border-box'}} />
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.62rem',color:'var(--muted)',marginBottom:4}}>Comp (cm)</div>
                  <input type="number" min="1" step="1" value={declComp} onChange={e=>setDeclComp(e.target.value)} placeholder="12" style={{width:'100%',padding:'8px 10px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:'0.8rem',boxSizing:'border-box'}} />
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.62rem',color:'var(--muted)',marginBottom:4}}>Larg (cm)</div>
                  <input type="number" min="1" step="1" value={declLarg} onChange={e=>setDeclLarg(e.target.value)} placeholder="6" style={{width:'100%',padding:'8px 10px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:'0.8rem',boxSizing:'border-box'}} />
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.62rem',color:'var(--muted)',marginBottom:4}}>Alt (cm)</div>
                  <input type="number" min="1" step="1" value={declAlt} onChange={e=>setDeclAlt(e.target.value)} placeholder="5" style={{width:'100%',padding:'8px 10px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:'0.8rem',boxSizing:'border-box'}} />
                </div>
              </div>
              <div style={{marginBottom:12,border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',background:'rgba(255,255,255,0.03)',cursor:'pointer'}} onClick={()=>{ if(!editingRem) setMeForm({...meSettings}); setEditingRem(v=>!v); }}>
                  <div>
                    <div style={{fontSize:'0.6rem',color:'var(--muted)',letterSpacing:'0.5px',textTransform:'uppercase',marginBottom:2}}>📮 Remetente</div>
                    <div style={{fontSize:'0.78rem',color:'var(--text)',fontWeight:600}}>{meSettings?.name}</div>
                    <div style={{fontSize:'0.65rem',color:'var(--muted)'}}>{meSettings?.address}, {meSettings?.number} — {meSettings?.city}/{meSettings?.state} · {meSettings?.postal_code}</div>
                  </div>
                  <span style={{fontSize:'0.7rem',color:'var(--accent)',flexShrink:0,marginLeft:12}}>{editingRem ? '▲ fechar' : '✏️ editar'}</span>
                </div>
                {editingRem && <div style={{padding:'12px',borderTop:'1px solid var(--border)',display:'flex',flexDirection:'column',gap:8}}>
                  {[['name','Nome completo'],['document','CPF (sem pontos)'],['phone','Telefone (DDD+número)'],['email','E-mail'],['postal_code','CEP (sem traço)'],['address','Rua'],['number','Número'],['complement','Complemento'],['district','Bairro'],['city','Cidade']].map(([k,lbl])=>(
                    <div key={k}>
                      <div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:3}}>{lbl}</div>
                      <input value={meForm[k]||''} onChange={e=>setMeForm(f=>({...f,[k]:e.target.value}))} style={{width:'100%',padding:'7px 10px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:7,color:'var(--text)',fontSize:'0.78rem',boxSizing:'border-box'}} />
                    </div>
                  ))}
                  <div>
                    <div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:3}}>UF (2 letras)</div>
                    <input value={meForm.state||''} onChange={e=>setMeForm(f=>({...f,state:e.target.value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,2)}))} maxLength={2} style={{width:'100%',padding:'7px 10px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:7,color:'var(--text)',fontSize:'0.78rem',boxSizing:'border-box'}} />
                  </div>
                  <button onClick={()=>{ const s={...meForm,state:(meForm.state||'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,2)}; if(isSandbox){ setMeSettings({...s,_test:true}); } else { if(isTestSender(s)) { showToast('CPF de teste/fictício não pode ser remetente em produção','error'); return; } setMeSettings(s); localStorage.setItem('vg-me-settings',JSON.stringify(s)); } setEditingRem(false); }} style={{padding:'9px',background:'var(--accent)',border:'none',borderRadius:8,color:'#000',fontWeight:700,fontSize:'0.78rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>💾 SALVAR REMETENTE</button>
                </div>}
              </div>
              <div style={{fontSize:'0.62rem',color:'var(--muted)',marginBottom:10,textAlign:'right'}}><button onClick={()=>setEtiquetaStep('select')} style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:'0.62rem',padding:0}}>← alterar serviço</button></div>
              <button onClick={confirmarEtiqueta} style={{width:'100%',padding:'11px',background:'var(--accent)',border:'none',borderRadius:10,color:'#000',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>✅ GERAR ETIQUETA</button>
            </>}

            {/* STEP: loading */}
            {etiquetaStep==='loading' && <div style={{textAlign:'center',padding:'30px 0',color:'var(--muted)',fontSize:'0.85rem'}}>{selectedService ? '⏳ Gerando etiqueta, aguarde...' : '🔍 Buscando serviços disponíveis...'}</div>}

            {/* STEP: done */}
            {etiquetaStep==='done' && etiquetaResult && <>
              <div style={{textAlign:'center',marginBottom:16}}>
                <div style={{fontSize:'2rem',marginBottom:8}}>✅</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'1rem',marginBottom:4}}>Etiqueta gerada!</div>
                {etiquetaResult.trackCode && <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.75rem',color:'var(--accent)',marginBottom:12}}>Rastreio: {etiquetaResult.trackCode}</div>}
              </div>
              {etiquetaResult.labelUrl && <a href={etiquetaResult.labelUrl} target="_blank" rel="noreferrer" style={{display:'block',width:'100%',padding:'11px',background:'var(--accent)',border:'none',borderRadius:10,color:'#000',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',fontFamily:"'Space Mono',monospace",textAlign:'center',textDecoration:'none',marginBottom:8}}>🖨️ IMPRIMIR ETIQUETA</a>}
              <button onClick={()=>{ setEtiquetaModal(null); setEtiquetaStep('idle'); setEtiquetaResult(null); }} style={{width:'100%',padding:'10px',background:'none',border:'1px solid var(--border)',borderRadius:10,color:'var(--muted)',fontSize:'0.78rem',cursor:'pointer'}}>Fechar</button>
            </>}

            {/* STEP: error */}
            {etiquetaStep==='error' && <>
              <div style={{textAlign:'center',marginBottom:16}}>
                <div style={{fontSize:'2rem',marginBottom:8}}>❌</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'1rem',marginBottom:8}}>Erro ao gerar etiqueta</div>
                <div style={{fontSize:'0.72rem',color:'#ff5050',background:'rgba(255,80,80,0.08)',border:'1px solid rgba(255,80,80,0.2)',borderRadius:8,padding:'10px',textAlign:'left'}}>{etiquetaError}</div>
              </div>
              <button onClick={()=>{ setMeForm(meSettings||{}); setEtiquetaStep('settings'); }} style={{width:'100%',padding:'10px',background:'rgba(0,229,195,0.1)',border:'1px solid rgba(0,229,195,0.3)',borderRadius:10,color:'var(--accent)',fontSize:'0.78rem',cursor:'pointer',marginBottom:8}}>Tentar novamente</button>
              <button onClick={()=>{ setEtiquetaModal(null); setEtiquetaStep('idle'); }} style={{width:'100%',padding:'10px',background:'none',border:'1px solid var(--border)',borderRadius:10,color:'var(--muted)',fontSize:'0.78rem',cursor:'pointer'}}>Fechar</button>
            </>}
          </div>
        </div>
      )}

      {/* ADD TO CART MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.62rem",color:"var(--accent)",letterSpacing:"1.5px",marginBottom:6}}>
              {CATEGORIES.find(c=>c.id===modal.peptide.category)?.icon} {CATEGORIES.find(c=>c.id===modal.peptide.category)?.name?.toUpperCase()}
            </div>
            <div className="modal-title">{modal.peptide.name}</div>
            <div className="modal-sub">{modal.peptide.desc}</div>

            <label className="modal-label">Seu nome</label>
            <input id="modal-name-input" className="modal-input" value={formName} onChange={e=>{ setFormName(e.target.value); const er=document.getElementById('modal-name-error'); if(er) er.style.display='none'; const el=document.getElementById('modal-name-input'); if(el) el.style.borderColor=''; }} placeholder="Como deseja ser identificado" autoFocus />
            <div id="modal-name-error" style={{display:'none',color:'#ff5050',fontSize:'0.7rem',fontFamily:"'Space Mono',monospace",marginTop:-12,marginBottom:8}}>⚠️ Preencha seu nome para continuar</div>

            <label className="modal-label">Quantidade</label>
            {(() => {
              const alreadyInCart = peptideCartQty(modal.peptide.id);
              return alreadyInCart > 0 ? (
                <div style={{fontSize:'0.72rem',color:'var(--accent)',fontFamily:"'Space Mono',monospace",marginBottom:8,padding:'6px 10px',background:'rgba(0,229,195,0.06)',borderRadius:6,border:'1px solid rgba(0,229,195,0.15)'}}>
                  ℹ️ Você já tem <strong>{alreadyInCart}</strong> no carrinho — isso será somado
                </div>
              ) : null;
            })()}
            <div className="qty-row">
              <button className="qty-big-btn" onClick={()=>setFormQty(q=>Math.max(1,q-1))}>−</button>
              <div className="qty-big-num">{formQty}</div>
              <button className="qty-big-btn" onClick={()=>setFormQty(q=>{const avail=availableStock(modal.peptide.id); const inCart=orders.find(o=>!o._supabase&&o.peptideId===modal.peptide.id&&o.buyerName?.toLowerCase()===formName.toLowerCase())?.qty||0; return avail>0?Math.min(avail-inCart,q+1):q+1;})}>+</button>
            </div>
            {availableStock(modal.peptide.id) > 0 && (
              <div style={{textAlign:'center',fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",color: availableStock(modal.peptide.id)<=5 ? '#ffaa1e' : 'var(--muted)',marginTop:4}}>
                {availableStock(modal.peptide.id)<=5 ? '⚠️ ' : ''}Disponível: {availableStock(modal.peptide.id)} unidade{availableStock(modal.peptide.id)===1?'':'s'}
              </div>
            )}

            <div className="price-preview">
              <div>
                <div className="price-preview-label">{formQty} ampola{formQty!==1?"s":""}</div>
                <div style={{fontSize:"0.7rem",color:"var(--muted)",marginTop:2}}>
                  {(productPromo[modal.peptide.id]||0) > 0 && <span style={{textDecoration:'line-through',marginRight:6,opacity:0.6}}>R$ {modal.peptide.price}</span>}
                  R$ {effectivePrice(modal.peptide)} × {formQty}
                </div>
              </div>
              <div className="price-preview-value">R$ {(effectivePrice(modal.peptide) * formQty).toLocaleString("pt-BR")}</div>
            </div>

            <button className="modal-confirm-btn" onClick={()=>{
              if (!formName.trim()) {
                document.getElementById('modal-name-input').focus();
                document.getElementById('modal-name-input').style.borderColor='#ff5050';
                document.getElementById('modal-name-error').style.display='block';
                setTimeout(()=>{ document.getElementById('modal-name-input').style.borderColor=''; }, 2000);
                return;
              }
              handleAddToCart();
            }}>
              🛒 ADICIONAR AO CARRINHO
            </button>
            <button className="modal-cancel-btn" onClick={()=>setModal(null)}>CANCELAR</button>

            {modal.peptide.packs && modal.peptide.packs.length > 0 && (
              <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid var(--border)'}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--accent)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:12}}>📦 Packs Protocolo</div>
                {modal.peptide.packs.map((pack, pi) => {
                  const basePrice = effectivePrice(modal.peptide);
                  const packUnitPrice = Math.round(basePrice * (1 - pack.discount / 100));
                  const packTotal = packUnitPrice * pack.qty;
                  const originalTotal = basePrice * pack.qty;
                  return (
                    <div key={pi} style={{background:'rgba(0,229,195,0.04)',border:'1px solid rgba(0,229,195,0.15)',borderRadius:10,padding:'12px',marginBottom:8}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'0.88rem',color:'var(--text)'}}>{pack.name}</div>
                          {pack.desc && <div style={{fontSize:'0.68rem',color:'var(--muted)',marginTop:2}}>{pack.desc}</div>}
                          <div style={{fontSize:'0.7rem',color:'var(--muted)',marginTop:4}}>{pack.qty} ampola{pack.qty!==1?'s':''}</div>
                        </div>
                        <div style={{textAlign:'right',flexShrink:0,marginLeft:12}}>
                          <div style={{fontSize:'0.65rem',color:'var(--muted)',textDecoration:'line-through'}}>R$ {originalTotal.toLocaleString('pt-BR')}</div>
                          <div style={{fontFamily:"'Space Mono',monospace",fontWeight:700,color:'var(--accent)',fontSize:'0.9rem'}}>R$ {packTotal.toLocaleString('pt-BR')}</div>
                          <div style={{fontSize:'0.6rem',color:'#4ade80',fontFamily:"'Space Mono',monospace"}}>-{pack.discount}% OFF</div>
                        </div>
                      </div>
                      <button onClick={()=>{ addPackToCart(modal.peptide, pack); setModal(null); }} style={{width:'100%',padding:'9px',background:'linear-gradient(135deg,rgba(0,229,195,0.18),rgba(0,229,195,0.08))',border:'1px solid rgba(0,229,195,0.35)',borderRadius:8,color:'var(--accent)',fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',fontWeight:700,cursor:'pointer',letterSpacing:'0.5px'}}>
                        📦 ADICIONAR PACK
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RODAPÉ */}
      <footer className="site-footer">
        <div className="footer-disclaimer">
          <strong>⚠️ AVISO IMPORTANTE</strong><br/>
          Todos os produtos são destinados exclusivamente para fins de pesquisa científica.<br/>
          <strong>NÃO destinados ao consumo humano ou animal.</strong> Não constituem medicamentos,<br/>
          suplementos alimentares ou produtos terapêuticos. O uso é de total responsabilidade do comprador.<br/>
          Consulte sempre um profissional de saúde habilitado.
        </div>
        <div style={{marginBottom:14,fontFamily:"'Space Mono',monospace",fontSize:"0.65rem",color:"var(--muted)"}}>
          📧 <a href="mailto:admin@vanguardpep.com" style={{color:"var(--accent)",textDecoration:"none",opacity:0.85}}>admin@vanguardpep.com</a>
          <span style={{margin:"0 10px",opacity:0.3}}>·</span>
          <a href="https://wa.me/447418333521" target="_blank" style={{color:"var(--accent)",textDecoration:"none",opacity:0.85}}>💬 WhatsApp</a>
        </div>
        <div className="footer-links">
          <a className="footer-link" href="#" onClick={e=>{e.preventDefault();setLegalModal('privacy');}}>Política de Privacidade</a>
          <a className="footer-link" href="#" onClick={e=>{e.preventDefault();setLegalModal('terms');}}>Termos de Uso</a>
          <a className="footer-link" href="#" onClick={e=>{e.preventDefault();setLegalModal('research');}}>Research Use Only</a>
          <a className="footer-link" href="https://wa.me/447418333521" target="_blank">Contato</a>
        </div>
        <div className="footer-copy">© {new Date().getFullYear()} Vanguard Labs · vanguardpep.com</div>
      </footer>
      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="mobile-bottom-nav">
        <button className={view==="catalog"?"active":""} onClick={()=>setView("catalog")}>
          <span className="mob-icon">🏠</span>CATÁLOGO
        </button>
        <button className={view==="calc"?"active":""} onClick={()=>setView("calc")}>
          <span className="mob-icon">💊</span>CALC
        </button>
        <button className={view==="cart"?"active":""} onClick={()=>{ if(!myName){ setNameModalInput(""); setShowNameModal(true); } else setView("cart"); }}>
          <span className="mob-icon">🛒</span>CARRINHO
          {cartCount > 0 && <span className="mob-cart-badge">{cartCount}</span>}
        </button>
        <button onClick={()=>{ const cpf=(()=>{try{return JSON.parse(localStorage.getItem('vg-checkout')||'{}').cpf||'';}catch{return '';}})(); setTrackModal(true); if(cpf){setTrackQuery(cpf);searchOrders(cpf);}else{setTrackResults(null);setTrackQuery('');} }} className={trackModal?"active":""}>
          <span className="mob-icon">📦</span>PEDIDO
        </button>
        <button className={view==="faq"?"active":""} onClick={()=>setView("faq")}>
          <span className="mob-icon">❓</span>FAQ
        </button>
        {adminUnlocked && <button className={view==="admin"?"active":""} onClick={()=>setView("admin")}>
          <span className="mob-icon">⚙️</span>ADMIN
          {orders.filter(o=>(o.status||'pendente')==='pendente').length > 0 && <span className="mob-cart-badge">{orders.filter(o=>(o.status||'pendente')==='pendente').length}</span>}
        </button>}
      </div>

      {/* ── LOADING OVERLAY ── */}
      {isLoading && !showWelcome && (
        <div className="loading-overlay">
          <div className="loading-logo">VANGUARD</div>
          <div className="loading-spinner"></div>
          <div className="loading-text">Carregando produtos...</div>
        </div>
      )}

      {/* ── WELCOME MODAL (primeira visita) ── */}
      {showWelcome && !novoActive && !novoAdmin && (
        <div className="welcome-overlay">
          <div className="welcome-modal">
            <div className="welcome-logo">💊 Vanguard Peptides</div>
            <div className="welcome-title">Bem-vindo!</div>
            <div className="welcome-sub">Para agilizar o atendimento e identificar seu pedido, informe como quer ser chamado.</div>
            <input className="welcome-input" type="text" placeholder="Seu nome" value={nameModalInput}
              onChange={e=>setNameModalInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleWelcomeConfirm()}
              autoFocus />
            <button className="welcome-btn" onClick={handleWelcomeConfirm} disabled={!nameModalInput.trim()}>
              Entrar no catálogo →
            </button>
            <button className="welcome-skip" onClick={()=>{ localStorage.setItem("vg-welcomed","1"); setShowWelcome(false); }}>
              Pular por agora
            </button>
          </div>
        </div>
      )}

      {/* ── NAME MODAL (mobile sem nome) ── */}
      {showNameModal && !novoActive && !novoAdmin && (
        <div className="welcome-overlay" onClick={()=>setShowNameModal(false)}>
          <div className="welcome-modal" onClick={e=>e.stopPropagation()}>
            <div className="welcome-logo">👤 Identificação</div>
            <div className="welcome-title">Seu nome</div>
            <div className="welcome-sub">Precisamos do seu nome para identificar o pedido no sistema.</div>
            <input className="welcome-input" type="text" placeholder="Como quer ser chamado?" value={nameModalInput}
              onChange={e=>setNameModalInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleNameConfirm()}
              autoFocus />
            <button className="welcome-btn" onClick={handleNameConfirm} disabled={!nameModalInput.trim()}>
              Confirmar
            </button>
          </div>
        </div>
      )}

      </>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary><App /></ErrorBoundary>
);
