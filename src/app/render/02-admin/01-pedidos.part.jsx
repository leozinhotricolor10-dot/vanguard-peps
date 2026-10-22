// @fragmento do App() — render admin: aba PEDIDOS. Antes: 00-cabecalho.part.jsx | depois: 02-estoque.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
            {/* TAB: PEDIDOS */}
            {adminTab==="pedidos" && <>
              <div className="admin-actions">
                <button className="admin-action-btn" onClick={async ()=>{
                  if (!sb) return;
                  const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: false });
                  if (error) { showToast('Erro ao atualizar pedidos', 'error'); return; }
                  if (data) {
                    const converted = data.map(o => ({
                      id: o.id, peptideId: o.items && o.items[0] ? (o.items[0].peptideId||'') : '',
                      buyerName: o.buyer_name||'', qty: o.items ? o.items.reduce((s,i)=>s+(i.qty||0),0) : 1,
                      createdAt: o.created_at, status: o.status||'pendente',
                      _supabase: true, _items: o.items, _total: o.total, _subtotal: o.subtotal,
                      _freight: o.freight, _cpf: o.cpf, _phone: o.phone, _email: o.email,
                      _address: o.address, _payment: o.payment, _notes: o.notes, _code: o.code, _discounts: orderDiscounts(o),
                      me_order_id: o.me_order_id, tracking_code: o.tracking_code, label_url: o.label_url,
                    }));
                    const mergedRefresh = [...orders.filter(o=>!o._supabase), ...converted];
                    setOrders(mergedRefresh);
                    saveOrders(mergedRefresh);
                    showToast(`Pedidos atualizados ✓ — ${data.length} pedido${data.length!==1?'s':''} no Supabase`, 'success');
                    console.log('[Admin] Pedidos Supabase:', data.map(o=>({id:o.id,code:o.code,status:o.status,buyer:o.buyer_name,created:o.created_at})));
                  }
                }}>🔄 Atualizar</button>
                <button className="admin-action-btn" onClick={copyWhatsApp}>📋 Copiar lista WhatsApp</button>
                <button className={`admin-action-btn${groupByClient?' active':''}`} onClick={()=>setGroupByClient(g=>!g)} style={groupByClient?{borderColor:'rgba(0,229,195,0.5)',color:'var(--accent)',background:'rgba(0,229,195,0.08)'}:{}}>👥 Agrupar por cliente</button>
                <button className="admin-action-btn" onClick={()=>{
                  const disponíveis = products.filter(p => {
                    const av = availableStock(p.id);
                    return av === null || av > 0;
                  });
                  if (!disponíveis.length) { showToast('Nenhum produto em estoque', 'error'); return; }
                  const linhas = disponíveis.map(p => {
                    const av = availableStock(p.id);
                    const estoqueLabel = av === null ? '' : ` (${av} disp.)`;
                    return `✅ *${p.name}*${estoqueLabel}\n💲 R$ ${effectivePrice(p).toLocaleString('pt-BR')} /ampola\n🌐 vanguardpep.com/#/produto/${p.id}`;
                  }).join('\n\n');
                  const msg = `⭐ *VANGUARD PEPTIDES — EM ESTOQUE*\n\n${linhas}\n\n📱 Acesse o catálogo completo em *vanguardpep.com*\nDúvidas? É só chamar! 🙏`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                }}>📦 Catálogo WA</button>
                <button className="admin-action-btn" onClick={()=>{
                  const link = window.location.origin + window.location.pathname + '?pedido';
                  navigator.clipboard.writeText(link).then(()=>showToast('Link copiado ✓ — envie ao cliente pelo WhatsApp','success')).catch(()=>{ prompt('Copie o link:', link); });
                }}>📋 Link Pedido Manual</button>
                <button className="admin-action-btn" onClick={()=>{ setManualOrder(MANUAL_ORDER_EMPTY); setManualCustomerSearch(''); setManualAddItemId(''); setManualOrderModal(true); }} style={{borderColor:'rgba(0,229,195,0.5)',color:'var(--accent)',background:'rgba(0,229,195,0.08)'}}>＋ Pedido Manual</button>
                <button className="admin-action-btn danger" onClick={clearAllOrders}>🗑️ Limpar tudo</button>
              </div>
              {(() => {
                const adminOrders = sb ? orders.filter(o => o._supabase) : orders;
                const adminSearchLower = adminSearch.trim().toLowerCase();
                const filteredOrders = adminOrders
                  .filter(o => adminStatusFilter === 'all' || (o.status||'pendente') === adminStatusFilter)
                  .filter(o => {
                    if (!adminSearchLower) return true;
                    const name = (o.buyerName||'').toLowerCase();
                    const cpf = (o._cpf||'').replace(/\D/g,'');
                    const phone = (o._phone||'').replace(/\D/g,'');
                    const code = (o._code||'').toLowerCase();
                    const productNames = (o._items||[{peptideId:o.peptideId}]).map(i => {
                      const p2 = products.find(x=>x.id===i.peptideId);
                      return p2 ? p2.name.toLowerCase() : '';
                    }).join(' ');
                    const q = adminSearchLower.replace(/\D/g,'');
                    return name.includes(adminSearchLower) || code.includes(adminSearchLower) || productNames.includes(adminSearchLower) || (q && (cpf.includes(q) || phone.includes(q)));
                  });
                const statusCounts = {
                  pendente: adminOrders.filter(o=>(o.status||'pendente')==='pendente').length,
                  pago: adminOrders.filter(o=>o.status==='pago').length,
                  enviado: adminOrders.filter(o=>o.status==='enviado').length,
                  entregue: adminOrders.filter(o=>o.status==='entregue').length,
                  extraviado: adminOrders.filter(o=>o.status==='extraviado').length,
                };
                if (adminOrders.length === 0) return (
                  <div style={{textAlign:"center",color:"var(--muted)",padding:40,fontSize:"0.85rem"}}>Nenhum pedido ainda</div>
                );
                return (
                <div>
                  <div className="nvp-search" style={{position:'relative',marginBottom:12}}>
                    <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--muted)',fontSize:'0.85rem',pointerEvents:'none'}}>🔍</span>
                    <input
                      type="text"
                      value={adminSearch}
                      onChange={e=>{ setAdminSearch(e.target.value); setAdminPage(1); }}
                      placeholder="Buscar por nome, CPF, telefone, código VG ou produto..."
                      style={{width:'100%',boxSizing:'border-box',padding:'9px 36px 9px 34px',borderRadius:10,border:'1px solid var(--border)',background:'rgba(255,255,255,0.04)',color:'var(--text)',fontSize:'0.82rem',fontFamily:"'DM Sans',sans-serif",outline:'none'}}
                    />
                    {adminSearch && <button onClick={()=>{ setAdminSearch(''); setAdminPage(1); }} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.9rem',lineHeight:1}}>✕</button>}
                  </div>
                  <div className="nvp-filters" style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
                    {[
                      {id:'all',label:'Todos',count:adminOrders.length},
                      {id:'pendente',label:'🟡 Pendente',count:statusCounts.pendente},
                      {id:'pago',label:'✅ Pago',count:statusCounts.pago},
                      {id:'enviado',label:'📦 Enviado',count:statusCounts.enviado},
                      {id:'entregue',label:'🎉 Entregue',count:statusCounts.entregue},
                      {id:'extraviado',label:'⚠️ Extraviado',count:statusCounts.extraviado},
                    ].map(f=>(
                      <button key={f.id} onClick={()=>{ setAdminStatusFilter(f.id); setAdminPage(1); }}
                        style={{padding:'5px 12px',borderRadius:20,border:'1px solid',cursor:'pointer',fontSize:'0.72rem',fontFamily:"'Space Mono',monospace",
                          borderColor: adminStatusFilter===f.id ? 'var(--accent)' : 'var(--border)',
                          background: adminStatusFilter===f.id ? 'rgba(0,229,195,0.1)' : 'transparent',
                          color: adminStatusFilter===f.id ? 'var(--accent)' : 'var(--muted)'}}>
                        {f.label} <span style={{opacity:0.7}}>({f.count})</span>
                      </button>
                    ))}
                  </div>
                {(adminSearch || adminStatusFilter !== 'all') && (
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.65rem',color:'var(--muted)',marginBottom:8,paddingLeft:2}}>
                    {filteredOrders.length} resultado{filteredOrders.length!==1?'s':''} encontrado{filteredOrders.length!==1?'s':''}
                  </div>
                )}
                {(() => {
                  const ADMIN_PAGE_SIZE = 20;

                  // ── GROUPED VIEW ──────────────────────────────────────────
                  if (groupByClient) {
                    // Only group pendente + pago; others fall through as singles
                    const groupable = filteredOrders.filter(o => ['pendente','pago'].includes(o.status||'pendente'));
                    const nonGroupable = filteredOrders.filter(o => !['pendente','pago'].includes(o.status||'pendente'));
                    const grouped = {};
                    groupable.forEach(o => {
                      const key = (o.buyerName||'').trim().toLowerCase();
                      if (!grouped[key]) grouped[key] = [];
                      grouped[key].push(o);
                    });
                    // Sort: multi-order clients first
                    const groupEntries = Object.values(grouped).sort((a,b) => b.length - a.length);
                    if (filteredOrders.length === 0) return (
                      <div style={{textAlign:'center',color:'var(--muted)',padding:'32px 20px',fontSize:'0.82rem'}}>
                        {adminSearch ? `Nenhum pedido encontrado para "${adminSearch}"` : 'Nenhum pedido nesta categoria'}
                      </div>
                    );
                    return (
                      <div>
                        {groupEntries.map(group => {
                          const rep = group[0];
                          const firstName = (rep.buyerName||'Cliente').split(' ')[0];
                          const phone = (rep._phone||'').replace(/\D/g,'');
                          const ddd = phone.startsWith('55') ? phone.slice(2,4) : phone.slice(0,2);
                          const isMotoboy = ddd === '11';
                          const intl = phone.startsWith('55') ? phone : '55'+phone;
                          const groupTotal = group.reduce((s,o) => s + (parseFloat(o._total)||0), 0);
                          const allItems = group.flatMap(o => o._items && o._items.length > 0 ? o._items : [{peptideId:o.peptideId,qty:o.qty||1}]);
                          // Merge same peptide items
                          const mergedItems = [];
                          allItems.forEach(it => {
                            const ex = mergedItems.find(x=>x.peptideId===it.peptideId);
                            if (ex) ex.qty += (it.qty||1);
                            else mergedItems.push({...it, qty:it.qty||1});
                          });
                          const isMulti = group.length > 1;
                          const waMsg = `📦 *Olá, ${firstName}! Aqui está o resumo dos seus pedidos Vanguard Peptides.*\n\n🧬 *Itens:*\n${mergedItems.map(it=>{const p2=products.find(x=>x.id===it.peptideId);return `• ${p2?p2.name:(it.name||it.peptideId)} ×${it.qty}`;}).join('\n')}\n\n💰 *Total combinado: R$ ${groupTotal.toLocaleString('pt-BR')}*\n\n📋 *Pedidos:* ${group.map(o=>o._code||('#'+o.id)).join(', ')}\n\nVamos enviar tudo junto! Qualquer dúvida é só chamar 🙏\n\n_Vanguard Peptides_ 🧬`;
                          return (
                            <div key={rep.buyerName} style={{marginBottom:12,border:`1px solid ${isMulti?'rgba(0,229,195,0.3)':'rgba(0,229,195,0.1)'}`,borderRadius:12,overflow:'hidden',background:isMulti?'rgba(0,229,195,0.03)':'transparent'}}>
                              {/* Group header */}
                              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1px solid rgba(0,229,195,0.1)',background:isMulti?'rgba(0,229,195,0.06)':'rgba(255,255,255,0.02)',flexWrap:'wrap',gap:8}}>
                                <div style={{display:'flex',alignItems:'center',gap:10}}>
                                  {isMulti && <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',fontWeight:700,background:'rgba(0,229,195,0.15)',color:'var(--accent)',border:'1px solid rgba(0,229,195,0.4)',borderRadius:20,padding:'2px 10px'}}>{group.length} PEDIDOS</span>}
                                  <span style={{fontWeight:700,fontSize:'0.9rem',color:'var(--text)'}}>{rep.buyerName}</span>
                                  {ddd && <span style={{fontSize:'0.55rem',fontFamily:"'Space Mono',monospace",fontWeight:700,padding:'1px 6px',borderRadius:20,
                                    background: isMotoboy ? 'rgba(255,180,0,0.12)' : 'rgba(100,160,255,0.1)',
                                    border: isMotoboy ? '1px solid rgba(255,180,0,0.4)' : '1px solid rgba(100,160,255,0.3)',
                                    color: isMotoboy ? '#ffb800' : '#78aaff'
                                  }}>{isMotoboy ? '🛵 MOTOBOY' : '🚚 TRANSP.'}</span>}
                                </div>
                                <div style={{display:'flex',alignItems:'center',gap:8}}>
                                  <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.82rem',fontWeight:700,color:'var(--accent)'}}>R$ {groupTotal.toLocaleString('pt-BR')}</span>
                                  {phone && isMulti && <button onClick={()=>window.open(`https://wa.me/${intl}?text=${encodeURIComponent(waMsg)}`,'_blank')} style={{padding:'4px 12px',borderRadius:8,border:'1px solid rgba(37,211,102,0.4)',background:'rgba(37,211,102,0.1)',color:'#25d366',fontSize:'0.68rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>💬 WA agrupado</button>}
                                  {phone && <button onClick={()=>window.open(`https://wa.me/${intl}`,'_blank')} style={{padding:'4px 12px',borderRadius:8,border:'1px solid rgba(37,211,102,0.25)',background:'rgba(37,211,102,0.06)',color:'#25d366',fontSize:'0.68rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>💬 WA</button>}
                                </div>
                              </div>
                              {/* Merged items */}
                              <div style={{padding:'8px 16px',borderBottom:'1px solid rgba(0,229,195,0.07)',display:'flex',flexWrap:'wrap',gap:'6px 16px'}}>
                                {mergedItems.map((it,idx)=>{ const p2=products.find(x=>x.id===it.peptideId); return <span key={idx} style={{fontSize:'0.8rem',color:'var(--text)'}}>{p2?p2.name:(it.name||it.peptideId)} <span style={{color:'var(--accent)',fontFamily:"'Space Mono',monospace"}}>×{it.qty}</span></span>; })}
                              </div>
                              {/* Individual orders */}
                              {group.map(order => {
                                const items = order._items && order._items.length > 0 ? order._items : [{peptideId:order.peptideId,qty:order.qty||1}];
                                const orderTotal = order._total || 0;
                                return (
                                  <div key={order.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 16px',borderBottom:'1px solid rgba(0,229,195,0.05)',flexWrap:'wrap',gap:8}}>
                                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                                      {order._code && <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.62rem',fontWeight:700,color:'var(--accent)',background:'rgba(0,229,195,0.08)',border:'1px solid rgba(0,229,195,0.2)',borderRadius:6,padding:'2px 7px'}}>{order._code}</span>}
                                      <span className={`order-status ${order.status||'pendente'}`} onClick={()=>cycleStatus(order.id)} title="Clique para avançar status" style={{fontSize:'0.65rem',padding:'3px 8px'}}>
                                        {statusLabel(order.status)}
                                        {(order.status||'pendente')!=='extraviado' && <span className="status-cycle">▶</span>}
                                      </span>
                                      <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'var(--muted)'}}>R$ {parseFloat(orderTotal).toLocaleString('pt-BR')}</span>
                                    </div>
                                    <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                                      <button className="admin-remove-btn" style={{background:'rgba(0,229,195,0.08)',color:'var(--accent)',borderColor:'rgba(0,229,195,0.3)'}} onClick={()=>setOrderDetail(order)}>detalhes</button>
                                      {(order.status||'pendente')==='pendente' && <button className="admin-remove-btn" style={{background:'rgba(139,0,0,0.15)',color:'#e05555',borderColor:'rgba(139,0,0,0.3)',fontSize:'0.6rem'}} onClick={()=>{ setPixCode(''); setPixModal(order); }}>💳 PIX</button>}
                                      {(order.status||'pendente')==='pago' && !isMotoboyOrder(order) && <button className="admin-remove-btn" style={{background:'rgba(0,180,255,0.1)',color:'#5bc8ff',borderColor:'rgba(0,180,255,0.3)',fontSize:'0.6rem'}} onClick={()=>gerarEtiqueta(order)}>{order.label_url ? '🏷️ Reimpr.' : '🏷️ Etiqueta'}</button>}
                                      <button className="admin-remove-btn" onClick={()=>adminRemove(order.id)}>remover</button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                        {nonGroupable.map(order => {
                          const items = order._items && order._items.length > 0 ? order._items : [{peptideId:order.peptideId,qty:order.qty||1}];
                          const orderTotal = order._total || 0;
                          const totalQty = items.reduce((s,i)=>s+(i.qty||1),0);
                          return (
                            <div key={order.id} className="admin-table-row">
                              <div>
                                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3,flexWrap:'wrap'}}>
                                  {order._code && <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.62rem',fontWeight:700,color:'var(--accent)',background:'rgba(0,229,195,0.08)',border:'1px solid rgba(0,229,195,0.25)',borderRadius:6,padding:'2px 7px',letterSpacing:'0.5px'}}>{order._code}</span>}
                                </div>
                                {items.map((it,idx)=>{const p2=products.find(x=>x.id===it.peptideId);return <div key={idx} className="admin-row-name" style={{fontSize:'0.75rem'}}>{p2?p2.name:(it.name||it.peptideId)} ×{it.qty||1}</div>;})}
                                <div className="admin-row-buyer">{order.buyerName}</div>
                              </div>
                              <div><span className={`order-status ${order.status||'pendente'}`} onClick={()=>cycleStatus(order.id)} title="Clique para avançar status">{statusLabel(order.status)}{(order.status||'pendente')!=='extraviado' && <span className="status-cycle">▶</span>}</span></div>
                              <div className="admin-row-qty">×{totalQty}</div>
                              <div className="admin-row-total">R$ {parseFloat(orderTotal).toLocaleString('pt-BR')}</div>
                              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                                <button className="admin-remove-btn" style={{background:'rgba(0,229,195,0.08)',color:'var(--accent)',borderColor:'rgba(0,229,195,0.3)'}} onClick={()=>setOrderDetail(order)}>detalhes</button>
                                <button className="admin-remove-btn" onClick={()=>adminRemove(order.id)}>remover</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  // ── NORMAL PAGINATED VIEW ─────────────────────────────────
                  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ADMIN_PAGE_SIZE));
                  const safePage = Math.min(adminPage, totalPages);
                  const pagedOrders = filteredOrders.slice((safePage-1)*ADMIN_PAGE_SIZE, safePage*ADMIN_PAGE_SIZE);
                  return (<>
                {novoAdmin ? (() => {
                  // /novo: cards no celular, linhas + painel de detalhe no desktop largo
                  const sel = filteredOrders.find(o => o.id === nvaSelOrder) || pagedOrders[0] || null;
                  const pick = order => {
                    if (window.matchMedia && window.matchMedia('(min-width:1100px)').matches) setNvaSelOrder(order.id);
                    else setOrderDetail(order);
                  };
                  const pill = order => { const st = order.status || 'pendente'; return <span className={'nvp-pill nvp-st-' + st}>{NVA_ST[st] || st}</span>; };
                  return (
                    <div className="nvp-wrap">
                      <div className="nvp-list">
                        {pagedOrders.length === 0 && (
                          <div className="nvp-empty">{adminSearch ? `Nenhum pedido encontrado para "${adminSearch}"` : 'Nenhum pedido nesta categoria'}</div>
                        )}
                        {pagedOrders.map(order => {
                          const { main, sec } = nvaSteps(order);
                          const items = nvaItemsText(order);
                          const tot = parseFloat(order._total) || 0;
                          return (
                            <div key={order.id} className={'nvp-row' + (sel && sel.id === order.id ? ' on' : '')}>
                              <button className="nvp-head" onClick={() => pick(order)} aria-label={`Abrir pedido ${order._code || order.id} de ${order.buyerName || 'cliente'}`}>
                                <span className="nvp-who">
                                  <b>{order.buyerName || 'Cliente'}</b>
                                  <small><code>{order._code || '#' + order.id}</code> · {nvaWhen(order.createdAt)}</small>
                                  <small className="nvp-items">{items.join(' · ')}{isMotoboyOrder(order) && ' · 🏍️ Motoboy'}</small>
                                </span>
                                <span className="nvp-tot">{nvFmt(tot)}</span>
                                <span className="nvp-stc">{pill(order)}</span>
                              </button>
                              <div className="nvp-acts">
                                <button className={'nvp-next' + (main.primary ? ' primary' : '')} onClick={main.run}>{main.label}</button>
                                <div className="nvp-sec">
                                  {sec.map(s => <button key={s.label} onClick={s.run}>{s.label}</button>)}
                                  <button className="nvp-del" onClick={() => nvaRemove(order)}>Remover</button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div className="nvp-total"><span>Total geral</span><b>R$ {totalRevenue.toLocaleString('pt-BR')}</b></div>
                      </div>
                      {sel && (() => {
                        const { main, sec } = nvaSteps(sel);
                        const st = sel.status || 'pendente';
                        const stepIdx = ['pendente', 'pago', 'enviado', 'entregue'].indexOf(st);
                        const a = sel._address || {};
                        const line1 = [a.rua, a.numero, a.complemento].filter(Boolean).join(', ') + (a.bairro ? ' — ' + a.bairro : '');
                        const line2 = [a.cidade && (a.cidade + (a.estado ? '/' + a.estado : '')), a.cep].filter(Boolean).join(' · ');
                        return (
                          <aside className="nvp-panel" aria-label="Detalhes do pedido">
                            <div className="nvp-ph"><code>{sel._code || '#' + sel.id}</code>{pill(sel)}</div>
                            {stepIdx >= 0 && <div className="nvp-prog" aria-hidden="true">{[0, 1, 2, 3].map(i => <span key={i} className={i <= stepIdx ? 'on' : ''} />)}</div>}
                            <div className="nvp-sect">
                              <span className="nvp-lbl">Cliente</span>
                              <b>{sel.buyerName || 'Cliente'}</b>
                              {line1.trim() && <span>{line1}</span>}
                              {line2 && <span>{line2}</span>}
                              {(sel._email || sel._phone) && <span className="nvp-mut">{[sel._email, sel._phone].filter(Boolean).join(' · ')}</span>}
                            </div>
                            <div className="nvp-sect">
                              <span className="nvp-lbl">Itens</span>
                              {nvaItemsText(sel).map((t, i) => <span key={i}>{t}</span>)}
                              {parseFloat(sel._freight) > 0 && <span className="nvp-mut">Frete {nvFmt(sel._freight)}</span>}
                              {(() => { const d = sel._discounts || {}; const parts = [['Cupom', d.coupon], ['Combo', d.bundle], ['Pontos', d.points], ['Desconto manual', d.manual]].filter(([, v]) => v > 0);
                                return parts.length ? <span className="nvp-mut">{parts.map(([l, v]) => `${l} −${nvFmt(v)}`).join(' · ')}</span> : null; })()}
                              <div className="nvp-sum"><span>Total</span><b>{nvFmt(sel._total)}</b></div>
                              <span className="nvp-mut">{nvaWhen(sel.createdAt)}{sel._payment ? ' · ' + sel._payment : ''}{sel.tracking_code ? ' · rastreio ' + sel.tracking_code : ''}</span>
                            </div>
                            <div className="nvp-sect nvp-pacts">
                              <button className={'nvp-next' + (main.primary ? ' primary' : '')} onClick={main.run}>{main.label}</button>
                              {sec.map(s => <button key={s.label} className="nvp-next" onClick={s.run}>{s.label}</button>)}
                              <button className="nvp-link" onClick={() => setOrderDetail(sel)}>Abrir detalhe completo</button>
                              <button className="nvp-link nvp-del" onClick={() => nvaRemove(sel)}>Remover pedido</button>
                            </div>
                          </aside>
                        );
                      })()}
                    </div>
                  );
                })() : (
                <div className="admin-table">
                  <div className="admin-table-header">
                    <span>Produto</span>
                    <span>Status</span>
                    <span>Qtd</span>
                    <span>Total</span>
                    <span></span>
                  </div>
                  {pagedOrders.length === 0 && (
                    <div style={{textAlign:'center',color:'var(--muted)',padding:'32px 20px',fontSize:'0.82rem'}}>
                      {adminSearch ? `Nenhum pedido encontrado para "${adminSearch}"` : 'Nenhum pedido nesta categoria'}
                    </div>
                  )}
                  {pagedOrders.map(order => {
                    const items = order._items && order._items.length > 0 ? order._items : [{peptideId: order.peptideId, qty: order.qty || 1}];
                    const firstP = products.find(x => x.id === items[0].peptideId);
                    const firstPName = firstP ? firstP.name : (items[0].name || items[0].peptideId || '—');
                    const orderTotal = order._total || items.reduce((s,i) => { const p2 = products.find(x=>x.id===i.peptideId); return s + (p2 ? p2.price*(i.qty||1) : 0); }, 0);
                    const totalQty = items.reduce((s,i) => s + (i.qty||1), 0);
                    const phone = (order._phone || '').replace(/\D/g,'');
                    const ddd = phone.startsWith('55') ? phone.slice(2,4) : phone.slice(0,2);
                    const isMotoboy = ddd === '11';
                    return (
                      <div key={order.id} className="admin-table-row">
                        <div>
                          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3,flexWrap:'wrap'}}>
                            {order._code && <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.62rem',fontWeight:700,color:'var(--accent)',background:'rgba(0,229,195,0.08)',border:'1px solid rgba(0,229,195,0.25)',borderRadius:6,padding:'2px 7px',letterSpacing:'0.5px'}}>{order._code}</span>}
                            {order.id && <div className="order-id-badge" style={{margin:0}}>#{order.id}</div>}
                          </div>
                          {items.length > 1
                            ? items.map((it,idx) => { const p2 = products.find(x=>x.id===it.peptideId); return <div key={idx} className="admin-row-name" style={{fontSize:'0.75rem'}}>{p2?p2.name:(it.name||it.peptideId)} ×{it.qty||1}</div>; })
                            : <div className="admin-row-name">{firstPName}</div>
                          }
                          <div style={{display:'flex',alignItems:'center',gap:6,marginTop:2}}>
                            <div className="admin-row-buyer">{order.buyerName}</div>
                            {ddd && <span style={{fontSize:'0.55rem',fontFamily:"'Space Mono',monospace",fontWeight:700,padding:'1px 6px',borderRadius:20,
                              background: isMotoboy ? 'rgba(255,180,0,0.12)' : 'rgba(100,160,255,0.1)',
                              border: isMotoboy ? '1px solid rgba(255,180,0,0.4)' : '1px solid rgba(100,160,255,0.3)',
                              color: isMotoboy ? '#ffb800' : '#78aaff'
                            }}>{isMotoboy ? '🛵 MOTOBOY' : '🚚 TRANSP.'}</span>}
                          </div>
                        </div>
                        <div>
                          <div style={{color:"#a8bfc9",fontSize:"0.82rem",marginBottom:4}}>{order.buyerName}</div>
                          <span
                            className={`order-status ${order.status||'pendente'}`}
                            onClick={()=>cycleStatus(order.id)}
                            title="Clique para avançar status"
                          >
                            {statusLabel(order.status)}
                            {(order.status||'pendente')!=='extraviado' && <span className="status-cycle">▶</span>}
                          </span>
                        </div>
                        <div className="admin-row-qty">×{totalQty}</div>
                        <div className="admin-row-total">R$ {orderTotal.toLocaleString("pt-BR")}</div>
                        <div style={{display:'flex',flexDirection:'column',gap:4}}>
                          <button className="admin-remove-btn" style={{background:'rgba(0,229,195,0.08)',color:'var(--accent)',borderColor:'rgba(0,229,195,0.3)'}} onClick={()=>setOrderDetail(order)}>detalhes</button>
                          {(order.status||'pendente')==='pendente' && <button className="admin-remove-btn" style={{background:'rgba(139,0,0,0.15)',color:'#e05555',borderColor:'rgba(139,0,0,0.3)',fontSize:'0.6rem'}} onClick={()=>{ setPixCode(''); setPixModal(order); }}>💳 PIX</button>}
                          {(order.status||'pendente')==='pago' && !isMotoboyOrder(order) && <button className="admin-remove-btn" style={{background:'rgba(0,180,255,0.1)',color:'#5bc8ff',borderColor:'rgba(0,180,255,0.3)',fontSize:'0.6rem'}} onClick={()=>gerarEtiqueta(order)}>{order.label_url ? '🏷️ Reimpr.' : '🏷️ Etiqueta'}</button>}
                          {order.tracking_code && <button className="admin-remove-btn" style={{background:'rgba(255,180,0,0.1)',color:'#ffb800',borderColor:'rgba(255,180,0,0.3)',fontSize:'0.6rem'}} onClick={()=>{ const firstName=(order.buyerName||'Cliente').split(' ')[0]; const code=order._code||''; const msg=`📦 *Olá, ${firstName}!*\n\n🔍 *Código de rastreio do seu pedido${code?` ${code}`:''}:*\n${order.tracking_code}\n\n📲 Acompanhe aqui: https://melhorrastreio.com.br/rastreio/${order.tracking_code}\n\nQualquer dúvida é só chamar! 🙏\n\n_Vanguard Peptides_ 🧬`; const digits=(order._phone||'').replace(/\D/g,''); const intl=digits.startsWith('55')?digits:'55'+digits; window.open(`https://wa.me/${intl}?text=${encodeURIComponent(msg)}`,'_blank'); }}>📲 Rastreio</button>}
                          {order._phone && <button className="admin-remove-btn" style={{background:'rgba(37,211,102,0.1)',color:'#25d366',borderColor:'rgba(37,211,102,0.3)',fontSize:'0.6rem'}} onClick={()=>nvaWhats(order)}>💬 Mensagem</button>}
                          <button className="admin-remove-btn" onClick={()=>adminRemove(order.id)}>remover</button>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{padding:"14px 20px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:24,fontFamily:"'Space Mono',monospace",fontSize:"0.78rem"}}>
                    <span style={{color:"var(--muted)"}}>TOTAL GERAL</span>
                    <span style={{color:"var(--accent)",fontWeight:700}}>R$ {totalRevenue.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
                )}
                {totalPages > 1 && (
                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:14}}>
                    <button onClick={()=>setAdminPage(p=>Math.max(1,p-1))} disabled={safePage===1}
                      style={{padding:'6px 14px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:safePage===1?'var(--muted)':'var(--text)',cursor:safePage===1?'default':'pointer',fontSize:'0.78rem'}}>
                      ← Anterior
                    </button>
                    <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.68rem',color:'var(--muted)'}}>
                      {safePage} / {totalPages}
                    </span>
                    <button onClick={()=>setAdminPage(p=>Math.min(totalPages,p+1))} disabled={safePage===totalPages}
                      style={{padding:'6px 14px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:safePage===totalPages?'var(--muted)':'var(--text)',cursor:safePage===totalPages?'default':'pointer',fontSize:'0.78rem'}}>
                      Próximo →
                    </button>
                  </div>
                )}
                  </>);
                })()}
                </div>
                );
              })()}

              {/* LISTA DE AVISOS DE REPOSIÇÃO */}
              {(() => {
                let notifyList; try { notifyList = JSON.parse(localStorage.getItem('vg-notify')||'[]'); } catch { notifyList = []; }
                if (!notifyList.length) return null;
                function removeNotify(idx) {
                  const updated = notifyList.filter((_,i2)=>i2!==idx);
                  localStorage.setItem('vg-notify', JSON.stringify(updated));
                  showToast('Aviso removido','info');
                  setAdminTab('__tmp');
                  setTimeout(()=>setAdminTab('pedidos'),0);
                }
                return (
                  <div style={{marginTop:24}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:"#ffaa1e",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:12,paddingLeft:4}}>
                      🔔 Avisos de Reposição ({notifyList.length})
                    </div>
                    {notifyList.map((n,i) => (
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",background:"rgba(255,160,30,0.04)",border:"1px solid rgba(255,160,30,0.15)",borderRadius:8,marginBottom:6,fontSize:"0.82rem"}}>
                        <div>
                          <div style={{color:"var(--text)",fontWeight:600,marginBottom:2}}>{n.product}</div>
                          <div style={{color:"var(--muted)",fontFamily:"'Space Mono',monospace",fontSize:"0.68rem"}}>{n.contact}</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                          <div style={{color:"var(--muted)",fontFamily:"'Space Mono',monospace",fontSize:"0.6rem"}}>{n.date}</div>
                          <button className="admin-remove-btn" onClick={()=>removeNotify(i)}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </>}

