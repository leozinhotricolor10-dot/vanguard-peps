// @fragmento do App() — render admin: aba ESTOQUE. Antes: 01-pedidos.part.jsx | depois: 03-produtos.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
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

