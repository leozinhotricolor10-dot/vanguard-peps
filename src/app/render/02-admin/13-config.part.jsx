// @fragmento do App() — render admin: aba CONFIG + fecha a view admin. Antes: 12-mapa.part.jsx | depois: 03-calculadora.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
            {/* TAB: CONFIG */}
            {adminTab==="config" && <>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:"var(--accent)",letterSpacing:"2px",marginBottom:16}}>⚙️ CONFIGURAÇÕES</div>

              {/* CEP Origem Simulador */}
              <div style={{padding:'16px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,marginBottom:16}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.62rem",color:"var(--accent)",letterSpacing:"1.5px",marginBottom:6}}>📍 CEP DE ORIGEM — SIMULADOR DE FRETE</div>
                <div style={{fontSize:"0.78rem",color:"var(--muted)",marginBottom:12}}>CEP usado como origem no simulador público <code style={{color:'var(--accent)'}}>vanguardpep.com/#/frete</code>. Configure com o seu CEP de envio.</div>
                <div style={{display:'flex',gap:8}}>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 09750-000"
                    value={freteOriginCep}
                    onChange={e=>setFreteOriginCep(e.target.value.replace(/[^\d-]/g,'').slice(0,9))}
                    style={{flex:1,padding:'10px 12px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,color:'var(--text)',fontSize:'0.88rem',fontFamily:"'Space Mono',monospace"}}
                  />
                  <button onClick={async()=>{
                    const cep = freteOriginCep.replace(/\D/g,'');
                    if(cep.length!==8){showToast('CEP inválido','error');return;}
                    if(sb) await sb.from('site_config').upsert({key:'origin_cep',value:freteOriginCep});
                    showToast('CEP de origem salvo!','success');
                  }} style={{padding:'10px 18px',background:'var(--accent)',border:'none',borderRadius:8,color:'#000',fontWeight:700,cursor:'pointer',fontFamily:"'Space Mono',monospace",fontSize:'0.72rem'}}>
                    SALVAR
                  </button>
                </div>
                <div style={{marginTop:10,fontSize:'0.72rem',color:'var(--muted)'}}>
                  Link do simulador para enviar ao cliente: <button onClick={()=>{navigator.clipboard.writeText('https://vanguardpep.com/#/frete');showToast('Link copiado!','success');}} style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:'0.72rem',padding:0,fontFamily:"'Space Mono',monospace"}}>copiar link</button>
                </div>
              </div>
            </>}

            </>}
          </div>

