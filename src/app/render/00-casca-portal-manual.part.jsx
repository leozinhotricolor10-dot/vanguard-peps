// @fragmento do App() — render: return(, toast, casca do layout novo (NovaLoja/NovaAdminShell, tag de versão), portal de pré-order, formulário de pedido manual, checkout, nav antiga (tag de versão). Antes: logica/08-carrinho-admin.part.jsx | depois: 01-loja-antiga.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
  return (
    <div className={novoActive ? 'novo-mode' : novoAdmin ? 'novo-admin' : ''}>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {novoAdmin && <style>{NOVO_ADMIN_CSS}</style>}
      {novoAdmin && <NovaAdminShell active={nvaActive} onPick={nvaPick} badges={nvaBadges} onExit={() => { setView('catalog'); window.scrollTo(0, 0); }} versionTag="v2.3c5dcf1" />}

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
        notices={notices.filter(n => !dismissedNotices.includes(n.id))} onVersionTap={versionTap} versionTag="v2.3c5dcf1"
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
          }} style={{fontSize:'0.5rem',fontFamily:"'Space Mono',monospace",color:'var(--muted)',letterSpacing:'0.05em',marginLeft:6,opacity:0.6,alignSelf:'flex-end',marginBottom:2,cursor:'default',userSelect:'none'}}>v2.3c5dcf1</span>
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

