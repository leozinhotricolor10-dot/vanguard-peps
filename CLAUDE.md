# Vanguard Peptides

Loja de peptídeos (React 18 SPA + Supabase), em produção em vanguardpep.com. Branch `main`; push dispara o GitHub Actions, que roda `build.js` e publica o `dist/`.

## Por onde começar
- `docs/MAPA.md` (gerado por `npm run mapa`): arquivo -> linhas -> funções. Leia primeiro.
- `docs/HANDOFF.md`: estado do projeto, pendências e regras. Não duplicar o conteúdo aqui.

## Estrutura
- O código vive em `src/`. `index.html` é só a casca (marcadores `<!-- @inclui src/... -->`).
- `tools/montar.js` junta tudo na ordem de `src/manifest.json` (a ordem é o contrato; arquivo novo = marcador + entrada no manifesto).
- Arquivos `*.part.jsx` são fragmentos do `App`, não são JS válido sozinhos.

## Comandos
- `npm run check`: prova de equivalência (montado agora == HEAD). Refatoração tem que dar "idêntico".
- `npm run mapa`: regenera `docs/MAPA.md` depois de mexer em `src/`.
- `node build.js`: gera `dist/`. Testar sempre pelo `dist/` (preview em `.claude/launch.json`, porta 8765).

## Regras do dono
- Commitar e dar push após cada alteração, sem perguntar. Mensagem em inglês: `feat:` / `fix:` / `chore:` / `docs:`.
- Terminar a resposta com o código (hash) do commit. Responder em português, curto (o dono é leigo).
- Depois de cada commit, atualizar a tag em commit separado: `chore: update version tag to v2.xxxxxxx in navbar`.
  Ela mora em `src/app/render/00-casca-portal-manual.part.jsx` (3 ocorrências):
  `git grep -lE "v2\.[a-f0-9]{7}" -- index.html src ':!src/blobs'`.

## Cuidados
- Não ler `src/blobs/` (fotos base64 enormes; já há deny em `.claude/settings.json`). Ler arquivos por faixa de linhas.
- No `build.js`, nunca usar string de replacement com `$&`; usar função.
- Deploys e migrações do Supabase (`apply_migration`, `execute_sql`, `functions deploy`) só na conversa principal, com aprovação do dono. Nunca em subagente.
- Não mexer em `.agents/` nem `supabase/.temp/`.
- Rollback do layout novo: `src/novo/rotas.jsx` -> `const NOVO_NO_INICIO = false;` (commit + push).
