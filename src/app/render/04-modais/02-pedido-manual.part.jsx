// @fragmento do App() — render modais: novo pedido manual + sucesso do pedido. Antes: 01-pedido-detalhe.part.jsx | depois: 03-rastreio.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
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

