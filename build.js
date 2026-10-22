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

// index.html é a casca; o app está em src/ (ordem em src/manifest.json). montar() devolve o texto completo.
const html = require('./tools/montar').montar();
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

  // Remover Babel standalone (maior ganho de performance). As tags CDN têm integrity/crossorigin,
  // então o casamento é por regex no src, independente dos atributos. Função como replacement (evita $&).
  // React, ReactDOM e Supabase ficam como estão (integrity preservado). Não trocar a URL do Supabase:
  // o integrity (SRI) é do arquivo exato e um .min.js de outro CDN seria bloqueado pelo navegador.
  dist = dist.replace(
    /<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/babel-standalone\/[^"]+"[^>]*><\/script>\n?/,
    () => ''
  );
  if (/babel-standalone/.test(dist)) { console.error('❌ Babel standalone ainda presente no dist'); process.exit(1); }

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

  // Loading screen CSS no <head> — estilo disponível antes do primeiro paint
  const loadingCSS = `<style id="vg-ls-css">
#vg-loading{position:fixed;inset:0;background:#050a0e;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99999;transition:opacity .5s ease}
#vg-loading.hide{opacity:0;pointer-events:none}
.vg-logo{font-family:'Space Mono',monospace;font-size:.8rem;letter-spacing:4px;color:#00e5c3;opacity:.9;margin-bottom:28px;text-align:center}
.vg-logo span{display:block;font-size:.5rem;letter-spacing:6px;opacity:.45;margin-top:4px}
.vg-pw{width:220px;height:2px;background:rgba(0,229,195,0.1);border-radius:2px;overflow:visible;margin-bottom:10px;position:relative}
.vg-pb{height:100%;width:0%;background:linear-gradient(90deg,#00b4d8,#00e5c3);border-radius:2px;transition:width .35s cubic-bezier(.4,0,.2,1);position:relative}
.vg-pb::after{content:'';position:absolute;right:-1px;top:-3px;width:8px;height:8px;border-radius:50%;background:#00e5c3;box-shadow:0 0 8px #00e5c3;transition:opacity .2s}
.vg-pct{font-family:'Space Mono',monospace;font-size:.58rem;color:rgba(0,229,195,.45);letter-spacing:1px}
</style>`;

  // Loading screen HTML logo após <body> — visível antes dos CDN scripts carregarem
  const loadingHTML = `<div id="vg-loading">
  <div class="vg-logo">VANGUARD PEPTIDES<span>CARREGANDO</span></div>
  <div class="vg-pw"><div class="vg-pb" id="vg-pb"></div></div>
  <div class="vg-pct" id="vg-pct">0%</div>
</div>`;

  // Loading screen JS no final do <body> — executa depois do app script (síncrono)
  const loadingJS = `<script>
(function(){
  var pb=document.getElementById('vg-pb'),pct=document.getElementById('vg-pct'),cur=0,done=false;
  function go(p){cur=Math.max(cur,p);if(pb)pb.style.width=cur+'%';if(pct)pct.textContent=Math.round(cur)+'%';}
  function finish(){
    if(done)return;done=true;
    go(100);
    var el=document.getElementById('vg-loading');
    if(el){setTimeout(function(){el.classList.add('hide');setTimeout(function(){if(el.parentNode)el.remove();},550);},200);}
  }
  // Anima barra (app script já rodou síncrono, React deve ter renderizado)
  var t=0,iv=setInterval(function(){t++;go(Math.min(85,t*1.5));if(t>=57)clearInterval(iv);},25);
  // Verifica se React já renderizou (caso síncrono)
  var r=document.getElementById('root');
  if(r&&r.hasChildNodes()){setTimeout(finish,400);return;}
  // Poll a cada 100ms para render assíncrono (React 18 concurrent)
  var poll=setInterval(function(){
    var r2=document.getElementById('root');
    if(r2&&r2.hasChildNodes()){clearInterval(poll);finish();}
  },100);
  // Timeout máximo de 6 segundos
  setTimeout(function(){clearInterval(poll);if(!done)finish();},6000);
  // Mostrar erro JS visualmente no loading screen
  window.addEventListener('error',function(e){
    clearInterval(poll);clearInterval(iv);
    var el=document.getElementById('vg-loading');
    if(el&&!done){
      el.innerHTML='<div style="text-align:center;padding:24px"><div style="font-family:monospace;font-size:.75rem;color:#00e5c3;letter-spacing:3px;margin-bottom:16px">VANGUARD PEPTIDES</div><div style="color:#ff6b6b;font-family:monospace;font-size:.65rem;margin-bottom:8px">Erro ao inicializar</div><div style="color:rgba(255,107,107,.6);font-family:monospace;font-size:.55rem;max-width:280px;word-break:break-all;margin-bottom:16px">'+e.message+'</div><button onclick="location.reload()" style="background:rgba(0,229,195,.15);border:1px solid #00e5c3;color:#00e5c3;padding:8px 20px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:.65rem">RECARREGAR</button></div>';
    }
  });
})();
</script>`;

  // Injetar CSS no <head>
  dist = dist.replace('</head>', loadingCSS + '\n</head>');

  // Injetar HTML logo após <body>
  dist = dist.replace('<body>', '<body>\n' + loadingHTML);

  // Injetar JS antes de </body>
  dist = dist.replace('</body>', loadingJS + '\n</body>');

  // Substituir <script type="text/babel"> pelo JS compilado (sem defer — inline ignora defer)
  // IMPORTANTE: usar função como replacement para evitar interpretação de $& no código minificado
  dist = dist.replace(
    /<script type="text\/babel">[\s\S]*?<\/script>/,
    () => `<script>\n${result.code}\n</script>`
  );

  // 4) Escrever dist/
  // O mesmo app serve todas as rotas; o layout é escolhido pelo caminho (ver NOVO_NO_INICIO no index.html):
  //   /            → layout novo (ou antigo, se NOVO_NO_INICIO = false — rollback)
  //   /novo        → redireciona para / (com ?query e #hash); se NOVO_NO_INICIO = false, layout novo
  //   /p/<código>  → layout novo, página do produto (Open Graph próprio)
  //   /antigo/     → layout antigo, rota de segurança (noindex)
  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR);
  const novoNoInicio = /const NOVO_NO_INICIO = true;/.test(html);
  console.log(`🧭 Layout em /: ${novoNoInicio ? 'NOVO' : 'ANTIGO'} (NOVO_NO_INICIO = ${novoNoInicio})`);
  fs.writeFileSync(DIST, withHead(dist, { canonical: SITE + '/' }));

  fs.mkdirSync(path.join(DIST_DIR, 'novo'), { recursive: true });
  if (novoNoInicio) {
    // /novo virou o site principal: redireciona na hora para "/" mantendo ?query e #hash
    // (GitHub Pages não tem redirect de servidor; script + meta refresh como reserva sem JS)
    const og = (dist.match(/<meta property="og:[^>]*>/g) || []).join('\n');
    fs.writeFileSync(path.join(DIST_DIR, 'novo', 'index.html'), `<!DOCTYPE html>
<html lang="pt-BR"><head>
<meta charset="UTF-8"/>
<title>Vanguard Peptides</title>
<link rel="canonical" href="${SITE}/"/>
<meta name="robots" content="noindex"/>
${og}
<script>location.replace('/' + location.search + location.hash);</script>
<meta http-equiv="refresh" content="0; url=/"/>
</head><body style="background:#050a0e;color:#e2eaf0;font-family:sans-serif;padding:24px">
<a href="/" style="color:#00e5c3">Abrir vanguardpep.com</a>
</body></html>
`);
    console.log('📄 Gerado: novo/index.html (redireciona para /)');
  } else {
    fs.writeFileSync(path.join(DIST_DIR, 'novo', 'index.html'), withHead(dist, { canonical: SITE + '/novo' }));
    console.log('📄 Gerado: novo/index.html');
  }

  fs.mkdirSync(path.join(DIST_DIR, 'antigo'), { recursive: true });
  fs.writeFileSync(path.join(DIST_DIR, 'antigo', 'index.html'), withHead(dist, {
    canonical: SITE + '/', noindex: true, title: 'Vanguard Peptides — versão anterior',
  }));
  console.log('📄 Gerado: antigo/index.html (layout antigo, noindex)');

  // Endereços desconhecidos (ex.: produto cadastrado depois do deploy) também abrem o app
  fs.writeFileSync(path.join(DIST_DIR, '404.html'), dist);
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);
  buildProductPages(dist);
  copyPwa(dist);
  // Imagens estáticas (banner de sorteio etc.) → dist/assets
  if (fs.existsSync(path.join(__dirname, 'assets'))) fs.cpSync(path.join(__dirname, 'assets'), path.join(DIST_DIR, 'assets'), { recursive: true });

  // Copiar páginas estáticas adicionais (landing de atacado servida em /atacado)
  const extraStatic = ['atacado/index.html'];
  extraStatic.forEach(f => {
    const src = path.join(__dirname, f);
    if (fs.existsSync(src)) {
      const dst = path.join(DIST_DIR, f);
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(src, dst);
      console.log(`📄 Copiado: ${f}`);
    }
  });

  const distSize = (dist.length / 1024).toFixed(1);
  console.log(`\n📦 dist/index.html gerado!`);
  console.log(`   index.html:      ${origSize}KB (fonte, com JSX+Babel)`);
  console.log(`   dist/index.html: ${distSize}KB (otimizado, sem Babel runtime)`);
  console.log(`\n🚀 O que foi removido/otimizado:`);
  console.log(`   ✓ Babel standalone (~500KB) removido`);
  console.log(`   ✓ JSX compilado e minificado (${compiledSize}KB)`);
  console.log(`   ✓ preconnect hints adicionados`);
  console.log(`   ✓ Loading screen CSS imediata`);
  console.log(`\n✅ Pronto! Faça git push do dist/ para deploy.\n`);

}).catch(err => {
  console.error('❌ Erro de compilação:', err.message);
  process.exit(1);
});


// ── PWA: manifest, ícones e service worker na raiz do dist ────────────────
// BUILD_ID = hash do conteúdo do app + arquivos do PWA → nome do cache muda a cada deploy.
function copyPwa(dist) {
  const crypto = require('crypto');
  const PWA_DIR = path.join(__dirname, 'pwa');
  const files = ['manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'favicon-48.png'];
  const h = crypto.createHash('sha1').update(dist);
  const swSrc = fs.readFileSync(path.join(PWA_DIR, 'sw.js'), 'utf-8');
  h.update(swSrc);
  files.forEach(f => h.update(fs.readFileSync(path.join(PWA_DIR, f))));
  const buildId = h.digest('hex').slice(0, 10);
  if (!swSrc.includes('__BUILD_ID__')) { console.error('❌ pwa/sw.js sem __BUILD_ID__'); process.exit(1); }
  files.forEach(f => fs.copyFileSync(path.join(PWA_DIR, f), path.join(DIST_DIR, f)));
  fs.writeFileSync(path.join(DIST_DIR, 'sw.js'), swSrc.replace('__BUILD_ID__', buildId));
  console.log(`📱 PWA: manifest + ${files.length - 1} ícones + sw.js (build ${buildId})`);
}

// ── Páginas por produto: /p/<código> ───────────────────────────────────────
// Mesmo app, com título e prévia (Open Graph) do produto para links no WhatsApp.
const SITE = 'https://vanguardpep.com';
const PRODUCTS_URL = 'https://aumubzvdhzvtnqfzqeqd.supabase.co/rest/v1/products?select=id,sku,name,description,image_url&order=sort_order';
const PUBLIC_KEY = 'sb_publishable_crfA-iUkVR2mnibsWQ2ZDA_wpwOBBY_';

// Canonical / noindex / título por página (inserido logo após o og:url)
function withHead(page, { canonical, noindex, title } = {}) {
  let out = page;
  if (title) out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${escAttr(title)}</title>`);
  const tags = [canonical ? `<link rel="canonical" href="${canonical}"/>` : '', noindex ? '<meta name="robots" content="noindex"/>' : ''].filter(Boolean).join('\n');
  if (tags) out = out.replace(/(<meta property="og:url"[^>]*>)/, (m) => m + '\n' + tags);
  return out;
}
function writeSitemap(slugs) {
  const urls = ['/', ...slugs.map(s => '/p/' + s)];
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map(u => `  <url><loc>${SITE}${u}</loc></url>`).join('\n') + '\n</urlset>\n';
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml);
  console.log(`📄 sitemap.xml: ${urls.length} endereços`);
}

const escAttr = v => String(v || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function buildProductPages(dist) {
  let products;
  try {
    const res = await fetch(PRODUCTS_URL, { headers: { apikey: PUBLIC_KEY, Authorization: 'Bearer ' + PUBLIC_KEY } });
    products = await res.json();
    if (!Array.isArray(products)) throw new Error(JSON.stringify(products).slice(0, 120));
  } catch (e) {
    console.warn('⚠️  Páginas de produto não geradas (sem acesso aos produtos):', e.message);
    writeSitemap([]);
    return;
  }
  const slugs = [];
  for (const p of products) {
    const slug = String(p.sku || p.id).toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!slug) continue;
    const title = `${p.name} — Vanguard Peptides`;
    const desc = p.description || 'Peptídeos de alta pureza. Pague no PIX com frete grátis.';
    const url = `${SITE}/p/${slug}`;
    let page = withHead(dist, { canonical: url })
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escAttr(title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escAttr(desc)}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escAttr(p.name)}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escAttr(desc)}$2`);
    if (p.image_url) {
      page = page
        .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${escAttr(p.image_url)}$2`)
        .replace(/<meta property="og:image:(width|height)"[^>]*>\s*/g, '');
    }
    const dir = path.join(DIST_DIR, 'p', slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), page);
    slugs.push(slug);
  }
  writeSitemap(slugs);
  console.log(`📄 Páginas de produto: ${slugs.length} (/p/${slugs.slice(0, 4).join(', /p/')}...)`);
}
