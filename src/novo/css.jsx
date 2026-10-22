const NOVO_CSS = `
.novo-mode>nav,.novo-mode>.hero-banner,.novo-mode>.app,.novo-mode>.site-footer,.novo-mode>.mobile-bottom-nav{display:none!important}
.nv{--bg:#050a0e;--bg2:#0a1219;--bg3:#0f1c28;--ac:#00e5c3;--tx:#e2eaf0;--mu:#a9bfcb;--mu2:#7d9aa8;--ln:rgba(0,229,195,.12);--warn:#ffc46b;--err:#ff9f80;
  min-height:100vh;background:var(--bg);color:var(--tx);font-family:'DM Sans',sans-serif;position:relative;z-index:1}
.nv *{box-sizing:border-box}
.nv button,.nv input{font-family:inherit}
.nv a{color:var(--ac);text-decoration:none}
.nv-wrap{max-width:1100px;margin:0 auto;padding:0 16px}
.nv-top{position:sticky;top:0;z-index:20;background:rgba(5,10,14,.94);border-bottom:1px solid var(--ln);backdrop-filter:blur(6px)}
.nv-top .nv-wrap{display:flex;align-items:center;gap:8px;height:60px}
.nv .nv-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:20px;letter-spacing:.5px;background:none;border:none;color:var(--tx);cursor:pointer;padding:0}
.nv-links{display:none;gap:4px;margin-left:16px}
.nv-links button{height:40px;padding:0 12px;border:none;background:none;color:var(--mu);font-size:14px;cursor:pointer;border-radius:10px}
.nv-links button:hover{color:var(--tx)}
.nv-ico{width:44px;height:44px;border-radius:12px;border:none;background:transparent;color:var(--tx);display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative}
.nv-cartbtn{background:rgba(0,229,195,.1);color:var(--ac)}
.nv-badge{position:absolute;top:4px;right:4px;min-width:18px;height:18px;border-radius:9px;background:var(--ac);color:#04110e;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px}
.nv-strip{display:flex;justify-content:space-between;gap:8px;padding:10px 16px;background:var(--bg2);font-size:12px;color:var(--mu);max-width:1100px;margin:0 auto}
.nv-h1{font-family:'Syne',sans-serif;font-weight:800;font-size:30px;line-height:1.08;letter-spacing:-.5px;margin:0}
.nv-sub{margin:0;font-size:15px;line-height:1.45;color:var(--mu)}
.nv-search{display:flex;align-items:center;gap:10px;height:48px;padding:0 14px;border-radius:14px;background:var(--bg3);border:1px solid var(--ln);color:var(--mu2)}
.nv-search input{flex:1;min-width:0;height:100%;border:none;outline:none;background:transparent;color:var(--tx);font-size:16px}
.nv-chips{display:flex;gap:8px;overflow-x:auto;padding:12px 0;scrollbar-width:none}
.nv-chip{flex-shrink:0;height:40px;padding:0 16px;border-radius:20px;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;background:transparent;color:#c7d6de;border:1px solid rgba(0,229,195,.2)}
.nv-chip.on{background:var(--ac);color:#04110e;border-color:var(--ac)}
.nv-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding-bottom:24px}
.nv-card{display:flex;flex-direction:column;gap:10px;padding:0 0 10px;border-radius:16px;background:var(--bg2);border:1px solid rgba(0,229,195,.1);overflow:hidden;min-width:0}
.nv-ph{display:flex;align-items:center;justify-content:center;width:100%;color:rgba(0,229,195,.55);background:radial-gradient(70% 55% at 50% 45%,rgba(0,229,195,.12),transparent 70%),#070d12}
.nv-img{display:block;width:100%;height:auto;background:#050709}
.nv-pic{position:relative;display:block;width:100%;padding:0;border:none;background:#050709;cursor:pointer;overflow:hidden}
.nv-pic .nv-img,.nv-pic .nv-ph{aspect-ratio:4/5;object-fit:cover;object-position:50% 45%}
.nv-card.out .nv-pic .nv-img,.nv-card.out .nv-pic .nv-ph{filter:brightness(.62) saturate(.7)}
.nv-card.out .nv-pic::after{content:'';position:absolute;inset:0;background:rgba(5,10,14,.15)}
.nv-cfoot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 10px}
.nv-cfoot .nv-qty{flex-direction:row;gap:6px}
.nv-cfoot .nv-qty button{width:36px;height:40px}
.nv-cfoot .nv-add{width:44px;height:44px}
.nv-cfoot .nv-res{height:40px;padding:0 10px}
.nv-pdp{display:flex;flex-direction:column;gap:6px}
.nv-pdp-pic{width:100%;max-width:300px;margin:12px auto 0;border-radius:18px;overflow:hidden;border:1px solid var(--ln);background:#050709}
.nv-pdp-pic .nv-img,.nv-pdp-pic .nv-ph{aspect-ratio:4/5;object-fit:cover;object-position:50% 45%}
.nv-thumb{width:48px;height:60px;flex-shrink:0;border-radius:8px;overflow:hidden;border:1px solid var(--ln);background:#050709}
.nv-thumb .nv-img,.nv-thumb .nv-ph{width:100%;height:100%;aspect-ratio:auto;object-fit:cover;object-position:50% 45%}
.nv-thumb .nv-img{transform:scale(1.45)}
.nv-thumb .nv-ph svg{width:60%}
.nv-card.out{border-style:dashed;border-color:rgba(169,191,203,.3)}
.nv-cbody{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.nv-tag{align-self:flex-start;font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#ffb38f}
.nv-name{margin:0;font-size:15px;font-weight:600;line-height:1.25;background:none;border:none;color:var(--tx);padding:0;text-align:left;cursor:pointer}
.nv-desc{font-size:12px;line-height:1.35;color:var(--mu);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.nv-price{font-family:'Space Mono',monospace;font-size:15px;font-weight:700;margin-top:2px}
.nv-old{font-size:12px;font-weight:400;color:var(--mu2);text-decoration:line-through;margin-left:6px}
.nv-add{width:48px;height:48px;flex-shrink:0;border-radius:14px;border:1px solid rgba(0,229,195,.35);background:rgba(0,229,195,.08);color:var(--ac);display:flex;align-items:center;justify-content:center;cursor:pointer}
.nv-res{height:40px;padding:0 12px;flex-shrink:0;border-radius:12px;border:1px solid rgba(255,196,107,.5);background:transparent;color:var(--warn);font-size:13px;font-weight:700;cursor:pointer}
.nv-qty{display:flex;flex-direction:column;align-items:center;gap:2px;flex-shrink:0}
.nv-qty button{width:44px;height:34px;border-radius:10px;font-size:20px;cursor:pointer}
.nv-qty .p{border:none;background:var(--ac);color:#04110e;font-weight:700}
.nv-qty .m{border:1px solid rgba(0,229,195,.3);background:transparent;color:var(--ac)}
.nv-qty span{font-family:'Space Mono',monospace;font-size:13px;font-weight:700}
.nv-bar{position:fixed;left:0;right:0;bottom:0;z-index:15;padding:12px 16px 18px;background:linear-gradient(rgba(5,10,14,0),#050a0e 35%)}
.nv-barbtn{max-width:640px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;width:100%;height:58px;padding:0 20px;border-radius:16px;background:var(--ac);color:#04110e;border:none;cursor:pointer;font-weight:700;font-size:15px}
.nv-btn{height:56px;width:100%;border-radius:16px;border:none;background:var(--ac);color:#04110e;font-size:16px;font-weight:700;cursor:pointer}
.nv-btn:disabled{opacity:.6;cursor:wait}
.nv-btn2{height:50px;width:100%;border-radius:14px;border:1px solid rgba(0,229,195,.35);background:transparent;color:var(--ac);font-size:15px;font-weight:700;cursor:pointer}
.nv-back{display:flex;align-items:center;gap:8px;height:56px}
.nv-back h2{margin:0;font-family:'Syne',sans-serif;font-weight:700;font-size:18px}
.nv-box{padding:14px 16px;border-radius:16px;background:var(--bg2);border:1px solid rgba(0,229,195,.1)}
.nv-sec{display:flex;flex-direction:column;gap:12px;margin-top:22px}
.nv-sech{margin:0;display:flex;align-items:center;gap:10px;font-size:16px;font-weight:700}
.nv-num{width:24px;height:24px;border-radius:12px;background:var(--ac);color:#04110e;font-size:13px;display:flex;align-items:center;justify-content:center}
.nv-f{display:flex;flex-direction:column;gap:6px;min-width:0}
.nv-f label{font-size:13px;color:var(--mu)}
.nv-f input{height:50px;padding:0 14px;border-radius:12px;border:1px solid rgba(0,229,195,.18);background:var(--bg3);color:var(--tx);font-size:16px;outline:none;min-width:0;width:100%}
.nv-f input:focus{border-color:var(--ac)}
.nv-f.err input{border:1.5px solid #ff8a65}
.nv-f .msg{font-size:13px;color:var(--err)}
.nv-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.nv-pay{display:flex;align-items:center;gap:12px;min-height:64px;padding:12px 14px;border-radius:14px;cursor:pointer;background:var(--bg2);border:1.5px solid rgba(0,229,195,.14);color:var(--tx);text-align:left;width:100%}
.nv-pay.on{background:rgba(0,229,195,.08);border-color:var(--ac)}
.nv-dot{width:20px;height:20px;flex-shrink:0;border-radius:10px;border:2px solid #5a7a8a}
.nv-pay.on .nv-dot{border:6px solid var(--ac)}
.nv-row{display:flex;justify-content:space-between;font-size:14px;color:var(--mu)}
.nv-row b{font-family:'Space Mono',monospace;font-weight:400;color:var(--tx)}
.nv-total{display:flex;justify-content:space-between;align-items:baseline;padding-top:8px;border-top:1px solid var(--ln)}
.nv-check{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border-radius:12px;background:var(--bg2);border:1px solid var(--ln);cursor:pointer;font-size:13px;line-height:1.5;color:var(--mu);text-align:left}
.nv-check input{width:20px;height:20px;margin:1px 0 0;accent-color:#00e5c3;flex-shrink:0}
.nv-line{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:14px;padding:6px 0}
.nv-mini{display:flex;align-items:center;gap:4px}
.nv-mini button{width:34px;height:34px;border-radius:9px;border:1px solid rgba(0,229,195,.3);background:transparent;color:var(--ac);font-size:16px;cursor:pointer}
.nv-step{display:flex;gap:12px}
.nv-step i{display:flex;flex-direction:column;align-items:center;font-style:normal}
.nv-step i b{width:14px;height:14px;border-radius:7px;border:2px solid #3d5663}
.nv-step i b.on{background:var(--ac);border-color:var(--ac)}
.nv-step i u{width:2px;height:34px;background:rgba(0,229,195,.2)}
.nv-faq button{width:100%;min-height:56px;padding:14px 0;border:none;background:none;color:var(--tx);display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;font-size:15px;font-weight:600;cursor:pointer}
.nv-sorteio{position:relative;margin:12px auto 0;max-width:1068px;border-radius:16px;overflow:hidden;background:var(--bg2);border:1px solid var(--ln)}
.nv-sorteio-img{display:block;width:100%;padding:0;border:none;background:none;cursor:pointer}
.nv-sorteio-img img{display:block;width:100%;height:auto;aspect-ratio:2/3}
.nv-sorteio-t{display:none}
.nv-sorteio-x{position:absolute;top:8px;right:8px;z-index:2;width:34px;height:34px;border-radius:17px;border:1px solid rgba(255,255,255,.25);background:rgba(5,10,14,.7);color:#fff;font-size:20px;line-height:1;cursor:pointer}
@media (min-width:760px){
.nv-sorteio{display:grid;grid-template-columns:280px 1fr;align-items:center;gap:36px;padding:20px 48px 20px 20px;background:radial-gradient(120% 140% at 100% 0,rgba(0,229,195,.14),transparent 55%),var(--bg2)}
.nv-sorteio-img{width:280px;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.45)}
.nv-sorteio-t{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.nv-sorteio-tag{font-size:12px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--ac)}
.nv-sorteio-t h2{margin:0;font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(24px,2.6vw,32px);line-height:1.1;color:var(--tx)}
.nv-sorteio-t ul{margin:0;padding-left:18px;color:var(--mu);font-size:16px;line-height:1.6}
.nv-sorteio-t b{color:var(--tx)}
.nv-sorteio-t p{margin:0;font-size:13px;color:var(--mu2)}
.nv-sorteio-t .nv-btn{width:auto;padding:0 28px}
}
.nv-pwa{display:flex;align-items:center;gap:10px;margin:12px auto 0;max-width:1068px;padding:10px 12px;border-radius:12px;background:var(--bg2);border:1px solid var(--ln);font-size:13px;color:var(--mu);line-height:1.4}
.nv-pwa b{color:var(--tx)}
.nv-pwa .nv-pwa-t{flex:1;min-width:0}
.nv-pwa button{height:34px;padding:0 12px;border-radius:9px;border:1px solid rgba(0,229,195,.3);background:transparent;color:var(--ac);font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}
.nv-pwa button.nv-pwa-x{width:34px;padding:0;color:var(--mu);border-color:transparent;font-size:18px}
.nv-foot{border-top:1px solid var(--ln);margin-top:40px;padding:24px 0 140px;font-size:13px;color:var(--mu)}
.nv-h2{margin:0;font-family:'Syne',sans-serif;font-weight:700;font-size:20px}
.nv-combos{display:flex;gap:12px;overflow-x:auto;margin:0 -16px;padding:0 16px 6px;scroll-snap-type:x mandatory;scrollbar-width:none}
.nv-combo{flex:0 0 270px;scroll-snap-align:start;padding:16px;border-radius:18px;background:var(--bg2);border:1px solid rgba(0,229,195,.18);display:flex;flex-direction:column;gap:10px;overflow:hidden}
.nv-cimg{display:block;width:calc(100% + 32px);margin:-16px -16px 2px;max-width:none;height:auto;aspect-ratio:5/4;object-fit:cover;background:#050709;border-radius:18px 18px 0 0}
.nv-ccol{display:flex;align-items:flex-end;justify-content:center;overflow:hidden;padding:10% 0 0}
.nv-cvial{position:relative;display:block;flex:0 1 52%;min-width:0;margin:0 -9%;-webkit-mask-image:linear-gradient(90deg,transparent,#000 28%,#000 72%,transparent);mask-image:linear-gradient(90deg,transparent,#000 28%,#000 72%,transparent)}
.nv-cvial .nv-img,.nv-cvial .nv-ph{width:100%;height:auto;aspect-ratio:2/3;object-fit:cover}
.nv-pill{align-self:flex-start;padding:4px 8px;border-radius:6px;background:rgba(0,229,195,.14);color:#5ff3dc;font-size:11px;font-weight:700}
.nv-sku{height:30px;padding:0 8px;border-radius:8px;border:none;background:var(--bg3);font-family:'Space Mono',monospace;font-size:11px;font-weight:700;color:var(--ac);cursor:pointer}
.nv-art{display:flex;flex-direction:column;gap:14px;padding:4px 4px 0}
.nv-art h3{margin:10px 0 0;font-size:19px;font-weight:700;line-height:1.3}
.nv-art p,.nv-art li{margin:0;font-size:16px;line-height:1.65;color:#c7d6de}
.nv-art ul,.nv-art ol{margin:0;padding-left:22px;display:flex;flex-direction:column;gap:6px}
.nv-art strong{color:var(--tx)}
.nv-art blockquote{margin:0;padding-left:14px;border-left:2px solid var(--ln);color:var(--mu)}
.nv-kick{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--ac)}
@property --nv-a{syntax:'<angle>';initial-value:0deg;inherits:false}
.nv-hotrow{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:6px 2px 14px;margin:0 -2px;scrollbar-width:none}
.nv-hotrow::-webkit-scrollbar{display:none}
.nv-hot{flex:0 0 74%;max-width:300px;scroll-snap-align:start;padding:2px;border-radius:20px;position:relative;
  background:conic-gradient(from var(--nv-a),#00e5c3,#00a8ff,#7c5cff,#00e5c3 55%,#00e5c3 75%,#00a8ff);
  box-shadow:0 0 18px rgba(0,229,195,.22);animation:nv-spin 5s linear infinite}
.nv-hotin{position:relative;display:flex;flex-direction:column;gap:10px;height:100%;padding:0 0 12px;border-radius:18px;background:var(--bg2);overflow:hidden;min-width:0}
.nv-hotin.out .nv-pic .nv-img,.nv-hotin.out .nv-pic .nv-ph{filter:brightness(.62) saturate(.7)}
.nv-hotbadge{position:absolute;top:10px;left:10px;z-index:2;padding:5px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.3px;color:#04110e;background:linear-gradient(90deg,#00e5c3,#7ff5e0);box-shadow:0 2px 10px rgba(0,0,0,.4)}
.nv-hotname{font-size:17px;font-weight:700}
@keyframes nv-spin{to{--nv-a:360deg}}
@media (prefers-reduced-motion:reduce){.nv-hot{animation:none}}
.nv-hotrow.nv-marq{scroll-snap-type:none;overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;touch-action:pan-x pan-y;cursor:grab}
.nv-hotrow.nv-marq.drag{cursor:grabbing}
.nv-hotrow.nv-marq .nv-hot{scroll-snap-align:none;flex:0 0 min(74vw,280px);max-width:280px}
@media (min-width:760px){
  .nv-hotrow.nv-marq{display:flex;overflow-x:auto;padding-bottom:14px}
  .nv-hotrow.nv-marq .nv-hot{flex:0 0 290px;max-width:290px}
}
@media (min-width:760px){
  .nv-hotrow{overflow:visible;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));padding-bottom:6px}
  .nv-hot{flex:none;max-width:none}
  .nv-hotname{font-size:19px}
}
.nv-alist{display:flex;flex-direction:column}
.nv-alist button{display:flex;flex-direction:column;gap:4px;padding:14px 0;border:none;border-top:1px solid var(--ln);background:none;color:var(--tx);text-align:left;cursor:pointer;width:100%}
.nv-alist button:last-child{border-bottom:1px solid var(--ln)}
.nv-sheet{position:fixed;inset:0;z-index:40;background:rgba(0,0,0,.6);display:flex;align-items:flex-end;justify-content:center}
.nv-sheet>div{width:100%;max-width:520px;max-height:92vh;overflow:auto;background:var(--bg);border-radius:22px 22px 0 0;border:1px solid var(--ln);padding:20px 16px 24px;display:flex;flex-direction:column;gap:14px}
@media (min-width:760px){
  .nv-links{display:flex}
  .nv-h1{font-size:44px}
  .nv-grid{grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
  .nv-narrow{max-width:640px;margin:0 auto}
}
@media (min-width:900px){
  .nv-pdp-wrap{max-width:980px}
  .nv-pdp{display:grid;grid-template-columns:minmax(0,400px) minmax(0,1fr);column-gap:48px;align-items:start}
  .nv-pdp-pic{margin:18px 0 0;position:sticky;top:80px;max-width:none}
  .nv-pdp-pic .nv-img,.nv-pdp-pic .nv-ph{aspect-ratio:2/3}
  .nv-pdp-info{padding-top:18px}
}`;

