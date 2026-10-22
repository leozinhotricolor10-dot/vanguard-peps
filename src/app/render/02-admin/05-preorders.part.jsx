// @fragmento do App() — render admin: aba PRÉ-ORDERS. Antes: 04-artigos.part.jsx | depois: 06-avisos.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
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

