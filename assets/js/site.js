/* ==========================================================================
   Clearview Coaching Group: interactions
   Smooth scroll, motion, header & menu, the hero lens, the Clearview Lens
   diagnostic, interview countdown planner, funding-request letter,
   Lunch & Learn builder, feelings explorer, stories filter, voucher
   designer and the multi-step enquiry brief.
   ========================================================================== */
(function () {
  "use strict";

  var d = document;
  var html = d.documentElement;
  var CFG = window.SITE_CONFIG || {};
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var params = new URLSearchParams(location.search);
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  if (gsap && ST) gsap.registerPlugin(ST);

  /* ------------------------------------------------------------------
     Programme catalogue (shared by the Lens, enquiry form & vouchers)
     ------------------------------------------------------------------ */
  var P = {
    "executive-coaching": { name: "Leadership & Executive Coaching", price: "from €745", fmt: "Programme, or a one-off session from €395", page: "executive.html", coach: "Jane Downes", letter: "a tailored programme of one-to-one leadership coaching sessions" },
    "performance-toolkit": { name: "Workplace Skills Performance Coaching", price: "from €795", fmt: "Programme, or a one-off session from €395", page: "executive.html", letter: "a workplace skills performance coaching programme for leaders and managers" },
    "first-90-days": { name: "1st 90 Days", price: "from €795", fmt: "Programme, or a one-off session from €395", page: "executive.html", coach: "Jane Downes", letter: "a structured 1st 90 Days programme to build my strategy and early-impact toolkit" },
    "presentation-skills": { name: "Presentation Skills for Leaders", price: "from €495", fmt: "Programme, including virtual town halls", page: "executive.html", letter: "a presentation skills programme for leaders, including virtual town halls" },
    "emotional-intelligence": { name: "Emotional Intelligence (EQi)", price: "€425", fmt: "EQi assessment, 2-hour feedback & development plan", page: "executive.html", letter: "an EQi emotional intelligence assessment, a two-hour feedback session and a personal development plan" },
    "career-crisis-clinic": { name: "Career Crisis Clinic", price: "from €395", fmt: "One focused 90-minute career troubleshoot", page: "career.html", coach: "Jane Downes" },
    "executive-career": { name: "Executive Career Coaching", price: "from €395", fmt: "1 × 2-hour session", page: "career.html", coach: "Jane Downes" },
    "career-transition": { name: "Career Transition Programme", price: "from €545", fmt: "4 × 1-hour coaching programme", page: "career.html", coach: "Jane or Susan" },
    "millennial": { name: "Millennial Career Coaching", price: "from €345", fmt: "1 × 2 hours, or 4 × 1 hour from €545", page: "career.html" },
    "job-hunt": { name: "Onwards & Upwards Job Hunt Strategy", price: "from €545", fmt: "2 × 1-hour coaching programme", page: "career.html" },
    "personal-branding": { name: "Personal Branding", price: "from €295", fmt: "1 × 2-hour session: brand, CV & LinkedIn", page: "career.html" },
    "student": { name: "Student Career Coaching", price: "from €195", fmt: "1 × 2 hours, or 4 × 1 hour for €495", page: "career.html" },
    "graduate": { name: "Graduate Career Coaching", price: "from €195", fmt: "1 × 2 hours, or 4 × 1 hour for €410", page: "career.html" },
    "interview-leaders": { name: "Interview Coaching for Leaders", price: "from €395", fmt: "1 × 2-hour power session", page: "interview.html", coach: "Jane Downes" },
    "interview-early-mid": { name: "Interview Coaching", price: "from €345", fmt: "1 × 2-hour power session", page: "interview.html", coach: "Jane or Susan" },
    "interview-promotion": { name: "Promotional Interviews for High Performers", price: "from €345", fmt: "1 × 2-hour power session", page: "interview.html" },
    "interview-sector": { name: "Sector-Specific Interview Coaching", price: "€295", fmt: "1 × 90-minute session", page: "interview.html" },
    "interview-public": { name: "Public Sector Competency-Based Interviews", price: "from €295", fmt: "90 minutes, or 2 hours from €345", page: "interview.html" },
    "in-house": { name: "In-house Career & Performance Coaching", price: "Tailored quote", fmt: "One-to-one, team & leadership coaching", page: "organisations.html" },
    "lunch-learn": { name: "Bitesize Lunch & Learn Series", price: "Tailored quote", fmt: "Career skills sessions for your people", page: "organisations.html" },
    "outplacement": { name: "Boutique Outplacement Support", price: "Tailored quote", fmt: "Redundancy & transition programmes", page: "organisations.html" },
    "team-coaching": { name: "Team Coaching", price: "Tailored quote", fmt: "Workshops blended with one-to-one coaching", page: "organisations.html" },
    "voucher": { name: "Career Coaching Gift Voucher", price: "", fmt: "", page: "gift.html" },
    "not-sure": { name: "Not sure yet: help me choose", price: "", fmt: "", page: "contact.html" }
  };

  function toast(msg) {
    var t = $(".toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove("is-on"); }, 2600);
  }

  function legacyCopy(text) {
    return new Promise(function (res, rej) {
      var ta = d.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
      d.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
      var ok = false;
      try { ok = d.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
      ok ? res() : rej(new Error("copy failed"));
    });
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }

  function mailto(subject, body) {
    return "mailto:" + (CFG.email || "jane@clearviewcoachgroup.com") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  /* Sends a structured lead to the configured endpoint, or opens a pre-filled email */
  function sendLead(payload, subject, body) {
    if (CFG.formEndpoint) {
      return fetch(CFG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(Object.assign({ _subject: subject, page: location.pathname }, payload)) })
        .then(function (r) { if (!r.ok) throw new Error("send failed"); return "sent"; });
    }
    location.href = mailto(subject, body);
    return Promise.resolve("mail");
  }

  /* ------------------------------------------------------------------
     Smooth scroll + GSAP ticker
     ------------------------------------------------------------------ */
  var lenis = null;
  if (!reduce && window.Lenis && fine) {
    lenis = new window.Lenis({ duration: 1.1, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    if (gsap) {
      lenis.on("scroll", function () { if (ST) ST.update(); });
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  function scrollToEl(el) {
    if (lenis) lenis.scrollTo(el, { offset: -100 });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id === "#" || id === "#main" && !a.hasAttribute("data-to-top")) return;
      var target = a.hasAttribute("data-to-top") ? d.body : $(id);
      if (!target) return;
      e.preventDefault();
      if (a.hasAttribute("data-to-top")) { if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }
      else scrollToEl(target);
    });
  });

  /* ------------------------------------------------------------------
     Loader (first visit in a session)
     ------------------------------------------------------------------ */
  var startDelay = 0;
  if (html.classList.contains("is-loading")) {
    var loader = $(".loader");
    var count = $(".loader__count span");
    var t0 = performance.now();
    var dur = 1500;
    startDelay = 1.15;
    (function tick(now) {
      var p = Math.min(1, (now - t0) / dur);
      if (count) count.textContent = Math.round((1 - Math.pow(1 - p, 3)) * 100);
      if (p < 1) requestAnimationFrame(tick);
      else {
        loader.classList.add("is-done");
        setTimeout(function () { html.classList.remove("is-loading"); }, 900);
      }
    })(t0);
  }

  /* ------------------------------------------------------------------
     Header: hide on scroll down, show on scroll up
     ------------------------------------------------------------------ */
  var header = $("[data-header]");
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    if (!header) return;
    header.classList.toggle("is-scrolled", y > 40);
    var menuOpen = html.classList.contains("menu-open");
    if (!menuOpen && y > 400 && y > lastY + 4) header.classList.add("is-hidden");
    else if (y < lastY - 4 || y < 400) header.classList.remove("is-hidden");
    lastY = y;
    var m = $(".mcta");
    if (m) m.classList.toggle("is-on", y > window.innerHeight * .8 && (d.body.scrollHeight - y - window.innerHeight) > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Dropdown */
  $$("[data-drop]").forEach(function (drop) {
    var btn = $("button", drop);
    var timer;
    function open() { clearTimeout(timer); drop.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); }
    function close() { drop.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); }
    btn.addEventListener("click", function () { drop.classList.contains("is-open") ? close() : open(); });
    if (fine) {
      drop.addEventListener("mouseenter", open);
      drop.addEventListener("mouseleave", function () { timer = setTimeout(close, 180); });
    }
    d.addEventListener("click", function (e) { if (!drop.contains(e.target)) close(); });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape") { close(); } });
  });

  /* Mobile menu */
  var menuBtn = $(".menu-btn");
  var menu = $("#menu");
  function setMenu(open) {
    html.classList.toggle("menu-open", open);
    if (menuBtn) { menuBtn.setAttribute("aria-expanded", String(open)); menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu"); $(".menu-btn__label", menuBtn).textContent = open ? "Close" : "Menu"; }
    if (menu) menu.setAttribute("aria-hidden", String(!open));
    if (header) header.classList.remove("is-hidden");
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  if (menuBtn) menuBtn.addEventListener("click", function () { setMenu(!html.classList.contains("menu-open")); });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape" && html.classList.contains("menu-open")) setMenu(false); });
  $$("#menu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* ------------------------------------------------------------------
     Reveal & motion
     ------------------------------------------------------------------ */
  // Split headings into words (keeps <em> styling)
  $$("[data-split]").forEach(function (el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = d.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(" ")); return; }
            var w = d.createElement("span"); w.className = "w";
            var s = d.createElement("span"); s.textContent = p; s.style.setProperty("--i", i++);
            w.appendChild(s); frag.appendChild(w);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child);
        }
      });
    })(el);
  });

  // Manifesto words
  $$(".manifesto__text").forEach(function (el) {
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = d.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(" ")); return; }
            var s = d.createElement("span"); s.className = "mw"; s.textContent = p; frag.appendChild(s);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1) walk(child);
      });
    })(el);
  });

  var revealEls = $$("[data-reveal], [data-split], [data-scale-in], .notfound");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          setTimeout(function () { el.classList.add("is-in"); }, startDelay && el.getBoundingClientRect().top < innerHeight ? startDelay * 1000 : 0);
          io.unobserve(el);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    // stagger siblings
    $$("[data-stagger]").forEach(function (group) {
      $$("[data-reveal]", group).forEach(function (el, i) { el.style.setProperty("--d", (i * 0.08) + "s"); });
    });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  // Counters
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = (el.getAttribute("data-count").split(".")[1] || "").length;
    var fmt = function (v) { return v.toLocaleString("en-IE", { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
    if (reduce) { el.textContent = fmt(target); return; }
    var t0 = null, dur = 1800;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$("[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { var el = en.target; setTimeout(function () { animateCount(el); }, startDelay * 1000); cio.unobserve(el); }
      });
    }, { threshold: .4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  if (gsap && ST && !reduce) {
    // Parallax images
    $$("[data-parallax]").forEach(function (el) {
      var amt = parseFloat(el.getAttribute("data-parallax")) || 10;
      gsap.fromTo(el, { yPercent: -amt / 2 }, { yPercent: amt / 2, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });

    // Manifesto word lighting
    $$(".manifesto__text").forEach(function (el) {
      var words = $$(".mw", el);
      ST.create({
        trigger: el, start: "top 80%", end: "bottom 45%", scrub: true,
        onUpdate: function (self) {
          var n = Math.round(self.progress * words.length);
          words.forEach(function (w, i) { w.classList.toggle("on", i < n); });
        }
      });
    });

    // Service cards: scale back as the next one stacks on top
    if (matchMedia("(min-width: 901px)").matches) {
      var cards = $$(".svc");
      cards.forEach(function (card, i) {
        card.style.setProperty("--i", i);
        if (i === cards.length - 1) return;
        gsap.to(card, { scale: 0.94, opacity: 0.55, ease: "none", scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top " + (110 + (i + 1) * 18) + "px", scrub: true } });
      });
    }

    // Process line + lit steps
    $$(".steps").forEach(function (wrap) {
      var line = $(".steps__line i", wrap);
      var steps = $$(".step", wrap);
      ST.create({
        trigger: wrap, start: "top 75%", end: "bottom 55%", scrub: true,
        onUpdate: function (self) {
          if (line) line.style.setProperty("--p", self.progress);
          steps.forEach(function (s, i) { s.classList.toggle("is-lit", self.progress >= i / steps.length + 0.02); });
        }
      });
    });

    // Big footer word drift
    var fw = $(".footer__word-in");
    if (fw) gsap.fromTo(fw, { yPercent: 40 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: fw, start: "top bottom", end: "bottom bottom", scrub: true } });

    // 90-day bars
    $$(".ninety__bar i").forEach(function (bar) {
      gsap.from(bar, { scaleX: 0, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: bar, start: "top 85%" } });
    });
  } else {
    $$(".step").forEach(function (s) { s.classList.add("is-lit"); });
    $$(".steps__line i").forEach(function (l) { l.style.setProperty("--p", 1); });
    $$(".manifesto__text .mw").forEach(function (w) { w.classList.add("on"); });
  }

  // Magnetic buttons
  if (fine && !reduce) {
    $$("[data-magnetic]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.transform = "translate(" + x + "px," + y + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ------------------------------------------------------------------
     Hero lens: a sharp circle of focus over a blurred portrait
     ------------------------------------------------------------------ */
  $$("[data-lens]").forEach(function (lens) {
    var R = Math.max(90, Math.min(150, lens.offsetWidth * 0.3));
    var cur = { x: 0.5, y: 0.36, r: 0 };
    var tgt = { x: 0.5, y: 0.36, r: R };
    var hovering = false;
    var t0 = performance.now();
    if (reduce) { lens.style.setProperty("--r", R + "px"); return; }
    lens.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var r = lens.getBoundingClientRect();
      tgt.x = (e.clientX - r.left) / r.width;
      tgt.y = (e.clientY - r.top) / r.height;
      hovering = true;
    });
    lens.addEventListener("pointerleave", function () { hovering = false; });
    var visible = true;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, {}).observe(lens);
    setTimeout(function loop() {
      (function frame(now) {
        if (visible) {
          if (!hovering) {
            var t = (now - t0) / 1000;
            tgt.x = 0.5 + Math.sin(t * 0.45) * 0.16;
            tgt.y = 0.34 + Math.sin(t * 0.32 + 1) * 0.12;
          }
          cur.x += (tgt.x - cur.x) * 0.08;
          cur.y += (tgt.y - cur.y) * 0.08;
          cur.r += (tgt.r - cur.r) * 0.05;
          lens.style.setProperty("--x", (cur.x * 100).toFixed(2) + "%");
          lens.style.setProperty("--y", (cur.y * 100).toFixed(2) + "%");
          lens.style.setProperty("--r", cur.r.toFixed(1) + "px");
        }
        requestAnimationFrame(frame);
      })(performance.now());
    }, startDelay * 1000 + 300);
  });

  /* ------------------------------------------------------------------
     Testimonial slider
     ------------------------------------------------------------------ */
  $$("[data-tslider]").forEach(function (root) {
    var slides = $$(".tslide", root);
    var countEl = $(".tslider__count", root);
    var prog = $(".tslider__prog i", root);
    var idx = 0, timer, start, DUR = 9000, paused = false, elapsed = 0;
    function show(n) {
      slides[idx].classList.remove("is-active");
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add("is-active");
      if (countEl) countEl.textContent = String(idx + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
      elapsed = 0; start = performance.now();
    }
    function frame(now) {
      if (!paused) {
        var p = Math.min(1, (elapsed + now - start) / DUR);
        if (prog) prog.style.transform = "scaleX(" + p + ")";
        if (p >= 1) show(idx + 1);
      }
      timer = requestAnimationFrame(frame);
    }
    $(".tslider__next", root).addEventListener("click", function () { show(idx + 1); });
    $(".tslider__prev", root).addEventListener("click", function () { show(idx - 1); });
    root.addEventListener("mouseenter", function () { paused = true; elapsed += performance.now() - start; });
    root.addEventListener("mouseleave", function () { paused = false; start = performance.now(); });
    show(0);
    if (!reduce) timer = requestAnimationFrame(frame);
  });

  /* ------------------------------------------------------------------
     The Clearview Lens: a 60-second diagnostic
     ------------------------------------------------------------------ */
  $$("[data-diag]").forEach(function (root) {
    var steps = $$(".diag__step", root);
    var result = $(".diag__result", root);
    var back = $(".diag__back", root);
    var word = $("[data-diag-word]");
    var bar = $("[data-diag-bar]");
    var label = $("[data-diag-label]");
    var answers = {};
    var cur = 0;

    function setProgress(n) {
      var p = n / steps.length;
      if (word) { word.style.setProperty("--blur", (14 * (1 - p)).toFixed(1) + "px"); word.style.setProperty("--op", (0.35 + 0.65 * p).toFixed(2)); }
      if (bar) bar.style.setProperty("--p", (p * 100) + "%");
      if (label) label.textContent = n >= steps.length ? "In focus" : Math.round(p * 100) + "% in focus";
    }
    function go(n) {
      steps.forEach(function (s, i) { s.classList.toggle("is-active", i === n); });
      result.classList.remove("is-active");
      cur = n;
      back.disabled = n === 0;
      setProgress(n);
    }
    function recommend(a) {
      var lvl = a.level, goal = a.goal, when = a.when, fund = a.fund;
      var senior = lvl === "board" || lvl === "director";
      var id, why;
      if (goal === "interview") {
        id = senior ? "interview-leaders" : (lvl === "manager" ? "interview-promotion" : "interview-early-mid");
        why = senior
          ? "At your level the interview is a strategy conversation. We'll sharpen your unique sales pitch, show direct skills transfer for the role and rehearse the questions that decide senior appointments."
          : "A tailor-made power session focused like a laser on your sector, the questions you're most likely to face and Jane's well-known “6 Interview Must Knows”.";
      } else if (goal === "new-role") {
        id = "first-90-days";
        why = "A new leader's success is largely decided in the first 90 days. We'll build your strategy and early-impact toolkit (stakeholders, team, managing upwards) and help you track your own performance.";
      } else if (goal === "stuck") {
        if (when === "now") { id = "career-crisis-clinic"; why = "When it can't wait, a focused 90-minute troubleshoot gets you from overwhelm to a clear next step, fast."; }
        else if (senior) { id = "executive-career"; why = "You have more room for manoeuvre than you think. A two-hour executive career session maps your options, your brand and the moves that protect your reputation."; }
        else { id = "career-transition"; why = "Our four-stage career development plan turns that stuck feeling into direction, with a plan tailored to your skills and what you want next."; }
      } else {
        if (senior) { id = "executive-coaching"; why = "Wide-ranging leadership coaching on strategy, performance and career roadblocks, with a sounding board who will challenge you and keep your eye on the horizon."; }
        else if (lvl === "manager") { id = "executive-career"; why = "Planning deliberately for promotion: we'll map your options, close the gaps and make your impact visible before the next opportunity opens."; }
        else { id = "job-hunt"; why = "A focused job hunt strategy: positioning, CV, LinkedIn and the routes into the roles you actually want."; }
      }
      if (a.success === "confidence" && goal !== "interview" && goal !== "new-role" && id !== "career-crisis-clinic") why += " Rebuilding your confidence is part of the work from session one.";
      var p = P[id];
      var coach = p.coach || (senior ? "Jane Downes" : "Jane or Susan");
      $(".res__title", result).textContent = p.name;
      $(".res__why", result).textContent = why;
      $("[data-res-price]", result).textContent = p.price;
      $("[data-res-fmt]", result).textContent = p.fmt;
      $("[data-res-coach]", result).textContent = coach;
      var note = $(".res__note", result);
      if (fund === "employer") {
        note.hidden = false;
        $("span", note).innerHTML = "Your employer may well cover this. We've written the request for you: <a href=\"executive.html#funding\">generate your funding request</a> in one minute.";
      } else if (when === "now") {
        note.hidden = false;
        $("span", note).textContent = "Time-sensitive? Mention it when you book and we'll prioritise your first conversation.";
      } else note.hidden = true;
      var q = new URLSearchParams({ programme: id, level: lvl || "", timeline: when || "", funding: fund || "", from: "lens" });
      $("[data-res-book]", result).setAttribute("href", "contact.html?" + q.toString());
      $("[data-res-more]", result).setAttribute("href", p.page);
      steps.forEach(function (s) { s.classList.remove("is-active"); });
      result.classList.add("is-active");
      back.disabled = true;
      setProgress(steps.length);
    }
    $$(".opt", root).forEach(function (opt) {
      opt.addEventListener("click", function () {
        var step = opt.closest(".diag__step");
        $$(".opt", step).forEach(function (o) { o.setAttribute("aria-pressed", String(o === opt)); });
        answers[step.getAttribute("data-key")] = opt.getAttribute("data-val");
        setTimeout(function () {
          if (cur < steps.length - 1) go(cur + 1); else recommend(answers);
        }, reduce ? 0 : 260);
      });
    });
    back.addEventListener("click", function () { if (cur > 0) go(cur - 1); });
    $(".res__redo", root).addEventListener("click", function () {
      answers = {};
      $$(".opt", root).forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
      go(0);
    });
    go(0);
  });

  /* ------------------------------------------------------------------
     Interview countdown planner
     ------------------------------------------------------------------ */
  $$("[data-planner]").forEach(function (root) {
    var dateIn = $("#iv-date", root);
    var typeIn = $("#iv-type", root);
    var out = $(".plan", root);
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var def = new Date(today); def.setDate(def.getDate() + 10);
    function iso(dt) { return dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0"); }
    dateIn.value = iso(def);
    dateIn.min = iso(today);
    var fmtD = function (dt) { return dt.toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" }); };
    var STORY = {
      competency: ["Map your competency stories", "Six to eight examples, each spelling out your own role and contribution, not the team's."],
      traditional: ["Shape your career story", "A crisp walk-through of your CV that leads naturally to why this role, why now."],
      promotion: ["Evidence your track record", "Make your impact visible and build your internal brand for the panel who already know you."],
      public: ["Map the competency framework", "Match strong examples to each published competency, in the language the panel scores against."],
      board: ["Frame your board-level value", "Governance, strategic perspective and what you uniquely add to this board."]
    };
    function render() {
      var iv = new Date(dateIn.value + "T00:00:00");
      if (isNaN(iv)) return;
      var days = Math.round((iv - today) / 864e5);
      var story = STORY[typeIn.value] || STORY.competency;
      var items = [
        [7, "Build your “Why ME” list", "A clear list of what you uniquely bring: your sales pitch for this role in five lines.", "Interview skills"],
        [5, story[0], story[1], "Structure"],
        [4, "Prepare for the awkward questions", "Gaps, a difficult exit, salary: calm, positive answers you've already said out loud.", "Confidence"],
        [3, "Power session with your Clearview coach", "Tailor-made to your agenda: sector-specific challenges, the panel's likely methods and live feedback.", "Book this session"],
        [1, "Clear out self-limiting beliefs", "Name the doubts and reframe them so they don't walk into the room with you. Plan the logistics.", "Mindset"],
        [0, "Ground yourself, then go", "Use a grounding technique to settle nerves and create energy just before you walk in.", "Interview day"]
      ];
      var htmlStr = "";
      htmlStr += '<div class="plan__head"><span>Your interview is in</span><b>' + (days <= 0 ? (days === 0 ? "today" : "the past") : days + (days === 1 ? " day" : " days")) + "</b></div>";
      if (days >= 0 && days < 4) {
        htmlStr += '<div class="plan__alert"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg><span><b>Fast track.</b> With ' + (days === 0 ? "the interview today" : "only " + days + (days === 1 ? " day" : " days") + " to go") + ", we compress everything into one power session. Call 01 234 3766 or book below and mention your date.</span></div>";
      }
      items.forEach(function (it) {
        var dt = new Date(iv); dt.setDate(dt.getDate() - it[0]);
        var cls = "";
        var when = it[0] === 0 ? "Day" : "Day −" + it[0];
        if (dt < today) cls = " is-past";
        else if (+dt === +today) cls = " is-today";
        htmlStr += '<div class="plan__item' + cls + '"><span class="plan__when">' + (dt < today ? when : fmtD(dt).replace(",", "")) + '</span><div class="plan__what"><b>' + it[1] + "</b><span>" + it[2] + "</span><small>" + when + " · " + it[3] + "</small></div></div>";
      });
      out.innerHTML = htmlStr;
      var book = $("[data-planner-book]", root);
      if (book) book.setAttribute("href", "contact.html?" + new URLSearchParams({ programme: typeIn.value === "public" ? "interview-public" : (typeIn.value === "board" ? "interview-leaders" : (typeIn.value === "promotion" ? "interview-promotion" : "interview-early-mid")), interview: dateIn.value, timeline: days < 7 ? "now" : "month" }).toString());
    }
    dateIn.addEventListener("change", render);
    dateIn.addEventListener("input", render);
    typeIn.addEventListener("change", render);
    render();
  });

  /* ------------------------------------------------------------------
     Funding request letter
     ------------------------------------------------------------------ */
  $$("[data-letter]").forEach(function (root) {
    var f = { name: $("#fl-name", root), to: $("#fl-to", root), role: $("#fl-role", root), prog: $("#fl-prog", root), goal: $("#fl-goal", root) };
    var out = $(".letter", root);
    var GOALS = {
      "step-up": ["I'm taking on a bigger remit and want to build the strategy and toolkit to make an early, visible impact.", "A faster ramp-up, with priorities and stakeholders mapped early", "Stronger upward management and cleaner decision-making"],
      "promotion": ["I want to prepare deliberately for the next level and close any gaps before the opportunity arrives.", "A clear view of my strengths and gaps against the next level", "Stronger succession readiness within the team"],
      "lead-team": ["I want to lead my team more effectively through change, pressure and tight deadlines.", "Higher engagement and performance across my team", "More confident leadership through change and ambiguity"],
      "presence": ["I want to communicate with more impact, from board updates to virtual town halls.", "Clearer, more persuasive communication with senior stakeholders", "Town halls and presentations that land"]
    };
    function val(el, ph) { var v = (el.value || "").trim(); return v ? v : ph; }
    function build(asHtml) {
      var p = P[f.prog.value] || P["executive-coaching"];
      var g = GOALS[f.goal.value] || GOALS["step-up"];
      var m = function (s) { return asHtml ? "<mark>" + s + "</mark>" : s; };
      var esc = function (s) { return asHtml ? String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }) : s; };
      return "Dear " + m(esc(val(f.to, "[manager or HR contact]"))) + ",\n\n" +
        "I'd like to propose a focused investment in my development: " + m(p.name) + " with Clearview Coaching Group, Ireland's multi-award-winning career and performance coaching firm (Best in Ireland, Career Coaching 2023/24; Manage HR Europe Top 10 Leadership Development Coaching Companies 2023).\n\n" +
        "Why now: " + g[0] + "\n\n" +
        "What it involves: " + (p.letter || p.fmt) + ". Sessions are confidential, run online or in person in Dublin, and are tailored to our business context.\n\n" +
        "What the organisation gets back:\n• " + g[1] + "\n• " + g[2] + "\n• A clear development plan that I'll share with you afterwards\n\n" +
        "Investment: " + m(p.price) + ". Clearview partners with organisations most days of the working week, from multinationals to the public sector.\n\n" +
        "I'd welcome ten minutes to discuss it.\n\nKind regards,\n" + m(esc(val(f.name, "[your name]"))) + "\n" + esc(val(f.role, "[your role]"));
    }
    function render() { out.innerHTML = build(true); }
    Object.keys(f).forEach(function (k) { f[k].addEventListener("input", render); f[k].addEventListener("change", render); });
    $("[data-letter-copy]", root).addEventListener("click", function () {
      copyText(build(false)).then(function () { toast("Letter copied. Paste it into an email."); }, function () { toast("Select the letter text to copy it."); });
    });
    $("[data-letter-mail]", root).addEventListener("click", function () {
      location.href = "mailto:?subject=" + encodeURIComponent("Development request: " + (P[f.prog.value] || {}).name) + "&body=" + encodeURIComponent(build(false));
    });
    render();
  });

  /* ------------------------------------------------------------------
     Lunch & Learn builder
     ------------------------------------------------------------------ */
  $$("[data-builder]").forEach(function (root) {
    var picks = $$(".pick", root);
    var countEl = $("[data-builder-count]", root);
    var cta = $("[data-builder-cta]", root);
    function update() {
      var chosen = picks.filter(function (p) { return p.getAttribute("aria-pressed") === "true"; }).map(function (p) { return p.getAttribute("data-topic"); });
      countEl.textContent = chosen.length;
      $("[data-builder-word]", root).textContent = chosen.length === 1 ? "session selected" : "sessions selected";
      cta.setAttribute("href", "contact.html?" + new URLSearchParams({ type: "org", programme: "lunch-learn", topics: chosen.join(" | ") }).toString());
    }
    picks.forEach(function (p) {
      p.addEventListener("click", function () { p.setAttribute("aria-pressed", String(p.getAttribute("aria-pressed") !== "true")); update(); });
    });
    update();
  });

  /* ------------------------------------------------------------------
     Feelings explorer (career page)
     ------------------------------------------------------------------ */
  $$("[data-feel]").forEach(function (root) {
    var picks = $$(".pick", root);
    var word = $(".feel__word", root), text = $(".feel__text", root), link = $(".feel__next a", root), linkLabel = $(".feel__next a span", root);
    var DATA = {
      bored: ["Bored.", "Boredom is rarely laziness. Usually you've outgrown the challenge. We'll map where your skills are under-used and what would stretch you again, inside your organisation or beyond it.", "career-transition"],
      frustrated: ["Frustrated.", "Frustration is energy pointed at the wrong target. We'll find what's really blocking you, whether it's the manager, the role or the route, and turn it into a plan you control.", "executive-career"],
      stuck: ["Stuck.", "It's the word we hear most in a first session. You almost always have more room for manoeuvre than you think; it's just hard to see from where you're standing.", "career-crisis-clinic"],
      undervalued: ["Undervalued.", "If your contribution isn't being seen, change how it's positioned. We'll sharpen your personal brand, CV and LinkedIn so the right people notice.", "personal-branding"],
      afraid: ["Afraid to move.", "Fear of the wrong move keeps a lot of good people in the wrong job. We'll test your options safely, one step at a time, before you commit to anything.", "career-transition"],
      resentful: ["Resentful.", "Resentment builds when the career you have stops matching the life you want. We'll reconnect your work with what matters to you now, not what mattered ten years ago.", "executive-career"],
      restless: ["Restless.", "Jane wrote the book on this. The restless realist wants more but needs a plan that works in the real world, and that's exactly what we build together.", "career-transition"]
    };
    function set(key) {
      var v = DATA[key]; if (!v) return;
      picks.forEach(function (p) { p.setAttribute("aria-pressed", String(p.getAttribute("data-feel-key") === key)); });
      word.textContent = v[0]; text.textContent = v[1];
      var p = P[v[2]];
      linkLabel.textContent = p.name + " · " + p.price;
      link.setAttribute("href", "contact.html?programme=" + v[2]);
      if (!reduce) { [word, text].forEach(function (el) { el.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 600, easing: "cubic-bezier(.22,1,.36,1)" }); }); }
    }
    picks.forEach(function (p) { p.addEventListener("click", function () { set(p.getAttribute("data-feel-key")); }); });
    set("stuck");
  });

  /* ------------------------------------------------------------------
     Stories filter
     ------------------------------------------------------------------ */
  $$("[data-filter-group]").forEach(function (group) {
    var btns = $$(".filter", group);
    var items = $$("[data-cat]");
    btns.forEach(function (b) {
      var key = b.getAttribute("data-filter");
      var n = key === "all" ? items.length : items.filter(function (it) { return it.getAttribute("data-cat").split(" ").indexOf(key) > -1; }).length;
      var c = d.createElement("span"); c.textContent = n; b.appendChild(c);
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        items.forEach(function (it) {
          var show = key === "all" || it.getAttribute("data-cat").split(" ").indexOf(key) > -1;
          it.classList.toggle("is-hidden", !show);
        });
        if (ST) ST.refresh();
      });
    });
  });

  /* ------------------------------------------------------------------
     Tabs (coach credentials)
     ------------------------------------------------------------------ */
  $$("[data-tabs]").forEach(function (root) {
    var btns = $$(".tabs__btn", root), panels = $$(".tabs__panel", root);
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () {
        btns.forEach(function (x, j) { x.setAttribute("aria-selected", String(j === i)); x.tabIndex = j === i ? 0 : -1; });
        panels.forEach(function (p, j) { p.hidden = j !== i; });
      });
    });
  });

  /* ------------------------------------------------------------------
     Voucher designer
     ------------------------------------------------------------------ */
  $$("[data-voucher]").forEach(function (root) {
    var opts = $$(".vopt", root);
    var to = $("#v-to", root), from = $("#v-from", root), msg = $("#v-msg", root), email = $("#v-email", root);
    var pv = { title: $("[data-v-title]", root), to: $("[data-v-to]", root), from: $("[data-v-from]", root), msg: $("[data-v-msg]", root), val: $("[data-v-val]", root) };
    var chosen = opts[0];
    function render() {
      pv.title.innerHTML = chosen.getAttribute("data-title");
      pv.val.textContent = chosen.getAttribute("data-price");
      pv.to.textContent = to.value.trim() || "Someone brilliant";
      pv.from.textContent = from.value.trim() || "You";
      pv.msg.textContent = msg.value.trim() ? "“" + msg.value.trim() + "”" : "";
    }
    opts.forEach(function (o) {
      o.addEventListener("click", function () {
        chosen = o;
        opts.forEach(function (x) { x.setAttribute("aria-checked", String(x === o)); });
        render();
      });
    });
    [to, from, msg].forEach(function (el) { el.addEventListener("input", render); });
    $("[data-v-send]", root).addEventListener("click", function () {
      if (!email.value.trim() || !/^\S+@\S+\.\S+$/.test(email.value.trim())) { email.focus(); toast("Add your email so we can send the voucher."); return; }
      var name = chosen.querySelector("b").textContent;
      var body = "Hi Jane,\n\nI'd like to buy a Clearview gift voucher.\n\nVoucher: " + name + " (" + chosen.getAttribute("data-price") + ")\nFor: " + (to.value.trim() || "-") + "\nFrom: " + (from.value.trim() || "-") + "\nMessage on the voucher: " + (msg.value.trim() || "-") + "\nMy email: " + email.value.trim() + "\n\nThank you!";
      sendLead({ type: "voucher", voucher: name, price: chosen.getAttribute("data-price"), to: to.value, from: from.value, message: msg.value, email: email.value }, "Gift voucher request: " + name, body)
        .then(function (r) { toast(r === "sent" ? "Voucher request sent. We'll be in touch " + (CFG.replyPromise || "soon") + "." : "Your email app is opening with the request ready to send."); })
        .catch(function () { location.href = mailto("Gift voucher request: " + name, body); });
    });
    render();
  });

  /* ------------------------------------------------------------------
     Enquiry brief (multi-step form)
     ------------------------------------------------------------------ */
  $$("[data-enquiry]").forEach(function (form) {
    var steps = $$(".fstep", form);
    var dots = $$(".fsteps__i", form);
    var back = $(".fnav .diag__back", form);
    var next = $("[data-next]", form);
    var nav = $(".fnav", form);
    var done = $(".fdone", form);
    var state = { who: "", need: "", level: "", timeline: "", funding: "", format: "", interview: "" };
    var cur = 0;
    var NEEDS = {
      me: [["executive-coaching", "Executive & leadership coaching", "Leaders, directors, board level"], ["career-transition", "Career change or direction", "Find and plan your next move"], ["interview-early-mid", "An interview is coming up", "Power sessions at every stage"], ["first-90-days", "Starting a new role", "1st 90 Days impact toolkit"], ["career-crisis-clinic", "Career Crisis Clinic", "90-minute troubleshoot, fast"], ["not-sure", "Not sure yet", "Help me choose"]],
      org: [["in-house", "In-house coaching programme", "One-to-one, performance & leadership"], ["lunch-learn", "Lunch & Learn series", "Bitesize career skills sessions"], ["outplacement", "Outplacement support", "Boutique redundancy programmes"], ["team-coaching", "Team coaching", "Embed new team norms"], ["first-90-days", "1st 90 Days for new managers", "Early-impact support"], ["not-sure", "A keynote or something else", "Tell us about it"]],
      gift: [["voucher", "A coaching gift voucher", "Career or career performance coaching"], ["not-sure", "Something else", "Tell us what you have in mind"]]
    };
    var ICON = '<span class="choice__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span>';

    function renderNeeds() {
      var grid = $("[data-needs]", form);
      var list = NEEDS[state.who] || NEEDS.me;
      grid.innerHTML = list.map(function (n) {
        return '<button type="button" class="choice" data-group="need" data-val="' + n[0] + '" aria-pressed="' + (state.need === n[0]) + '">' + ICON + "<b>" + n[1] + "</b><small>" + n[2] + "</small></button>";
      }).join("");
      bindChoices(grid);
      var interviewish = /^interview/.test(state.need);
      $("[data-interview-field]", form).hidden = !interviewish;
      $("[data-level-field]", form).hidden = state.who !== "me";
      $("[data-org-field]", form).hidden = state.who !== "org";
      $("[data-funding-field]", form).hidden = state.who !== "me";
    }
    function bindChoices(scope) {
      $$(".choice", scope).forEach(function (c) {
        c.addEventListener("click", function () {
          var g = c.getAttribute("data-group");
          $$('.choice[data-group="' + g + '"]', form).forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
          state[g] = c.getAttribute("data-val");
          if (g === "who") { if (!NEEDS[state.who].some(function (n) { return n[0] === state.need; })) state.need = ""; renderNeeds(); }
          if (g === "need") { $("[data-interview-field]", form).hidden = !/^interview/.test(state.need); }
          if ((g === "who" || g === "need") && !reduce) setTimeout(function () { if (valid(cur, true)) go(cur + 1); }, 280);
        });
      });
    }
    function valid(n, silent) {
      var err = $(".field-err", steps[n]);
      var ok = true, msg = "";
      if (n === 0 && !state.who) { ok = false; msg = "Choose one to continue."; }
      if (n === 1 && !state.need) { ok = false; msg = "Choose what you need help with."; }
      if (n === 3) {
        var nm = $("#e-name", form), em = $("#e-email", form), cs = $("#e-consent", form);
        if (!nm.value.trim()) { ok = false; msg = "Please add your name."; if (!silent) nm.focus(); }
        else if (!/^\S+@\S+\.\S+$/.test(em.value.trim())) { ok = false; msg = "Please add a valid email address."; if (!silent) em.focus(); }
        else if (!cs.checked) { ok = false; msg = "Please confirm we can contact you about your enquiry."; }
      }
      if (err) err.textContent = silent ? "" : msg;
      return ok;
    }
    function readSelects() {
      ["level", "timeline", "funding", "format"].forEach(function (k) { var el = $("#e-" + k, form); if (el) state[k] = el.value; });
      var iv = $("#e-interview", form); if (iv) state.interview = iv.value;
      var org = $("#e-orgsize", form); if (org) state.orgsize = org.value;
    }
    function priority() {
      if (state.interview) {
        var days = Math.round((new Date(state.interview + "T00:00:00") - new Date().setHours(0, 0, 0, 0)) / 864e5);
        if (days >= 0 && days <= 7) return "Interview in " + days + (days === 1 ? " day" : " days");
      }
      if (state.need === "career-crisis-clinic") return "Career Crisis Clinic";
      if (state.timeline === "now") return "Wants to start this week";
      return "";
    }
    var LABEL = {
      level: { board: "Board / C-suite", director: "Director / senior leader", manager: "Manager / team lead", career: "Early to mid-career", student: "Student / graduate", "": "-" },
      timeline: { now: "This week", month: "Within a month", quarter: "In 1–3 months", exploring: "Just exploring", "": "-" },
      funding: { self: "Self-funded", employer: "Employer-funded", unsure: "Not sure yet", "": "-" },
      format: { either: "Either", online: "Online", dublin: "In person, Dublin", "": "-" }
    };
    function summary() {
      readSelects();
      var p = P[state.need] || {};
      var rows = [["For", { me: "Me", org: "My team or organisation", gift: "A gift" }[state.who] || "-"], ["Looking for", p.name || "-"]];
      if (state.who === "me") rows.push(["Level", LABEL.level[state.level]], ["Funding", LABEL.funding[state.funding]]);
      if (state.who === "org" && state.orgsize) rows.push(["People", state.orgsize]);
      rows.push(["Timing", LABEL.timeline[state.timeline]], ["Format", LABEL.format[state.format]]);
      if (state.interview && /^interview/.test(state.need)) rows.push(["Interview date", new Date(state.interview + "T00:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" })]);
      var flag = priority();
      $(".summary", form).innerHTML = (flag ? '<span class="summary__flag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>Priority · ' + flag + "</span>" : "") +
        "<dl>" + rows.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>"; }).join("") + "</dl>";
      return rows;
    }
    function go(n) {
      if (n === 3) summary();
      steps.forEach(function (s, i) { s.classList.toggle("is-active", i === n); });
      dots.forEach(function (dd, i) { dd.classList.toggle("is-active", i === n); dd.classList.toggle("is-done", i < n); });
      cur = n;
      back.disabled = n === 0;
      $("span", next).textContent = n === steps.length - 1 ? "Send my enquiry" : "Continue";
      var top = form.getBoundingClientRect().top;
      if (top < 0) scrollToEl(form);
    }
    next.addEventListener("click", function () {
      if (!valid(cur)) return;
      if (cur < steps.length - 1) { go(cur + 1); return; }
      var rows = summary();
      var p = P[state.need] || {};
      var flag = priority();
      var name = $("#e-name", form).value.trim();
      var data = {
        type: state.who, programme: state.need, programmeName: p.name || "", level: state.level, timeline: state.timeline, funding: state.funding, format: state.format, interviewDate: state.interview, orgSize: state.orgsize || "",
        name: name, email: $("#e-email", form).value.trim(), phone: $("#e-phone", form).value.trim(), organisation: $("#e-org", form).value.trim(), message: $("#e-msg", form).value.trim(), priority: flag, source: params.get("from") || "website"
      };
      var subject = (flag ? "[PRIORITY] " : "") + (p.name || "Enquiry") + " · " + name;
      var body = "New enquiry from the Clearview website\n" + (flag ? "PRIORITY: " + flag + "\n" : "") + "\n" +
        rows.map(function (r) { return r[0] + ": " + r[1]; }).join("\n") +
        "\n\nName: " + data.name + "\nEmail: " + data.email + "\nPhone: " + (data.phone || "-") + "\nOrganisation: " + (data.organisation || "-") + "\n\nMessage:\n" + (data.message || "-") + (data.source === "lens" ? "\n\n(Recommended by the Clearview Lens diagnostic)" : "");
      next.disabled = true;
      sendLead(data, subject, body).then(function (r) {
        steps.forEach(function (s) { s.classList.remove("is-active"); });
        nav.hidden = true; $(".fsteps", form).hidden = true;
        $("[data-done-text]", form).textContent = r === "sent"
          ? "Thank you, " + name.split(" ")[0] + ". Your enquiry is with the Clearview team and you'll hear back " + (CFG.replyPromise || "shortly") + "."
          : "Your email app has opened with everything filled in. Just press send, and you'll hear back " + (CFG.replyPromise || "shortly") + ".";
        var bk = $("[data-done-book]", form);
        if (CFG.bookingUrl && bk) { bk.hidden = false; bk.setAttribute("href", CFG.bookingUrl); }
        done.classList.add("is-active");
      }).catch(function () {
        next.disabled = false;
        location.href = mailto(subject, body);
      });
    });
    back.addEventListener("click", function () { if (cur > 0) go(cur - 1); });
    $$("input, select, textarea", form).forEach(function (el) {
      el.addEventListener("input", function () { var e = $(".fstep.is-active .field-err", form); if (e) e.textContent = ""; });
    });
    bindChoices(form);

    // Prefill from links across the site (Lens result, planner, builder, programme menus)
    var prog = params.get("programme");
    var type = params.get("type");
    if (prog && P[prog]) {
      state.who = ["in-house", "lunch-learn", "outplacement", "team-coaching"].indexOf(prog) > -1 || type === "org" ? "org" : (prog === "voucher" ? "gift" : "me");
      if (!NEEDS[state.who].some(function (n) { return n[0] === prog; })) NEEDS[state.who].unshift([prog, P[prog].name, P[prog].fmt || ""]);
      state.need = prog;
    } else if (type === "org") state.who = "org";
    $$('.choice[data-group="who"]', form).forEach(function (c) { c.setAttribute("aria-pressed", String(c.getAttribute("data-val") === state.who)); });
    renderNeeds();
    ["level", "timeline", "funding"].forEach(function (k) { var v = params.get(k); var el = $("#e-" + k, form); if (v && el && $('option[value="' + v + '"]', el)) el.value = v; });
    if (params.get("interview")) { $("#e-interview", form).value = params.get("interview"); }
    if (params.get("topics")) $("#e-msg", form).value = "We'd like a proposal for these Lunch & Learn sessions:\n• " + params.get("topics").split(" | ").join("\n• ");
    var startAt = state.who && state.need ? 2 : (state.who ? 1 : 0);
    if (params.get("from") === "lens") {
      var note = $("[data-lens-note]", form);
      if (note) { note.hidden = false; $("b", note).textContent = (P[prog] || {}).name || ""; }
    }
    go(startAt);
  });

  /* Hero card year etc. */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
