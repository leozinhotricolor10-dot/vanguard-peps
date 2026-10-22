// @fragmento do App() — lógica 3/8: Melhor Envios (frete, etiqueta), limpar pedidos, busca de pedidos, câmbio. Antes: 02-notificacoes-status.part.jsx | depois: 04-supabase-sync.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
  const ME_PROXY = `https://aumubzvdhzvtnqfzqeqd.supabase.co/functions/v1/melhorenvios-proxy`;
  const ME_ANON  = 'sb_publishable_crfA-iUkVR2mnibsWQ2ZDA_wpwOBBY_';
  const BR_STATE_MAP = {'acre':'AC','alagoas':'AL','amapa':'AP','amapá':'AP','amazonas':'AM','bahia':'BA','ceara':'CE','ceará':'CE','distrito federal':'DF','espirito santo':'ES','espírito santo':'ES','goias':'GO','goiás':'GO','maranhao':'MA','maranhão':'MA','mato grosso do sul':'MS','mato grosso':'MT','minas gerais':'MG','para':'PA','pará':'PA','paraiba':'PB','paraíba':'PB','parana':'PR','paraná':'PR','pernambuco':'PE','piaui':'PI','piauí':'PI','rio de janeiro':'RJ','rio grande do norte':'RN','rio grande do sul':'RS','rondonia':'RO','rondônia':'RO','roraima':'RR','santa catarina':'SC','sao paulo':'SP','são paulo':'SP','sergipe':'SE','tocantins':'TO'};
  function normUF(s) { if (!s) return ''; const t = s.trim().toUpperCase(); if (t.length === 2) return t; const k = s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); return BR_STATE_MAP[k] || t.slice(0,2); }

  async function callME(path, method = 'GET', body = null, env = 'prod') {
    const res = await fetch(ME_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': ME_ANON },
      body: JSON.stringify({ path, method, body, env, password: adminPwRef.current }),
    });
    return res.json();
  }

  React.useEffect(() => {
    if (!sb) return;
    sb.from('site_config').select('value').eq('key','origin_cep').single()
      .then(({ data }) => { if (data?.value) setFreteOriginCep(data.value); });
    // Combos e regra de pontos: mesma fonte que a Edge Function create-order usa
    sb.from('site_config').select('key,value').in('key', ['bundles', 'points_config', 'bestsellers'])
      .then(({ data, error }) => {
        if (error || !Array.isArray(data)) return;
        const bs = data.find(r => r.key === 'bestsellers');
        if (bs) { const l = parseBestsellersCfg(bs.value); setBestsellers(l); try { localStorage.setItem('vg-bestsellers', JSON.stringify(l)); } catch {} }
        const b = data.find(r => r.key === 'bundles');
        if (b) { const list = parseBundlesCfg(b.value); setBundles(list); try { localStorage.setItem('vg-bundles', JSON.stringify(list)); } catch {} }
        const pc = data.find(r => r.key === 'points_config');
        if (pc) {
          try {
            const v = JSON.parse(pc.value); const rate = Number(v.rate), redeem = Number(v.redeem);
            if (rate > 0 && redeem > 0) {
              const cfg = { rate, redeem };
              setPointsConfig(cfg); setCfgRate(String(rate)); setCfgRedeem(String(redeem));
              try { localStorage.setItem('vg-points-config', JSON.stringify(cfg)); } catch {}
            }
          } catch {}
        }
      });
  }, []);

  async function calcularFrete() {
    const dest = freteDestCep.replace(/\D/g,'');
    if (dest.length !== 8) { setFreteError('CEP inválido. Digite os 8 dígitos.'); return; }
    if (!freteOriginCep) { setFreteError('CEP de origem não configurado. Configure no painel admin.'); return; }
    setFreteLoading(true); setFreteError(''); setFreteResults(null);
    try {
      const body = {
        from: { postal_code: freteOriginCep.replace(/\D/g,'') },
        to: { postal_code: dest },
        products: [{ id:'1', width:6, height:5, length:12, weight:0.3, insurance_value:200, quantity:1 }],
        services: '1,2,3,7,8,9',
        options: { receipt:false, own_hand:false, collect:false }
      };
      const res = await callME('/me/shipment/calculate', 'POST', body);
      const available = Array.isArray(res) ? res.filter(s => !s.error && s.price) : [];
      if (!available.length) throw new Error('Nenhum serviço disponível para este CEP.');
      setFreteResults(available);
    } catch(e) {
      setFreteError(e.message);
    }
    setFreteLoading(false);
  }

  async function gerarEtiqueta(order) {
    // Pick random sender from pool; fall back to meSettings if pool empty
    const fallback = meSettings && (isSandbox ? isTestSender(meSettings) : !isTestSender(meSettings)) ? [meSettings] : [];
    const pool = activePool.length ? activePool : fallback;
    if (!pool.length) { setEtiquetaModal(order); setEtiquetaStep('settings'); setMeForm({ name:'', phone:'', email:'', document:'', address:'', number:'', complement:'', district:'', city:'', state:'', postal_code:'' }); return; }
    const sender = pool[Math.floor(Math.random() * pool.length)];
    setMeSettings(sender); // update active sender so confirm step shows it
    setMeForm({...sender});
    setEtiquetaModal(order);
    setEtiquetaStep('loading');
    setEtiquetaError('');
    try {
      const addr = order._address || order.address || {};
      const fromCep = sender.postal_code.replace(/\D/g,'');
      const toCep = (addr.cep||'').replace(/\D/g,'');
      const calcBody = { from: { postal_code: fromCep }, to: { postal_code: toCep }, products: [{ id:'1', width: parseFloat(declLarg)||6, height: parseFloat(declAlt)||5, length: parseFloat(declComp)||12, weight: parseFloat(declPeso)||0.3, insurance_value: parseFloat(declValor)||order._total||100, quantity: parseInt(declQtd)||1 }], services:'1,2,3,7,8,9,15', options:{ receipt:false, own_hand:false, collect:false } };
      const calcRes = await callME('/me/shipment/calculate', 'POST', calcBody, meEnv);
      const availableRaw = Array.isArray(calcRes) ? calcRes.filter(s=>!s.error && s.price) : [];
      if (!availableRaw.length) throw new Error('[CALC] Nenhum serviço disponível para esta rota.\n' + JSON.stringify(calcRes));
      // Priorizar JET Express (id 15): mostra primeiro e auto-seleciona se disponível
      const isJet = s => { const id = parseInt(s.id); const name = ((s.company?.name||'')+' '+(s.name||'')).toLowerCase(); return id === 15 || name.includes('jet'); };
      const available = [...availableRaw].sort((a,b) => (isJet(b)?1:0) - (isJet(a)?1:0));
      setMeServices(available);
      const jetService = available.find(isJet);
      setSelectedService(jetService || null);
      setDeclValor(String(order._total || ''));
      setEditingRem(false);
      setEtiquetaStep('select');
      fetchMeBalance();
    } catch(e) {
      setEtiquetaError(e.message);
      setEtiquetaStep('error');
    }
  }

  async function confirmarEtiqueta() {
    const order = etiquetaModal;
    const sender = meSettings;
    const service = selectedService;
    if (!service) return;
    if (!isSandbox && isTestSender(sender)) { setEtiquetaError('Remetente de teste/fictício não pode ser usado em produção. Troque o remetente.'); setEtiquetaStep('error'); return; }
    setEtiquetaStep('loading');
    setEtiquetaError('');
    try {
      const addr = order._address || order.address || {};
      const fromCep = sender.postal_code.replace(/\D/g,'');
      const toCep   = (addr.cep||'').replace(/\D/g,'');

      // ME exige e-mail válido no destinatário; pedidos manuais podem não ter — usa o do remetente
      const isEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
      const custEmail = (order._email||order.email||'').trim();
      const toEmail = isEmail(custEmail) ? custEmail : (sender.email||'').trim();
      const cartBody = {
        service: service.id,
        from: { name: sender.name, phone: sender.phone.replace(/\D/g,''), email: sender.email, document: sender.document.replace(/\D/g,''), address: sender.address, number: sender.number, complement: sender.complement||'', district: sender.district, city: sender.city, state_abbr: normUF(sender.state), country_id: 'BR', postal_code: fromCep, note: '' },
        to: { name: order.buyerName||'Cliente', phone: (order._phone||'').replace(/\D/g,''), email: toEmail, document: (order._cpf||'').replace(/\D/g,''), address: addr.rua||'', number: addr.numero||'', complement: addr.complemento||'', district: addr.bairro||'', city: addr.cidade||'', state_abbr: normUF(addr.estado), country_id: 'BR', postal_code: toCep, note: '' },
        products: [{ name: declNome||'Peptídeo', quantity: parseInt(declQtd)||1, unitary_value: parseFloat(declValor)||order._total||100, weight: parseFloat(declPeso)||0.3 }],
        volumes: [{ height: parseFloat(declAlt)||5, width: parseFloat(declLarg)||6, length: parseFloat(declComp)||12, weight: parseFloat(declPeso)||0.3 }],
        options: { insurance_value: parseFloat(declValor)||order._total||100, receipt: false, own_hand: false, reverse: false, non_commercial: true, tags: [{ tag: order._code||order.id, url: null }] },
      };
      const cartRes = await callME('/me/cart', 'POST', cartBody, meEnv);
      if (!cartRes.id) { const errs = cartRes.errors ? Object.entries(cartRes.errors).map(([k,v])=>`${k}: ${Array.isArray(v)?v[0]:v}`).join('\n') : null; throw new Error(errs || cartRes.message || 'Erro ao criar envio'); }
      const meOrderId = cartRes.id;

      const checkoutRes = await callME('/me/shipment/checkout', 'POST', { orders: [meOrderId] }, meEnv);
      if (!checkoutRes.purchase) throw new Error(checkoutRes.error || checkoutRes.message || 'Falha no checkout');

      const genRes = await callME('/me/shipment/generate', 'POST', { orders: [meOrderId] }, meEnv);

      const printRes = await callME('/me/shipment/print', 'POST', { mode: 'public', orders: [meOrderId] }, meEnv);
      const labelUrl = printRes.url || printRes;

      const trackCode = cartRes.tracking || genRes[meOrderId]?.tracking || '';

      if (isSandbox) { // modo teste: não grava nada no pedido real nem no financeiro
        setEtiquetaResult({ meOrderId, trackCode, labelUrl: typeof labelUrl === 'string' ? labelUrl : '' });
        setEtiquetaStep('done'); return;
      }
      const shippingCost = service.price ? parseFloat(service.price) : 0;
      if (sb) await sb.from('orders').update({ me_order_id: meOrderId, tracking_code: trackCode, label_url: typeof labelUrl === 'string' ? labelUrl : '' }).eq('id', order.id);
      const updated = orders.map(o => o.id === order.id ? { ...o, me_order_id: meOrderId, tracking_code: trackCode, label_url: typeof labelUrl === 'string' ? labelUrl : '', shipping_cost: shippingCost } : o);
      persistOrders(updated);
      // Registrar custo de envio para financeiro
      if (shippingCost > 0) {
        const sc = { ...shippingCosts, [order.id]: { cost: shippingCost, carrier: service.name || service.company?.name || 'Transportadora', orderId: order.id, date: new Date().toLocaleDateString('pt-BR') } };
        persistShippingCosts(sc);
      }

      setEtiquetaResult({ meOrderId, trackCode, labelUrl: typeof labelUrl === 'string' ? labelUrl : '' });
      setEtiquetaStep('done');
    } catch(e) {
      setEtiquetaError(e.message);
      setEtiquetaStep('error');
    }
  }

  async function saveMeSettings() {
    const s = { ...meForm, state: (meForm.state||'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,2) };
    if (isSandbox) { s._test = true; setMeSettings(s); }
    else if (isTestSender(s)) { showToast('CPF de teste/fictício não pode ser remetente em produção', 'error'); return; }
    else { setMeSettings(s); localStorage.setItem('vg-me-settings', JSON.stringify(s)); }
    // After saving settings, fetch available services for this order
    const order = etiquetaModal;
    if (order?._poolOnly) { setEtiquetaModal(null); setEtiquetaStep('idle'); showToast(`Remetente ativo: ${s.name}`); return; }
    if (!order) { setEtiquetaStep('confirm'); return; }
    setEtiquetaStep('loading');
    setEtiquetaError('');
    try {
      const addr = order._address || order.address || {};
      const fromCep = s.postal_code.replace(/\D/g,'');
      const toCep = (addr.cep||'').replace(/\D/g,'');
      const calcBody = { from: { postal_code: fromCep }, to: { postal_code: toCep }, products: [{ id:'1', width: parseFloat(declLarg)||6, height: parseFloat(declAlt)||5, length: parseFloat(declComp)||12, weight: parseFloat(declPeso)||0.3, insurance_value: parseFloat(declValor)||order._total||100, quantity: parseInt(declQtd)||1 }], services:'1,2,3,7,8,9,15', options:{ receipt:false, own_hand:false, collect:false } };
      const calcRes = await callME('/me/shipment/calculate', 'POST', calcBody, meEnv);
      const availableRaw = Array.isArray(calcRes) ? calcRes.filter(s=>!s.error && s.price) : [];
      if (!availableRaw.length) throw new Error('[CALC] Nenhum serviço disponível para esta rota.\n' + JSON.stringify(calcRes));
      // Priorizar JET Express (id 15): mostra primeiro e auto-seleciona se disponível
      const isJet = s => { const id = parseInt(s.id); const name = ((s.company?.name||'')+' '+(s.name||'')).toLowerCase(); return id === 15 || name.includes('jet'); };
      const available = [...availableRaw].sort((a,b) => (isJet(b)?1:0) - (isJet(a)?1:0));
      setMeServices(available);
      const jetService = available.find(isJet);
      setSelectedService(jetService || null);
      setDeclValor(String(order._total || ''));
      setEtiquetaStep('select');
    } catch(e) {
      setEtiquetaError(e.message);
      setEtiquetaStep('error');
    }
  }

  async function clearAllOrders() {
    if (!window.confirm("Apagar TODOS os pedidos? O estoque será restaurado automaticamente.")) return;
    const prevOrders = orders;
    const prevStock = stock;
    try {
      if (sb) {
        const supabaseOrders = orders.filter(o => o._supabase);
        for (const o of supabaseOrders) {
          const items = o._items || [{ peptideId: o.peptideId, qty: o.qty }];
          for (const item of items) {
            if (item.peptideId && item.qty > 0 && stock[item.peptideId] != null) {
              const { data: nq, error: incErr } = await sb.rpc('increment_stock', { p_product_id: item.peptideId, p_qty: item.qty });
              if (incErr) throw new Error(incErr.message);
              if (nq != null) setStock(prev => ({ ...prev, [item.peptideId]: nq }));
            }
          }
          const { error: delErr } = await sb.from('orders').delete().eq('id', o.id);
          if (delErr) throw new Error(delErr.message);
        }
      }
      persistOrders([]);
      showToast("Pedidos apagados", "info");
    } catch (err) {
      console.warn('[clearAllOrders] Error:', err.message);
      showToast('Erro ao apagar pedidos. Revertendo...', 'error');
      persistOrders(prevOrders);
      setStock(prevStock);
    }
  }
  function persistProducts(p) { setProducts(p); saveProducts(p); }
  function persistStock(s) { setStock(s); saveStock(s); }

  // ── Rastreamento de pedidos ───────────────────────────────────────────────
  async function searchOrders(overrideQuery) {
    const raw = (overrideQuery || trackQuery).trim().toUpperCase();
    if (!raw) return;
    if (!sb) { showToast('Indisponível no momento', 'error'); return; }
    // Aceitar somente código VG- para evitar enumeração de CPF
    const q = raw.startsWith('VG') ? (raw.startsWith('VG-') ? raw : 'VG-' + raw.replace(/^VG-?/,'')) : raw;
    if (!q.startsWith('VG-') || q.length < 8) {
      showToast('Informe o código do pedido (VG-XXXXXX)', 'error');
      setTrackLoading(false);
      return;
    }
    setTrackLoading(true);
    setTrackResults(null);
    const r = await publicApi('track', { code: q });
    const data = r.orders;
    setTrackLoading(false);
    if (r.error || !data) { setTrackResults([]); return; }
    setTrackResults(data.map(o => ({
      id: o.id, code: o.code, date: o.created_at, status: o.status || 'pendente',
      items: o.items || [], total: o.total, buyerName: o.buyer_name, payment: o.payment,
      tracking_code: o.tracking_code,
    })));
  }

  // ── Câmbio automático ─────────────────────────────────────────────────────
  async function fetchCambio() {
    setCambioInfo(c => ({ ...c, loading: true, error: null }));
    try {
      const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
      const data = await res.json();
      const ask = parseFloat(data.USDBRL.ask).toFixed(2);
      const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setImportForm(f => ({ ...f, cambio: ask }));
      setCambioInfo({ loading: false, hora, error: null });
    } catch {
      setCambioInfo({ loading: false, hora: null, error: 'Falha ao buscar câmbio' });
    }
  }

  React.useEffect(() => {
    if (adminTab === 'importacao' && !importForm.cambio) { fetchCambio(); }
  }, [adminTab]);

  // ── Sticky detail CTA: mostra quando botão principal sai da tela ──────────
  React.useEffect(() => {
    if (view !== 'detail' || !detailActionsRef.current) { setShowStickyDetailCta(false); return; }
    const obs = new IntersectionObserver(([entry]) => setShowStickyDetailCta(!entry.isIntersecting), { threshold: 0 });
    obs.observe(detailActionsRef.current);
    return () => obs.disconnect();
  }, [view, selectedProduct]);

