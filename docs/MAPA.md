# Mapa do código (gerado por `npm run mapa` — não editar à mão)

Ordem = `src/manifest.json` (é a ordem de montagem). `.part.jsx` = pedaço do corpo de `function App()`, não é JS válido sozinho. `src/blobs/` = fotos base64: **não ler**.

| Arquivo | Linhas | KB |
|---|---:|---:|
| `src/styles/antigo-1.css` | 483 | 49 |
| `src/styles/antigo-2.css` | 510 | 37 |
| `src/blobs/product-images.js` | 13 | 1361 |
| `src/core/catalogo.jsx` | 192 | 18 |
| `src/core/supabase.jsx` | 141 | 7 |
| `src/core/conteudo.jsx` | 413 | 27 |
| `src/blobs/banner-bg.js` | 1 | 128 |
| `src/core/faq.jsx` | 35 | 2 |
| `src/views/calc.jsx` | 451 | 20 |
| `src/views/portal.jsx` | 177 | 11 |
| `src/novo/rotas.jsx` | 68 | 4 |
| `src/novo/css.jsx` | 176 | 17 |
| `src/novo/admin-shell.jsx` | 221 | 16 |
| `src/novo/sorteio-admin.jsx` | 532 | 34 |
| `src/novo/sorteio-palco.jsx` | 137 | 10 |
| `src/novo/componentes.jsx` | 188 | 11 |
| `src/novo/loja.jsx` | 662 | 43 |
| `src/app/logica/01-estado-rotas.part.jsx` | 333 | 24 |
| `src/app/logica/02-notificacoes-status.part.jsx` | 160 | 9 |
| `src/app/logica/03-melhor-envios-cambio.part.jsx` | 277 | 17 |
| `src/app/logica/04-supabase-sync.part.jsx` | 376 | 20 |
| `src/app/logica/05-checkout.part.jsx` | 199 | 10 |
| `src/app/logica/06-pedido-manual.part.jsx` | 267 | 13 |
| `src/app/logica/07-precos-pontos-preorders.part.jsx` | 315 | 15 |
| `src/app/logica/08-carrinho-admin.part.jsx` | 473 | 24 |
| `src/app/render/00-casca-portal-manual.part.jsx` | 631 | 48 |
| `src/app/render/01-loja-antiga.part.jsx` | 676 | 42 |
| `src/app/render/02-admin/00-cabecalho.part.jsx` | 101 | 9 |
| `src/app/render/02-admin/01-pedidos.part.jsx` | 440 | 37 |
| `src/app/render/02-admin/02-estoque.part.jsx` | 240 | 20 |
| `src/app/render/02-admin/03-produtos.part.jsx` | 229 | 20 |
| `src/app/render/02-admin/04-artigos.part.jsx` | 86 | 6 |
| `src/app/render/02-admin/05-preorders.part.jsx` | 258 | 20 |
| `src/app/render/02-admin/06-avisos.part.jsx` | 34 | 2 |
| `src/app/render/02-admin/07-financeiro.part.jsx` | 569 | 42 |
| `src/app/render/02-admin/08-importacao.part.jsx` | 520 | 41 |
| `src/app/render/02-admin/09-clientes.part.jsx` | 85 | 9 |
| `src/app/render/02-admin/10-cupons.part.jsx` | 85 | 9 |
| `src/app/render/02-admin/11-combos.part.jsx` | 136 | 14 |
| `src/app/render/02-admin/12-mapa.part.jsx` | 173 | 12 |
| `src/app/render/02-admin/13-sorteio.part.jsx` | 4 | 0 |
| `src/app/render/02-admin/14-config.part.jsx` | 36 | 3 |
| `src/app/render/03-calculadora.part.jsx` | 13 | 1 |
| `src/app/render/04-modais/00-reserva-senha.part.jsx` | 63 | 4 |
| `src/app/render/04-modais/01-pedido-detalhe.part.jsx` | 275 | 27 |
| `src/app/render/04-modais/02-pedido-manual.part.jsx` | 163 | 16 |
| `src/app/render/04-modais/03-rastreio.part.jsx` | 82 | 7 |
| `src/app/render/04-modais/04-legal.part.jsx` | 39 | 5 |
| `src/app/render/04-modais/05-pix.part.jsx` | 65 | 5 |
| `src/app/render/04-modais/06-etiqueta.part.jsx` | 188 | 22 |
| `src/app/render/04-modais/07-produto.part.jsx` | 94 | 7 |
| `src/app/render/05-rodape-fim.part.jsx` | 100 | 6 |
| `src/main.jsx` | 3 | 0 |
| **total** | **12188** | |

## Conteúdo (nome:linha)

### `src/core/catalogo.jsx`
ADINA_CATALOG:4 · DEFAULT_ME_POOL:56 · TEST_ME_POOL:59 · isTestSender:64 · BLOCKED_SENDER_DOCS:65 · CATEGORIES:67 · DEFAULT_PEPTIDES:78 · DEFAULT_BUNDLES:94 · parseBundlesCfg:100 · orderDiscounts:108 · orderItemsSubtotal:117 · orderTotalWith:124 · loadBundlesCache:129 · BESTSELLERS_DEFAULT:135 · BESTSELLERS_MAX:136 · parseBestsellersCfg:137 · loadBestsellersCache:144 · resolveBestsellers:147 · validarCPF:158 · loadProducts:171 · saveProducts:174

### `src/core/supabase.jsx`
DATA_RESET_ID:7 · DATA_RESET_KEYS:8 · SUPABASE_URL:18 · SUPABASE_KEY:19 · sb:20 · ADMIN_PW:34 · ADMIN_TABLE_KEYS:36 · callAdminDb:41 · adminQuery:53 · publicApi:99 · DEFAULT_STOCK:110 · loadStock:115 · saveStock:124 · loadOrders:135 · saveOrders:138

### `src/core/conteudo.jsx`
CALC_PEP_DB:2 · CALC_DOSES:25 · PROTOCOLS:49 · PRODUCT_GUIDES:173 · ALERTS:240 · DEFAULT_ARTICLES:344

### `src/core/faq.jsx`
FAQ_SECTIONS:2

### `src/views/calc.jsx`
formatDose:1 · SyringeViz:15 · CalcView:95

### `src/views/portal.jsx`
PortalView:1

### `src/novo/rotas.jsx`
NV_SLUG:3 · NOVO_NO_INICIO:6 · IS_ANTIGO:7 · IS_NOVO:9 · NV_HOME:10 · nvSlugOf:15 · NV_HASH_SCREENS:17 · nvStateFromUrl:18 · nvBundleFull:28 · NV_ART_TAGS:34 · nvArticleBody:35 · nvReadMin:52 · calcBundleDiscount:54

### `src/novo/css.jsx`
NOVO_CSS:1

### `src/novo/admin-shell.jsx`
NVA_GROUPS:5 · NVA_ITEMS:30 · nvaActiveItem:32 · NOVO_ADMIN_CSS:38 · NovaAdminShell:162 · NovaAdminSub:194 · NovaAdminInnerTabs:208

### `src/novo/sorteio-admin.jsx`
SORTEIO_STATUS_OK:10 · SORTEIO_LS:11 · SORTEIO_LS_MIGRADO:12 · SORTEIO_ERRO_TABELA:13 · SORTEIO_MESES:14 · sorteioMesSP:17 · sorteioMesLabel:23 · sorteioChaveCliente:28 · sorteioRand:39 · sorteioEscolhe:46 · sorteioLoad:52 · sorteioSave:55 · sorteioDeLinha:57 · sorteioParaLinha:61 · sorteioJunta:66 · sorteioBRL:71 · SORTEIO_EXTRAS_LS:74 · SORTEIO_ERRO_EXTRAS:75 · sorteioExtrasLoad:76 · sorteioExtrasSave:79 · sorteioLimpaNome:81 · sorteioParseLista:87 · sorteioNorm:101 · sorteioNomeBate:106 · sorteioParecePlaceholder:114 · SorteioAdmin:118

### `src/novo/sorteio-palco.jsx`
sorteioNomePalco:5 · SORTEIO_PALCO_CSS:13 · sorteioFonte:47 · SorteioPalco:52

### `src/novo/componentes.jsx`
nvFmt:1 · NvIcon:3 · NV_ICONS:6 · NvMarquee:20 · NvProdImg:95 · NvComboImg:109 · NvInstallBanner:121 · SORTEIO:153 · NvSorteio:160

### `src/novo/loja.jsx`
NovaLoja:1

### `src/app/logica/01-estado-rotas.part.jsx` — lógica 1/8: abre function App(), useState/useEffect iniciais e rotas por hash
parseHash:7 · setView:24 · toastTimerRef:63 · adminLockRef:68 · adminPwRef:69 · openEditCustomer:115 · editCustomerCep:119 · saveEditCustomer:128 · MANUAL_ORDER_EMPTY:147 · detailActionsRef:181 · persistDespesas:182 · persistShippingCosts:183 · persistPurchaseOrders:184 · addPurchaseOrder:185 · receivePurchaseOrder:193 · removePurchaseOrder:201 · callSendersApi:214 · setMeEnv:241 · recoverPoolFromME:249 · fetchMeBalance:271 · setCartBundles:310 · toggleWaAuto:323

### `src/app/logica/02-notificacoes-status.part.jsx` — lógica 2/8: notificações, artigos, status do pedido, rastreio e WhatsApp de status
addNotif:7 · markAllRead:18 · clearNotifs:22 · timeAgo:24 · loadArticles:32 · persistArticles:34 · statusLabel:36 · setOrderStatus:46 · markExtraviado:62 · openStatusWhatsApp:71 · isMotoboyOrder:88 · cycleStatus:93 · persistOrders:118 · fetchTrackingFromME:122 · saveTrackingManual:141 · sendTrackingWhatsApp:151

### `src/app/logica/03-melhor-envios-cambio.part.jsx` — lógica 3/8: Melhor Envios (frete, etiqueta), limpar pedidos, busca de pedidos, câmbio
ME_PROXY:2 · BR_STATE_MAP:4 · normUF:5 · callME:7 · calcularFrete:42 · gerarEtiqueta:65 · confirmarEtiqueta:100 · saveMeSettings:161 · clearAllOrders:194 · persistProducts:223 · persistStock:224 · searchOrders:227 · fetchCambio:252

### `src/app/logica/04-supabase-sync.part.jsx` — lógica 4/8: Supabase (produtos, estoque, clientes, cupons, despesas, importações, pedidos) + realtime
fetchOrdersFromSupabase:205 · fetchPreordersFromSupabase:250 · loadPublicSnapshot:272

### `src/app/logica/05-checkout.part.jsx` — lógica 5/8: frete, CEP, checkout sendToWhatsApp, avisos, código do pedido
calcFreight:3 · fetchCep:10 · validateCheckout:27 · saveCheckoutData:43 · updateCheckout:48 · sendToWhatsApp:53 · dismissNotice:180 · addNotice:183 · removeNotice:188 · generateOrderCode:193

### `src/app/logica/06-pedido-manual.part.jsx` — lógica 6/8: pedido manual, reserva de estoque, edição de itens, parser de texto colado
pastCustomers:3 · fillManualFromCustomer:16 · releaseOrderStock:30 · reserveOrderStock:40 · itemsSavingRef:62 · stockDiffOfEdit:63 · saveOrderItemsEdit:75 · createManualOrder:116 · parseAndFillManualOrder:163

### `src/app/logica/07-precos-pontos-preorders.part.jsx` — lógica 7/8: preço efetivo, cupons, pontos, pré-orders, availableStock, toast/nome
effectivePrice:2 · persistCoupons:8 · persistCustomers:9 · awardPoints:11 · _checkPointsReq:33 · checkPoints:34 · applyCouponCode:60 · generateToken:76 · savePreorder:82 · removePreorder:144 · persistPreorders:152 · availableStock:175 · notifyPreorder:222 · sendReminder:243 · checkPreorderExpiry:258 · cancelPreorderByToken:279 · reducePreorderQty:284 · showToast:293 · saveName:299 · handleWelcomeConfirm:301 · handleNameConfirm:309

### `src/app/logica/08-carrinho-admin.part.jsx` — lógica 8/8: carrinho, combos/packs, login admin, totais, helpers do admin novo (nva*)
myOrders:3 · myTotal:4 · bundleInfo:7 · addBundleToCart:14 · openModal:51 · addPackToCart:57 · quickAdd:80 · versionTap:101 · handleAddToCart:109 · updateQtyInCart:151 · removeFromCart:216 · openSenderPool:240 · handleAdminUnlock:245 · submitAdminPassword:255 · adminRemove:305 · copyWhatsApp:330 · totalRevenue:355 · totalUnits:359 · totalBuyers:360 · peptideCartQty:368 · nvaPick:405 · NVA_ST:416 · NVA_NEXT:417 · nvaAdvance:418 · nvaWhats:425 · nvaRemove:431 · nvaSteps:436 · nvaWhen:460 · nvaItemsText:470

### `src/app/render/00-casca-portal-manual.part.jsx` — render: return(, toast, casca do layout novo (NovaLoja/NovaAdminShell, tag de versão), portal de pré-order, formulário de pedido manual, checkout, nav antiga (tag de versão)
── CUSTOMER PORTAL ──:24 · ── MANUAL ORDER VIEW ──:39 · Produtos:138 · Dados pessoais:165 · Endereço:178 · Pagamento:196 · Observações:212 · Resumo:218 · CHECKOUT MODAL:261 · STEPPER:275 · PASSO 1 — Dados Pessoais:304 · PASSO 2 — Endereço:353 · PASSO 3 — Pagamento + Descontos:418 · PASSO 4 — Revisão + Enviar:520 · NAV:602

### `src/app/render/01-loja-antiga.part.jsx` — render: loja antiga (hero, sidebar, catálogo, FAQ, detalhe, artigo, carrinho, simulador de frete)
HERO BANNER — full width, fora do grid:2 · SIDEBAR:28 · MAIN:59 · CATALOG:61 · NOTICE BOARD:67 · BANNER FRETE:95 · BOTÃO CATÁLOGO COMPLETO NO WHATSAPP — somente admin:101 · SEARCH BAR:140 · FEATURED CAROUSEL - only on all tab with no search:152 · CATEGORY PILLS - below carousel, above products:210 · FAQ:314 · PRODUCT DETAIL:340 · LEFT — imagem:359 · RIGHT — info:367 · ARTICLE PAGE:472 · CART:502 · MINHAS RESERVAS:583 · SIMULADOR DE FRETE:630

### `src/app/render/02-admin/00-cabecalho.part.jsx` — render admin: abre a view admin, cadeado/login, cabeçalho e botões das abas
ADMIN:2 · 🔔 Bell icon:19 · TABS:83

### `src/app/render/02-admin/01-pedidos.part.jsx` — render admin: aba PEDIDOS
TAB: PEDIDOS:2 · LISTA DE AVISOS DE REPOSIÇÃO:408

### `src/app/render/02-admin/02-estoque.part.jsx` — render admin: aba ESTOQUE
TAB: ESTOQUE:2 · ── DIAGNÓSTICO DE ESTOQUE ──:4 · Lotes de origem:153 · PEDIDOS DE REPOSIÇÃO:172 · Form:177 · List:197

### `src/app/render/02-admin/03-produtos.part.jsx` — render admin: aba PRODUTOS (form, packs, lista)
TAB: PRODUTOS:2 · FORM MODAL:30 · PACKS DE PROTOCOLO:112 · LIST:170

### `src/app/render/02-admin/04-artigos.part.jsx` — render admin: aba ARTIGOS
(sem marcos)

### `src/app/render/02-admin/05-preorders.part.jsx` — render admin: aba PRÉ-ORDERS
TAB: PRÉ-ORDERS:2 · FORMULÁRIO MANUAL:41 · MODAL EDITAR RESERVA:94 · Product demand chips:147 · PENDING SECTION:162 · NOTIFIED SECTION:192 · HISTORY SECTION:236

### `src/app/render/02-admin/06-avisos.part.jsx` — render admin: aba AVISOS
TAB: AVISOS:2

### `src/app/render/02-admin/07-financeiro.part.jsx` — render admin: aba FINANCEIRO (P&L, importações, despesas)
TAB: FINANCEIRO:2 · ── P&L PANEL ──:160 · ── BREAKDOWN IMPORTAÇÕES ──:196 · ── DESPESAS MANUAIS ──:267 · Lista de despesas manuais:298 · Perdas por apreensão alfandegária:320 · Perdas por extravio:339 · Fretes ME registrados:355 · Cards principais:370 · Segunda linha quando há dados de custo:407 · Estoque em Trânsito:429 · Por Status:458 · Lucratividade por Produto — só aparece quando há _custoVial:477 · Ranking de Produtos:500 · Taxa de Conversão Pré-Orders:517 · Projeção Pré-Orders por Produto:536 · Últimos 7 Dias:551

### `src/app/render/02-admin/08-importacao.part.jsx` — render admin: aba IMPORTAÇÃO
TAB: IMPORTAÇÃO:2 · BANNER: modo edição:231 · PARÂMETROS:239 · Segunda linha: outros custos + valor real:272 · Sumário overhead:303 · ITENS:314 · COTAÇÃO — ANÁLISE DE MARGEM:362 · Header:366 · SIMULADOR:395 · AÇÕES:425 · HISTÓRICO:440

### `src/app/render/02-admin/09-clientes.part.jsx` — render admin: aba CLIENTES
TAB: CLIENTES:2 · Config de conversão:27

### `src/app/render/02-admin/10-cupons.part.jsx` — render admin: aba CUPONS
TAB: CUPONS:2

### `src/app/render/02-admin/11-combos.part.jsx` — render admin: aba COMBOS
(sem marcos)

### `src/app/render/02-admin/12-mapa.part.jsx` — render admin: aba MAPA (regiões)
TAB: REGIOES:2 · PEDIDOS CONFIRMADOS:74 · PRÉ-ORDERS:119

### `src/app/render/02-admin/13-sorteio.part.jsx` — render admin: aba SORTEIO (mensal)
TAB: SORTEIO:2

### `src/app/render/02-admin/14-config.part.jsx` — render admin: aba CONFIG + fecha a view admin
TAB: CONFIG:2 · CEP Origem Simulador:6

### `src/app/render/03-calculadora.part.jsx` — render: view calculadora + fecha main/grid da loja antiga
CALCULADORA:2

### `src/app/render/04-modais/00-reserva-senha.part.jsx` — render modais: reserva simples (pré-order) e senha do admin
MODAL RESERVA SIMPLES:2 · ADMIN PASSWORD MODAL:38

### `src/app/render/04-modais/01-pedido-detalhe.part.jsx` — render modais: detalhe do pedido (orderDetail, editor de itens)
ORDER DETAIL MODAL:2 · Cliente:16 · Itens:47 · EDITOR:58 · Adicionar produto:81 · Total preview:93 · Endereço:141 · Pagamento + Obs:213 · Marcar como extraviado / reverter:259

### `src/app/render/04-modais/02-pedido-manual.part.jsx` — render modais: novo pedido manual + sucesso do pedido
NOVO PEDIDO MANUAL:2 · Copiar lista / colar resposta:20 · SUCESSO — CÓDIGO DO PEDIDO:145

### `src/app/render/04-modais/03-rastreio.part.jsx` — render modais: rastreamento de pedido
RASTREAMENTO DE PEDIDO:2

### `src/app/render/04-modais/04-legal.part.jsx` — render modais: termos/legal
LEGAL MODAL:2

### `src/app/render/04-modais/05-pix.part.jsx` — render modais: PIX
PIX MODAL:2 · Info do pedido:8 · Passo 1 — gerar no DominiPay:17 · Passo 2 — colar código e enviar:23

### `src/app/render/04-modais/06-etiqueta.part.jsx` — render modais: etiqueta Melhor Envios
ETIQUETA MODAL:2 · STEP: settings / pool manager:18 · STEP: select service:52 · STEP: confirm:88 · STEP: loading:161 · STEP: done:164 · STEP: error:175

### `src/app/render/04-modais/07-produto.part.jsx` — render modais: adicionar ao carrinho (produto, layout antigo)
ADD TO CART MODAL:2

### `src/app/render/05-rodape-fim.part.jsx` — render: rodapé, bottom nav mobile, loading, boas-vindas, nome; fecha o return e a function App()
RODAPÉ:2 · ── MOBILE BOTTOM NAV ──:24 · ── LOADING OVERLAY ──:48 · ── WELCOME MODAL (primeira visita) ──:57 · ── NAME MODAL (mobile sem nome) ──:78

### `src/main.jsx`
(sem marcos)
