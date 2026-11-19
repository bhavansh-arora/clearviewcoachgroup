/* ==========================================================================
   Clearview Coaching Group — interface behaviour
   Global (once): smooth scroll, header, menu, cursor, preloader, and
   in-place page transitions. Per page: initPage(root) wires up the content
   of <main>; it runs on load and again after every in-place page swap.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var doc = document.documentElement;
  var body = document.body;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduced) doc.classList.add("reduced");

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  /* Per-page cleanup hooks (timers, observers, rAF loops) */
  var cleanups = [];
  function onCleanup(fn) { cleanups.push(fn); }
  function runCleanups() { cleanups.splice(0).forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } }); }

  /* ---------- Smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    window.lenis = lenis;
    if (!window.gsap) {
      var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  function scrollToEl(target) {
    if (lenis) lenis.scrollTo(target, { offset: -20 });
    else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }
  function jumpTop() {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }

  /* ---------- Booking links ---------- */
  function wireBooking(root) {
    if (!CFG.bookingUrl) return;
    $$("[data-book]", root).forEach(function (el) {
      el.setAttribute("href", CFG.bookingUrl);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
  }
  wireBooking(document);
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Header ---------- */
  var header = $(".site-header");
  var lastY = window.scrollY;
  var ticking = false;
  function darkUnderHeader() {
    if (!header) return false;
    var y = header.offsetHeight / 2;
    var els = document.elementsFromPoint ? document.elementsFromPoint(window.innerWidth / 2, y) : [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (header.contains(el) || el.classList.contains("menu")) continue;
      var sec = el.closest("[data-theme]");
      if (sec) return sec.getAttribute("data-theme") === "dark";
    }
    return false;
  }
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("is-scrolled", y > 40);
      /* Hide on a deliberate scroll down, show on a deliberate scroll up.
         Small jitters (iOS momentum settling, rubber-banding) are ignored. */
      var delta = y - lastY;
      if (body.classList.contains("menu-open") || y < 80) header.classList.remove("is-hidden");
      else if (delta > 6) header.classList.add("is-hidden");
      else if (delta < -10) header.classList.remove("is-hidden");
      header.classList.toggle("on-dark", darkUnderHeader());
    }
    if (Math.abs(y - lastY) > 6 || y < 80) lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Menu ---------- */
  var toggle = $(".menu-toggle");
  var toggleText = $(".menu-toggle__text");
  var menu = $(".menu");
  function openMenu() {
    body.classList.add("menu-open");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    if (toggleText) toggleText.textContent = "Close";
    if (lenis) lenis.stop();
    if (menu) menu.removeAttribute("inert");
  }
  function closeMenu(instant) {
    if (!body.classList.contains("menu-open")) return;
    if (instant && menu) menu.classList.add("no-anim");
    body.classList.remove("menu-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (toggleText) toggleText.textContent = "Menu";
    if (lenis) lenis.start();
    if (menu) menu.setAttribute("inert", "");
    if (instant && menu) requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.remove("no-anim"); }); });
  }
  if (toggle) toggle.addEventListener("click", function () { body.classList.contains("menu-open") ? closeMenu() : openMenu(); });
  var backdrop = $(".menu-backdrop");
  if (backdrop) backdrop.addEventListener("click", function () { closeMenu(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ---------- Browser chrome colour ---------- */
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function uiWine() { doc.classList.add("ui-wine"); if (themeMeta) themeMeta.setAttribute("content", "#221a44"); }
  function uiIvory() { doc.classList.remove("ui-wine"); if (themeMeta) themeMeta.setAttribute("content", "#f4f0e9"); }

  /* ---------- Preloader (first visit per session) ---------- */
  var pre = $(".preloader");
  if (pre) {
    if (doc.classList.contains("no-preloader") || reduced) {
      if (!doc.classList.contains("pt-enter")) uiIvory();
      doc.classList.remove("is-preloading");
      pre.remove();
      body.classList.add("is-loaded");
    } else {
      store.set("cv_seen", "1");
      var count = $(".preloader__count", pre);
      var letters = $$(".preloader__word span", pre);
      var start = performance.now();
      var DURATION = 1500;
      letters.forEach(function (l, i) {
        l.style.transition = "transform 1s cubic-bezier(.22,1,.36,1) " + (0.05 * i) + "s";
        requestAnimationFrame(function () { requestAnimationFrame(function () { l.style.transform = "translateY(0)"; }); });
      });
      var tick = function (now) {
        var p = Math.min(1, (now - start) / DURATION);
        var eased = 1 - Math.pow(1 - p, 3);
        if (count) count.textContent = String(Math.round(eased * 100)).padStart(2, "0") + "%";
        if (p < 1) requestAnimationFrame(tick);
        else finishPreloader();
      };
      requestAnimationFrame(tick);
    }
  } else {
    body.classList.add("is-loaded");
  }
  function finishPreloader() {
    pre.style.transition = "clip-path 1.1s cubic-bezier(.65,0,.35,1)";
    pre.style.clipPath = "inset(0 0 100% 0)";
    doc.classList.remove("is-preloading");
    setTimeout(uiIvory, 500);
    body.classList.add("is-loaded");
    document.dispatchEvent(new CustomEvent("site:loaded"));
    setTimeout(function () { pre.remove(); }, 1200);
  }

  /* ---------- Cursor (dot + trailing ring) ---------- */
  if (finePointer && !reduced) {
    var cursor = document.createElement("div");
    cursor.className = "cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = '<div class="cursor__dot"></div><div class="cursor__ring"><span></span></div>';
    body.appendChild(cursor);
    var dot = $(".cursor__dot", cursor), ring = $(".cursor__ring", cursor), label = $("span", ring);
    var mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      requestAnimationFrame(loop);
    })();
    var DARK = '[data-theme="dark"], .dark, .dark-2, .cta-final, .site-footer, .program, .compass, .menu, .svc';
    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest("[data-cursor], a, button, .choice, .option");
      cursor.classList.toggle("is-hover", false);
      cursor.classList.toggle("is-label", false);
      cursor.classList.toggle("on-dark", !!e.target.closest(DARK) || body.classList.contains("menu-open"));
      if (!t) return;
      var txt = t.getAttribute("data-cursor");
      if (txt) { label.textContent = txt; cursor.classList.add("is-label"); }
      else cursor.classList.add("is-hover");
    });
    document.addEventListener("mouseleave", function () { cursor.style.opacity = "0"; });
    document.addEventListener("mouseenter", function () { cursor.style.opacity = "1"; });
  }

  /* ==========================================================================
     IN-PLACE PAGE TRANSITIONS
     The browser never loads a new document: panels cover the screen, the
     next page's <main> is fetched and swapped in behind them, then they lift.
     No document swap = no frame where iOS Safari can flash or resize.
     ========================================================================== */
  var curtain = $(".curtain");
  var ctTitle = curtain ? $(".curtain__title", curtain) : null;
  var PAGE_TITLES = {
    "index": "Clear<em>view</em>", "": "Clear<em>view</em>",
    "about": "About <em>Clearview</em>", "executive": "Executive <em>coaching</em>",
    "career": "Career <em>coaching</em>", "interview": "Interview <em>coaching</em>",
    "organisations": "For <em>organisations</em>", "stories": "Client <em>stories</em>",
    "insights": "Insights <em>&amp; the book</em>", "gift": "Gift <em>vouchers</em>",
    "contact": "Let's <em>talk</em>", "404": "Out of <em>focus</em>"
  };
  function titleFor(path) {
    var key = (path.split("/").pop() || "").replace(/\.html$/, "");
    return PAGE_TITLES[key] || "Clear<em>view</em>";
  }
  function resetCurtain() {
    if (!curtain) return;
    curtain.classList.add("no-anim");
    doc.classList.remove("pt-enter", "pt-covered");
    curtain.classList.remove("is-leaving", "is-covering", "is-covered");
    doc.style.backgroundColor = "";
    uiIvory();
    void curtain.offsetHeight;
    requestAnimationFrame(function () { requestAnimationFrame(function () { curtain.classList.remove("no-anim"); }); });
  }
  /* Lift the panels off a fully covered screen */
  function liftCurtain() {
    if (!curtain) return;
    curtain.classList.add("no-anim");
    doc.classList.add("pt-enter");
    curtain.classList.remove("is-covering", "is-covered");
    void curtain.offsetHeight;
    curtain.classList.remove("no-anim");
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      doc.classList.remove("pt-covered");
      curtain.classList.add("is-leaving");
      setTimeout(resetCurtain, 2100);
    }); });
  }
  /* First load arriving from a full page load (fallback path) */
  if (curtain && doc.classList.contains("pt-enter")) {
    if (ctTitle) ctTitle.innerHTML = titleFor(location.pathname);
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      curtain.classList.add("is-leaving");
      setTimeout(resetCurtain, 2100);
    }); });
  }

  /* Page HTML cache (filled by hover/touch prefetch) */
  var pageCache = {};
  function fetchPage(path) {
    if (!pageCache[path]) {
      pageCache[path] = fetch(path, { credentials: "same-origin" }).then(function (r) {
        if (!r.ok && r.status !== 404) throw new Error("HTTP " + r.status);
        return r.text();
      }).catch(function (err) { delete pageCache[path]; throw err; });
    }
    return pageCache[path];
  }
  function isPageLink(url) {
    return url.origin === location.origin && (/\.html$/.test(url.pathname) || /\/$/.test(url.pathname));
  }

  /* Cover the screen; resolves once fully covered */
  function cover(path) {
    return new Promise(function (resolve) {
      if (ctTitle) ctTitle.innerHTML = titleFor(path);
      curtain.classList.add("is-covering");
      setTimeout(uiWine, 350);
      var done = false;
      var fin = function () {
        if (done) return; done = true;
        curtain.classList.add("is-covered"); doc.classList.add("pt-covered");
        setTimeout(resolve, 500);   /* hold on the page title for a beat */
      };
      var cols = $$(".curtain__cols--wine i", curtain).filter(function (c) { return c.offsetWidth > 0; });
      var last = cols[cols.length - 1];
      if (last) last.addEventListener("transitionend", function (ev) { if (ev.propertyName === "transform") setTimeout(fin, 60); }, { once: true });
      setTimeout(fin, 1700);
    });
  }

  var navigating = false;
  function navigate(url, push) {
    if (navigating) return;
    navigating = true;
    var path = url.pathname;
    Promise.all([fetchPage(path), cover(path)]).then(function (res) {
      swapPage(res[0], url, push);
      navigating = false;
    }).catch(function () {
      /* Anything unexpected: fall back to a normal page load */
      location.href = url.href;
    });
  }

  function swapPage(html, url, push) {
    var next = new DOMParser().parseFromString(html, "text/html");
    var newMain = next.querySelector("main");
    if (!newMain) { location.href = url.href; return; }

    /* Tear down the old page (all hidden behind the solid curtain) */
    if (window.ARMotion) window.ARMotion.destroy();
    runCleanups();
    $$(".hover-img").forEach(function (el) { el.remove(); });
    closeMenu(true);

    /* Swap content, title, meta and current-page markers */
    var oldMain = $("main");
    oldMain.replaceWith(document.importNode(newMain, true));
    document.title = next.title;
    ["description"].forEach(function (n) {
      var a = $('meta[name="' + n + '"]'), b = next.querySelector('meta[name="' + n + '"]');
      if (a && b) a.setAttribute("content", b.getAttribute("content"));
    });
    var canon = $('link[rel="canonical"]'), nCanon = next.querySelector('link[rel="canonical"]');
    if (canon && nCanon) canon.setAttribute("href", nCanon.getAttribute("href"));
    body.setAttribute("data-page", next.body.getAttribute("data-page") || "");
    [".site-header .nav", ".menu__list"].forEach(function (sel) {
      var a = $(sel), b = next.querySelector(sel);
      if (a && b) a.innerHTML = b.innerHTML;
    });

    if (push) history.pushState({ ar: 1 }, "", url.href);
    jumpTop();
    if (header) header.classList.remove("is-hidden");

    /* Wire up the new page and play its entrance */
    var main = $("main");
    wireBooking(main);
    initPage(main);
    if (window.ARMotion) window.ARMotion.init(main, "enter");
    lastY = 0; onScroll();

    if (url.hash) {
      var t = document.getElementById(url.hash.slice(1));
      if (t) setTimeout(function () { scrollToEl(t); }, 900);
    }
    liftCurtain();
  }

  /* One delegated click handler for every link on the site */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (a.target && a.target !== "_self") return;
    var href = a.getAttribute("href");
    if (!href || /^(mailto:|tel:|javascript:)/i.test(href)) return;

    /* In-page anchors */
    if (href.charAt(0) === "#") {
      if (href.length < 2) return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      scrollToEl(target);
      return;
    }
    var url = new URL(a.href, location.href);
    if (!isPageLink(url)) return;
    if (url.pathname === location.pathname && url.search === location.search) {
      if (url.hash) {
        var t = document.getElementById(url.hash.slice(1));
        if (t) { e.preventDefault(); closeMenu(); scrollToEl(t); }
      }
      return;
    }
    if (!curtain || reduced) return;           /* plain navigation */
    e.preventDefault();
    navigate(url, true);
  });

  /* Back / forward */
  if (curtain && !reduced) {
    history.replaceState({ ar: 1 }, "", location.href);
    window.addEventListener("popstate", function () {
      var url = new URL(location.href);
      if (!isPageLink(url)) return;
      navigate(url, false);
    });
  }
  window.addEventListener("pageshow", function (e) { if (e.persisted) { closeMenu(true); resetCurtain(); } });

  /* Warm up pages as soon as a finger/cursor reaches a link */
  function warmPath(path) { if (path !== location.pathname) fetchPage(path).catch(function () {}); }
  var warm = function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(mailto:|tel:)/i.test(href)) return;
    var u = new URL(a.href, location.href);
    if (isPageLink(u)) warmPath(u.pathname);
  };
  document.addEventListener("touchstart", warm, { passive: true });
  document.addEventListener("mouseover", warm, { passive: true });
  var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 1500); };
  idle(function () {
    $$(".site-header .nav a, .menu__list a").forEach(function (a) {
      var u = new URL(a.href, location.href);
      if (isPageLink(u)) warmPath(u.pathname);
    });
  });

  /* ==========================================================================
     PER-PAGE INITIALISATION (content inside <main>)
     ========================================================================== */
  function initPage(root) {

    /* Magnetic buttons + service hover image (desktop pointer) */
    if (finePointer && !reduced) {
      $$("[data-magnetic]", root).forEach(function (el) {
        el.addEventListener("mousemove", function (e) {
          var r = el.getBoundingClientRect();
          el.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.22 + "px," + (e.clientY - r.top - r.height / 2) * 0.3 + "px)";
        });
        el.addEventListener("mouseleave", function () { el.style.transform = ""; });
      });
      $$("[data-hover-list]", root).forEach(function (list) {
        var box = document.createElement("div");
        box.className = "hover-img";
        box.setAttribute("aria-hidden", "true");
        var imgs = {};
        $$(".svc", list).forEach(function (row) {
          var src = row.getAttribute("data-img");
          if (!src || imgs[src]) return;
          var im = new Image(); im.src = src; im.alt = ""; box.appendChild(im); imgs[src] = im;
        });
        body.appendChild(box);
        var bx = 0, by = 0, tx = 0, ty = 0, on = false, alive = true;
        onCleanup(function () { alive = false; box.remove(); });
        (function follow() {
          if (!alive) return;
          bx += (tx - bx) * 0.12; by += (ty - by) * 0.12;
          box.style.left = bx + "px"; box.style.top = by + "px";
          requestAnimationFrame(follow);
        })();
        list.addEventListener("mousemove", function (e) { tx = e.clientX + 200; ty = e.clientY; if (!on) { bx = tx; by = ty; } });
        $$(".svc", list).forEach(function (row) {
          row.addEventListener("mouseenter", function () {
            on = true; box.classList.add("is-visible");
            Object.keys(imgs).forEach(function (k) { imgs[k].classList.toggle("is-active", k === row.getAttribute("data-img")); });
          });
        });
        list.addEventListener("mouseleave", function () { on = false; box.classList.toggle("is-visible", false); });
      });
    }

    /* Mobile carousel dots for the stacking cards */
    $$("[data-stack]", root).forEach(function (track) {
      var dots = $$(".stack-dots i", track.parentNode);
      if (!dots.length) return;
      var cards = $$(".stack-card", track);
      var busy = false;
      track.addEventListener("scroll", function () {
        if (busy) return; busy = true;
        requestAnimationFrame(function () {
          var mid = track.scrollLeft + track.clientWidth / 2, best = 0, bestD = Infinity;
          cards.forEach(function (c, i) { var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bestD) { bestD = d; best = i; } });
          dots.forEach(function (d, i) { d.classList.toggle("is-on", i === best); });
          busy = false;
        });
      }, { passive: true });
    });

    /* Marquees: clone group for a seamless loop */
    $$(".marquee__track", root).forEach(function (track) {
      var group = $(".marquee__group", track);
      if (!group || track.children.length > 1) return;
      var clone = group.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    /* Testimonial wall: duplicate cards for a seamless loop */
    $$("[data-wall] .wall__col", root).forEach(function (col) {
      if (col.dataset.cloned) return; col.dataset.cloned = "1";
      Array.prototype.slice.call(col.children).forEach(function (card) {
        var c = card.cloneNode(true); c.setAttribute("aria-hidden", "true"); col.appendChild(c);
      });
    });

    /* FAQ */
    $$(".faq__item", root).forEach(function (item) {
      var q = $(".faq__q", item);
      if (!q) return;
      q.addEventListener("click", function () {
        var open = item.classList.toggle("is-open");
        q.setAttribute("aria-expanded", open ? "true" : "false");
        setTimeout(function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); }, 650);
      });
    });

    /* Testimonial slider */
    $$("[data-quotes]", root).forEach(function (qroot) {
      var slides = $$(".quote-slide", qroot);
      var bar = $(".quotes__bar", qroot);
      var cur = $(".quotes__count b", qroot);
      var total = $(".quotes__count span", qroot);
      var i = 0, timer = null, DUR = 9000;
      if (total) total.textContent = String(slides.length).padStart(2, "0");
      function show(n) {
        slides[i].classList.remove("is-active");
        i = (n + slides.length) % slides.length;
        slides[i].classList.add("is-active");
        if (cur) cur.textContent = String(i + 1).padStart(2, "0");
        run();
      }
      function run() {
        clearTimeout(timer);
        if (bar) { bar.classList.remove("is-running"); void bar.offsetWidth; bar.style.setProperty("--dur", DUR + "ms"); bar.classList.add("is-running"); }
        if (!reduced) timer = setTimeout(function () { show(i + 1); }, DUR);
      }
      onCleanup(function () { clearTimeout(timer); });
      var prev = $("[data-prev]", qroot), next = $("[data-next]", qroot);
      if (prev) prev.addEventListener("click", function () { show(i - 1); });
      if (next) next.addEventListener("click", function () { show(i + 1); });
      var started = false;
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting && !started) { started = true; run(); } });
        }, { threshold: 0.3 });
        io.observe(qroot);
        onCleanup(function () { io.disconnect(); });
      } else run();
    });

    /* Story filters */
    var filterBar = $("[data-filters]", root);
    if (filterBar) {
      var chips = $$(".chip", filterBar);
      var stories = $$(".story", root);
      chips.forEach(function (chip) {
        var f = chip.getAttribute("data-filter");
        var n = f === "all" ? stories.length : stories.filter(function (s) { return (s.getAttribute("data-cat") || "").indexOf(f) > -1; }).length;
        if (!chip.querySelector("sup")) { var sup = document.createElement("sup"); sup.textContent = n; chip.appendChild(sup); }
        chip.addEventListener("click", function () {
          chips.forEach(function (c) { c.classList.remove("is-active"); c.setAttribute("aria-pressed", "false"); });
          chip.classList.add("is-active"); chip.setAttribute("aria-pressed", "true");
          stories.forEach(function (s) {
            var show = f === "all" || (s.getAttribute("data-cat") || "").indexOf(f) > -1;
            s.classList.toggle("is-hidden", !show);
          });
          if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        });
      });
    }

    if (window.CVTools) window.CVTools.init(root, { onCleanup: onCleanup, lenis: lenis, store: store, reduced: reduced });
  }

  initPage($("main") || document);
})();
