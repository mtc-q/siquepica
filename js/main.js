/* ============================================================
   SIQUEPICA · Interacción
   Pestañas, catálogo, pedido por WhatsApp y animaciones.
   ============================================================ */
(function () {
  "use strict";

  var D = window.SIQUEPICA;
  var C = D.contacto;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var waLink = function (text) {
    return "https://wa.me/" + C.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");
  };
  var igLink = "https://www.instagram.com/" + C.instagram + "/";

  /* ---------- Enlaces de contacto ---------- */
  function wireLinks(root) {
    $$("[data-wa]", root).forEach(function (a) { a.href = waLink(a.getAttribute("data-wa")); });
    $$("[data-ig]", root).forEach(function (a) { a.href = igLink; });
    $$("[data-rappi]", root).forEach(function (a) { a.href = C.rappiUrl; });
  }

  /* ---------- Pestañas ---------- */
  var TABS = ["inicio", "productos", "como-pedir", "encuentranos", "nosotros", "contacto"];
  var TITLES = {
    "inicio": "Siquepica® | Dulces enchilados en Saltillo y Monterrey",
    "productos": "Productos | Siquepica®",
    "como-pedir": "Cómo pedir | Siquepica®",
    "encuentranos": "Dónde comprar | Siquepica®",
    "nosotros": "Nosotros | Siquepica®",
    "contacto": "Contacto | Siquepica®"
  };
  var current = null;
  var ink = $(".tabs__ink");

  function moveInk() {
    var on = $('.tabs__list a[aria-selected="true"]');
    if (!on || !ink) return;
    ink.style.width = on.offsetWidth + "px";
    ink.style.transform = "translateX(" + on.offsetLeft + "px)";
  }

  function show(tab, opts) {
    opts = opts || {};
    if (TABS.indexOf(tab) === -1) tab = "inicio";
    var changed = tab !== current;

    $$("[data-panel]").forEach(function (p) {
      var on = p.getAttribute("data-panel") === tab;
      p.hidden = !on;
      if (on && changed) {
        p.classList.remove("is-entering");
        void p.offsetWidth;
        p.classList.add("is-entering");
      }
    });
    $$(".tabs__list a").forEach(function (a) {
      a.setAttribute("aria-selected", a.getAttribute("data-tab-link") === tab ? "true" : "false");
    });
    $$(".bottombar a").forEach(function (a) {
      if (a.getAttribute("data-tab-link") === tab) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    document.title = TITLES[tab];
    current = tab;
    moveInk();

    if (opts.scrollTo) {
      var el = document.getElementById(opts.scrollTo);
      if (el) setTimeout(function () { el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 80);
    } else if (changed && !opts.initial) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    observeReveals();
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest("[data-tab-link]");
    if (!link) return;
    e.preventDefault();
    var tab = link.getAttribute("data-tab-link");
    if (link.hasAttribute("data-close-drawer")) closeDrawer();
    if (location.hash !== "#" + tab) history.pushState(null, "", "#" + tab);
    show(tab, { scrollTo: link.getAttribute("data-scroll") });
  });
  window.addEventListener("popstate", function () { show(location.hash.slice(1) || "inicio"); });
  window.addEventListener("resize", moveInk);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInk);

  /* ---------- Encabezado al hacer scroll ---------- */
  var topbar = $("#topbar");
  window.addEventListener("scroll", function () {
    topbar.classList.toggle("is-scrolled", window.scrollY > 8);
  }, { passive: true });

  /* ---------- Catálogo ---------- */
  function imgFor(p) { return p.foto || p.ilustracion; }

  function cardHTML(p) {
    return '' +
      '<article class="card reveal" data-cat="' + p.categoria + '" data-id="' + p.id + '">' +
        '<div class="card__media">' +
          '<img src="' + imgFor(p) + '" alt="' + p.nombre + ', ' + p.presentacion + '" loading="lazy" width="480" height="480"' +
          (p.foto ? ' onerror="this.onerror=null;this.src=\'' + p.ilustracion + '\'"' : '') + '>' +
          (p.etiqueta ? '<span class="tag">' + p.etiqueta + '</span>' : '') +
        '</div>' +
        '<div class="card__body">' +
          '<span class="card__size">' + p.presentacion + '</span>' +
          '<h3>' + p.nombre + '</h3>' +
          '<p>' + p.descripcion + '</p>' +
          '<div class="card__actions">' +
            '<button class="btn btn--red add-btn" data-add="' + p.id + '">Agregar</button>' +
            '<a class="btn btn--wa wa-mini" aria-label="Preguntar por ' + p.nombre + ' en WhatsApp" target="_blank" rel="noopener" ' +
              'data-wa="Hola Siquepica 👋 me interesa: ' + p.nombre + ' (' + p.presentacion + '). ¿Lo tienen disponible?" href="#">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-wa"/></svg></a>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  var catalog = $("#catalog");
  catalog.innerHTML = D.productos.map(cardHTML).join("");
  var featuredIds = ["charola-700", "cherry-bombs", "gusanitos", "watermelon"];
  $("#featured").innerHTML = featuredIds.map(function (id) {
    return cardHTML(D.productos.filter(function (p) { return p.id === id; })[0]);
  }).join("");

  $$(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      $$(".chip").forEach(function (c) { c.classList.toggle("is-on", c === chip); });
      var f = chip.getAttribute("data-filter");
      $$(".card", catalog).forEach(function (card, i) {
        var show = f === "todos" || card.getAttribute("data-cat") === f;
        card.classList.toggle("is-hidden", !show);
        card.classList.remove("pop");
        if (show) {
          card.classList.add("is-visible");
          card.style.animationDelay = (i * 40) + "ms";
          void card.offsetWidth;
          card.classList.add("pop");
        }
      });
    });
  });

  /* ---------- Pedido ---------- */
  var STORE_KEY = "siquepica-pedido";
  var order = {};
  try { order = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { order = {}; }
  var save = function () { try { localStorage.setItem(STORE_KEY, JSON.stringify(order)); } catch (e) {} };
  var byId = function (id) { return D.productos.filter(function (p) { return p.id === id; })[0]; };

  function count() { return Object.keys(order).reduce(function (n, k) { return n + order[k]; }, 0); }

  function renderOrder() {
    var ids = Object.keys(order).filter(function (k) { return order[k] > 0 && byId(k); });
    var list = $("#orderList");
    list.innerHTML = ids.map(function (id) {
      var p = byId(id);
      return '<li><img src="' + imgFor(p) + '" alt="">' +
        '<div><h4>' + p.nombre + '</h4><small>' + p.presentacion + '</small></div>' +
        '<div class="qty"><button data-dec="' + id + '" aria-label="Quitar uno">−</button><span>' + order[id] + '</span>' +
        '<button data-inc="' + id + '" aria-label="Agregar uno">+</button></div></li>';
    }).join("");
    var has = ids.length > 0;
    $("#orderEmpty").hidden = has;
    $("#orderForm").hidden = !has;
    $("#drawerFoot").hidden = !has;

    var n = count();
    var badge = $("#cartCount");
    badge.textContent = n;
    badge.hidden = n === 0;

    $$(".add-btn").forEach(function (b) {
      var id = b.getAttribute("data-add");
      var q = order[id] || 0;
      b.classList.toggle("is-added", q > 0);
      b.textContent = q > 0 ? "En tu pedido (" + q + ")" : "Agregar";
    });
  }

  function add(id) {
    order[id] = (order[id] || 0) + 1;
    save(); renderOrder();
    var cb = $("#cartBtn");
    cb.classList.remove("bump"); void cb.offsetWidth; cb.classList.add("bump");
    toast("🌶 " + byId(id).nombre + " agregado");
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-add]");
    if (a) { add(a.getAttribute("data-add")); return; }
    var inc = e.target.closest("[data-inc]");
    if (inc) { order[inc.getAttribute("data-inc")]++; save(); renderOrder(); return; }
    var dec = e.target.closest("[data-dec]");
    if (dec) {
      var id = dec.getAttribute("data-dec");
      order[id]--; if (order[id] <= 0) delete order[id];
      save(); renderOrder();
    }
  });

  /* Panel lateral */
  var drawer = $("#drawer"), scrim = $("#scrim"), lastFocus = null;
  function openDrawer() {
    lastFocus = document.activeElement;
    scrim.hidden = false;
    requestAnimationFrame(function () { scrim.classList.add("is-on"); drawer.classList.add("is-open"); });
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(function () { $("#drawerClose").focus(); }, 300);
  }
  function closeDrawer() {
    scrim.classList.remove("is-on"); drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(function () { scrim.hidden = true; }, 300);
    if (lastFocus) lastFocus.focus();
  }
  $("#cartBtn").addEventListener("click", openDrawer);
  $("#drawerClose").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer(); });

  $$('input[name="oWay"]').forEach(function (r) {
    r.addEventListener("change", function () { $("#oCpField").hidden = r.value !== "Envío nacional" || !r.checked; });
  });
  $("#oCity").addEventListener("change", function (e) {
    if (e.target.value.indexOf("Otra") === 0) {
      var nat = $('input[value="Envío nacional"]'); nat.checked = true; $("#oCpField").hidden = false;
    }
  });

  $("#sendOrder").addEventListener("click", function () {
    var ids = Object.keys(order).filter(function (k) { return order[k] > 0; });
    var way = ($('input[name="oWay"]:checked') || {}).value;
    var cp = $("#oCp").value.trim();
    var lines = ["Hola Siquepica 👋 quiero hacer este pedido:", ""];
    ids.forEach(function (id) { var p = byId(id); lines.push("• " + order[id] + " × " + p.nombre + " (" + p.presentacion + ")"); });
    lines.push("", "📍 Ciudad: " + $("#oCity").value, "🛵 Entrega: " + way);
    if (way === "Envío nacional" && cp) lines.push("📮 C.P.: " + cp);
    lines.push("", "¿Me confirman disponibilidad y total? 🌶");
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  /* ---------- Cotizar envío ---------- */
  $("#cpForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var cp = $("#cp").value.trim();
    var msg = $("#cpMsg");
    if (!/^\d{5}$/.test(cp)) { msg.textContent = "Escribe un código postal de 5 dígitos."; $("#cp").focus(); return; }
    msg.textContent = "";
    window.open(waLink("Hola Siquepica 👋 quiero cotizar un envío nacional a mi código postal: " + cp), "_blank", "noopener");
  });

  /* ---------- Mayoreo ---------- */
  $("#bizForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target;
    var lines = [
      "Hola Siquepica 👋 me gustaría vender sus productos en mi negocio.", "",
      "👤 Nombre: " + f.nombre.value.trim(),
      "🏪 Negocio: " + f.negocio.value.trim(),
      "📍 Ciudad: " + f.ciudad.value,
      "🏷️ Tipo: " + f.tipo.value
    ];
    if (f.mensaje.value.trim()) lines.push("💬 " + f.mensaje.value.trim());
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  /* ---------- Equipo (opcional) ---------- */
  if (D.equipo && D.equipo.length) {
    $("#teamGrid").innerHTML = D.equipo.map(function (m) {
      return '<div class="member reveal">' +
        (m.foto ? '<img src="' + m.foto + '" alt="' + m.nombre + '" loading="lazy">' : '') +
        '<h3>' + m.nombre + '</h3><div class="role">' + (m.rol || "") + '</div>' +
        (m.texto ? '<p>' + m.texto + '</p>' : '') + '</div>';
    }).join("");
    $("#team").hidden = false;
  }

  /* ---------- Toast ---------- */
  var toastEl = $("#toast"), toastT;
  function toast(t) {
    toastEl.textContent = t;
    toastEl.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2200);
  }

  /* ---------- Revelado al hacer scroll ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }) : null;

  function observeReveals() {
    var targets = $$(".panel:not([hidden]) .reveal:not(.is-visible), .panel:not([hidden]) .three:not(.is-visible)");
    if (!io) { targets.forEach(function (t) { t.classList.add("is-visible"); }); return; }
    targets.forEach(function (t) { io.observe(t); });
  }
  $$(".way, .step, .dcard, .value, .place, .recipe, .band, .sizes, .ccard, .ig-card, .story__copy, .faq, .form, .route")
    .forEach(function (el) { el.classList.add("reveal"); });

  /* ---------- Arranque ---------- */
  $("#year").textContent = new Date().getFullYear();
  $$("[data-wa-visible]").forEach(function (el) { el.textContent = C.whatsappVisible; });
  wireLinks(document);
  renderOrder();
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  show(location.hash.slice(1) || "inicio", { initial: true });
  window.scrollTo(0, 0);
})();
