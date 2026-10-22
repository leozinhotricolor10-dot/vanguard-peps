// @fragmento do App() — lógica 5/8: frete, CEP, checkout sendToWhatsApp, avisos, código do pedido. Antes: 04-supabase-sync.part.jsx | depois: 06-pedido-manual.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
  // Freight calculation
  function calcFreight(estado, total) {
    if (total >= 1000) return { value: 0, label: 'Frete grátis', reason: 'Pedido acima de R$ 1.000' };
    if (estado === 'SP' && total >= 600) return { value: 0, label: 'Frete grátis', reason: 'SP + pedido acima de R$ 600 • Entrega no mesmo dia ou dia seguinte' };
    if (estado === 'SP') return { value: 60, label: 'R$ 60,00', reason: 'Via transportadora • Entrega no mesmo dia ou dia seguinte' };
    return { value: 60, label: 'R$ 60,00', reason: 'Via transportadora' };
  }

  async function fetchCep(cep) {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const d = await r.json();
      if (d.erro) {
        showToast('CEP não encontrado. Verifique e tente novamente.', 'error');
      } else {
        setCheckout(c => ({ ...c, estado: d.uf, cidade: d.localidade, bairro: d.bairro, rua: d.logradouro }));
        showToast('Endereço preenchido automaticamente ✓');
      }
    } catch {
      showToast('Erro ao buscar CEP. Verifique sua conexão.', 'error');
    }
  }

  function validateCheckout() {
    const errs = {};
    if (!(checkout.nomeCompleto || '').trim()) errs.nomeCompleto = true;
    if (!validarCPF(checkout.cpf || '')) errs.cpf = true;
    if (!(checkout.telefone || '').trim()) errs.telefone = true;
    if (checkout.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkout.email.trim())) errs.email = true;
    if (!/^\d{8}$/.test((checkout.cep || '').replace(/\D/g,''))) errs.cep = true;
    if (!(checkout.rua || '').trim()) errs.rua = true;
    if (!(checkout.numero || '').trim()) errs.numero = true;
    if (!(checkout.cidade || '').trim()) errs.cidade = true;
    if (!(checkout.estado || '').trim()) errs.estado = true;
    if (!checkout.pagamento) errs.pagamento = true;
    setCheckoutErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function saveCheckoutData(data) {
    setCheckout(data);
    localStorage.setItem('vg-checkout', JSON.stringify(data));
  }

  function updateCheckout(field, value) {
    const updated = { ...checkout, [field]: value };
    saveCheckoutData(updated);
  }

  async function sendToWhatsApp() {
    if (isSubmitting) return;
    if (!validateCheckout()) { showToast("Preencha todos os campos obrigatórios", "error"); return; }
    if (!disclaimer) { showToast("Confirme o aviso legal para prosseguir", "error"); return; }
    setIsSubmitting(true);
    try {
      const freightRaw = calcFreight(checkout.estado, myTotal);
      const isPix = checkout.pagamento === 'pix';
      // Valores locais (prévia); depois do create-order são trocados pelos que o servidor validou e gravou
      let freight = isPix ? { value: 0, label: 'Frete grátis', reason: 'Frete grátis no PIX' } : freightRaw;
      let subtotalFinal = myTotal;
      let couponDiscount = appliedCoupon ? (appliedCoupon.type === 'percent' ? Math.round(myTotal * appliedCoupon.value / 100) : Math.min(appliedCoupon.value, myTotal)) : 0;
      let pointsUsed = Math.floor(appliedPoints / 100) * 100;
      let pointsDiscount = Math.floor(appliedPoints / 100) * (pointsConfig.redeem || 5);
      let bundleDiscount = bundleInfo.total;
      const noteOf = list => list.filter(b => b.discount > 0).map(b => `Combo ${b.name}: -R$ ${b.discount.toLocaleString('pt-BR')}`).join(' | ');
      let bundleNote = noteOf(bundleInfo.applied);
      let totalFinal = myTotal - couponDiscount - bundleDiscount - pointsDiscount + freight.value;
      const itens = myOrders.map(o => {
        const p = products.find(x => x.id === o.peptideId);
        if (!p) return `• [produto removido] ×${o.qty}`;
        return `• ${p.name} ×${o.qty||0} = R$ ${(p.price * (o.qty||0)).toLocaleString('pt-BR')}`;
      }).join('\n');
      const pagamentoLabel = checkout.pagamento === 'pix' ? 'PIX (à vista)' : 'Cartão 2x (juros Mercado Pago)';
      const buildMsg = () => `🧬 *PEDIDO VANGUARD PEPTIDES*

👤 *Dados do Cliente*
Nome: ${checkout.nomeCompleto}
CPF: ${checkout.cpf}
Telefone: ${checkout.telefone}
E-mail: ${checkout.email}

📦 *Endereço de Entrega*
${checkout.rua}, ${checkout.numero}${checkout.complemento ? ' — '+checkout.complemento : ''}
${checkout.bairro} — ${checkout.cidade}/${checkout.estado}
CEP: ${checkout.cep}

🛒 *Itens*
${itens}

💳 *Pagamento:* ${pagamentoLabel}

💰 *Resumo*
Subtotal: R$ ${subtotalFinal.toLocaleString('pt-BR')}
Frete: ${freight.value === 0 ? 'GRÁTIS' : 'R$ ' + freight.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}${freight.reason ? ' (' + freight.reason + ')' : ''}${bundleDiscount > 0 ? '\n🎁 ' + bundleNote.split(' | ').join('\n🎁 ') : ''}${couponDiscount > 0 ? '\n🏷️ Cupom '+appliedCoupon.code+': -R$ '+couponDiscount.toLocaleString('pt-BR') : ''}${pointsDiscount > 0 ? '\n⭐ Pontos VG ('+pointsUsed+' pts): -R$ '+pointsDiscount.toLocaleString('pt-BR') : ''}
*Total: R$ ${totalFinal.toLocaleString('pt-BR')}*${checkout.observacoes ? '\n\n📝 *Obs:* ' + checkout.observacoes : ''}`;

      // Salvar pedido via Edge Function (preços validados server-side)
      let orderCode = null;
      if (myOrders.length > 0) {
        const orderItems = myOrders.map(o => ({
          peptideId: o.peptideId, name: (products.find(x=>x.id===o.peptideId)||{}).name||o.peptideId,
          qty: o.qty, _packId: o._packId||null,
        }));
        try {
          const createRes = await fetch('https://aumubzvdhzvtnqfzqeqd.supabase.co/functions/v1/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
            body: JSON.stringify({
              buyer_name: checkout.nomeCompleto,
              phone: checkout.telefone,
              email: checkout.email,
              cpf: checkout.cpf,
              address: { rua: checkout.rua, numero: checkout.numero, complemento: checkout.complemento,
                          bairro: checkout.bairro, cidade: checkout.cidade, estado: checkout.estado, cep: checkout.cep },
              items: orderItems,
              payment: checkout.pagamento,
              coupon_code: appliedCoupon ? appliedCoupon.code : null,
              // Combos e pontos são validados e gravados pelo servidor (que também debita os pontos)
              bundles: bundleInfo.applied.map(b => b.id),
              points: pointsUsed,
              notes: checkout.observacoes || null,
            }),
          });
          const createData = await createRes.json();
          if (!createData.ok) {
            showToast("Erro ao salvar pedido: " + (createData.error || 'tente novamente'), "error");
            if (/pontos/i.test(createData.error || '')) { setAppliedPoints(0); checkPoints(checkout.cpf); }
            return;
          }
          orderCode = createData.code;
          if (typeof createData.validatedTotal === 'number') {
            subtotalFinal = createData.validatedSubtotal;
            if (createData.freight !== freight.value) freight = { value: createData.freight, reason: '' };
            couponDiscount = createData.couponDiscount || 0;
            bundleDiscount = createData.bundleDiscount || 0;
            bundleNote = noteOf(createData.bundlesApplied || []);
            pointsUsed = createData.pointsUsed || 0;
            pointsDiscount = createData.pointsDiscount || 0;
            totalFinal = createData.validatedTotal;
          }
          // Atualiza o saldo local (o débito real já foi feito no servidor)
          if (pointsUsed > 0) {
            const clean = (checkout.cpf || '').replace(/\D/g, '');
            persistCustomers(customers.map(c => c.cpf === clean ? { ...c, points: Math.max(0, (c.points || 0) - pointsUsed) } : c));
          }
        } catch {
          showToast("Erro de conexão ao salvar pedido. Tente novamente.", "error");
          return;
        }
      }

      // Adiciona código ao final da mensagem WhatsApp (só para pedidos reais)
      const msg = buildMsg();
      const msgComCodigo = orderCode
        ? msg + `\n\n🔑 *Código do pedido:* \`${orderCode}\`\n_Use este código em vanguardpep.com → 📦 PEDIDO para acompanhar o status_`
        : msg;

      // Só abre WhatsApp e limpa carrinho após save confirmado
      window.open(`https://wa.me/447418333521?text=${encodeURIComponent(msgComCodigo)}`, '_blank');
      persistOrders(orders.filter(o => o._supabase || (o.buyerName || '').toLowerCase() !== myName.toLowerCase()));
      localStorage.removeItem('vg-checkout');
      setCheckoutOpen(false);
      setCheckoutStep(1);
      setDisclaimer(false);
      setAppliedCoupon(null);
      setCouponInput('');
      setAppliedPoints(0);
      setPointsBalance(null);
      setCartBundles([]);
      if (orderCode) setOrderSuccessCode(orderCode);
      setView("catalog");
    } finally {
      setIsSubmitting(false);
    }
  }

  function dismissNotice(id) {
    setDismissedNotices(d => [...d, id]);
  }
  function addNotice(notice) {
    const n = [...notices, { id: Date.now(), ...notice }];
    setNotices(n);
    localStorage.setItem('vg-notices', JSON.stringify(n));
  }
  function removeNotice(id) {
    const n = notices.filter(x=>x.id!==id);
    setNotices(n);
    localStorage.setItem('vg-notices', JSON.stringify(n));
  }
  function generateOrderCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'VG-';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

