// @fragmento do App() — render admin: aba AVISOS. Antes: 05-preorders.part.jsx | depois: 07-financeiro.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
            {/* TAB: AVISOS */}
            {adminTab==="avisos" && <>
              <div className="notice-editor">
                <div className="notice-editor-title">Novo Aviso</div>
                <div className="notice-editor-row">
                  <select className="notice-type-select" value={noticeInput.type} onChange={e=>setNoticeInput(n=>({...n,type:e.target.value}))}>
                    <option value="warn">⚡ Atenção</option>
                    <option value="info">ℹ️ Info</option>
                    <option value="alert">🚨 Urgente</option>
                  </select>
                  <input className="notice-text-input" placeholder="Texto do aviso..." value={noticeInput.text} onChange={e=>setNoticeInput(n=>({...n,text:e.target.value}))} />
                  <button className="notice-add-btn" onClick={()=>{
                    if(!noticeInput.text.trim()) return;
                    addNotice(noticeInput);
                    setNoticeInput({type:'warn',text:''});
                    showToast('Aviso publicado ✓');
                  }}>Publicar</button>
                </div>
              </div>
              {notices.length === 0
                ? <div style={{textAlign:"center",color:"var(--muted)",padding:40,fontSize:"0.85rem"}}>Nenhum aviso publicado</div>
                : <div className="notice-list-admin">
                    {notices.map(n=>(
                      <div key={n.id} className="notice-admin-item">
                        <span>{n.type==='info'?'ℹ️':n.type==='warn'?'⚠️':n.type==='alert'?'🚨':'📌'}</span>
                        <span style={{flex:1}}>{n.text}</span>
                        <button className="notice-admin-remove" onClick={()=>removeNotice(n.id)}>✕ Remover</button>
                      </div>
                    ))}
                  </div>
              }
            </>}

