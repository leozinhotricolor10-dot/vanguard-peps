// @fragmento do App() — render modais: termos/legal. Antes: 03-rastreio.part.jsx | depois: 05-pix.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
      {/* LEGAL MODAL */}
      {legalModal && (
        <div className="modal-overlay" onClick={()=>setLegalModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:520,maxHeight:'80vh',overflowY:'auto'}}>
            {legalModal==='privacy' && <>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px',marginBottom:12}}>POLÍTICA DE PRIVACIDADE</div>
              <div style={{fontSize:'0.82rem',lineHeight:1.8,color:'var(--muted)'}}>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>Coleta de dados:</strong> Coletamos nome, CPF, telefone, e-mail e endereço exclusivamente para processamento dos pedidos.</p>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>Uso dos dados:</strong> Seus dados são usados apenas para entrega e comunicação sobre seu pedido. Não compartilhamos com terceiros.</p>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>Armazenamento:</strong> Os dados são armazenados de forma segura e podem ser solicitados para exclusão a qualquer momento via <a href="mailto:admin@vanguardpep.com" style={{color:'var(--accent)'}}>admin@vanguardpep.com</a>.</p>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>LGPD:</strong> Em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018). Para exercer seus direitos, entre em contato pelo e-mail acima.</p>
                <p><strong style={{color:'var(--text)'}}>Contato DPO:</strong> admin@vanguardpep.com</p>
              </div>
            </>}
            {legalModal==='terms' && <>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px',marginBottom:12}}>TERMOS DE USO</div>
              <div style={{fontSize:'0.82rem',lineHeight:1.8,color:'var(--muted)'}}>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>Finalidade:</strong> Todos os produtos comercializados pela Vanguard Labs são destinados exclusivamente a pesquisa científica in vitro. Não são medicamentos nem suplementos.</p>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>Responsabilidade:</strong> O comprador assume total responsabilidade pelo uso, armazenamento e manuseio dos produtos adquiridos.</p>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>Idade mínima:</strong> Venda restrita a maiores de 18 anos.</p>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>Pagamento:</strong> Os pedidos são confirmados após envio via WhatsApp e confirmação do pagamento.</p>
                <p style={{marginBottom:10}}><strong style={{color:'var(--text)'}}>Entrega:</strong> Prazos são estimados e podem variar conforme localidade e transportadora.</p>
                <p><strong style={{color:'var(--text)'}}>Contato:</strong> admin@vanguardpep.com</p>
              </div>
            </>}
            {legalModal==='research' && <>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:'var(--accent)',letterSpacing:'1.5px',marginBottom:12}}>RESEARCH USE ONLY</div>
              <div style={{fontSize:'0.82rem',lineHeight:1.8,color:'var(--muted)'}}>
                <p style={{marginBottom:10}}>Os peptídeos disponibilizados pela Vanguard Labs são produzidos e comercializados <strong style={{color:'var(--text)'}}>exclusivamente para fins de pesquisa científica</strong>.</p>
                <p style={{marginBottom:10}}>Estes produtos <strong style={{color:'var(--text)'}}>NÃO foram avaliados pela ANVISA</strong> para uso humano ou animal. Não são medicamentos, suplementos alimentares ou produtos terapêuticos registrados.</p>
                <p>Ao adquirir qualquer produto, o comprador declara estar ciente desta condição e assume total responsabilidade pelo uso.</p>
              </div>
            </>}
            <button onClick={()=>setLegalModal(null)} style={{width:'100%',marginTop:20,padding:'10px',background:'none',border:'1px solid var(--border)',borderRadius:10,color:'var(--muted)',cursor:'pointer',fontFamily:"'Space Mono',monospace",fontSize:'0.72rem'}}>Fechar</button>
          </div>
        </div>
      )}

