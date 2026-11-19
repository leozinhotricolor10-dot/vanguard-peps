// ── COTAÇÃO (admin, aba Pedidos) ─────────────────────────────────────────────
// O dono monta uma cotação (produtos/combos, quantidade, preço editável, desconto % ou R$, valor no PIX)
// e manda pelo WhatsApp (wa.me) ou copia a mensagem. Nada vai para o Supabase: as últimas 50 cotações
// enviadas/copiadas ficam só no navegador do admin (localStorage `vg-quotes`).
// Usado nos dois layouts do admin (botão "🧾 Gerar cotação" em 02-admin/01-pedidos.part.jsx;
// modal em 04-modais/08-cotacao.part.jsx).
// "✅ Cotação aceita" (no modal e no histórico) marca `acceptedAt` e chama onAccept(quote): o App abre o
// "＋ Pedido Manual" já com os itens; ao criar, o desconto manual faz o total bater com a cotação
// (openManualFromQuote / createManualOrder em src/app/logica/06-pedido-manual.part.jsx), e o código do
// pedido volta para a cotação (`orderCode`) via cotacaoMarcarPedido.
const COTACAO_LS = 'vg-quotes';
const COTACAO_MAX = 50;
function cotacaoLoad() {
  try { const v = JSON.parse(localStorage.getItem(COTACAO_LS) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}
function cotacaoSave(list) {
  try { localStorage.setItem(COTACAO_LS, JSON.stringify(list.slice(0, COTACAO_MAX))); } catch {}
}
// Número em texto (aceita "1.234,50", "1234.5", "1234,5") → número >= 0
function cotacaoNum(v) {
  if (typeof v === 'number') return isFinite(v) && v > 0 ? v : 0;
  let s = String(v || '').trim().replace(/[^\d.,]/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return isFinite(n) && n > 0 ? n : 0;
}
const cotacaoR2 = n => Math.round(n * 100) / 100;
// Liga a cotação ao pedido criado a partir dela (chamado pelo createManualOrder)
function cotacaoMarcarPedido(id, orderCode) {
  if (!id) return;
  const list = cotacaoLoad();
  if (!list.some(h => h.id === id)) return;
  cotacaoSave(list.map(h => h.id === id ? { ...h, acceptedAt: h.acceptedAt || new Date().toISOString(), orderCode } : h));
}
// Mesmo critério dos links wa.me do admin (55 + dígitos); com 10–11 dígitos (DDD + número) sempre põe o 55,
// para não confundir DDD 55 (RS) com o código do país. Devolve '' se não parece telefone.
function cotacaoWaPhone(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  if (d.length === 10 || d.length === 11) return '55' + d;
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) return d;
  return '';
}
function cotacaoCalc(lines, discVal, discMode, pixPct) {
  const subtotal = cotacaoR2(lines.reduce((s, l) => s + cotacaoNum(l.price) * (l.qty || 0), 0));
  const dv = cotacaoNum(discVal);
  const pct = discMode === '%' ? Math.min(dv, 100) : 0;
  const discount = cotacaoR2(Math.min(subtotal, discMode === '%' ? subtotal * pct / 100 : dv));
  const total = cotacaoR2(subtotal - discount);
  const pp = Math.min(cotacaoNum(pixPct), 100);
  const pix = cotacaoR2(total * (1 - pp / 100));
  return { subtotal, discount, pct, total, pix, pixPct: pp };
}
function cotacaoMensagem({ name, lines, calc, discMode, showPix }) {
  const nome = String(name || '').trim();
  const ativos = lines.filter(l => l.qty > 0);
  const temDesc = calc.discount > 0 && calc.subtotal > 0;
  const ratio = temDesc ? calc.total / calc.subtotal : 1;
  let acumulado = 0;
  const itens = ativos.map((l, i) => {
    const orig = cotacaoR2(cotacaoNum(l.price) * l.qty);
    if (!temDesc) return `• ${l.qty}x ${l.name} — ${nvFmt(orig)}`;
    // último item absorve o arredondamento para a soma bater com o total
    const comDesc = i === ativos.length - 1 ? cotacaoR2(calc.total - acumulado) : cotacaoR2(orig * ratio);
    acumulado = cotacaoR2(acumulado + comDesc);
    return `• ${l.qty}x ${l.name} — ~${nvFmt(orig)}~ *${nvFmt(comDesc)}*`;
  });
  const out = [`Olá${nome ? ' ' + nome : ''}! Segue sua cotação Vanguard Peptides:`, '', ...itens, ''];
  if (temDesc) {
    out.push(`Desconto: -${nvFmt(calc.discount)}${discMode === '%' ? ` (${String(calc.pct).replace('.', ',')}%)` : ''}`);
    out.push(`Total: ~${nvFmt(calc.subtotal)}~ *${nvFmt(calc.total)}*`);
  } else {
    out.push(`*Total: ${nvFmt(calc.total)}*`);
  }
  if (showPix && calc.pixPct > 0) out.push(`No PIX: ${nvFmt(calc.pix)}`);
  out.push('', 'Cotação válida por 48h. Qualquer dúvida é só chamar!');
  return out.join('\n');
}
async function cotacaoCopiar(text) {
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; } } catch {}
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '-1000px';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (ok) return true;
  } catch {}
  try { window.prompt('Copie a mensagem:', text); } catch {}
  return false;
}

function CotacaoModal({ products, bundles, effectivePrice, showToast, onClose, onAccept }) {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [lines, setLines] = React.useState([]);
  const [discVal, setDiscVal] = React.useState('');
  const [discMode, setDiscMode] = React.useState('%');
  const [showPix, setShowPix] = React.useState(true);
  const [pixPct, setPixPct] = React.useState('10');
  const [msgEdit, setMsgEdit] = React.useState(null); // null = mensagem automática
  const [hist, setHist] = React.useState(cotacaoLoad);
  const [showHist, setShowHist] = React.useState(false);

  const prodList = (products || []).slice().sort((a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR'));
  const comboList = (bundles || []).filter(b => b.active !== false && b.items.every(id => (products || []).some(p => p.id === id)));
  const comboName = b => `Combo ${b.name} (${b.items.map(id => { const p = products.find(x => x.id === id); return p ? p.name : id; }).join(' + ')})`;

  const calc = cotacaoCalc(lines, discVal, discMode, pixPct);
  const autoMsg = cotacaoMensagem({ name, lines, calc, discMode, showPix });
  const msg = msgEdit == null ? autoMsg : msgEdit;
  const wa = cotacaoWaPhone(phone);
  const temItens = lines.some(l => l.qty > 0);

  function addItem(val) {
    if (!val) return;
    const [kind, id] = [val.slice(0, 2), val.slice(2)];
    const key = kind + id;
    setLines(ls => {
      if (ls.some(l => l.key === key)) return ls.map(l => l.key === key ? { ...l, qty: l.qty + 1 } : l);
      if (kind === 'p:') {
        const p = products.find(x => x.id === id); if (!p) return ls;
        return [...ls, { key, kind: 'p', id, name: p.name, qty: 1, price: String(effectivePrice(p) || 0).replace('.', ',') }];
      }
      const b = comboList.find(x => x.id === id); if (!b) return ls;
      return [...ls, { key, kind: 'b', id, name: comboName(b), qty: 1, price: String(b.price).replace('.', ',') }];
    });
  }
  const setLine = (key, patch) => setLines(ls => ls.map(l => l.key === key ? { ...l, ...patch } : l));
  const delLine = key => setLines(ls => ls.filter(l => l.key !== key));

  function registrar(extra) {
    const q = { id: Date.now(), at: new Date().toISOString(), name: name.trim(), phone: phone.trim(), lines, discVal, discMode, showPix, pixPct, total: calc.total, ...(extra || {}) };
    const next = [q, ...hist.filter(h => h.id !== q.id)].slice(0, COTACAO_MAX);
    setHist(next); cotacaoSave(next);
    return q;
  }
  // Cotação aceita: marca no histórico e abre o pedido manual com os itens (o App cuida do resto)
  function aceitar(h) {
    if (!onAccept) return;
    const q = h || registrar();
    const at = new Date().toISOString();
    const next = cotacaoLoad().map(x => x.id === q.id ? { ...x, acceptedAt: at } : x);
    setHist(next); cotacaoSave(next);
    const c = cotacaoCalc(q.lines || [], q.discVal, q.discMode, q.pixPct);
    onAccept({ id: q.id, name: q.name || '', phone: q.phone || '', lines: (q.lines || []).filter(l => l.qty > 0), total: c.total, pix: q.showPix !== false && c.pixPct > 0 ? c.pix : c.total });
  }
  function enviar() {
    if (!wa || !temItens) return;
    registrar();
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank');
  }
  async function copiar() {
    if (!temItens) return;
    const ok = await cotacaoCopiar(msg);
    registrar();
    if (ok) showToast('Mensagem copiada ✓', 'success');
  }
  function reabrir(h) {
    setName(h.name || ''); setPhone(h.phone || '');
    setLines(Array.isArray(h.lines) ? h.lines.map(l => ({ ...l })) : []);
    setDiscVal(h.discVal || ''); setDiscMode(h.discMode === 'R$' ? 'R$' : '%');
    setShowPix(h.showPix !== false); setPixPct(h.pixPct != null ? String(h.pixPct) : '10');
    setMsgEdit(null); setShowHist(false);
  }
  function apagarHist(id) {
    const next = hist.filter(h => h.id !== id);
    setHist(next); cotacaoSave(next);
  }
  function limpar() {
    if (temItens && !window.confirm('Limpar a cotação atual?')) return;
    setName(''); setPhone(''); setLines([]); setDiscVal(''); setMsgEdit(null);
  }
  function fechar() {
    if (temItens && !window.confirm('Fechar a cotação? O que não foi enviado/copiado se perde.')) return;
    onClose();
  }

  const mono = "'Space Mono',monospace";
  const btn = { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', cursor: 'pointer', fontFamily: mono, fontSize: '0.72rem' };
  const qBtn = { ...btn, width: 34, height: 34, fontSize: '1rem', padding: 0, flexShrink: 0 };
  const inputSm = { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '7px 9px', fontSize: '0.85rem', outline: 'none', minWidth: 0 };
  const row = { display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: '0.82rem', marginBottom: 4 };

  return (
    <div className="modal-overlay">
      <div className="modal cotacao-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
          <span style={{ fontFamily: mono, fontSize: '0.62rem', color: 'var(--accent)', letterSpacing: '1.5px' }}>🧾 GERAR COTAÇÃO</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ ...btn, padding: '6px 10px' }} onClick={() => setShowHist(s => !s)}>{showHist ? '← Voltar' : `🕘 Histórico (${hist.length})`}</button>
            <button style={{ ...btn, padding: '6px 10px' }} onClick={fechar} aria-label="Fechar">✕</button>
          </div>
        </div>

        {showHist ? (
          <div>
            {hist.length === 0 && <div style={{ color: 'var(--muted)', fontSize: '0.8rem', padding: '20px 0', textAlign: 'center' }}>Nenhuma cotação enviada ou copiada ainda.</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {hist.map(h => (
                <div key={h.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name || 'Sem nome'}{h.phone ? <span style={{ color: 'var(--muted)', fontWeight: 400 }}> · {h.phone}</span> : null}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>
                      {new Date(h.at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })} · {(h.lines || []).reduce((s, l) => s + (l.qty || 0), 0)} item(s){cotacaoNum(h.discVal) > 0 ? ` · desc. ${h.discMode === '%' ? h.discVal + '%' : 'R$ ' + h.discVal}` : ''}
                    </div>
                    {h.acceptedAt && <div style={{ color: '#25d366', fontSize: '0.68rem', fontFamily: mono, marginTop: 2 }}>✅ Aceita {new Date(h.acceptedAt).toLocaleDateString('pt-BR')}{h.orderCode ? ` · pedido ${h.orderCode}` : ''}</div>}
                  </div>
                  <span style={{ fontFamily: mono, fontSize: '0.8rem', color: 'var(--accent)' }}>{nvFmt(h.total)}</span>
                  <button style={{ ...btn, padding: '7px 12px', borderColor: 'rgba(0,229,195,0.5)', color: 'var(--accent)' }} onClick={() => reabrir(h)}>Reabrir</button>
                  {onAccept && <button style={{ ...btn, padding: '7px 12px', borderColor: 'rgba(37,211,102,0.5)', color: '#25d366' }} onClick={() => aceitar(h)} title="Abrir pedido manual com estes itens e valores">✅ Cotação aceita</button>}
                  <button style={{ ...btn, padding: '7px 10px', color: '#ff5050' }} onClick={() => apagarHist(h.id)} aria-label="Apagar do histórico">✕</button>
                </div>
              ))}
            </div>
          </div>
        ) : <>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label className="modal-label">Nome (opcional)</label>
              <input className="modal-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: João" style={{ marginBottom: 12 }} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label className="modal-label">WhatsApp com DDD</label>
              <input className="modal-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" inputMode="tel" style={{ marginBottom: phone && !wa ? 4 : 12 }} />
              {phone && !wa && <div style={{ color: '#ffaa00', fontSize: '0.68rem', marginBottom: 10 }}>Telefone incompleto (DDD + número)</div>}
            </div>
          </div>

          <label className="modal-label">Produtos</label>
          <select className="modal-input" value="" onChange={e => addItem(e.target.value)} style={{ marginBottom: 10 }}>
            <option value="">＋ Adicionar produto ou combo…</option>
            <optgroup label="Produtos">
              {prodList.map(p => <option key={p.id} value={'p:' + p.id}>{p.name} — {nvFmt(effectivePrice(p))}</option>)}
            </optgroup>
            {comboList.length > 0 && <optgroup label="Combos">
              {comboList.map(b => <option key={b.id} value={'b:' + b.id}>{b.name} — {nvFmt(b.price)}</option>)}
            </optgroup>}
          </select>

          {lines.length === 0 && <div style={{ color: 'var(--muted)', fontSize: '0.78rem', margin: '4px 0 14px' }}>Nenhum item ainda.</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {lines.map(l => (
              <div key={l.key} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.3 }}>{l.name}</span>
                  <button style={{ ...btn, padding: '2px 8px', color: '#ff5050', flexShrink: 0 }} onClick={() => delLine(l.key)} aria-label="Remover item">✕</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button style={qBtn} onClick={() => setLine(l.key, { qty: Math.max(1, l.qty - 1) })} aria-label="Menos">−</button>
                    <span style={{ fontFamily: mono, minWidth: 26, textAlign: 'center' }}>{l.qty}</span>
                    <button style={qBtn} onClick={() => setLine(l.key, { qty: l.qty + 1 })} aria-label="Mais">+</button>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--muted)', flex: '1 1 120px' }}>
                    R$ un.
                    <input value={l.price} onChange={e => setLine(l.key, { price: e.target.value })} inputMode="decimal" style={{ ...inputSm, width: '100%', maxWidth: 110 }} />
                  </label>
                  <span style={{ fontFamily: mono, fontSize: '0.8rem', marginLeft: 'auto' }}>{nvFmt(cotacaoNum(l.price) * l.qty)}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12 }}>
            <div style={{ flex: '1 1 200px' }}>
              <label className="modal-label">Desconto</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input value={discVal} onChange={e => setDiscVal(e.target.value)} inputMode="decimal" placeholder="sem desconto" style={{ ...inputSm, flex: 1 }} />
                <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  {['%', 'R$'].map(m => (
                    <button key={m} onClick={() => setDiscMode(m)} style={{ padding: '0 12px', border: 'none', cursor: 'pointer', fontFamily: mono, fontWeight: 700, fontSize: '0.75rem', background: discMode === m ? 'var(--accent)' : 'transparent', color: discMode === m ? '#000' : 'var(--muted)' }}>{m}</button>
                  ))}
                </div>
              </div>
            </div>
            <label style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text)', minHeight: 36 }}>
              <input type="checkbox" checked={showPix} onChange={e => setShowPix(e.target.checked)} />
              Mostrar valor no PIX com
              <input value={pixPct} onChange={e => setPixPct(e.target.value)} inputMode="decimal" disabled={!showPix} style={{ ...inputSm, width: 46, padding: '5px 6px', textAlign: 'center' }} />% off
            </label>
          </div>

          <div style={{ background: 'rgba(0,229,195,0.04)', border: '1px solid rgba(0,229,195,0.15)', borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
            <div style={row}><span style={{ color: 'var(--muted)' }}>Subtotal</span><span style={{ fontFamily: mono }}>{nvFmt(calc.subtotal)}</span></div>
            {calc.discount > 0 && <div style={row}><span style={{ color: 'var(--muted)' }}>Desconto{discMode === '%' ? ` (${String(calc.pct).replace('.', ',')}%)` : ''}</span><span style={{ fontFamily: mono, color: '#ff8080' }}>−{nvFmt(calc.discount)}</span></div>}
            <div style={{ ...row, fontWeight: 700, fontSize: '0.95rem' }}><span>Total</span><span style={{ fontFamily: mono, color: 'var(--accent)' }}>{nvFmt(calc.total)}</span></div>
            {showPix && calc.pixPct > 0 && <div style={{ ...row, marginBottom: 0 }}><span style={{ color: 'var(--muted)' }}>No PIX (−{String(calc.pixPct).replace('.', ',')}%)</span><span style={{ fontFamily: mono }}>{nvFmt(calc.pix)}</span></div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <label className="modal-label" style={{ marginBottom: 6 }}>Mensagem {msgEdit != null && <span style={{ color: '#ffaa00' }}>(editada)</span>}</label>
            {msgEdit != null && <button style={{ ...btn, padding: '3px 8px', fontSize: '0.62rem', marginBottom: 6 }} onClick={() => setMsgEdit(null)}>↺ Refazer automática</button>}
          </div>
          <textarea className="modal-input" value={msg} onChange={e => setMsgEdit(e.target.value)} rows={10} style={{ resize: 'vertical', fontSize: '0.8rem', lineHeight: 1.45, whiteSpace: 'pre-wrap', marginBottom: 12 }} />
          {msgEdit != null && <div style={{ color: 'var(--muted)', fontSize: '0.66rem', marginTop: -8, marginBottom: 10 }}>Mensagem editada à mão: mudar itens ou valores não atualiza o texto. Toque em "Refazer automática" para gerar de novo.</div>}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={enviar} disabled={!wa || !temItens} title={!wa ? 'Informe o WhatsApp com DDD' : ''} style={{ flex: '1 1 180px', padding: '12px', borderRadius: 10, border: '1px solid rgba(37,211,102,0.5)', background: wa && temItens ? 'rgba(37,211,102,0.15)' : 'rgba(255,255,255,0.03)', color: wa && temItens ? '#25d366' : 'var(--muted)', fontWeight: 700, cursor: wa && temItens ? 'pointer' : 'default', fontFamily: mono, fontSize: '0.78rem' }}>💬 Enviar no WhatsApp</button>
            <button onClick={copiar} disabled={!temItens} style={{ flex: '1 1 140px', padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)', color: temItens ? 'var(--text)' : 'var(--muted)', fontWeight: 700, cursor: temItens ? 'pointer' : 'default', fontFamily: mono, fontSize: '0.78rem' }}>📋 Copiar mensagem</button>
            <button onClick={limpar} style={{ ...btn, padding: '12px 14px' }}>Limpar</button>
          </div>
          {onAccept && <button onClick={() => aceitar()} disabled={!temItens} title="Abrir pedido manual com estes itens e valores" style={{ width: '100%', marginTop: 8, padding: '12px', borderRadius: 10, border: '1px solid rgba(0,229,195,0.5)', background: temItens ? 'rgba(0,229,195,0.1)' : 'rgba(255,255,255,0.03)', color: temItens ? 'var(--accent)' : 'var(--muted)', fontWeight: 700, cursor: temItens ? 'pointer' : 'default', fontFamily: mono, fontSize: '0.78rem' }}>✅ Cotação aceita → criar pedido</button>}
        </>}
      </div>
    </div>
  );
}
