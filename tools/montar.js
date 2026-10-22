#!/usr/bin/env node
// Vanguard Peptides — monta o index.html completo a partir da casca + src/
//
// index.html (raiz) é a CASCA: tem linhas-marcador `<!-- @inclui src/... -->`.
// Cada marcador (a linha inteira, com o \n) é trocado pelo conteúdo do arquivo.
// src/manifest.json = lista ORDENADA dos arquivos; a ordem dos marcadores na casca
// tem que ser exatamente essa (a ordem é o contrato: const/TDZ, hoisting, CSS).
//
// Regras: concatenação pura (sem .replace com string → evita o bug do `$&`),
// CRLF → LF, aborta se faltar arquivo, se sobrar marcador ou se casca e manifesto
// discordarem.
//
// Uso:
//   require('./tools/montar').montar()            → texto montado (usado pelo build.js)
//   npm run check                                 → montado == HEAD (sha256)
//   npm run check -- <ref>                        → montado == montado no commit <ref>
//   node tools/montar.js --out arquivo.html       → grava o texto montado

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CASCA = 'index.html';
const MANIFESTO = 'src/manifest.json';
const MARCADOR = /^<!-- @inclui (\S+) -->$/;
const FRAGMENTO = /^\/\/ @fragmento [^\n]*\n/;

const lf = s => s.replace(/\r\n/g, '\n');

// read(rel) → conteúdo (string) ou null se não existir
function lerDisco(rel) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null;
}
function lerGit(ref) {
  return rel => {
    try {
      return execFileSync('git', ['show', `${ref}:${rel}`], { cwd: ROOT, encoding: 'utf-8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    } catch { return null; }
  };
}

function montar(read = lerDisco) {
  const casca = read(CASCA);
  if (casca == null) throw new Error(`${CASCA} não encontrado`);
  const manifRaw = read(MANIFESTO);
  // Antes da modularização (commits antigos) não há manifesto: o index.html é o app inteiro.
  if (manifRaw == null) return lf(casca);

  const manifesto = JSON.parse(manifRaw).partes;
  if (!Array.isArray(manifesto) || !manifesto.length) throw new Error(`${MANIFESTO}: "partes" vazio`);

  const linhas = lf(casca).split('\n');
  const partes = [];
  const vistos = [];
  let buf = [];
  for (let i = 0; i < linhas.length; i++) {
    const m = linhas[i].match(MARCADOR);
    if (!m) { buf.push(linhas[i]); continue; }
    // texto da casca até aqui (cada linha com seu \n)
    if (buf.length) partes.push(buf.join('\n') + '\n');
    buf = [];
    const rel = m[1];
    const conteudo = read(rel);
    if (conteudo == null) throw new Error(`arquivo do manifesto não existe: ${rel}`);
    // Fragmentos do App (.part.jsx) começam com 1 linha "// @fragmento ..." só para quem lê o arquivo:
    // ela é descartada aqui e não entra no texto montado.
    const c = lf(conteudo).replace(FRAGMENTO, '');
    if (!c.endsWith('\n')) throw new Error(`${rel} precisa terminar com quebra de linha`);
    partes.push(c);
    vistos.push(rel);
  }
  // resto da casca (sem \n extra: o último elemento do split já representa o fim do arquivo)
  partes.push(buf.join('\n'));

  if (vistos.length !== manifesto.length || vistos.some((r, i) => r !== manifesto[i])) {
    throw new Error(`ordem dos marcadores em ${CASCA} difere de ${MANIFESTO}:\n  casca:     ${vistos.join(', ')}\n  manifesto: ${manifesto.join(', ')}`);
  }
  const html = partes.join('');
  if (/<!-- @inclui /.test(html)) throw new Error('sobrou marcador @inclui no texto montado (marcador dentro de arquivo incluído?)');
  return html;
}

const sha = s => crypto.createHash('sha256').update(s, 'utf-8').digest('hex');

module.exports = { montar, lerGit, sha };

if (require.main === module) {
  const args = process.argv.slice(2);
  try {
    const out = args.indexOf('--out');
    if (out >= 0) {
      fs.writeFileSync(args[out + 1], montar());
      console.log(`montado → ${args[out + 1]}`);
      process.exit(0);
    }
    const ref = args.find(a => !a.startsWith('--')) || 'HEAD';
    const atual = montar();
    const antes = montar(lerGit(ref));
    const a = sha(atual), b = sha(antes);
    console.log(`montado agora : ${a}  (${atual.length} chars)`);
    console.log(`montado ${ref.padEnd(7)}: ${b}  (${antes.length} chars)`);
    if (a !== b) { console.error('❌ DIFERENTE — não commitar'); process.exit(1); }
    console.log('✅ idêntico');
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
}
