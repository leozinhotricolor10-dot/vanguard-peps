// ── SORTEIO MENSAL (aba do admin) ────────────────────────────────────────────
// Só roda dentro do admin autenticado (recebe os pedidos já carregados pelo App); nada é público.
// Critério de "cliente" (1 chance por cliente no mês): CPF (só dígitos, 11) > e-mail (minúsculo) >
// telefone (só dígitos, sem 55 inicial) > se o pedido não tem nenhum dos três, conta como cliente próprio.
// Entram pedidos do mês (fuso de São Paulo) com status pago, enviado ou entregue.
// Histórico: tabela Supabase `raffles` (via admin-db) com espelho em localStorage `vg-sorteios`; só nome, código do pedido,
// cidade/UF (sem CPF/telefone/e-mail). Se a tabela não existir, a aba segue só com o localStorage e avisa.
// Participantes manuais (clientes que compraram fora do site): tabela `raffle_extras` (via admin-db), espelho/fallback em localStorage
// `vg-sorteio-extras`. Telefone opcional só serve ao botão de WhatsApp: nunca aparece na tela nem vai para o histórico.
const SORTEIO_STATUS_OK = ['pago', 'enviado', 'entregue'];
const SORTEIO_LS = 'vg-sorteios';
const SORTEIO_LS_MIGRADO = 'vg-sorteios-migrado';
const SORTEIO_ERRO_TABELA = /raffles|relation|does not exist|schema cache|not allowed/i;
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
// banco <-> UI
function sorteioDeLinha(r) {
  return { id: Number(r.id), mes: r.mes, at: r.sorteado_em, participantes: r.participantes || 0, excluidos: r.excluidos || 0,
    ganhadores: Array.isArray(r.ganhadores) ? r.ganhadores : [] };
}
function sorteioParaLinha(h) {
  const g = (h.ganhadores || []).map(x => ({ name: x.name, code: x.code, city: x.city || '' })); // só nome/código/cidade
  return { id: h.id, mes: h.mes, sorteado_em: h.at, participantes: h.participantes || 0, excluidos: h.excluidos || 0, qtd_ganhadores: g.length, ganhadores: g };
}
// junta banco + local sem duplicar por id; só-locais ficam marcados; mais recente primeiro
function sorteioJunta(banco, local) {
  const ids = new Set(banco.map(h => h.id));
  const soLocal = local.filter(h => !ids.has(h.id)).map(h => ({ ...h, _local: true }));
  return [...banco, ...soLocal].sort((a, b) => new Date(b.at) - new Date(a.at));
}
const sorteioBRL = v => 'R$ ' + (Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Participantes manuais ────────────────────────────────────────────────────
const SORTEIO_EXTRAS_LS = 'vg-sorteio-extras';
const SORTEIO_ERRO_EXTRAS = /raffle_extras|relation|does not exist|schema cache|not allowed/i;
function sorteioExtrasLoad() {
  try { const v = JSON.parse(localStorage.getItem(SORTEIO_EXTRAS_LS) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; }
}
function sorteioExtrasSave(l) { try { localStorage.setItem(SORTEIO_EXTRAS_LS, JSON.stringify(l)); } catch (e) { /* sem localStorage: segue sem salvar */ } }
// tira emojis/símbolos, espaços extras e numeração/marcador do começo da linha
function sorteioLimpaNome(t) {
  return String(t || '').replace(/[\p{Extended_Pictographic}\p{Emoji_Modifier}\u200d\ufe0f]/gu, '')
    .replace(/\s+/g, ' ').trim().replace(/^[\s,;:•*\-–]+|[\s,;:•*\-–]+$/g, '').trim();
}
// Lê o texto colado: uma pessoa por linha, aceita '1. Nome', '1) Nome', '1 Nome' ou só 'Nome'; ignora linhas vazias e cabeçalhos.
// Devolve [{ nome, obs }]; obs guarda o texto original quando o nome gravado ficou diferente (emoji, espaços).
function sorteioParseLista(texto) {
  const out = [];
  String(texto || '').split(/\r?\n/).forEach(linha => {
    const bruta = linha.trim();
    if (!bruta) return;
    const semNum = bruta.replace(/^\(?\d{1,3}\s*[.):\-–]\s*|^\d{1,3}\s+|^[-•*]\s+/, '').trim();
    if (!sorteioLimpaNome(semNum)) return;
    if (/:$/.test(bruta) || (semNum === bruta && /^(lista|participantes?|clientes?|nomes?|sorteio)\b/i.test(bruta))) return; // cabeçalho
    const nome = sorteioLimpaNome(semNum);
    out.push({ nome: nome.slice(0, 80), obs: nome !== semNum ? 'Colado como: ' + semNum.slice(0, 120) : '' });
  });
  return out;
}
// chave de comparação: sem acento, minúsculas, sem emoji/pontuação
function sorteioNorm(t) {
  return String(t || '').replace(/[\p{Extended_Pictographic}\p{Emoji_Modifier}\u200d\ufe0f]/gu, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}
// nome manual bate com nome do site? igual, ou (2+ palavras) primeiro e último nome de um contidos no outro
function sorteioNomeBate(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const ta = a.split(' '), tb = b.split(' ');
  if (ta.length < 2 || tb.length < 2) return false;
  const cont = (x, y) => y.includes(x[0]) && y.includes(x[x.length - 1]);
  return cont(ta, tb) || cont(tb, ta);
}
function sorteioParecePlaceholder(nome) {
  return /[\/]|\.\.\.|…/.test(nome) || /clinica|psic/.test(sorteioNorm(nome));
}

function SorteioAdmin({ orders, showToast, normUF }) {
  const mesAtual = sorteioMesSP(new Date());
  const [mes, setMes] = React.useState(mesAtual);
  const [excl, setExcl] = React.useState({});
  const [qtd, setQtd] = React.useState(1);
  const [fase, setFase] = React.useState('idle'); // idle | girando | pronto
  const [roleta, setRoleta] = React.useState('');
  const [res, setRes] = React.useState(null); // { mes, ganhadores, total }
  const [hist, setHist] = React.useState(() => sorteioJunta([], sorteioLoad()));
  const [bancoOk, setBancoOk] = React.useState(false); // true = histórico lido do Supabase
  const [falta, setFalta] = React.useState(false); // tabela raffles não existe / não permitida
  const [importando, setImportando] = React.useState(false);
  const [extras, setExtras] = React.useState(() => sorteioExtrasLoad().map(x => ({ ...x, _local: true }))); // manuais de todos os meses
  const [extrasOk, setExtrasOk] = React.useState(false); // true = lista manual lida do Supabase
  const [extrasFalta, setExtrasFalta] = React.useState(false); // tabela raffle_extras não existe / não permitida
  const [manSel, setManSel] = React.useState({}); // chave 'm:id' -> true/false (sobrepõe o padrão: entra, salvo duplicado/revisar)
  const [fNome, setFNome] = React.useState('');
  const [fObs, setFObs] = React.useState('');
  const [fTel, setFTel] = React.useState('');
  const [colar, setColar] = React.useState(false);
  const [texto, setTexto] = React.useState('');
  const [gravando, setGravando] = React.useState(false);
  const timerRef = React.useRef(null);
  React.useEffect(() => () => clearInterval(timerRef.current), []);

  // Carrega o histórico do banco (se falhar, segue só com o localStorage)
  React.useEffect(() => {
    let vivo = true;
    if (!sb) return;
    (async () => {
      try {
        const { data, error } = await sb.from('raffles').select();
        if (!vivo) return;
        if (error) {
          if (SORTEIO_ERRO_TABELA.test(error.message || '')) setFalta(true);
          else showToast('Não consegui ler o histórico do banco: ' + error.message, 'error');
          return;
        }
        const banco = (data || []).map(sorteioDeLinha);
        setBancoOk(true); setFalta(false);
        setHist(sorteioJunta(banco, sorteioLoad()));
      } catch (e) { if (vivo) setFalta(SORTEIO_ERRO_TABELA.test(e.message || '')); }
    })();
    return () => { vivo = false; };
  }, []);

  // Carrega os participantes manuais do banco (se falhar, segue só com o localStorage)
  React.useEffect(() => {
    let vivo = true;
    if (!sb) return;
    (async () => {
      try {
        const { data, error } = await sb.from('raffle_extras').select();
        if (!vivo) return;
        if (error) {
          if (SORTEIO_ERRO_EXTRAS.test(error.message || '')) setExtrasFalta(true);
          else showToast('Não consegui ler os participantes manuais: ' + error.message, 'error');
          return;
        }
        setExtrasOk(true); setExtrasFalta(false);
        setExtras([...(data || []), ...sorteioExtrasLoad().map(x => ({ ...x, _local: true }))]);
      } catch (e) { if (vivo) setExtrasFalta(SORTEIO_ERRO_EXTRAS.test(e.message || '')); }
    })();
    return () => { vivo = false; };
  }, []);

  const avisoExtras = () => showToast('Falta aplicar o SQL sql/raffle_extras.sql no Supabase — lista manual salva só neste navegador', 'error');
  const avisoFalta = () => showToast('Falta aplicar o SQL sql/raffles.sql no Supabase — histórico salvo só neste navegador', 'error');
  const soLocais = hist.filter(h => h._local);

  async function importar() {
    if (!bancoOk || !soLocais.length || importando) return;
    setImportando(true);
    try {
      const { error } = await sb.from('raffles').upsert(soLocais.map(sorteioParaLinha));
      if (error) { SORTEIO_ERRO_TABELA.test(error.message || '') ? (setFalta(true), setBancoOk(false), avisoFalta()) : showToast('Erro ao importar: ' + error.message, 'error'); return; }
      sorteioSave([]);
      try { localStorage.setItem(SORTEIO_LS_MIGRADO, new Date().toISOString()); } catch (e) { /* ok */ }
      setHist(h => h.map(x => ({ ...x, _local: false })));
      showToast(soLocais.length + ' sorteio(s) importado(s) para o banco ✓', 'success');
    } catch (e) { showToast('Erro ao importar: ' + e.message, 'error'); }
    finally { setImportando(false); }
  }

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

  // Manuais do mês, com sinalizações (duplicado do site, nome repetido, revisar)
  const manuais = React.useMemo(() => {
    const doMes = extras.filter(x => x.mes === mes);
    const siteNorm = parts.map(p => ({ p, n: sorteioNorm(p.name) }));
    const cont = {};
    doMes.forEach(x => { const n = sorteioNorm(x.nome); cont[n] = (cont[n] || 0) + 1; });
    return doMes.map(x => {
      const n = sorteioNorm(x.nome);
      const site = siteNorm.find(s => sorteioNomeBate(n, s.n));
      const dupSite = site ? site.p.name : '';
      const repetido = (cont[n] || 0) > 1;
      const revisar = sorteioParecePlaceholder(x.nome);
      const key = 'm:' + x.id;
      const entra = key in manSel ? !!manSel[key] : !(dupSite || revisar);
      return { ...x, key, dupSite, repetido, revisar, entra };
    });
  }, [extras, mes, parts, manSel]);
  const manuaisElig = manuais.filter(m => m.entra).map(m => ({ key: m.key, name: m.nome, code: '', phone: m.telefone || '', city: '', manual: true }));
  const elegiveis = [...parts.filter(p => !excl[p.key]), ...manuaisElig];
  const nMax = elegiveis.length;
  const totalCand = parts.length + manuais.length;
  const n = Math.max(1, Math.min(parseInt(qtd, 10) || 1, nMax || 1));

  function trocaMes(m) { setMes(m); setExcl({}); setManSel({}); setRes(null); setFase('idle'); }

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
        const reg = { id: Date.now(), mes, at: new Date().toISOString(), participantes: nMax, excluidos: totalCand - nMax,
          ganhadores: ganhadores.map(g => ({ name: g.name, code: g.code, city: g.city })) };
        sorteioSave([reg, ...sorteioLoad()]); // espelho local
        setHist(h => [{ ...reg, _local: true }, ...h.filter(x => x.id !== reg.id)]);
        if (sb && !falta) salvaBanco(reg);
        setRes({ mes, ganhadores, total: nMax }); setFase('pronto');
      }
    }, 70);
  }

  async function salvaBanco(reg) {
    try {
      const { error } = await sb.from('raffles').insert(sorteioParaLinha(reg));
      if (error) {
        if (SORTEIO_ERRO_TABELA.test(error.message || '')) { setFalta(true); setBancoOk(false); avisoFalta(); }
        else showToast('Sorteio feito, mas não salvou no banco: ' + error.message, 'error');
        return;
      }
      setBancoOk(true);
      setHist(h => h.map(x => x.id === reg.id ? { ...x, _local: false } : x));
    } catch (e) { showToast('Sorteio feito, mas não salvou no banco: ' + e.message, 'error'); }
  }

  function textoResultado(r) {
    return `Sorteio Vanguard Peptides - ${sorteioMesLabel(r.mes)}\n` + r.ganhadores.map((g, i) => `${r.ganhadores.length > 1 ? (i + 1) + 'º ' : 'Ganhador(a): '}${g.name} - ${g.code ? 'pedido ' + g.code : 'sem pedido no site'}`).join('\n') + `\n(${r.total} participantes)`;
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
    const msg = `🎉 *Parabéns, ${nome}!* Você foi o(a) sorteado(a) no sorteio de ${sorteioMesLabel(mesRef)} da Vanguard Peptides!\n\n${g.code ? `📋 *Pedido:* ${g.code}\n\n` : ''}Vamos combinar como entregar seu prêmio por aqui. 🙏`;
    window.open(`https://wa.me/${d}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 16 };
  const lbl = { fontFamily: "'Space Mono',monospace", fontSize: '0.6rem', color: 'var(--accent)', letterSpacing: '1.5px', marginBottom: 10 };
  const inp = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 10px', color: 'var(--text)', fontSize: '0.82rem', fontFamily: "'DM Sans',sans-serif" };
  const btn = { padding: '8px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Space Mono',monospace" };

  const selo = { display: 'inline-block', marginLeft: 6, padding: '1px 6px', borderRadius: 10, fontSize: '0.6rem', background: 'rgba(120,120,255,0.18)', color: 'var(--accent)', fontFamily: "'Space Mono',monospace" };
  const flag = { display: 'inline-block', marginLeft: 6, padding: '1px 6px', borderRadius: 10, fontSize: '0.6rem', background: 'rgba(255,170,0,0.15)', color: '#ffaa00', fontFamily: "'Space Mono',monospace" };
  const lidos = React.useMemo(() => sorteioParseLista(texto), [texto]);
  const locais = extras.filter(x => x._local);

  // grava novos manuais no banco; sem tabela, cai no localStorage
  async function gravaExtras(novos) {
    if (!novos.length || gravando) return false;
    setGravando(true);
    try {
      const rows = novos.map(x => ({ mes, nome: x.nome, obs: x.obs || null, telefone: x.telefone || null }));
      if (sb && extrasOk && !extrasFalta) {
        const { data, error } = await sb.from('raffle_extras').insert(rows);
        if (!error) { setExtras(l => [...l, ...(data || [])]); setRes(null); setFase('idle'); return true; }
        if (SORTEIO_ERRO_EXTRAS.test(error.message || '')) { setExtrasFalta(true); setExtrasOk(false); avisoExtras(); }
        else { showToast('Erro ao salvar participantes: ' + error.message, 'error'); return false; }
      }
      const novosLocais = rows.map((r, i) => ({ ...r, id: 'l' + Date.now() + '-' + i, _local: true }));
      sorteioExtrasSave([...sorteioExtrasLoad(), ...novosLocais.map(({ _local, ...r }) => r)]);
      setExtras(l => [...l, ...novosLocais]); setRes(null); setFase('idle');
      return true;
    } catch (e) { showToast('Erro ao salvar participantes: ' + e.message, 'error'); return false; }
    finally { setGravando(false); }
  }
  async function addUm() {
    const nome = sorteioLimpaNome(fNome);
    if (!nome) { showToast('Digite o nome.', 'error'); return; }
    const ok = await gravaExtras([{ nome: nome.slice(0, 80), obs: fObs.trim().slice(0, 200), telefone: fTel.replace(/\D/g, '').slice(0, 15) }]);
    if (ok) { setFNome(''); setFObs(''); setFTel(''); }
  }
  async function addLista() {
    if (!lidos.length) { showToast('Nenhum nome encontrado no texto.', 'error'); return; }
    const ok = await gravaExtras(lidos);
    if (ok) { setTexto(''); setColar(false); showToast(lidos.length + ' nome(s) adicionado(s) ✓', 'success'); }
  }
  async function removeExtra(x) {
    if (x._local) {
      sorteioExtrasSave(sorteioExtrasLoad().filter(y => String(y.id) !== String(x.id)));
    } else {
      try {
        const { error } = await sb.from('raffle_extras').delete().eq('id', x.id);
        if (error) { showToast('Erro ao remover: ' + error.message, 'error'); return; }
      } catch (e) { showToast('Erro ao remover: ' + e.message, 'error'); return; }
    }
    setExtras(l => l.filter(y => y.id !== x.id)); setRes(null); setFase('idle');
  }
  async function importarExtras() {
    if (!extrasOk || !locais.length || importando) return;
    setImportando(true);
    try {
      const { data, error } = await sb.from('raffle_extras').insert(locais.map(x => ({ mes: x.mes, nome: x.nome, obs: x.obs || null, telefone: x.telefone || null })));
      if (error) { SORTEIO_ERRO_EXTRAS.test(error.message || '') ? (setExtrasFalta(true), setExtrasOk(false), avisoExtras()) : showToast('Erro ao importar: ' + error.message, 'error'); return; }
      sorteioExtrasSave([]);
      setManSel({});
      setExtras(l => [...l.filter(x => !x._local), ...(data || [])]);
      showToast(locais.length + ' participante(s) manual(is) importado(s) para o banco ✓', 'success');
    } catch (e) { showToast('Erro ao importar: ' + e.message, 'error'); }
    finally { setImportando(false); }
  }

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
        <b style={{ color: 'var(--text)' }}>{nMax}</b> participante{nMax === 1 ? '' : 's'} concorrendo{totalCand !== nMax && <> ({totalCand - nMax} excluído{totalCand - nMax === 1 ? '' : 's'})</>}.
        {' '}Conta 1 chance por cliente; entram pedidos pagos, enviados ou entregues de {sorteioMesLabel(mes)}{manuaisElig.length > 0 && <> e {manuaisElig.length} participante{manuaisElig.length === 1 ? '' : 's'} {manuaisElig.length === 1 ? 'manual' : 'manuais'}</>}.
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
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: "'Space Mono',monospace" }}>{g.code ? 'Pedido ' + g.code : 'sem pedido no site'}{g.manual && ' · manual'}{g.city ? ' · ' + g.city : ''}</div>
              </div>
              {(g.code || g.phone) && <button onClick={() => whats(g, res.mes)} style={{ ...btn, background: 'rgba(37,211,102,0.12)', borderColor: 'rgba(37,211,102,0.4)', color: '#25d366' }}>💬 Falar no WhatsApp</button>}
            </div>
          ))}
          <div style={{ marginTop: 10 }}><button onClick={() => copiar(textoResultado(res))} style={btn}>📋 Copiar resultado</button></div>
        </>}
      </div>
    )}

    <div style={card}>
      <div style={lbl}>👥 PARTICIPANTES ({parts.length + manuais.length})</div>
      {parts.length === 0 && manuais.length === 0
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
              {manuais.map(m => (
                <tr key={m.key} style={{ opacity: m.entra ? 1 : 0.4 }}>
                  <td>{m.entra ? '✓' : '—'}</td>
                  <td>{m.nome} <span style={selo}>manual</span></td>
                  <td colSpan="3" style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>sem pedido no site (gerencie em Participantes manuais)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
      <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: 8 }}>Desmarque quem não deve concorrer (funcionário, teste). CPF, telefone e e-mail não aparecem aqui.</div>
    </div>

    <div style={card}>
      <div style={lbl}>✍️ PARTICIPANTES MANUAIS (SEM PEDIDO NO SITE) · {sorteioMesLabel(mes).toUpperCase()}</div>
      {extrasFalta && <div style={{ background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.4)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, fontSize: '0.75rem', color: 'var(--text)' }}>
        Falta aplicar o SQL <b>sql/raffle_extras.sql</b> no Supabase — lista manual salva só neste navegador.
      </div>}
      {extrasOk && locais.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 10, fontSize: '0.75rem', color: 'var(--muted)' }}>
        <span>{locais.length} participante{locais.length === 1 ? '' : 's'} manua{locais.length === 1 ? 'l' : 'is'} só neste navegador.</span>
        <button onClick={importarExtras} disabled={importando} style={btn}>{importando ? 'Importando...' : `Importar ${locais.length} para o banco`}</button>
      </div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end' }}>
        <input style={{ ...inp, flex: '1 1 150px' }} placeholder="Nome" aria-label="Nome" maxLength={80} value={fNome} onChange={e => setFNome(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addUm(); }} />
        <input style={{ ...inp, flex: '1 1 150px' }} placeholder="Observação (opcional)" aria-label="Observação" maxLength={200} value={fObs} onChange={e => setFObs(e.target.value)} />
        <input style={{ ...inp, flex: '1 1 130px' }} placeholder="Telefone (opcional, só p/ WhatsApp)" aria-label="Telefone" maxLength={20} value={fTel} onChange={e => setFTel(e.target.value)} />
        <button onClick={addUm} disabled={gravando || fase === 'girando'} style={btn}>+ Adicionar</button>
        <button onClick={() => setColar(c => !c)} style={btn}>📋 Colar lista</button>
      </div>
      {colar && <div style={{ marginTop: 10 }}>
        <textarea style={{ ...inp, width: '100%', minHeight: 120, boxSizing: 'border-box' }} aria-label="Lista de nomes" placeholder={'Um nome por linha. Aceita "1. Nome", "1) Nome" ou só o nome.\nLinhas vazias e cabeçalhos são ignorados; emojis e números saem do nome.'} value={texto} onChange={e => setTexto(e.target.value)} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 6, fontSize: '0.75rem', color: 'var(--muted)' }}>
          <span>{lidos.length} nome{lidos.length === 1 ? '' : 's'} lido{lidos.length === 1 ? '' : 's'} (serão adicionados em {sorteioMesLabel(mes)})</span>
          <button onClick={addLista} disabled={!lidos.length || gravando || fase === 'girando'} style={btn}>Adicionar {lidos.length || ''}</button>
        </div>
      </div>}
      {manuais.length === 0
        ? <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 12 }}>Nenhum participante manual em {sorteioMesLabel(mes)}.</div>
        : <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table className="admin-table" style={{ width: '100%' }}>
            <thead><tr><th style={{ width: 70 }}>Entra?</th><th>Nome</th><th>Observação / avisos</th><th style={{ width: 80 }}></th></tr></thead>
            <tbody>
              {manuais.map(m => (
                <tr key={m.key} style={{ opacity: m.entra ? 1 : 0.5 }}>
                  <td><input type="checkbox" aria-label={'Incluir ' + m.nome} checked={m.entra} disabled={fase === 'girando'} onChange={e => { setManSel(x => ({ ...x, [m.key]: e.target.checked })); setRes(null); setFase('idle'); }} style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }} /></td>
                  <td>{m.nome} <span style={selo}>manual</span>{m._local && extrasOk && <span style={flag}>só neste navegador</span>}</td>
                  <td style={{ fontSize: '0.72rem' }}>
                    {m.obs && <span style={{ color: 'var(--muted)' }}>{m.obs}</span>}
                    {m.dupSite && <span style={flag}>possível duplicado do site: já participa pelo site ({m.dupSite}){m.entra ? ' - incluído à força' : ' - marque para incluir mesmo assim'}</span>}
                    {m.repetido && <span style={flag}>nome repetido</span>}
                    {m.revisar && <span style={flag}>revisar{m.entra ? '' : ' - parece rótulo, não nome'}</span>}
                  </td>
                  <td><button onClick={() => removeExtra(m)} disabled={fase === 'girando'} style={{ ...btn, padding: '4px 8px' }} aria-label={'Remover ' + m.nome}>Remover</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
      <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: 8 }}>Entram no sorteio com 1 chance cada. Quem já participa pelo site (mesmo nome) fica de fora até você marcar. O telefone, se informado, só serve ao botão de WhatsApp e não aparece aqui nem no histórico.</div>
    </div>

    <div style={card}>
      <div style={lbl}>🗂️ SORTEIOS ANTERIORES</div>
      {falta && <div style={{ background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.4)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, fontSize: '0.75rem', color: 'var(--text)' }}>
        Falta aplicar o SQL <b>sql/raffles.sql</b> no Supabase — histórico salvo só neste navegador.
      </div>}
      {bancoOk && soLocais.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 10, fontSize: '0.75rem', color: 'var(--muted)' }}>
        <span>{soLocais.length} sorteio{soLocais.length === 1 ? '' : 's'} só neste navegador.</span>
        <button onClick={importar} disabled={importando} style={btn}>{importando ? 'Importando...' : `Importar ${soLocais.length} sorteio${soLocais.length === 1 ? '' : 's'} antigo${soLocais.length === 1 ? '' : 's'} para o banco`}</button>
      </div>}
      {hist.length === 0
        ? <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Nenhum sorteio realizado ainda. O histórico fica salvo {bancoOk ? 'no banco (Supabase)' : 'só neste navegador'}.</div>
        : hist.map(h => (
          <div key={h.id} style={{ padding: '10px 0', borderTop: '1px solid var(--border)', fontSize: '0.8rem' }}>
            <div style={{ color: 'var(--muted)', fontSize: '0.68rem', fontFamily: "'Space Mono',monospace" }}>
              {sorteioMesLabel(h.mes)} · sorteado em {new Date(h.at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} · {h.participantes} participantes
              {bancoOk && h._local && <span style={{ color: '#ffaa00' }}> · só neste navegador</span>}
            </div>
            <div>{h.ganhadores.map(g => `${g.name} (${g.code || 'sem pedido no site'})`).join(', ')}</div>
          </div>
        ))}
      {hist.length > 0 && <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: 8 }}>Histórico salvo {bancoOk ? 'no banco (Supabase)' : 'só neste navegador'}.</div>}
    </div>
  </>;
}
