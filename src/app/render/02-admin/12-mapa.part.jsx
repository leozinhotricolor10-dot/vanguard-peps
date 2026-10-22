// @fragmento do App() — render admin: aba MAPA (regiões). Antes: 11-combos.part.jsx | depois: 13-config.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
            {/* TAB: REGIOES */}
            {adminTab==="mapa" && (()=>{
              // Cidades da RMSP (~50km de SBC) — zona motoboy
              const RMSP = new Set([
                'sao paulo','santo andre','sao bernardo do campo','sao caetano do sul',
                'diadema','maua','ribeirao pires','rio grande da serra',
                'guarulhos','osasco','carapicuiba','barueri','santana de parnaiba',
                'itapevi','jandira','cajamar','taboao da serra','embu das artes',
                'embu guacu','embu-guacu','itapecerica da serra','sao lourenco da serra',
                'cotia','vargem grande paulista','franco da rocha','francisco morato',
                'caieiras','mairipora','aruja','santa isabel','suzano',
                'ferraz de vasconcelos','poa','itaquaquecetuba','mogi das cruzes',
                'biritiba mirim','salesopolis','guararema',
              ]);
              function normCity(s){ return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); }
              function cityZone(city,uf){
                if(uf!=='SP') return 'correios';
                return RMSP.has(normCity(city))?'motoboy':'sp-interior';
              }
              // Estima zona pelo DDD do WhatsApp (pré-orders não têm endereço)
              function dddZone(wpp){
                const d=(wpp||'').replace(/\D/g,'');
                let local=d;
                if(local.startsWith('55')&&local.length>=12) local=local.slice(2);
                const ddd=parseInt(local.substring(0,2));
                if(ddd===11) return 'motoboy';
                if(ddd>=12&&ddd<=19) return 'sp-interior';
                return 'correios';
              }

              // Stats pedidos confirmados
              const byCity={}, orderZone={motoboy:0,'sp-interior':0,correios:0};
              let totalOrders=0;
              orders.forEach(o=>{
                const addr=o._address||{};
                const uf=normUF(addr.estado||'');
                const city=addr.cidade?addr.cidade.trim():'';
                if(city&&uf){
                  const k=city+' / '+uf;
                  byCity[k]=(byCity[k]||0)+1;
                  orderZone[cityZone(city,uf)]++;
                  totalOrders++;
                }
              });
              const topCities=Object.entries(byCity).sort((a,b)=>b[1]-a[1]).slice(0,10);

              // Stats pré-orders ativas (estimativa por DDD)
              const activePO=preorders.filter(p=>p.status==='pending'||p.status==='notified');
              const poZone={motoboy:0,'sp-interior':0,correios:0};
              activePO.forEach(po=>{ poZone[dddZone(po.whatsapp)]++; });
              const totalPO=activePO.length;

              // Produtos mais reservados
              const byProduct={};
              activePO.forEach(p=>{
                const k=p.productName||p.product_name||'Produto sem nome';
                if(!byProduct[k]) byProduct[k]={qty:0,reservas:0};
                byProduct[k].qty+=parseInt(p.qty)||1;
                byProduct[k].reservas++;
              });
              const topPO=Object.entries(byProduct).sort((a,b)=>b[1].qty-a[1].qty).slice(0,10);
              const pending=preorders.filter(p=>p.status==='pending').length;
              const notified=preorders.filter(p=>p.status==='notified').length;
              const completed=preorders.filter(p=>p.status==='completed').length;

              const zoneStyle={
                motoboy:      {color:'rgb(96,165,250)', bg:'rgba(59,130,246,0.12)', border:'rgba(59,130,246,0.35)', icon:'🛵', label:'RMSP — MOTOBOY',    sub:'Grande SP (~50km de SBC)'},
                'sp-interior':{color:'rgb(52,211,153)', bg:'rgba(16,185,129,0.1)',  border:'rgba(52,211,153,0.3)',  icon:'🚗', label:'SP INTERIOR',        sub:'Correios / fora da Grande SP'},
                correios:     {color:'#ff9600',         bg:'rgba(251,146,60,0.1)',  border:'rgba(251,146,60,0.3)',  icon:'📮', label:'OUTROS ESTADOS',     sub:'Via Melhor Envios'},
              };

              return <>
                {/* PEDIDOS CONFIRMADOS */}
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                  <div style={{fontSize:'1rem',fontWeight:700,color:'var(--text)'}}>Pedidos por Zona de Entrega</div>
                  <div style={{fontSize:'0.65rem',fontFamily:"'Space Mono',monospace",color:'var(--muted)',background:'var(--bg2)',padding:'2px 8px',borderRadius:20}}>{totalOrders} mapeados</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
                  {Object.entries(zoneStyle).map(([zone,s])=>(
                    <div key={zone} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:12,padding:'12px 14px'}}>
                      <div style={{fontSize:'0.55rem',fontFamily:"'Space Mono',monospace",color:s.color,marginBottom:5,letterSpacing:'0.07em'}}>{s.icon} {s.label}</div>
                      <div style={{fontSize:'1.8rem',fontWeight:700,color:s.color,lineHeight:1}}>{orderZone[zone]}</div>
                      <div style={{fontSize:'0.62rem',color:'var(--muted)',marginTop:4}}>{totalOrders>0?Math.round(orderZone[zone]/totalOrders*100):0}% · {s.sub}</div>
                    </div>
                  ))}
                </div>

                {topCities.length>0&&<>
                  <div style={{fontSize:'0.65rem',fontFamily:"'Space Mono',monospace",color:'var(--muted)',marginBottom:10,letterSpacing:'0.08em'}}>TOP CIDADES — PEDIDOS</div>
                  <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:28}}>
                    {topCities.map(([cityKey,count],i)=>{
                      const parts=cityKey.split(' / ');
                      const zone=cityZone(parts[0],parts[1]||'');
                      const s=zoneStyle[zone];
                      const bar=Math.round((count/topCities[0][1])*100);
                      return (
                        <div key={cityKey} style={{display:'flex',alignItems:'center',gap:10}}>
                          <div style={{width:20,fontSize:'0.6rem',color:'var(--muted)',textAlign:'right',fontFamily:"'Space Mono',monospace",flexShrink:0}}>#{i+1}</div>
                          <div style={{flex:1}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                              <div style={{display:'flex',alignItems:'center',gap:6}}>
                                <span style={{fontSize:'0.78rem',color:'var(--text)'}}>{cityKey}</span>
                                <span style={{fontSize:'0.52rem',fontFamily:"'Space Mono',monospace",color:s.color,background:s.bg,border:`1px solid ${s.border}`,borderRadius:4,padding:'1px 5px'}}>{s.icon} {zone==='motoboy'?'MOTOBOY':zone==='sp-interior'?'INTERIOR':'CORREIOS'}</span>
                              </div>
                              <span style={{fontSize:'0.72rem',fontFamily:"'Space Mono',monospace",color:s.color,fontWeight:700,flexShrink:0,marginLeft:8}}>{count}</span>
                            </div>
                            <div style={{height:4,borderRadius:2,background:'rgba(255,255,255,0.07)',overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${bar}%`,borderRadius:2,background:s.color,transition:'width 0.3s'}}/>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>}
                {totalOrders===0&&<div style={{textAlign:'center',color:'var(--muted)',padding:24,fontSize:'0.82rem',marginBottom:20}}>Nenhum pedido com endereço ainda.</div>}

                {/* PRÉ-ORDERS */}
                <div style={{borderTop:'1px solid var(--border)',paddingTop:24,marginBottom:16,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                  <div style={{fontSize:'1rem',fontWeight:700,color:'var(--text)'}}>Pré-Orders por Zona</div>
                  <div style={{fontSize:'0.65rem',fontFamily:"'Space Mono',monospace",color:'var(--muted)',background:'var(--bg2)',padding:'2px 8px',borderRadius:20}}>{totalPO} ativas</div>
                  <div style={{fontSize:'0.6rem',color:'var(--muted)',fontStyle:'italic'}}>estimado por DDD do WhatsApp</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
                  {Object.entries(zoneStyle).map(([zone,s])=>(
                    <div key={zone} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:12,padding:'12px 14px'}}>
                      <div style={{fontSize:'0.55rem',fontFamily:"'Space Mono',monospace",color:s.color,marginBottom:5,letterSpacing:'0.07em'}}>{s.icon} {s.label}</div>
                      <div style={{fontSize:'1.8rem',fontWeight:700,color:s.color,lineHeight:1}}>{poZone[zone]}</div>
                      <div style={{fontSize:'0.62rem',color:'var(--muted)',marginTop:4}}>{totalPO>0?Math.round(poZone[zone]/totalPO*100):0}% estimado</div>
                    </div>
                  ))}
                </div>

                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:24}}>
                  {[
                    {v:pending,  label:'AGUARDANDO', color:'#fbbf24', bg:'rgba(251,191,36,0.08)',  border:'rgba(251,191,36,0.25)'},
                    {v:notified, label:'NOTIFICADO',  color:'rgb(96,165,250)', bg:'rgba(96,165,250,0.08)', border:'rgba(96,165,250,0.25)'},
                    {v:completed,label:'CONVERTIDO',  color:'#34d399', bg:'rgba(52,211,153,0.08)', border:'rgba(52,211,153,0.25)'},
                  ].map(({v,label,color,bg,border})=>(
                    <div key={label} style={{background:bg,border:`1px solid ${border}`,borderRadius:10,padding:'10px 14px',textAlign:'center'}}>
                      <div style={{fontSize:'1.5rem',fontWeight:700,color}}>{v}</div>
                      <div style={{fontSize:'0.6rem',fontFamily:"'Space Mono',monospace",color:'var(--muted)',marginTop:2}}>{label}</div>
                    </div>
                  ))}
                </div>

                {topPO.length>0&&<>
                  <div style={{fontSize:'0.65rem',fontFamily:"'Space Mono',monospace",color:'var(--muted)',marginBottom:10,letterSpacing:'0.08em'}}>PRODUTOS MAIS RESERVADOS</div>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {topPO.map(([name,{qty,reservas}],i)=>{
                      const bar=Math.round((qty/topPO[0][1].qty)*100);
                      return (
                        <div key={name} style={{display:'flex',alignItems:'center',gap:10}}>
                          <div style={{width:20,fontSize:'0.6rem',color:'var(--muted)',textAlign:'right',fontFamily:"'Space Mono',monospace",flexShrink:0}}>#{i+1}</div>
                          <div style={{flex:1}}>
                            <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                              <span style={{fontSize:'0.78rem',color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'65%'}}>{name}</span>
                              <span style={{fontSize:'0.68rem',fontFamily:"'Space Mono',monospace",color:'#fbbf24',fontWeight:700,flexShrink:0,marginLeft:8}}>{qty} vial{qty!==1?'s':''} · {reservas} reserva{reservas!==1?'s':''}</span>
                            </div>
                            <div style={{height:4,borderRadius:2,background:'rgba(255,255,255,0.07)',overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${bar}%`,borderRadius:2,background:'linear-gradient(90deg,#fbbf24,#f59e0b)',transition:'width 0.3s'}}/>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>}
                {activePO.length===0&&<div style={{textAlign:'center',color:'var(--muted)',padding:32,fontSize:'0.82rem'}}>Nenhuma pré-order ativa no momento.</div>}
              </>;
            })()}

