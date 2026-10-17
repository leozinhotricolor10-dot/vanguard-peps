# Handoff — Vanguard Peptides (17/10/2026)

Estado do projeto e o que fazer na próxima sessão. Versão no ar: **v2.d9d684b** (commit `d9d684b`, Pedidos novos no admin do `/novo`).

## Tarefa em andamento (pedida pelo dono)

**Migrar todas as telas para o novo layout em `/novo`**, para ele ver como fica. Plano combinado:

1. ~~**Loja `/novo`** — completar o que falta: combos, artigos, resgate de pontos.~~ **FEITO** (commits `ca27a12`, `07e04c9`, `d944235`). Detalhes em "Loja /novo — combos, artigos e pontos" abaixo.
2. ~~**Admin dentro do `/novo`** — casca nova do mockup, por cima das abas existentes.~~ **FEITO** (commit `b1e0e61`). Detalhes em "Admin no /novo (Passo 2)" abaixo.
3. **(PRÓXIMO PASSO) Site principal** (`vanguardpep.com`) continua no layout antigo até o dono aprovar o `/novo` (loja + admin). Refino das telas do admin no visual do mockup, uma a uma: **feitos** o menu (Produtos e estoque / Artigos e avisos com abas internas, `cc84afc`) e a tela de **Pedidos** (`d9d684b`) — ver "Admin no /novo (refinos)". Próximas candidatas: Etiquetas/Envios, Produtos e estoque, Financeiro.

Mockup de referência (29 telas): https://claude.ai/artifact/J16uYUGKgo7YxJmbKfVHSX

## Como o novo layout funciona

- `index.html` → componente `function NovaLoja(P)` (antes de `function App()`), CSS em `NOVO_CSS` (classes `nv-*`).
- `IS_NOVO` é verdadeiro em `/novo` e em `/p/<código>`. No `App`: `novoActive = IS_NOVO && view !== 'admin' && !portalToken && !manualOrderView`. Com ele, o root ganha a classe `novo-mode`, que esconde nav/hero/.app/footer/bottom-nav antigos.
- Telas internas (`screen`): loja, produto, checkout, done, rastrear, calc, faq, artigos, artigo. Navegação com `history.pushState` (`state.nv = {s, pid, d}`); produto vira `/p/<sku minúsculo>`, o resto `/novo/`.
- Reaproveita a lógica do App via props: `quickAdd` (novo, adiciona 1 sem modal), `updateQtyInCart`, `removeFromCart`, `addPackToCart`, `savePreorder`, `sendToWhatsApp`, `applyCouponCode`, `searchOrders` etc.
- Admin: 5 toques no texto da versão no rodapé do `/novo` → senha → abre o admin (view `admin`) com a casca nova (ver "Admin no /novo").
- **Cuidado:** o CSS antigo tem regras globais para `nav`, `main` e `footer`. No NovaLoja use `<div role="navigation|main|contentinfo">`.
- Campos com input dentro do NovaLoja são chamados como função (`Field({...})`), não `<Field/>`, para não perder o foco ao digitar.
- Fotos de produto foram removidas do novo layout (pedido do dono). Só a prévia do WhatsApp nas páginas `/p/` usa foto.

## Loja /novo — combos, artigos e pontos (Passo 1, feito)

- **Combos**: cadastrados no admin antigo, aba **🎁 COMBOS** (criar/editar/pausar/excluir), salvos em `site_config.bundles` (texto JSON `[{id,name,desc,items,price,badge,active}]`, escrita pela admin-db com senha). App guarda em `bundles` (cache `vg-bundles`, seed `DEFAULT_BUNDLES` = os 3 combos antigos; `parseBundlesCfg` igual ao servidor). No `/novo` aparecem na home só se ativos, todos os itens existem e o preço é menor que a soma atual (`nvBundleFull`). `addBundleToCart` reserva 1 de cada item. Ids aplicados ficam em `cartBundles` (`vg-cart-bundles`); `calcBundleDiscount` só conta um combo enquanto os itens estão no carrinho. Só vale com `IS_NOVO`.
- **Servidor valida combos e pontos (out/2026)**: `create-order` recebe `bundles: [ids]` e `points: n`; lê `site_config.bundles`/`points_config` (fallback = seed / redeem 5), confere os itens do combo no pedido com o preço do banco (`pricing.ts`, lógica pura), confere o saldo do CPF, debita os pontos com trava otimista (`eq('points', saldo lido)`) e estorna se o insert falhar. Pontos: só centenas, nunca acima do saldo (erro "Pontos insuficientes") nem do valor do pedido. Grava `bundle_discount`, `bundles`, `points_used`, `points_discount` e o `total` final (SQL `sql/orders_bundles_points.sql`, aplicado). O site **não chama mais** `public-api` `redeem` no checkout; a mensagem do WhatsApp usa os valores devolvidos pelo servidor. O detalhe do pedido no admin mostra cupom/combo/pontos (`_discounts`). Também passou a recusar `qty` não inteira/negativa.
- **Regra de pontos**: o admin (aba CLIENTES → config) agora salva também em `site_config.points_config`; a loja lê de lá ao abrir.
- **Artigos**: telas `artigos` (lista) e `artigo` (leitura), link no menu e rodapé, bloco com 3 artigos na home. Fonte: `articles` do App (localStorage `vg-articles`, padrão `DEFAULT_ARTICLES`; artigos editados no admin só existem no navegador do admin). Corpo renderizado por `nvArticleBody` com lista branca de tags (sem `innerHTML`).
- **Pontos VG**: saldo via `checkPoints` ao digitar o CPF (e ao abrir o checkout com CPF salvo); opções 100/200/500/usar tudo; pontos aplicados zeram se o CPF mudar. Resgate (`redeemPoints`) acontece no `sendToWhatsApp` depois do `create-order`, como no site antigo.
- **Teste local usado** (repetido para combos/pontos, numa cópia `dist/t/novo/index.html` apagada depois, com `validarCPF` desligado na cópia para não digitar CPF; `verify-admin`/`admin-db` simulados para testar a aba COMBOS): harness que intercepta `fetch` antes do app carregar (injetado só na cópia local de `dist/novo/index.html`): bloqueia `rpc/decrement_stock`/`increment_stock`, `functions/v1/create-order`, `public-api` `redeem`/`points` e `window.open`, e devolve estoque alto para testar produtos esgotados.

## Admin no /novo (Passo 2, feito)

- `novoAdmin = IS_NOVO && view === 'admin' && adminUnlocked && !portalToken && !manualOrderView` (no `App`, ao lado de `novoActive`). Com ele o root ganha a classe `novo-admin` e é injetado `NOVO_ADMIN_CSS` (só nesse caso). Sem login (`adminUnlocked` falso) continua a tela de cadeado antiga.
- `.novo-admin` esconde nav/hero/footer/bottom-nav antigos e o `aside` do `.app`, e remapeia `--muted/--card/--border`; restiliza `.admin-stat`, `.admin-action-btn`, `.admin-table`, `.page-title`; esconde `.admin-tabs` e o `.page-tag`. As abas continuam sendo o JSX antigo (`adminTab`).
- Menu: `NVA_GROUPS` (Vendas: Pedidos, Pré-orders, Clientes, Cupons · Envios: Etiquetas, Remetentes, Mapa · Catálogo: Produtos e estoque, Importações, Combos, Artigos e avisos · Gestão: Financeiro, Config). `NovaAdminShell` = menu lateral (`div role=navigation`, desktop ≥760px) + abas dos 4 grupos embaixo (celular). `NovaAdminSub` = chips do grupo atual no topo (só celular). Produtos/Estoque e Artigos/Avisos agora são um item com abas internas (ver "refinos").
- **Etiquetas** = aba Pedidos com `adminStatusFilter = 'pago'` (estado `nvaSec` diz qual item está ativo; `nvaActiveItem`). Voltar para Pedidos vindo de outra seção zera o filtro. **Remetentes** abre o mesmo modal do botão 📮 (função `openSenderPool`, também usada no admin antigo).
- Badges: Pedidos = pedidos `pendente`; Etiquetas = `pago` sem `label_url`.
- Cards de resumo (Compradores/Receita…) só aparecem em Pedidos no `/novo`. Botão "← Loja" (celular) / "← Ver loja" (menu) volta para a loja nova; 5 toques na versão voltam ao admin.
- Ajustes de celular só no `/novo`: `.notice-editor-row` e `.fin-cards` viram 1/2 colunas; o formulário de despesa (`nva-wrapgrid`) quebra em 2 colunas; a tabela de itens da importação (`nva-scrollx`) rola dentro da caixa.
- Modais antigos de boas-vindas/nome/sucesso não aparecem com `novoAdmin`.
- Teste feito: build + cópias locais `dist/t/novo/` e `dist/t2/` (apagadas depois) com o harness do Passo 1 ampliado: `verify-admin` → `{ok:true}`, `admin-db` `list` devolve pedidos fictícios e toda escrita é simulada, qualquer outra chamada não-GET ao Supabase (rpc, create-order, me-senders, melhorenvios-proxy, storage) bloqueada, `window.open`/`confirm`/`alert` desligados. Navegado por todos os itens em 1360px e 375px (sem rolagem lateral, sem erro no console) e conferido que o admin em `/` segue igual (14 abas, sem menu novo).

## Admin no /novo (refinos, out/2026)

- **Menu**: no grupo Catálogo, "Produtos e estoque" e "Artigos e avisos" viraram um item só cada (`NVA_GROUPS`, campo `tabs`). `NovaAdminInnerTabs` mostra as abas internas (segmentado no topo, desktop e celular) e só troca o `adminTab` antigo (`produtos`/`estoque`, `artigos`/`avisos`); `nvaActiveItem` acha o item pelo `tab` ou pelos `tabs`.
- **Pedidos** (só com `novoAdmin`; o admin em `/` segue com a tabela antiga): cards de resumo trocados por Aguardando pagamento / Pagos para enviar / Em trânsito / Receita bruta (`.nvp-kpis`). A visão normal (não agrupada) vira lista `.nvp-row`: card no celular/tablet; acima de 1100px, linha + painel de detalhe fixo à direita (`.nvp-panel`, pedido escolhido em `nvaSelOrder`; abaixo de 1100px tocar no card abre o modal de detalhe antigo `setOrderDetail`). "Agrupar por cliente", busca, filtros de status, paginação e o filtro `pago` de Etiquetas são os mesmos de antes.
- **Próximo passo** (`nvaSteps`): pendente → "Marcar como pago" (+ Cobrar PIX); pago sem etiqueta → "Gerar etiqueta" (+ Marcar como enviado, para motoboy); pago com etiqueta → "Marcar como enviado" (+ Reimprimir etiqueta); enviado → "Marcar como entregue"; entregue/extraviado → "Ver detalhes". Mais "Enviar rastreio" (se tem código), "WhatsApp" (se tem telefone) e "Remover". Tudo chama as funções antigas (`cycleStatus` — com WhatsApp automático e pontos —, `gerarEtiqueta`, modal PIX, `sendTrackingWhatsApp`, `adminRemove`). **Única regra nova de interface**: confirmação (`window.confirm`) antes de avançar status (`nvaAdvance`) e antes de remover (`nvaRemove`); o clique no status do admin antigo continua sem confirmação.
- Teste: build + cópias `dist/t/novo/` e `dist/t2/` com harness (verify-admin `{ok:true}`, admin-db com 7 pedidos fictícios e escrita simulada, demais POST ao Supabase bloqueados — `increment_stock`, `melhorenvios-proxy` etc. —, `window.open`/`confirm`/`alert`/`prompt` interceptados). Conferido em 1360, 900 e 375px (sem rolagem lateral, console limpo): avançar status (cancelar = nada acontece; confirmar = update + WhatsApp + pontos simulados), etiqueta (abre o fluxo antigo), PIX, remover, busca, Etiquetas, agrupar por cliente, e o admin em `/` igual (14 abas, tabela antiga). Harness em `scratchpad` da sessão (não versionado).

## Build e deploy

- `npm run build` (build.js) → `dist/index.html`, `dist/novo/index.html`, `dist/404.html` e `dist/p/<sku>/index.html` (uma página por produto, com Open Graph; busca os produtos no Supabase na hora do build).
- Push na `main` → GitHub Actions publica `dist/` no GitHub Pages (vanguardpep.com).
- Teste local: `.claude/launch.json` (config `dist`, `python -m http.server 8765 --directory dist`).
- Em teste no navegador, **bloquear chamadas reais** antes de clicar: `rpc/decrement_stock`, `functions/v1/create-order` e `window.open` (WhatsApp) — senão mexe no estoque/pedidos de produção.

## Regras do dono

- Commitar e dar push sempre; após cada commit, atualizar a tag `v2.<hash7>` (sed em todas as ocorrências) em commit separado.
- Terminar a resposta com o hash do commit.
- Roteamento por complexidade (CLAUDE.md global): rapido / padrao / pesado.

## Segurança (feito nesta sessão)

- Tabelas `orders, preorders, customers, coupons, expenses, import_history, purchase_order_caps, admin_rate_limits` com RLS sem políticas. `products, stock, site_config`: só leitura pública. Script: `sql/rls_protect_data.sql` (já aplicado).
- Loja usa a Edge Function **`public-api`** (snapshot sem dados pessoais, rastreio por código, pontos, cupom, pré-order por token).
- Admin usa **`admin-db`** (ações fixas list/get/insert/update/upsert/delete por tabela e coluna-chave, exige senha). Em `index.html`, `sb.from(t)` é roteado para a admin-db quando `ADMIN_PW` está definido (login).
- Uma admin-db genérica que repetia qualquer consulta foi **recusada pelo classificador** como superfície de RCE — manter restrita.
- `melhorenvios-proxy`: lista de rotas permitidas + senha (exceto cotação pública). Chamada sem senha não conta como tentativa de login.
- Riscos conhecidos ainda abertos: anon pode chamar `increment_stock`/`decrement_stock`; upload anônimo no bucket `product-images`; a ação `redeem` da `public-api` ainda existe e aceita qualquer CPF (o site novo não usa mais; dá para remover depois que o cache dos clientes renovar — falta o dono aprovar); `create-order` agora tem rate limit e checagem de estoque no servidor (ver "PUBLICADO" abaixo); a checagem não cobre quem chama a API direto sem reservar estoque.

## PUBLICADO: rate limit + estoque no `create-order` (17/10/2026)

Aprovado pelo dono; código, SQL e testes prontos no repo e na pasta de trabalho (`C:\Users\leona\supabase\functions\create-order`, já sincronizada). **Publicado em produção em 17/10/2026:** SQL aplicado (migração `order_rate_limits`; conferido rls=true, políticas=0, anon sem EXECUTE) e função `create-order` publicada. Falta só um pedido real do dono para conferir no log que não aparece `rate limit indisponível` e que `order_rate_limits` ganha linhas (e qual cabeçalho de IP a Supabase manda).

Arquivos: `supabase/functions/create-order/guards.ts` (novo, lógica pura), `index.ts` (usa o guards), `sql/create_order_guards.sql` (novo), `tests/create-order.test.ts` e `tests/create-order.handler.test.mjs` (novos).

**Rate limit** (antes de ler/gravar qualquer coisa, depois da validação básica do corpo):
- Janela fixa por chave, contada no banco pela função `order_rate_hit(jsonb)` (atômica: `INSERT … ON CONFLICT`, sem corrida). Tabela nova `order_rate_limits` com RLS ligado e sem políticas; `EXECUTE` só para `service_role`. Não reaproveitei a `admin_rate_limits` porque ela guarda tentativas de senha (attempts/locked_until) e o padrão dela é ler-e-gravar (não atômico); a ideia (chave por IP, upsert, 429) é a mesma.
- Limites: IP 15 por 10 min e 60 por dia (IP de celular é compartilhado, por isso folgado); CPF e telefone 6 por 10 min e 20 por dia cada; teto geral 120 pedidos por hora. CPF só conta com 11 dígitos e telefone com 10+ (pedido manual sem esses campos não é barrado por eles). Ajustar em `RATE_LIMITS` no `guards.ts`.
- Chaves vão para o banco só como HMAC-SHA256 (segredo `RATE_LIMIT_SECRET`, se existir; senão a service role key) — sem CPF/telefone/IP em claro. Linhas com mais de 2 dias são apagadas sozinhas.
- Resposta: **429** `{ ok:false, error:"Muitos pedidos em pouco tempo. Aguarde N minuto(s) e tente de novo, ou fale com a gente no WhatsApp.", retry_after }` + cabeçalho `Retry-After`. O site já mostra `"Erro ao salvar pedido: " + error`, sem mudar nada no `index.html`.
- IP: usa `cf-connecting-ip`, depois `x-real-ip`, depois o 1º do `x-forwarded-for` (este último pode ser forjado pelo cliente; CPF/telefone e o teto geral cobrem esse caso).
- **Se a função SQL não existir ou o banco falhar, o pedido passa** (só um aviso no log). Assim a ordem SQL/deploy não importa e uma falha no rate limit não derruba vendas.
- O 429 acontece antes de debitar pontos.

**Estoque — por que a checagem é "só o que é errado em qualquer fluxo":**
- No carrinho o navegador **já reservou** com `rpc decrement_stock` (quickAdd, addPackToCart, addBundleToCart, updateQtyInCart, modal antigo, portal de pré-order) antes de chamar o `create-order`. `decrement_stock` devolve -1 e não deixa o saldo ficar negativo. Então, no servidor, `stock.quantity` já é o saldo **depois** da reserva deste cliente: exigir `quantity >= qty` recusaria quem levou as últimas unidades.
- Dois fluxos chamam o `create-order` **sem reservar nada**: o pedido manual do admin (`createManualOrder`, notas `[PEDIDO MANUAL]`) e o link "Formulário de Pedido" do cliente (`manualOrderView`). O servidor não tem como distinguir esses fluxos do carrinho (nenhum sinal no corpo que não possa ser forjado).
- Por isso o servidor recusa só: (1) **produto que não existe** em `products` → 400 "Produto indisponível: X. Remova do carrinho e tente de novo." (antes entrava no pedido com preço 0); (2) **produto com controle de estoque e saldo negativo** → 409 "Sem estoque de X no momento. Remova do carrinho ou use \"Reservar\"." Produto sem linha em `stock` (ou `quantity` null) = sem controle, igual ao site. Packs já vêm com `qty` em unidades; combos são linhas normais por item. Erro ao ler `stock` não bloqueia o pedido (aviso no log).
- A checagem roda antes de cupom/pontos: recusa não debita pontos. Limite novo de 50 linhas por pedido (o catálogo tem ~19 produtos).
- Limite honesto: isso **não impede** alguém que chame a API direto, sem reservar, de pedir produto com saldo > 0 (o estoque não baixa). Fechar isso exige mudança no site (ver perguntas abaixo).

**Travas que continuam iguais:** preço do banco, packs, promo do banco, combos, cupom, frete, pontos com trava otimista e estorno se o insert falhar, validação de quantidade, versão antiga do site (sem `bundles`/`points`) — coberto nos testes.

**Testes locais (sem rede):** `node --test tests/create-order.test.ts tests/create-order.handler.test.mjs` → 23 testes passando. O segundo empacota o `index.ts` real com esbuild trocando os imports `jsr:` por um Supabase falso em memória (carrinho com saldo 0 passa, saldo negativo recusa sem debitar pontos, produto inexistente, 429 por CPF e por IP, sem a função SQL o pedido passa, estorno de pontos). O SQL **não** foi executado localmente (não há Postgres na máquina) — revisar a saída da conferência no fim do script ao aplicar.

**Para publicar (dono decide):**
1. SQL Editor do Supabase → colar `sql/create_order_guards.sql` → Run. A conferência no fim deve mostrar `rls = true`, `politicas = 0`, `anon_executa = false`.
2. (Opcional) segredo próprio para o HMAC: `supabase secrets set RATE_LIMIT_SECRET=<texto aleatório longo> --project-ref aumubzvdhzvtnqfzqeqd`
3. Em `C:\Users\leona`: `supabase functions deploy create-order --project-ref aumubzvdhzvtnqfzqeqd --no-verify-jwt --use-api`
4. Depois: fazer um pedido real pelo site; nos logs da função não deve aparecer `rate limit indisponível`; conferir que `order_rate_limits` ganhou linhas.

**Perguntas ao dono:**
- Os dois formulários de pedido manual (admin e link do cliente) **não baixam estoque** hoje. Quer que passem a baixar? (precisa de um campo novo no `index.html` + o servidor reservar.)
- Para barrar de verdade pedido sem reserva: reserva com "token do carrinho" (o site manda um `cart_id` no `decrement_stock`/`increment_stock`, o banco guarda quanto cada carrinho reservou, e o `create-order` só aceita o que o carrinho reservou). Exige mudar o `index.html` e as RPCs de estoque; pode ser a próxima rodada.
- Os limites acima estão bons?
- Desconto manual no detalhe do pedido grava a coluna `discount`, que **não existe** em `orders` (bug antigo; o total muda só localmente) e recalcula o total sem os descontos de combo/pontos.

## Edge Functions (Supabase `aumubzvdhzvtnqfzqeqd`)

Cópia do código em `supabase/functions/` neste repo; a pasta de trabalho é `C:\Users\leona\supabase\functions`. Deploy:

```bash
supabase functions deploy <nome> --project-ref aumubzvdhzvtnqfzqeqd --no-verify-jwt --use-api
```

`admin-db`, `public-api`, `me-senders` (pool de remetentes em bucket privado), `melhorenvios-proxy` (aceita `env: "sandbox"`), `verify-admin`, `create-order` (`index.ts` + `pricing.ts` + `guards.ts`; testes em `tests/`: `node --test tests/create-order.test.ts tests/create-order.handler.test.mjs`).

## Pendências (fora a tarefa acima)

1. Dono testar `/novo` com pedido real no celular → depois trocar o site principal.
2. **Remetente ativo ainda com CPF fictício 18749536273** — dono precisa trocar pelo CPF real em 📮 REMETENTES.
3. Token do sandbox do Melhor Envios (`MELHORENVIOS_SANDBOX_TOKEN`) para o modo Teste.
4. Fotos leves / cadastrar fotos (8 de 19 produtos têm foto).
5. Pagamento automático: aguardando o dono dizer se o DominiPay tem API (Mercado Pago tem risco de bloqueio para esse tipo de produto).
6. PIX: no checkout do site o PIX dá **frete grátis, não 10%** (servidor `create-order` também). Os 10% só existem no pedido manual. Dono decide se quer 10% no site.

## Coisas que NÃO fazer

- Não criar remetentes fictícios / CPFs inventados na pool de produção, não remover a trava `BLOCKED_SENDER_DOCS` / `isTestSender`, não voltar para o commit `57172ef`. O dono já pediu isso e foi recusado (falsidade ideológica em etiquetas reais). Remetentes fictícios só no modo Teste (sandbox).
