// @fragmento do App() — render modais: PIX. Antes: 04-legal.part.jsx | depois: 06-etiqueta.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
      {/* PIX MODAL */}
      {pixModal && (
        <div className="modal-overlay" onClick={()=>setPixModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:460}}>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:'0.6rem',color:'var(--accent)',letterSpacing:'1.5px',marginBottom:16}}>💳 COBRANÇA PIX</div>

            {/* Info do pedido */}
            <div style={{padding:'10px 14px',background:'rgba(0,229,195,0.05)',border:'1px solid rgba(0,229,195,0.15)',borderRadius:10,marginBottom:14,fontSize:'0.82rem'}}>
              <div style={{fontWeight:700,color:'var(--accent)',marginBottom:2}}>{pixModal.buyerName}</div>
              <div style={{color:'var(--muted)',fontSize:'0.72rem'}}>{pixModal._phone||'—'} · CPF {pixModal._cpf||'—'}</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontWeight:700,color:'var(--text)',marginTop:6,fontSize:'1rem'}}>
                R$ {(() => { const tot = pixModal._total || 0; return tot.toLocaleString('pt-BR',{minimumFractionDigits:2}); })()}
              </div>
            </div>

            {/* Passo 1 — gerar no DominiPay */}
            <div style={{fontSize:'0.72rem',color:'var(--muted)',marginBottom:8}}>1. Gere a cobrança no DominiPay e copie o código PIX</div>
            <button onClick={()=>{ const tot = pixModal._total||0; navigator.clipboard.writeText(tot.toLocaleString('pt-BR',{minimumFractionDigits:2})); showToast('Valor copiado!','success'); setTimeout(()=>window.open('https://admin.dominipay.com.br/dashboard','_blank'),400); }} style={{width:'100%',padding:'10px',background:'rgba(139,0,0,0.12)',border:'1px solid rgba(220,80,80,0.3)',borderRadius:10,color:'#e05555',fontWeight:700,fontSize:'0.82rem',cursor:'pointer',fontFamily:"'Space Mono',monospace",marginBottom:14}}>
              💳 ABRIR DOMINIPAY (copia valor)
            </button>

            {/* Passo 2 — colar código e enviar */}
            <div style={{fontSize:'0.72rem',color:'var(--muted)',marginBottom:6}}>2. Cole o código PIX aqui e envie para o cliente</div>
            <textarea
              placeholder="Cole o código PIX aqui (copia e cola do DominiPay)..."
              value={pixCode}
              onChange={e=>setPixCode(e.target.value)}
              style={{width:'100%',minHeight:80,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 10px',color:'var(--text)',fontSize:'0.75rem',fontFamily:"'Space Mono',monospace",resize:'vertical',boxSizing:'border-box',marginBottom:10}}
            />
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <button
                disabled={!pixCode.trim()}
                onClick={()=>{
                  const firstName = (pixModal.buyerName||'Cliente').split(' ')[0];
                  const tot = (pixModal._total||0).toLocaleString('pt-BR',{minimumFractionDigits:2});
                  const code = pixModal._code||'';
                  const msg = `✅ *Olá, ${firstName}! Segue o PIX para pagamento do seu pedido Vanguard Peptides.*${code?`\n\n📋 *Pedido:* ${code}`:''}
💰 *Valor:* R$ ${tot}

_Vou te mandar o código PIX agora, é só copiar e colar no seu banco!_
⚠️ _O código expira em 10 minutos!_
_Vanguard Peptides_ 🧬`;
                  const digits = (pixModal._phone||'').replace(/\D/g,'');
                  const intl = digits.startsWith('55') ? digits : '55'+digits;
                  window.open(`https://wa.me/${intl}?text=${encodeURIComponent(msg)}`,'_blank');
                }}
                style={{flex:1,padding:'11px',background: pixCode.trim() ? 'var(--accent)' : 'rgba(0,229,195,0.2)',border:'none',borderRadius:10,color: pixCode.trim() ? '#000' : 'var(--muted)',fontWeight:700,fontSize:'0.78rem',cursor: pixCode.trim() ? 'pointer' : 'default',fontFamily:"'Space Mono',monospace",transition:'all 0.2s'}}
              >
                📲 ENVIAR MENSAGEM
              </button>
              <button
                disabled={!pixCode.trim()}
                onClick={()=>{ navigator.clipboard.writeText(pixCode.trim()); showToast('Código PIX copiado! Cole no WhatsApp.','success'); }}
                style={{flex:1,padding:'11px',background: pixCode.trim() ? 'rgba(255,200,0,0.12)' : 'rgba(255,200,0,0.04)',border:`1px solid ${pixCode.trim()?'rgba(255,200,0,0.4)':'rgba(255,200,0,0.1)'}`,borderRadius:10,color: pixCode.trim() ? '#ffc800' : 'var(--muted)',fontWeight:700,fontSize:'0.78rem',cursor: pixCode.trim() ? 'pointer' : 'default',fontFamily:"'Space Mono',monospace",transition:'all 0.2s'}}
              >
                📋 COPIAR CÓDIGO
              </button>
            </div>
            <div style={{fontSize:'0.65rem',color:'var(--muted)',textAlign:'center',marginBottom:8}}>Envie a mensagem → vá ao WhatsApp → cole o código como segunda mensagem</div>
            <button onClick={()=>setPixModal(null)} style={{width:'100%',padding:'9px',background:'none',border:'1px solid var(--border)',borderRadius:10,color:'var(--muted)',fontSize:'0.78rem',cursor:'pointer'}}>Fechar</button>
          </div>
        </div>
      )}

