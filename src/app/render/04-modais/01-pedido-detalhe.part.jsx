// @fragmento do App() — render modais: detalhe do pedido (orderDetail, editor de itens). Antes: 00-reserva-senha.part.jsx | depois: 02-pedido-manual.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
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

