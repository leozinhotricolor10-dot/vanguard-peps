// @fragmento do App() — render (return ...) + createRoot. Antes: logica/08-carrinho-admin.part.jsx | depois: (fim). Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
  return (
    <div className={novoActive ? 'novo-mode' : novoAdmin ? 'novo-admin' : ''}>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {novoAdmin && <style>{NOVO_ADMIN_CSS}</style>}
      {novoAdmin && <NovaAdminShell active={nvaActive} onPick={nvaPick} badges={nvaBadges} onExit={() => { setView('catalog'); window.scrollTo(0, 0); }} versionTag="v2.ce6198d" />}

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
        notices={notices.filter(n => !dismissedNotices.includes(n.id))} onVersionTap={versionTap} versionTag="v2.ce6198d"
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
          }} style={{fontSize:'0.5rem',fontFamily:"'Space Mono',monospace",color:'var(--muted)',letterSpacing:'0.05em',marginLeft:6,opacity:0.6,alignSelf:'flex-end',marginBottom:2,cursor:'default',userSelect:'none'}}>v2.ce6198d</span>
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
