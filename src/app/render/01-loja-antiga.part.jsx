// @fragmento do App() — render: loja antiga (hero, sidebar, catálogo, FAQ, detalhe, artigo, carrinho, simulador de frete). Antes: 00-casca-portal-manual.part.jsx | depois: 00-cabecalho.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
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
            const count = c.id === "all" ? shopProducts.length : shopProducts.filter(p => p.category === c.id).length;
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
                : (() => { const n = shopProducts.filter(p=>p.category===activeCat).length; return `${n} produto${n!==1?'s':''} nesta categoria`; })()
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
              const hotProducts = shopProducts.filter(p => p.hot || (productPromo[p.id]||0) > 0);
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
                  <span>✅</span> Em estoque <span className="cat-pill-count">{shopProducts.filter(p=>availableStock(p.id)>0).length}</span>
                </button>
                <button className={`cat-pill ${activeCat==='all'?'active':''}`} onClick={()=>setActiveCat('all')}>
                  <span>⚡</span> Todos <span className="cat-pill-count">{shopProducts.length}</span>
                </button>
                {CATEGORIES.filter(c=>c.id!=='all').map(cat=>{
                  const cnt = shopProducts.filter(p=>p.category===cat.id).length;
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
                let filtered = activeCat === 'all' ? shopProducts : shopProducts.filter(p=>p.category===activeCat);
                if (searchQuery) filtered = shopProducts.filter(p=>(p.name||'').toLowerCase().includes(searchQuery.toLowerCase()) || (p.desc||'').toLowerCase().includes(searchQuery.toLowerCase()));
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
            {selectedProduct && inStockPublic(selectedProduct) && (()=>{
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
              const related = art.relatedProductId ? shopProducts.find(p=>p.id===art.relatedProductId || p.name.toLowerCase().includes((art.relatedProductId||'').replace(/[0-9]/g,'').toLowerCase())) : null;
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

