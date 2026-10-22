// @fragmento do App() — render modais: etiqueta Melhor Envios. Antes: 05-pix.part.jsx | depois: 07-produto.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
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

