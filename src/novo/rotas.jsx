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

