// @fragmento do App() — render: rodapé, bottom nav mobile, loading, boas-vindas, nome; fecha o return e a function App(). Antes: 07-produto.part.jsx | depois: src/main.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
      {/* RODAPÉ */}
      <footer className="site-footer">
        <div className="footer-disclaimer">
          <strong>⚠️ AVISO IMPORTANTE</strong><br/>
          Todos os produtos são destinados exclusivamente para fins de pesquisa científica.<br/>
          <strong>NÃO destinados ao consumo humano ou animal.</strong> Não constituem medicamentos,<br/>
          suplementos alimentares ou produtos terapêuticos. O uso é de total responsabilidade do comprador.<br/>
          Consulte sempre um profissional de saúde habilitado.
        </div>
        <div style={{marginBottom:14,fontFamily:"'Space Mono',monospace",fontSize:"0.65rem",color:"var(--muted)"}}>
          📧 <a href="mailto:admin@vanguardpep.com" style={{color:"var(--accent)",textDecoration:"none",opacity:0.85}}>admin@vanguardpep.com</a>
          <span style={{margin:"0 10px",opacity:0.3}}>·</span>
          <a href="https://wa.me/447418333521" target="_blank" style={{color:"var(--accent)",textDecoration:"none",opacity:0.85}}>💬 WhatsApp</a>
        </div>
        <div className="footer-links">
          <a className="footer-link" href="#" onClick={e=>{e.preventDefault();setLegalModal('privacy');}}>Política de Privacidade</a>
          <a className="footer-link" href="#" onClick={e=>{e.preventDefault();setLegalModal('terms');}}>Termos de Uso</a>
          <a className="footer-link" href="#" onClick={e=>{e.preventDefault();setLegalModal('research');}}>Research Use Only</a>
          <a className="footer-link" href="https://wa.me/447418333521" target="_blank">Contato</a>
        </div>
        <div className="footer-copy">© {new Date().getFullYear()} Vanguard Labs · vanguardpep.com</div>
      </footer>
      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="mobile-bottom-nav">
        <button className={view==="catalog"?"active":""} onClick={()=>setView("catalog")}>
          <span className="mob-icon">🏠</span>CATÁLOGO
        </button>
        <button className={view==="calc"?"active":""} onClick={()=>setView("calc")}>
          <span className="mob-icon">💊</span>CALC
        </button>
        <button className={view==="cart"?"active":""} onClick={()=>{ if(!myName){ setNameModalInput(""); setShowNameModal(true); } else setView("cart"); }}>
          <span className="mob-icon">🛒</span>CARRINHO
          {cartCount > 0 && <span className="mob-cart-badge">{cartCount}</span>}
        </button>
        <button onClick={()=>{ const cpf=(()=>{try{return JSON.parse(localStorage.getItem('vg-checkout')||'{}').cpf||'';}catch{return '';}})(); setTrackModal(true); if(cpf){setTrackQuery(cpf);searchOrders(cpf);}else{setTrackResults(null);setTrackQuery('');} }} className={trackModal?"active":""}>
          <span className="mob-icon">📦</span>PEDIDO
        </button>
        <button className={view==="faq"?"active":""} onClick={()=>setView("faq")}>
          <span className="mob-icon">❓</span>FAQ
        </button>
        {adminUnlocked && <button className={view==="admin"?"active":""} onClick={()=>setView("admin")}>
          <span className="mob-icon">⚙️</span>ADMIN
          {orders.filter(o=>(o.status||'pendente')==='pendente').length > 0 && <span className="mob-cart-badge">{orders.filter(o=>(o.status||'pendente')==='pendente').length}</span>}
        </button>}
      </div>

      {/* ── LOADING OVERLAY ── */}
      {isLoading && !showWelcome && (
        <div className="loading-overlay">
          <div className="loading-logo">VANGUARD</div>
          <div className="loading-spinner"></div>
          <div className="loading-text">Carregando produtos...</div>
        </div>
      )}

      {/* ── WELCOME MODAL (primeira visita) ── */}
      {showWelcome && !novoActive && !novoAdmin && (
        <div className="welcome-overlay">
          <div className="welcome-modal">
            <div className="welcome-logo">💊 Vanguard Peptides</div>
            <div className="welcome-title">Bem-vindo!</div>
            <div className="welcome-sub">Para agilizar o atendimento e identificar seu pedido, informe como quer ser chamado.</div>
            <input className="welcome-input" type="text" placeholder="Seu nome" value={nameModalInput}
              onChange={e=>setNameModalInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleWelcomeConfirm()}
              autoFocus />
            <button className="welcome-btn" onClick={handleWelcomeConfirm} disabled={!nameModalInput.trim()}>
              Entrar no catálogo →
            </button>
            <button className="welcome-skip" onClick={()=>{ localStorage.setItem("vg-welcomed","1"); setShowWelcome(false); }}>
              Pular por agora
            </button>
          </div>
        </div>
      )}

      {/* ── NAME MODAL (mobile sem nome) ── */}
      {showNameModal && !novoActive && !novoAdmin && (
        <div className="welcome-overlay" onClick={()=>setShowNameModal(false)}>
          <div className="welcome-modal" onClick={e=>e.stopPropagation()}>
            <div className="welcome-logo">👤 Identificação</div>
            <div className="welcome-title">Seu nome</div>
            <div className="welcome-sub">Precisamos do seu nome para identificar o pedido no sistema.</div>
            <input className="welcome-input" type="text" placeholder="Como quer ser chamado?" value={nameModalInput}
              onChange={e=>setNameModalInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleNameConfirm()}
              autoFocus />
            <button className="welcome-btn" onClick={handleNameConfirm} disabled={!nameModalInput.trim()}>
              Confirmar
            </button>
          </div>
        </div>
      )}

      </>}
    </div>
  );
}

