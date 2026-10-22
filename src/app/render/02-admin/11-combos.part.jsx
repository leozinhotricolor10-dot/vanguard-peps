// @fragmento do App() — render admin: aba COMBOS. Antes: 10-cupons.part.jsx | depois: 12-mapa.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
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

