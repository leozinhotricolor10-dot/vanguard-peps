# Handoff — Vanguard Peptides (17/10/2026)

Estado do projeto e o que fazer na próxima sessão. Versão no ar: **v2.5cbc7de** (commit `d944235`).

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

- **Combos (`BUNDLES`)**: o site antigo nunca exibiu os combos (a constante existia sem uso). No `/novo` aparecem na home (rolagem lateral) só se todos os itens existem no catálogo e o preço do combo é menor que a soma dos preços atuais (`nvBundleFull`). `addBundleToCart` (App) reserva 1 de cada item numa única gravação. Ids aplicados ficam em `cartBundles` (localStorage `vg-cart-bundles`); `calcBundleDiscount` só conta um combo enquanto os itens estão no carrinho (tirou um item, o combo cai e não volta sozinho). Desconto entra no total do checkout, na barra do carrinho, na mensagem do WhatsApp e nas observações (`notes`) do pedido. Só vale com `IS_NOVO`; o site antigo não muda.
- **Limite conhecido**: a Edge Function `create-order` não conhece combos (nem pontos) — o `total` gravado no banco é o preço cheio; o desconto fica só na mensagem do WhatsApp e em `notes`. Mesmo comportamento que os pontos já tinham.
- **Artigos**: telas `artigos` (lista) e `artigo` (leitura), link no menu e rodapé, bloco com 3 artigos na home. Fonte: `articles` do App (localStorage `vg-articles`, padrão `DEFAULT_ARTICLES`; artigos editados no admin só existem no navegador do admin). Corpo renderizado por `nvArticleBody` com lista branca de tags (sem `innerHTML`).
- **Pontos VG**: saldo via `checkPoints` ao digitar o CPF (e ao abrir o checkout com CPF salvo); opções 100/200/500/usar tudo; pontos aplicados zeram se o CPF mudar. Resgate (`redeemPoints`) acontece no `sendToWhatsApp` depois do `create-order`, como no site antigo.
- **Teste local usado**: harness que intercepta `fetch` antes do app carregar (injetado só na cópia local de `dist/novo/index.html`): bloqueia `rpc/decrement_stock`/`increment_stock`, `functions/v1/create-order`, `public-api` `redeem`/`points` e `window.open`, e devolve estoque alto para testar produtos esgotados.

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
- Riscos conhecidos ainda abertos: anon pode chamar `increment_stock`/`decrement_stock`; upload anônimo no bucket `product-images`; resgate de pontos aceita qualquer CPF.

## Edge Functions (Supabase `aumubzvdhzvtnqfzqeqd`)

Cópia do código em `supabase/functions/` neste repo; a pasta de trabalho é `C:\Users\leona\supabase\functions`. Deploy:

```bash
supabase functions deploy <nome> --project-ref aumubzvdhzvtnqfzqeqd --no-verify-jwt --use-api
```

`admin-db`, `public-api`, `me-senders` (pool de remetentes em bucket privado), `melhorenvios-proxy` (aceita `env: "sandbox"`), `verify-admin`, `create-order`.

## Pendências (fora a tarefa acima)

1. Dono testar `/novo` com pedido real no celular → depois trocar o site principal.
2. **Remetente ativo ainda com CPF fictício 18749536273** — dono precisa trocar pelo CPF real em 📮 REMETENTES.
3. Token do sandbox do Melhor Envios (`MELHORENVIOS_SANDBOX_TOKEN`) para o modo Teste.
4. Fotos leves / cadastrar fotos (8 de 19 produtos têm foto).
5. Pagamento automático: aguardando o dono dizer se o DominiPay tem API (Mercado Pago tem risco de bloqueio para esse tipo de produto).
6. PIX: no checkout do site o PIX dá **frete grátis, não 10%** (servidor `create-order` também). Os 10% só existem no pedido manual. Dono decide se quer 10% no site.

## Coisas que NÃO fazer

- Não criar remetentes fictícios / CPFs inventados na pool de produção, não remover a trava `BLOCKED_SENDER_DOCS` / `isTestSender`, não voltar para o commit `57172ef`. O dono já pediu isso e foi recusado (falsidade ideológica em etiquetas reais). Remetentes fictícios só no modo Teste (sandbox).
