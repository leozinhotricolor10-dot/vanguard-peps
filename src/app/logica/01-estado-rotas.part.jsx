// @fragmento do App() — lógica 1/8: abre function App(), useState/useEffect iniciais e rotas por hash. Antes: src/novo/loja.jsx | depois: 02-notificacoes-status.part.jsx. Não é JS válido sozinho: tools/montar.js junta na ordem de src/manifest.json (esta linha é descartada).
function App() {
  const [orders, setOrders] = useState(loadOrders);
  const [products, setProducts] = useState(loadProducts);
  const [stock, setStock] = useState(loadStock);
  // ── HASH ROUTING ─────────────────────────────────────────────────────────────
  function parseHash(hash) {
    const h = (hash || window.location.hash).replace(/^#\/?/, '');
    if (!h || h === 'catalogo' || h === 'catalog') return { view: 'catalog', productSlug: null };
    if (h === 'blog' || h === 'artigos') return { view: 'blog', productSlug: null };
    if (h === 'faq') return { view: 'faq', productSlug: null };
    if (h === 'carrinho' || h === 'cart') return { view: 'cart', productSlug: null };
    if (h === 'calcular' || h === 'calc') return { view: 'calc', productSlug: null };
    if (h === 'frete') return { view: 'frete', productSlug: null };
    if (h === 'admin') return { view: 'admin', productSlug: null };
    if (h.startsWith('produto/')) return { view: 'detail', productSlug: h.replace('produto/', '') };
    return { view: 'catalog', productSlug: null };
  }

  const hashInit = parseHash();
  const [view, setViewState] = useState(hashInit.view);
  const [activeCat, setActiveCat] = useState("all");

  function setView(v, product) {
    setViewState(v);
    let hash = '';
    if (v === 'catalog')     hash = '#/catalogo';
    else if (v === 'blog')   hash = '#/blog';
    else if (v === 'faq')    hash = '#/faq';
    else if (v === 'cart')   hash = '#/carrinho';
    else if (v === 'calc')   hash = '#/calcular';
    else if (v === 'frete')  hash = '#/frete';
    else if (v === 'admin')  hash = '#/admin';
    else if (v === 'detail' && product) hash = `#/produto/${product.id}`;
    else if (v === 'detail' && selectedProduct) hash = `#/produto/${selectedProduct.id}`;
    else hash = '#/catalogo';
    window.history.pushState(null, '', hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  React.useEffect(() => {
    // Restore product on deep link to /produto/slug
    const { view: initView, productSlug } = parseHash();
    if (initView === 'detail' && productSlug && products.length) {
      const found = products.find(p => p.id === productSlug);
      if (found) { setSelectedProduct(found); setViewState('detail'); }
      else setViewState('catalog');
    }
    // Handle browser back/forward
    function onPop() {
      const { view: v, productSlug: slug } = parseHash();
      setViewState(v);
      if (v === 'detail' && slug) {
        const found = products.find(p => p.id === slug);
        if (found) setSelectedProduct(found);
      }
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);  // eslint-disable-line
  const [myName, setMyName] = useState(() => localStorage.getItem("vg-nome") || "");
  const [toast, setToast]   = useState(null);
  const toastTimerRef = React.useRef(null);
  const [modal, setModal]   = useState(null);
  const [formQty, setFormQty] = useState(1);
  const [formName, setFormName] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const adminLockRef = React.useRef({ attempts: 0, until: 0 }); // session-only, cannot be cleared via localStorage
  const adminPwRef = React.useRef(''); // senha só em memória, usada p/ ler/gravar a pool de remetentes no Supabase
  const [adminTab, setAdminTab] = useState("pedidos");
  const [prodForm, setProdForm] = useState(null); // null = fechado, {} = novo, {id} = editando
  const [packForm, setPackForm] = useState(null); // null = fechado, {} = novo pack em edição
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameModalInput, setNameModalInput] = useState("");
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem("vg-welcomed") && !localStorage.getItem("vg-nome"));
  const [isLoading, setIsLoading] = useState(!!sb);
  const [checkout, setCheckout] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vg-checkout') || 'null') || { nomeCompleto:'', cpf:'', telefone:'', email:'', cep:'', estado:'', cidade:'', bairro:'', rua:'', numero:'', complemento:'', pagamento:'', observacoes:'' }; } catch { return { nomeCompleto:'', cpf:'', telefone:'', email:'', cep:'', estado:'', cidade:'', bairro:'', rua:'', numero:'', complemento:'', pagamento:'', observacoes:'' }; }
  });
  const [checkoutErrors, setCheckoutErrors] = useState({});
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [notifyInputs, setNotifyInputs] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [prevView, setPrevView] = useState(null);
  const [notices, setNotices] = useState(()=>{ try { return JSON.parse(localStorage.getItem('vg-notices')||JSON.stringify([{ id:1, type:'warn', text:'Devido à alta demanda de alguns produtos, recomendamos que você faça a reserva do seu pedido para não correr o risco de ficar sem.' }])); } catch { return [{ id:1, type:'warn', text:'Devido à alta demanda de alguns produtos, recomendamos que você faça a reserva do seu pedido para não correr o risco de ficar sem.' }]; } });
  const [dismissedNotices, setDismissedNotices] = useState([]);
  const [noticeInput, setNoticeInput] = useState({type:'warn',text:''});
  const [preorders, setPreorders] = useState(()=>{ try { return JSON.parse(localStorage.getItem('vg-preorders')||'[]'); } catch { return []; } });
  const [portalToken, setPortalToken] = useState(()=>{
    const params = new URLSearchParams(window.location.search);
    return params.get('preorder') || null;
  });
  const [manualOrderView] = useState(()=>{
    const params = new URLSearchParams(window.location.search);
    return params.get('pedido') !== null;
  });
  const [manualForm, setManualForm] = useState({ nomeCompleto:'', cpf:'', telefone:'', email:'', cep:'', rua:'', numero:'', complemento:'', bairro:'', cidade:'', estado:'', pagamento:'pix', observacoes:'' });
  const [manualItems, setManualItems] = useState([]); // [{peptideId, qty}]
  const [manualErrors, setManualErrors] = useState({});
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(null); // {code, total}
  const [openFaq, setOpenFaq] = useState(null);
  const [openGuide, setOpenGuide] = useState(null);
  const [prodSearch, setProdSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [artForm, setArtForm] = useState(null);
  const [adminPoForm, setAdminPoForm] = useState(null);
  const [adminPoEditModal, setAdminPoEditModal] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [editItemsMode, setEditItemsMode] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null); // form de dados do cliente/endereço do pedido (antes da etiqueta)
  const canEditCustomer = o => !!o && !o.me_order_id && !['enviado','entregue','cancelado'].includes(o.status||'pendente');
  function openEditCustomer(o) {
    const a = o._address || o.address || {};
    setEditCustomer({ buyerName: o.buyerName||'', cpf: o._cpf||'', phone: o._phone||'', email: o._email||'', cep: a.cep||'', rua: a.rua||'', numero: a.numero||'', complemento: a.complemento||'', bairro: a.bairro||'', cidade: a.cidade||'', estado: a.estado||'' });
  }
  async function editCustomerCep(v) {
    setEditCustomer(f => ({ ...f, cep: v }));
    const clean = v.replace(/\D/g, '');
    if (clean.length !== 8) return;
    try {
      const d = await (await fetch(`https://viacep.com.br/ws/${clean}/json/`)).json();
      if (!d.erro) setEditCustomer(f => ({ ...f, rua: d.logradouro || f.rua, bairro: d.bairro || f.bairro, cidade: d.localidade || f.cidade, estado: d.uf || f.estado }));
    } catch {}
  }
  async function saveEditCustomer() {
    const f = editCustomer, o = orderDetail;
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) { showToast('E-mail inválido', 'error'); return; }
    if (f.cpf && !validarCPF(f.cpf)) { showToast('CPF inválido', 'error'); return; }
    const address = { ...(o._address || o.address || {}), rua: f.rua.trim(), numero: f.numero.trim(), complemento: f.complemento.trim(), bairro: f.bairro.trim(), cidade: f.cidade.trim(), estado: normUF(f.estado), cep: f.cep.trim() };
    const patch = { buyer_name: f.buyerName.trim(), cpf: f.cpf.trim(), phone: f.phone.trim(), email: f.email.trim(), address };
    if (sb && o._supabase) {
      const { error } = await sb.from('orders').update(patch).eq('id', o.id);
      if (error) { showToast('Erro ao salvar: ' + error.message, 'error'); return; }
    }
    const updated = { ...o, buyerName: patch.buyer_name, _cpf: patch.cpf, _phone: patch.phone, _email: patch.email, _address: address, address };
    persistOrders(orders.map(x => x.id === o.id ? updated : x));
    setOrderDetail(updated); setEditCustomer(null);
    showToast('Dados do pedido atualizados');
  }
  const [editItems, setEditItems] = useState([]);
  const [addItemProductId, setAddItemProductId] = useState('');
  const [discountInput, setDiscountInput] = useState(null); // null = fechado, string = editando
  const [discountSaving, setDiscountSaving] = useState(false);
  const MANUAL_ORDER_EMPTY = { name:'', cpf:'', phone:'', email:'', cep:'', rua:'', numero:'', complemento:'', bairro:'', cidade:'', estado:'', payment:'pix', notes:'', items:[] };
  const [manualOrderModal, setManualOrderModal] = useState(false);
  const [manualOrder, setManualOrder] = useState(MANUAL_ORDER_EMPTY);
  const [manualCustomerSearch, setManualCustomerSearch] = useState('');
  const [manualOrderSubmitting, setManualOrderSubmitting] = useState(false);
  const [manualAddItemId, setManualAddItemId] = useState('');
  const [manualPasteOpen, setManualPasteOpen] = useState(false);
  const [manualPasteText, setManualPasteText] = useState('');
  const [legalModal, setLegalModal] = useState(null); // 'privacy' | 'terms'
  const [preorderModal, setPreorderModal] = useState(null); // {peptide}
  const [preorderLocked, setPreorderLocked] = useState(()=> localStorage.getItem('vg-preorder-locked') === 'true');
  const [preorderForm, setPreorderForm] = useState({name:'', whatsapp:'', qty:1});
  const [trackModal, setTrackModal] = useState(false);
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResults, setTrackResults] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [orderSuccessCode, setOrderSuccessCode] = useState(null);
  const [coupons, setCoupons] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-coupons')||'[]'); } catch { return []; } });
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState(null);
  const [productPromo, setProductPromo] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-promo')||'{}'); } catch { return {}; } });
  const [importForm, setImportForm] = useState({ label:'', date: new Date().toLocaleDateString('pt-BR'), cambio:'', freteUsd:'', fedexBrl:'', desconto:'', outrosBrl:'', invoiceTotal:'', items:[{sku:'',name:'',spec:'',boxes:'',priceUsd:'',precoSugOverride:'',precoVenda:''}] });
  const [importHistory, setImportHistory] = useState(()=>{ try { return JSON.parse(localStorage.getItem('vg-imports')||'[]'); } catch { return []; } });
  const [stockLots, setStockLots] = useState(()=>{ try { return JSON.parse(localStorage.getItem('vg-stock-lots')||'{}'); } catch { return {}; } });
  const [editingImportId, setEditingImportId] = useState(null);
  const [despesas, setDespesas] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-expenses')||'[]'); } catch { return []; } });
  const [despesaForm, setDespesaForm] = useState({ desc:'', valor:'', categoria:'outros', data: new Date().toLocaleDateString('pt-BR') });
  const [shippingCosts, setShippingCosts] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-shipping-costs')||'{}'); } catch { return {}; } });
  const [purchaseOrders, setPurchaseOrders] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-purchase-orders')||'[]'); } catch { return []; } });
  const [poForm, setPoForm] = useState({ productId:'', qty:'', note:'' });
  const [adminPwModal, setAdminPwModal] = useState(false);
  const [adminPwInput, setAdminPwInput] = useState('');
  const [showStickyDetailCta, setShowStickyDetailCta] = useState(false);
  const detailActionsRef = React.useRef(null);
  function persistDespesas(d) { setDespesas(d); localStorage.setItem('vg-expenses', JSON.stringify(d)); }
  function persistShippingCosts(s) { setShippingCosts(s); localStorage.setItem('vg-shipping-costs', JSON.stringify(s)); }
  function persistPurchaseOrders(pos) { setPurchaseOrders(pos); localStorage.setItem('vg-purchase-orders', JSON.stringify(pos)); }
  function addPurchaseOrder() {
    if (!poForm.productId || !poForm.qty || parseInt(poForm.qty) <= 0) { showToast('Selecione o produto e a quantidade', 'error'); return; }
    const newPo = { id: Date.now().toString(), productId: poForm.productId, qty: parseInt(poForm.qty), note: poForm.note, status: 'pending', date: new Date().toLocaleDateString('pt-BR') };
    persistPurchaseOrders([...purchaseOrders, newPo]);
    if (sb) sb.from('purchase_order_caps').insert({ id: newPo.id, product_id: newPo.productId, qty: newPo.qty, note: newPo.note||null, status: newPo.status, date_str: newPo.date }).then(({error})=>{ if(error) console.warn('[Supabase] PO insert:', error.message); });
    setPoForm({ productId:'', qty:'', note:'' });
    showToast('Pedido de reposição registrado ✓');
  }
  function receivePurchaseOrder(id) {
    const po = purchaseOrders.find(p => p.id === id);
    if (!po) return;
    persistPurchaseOrders(purchaseOrders.map(p => p.id === id ? { ...p, status: 'received' } : p));
    if (sb) sb.from('purchase_order_caps').update({ status: 'received' }).eq('id', id).then(({error})=>{ if(error) console.warn('[Supabase] PO update:', error.message); });
    const pName = products.find(p => p.id === po.productId)?.name || po.productId;
    showToast(`Pedido de "${pName}" marcado como recebido ✓`);
  }
  function removePurchaseOrder(id) {
    persistPurchaseOrders(purchaseOrders.filter(p => p.id !== id));
    if (sb) sb.from('purchase_order_caps').delete().eq('id', id).then(({error})=>{ if(error) console.warn('[Supabase] PO delete:', error.message); });
  }
  const [cambioInfo, setCambioInfo] = useState({ loading: false, hora: null, error: null });
  const [meSettings, setMeSettings] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-me-settings')||'null'); } catch { return null; } });
  const [etiquetaModal, setEtiquetaModal] = useState(null); // order being processed
  const [etiquetaStep, setEtiquetaStep] = useState('idle'); // idle | settings | select | confirm | loading | done | error
  const [etiquetaResult, setEtiquetaResult] = useState(null);
  const [etiquetaError, setEtiquetaError] = useState('');
  const [meServices, setMeServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [mePool, setMePool] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-me-pool')||'null') || DEFAULT_ME_POOL; } catch { return DEFAULT_ME_POOL; } });
  async function callSendersApi(action, pool) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/me-senders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
      body: JSON.stringify({ password: adminPwRef.current, action, pool }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }
  const persistPool = p => {
    setMePool(p); localStorage.setItem('vg-me-pool', JSON.stringify(p));
    if (adminPwRef.current) callSendersApi('set', p).catch(e => { console.warn('[me-senders] save:', e.message); showToast('Pool salva só neste navegador — falha ao sincronizar', 'error'); });
  };
  React.useEffect(() => {
    if (!adminUnlocked || !adminPwRef.current) return;
    callSendersApi('get').then(({ pool }) => {
      if (Array.isArray(pool) && pool.length) { setMePool(pool); localStorage.setItem('vg-me-pool', JSON.stringify(pool)); }
      else if (mePool.length) callSendersApi('set', mePool).catch(() => {}); // primeira sync: sobe a pool local
    }).catch(e => console.warn('[me-senders] load:', e.message));
  }, [adminUnlocked]);
  const [meEnv, setMeEnvState] = useState(() => { try { return localStorage.getItem('vg-me-env') === 'sandbox' ? 'sandbox' : 'prod'; } catch { return 'prod'; } });
  const isSandbox = meEnv === 'sandbox';
  const [meTestPool, setMeTestPool] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-me-pool-test')||'null') || TEST_ME_POOL; } catch { return TEST_ME_POOL; } });
  const persistTestPool = p => { const t = p.map(x => ({ ...x, _test: true })); setMeTestPool(t); localStorage.setItem('vg-me-pool-test', JSON.stringify(t)); };
  const activePool = isSandbox ? meTestPool : mePool.filter(x => !isTestSender(x));
  const persistActivePool = p => isSandbox ? persistTestPool(p) : persistPool(p);
  function setMeEnv(env) {
    setMeEnvState(env); localStorage.setItem('vg-me-env', env);
    // remetente ativo é separado por ambiente: produção usa o salvo, teste começa vazio
    if (env === 'sandbox') setMeSettings(null);
    else { try { const s = JSON.parse(localStorage.getItem('vg-me-settings')||'null'); setMeSettings(isTestSender(s) ? null : s); } catch { setMeSettings(null); } }
    setMeBalance(null);
  }
  const [poolRecovering, setPoolRecovering] = useState(false);
  async function recoverPoolFromME() {
    setPoolRecovering(true);
    try {
      const found = [];
      for (let page = 1, last = 1; page <= last; page++) {
        const r = await callME(`/me/orders?per_page=100&page=${page}`);
        last = r.last_page || 1;
        for (const o of (r.data || [])) {
          const f = o.from || {}; const doc = (f.document || '').replace(/\D/g, '');
          if (!f.name || doc.length !== 11 || !validarCPF(doc) || BLOCKED_SENDER_DOCS.has(doc)) continue;
          const key = doc + '|' + (f.postal_code || '');
          if (found.some(x => x.document + '|' + x.postal_code === key)) continue;
          found.push({ name: f.name, document: doc, phone: f.phone || '', email: f.email || '', address: f.address || '', number: f.number || '', complement: f.complement || '', district: f.district || '', city: f.city || '', state: normUF(f.state_abbr || f.state || ''), postal_code: (f.postal_code || '').replace(/\D/g, '') });
        }
      }
      const fresh = found.filter(x => !mePool.some(m => (m.document || '').replace(/\D/g, '') === x.document && (m.postal_code || '').replace(/\D/g, '') === x.postal_code));
      if (fresh.length) { persistPool([...mePool, ...fresh]); showToast(`${fresh.length} remetente(s) recuperado(s) do Melhor Envios`); }
      else showToast('Nenhum remetente novo no histórico do Melhor Envios');
    } catch (e) { showToast('Erro ao consultar Melhor Envios: ' + e.message, 'error'); }
    setPoolRecovering(false);
  }
  const [meBalance, setMeBalance] = useState(null); // null | { value, loading, error }
  async function fetchMeBalance() {
    setMeBalance({ loading: true });
    try {
      const res = await callME('/me', 'GET', null, meEnv);
      const full = JSON.stringify(res);
      console.log('[ME /me full]', full);
      const val = res?.accounts?.[0]?.balance ?? null;
      if (val === null) throw new Error(full);
      const numVal = parseFloat(val);
      setMeBalance({ value: numVal });
      if (numVal < 20) addNotif('balance', '⚠️ Saldo ME baixo', `Carteira Melhor Envios: R$ ${numVal.toFixed(2)}. Adicione saldo para gerar etiquetas.`);
    } catch(e) {
      setMeBalance({ error: e.message });
    }
  }
  const [declNome, setDeclNome] = useState('Peptídeo');
  const [declQtd, setDeclQtd] = useState('1');
  const [declValor, setDeclValor] = useState('');
  const [freteDestCep, setFreteDestCep] = useState('');
  const [freteResults, setFreteResults] = useState(null);
  const [freteLoading, setFreteLoading] = useState(false);
  const [freteError, setFreteError] = useState('');
  const [freteOriginCep, setFreteOriginCep] = useState('');

  const [declPeso, setDeclPeso] = useState('0.3');
  const [declLarg, setDeclLarg] = useState('6');
  const [declAlt, setDeclAlt] = useState('5');
  const [declComp, setDeclComp] = useState('12');
  const [editingRem, setEditingRem] = useState(false);
  const [editTrackInput, setEditTrackInput] = useState(null); // null = fechado, string = editando
  const [meForm, setMeForm] = useState({ name:'', phone:'', email:'', document:'', address:'', number:'', complement:'', district:'', city:'', state:'', postal_code:'' });
  const [customers, setCustomers] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-customers')||'[]'); } catch { return []; } });
  const [appliedPoints, setAppliedPoints] = useState(0);
  // Combos cadastrados (site_config.bundles; cache local + seed DEFAULT_BUNDLES)
  const [bundles, setBundles] = useState(loadBundlesCache);
  const [bestsellers, setBestsellers] = useState(loadBestsellersCache); // site_config.bestsellers (SKUs/ids em ordem)
  const [bundleForm, setBundleForm] = useState(null); // admin: combo em edição
  // Combos adicionados pelo /novo (ids de bundles); desconto calculado em bundleInfo
  const [cartBundles, setCartBundlesState] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-cart-bundles') || '[]'); } catch { return []; } });
  function setCartBundles(ids) { setCartBundlesState(ids); try { localStorage.setItem('vg-cart-bundles', JSON.stringify(ids)); } catch {} }
  const [pointsBalance, setPointsBalance] = useState(null); // null | {cpf,points,...}
  const [pointsConfig, setPointsConfig] = useState(() => { try { return JSON.parse(localStorage.getItem('vg-points-config')||'null') || { rate: 1, redeem: 5 }; } catch { return { rate: 1, redeem: 5 }; } });
  const [pixModal, setPixModal] = useState(null); // order | null
  const [pixCode, setPixCode] = useState('');
  const [clientList, setClientList] = useState([]); // aba Clientes
  const [adjustModal, setAdjustModal] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState('');
  const [cfgRate, setCfgRate] = useState(() => String(JSON.parse(localStorage.getItem('vg-points-config')||'null')?.rate || 1));
  const [cfgRedeem, setCfgRedeem] = useState(() => String(JSON.parse(localStorage.getItem('vg-points-config')||'null')?.redeem || 5));
  const [disclaimer, setDisclaimer] = useState(false);
  const [adminStatusFilter, setAdminStatusFilter] = useState('all');
  const [waAuto, setWaAuto] = useState(() => { try { return localStorage.getItem('vg-wa-auto') === '1'; } catch { return false; } }); // abrir WhatsApp ao mudar status (padrão: desligado)
  function toggleWaAuto(v) { setWaAuto(v); try { localStorage.setItem('vg-wa-auto', v ? '1' : '0'); } catch {} }
  const [nvaSec, setNvaSec] = useState('pedidos'); // item do menu do admin no /novo (Etiquetas = Pedidos filtrado)
  const [nvaSelOrder, setNvaSelOrder] = useState(null); // pedido aberto no painel lateral (Pedidos no /novo, desktop largo)
  const [adminSearch, setAdminSearch] = useState('');
  const [adminPage, setAdminPage] = useState(1);
  const [groupByClient, setGroupByClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInStock, setFilterInStock] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [carouselTouchX, setCarouselTouchX] = useState(null);

