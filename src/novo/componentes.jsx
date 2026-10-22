const nvFmt =v => 'R$ ' + (Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function NvIcon({ d, size = 22, w = 1.9 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
}
const NV_ICONS = {
  back: <path d="M15 6l-6 6 6 6" />,
  cart: <><path d="M6 6h15l-1.5 9h-12z" /><path d="M6 6L5 3H2" /><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /></>,
  box: <><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12l5 5 9-10" />,
  chev: <path d="M6 9l6 6 6-6" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
};

// Carrossel continuo "Mais vendidos": rAF mexe no scrollLeft (leve), copias aria-hidden emendam o loop.
// Pausa: hover (mouse), toque/arraste, roda/scroll manual; retoma ~2,5s depois. reduced-motion = estatico.
function NvMarquee({ items, render }) {
  const ref = React.useRef(null);
  const [reduced] = React.useState(() => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } });
  const [sets, setSets] = React.useState(3);
  const n = items.length;
  React.useEffect(() => {
    if (reduced) return;
    const calc = () => setSets(Math.max(3, Math.ceil((window.innerWidth || 1200) / (Math.max(n, 1) * 300)) + 2));
    calc(); window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [reduced, n]);
  // copias nao focaveis (aria-hidden) - roda a cada render pois os botoes podem ser recriados
  React.useEffect(() => {
    const el = ref.current; if (!el || reduced) return;
    el.querySelectorAll('[data-copy="1"] button, [data-copy="1"] a, [data-copy="1"] input, [data-copy="1"] select').forEach(x => x.setAttribute('tabindex', '-1'));
  });
  React.useEffect(() => {
    const el = ref.current; if (!el || reduced || n === 0) return;
    const SPEED = 32; // px/s
    let raf = 0, last = 0, pos = 0, setPos = -1, holdUntil = 0, hover = false, down = false, loop = 0, drag = null, moved = false;
    const hold = (ms) => { holdUntil = Math.max(holdUntil, performance.now() + (ms || 2500)); };
    const measure = () => {
      const kids = el.children;
      if (kids.length > n) loop = kids[n].offsetLeft - kids[0].offsetLeft; // largura de um conjunto (com gap)
      if (loop > 0 && (el.scrollLeft < loop - 1)) { pos = el.scrollLeft + loop; el.scrollLeft = pos; setPos = el.scrollLeft; }
    };
    const wrap = (v) => { if (loop <= 0) return v; while (v >= 2 * loop) v -= loop; while (v < loop) v += loop; return v; };
    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      if (loop <= 0) { measure(); return; }
      if (Math.abs(el.scrollLeft - setPos) > 2) { // usuario mexeu (toque/roda/arraste)
        hold(); pos = el.scrollLeft;
      }
      if (hover || down || t < holdUntil || document.hidden) { pos = el.scrollLeft; setPos = el.scrollLeft; const w = wrap(pos); if (w !== pos) { pos = w; el.scrollLeft = w; setPos = el.scrollLeft; } return; }
      pos = wrap(pos + SPEED * dt);
      el.scrollLeft = pos; setPos = el.scrollLeft;
    };
    const onEnter = (e) => { if (e.pointerType === 'mouse') hover = true; };
    const onLeave = (e) => { if (e.pointerType === 'mouse') { hover = false; hold(1500); } };
    const onDown = (e) => {
      if (e.pointerType === 'mouse') { if (e.button !== 0) return; drag = { x: e.clientX, s: el.scrollLeft }; moved = false; down = true; }
      else { down = true; }
    };
    const onMove = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 5) { moved = true; el.classList.add('drag'); }
      if (moved) el.scrollLeft = drag.s - dx;
    };
    const onUp = () => { if (down) { down = false; hold(); } if (drag) { drag = null; el.classList.remove('drag'); } };
    const onClickCap = (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } };
    const onWheel = () => hold();
    const onFocusIn = () => hold(6000);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { loop = 0; }) : null;
    if (ro) ro.observe(el);
    el.addEventListener('pointerenter', onEnter); el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointerdown', onDown); el.addEventListener('wheel', onWheel, { passive: true });
    el.addEventListener('click', onClickCap, true); el.addEventListener('focusin', onFocusIn);
    window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onUp);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); if (ro) ro.disconnect();
      el.removeEventListener('pointerenter', onEnter); el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointerdown', onDown); el.removeEventListener('wheel', onWheel);
      el.removeEventListener('click', onClickCap, true); el.removeEventListener('focusin', onFocusIn);
      window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onUp);
    };
  }, [reduced, n, sets]);
  if (reduced) return <div className="nv-hotrow">{items.map((p, i) => render(p, i, p.id, false))}</div>;
  const out = [];
  for (let s = 0; s < sets; s++) items.forEach((p, i) => out.push(render(p, i, p.id + '~' + s, s > 0)));
  return <div className="nv-hotrow nv-marq" ref={ref}>{out}</div>;
}

function NvProdImg({ p, eager, ratio, className, alt }) {
  const [bad, setBad] = React.useState(false);
  const src = p && p.image_url;
  React.useEffect(() => { setBad(false); }, [src]);
  const r = ratio === 'tall' ? [800, 1200] : [800, 1000];
  if (!src || bad) {
    return (
      <div className={'nv-ph ' + (className || '')} role="img" aria-label={alt || 'Frasco Vanguard Labs'} style={{ aspectRatio: r[0] + '/' + r[1] }}>
        <svg viewBox="0 0 24 24" width="44%" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 3h6v3H9z" /><path d="M8 6h8v2.5l1 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19v-9l1-1.5z" /><path d="M9.5 13l2.5 4 2.5-4" strokeWidth="1.6" /></svg>
      </div>
    );
  }
  return <img className={'nv-img ' + (className || '')} src={src} alt={alt || ('Frasco ' + p.name + ' Vanguard Labs')} width={r[0]} height={r[1]} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setBad(true)} />;
}
function NvComboImg({ b }) {
  const [bad, setBad] = React.useState(false);
  React.useEffect(() => { setBad(false); }, [b.id]);
  const label = 'Frascos do combo ' + b.name;
  if (!bad) return <img className="nv-cimg" src={'/assets/combos/' + encodeURIComponent(b.id) + '-v1.webp'} alt={label} width={1000} height={800} loading="lazy" decoding="async" onError={() => setBad(true)} />;
  const ps = b.prods.slice(0, 4);
  return (
    <div className="nv-cimg nv-ccol" role="img" aria-label={label}>
      {ps.map(p => <span key={p.id} className="nv-cvial" style={{ zIndex: ps.length - Math.abs(ps.indexOf(p) - (ps.length - 1)) }}><NvProdImg p={p} ratio="tall" alt="" /></span>)}
    </div>
  );
}
function NvInstallBanner() {
  const KEY = 'vg-pwa-dismiss';
  const [evt, setEvt] = React.useState(() => window.__vgInstallEvt || null);
  const [gone, setGone] = React.useState(() => { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } });
  React.useEffect(() => {
    const h = () => setEvt(window.__vgInstallEvt || null);
    window.addEventListener('vg-install-ready', h);
    return () => window.removeEventListener('vg-install-ready', h);
  }, []);
  let standalone = false, ios = false;
  try {
    standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
    const ua = window.navigator.userAgent || '';
    ios = /iPhone|iPad|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  } catch (e) {}
  if (gone || standalone || (!evt && !ios)) return null;
  const dismiss = () => { setGone(true); try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} };
  const install = async () => {
    const e = evt; if (!e) return;
    try { e.prompt(); await e.userChoice; } catch (err) {}
    window.__vgInstallEvt = null; setEvt(null); dismiss();
  };
  return (
    <div className="nv-wrap"><div className="nv-pwa" role="region" aria-label="Instalar app">
      <span className="nv-pwa-t">{evt ? <><b>Instale o app da Vanguard</b> na tela inicial do celular.</> : <><b>Instale o app:</b> toque em Compartilhar e depois em &quot;Adicionar à Tela de Início&quot;.</>}</span>
      {evt && <button onClick={install}>Instalar app</button>}
      <button className="nv-pwa-x" onClick={dismiss} aria-label="Dispensar">×</button>
    </div></div>
  );
}

// ── Banner de campanha (sorteio) — para trocar/encerrar edite só estas constantes ──
const SORTEIO = {
  id: 'sorteio-ghkcu-2026-10',            // muda a cada campanha (reabre o banner p/ quem fechou)
  img: '/assets/sorteio-ghkcu.webp', w: 800, h: 1200,
  sku: 'CU50',                            // produto aberto ao clicar
  ate: '2026-10-31T23:59:00-03:00',       // fim da vigência (horário de Brasília)
  alt: 'Sorteio da Vanguard Labs: 2 vials de GHK-Cu 50mg para nossos clientes. Participa quem comprou nos últimos 30 dias e quem comprar até o final do mês.',
};
function NvSorteio({ products, go }) {
  const KEY = 'vg-sorteio-' + SORTEIO.id;
  const [gone, setGone] = React.useState(() => { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } });
  let now = Date.now();
  try { if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && window.__vgNow) now = +window.__vgNow; } catch (e) {}
  if (gone || now > new Date(SORTEIO.ate).getTime()) return null;
  const prod = products.find(p => (p.sku || '').toUpperCase() === SORTEIO.sku);
  const open = () => { if (prod) go('produto', prod.id); };
  const dismiss = () => { setGone(true); try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} };
  return (
    <div className="nv-wrap"><div className="nv-sorteio" role="region" aria-label="Sorteio de GHK-Cu 50mg">
      <button className="nv-sorteio-x" onClick={dismiss} aria-label="Fechar banner do sorteio">×</button>
      <button className="nv-sorteio-img" onClick={open} aria-label="Ver GHK-Cu 50mg" disabled={!prod}>
        <img src={SORTEIO.img} width={SORTEIO.w} height={SORTEIO.h} alt={SORTEIO.alt} loading="eager" decoding="async" />
      </button>
      <div className="nv-sorteio-t">
        <span className="nv-sorteio-tag">Sorteio</span>
        <h2>2 vials de GHK-Cu 50mg para nossos clientes</h2>
        <ul>
          <li>Quem comprou com a gente <b>nos últimos 30 dias</b></li>
          <li>Quem comprar <b>até o final do mês</b></li>
        </ul>
        <p>Participação automática, sem cadastro.</p>
        {prod && <button className="nv-btn" onClick={open}>Ver GHK-Cu 50mg</button>}
      </div>
    </div></div>
  );
}

