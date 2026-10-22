// @fragmento do App() — render: view calculadora + fecha main/grid da loja antiga. Antes: 13-config.part.jsx | depois: 00-reserva-senha.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
          {/* CALCULADORA */}
          <div className={`view ${view==="calc"?"visible":""}`}>
            {prevView && <button className="detail-back" onClick={()=>{ setView(prevView); setPrevView(null); }}>← Voltar ao produto</button>}
            <div className="page-tag">▸ CALCULADORA</div>
            <div className="page-title">Calculadora de Dose</div>
            <div className="page-sub">Calcule dose, reconstituição com água bacteriostática e duração do frasco.</div>
            <CalcView />
          </div>
        </main>

      </div>

