/* Vanguard Peptides — service worker (PWA).
 * BUILD_ID é trocado pelo build.js (hash do build). Cada deploy = novo sw.js = novo cache.
 *
 * Regras (produção: estoque e versão mudam o tempo todo):
 *  - Navegação (HTML): SEMPRE rede (cache HTTP ignorado). Só offline mostra a página offline.
 *    O HTML nunca é guardado em cache.
 *  - Assets do PWA (ícones, manifest): stale-while-revalidate.
 *  - Nunca intercepta: não-GET, outros domínios (Supabase, CDNs, awesomeapi...), /functions/v1/,
 *    /rest/v1/, /rpc/ e qualquer outra coisa que não seja asset do PWA. Essas requisições seguem
 *    direto para a rede, sem passar pelo SW.
 *  Emergência: publicar um sw.js que se auto-desregistra (ver docs/HANDOFF.md).
 */
const BUILD_ID = '__BUILD_ID__';
const CACHE = 'vg-static-' + BUILD_ID;
const STATIC = ['/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/icon-maskable-512.png', '/apple-touch-icon.png'];

const OFFLINE_HTML = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>' +
  '<meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#050a0e"/>' +
  '<title>Sem conexão — Vanguard Peptides</title>' +
  '<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#050a0e;color:#e2eaf0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;text-align:center;padding:24px;box-sizing:border-box}' +
  'main{max-width:340px}h1{font-size:1.25rem;margin:0 0 8px;color:#00e5c3;letter-spacing:.5px}p{margin:0 0 20px;line-height:1.5;color:#a9bfcb;font-size:.95rem}' +
  'button{height:44px;padding:0 24px;border-radius:10px;border:1px solid #00e5c3;background:rgba(0,229,195,.12);color:#00e5c3;font-size:1rem;font-weight:600;cursor:pointer}</style></head>' +
  '<body><main><h1>Sem conexão</h1><p>Não foi possível abrir a loja agora. Confira sua internet e tente de novo. Seu carrinho continua salvo neste aparelho.</p>' +
  '<button onclick="location.reload()">Tentar de novo</button></main></body></html>';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((c) => Promise.all(STATIC.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase, CDNs, câmbio etc.
  if (/\/(functions|rest|auth|storage)\/v1\/|\/rpc\//.test(url.pathname)) return;

  // Navegação: rede primeiro (sem cache HTTP); offline → página offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(new Request(req, { cache: 'no-cache' })).catch(() =>
        new Response(OFFLINE_HTML, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
      )
    );
    return;
  }

  // Assets do PWA: stale-while-revalidate
  if (STATIC.includes(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(url.pathname);
      const net = fetch(req).then((res) => { if (res && res.ok) cache.put(url.pathname, res.clone()); return res; }).catch(() => null);
      return hit || (await net) || new Response('', { status: 504 });
    })());
  }
  // o resto (sitemap, og-image, etc.) segue direto para a rede
});
