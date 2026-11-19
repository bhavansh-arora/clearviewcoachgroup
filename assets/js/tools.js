/* ==========================================================================
   Clearview Coaching Group — conversion tools
   CVTools.init(root, ctx) runs for each page's <main>, on load and after
   every in-place page swap: the Clearview Lens, the enquiry brief, the
   interview countdown planner, the funding-request letter, the Lunch & Learn
   builder, the feelings explorer, the voucher designer and coach tabs.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  /* Programme catalogue: names, fees and formats as published by Clearview */
  var P = {
    "executive-coaching": { name: "Leadership & Executive Coaching", price: "from €745", fmt: "Programme, or a one-off session from €395", page: "executive.html", coach: "Jane Downes", letter: "a tailored programme of one-to-one leadership coaching sessions" },
    "performance-toolkit": { name: "Workplace Skills Performance Coaching", price: "from €795", fmt: "Programme, or a one-off session from €395", page: "executive.html", letter: "a workplace skills performance coaching programme for leaders and managers" },
    "first-90-days": { name: "1st 90 Days", price: "from €795", fmt: "Programme, or a one-off session from €395", page: "executive.html", coach: "Jane Downes", letter: "a structured 1st 90 Days programme to build my strategy and early-impact toolkit" },
    "presentation-skills": { name: "Presentation Skills for Leaders", price: "from €495", fmt: "Programme, including virtual town halls", page: "executive.html", letter: "a presentation skills programme for leaders, including virtual town halls" },
    "emotional-intelligence": { name: "Emotional Intelligence (EQi)", price: "€425", fmt: "EQi assessment, 2-hour feedback & plan", page: "executive.html", letter: "an EQi emotional intelligence assessment, a two-hour feedback session and a personal development plan" },
    "career-crisis-clinic": { name: "Career Crisis Clinic", price: "from €395", fmt: "One focused 90-minute troubleshoot", page: "career.html#clinic", coach: "Jane Downes" },
    "executive-career": { name: "Executive Career Coaching", price: "from €395", fmt: "1 × 2-hour session", page: "career.html", coach: "Jane Downes" },
    "career-transition": { name: "Career Transition Programme", price: "from €545", fmt: "4 × 1-hour programme", page: "career.html", coach: "Jane or Susan" },
    "millennial": { name: "Millennial Career Coaching", price: "from €345", fmt: "1 × 2 hours, or 4 × 1 hour from €545", page: "career.html" },
    "job-hunt": { name: "Onwards & Upwards Job Hunt Strategy", price: "from €545", fmt: "2 × 1-hour programme", page: "career.html" },
    "personal-branding": { name: "Personal Branding", price: "from €295", fmt: "1 × 2 hours: brand, CV & LinkedIn", page: "career.html" },
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
    toast._t = setTimeout(function () { t.classList.remove("is-on"); }, 2800);
  }
  function legacyCopy(text) {
    return new Promise(function (res, rej) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
      ok ? res() : rej(new Error("copy failed"));
    });
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    return legacyCopy(text);
  }
  function mailto(subject, body) {
    return "mailto:" + (CFG.email || "jane@clearviewcoachgroup.com") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }
  /* A structured lead goes to the configured endpoint, or opens a pre-filled email */
  function sendLead(payload, subject, body) {
    if (CFG.formEndpoint) {
      return fetch(CFG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(Object.assign({ _subject: subject, page: location.pathname }, payload)) })
        .then(function (r) { if (!r.ok) throw new Error("send failed"); return "sent"; });
    }
    location.href = mailto(subject, body);
    return Promise.resolve("mail");
  }

  function init(root, ctx) {
    root = root || document;
    ctx = ctx || {};
    var reduced = !!ctx.reduced;
    var params = new URLSearchParams(location.search);

    /* ------------------------------------------------------------------
       THE CLEARVIEW LENS — five questions, one clear recommendation
       ------------------------------------------------------------------ */
    $$("[data-lens]", root).forEach(function (lens) {
      var steps = $$(".compass__step", lens);
      var result = $(".compass__result", lens);
      var bars = $$(".compass__progress i", lens);
      var word = $("[data-lens-word]", lens);
      var answers = {};
      function focus(n) {
        if (!word) return;
        var p = n / steps.length;
        word.style.setProperty("--blur", (12 * (1 - p)).toFixed(1) + "px");
        word.style.setProperty("--op", (0.3 + 0.7 * p).toFixed(2));
      }
      function go(n) {
        steps.forEach(function (s, k) { s.classList.toggle("is-active", k === n); });
        result.classList.remove("is-active");
        bars.forEach(function (b, k) { b.classList.toggle("is-done", k < n); });
        focus(n);
      }
      function recommend() {
        var lvl = answers.level, goal = answers.goal, when = answers.when, fund = answers.fund;
        var senior = lvl === "board" || lvl === "director";
        var id, why;
        if (goal === "interview") {
          id = senior ? "interview-leaders" : (lvl === "manager" ? "interview-promotion" : "interview-early-mid");
          why = senior
            ? "At your level the interview is a strategy conversation. We'll sharpen your unique sales pitch, show direct skills transfer for the role and rehearse the questions that decide senior appointments."
            : "A tailor-made power session, focused like a laser on your sector, the questions you're most likely to face and Jane's well-known “6 Interview Must Knows”.";
        } else if (goal === "new-role") {
          id = "first-90-days";
          why = "A new leader's success is largely decided in the first 90 days. We'll build your strategy and early-impact toolkit, from stakeholders to managing upwards, and help you track your own performance.";
        } else if (goal === "stuck") {
          if (when === "now") { id = "career-crisis-clinic"; why = "When it can't wait, one focused 90-minute troubleshoot takes you from overwhelm to a clear next step, fast."; }
          else if (senior) { id = "executive-career"; why = "You have more room for manoeuvre than you think. A two-hour executive career session maps your options, your brand and the moves that protect your reputation."; }
          else { id = "career-transition"; why = "Our four-stage career development plan turns that stuck feeling into direction, with a plan tailored to your skills and what you want next."; }
        } else {
          if (senior) { id = "executive-coaching"; why = "Wide-ranging leadership coaching on strategy, performance and career roadblocks, with a sounding board who will challenge you and keep your eye on the horizon."; }
          else if (lvl === "manager") { id = "executive-career"; why = "Plan deliberately for promotion: map your options, close the gaps and make your impact visible before the next opportunity opens."; }
          else { id = "job-hunt"; why = "A focused job hunt strategy: positioning, CV, LinkedIn and the routes into the roles you actually want."; }
        }
        if (answers.success === "confidence" && ["interview-leaders", "interview-promotion", "interview-early-mid", "first-90-days", "career-crisis-clinic"].indexOf(id) < 0) why += " Rebuilding your confidence is part of the work from session one.";
        var p = P[id];
        var coach = p.coach || (senior ? "Jane Downes" : "Jane or Susan");
        var nm = p.name.split(" ");
        var last = nm.pop();
        $(".compass__result-title", result).innerHTML = esc(nm.join(" ")) + " <em>" + esc(last) + "</em>";
        $(".compass__result-text", result).textContent = why;
        $(".compass__result-tags", result).innerHTML = "<span>" + esc(p.price) + "</span><span>" + esc(p.fmt) + "</span><span>Coach: " + esc(coach) + "</span>";
        var note = $(".lens-note", result);
        if (note) {
          if (fund === "employer") { note.hidden = false; $("span", note).innerHTML = "Your employer may well cover this. We've written the request for you: <a href=\"executive.html#funding\">make the case in one minute</a>."; }
          else if (when === "now") { note.hidden = false; $("span", note).textContent = "Time-sensitive? We'll flag it as a priority when you send this."; }
          else note.hidden = true;
        }
        var q = new URLSearchParams({ programme: id, level: lvl || "", timeline: when || "", funding: fund || "", from: "lens" });
        $("[data-result-send]", result).setAttribute("href", "contact.html?" + q.toString());
        $("[data-result-learn]", result).setAttribute("href", p.page);
        steps.forEach(function (s) { s.classList.remove("is-active"); });
        bars.forEach(function (b) { b.classList.add("is-done"); });
        result.classList.add("is-active");
        focus(steps.length);
      }
      steps.forEach(function (step, k) {
        $$(".option", step).forEach(function (opt) {
          opt.addEventListener("click", function () {
            $$(".option", step).forEach(function (o) { o.classList.remove("is-selected"); o.setAttribute("aria-pressed", "false"); });
            opt.classList.add("is-selected"); opt.setAttribute("aria-pressed", "true");
            answers[step.getAttribute("data-key")] = opt.getAttribute("data-val");
            setTimeout(function () { k < steps.length - 1 ? go(k + 1) : recommend(); }, reduced ? 0 : 280);
          });
        });
        var back = $(".compass__back", step);
        if (back) back.addEventListener("click", function () { if (k > 0) go(k - 1); });
      });
      var restart = $(".compass__restart", lens);
      if (restart) restart.addEventListener("click", function () { answers = {}; $$(".option", lens).forEach(function (o) { o.classList.remove("is-selected"); }); go(0); });
      go(0);
    });

    /* ------------------------------------------------------------------
       ENQUIRY BRIEF — four steps, pre-filled from every tool on the site,
       urgent enquiries flagged in the subject line
       ------------------------------------------------------------------ */
    $$("[data-enquiry]", root).forEach(function (form) {
      var fSteps = $$(".form__step", form);
      var fBars = $$(".form__steps i", form);
      var fCount = $(".form__count", form);
      var btnNext = $("[data-form-next]", form);
      var btnBack = $("[data-form-back]", form);
      var btnLabel = $(".btn__label", btnNext);
      var needsBox = $("[data-needs]", form);
      var cur = 0;
      var NEEDS = {
        me: [["executive-coaching", "Executive & leadership coaching", "Leaders, directors, board level"], ["career-transition", "Career change or direction", "Find and plan your next move"], ["interview-early-mid", "An interview is coming up", "Power sessions at every stage"], ["first-90-days", "Starting a new role", "1st 90 Days impact toolkit"], ["career-crisis-clinic", "Career Crisis Clinic", "90-minute troubleshoot, fast"], ["not-sure", "Not sure yet", "Help me choose"]],
        org: [["in-house", "In-house coaching programme", "One-to-one, performance & leadership"], ["lunch-learn", "Lunch & Learn series", "Bitesize career skills sessions"], ["outplacement", "Outplacement support", "Boutique redundancy programmes"], ["team-coaching", "Team coaching", "Embed new team norms"], ["first-90-days", "1st 90 Days for new managers", "Early-impact support"], ["not-sure", "A keynote or something else", "Tell us about it"]],
        gift: [["voucher", "A coaching gift voucher", "Career or career performance coaching"], ["not-sure", "Something else", "Tell us what you have in mind"]]
      };
      var LABEL = {
        level: { board: "Board / C-suite", director: "Director / senior leader", manager: "Manager / team lead", career: "Early to mid-career", student: "Student / graduate" },
        timeline: { now: "This week", month: "Within a month", quarter: "In 1–3 months", exploring: "Just exploring" },
        funding: { self: "Self-funded", employer: "Employer-funded", unsure: "Not sure yet" },
        format: { either: "Online or in person", online: "Online (video)", dublin: "In person, Dublin" }
      };
      function val(name) { var el = form.querySelector('[name="' + name + '"]:checked') || form.querySelector('select[name="' + name + '"], input[name="' + name + '"]:not([type="radio"]), textarea[name="' + name + '"]'); return el ? (el.value || "").trim() : ""; }
      function renderNeeds(selected) {
        var who = val("who") || "me";
        var list = NEEDS[who].slice();
        if (selected && P[selected] && !list.some(function (n) { return n[0] === selected; })) list.unshift([selected, P[selected].name, P[selected].fmt || ""]);
        needsBox.innerHTML = list.map(function (n) {
          return '<label class="choice"><input type="radio" name="need" value="' + n[0] + '"' + (selected === n[0] ? " checked" : "") + '><span>' + esc(n[1]) + "<small>" + esc(n[2]) + "</small></span></label>";
        }).join("");
        $$('input[name="need"]', needsBox).forEach(function (r) { r.addEventListener("change", function () { syncContext(); auto(1); }); });
        syncContext();
      }
      function syncContext() {
        var who = val("who") || "me";
        var need = val("need");
        $("[data-f-level]", form).hidden = who !== "me";
        $("[data-f-funding]", form).hidden = who !== "me";
        $("[data-f-orgsize]", form).hidden = who !== "org";
        $("[data-f-interview]", form).hidden = !/^interview/.test(need);
      }
      function priority() {
        var iv = val("interview_date");
        if (iv && /^interview/.test(val("need"))) {
          var days = Math.round((new Date(iv + "T00:00:00") - new Date().setHours(0, 0, 0, 0)) / 864e5);
          if (days >= 0 && days <= 7) return "Interview in " + days + (days === 1 ? " day" : " days");
        }
        if (val("need") === "career-crisis-clinic") return "Career Crisis Clinic";
        if (val("timeline") === "now") return "Wants to start this week";
        return "";
      }
      function rows() {
        var who = val("who"), p = P[val("need")] || {};
        var r = [["For", { me: "Me", org: "My team or organisation", gift: "A gift" }[who] || "—"], ["Looking for", p.name || "—"]];
        if (who === "me") r.push(["Level", LABEL.level[val("level")] || "—"], ["Funding", LABEL.funding[val("funding")] || "—"]);
        if (who === "org" && val("org_size")) r.push(["People", val("org_size")]);
        r.push(["Timing", LABEL.timeline[val("timeline")] || "—"], ["Format", LABEL.format[val("format")] || "—"]);
        var iv = val("interview_date");
        if (iv && /^interview/.test(val("need"))) r.push(["Interview date", new Date(iv + "T00:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" })]);
        return r;
      }
      function summary() {
        var box = $("[data-summary]", form);
        if (!box) return;
        var flag = priority();
        box.innerHTML = (flag ? '<span class="summary__flag">Priority · ' + esc(flag) + "</span>" : "") +
          "<dl>" + rows().map(function (x) { return "<div><dt>" + esc(x[0]) + "</dt><dd>" + esc(x[1]) + "</dd></div>"; }).join("") + "</dl>";
      }
      function show(n) {
        fSteps.forEach(function (s, k) { s.classList.toggle("is-active", k === n); });
        fBars.forEach(function (b, k) { b.classList.toggle("is-done", k <= n); });
        if (fCount) fCount.textContent = "Step " + (n + 1) + " of " + fSteps.length;
        if (btnBack) btnBack.hidden = n === 0;
        if (btnLabel) btnLabel.textContent = n === fSteps.length - 1 ? "Send my enquiry" : "Continue";
        if (n === fSteps.length - 1) summary();
        cur = n;
      }
      function auto(k) { if (!reduced) setTimeout(function () { if (cur === k && validate(fSteps[k], true)) show(k + 1); }, 320); }
      function validate(step, silent) {
        var ok = true;
        $$(".field", step).forEach(function (f) { f.classList.remove("has-error"); });
        var group = step.querySelector("[data-require-choice]");
        if (group && !form.querySelector('input[name="' + group.getAttribute("data-require-choice") + '"]:checked')) {
          ok = false;
          if (!silent) { group.classList.remove("shake"); void group.offsetWidth; group.classList.add("shake"); }
        }
        $$("[required]", step).forEach(function (input) {
          if (input.closest("[hidden]")) return;
          var f = input.closest(".field");
          var good = input.type === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()) : input.type === "checkbox" ? input.checked : input.value.trim().length > 0;
          if (!good) { ok = false; if (f && !silent) f.classList.add("has-error"); }
        });
        return ok;
      }
      function submit() {
        var p = P[val("need")] || {};
        var flag = priority();
        var name = val("name");
        var data = { type: val("who"), programme: val("need"), programmeName: p.name || "", level: val("level"), timeline: val("timeline"), funding: val("funding"), format: val("format"), interviewDate: val("interview_date"), orgSize: val("org_size"), name: name, email: val("email"), phone: val("phone"), organisation: val("organisation"), message: val("message"), priority: flag, source: params.get("from") || "website" };
        var subject = (flag ? "[PRIORITY] " : "") + (p.name || "Enquiry") + " · " + name;
        var body = "New enquiry from the Clearview website\n" + (flag ? "PRIORITY: " + flag + "\n" : "") + "\n" +
          rows().map(function (x) { return x[0] + ": " + x[1]; }).join("\n") +
          "\n\nName: " + name + "\nEmail: " + data.email + "\nPhone: " + (data.phone || "—") + "\nOrganisation: " + (data.organisation || "—") + "\n\nMessage:\n" + (data.message || "—") + (data.source === "lens" ? "\n\n(Recommended by the Clearview Lens)" : "");
        btnNext.setAttribute("aria-busy", "true");
        sendLead(data, subject, body).then(function (r) {
          var nm = $("[data-sent-name]", form); if (nm) nm.textContent = name.split(" ")[0] || "there";
          var how = $("[data-sent-how]", form);
          if (how) how.textContent = r === "sent" ? "Your enquiry is with the Clearview team." : "Your email app has opened with everything filled in. Just press send.";
          var bk = $("[data-sent-book]", form);
          if (bk && CFG.bookingUrl) { bk.hidden = false; bk.setAttribute("href", CFG.bookingUrl); }
          form.classList.add("is-sent");
          if (ctx.lenis) ctx.lenis.scrollTo(form, { offset: -120 }); else form.scrollIntoView();
        }).catch(function () { location.href = mailto(subject, body); });
      }
      btnNext.addEventListener("click", function (e) {
        e.preventDefault();
        if (!validate(fSteps[cur])) return;
        if (cur < fSteps.length - 1) show(cur + 1); else submit();
      });
      if (btnBack) btnBack.addEventListener("click", function (e) { e.preventDefault(); if (cur > 0) show(cur - 1); });
      form.addEventListener("submit", function (e) { e.preventDefault(); btnNext.click(); });
      $$('input[name="who"]', form).forEach(function (r) { r.addEventListener("change", function () { renderNeeds(val("need")); auto(0); }); });
      $$("input, select, textarea", form).forEach(function (el) { el.addEventListener("input", function () { var f = el.closest(".field"); if (f) f.classList.remove("has-error"); }); });

      /* Prefill: ?programme=&type=&level=&timeline=&funding=&interview=&topics=&from= */
      var prog = params.get("programme");
      var who = params.get("type") === "org" || ["in-house", "lunch-learn", "outplacement", "team-coaching"].indexOf(prog) > -1 ? "org" : (prog === "voucher" ? "gift" : (prog ? "me" : ""));
      if (who) { var w = form.querySelector('input[name="who"][value="' + who + '"]'); if (w) w.checked = true; }
      renderNeeds(prog && P[prog] ? prog : "");
      ["level", "timeline", "funding", "org_size"].forEach(function (k) { var v = params.get(k === "org_size" ? "size" : k); var el = form.querySelector('[name="' + k + '"]'); if (v && el && el.querySelector('option[value="' + v + '"]')) el.value = v; });
      if (params.get("interview")) { var ivd = form.querySelector('[name="interview_date"]'); if (ivd) ivd.value = params.get("interview"); }
      if (params.get("topics")) { var msg = form.querySelector('[name="message"]'); if (msg) msg.value = "We'd like a proposal for these Lunch & Learn sessions:\n• " + params.get("topics").split(" | ").join("\n• "); }
      syncContext();
      var note = $("[data-lens-note]", form);
      if (note && params.get("from") === "lens" && P[prog]) { note.hidden = false; $("b", note).textContent = P[prog].name; }
      if (CFG.replyPromise) $$("[data-reply-promise]", root).forEach(function (el) { el.textContent = CFG.replyPromise; });
      show(who && prog ? 2 : (who ? 1 : 0));
    });

    /* ------------------------------------------------------------------
       INTERVIEW COUNTDOWN PLANNER
       ------------------------------------------------------------------ */
    $$("[data-planner]", root).forEach(function (pl) {
      var dateIn = $("#iv-date", pl), typeIn = $("#iv-type", pl), out = $(".plan", pl), book = $("[data-planner-book]", pl);
      var today = new Date(); today.setHours(0, 0, 0, 0);
      var iso = function (dt) { return dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0"); };
      var def = new Date(today); def.setDate(def.getDate() + 10);
      dateIn.value = iso(def); dateIn.min = iso(today);
      var fmtD = function (dt) { return dt.toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" }).replace(",", ""); };
      var STORY = {
        competency: ["Map your competency stories", "Six to eight examples, each spelling out your own role and contribution, not the team's."],
        traditional: ["Shape your career story", "A crisp walk-through of your CV that leads naturally to why this role, why now."],
        promotion: ["Evidence your track record", "Make your impact visible and build your internal brand for a panel who already know you."],
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
        var h = '<div class="plan__head"><span>Your interview is in</span><b>' + (days < 0 ? "the past" : days === 0 ? "today" : days + (days === 1 ? " day" : " days")) + "</b></div>";
        if (days >= 0 && days < 4) h += '<div class="plan__alert"><b>Fast track.</b> With ' + (days === 0 ? "the interview today" : "only " + days + (days === 1 ? " day" : " days") + " to go") + ", we compress everything into one power session. Call 01 234 3766 or book below and mention your date.</div>";
        items.forEach(function (it) {
          var dt = new Date(iv); dt.setDate(dt.getDate() - it[0]);
          var when = it[0] === 0 ? "Day" : "Day −" + it[0];
          var cls = dt < today ? " is-past" : (+dt === +today ? " is-today" : "");
          h += '<div class="plan__item' + cls + '"><span class="plan__when">' + (dt < today ? when : fmtD(dt)) + '</span><div class="plan__what"><b>' + it[1] + "</b><span>" + it[2] + "</span><small>" + when + " · " + it[3] + "</small></div></div>";
        });
        out.innerHTML = h;
        if (book) book.setAttribute("href", "contact.html?" + new URLSearchParams({ programme: { public: "interview-public", board: "interview-leaders", promotion: "interview-promotion" }[typeIn.value] || "interview-early-mid", interview: dateIn.value, timeline: days < 7 ? "now" : "month" }).toString());
      }
      ["change", "input"].forEach(function (ev) { dateIn.addEventListener(ev, render); });
      typeIn.addEventListener("change", render);
      render();
    });

    /* ------------------------------------------------------------------
       GET IT FUNDED — a business case to the manager or HR
       ------------------------------------------------------------------ */
    $$("[data-letter]", root).forEach(function (lt) {
      var f = { name: $("#fl-name", lt), to: $("#fl-to", lt), role: $("#fl-role", lt), prog: $("#fl-prog", lt), goal: $("#fl-goal", lt) };
      var out = $(".letter", lt);
      var GOALS = {
        "step-up": ["I'm taking on a bigger remit and want to build the strategy and toolkit to make an early, visible impact.", "A faster ramp-up, with priorities and stakeholders mapped early", "Stronger upward management and cleaner decision-making"],
        "promotion": ["I want to prepare deliberately for the next level and close any gaps before the opportunity arrives.", "A clear view of my strengths and gaps against the next level", "Stronger succession readiness within the team"],
        "lead-team": ["I want to lead my team more effectively through change, pressure and tight deadlines.", "Higher engagement and performance across my team", "More confident leadership through change and ambiguity"],
        "presence": ["I want to communicate with more impact, from board updates to virtual town halls.", "Clearer, more persuasive communication with senior stakeholders", "Town halls and presentations that land"]
      };
      function v(el, ph) { var x = (el.value || "").trim(); return x || ph; }
      function build(asHtml) {
        var p = P[f.prog.value] || P["executive-coaching"], g = GOALS[f.goal.value] || GOALS["step-up"];
        var m = function (s) { return asHtml ? "<mark>" + esc(s) + "</mark>" : s; };
        var e = function (s) { return asHtml ? esc(s) : s; };
        return "Dear " + m(v(f.to, "[manager or HR contact]")) + ",\n\n" +
          "I'd like to propose a focused investment in my development: " + m(p.name) + " with Clearview Coaching Group, Ireland's multi-award-winning career and performance coaching firm (Best in Ireland, Career Coaching 2023/24; Manage HR Europe Top 10 Leadership Development Coaching Companies 2023).\n\n" +
          "Why now: " + e(g[0]) + "\n\n" +
          "What it involves: " + e(p.letter || p.fmt) + ". Sessions are confidential, run online or in person in Dublin, and are tailored to our business context.\n\n" +
          "What the organisation gets back:\n• " + e(g[1]) + "\n• " + e(g[2]) + "\n• A clear development plan that I'll share with you afterwards\n\n" +
          "Investment: " + m(p.price) + ". Clearview partners with organisations most days of the working week, from multinationals to the public sector.\n\n" +
          "I'd welcome ten minutes to discuss it.\n\nKind regards,\n" + m(v(f.name, "[your name]")) + "\n" + e(v(f.role, "[your role]"));
      }
      function render() { out.innerHTML = build(true); }
      Object.keys(f).forEach(function (k) { f[k].addEventListener("input", render); f[k].addEventListener("change", render); });
      $("[data-letter-copy]", lt).addEventListener("click", function () { copyText(build(false)).then(function () { toast("Letter copied. Paste it into an email."); }, function () { toast("Select the letter text to copy it."); }); });
      $("[data-letter-mail]", lt).addEventListener("click", function () { location.href = "mailto:?subject=" + encodeURIComponent("Development request: " + (P[f.prog.value] || {}).name) + "&body=" + encodeURIComponent(build(false)); });
      render();
    });

    /* ------------------------------------------------------------------
       LUNCH & LEARN BUILDER
       ------------------------------------------------------------------ */
    $$("[data-builder]", root).forEach(function (b) {
      var picks = $$(".topic", b), countEl = $("[data-builder-count]", b), wordEl = $("[data-builder-word]", b), cta = $("[data-builder-cta]", b);
      function update() {
        var chosen = picks.filter(function (p) { return p.getAttribute("aria-pressed") === "true"; }).map(function (p) { return p.getAttribute("data-topic"); });
        countEl.textContent = chosen.length;
        wordEl.textContent = chosen.length === 1 ? "session selected" : "sessions selected";
        cta.setAttribute("href", "contact.html?" + new URLSearchParams({ type: "org", programme: "lunch-learn", topics: chosen.join(" | ") }).toString());
      }
      picks.forEach(function (p) { p.addEventListener("click", function () { p.setAttribute("aria-pressed", String(p.getAttribute("aria-pressed") !== "true")); update(); }); });
      update();
    });

    /* ------------------------------------------------------------------
       NAME THE FEELING (career page)
       ------------------------------------------------------------------ */
    $$("[data-feel]", root).forEach(function (fe) {
      var picks = $$(".topic", fe), word = $(".feel__word", fe), text = $(".feel__text", fe), link = $(".feel__go", fe), linkLabel = $(".feel__go .btn__label", fe);
      var DATA = {
        stuck: ["Stuck.", "It's the word we hear most in a first session. You almost always have more room for manoeuvre than you think; it's just hard to see from where you're standing.", "career-crisis-clinic"],
        bored: ["Bored.", "Boredom is rarely laziness. Usually you've outgrown the challenge. We'll map where your skills are under-used and what would stretch you again, inside your organisation or beyond it.", "career-transition"],
        frustrated: ["Frustrated.", "Frustration is energy pointed at the wrong target. We'll find what's really blocking you, whether it's the manager, the role or the route, and turn it into a plan you control.", "executive-career"],
        undervalued: ["Undervalued.", "If your contribution isn't being seen, change how it's positioned. We'll sharpen your personal brand, CV and LinkedIn so the right people notice.", "personal-branding"],
        afraid: ["Afraid to move.", "Fear of the wrong move keeps a lot of good people in the wrong job. We'll test your options safely, one step at a time, before you commit to anything.", "career-transition"],
        resentful: ["Resentful.", "Resentment builds when the career you have stops matching the life you want. We'll reconnect your work with what matters to you now, not what mattered ten years ago.", "executive-career"],
        restless: ["Restless.", "Jane wrote the book on this. The restless realist wants more but needs a plan that works in the real world, and that's exactly what we build together.", "career-transition"]
      };
      function set(key) {
        var d = DATA[key]; if (!d) return;
        picks.forEach(function (p) { p.setAttribute("aria-pressed", String(p.getAttribute("data-feel-key") === key)); });
        word.textContent = d[0]; text.textContent = d[1];
        var p = P[d[2]];
        linkLabel.textContent = p.name + " · " + p.price;
        link.setAttribute("href", "contact.html?programme=" + d[2]);
        if (!reduced && word.animate) [word, text].forEach(function (el) { el.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 700, easing: "cubic-bezier(.22,1,.36,1)" }); });
      }
      picks.forEach(function (p) { p.addEventListener("click", function () { set(p.getAttribute("data-feel-key")); }); });
      set("stuck");
    });

    /* ------------------------------------------------------------------
       GIFT VOUCHER DESIGNER
       ------------------------------------------------------------------ */
    $$("[data-voucher]", root).forEach(function (vd) {
      var opts = $$(".vopt", vd);
      var to = $("#v-to", vd), from = $("#v-from", vd), msg = $("#v-msg", vd), email = $("#v-email", vd);
      var pv = { title: $("[data-v-title]", vd), to: $("[data-v-to]", vd), from: $("[data-v-from]", vd), msg: $("[data-v-msg]", vd), val: $("[data-v-val]", vd) };
      var chosen = opts[0];
      function render() {
        pv.title.innerHTML = chosen.getAttribute("data-title");
        pv.val.textContent = chosen.getAttribute("data-price");
        pv.to.textContent = to.value.trim() || "Someone brilliant";
        pv.from.textContent = from.value.trim() || "You";
        pv.msg.textContent = msg.value.trim() ? "“" + msg.value.trim() + "”" : "";
      }
      opts.forEach(function (o) { o.addEventListener("click", function () { chosen = o; opts.forEach(function (x) { x.setAttribute("aria-checked", String(x === o)); }); render(); }); });
      [to, from, msg].forEach(function (el) { el.addEventListener("input", render); });
      $("[data-v-send]", vd).addEventListener("click", function () {
        var em = email.value.trim();
        if (!/^\S+@\S+\.\S+$/.test(em)) { email.closest(".field").classList.add("has-error"); email.focus(); return; }
        var name = $("b", chosen).textContent;
        var body = "Hi Jane,\n\nI'd like to buy a Clearview gift voucher.\n\nVoucher: " + name + " (" + chosen.getAttribute("data-price") + ")\nFor: " + (to.value.trim() || "—") + "\nFrom: " + (from.value.trim() || "—") + "\nMessage on the voucher: " + (msg.value.trim() || "—") + "\nMy email: " + em + "\n\nThank you!";
        sendLead({ type: "voucher", voucher: name, price: chosen.getAttribute("data-price"), to: to.value, from: from.value, message: msg.value, email: em }, "Gift voucher request: " + name, body)
          .then(function (r) { toast(r === "sent" ? "Voucher request sent. We'll be in touch " + (CFG.replyPromise || "soon") + "." : "Your email app is opening with the request ready to send."); })
          .catch(function () { location.href = mailto("Gift voucher request: " + name, body); });
      });
      render();
    });

    /* ------------------------------------------------------------------
       COACH TABS
       ------------------------------------------------------------------ */
    $$("[data-tabs]", root).forEach(function (tb) {
      var btns = $$(".tabs__btn", tb), panels = $$(".tabs__panel", tb);
      btns.forEach(function (b, i) {
        b.addEventListener("click", function () {
          btns.forEach(function (x, j) { x.setAttribute("aria-selected", String(j === i)); x.tabIndex = j === i ? 0 : -1; });
          panels.forEach(function (p, j) { p.hidden = j !== i; });
          if (window.ARMotion) setTimeout(window.ARMotion.refresh, 50);
        });
      });
    });
  }

  window.CVTools = { init: init, programmes: P };
})();
