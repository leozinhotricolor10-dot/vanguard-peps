# Plano — dividir o `index.html` em módulos (sem mudar o site)

> Status: **etapas 0–5 executadas em 21/10/2026** (ver `docs/HANDOFF.md`, "Modularização"); 6–8 pendentes. Desvio: `FAQ_SECTIONS` ficou em `src/core/faq.jsx` (depois do `BANNER_BG`), e `conteudo.jsx` vai até a linha 1799. Texto original abaixo (21/10/2026). Fatos abaixo conferidos no commit `1495274`.
> Objetivo: o Claude Code ler/editar só o pedaço certo, gastando menos tokens. O site publicado deve sair **idêntico, byte a byte**.

## 1. Mapa atual do `index.html` (11.543 linhas, 2,37 MB, LF)

| Linhas | Bloco | Tamanho | Observação |
|---|---|---|---|
| 1–37 | `<head>`: metas/OG/PWA, script `beforeinstallprompt`, CDNs React 18.2, Babel 7.23.2, Supabase 2.103.0 (com `integrity`) | 37 l | |
| 38–1032 | `<style>` CSS do layout antigo (global: `nav`, `main`, `footer`) | 995 l / 87 KB | |
| 1038–1052 | `<script>` `PRODUCT_IMAGES` = 11 fotos em base64 | **15 l / 1.361 KB** | só usado no layout antigo (linhas 6974, 7047, 7159) |
| 1053–11527 | `<script type="text/babel">` = **o app inteiro** | 10.475 l | escopo global único |
| 1054–1245 | `ADINA_CATALOG`, remetentes (`BLOCKED_SENDER_DOCS`, `isTestSender`), `CATEGORIES`, `DEFAULT_*`, combos/mais vendidos, `validarCPF`, `load/saveProducts` | 192 l | |
| 1246–1386 | `DATA_RESET_ID`, **Supabase** (`SUPABASE_URL/KEY`, `let sb`), `let ADMIN_PW`, `callAdminDb`, `adminQuery`, `publicApi`, estoque/pedidos em localStorage | 141 l | globais mutáveis `sb`, `ADMIN_PW` |
| 1387–1835 | Conteúdo: `CALC_PEP_DB`, `PROTOCOLS`, `PRODUCT_GUIDES`, `ALERTS`, `DEFAULT_ARTICLES`, `FAQ_SECTIONS` + **linha 1800 `BANNER_BG` (base64, 128 KB)** | 449 l | |
| 1836–2463 | `SyringeViz`, `CalcView`, `PortalView`, `ErrorBoundary` | 628 l | |
| 2464–2531 | Rotas do layout novo: `NV_SLUG`, **`NOVO_NO_INICIO` (2469)**, `IS_ANTIGO`, `IS_NOVO`, `NV_HOME`, helpers `nv*`, `calcBundleDiscount` | 68 l | rollback mora aqui |
| 2532–2707 | `NOVO_CSS` (template string) | 176 l | |
| 2708–2927 | Admin novo: `NVA_GROUPS`, `NOVO_ADMIN_CSS`, `NovaAdminShell/Sub/InnerTabs` | 220 l | |
| 2928–3115 | `nvFmt`, `NvIcon`, `NvMarquee`, `NvProdImg`, `NvComboImg`, `NvInstallBanner`, `SORTEIO`, `NvSorteio` | 188 l | |
| 3116–3777 | `function NovaLoja(P)` (loja nova, recebe tudo por props) | 662 l | |
| 3778–6169 | `function App()` — **lógica**: 143 `useState`, 17 `useEffect`, ~150 funções internas (rotas, Melhor Envios, Supabase/realtime, checkout `sendToWhatsApp` 4971, pedido manual, preços/pontos/pré-orders, carrinho, admin) | 2.392 l / 129 KB | tudo é closure do App |
| 6170–6800 | `App` render: casca nova, portal, pedido manual, nav antiga (version tag em 6189 e 6783) | 631 l | |
| 6801–7475 | Loja antiga: hero (`BANNER_BG`), catálogo, FAQ, detalhe, artigo, carrinho, frete | 675 l | |
| 7476–10452 | Admin: cabeçalho/abas + 13 abas (`pedidos` 7575, `estoque` 8014, `produtos` 8253, `artigos` 8480, `preorders` 8566, `avisos` 8823, `financeiro` 8856, `importacao` 9424, `clientes` 9943, `cupons` 10027, `combos` 10111, `mapa` 10246, `config` 10418) | 2.977 l / 241 KB | maior aba: financeiro 568 l |
| 10453–11526 | Calculadora, modais (`orderDetail` 10527, `manualOrderModal` 10801, `etiquetaModal` 11146, `pixModal`, `trackModal`, `legalModal`, `modal` de produto 11333), bottom nav, boas-vindas | 1.074 l | |
| 11523–11526 | `ReactDOM.createRoot(...).render(<ErrorBoundary><App/></ErrorBoundary>)` | | |
| 11528–11541 | `<script>` registro do service worker (fora do `/antigo/`) | | |

Dependências: tudo no mesmo escopo global; o `App` lê constantes de topo e passa funções/estado para `NovaLoja`/`PortalView` por props. Supabase = global `sb` (criado em 1265). localStorage: ~30 chaves `vg-*` espalhadas (mais usada `vg-stock`, 17×). `atacado/index.html` é independente (CSS/JS próprios; o build só copia). **Não existe pasta `antigo/` no código**: `/antigo/` é o mesmo app gerado pelo build (por isso tudo abaixo vale para os dois layouts).

## 2. Estrutura proposta (critério: um arquivo ≈ uma área, até ~800 linhas; blobs isolados)

```
index.html                 casca (head, CDNs, body, SW) com marcadores <!-- @inclui src/... -->
src/manifest.json          ORDEM exata de montagem (a ordem é o contrato)
src/styles/antigo-1.css, antigo-2.css        (CSS 38–1032, cortado num comentário de seção)
src/blobs/product-images.js, banner-bg.js     (base64; Claude NÃO lê)
src/core/catalogo.jsx      1054–1245      src/core/supabase.jsx   1246–1386
src/core/conteudo.jsx      1387–1835 (sem a linha 1800)
src/views/calc.jsx         1836–2286      src/views/portal.jsx    2287–2463
src/novo/rotas.jsx         2464–2531 (NOVO_NO_INICIO aqui)   src/novo/css.jsx 2532–2707
src/novo/admin-shell.jsx   2708–2927      src/novo/componentes.jsx 2928–3115   src/novo/loja.jsx 3116–3777
src/app/logica/01-estado-rotas … 08-carrinho-admin.part.jsx   (3778–6169 em 8 fatias de 160–500 l)
src/app/render/00-casca-portal-manual.part.jsx (6170–6800)   01-loja-antiga.part.jsx (6801–7475)
src/app/render/admin/00-cabecalho … 13-config.part.jsx (uma aba por arquivo)
src/app/render/modais/*.part.jsx (pedido, pedido-manual, etiqueta, pix, rastreio, produto, outros)
src/main.jsx               createRoot (11523–11526)
```
`.part.jsx` = **fragmento** do corpo do `App()` (não é JS válido sozinho); cabeçalho de 1 linha diz "parte do App, entre X e Y".

## 3. Como o build junta (recomendação: concatenação de texto)

| | A) Concatenação na ordem do manifesto | B) ES modules + `esbuild.build` (bundle) |
|---|---|---|
| Comportamento | idêntico: mesmo escopo global, mesmo hoisting/ordem dos `const` | muda: escopo por módulo, renomeações, import/export em ~150 nomes |
| Prova de equivalência | texto montado == `index.html` antigo (sha256) ⇒ dist idêntico | só teste manual |
| `App()` de 7.750 linhas | fatiado em fragmentos sem reescrever | exige refatorar em componentes (props/context) = risco real |
| Contras | dependências implícitas; fragmentos não validam sozinhos | trabalho grande, sem prova byte a byte |

**Recomendado: A.** Mudança no `build.js` é mínima: trocar `fs.readFileSync(SRC)` por `const html = montar()` (novo `tools/montar.js`); **todo o resto do pipeline fica igual** (remoção/ordem de CDNs, loading screen CSS no head/HTML após `<body>`/JS no fim, `withHead`, `/novo` redirect, `/antigo/`, 404, `/p/<sku>`, PWA `BUILD_ID`). Regras do `montar()`: juntar com `parts.join('')` (nunca `.replace(marcador, código)` com string — bug do `$&`; se usar replace, função como replacement), normalizar `\r\n`→`\n`, abortar se faltar arquivo do manifesto ou sobrar marcador. O teste `/const NOVO_NO_INICIO = true;/` passa a rodar no texto montado (já roda em `html`). B fica como opção futura só para peças-folha (ex.: `calc.jsx`).

## 4. Migração em etapas (cada uma = 1 commit, build verde, site idêntico)

| # | Etapa | Acoplamento |
|---|---|---|
| 0 | `tools/montar.js` + `npm run check` + `.gitattributes` (`src/** text eol=lf`); manifesto com 1 parte = o próprio app | nenhum |
| 1 | Blobs: `PRODUCT_IMAGES` e `BANNER_BG` → `src/blobs/` (maior ganho: −1,49 MB do arquivo lido) | nenhum |
| 2 | CSS do `<style>` → `src/styles/` | nenhum |
| 3 | Topo: catálogo, supabase, conteúdo | baixo |
| 4 | `CalcView`, `PortalView`, `ErrorBoundary` | baixo |
| 5 | Layout novo: rotas, `NOVO_CSS`, admin-shell, componentes, `NovaLoja` | médio |
| 6 | `App` lógica em 8 fragmentos | alto (só recorte) |
| 7 | `App` render: loja antiga, admin (1 aba/arquivo), modais | alto (só recorte) |
| 8 | `CLAUDE.md` do projeto, `tools/mapa.js`, atualizar HANDOFF (rollback agora em `src/novo/rotas.jsx`) e memória | docs |

**Prova em toda etapa** (antes do commit):
1. `npm run check -- <commit anterior>`: sha256 do texto montado == sha256 de `git show <ref>:index.html`. Diferente = não commita.
2. `npm run build` antes/depois: sha256 iguais de `dist/index.html`, `dist/antigo/index.html`, `dist/novo/index.html`, `dist/404.html`, e o mesmo `build XXXXXXXXXX` do `sw.js` (o BUILD_ID é hash do dist; igual = nenhum cache do PWA é invalidado). `dist/p/*` depende do Supabase na hora; comparar só se os produtos não mudaram.
3. Preview (`.claude/launch.json` → `dist`, porta 8765): `/`, `/antigo/`, `/p/tz15`, admin pelos 5 toques; console sem erro; sem disparar `create-order`/`rpc` (harness do HANDOFF).
4. Push → Actions verde → abrir vanguardpep.com e conferir a tag `v2.<hash>`.

## 5. Riscos e rollback

| Risco | Mitigação |
|---|---|
| Ordem/TDZ de `const`, hoisting de `function` | manifesto preserva a ordem original; o hash prova |
| Corte no meio de template string/JSX | cortar só nas fronteiras da tabela §1; hash prova |
| CRLF: `core.autocrlf=true` (verificado; `index.html` é LF, `build.js` é CRLF) | `.gitattributes eol=lf` + normalização no `montar()` |
| Bug do `$&` no replace | `join('')` / replacement em função |
| `index.html` deixa de abrir direto com Babel | sempre testar pelo `dist/` (já é a prática do HANDOFF) |
| PWA/cache | HTML nunca é cacheado pelo SW; dist idêntico ⇒ mesmo BUILD_ID |
| Deploy | build falhou ⇒ Actions não publica; o site anterior continua no ar |
| Fluxos do dono mudam de lugar (rollback `NOVO_NO_INICIO`, tag `v2.xxxxxxx` em 6189/6783) | etapa 8 atualiza HANDOFF/memória; tag via grep no repo todo (`src/`) |

**Rollback:** cada etapa é 1 commit ⇒ `git revert <hash>` + push (≈1 min no Actions). Como o dist é idêntico, o risco em produção é quase nulo; o risco real é o build quebrar, e aí nada é publicado. Rollback de layout continua: trocar `NOVO_NO_INICIO` (no arquivo novo).

Achado lateral (fora deste plano, não mexer junto): os `replace` do `build.js` para remover o Babel e trocar Supabase/`crossorigin` não casam mais (as tags ganharam `integrity`); o **dist em produção ainda baixa o Babel standalone** sem usar. Corrigir em tarefa própria (muda o dist, ganho de velocidade).

## 6. Ganho estimado de tokens (estimativa, ≈3,5 caracteres/token)

| Tarefa | Hoje | Depois |
|---|---|---|
| Qualquer `grep` que casa linha de foto base64 (1040–1050, 1800) | até ~35 mil tokens **por linha** casada | 0 (blobs fora e bloqueados) |
| "Mudar regra PIX/frete do checkout" | grep em 11,5 mil linhas + 3–5 leituras de 200–400 l (~20–40 mil) | MAPA (~2 mil) + `05-checkout` (~190 l) e `render/modais/pix` (~65 l): ~6–10 mil |
| "Ajustar aba Financeiro" | achar 8856–9423 + contexto (~25 mil) | 1 arquivo de 568 l (~12 mil) |
| Visão geral do projeto | inviável ler (2,37 MB) | `docs/MAPA.md` (~2–3 mil) |

**Encaixe com CLAUDE.md e `mapa.js`:** `tools/mapa.js` (rodado pelo build) gera `docs/MAPA.md`: arquivo → linhas → funções/consts de topo e funções internas do `App` com linha. `CLAUDE.md` do projeto (curto): "comece pelo `docs/MAPA.md`; não leia `src/blobs/`; fragmentos `.part.jsx` são pedaços do `App`; depois de editar: `npm run check`/`build`; onde fica rollback/tag". Opcional: `permissions.deny: Read(src/blobs/**)` no `.claude/settings.json`.

## 7. Decisões do dono (com recomendação)

1. **Abordagem "recortar sem reescrever"** (o código só muda de arquivo; prova de que o site saiu igual). → Recomendo **sim**.
2. **Fotos embutidas do site antigo (1,5 MB dentro do código):** (a) só mudar de arquivo; (b) virar imagens `.webp` (site antigo mais leve, mas muda o comportamento). → **(a) agora**; (b) só se o antigo continuar no ar.
3. **Aposentar o `/antigo/`** um dia? Tiraria ~40% do código. → Não agora; reavaliar após 30 dias do layout novo estável.
4. **Ritmo:** etapas 0–5 numa sessão, 6–8 em outra, cada uma publicada e conferida. → Recomendo assim.
5. **Commit da tag de versão** a cada etapa (regra atual dobra os commits). → Manter a regra (é barato e mostra no site que publicou).
6. **Bloquear o Claude de ler os arquivos de fotos** (economia automática). → **Sim.**
7. **Corrigir depois o Babel que ainda é baixado no site** (achado lateral, deixa o site mais rápido). → Sim, em tarefa separada, após a modularização.
