// @fragmento do App() — render modais: adicionar ao carrinho (produto, layout antigo). Antes: 06-etiqueta.part.jsx | depois: 05-rodape-fim.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
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

