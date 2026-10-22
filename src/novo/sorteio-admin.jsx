// ── SORTEIO MENSAL (aba do admin) ────────────────────────────────────────────
// Só roda dentro do admin autenticado (recebe os pedidos já carregados pelo App); nada é público.
// Critério de "cliente" (1 chance por cliente no mês): CPF (só dígitos, 11) > e-mail (minúsculo) >
// telefone (só dígitos, sem 55 inicial) > se o pedido não tem nenhum dos três, conta como cliente próprio.
// Entram pedidos do mês (fuso de São Paulo) com status pago, enviado ou entregue.
// Histórico: localStorage `vg-sorteios` (só nome, código do pedido, cidade/UF; sem CPF/telefone/e-mail).
const SORTEIO_STATUS_OK = ['pago', 'enviado', 'entregue'];
const SORTEIO_LS = 'vg-sorteios';
const SORTEIO_MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// 'YYYY-MM' de uma data no fuso de São Paulo
function sorteioMesSP(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt.getTime())) return '';
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' }).formatToParts(dt);
  return p.find(x => x.type === 'year').value + '-' + p.find(x => x.type === 'month').value;
}
function sorteioMesLabel(ym) {
  const [y, m] = ym.split('-');
  return SORTEIO_MESES[parseInt(m, 10) - 1] + ' de ' + y;
}
// Identificador estável do cliente
function sorteioChaveCliente(o) {
  const cpf = String(o._cpf || '').replace(/\D/g, '');
  if (cpf.length === 11) return 'cpf:' + cpf;
  const em = String(o._email || '').trim().toLowerCase();
  if (em) return 'em:' + em;
  let tel = String(o._phone || '').replace(/\D/g, '');
  if (tel.startsWith('55') && tel.length > 11) tel = tel.slice(2);
  if (tel.length >= 10) return 'tel:' + tel;
  return 'ped:' + (o._code || o.id);
}
// Inteiro aleatório em [0, n) sem viés, com crypto.getRandomValues
function sorteioRand(n) {
  const lim = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  do { crypto.getRandomValues(buf); } while (buf[0] >= lim);
  return buf[0] % n;
}
// Sorteia k itens distintos (Fisher-Yates parcial)
function sorteioEscolhe(lista, k) {
  const a = lista.slice();
  const out = [];
  for (let i = 0; i < k && a.length; i++) out.push(a.splice(sorteioRand(a.length), 1)[0]);
  return out;
}
function sorteioLoad() {
  try { const v = JSON.parse(localStorage.getItem(SORTEIO_LS) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; }
}
function sorteioSave(h) { try { localStorage.setItem(SORTEIO_LS, JSON.stringify(h)); } catch (e) { /* sem localStorage: segue sem salvar */ } }
const sorteioBRL = v => 'R$ ' + (Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function SorteioAdmin({ orders, showToast, normUF }) {
  const mesAtual = sorteioMesSP(new Date());
  const [mes, setMes] = React.useState(mesAtual);
  const [excl, setExcl] = React.useState({});
  const [qtd, setQtd] = React.useState(1);
  const [fase, setFase] = React.useState('idle'); // idle | girando | pronto
  const [roleta, setRoleta] = React.useState('');
  const [res, setRes] = React.useState(null); // { mes, ganhadores, total }
  const [hist, setHist] = React.useState(sorteioLoad);
  const timerRef = React.useRef(null);
  React.useEffect(() => () => clearInterval(timerRef.current), []);

  // Mesmo critério da aba Pedidos: com Supabase, só pedidos reais (não os locais do carrinho)
  const base = React.useMemo(() => orders.filter(o => (sb ? o._supabase : true)), [orders]);
  const meses = React.useMemo(() => {
    const s = new Set([mesAtual]);
    base.forEach(o => { const m = sorteioMesSP(o.createdAt); if (m) s.add(m); });
    return [...s].sort().reverse();
  }, [base, mesAtual]);

  const parts = React.useMemo(() => {
    const map = new Map();
    base.filter(o => SORTEIO_STATUS_OK.includes(o.status) && sorteioMesSP(o.createdAt) === mes)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // mais recente primeiro
      .forEach(o => {
        const k = sorteioChaveCliente(o);
        const addr = o._address || {};
        let p = map.get(k);
        if (!p) {
          const uf = normUF(addr.estado || '');
          p = { key: k, name: o.buyerName || 'Cliente', code: o._code || ('#' + o.id), phone: o._phone || '', city: [addr.cidade, uf].filter(Boolean).join('/'), pedidos: 0, total: 0 };
          map.set(k, p);
        }
        p.pedidos += 1;
        p.total += parseFloat(o._total) || 0;
      });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [base, mes]);

  const elegiveis = parts.filter(p => !excl[p.key]);
  const nMax = elegiveis.length;
  const n = Math.max(1, Math.min(parseInt(qtd, 10) || 1, nMax || 1));

  function trocaMes(m) { setMes(m); setExcl({}); setRes(null); setFase('idle'); }

  function sortear() {
    if (!nMax || fase === 'girando') return;
    const ganhadores = sorteioEscolhe(elegiveis, n); // decidido já; a animação é só visual
    setRes(null); setFase('girando');
    let i = 0;
    const t0 = Date.now();
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      i++;
      setRoleta(elegiveis[i % elegiveis.length].name);
      if (Date.now() - t0 >= 2800) {
        clearInterval(timerRef.current);
        const reg = { id: Date.now(), mes, at: new Date().toISOString(), participantes: nMax, excluidos: parts.length - nMax,
          ganhadores: ganhadores.map(g => ({ name: g.name, code: g.code, city: g.city })) };
        const novo = [reg, ...sorteioLoad()];
        sorteioSave(novo); setHist(novo);
        setRes({ mes, ganhadores, total: nMax }); setFase('pronto');
      }
    }, 70);
  }

  function textoResultado(r) {
    return `Sorteio Vanguard Peptides - ${sorteioMesLabel(r.mes)}\n` + r.ganhadores.map((g, i) => `${r.ganhadores.length > 1 ? (i + 1) + 'º ' : 'Ganhador(a): '}${g.name} - pedido ${g.code}`).join('\n') + `\n(${r.total} participantes)`;
  }
  async function copiar(txt) {
    try { await navigator.clipboard.writeText(txt); showToast('Resultado copiado ✓', 'success'); }
    catch (e) { showToast('Não consegui copiar. Selecione o texto e copie.', 'error'); }
  }
  function whats(g, mesRef) {
    let d = String(g.phone || '').replace(/\D/g, '');
    if (!d) { showToast('Este cliente não tem telefone no pedido.', 'error'); return; }
    if (!d.startsWith('55')) d = '55' + d;
    const nome = (g.name || 'Cliente').split(' ')[0];
    const msg = `🎉 *Parabéns, ${nome}!* Você foi o(a) sorteado(a) no sorteio de ${sorteioMesLabel(mesRef)} da Vanguard Peptides!\n\n📋 *Pedido:* ${g.code}\n\nVamos combinar como entregar seu prêmio por aqui. 🙏`;
    window.open(`https://wa.me/${d}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 16 };
  const lbl = { fontFamily: "'Space Mono',monospace", fontSize: '0.6rem', color: 'var(--accent)', letterSpacing: '1.5px', marginBottom: 10 };
  const inp = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 10px', color: 'var(--text)', fontSize: '0.82rem', fontFamily: "'DM Sans',sans-serif" };
  const btn = { padding: '8px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Space Mono',monospace" };

  return <>
    <div style={card}>
      <div style={lbl}>🎲 SORTEIO MENSAL</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: '0.65rem', color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Mês dos pedidos</label>
          <select style={inp} value={mes} onChange={e => trocaMes(e.target.value)} disabled={fase === 'girando'}>
            {meses.map(m => <option key={m} value={m}>{sorteioMesLabel(m)}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.65rem', color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Quantos ganhadores</label>
          <input style={{ ...inp, width: 80 }} type="number" min="1" max={Math.max(1, nMax)} value={qtd} onChange={e => setQtd(e.target.value)} disabled={fase === 'girando'} />
        </div>
        <button onClick={sortear} disabled={!nMax || fase === 'girando'} style={{ padding: '10px 22px', background: nMax ? 'var(--accent)' : 'var(--border)', border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, fontSize: '0.78rem', cursor: nMax ? 'pointer' : 'not-allowed', fontFamily: "'Space Mono',monospace" }}>🎲 Sortear</button>
      </div>
      <div style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--muted)' }}>
        <b style={{ color: 'var(--text)' }}>{nMax}</b> participante{nMax === 1 ? '' : 's'} concorrendo{parts.length !== nMax && <> ({parts.length - nMax} excluído{parts.length - nMax === 1 ? '' : 's'})</>}.
        {' '}Conta 1 chance por cliente; entram pedidos pagos, enviados ou entregues de {sorteioMesLabel(mes)}.
      </div>
    </div>

    {fase !== 'idle' && (
      <div style={{ ...card, textAlign: 'center', border: '1px solid var(--accent)' }}>
        {fase === 'girando' && <>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: "'Space Mono',monospace", letterSpacing: '1.5px' }}>SORTEANDO...</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.6rem', fontWeight: 700, margin: '18px 0', minHeight: 40, color: 'var(--accent)' }}>{roleta}</div>
        </>}
        {fase === 'pronto' && res && <>
          <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontFamily: "'Space Mono',monospace", letterSpacing: '1.5px', marginBottom: 12 }}>🏆 {res.ganhadores.length > 1 ? 'GANHADORES' : 'GANHADOR(A)'} · {sorteioMesLabel(res.mes).toUpperCase()}</div>
          {res.ganhadores.map((g, i) => (
            <div key={g.key} style={{ padding: '12px 0', borderTop: i ? '1px solid var(--border)' : 'none', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.3rem', fontWeight: 700 }}>{res.ganhadores.length > 1 ? (i + 1) + 'º ' : ''}{g.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: "'Space Mono',monospace" }}>Pedido {g.code}{g.city ? ' · ' + g.city : ''}</div>
              </div>
              <button onClick={() => whats(g, res.mes)} style={{ ...btn, background: 'rgba(37,211,102,0.12)', borderColor: 'rgba(37,211,102,0.4)', color: '#25d366' }}>💬 Falar no WhatsApp</button>
            </div>
          ))}
          <div style={{ marginTop: 10 }}><button onClick={() => copiar(textoResultado(res))} style={btn}>📋 Copiar resultado</button></div>
        </>}
      </div>
    )}

    <div style={card}>
      <div style={lbl}>👥 PARTICIPANTES ({parts.length})</div>
      {parts.length === 0
        ? <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px 0', fontSize: '0.85rem' }}>Nenhum pedido pago, enviado ou entregue em {sorteioMesLabel(mes)}.</div>
        : <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%' }}>
            <thead><tr><th style={{ width: 70 }}>Entra?</th><th>Nome</th><th>Pedidos</th><th>Total</th><th>Cidade/UF</th></tr></thead>
            <tbody>
              {parts.map(p => (
                <tr key={p.key} style={{ opacity: excl[p.key] ? 0.4 : 1 }}>
                  <td><input type="checkbox" aria-label={'Incluir ' + p.name} checked={!excl[p.key]} disabled={fase === 'girando'} onChange={e => { setExcl(x => ({ ...x, [p.key]: !e.target.checked })); setRes(null); setFase('idle'); }} style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }} /></td>
                  <td>{p.name}</td>
                  <td>{p.pedidos}</td>
                  <td>{sorteioBRL(p.total)}</td>
                  <td>{p.city || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
      <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: 8 }}>Desmarque quem não deve concorrer (funcionário, teste). CPF, telefone e e-mail não aparecem aqui.</div>
    </div>

    <div style={card}>
      <div style={lbl}>🗂️ SORTEIOS ANTERIORES</div>
      {hist.length === 0
        ? <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Nenhum sorteio realizado ainda. O histórico fica salvo só neste navegador.</div>
        : hist.map(h => (
          <div key={h.id} style={{ padding: '10px 0', borderTop: '1px solid var(--border)', fontSize: '0.8rem' }}>
            <div style={{ color: 'var(--muted)', fontSize: '0.68rem', fontFamily: "'Space Mono',monospace" }}>
              {sorteioMesLabel(h.mes)} · sorteado em {new Date(h.at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} · {h.participantes} participantes
            </div>
            <div>{h.ganhadores.map(g => `${g.name} (${g.code})`).join(', ')}</div>
          </div>
        ))}
    </div>
  </>;
}
