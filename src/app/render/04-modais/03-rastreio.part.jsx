// @fragmento do App() — render modais: rastreamento de pedido. Antes: 02-pedido-manual.part.jsx | depois: 04-legal.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
      {/* RASTREAMENTO DE PEDIDO */}
      {trackModal && (
        <div className="modal-overlay" onClick={()=>setTrackModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:480}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px'}}>📦 RASTREAR PEDIDO</div>
              <button onClick={()=>setTrackModal(false)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'1.1rem'}}>✕</button>
            </div>
            <p style={{fontSize:'0.82rem',color:'var(--muted)',marginBottom:16}}>Digite o código <span style={{fontFamily:"'Space Mono',monospace",color:'var(--accent)'}}>VG-XXXXXX</span> que você recebeu no WhatsApp ao finalizar o pedido.</p>
            <div style={{display:'flex',gap:8,marginBottom:20}}>
              <input
                style={{flex:1,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 14px',color:'var(--text)',fontSize:'0.88rem',fontFamily:"'DM Sans',sans-serif"}}
                placeholder="Código VG-XXXXXX"
                value={trackQuery}
                onChange={e=>setTrackQuery(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&searchOrders()}
                autoFocus
              />
              <button onClick={()=>searchOrders()} disabled={trackLoading} style={{padding:'10px 18px',background:'var(--accent)',border:'none',borderRadius:8,color:'#000',fontWeight:700,fontSize:'0.82rem',cursor:'pointer',fontFamily:"'Space Mono',monospace",whiteSpace:'nowrap'}}>
                {trackLoading ? '...' : 'BUSCAR'}
              </button>
            </div>

            {trackLoading && (
              <div style={{textAlign:'center',color:'var(--muted)',fontSize:'0.82rem',padding:'20px 0'}}>Buscando seus pedidos...</div>
            )}
            {trackResults === null && !trackLoading && (
              <div style={{textAlign:'center',color:'var(--muted)',fontSize:'0.82rem',padding:'20px 0'}}>⬆ Informe seu CPF acima</div>
            )}
            {trackResults && trackResults.length === 0 && (
              <div style={{textAlign:'center',color:'var(--muted)',fontSize:'0.82rem',padding:'20px 0'}}>Nenhum pedido encontrado. Verifique os dados e tente novamente.</div>
            )}
            {trackResults && trackResults.length > 0 && (
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--muted)',letterSpacing:'1px'}}>
                  {trackResults[0].buyerName && <span style={{color:'var(--text)',fontWeight:700}}>{trackResults[0].buyerName.split(' ')[0]}</span>}
                  {' — '}{trackResults.length} pedido{trackResults.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
            {trackResults && trackResults.length > 0 && trackResults.map(o => {
              const STATUS = { pendente:{emoji:'🟡',label:'Aguardando confirmação',color:'#ffc107'}, pago:{emoji:'✅',label:'Pagamento confirmado',color:'#4cffb0'}, enviado:{emoji:'🚚',label:'A caminho',color:'#64a0ff'}, entregue:{emoji:'🎉',label:'Entregue',color:'var(--accent)'}, cancelado:{emoji:'❌',label:'Cancelado',color:'#ff5050'} };
              const s = STATUS[o.status] || STATUS.pendente;
              return (
                <div key={o.id} style={{background:'var(--bg2)',border:`1px solid ${s.color}33`,borderRadius:12,padding:'14px 16px',marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.62rem',color:'var(--muted)'}}>
                      {o.code && <span style={{color:'var(--accent)',marginRight:8}}>{o.code}</span>}
                      {new Date(o.date).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'})}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6,background:`${s.color}22`,border:`1px solid ${s.color}44`,borderRadius:20,padding:'3px 10px'}}>
                      <span>{s.emoji}</span>
                      <span style={{fontSize:'0.72rem',fontWeight:700,color:s.color,fontFamily:"'Space Mono',monospace"}}>{s.label}</span>
                    </div>
                  </div>
                  <div style={{fontSize:'0.82rem',marginBottom:8}}>
                    {(o.items||[]).map((it,i)=>{
                      const p = products.find(x=>x.id===it.peptideId);
                      return <div key={i} style={{display:'flex',justifyContent:'space-between',color:'var(--text)',marginBottom:2}}>
                        <span>{p?p.name:(it.peptideId||'Produto')}</span>
                        <span style={{color:'var(--muted)'}}>×{it.qty||1}</span>
                      </div>;
                    })}
                  </div>
                  {o.total > 0 && <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.75rem',color:'var(--accent)',textAlign:'right',borderTop:'1px solid var(--border)',paddingTop:8,marginTop:6}}>
                    Total: R$ {o.total.toLocaleString('pt-BR')}
                  </div>}
                  {o.tracking_code && (
                    <div style={{marginTop:10,padding:'10px 12px',background:'rgba(0,229,195,0.05)',border:'1px solid rgba(0,229,195,0.2)',borderRadius:8}}>
                      <div style={{fontSize:'0.62rem',color:'var(--muted)',marginBottom:4}}>🔍 Código de rastreio</div>
                      <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.78rem',color:'var(--text)',marginBottom:8,letterSpacing:'0.5px'}}>{o.tracking_code}</div>
                      <a href={`https://melhorrastreio.com.br/rastreio/${o.tracking_code}`} target="_blank" rel="noreferrer" style={{display:'block',padding:'7px',background:'var(--accent)',borderRadius:7,color:'#000',fontWeight:700,fontSize:'0.72rem',textAlign:'center',textDecoration:'none',fontFamily:"'Space Mono',monospace"}}>📲 ACOMPANHAR ENTREGA</a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

