// @fragmento do App() — render admin: aba SORTEIO (mensal). Antes: 12-mapa.part.jsx | depois: 14-config.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
            {/* TAB: SORTEIO */}
            {adminTab==="sorteio" && <SorteioAdmin orders={orders} showToast={showToast} normUF={normUF} />}

