(() => {
  "use strict";

  const STORE = {
    brand: "SOS STORE",
    instagram: "https://instagram.com/sos_sstorre",
    checkoutWhatsApp: "",
    themes: ["beige","dark","red"],
    tags: ["all","new","popular","limited","sale","accessory","classic","sport","lux"],
    collections: [
      { id:"c1", title:"New Arrivals", sub:"جاهز للتعبئة", tag:"new", color:"red" },
      { id:"c2", title:"Best Sellers", sub:"الأكثر طلبًا", tag:"popular", color:"blue" },
      { id:"c3", title:"Accessories", sub:"لمسة فخمة", tag:"accessory", color:"green" },
      { id:"c4", title:"Limited", sub:"كميات محدودة", tag:"limited", color:"yellow" },
      { id:"c5", title:"Classic", sub:"ستايل ثابت", tag:"classic", color:"blue" },
      { id:"c6", title:"Sport", sub:"خفيف وحيوي", tag:"sport", color:"green" },
      { id:"c7", title:"Sale", sub:"عروض", tag:"sale", color:"red" },
      { id:"c8", title:"Luxury", sub:"فخامة", tag:"lux", color:"yellow" }
    ],
    products: seedProducts()
  };

  function seedProducts(){
    const now = Date.now();
    const day = 86400000;
    const items = [];
    let n = 1;

    const make = (collectionId, tags) => {
      for(let i=0;i<22;i++){
        const id = "p" + (n++);
        const title = "SOS Item " + id.toUpperCase();
        const desc = "صورة داخلية باسم المحل + وصف جاهز للتعبئة بدون تعقيد.";
        const price = 10 + (n % 13) * 4;
        const createdAt = now - (n * day);
        items.push({
          id: id,
          title: title,
          desc: desc,
          price: price,
          tags: unique(tags.concat(i%3===0?["popular"]:[]).concat(i%5===0?["limited"]:[])),
          collection: collectionId,
          createdAt: createdAt,
          image: placeholderImg(STORE.brand, title)
        });
      }
    };

    make("c1", ["new","classic","lux"]);
    make("c2", ["popular","classic"]);
    make("c3", ["accessory","lux"]);
    make("c4", ["limited","lux"]);
    make("c5", ["classic"]);
    make("c6", ["sport","new"]);
    make("c7", ["sale","popular"]);
    make("c8", ["lux","classic"]);

    return items;
  }

  function unique(arr){
    const seen = {};
    const out = [];
    for(let i=0;i<arr.length;i++){
      const k = arr[i];
      if(!k || seen[k]) continue;
      seen[k] = true;
      out.push(k);
    }
    return out;
  }

  function placeholderImg(brand, title){
    const bg = "#E7D9C4";
    const fg = "#201810";
    const t1 = escXML(String(brand || "SOS STORE").slice(0,18));
    const t2 = escXML(String(title || "SOON").slice(0,22));
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${bg}" stop-opacity="1"/>
            <stop offset="1" stop-color="#F8F0E3" stop-opacity="1"/>
          </linearGradient>
          <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="rgba(0,0,0,.18)"/>
          </filter>
        </defs>
        <rect width="1200" height="1200" fill="url(#g)"/>
        <rect x="86" y="86" width="1028" height="1028" rx="90" fill="rgba(255,255,255,.35)" stroke="rgba(32,24,16,.16)" filter="url(#s)"/>
        <text x="50%" y="46%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="96" fill="${fg}" opacity=".92" letter-spacing="10">${t1}</text>
        <text x="50%" y="57%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="34" fill="${fg}" opacity=".60">${t2}</text>
        <text x="50%" y="66%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="30" fill="${fg}" opacity=".55">SOON</text>
      </svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function escXML(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;" }[c]);
    });
  }

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  const LS = {
    theme: "sos_theme_v2",
    like: (id) => "sos_like_" + id,
    wish: "sos_wish_v2",
    cart: "sos_cart_v2",
    comments: (id) => "sos_comments_" + id
  };

  const state = {
    tag: "all",
    search: "",
    sort: "featured",
    pageSize: 20,
    page: 1,
    collectionId: null,
    collectionItems: [],
    lastFocus: null
  };

  document.addEventListener("DOMContentLoaded", function(){
    const year = $("#year");
    if(year) year.textContent = String(new Date().getFullYear());

    initTheme();
    initReveal();
    initTopButton();

    initControlsIfAny();
    buildTagSelectsIfAny();
    buildCollectionsIfAny();

    renderHomeProductsIfAny(false);

    bindGlobalHandlers();
    initCategoryPageIfAny();
    initProductPageIfAny();

    syncCounts();
  });

  function initTheme(){
    const saved = safeGetLocal(LS.theme);
    if(saved && indexOf(STORE.themes, saved) !== -1) document.documentElement.setAttribute("data-theme", saved);

    const btn = $("#themeBtn");
    if(!btn) return;

    syncThemeAria(btn);
    btn.addEventListener("click", function(){
      const cur = document.documentElement.getAttribute("data-theme") || "beige";
      const idx = indexOf(STORE.themes, cur);
      const next = STORE.themes[(idx + 1) % STORE.themes.length];
      document.documentElement.setAttribute("data-theme", next);
      safeSetLocal(LS.theme, next);
      syncThemeAria(btn);
      toast(next === "beige" ? "Beige" : next === "dark" ? "Dark" : "Red");
    });
  }

  function syncThemeAria(btn){
    const cur = document.documentElement.getAttribute("data-theme") || "beige";
    btn.setAttribute("aria-pressed", cur === "dark" ? "true" : "false");
  }

  function initReveal(){
    const els = $$(".reveal");
    if(els.length === 0) return;
    if(!("IntersectionObserver" in window)){
      for(let i=0;i<els.length;i++) els[i].classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(function(entries){
      for(let i=0;i<entries.length;i++){
        const en = entries[i];
        if(!en.isIntersecting) continue;
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      }
    }, {threshold:0.12});
    for(let i=0;i<els.length;i++) io.observe(els[i]);
  }

  function initTopButton(){
    const btn = $("#toTop");
    if(!btn) return;

    const on = function(){ btn.classList.toggle("is-on", window.scrollY > 650); };
    window.addEventListener("scroll", debounce(on, 80), {passive:true});
    btn.addEventListener("click", function(){
      try{ window.scrollTo({top:0, behavior:"smooth"}); }
      catch(_){ window.scrollTo(0,0); }
    });
  }

  function initControlsIfAny(){
    const s = $("#globalSearch");
    const clear = $("#searchClear");
    const tagSel = $("#tagSelect");
    const sortSel = $("#sortSelect");
    const resetBtn = $("#resetBtn");
    const loadMore = $("#loadMore");

    if(s){
      s.addEventListener("input", debounce(function(){
        state.search = String(s.value || "").trim().toLowerCase();
        state.page = 1;
        renderHomeProductsIfAny(false);
      }, 140));
    }

    if(clear && s){
      clear.addEventListener("click", function(){
        s.value = "";
        state.search = "";
        state.page = 1;
        renderHomeProductsIfAny(false);
        toast("تم مسح البحث");
      });
    }

    if(tagSel){
      tagSel.addEventListener("change", function(e){
        state.tag = e.target.value;
        state.page = 1;
        renderHomeProductsIfAny(false);
      });
    }

    if(sortSel){
      sortSel.addEventListener("change", function(e){
        state.sort = e.target.value;
        state.page = 1;
        renderHomeProductsIfAny(false);
      });
    }

    if(resetBtn){
      resetBtn.addEventListener("click", function(){
        state.tag = "all";
        state.search = "";
        state.sort = "featured";
        state.page = 1;

        if(s) s.value = "";
        if(tagSel) tagSel.value = "all";
        if(sortSel) sortSel.value = "featured";

        renderHomeProductsIfAny(false);
        toast("Reset");
      });
    }

    if(loadMore){
      loadMore.addEventListener("click", function(){
        state.page += 1;
        renderHomeProductsIfAny(true);
      });
    }
  }

  function buildTagSelectsIfAny(){
    const tagSelect = $("#tagSelect");
    const collectionFilter = $("#collectionFilter");
    if(!tagSelect && !collectionFilter) return;

    const fill = function(sel){
      if(!sel) return;
      while(sel.firstChild) sel.removeChild(sel.firstChild);
      for(let i=0;i<STORE.tags.length;i++){
        const t = STORE.tags[i];
        const op = document.createElement("option");
        op.value = t;
        op.textContent = String(t).toUpperCase();
        sel.appendChild(op);
      }
      sel.value = "all";
    };

    fill(tagSelect);
    fill(collectionFilter);
  }

  function buildCollectionsIfAny(){
    const grid = $("#collectionsGrid");
    if(!grid) return;

    while(grid.firstChild) grid.removeChild(grid.firstChild);

    for(let i=0;i<STORE.collections.length;i++){
      const c = STORE.collections[i];
      const el = document.createElement("div");
      el.className = "collectionCard reveal";
      el.tabIndex = 0;
      el.setAttribute("role","button");
      el.setAttribute("aria-label", c.title);

      const top = document.createElement("div");
      top.className = "collectionCard__top";

      const t = document.createElement("div");
      t.className = "collectionCard__title";
      t.textContent = c.title;

      const sub = document.createElement("div");
      sub.className = "collectionCard__sub";
      sub.textContent = c.sub;

      top.appendChild(t);
      top.appendChild(sub);

      const bar = document.createElement("div");
      bar.className = "collectionCard__bar";

      el.appendChild(top);
      el.appendChild(bar);

      el.addEventListener("click", function(){ openCollection(c.id); });
      el.addEventListener("keydown", function(e){ if(e.key === "Enter") openCollection(c.id); });

      grid.appendChild(el);
    }
  }

  function openCollection(collectionId){
    const c = findById(STORE.collections, collectionId);
    if(!c) return;

    state.collectionId = c.id;

    const titleEl = $("#collectionTitle");
    const subEl = $("#collectionSub");
    if(titleEl) titleEl.textContent = c.title;
    if(subEl) subEl.textContent = c.sub;

    const drawer = $("#collectionDrawer");
    if(drawer) drawer.setAttribute("data-color", c.color);

    const s = $("#collectionSearch");
    const f = $("#collectionFilter");
    if(s) s.value = "";
    if(f) f.value = "all";

    const base = filterProductsByCollection(c.id);
    state.collectionItems = base.slice(0, 20);
    renderCollectionGrid(state.collectionItems);
    updateCollectionCount(base.length, state.collectionItems.length);

    openDrawer("collection");
    toast("Opened: " + c.title);
  }

  function filterProductsByCollection(collectionId){
    const out = [];
    for(let i=0;i<STORE.products.length;i++){
      const p = STORE.products[i];
      if(p.collection === collectionId) out.push(p);
    }
    return out;
  }

  function renderCollectionGrid(items){
    const grid = $("#collectionGrid");
    if(!grid) return;

    while(grid.firstChild) grid.removeChild(grid.firstChild);

    if(!items || items.length === 0){
      const m = document.createElement("div");
      m.className = "muted";
      m.textContent = "لا يوجد نتائج";
      grid.appendChild(m);
      return;
    }

    for(let i=0;i<items.length;i++){
      grid.appendChild(productCard(items[i]));
    }
  }

  function updateCollectionCount(total, shown){
    const el = $("#colCount");
    if(!el) return;
    el.textContent = String(shown) + " / " + String(total);
  }

  function filterCollection(){
    const s = $("#collectionSearch");
    const f = $("#collectionFilter");
    if(!s || !f || !state.collectionId) return;

    const q = String(s.value || "").trim().toLowerCase();
    const tg = f.value;

    const base = filterProductsByCollection(state.collectionId);
    let items = base.slice();

    if(tg !== "all"){
      items = items.filter(function(p){ return (p.tags || []).indexOf(tg) !== -1; });
    }
    if(q){
      items = items.filter(function(p){
        const title = String(p.title || "").toLowerCase();
        const desc = String(p.desc || "").toLowerCase();
        if(title.indexOf(q) !== -1) return true;
        if(desc.indexOf(q) !== -1) return true;
        const tags = p.tags || [];
        for(let i=0;i<tags.length;i++){
          if(String(tags[i]).indexOf(q) !== -1) return true;
        }
        return false;
      });
    }

    state.collectionItems = items.slice(0, 20);
    renderCollectionGrid(state.collectionItems);
    updateCollectionCount(items.length, state.collectionItems.length);
  }

  function renderHomeProductsIfAny(append){
    const grid = $("#productsGrid");
    if(!grid) return;

    if(!append){
      while(grid.firstChild) grid.removeChild(grid.firstChild);
    }

    const all = getFilteredSortedProducts();
    const slice = all.slice(0, state.page * state.pageSize);

    const existing = append ? grid.children.length : 0;
    const chunk = slice.slice(existing);

    for(let i=0;i<chunk.length;i++){
      grid.appendChild(productCard(chunk[i]));
    }

    const loadMore = $("#loadMore");
    if(loadMore){
      loadMore.style.display = slice.length < all.length ? "inline-flex" : "none";
    }
  }

  function getFilteredSortedProducts(){
    let items = STORE.products.slice();

    if(state.tag !== "all"){
      items = items.filter(function(p){ return (p.tags||[]).indexOf(state.tag) !== -1; });
    }
    if(state.search){
      const q = state.search;
      items = items.filter(function(p){
        const title = String(p.title||"").toLowerCase();
        const desc = String(p.desc||"").toLowerCase();
        if(title.indexOf(q) !== -1) return true;
        if(desc.indexOf(q) !== -1) return true;
        const tags = p.tags || [];
        for(let i=0;i<tags.length;i++){
          if(String(tags[i]).indexOf(q) !== -1) return true;
        }
        return false;
      });
    }

    switch(state.sort){
      case "newest":
        items.sort(function(a,b){ return (b.createdAt||0) - (a.createdAt||0); });
        break;
      case "priceLow":
        items.sort(function(a,b){ return (a.price||0) - (b.price||0); });
        break;
      case "priceHigh":
        items.sort(function(a,b){ return (b.price||0) - (a.price||0); });
        break;
      case "nameAZ":
        items.sort(function(a,b){ return String(a.title||"").localeCompare(String(b.title||""), "ar"); });
        break;
      default:
        items.sort(function(a,b){ return scoreFeatured(b) - scoreFeatured(a); });
    }

    return items;
  }

  function scoreFeatured(p){
    const t = {};
    const tags = p.tags || [];
    for(let i=0;i<tags.length;i++) t[tags[i]] = true;
    return (t.popular?5:0) + (t.limited?3:0) + (t.new?2:0);
  }

  function productCard(p){
    const liked = isLiked(p.id);

    const el = document.createElement("article");
    el.className = "product";

    const media = document.createElement("div");
    media.className = "product__media";

    const link = document.createElement("a");
    link.className = "product__link";
    link.href = "product.html?id=" + encodeURIComponent(p.id);
    link.setAttribute("aria-label", "فتح المنتج: " + String(p.title || ""));

    const img = document.createElement("img");
    img.src = p.image;
    img.alt = "SOS STORE";
    img.loading = "lazy";
    img.decoding = "async";

    link.appendChild(img);
    media.appendChild(link);

    const body = document.createElement("div");
    body.className = "product__body";

    const h3 = document.createElement("h3");
    h3.className = "product__title";
    h3.textContent = p.title;

    const desc = document.createElement("p");
    desc.className = "product__desc";
    desc.textContent = p.desc;

    const row = document.createElement("div");
    row.className = "product__row";

    const price = document.createElement("span");
    price.className = "pill";
    price.textContent = formatPrice(p.price);

    const tagsPill = document.createElement("span");
    tagsPill.className = "pill";
    tagsPill.textContent = (p.tags||[]).slice(0,2).join(" • ").toUpperCase();

    row.appendChild(price);
    row.appendChild(tagsPill);

    const actions = document.createElement("div");
    actions.className = "product__actions";

    const likeBtn = document.createElement("button");
    likeBtn.className = "actionBtn";
    likeBtn.type = "button";
    likeBtn.setAttribute("data-like", p.id);
    likeBtn.textContent = liked ? "Liked" : "Like";
    if(liked) likeBtn.disabled = true;

    const commentBtn = document.createElement("button");
    commentBtn.className = "actionBtn";
    commentBtn.type = "button";
    commentBtn.setAttribute("data-comment", p.id);
    commentBtn.textContent = "Comment";

    const addBtn = document.createElement("button");
    addBtn.className = "actionBtn";
    addBtn.type = "button";
    addBtn.setAttribute("data-add", p.id);
    addBtn.textContent = "Add";

    actions.appendChild(likeBtn);
    actions.appendChild(commentBtn);
    actions.appendChild(addBtn);

    body.appendChild(h3);
    body.appendChild(desc);
    body.appendChild(row);
    body.appendChild(actions);

    el.appendChild(media);
    el.appendChild(body);

    return el;
  }

  function bindGlobalHandlers(){
    document.addEventListener("click", function(e){
      const close = closest(e.target, "[data-close]");
      if(close){
        const key = close.getAttribute("data-close");
        if(key === "comment") closeComments();
        if(key === "cart") closeDrawer("cart");
        if(key === "wish") closeDrawer("wish");
        if(key === "collection") closeDrawer("collection");
        return;
      }

      const likeBtn = closest(e.target, "[data-like]");
      const commentBtn = closest(e.target, "[data-comment]");
      const addBtn = closest(e.target, "[data-add]");
      const wishRemove = closest(e.target, "[data-wishremove]");
      const wishAdd = closest(e.target, "[data-wishadd]");
      const qMinus = closest(e.target, "[data-qminus]");
      const qPlus = closest(e.target, "[data-qplus]");
      const remove = closest(e.target, "[data-remove]");

      if(likeBtn){
        const id = likeBtn.getAttribute("data-like");
        if(!id || isLiked(id)) return;
        safeSetLocal(LS.like(id), "1");
        likeBtn.textContent = "Liked";
        likeBtn.disabled = true;
        addToWish(id);
        toast("تم حفظ اللايك");
        syncCounts();
        return;
      }

      if(commentBtn){
        openComments(commentBtn.getAttribute("data-comment"));
        return;
      }

      if(addBtn){
        addToCart(addBtn.getAttribute("data-add"), 1);
        toast("تمت الإضافة للسلة");
        syncCounts();
        return;
      }

      if(wishRemove){
        removeFromWish(wishRemove.getAttribute("data-wishremove"));
        toast("تم حذف العنصر");
        syncCounts();
        return;
      }

      if(wishAdd){
        addToCart(wishAdd.getAttribute("data-wishadd"), 1);
        toast("تمت الإضافة للسلة");
        syncCounts();
        return;
      }

      if(qMinus || qPlus || remove){
        const cart = getJSON(LS.cart, {});
        if(qMinus){
          const id = qMinus.getAttribute("data-qminus");
          setQty(id, (cart[id]||1) - 1);
          syncCounts();
        }
        if(qPlus){
          const id = qPlus.getAttribute("data-qplus");
          setQty(id, (cart[id]||0) + 1);
          syncCounts();
        }
        if(remove){
          const id = remove.getAttribute("data-remove");
          setQty(id, 0);
          syncCounts();
        }
        return;
      }
    });

    const cartBtn = $("#cartBtn");
    if(cartBtn) cartBtn.addEventListener("click", function(){
      renderCart();
      openDrawer("cart", cartBtn);
    });

    const wishBtn = $("#wishBtn");
    if(wishBtn) wishBtn.addEventListener("click", function(){
      renderWish();
      openDrawer("wish", wishBtn);
    });

    const clearCartBtn = $("#clearCart");
    if(clearCartBtn) clearCartBtn.addEventListener("click", function(){ clearCart(); });

    const clearWishBtn = $("#clearWish");
    if(clearWishBtn) clearWishBtn.addEventListener("click", function(){ clearWish(); });

    const checkoutBtn = $("#checkoutBtn");
    if(checkoutBtn) checkoutBtn.addEventListener("click", function(){ checkout(); });

    const commentForm = $("#commentForm");
    if(commentForm) commentForm.addEventListener("submit", function(e){
      e.preventDefault();
      const pid = commentForm.getAttribute("data-pid");
      const nameEl = $("#commentName");
      const textEl = $("#commentText");
      const name = nameEl ? String(nameEl.value || "").trim() : "";
      const text = textEl ? String(textEl.value || "").trim() : "";
      if(!pid || !name || !text) return;

      const items = getJSON(LS.comments(pid), []);
      items.unshift({ name: name, text: text, time: new Date().toLocaleString("ar-JO") });
      setJSON(LS.comments(pid), items.slice(0, 160));

      if(nameEl) nameEl.value = "";
      if(textEl) textEl.value = "";

      renderComments(pid);
      toast("تم حفظ التعليق");
    });

    const clearCommentsBtn = $("#clearComments");
    if(clearCommentsBtn) clearCommentsBtn.addEventListener("click", function(){
      const pid = $("#commentForm") ? $("#commentForm").getAttribute("data-pid") : "";
      if(!pid) return;
      localStorage.removeItem(LS.comments(pid));
      renderComments(pid);
      toast("تم مسح التعليقات");
    });

    const colSearch = $("#collectionSearch");
    if(colSearch) colSearch.addEventListener("input", debounce(filterCollection, 140));

    const colFilter = $("#collectionFilter");
    if(colFilter) colFilter.addEventListener("change", filterCollection);

    const colClear = $("#collectionClear");
    if(colClear) colClear.addEventListener("click", function(){
      const s = $("#collectionSearch");
      if(s) s.value = "";
      filterCollection();
      toast("تم مسح بحث القسم");
    });

    const cartDrawer = $("#cartDrawer");
    const wishDrawer = $("#wishDrawer");
    const collectionDrawer = $("#collectionDrawer");
    [cartDrawer, wishDrawer, collectionDrawer].forEach(function(d){
      if(!d) return;
      const panel = d.querySelector(".drawer__panel");
      if(panel) panel.addEventListener("click", function(ev){ ev.stopPropagation(); });
    });

    document.addEventListener("keydown", function(e){
      if(e.key !== "Escape") return;
      closeComments();
      closeDrawer("cart");
      closeDrawer("wish");
      closeDrawer("collection");
    });
  }

  function checkout(){
    const cart = getJSON(LS.cart, {});
    const ids = Object.keys(cart);
    if(ids.length === 0){ toast("السلة فارغة"); return; }

    const lines = [];
    for(let i=0;i<ids.length;i++){
      const id = ids[i];
      const p = findById(STORE.products, id);
      const q = cart[id];
      if(p) lines.push(String(p.title) + " × " + String(q));
    }

    const msg = encodeURIComponent("طلب جديد من " + STORE.brand + ":\n" + lines.join("\n"));
    if(STORE.checkoutWhatsApp){
      safeOpen("https://wa.me/" + encodeURIComponent(STORE.checkoutWhatsApp) + "?text=" + msg);
    }else{
      safeOpen(STORE.instagram);
    }
  }

  function safeOpen(url){
    const u = String(url || "");
    if(!u) return;
    const w = window.open(u, "_blank", "noopener,noreferrer");
    if(w) try{ w.opener = null; } catch(_){}
  }

  function openDrawer(key, focusEl){
    const el = drawerEl(key);
    if(!el) return;

    state.lastFocus = focusEl || document.activeElement;

    el.classList.add("is-open");
    el.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";

    const panel = el.querySelector(".drawer__panel");
    if(panel){
      const btn = panel.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      if(btn) btn.focus();
    }
  }

  function closeDrawer(key){
    const el = drawerEl(key);
    if(!el || !el.classList.contains("is-open")) return;

    el.classList.remove("is-open");
    el.setAttribute("aria-hidden","true");

    if(!anyOpen() && !isModalOpen()) document.body.style.overflow = "";

    if(state.lastFocus && typeof state.lastFocus.focus === "function"){
      try{ state.lastFocus.focus(); } catch(_){}
    }
    state.lastFocus = null;
  }

  function anyOpen(){
    return ["cart","wish","collection"].some(function(k){
      const d = drawerEl(k);
      return d ? d.classList.contains("is-open") : false;
    });
  }

  function drawerEl(key){
    if(key === "cart") return $("#cartDrawer");
    if(key === "wish") return $("#wishDrawer");
    if(key === "collection") return $("#collectionDrawer");
    return null;
  }

  function isModalOpen(){
    const m = $("#commentModal");
    return !!(m && m.classList.contains("is-open"));
  }

  function openComments(productId){
    const p = findById(STORE.products, productId);
    if(!p) return;

    const title = $("#commentTitle");
    const sub = $("#commentSub");
    const form = $("#commentForm");
    if(title) title.textContent = "تعليقات: " + String(p.title);
    if(sub) sub.textContent = "بدون نجوم — تعليق فقط";
    if(form) form.setAttribute("data-pid", productId);

    const name = $("#commentName");
    const text = $("#commentText");
    if(name) name.value = "";
    if(text) text.value = "";

    const m = $("#commentModal");
    if(!m) return;

    state.lastFocus = document.activeElement;

    m.classList.add("is-open");
    m.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";

    renderComments(productId);

    if(name) name.focus();
    toast("Comments");
  }

  function closeComments(){
    const m = $("#commentModal");
    if(!m || !m.classList.contains("is-open")) return;

    m.classList.remove("is-open");
    m.setAttribute("aria-hidden","true");

    if(!anyOpen()) document.body.style.overflow = "";

    if(state.lastFocus && typeof state.lastFocus.focus === "function"){
      try{ state.lastFocus.focus(); } catch(_){}
    }
    state.lastFocus = null;
  }

  function renderComments(productId){
    const list = $("#commentList");
    if(!list) return;

    while(list.firstChild) list.removeChild(list.firstChild);

    const items = getJSON(LS.comments(productId), []);
    if(!items || items.length === 0){
      list.appendChild(commentNode({ name:"لا يوجد تعليقات", time:"جاهز", text:"اكتب أول تعليق." }, true));
      return;
    }

    const max = Math.min(80, items.length);
    for(let i=0;i<max;i++){
      list.appendChild(commentNode(items[i], false));
    }
  }

  function commentNode(c, isEmpty){
    const wrap = document.createElement("div");
    wrap.className = "comment";

    const top = document.createElement("div");
    top.className = "comment__top";

    const name = document.createElement("div");
    name.className = "comment__name";
    name.textContent = String(c.name || "");

    const time = document.createElement("div");
    time.className = "comment__time";
    time.textContent = String(c.time || "");

    top.appendChild(name);
    top.appendChild(time);

    const text = document.createElement("div");
    text.className = "comment__text";
    text.textContent = String(c.text || "");

    wrap.appendChild(top);
    wrap.appendChild(text);

    if(isEmpty) return wrap;
    return wrap;
  }

  function addToWish(productId){
    if(!productId) return;
    const list = getJSON(LS.wish, []);
    if(indexOf(list, productId) === -1) list.unshift(productId);
    setJSON(LS.wish, list.slice(0, 400));
    renderWish();
  }

  function removeFromWish(productId){
    if(!productId) return;
    const list = getJSON(LS.wish, []);
    const out = [];
    for(let i=0;i<list.length;i++){
      if(list[i] !== productId) out.push(list[i]);
    }
    setJSON(LS.wish, out);
    renderWish();
  }

  function renderWish(){
    const wrap = $("#wishItems");
    if(!wrap) return;

    while(wrap.firstChild) wrap.removeChild(wrap.firstChild);

    const ids = getJSON(LS.wish, []);
    if(!ids || ids.length === 0){
      const m = document.createElement("div");
      m.className = "muted";
      m.textContent = "لا يوجد عناصر";
      wrap.appendChild(m);
      return;
    }

    const max = Math.min(120, ids.length);
    for(let i=0;i<max;i++){
      const id = ids[i];
      const p = findById(STORE.products, id);
      if(!p) continue;

      const row = document.createElement("div");
      row.className = "comment";

      const top = document.createElement("div");
      top.className = "comment__top";

      const name = document.createElement("div");
      name.className = "comment__name";
      name.textContent = String(p.title);

      const time = document.createElement("div");
      time.className = "comment__time";
      time.textContent = formatPrice(p.price);

      top.appendChild(name);
      top.appendChild(time);

      const text = document.createElement("div");
      text.className = "comment__text";
      text.textContent = String(p.desc);

      const actions = document.createElement("div");
      actions.className = "comment__actions";

      const open = document.createElement("a");
      open.className = "actionBtn";
      open.href = "product.html?id=" + encodeURIComponent(p.id);
      open.textContent = "فتح";

      const add = document.createElement("button");
      add.className = "actionBtn";
      add.type = "button";
      add.setAttribute("data-wishadd", p.id);
      add.textContent = "Add";

      const rem = document.createElement("button");
      rem.className = "actionBtn";
      rem.type = "button";
      rem.setAttribute("data-wishremove", p.id);
      rem.textContent = "حذف";

      actions.appendChild(open);
      actions.appendChild(add);
      actions.appendChild(rem);

      row.appendChild(top);
      row.appendChild(text);
      row.appendChild(actions);

      wrap.appendChild(row);
    }
  }

  function clearWish(){
    localStorage.removeItem(LS.wish);
    renderWish();
    syncCounts();
    toast("تم تفريغ المفضلة");
  }

  function addToCart(productId, qty){
    if(!productId) return;
    const cart = getJSON(LS.cart, {});
    cart[productId] = (cart[productId] || 0) + (qty || 0);
    if(cart[productId] <= 0) delete cart[productId];
    setJSON(LS.cart, cart);
    renderCart();
  }

  function setQty(productId, qty){
    if(!productId) return;
    const cart = getJSON(LS.cart, {});
    if(qty <= 0) delete cart[productId];
    else cart[productId] = qty;
    setJSON(LS.cart, cart);
    renderCart();
  }

  function clearCart(){
    localStorage.removeItem(LS.cart);
    renderCart();
    syncCounts();
    toast("تم تفريغ السلة");
  }

  function renderCart(){
    const wrap = $("#cartItems");
    const totalEl = $("#cartTotal");
    if(!wrap || !totalEl) return;

    while(wrap.firstChild) wrap.removeChild(wrap.firstChild);

    const cart = getJSON(LS.cart, {});
    const ids = Object.keys(cart);

    if(ids.length === 0){
      const m = document.createElement("div");
      m.className = "muted";
      m.textContent = "السلة فارغة";
      wrap.appendChild(m);
      totalEl.textContent = "0";
      return;
    }

    let total = 0;

    for(let i=0;i<ids.length;i++){
      const id = ids[i];
      const p = findById(STORE.products, id);
      if(!p) continue;
      const q = cart[id];
      total += (p.price || 0) * q;

      const row = document.createElement("div");
      row.className = "comment";

      const top = document.createElement("div");
      top.className = "comment__top";

      const name = document.createElement("div");
      name.className = "comment__name";
      name.textContent = String(p.title);

      const time = document.createElement("div");
      time.className = "comment__time";
      time.textContent = formatPrice(p.price) + " × " + String(q);

      top.appendChild(name);
      top.appendChild(time);

      const actions = document.createElement("div");
      actions.className = "product__actions";
      actions.style.marginTop = "10px";

      const minus = document.createElement("button");
      minus.className = "actionBtn";
      minus.type = "button";
      minus.setAttribute("data-qminus", id);
      minus.textContent = "-";

      const plus = document.createElement("button");
      plus.className = "actionBtn";
      plus.type = "button";
      plus.setAttribute("data-qplus", id);
      plus.textContent = "+";

      const rem = document.createElement("button");
      rem.className = "actionBtn";
      rem.type = "button";
      rem.setAttribute("data-remove", id);
      rem.textContent = "حذف";

      actions.appendChild(minus);
      actions.appendChild(plus);
      actions.appendChild(rem);

      row.appendChild(top);
      row.appendChild(actions);

      wrap.appendChild(row);
    }

    totalEl.textContent = String(total);
  }

  function syncCounts(){
    const wish = getJSON(LS.wish, []);
    const wishCount = $("#wishCount");
    if(wishCount) wishCount.textContent = String((wish && wish.length) ? wish.length : 0);

    const cart = getJSON(LS.cart, {});
    let count = 0;
    const keys = Object.keys(cart || {});
    for(let i=0;i<keys.length;i++){
      const k = keys[i];
      count += (cart[k] || 0);
    }
    const cartCount = $("#cartCount");
    if(cartCount) cartCount.textContent = String(count);
  }

  function isLiked(id){
    return safeGetLocal(LS.like(id)) === "1";
  }

  function toast(msg){
    const el = $("#toast");
    if(!el) return;
    el.textContent = String(msg || "");
    el.classList.add("is-show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function(){ el.classList.remove("is-show"); }, 1200);
  }

  function formatPrice(n){
    return String(Number(n||0)) + " JD";
  }

  function debounce(fn, wait){
    let t = null;
    return function(){
      const args = arguments;
      clearTimeout(t);
      t = setTimeout(function(){ fn.apply(null, args); }, wait);
    };
  }

  function getJSON(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      if(!raw) return fallback;
      return JSON.parse(raw);
    }catch(_){
      return fallback;
    }
  }

  function setJSON(key, val){
    try{
      localStorage.setItem(key, JSON.stringify(val));
    }catch(_){}
  }

  function safeGetLocal(key){
    try{ return localStorage.getItem(key); }
    catch(_){ return null; }
  }

  function safeSetLocal(key, val){
    try{ localStorage.setItem(key, val); }
    catch(_){}
  }

  function closest(el, selector){
    if(!el) return null;
    if(el.closest) return el.closest(selector);
    // very old fallback
    let cur = el;
    while(cur && cur !== document){
      if(matches(cur, selector)) return cur;
      cur = cur.parentNode;
    }
    return null;
  }

  function matches(el, selector){
    if(!el || el.nodeType !== 1) return false;
    const fn = el.matches || el.msMatchesSelector || el.webkitMatchesSelector;
    if(fn) return fn.call(el, selector);
    return false;
  }

  function indexOf(arr, val){
    if(!arr) return -1;
    for(let i=0;i<arr.length;i++) if(arr[i] === val) return i;
    return -1;
  }

  function findById(arr, id){
    if(!arr || !id) return null;
    for(let i=0;i<arr.length;i++){
      if(arr[i] && arr[i].id === id) return arr[i];
    }
    return null;
  }

  function parseQuery(){
    const q = {};
    const s = String(location.search || "");
    if(!s || s.length < 2) return q;
    const parts = s.substring(1).split("&");
    for(let i=0;i<parts.length;i++){
      const p = parts[i];
      if(!p) continue;
      const kv = p.split("=");
      const k = decodeURIComponent(kv[0] || "");
      const v = decodeURIComponent(kv.slice(1).join("=") || "");
      if(k) q[k] = v;
    }
    return q;
  }

  /* ---------- Category Page ---------- */

  function initCategoryPageIfAny(){
    const grid = $("#categoryGrid");
    if(!grid) return;

    const q = parseQuery();
    const colId = q.c && findById(STORE.collections, q.c) ? q.c : "c1";
    const col = findById(STORE.collections, colId);

    const title = $("#categoryTitle");
    const sub = $("#categorySub");
    if(title) title.textContent = col ? col.title : "قسم";
    if(sub) sub.textContent = col ? col.sub : "";

    // optional search/filter in category page
    const catSearch = $("#categorySearch");
    const catFilter = $("#categoryFilter");

    const baseAll = filterProductsByCollection(colId);

    const render = function(){
      const qv = catSearch ? String(catSearch.value || "").trim().toLowerCase() : "";
      const tg = catFilter ? catFilter.value : "all";

      let items = baseAll.slice();
      if(tg && tg !== "all"){
        items = items.filter(function(p){ return (p.tags||[]).indexOf(tg) !== -1; });
      }
      if(qv){
        items = items.filter(function(p){
          const title = String(p.title||"").toLowerCase();
          const desc = String(p.desc||"").toLowerCase();
          if(title.indexOf(qv) !== -1) return true;
          if(desc.indexOf(qv) !== -1) return true;
          const tags = p.tags || [];
          for(let i=0;i<tags.length;i++){
            if(String(tags[i]).indexOf(qv) !== -1) return true;
          }
          return false;
        });
      }

      while(grid.firstChild) grid.removeChild(grid.firstChild);
      if(items.length === 0){
        const m = document.createElement("div");
        m.className = "muted";
        m.textContent = "لا يوجد نتائج";
        grid.appendChild(m);
      }else{
        for(let i=0;i<items.length;i++){
          grid.appendChild(productCard(items[i]));
        }
      }

      const count = $("#categoryCount");
      if(count) count.textContent = String(items.length) + " / " + String(baseAll.length);
    };

    // fill tags selects if exist
    if(catFilter){
      while(catFilter.firstChild) catFilter.removeChild(catFilter.firstChild);
      for(let i=0;i<STORE.tags.length;i++){
        const t = STORE.tags[i];
        const op = document.createElement("option");
        op.value = t;
        op.textContent = String(t).toUpperCase();
        catFilter.appendChild(op);
      }
      catFilter.value = "all";
      catFilter.addEventListener("change", render);
    }

    if(catSearch){
      catSearch.addEventListener("input", debounce(render, 140));
      const clear = $("#categoryClear");
      if(clear){
        clear.addEventListener("click", function(){
          catSearch.value = "";
          render();
          toast("تم مسح البحث");
        });
      }
    }

    render();
  }

  /* ---------- Product Page ---------- */

  function initProductPageIfAny(){
    const stage = $("#productStage");
    if(!stage) return;

    const q = parseQuery();
    const pid = q.id && findById(STORE.products, q.id) ? q.id : (STORE.products[0] ? STORE.products[0].id : "");
    const p = findById(STORE.products, pid);
    if(!p) return;

    const title = $("#productTitle");
    const desc = $("#productDesc");
    const price = $("#productPrice");
    const tags = $("#productTags");

    if(title) title.textContent = String(p.title);
    if(desc) desc.textContent = String(p.desc);
    if(price) price.textContent = formatPrice(p.price);
    if(tags) tags.textContent = (p.tags||[]).join(" • ").toUpperCase();

    const col = findById(STORE.collections, p.collection);
    const crumb = $("#productCrumb");
    if(crumb){
      if(col){
        crumb.textContent = col.title + " / " + p.id.toUpperCase();
      }else{
        crumb.textContent = p.id.toUpperCase();
      }
    }

    // images
    const imgs = [
      p.image,
      placeholderImg(STORE.brand, String(p.title) + " 02"),
      placeholderImg(STORE.brand, String(p.title) + " 03")
    ];

    let idx = 0;

    const imgEl = $("#productImage");
    const dotsEl = $("#productDots");

    const renderDots = function(){
      if(!dotsEl) return;
      while(dotsEl.firstChild) dotsEl.removeChild(dotsEl.firstChild);
      for(let i=0;i<imgs.length;i++){
        const d = document.createElement("span");
        d.className = "dot" + (i === idx ? " is-on" : "");
        d.setAttribute("aria-hidden","true");
        dotsEl.appendChild(d);
      }
    };

    const setSlide = function(nextIdx){
      idx = nextIdx;
      if(idx < 0) idx = imgs.length - 1;
      if(idx >= imgs.length) idx = 0;
      if(imgEl) imgEl.src = imgs[idx];
      renderDots();
    };

    setSlide(0);

    const prevBtn = $("#productPrev");
    const nextBtn = $("#productNext");
    if(prevBtn) prevBtn.addEventListener("click", function(){ setSlide(idx - 1); });
    if(nextBtn) nextBtn.addEventListener("click", function(){ setSlide(idx + 1); });

    // actions
    const likeBtn = $("#productLike");
    const addBtn = $("#productAdd");
    const commentBtn = $("#productComment");

    if(likeBtn){
      const liked = isLiked(p.id);
      likeBtn.textContent = liked ? "Liked" : "Like";
      likeBtn.disabled = liked;
      likeBtn.setAttribute("data-like", p.id);
    }

    if(addBtn){
      addBtn.setAttribute("data-add", p.id);
    }

    if(commentBtn){
      commentBtn.setAttribute("data-comment", p.id);
    }
  }
})();
