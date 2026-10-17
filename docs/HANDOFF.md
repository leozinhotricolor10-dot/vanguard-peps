# Handoff — Vanguard Peptides (17/10/2026)

Estado do projeto e o que fazer na próxima sessão. Versão no ar: **v2.7bdb422** (commit `7bdb422`).

## Tarefa em andamento (pedida pelo dono)

**Migrar todas as telas para o novo layout em `/novo`**, para ele ver como fica. Plano combinado:

1. ~~**Loja `/novo`** — completar o que falta: combos, artigos, resgate de pontos.~~ **FEITO** (commits `ca27a12`, `07e04c9`, `d944235`). Detalhes em "Loja /novo — combos, artigos e pontos" abaixo.
2. **(PRÓXIMO PASSO) Admin dentro do `/novo`** — casca nova do mockup: menu lateral em 4 grupos (Vendas: Pedidos, Pré-orders, Clientes, Cupons · Envios: Etiquetas, Remetentes, Mapa · Catálogo: Produtos/estoque, Importações, Artigos/avisos · Gestão: Financeiro, Config) e abas embaixo no celular, com visual novo aplicado **por cima das abas existentes** (mesma lógica, sem reescrever cada aba).
3. **Site principal** (`vanguardpep.com`) continua no layout antigo até o dono aprovar.

Mockup de referência (29 telas): https://claude.ai/artifact/J16uYUGKgo7YxJmbKfVHSX

## Como o novo layout funciona

- `index.html` → componente `function NovaLoja(P)` (antes de `function App()`), CSS em `NOVO_CSS` (classes `nv-*`).
- `IS_NOVO` é verdadeiro em `/novo` e em `/p/<código>`. No `App`: `novoActive = IS_NOVO && view !== 'admin' && !portalToken && !manualOrderView`. Com ele, o root ganha a classe `novo-mode`, que esconde nav/hero/.app/footer/bottom-nav antigos.
- Telas internas (`screen`): loja, produto, checkout, done, rastrear, calc, faq, artigos, artigo. Navegação com `history.pushState` (`state.nv = {s, pid, d}`); produto vira `/p/<sku minúsculo>`, o resto `/novo/`.
- Reaproveita a lógica do App via props: `quickAdd` (novo, adiciona 1 sem modal), `updateQtyInCart`, `removeFromCart`, `addPackToCart`, `savePreorder`, `sendToWhatsApp`, `applyCouponCode`, `searchOrders` etc.
- Admin: 5 toques no texto da versão no rodapé do `/novo` → senha → abre o admin **antigo** (view `admin`).
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
- Riscos conhecidos ainda abertos: anon pode chamar `increment_stock`/`decrement_stock`; upload anônimo no bucket `product-images`; a ação `redeem` da `public-api` ainda existe e aceita qualquer CPF (o site novo não usa mais; dá para remover depois que o cache dos clientes renovar — falta o dono aprovar); `create-order` não tem rate limit nem confere estoque (o estoque é reservado pelo navegador via RPC).
- Desconto manual no detalhe do pedido grava a coluna `discount`, que **não existe** em `orders` (bug antigo; o total muda só localmente) e recalcula o total sem os descontos de combo/pontos.

## Edge Functions (Supabase `aumubzvdhzvtnqfzqeqd`)

Cópia do código em `supabase/functions/` neste repo; a pasta de trabalho é `C:\Users\leona\supabase\functions`. Deploy:

```bash
supabase functions deploy <nome> --project-ref aumubzvdhzvtnqfzqeqd --no-verify-jwt --use-api
```

`admin-db`, `public-api`, `me-senders` (pool de remetentes em bucket privado), `melhorenvios-proxy` (aceita `env: "sandbox"`), `verify-admin`, `create-order` (`index.ts` + `pricing.ts`; a lógica de preço roda no Node 24 para teste: `node arquivo.test.ts` importando o `pricing.ts`).

## Pendências (fora a tarefa acima)

1. Dono testar `/novo` com pedido real no celular → depois trocar o site principal.
2. **Remetente ativo ainda com CPF fictício 18749536273** — dono precisa trocar pelo CPF real em 📮 REMETENTES.
3. Token do sandbox do Melhor Envios (`MELHORENVIOS_SANDBOX_TOKEN`) para o modo Teste.
4. Fotos leves / cadastrar fotos (8 de 19 produtos têm foto).
5. Pagamento automático: aguardando o dono dizer se o DominiPay tem API (Mercado Pago tem risco de bloqueio para esse tipo de produto).
6. PIX: no checkout do site o PIX dá **frete grátis, não 10%** (servidor `create-order` também). Os 10% só existem no pedido manual. Dono decide se quer 10% no site.

## Coisas que NÃO fazer

- Não criar remetentes fictícios / CPFs inventados na pool de produção, não remover a trava `BLOCKED_SENDER_DOCS` / `isTestSender`, não voltar para o commit `57172ef`. O dono já pediu isso e foi recusado (falsidade ideológica em etiquetas reais). Remetentes fictícios só no modo Teste (sandbox).
