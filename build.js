#!/usr/bin/env node
// Vanguard Peptides — Build Script
// Compila index.html (JSX/Babel) → dist/index.html (JS puro, sem Babel runtime)
// Uso: npm run build

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'index.html');
const DIST_DIR = path.join(__dirname, 'dist');
const DIST = path.join(DIST_DIR, 'index.html');

console.log('⚡ Vanguard build iniciado...\n');

const html = fs.readFileSync(SRC, 'utf-8');
const origSize = (html.length / 1024).toFixed(1);

// 1) Extrair JSX do <script type="text/babel">
const babelMatch = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (!babelMatch) {
  console.error('❌ Erro: <script type="text/babel"> não encontrado em index.html');
  process.exit(1);
}
const jsxCode = babelMatch[1];
console.log(`📄 JSX extraído: ${(jsxCode.length / 1024).toFixed(1)}KB`);

// 2) Compilar JSX → JS com esbuild (ultra-rápido, sem bundling)
esbuild.transform(jsxCode, {
  loader: 'jsx',
  minify: true,
  target: ['es2020'],
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
}).then(result => {
  const compiledSize = (result.code.length / 1024).toFixed(1);
  console.log(`✅ JSX compilado: ${compiledSize}KB (minificado)`);

  // 3) Montar HTML otimizado
  let dist = html;

  // Remover Babel (maior ganho de performance)
  dist = dist.replace(
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js"></script>\n',
    ''
  );

  // Trocar Supabase de unpkg → jsDelivr + usar .min.js
  dist = dist.replace(
    'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js'
  );
  dist = dist.replace(
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js'
  );

  // Adicionar defer aos scripts CDN (React, ReactDOM, Supabase) — evita bloqueio de render
  dist = dist.replace(
    /(<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/react\/[^"]+")><\/script>/g,
    '$1 defer crossorigin></script>'
  );
  dist = dist.replace(
    /(<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/react-dom\/[^"]+")><\/script>/g,
    '$1 defer crossorigin></script>'
  );
  dist = dist.replace(
    /(<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/[^"]+")><\/script>/g,
    '$1 defer crossorigin></script>'
  );

  // Adicionar preconnect hints logo após <meta charset> (reduz DNS lookup time)
  dist = dist.replace(
    '<meta charset="UTF-8"/>',
    `<meta charset="UTF-8"/>
<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin/>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin/>
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="dns-prefetch" href="https://aumubzvdhzvtnqfzqeqd.supabase.co"/>
<link rel="dns-prefetch" href="https://economia.awesomeapi.com.br"/>`
  );

  // Adicionar loading screen inline (CSS puro, aparece antes do JS carregar)
  const loadingScreen = `
<style>
#vg-loading{position:fixed;inset:0;background:#050a0e;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99999;transition:opacity .4s ease}
#vg-loading.hide{opacity:0;pointer-events:none}
.vg-spinner{width:40px;height:40px;border:3px solid rgba(0,229,195,0.15);border-top-color:#00e5c3;border-radius:50%;animation:vg-spin .8s linear infinite;margin-bottom:18px}
.vg-load-title{font-family:'Space Mono',monospace;font-size:.7rem;letter-spacing:2px;color:#00e5c3;opacity:.7}
@keyframes vg-spin{to{transform:rotate(360deg)}}
</style>
<div id="vg-loading"><div class="vg-spinner"></div><div class="vg-load-title">VANGUARD PEPTIDES</div></div>
<script>
// Remove loading screen assim que React renderizar em #root
new MutationObserver(function(m,obs){
  if(document.getElementById('root')&&document.getElementById('root').children.length){
    var el=document.getElementById('vg-loading');
    if(el){el.classList.add('hide');setTimeout(function(){el.remove()},450);}
    obs.disconnect();
  }
}).observe(document.body,{childList:true,subtree:true});
</script>`;

  // Inserir loading screen antes de </body>
  dist = dist.replace('</body>', loadingScreen + '\n</body>');

  // Substituir <script type="text/babel"> pelo JS compilado (com defer para não bloquear)
  dist = dist.replace(
    /<script type="text\/babel">[\s\S]*?<\/script>/,
    `<script defer>\n${result.code}\n</script>`
  );

  // Garantir crossorigin nos scripts React/ReactDOM para melhor cache
  dist = dist.replace(
    /(<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/react(?:-dom)?\/[^"]+">)(<\/script>)/g,
    '$1</script>'
  );

  // 4) Escrever dist/
  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR);
  fs.writeFileSync(DIST, dist);

  const distSize = (dist.length / 1024).toFixed(1);
  console.log(`\n📦 dist/index.html gerado!`);
  console.log(`   index.html:      ${origSize}KB (fonte, com JSX+Babel)`);
  console.log(`   dist/index.html: ${distSize}KB (otimizado, sem Babel runtime)`);
  console.log(`\n🚀 O que foi removido/otimizado:`);
  console.log(`   ✓ Babel standalone (~500KB) removido`);
  console.log(`   ✓ JSX compilado e minificado (${compiledSize}KB)`);
  console.log(`   ✓ Supabase CDN: unpkg → jsDelivr (mais rápido)`);
  console.log(`   ✓ preconnect hints adicionados`);
  console.log(`   ✓ Loading screen CSS imediata`);
  console.log(`\n✅ Pronto! Faça git push do dist/ para deploy.\n`);

}).catch(err => {
  console.error('❌ Erro de compilação:', err.message);
  process.exit(1);
});
