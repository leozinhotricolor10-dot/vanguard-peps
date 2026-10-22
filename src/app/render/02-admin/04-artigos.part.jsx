// @fragmento do App() — render admin: aba ARTIGOS. Antes: 03-produtos.part.jsx | depois: 05-preorders.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
            {adminTab==="artigos" && (()=>{
              const editingArt = artForm && artForm.id ? articles.find(a=>a.id===artForm.id) : null;
              const form = artForm || {};

              function saveArt() {
                if (!form.title?.trim()) { showToast("Título obrigatório", "error"); return; }
                if (editingArt) {
                  persistArticles(articles.map(a => a.id===editingArt.id ? {...a,...form} : a));
                  showToast("Artigo atualizado ✓");
                } else {
                  const id = 'art-' + Date.now() + '-' + Math.random().toString(36).slice(2,7);
                  const today = new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
                  persistArticles([{id, emoji:form.emoji||'📄', tag:form.tag||'Geral', title:form.title, subtitle:form.subtitle||'', date:today, relatedProductId:form.relatedProductId||'', body:form.body||''}, ...articles]);
                  showToast("Artigo publicado ✓");
                }
                setArtForm(null);
              }

              return <>
                <div className="admin-action-row" style={{marginBottom:16}}>
                  <button className="admin-action-btn" onClick={()=>setArtForm({emoji:'📄',tag:'',title:'',subtitle:'',body:'',relatedProductId:''})}>＋ Novo Artigo</button>
                </div>

                {artForm !== null && (
                  <div className="art-form">
                    <div className="art-form-title">{editingArt ? '✏️ Editar Artigo' : '＋ Novo Artigo'}</div>
                    <div className="art-form-group">
                      <label>Emoji</label>
                      <input placeholder="ex: ✨" value={form.emoji||''} onChange={e=>setArtForm(f=>({...f,emoji:e.target.value}))} style={{maxWidth:80}} />
                    </div>
                    <div className="art-form-group">
                      <label>Tag / Categoria</label>
                      <input placeholder="ex: Beleza & Pele" value={form.tag||''} onChange={e=>setArtForm(f=>({...f,tag:e.target.value}))} />
                    </div>
                    <div className="art-form-group">
                      <label>Título</label>
                      <input placeholder="Título do artigo" value={form.title||''} onChange={e=>setArtForm(f=>({...f,title:e.target.value}))} />
                    </div>
                    <div className="art-form-group">
                      <label>Subtítulo / Resumo</label>
                      <input placeholder="Breve descrição exibida no card" value={form.subtitle||''} onChange={e=>setArtForm(f=>({...f,subtitle:e.target.value}))} />
                    </div>
                    <div className="art-form-group">
                      <label>Produto relacionado (ID ou parte do nome)</label>
                      <input placeholder="ex: ghkcu ou tirzepatide" value={form.relatedProductId||''} onChange={e=>setArtForm(f=>({...f,relatedProductId:e.target.value}))} />
                    </div>
                    <div className="art-form-group">
                      <label>Conteúdo (HTML básico: &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;strong&gt;)</label>
                      <textarea placeholder="<h3>Título</h3><p>Parágrafo...</p>" value={form.body||''} onChange={e=>setArtForm(f=>({...f,body:e.target.value}))} style={{minHeight:200}} />
                    </div>
                    <div className="art-form-actions">
                      <button className="admin-action-btn" onClick={saveArt}>{editingArt ? 'Salvar alterações' : 'Publicar artigo'}</button>
                      <button className="admin-action-btn" style={{background:"none",border:"1px solid var(--border)",color:"var(--muted)"}} onClick={()=>setArtForm(null)}>Cancelar</button>
                    </div>
                  </div>
                )}

                {articles.length === 0
                  ? <div style={{textAlign:"center",color:"var(--muted)",padding:40,fontSize:"0.85rem"}}>Nenhum artigo ainda</div>
                  : articles.map(art => (
                    <div key={art.id} className="art-list-item">
                      <div className="art-list-info">
                        <span className="art-list-emoji">{art.emoji}</span>
                        <div>
                          <div className="art-list-title">{art.title}</div>
                          <div className="art-list-tag">{art.tag} · {art.date}</div>
                        </div>
                      </div>
                      <div className="art-list-actions">
                        <button className="admin-action-btn" style={{padding:"6px 12px",fontSize:"0.68rem"}} onClick={()=>setArtForm({...art})}>✏️ Editar</button>
                        <button className="admin-remove-btn" onClick={()=>{ if(window.confirm("Remover artigo?")) persistArticles(articles.filter(a=>a.id!==art.id)); }}>remover</button>
                      </div>
                    </div>
                  ))
                }

                <div style={{marginTop:10,textAlign:"right"}}>
                  <button style={{background:"none",border:"none",color:"var(--muted)",fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Space Mono',monospace"}}
                    onClick={()=>{ if(window.confirm("Restaurar artigos padrão?")){ persistArticles(DEFAULT_ARTICLES); showToast("Artigos restaurados", "info"); }}}>
                    ↺ Restaurar padrão
                  </button>
                </div>
              </>;
            })()}

