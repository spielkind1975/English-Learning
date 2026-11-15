(() => {
  "use strict";

  const TOPICS = window.TOPICS;
  const PRON = window.PRONUNCIATION;
  const app = document.getElementById("app");

  // ---------- Speicher ----------
  const STORE_KEY = "bec-state-v1";
  const defaultState = {
    settings: { lang: "en-GB", voiceURI: "", rate: 0.95 },
    phrases: {},   // key -> beste Aussprache-Punktzahl (0-100)
    vocab: {},     // key -> { box, due }
    quiz: {}       // topicId -> beste Quote (0-100)
  };
  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return structuredClone(defaultState);
      const s = JSON.parse(raw);
      return { ...structuredClone(defaultState), ...s, settings: { ...defaultState.settings, ...s.settings } };
    } catch { return structuredClone(defaultState); }
  }
  let state = loadState();
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* ignorieren */ } }

  // ---------- DOM-Helfer ----------
  function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "html") el.innerHTML = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  }
  const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (arr, n) => shuffle(arr).slice(0, n);

  // ---------- Sprachausgabe (Text-to-Speech) ----------
  const synth = window.speechSynthesis;
  let voices = [];
  function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices().filter(v => /^en[-_]/i.test(v.lang));
  }
  if (synth) { loadVoices(); synth.addEventListener?.("voiceschanged", () => { loadVoices(); if (currentRoute().view === "settings") render(); }); }

  function pickVoice() {
    const { voiceURI, lang } = state.settings;
    const byURI = voices.find(v => v.voiceURI === voiceURI);
    if (byURI) return byURI;
    const norm = (l) => l.replace("_", "-").toLowerCase();
    const sameLang = voices.filter(v => norm(v.lang) === lang.toLowerCase());
    // Natürlich klingende Stimmen bevorzugen
    return sameLang.find(v => /natural|neural|premium|enhanced|google/i.test(v.name)) || sameLang[0] || voices[0] || null;
  }

  function speak(text, { rate } = {}) {
    if (!synth) return Promise.resolve();
    synth.cancel();
    return new Promise(resolve => {
      const u = new SpeechSynthesisUtterance(text);
      const v = pickVoice();
      if (v) u.voice = v;
      u.lang = v ? v.lang : state.settings.lang;
      u.rate = rate ?? state.settings.rate;
      u.onend = u.onerror = () => resolve();
      synth.speak(u);
    });
  }

  // ---------- Spracherkennung ----------
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function listen() {
    return new Promise((resolve, reject) => {
      if (!Recognition) return reject(new Error("unsupported"));
      synth?.cancel();
      const rec = new Recognition();
      rec.lang = state.settings.lang;
      rec.interimResults = false;
      rec.maxAlternatives = 5;
      let done = false;
      rec.onresult = (e) => {
        done = true;
        const alts = Array.from(e.results[0]).map(r => r.transcript);
        resolve(alts);
      };
      rec.onerror = (e) => { done = true; reject(new Error(e.error || "error")); };
      rec.onend = () => { if (!done) resolve([]); };
      rec.start();
    });
  }

  // ---------- Bewertung der Aussprache ----------
  const NUMBERS = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"];
  const CONTRACTIONS = {
    "let's": "let us", "won't": "will not", "can't": "can not", "cannot": "can not", "shan't": "shall not",
    "i'm": "i am", "it's": "it is", "that's": "that is", "there's": "there is", "here's": "here is",
    "what's": "what is", "who's": "who is", "she's": "she is", "he's": "he is"
  };
  function normalizeWords(text) {
    let t = text.toLowerCase()
      .replace(/[’‘`]/g, "'")
      .replace(/(\d+)\s*%/g, "$1 percent")
      .replace(/&/g, " and ");
    const out = [];
    for (let w of t.split(/[\s\-–—/]+/)) {
      w = w.replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, "");
      if (!w) continue;
      if (CONTRACTIONS[w]) { out.push(...CONTRACTIONS[w].split(" ")); continue; }
      w = w.replace(/n't$/, " not").replace(/'re$/, " are").replace(/'ve$/, " have").replace(/'ll$/, " will").replace(/'d$/, " would");
      for (let part of w.split(" ")) {
        part = part.replace(/'/g, "");
        if (/^\d+$/.test(part) && +part <= 20) part = NUMBERS[+part];
        if (part) out.push(part);
      }
    }
    return out;
  }

  // Vergleich per längster gemeinsamer Teilfolge (LCS) auf Wortebene
  function compare(target, heard) {
    const a = normalizeWords(target), b = normalizeWords(heard);
    const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = a.length - 1; i >= 0; i--)
      for (let j = b.length - 1; j >= 0; j--)
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const tokens = [];
    let i = 0, j = 0;
    while (i < a.length || j < b.length) {
      if (i < a.length && j < b.length && a[i] === b[j]) { tokens.push({ w: a[i], type: "ok" }); i++; j++; }
      else if (j < b.length && (i >= a.length || dp[i][j + 1] >= dp[i + 1][j])) { tokens.push({ w: b[j], type: "extra" }); j++; }
      else { tokens.push({ w: a[i], type: "miss" }); i++; }
    }
    const matches = dp[0][0];
    const score = a.length ? Math.round(100 * matches / Math.max(a.length, b.length)) : 0;
    return { score, tokens, matches, total: a.length };
  }

  function bestMatch(target, alternatives) {
    let best = null;
    for (const alt of alternatives) {
      const r = compare(target, alt);
      if (!best || r.score > best.score) best = { ...r, heard: alt };
    }
    return best;
  }

  // ---------- Widget: Hören & Nachsprechen ----------
  function practiceWidget(text, { key, onScore } = {}) {
    const feedback = h("div", { class: "feedback", hidden: true });
    const micBtn = h("button", { class: "btn", title: "Nachsprechen und bewerten lassen" }, "🎤 Nachsprechen");

    micBtn.addEventListener("click", async () => {
      if (!Recognition) {
        feedback.hidden = false;
        feedback.replaceChildren("Dein Browser unterstützt keine Spracherkennung. Bitte nutze Chrome, Edge oder Safari.");
        return;
      }
      micBtn.classList.add("listening");
      micBtn.textContent = "● Ich höre zu …";
      micBtn.disabled = true;
      feedback.hidden = false;
      feedback.replaceChildren(h("span", { class: "muted" }, "Sprich jetzt den Satz auf Englisch."));
      try {
        const alts = await listen();
        if (!alts.length) {
          feedback.replaceChildren("Ich habe nichts verstanden. Versuche es noch einmal – etwas lauter und deutlicher.");
          return;
        }
        const r = bestMatch(text, alts);
        if (key) {
          state.phrases[key] = Math.max(state.phrases[key] || 0, r.score);
          save();
        }
        onScore?.(r.score);
        renderFeedback(feedback, text, r);
      } catch (err) {
        const msg = {
          "not-allowed": "Mikrofon-Zugriff wurde verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.",
          "service-not-allowed": "Mikrofon-Zugriff wurde verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.",
          "no-speech": "Ich habe nichts gehört. Ist das Mikrofon eingeschaltet?",
          "audio-capture": "Kein Mikrofon gefunden.",
          "network": "Die Spracherkennung braucht eine Internetverbindung."
        }[err.message] || "Fehler bei der Spracherkennung: " + err.message;
        feedback.replaceChildren(msg);
      } finally {
        micBtn.classList.remove("listening");
        micBtn.textContent = "🎤 Nachsprechen";
        micBtn.disabled = false;
      }
    });

    return h("div", { class: "phrase-practice" },
      h("div", { class: "actions" },
        h("button", { class: "btn primary", onclick: () => speak(text) }, "🔊 Anhören"),
        h("button", { class: "btn", onclick: () => speak(text, { rate: 0.6 }) }, "🐢 Langsam"),
        micBtn
      ),
      feedback
    );
  }

  function renderFeedback(container, text, r) {
    const level = r.score >= 85 ? "high" : r.score >= 60 ? "mid" : "low";
    const verdict = r.score >= 95 ? "Ausgezeichnet! 🎉" : r.score >= 85 ? "Sehr gut!" : r.score >= 60 ? "Gut – ein paar Wörter noch üben." : "Weiter üben – hör dir den Satz noch einmal langsam an.";
    const words = r.tokens.map(t => {
      const el = h("span", { class: `word ${t.type}${t.type === "miss" ? " clickable" : ""}`, title: t.type === "miss" ? "Nicht erkannt – klicken zum Anhören" : t.type === "extra" ? "Zusätzlich erkannt" : "" }, t.w);
      if (t.type === "miss") el.addEventListener("click", () => speak(t.w, { rate: 0.7 }));
      return el;
    });
    const missed = r.tokens.filter(t => t.type === "miss").map(t => t.w);
    container.replaceChildren(
      h("div", {}, h("span", { class: `score ${level}` }, `${r.score} %`), " – ", verdict),
      h("div", { class: "muted", style: "margin-top:6px" }, "Erkannt: „", r.heard, "“"),
      h("div", { style: "margin-top:6px" }, words),
      missed.length ? h("div", { class: "muted", style: "margin-top:6px; font-size:.9rem" },
        "Rot markierte Wörter wurden nicht erkannt – klicke darauf, um sie einzeln zu hören.") : null
    );
  }

  // ---------- Routing ----------
  function currentRoute() {
    const [view = "home", id, tab] = location.hash.replace(/^#\/?/, "").split("/");
    return { view, id, tab };
  }
  function go(path) { location.hash = "#/" + path; }
  window.addEventListener("hashchange", () => { synth?.cancel(); render(); window.scrollTo(0, 0); });
  document.querySelectorAll("[data-nav]").forEach(b => b.addEventListener("click", () => go(b.dataset.nav)));

  function render() {
    const r = currentRoute();
    document.querySelectorAll(".topbar nav button").forEach(b => b.classList.toggle("active", b.dataset.nav === r.view || (r.view === "topic" && b.dataset.nav === "home")));
    const views = { home: viewHome, topic: viewTopic, pronunciation: viewPronunciation, review: viewReview, settings: viewSettings };
    app.replaceChildren((views[r.view] || viewHome)(r));
  }

  // ---------- Fortschritt ----------
  const phraseKey = (t, i) => `${t.id}:${i}`;
  const vocabKey = (t, i) => `${t.id}:${i}`;
  function topicProgress(t) {
    const p = t.phrases.filter((_, i) => (state.phrases[phraseKey(t, i)] || 0) >= 85).length;
    const v = t.vocab.filter((_, i) => (state.vocab[vocabKey(t, i)]?.box || 0) >= 2).length;
    const q = (state.quiz[t.id] || 0) / 100;
    const total = t.phrases.length + t.vocab.length;
    return Math.round(100 * (0.8 * (p + v) / total + 0.2 * q));
  }
  function allVocab() {
    return TOPICS.flatMap(t => t.vocab.map((v, i) => ({ ...v, key: vocabKey(t, i), topic: t })));
  }
  function dueVocab() {
    const now = Date.now();
    return allVocab().filter(v => { const s = state.vocab[v.key]; return !s || s.due <= now; });
  }

  // ---------- Ansicht: Start ----------
  function viewHome() {
    const mastered = Object.values(state.phrases).filter(s => s >= 85).length;
    const learnedVocab = Object.values(state.vocab).filter(s => s.box >= 2).length;
    return h("div", {},
      h("h1", {}, "Business-Englisch lernen"),
      h("p", { class: "muted" }, "Wähle ein Thema. Höre dir Redewendungen in korrektem Englisch an, sprich sie nach und lass deine Aussprache bewerten."),
      h("div", { class: "stats" },
        h("div", { class: "stat" }, h("b", {}, mastered), "Sätze sicher ausgesprochen"),
        h("div", { class: "stat" }, h("b", {}, learnedVocab), "Vokabeln gelernt"),
        h("div", { class: "stat" }, h("b", {}, dueVocab().length), "Vokabeln fällig")
      ),
      h("div", { class: "grid" },
        TOPICS.map(t => {
          const pct = topicProgress(t);
          return h("button", { class: "card topic-card", onclick: () => go(`topic/${t.id}/phrases`) },
            h("span", { class: "icon" }, t.icon),
            h("strong", {}, t.title),
            h("span", { class: "muted" }, t.intro),
            h("span", { class: "muted", style: "font-size:.85rem" }, `${pct} % geschafft`),
            h("div", { class: "progress" }, h("span", { style: `width:${pct}%` }))
          );
        })
      )
    );
  }

  // ---------- Ansicht: Thema ----------
  function viewTopic({ id, tab = "phrases" }) {
    const t = TOPICS.find(x => x.id === id);
    if (!t) return viewHome();
    const tabs = [["phrases", "Redewendungen"], ["vocab", "Vokabeln"], ["quiz", "Quiz"], ["listening", "Hörverständnis"]];
    const body = { phrases: topicPhrases, vocab: topicVocab, quiz: topicQuiz, listening: topicListening }[tab] || topicPhrases;
    return h("div", {},
      h("h1", {}, `${t.icon} ${t.title}`),
      h("p", { class: "muted" }, t.intro),
      h("div", { class: "tabs", role: "tablist" },
        tabs.map(([k, label]) => h("button", { class: k === tab ? "active" : "", role: "tab", onclick: () => go(`topic/${t.id}/${k}`) }, label))
      ),
      body(t)
    );
  }

  function topicPhrases(t) {
    return h("div", {},
      t.phrases.map((p, i) => {
        const key = phraseKey(t, i);
        const best = h("span", { class: "muted", style: "font-size:.85rem" });
        const updateBest = () => { const s = state.phrases[key]; best.textContent = s != null ? `Bestwert: ${s} %` : ""; };
        updateBest();
        return h("div", { class: "card phrase" },
          h("div", { class: "en" }, p.en),
          h("div", { class: "de" }, p.de),
          practiceWidget(p.en, { key, onScore: updateBest }),
          best
        );
      })
    );
  }

  // Lernkarten mit Leitner-System
  const INTERVALS_DAYS = [0, 1, 2, 4, 8, 16];
  function gradeVocab(key, known) {
    const cur = state.vocab[key]?.box || 0;
    const box = known ? Math.min(cur + 1, INTERVALS_DAYS.length - 1) : 0;
    state.vocab[key] = { box, due: Date.now() + INTERVALS_DAYS[box] * 86400000 };
    save();
  }

  function flashcardDeck(cards, { emptyText, onFinish } = {}) {
    const wrap = h("div");
    let idx = 0, flipped = false;
    let known = 0;
    function draw() {
      if (idx >= cards.length) {
        wrap.replaceChildren(h("div", { class: "card" },
          h("h2", { style: "margin-top:0" }, cards.length ? "Runde geschafft! 🎉" : emptyText || "Keine Karten."),
          cards.length ? h("p", {}, `${known} von ${cards.length} gewusst.`) : null,
          cards.length ? h("button", { class: "btn primary", onclick: () => { idx = 0; known = 0; flipped = false; cards = shuffle(cards); draw(); } }, "Nochmal üben") : null
        ));
        onFinish?.();
        return;
      }
      const c = cards[idx];
      const front = h("div", { class: "card flashcard", onclick: () => { flipped = !flipped; draw(); } },
        h("div", { class: "muted", style: "font-size:.85rem" }, `Karte ${idx + 1} / ${cards.length}${c.topic ? " · " + c.topic.title : ""}`),
        flipped
          ? [h("div", { class: "term" }, c.term), h("div", { class: "example" }, c.example), h("div", { class: "muted" }, c.de)]
          : [h("div", { class: "term" }, c.de), h("div", { class: "muted" }, "Wie heißt das auf Englisch? Klicke zum Umdrehen.")]
      );
      const controls = flipped
        ? h("div", { class: "actions", style: "margin-top:12px; justify-content:center" },
            h("button", { class: "btn", onclick: () => speak(c.term) }, "🔊 Wort"),
            h("button", { class: "btn", onclick: () => speak(c.example) }, "🔊 Beispiel"),
            h("button", { class: "btn bad", onclick: () => { gradeVocab(c.key, false); next(); } }, "✗ Nochmal"),
            h("button", { class: "btn good", onclick: () => { gradeVocab(c.key, true); known++; next(); } }, "✓ Gewusst"))
        : h("div", { class: "actions", style: "margin-top:12px; justify-content:center" },
            h("button", { class: "btn primary", onclick: () => { flipped = true; draw(); speak(c.term); } }, "Aufdecken"));
      const practice = flipped ? h("div", { style: "margin-top:12px" }, h("div", { class: "muted", style: "margin-bottom:6px" }, "Beispielsatz nachsprechen:"), practiceWidget(c.example)) : null;
      wrap.replaceChildren(front, controls, practice);
    }
    function next() { idx++; flipped = false; draw(); }
    draw();
    return wrap;
  }

  function topicVocab(t) {
    const cards = shuffle(t.vocab.map((v, i) => ({ ...v, key: vocabKey(t, i) })));
    return h("div", {},
      flashcardDeck(cards),
      h("h2", {}, "Alle Vokabeln"),
      h("div", { class: "card" },
        t.vocab.map(v => h("div", { style: "padding:6px 0; border-bottom:1px solid var(--border)" },
          h("button", { class: "btn", style: "padding:2px 8px; margin-right:8px", onclick: () => speak(v.term), "aria-label": "Anhören" }, "🔊"),
          h("b", {}, v.term), " – ", v.de,
          h("div", { class: "muted", style: "font-style:italic; margin-left:44px" }, v.example)
        ))
      )
    );
  }

  // Quiz: gemischte Fragetypen
  function buildQuiz(t) {
    const qs = [];
    for (const p of sample(t.phrases, 3)) {
      const wrong = sample(t.phrases.filter(x => x !== p), 3).map(x => x.de);
      qs.push({ prompt: "Was bedeutet dieser Satz?", text: p.en, speakText: p.en, options: shuffle([p.de, ...wrong]), answer: p.de });
    }
    for (const v of sample(t.vocab, 3)) {
      const wrong = sample(t.vocab.filter(x => x !== v), 3).map(x => x.term);
      qs.push({ prompt: "Welches englische Wort passt?", text: v.de, options: shuffle([v.term, ...wrong]), answer: v.term, speakAfter: v.term });
    }
    for (const p of sample(t.phrases, 2)) {
      const words = p.en.split(" ");
      const candidates = words.map((w, i) => [w.replace(/[^A-Za-z']/g, ""), i]).filter(([w]) => w.length >= 4);
      if (!candidates.length) continue;
      const [word, idx] = candidates[Math.floor(Math.random() * candidates.length)];
      const blanked = words.map((w, i) => i === idx ? w.replace(word, "_____") : w).join(" ");
      const pool = [...new Set(t.phrases.flatMap(x => x.en.split(" ").map(w => w.replace(/[^A-Za-z']/g, ""))).filter(w => w.length >= 4 && w.toLowerCase() !== word.toLowerCase()))];
      qs.push({ prompt: "Lückentext: Welches Wort fehlt?", text: blanked, hint: p.de, options: shuffle([word, ...sample(pool, 3)]), answer: word, speakAfter: p.en });
    }
    return shuffle(qs);
  }

  function quizRunner(questions, { onDone, title }) {
    const wrap = h("div");
    let i = 0, correct = 0;
    function draw() {
      if (i >= questions.length) {
        const pct = Math.round(100 * correct / questions.length);
        onDone?.(pct);
        wrap.replaceChildren(h("div", { class: "card" },
          h("h2", { style: "margin-top:0" }, `Ergebnis: ${correct} / ${questions.length} (${pct} %)`),
          h("p", {}, pct >= 80 ? "Stark! 💪" : pct >= 50 ? "Ordentlich – noch etwas üben." : "Wiederhole die Redewendungen und Vokabeln und versuch es nochmal."),
          h("button", { class: "btn primary", onclick: () => render() }, "Neues Quiz")
        ));
        return;
      }
      const q = questions[i];
      let answered = false;
      const info = h("div", { style: "margin-top:12px" });
      const opts = q.options.map(o => {
        const b = h("button", { class: "btn" }, o);
        b.addEventListener("click", () => {
          if (answered) return;
          answered = true;
          const ok = o === q.answer;
          if (ok) correct++;
          opts.forEach(x => { if (x.textContent === q.answer) x.classList.add("good"); else if (x === b) x.classList.add("bad"); x.disabled = x !== b && x.textContent !== q.answer; });
          if (q.speakAfter) speak(q.speakAfter);
          info.replaceChildren(
            h("p", {}, ok ? "✓ Richtig!" : `✗ Richtig ist: „${q.answer}“`),
            h("button", { class: "btn primary", onclick: () => { i++; draw(); } }, i + 1 < questions.length ? "Weiter →" : "Ergebnis anzeigen")
          );
        });
        return b;
      });
      wrap.replaceChildren(h("div", { class: "card" },
        h("div", { class: "muted", style: "font-size:.85rem" }, `${title || "Frage"} ${i + 1} / ${questions.length}`),
        h("h2", { style: "margin-top:4px" }, q.prompt),
        q.text ? h("p", { style: "font-size:1.15rem; font-weight:600" }, q.text) : null,
        q.hint ? h("p", { class: "muted" }, "Bedeutung: ", q.hint) : null,
        q.speakText || q.listenOnly ? h("button", { class: "btn", onclick: () => speak(q.speakText) }, q.listenOnly ? "🔊 Abspielen" : "🔊 Anhören") : null,
        q.listenOnly ? h("button", { class: "btn", style: "margin-left:8px", onclick: () => speak(q.speakText, { rate: 0.6 }) }, "🐢 Langsam") : null,
        h("div", { class: "quiz-options" }, opts),
        info
      ));
      if (q.listenOnly) speak(q.speakText);
    }
    draw();
    return wrap;
  }

  function topicQuiz(t) {
    const best = state.quiz[t.id];
    return h("div", {},
      best != null ? h("p", { class: "muted" }, `Bestes Ergebnis bisher: ${best} %`) : null,
      quizRunner(buildQuiz(t), { onDone: (pct) => { state.quiz[t.id] = Math.max(state.quiz[t.id] || 0, pct); save(); } })
    );
  }

  function topicListening(t) {
    const qs = sample(t.phrases, 6).map(p => ({
      prompt: "Welchen Satz hast du gehört?",
      speakText: p.en,
      listenOnly: true,
      options: shuffle([p.en, ...sample(t.phrases.filter(x => x !== p), 3).map(x => x.en)]),
      answer: p.en
    }));
    return h("div", {},
      h("p", { class: "muted" }, "Höre genau hin – der Satz wird automatisch abgespielt."),
      quizRunner(qs, { title: "Hörübung" })
    );
  }

  // ---------- Ansicht: Aussprache ----------
  function viewPronunciation() {
    return h("div", {},
      h("h1", {}, "🗣️ Aussprache-Training"),
      h("p", { class: "muted" }, "Typische Stolpersteine für Deutschsprachige. Höre dir die Wortpaare an, achte auf den Unterschied und sprich dann den Übungssatz nach."),
      PRON.map(p => h("div", { class: "card", style: "margin-bottom:12px" },
        h("h2", { style: "margin-top:0" }, p.title),
        h("p", {}, p.tip),
        h("div", { class: "muted", style: "font-size:.9rem" }, "Wortpaare (klicke zum Anhören):"),
        h("div", { class: "pairs" },
          p.pairs.map(([a, b]) => h("span", { class: "pair" },
            h("button", { onclick: () => speak(a, { rate: 0.75 }) }, a),
            h("button", { onclick: () => speak(b, { rate: 0.75 }) }, b),
            h("button", { title: "Beide nacheinander", onclick: async () => { await speak(a, { rate: 0.75 }); await speak(b, { rate: 0.75 }); } }, "⇄")
          ))
        ),
        h("div", { class: "muted", style: "font-size:.9rem; margin-top:8px" }, "Einzelnes Wort testen:"),
        wordTester(p.pairs.flat()),
        h("div", { class: "muted", style: "font-size:.9rem; margin-top:12px" }, "Übungssatz:"),
        h("p", { style: "font-weight:600; font-size:1.1rem; margin:4px 0 8px" }, p.sentence),
        practiceWidget(p.sentence)
      ))
    );
  }

  // Ein Wort auswählen, anhören und nachsprechen: zeigt, welches Wort erkannt wurde
  function wordTester(words) {
    const sel = h("select", {}, words.map(w => h("option", { value: w }, w)));
    const out = h("span", { class: "muted" });
    const mic = h("button", { class: "btn" }, "🎤 Sprechen");
    mic.addEventListener("click", async () => {
      if (!Recognition) { out.textContent = "Spracherkennung wird in diesem Browser nicht unterstützt."; return; }
      mic.classList.add("listening"); mic.disabled = true; out.textContent = "Sprich das Wort …";
      try {
        const alts = (await listen()).map(a => normalizeWords(a).join(" "));
        const target = sel.value.toLowerCase();
        if (!alts.length) out.textContent = "Nichts verstanden – nochmal versuchen.";
        else if (alts[0] === target) out.replaceChildren(h("span", { class: "word ok" }, "✓ " + alts[0]), " Perfekt erkannt!");
        else if (alts.includes(target)) out.replaceChildren(h("span", { class: "word ok" }, "≈ " + target), ` Erkannt, aber unsicher (am ehesten „${alts[0]}“).`);
        else out.replaceChildren(h("span", { class: "word miss" }, alts[0]), ` – verstanden wurde „${alts[0]}“ statt „${target}“.`);
      } catch (e) { out.textContent = "Fehler: " + e.message; }
      finally { mic.classList.remove("listening"); mic.disabled = false; }
    });
    return h("div", { class: "actions", style: "align-items:center; margin-top:4px" },
      sel,
      h("button", { class: "btn", onclick: () => speak(sel.value, { rate: 0.75 }) }, "🔊"),
      mic, out);
  }

  // ---------- Ansicht: Wiederholen ----------
  function viewReview() {
    const due = shuffle(dueVocab()).slice(0, 15);
    return h("div", {},
      h("h1", {}, "🔁 Vokabeln wiederholen"),
      h("p", { class: "muted" }, "Fällige Vokabeln aus allen Themen. Gewusste Karten kommen in immer größeren Abständen wieder (1, 2, 4, 8, 16 Tage)."),
      flashcardDeck(due, { emptyText: "Keine Vokabeln fällig – super! Schau morgen wieder vorbei." })
    );
  }

  // ---------- Ansicht: Einstellungen ----------
  function viewSettings() {
    const s = state.settings;
    const langSel = h("select", { onchange: (e) => { s.lang = e.target.value; s.voiceURI = ""; save(); render(); } },
      h("option", { value: "en-GB", selected: s.lang === "en-GB" }, "Britisches Englisch (en-GB)"),
      h("option", { value: "en-US", selected: s.lang === "en-US" }, "Amerikanisches Englisch (en-US)")
    );
    const norm = (l) => l.replace("_", "-").toLowerCase();
    const matching = voices.filter(v => norm(v.lang) === s.lang.toLowerCase());
    const list = matching.length ? matching : voices;
    const voiceSel = h("select", { onchange: (e) => { s.voiceURI = e.target.value; save(); } },
      h("option", { value: "" }, "Automatisch (beste verfügbare Stimme)"),
      list.map(v => h("option", { value: v.voiceURI, selected: v.voiceURI === s.voiceURI }, `${v.name} (${v.lang})`))
    );
    const rateLabel = h("span", {}, s.rate.toFixed(2) + "×");
    const rate = h("input", { type: "range", min: "0.5", max: "1.3", step: "0.05", value: String(s.rate),
      oninput: (e) => { s.rate = parseFloat(e.target.value); rateLabel.textContent = s.rate.toFixed(2) + "×"; save(); } });

    return h("div", {},
      h("h1", {}, "⚙️ Einstellungen"),
      h("div", { class: "card" },
        h("label", { class: "field" }, "Akzent (für Sprachausgabe und Spracherkennung)", langSel),
        h("label", { class: "field" }, "Stimme", voiceSel,
          !voices.length ? h("span", { class: "muted" }, "Keine englischen Stimmen gefunden. Installiere ggf. eine englische Sprachausgabe in deinem Betriebssystem.") : null),
        h("label", { class: "field" }, h("span", {}, "Sprechtempo: ", rateLabel), rate),
        h("button", { class: "btn primary", onclick: () => speak("Good morning. Thank you for joining today's meeting. Let's get started.") }, "🔊 Stimme testen")
      ),
      h("h2", {}, "Fortschritt"),
      h("div", { class: "card" },
        h("p", {}, "Dein Fortschritt wird nur lokal in diesem Browser gespeichert."),
        h("button", { class: "btn bad", onclick: () => {
          if (confirm("Wirklich den gesamten Lernfortschritt löschen?")) {
            state = { ...structuredClone(defaultState), settings: state.settings }; save(); render();
          }
        } }, "Fortschritt zurücksetzen")
      )
    );
  }

  // ---------- Start ----------
  const warn = document.getElementById("support-warning");
  const issues = [];
  if (!synth) issues.push("Sprachausgabe");
  if (!Recognition) issues.push("Spracherkennung");
  if (issues.length) {
    warn.hidden = false;
    warn.textContent = `Hinweis: Dein Browser unterstützt keine ${issues.join(" und ")}. Für alle Funktionen nutze bitte Chrome, Edge oder Safari.`;
  }

  // Test-Hook
  window.__bec = { compare, normalizeWords };

  render();
})();
