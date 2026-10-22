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

