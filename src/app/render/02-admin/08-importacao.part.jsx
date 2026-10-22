// @fragmento do App() — render admin: aba IMPORTAÇÃO. Antes: 07-financeiro.part.jsx | depois: 09-clientes.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
            {/* TAB: IMPORTAÇÃO */}
            {adminTab==="importacao" && (()=>{
              const cambio       = parseFloat(importForm.cambio)       || 0;
              const freteUsd     = parseFloat(importForm.freteUsd)     || 0;
              const fedexBrl     = parseFloat(importForm.fedexBrl)     || 0;
              const desconto     = parseFloat(importForm.desconto)     || 0;
              const outrosBrl    = parseFloat(importForm.outrosBrl)    || 0;
              const invoiceTotal = parseFloat(importForm.invoiceTotal) || 0;
              const overheadBrl  = freteUsd * cambio + fedexBrl + outrosBrl;

              const validItems = importForm.items.map((it,i)=>({...it,_idx:i})).filter(it => it.sku && it.boxes && it.priceUsd);
              const totalOrderUsd = validItems.reduce((s,it) => s + (parseFloat(it.boxes)||0)*(parseFloat(it.priceUsd)||0)*(1 - desconto/100), 0);
              const totalOrderBrl = totalOrderUsd * cambio;
              const totalCustoCalculado = totalOrderBrl + overheadBrl;

              const calcs = validItems.map(it => {
                const boxes            = parseFloat(it.boxes)    || 0;
                const priceUsdOriginal = parseFloat(it.priceUsd) || 0;
                const priceUsd         = priceUsdOriginal * (1 - desconto / 100);
                const vials            = boxes * 10;
                const itemUsd          = boxes * priceUsd;
                const share            = totalOrderUsd > 0 ? itemUsd / totalOrderUsd : 0;
                // Breakdown detalhado por componente
                const custoUsdBrl  = vials > 0 ? (priceUsd / 10) * cambio : 0;
                const freteAloc    = vials > 0 ? (freteUsd * cambio * share) / vials : 0;
                const fedexAloc    = vials > 0 ? (fedexBrl * share) / vials : 0;
                const outrosAloc   = vials > 0 ? (outrosBrl * share) / vials : 0;
                const overAlloc    = overheadBrl * share;
                const custoVial    = custoUsdBrl + freteAloc + fedexAloc + outrosAloc;
                const custoLote    = custoVial * vials;
                const precoSugAuto = custoVial > 0 ? Math.ceil(custoVial / 0.20) : 0;
                const precoSug     = it.precoSugOverride ? parseInt(it.precoSugOverride) : precoSugAuto;
                // Cotação
                const precoVenda   = parseFloat(it.precoVenda) || precoSug || 0;
                const margemBruta  = precoVenda > 0 ? precoVenda - custoVial : null;
                const margem       = precoVenda > 0 && custoVial > 0 ? ((precoVenda - custoVial) / precoVenda) * 100 : null;
                const markup       = precoVenda > 0 && custoVial > 0 ? ((precoVenda - custoVial) / custoVial) * 100 : null;
                const statusCot    = margem === null ? null : margem >= 80 ? 'Excelente' : margem >= 60 ? 'Bom' : margem >= 40 ? 'Regular' : 'Baixo';
                const colorCot     = margem === null ? '#888' : margem >= 80 ? '#4cffb0' : margem >= 60 ? '#00e5c3' : margem >= 40 ? '#ffc107' : '#ff5050';
                // Simulador: quantos vials para quitar o lote
                const vialsParaQuitar = precoVenda > 0 && custoLote > 0 ? Math.ceil(custoLote / precoVenda) : null;
                return { ...it, vials, itemUsd, priceUsdOriginal, priceUsd, share, custoVial, custoUsdBrl, freteAloc, fedexAloc, outrosAloc, overAlloc, custoLote, precoSug, precoSugAuto, precoVenda, margemBruta, margem, markup, statusCot, colorCot, vialsParaQuitar };
              });

              function updateItem(idx, field, val) {
                const items = importForm.items.map((it,i) => {
                  if (i !== idx) return it;
                  const updated = { ...it, [field]: val };
                  if (field === 'sku') {
                    const cat = ADINA_CATALOG[val.toUpperCase()];
                    if (cat) {
                      updated.name = cat.name; updated.spec = cat.spec; updated.priceUsd = String(cat.priceUsd); updated.sku = val.toUpperCase();
                      // Match por SKU exato — evita colidir variantes que compartilham o mesmo base name (ex: RT15, RT20, RT50 todos "Retatrutide")
                      const existing = products.find(p => (p.sku || '').toUpperCase() === val.toUpperCase());
                      if (existing && existing.price) updated.precoSugOverride = String(existing.price);
                    }
                  }
                  return updated;
                });
                setImportForm(f => ({ ...f, items }));
              }

              function addItem() { setImportForm(f => ({ ...f, items: [...f.items, {sku:'',name:'',spec:'',boxes:'',priceUsd:'',precoSugOverride:'',precoVenda:''}] })); }
              function removeItem(idx) { setImportForm(f => ({ ...f, items: f.items.filter((_,i)=>i!==idx) })); }

              function applyPrices() {
                if (calcs.length === 0) { showToast('Nenhum item calculado','error'); return; }
                let updated = 0; let added = 0;
                // Match por SKU exato — cada variante (RT15, RT20, RT50...) tem seu próprio preço
                const isMatch = (p, c) => !!(p.sku && c.sku && p.sku.toUpperCase() === c.sku.toUpperCase());
                // Atualiza produtos existentes
                const newProducts = products.map(p => {
                  const match = calcs.find(c => c.sku && isMatch(p, c));
                  if (match) { updated++; return { ...p, price: match.precoSug, _custoVial: match.custoVial }; }
                  return p;
                });
                // Adiciona produtos novos que não existem no catálogo
                calcs.forEach(c => {
                  if (!c.sku || !c.precoSug) return;
                  const exists = products.find(p => isMatch(p, c));
                  if (!exists) {
                    added++;
                    newProducts.push({
                      id: 'imp-' + Date.now() + '-' + Math.random().toString(36).slice(2,6),
                      sku: c.sku,
                      name: `${c.name} ${c.spec || ''}`.trim(),
                      desc: c.spec || '',
                      price: c.precoSug,
                      _custoVial: c.custoVial,
                      category: 'emagrecedores',
                      stock: 0,
                      hot: false,
                      badge: null,
                      compounds: null,
                    });
                  }
                });
                persistProducts(newProducts);
                const parts = [];
                if (updated > 0) parts.push(`${updated} preço${updated!==1?'s':''} atualizado${updated!==1?'s':''}`);
                if (added > 0) parts.push(`${added} produto${added!==1?'s':''} novo${added!==1?'s':''} adicionado${added!==1?'s':''}`);
                showToast((parts.join(' · ') || 'Sem alterações') + ' no catálogo ✓', 'success');
              }

              function editImport(h) {
                setImportForm({
                  label: h.label || '',
                  date: h.date || '',
                  cambio: String(h.cambio || ''),
                  freteUsd: String(h.freteUsd || ''),
                  fedexBrl: String(h.fedexBrl || ''),
                  desconto: String(h.desconto || ''),
                  outrosBrl: String(h.outrosBrl || ''),
                  invoiceTotal: String(h.invoiceTotal || ''),
                  items: (h.items||[]).map(it => ({
                    sku: it.sku || '',
                    name: it.name || '',
                    spec: it.spec || '',
                    boxes: String(it.boxes || ''),
                    priceUsd: String(it.priceUsdOriginal || it.priceUsd || ''),
                    precoSugOverride: String(it.precoSug || ''),
                    precoVenda: String(it.precoVenda || it.precoSug || ''),
                  }))
                });
                setEditingImportId(h.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                showToast('Importação carregada para edição ✏️', 'success');
              }

              function cancelEdit() {
                setEditingImportId(null);
                setImportForm({ label:'', date: new Date().toLocaleDateString('pt-BR'), cambio:'', freteUsd:'', fedexBrl:'', desconto:'', outrosBrl:'', invoiceTotal:'', items:[{sku:'',name:'',spec:'',boxes:'',priceUsd:'',precoSugOverride:'',precoVenda:''}] });
              }

              const IMPORT_STATUS = {
                aguardando:  { label: '⏳ Aguardando',   color: '#ffaa00', next: 'em_transito' },
                em_transito: { label: '✈️ Em Trânsito',  color: '#78aaff', next: 'alfandega' },
                alfandega:   { label: '🛃 Alfândega',    color: '#ff9f43', next: 'entregue' },
                entregue:    { label: '✅ Entregue',      color: '#4ade80', next: null },
                apreendida:  { label: '⚠️ Apreendida',   color: '#ff5050', next: null },
              };
              function markImportApreendida(id) {
                const lote = importHistory.find(h => h.id === id);
                if (!lote) return;
                const custo = (parseFloat(lote.totalOrderUsd)||0) * (parseFloat(lote.cambio)||0) + (parseFloat(lote.overheadBrl)||0);
                if (!window.confirm(`Marcar importação "${lote.label||lote.date}" como APREENDIDA?\n\nIsso registra ~R$${Math.round(custo).toLocaleString('pt-BR')} como perda total (100% prejuízo).\nO estoque NÃO será atualizado.`)) return;
                updateImportStatus(id, 'apreendida');
              }
              function updateImportStatus(id, newStatus) {
                const hist = importHistory.map(h => h.id === id ? { ...h, status: newStatus } : h);
                setImportHistory(hist);
                localStorage.setItem('vg-imports', JSON.stringify(hist));
                const updated = hist.find(h => h.id === id);
                if (sb && updated) sb.from('import_history').update({ status: newStatus, data: updated }).eq('id', String(id)).then(({error})=>{ if(error) console.warn('[Supabase] Import status:', error.message); });

                if (newStatus === 'entregue') {
                  const lote = importHistory.find(h => h.id === id);
                  if (lote) {
                    // Adicionar vials ao estoque
                    const newStock = { ...stock };
                    const addedItems = [];
                    (lote.items || []).forEach(it => {
                      const sku = (it.sku || '').toUpperCase();
                      const vials = parseInt(it.vials) || (parseInt(it.boxes) || 0) * 10;
                      if (!vials) return;
                      const prod = products.find(p => (p.sku || '').toUpperCase() === sku);
                      if (!prod) return;
                      newStock[prod.id] = (newStock[prod.id] || 0) + vials;
                      addedItems.push({ name: prod.name, vials });
                    });
                    persistStock(newStock);

                    // Registrar rastreabilidade do lote
                    let lots; try { lots = JSON.parse(localStorage.getItem('vg-stock-lots') || '{}'); } catch { lots = {}; }
                    (lote.items || []).forEach(it => {
                      const sku = (it.sku || '').toUpperCase();
                      const vials = parseInt(it.vials) || (parseInt(it.boxes) || 0) * 10;
                      if (!vials) return;
                      const prod = products.find(p => (p.sku || '').toUpperCase() === sku);
                      if (!prod) return;
                      if (!lots[prod.id]) lots[prod.id] = [];
                      lots[prod.id].push({ lotId: id, date: lote.date, qty: vials });
                    });
                    localStorage.setItem('vg-stock-lots', JSON.stringify(lots));
                    setStockLots(lots);

                    if (addedItems.length) {
                      showToast(`✅ Estoque atualizado: ${addedItems.map(x=>`${x.name} +${x.vials}`).join(', ')}`, 'success');
                    } else {
                      showToast('Status: Entregue — nenhum SKU encontrado no catálogo para dar entrada automática', 'info');
                    }
                  }
                } else {
                  showToast(`Status: ${IMPORT_STATUS[newStatus]?.label || newStatus}`);
                }
              }
              function saveImport() {
                if (calcs.length === 0) { showToast('Preencha SKU, caixas e preço USD de pelo menos um produto','error'); return; }
                const isEditing = !!editingImportId;
                const existingStatus = isEditing ? (importHistory.find(h => h.id === editingImportId)?.status || 'aguardando') : 'aguardando';
                const entry = {
                  id: editingImportId || Date.now(),
                  label: (importForm.label || '').trim(),
                  date: importForm.date, cambio, freteUsd, fedexBrl, desconto, outrosBrl, invoiceTotal,
                  overheadBrl, totalOrderUsd,
                  status: existingStatus,
                  items: calcs
                };
                let hist;
                if (isEditing) {
                  hist = importHistory.map(h => h.id === editingImportId ? entry : h);
                } else {
                  hist = [entry, ...importHistory].slice(0, 20);
                }
                setImportHistory(hist);
                localStorage.setItem('vg-imports', JSON.stringify(hist));
                if (sb) sb.from('import_history').upsert({ id: String(entry.id), data: entry, status: entry.status||'aguardando' }, { onConflict: 'id' }).then(({error})=>{ if(error) console.warn('[Supabase] Import save:', error.message); });
                setEditingImportId(null);
                if (!isEditing) {
                  setImportForm({ label:'', date: new Date().toLocaleDateString('pt-BR'), cambio: importForm.cambio, freteUsd:'', fedexBrl:'', desconto:'', outrosBrl:'', invoiceTotal:'', items:[{sku:'',name:'',spec:'',boxes:'',priceUsd:'',precoSugOverride:'',precoVenda:''}] });
                }
                showToast(isEditing ? 'Importação atualizada ✓' : 'Importação salva ✓', 'success');
                setTimeout(()=>{ document.querySelector('.admin-content')?.scrollTo({ top: 99999, behavior: 'smooth' }); }, 100);
              }

              const inputStyle = { background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:6, padding:'7px 10px', color:'var(--text)', fontSize:'0.8rem', fontFamily:"'DM Sans',sans-serif", width:'100%' };
              const labelStyle = { fontSize:'0.65rem', color:'var(--muted)', marginBottom:3, display:'block' };

              return <>
                {/* BANNER: modo edição */}
                {editingImportId && (
                  <div style={{background:'rgba(255,193,7,0.1)',border:'1px solid rgba(255,193,7,0.4)',borderRadius:10,padding:'10px 16px',marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{fontSize:'0.78rem',color:'#ffc107',fontFamily:"'Space Mono',monospace"}}>✏️ Editando importação salva — alterações sobrescreverão o registro original</span>
                    <button onClick={cancelEdit} style={{background:'none',border:'1px solid rgba(255,193,7,0.4)',borderRadius:6,color:'#ffc107',cursor:'pointer',fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",padding:'4px 10px'}}>✕ Cancelar</button>
                  </div>
                )}

                {/* PARÂMETROS */}
                <div style={{background:'rgba(0,229,195,0.04)',border:'1px solid rgba(0,229,195,0.15)',borderRadius:12,padding:'14px 16px',marginBottom:14}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px',marginBottom:12}}>📋 PARÂMETROS DA IMPORTAÇÃO</div>
                  <div style={{marginBottom:10}}>
                    <label style={labelStyle}>Nome da importação <span style={{opacity:0.5}}>(opcional)</span></label>
                    <input style={inputStyle} placeholder="ex: Compra com a Molly" value={importForm.label||''} onChange={e=>setImportForm(f=>({...f,label:e.target.value}))} />
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr',gap:10}}>
                    <div><label style={labelStyle}>Data</label><input style={inputStyle} value={importForm.date} onChange={e=>setImportForm(f=>({...f,date:e.target.value}))} /></div>
                    <div>
                      <label style={labelStyle}>
                        Câmbio (R$/USD)
                        {cambioInfo.hora && <span style={{marginLeft:6,color:'var(--accent)',fontSize:'0.58rem'}}>✓ {cambioInfo.hora}</span>}
                        {cambioInfo.error && <span style={{marginLeft:6,color:'#ff5050',fontSize:'0.58rem'}}>{cambioInfo.error}</span>}
                      </label>
                      <div style={{display:'flex',gap:5}}>
                        <input style={{...inputStyle,flex:1}} type="number" placeholder="5.80" value={importForm.cambio} onChange={e=>setImportForm(f=>({...f,cambio:e.target.value}))} />
                        <button onClick={fetchCambio} disabled={cambioInfo.loading} title="Atualizar câmbio" style={{background:'rgba(0,229,195,0.1)',border:'1px solid rgba(0,229,195,0.3)',borderRadius:6,color:'var(--accent)',cursor:'pointer',padding:'0 8px',fontSize:'0.8rem',flexShrink:0}}>
                          {cambioInfo.loading ? '⏳' : '🔄'}
                        </button>
                      </div>
                    </div>
                    <div><label style={labelStyle}>Frete USD</label><input style={inputStyle} type="number" placeholder="0.00" value={importForm.freteUsd} onChange={e=>setImportForm(f=>({...f,freteUsd:e.target.value}))} /></div>
                    <div><label style={labelStyle}>Taxa FedEx (R$)</label><input style={inputStyle} type="number" placeholder="0.00" value={importForm.fedexBrl} onChange={e=>setImportForm(f=>({...f,fedexBrl:e.target.value}))} /></div>
                    <div>
                      <label style={labelStyle}>Desconto Fornecedor %</label>
                      <div style={{display:'flex',alignItems:'center',gap:5}}>
                        <input style={{...inputStyle,flex:1}} type="number" min="0" max="100" placeholder="0" value={importForm.desconto} onChange={e=>setImportForm(f=>({...f,desconto:e.target.value}))} />
                        <span style={{fontSize:'0.75rem',color:'var(--muted)',flexShrink:0}}>%</span>
                      </div>
                      {desconto > 0 && <div style={{fontSize:'0.6rem',color:'#4cffb0',marginTop:3}}>-{desconto}% aplicado</div>}
                    </div>
                  </div>
                  {/* Segunda linha: outros custos + valor real */}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginTop:10}}>
                    <div>
                      <label style={labelStyle}>Outros custos (R$) <span style={{color:'var(--muted)',fontSize:'0.58rem'}}>embalagem, taxas, etc.</span></label>
                      <input style={inputStyle} type="number" placeholder="0.00" value={importForm.outrosBrl} onChange={e=>setImportForm(f=>({...f,outrosBrl:e.target.value}))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Valor real pago (R$) <span style={{color:'var(--muted)',fontSize:'0.58rem'}}>invoice/boleto</span></label>
                      <input style={inputStyle} type="number" placeholder="0.00" value={importForm.invoiceTotal} onChange={e=>setImportForm(f=>({...f,invoiceTotal:e.target.value}))} />
                    </div>
                    <div style={{display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
                      {(() => {
                        if (!invoiceTotal || !totalCustoCalculado) return null;
                        const diff = invoiceTotal - totalCustoCalculado;
                        const ok = Math.abs(diff) < totalCustoCalculado * 0.02;
                        return (
                          <div style={{background: ok ? 'rgba(76,255,176,0.07)' : 'rgba(255,80,80,0.07)', border: `1px solid ${ok?'rgba(76,255,176,0.3)':'rgba(255,80,80,0.3)'}`, borderRadius:8, padding:'8px 12px'}}>
                            <div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:4,fontFamily:"'Space Mono',monospace"}}>RECONCILIAÇÃO</div>
                            <div style={{fontSize:'0.72rem',fontFamily:"'Space Mono',monospace"}}>
                              <span style={{color:'var(--muted)'}}>Calc: </span><span style={{color:'var(--text)'}}>R${totalCustoCalculado.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                              <span style={{color:'var(--muted)',margin:'0 6px'}}>|</span>
                              <span style={{color:'var(--muted)'}}>Real: </span><span style={{color:'var(--text)'}}>R${invoiceTotal.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                            </div>
                            <div style={{fontSize:'0.72rem',fontFamily:"'Space Mono',monospace",marginTop:3,color:ok?'#4cffb0':diff>0?'#ff5050':'#ffc107'}}>
                              {ok ? '✓ Bate!' : diff > 0 ? `▲ Diferença de R$${diff.toLocaleString('pt-BR',{minimumFractionDigits:2})} a mais` : `▼ Diferença de R$${Math.abs(diff).toLocaleString('pt-BR',{minimumFractionDigits:2})} a menos`}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  {/* Sumário overhead */}
                  {overheadBrl > 0 && (
                    <div style={{marginTop:10,fontSize:'0.72rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace",borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:8}}>
                      Custo total calculado: <span style={{color:'var(--accent)',fontWeight:700}}>R$ {totalCustoCalculado.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                      {totalOrderUsd > 0 && <> = Produtos USD {totalOrderUsd.toLocaleString('en-US',{minimumFractionDigits:2})} × {cambio}</>}
                      {overheadBrl > 0 && <> + Overhead R${overheadBrl.toLocaleString('pt-BR',{minimumFractionDigits:2})}</>}
                      {desconto > 0 && <> · <span style={{color:'#4cffb0'}}>Desc. {desconto}%</span></>}
                    </div>
                  )}
                </div>

                {/* ITENS */}
                <div className="nva-scrollx" style={{marginBottom:14}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px',marginBottom:10}}>📦 PRODUTOS DO PEDIDO</div>
                  <div style={{display:'grid',gridTemplateColumns:'90px 1fr 60px 70px 80px 90px 90px 32px',gap:6,marginBottom:6,paddingBottom:6,borderBottom:'1px solid var(--border)'}}>
                    {['SKU','Nome','Spec','Caixas','$/cx','Custo/vial','Preço sug.',''].map((h,i)=>(
                      <div key={i} style={{fontSize:'0.6rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace"}}>{h}</div>
                    ))}
                  </div>
                  {importForm.items.map((it,idx) => {
                    const calc = calcs.find(c=>c._idx===idx);
                    return (
                      <div key={idx}>
                        <div style={{display:'grid',gridTemplateColumns:'90px 1fr 60px 70px 80px 90px 90px 32px',gap:6,marginBottom:2,alignItems:'center'}}>
                          <input style={{...inputStyle,fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',textTransform:'uppercase'}} placeholder="RT15" value={it.sku}
                            onChange={e=>updateItem(idx,'sku',e.target.value)}
                            onBlur={e=>{ if(!ADINA_CATALOG[e.target.value.toUpperCase()]) return; updateItem(idx,'sku',e.target.value); }} />
                          <input style={{...inputStyle,fontSize:'0.75rem'}} placeholder="Nome auto" value={it.name} onChange={e=>updateItem(idx,'name',e.target.value)} />
                          <input style={{...inputStyle,fontSize:'0.72rem'}} placeholder="15mg" value={it.spec} onChange={e=>updateItem(idx,'spec',e.target.value)} />
                          <input style={{...inputStyle,textAlign:'center'}} type="number" min="1" placeholder="10" value={it.boxes} onChange={e=>updateItem(idx,'boxes',e.target.value)} />
                          <input style={{...inputStyle,textAlign:'right'}} type="number" placeholder="120" value={it.priceUsd} onChange={e=>updateItem(idx,'priceUsd',e.target.value)} />
                          <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'#aaa',textAlign:'right',paddingRight:4}}>
                            {calc ? `R$${calc.custoVial.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}` : '—'}
                          </div>
                          <input style={{...inputStyle,textAlign:'right',color:'var(--accent)',fontWeight:700,fontFamily:"'Space Mono',monospace",fontSize:'0.78rem'}} type="number" min="0"
                            placeholder={calc ? String(calc.precoSugAuto) : '—'}
                            value={it.precoSugOverride}
                            onChange={e=>updateItem(idx,'precoSugOverride',e.target.value)} />
                          <button onClick={()=>removeItem(idx)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.9rem',padding:0}}>✕</button>
                        </div>
                        {/* Breakdown de custo por produto */}
                        {calc && calc.custoVial > 0 && (
                          <div style={{gridColumn:'1/-1',marginBottom:8,paddingLeft:4,fontSize:'0.6rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace",display:'flex',gap:10,flexWrap:'wrap'}}>
                            <span>Produto: <span style={{color:'var(--text)'}}>R${calc.custoUsdBrl.toFixed(2)}</span></span>
                            {calc.freteAloc > 0 && <span>Frete: <span style={{color:'var(--text)'}}>R${calc.freteAloc.toFixed(2)}</span></span>}
                            {calc.fedexAloc > 0 && <span>FedEx: <span style={{color:'var(--text)'}}>R${calc.fedexAloc.toFixed(2)}</span></span>}
                            {calc.outrosAloc > 0 && <span>Outros: <span style={{color:'var(--text)'}}>R${calc.outrosAloc.toFixed(2)}</span></span>}
                            <span style={{color:'rgba(255,255,255,0.15)'}}>|</span>
                            <span>{calc.vials} vials · Custo lote: <span style={{color:'var(--accent)'}}>R${calc.custoLote.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button onClick={addItem} style={{marginTop:6,padding:'6px 14px',background:'none',border:'1px dashed var(--border)',borderRadius:8,color:'var(--muted)',fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>
                    ＋ Adicionar produto
                  </button>
                </div>

                {/* COTAÇÃO — ANÁLISE DE MARGEM */}
                {calcs.length > 0 && (
                  <div style={{background:'rgba(0,0,0,0.2)',border:'1px solid rgba(0,229,195,0.15)',borderRadius:12,padding:'14px 16px',marginBottom:14}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px',marginBottom:12}}>📊 COTAÇÃO — ANÁLISE DE MARGEM</div>
                    {/* Header */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 100px 110px 100px 80px 80px 90px',gap:8,marginBottom:6,paddingBottom:6,borderBottom:'1px solid var(--border)'}}>
                      {['Produto','Custo/Vial','Preço Venda','Mg. Bruta','Markup','Margem','Status'].map((h,i)=>(
                        <div key={i} style={{fontSize:'0.58rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace"}}>{h}</div>
                      ))}
                    </div>
                    {calcs.map((c,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 100px 110px 100px 80px 80px 90px',gap:8,marginBottom:6,alignItems:'center'}}>
                        <div style={{fontSize:'0.8rem',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name || c.sku}</div>
                        <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'var(--muted)'}}>R${c.custoVial.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                        <input
                          style={{...inputStyle,textAlign:'right',color:'#fff',fontFamily:"'Space Mono',monospace",fontSize:'0.78rem',padding:'5px 8px'}}
                          type="number" min="0" placeholder={String(c.precoSug)}
                          value={importForm.items[c._idx]?.precoVenda || ''}
                          onChange={e=>updateItem(c._idx,'precoVenda',e.target.value)} />
                        <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:c.margemBruta>0?'#4cffb0':'var(--muted)'}}>
                          {c.margemBruta !== null && c.precoVenda > 0 ? `R$${c.margemBruta.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}` : '—'}
                        </div>
                        <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:c.colorCot}}>
                          {c.markup !== null && c.precoVenda > 0 ? `${Math.round(c.markup)}%` : '—'}
                        </div>
                        <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:c.colorCot}}>
                          {c.margem !== null && c.precoVenda > 0 ? `${Math.round(c.margem)}%` : '—'}
                        </div>
                        <div style={{fontSize:'0.65rem',fontFamily:"'Space Mono',monospace",fontWeight:700,color:c.colorCot}}>
                          {c.statusCot || '—'}
                        </div>
                      </div>
                    ))}
                    {/* SIMULADOR */}
                    {calcs.some(c=>c.vialsParaQuitar) && (
                      <div style={{marginTop:14,paddingTop:12,borderTop:'1px solid rgba(255,255,255,0.07)'}}>
                        <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.58rem",color:'var(--muted)',letterSpacing:'1px',marginBottom:8}}>⚡ SIMULADOR — FATURAMENTO MÍNIMO PARA QUITAR O PEDIDO</div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 120px 120px 140px',gap:8,marginBottom:4}}>
                          {['Produto','Custo do Lote','Receita (vender tudo)','Vials para quitar'].map((h,i)=>(
                            <div key={i} style={{fontSize:'0.58rem',color:'var(--muted)',fontFamily:"'Space Mono',monospace"}}>{h}</div>
                          ))}
                        </div>
                        {calcs.filter(c=>c.vials>0).map((c,i)=>(
                          <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 120px 120px 140px',gap:8,marginBottom:4,alignItems:'center'}}>
                            <div style={{fontSize:'0.75rem'}}>{c.name||c.sku}</div>
                            <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'var(--muted)'}}>R${c.custoLote.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>
                            <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'#4cffb0'}}>
                              {c.precoVenda > 0 ? `R$${(c.precoVenda*c.vials).toLocaleString('pt-BR',{minimumFractionDigits:2})}` : '—'}
                            </div>
                            <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.72rem',color:'var(--accent)'}}>
                              {c.vialsParaQuitar ? `${c.vialsParaQuitar} de ${c.vials} vials` : '—'}
                            </div>
                          </div>
                        ))}
                        <div style={{marginTop:8,paddingTop:8,borderTop:'1px solid rgba(255,255,255,0.05)',fontFamily:"'Space Mono',monospace",fontSize:'0.7rem',display:'flex',gap:20,flexWrap:'wrap'}}>
                          <span style={{color:'var(--muted)'}}>Total custo lote: <span style={{color:'var(--accent)',fontWeight:700}}>R${calcs.reduce((s,c)=>s+c.custoLote,0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></span>
                          {calcs.some(c=>c.precoVenda>0) && <span style={{color:'var(--muted)'}}>Receita total (vender tudo): <span style={{color:'#4cffb0',fontWeight:700}}>R${calcs.reduce((s,c)=>s+(c.precoVenda>0?c.precoVenda*c.vials:0),0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></span>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AÇÕES */}
                <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
                  <button onClick={saveImport} style={{padding:'8px 18px',background:editingImportId?'rgba(255,193,7,0.15)':'rgba(0,229,195,0.1)',border:`1px solid ${editingImportId?'rgba(255,193,7,0.4)':'rgba(0,229,195,0.3)'}`,borderRadius:8,color:editingImportId?'#ffc107':'var(--accent)',fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Space Mono',monospace",fontWeight:700}}>
                    {editingImportId ? '💾 Atualizar importação' : '💾 Salvar importação'}
                  </button>
                  <button onClick={applyPrices} style={{padding:'8px 18px',background:'var(--accent)',border:'none',borderRadius:8,color:'#000',fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Space Mono',monospace",fontWeight:700}}>
                    ✅ Aplicar preços ao catálogo
                  </button>
                  {editingImportId && (
                    <button onClick={cancelEdit} style={{padding:'8px 18px',background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>
                      ✕ Novo pedido
                    </button>
                  )}
                </div>

                {/* HISTÓRICO */}
                {importHistory.length > 0 && (
                  <div>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--muted)',letterSpacing:'1.5px',marginBottom:8}}>📁 HISTÓRICO DE IMPORTAÇÕES</div>
                    {importHistory.map(h=>(
                      <div key={h.id} style={{padding:'10px 14px',background: editingImportId===h.id ? 'rgba(255,193,7,0.06)' : 'rgba(255,255,255,0.02)',border:`1px solid ${editingImportId===h.id?'rgba(255,193,7,0.4)':'var(--border)'}`,borderRadius:8,marginBottom:6,fontSize:'0.78rem'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                          <div style={{flex:1}}>
                            {h.label && <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:'0.82rem',fontWeight:600,color:'var(--text)',marginBottom:4}}>{h.label}</div>}
                            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                              <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.65rem',color:'var(--accent)'}}>{h.date}</span>
                              {(() => {
                                const st = h.status || 'aguardando';
                                const cfg = IMPORT_STATUS[st];
                                return (
                                  <span
                                    onClick={()=>{ if(cfg?.next) updateImportStatus(h.id, cfg.next); }}
                                    style={{fontFamily:"'Space Mono',monospace",fontSize:'0.55rem',fontWeight:700,padding:'2px 8px',borderRadius:20,color:cfg?.color,border:`1px solid ${cfg?.color}`,background:`${cfg?.color}18`,cursor:cfg?.next?'pointer':'default',whiteSpace:'nowrap',userSelect:'none',letterSpacing:'0.5px'}}
                                    title={cfg?.next ? `Avançar para: ${IMPORT_STATUS[cfg.next]?.label}` : 'Pedido entregue'}
                                  >{cfg?.label}{cfg?.next ? ' ›' : ''}</span>
                                );
                              })()}
                            </div>
                            <span style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--muted)'}}>
                              Câmbio: {h.cambio} · USD {h.totalOrderUsd?.toFixed(2)} · Overhead: R${h.overheadBrl?.toFixed(2)}
                              {h.invoiceTotal > 0 && <> · Invoice: R${parseFloat(h.invoiceTotal).toFixed(2)}</>}
                            </span>
                          </div>
                          <div style={{display:'flex',gap:6,flexShrink:0,marginLeft:10}}>
                            <button onClick={()=>editImport(h)} style={{background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:6,color:'var(--muted)',cursor:'pointer',fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",padding:'3px 10px'}}>
                              ✏️ Editar
                            </button>
                            {(h.status||'aguardando') === 'apreendida' ? (
                              <button onClick={()=>{ if(window.confirm('Reverter status para Em Trânsito?')) updateImportStatus(h.id, 'em_transito'); }} style={{background:'rgba(100,160,255,0.08)',border:'1px solid rgba(100,160,255,0.3)',borderRadius:6,color:'#78aaff',cursor:'pointer',fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",padding:'3px 10px'}}>
                                ↩️ Reverter
                              </button>
                            ) : (h.status||'aguardando') !== 'entregue' && (
                              <button onClick={()=>markImportApreendida(h.id)} style={{background:'rgba(255,80,80,0.07)',border:'1px solid rgba(255,80,80,0.3)',borderRadius:6,color:'#ff5050',cursor:'pointer',fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",padding:'3px 10px'}}>
                                ⚠️ Apreender
                              </button>
                            )}
                          </div>
                        </div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                          {(h.items||[]).map((it,i)=>{
                            const hasCot = it.precoVenda && it.margem != null;
                            const vials = parseInt(it.vials) || (parseInt(it.boxes)||0)*10;
                            return (
                              <span key={i} style={{fontSize:'0.65rem',fontFamily:"'Space Mono',monospace",background:'rgba(0,229,195,0.06)',border:'1px solid rgba(0,229,195,0.15)',borderRadius:4,padding:'2px 8px',color:'var(--muted)'}}>
                                {it.sku} <span style={{color:'var(--accent)'}}>×{vials}</span> · R${it.precoSug}
                                {hasCot && <span style={{color: it.margem>=80?'#4cffb0':it.margem>=60?'#00e5c3':it.margem>=40?'#ffc107':'#ff5050'}}> · {Math.round(it.margem)}%</span>}
                              </span>
                            );
                          })}
                        </div>
                        {(() => {
                          const st = h.status||'aguardando';
                          if (st === 'entregue') return null;
                          if (st === 'apreendida') {
                            const custo = (parseFloat(h.totalOrderUsd)||0)*(parseFloat(h.cambio)||0) + (parseFloat(h.overheadBrl)||0);
                            return <div style={{marginTop:6,fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",color:'#ff5050'}}>⚠️ Perda total (apreendida): R${Math.round(custo).toLocaleString('pt-BR')}</div>;
                          }
                          const estRev = (h.items||[]).reduce((s,it)=>{
                            const vials = parseInt(it.vials) || (parseInt(it.boxes)||0)*10;
                            const preco = parseFloat(it.precoVenda) || parseFloat(it.precoSug) || 0;
                            return s + vials*preco;
                          }, 0);
                          if (estRev <= 0) return null;
                          return (
                            <div style={{marginTop:6,fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",color:'#4cffb0'}}>
                              💰 Faturamento estimado: R${estRev.toLocaleString('pt-BR')}
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                )}
              </>;
            })()}

