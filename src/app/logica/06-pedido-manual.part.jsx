// @fragmento do App() — lógica 6/8: pedido manual, reserva de estoque, edição de itens, parser de texto colado. Antes: 05-checkout.part.jsx | depois: 07-precos-pontos-preorders.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
  // Clientes já cadastrados (a partir de pedidos antigos com endereço), deduplicados por CPF/nome
  function pastCustomers() {
    const seen = {};
    orders.filter(o => o._supabase).forEach(o => {
      const key = (o._cpf || '').replace(/\D/g,'') || (o.buyerName||'').trim().toLowerCase();
      if (!key) return;
      const ts = o.createdAt ? new Date(o.createdAt).getTime() : 0;
      if (!seen[key] || ts > seen[key]._ts) {
        seen[key] = { name:o.buyerName||'', cpf:o._cpf||'', phone:o._phone||'', email:o._email||'', address:o._address||null, _ts:ts };
      }
    });
    return Object.values(seen).sort((a,b)=>b._ts-a._ts);
  }

  function fillManualFromCustomer(c) {
    const a = c.address || {};
    setManualOrder(m => ({ ...m,
      name: c.name||'', cpf: c.cpf||'', phone: c.phone||'', email: c.email||'',
      cep: a.cep||'', rua: a.rua||'', numero: a.numero||'', complemento: a.complemento||'',
      bairro: a.bairro||'', cidade: a.cidade||'', estado: a.estado||'',
    }));
    setManualCustomerSearch('');
    showToast('Dados do cliente preenchidos ✓','success');
  }

  // Pedidos manuais (admin e link "Formulário de Pedido") não passam pelo carrinho, então reservam
  // aqui, com a mesma RPC do carrinho (decrement_stock: nunca deixa o saldo negativo, devolve -1).
  // Só produtos com controle de estoque (linha em stock). Se faltar algum, devolve o que já reservou.
  async function releaseOrderStock(reserved) {
    if (!sb || !reserved || !reserved.length) return;
    for (const r of reserved) {
      try {
        const { data: back, error } = await sb.rpc('increment_stock', { p_product_id: r.pid, p_qty: r.qty });
        if (error) { console.warn('[Estoque] devolução falhou:', r.pid, error.message); continue; }
        if (back != null) setStock(prev => { const s = { ...prev, [r.pid]: back }; try { localStorage.setItem('vg-stock', JSON.stringify(s)); } catch {} return s; });
      } catch (e) { console.warn('[Estoque] devolução falhou:', r.pid, e && e.message); }
    }
  }
  async function reserveOrderStock(items) {
    const agg = {};
    (items || []).forEach(it => { const q = Math.max(0, parseInt(it.qty, 10) || 0); if (it.peptideId && q) agg[it.peptideId] = (agg[it.peptideId] || 0) + q; });
    const reserved = [];
    for (const [pid, qty] of Object.entries(agg)) {
      if (!sb || stock[pid] == null) continue; // sem controle de estoque
      let nq = null, error = null;
      try { ({ data: nq, error } = await sb.rpc('decrement_stock', { p_product_id: pid, p_qty: qty })); } catch (e) { error = e; }
      if (error || nq === -1) {
        await releaseOrderStock(reserved);
        const p = products.find(x => x.id === pid);
        return { ok: false, reserved: [], error: error ? 'Não foi possível reservar o estoque. Tente de novo.' : `Estoque insuficiente de ${p ? p.name : pid}` };
      }
      reserved.push({ pid, qty });
      if (nq != null) setStock(prev => { const s = { ...prev, [pid]: nq }; try { localStorage.setItem('vg-stock', JSON.stringify(s)); } catch {} return s; });
    }
    return { ok: true, reserved };
  }

  // Editar itens de um pedido do admin: ajusta o estoque só pela diferença (antes × depois).
  // Aumentos baixam (decrement_stock, via reserveOrderStock) ANTES de gravar e voltam se a gravação
  // falhar; reduções/remoções devolvem (increment_stock) só DEPOIS de gravar. Só produtos com linha em stock.
  const itemsSavingRef = React.useRef(false);
  function stockDiffOfEdit(oldItems, newItems) {
    const sum = list => (list || []).reduce((m, it) => { const q = parseInt(it.qty, 10) || 0; if (it.peptideId && q > 0) m[it.peptideId] = (m[it.peptideId] || 0) + q; return m; }, {});
    const a = sum(oldItems), b = sum(newItems);
    const add = [], back = [];
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach(pid => {
      if (stock[pid] == null) return; // sem controle de estoque
      const d = (b[pid] || 0) - (a[pid] || 0);
      if (d > 0) add.push({ peptideId: pid, qty: d });
      else if (d < 0) back.push({ pid, qty: -d });
    });
    return { add, back };
  }
  async function saveOrderItemsEdit() {
    if (itemsSavingRef.current) return; // evita baixar duas vezes com clique duplo
    if (editItems.length === 0) { showToast('Pedido precisa de ao menos 1 item', 'error'); return; }
    const od = orderDetail;
    const oldItems = od._items && od._items.length ? od._items : [{ peptideId: od.peptideId, qty: od.qty || 1 }];
    const { add, back } = od._supabase ? stockDiffOfEdit(oldItems, editItems) : { add: [], back: [] };
    if (add.length || back.length) {
      const nm = pid => (products.find(p => p.id === pid) || {}).name || pid;
      const lines = [
        ...add.map(x => `− baixar ${x.qty} de ${nm(x.peptideId)}`),
        ...back.map(x => `+ devolver ${x.qty} de ${nm(x.pid)}`),
      ];
      if (!window.confirm(`Salvar itens do pedido ${od._code || '#' + od.id}?\n\nAjuste de estoque:\n${lines.join('\n')}`)) return;
    }
    itemsSavingRef.current = true;
    try {
      const newSubtotal = editItems.reduce((s, it) => { const p2 = products.find(x => x.id === it.peptideId); return s + (it.price || (p2 ? p2.price : 0)) * (it.qty || 1); }, 0);
      const isPix = (od._payment || '').toLowerCase().includes('pix');
      const newFreight = isPix ? 0 : (od._freight ?? 60);
      const newTotal = orderTotalWith(newSubtotal, newFreight, od._discounts, od._discounts && od._discounts.manual);
      const resv = await reserveOrderStock(add);
      if (!resv.ok) { showToast(resv.error + ' — pedido não alterado', 'error'); return; }
      if (sb) {
        let error = null;
        try { ({ error } = await sb.from('orders').update({ items: editItems, subtotal: newSubtotal, freight: newFreight, total: newTotal }).eq('id', od.id)); } catch (e) { error = e; }
        if (error) {
          await releaseOrderStock(resv.reserved);
          showToast('Erro ao salvar no servidor: ' + (error.message || error) + ' — estoque não alterado', 'error');
          return;
        }
      }
      await releaseOrderStock(back);
      const updated = { ...od, _items: editItems, _subtotal: newSubtotal, _freight: newFreight, _total: newTotal,
        qty: editItems.reduce((s, it) => s + (parseInt(it.qty, 10) || 0), 0), peptideId: editItems[0].peptideId };
      persistOrders(orders.map(o => o.id === od.id ? updated : o));
      setOrderDetail(updated);
      setEditItemsMode(false);
      showToast('Pedido atualizado ✓' + (add.length || back.length ? ' (estoque ajustado)' : ''), 'success');
    } finally { itemsSavingRef.current = false; }
  }

  async function createManualOrder() {
    if (manualOrderSubmitting) return;
    if (!manualOrder.name.trim()) { showToast('Informe o nome do cliente','error'); return; }
    if (!manualOrder.items.length) { showToast('Adicione pelo menos um produto','error'); return; }
    setManualOrderSubmitting(true);
    let resv = null;
    try {
      const orderItems = manualOrder.items.map(it => {
        const p = products.find(x=>x.id===it.peptideId);
        return { peptideId: it.peptideId, name: p?p.name:it.peptideId, qty: it.qty||1, _packId: it._packId||null };
      });
      // Baixa o estoque antes de criar (o create-order recusa só saldo negativo, então passa)
      resv = await reserveOrderStock(orderItems);
      if (!resv.ok) { showToast(resv.error, 'error'); resv = null; return; }
      const res = await fetch('https://aumubzvdhzvtnqfzqeqd.supabase.co/functions/v1/create-order', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'apikey': SUPABASE_KEY },
        body: JSON.stringify({
          buyer_name: manualOrder.name.trim(),
          phone: manualOrder.phone || '',
          email: manualOrder.email || null,
          cpf: manualOrder.cpf || null,
          address: { rua:manualOrder.rua, numero:manualOrder.numero, complemento:manualOrder.complemento,
                     bairro:manualOrder.bairro, cidade:manualOrder.cidade, estado:manualOrder.estado, cep:manualOrder.cep },
          items: orderItems,
          payment: manualOrder.payment,
          notes: manualOrder.notes ? ('[PEDIDO MANUAL] ' + manualOrder.notes) : '[PEDIDO MANUAL]',
        }),
      });
      const data = await res.json();
      if (!data.ok) { await releaseOrderStock(resv.reserved); resv = null; showToast('Erro ao criar pedido: ' + (data.error||'tente novamente'),'error'); return; }
      resv = null; // pedido gravado: a reserva fica com ele (remover o pedido devolve o estoque)
      showToast('Pedido manual criado ✓ ' + data.code,'success');
      setManualOrderModal(false);
      setManualOrder(MANUAL_ORDER_EMPTY);
      setManualCustomerSearch('');
      setManualAddItemId('');
      fetchOrdersFromSupabase();
    } catch {
      if (resv) { await releaseOrderStock(resv.reserved); resv = null; }
      showToast('Erro de conexão ao criar pedido','error');
    } finally {
      setManualOrderSubmitting(false);
    }
  }

  // Parser de texto colado → preenche campos do pedido manual
  function parseAndFillManualOrder(raw) {
    if (!raw || !raw.trim()) { showToast('Cole o texto do cliente primeiro','error'); return; }
    const text = raw.replace(/\r/g, '');
    const found = {};
    let foundCount = 0;
    const mark = (k,v) => { if (v && !found[k]) { found[k] = v; foundCount++; } };

    // CPF: 11 dígitos com ou sem máscara
    const cpfMatch = text.match(/(\d{3}[.\s-]?\d{3}[.\s-]?\d{3}[.\s-]?\d{2})/);
    if (cpfMatch) mark('cpf', cpfMatch[1].replace(/\D/g,''));

    // CEP: 8 dígitos com ou sem hífen
    const cepMatch = text.match(/(\d{5}-?\d{3})\b/);
    if (cepMatch) mark('cep', cepMatch[1].replace(/\D/g,''));

    // E-mail
    const emailMatch = text.match(/[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/);
    if (emailMatch) mark('email', emailMatch[0]);

    // Telefone: 10 ou 11 dígitos, opcionalmente com (DDD), espaços, hífens, +55
    const phoneMatch = text.match(/(?:\+?55\s?)?\(?\d{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}/);
    if (phoneMatch) {
      const digits = phoneMatch[0].replace(/\D/g,'');
      // Remove "55" do início se ficou com 12-13 dígitos
      const clean = digits.length >= 12 && digits.startsWith('55') ? digits.slice(2) : digits;
      if (clean.length >= 10) mark('phone', clean);
    }

    // Parse linha-a-linha pra labels comuns
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const labelMap = [
      ['name',       /^(?:nome(?:\s+completo)?|cliente)\s*[:=-]\s*(.+)$/i],
      ['rua',        /^(?:rua|endere[çc]o|logradouro|av(?:enida)?\.?)\s*[:=-]\s*(.+)$/i],
      ['numero',     /^(?:n[úu]mero|n[ºo°]?|num)\s*[:=-]?\s*(\d+\w*)/i],
      ['complemento',/^(?:complemento|compl|apto?|apartamento|bloco)\s*[:=-]\s*(.+)$/i],
      ['bairro',     /^(?:bairro)\s*[:=-]\s*(.+)$/i],
      ['cidade',     /^(?:cidade|munic[íi]pio)\s*[:=-]\s*(.+)$/i],
      ['estado',     /^(?:estado|uf)\s*[:=-]\s*([A-Za-z]{2,})/i],
    ];
    for (const line of lines) {
      for (const [field, re] of labelMap) {
        const m = line.match(re);
        if (m) {
          let v = m[1].trim();
          if (field === 'estado') v = v.toUpperCase().slice(0,2);
          mark(field, v);
          break;
        }
      }
    }

    // Padrão "Rua X, 123 - Bairro - Cidade/UF" em uma linha
    if (!found.rua || !found.numero || !found.cidade) {
      const fullAddr = text.match(/((?:Rua|R\.|Av\.?|Avenida|Travessa|Tv\.?|Alameda|Al\.?|Estrada|Rod\.?|Rodovia)[^\n,]+),\s*(\d+\w*)([^\n]*)/i);
      if (fullAddr) {
        mark('rua', fullAddr[1].trim());
        mark('numero', fullAddr[2]);
        const rest = fullAddr[3] || '';
        const cityUfMatch = rest.match(/([A-Za-zÀ-ú\s]+?)\s*[\/-]\s*([A-Za-z]{2})\b/);
        if (cityUfMatch) {
          mark('cidade', cityUfMatch[1].trim());
          mark('estado', cityUfMatch[2].toUpperCase());
        }
      }
    }

    // Nome: se ainda não achou, primeira linha de 2+ palavras só com letras
    if (!found.name) {
      for (const line of lines) {
        if (/^[A-Za-zÀ-ú\s']{4,}$/.test(line) && line.split(/\s+/).length >= 2) {
          mark('name', line);
          break;
        }
      }
    }

    // Pagamento: detecta menção a PIX ou cartão
    const lower = text.toLowerCase();
    if (/\bpix\b/.test(lower)) mark('payment', 'pix');
    else if (/cart[ãa]o|2x|cr[ée]dito/.test(lower)) mark('payment', 'cartao');

    if (foundCount === 0) {
      showToast('Não encontrei nenhum campo reconhecível','error');
      return;
    }

    setManualOrder(m => ({ ...m, ...found }));
    setManualPasteOpen(false);
    setManualPasteText('');
    showToast(`${foundCount} campo${foundCount!==1?'s':''} preenchido${foundCount!==1?'s':''} ✓`,'success');

    // Se achou CEP, busca endereço automaticamente caso rua/cidade não tenham vindo
    if (found.cep && (!found.rua || !found.cidade)) {
      fetch(`https://viacep.com.br/ws/${found.cep}/json/`).then(r=>r.json()).then(d=>{
        if (!d || d.erro) return;
        setManualOrder(m => ({ ...m,
          estado: m.estado || d.uf || '',
          cidade: m.cidade || d.localidade || '',
          bairro: m.bairro || d.bairro || '',
          rua: m.rua || d.logradouro || '',
        }));
      }).catch(()=>{});
    }
  }

