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

