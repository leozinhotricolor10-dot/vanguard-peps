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

