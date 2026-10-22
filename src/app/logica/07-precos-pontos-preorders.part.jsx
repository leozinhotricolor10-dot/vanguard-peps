// @fragmento do App() — lógica 7/8: preço efetivo, cupons, pontos, pré-orders, availableStock, toast/nome. Antes: 06-pedido-manual.part.jsx | depois: 08-carrinho-admin.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
  function effectivePrice(p) {
    if (!p) return 0;
    const promo = productPromo[p.id] || p.promo || 0;
    return promo > 0 ? Math.round(p.price * (1 - promo / 100)) : p.price;
  }

  function persistCoupons(c) { setCoupons(c); localStorage.setItem('vg-coupons', JSON.stringify(c)); }
  function persistCustomers(c) { setCustomers(c); localStorage.setItem('vg-customers', JSON.stringify(c)); }

  async function awardPoints(order) {
    const cpf = (order._cpf || order.cpf || '').replace(/\D/g,'');
    if (!cpf || cpf.length !== 11) return;
    const pts = Math.floor(Math.abs(order._total || 0) * (pointsConfig.rate || 1));
    if (pts <= 0) return;
    if (sb) {
      const { data: ex, error: selErr } = await sb.from('customers').select('points,total_spent').eq('cpf', cpf).maybeSingle();
      if (selErr) { console.warn('[Points] select error:', selErr.message); }
      if (ex) {
        const { error: updErr } = await sb.from('customers').update({ points: (ex.points||0)+pts, total_spent: (ex.total_spent||0)+(order._total||0), name: order.buyerName||'', phone: order._phone||'', email: order._email||'' }).eq('cpf', cpf);
        if (updErr) { console.warn('[Points] update error:', updErr.message); return; }
      } else {
        const { error: insErr } = await sb.from('customers').insert({ cpf, name: order.buyerName||'', phone: order._phone||'', email: order._email||'', points: pts, total_spent: order._total||0 });
        if (insErr) { console.warn('[Points] insert error:', insErr.message); return; }
      }
    }
    const upd = customers.find(c=>c.cpf===cpf) ? customers.map(c=>c.cpf===cpf?{...c,points:(c.points||0)+pts,total_spent:(c.total_spent||0)+(order._total||0)}:c) : [...customers,{cpf,name:order.buyerName||'',phone:order._phone||'',email:order._email||'',points:pts,total_spent:order._total||0}];
    persistCustomers(upd);
    showToast(`⭐ +${pts} pontos VG creditados!`, 'success');
  }

  // Ref para cancelar checkPoints stale em caso de digitação rápida
  const _checkPointsReq = React.useRef(0);
  async function checkPoints(cpf) {
    const clean = (cpf||'').replace(/\D/g,'');
    if (clean.length < 11) { setPointsBalance(null); return; }
    const reqId = ++_checkPointsReq.current;
    let data = null;
    if (sb) {
      // Só o saldo de pontos — o CPF não devolve nome/telefone/e-mail de ninguém
      const r = await publicApi('points', { cpf: clean });
      if (reqId !== _checkPointsReq.current) return; // resposta stale, ignora
      if (!r.error && r.points) data = { cpf: clean, points: r.points };
    } else {
      data = customers.find(c=>c.cpf===clean)||null;
    }
    setPointsBalance(data ? { ...data, points: data.points ?? 0 } : { cpf: clean, points: 0 });
    if (data) {
      const updates = {};
      if (data.name && !checkout.nomeCompleto) updates.nomeCompleto = data.name;
      if (data.phone && !checkout.telefone) updates.telefone = data.phone;
      if (data.email && !checkout.email) updates.email = data.email;
      if (Object.keys(updates).length > 0) {
        saveCheckoutData({ ...checkout, cpf, ...updates });
        showToast('Dados preenchidos automaticamente ✓', 'success');
      }
    }
  }

  async function applyCouponCode() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    let c = coupons.find(x => x.code.toUpperCase() === code && x.active !== false);
    if (!c && sb) {
      const r = await publicApi('coupon', { code });
      const k = r && r.coupon;
      if (k) c = { id: k.id, code: k.code, type: k.type, value: k.value, minOrder: k.min_order, expiresAt: k.expires_at, active: k.active };
    }
    if (!c) { showToast('Cupom inválido ou inexistente', 'error'); return; }
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) { showToast('Cupom expirado', 'error'); return; }
    if (c.minOrder && myTotal < c.minOrder) { showToast(`Pedido mínimo R$ ${c.minOrder.toLocaleString('pt-BR')} para este cupom`, 'error'); return; }
    setAppliedCoupon(c);
    showToast(`Cupom ${c.code} aplicado! ✓`, 'success');
  }

  function generateToken() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  function savePreorder(peptide, form, silent = false) {
    if (preorderLocked) { showToast('Reservas encerradas — produto já disponível para compra!', 'error'); return; }
    const incomingQty = parseInt(form.qty)||1;
    // Agrupar: se já existe reserva ativa do mesmo cliente+produto, incrementar qty
    const existing = preorders.find(p =>
      ['pending','notified'].includes(p.status||'pending') &&
      p.productId === peptide.id &&
      (p.name||'').toLowerCase() === (form.name||'').toLowerCase()
    );
    if (existing) {
      const newQty = (existing.qty||0) + incomingQty;
      const updated = preorders.map(p => p.id === existing.id ? {...p, qty: newQty} : p);
      setPreorders(updated);
      localStorage.setItem('vg-preorders', JSON.stringify(updated));
      if (sb) {
        if (ADMIN_PW) sb.from('preorders').update({ qty: newQty }).eq('id', existing.id)
          .then(({ error }) => { if (error) console.warn('[Supabase] Preorder merge error:', error.message); });
        else if (existing.token) publicApi('preorder_update', { token: existing.token, fields: { qty: newQty } });
      }
      if (!silent) showToast(`Reserva de ${peptide.name} atualizada: ×${newQty} total 🔔`, 'success');
      return;
    }
    const token = generateToken();
    const entry = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2,7),
      token,
      productId: peptide.id,
      productName: peptide.name,
      name: form.name,
      whatsapp: form.whatsapp,
      qty: incomingQty,
      date: new Date().toLocaleDateString('pt-BR'),
      ts: Date.now(),
      status: 'pending',
      notifiedAt: null,
      reminderSent: false,
      _mine: true,
    };
    const updated = [...preorders, entry];
    setPreorders(updated);
    localStorage.setItem('vg-preorders', JSON.stringify(updated));
    // Salvar no Supabase
    if (sb) publicApi('preorder_add', { entry: {
      id: entry.id, token: entry.token, product_id: entry.productId,
      product_name: entry.productName, name: entry.name, whatsapp: entry.whatsapp,
      qty: entry.qty, date: entry.date, ts: entry.ts,
    } }).then(r => { if (!r.ok) { console.warn('[Supabase] Preorder save error:', r.error); showToast('Erro ao salvar pré-order no servidor: ' + (r.error || 'tente de novo'), 'error'); } });
    // Notify STORE about new pre-order (só se não vier do checkout, que já envia msg)
    if (!silent) {
      const reservaNum = '#' + (Date.now()+'').slice(-6);
      const msg = encodeURIComponent(
        '📋 *Nova reserva recebida!*\n\n' +
        '👤 *Cliente:* ' + form.name + '\n' +
        '📱 *WhatsApp:* ' + form.whatsapp + '\n' +
        '💊 *Produto:* ' + peptide.name + '\n' +
        '🔢 *Quantidade:* ' + (parseInt(form.qty)||1) + ' unidade(s)\n' +
        '🔖 *Reserva:* ' + reservaNum
      );
      window.open('https://wa.me/447418333521?text=' + msg, '_blank');
    }
  }

  function removePreorder(id) {
    const updated = preorders.filter(p=>p.id!==id);
    setPreorders(updated);
    localStorage.setItem('vg-preorders', JSON.stringify(updated));
    if (sb) sb.from('preorders').delete().eq('id', id)
      .then(({ error }) => { if (error) console.warn('[Supabase] Delete preorder error:', error.message); });
  }

  function persistPreorders(list) {
    const before = new Map(preorders.map(p => [p.id, p]));
    setPreorders(list);
    localStorage.setItem('vg-preorders', JSON.stringify(list));
    // Sync só do que mudou: admin grava tudo; o cliente só a própria reserva (pelo token)
    if (!sb) return;
    list.forEach(po => {
      const b = before.get(po.id);
      if (b && b.status === po.status && b.qty === po.qty && b.notifiedAt === po.notifiedAt && b.reminderSent === po.reminderSent) return;
      if (ADMIN_PW) {
        sb.from('preorders').update({
          status: po.status, qty: po.qty,
          notified_at: po.notifiedAt ? new Date(po.notifiedAt).toISOString() : null,
          reminder_sent: po.reminderSent || false
        }).eq('id', po.id).then(({ error }) => {
          if (error) console.warn('[Supabase] Preorder update error:', error.message);
        });
      } else if (po.token) {
        publicApi('preorder_update', { token: po.token, fields: { qty: po.qty, status: po.status } });
      }
    });
  }

  function availableStock(productId) {
    // If product has no stock control (key absent), it's always available (null = unlimited)
    if (!(productId in stock)) return null;
    const total = stock[productId] ?? 0;
    const reservedByPreorders = preorders
      .filter(po => po.productId === productId && ['pending','notified'].includes(po.status || 'pending'))
      .reduce((sum, po) => sum + (po.qty || 1), 0);
    const baseAvail = Math.max(0, total - reservedByPreorders);
    // Purchase order cap: from standalone POs + pending import history entries
    const standaloneCap = purchaseOrders
      .filter(po => po.productId === productId && po.status === 'pending')
      .reduce((sum, po) => sum + (po.qty || 0), 0);
    const productSku = products.find(p => p.id === productId)?.sku;
    const importCap = productSku ? importHistory
      .filter(h => h.status && h.status !== 'entregue' && h.status !== 'apreendida')
      .reduce((sum, h) => {
        const item = (h.items || []).find(it => it.sku === productSku);
        return sum + (item ? parseInt(item.vials) || parseInt(item.boxes) * 10 || 0 : 0);
      }, 0) : 0;
    const poCapQty = standaloneCap + importCap;
    if (poCapQty > 0) {
      // For cap logic: count confirmed Supabase orders per-product + client's own cart
      const confirmedReservations = orders
        .filter(o => {
          if (!o._supabase) return o.peptideId === productId;
          return ['pendente','pago','enviado'].includes(o.status || 'pendente');
        })
        .reduce((sum, o) => {
          if (!o._supabase) return sum + (o.qty || 0);
          const items = o._items && o._items.length > 0 ? o._items : [{peptideId: o.peptideId, qty: o.qty || 1}];
          const match = items.find(it => it.peptideId === productId);
          return sum + (match ? (match.qty || 1) : 0);
        }, 0);
      const liveReservations = confirmedReservations
        + preorders
          .filter(po => po.productId === productId && ['pending','notified'].includes(po.status || 'pending'))
          .reduce((sum, po) => sum + (po.qty || 1), 0);
      const capAvail = Math.max(0, poCapQty - liveReservations);
      // Stock beyond the cap is from already-delivered imports — freely available
      const uncappedStock = Math.max(0, baseAvail - poCapQty);
      // Never return MORE than what's physically in stock
      // But if stock > 0 and cap is still open, show at least capAvail
      return baseAvail > 0 ? Math.min(baseAvail, capAvail + uncappedStock) : 0;
    }
    return baseAvail;
  }

  function notifyPreorder(po) {
    const now = Date.now();
    const expireAt = now + 12*60*60*1000;
    const updated = preorders.map(p => p.id===po.id ? {...p, status:'notified', notifiedAt:now, reminderSent:false} : p);
    persistPreorders(updated);
    const firstName = (po.name || 'Cliente').split(' ')[0];
    const portalLink = window.location.origin + window.location.pathname + '?preorder=' + po.token;
    const msg = encodeURIComponent(
      '🎉 *Produto disponível!*\n\n' +
      'Olá ' + firstName + '! Seu produto reservado chegou ao estoque.\n\n' +
      '📦 *' + po.productName + '* (×' + po.qty + ')\n\n' +
      '⏰ Você tem *12 horas* para confirmar.\n\n' +
      '💸 *Pagando via PIX o frete é grátis!*\n\n' +
      '👇 Clique para concluir sua compra:\n' +
      portalLink
    );
    const wnum = (po.whatsapp || '').replace(/\D/g,'');
    window.open('https://wa.me/55' + wnum + '?text=' + msg, '_blank');
    showToast('WhatsApp aberto para ' + (po.name || 'cliente'), 'success');
  }

  function sendReminder(po) {
    const updated = preorders.map(p => p.id===po.id ? {...p, reminderSent:true} : p);
    persistPreorders(updated);
    const portalLinkR = window.location.origin + window.location.pathname + '?preorder=' + po.token;
    const msg = encodeURIComponent(
      '⏰ *Lembrete — Sua reserva expira em 2 horas!*\n\n' +
      'Olá ' + (po.name || 'Cliente').split(' ')[0] + ', não esqueça de confirmar sua compra de *' + po.productName + '* (×' + po.qty + ').\n\n' +
      '💸 *Pagando via PIX o frete é grátis!*\n\n' +
      '👇 Acesse agora para finalizar:\n' +
      portalLinkR
    );
    const wnum = (po.whatsapp || '').replace(/\D/g,'');
    window.open('https://wa.me/55' + wnum + '?text=' + msg, '_blank');
  }

  function checkPreorderExpiry() {
    const now = Date.now();
    let changed = false;
    const updated = preorders.map(po => {
      if (po.status === 'notified' && po.notifiedAt) {
        const elapsed = now - po.notifiedAt;
        const total12h = 12*60*60*1000;
        // Mark expired
        if (elapsed >= total12h) { changed = true; return {...po, status:'expired'}; }
        // Auto-send reminder at 10h (2h before expiry)
        if (elapsed >= 10*60*60*1000 && !po.reminderSent) {
          sendReminder(po);
          changed = true;
          return {...po, reminderSent:true};
        }
      }
      return po;
    });
    if (changed) persistPreorders(updated);
  }

  function cancelPreorderByToken(token) {
    const updated = preorders.map(po => po.token===token ? {...po, status:'cancelled'} : po);
    persistPreorders(updated);
  }

  function reducePreorderQty(token, newQty) {
    const updated = preorders.map(po => {
      if (po.token !== token) return po;
      if (newQty >= po.qty) return po; // never allow increase
      return {...po, qty: Math.max(1, newQty)};
    });
    persistPreorders(updated);
  }

  function showToast(msg, type = "success") {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }

  function saveName(n) { setMyName(n); localStorage.setItem("vg-nome", n); }

  function handleWelcomeConfirm() {
    const n = nameModalInput.trim();
    if (!n) return;
    saveName(n);
    localStorage.setItem("vg-welcomed", "1");
    setShowWelcome(false);
  }

  function handleNameConfirm() {
    const n = nameModalInput.trim();
    if (!n) return;
    saveName(n);
    setShowNameModal(false);
  }

