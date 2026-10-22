// @fragmento do App() — lógica 4/8: Supabase (produtos, estoque, clientes, cupons, despesas, importações, pedidos) + realtime. Antes: 03-melhor-envios-cambio.part.jsx | depois: 05-checkout.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
  // ── Supabase: carregar products + realtime ────────────────────────────────
  React.useEffect(() => {
    if (!sb) return;
    // Safety timeout: if Supabase hangs, stop showing loading overlay after 8s
    const loadingTimeout = setTimeout(() => setIsLoading(false), 8000);
    try {
      function convertProducts(data) {
        return data.map(p => ({
          id: p.id, sku: p.sku || '', name: p.name || '', desc: p.description || '',
          category: p.category || 'emagrecedores', price: Number(p.price) || 0,
          hot: p.hot || false, badge: p.badge || null,
          compounds: p.compounds || null,
          _custoVial: p.cost_per_vial ? Number(p.cost_per_vial) : null,
          packs: p.packs || [],
          image_url: p.image_url || null,
          promo: Number(p.promo) || 0,
        }));
      }
      function syncPromosFromData(data) {
        const promos = {};
        data.forEach(p => { const v = Number(p.promo) || 0; if (v > 0) promos[p.id] = v; });
        setProductPromo(promos);
        localStorage.setItem('vg-promo', JSON.stringify(promos));
      }
      sb.from('products').select('*').order('sort_order', { ascending: true }).then(({ data, error }) => {
        clearTimeout(loadingTimeout);
        setIsLoading(false);
        if (error) { console.warn('[Supabase] Products fetch error:', error.message); return; }
        if (data && data.length > 0) {
          const converted = convertProducts(data);
          setProducts(converted);
          localStorage.setItem('vg-products', JSON.stringify(converted));
          syncPromosFromData(data);
        }
      });
      const prodChannel = sb.channel('products-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          sb.from('products').select('*').order('sort_order', { ascending: true }).then(({ data }) => {
            if (data && data.length > 0) {
              const converted = convertProducts(data);
              setProducts(converted);
              localStorage.setItem('vg-products', JSON.stringify(converted));
              syncPromosFromData(data);
            }
          });
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') console.log('[Supabase] Produtos em tempo real conectados!');
        });
      return () => { clearTimeout(loadingTimeout); sb.removeChannel(prodChannel); };
    } catch(e) { clearTimeout(loadingTimeout); setIsLoading(false); console.warn('[Supabase] Products effect error:', e.message); }
  }, []);

  // ── Supabase: sync stock on mount + real-time subscription ────────────────
  React.useEffect(() => {
    // 1) Fetch current stock from Supabase and merge with local defaults
    if (!sb) return;
    try { sb.from('stock').select('product_id, quantity').then(({ data, error }) => {
      if (error) { console.warn('[Supabase] Fetch error:', error.message); showToast('Problema de conexão — usando dados locais', 'error'); return; }
      // Always merge even if empty — remote = {} means no rows, fall back to DEFAULT_STOCK only
      const remote = {};
      (data || []).forEach(row => { remote[row.product_id] = row.quantity; });
      const merged = { ...DEFAULT_STOCK, ...remote };
      setStock(merged);
      localStorage.setItem('vg-stock', JSON.stringify(merged));
    });

    // 2) Subscribe to real-time changes (quando admin atualiza estoque, todos veem)
    const channel = sb.channel('stock-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock' }, (payload) => {
        if (payload.new && payload.new.product_id !== undefined) {
          const qty = payload.new.quantity;
          setStock(prev => {
            const updated = { ...prev, [payload.new.product_id]: qty };
            localStorage.setItem('vg-stock', JSON.stringify(updated));
            return updated;
          });
          if (qty <= 3) {
            const pName = products.find(p => p.id === payload.new.product_id)?.name || payload.new.product_id;
            addNotif('stock', '⚠️ Estoque baixo', `${pName}: ${qty} unidade${qty !== 1 ? 's' : ''} restante${qty !== 1 ? 's' : ''}`, { productId: payload.new.product_id });
          }
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('[Supabase] Estoque em tempo real conectado!');
      });

    return () => sb.removeChannel(channel);
  } catch(e) { console.warn('[Supabase] Stock effect error:', e.message); }
  }, []);

  // ── Supabase: carregar customers ────────────────────────────────────────
  React.useEffect(() => {
    if (!sb) { setClientList(customers); return; }
    if (!adminUnlocked) return;
    sb.from('customers').select('*').order('points', { ascending: false }).then(({ data }) => {
      if (data) { setClientList(data); persistCustomers(data); }
    });
  }, [adminUnlocked]);

  // ── Supabase: carregar cupons ────────────────────────────────────────────
  React.useEffect(() => {
    if (!sb || !adminUnlocked) return;
    sb.from('coupons').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data && data.length > 0) {
        setCoupons(data.map(r => ({ id: r.id, code: r.code, type: r.type, value: r.value, minOrder: r.min_order, expiresAt: r.expires_at, active: r.active })));
      } else {
        // Migrar localStorage → Supabase
        const local = (() => { try { return JSON.parse(localStorage.getItem('vg-coupons')||'[]'); } catch { return []; } })();
        if (local.length > 0) {
          Promise.all(local.map(c => sb.from('coupons').insert({ code: c.code, type: c.type||'percent', value: c.value, min_order: c.minOrder||0, expires_at: c.expiresAt||null, active: c.active!==false }))).then(() => {
            sb.from('coupons').select('*').order('created_at', { ascending: false }).then(({ data: d2 }) => {
              if (d2) setCoupons(d2.map(r => ({ id: r.id, code: r.code, type: r.type, value: r.value, minOrder: r.min_order, expiresAt: r.expires_at, active: r.active })));
            });
          });
        }
      }
    });
  }, [adminUnlocked]);

  // ── Supabase: carregar despesas ──────────────────────────────────────────
  React.useEffect(() => {
    if (!sb || !adminUnlocked) return;
    sb.from('expenses').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data && data.length > 0) {
        setDespesas(data.map(r => ({ id: r.id, desc: r.description, valor: r.value, categoria: r.category, data: r.expense_date })));
      } else {
        // Migrar localStorage → Supabase
        const local = (() => { try { return JSON.parse(localStorage.getItem('vg-expenses')||'[]'); } catch { return []; } })();
        if (local.length > 0) {
          Promise.all(local.map(d => sb.from('expenses').insert({ description: d.desc, value: d.valor, category: d.categoria||'outros', expense_date: d.data||'' }))).then(() => {
            sb.from('expenses').select('*').order('created_at', { ascending: false }).then(({ data: d2 }) => {
              if (d2) setDespesas(d2.map(r => ({ id: r.id, desc: r.description, valor: r.value, categoria: r.category, data: r.expense_date })));
            });
          });
        }
      }
    });
  }, [adminUnlocked]);

  // ── Supabase: carregar histórico de importação e caps de reserva ──────────
  React.useEffect(() => {
    if (!sb || !adminUnlocked) return;
    // Import history
    sb.from('import_history').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) { console.warn('[Supabase] Import history fetch error:', error.message); return; }
      if (data && data.length > 0) {
        const hist = data.map(r => r.data);
        setImportHistory(hist);
        localStorage.setItem('vg-imports', JSON.stringify(hist));
      } else {
        // Migrar localStorage → Supabase na primeira vez
        const local = (() => { try { return JSON.parse(localStorage.getItem('vg-imports')||'[]'); } catch { return []; } })();
        if (local.length > 0) {
          Promise.all(local.map(h => sb.from('import_history').upsert({ id: String(h.id), data: h, status: h.status||'aguardando' }, { onConflict: 'id' })));
        }
      }
    });
    // Purchase order caps
    sb.from('purchase_order_caps').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) { console.warn('[Supabase] PO caps fetch error:', error.message); return; }
      if (data && data.length > 0) {
        const caps = data.map(r => ({ id: r.id, productId: r.product_id, qty: r.qty, note: r.note||'', status: r.status, date: r.date_str }));
        setPurchaseOrders(caps);
        localStorage.setItem('vg-purchase-orders', JSON.stringify(caps));
      } else {
        const local = (() => { try { return JSON.parse(localStorage.getItem('vg-purchase-orders')||'[]'); } catch { return []; } })();
        if (local.length > 0) {
          Promise.all(local.map(p => sb.from('purchase_order_caps').upsert({ id: String(p.id), product_id: p.productId, qty: p.qty, note: p.note||null, status: p.status||'pending', date_str: p.date||'' }, { onConflict: 'id' })));
        }
      }
    });
  }, [adminUnlocked]);

  // ── Tracking polling: check ME tracking events when admin unlocks ──────────
  React.useEffect(() => {
    if (!adminUnlocked) return;
    const enviados = orders.filter(o => o.status === 'enviado' && o.me_order_id);
    if (!enviados.length) return;
    let seen = {};
    try { seen = JSON.parse(localStorage.getItem('vg-tracking-seen')||'{}'); } catch {}
    const KEY_EVENTS = ['alfandega','customs','falhou','ausente','aguardando retirada','endereço incorreto','devolvido','retido'];
    (async () => {
      for (const order of enviados.slice(0, 8)) {
        try {
          const res = await callME(`/me/shipment/${order.me_order_id}/tracking`, 'GET');
          const events = Array.isArray(res) ? res : (res?.tracking || []);
          for (const ev of events) {
            const evId = `${order.me_order_id}|${ev.created_at||''}|${(ev.message||ev.description||'').slice(0,40)}`;
            if (seen[evId]) continue;
            const msg = (ev.message || ev.description || ev.status || '').toLowerCase();
            if (KEY_EVENTS.some(k => msg.includes(k))) {
              addNotif('tracking', `📍 Rastreio: ${order._code||''}`, ev.message || ev.description || ev.status, { orderId: order.id });
              seen[evId] = true;
            }
          }
        } catch { /* ignore per-order errors */ }
      }
      try { localStorage.setItem('vg-tracking-seen', JSON.stringify(seen)); } catch {}
    })();
  }, [adminUnlocked]);

  // ── Supabase: carregar pedidos e pré-orders + realtime ────────────────────
  function fetchOrdersFromSupabase() {
    if (!sb) return;
    sb.from('orders').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) { console.warn('[Supabase] Orders fetch error:', error.message); return; }
      if (data && data.length > 0) {
        const converted = data.map(o => ({
          id: o.id,
          peptideId: o.items && o.items[0] ? (o.items[0].peptideId || '') : '',
          buyerName: o.buyer_name || '',
          qty: o.items ? o.items.reduce((s, i) => s + (i.qty || 0), 0) : 1,
          createdAt: o.created_at,
          status: o.status || 'pendente',
          _supabase: true,
          _items: o.items,
          _total: o.total,
          _subtotal: o.subtotal,
          _freight: o.freight,
          _phone: o.phone,
          _email: o.email,
          _cpf: o.cpf,
          _address: o.address,
          _payment: o.payment,
          _notes: o.notes,
          _code: o.code,
          _discounts: orderDiscounts(o),
          me_order_id: o.me_order_id,
          tracking_code: o.tracking_code,
          label_url: o.label_url,
        }));
        setOrders(prev => {
          const localCart = prev.filter(o => !o._supabase);
          // Pedidos novos desde a última atualização (substitui o realtime, que o RLS bloqueia)
          const known = new Set(prev.filter(o => o._supabase && o._code !== undefined).map(o => o.id));
          if (known.size) converted.filter(o => !known.has(o.id)).forEach(o => {
            showToast('Novo pedido recebido! 🛒', 'success');
            addNotif('order', '🛒 Novo pedido recebido!', `${o.buyerName || 'Cliente'}${o._total ? ` • R$ ${parseFloat(o._total).toLocaleString('pt-BR')}` : ''}${o._code ? ` • ${o._code}` : ''}`, { orderId: o.id });
          });
          const merged = [...localCart, ...converted];
          saveOrders(merged);
          return merged;
        });
      }
    });
  }

  function fetchPreordersFromSupabase() {
    if (!sb) return;
    sb.from('preorders').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) { console.warn('[Supabase] Preorders fetch error:', error.message); return; }
      if (!data) return;
      const converted = data.map(po => ({
        id: po.id, token: po.token || '', productId: po.product_id || '', productName: po.product_name || '',
        name: po.name || '', whatsapp: po.whatsapp || '', qty: po.qty || 1, status: po.status || 'pending',
        date: po.date || '', ts: po.ts || Date.now(),
        notifiedAt: po.notified_at ? new Date(po.notified_at).getTime() : null,
        reminderSent: po.reminder_sent || false,
      }));
      setPreorders(prev => {
        const localOnly = prev.filter(p => p._mine && !converted.find(c => c.id === p.id));
        const merged = [...localOnly, ...converted];
        localStorage.setItem('vg-preorders', JSON.stringify(merged));
        return merged;
      });
    });
  }

  // Loja (sem senha): só o necessário para calcular estoque reservado, sem dados pessoais
  async function loadPublicSnapshot() {
    const snap = await publicApi('snapshot');
    if (!snap || snap.error) { console.warn('[public-api] snapshot:', snap && snap.error); return; }
    const conv = (snap.orders || []).map(o => ({
      id: o.id, peptideId: o.items && o.items[0] ? (o.items[0].peptideId || '') : '', buyerName: '',
      qty: (o.items || []).reduce((s, i) => s + (i.qty || 0), 0), status: o.status, _supabase: true, _items: o.items,
    }));
    setOrders(prev => { const merged = [...prev.filter(o => !o._supabase), ...conv]; saveOrders(merged); return merged; });
    setPreorders(prev => {
      // Mantém os detalhes só das reservas feitas neste aparelho
      const mine = prev.filter(p => p._mine || (p.token && myName && (p.name || '').toLowerCase() === myName.toLowerCase()));
      const server = (snap.preorders || []).map(po => {
        const local = mine.find(m => m.id === po.id);
        return local ? { ...local, qty: po.qty, status: po.status, _mine: true }
          : { id: po.id, productId: po.product_id, qty: po.qty || 1, status: po.status, name: '', token: '' };
      });
      const merged = [...mine.filter(m => !server.some(x => x.id === m.id)).map(m => ({ ...m, _mine: true })), ...server];
      localStorage.setItem('vg-preorders', JSON.stringify(merged));
      return merged;
    });
    const hist = (snap.imports || []);
    setImportHistory(hist);
    localStorage.setItem('vg-imports', JSON.stringify(hist));
    const caps = (snap.caps || []).map(r => ({ id: r.id, productId: r.product_id, qty: r.qty, note: '', status: r.status }));
    setPurchaseOrders(caps);
    localStorage.setItem('vg-purchase-orders', JSON.stringify(caps));
  }

  // Re-fetch sempre que admin é desbloqueado, e a cada 30s enquanto o admin estiver aberto
  React.useEffect(() => {
    if (!adminUnlocked) return;
    fetchOrdersFromSupabase(); fetchPreordersFromSupabase();
    const t = setInterval(() => { fetchOrdersFromSupabase(); fetchPreordersFromSupabase(); }, 30000);
    return () => clearInterval(t);
  }, [adminUnlocked]);

  React.useEffect(() => {
    if (!sb) return;
    try {
    // Dados pessoais em cache de versões antigas do site
    try { localStorage.removeItem('vg-customers'); } catch {}
    loadPublicSnapshot();
    if (portalToken) publicApi('preorder_get', { token: portalToken }).then(r => {
      const po = r && r.preorder;
      if (!po) return;
      const conv = {
        id: po.id, token: po.token, productId: po.product_id, productName: po.product_name, name: po.name,
        whatsapp: po.whatsapp, qty: po.qty, status: po.status, date: po.date, ts: po.ts,
        notifiedAt: po.notified_at ? new Date(po.notified_at).getTime() : null, reminderSent: po.reminder_sent || false, _mine: true,
      };
      setPreorders(prev => [conv, ...prev.filter(x => x.id !== po.id)]);
    });

    // Realtime: novos pedidos e atualizações de status aparecem no admin automaticamente
    const ordersChannel = sb.channel('orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.new) {
          const o = payload.new;
          const converted = {
            id: o.id, peptideId: o.items && o.items[0] ? (o.items[0].peptideId || '') : '',
            buyerName: o.buyer_name || '', qty: o.items ? o.items.reduce((s,i)=>s+(i.qty||0),0) : 1,
            createdAt: o.created_at, status: o.status || 'pendente',
            _supabase: true, _items: o.items, _total: o.total,
            _subtotal: o.subtotal, _freight: o.freight, _cpf: o.cpf,
            _phone: o.phone, _email: o.email, _address: o.address,
            _payment: o.payment, _notes: o.notes, _code: o.code, _discounts: orderDiscounts(o),
            me_order_id: o.me_order_id, tracking_code: o.tracking_code, label_url: o.label_url,
          };
          setOrders(prev => [converted, ...prev.filter(x => x.id !== o.id)]);
          showToast('Novo pedido recebido! 🛒', 'success');
          addNotif('order', '🛒 Novo pedido recebido!', `${o.buyer_name || 'Cliente'}${o.total ? ` • R$ ${parseFloat(o.total).toLocaleString('pt-BR')}` : ''}${o.code ? ` • ${o.code}` : ''}`, { orderId: o.id });
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.new) {
          const o = payload.new;
          setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: o.status } : x));
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.old && payload.old.id) {
          setOrders(prev => prev.filter(x => x.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'preorders' }, (payload) => {
        if (payload.new) {
          const po = payload.new;
          const converted = {
            id: po.id, token: po.token, productId: po.product_id, productName: po.product_name,
            name: po.name, whatsapp: po.whatsapp, qty: po.qty, status: po.status,
            date: po.date, ts: po.ts, notifiedAt: null, reminderSent: false,
          };
          setPreorders(prev => [converted, ...prev.filter(x => x.id !== po.id)]);
          showToast('Nova reserva recebida! 📋', 'success');
          addNotif('preorder', '📋 Nova pré-order!', `${po.name || 'Cliente'} reservou ${po.product_name || 'produto'}${po.qty && po.qty > 1 ? ` ×${po.qty}` : ''}`, { preorderId: po.id });
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('[Supabase] Pedidos em tempo real conectados!');
      });

    return () => sb.removeChannel(ordersChannel);
    } catch(e) { console.warn('[Supabase] Orders effect error:', e.message); }
  }, []);

