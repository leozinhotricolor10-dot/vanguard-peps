// @fragmento do App() — render admin: aba CUPONS. Antes: 09-clientes.part.jsx | depois: 11-combos.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
            {/* TAB: CUPONS */}
            {adminTab==="cupons" && (()=>{
              const iStyle = { background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:6, padding:'7px 10px', color:'var(--text)', fontSize:'0.82rem', fontFamily:"'DM Sans',sans-serif", width:'100%' };
              const lStyle = { fontSize:'0.65rem', color:'var(--muted)', marginBottom:3, display:'block' };
              const editing = couponForm?.id && coupons.find(c=>c.id===couponForm.id);

              async function saveCoupon() {
                if (!couponForm.code?.trim()) { showToast('Código obrigatório','error'); return; }
                if (!couponForm.value || parseFloat(couponForm.value) <= 0) { showToast('Valor inválido','error'); return; }
                const row = { code: couponForm.code.trim().toUpperCase(), type: couponForm.type||'percent', value: parseFloat(couponForm.value), min_order: parseFloat(couponForm.minOrder)||0, expires_at: couponForm.expiresAt||null, active: couponForm.active!==false };
                if (sb) {
                  if (editing) {
                    await sb.from('coupons').update(row).eq('id', couponForm.id);
                    setCoupons(cs => cs.map(c => c.id===couponForm.id ? {...c, ...row, minOrder:row.min_order, expiresAt:row.expires_at} : c));
                  } else {
                    const { data } = await sb.from('coupons').insert(row).select().single();
                    if (data) setCoupons(cs => [{ id:data.id, code:data.code, type:data.type, value:data.value, minOrder:data.min_order, expiresAt:data.expires_at, active:data.active }, ...cs]);
                  }
                } else {
                  const entry = { id: editing ? couponForm.id : Date.now(), ...row, minOrder:row.min_order, expiresAt:row.expires_at };
                  persistCoupons(editing ? coupons.map(c=>c.id===entry.id?entry:c) : [...coupons, entry]);
                }
                setCouponForm(null);
                showToast(editing ? 'Cupom atualizado ✓' : 'Cupom criado ✓', 'success');
              }

              return <>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px'}}>🏷️ GERENCIAR CUPONS</div>
                  <button onClick={()=>setCouponForm({code:'',type:'percent',value:'',minOrder:'',expiresAt:'',active:true})} style={{padding:'7px 14px',background:'rgba(255,150,0,0.1)',border:'1px solid rgba(255,150,0,0.3)',borderRadius:8,color:'#ff9600',fontSize:'0.72rem',cursor:'pointer',fontFamily:"'Space Mono',monospace",fontWeight:700}}>＋ Novo Cupom</button>
                </div>

                {couponForm && (
                  <div style={{background:'rgba(255,150,0,0.04)',border:'1px solid rgba(255,150,0,0.2)',borderRadius:12,padding:'16px',marginBottom:20}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'#ff9600',letterSpacing:'1.5px',marginBottom:14}}>{editing?'✏️ EDITAR CUPOM':'＋ NOVO CUPOM'}</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:10}}>
                      <div><label style={lStyle}>Código *</label><input style={{...iStyle,textTransform:'uppercase',fontFamily:"'Space Mono',monospace",letterSpacing:'2px'}} placeholder="VANGUARD10" value={couponForm.code} onChange={e=>setCouponForm(f=>({...f,code:e.target.value.toUpperCase()}))} /></div>
                      <div><label style={lStyle}>Tipo</label>
                        <select style={iStyle} value={couponForm.type} onChange={e=>setCouponForm(f=>({...f,type:e.target.value}))}>
                          <option value="percent">% Porcentagem</option>
                          <option value="fixed">R$ Valor fixo</option>
                        </select>
                      </div>
                      <div><label style={lStyle}>Desconto ({couponForm.type==='percent'?'%':'R$'}) *</label><input style={iStyle} type="number" min="1" placeholder={couponForm.type==='percent'?'10':'50'} value={couponForm.value} onChange={e=>setCouponForm(f=>({...f,value:e.target.value}))} /></div>
                      <div><label style={lStyle}>Pedido mínimo (R$)</label><input style={iStyle} type="number" min="0" placeholder="0 = sem mínimo" value={couponForm.minOrder} onChange={e=>setCouponForm(f=>({...f,minOrder:e.target.value}))} /></div>
                      <div><label style={lStyle}>Validade (opcional)</label><input style={iStyle} type="date" value={couponForm.expiresAt||''} onChange={e=>setCouponForm(f=>({...f,expiresAt:e.target.value}))} /></div>
                      <div style={{display:'flex',alignItems:'center',gap:8,paddingTop:18}}>
                        <input type="checkbox" id="coupon-active" checked={couponForm.active!==false} onChange={e=>setCouponForm(f=>({...f,active:e.target.checked}))} style={{width:16,height:16,accentColor:'#ff9600',cursor:'pointer'}} />
                        <label htmlFor="coupon-active" style={{fontSize:'0.78rem',cursor:'pointer'}}>Ativo</label>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={saveCoupon} style={{padding:'8px 18px',background:'#ff9600',border:'none',borderRadius:8,color:'#000',fontSize:'0.72rem',fontWeight:700,cursor:'pointer',fontFamily:"'Space Mono',monospace"}}>💾 Salvar</button>
                      <button onClick={()=>setCouponForm(null)} style={{padding:'8px 14px',background:'transparent',border:'1px solid var(--border)',borderRadius:8,color:'var(--muted)',fontSize:'0.72rem',cursor:'pointer'}}>Cancelar</button>
                    </div>
                  </div>
                )}

                {coupons.length === 0
                  ? <div style={{textAlign:'center',color:'var(--muted)',padding:'40px 0',fontSize:'0.85rem'}}>Nenhum cupom cadastrado</div>
                  : <div>
                    {coupons.map(c => {
                      const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                      return (
                        <div key={c.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',background:'var(--card)',border:`1px solid ${c.active&&!expired?'rgba(255,150,0,0.25)':'var(--border)'}`,borderRadius:10,marginBottom:8,opacity:c.active&&!expired?1:0.5}}>
                          <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.9rem',fontWeight:700,color:c.active&&!expired?'#ff9600':'var(--muted)',minWidth:100}}>{c.code}</div>
                          <div style={{flex:1,fontSize:'0.78rem',color:'var(--muted)'}}>
                            <span style={{color:'var(--text)',fontWeight:600}}>{c.type==='percent'?`-${c.value}%`:`-R$ ${c.value}`}</span>
                            {c.minOrder > 0 && <span> · mín. R$ {c.minOrder}</span>}
                            {c.expiresAt && <span> · até {new Date(c.expiresAt).toLocaleDateString('pt-BR')}</span>}
                            {expired && <span style={{color:'#ff5050'}}> · EXPIRADO</span>}
                          </div>
                          <div style={{fontSize:'0.65rem',fontFamily:"'Space Mono',monospace",color:c.active&&!expired?'var(--accent)':'var(--muted)'}}>{c.active&&!expired?'ATIVO':'INATIVO'}</div>
                          <button onClick={async()=>{ const na=!c.active; if(sb) await sb.from('coupons').update({active:na}).eq('id',c.id); setCoupons(cs=>cs.map(x=>x.id===c.id?{...x,active:na}:x)); if(!sb) persistCoupons(coupons.map(x=>x.id===c.id?{...x,active:na}:x)); }} style={{background:'none',border:'1px solid var(--border)',borderRadius:6,color:'var(--muted)',cursor:'pointer',fontSize:'0.65rem',padding:'3px 8px',fontFamily:"'Space Mono',monospace"}}>{c.active?'PAUSAR':'ATIVAR'}</button>
                          <button onClick={()=>setCouponForm({...c,value:String(c.value),minOrder:String(c.minOrder||''),expiresAt:c.expiresAt||''})} style={{background:'none',border:'1px solid var(--border)',borderRadius:6,color:'var(--muted)',cursor:'pointer',fontSize:'0.65rem',padding:'3px 8px'}}>✏️</button>
                          <button onClick={async()=>{ if(!confirm('Excluir cupom '+c.code+'?')) return; if(sb) await sb.from('coupons').delete().eq('id',c.id); setCoupons(cs=>cs.filter(x=>x.id!==c.id)); if(!sb) persistCoupons(coupons.filter(x=>x.id!==c.id)); }} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.85rem'}}>✕</button>
                        </div>
                      );
                    })}
                  </div>
                }
              </>;
            })()}

