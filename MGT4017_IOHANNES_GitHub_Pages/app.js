(() => {
  'use strict';
  const products = [
    {id:'studio-tee',name:'Studio Tee',category:'tee',categoryLabel:'T-SHIRT',colour:'Chalk',price:38,image:'assets/tee-chalk.svg',description:'An everyday oversized tee with a clean graphic detail. Created as a concept piece for IOHANNES Drop 001.'},
    {id:'symbol-tee',name:'Symbol Tee',category:'tee',categoryLabel:'T-SHIRT',colour:'Washed Black',price:42,image:'assets/tee-black.svg',description:'Relaxed proportions and a bold signature mark. A staple designed to wear on your own terms.'},
    {id:'core-crew',name:'Core Crewneck',category:'crew',categoryLabel:'SWEATSHIRT',colour:'Graphite',price:72,image:'assets/crew-graphite.svg',description:'The statement layer. Minimal branding, an easy fit and a premium, heavyweight feel in mind.'},
    {id:'archive-crew',name:'Archive Crewneck',category:'crew',categoryLabel:'SWEATSHIRT',colour:'Oat',price:78,image:'assets/crew-oat.svg',description:'Subtle branding, considered proportions and a softer neutral palette for everyday rotation.'},
    {id:'form-jogger-dark',name:'Form Sweatpants',category:'jogger',categoryLabel:'SWEATPANTS',colour:'Charcoal',price:64,image:'assets/jogger-charcoal.svg',description:'Relaxed everyday sweatpants with a structured silhouette and understated branding.'},
    {id:'form-jogger-stone',name:'Form Sweatpants',category:'jogger',categoryLabel:'SWEATPANTS',colour:'Stone',price:64,image:'assets/jogger-stone.svg',description:'The essential matching piece, designed to work as a set or on its own.'}
  ];
  const $ = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));
  const money = (v)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(v);
  let cart=[]; let selectedProduct=null; let selectedSize=null; let category='all'; let toastTimer;
  const overlay=$('#overlay'), drawer=$('#bag-drawer'), modal=$('#product-modal'),checkout=$('#checkout-modal');
  function closeMobile(){ $('#main-nav').classList.remove('open'); $('#mobile-toggle').setAttribute('aria-expanded','false'); }
  function route(){
    const routeStr=window.location.hash.replace(/^#/,'')||'home';
    const [routeName,paramStr]=routeStr.split('?');
    const page=['home','shop','account','about','support','terms','privacy'].includes(routeName)?routeName:'home';
    $$('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+page));
    $$('[data-nav]').forEach(a=>{const active=a.getAttribute('data-nav')===page;a.classList.toggle('active',active); if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    if(page==='shop'){
      const params=new URLSearchParams(paramStr||'');
      const filter=params.get('category'); if(filter&&['tee','crew','jogger','all'].includes(filter)) category=filter;
      updateFilterButtons(); renderProducts();
    }
    closeAll();closeMobile(); window.scrollTo({top:0,behavior:'instant'});
    document.title=(page==='home'?'IOHANNES — Streetwear, on your terms.':`${page.charAt(0).toUpperCase()+page.slice(1)} — IOHANNES`);
  }
  function updateFilterButtons(){ $$('.filter').forEach(f=>{ const active=f.dataset.category===category; f.classList.toggle('active',active); f.setAttribute('aria-pressed',String(active));}); }
  function renderProducts(){
    const sort=$('#sort-products').value;
    const arr=products.filter(p=>category==='all'||p.category===category);
    if(sort==='price-low')arr.sort((a,b)=>a.price-b.price);if(sort==='price-high')arr.sort((a,b)=>b.price-a.price);
    $('#product-count').textContent=String(arr.length).padStart(2,'0')+' PIECES';
    $('#products-grid').innerHTML=arr.map(p=>`<button type="button" class="product-card" data-product="${p.id}" aria-label="View ${p.name} in ${p.colour}, ${money(p.price)}"><div class="product-picture"><img src="${p.image}" alt="${p.colour} ${p.name} fashion concept" loading="lazy"><span class="product-badge">DROP 001</span><span class="card-arrow" aria-hidden="true">↗</span></div><div class="product-details"><div><div class="item-meta">${p.categoryLabel} / ${p.colour.toUpperCase()}</div><h3>${p.name}</h3><p>Limited concept release</p></div><strong>${money(p.price)}</strong></div></button>`).join('');
    $$('[data-product]').forEach(el=>el.addEventListener('click',()=>openProduct(el.dataset.product)));
  }
  function setOverlay(visible){overlay.classList.toggle('hidden',!visible);document.body.classList.toggle('modal-open',visible);}
  function closeAll(){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');checkout.classList.remove('open');checkout.setAttribute('aria-hidden','true');setOverlay(false);}
  function openDrawer(){closeAll();renderBag();drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');setOverlay(true);$('#bag-close').focus();}
  function openProduct(id){selectedProduct=products.find(p=>p.id===id);if(!selectedProduct)return;selectedSize=null;closeAll();$('#modal-name').textContent=selectedProduct.name;$('#modal-price').textContent=money(selectedProduct.price);$('#modal-image').src=selectedProduct.image;$('#modal-image').alt=selectedProduct.colour+' '+selectedProduct.name+' design illustration';$('#modal-description').textContent=selectedProduct.description;$('#size-selected').textContent='—';$('#size-options').innerHTML=['XS','S','M','L','XL'].map(s=>`<button type="button" class="size" data-size="${s}" aria-pressed="false">${s}</button>`).join('');$$('.size').forEach(b=>b.addEventListener('click',()=>{selectedSize=b.dataset.size;$('#size-selected').textContent=selectedSize;$$('.size').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});}));modal.classList.add('open');modal.setAttribute('aria-hidden','false');setOverlay(true);$('#product-close').focus();}
  function showToast(message){clearTimeout(toastTimer);const t=$('#toast');t.textContent=message;t.classList.add('show');toastTimer=setTimeout(()=>t.classList.remove('show'),3200);}
  function addToBag(){if(!selectedProduct)return;if(!selectedSize){showToast('Choose a size first.');return;}const key=selectedProduct.id+'-'+selectedSize;const existing=cart.find(x=>x.key===key);if(existing){existing.qty=Math.min(10,existing.qty+1)}else cart.push({key,productId:selectedProduct.id,size:selectedSize,qty:1});updateBagCount();openDrawer();showToast('Added to your demo bag.');}
  function updateBagCount(){const count=cart.reduce((s,x)=>s+x.qty,0);$('#bag-count').textContent=count;$('#drawer-count').textContent='('+count+')';}
  function renderBag(){
    if(cart.length===0){$('#bag-items').innerHTML='<div class="empty-bag"><div>◎</div><h3>YOUR BAG IS EMPTY.</h3><p>Find your next favourite piece in Drop 001.</p></div>';}else{$('#bag-items').innerHTML=cart.map(x=>{const p=products.find(p=>p.id===x.productId);return `<div class="bag-row"><img src="${p.image}" alt="${p.name}"><div><h3>${p.name}</h3><p>${p.colour} / Size ${x.size}</p><strong>${money(p.price*x.qty)}</strong><div class="bag-row-bottom"><div class="qty-buttons"><button aria-label="Decrease quantity" data-qty="${x.key}" data-change="-1">−</button><span>${x.qty}</span><button aria-label="Increase quantity" data-qty="${x.key}" data-change="1">+</button></div><button class="remove-item" data-remove="${x.key}">Remove</button></div></div></div>`}).join('');}
    const total=cart.reduce((s,x)=>s+products.find(p=>p.id===x.productId).price*x.qty,0);$('#subtotal').textContent=money(total);$('#checkout-button').disabled=cart.length===0;
    $$('[data-qty]').forEach(b=>b.addEventListener('click',()=>{const item=cart.find(x=>x.key===b.dataset.qty);if(item){item.qty+=Number(b.dataset.change);if(item.qty<1)cart=cart.filter(x=>x!==item);if(item.qty>10)item.qty=10;}updateBagCount();renderBag();}));
    $$('[data-remove]').forEach(b=>b.addEventListener('click',()=>{cart=cart.filter(x=>x.key!==b.dataset.remove);updateBagCount();renderBag();}));
  }
  function openCheckout(){const total=cart.reduce((s,x)=>s+products.find(p=>p.id===x.productId).price*x.qty,0);closeAll();$('#checkout-total').textContent=money(total);checkout.classList.add('open');checkout.setAttribute('aria-hidden','false');setOverlay(true);$('#checkout-close').focus();}
  function showForm(which){$$('.form-tab').forEach(b=>{const a=b.dataset.form===which;b.classList.toggle('active',a);b.setAttribute('aria-selected',String(a));});$('#register-form').classList.toggle('hidden',which!=='register');$('#signin-form').classList.toggle('hidden',which!=='signin');$('#account-success').classList.add('hidden');}
  $('#bag-open').addEventListener('click',openDrawer);$('#bag-close').addEventListener('click',closeAll);$('#product-close').addEventListener('click',closeAll);$('#checkout-close').addEventListener('click',closeAll);$('#checkout-done').addEventListener('click',()=>{closeAll();location.hash='#shop';});overlay.addEventListener('click',closeAll);$('#add-to-bag').addEventListener('click',addToBag);$('#checkout-button').addEventListener('click',openCheckout);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeAll();closeMobile();}});
  $('#mobile-toggle').addEventListener('click',()=>{const open=$('#main-nav').classList.toggle('open');$('#mobile-toggle').setAttribute('aria-expanded',String(open));});
  $$('.filter').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;updateFilterButtons();renderProducts();}));$('#sort-products').addEventListener('change',renderProducts);
  $$('.form-tab').forEach(b=>b.addEventListener('click',()=>showForm(b.dataset.form)));
  $('#register-form').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget;const err=$('#register-error');err.textContent='';if(!f.reportValidity())return;if(f.elements.password.value!==f.elements.confirm.value){err.textContent='Passwords do not match.';return;}$('#account-greeting').textContent='WELCOME, '+f.elements.first.value.trim().toUpperCase()+'.';$('#update-choice').textContent=f.elements.updates.checked?'Opted in (demo)':'Off';f.reset();$('#register-form').classList.add('hidden');$('#signin-form').classList.add('hidden');$('#account-success').classList.remove('hidden');});
  $('#signin-form').addEventListener('submit',e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;showToast('Sign-in preview only — no real account service is connected.');});
  $('#account-reset').addEventListener('click',()=>showForm('register'));
  $('#contact-form').addEventListener('submit',e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;e.currentTarget.reset();showToast('Message preview complete — no message was sent.');});
  window.addEventListener('hashchange',route);updateBagCount();route();
})();
