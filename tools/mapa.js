#!/usr/bin/env node
// Vanguard Peptides — gera docs/MAPA.md: o que tem em cada arquivo de src/ (na ordem do manifesto).
// Uso: npm run mapa   (não faz parte do build; rode depois de mexer em src/ e commite o MAPA.md junto)
// Números de linha = linha do próprio arquivo (como o editor/Read mostra).

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const manifesto = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/manifest.json'), 'utf-8')).partes;

// declarações de topo (arquivos .jsx/.js normais)
const TOPO = /^(?:async\s+)?function\s+(\w+)|^(?:const|let|var)\s+(\w+)\s*=/;
// declarações de 1º nível dentro do App (fragmentos .part.jsx de lógica): 2 espaços de recuo
const APP_FN = /^  (?:async\s+)?function\s+(\w+)|^  const\s+(\w+)\s*=\s*(?:useMemo|React\.useRef|\(|async|\{|`)/;
// marcos do render: comentários JSX {/* ... */} e abas do admin
const RENDER = /^\s{4,22}\{\/\*\s*(.+?)\s*\*\/\}\s*$/;

const out = [];
out.push('# Mapa do código (gerado por `npm run mapa` — não editar à mão)');
out.push('');
out.push('Ordem = `src/manifest.json` (é a ordem de montagem). `.part.jsx` = pedaço do corpo de `function App()`, não é JS válido sozinho. `src/blobs/` = fotos base64: **não ler**.');
out.push('');
out.push('| Arquivo | Linhas | KB |');
out.push('|---|---:|---:|');
const detalhes = [];
let total = 0;
for (const rel of manifesto) {
  const txt = fs.readFileSync(path.join(ROOT, rel), 'utf-8').replace(/\r\n/g, '\n');
  const linhas = txt.split('\n'); if (linhas[linhas.length - 1] === '') linhas.pop();
  total += linhas.length;
  out.push(`| \`${rel}\` | ${linhas.length} | ${(Buffer.byteLength(txt) / 1024).toFixed(0)} |`);
  if (rel.startsWith('src/blobs/') || rel.endsWith('.css')) continue;
  const itens = [];
  const parte = rel.endsWith('.part.jsx');
  const render = parte && rel.includes('/render/');
  linhas.forEach((l, i) => {
    let m;
    if (!parte) { m = l.match(TOPO); if (m) itens.push(`${m[1] || m[2]}:${i + 1}`); }
    else if (render) { m = l.match(RENDER); if (m && m[1].length < 60) itens.push(`${m[1]}:${i + 1}`); }
    else { m = l.match(APP_FN); if (m) itens.push(`${m[1] || m[2]}:${i + 1}`); }
  });
  const desc = parte ? (linhas[0].match(/^\/\/ @fragmento do App\(\) — (.*?)\. Antes:/) || [])[1] : '';
  detalhes.push(`### \`${rel}\`${desc ? ' — ' + desc : ''}`);
  detalhes.push(itens.length ? itens.join(' · ') : '(sem marcos)');
  detalhes.push('');
}
out.push(`| **total** | **${total}** | |`);
out.push('');
out.push('## Conteúdo (nome:linha)');
out.push('');
fs.writeFileSync(path.join(ROOT, 'docs/MAPA.md'), out.concat(detalhes).join('\n'));
console.log(`docs/MAPA.md: ${manifesto.length} arquivos, ${total} linhas`);
