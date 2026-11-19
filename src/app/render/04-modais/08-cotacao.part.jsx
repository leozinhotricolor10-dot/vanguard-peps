// @fragmento do App() — render modais: cotação para cliente (aba Pedidos do admin, componente CotacaoModal em src/novo/cotacao-admin.jsx). Antes: 07-produto.part.jsx | depois: 05-rodape-fim.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
      {/* COTAÇÃO MODAL */}
      {quoteOpen && adminUnlocked && view === 'admin' && <CotacaoModal products={products} bundles={bundles} effectivePrice={effectivePrice} showToast={showToast} onClose={() => setQuoteOpen(false)} onAccept={openManualFromQuote} />}
