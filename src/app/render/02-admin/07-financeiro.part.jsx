// @fragmento do App() — render admin: aba FINANCEIRO (P&L, importações, despesas). Antes: 06-avisos.part.jsx | depois: 08-importacao.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
            {/* TAB: FINANCEIRO */}
            {adminTab==="financeiro" && (()=>{
              const fmt = v => `R$ ${v.toLocaleString('pt-BR')}`;

              // Revenue using _total (real amount paid) or calculate from _items
              const sbOrders = orders.filter(o => o._supabase);
              const ordsByStatus = s => sbOrders.filter(o=>(o.status||'pendente')===s);
              const revForOrds = ords => ords.reduce((a,o)=>{
                if(o._total) return a + o._total;
                const items = o._items && o._items.length ? o._items : [{peptideId:o.peptideId, qty:o.qty||1}];
                return a + items.reduce((s2,it)=>{ const p=products.find(x=>x.id===it.peptideId); return s2+(p?p.price*(it.qty||1):0); },0);
              },0);
              const revByStatus = s => revForOrds(ordsByStatus(s));
              const confirmed = revByStatus('pago') + revByStatus('enviado') + revByStatus('entregue');
              const pending   = revByStatus('pendente');
              const totalOrds = sbOrders.length;
              const ticket    = totalOrds ? Math.round((confirmed+pending)/totalOrds) : 0;
              const preorderProj = preorders.reduce((a,po)=>{ const p=products.find(x=>x.id===po.productId); return a+(p?p.price*(po.qty||0):0); },0);

              // COGS — confirmed orders where product has _custoVial
              const confirmedOrds = [...ordsByStatus('pago'), ...ordsByStatus('enviado'), ...ordsByStatus('entregue')];
              const cogsForOrds = ords => ords.reduce((a,o)=>{
                const items = o._items && o._items.length ? o._items : [{peptideId:o.peptideId, qty:o.qty||1}];
                return a + items.reduce((s2,it)=>{ const p=products.find(x=>x.id===it.peptideId); return s2+(p&&p._custoVial?p._custoVial*(it.qty||1):0); },0);
              },0);
              const cogs = cogsForOrds(confirmedOrds);
              const hasCost = cogs > 0;
              const lucroLiq = confirmed - cogs;

              // Perdas por extravio — vials de pedidos extraviados são perda total
              const extraviadoOrds = ordsByStatus('extraviado');
              const perdaExtravioRevenue = revForOrds(extraviadoOrds);
              const perdaExtravioCogs = cogsForOrds(extraviadoOrds);

              // Estoque em trânsito — agregado por SKU das importações não-entregues
              const transitBySku = {};
              importHistory.filter(h => { const st = h.status||'aguardando'; return st !== 'entregue' && st !== 'apreendida'; }).forEach(h => {
                (h.items||[]).forEach(it => {
                  if (!it.sku) return;
                  const vials = parseInt(it.vials) || (parseInt(it.boxes)||0)*10;
                  const preco = parseFloat(it.precoVenda) || parseFloat(it.precoSug) || 0;
                  if (!transitBySku[it.sku]) transitBySku[it.sku] = { sku: it.sku, name: it.name || it.sku, vials: 0, rev: 0 };
                  transitBySku[it.sku].vials += vials;
                  transitBySku[it.sku].rev += vials * preco;
                });
              });
              const transitList = Object.values(transitBySku).sort((a,b)=>b.rev-a.rev);
              const transitTotalRev = transitList.reduce((s,t)=>s+t.rev, 0);
              const transitTotalVials = transitList.reduce((s,t)=>s+t.vials, 0);
              const margemMedia = confirmed > 0 && hasCost ? Math.round((lucroLiq/confirmed)*100) : null;

              // Per-product data for confirmed orders
              const prodData = {};
              confirmedOrds.forEach(o=>{
                const items = o._items && o._items.length ? o._items : [{peptideId:o.peptideId, qty:o.qty||1}];
                items.forEach(it=>{
                  const p=products.find(x=>x.id===it.peptideId); if(!p) return;
                  if(!prodData[p.id]) prodData[p.id]={name:p.name,rev:0,cogs:0,qty:0,price:p.price,custo:p._custoVial||0};
                  prodData[p.id].rev += p.price*(it.qty||1);
                  prodData[p.id].cogs += (p._custoVial||0)*(it.qty||1);
                  prodData[p.id].qty += (it.qty||1);
                });
              });
              const prodLucList = Object.values(prodData).sort((a,b)=>b.rev-a.rev);

              // Ranking across all statuses
              const allProdRev = {}; const allProdQty = {};
              sbOrders.forEach(o=>{
                const items = o._items && o._items.length ? o._items : [{peptideId:o.peptideId, qty:o.qty||1}];
                items.forEach(it=>{ const p=products.find(x=>x.id===it.peptideId); if(!p) return; allProdRev[p.name]=(allProdRev[p.name]||0)+p.price*(it.qty||1); allProdQty[p.name]=(allProdQty[p.name]||0)+(it.qty||1); });
              });
              const allRankList = Object.entries(allProdRev).sort((a,b)=>b[1]-a[1]);
              const allMaxRev = allRankList[0]?allRankList[0][1]:1;

              // Estoque valorizado (stock × custo/vial)
              const estoqueValorizado = products.reduce((a,p)=>a+(p._custoVial||0)*(stock[p.id]??0),0);
              const estoqueVendaTotal = products.reduce((a,p)=>a+(p.price||0)*(stock[p.id]??0),0);
              const estoqueLucroLatente = estoqueVendaTotal - estoqueValorizado;

              // Taxa de conversão pré-orders
              const poTotal = preorders.length;
              const poConcluidas = preorders.filter(po=>po.status==='completed').length;
              const taxaConversao = poTotal > 0 ? Math.round((poConcluidas/poTotal)*100) : 0;

              const poByProd = {};
              preorders.forEach(po=>{ const p=products.find(x=>x.id===po.productId); if(!p) return; if(!poByProd[p.name]) poByProd[p.name]={qty:0,proj:0}; poByProd[p.name].qty+=(po.qty||0); poByProd[p.name].proj+=p.price*(po.qty||0); });

              const days7 = Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); return d; });
              const trendData = days7.map(d=>{
                const ds = d.toLocaleDateString('pt-BR');
                const dayOrds = sbOrders.filter(o=>o.createdAt && new Date(o.createdAt).toLocaleDateString('pt-BR')===ds);
                return { label: d.toLocaleDateString('pt-BR',{weekday:'short'}), rev: revForOrds(dayOrds) };
              });
              const maxTrend = Math.max(...trendData.map(d=>d.rev),1);

              // ── DESPESAS ──────────────────────────────────────────────────
              // 1) Frete de saída (ME labels)
              const totalFreteEnvio = Object.values(shippingCosts).reduce((s,e)=>s+(e.cost||0), 0);

              // 2) Taxas MP — calculadas por pedido confirmado baseado no pagamento
              const calcMpFee = o => {
                const pay = JSON.stringify(o._payment || '').toLowerCase();
                if (pay.includes('pix')) return 0;
                const base = o._total || 0;
                if (pay.includes('2x') || pay.includes('parcel')) return base * (1.0498 * 1.0459 - 1);
                return base * 0.0498; // receber na hora
              };
              const totalTaxasMP = confirmedOrds.reduce((s,o)=>s+calcMpFee(o), 0);

              // 3) Frete absorvido em pedidos PIX (loja paga o frete)
              const FRETE_FIXO = 60;
              const pixOrdsConfirmed = confirmedOrds.filter(o => JSON.stringify(o._payment||'').toLowerCase().includes('pix'));
              const totalFretePixAbsorvido = pixOrdsConfirmed.reduce((s,o) => {
                // Se já tem custo real de envio (ME label), não duplicar
                if (shippingCosts[o.id]) return s;
                return s + FRETE_FIXO;
              }, 0);

              // 4) Despesas manuais
              const totalDespManuais = despesas.reduce((s,d)=>s+(parseFloat(d.valor)||0), 0);

              // 4) Custo de importações
              const importCustoH = h => (parseFloat(h.totalOrderUsd)||0) * (parseFloat(h.cambio)||0) + (parseFloat(h.overheadBrl)||0);
              const totalImportCost = importHistory.reduce((s,h) => s + importCustoH(h), 0);

              // Perdas por apreensão — importação retida na alfândega = 100% prejuízo
              const apreendidasList = importHistory.filter(h => h.status === 'apreendida');
              const perdaApreensao = apreendidasList.reduce((s,h) => s + importCustoH(h), 0);

              // 5) P&L — extravio: COGS perdido entra como despesa
              //         apreensão: custo total da importação entra como despesa (só quando hasCost,
              //         pois sem hasCost o totalImportCost já inclui apreendidas)
              const totalDespesas = (hasCost ? cogs : totalImportCost) + totalFreteEnvio + totalFretePixAbsorvido + totalTaxasMP + totalDespManuais + perdaExtravioCogs + (hasCost ? perdaApreensao : 0);
              const lucroOperacional = confirmed - totalDespesas;
              const margemOperacional = confirmed > 0 ? (lucroOperacional / confirmed) * 100 : 0;

              // Despesas CRUD
              async function addDespesa() {
                const v = parseFloat(despesaForm.valor);
                if (!despesaForm.desc || isNaN(v) || v <= 0) { showToast('Preencha descrição e valor','error'); return; }
                if (sb) {
                  const { data } = await sb.from('expenses').insert({ description: despesaForm.desc, value: v, category: despesaForm.categoria||'outros', expense_date: despesaForm.data }).select().single();
                  if (data) setDespesas(ds => [{ id:data.id, desc:data.description, valor:data.value, categoria:data.category, data:data.expense_date }, ...ds]);
                } else {
                  persistDespesas([{ id: Date.now(), ...despesaForm, valor: v }, ...despesas]);
                }
                setDespesaForm({ desc:'', valor:'', categoria:'outros', data: new Date().toLocaleDateString('pt-BR') });
                showToast('Despesa registrada ✓', 'success');
              }
              async function removeDespesa(id) {
                if (sb) { await sb.from('expenses').delete().eq('id', id); setDespesas(ds => ds.filter(d=>d.id!==id)); }
                else { persistDespesas(despesas.filter(d=>d.id!==id)); }
              }

              const DESP_CATS = { operacional:'⚙️ Operacional', embalagem:'📦 Embalagem', marketing:'📣 Marketing', outros:'📌 Outros' };

              return (
                <>
                  {/* ── P&L PANEL ── */}
                  <div style={{background:'rgba(0,0,0,0.25)',border:'1px solid rgba(0,229,195,0.2)',borderRadius:14,padding:'16px 20px',marginBottom:20}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--accent)',letterSpacing:'1.5px',marginBottom:14}}>💼 RESULTADO OPERACIONAL</div>
                    {[
                      { label:'Receita bruta (confirmada)', val: confirmed, color:'#4cffb0', sign:'+' },
                      hasCost
                        ? { label:'(-) CMV — custo das mercadorias vendidas', val: cogs, color:'#ff5050', sign:'-', sub: totalImportCost>0?'✓ Custo/vial reflete importações — veja breakdown abaixo':null }
                        : { label:'(-) Custo de importações (total lotes)', val: totalImportCost, color:'#ff5050', sign:'-', sub: totalImportCost===0?'Nenhuma importação registrada ainda':null },
                      { label:'(-) Frete de envio (ME)', val: totalFreteEnvio, color:'#ffa040', sign:'-', sub: totalFreteEnvio===0?'Será registrado ao gerar etiquetas':null },
                      { label:'(-) Frete absorvido — PIX', val: totalFretePixAbsorvido, color:'#ffa040', sign:'-', sub: pixOrdsConfirmed.length > 0 ? `${pixOrdsConfirmed.length} pedido${pixOrdsConfirmed.length>1?'s':''} PIX × R$ ${FRETE_FIXO} (sem etiqueta ME gerada)` : 'Nenhum pedido PIX confirmado ainda' },
                      { label:'(-) Taxas Mercado Pago', val: totalTaxasMP, color:'#ffa040', sign:'-', sub:'Estimado por tipo de pagamento' },
                      { label:'(-) Despesas manuais', val: totalDespManuais, color:'#ffa040', sign:'-', sub: despesas.length===0?'Nenhuma lançada ainda':null },
                    ].map((row,i)=>(
                      <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                        <div>
                          <span style={{fontSize:'0.8rem',color:'var(--text)'}}>{row.label}</span>
                          {row.sub && <span style={{display:'block',fontSize:'0.6rem',color:'var(--muted)',marginTop:1}}>{row.sub}</span>}
                        </div>
                        <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.8rem',color:row.val>0?row.color:'var(--muted)',fontWeight:700}}>
                          {row.val > 0 ? `${row.sign} R$${row.val.toLocaleString('pt-BR',{minimumFractionDigits:2})}` : '—'}
                        </span>
                      </div>
                    ))}
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'10px 0 0',marginTop:4}}>
                      <span style={{fontFamily:"'Syne',sans-serif",fontSize:'1rem',fontWeight:800,color:'var(--text)'}}>LUCRO OPERACIONAL</span>
                      <div style={{textAlign:'right'}}>
                        <span style={{fontFamily:"'Space Mono',monospace",fontSize:'1.1rem',fontWeight:700,color:lucroOperacional>=0?'#4cffb0':'#ff5050'}}>
                          R${lucroOperacional.toLocaleString('pt-BR',{minimumFractionDigits:2})}
                        </span>
                        <span style={{display:'block',fontSize:'0.68rem',color:lucroOperacional>=0?'#4cffb0':'#ff5050',fontFamily:"'Space Mono',monospace"}}>
                          {margemOperacional.toFixed(1)}% de margem
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── BREAKDOWN IMPORTAÇÕES ── */}
                  {importHistory.length > 0 && (
                    <div style={{marginBottom:20}}>
                      <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--muted)',letterSpacing:'1.5px',marginBottom:10}}>📦 IMPORTAÇÕES — CUSTO vs RECEITA RECUPERADA</div>
                      {importHistory.map(h => {
                        const prodCost = (parseFloat(h.totalOrderUsd)||0) * (parseFloat(h.cambio)||0);
                        const overhead = parseFloat(h.overheadBrl)||0;
                        const totalCusto = prodCost + overhead;
                        const st = h.status || 'aguardando';
                        const stColor = st==='entregue'?'#4ade80':st==='alfandega'?'#ff9f43':st==='em_transito'?'#78aaff':'#ffaa00';

                        // SKUs deste lote
                        const lotSkus = (h.items||[]).map(it=>(it.sku||'').toUpperCase()).filter(Boolean);
                        // Produtos do catálogo que batem com os SKUs deste lote
                        const lotProds = products.filter(p => lotSkus.includes((p.sku||'').toUpperCase()));
                        const lotProdIds = new Set(lotProds.map(p=>p.id));
                        // Receita das ordens confirmadas deste lote
                        const receitaLote = confirmedOrds.reduce((s,o) => {
                          const items = o._items && o._items.length ? o._items : [{peptideId:o.peptideId, qty:o.qty||1}];
                          return s + items.reduce((s2,it) => {
                            if (!lotProdIds.has(it.peptideId)) return s2;
                            const p = products.find(x=>x.id===it.peptideId);
                            return s2 + (p ? p.price*(it.qty||1) : 0);
                          }, 0);
                        }, 0);
                        const saldo = receitaLote - totalCusto;
                        const pct = totalCusto > 0 ? Math.round((receitaLote/totalCusto)*100) : 0;
                        const barW = Math.min(100, pct);

                        return (
                          <div key={h.id} style={{background:'rgba(255,255,255,0.02)',border:'1px solid var(--border)',borderRadius:10,padding:'12px 16px',marginBottom:8}}>
                            {/* Header */}
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                              <div style={{display:'flex',alignItems:'center',gap:8}}>
                                <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.65rem',color:'var(--accent)'}}>{h.date}</span>
                                <span style={{fontSize:'0.58rem',fontWeight:700,padding:'1px 7px',borderRadius:20,color:stColor,border:`1px solid ${stColor}`,background:`${stColor}18`,fontFamily:"'Space Mono',monospace"}}>{st}</span>
                              </div>
                              <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',fontWeight:700,color: saldo>=0?'#4cffb0':'#ff5050'}}>
                                {saldo>=0?'+':''}{saldo.toLocaleString('pt-BR',{minimumFractionDigits:2})}
                              </span>
                            </div>
                            {/* Barra de recuperação */}
                            <div style={{marginBottom:8}}>
                              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.6rem',fontFamily:"'Space Mono',monospace",marginBottom:3}}>
                                <span style={{color:'var(--muted)'}}>Recuperado: <strong style={{color: pct>=100?'#4cffb0':'#ffaa00'}}>R$ {receitaLote.toLocaleString('pt-BR',{minimumFractionDigits:2})} ({pct}%)</strong></span>
                                <span style={{color:'#ff5050'}}>Custo: R$ {totalCusto.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                              </div>
                              <div style={{height:6,borderRadius:4,background:'rgba(255,255,255,0.06)',overflow:'hidden'}}>
                                <div style={{height:'100%',width:`${barW}%`,borderRadius:4,background: pct>=100?'#4cffb0':'linear-gradient(90deg,#ffaa00,#ff8800)',transition:'width 0.4s'}} />
                              </div>
                            </div>
                            {/* SKUs */}
                            <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                              {(h.items||[]).map((it,i)=>(
                                <span key={i} style={{fontSize:'0.62rem',fontFamily:"'Space Mono',monospace",background:'rgba(0,229,195,0.06)',border:'1px solid rgba(0,229,195,0.15)',borderRadius:4,padding:'2px 7px',color:'var(--muted)'}}>
                                  {it.sku} ×{it.vials||((it.boxes||0)*10)} vials
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      <div style={{display:'flex',justifyContent:'space-between',paddingTop:8,borderTop:'1px solid var(--border)'}}>
                        <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'#ff5050',fontWeight:700}}>Total investido: R$ {totalImportCost.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                        <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color: confirmed>=totalImportCost?'#4cffb0':'#ffaa00',fontWeight:700}}>
                          Recuperado: {totalImportCost>0?Math.round((confirmed/totalImportCost)*100):0}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ── DESPESAS MANUAIS ── */}
                  <div style={{marginBottom:20}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--muted)',letterSpacing:'1.5px',marginBottom:10}}>📌 LANÇAR DESPESA</div>
                    <div className="nva-wrapgrid" style={{display:'grid',gridTemplateColumns:'1fr 110px 130px 90px auto',gap:8,alignItems:'flex-end',marginBottom:8}}>
                      <div>
                        <div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:3}}>Descrição</div>
                        <input style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'7px 10px',color:'var(--text)',fontSize:'0.8rem',width:'100%'}}
                          placeholder="ex: Embalagem bubble wrap"
                          value={despesaForm.desc} onChange={e=>setDespesaForm(f=>({...f,desc:e.target.value}))} />
                      </div>
                      <div>
                        <div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:3}}>Valor (R$)</div>
                        <input style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'7px 10px',color:'var(--text)',fontSize:'0.8rem',width:'100%'}} type="number" min="0" placeholder="0.00"
                          value={despesaForm.valor} onChange={e=>setDespesaForm(f=>({...f,valor:e.target.value}))} />
                      </div>
                      <div>
                        <div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:3}}>Categoria</div>
                        <select style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'7px 10px',color:'var(--text)',fontSize:'0.8rem',width:'100%'}}
                          value={despesaForm.categoria} onChange={e=>setDespesaForm(f=>({...f,categoria:e.target.value}))}>
                          {Object.entries(DESP_CATS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:3}}>Data</div>
                        <input style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'7px 10px',color:'var(--text)',fontSize:'0.8rem',width:'100%'}}
                          value={despesaForm.data} onChange={e=>setDespesaForm(f=>({...f,data:e.target.value}))} />
                      </div>
                      <button onClick={addDespesa} style={{padding:'7px 16px',background:'var(--accent)',border:'none',borderRadius:6,color:'#000',fontWeight:700,fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Space Mono',monospace",whiteSpace:'nowrap'}}>
                        + Adicionar
                      </button>
                    </div>
                    {/* Lista de despesas manuais */}
                    {despesas.length > 0 && (
                      <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
                        {despesas.map(d=>(
                          <div key={d.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 14px',borderBottom:'1px solid rgba(255,255,255,0.03)',fontSize:'0.78rem'}}>
                            <div style={{display:'flex',alignItems:'center',gap:10,flex:1,minWidth:0}}>
                              <span style={{fontSize:'0.72rem'}}>{DESP_CATS[d.categoria]||'📌'}</span>
                              <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.desc}</span>
                              <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.62rem',color:'var(--muted)',flexShrink:0}}>{d.data}</span>
                            </div>
                            <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0,marginLeft:12}}>
                              <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.78rem',color:'#ff5050',fontWeight:700}}>R${parseFloat(d.valor).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                              <button onClick={()=>removeDespesa(d.id)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.85rem',padding:0}}>✕</button>
                            </div>
                          </div>
                        ))}
                        <div style={{padding:'8px 14px',background:'rgba(255,80,80,0.04)',display:'flex',justifyContent:'space-between',fontSize:'0.72rem',fontFamily:"'Space Mono',monospace"}}>
                          <span style={{color:'var(--muted)'}}>Total despesas manuais</span>
                          <span style={{color:'#ff5050',fontWeight:700}}>R${totalDespManuais.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                        </div>
                      </div>
                    )}
                    {/* Perdas por apreensão alfandegária */}
                    {apreendidasList.length > 0 && (
                      <div style={{marginTop:10,padding:'10px 14px',background:'rgba(255,80,80,0.06)',border:'1px solid rgba(255,80,80,0.25)',borderRadius:10}}>
                        <div style={{fontSize:'0.6rem',color:'#ff5050',fontFamily:"'Space Mono',monospace",letterSpacing:'1.5px',marginBottom:8}}>🛃 PERDAS POR APREENSÃO — {apreendidasList.length} importaç{apreendidasList.length!==1?'ões':'ão'}</div>
                        {apreendidasList.map(h => {
                          const custo = importCustoH(h);
                          return (
                            <div key={h.id} style={{display:'flex',justifyContent:'space-between',fontSize:'0.7rem',fontFamily:"'Space Mono',monospace",marginBottom:3}}>
                              <span style={{color:'var(--muted)'}}>{h.label||h.date} · {h.date}</span>
                              <span style={{color:'#ff5050',fontWeight:700}}>R${Math.round(custo).toLocaleString('pt-BR')}</span>
                            </div>
                          );
                        })}
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.75rem',fontFamily:"'Space Mono',monospace",marginTop:6,paddingTop:6,borderTop:'1px solid rgba(255,80,80,0.2)'}}>
                          <span style={{color:'var(--muted)'}}>Total apreendido (100% prejuízo)</span>
                          <span style={{color:'#ff5050',fontWeight:700}}>R${Math.round(perdaApreensao).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    )}
                    {/* Perdas por extravio */}
                    {extraviadoOrds.length > 0 && (
                      <div style={{marginTop:10,padding:'10px 14px',background:'rgba(255,80,80,0.06)',border:'1px solid rgba(255,80,80,0.25)',borderRadius:10}}>
                        <div style={{fontSize:'0.6rem',color:'#ff5050',fontFamily:"'Space Mono',monospace",letterSpacing:'1.5px',marginBottom:6}}>⚠️ PERDAS POR EXTRAVIO — {extraviadoOrds.length} pedido{extraviadoOrds.length!==1?'s':''}</div>
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.72rem',fontFamily:"'Space Mono',monospace"}}>
                          <span style={{color:'var(--muted)'}}>Faturamento perdido</span>
                          <span style={{color:'#ff8080'}}>R${perdaExtravioRevenue.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                        </div>
                        {hasCost && perdaExtravioCogs > 0 && (
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.72rem',fontFamily:"'Space Mono',monospace",marginTop:3}}>
                            <span style={{color:'var(--muted)'}}>CMV (vials perdidos)</span>
                            <span style={{color:'#ff5050',fontWeight:700}}>R${perdaExtravioCogs.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Fretes ME registrados */}
                    {Object.keys(shippingCosts).length > 0 && (
                      <div style={{marginTop:10}}>
                        <div style={{fontSize:'0.6rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace",marginBottom:6}}>📦 FRETES ME GERADOS — R${totalFreteEnvio.toLocaleString('pt-BR',{minimumFractionDigits:2})} total</div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                          {Object.values(shippingCosts).map((s,i)=>(
                            <span key={i} style={{fontSize:'0.65rem',fontFamily:"'Space Mono',monospace",background:'rgba(255,160,64,0.07)',border:'1px solid rgba(255,160,64,0.2)',borderRadius:6,padding:'3px 8px',color:'var(--muted)'}}>
                              {s.date} · {s.carrier} · R${s.cost.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cards principais */}
                  <div className="fin-cards">
                    <div className="fin-card green">
                      <div className="fin-card-label">Faturamento Confirmado</div>
                      <div className="fin-card-value">{fmt(confirmed)}</div>
                      <div className="fin-card-sub">Pago + Enviado + Entregue</div>
                    </div>
                    <div className="fin-card yellow">
                      <div className="fin-card-label">Em Aberto</div>
                      <div className="fin-card-value">{fmt(pending)}</div>
                      <div className="fin-card-sub">{ordsByStatus('pendente').length} pedido{ordsByStatus('pendente').length!==1?'s':''} pendente{ordsByStatus('pendente').length!==1?'s':''}</div>
                    </div>
                    {hasCost ? <>
                      <div className="fin-card" style={{borderColor:'rgba(76,255,176,0.3)',background:'rgba(76,255,176,0.04)'}}>
                        <div className="fin-card-label">Lucro Líquido</div>
                        <div className="fin-card-value" style={{color:lucroLiq>=0?'#4cffb0':'#ff5050'}}>{fmt(Math.round(lucroLiq))}</div>
                        <div className="fin-card-sub">CMV: {fmt(Math.round(cogs))}</div>
                      </div>
                      <div className="fin-card" style={{borderColor:'rgba(255,150,0,0.3)',background:'rgba(255,150,0,0.04)'}}>
                        <div className="fin-card-label">Margem Média</div>
                        <div className="fin-card-value" style={{color:'#ff9600'}}>{margemMedia}%</div>
                        <div className="fin-card-sub">Sobre faturamento confirmado</div>
                      </div>
                    </> : <>
                      <div className="fin-card purple">
                        <div className="fin-card-label">Projeção Pré-Orders</div>
                        <div className="fin-card-value">{fmt(preorderProj)}</div>
                        <div className="fin-card-sub">{preorders.length} reserva{preorders.length!==1?'s':''} em fila</div>
                      </div>
                      <div className="fin-card blue">
                        <div className="fin-card-label">Ticket Médio</div>
                        <div className="fin-card-value">{fmt(ticket)}</div>
                        <div className="fin-card-sub">{totalOrds} pedido{totalOrds!==1?'s':''} no total</div>
                      </div>
                    </>}
                  </div>

                  {/* Segunda linha quando há dados de custo */}
                  {hasCost && <div className="fin-cards" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
                    <div className="fin-card purple">
                      <div className="fin-card-label">Projeção Pré-Orders</div>
                      <div className="fin-card-value">{fmt(preorderProj)}</div>
                      <div className="fin-card-sub">{preorders.length} reserva{preorders.length!==1?'s':''} em fila</div>
                    </div>
                    <div className="fin-card blue">
                      <div className="fin-card-label">Ticket Médio</div>
                      <div className="fin-card-value">{fmt(ticket)}</div>
                      <div className="fin-card-sub">{totalOrds} pedido{totalOrds!==1?'s':''} no total</div>
                    </div>
                    <div className="fin-card" style={{borderColor:'rgba(0,200,100,0.3)',background:'rgba(0,200,100,0.04)'}}>
                      <div className="fin-card-label">Estoque em Caixa</div>
                      <div className="fin-card-value" style={{color:'#00c864'}}>{fmt(Math.round(estoqueVendaTotal))}</div>
                      <div className="fin-card-sub" style={{lineHeight:1.6}}>
                        <span style={{color:'#ff7070'}}>Custo: {fmt(Math.round(estoqueValorizado))}</span><br/>
                        <span style={{color:'#4cffb0'}}>Lucro latente: {fmt(Math.round(estoqueLucroLatente))}</span>
                      </div>
                    </div>
                  </div>}

                  {/* Estoque em Trânsito */}
                  {transitList.length > 0 && (
                    <div className="fin-section">
                      <div className="fin-section-title">📦 Estoque em Trânsito (chegando)</div>
                      <div style={{padding:'16px 20px',background:'rgba(255,170,0,0.04)',border:'1px solid rgba(255,170,0,0.25)',borderRadius:12}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:14,paddingBottom:12,borderBottom:'1px solid rgba(255,170,0,0.15)'}}>
                          <div>
                            <div style={{fontSize:'0.62rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace",letterSpacing:'1.5px',marginBottom:4}}>FATURAMENTO ESTIMADO TOTAL</div>
                            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.6rem',fontWeight:800,color:'#ffc107'}}>{fmt(Math.round(transitTotalRev))}</div>
                          </div>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontSize:'0.62rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace",letterSpacing:'1.5px',marginBottom:4}}>VIALS</div>
                            <div style={{fontFamily:"'Space Mono',monospace",fontSize:'1.2rem',fontWeight:700,color:'var(--text)'}}>{transitTotalVials.toLocaleString('pt-BR')}</div>
                          </div>
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:6}}>
                          {transitList.map(t => (
                            <div key={t.sku} style={{display:'grid',gridTemplateColumns:'auto 1fr auto auto',alignItems:'center',gap:12,fontSize:'0.78rem'}}>
                              <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.65rem',background:'rgba(255,170,0,0.1)',border:'1px solid rgba(255,170,0,0.25)',borderRadius:4,padding:'2px 7px',color:'#ffc107'}}>{t.sku}</span>
                              <span style={{color:'var(--text)'}}>{t.name}</span>
                              <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'var(--accent)'}}>×{t.vials}</span>
                              <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.78rem',fontWeight:700,color:'#4cffb0',minWidth:90,textAlign:'right'}}>{fmt(Math.round(t.rev))}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Por Status */}
                  <div className="fin-section">
                    <div className="fin-section-title">Por Status</div>
                    <div className="fin-status-grid">
                      {[{status:'pendente',emoji:'🟡',label:'Pendente'},{status:'pago',emoji:'✅',label:'Pago'},{status:'enviado',emoji:'📦',label:'Enviado'},{status:'entregue',emoji:'🎉',label:'Entregue'},{status:'extraviado',emoji:'⚠️',label:'Extraviado'}].map(({status,emoji,label})=>{
                        const isExtravio = status === 'extraviado';
                        return (
                        <div className="fin-status-card" key={status} style={isExtravio?{borderColor:'rgba(255,80,80,0.35)',background:'rgba(255,80,80,0.04)'}:{}}>
                          <div className="fin-status-emoji">{emoji}</div>
                          <div className="fin-status-label" style={isExtravio?{color:'#ff5050'}:{}}>{label}</div>
                          <div className="fin-status-count">{ordsByStatus(status).length}</div>
                          <div className="fin-status-revenue" style={isExtravio?{color:'#ff5050'}:{}}>{fmt(revByStatus(status))}</div>
                          {isExtravio && hasCost && perdaExtravioCogs > 0 && <div style={{fontSize:'0.62rem',color:'#ff8080',marginTop:4,fontFamily:"'Space Mono',monospace"}}>Perda CMV: {fmt(Math.round(perdaExtravioCogs))}</div>}
                        </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lucratividade por Produto — só aparece quando há _custoVial */}
                  {hasCost && prodLucList.length > 0 && (
                    <div className="fin-section">
                      <div className="fin-section-title">Lucratividade por Produto</div>
                      {prodLucList.map(p=>{
                        const lucro = p.rev - p.cogs;
                        const margem = p.rev > 0 && p.cogs > 0 ? Math.round((lucro/p.rev)*100) : null;
                        return (
                          <div className="fin-luc-row" key={p.name}>
                            <div className="fin-luc-name">{p.name}</div>
                            <div className="fin-luc-qty">×{p.qty}</div>
                            <div className="fin-luc-rev">{fmt(Math.round(p.rev))}</div>
                            {p.custo > 0 ? <>
                              <div className="fin-luc-custo">CMV {fmt(Math.round(p.cogs))}</div>
                              <div className="fin-luc-lucro" style={{color:lucro>=0?'#4cffb0':'#ff5050'}}>{fmt(Math.round(lucro))}</div>
                              <div className="fin-luc-margem" style={{color:margem>=30?'#4cffb0':margem>=15?'#ffc107':'#ff5050'}}>{margem}%</div>
                            </> : <div className="fin-luc-no-cost">custo não definido</div>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Ranking de Produtos */}
                  <div className="fin-section">
                    <div className="fin-section-title">Ranking de Produtos</div>
                    {allRankList.length === 0
                      ? <div style={{color:"var(--muted)",fontSize:"0.85rem"}}>Nenhum pedido ainda</div>
                      : allRankList.map(([name,rev],i)=>(
                        <div className="fin-rank-row" key={name}>
                          <div className="fin-rank-pos">#{i+1}</div>
                          <div className="fin-rank-name">{name}</div>
                          <div className="fin-rank-bar-wrap"><div className="fin-rank-bar" style={{width:`${(rev/allMaxRev)*100}%`}} /></div>
                          <div className="fin-rank-qty">×{allProdQty[name]}</div>
                          <div className="fin-rank-rev">{fmt(rev)}</div>
                        </div>
                      ))
                    }
                  </div>

                  {/* Taxa de Conversão Pré-Orders */}
                  <div className="fin-section">
                    <div className="fin-section-title">Taxa de Conversão — Pré-Orders</div>
                    <div style={{padding:'16px 20px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:20}}>
                        <div style={{flex:1}}>
                          <div style={{height:8,background:'rgba(255,255,255,0.06)',borderRadius:4,overflow:'hidden'}}>
                            <div style={{height:'100%',width:`${taxaConversao}%`,background:'linear-gradient(90deg,var(--accent),#00ffd6)',borderRadius:4,transition:'width 0.6s ease'}} />
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:'0.72rem',color:'var(--muted)'}}>
                            <span>✅ {poConcluidas} convertidas</span>
                            <span>⏳ {poTotal - poConcluidas} abertas/expiradas</span>
                          </div>
                        </div>
                        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'2rem',fontWeight:800,color:'var(--accent)',minWidth:70,textAlign:'right'}}>{taxaConversao}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Projeção Pré-Orders por Produto */}
                  <div className="fin-section">
                    <div className="fin-section-title">Projeção Pré-Orders por Produto</div>
                    {Object.keys(poByProd).length === 0
                      ? <div style={{color:"var(--muted)",fontSize:"0.85rem"}}>Nenhuma reserva ainda</div>
                      : Object.entries(poByProd).sort((a,b)=>b[1].proj-a[1].proj).map(([name,{qty,proj}])=>(
                        <div className="fin-preorder-row" key={name}>
                          <div className="fin-preorder-name">{name}</div>
                          <div className="fin-preorder-qty">{qty} reserva{qty!==1?'s':''}</div>
                          <div className="fin-preorder-proj">{fmt(proj)}</div>
                        </div>
                      ))
                    }
                  </div>

                  {/* Últimos 7 Dias */}
                  <div className="fin-section">
                    <div className="fin-section-title">Últimos 7 Dias</div>
                    <div className="fin-trend-grid">
                      {trendData.map((d,i)=>(
                        <div className="fin-trend-day" key={i}>
                          <div className="fin-trend-val">{d.rev>0?`R$${(d.rev/1000).toFixed(1)}k`:'-'}</div>
                          <div className="fin-trend-bar-wrap">
                            <div className="fin-trend-bar-fill" style={{height:`${(d.rev/maxTrend)*100}%`}} />
                          </div>
                          <div className="fin-trend-label">{d.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}

