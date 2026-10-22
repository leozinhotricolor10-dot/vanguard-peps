// ── SORTEIO: MODO PALCO (tela cheia para mostrar aos clientes) ───────────────────
// Recebe SÓ nomes (lista de strings), o mês e funções do admin. Não recebe pedidos, valores, CPF, telefone, e-mail ou código de pedido.
// O sorteio em si (e o registro no histórico) é feito pelo SorteioAdmin via `onSortear`, que devolve apenas { key, name }.
// Nome na tela: primeiro nome + inicial do sobrenome ("Maria S.").
function sorteioNomePalco(nome) {
  const t = String(nome || '').trim().split(/\s+/).filter(Boolean);
  if (!t.length) return 'Cliente';
  const prim = t[0].charAt(0).toUpperCase() + t[0].slice(1).toLowerCase();
  const ult = t.length > 1 ? t[t.length - 1] : '';
  return ult ? prim + ' ' + ult.charAt(0).toUpperCase() + '.' : prim;
}

const SORTEIO_PALCO_CSS = `
.sp{position:fixed;inset:0;z-index:99999;overflow:hidden;color:#e2eaf0;font-family:'DM Sans',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;
background:radial-gradient(70% 60% at 50% 0,rgba(0,229,195,.22),transparent 60%),radial-gradient(60% 50% at 100% 100%,rgba(120,90,255,.18),transparent 60%),#050a0e}
.sp-x{position:absolute;top:16px;right:16px;padding:10px 16px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:rgba(5,10,14,.7);color:#fff;font-size:14px;cursor:pointer;z-index:3}
.sp-brand{font-family:'Space Mono',monospace;letter-spacing:6px;font-size:clamp(11px,1.6vw,16px);color:#00e5c3;text-transform:uppercase}
.sp-title{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(34px,7vw,92px);line-height:1;margin:10px 0 6px;text-shadow:0 0 40px rgba(0,229,195,.45)}
.sp-prize{font-size:clamp(16px,2.6vw,32px);color:#a9bfcb;margin-bottom:18px}
.sp-prize b{color:#00e5c3}
.sp-body{display:flex;align-items:center;justify-content:center;gap:clamp(20px,4vw,56px);width:100%;max-width:1200px;flex:0 1 auto;min-height:0}
.sp-img{height:min(52vh,560px);aspect-ratio:2/3;border-radius:18px;box-shadow:0 0 60px rgba(0,229,195,.3),0 20px 60px rgba(0,0,0,.6);border:1px solid rgba(0,229,195,.35);object-fit:cover}
.sp-main{flex:1 1 420px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;min-width:0}
.sp-count{font-family:'Space Mono',monospace;font-size:clamp(14px,2vw,22px);color:#a9bfcb}
.sp-count b{color:#00e5c3;font-size:1.6em}
.sp-btn{padding:clamp(16px,2.4vw,26px) clamp(40px,7vw,96px);font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(24px,4vw,46px);letter-spacing:3px;border:none;border-radius:60px;cursor:pointer;color:#001a16;
background:linear-gradient(135deg,#00e5c3,#7dffe9);box-shadow:0 0 50px rgba(0,229,195,.55);animation:spPulse 1.8s ease-in-out infinite}
.sp-btn:disabled{opacity:.4;animation:none;cursor:not-allowed}
.sp-btn2{padding:12px 22px;border-radius:40px;border:1px solid rgba(0,229,195,.5);background:transparent;color:#e2eaf0;font-size:16px;cursor:pointer}
@keyframes spPulse{50%{transform:scale(1.05);box-shadow:0 0 80px rgba(0,229,195,.8)}}
.sp-count-n{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(120px,26vw,300px);line-height:1;color:#00e5c3;text-shadow:0 0 60px rgba(0,229,195,.7);animation:spPop 1s ease-out}
@keyframes spPop{0%{transform:scale(1.8);opacity:0}30%{opacity:1}100%{transform:scale(1)}}
.sp-roll{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(34px,7vw,88px);color:#fff;min-height:1.3em;max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;text-shadow:0 0 30px rgba(0,229,195,.6)}
.sp-label{font-family:'Space Mono',monospace;letter-spacing:5px;font-size:clamp(12px,1.8vw,20px);color:#00e5c3}
.sp-win{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(40px,9vw,120px);line-height:1.05;background:linear-gradient(90deg,#fff,#00e5c3,#fff);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:spShine 3s linear infinite,spPop .9s ease-out}
.sp-win.sm{font-size:clamp(28px,5.5vw,64px)}
@keyframes spShine{to{background-position:200% center}}
.sp-tick{position:absolute;bottom:0;left:0;right:0;height:42px;overflow:hidden;border-top:1px solid rgba(0,229,195,.15);background:rgba(5,10,14,.6);font-family:'Space Mono',monospace;font-size:14px;color:#7d9aa8;display:flex;align-items:center}
.sp-tick-in{display:inline-block;white-space:nowrap;padding-left:100%;animation:spTick var(--d,60s) linear infinite}
@keyframes spTick{to{transform:translateX(-100%)}}
.sp-conf{position:absolute;top:-20px;width:10px;height:16px;opacity:.95;animation:spFall linear forwards;z-index:2;pointer-events:none}
@keyframes spFall{to{transform:translateY(110vh) rotate(720deg)}}
@media (max-width:760px){.sp-body{flex-direction:column}.sp-img{height:26vh}}
@media (prefers-reduced-motion:reduce){.sp-btn,.sp-win,.sp-count-n{animation:none}}
`;

function SorteioPalco({ nomes, qtd, mes, onSortear, onSair }) {
  const [fase, setFase] = React.useState('idle'); // idle | contagem | girando | pronto
  const [cont, setCont] = React.useState(3);
  const [roleta, setRoleta] = React.useState('');
  const [ganhadores, setGanhadores] = React.useState([]); // [{ key, name }] do último sorteio
  const [ja, setJa] = React.useState([]); // chaves já sorteadas nesta sessão do palco
  const [confete, setConfete] = React.useState(0);
  const timers = React.useRef([]);
  const mascarados = React.useMemo(() => nomes.map(sorteioNomePalco), [nomes]);
  const limpa = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const agenda = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };
  React.useEffect(() => () => limpa(), []);
  React.useEffect(() => {
    const k = e => { if (e.key === 'Escape') { limpa(); onSair(); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onSair]);

  const pecas = React.useMemo(() => Array.from({ length: 90 }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 1.6, dur: 2.6 + Math.random() * 2.4, rot: Math.random() * 360,
    cor: ['#00e5c3', '#ffd166', '#ff6b9d', '#7a5cff', '#ffffff'][i % 5],
  })), [confete]);

  function comecar() {
    if (fase === 'contagem' || fase === 'girando') return;
    const r = onSortear(qtd, ja); // sorteia e grava no histórico; devolve [{ key, name }] ou null
    if (!r || !r.length) return;
    limpa(); setGanhadores([]); setConfete(0); setCont(3); setFase('contagem');
    agenda(() => setCont(2), 1000);
    agenda(() => setCont(1), 2000);
    agenda(() => { setFase('girando'); gira(r, Date.now()); }, 3000);
  }
  function gira(r, t0) {
    const dur = 4600;
    const passo = () => {
      const dec = Math.min(1, (Date.now() - t0) / dur);
      setRoleta(mascarados[Math.floor(Math.random() * mascarados.length)] || '');
      if (Date.now() - t0 >= dur) {
        setGanhadores(r); setJa(j => [...j, ...r.map(x => x.key)]); setConfete(c => c + 1); setFase('pronto');
        return;
      }
      agenda(passo, 50 + dec * dec * 380); // desacelera
    };
    passo();
  }

  const restantes = Math.max(0, nomes.length - ja.length);
  const unico = ganhadores.length === 1;
  return (
    <div className="sp" role="dialog" aria-label="Modo palco do sorteio">
      <style>{SORTEIO_PALCO_CSS}</style>
      <button className="sp-x" onClick={() => { limpa(); onSair(); }}>Sair (Esc)</button>
      {fase === 'pronto' && pecas.map((p, i) => <span key={confete + '-' + i} className="sp-conf" style={{ left: p.left + '%', background: p.cor, animationDelay: p.delay + 's', animationDuration: p.dur + 's', transform: 'rotate(' + p.rot + 'deg)' }} />)}
      <div className="sp-brand">Vanguard Peptides</div>
      <div className="sp-title">SORTEIO</div>
      <div className="sp-prize"><b>2 vials de GHK-Cu 50mg</b> · {sorteioMesLabel(mes)}</div>
      <div className="sp-body">
        <img className="sp-img" src={SORTEIO.img} alt="" />
        <div className="sp-main">
          {fase === 'idle' && <>
            <div className="sp-count"><b>{nomes.length}</b> participante{nomes.length === 1 ? '' : 's'} concorrendo</div>
            <button className="sp-btn" onClick={comecar} disabled={!nomes.length}>SORTEAR</button>
          </>}
          {fase === 'contagem' && <>
            <div className="sp-label">PREPARADOS?</div>
            <div className="sp-count-n" key={cont}>{cont}</div>
          </>}
          {fase === 'girando' && <>
            <div className="sp-label">SORTEANDO...</div>
            <div className="sp-roll">{roleta}</div>
          </>}
          {fase === 'pronto' && <>
            <div className="sp-label">{unico ? '🏆 O(A) GANHADOR(A) É' : '🏆 OS GANHADORES SÃO'}</div>
            {ganhadores.map((g, i) => <div key={g.key} className={'sp-win' + (unico ? '' : ' sm')}>{unico ? '' : (i + 1) + 'º '}{sorteioNomePalco(g.name)}</div>)}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
              {restantes > 0 && <button className="sp-btn2" onClick={comecar}>🎲 Sortear novamente (novo ganhador)</button>}
              <button className="sp-btn2" onClick={() => { limpa(); onSair(); }}>Encerrar</button>
            </div>
          </>}
        </div>
      </div>
      {nomes.length > 0 && <div className="sp-tick" aria-hidden="true"><span className="sp-tick-in" style={{ '--d': Math.max(30, mascarados.length * 2.5) + 's' }}>{mascarados.join('   ✦   ')}</span></div>}
    </div>
  );
}
