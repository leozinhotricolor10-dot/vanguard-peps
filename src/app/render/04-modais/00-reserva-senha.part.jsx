// @fragmento do App() — render modais: reserva simples (pré-order) e senha do admin. Antes: 03-calculadora.part.jsx | depois: 01-pedido-detalhe.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
      {/* MODAL RESERVA SIMPLES */}
      {preorderModal && (
        <div className="preorder-modal-overlay" onClick={()=>setPreorderModal(null)}>
          <div className="preorder-modal" onClick={e=>e.stopPropagation()}>
            <div className="preorder-modal-title">🔔 Fazer Reserva</div>
            <div className="preorder-modal-sub">Quando o produto chegar em estoque, você será avisado pelo WhatsApp para confirmar o pedido.</div>
            <div className="preorder-modal-product">{preorderModal.peptide.name}</div>
            <div className="preorder-field">
              <label>Seu nome</label>
              <input value={preorderForm.name} onChange={e=>setPreorderForm(f=>({...f,name:e.target.value}))} placeholder="Ex: Ana Silva" autoFocus />
            </div>
            <div className="preorder-field">
              <label>WhatsApp (com DDD)</label>
              <input value={preorderForm.whatsapp} onChange={e=>setPreorderForm(f=>({...f,whatsapp:e.target.value}))} placeholder="74999710520" type="tel" />
            </div>
            <div className="preorder-field">
              <label>Quantidade</label>
              <input type="number" min="1" max="10" value={preorderForm.qty} onChange={e=>setPreorderForm(f=>({...f,qty:parseInt(e.target.value)||1}))} />
            </div>
            <div className="preorder-modal-btns">
              <button className="preorder-cancel-btn" onClick={()=>setPreorderModal(null)}>Cancelar</button>
              <button className="preorder-confirm-btn" onClick={()=>{
                const name = (preorderForm.name||'').trim();
                const whatsapp = (preorderForm.whatsapp||'').trim();
                if (!name) { showToast('Informe seu nome','error'); return; }
                if (!whatsapp) { showToast('Informe seu WhatsApp','error'); return; }
                savePreorder(preorderModal.peptide, {name, whatsapp, qty: preorderForm.qty||1});
                saveName(name);
                setPreorderModal(null);
                showToast(`Reserva de ${preorderModal.peptide.name} registrada! Você será avisado pelo WhatsApp 🔔`, 'success');
              }}>Confirmar Reserva</button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN PASSWORD MODAL */}
      {adminPwModal && (
        <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget){ setAdminPwModal(false); setAdminPwInput(''); } }}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:360}}>
            <div style={{textAlign:'center',marginBottom:20}}>
              <div style={{fontSize:'2rem',marginBottom:8}}>🔒</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:700}}>Acesso Admin</div>
              <div style={{color:'var(--muted)',fontSize:'0.8rem',marginTop:4}}>Digite o código de administrador</div>
            </div>
            <input
              type="password"
              autoFocus
              value={adminPwInput}
              onChange={e=>setAdminPwInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter') submitAdminPassword(); if(e.key==='Escape'){ setAdminPwModal(false); setAdminPwInput(''); } }}
              placeholder="••••••••"
              style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:10,color:'var(--text)',fontSize:'1.1rem',padding:'12px 16px',outline:'none',boxSizing:'border-box',textAlign:'center',letterSpacing:'0.2em',marginBottom:16}}
            />
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>{ setAdminPwModal(false); setAdminPwInput(''); }} style={{flex:1,padding:'11px',background:'transparent',border:'1px solid var(--border)',color:'var(--muted)',borderRadius:10,cursor:'pointer',fontFamily:"'Space Mono',monospace",fontSize:'0.7rem'}}>Cancelar</button>
              <button onClick={submitAdminPassword} style={{flex:1,padding:'11px',background:'var(--accent)',border:'none',color:'#000',borderRadius:10,cursor:'pointer',fontFamily:"'Space Mono',monospace",fontSize:'0.7rem',fontWeight:700}}>ENTRAR</button>
            </div>
          </div>
        </div>
      )}

