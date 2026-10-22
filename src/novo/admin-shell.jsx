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
    { id: 'sorteio', label: 'Sorteio', tab: 'sorteio' },
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

