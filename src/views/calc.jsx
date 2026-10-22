function formatDose(val, unit) {
  unit = unit || 'mcg';
  const rounded = parseFloat(val.toPrecision(10));
  if (unit === 'mcg') {
    if (rounded >= 1000) {
      const mg = rounded / 1000;
      return (Number.isInteger(mg) ? mg.toFixed(0) : mg.toFixed(2)) + ' mg';
    }
    return (Number.isInteger(rounded) ? rounded.toFixed(0) : parseFloat(rounded.toFixed(2))) + ' mcg';
  }
  return parseFloat(rounded.toFixed(4)) + ' ' + unit;
}


function SyringeViz({ uiRaw, syringeSize, dose, doseLabel }) {
  const W = 640, H = 130;
  const padL = 20, padR = 20;
  const rulerX = padL, rulerW = W - padL - padR;
  const rulerY = 38, rulerH = 48;   // taller ruler box
  const overLimit = uiRaw > syringeSize;
  const fillColor = overLimit ? '#e74c3c' : '#3b9eff';
  const pct   = Math.min(1, uiRaw / syringeSize);
  const fillW = rulerW * pct;

  // ticks — 3 levels
  const ticks = [];
  const stepMin = syringeSize <= 50 ? 1 : 2;
  const stepMid = syringeSize <= 50 ? 5 : 10;
  const stepMaj = syringeSize <= 50 ? 10 : 20;
  for (let t = 0; t <= syringeSize; t += stepMin) {
    const x     = rulerX + (t / syringeSize) * rulerW;
    const major = t % stepMaj === 0;
    const mid   = !major && t % stepMid === 0;
    ticks.push({ t, x, major, mid });
  }

  // tick heights (from bottom of ruler box upwards)
  const hMaj = rulerH,       yMaj = rulerY;
  const hMid = rulerH * 0.6, yMid = rulerY + rulerH * 0.4;
  const hMin = rulerH * 0.3, yMin = rulerY + rulerH * 0.7;

  return (
    <div style={{marginTop:20}}>
      {overLimit ? (
        <div style={{background:'rgba(231,76,60,0.1)',border:'1px solid rgba(231,76,60,0.4)',borderRadius:8,padding:'8px 14px',fontSize:'0.78rem',color:'#e74c3c',marginBottom:10}}>
          ⚠️ Dose excede a seringa de {syringeSize} UI — use uma seringa maior
        </div>
      ) : (
        <div style={{fontSize:'0.88rem',color:'var(--text)',marginBottom:10}}>
          Para ter uma dose de <strong style={{color:'var(--accent)'}}>{doseLabel}</strong> puxe a seringa até <strong style={{color:fillColor}}>{uiRaw.toFixed(1)} UI</strong>
        </div>
      )}
      <div style={{background:'#ffffff',borderRadius:10,padding:'14px 16px',boxShadow:'0 2px 12px rgba(0,0,0,0.18)'}}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block',overflow:'visible'}}>
          {/* White ruler body */}
          <rect x={rulerX} y={rulerY} width={rulerW} height={rulerH} rx={3} fill="#ffffff" stroke="#c8cdd2" strokeWidth={1.5} />

          {/* Blue fill */}
          <clipPath id="rc">
            <rect x={rulerX} y={rulerY} width={rulerW} height={rulerH} rx={3} />
          </clipPath>
          <rect x={rulerX} y={rulerY} width={Math.max(0, fillW)} height={rulerH} fill={fillColor} opacity={0.85} clipPath="url(#rc)" />

          {/* Plunger stopper rectangle */}
          <rect x={rulerX + fillW - 5} y={rulerY - 4} width={10} height={rulerH + 8} rx={3} fill={overLimit ? '#e74c3c' : '#1a6abf'} />

          {/* Ticks drawn ON TOP of fill */}
          {ticks.map(({t, x, major, mid}) => {
            if (major) return (
              <g key={t}>
                <line x1={x} y1={rulerY} x2={x} y2={rulerY + rulerH}
                      stroke="#222" strokeWidth={1.8} />
                <text x={x} y={rulerY + rulerH + 22} textAnchor="middle"
                      fill="#222" fontSize={16} fontFamily="Arial,sans-serif" fontWeight="700">{t}</text>
              </g>
            );
            if (mid) return (
              <line key={t} x1={x} y1={yMid} x2={x} y2={rulerY + rulerH}
                    stroke="#555" strokeWidth={1.4} />
            );
            return (
              <line key={t} x1={x} y1={yMin} x2={x} y2={rulerY + rulerH}
                    stroke="#999" strokeWidth={0.9} />
            );
          })}

          {/* Border on top of everything */}
          <rect x={rulerX} y={rulerY} width={rulerW} height={rulerH} rx={3} fill="none" stroke="#aab0b8" strokeWidth={1.5} />
        </svg>
      </div>
    </div>
  );
}

function CalcView() {
  const { useState: us, useRef: ur } = React;
  const [search, setSearch] = us('');
  const [dropOpen, setDropOpen] = us(false);
  const [selId, setSelId] = us(null);
  const [dose, setDose] = us(null);
  const [freq, setFreq] = us(null);
  const [vial, setVial] = us(null);
  const [bacMl, setBacMl] = us(2);
  const [manualDose, setManualDose] = us('');
  const [syringeSize, setSyringeSize] = us(100);
  const [manualVial, setManualVial] = us('');
  const wrapRef = ur(null);

  const selPep = selId ? CALC_PEP_DB[selId] : null;
  const db     = selId ? CALC_DOSES[selId] : null;

  const allPeps = Object.entries(CALC_PEP_DB);
  const filtered = search.trim().length > 0
    ? allPeps.filter(([id, p]) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.tags||[]).join(' ').toLowerCase().includes(search.toLowerCase()))
    : allPeps;

  function selectPep(id) {
    setSelId(id);
    setSearch('');
    setDropOpen(false);
    setDose(null);
    setFreq(null);
    setManualDose('');
    setManualVial('');
    const d = CALC_DOSES[id];
    if (d && !d.topical) {
      setFreq(d.freqs[d.dfi]);
      setVial(d.vials[0]);
    } else {
      setVial(null);
    }
  }

  function clearSel() {
    setSelId(null); setSearch(''); setDose(null); setFreq(null); setVial(null); setManualDose(''); setManualVial('');
  }

  // Detecta se o peptídeo usa escala mg (doses >= 1000 mcg)
  const isMgScale = db && db.doses && db.doses.every(d => d >= 500);

  // Formata mostrando mg + mcg quando valor é grande o suficiente
  function fmtDual(val) {
    if (!val && val !== 0) return '—';
    const unit = db?.unit || 'mcg';
    if (unit === 'mcg' && val >= 100) {
      const mg = val / 1000;
      const mgStr = (Number.isInteger(mg * 100) ? parseFloat(mg.toFixed(1)) : parseFloat(mg.toFixed(2))) + ' mg';
      const mcgStr = Math.round(val) + ' mcg';
      return mgStr + ' · ' + mcgStr;
    }
    return formatDose(val, unit);
  }

  // Results calc
  let results = null;
  let recon = null;
  if (dose && freq && !db?.topical) {
    const unit = db?.unit || 'mcg';
    const daily = dose * freq.t;
    results = {
      doseAppl: fmtDual(dose),
      freqLabel: freq.l,
      daily: fmtDual(daily),
      weekly: fmtDual(daily * 7),
      monthly: fmtDual(daily * 30),
    };
    if (vial) {
      const vialMcg = vial * 1000;
      const concMcgMl = vialMcg / (parseFloat(bacMl) || 2);
      const volMl = dose / concMcgMl;
      const volUl = volMl * 1000;
      const ui = volMl * 100;
      const daysPerVial = vialMcg / (dose * freq.t);
      recon = {
        conc: concMcgMl >= 1000 ? (concMcgMl/1000).toFixed(2)+' mg/mL' : concMcgMl.toFixed(0)+' mcg/mL',
        vol: volUl >= 1000 ? volMl.toFixed(3)+' mL' : volUl.toFixed(1)+' µL',
        ui: ui.toFixed(1)+' UI',
        uiRaw: ui,
        duration: daysPerVial >= 1 ? Math.round(daysPerVial)+' dias' : Math.round(daysPerVial*24)+' horas',
        barPct: Math.min(100, (daysPerVial/90)*100),
      };
    }
  }

  return (
    <div className="calc-body">
      {/* LEFT */}
      <div>
        {/* Peptide selector */}
        <div className="calc-card">
          <div className="calc-card-title">🔬 Peptídeo</div>
          <div className="calc-search-wrap" ref={wrapRef}>
            <input className="calc-input" placeholder="Buscar peptídeo..."
              value={search}
              onChange={e=>{ setSearch(e.target.value); setDropOpen(true); }}
              onFocus={()=>setDropOpen(true)}
            />
            {dropOpen && (
              <div className="calc-dropdown">
                {filtered.length === 0
                  ? <div className="calc-drop-item" style={{color:'var(--muted)'}}>Nenhum resultado</div>
                  : filtered.slice(0,14).map(([id, p]) => (
                    <div key={id} className="calc-drop-item" onMouseDown={()=>selectPep(id)}>
                      <span>{p.name}</span>
                      <em>{(p.tags||[])[0]||''}</em>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
          {selPep && (
            <div className="calc-chip-selected">
              <div>
                <div className="calc-chip-name">{selPep.name}</div>
                <div className="calc-chip-cat">{(selPep.tags||[]).join(' · ')}</div>
              </div>
              <button className="calc-chip-clear" onClick={clearSel}>×</button>
            </div>
          )}
        </div>

        {/* Dose */}
        {selId && db && !db.topical && (
          <div className="calc-card">
            <div className="calc-card-title">💉 Dose por Aplicação</div>
            <div className="calc-label">Doses mais comuns:</div>
            <div className="chips-grid">
              {db.doses.map(d => (
                <button key={d} className={`calc-chip-btn ${dose===d&&!manualDose?'active':''}`}
                  onClick={()=>{ setDose(d); setManualDose(''); }}>
                  {formatDose(d, db.unit)}
                </button>
              ))}
            </div>
            <div className="calc-manual-wrap">
              <input type="number" className="calc-manual-input" placeholder="Outra dose..."
                value={manualDose} min="0"
                onChange={e=>{ setManualDose(e.target.value); const v=parseFloat(e.target.value); if(!isNaN(v)&&v>0) setDose(isMgScale ? v * 1000 : v); }}
              />
              <div className="calc-manual-unit">{isMgScale ? 'mg' : (db.unit||'mcg')}</div>
            </div>
          </div>
        )}

        {/* Topical notice */}
        {selId && db && db.topical && (
          <div className="calc-topical-notice">
            🧴 <strong>Peptídeo tópico.</strong> Concentração típica: <strong>{db.conc}</strong>. Não há dose em mcg por aplicação — use na seção de reconstituição para calcular a concentração do seu veículo cosmético <em>({db.veh})</em>.
          </div>
        )}

        {/* Freq */}
        {selId && db && !db.topical && dose && (
          <div className="calc-card">
            <div className="calc-card-title">⏱️ Frequência</div>
            <div className="chips-grid">
              {db.freqs.map((f, i) => (
                <button key={i} className={`calc-chip-btn ${freq?.l===f.l?'active':''}`}
                  onClick={()=>setFreq(f)}>
                  {f.l}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div>
        {!results && (
          <div className="calc-card">
            <div className="calc-placeholder">
              <div className="calc-placeholder-icon">🧮</div>
              <div className="calc-placeholder-text">Selecione um peptídeo e configure a dose para ver os cálculos</div>
            </div>
          </div>
        )}

        {results && (
          <div className="calc-card">
            <div className="calc-card-title">📊 Resultado</div>

            <div className="calc-result-row">
              <span className="calc-result-label">Dose por aplicação</span>
              <span className="calc-result-value accent">{results.doseAppl}</span>
            </div>
            <div className="calc-result-row">
              <span className="calc-result-label">Frequência</span>
              <span className="calc-result-value">{results.freqLabel}</span>
            </div>
            <div className="calc-result-row">
              <span className="calc-result-label">Dose diária total</span>
              <span className="calc-result-value">{results.daily}</span>
            </div>
            <div className="calc-result-row">
              <span className="calc-result-label">Dose semanal total</span>
              <span className="calc-result-value">{results.weekly}</span>
            </div>
            <div className="calc-result-row">
              <span className="calc-result-label">Dose mensal (30 dias)</span>
              <span className="calc-result-value">{results.monthly}</span>
            </div>

            {/* Reconstitution */}
            <div className="calc-recon">
              <div className="calc-recon-title">💧 Reconstituição com Água Bacteriostática</div>

              <div className="calc-label">Tamanho do frasco:</div>
              <div className="chips-grid">
                {db.vials.map(v => (
                  <button key={v} className={`calc-chip-btn ${vial===v&&!manualVial?'active':''}`}
                    onClick={()=>{ setVial(v); setManualVial(''); }}>
                    {v} mg
                  </button>
                ))}
              </div>
              <div className="calc-manual-wrap" style={{marginBottom:12}}>
                <input type="number" className="calc-manual-input" placeholder="Outro tamanho..."
                  value={manualVial} min="0" step="0.5"
                  onChange={e=>{ setManualVial(e.target.value); const v=parseFloat(e.target.value); if(!isNaN(v)&&v>0) setVial(v); }}
                />
                <div className="calc-manual-unit">mg</div>
              </div>

              <div className="calc-bac-row">
                <span className="calc-bac-label">Volume de BAC water:</span>
                <input type="text" inputMode="decimal" className="calc-bac-input" value={bacMl}
                  onChange={e=>{ const v = e.target.value; if (/^\d*\.?\d*$/.test(v)) setBacMl(v); }}
                  onBlur={e=>{ const v = parseFloat(e.target.value); if (!v||v<0.1) setBacMl(2); else setBacMl(v); }} />
                <span className="calc-manual-unit">mL</span>
              </div>

              {recon && (
                <div className="calc-recon-result">
                  <div className="calc-recon-row">
                    <span className="calc-recon-key">Concentração</span>
                    <span className="calc-recon-val">{recon.conc}</span>
                  </div>
                  <div className="calc-recon-row">
                    <span className="calc-recon-key">Volume por dose</span>
                    <span className="calc-recon-val">{recon.vol}</span>
                  </div>
                  <div className="calc-recon-row">
                    <span className="calc-recon-key">Unidades na seringa (UI)</span>
                    <span className="calc-recon-val">{recon.ui}</span>
                  </div>
                  <div className="calc-recon-row" style={{paddingTop:8,borderTop:'1px solid rgba(255,255,255,0.06)',marginTop:4}}>
                    <span className="calc-recon-key">Duração do frasco</span>
                    <span className="calc-recon-val">{recon.duration}</span>
                  </div>
                  <div className="calc-duration-bar">
                    <div className="calc-duration-fill" style={{width: recon.barPct+'%'}}></div>
                  </div>

                  {/* Syringe Size Selector */}
                  <div style={{marginTop:18,paddingTop:14,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                    <div className="calc-label" style={{marginBottom:8}}>💉 Tamanho da seringa:</div>
                    <div className="chips-grid">
                      {[{v:30,l:'0,3 mL (30 UI)',s:'30 UI'},{v:50,l:'0,5 mL (50 UI)',s:'50 UI'},{v:100,l:'1,0 mL (100 UI)',s:'100 UI'}].map(s => (
                        <button key={s.v} className={`calc-chip-btn syringe-chip ${syringeSize===s.v?'active':''}`} onClick={()=>setSyringeSize(s.v)}>
                          <span className="syringe-chip-full">{s.l}</span>
                          <span className="syringe-chip-short">{s.s}</span>
                        </button>
                      ))}
                    </div>
                    <SyringeViz uiRaw={recon.uiRaw} syringeSize={syringeSize} doseLabel={results.doseAppl} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROTOCOL BLOCK */}
        {selId && PROTOCOLS[selId] && (
          <div className="calc-card" style={{marginTop:16}}>
            <div className="calc-protocol">
              <div className="calc-disclaimer">⚠️ As informações abaixo são de caráter exclusivamente educativo e não constituem prescrição médica, diagnóstico ou recomendação de uso. Consulte sempre um profissional de saúde qualificado antes de utilizar qualquer substância.</div>
              <div className="calc-protocol-title">Protocolos e Boas Práticas</div>
              <div className="calc-protocol-grid">
                <div className="calc-prot-item">
                  <div className="calc-prot-label">Dose Mínima</div>
                  <div className="calc-prot-val"><span>{PROTOCOLS[selId].doseMin}</span></div>
                </div>
                <div className="calc-prot-item">
                  <div className="calc-prot-label">Dose Máxima</div>
                  <div className="calc-prot-val"><span>{PROTOCOLS[selId].doseMax}</span></div>
                </div>
                <div className="calc-prot-item">
                  <div className="calc-prot-label">Frequência</div>
                  <div className="calc-prot-val">{PROTOCOLS[selId].freq}</div>
                </div>
                <div className="calc-prot-item">
                  <div className="calc-prot-label">Duração do Ciclo</div>
                  <div className="calc-prot-val">{PROTOCOLS[selId].ciclo}</div>
                </div>
              </div>
              <div className="calc-prot-item" style={{marginBottom:8}}>
                <div className="calc-prot-label">Como Iniciar</div>
                <div className="calc-prot-val" style={{marginTop:4}}>{PROTOCOLS[selId].inicio}</div>
              </div>
              <div className="calc-prot-note">💡 {PROTOCOLS[selId].nota}</div>

              {/* ALERTS BLOCK */}
              {ALERTS[selId] && (
                <div style={{marginTop:14}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.58rem",color:"var(--accent)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
                    <span style={{display:"inline-block",width:3,height:10,background:"rgba(255,120,80,0.8)",borderRadius:2}}></span>
                    Cuidados e Alertas
                  </div>

                  <div style={{marginBottom:10}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.58rem",color:"#9aaa88",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>🔬 Exames para Monitorar</div>
                    {ALERTS[selId].exames.map((e,i) => (
                      <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:4,fontSize:"0.78rem",color:"#a8bfc9"}}>
                        <span style={{color:"var(--accent)",marginTop:2,flexShrink:0}}>·</span>{e}
                      </div>
                    ))}
                  </div>

                  <div style={{marginBottom:10}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.58rem",color:"#9aaa88",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>🚫 Contraindicações</div>
                    {ALERTS[selId].contraindicacoes.map((c,i) => (
                      <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:4,fontSize:"0.78rem",color:"#a8bfc9"}}>
                        <span style={{color:"rgba(255,80,80,0.7)",marginTop:2,flexShrink:0}}>·</span>{c}
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.58rem",color:"#9aaa88",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>⚠️ Alertas de Uso</div>
                    {ALERTS[selId].alertas.map((a,i) => (
                      <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:4,fontSize:"0.78rem",color:"#a8bfc9"}}>
                        <span style={{color:"rgba(255,160,30,0.8)",marginTop:2,flexShrink:0}}>·</span>{a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Senha admin verificada server-side via Edge Function (hash nunca exposto no código)

