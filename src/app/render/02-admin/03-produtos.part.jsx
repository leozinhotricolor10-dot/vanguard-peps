// @fragmento do App() — render admin: aba PRODUTOS (form, packs, lista). Antes: 02-estoque.part.jsx | depois: 04-artigos.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
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

