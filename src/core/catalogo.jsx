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

