// @fragmento do App() — render admin: abre a view admin, cadeado/login, cabeçalho e botões das abas. Antes: 01-loja-antiga.part.jsx | depois: 01-pedidos.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
          {/* ADMIN */}
          <div className={`view ${view==="admin"?"visible":""}`}>
            {!adminUnlocked ? (
              <div style={{textAlign:'center',padding:'60px 20px'}}>
                <div style={{fontSize:'3rem',marginBottom:16}}>🔒</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.2rem',fontWeight:700,marginBottom:12}}>Acesso restrito</div>
                <div style={{color:'var(--muted)',fontSize:'0.85rem',marginBottom:24}}>Esta área é exclusiva para administradores.</div>
                <button onClick={handleAdminUnlock} style={{padding:'12px 32px',background:'var(--accent)',border:'none',borderRadius:10,color:'#000',fontWeight:700,cursor:'pointer',fontFamily:"'Space Mono',monospace",fontSize:'0.75rem',letterSpacing:'0.05em'}}>
                  🔑 ENTRAR COMO ADMIN
                </button>
              </div>
            ) : <>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:0}}>
              <div>
                <div className="page-tag">▸ ADMINISTRADOR</div>
                <div className="page-title">{novoAdmin ? (NVA_ITEMS.find(i => i.id === nvaActive) || {}).label : 'Painel Admin'}</div>
              </div>
              {/* 🔔 Bell icon */}
              <div style={{position:'relative',marginTop:novoAdmin?0:8,display:'flex',gap:8,alignItems:'center'}}>
                {novoAdmin && <button className="nva-exit" onClick={()=>{ setView('catalog'); window.scrollTo(0,0); }}>← Loja</button>}
                <button
                  onClick={() => { setNotifOpen(o => { if (!o) markAllRead(); return !o; }); }}
                  style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'8px 13px',cursor:'pointer',color:'var(--text)',fontSize:'1.1rem',position:'relative',lineHeight:1}}>
                  🔔
                  {unreadCount > 0 && (
                    <span style={{position:'absolute',top:-6,right:-6,background:'#e74c3c',color:'#fff',borderRadius:'50%',fontSize:'0.6rem',fontWeight:700,minWidth:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Space Mono',monospace",padding:'0 3px'}}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <>
                  <div onClick={()=>setNotifOpen(false)} style={{position:'fixed',inset:0,zIndex:1999}} />
                  <div style={{position:'absolute',right:0,top:'calc(100% + 8px)',width:320,background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,boxShadow:'0 8px 32px rgba(0,0,0,0.5)',zIndex:2000,maxHeight:440,display:'flex',flexDirection:'column'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 16px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
                      <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',letterSpacing:'1.5px',textTransform:'uppercase',color:'var(--muted)'}}>NOTIFICAÇÕES</span>
                      <button onClick={clearNotifs} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--muted)',fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",padding:0}}>Limpar tudo</button>
                    </div>
                    <div style={{overflowY:'auto',flex:1}}>
                      {notifs.length === 0 ? (
                        <div style={{padding:'28px 16px',textAlign:'center',color:'var(--muted)',fontSize:'0.8rem'}}>Nenhuma notificação</div>
                      ) : notifs.map(n => (
                        <div key={n.id} style={{padding:'11px 16px',borderBottom:'1px solid rgba(255,255,255,0.04)',background:n.read?'transparent':'rgba(0,229,195,0.04)',transition:'background 0.2s'}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:'0.8rem',fontWeight:600,marginBottom:2,lineHeight:1.3}}>{n.title}</div>
                              <div style={{fontSize:'0.72rem',color:'var(--muted)',lineHeight:1.4,wordBreak:'break-word'}}>{n.body}</div>
                            </div>
                            <div style={{fontSize:'0.6rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace",whiteSpace:'nowrap',flexShrink:0,marginTop:2}}>{timeAgo(n.ts)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  </>
                )}
              </div>
            </div>

            {novoAdmin && <NovaAdminSub active={nvaActive} onPick={nvaPick} badges={nvaBadges} />}
            {novoAdmin && <NovaAdminInnerTabs active={nvaActive} adminTab={adminTab} setAdminTab={setAdminTab} />}
            {novoAdmin && adminTab === 'pedidos' && (() => {
              const ao = sb ? orders.filter(o => o._supabase) : orders;
              const n = s => ao.filter(o => (o.status || 'pendente') === s).length;
              return (
                <div className="nvp-kpis">
                  <div><span>Aguardando pagamento</span><b className="nvp-c-warn">{n('pendente')}</b></div>
                  <div><span>Pagos para enviar</span><b className="nvp-c-ok">{n('pago')}</b></div>
                  <div><span>Em trânsito</span><b>{n('enviado')}</b></div>
                  <div><span>Receita bruta</span><b>R$ {totalRevenue.toLocaleString('pt-BR')}</b></div>
                </div>
              );
            })()}
            <label style={{display:'flex',alignItems:'center',gap:8,fontSize:'0.72rem',color:'var(--muted)',margin:'0 0 12px',cursor:'pointer'}}><input type="checkbox" checked={waAuto} onChange={e=>toggleWaAuto(e.target.checked)} /> Abrir WhatsApp ao mudar status (desligado: use o botão 💬 do pedido)</label>
            {!novoAdmin && <div className="admin-grid" style={{marginBottom:24}}>
              <div className="admin-stat"><div className="admin-stat-label">Compradores</div><div className="admin-stat-value">{totalBuyers}</div></div>
              <div className="admin-stat"><div className="admin-stat-label">Total unidades</div><div className="admin-stat-value">{totalUnits}</div></div>
              <div className="admin-stat"><div className="admin-stat-label">Receita bruta</div><div className="admin-stat-value">R$ {totalRevenue.toLocaleString("pt-BR")}</div></div>
              <div className="admin-stat"><div className="admin-stat-label">Produtos</div><div className="admin-stat-value">{products.length}</div></div>
            </div>}

            {/* TABS */}
            <div className="admin-tabs">
              <button className={`admin-tab ${adminTab==="pedidos"?"active":""}`} onClick={()=>setAdminTab("pedidos")}>📋 PEDIDOS</button>
              <button className={`admin-tab ${adminTab==="estoque"?"active":""}`} onClick={()=>setAdminTab("estoque")}>📦 ESTOQUE</button>
              <button className={`admin-tab ${adminTab==="produtos"?"active":""}`} onClick={()=>setAdminTab("produtos")}>⚗️ PRODUTOS</button>
              <button className={`admin-tab ${adminTab==="combos"?"active":""}`} onClick={()=>setAdminTab("combos")}>🎁 COMBOS</button>
              <button className={`admin-tab ${adminTab==="artigos"?"active":""}`} onClick={()=>setAdminTab("artigos")}>📝 ARTIGOS</button>
              <button className={`admin-tab ${adminTab==="preorders"?"active":""}`} onClick={()=>setAdminTab("preorders")}>📋 PRÉ-ORDERS</button>
              <button className={`admin-tab ${adminTab==="avisos"?"active":""}`} onClick={()=>setAdminTab("avisos")}>📢 AVISOS</button>
              <button className={`admin-tab ${adminTab==="financeiro"?"active":""}`} onClick={()=>setAdminTab("financeiro")}>💰 FINANCEIRO</button>
              <button className={`admin-tab ${adminTab==="importacao"?"active":""}`} onClick={()=>setAdminTab("importacao")}>📦 IMPORTAÇÃO</button>
  <button className={`admin-tab ${adminTab==="cupons"?"active":""}`} onClick={()=>setAdminTab("cupons")}>🏷️ CUPONS</button>
              <button className={`admin-tab ${adminTab==="clientes"?"active":""}`} onClick={()=>setAdminTab("clientes")}>👥 CLIENTES</button>
              <button className={`admin-tab ${adminTab==="mapa"?"active":""}`} onClick={()=>setAdminTab("mapa")}>🗺️ MAPA</button>
              <button className="admin-tab" onClick={openSenderPool}>📮 REMETENTES</button>
              <button className={`admin-tab ${adminTab==="config"?"active":""}`} onClick={()=>setAdminTab("config")}>⚙️ CONFIG</button>
            </div>

