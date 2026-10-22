// @fragmento do App() — lógica 2/8: notificações, artigos, status do pedido, rastreio e WhatsApp de status. Antes: 01-estado-rotas.part.jsx | depois: 03-melhor-envios-cambio.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
  // ── Notifications ──────────────────────────────────────────────────────────
  const [notifs, setNotifs] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-notifs')||'[]'); } catch { return []; } });
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifs.filter(n => !n.read).length;

  function addNotif(type, title, body, meta={}) {
    const n = { id: Date.now().toString(36) + Math.random().toString(36).slice(2), type, title, body, meta, ts: Date.now(), read: false };
    setNotifs(prev => {
      const dup = prev.find(x => x.type === type && x.body === body && (Date.now() - x.ts) < 30000);
      if (dup) return prev;
      const updated = [n, ...prev].slice(0, 60);
      localStorage.setItem('vg-notifs', JSON.stringify(updated));
      return updated;
    });
  }

  function markAllRead() {
    setNotifs(prev => { const u = prev.map(n => ({ ...n, read: true })); localStorage.setItem('vg-notifs', JSON.stringify(u)); return u; });
  }

  function clearNotifs() { setNotifs([]); localStorage.removeItem('vg-notifs'); }

  function timeAgo(ts) {
    const d = Date.now() - ts;
    if (d < 60000) return 'agora';
    if (d < 3600000) return `${Math.floor(d/60000)}min`;
    if (d < 86400000) return `${Math.floor(d/3600000)}h`;
    return `${Math.floor(d/86400000)}d`;
  }

  function loadArticles() { try { return JSON.parse(localStorage.getItem('vg-articles') || 'null') || DEFAULT_ARTICLES; } catch { return DEFAULT_ARTICLES; } }
  const [articles, setArticles] = useState(loadArticles);
  function persistArticles(a) { setArticles(a); localStorage.setItem('vg-articles', JSON.stringify(a)); }

  function statusLabel(s) {
    const k = s || 'pendente';
    return k === 'pendente'   ? '🟡 PENDENTE'
         : k === 'pago'       ? '✅ PAGO'
         : k === 'enviado'    ? '📦 ENVIADO'
         : k === 'entregue'   ? '🎉 ENTREGUE'
         : k === 'extraviado' ? '⚠️ EXTRAVIADO'
         : k.toUpperCase();
  }

  async function setOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    persistOrders(updated);
    addNotif('status', `🔄 ${order.buyerName || 'Pedido'} → ${newStatus}`, `${order._code || orderId} marcado como ${newStatus}`, { orderId });
    if (sb) {
      const { error } = await sb.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) {
        console.warn('[Supabase] Order status error:', error.message);
        showToast('Erro ao atualizar status. Revertendo...', 'error');
        persistOrders(orders);
      }
    }
  }

  async function markExtraviado(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    if (!window.confirm(`Marcar pedido ${order._code || orderId} como EXTRAVIADO?\n\nIsso registra os vials como perda total (100% prejuízo) no financeiro.`)) return;
    await setOrderStatus(orderId, 'extraviado');
    showToast('Pedido marcado como extraviado', 'error');
  }

  // Mensagem pronta de WhatsApp conforme o status do pedido (pago/enviado/entregue)
  function openStatusWhatsApp(order) {
    const newStatus = order.status;
    if (!['pago','enviado','entregue'].includes(newStatus) || !order._phone) return;
    const digits = order._phone.replace(/\D/g, '');
    const intlPhone = digits.startsWith('55') ? digits : '55' + digits;
    const firstName = (order.buyerName || 'Cliente').split(' ')[0];
    const code = order._code || '';
    const total = order._total ? `R$ ${order._total.toLocaleString('pt-BR')}` : '';
    const msg = newStatus === 'pago'
      ? `✅ *Olá, ${firstName}! Seu pagamento foi confirmado.*${code ? `\n\n📋 *Pedido:* ${code}` : ''}${total ? `\n💰 *Total:* ${total}` : ''}\n\nEstamos preparando seu pedido e avisaremos assim que for enviado. Qualquer dúvida, é só chamar!\n\n_Vanguard Peptides_ 🧬`
      : newStatus === 'enviado'
      ? `📦 *Olá, ${firstName}! Seu pedido foi enviado!*${code ? `\n\n📋 *Pedido:* ${code}` : ''}${total ? `\n💰 *Total:* ${total}` : ''}${order.tracking_code ? `\n\n🔍 *Código de rastreio:*\n${order.tracking_code}\n\n📲 Acompanhe aqui: https://melhorrastreio.com.br/rastreio/${order.tracking_code}` : `\n\nPara acompanhar, acesse vanguardpep.com → 📦 PEDIDO${code ? ` e use o código *${code}*` : ''}.`}\n\nQualquer dúvida é só chamar! 🙏\n\n_Vanguard Peptides_ 🧬`
      : `🎉 *Olá, ${firstName}! Seu pedido foi entregue!*${code ? `\n\n📋 *Pedido:* ${code}` : ''}\n\nEsperamos que você aproveite muito! Se tiver qualquer dúvida sobre o uso, estamos aqui para ajudar.\n\nObrigado pela confiança! 🙏\n\n_Vanguard Peptides_ 🧬`;
    window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // Pedido entregue por motoboy (DDD 11 / Grande SP): não precisa de etiqueta do Melhor Envios
  function isMotoboyOrder(order) {
    const d = ((order && (order._phone || order.phone)) || '').replace(/\D/g, '');
    return (d.startsWith('55') ? d.slice(2, 4) : d.slice(0, 2)) === '11';
  }

  async function cycleStatus(orderId) {
    const cycle = ['pendente','pago','enviado','entregue'];
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    if (order.status === 'extraviado') { showToast('Pedido extraviado — use o botão no detalhe para reverter','error'); return; }
    const idx = cycle.indexOf(order.status || 'pendente');
    const newStatus = cycle[(idx+1) % cycle.length];
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    persistOrders(updated);
    addNotif('status', `🔄 ${order.buyerName || 'Pedido'} → ${newStatus}`, `${order._code || orderId} marcado como ${newStatus}`, { orderId });
    // Sync to Supabase
    if (sb) {
      const { error } = await sb.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) {
        console.warn('[Supabase] Order status error:', error.message);
        showToast('Erro ao atualizar status. Revertendo...', 'error');
        persistOrders(orders);
        return;
      }
    }
    // WhatsApp automático (opcional) para pago/enviado/entregue
    if (waAuto) openStatusWhatsApp({ ...order, status: newStatus });
    if (newStatus === 'pago') awardPoints(order);
  }

  function persistOrders(o) { setOrders(o); saveOrders(o); }

  // Busca no Melhor Envios o código de rastreio de um pedido com etiqueta (o ME costuma liberar o código depois de gerar)
  const [trackFetching, setTrackFetching] = useState(false);
  async function fetchTrackingFromME(order, silent = false) {
    if (!order?.me_order_id || !adminPwRef.current) return;
    setTrackFetching(true);
    try {
      const r = await callME(`/me/orders/${order.me_order_id}`, 'GET');
      const code = (r?.tracking || r?.self_tracking || '').trim();
      if (code) {
        if (sb) await sb.from('orders').update({ tracking_code: code }).eq('id', order.id);
        setOrders(prev => { const u = prev.map(o => o.id === order.id ? { ...o, tracking_code: code } : o); saveOrders(u); return u; });
        setOrderDetail(d => d && d.id === order.id ? { ...d, tracking_code: code } : d);
        showToast('Rastreio vinculado: ' + code, 'success');
      } else if (!silent) showToast(r?.error ? 'Erro no Melhor Envios: ' + r.error : 'Melhor Envios ainda não liberou o código. Tente mais tarde.', r?.error ? 'error' : 'success');
    } catch (e) { if (!silent) showToast('Erro ao consultar Melhor Envios: ' + e.message, 'error'); }
    setTrackFetching(false);
  }
  React.useEffect(() => {
    if (orderDetail?.me_order_id && !orderDetail.tracking_code) fetchTrackingFromME(orderDetail, true);
  }, [orderDetail?.id]);

  async function saveTrackingManual(orderId, code) {
    const trimmed = (code||'').trim();
    if (sb) await sb.from('orders').update({ tracking_code: trimmed }).eq('id', orderId);
    const updated = orders.map(o => o.id === orderId ? { ...o, tracking_code: trimmed } : o);
    persistOrders(updated);
    setOrderDetail(d => ({ ...d, tracking_code: trimmed }));
    setEditTrackInput(null);
    showToast('Rastreio salvo!', 'success');
  }

  function sendTrackingWhatsApp(order) {
    const firstName = (order.buyerName||'Cliente').split(' ')[0];
    const code = order._code || order.code || '';
    const track = order.tracking_code;
    const msg = `📦 *Olá, ${firstName}!*\n\n🔍 *Código de rastreio do seu pedido${code?` ${code}`:''}:*\n${track}\n\n📲 Acompanhe aqui: https://melhorrastreio.com.br/rastreio/${track}\n\nQualquer dúvida é só chamar! 🙏\n\n_Vanguard Peptides_ 🧬`;
    const digits = (order._phone||order.phone||'').replace(/\D/g,'');
    const intl = digits.startsWith('55') ? digits : '55'+digits;
    window.open(`https://wa.me/${intl}?text=${encodeURIComponent(msg)}`, '_blank');
  }

