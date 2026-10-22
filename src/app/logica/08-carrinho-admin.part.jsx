// @fragmento do App() — lógica 8/8: carrinho, combos/packs, login admin, totais, helpers do admin novo (nva*). Antes: 07-precos-pontos-preorders.part.jsx | depois: render/00-casca-portal-manual.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
  // Cart for current user
  const myOrders = useMemo(() => orders.filter(o => !o._supabase && (o.buyerName || '').toLowerCase() === myName.toLowerCase()), [orders, myName]);
  const myTotal  = useMemo(() => myOrders.reduce((s, o) => { const p = products.find(x => x.id === o.peptideId); const unitPrice = o._packPrice !== undefined ? o._packPrice : effectivePrice(p); return s + (o.qty||0) * unitPrice; }, 0), [myOrders, productPromo]);
  const cartCount = myOrders.reduce((s, o) => s + (o.qty || 0), 0);
  // Desconto de combo só no /novo (o site antigo não mostra combos)
  const bundleInfo = useMemo(() => IS_NOVO ? calcBundleDiscount(cartBundles, myOrders, products, effectivePrice, bundles) : { total: 0, applied: [] }, [cartBundles, myOrders, products, productPromo, bundles]);
  React.useEffect(() => {
    // Combo cujo item saiu do carrinho deixa de valer (não volta sozinho)
    if (IS_NOVO && bundleInfo.applied.length !== cartBundles.length) setCartBundles(bundleInfo.applied.map(b => b.id));
  }, [bundleInfo]);

  // Adiciona 1 de cada item do combo numa única gravação do carrinho
  async function addBundleToCart(bundle) {
    let name = myName.trim();
    if (!name) { name = (checkout.nomeCompleto || '').trim() || 'Cliente'; saveName(name); }
    const items = bundle.items.map(id => products.find(p => p.id === id));
    if (items.some(p => !p)) { showToast('Combo indisponível no momento', 'error'); return; }
    const mine = o => !o._supabase && !o._packId && (o.buyerName || '').toLowerCase() === name.toLowerCase();
    for (const p of items) {
      const avail = availableStock(p.id);
      if (avail !== null && avail <= 0) { showToast(`${p.name} esgotado — combo indisponível`, 'error'); return; }
    }
    let newStock = { ...stock };
    const done = [];
    for (const p of items) {
      if (sb && stock[p.id] != null) {
        const { data: q, error } = await sb.rpc('decrement_stock', { p_product_id: p.id, p_qty: 1 });
        if (error || q === -1) {
          // devolve o que já foi reservado deste combo
          for (const d of done) { const { data: back } = await sb.rpc('increment_stock', { p_product_id: d, p_qty: 1 }); if (back != null) newStock[d] = back; }
          localStorage.setItem('vg-stock', JSON.stringify(newStock)); setStock(newStock);
          showToast(`Estoque insuficiente de ${p.name} 😅`, 'error'); return;
        }
        newStock[p.id] = q; done.push(p.id);
      }
    }
    if (done.length) { localStorage.setItem('vg-stock', JSON.stringify(newStock)); setStock(newStock); }
    let next = [...orders];
    const _now = new Date(); const _pad = n => String(n).padStart(2, '0');
    items.forEach((p, i) => {
      const ex = next.find(o => mine(o) && o.peptideId === p.id);
      if (ex) next = next.map(o => o === ex ? { ...o, qty: (o.qty || 0) + 1 } : o);
      else next.push({ id: `${_now.getFullYear()}${_pad(_now.getMonth() + 1)}${_pad(_now.getDate())}${_pad(_now.getHours())}${_pad(_now.getMinutes())}${_pad(_now.getSeconds())}_${Math.random().toString(36).slice(2, 6)}${i}`, peptideId: p.id, buyerName: name, qty: 1, createdAt: _now.toISOString() });
    });
    persistOrders(next);
    setCartBundles([...cartBundles, bundle.id]);
    showToast(`Combo "${bundle.name}" adicionado ✓`);
  }

  function openModal(peptide) {
    setModal({ peptide });
    setFormName(myName);
    setFormQty(1);
  }

  async function addPackToCart(product, pack) {
    const name = myName.trim();
    if (!name) { showToast('Informe seu nome primeiro', 'error'); return; }
    const existing = orders.find(o => !o._supabase && o.peptideId === product.id && (o.buyerName||'').toLowerCase() === name.toLowerCase());
    if (existing) { showToast('Remova o produto do carrinho antes de adicionar um pack', 'error'); return; }
    const avail = availableStock(product.id);
    if (avail !== null && avail >= 0 && avail < pack.qty) { showToast(`Estoque insuficiente para este pack (disponível: ${avail})`, 'error'); return; }
    const packUnitPrice = Math.round(effectivePrice(product) * (1 - pack.discount / 100));
    const _now = new Date(); const _pad = n=>String(n).padStart(2,'0'); const _rand = Math.random().toString(36).slice(2,6);
    const newOrder = { id: `${_now.getFullYear()}${_pad(_now.getMonth()+1)}${_pad(_now.getDate())}${_pad(_now.getHours())}${_pad(_now.getMinutes())}${_pad(_now.getSeconds())}_${_rand}`, peptideId: product.id, buyerName: name, qty: pack.qty, createdAt: new Date().toISOString(), _packId: pack.id, _packName: pack.name, _packPrice: packUnitPrice };
    if (sb && stock[product.id] != null) {
      const { data: newQty, error } = await sb.rpc('decrement_stock', { p_product_id: product.id, p_qty: pack.qty });
      if (error || newQty === -1) { showToast('Estoque insuficiente para este pack 😅', 'error'); return; }
      const newStock = { ...stock, [product.id]: newQty };
      localStorage.setItem('vg-stock', JSON.stringify(newStock));
      setStock(newStock);
    }
    persistOrders([...orders, newOrder]);
    saveName(name);
    showToast(`Pack "${pack.name}" adicionado ao carrinho ✓`, 'success');
  }

  // Novo layout: adiciona 1 unidade direto, sem o modal de nome/quantidade
  async function quickAdd(product, qty = 1) {
    let name = myName.trim();
    if (!name) { name = (checkout.nomeCompleto || '').trim() || 'Cliente'; saveName(name); }
    const avail = availableStock(product.id);
    if (avail === 0) { showToast('Produto esgotado — use Reservar', 'error'); return; }
    const existing = orders.find(o => !o._supabase && !o._packId && o.peptideId === product.id && (o.buyerName || '').toLowerCase() === name.toLowerCase());
    if (existing) { await updateQtyInCart(existing.id, qty); return; }
    if (avail !== null && avail < qty) { showToast(`Estoque insuficiente — apenas ${avail} disponível(is)`, 'error'); return; }
    if (sb && stock[product.id] != null) {
      const { data: newQty, error } = await sb.rpc('decrement_stock', { p_product_id: product.id, p_qty: qty });
      if (error || newQty === -1) { showToast('Estoque insuficiente — outro cliente acabou de reservar 😅', 'error'); return; }
      const newStock = { ...stock, [product.id]: newQty };
      localStorage.setItem('vg-stock', JSON.stringify(newStock));
      setStock(newStock);
    }
    const _now = new Date(); const _pad = n => String(n).padStart(2, '0'); const _rand = Math.random().toString(36).slice(2, 6);
    const id = `${_now.getFullYear()}${_pad(_now.getMonth() + 1)}${_pad(_now.getDate())}${_pad(_now.getHours())}${_pad(_now.getMinutes())}${_pad(_now.getSeconds())}_${_rand}`;
    persistOrders([...orders, { id, peptideId: product.id, buyerName: name, qty, createdAt: _now.toISOString() }]);
    showToast(`${product.name} adicionado ✓`);
  }

  function versionTap() {
    const now = Date.now();
    const taps = (window.__vtaps || []).filter(t => now - t < 2000);
    taps.push(now);
    window.__vtaps = taps;
    if (taps.length >= 5) { window.__vtaps = []; adminUnlocked ? setView('admin') : handleAdminUnlock(); }
  }

  async function handleAddToCart() {
    const name = formName.trim();
    if (!name || formQty < 1) return;
    const avail = availableStock(modal.peptide.id);
    const _now = new Date(); const _pad = n=>String(n).padStart(2,'0'); const _rand = Math.random().toString(36).slice(2,6);
    const _orderId = `${_now.getFullYear()}${_pad(_now.getMonth()+1)}${_pad(_now.getDate())}${_pad(_now.getHours())}${_pad(_now.getMinutes())}${_pad(_now.getSeconds())}_${_rand}`;

    if (avail === 0) { showToast('Produto esgotado — use o botão Reservar', 'error'); setModal(null); return; }

    const existing = orders.find(o => !o._supabase && o.peptideId === modal.peptide.id && (o.buyerName || '').toLowerCase() === name.toLowerCase());
    const alreadyInCart = existing ? existing.qty : 0;
    if (avail > 0 && (alreadyInCart + formQty) > avail) {
      showToast(`Estoque insuficiente — apenas ${avail - alreadyInCart} unidade(s) disponível(is)`, 'error');
      return;
    }
    let newOrders;
    if (existing) {
      newOrders = orders.map(o => o === existing ? { ...o, qty: (o.qty || 0) + formQty } : o);
      showToast(`${modal.peptide.name} atualizado no carrinho ✓`);
    } else {
      newOrders = [...orders, { id: _orderId, peptideId: modal.peptide.id, buyerName: name, qty: formQty, createdAt: new Date().toISOString() }];
      showToast(`${modal.peptide.name} adicionado ao carrinho ✓`);
    }
    saveName(name);

    // Decremento atômico via Supabase RPC
    if (sb && stock[modal.peptide.id] != null) {
      const { data: newQty, error } = await sb.rpc('decrement_stock', { p_product_id: modal.peptide.id, p_qty: formQty });
      if (error || newQty === -1) { showToast('Estoque insuficiente — outro cliente acabou de reservar 😅', 'error'); return; }
      const newStock = { ...stock, [modal.peptide.id]: newQty };
      localStorage.setItem('vg-stock', JSON.stringify(newStock));
      setStock(newStock);
    } else {
      const newStock = { ...stock };
      if (newStock[modal.peptide.id] != null) newStock[modal.peptide.id] = Math.max(0, newStock[modal.peptide.id] - formQty);
      saveStock(newStock); setStock(newStock);
    }

    persistOrders(newOrders);
    setModal(null);
  }

  async function updateQtyInCart(orderId, delta) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const newQty = order.qty + delta;
    if (delta > 0) {
      const avail = availableStock(order.peptideId);
      if (avail <= 0) {
        showToast(`Estoque esgotado para este produto`, 'error');
        return;
      }
    }
    if (newQty <= 0) {
      // Devolver ao estoque via RPC
      if (sb && stock[order.peptideId] != null) {
        const { data: newQty2, error: incErr } = await sb.rpc('increment_stock', { p_product_id: order.peptideId, p_qty: order.qty });
        if (incErr) {
          console.warn('[Supabase] increment_stock error:', incErr.message);
        } else if (newQty2 != null) {
          const newStock = { ...stock, [order.peptideId]: newQty2 };
          localStorage.setItem('vg-stock', JSON.stringify(newStock));
          setStock(newStock);
        }
      } else {
        const newStock = { ...stock };
        if (newStock[order.peptideId] != null) newStock[order.peptideId] += order.qty;
        saveStock(newStock);
        setStock(newStock);
      }
      persistOrders(orders.filter(o => o.id !== orderId));
      showToast("Item removido do carrinho", "info");
    } else {
      if (sb && stock[order.peptideId] != null) {
        if (delta > 0) {
          // Adicionar unidade: decrementa estoque no banco
          const { data: newQty2, error } = await sb.rpc('decrement_stock', {
            p_product_id: order.peptideId, p_qty: delta
          });
          if (error || newQty2 === -1) {
            showToast('Estoque insuficiente — outro cliente acabou de reservar 😅', 'error');
            return;
          }
          const newStock = { ...stock, [order.peptideId]: newQty2 };
          localStorage.setItem('vg-stock', JSON.stringify(newStock));
          setStock(newStock);
        } else {
          // Reduzir unidade: devolve ao estoque no banco
          const { data: newQty2, error: incErr2 } = await sb.rpc('increment_stock', { p_product_id: order.peptideId, p_qty: Math.abs(delta) });
          if (incErr2) {
            console.warn('[Supabase] increment_stock error:', incErr2.message);
          } else if (newQty2 != null) {
            const newStock = { ...stock, [order.peptideId]: newQty2 };
            localStorage.setItem('vg-stock', JSON.stringify(newStock));
            setStock(newStock);
          }
        }
      } else {
        const newStock = { ...stock };
        if (newStock[order.peptideId] != null) newStock[order.peptideId] = Math.max(0, newStock[order.peptideId] - delta);
        saveStock(newStock);
        setStock(newStock);
      }
      persistOrders(orders.map(o => o.id === orderId ? { ...o, qty: newQty } : o));
    }
  }

  async function removeFromCart(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      if (sb && stock[order.peptideId] != null) {
        const { data: newQty2, error: incErr } = await sb.rpc('increment_stock', { p_product_id: order.peptideId, p_qty: order.qty });
        if (incErr) {
          console.warn('[Supabase] increment_stock error:', incErr.message);
        } else if (newQty2 != null) {
          const newStock = { ...stock, [order.peptideId]: newQty2 };
          localStorage.setItem('vg-stock', JSON.stringify(newStock));
          setStock(newStock);
        }
      } else {
        const newStock = { ...stock };
        if (newStock[order.peptideId] != null) newStock[order.peptideId] += order.qty;
        saveStock(newStock);
        setStock(newStock);
      }
    }
    persistOrders(orders.filter(o => o.id !== orderId));
    showToast("Item removido", "info");
  }

  // Abre o modal da pool de remetentes (botão 📮 REMETENTES e menu Envios › Remetentes no /novo)
  function openSenderPool() {
    setEtiquetaModal({ _poolOnly: true }); setEtiquetaStep('settings');
    setMeForm({ name:'', phone:'', email:'', document:'', address:'', number:'', complement:'', district:'', city:'', state:'', postal_code:'' });
  }

  function handleAdminUnlock() {
    const lock = adminLockRef.current;
    if (Date.now() < lock.until) {
      const mins = Math.ceil((lock.until - Date.now()) / 60000);
      showToast(`Bloqueado. Tente em ${mins} min.`, "error"); return;
    }
    setAdminPwInput('');
    setAdminPwModal(true);
  }

  async function submitAdminPassword() {
    const pw = adminPwInput.trim();
    if (!pw) return;
    const lock = adminLockRef.current;
    if (Date.now() < lock.until) {
      const mins = Math.ceil((lock.until - Date.now()) / 60000);
      showToast(`Bloqueado. Tente em ${mins} min.`, "error"); return;
    }
    let res;
    try {
      res = await fetch('https://aumubzvdhzvtnqfzqeqd.supabase.co/functions/v1/verify-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
        },
        body: JSON.stringify({ password: pw }),
      });
    } catch (err) {
      console.error('[verify-admin] network error:', err);
      showToast("Sem conexão com o servidor. Verifique sua internet.", "error");
      return;
    }
    let data;
    try {
      data = await res.json();
    } catch (err) {
      const status = res.status;
      console.error('[verify-admin] parse error, status:', status, err);
      if (status === 401 || status === 403) showToast(`Função não autorizada (${status}). Redeploy com --no-verify-jwt.`, "error");
      else if (status >= 500) showToast(`Erro no servidor (${status}). Verifique ADMIN_PASSWORD.`, "error");
      else showToast(`Resposta inválida do servidor (${status}).`, "error");
      return;
    }
    if (data.ok) {
      adminLockRef.current = { attempts: 0, until: 0 };
      adminPwRef.current = pw; ADMIN_PW = pw;
      setAdminPwModal(false); setAdminPwInput('');
      setAdminUnlocked(true); showToast("Admin desbloqueado ✓"); setView("admin");
    } else {
      const attempts = (lock.attempts || 0) + 1;
      const until = attempts >= 5 ? Date.now() + 15 * 60 * 1000 : 0;
      adminLockRef.current = { attempts, until };
      setAdminPwInput('');
      if (data.locked || attempts >= 5) { setAdminPwModal(false); showToast("Muitas tentativas — bloqueado por 15 min!", "error"); }
      else showToast(`Código incorreto! (${attempts}/5)`, "error");
    }
  }

  async function adminRemove(orderId) {
    const order = orders.find(o => o.id === orderId);
    const prevOrders = orders;
    const prevStock = stock;
    if (order && sb && order._supabase) {
      const items = order._items || [{ peptideId: order.peptideId, qty: order.qty }];
      // Restaura estoque de todos os itens de forma atômica
      await Promise.all(items.map(async item => {
        if (item.peptideId && item.qty > 0 && stock[item.peptideId] != null) {
          const { data: newQty } = await sb.rpc('increment_stock', { p_product_id: item.peptideId, p_qty: item.qty });
          if (newQty != null) setStock(prev => ({ ...prev, [item.peptideId]: newQty }));
        }
      }));
      const { error } = await sb.from('orders').delete().eq('id', orderId);
      if (error) {
        console.warn('[Supabase] Delete order error:', error.message);
        showToast('Erro ao remover pedido no servidor. Verifique as permissões do banco.', 'error');
        setStock(prevStock);
        return;
      }
    }
    persistOrders(orders.filter(o => o.id !== orderId));
    showToast("Pedido removido", "info");
  }

  function copyWhatsApp() {
    const grouped = {};
    orders.forEach(o => {
      // Pedidos Supabase com múltiplos itens: expandir cada item individualmente
      const itemList = (o._supabase && o._items && o._items.length > 0)
        ? o._items.map(i => ({ peptideId: i.peptideId, qty: i.qty, buyerName: o.buyerName }))
        : [{ peptideId: o.peptideId, qty: o.qty, buyerName: o.buyerName }];
      itemList.forEach(item => {
        const p = products.find(x => x.id === item.peptideId);
        const pName = p ? p.name : item.peptideId;
        if (!grouped[pName]) grouped[pName] = [];
        grouped[pName].push({ buyerName: item.buyerName, qty: item.qty });
      });
    });
    let text = "🧬 *VANGUARD PEPTIDES — PEDIDOS*\n\n";
    Object.entries(grouped).forEach(([pName, items]) => {
      const total = items.reduce((s, i) => s + i.qty, 0);
      text += `*${pName}* (${total} und)\n`;
      items.forEach(i => { text += `• ${i.buyerName} ×${i.qty}\n`; });
      text += "\n";
    });
    navigator.clipboard.writeText(text).then(() => showToast("Lista copiada! 📋")).catch(() => showToast("Erro ao copiar", "error"));
  }

  // ── totals for admin ──
  const totalRevenue = useMemo(() => orders.reduce((s, o) => {
    if (o._supabase && o._total != null) return s + o._total;
    return s + (o.qty || 0) * (products.find(p => p.id === o.peptideId)?.price || 0);
  }, 0), [orders, products]);
  const totalUnits   = useMemo(() => orders.reduce((s, o) => s + (o.qty || 0), 0), [orders]);
  const totalBuyers  = useMemo(() => new Set(orders.map(o => (o.buyerName || '').toLowerCase())).size, [orders]);

  // ── cat groups ──
  const catGroups = CATEGORIES.filter(c => c.id !== "all").map(c => ({
    cat: c,
    peptides: (activeCat === "all" ? products : products.filter(p => p.category === activeCat)).filter(p => p.category === c.id)
  })).filter(g => g.peptides.length);

  function peptideCartQty(peptideId) {
    return myOrders.filter(o => o.peptideId === peptideId).reduce((s, o) => s + (o.qty || 0), 0);
  }

  // Expiry + reminder check every 60s
  React.useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      let list; try { list = JSON.parse(localStorage.getItem('vg-preorders')||'[]'); } catch { list = []; }
      let changed = false;
      const updated = list.map(po => {
        if (po.status === 'notified' && po.notifiedAt) {
          const elapsed = now - po.notifiedAt;
          if (elapsed >= 24*60*60*1000) { changed = true; return {...po, status:'expired'}; }
          if (elapsed >= 22*60*60*1000 && !po.reminderSent) {
            changed = true;
            return {...po, reminderSent:true};
          }
        }
        return po;
      });
      if (changed) {
        localStorage.setItem('vg-preorders', JSON.stringify(updated));
        setPreorders(updated);
      }
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const novoActive = IS_NOVO && view !== 'admin' && !portalToken && !manualOrderView;
  // Admin dentro do /novo: casca nova por cima das abas antigas (o admin em /antigo/ segue o antigo)
  const novoAdmin = IS_NOVO && view === 'admin' && adminUnlocked && !portalToken && !manualOrderView;
  const nvaActive = nvaActiveItem(adminTab, nvaSec, adminStatusFilter);
  const nvaBadges = novoAdmin ? {
    pedidos: orders.filter(o => o._supabase && (o.status || 'pendente') === 'pendente').length,
    etiquetas: orders.filter(o => o._supabase && o.status === 'pago' && !o.label_url && !isMotoboyOrder(o)).length,
  } : {};
  function nvaPick(it) {
    if (it.action === 'senders') { openSenderPool(); return; }
    if (it.id === 'etiquetas') setAdminStatusFilter('pago');
    else if (it.id === 'pedidos' && nvaActive !== 'pedidos') setAdminStatusFilter('all'); // vindo de outra seção, sem o filtro de Etiquetas
    setNvaSec(it.id);
    setAdminTab(it.tab);
    window.scrollTo(0, 0);
  }
  // ── Pedidos no /novo: próximo passo de cada pedido ──
  // Só chama as funções que o admin antigo já usa (cycleStatus, gerarEtiqueta, modal PIX,
  // sendTrackingWhatsApp, adminRemove); a única coisa nova é a confirmação antes de agir.
  const NVA_ST = { pendente: 'Aguardando', pago: 'Pago', enviado: 'Enviado', entregue: 'Entregue', extraviado: 'Extraviado' };
  const NVA_NEXT = { pendente: 'pago', pago: 'enviado', enviado: 'entregue' };
  function nvaAdvance(order) {
    const next = NVA_NEXT[order.status || 'pendente'];
    if (!next) return;
    const wa = order._phone && waAuto ? '\n\nAbre o WhatsApp do cliente com a mensagem automática.' : '';
    if (!window.confirm(`${order._code || '#' + order.id} · ${order.buyerName || 'Cliente'}\n\nMarcar como ${NVA_ST[next].toUpperCase()}?${wa}`)) return;
    cycleStatus(order.id);
  }
  function nvaWhats(order) {
    const digits = (order._phone || '').replace(/\D/g, '');
    const intl = digits.startsWith('55') ? digits : '55' + digits;
    if (['pago','enviado','entregue'].includes(order.status)) { openStatusWhatsApp(order); return; }
    window.open(`https://wa.me/${intl}`, '_blank');
  }
  function nvaRemove(order) {
    if (!window.confirm(`Remover o pedido ${order._code || '#' + order.id} (${order.buyerName || 'Cliente'})?\n\nO estoque dos itens volta para a loja.`)) return;
    if (nvaSelOrder === order.id) setNvaSelOrder(null);
    adminRemove(order.id);
  }
  function nvaSteps(order) {
    const st = order.status || 'pendente';
    const sec = [];
    let main;
    if (st === 'pendente') {
      main = { label: 'Marcar como pago', run: () => nvaAdvance(order), primary: true };
      sec.push({ label: 'Cobrar PIX', run: () => { setPixCode(''); setPixModal(order); } });
    } else if (st === 'pago' && isMotoboyOrder(order)) {
      main = { label: 'Marcar como enviado', run: () => nvaAdvance(order), primary: true };
    } else if (st === 'pago' && !order.label_url) {
      main = { label: 'Gerar etiqueta', run: () => gerarEtiqueta(order), primary: true };
      sec.push({ label: 'Marcar como enviado', run: () => nvaAdvance(order) });
    } else if (st === 'pago') {
      main = { label: 'Marcar como enviado', run: () => nvaAdvance(order), primary: true };
      sec.push({ label: 'Reimprimir etiqueta', run: () => gerarEtiqueta(order) });
    } else if (st === 'enviado') {
      main = { label: 'Marcar como entregue', run: () => nvaAdvance(order), primary: true };
    } else {
      main = { label: 'Ver detalhes', run: () => setOrderDetail(order), primary: false };
    }
    if (order.tracking_code) sec.push({ label: 'Enviar rastreio', run: () => sendTrackingWhatsApp(order) });
    if (order._phone) sec.push({ label: 'WhatsApp', run: () => nvaWhats(order) });
    return { main, sec };
  }
  function nvaWhen(iso) {
    const d = iso ? new Date(iso) : null;
    if (!d || isNaN(d)) return '';
    const t = new Date();
    const hm = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === t.toDateString()) return 'hoje ' + hm;
    const y = new Date(t); y.setDate(t.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return 'ontem ' + hm;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
  function nvaItemsText(order) {
    const items = order._items && order._items.length > 0 ? order._items : [{ peptideId: order.peptideId, qty: order.qty || 1 }];
    return items.map(it => { const p2 = products.find(x => x.id === it.peptideId); return `${it.qty || 1}× ${p2 ? p2.name : (it.name || it.peptideId || '—')}`; });
  }
