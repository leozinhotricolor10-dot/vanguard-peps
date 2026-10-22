// @fragmento do App() — render admin: aba CLIENTES. Antes: 08-importacao.part.jsx | depois: 10-cupons.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
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

