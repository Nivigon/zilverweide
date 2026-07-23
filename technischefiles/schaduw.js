/* ═══════════════════════════════════════════════════════════════════
   SCHADUW-MODULE — engine  (hoort bij schaduw.css + fog.png)

   Eén zelfstandige laag die overal in het spel actief kan zijn. De
   hoofdgame (zilverweide.html) stuurt 'm aan met een handvol regels:

       <link rel="stylesheet" href="schaduw.css">
       <script src="schaduw.js"></script>
       ZilverweideSchaduw.init({ fogSrc:'fog.png' });
       ZilverweideSchaduw.vervloek();          // start de schaduw
       ZilverweideSchaduw.setBusy(true/false); // host speelt eigen geluid

   WAT HIERIN ZIT  : beleving (mist, fluister), meter, memory-puzzel,
                     de vergrendel-flow + UI, en de publieke API.
   WAT HIER NIET IN ZIT (= server / Firebase, zie SERVER-STUB onderaan):
       - het GENEREREN van de code   (server bezit de waarheid)
       - het CONTROLEREN van de code + beide spelers vrijgeven
       - wie waar vastzit (gedeelde sessie-status)
   Die drie lopen nu via een lokale stub zodat alles offline testbaar is.
   Later vervang je in de SERVER-STUB de twee functies door Firebase-calls;
   de rest van de module hoeft niet te veranderen.
═══════════════════════════════════════════════════════════════════ */
window.ZilverweideSchaduw = (function () {
  'use strict';

  // ── Instellingen (init kan ze overschrijven) ─────────────────────
  const CFG = {
    fogSrc: 'fog.png',
    spelerId: 'speler',           // wie deze tablet is (voor de server)
    meterPerSec: 1.1,             // % per seconde dat de meter vult
    mistVis: 1.0,                 // bovengrens fog-zichtbaarheid (banken vol opaak bij 90%)
    mistDensity: 0.6,             // hoeveel mistlagen meedoen
    geluidPaden: [
      'geluid/Schaduwmechanic/schaduwfluister.mp3',
      './geluid/Schaduwmechanic/schaduwfluister.mp3',
      'Schaduwmechanic/schaduwfluister.mp3',
      'schaduwfluister.mp3'
    ],
    onVergrendel: null,           // callback(code) als deze speler vastraakt
    onBevrijd: null,              // callback() als deze speler vrijkomt
    persist: true,                // vergrendeling onthouden bij verversen
    debug: false                  // toont een solo-ontgrendelknop op het vergrendel-scherm
  };

  const BANK_BASE = [0.95, 0.9, 1.0, 0.92, 0.88, 0.97]; // basis-opacity per fogbank
  const MIST_BODEM = 0.14;             // fog-aanwezigheid bij meter 0 (heel licht begin)
  const RUNES = ['ᛟ', 'ᚦ', 'ᛉ'];
  const FLUISTERS = [
    'zij komt…', 'stil nu…', 'je hoort het ook…', 'niemand luistert…',
    'blijf…', 'dichterbij…', 'het wordt donker…', 'nog even…'
  ];
  const LS_KEY = 'zilverweide_schaduw_lock';

  // ── Toestand ─────────────────────────────────────────────────────
  let el = {};                    // DOM-verwijzingen
  let cursed = false, meter = 0;
  let busy = false;               // host speelt eigen geluid → schaduw zwijgt
  let vergrendeld = false;
  let tickTimer = null, fluisterTimer = null;
  let memSeq = [], memInput = [], memAccept = false;
  let whisperReadyAt = 0;         // niet vóór dit moment opnieuw fluisteren
  let fluisterEl = null, mp3Ok = false, pathIdx = 0;
  let actieveCode = null;         // de code die deze speler nu toont (gever)

  /* ═══════════════════════════════════════════════════════════════
     SERVER-STUB  ▼▼▼  HIER PLUG JE STRAKS FIREBASE IN  ▼▼▼
     Twee haakjes naar buiten. Nu lokaal nagebootst; de stub "onthoudt"
     één actieve code zodat je de hele flow op één tablet kunt testen.
     In productie bezit de SERVER de code en geeft die BEIDE spelers vrij.
  ═══════════════════════════════════════════════════════════════ */
  const Server = {
    _code: null,   // (alleen voor de stub) de onthouden code

    // (1) Bij vastraken: vraag de server om een code voor deze speler+locatie.
    //     ECHTE SERVER: laat Firebase een willekeurige code aanmaken, sla 'm op
    //     onder deze spelerId + locatie, en geef 'm terug.
    async vraagCode(spelerId) {
      // Als de host (zilverweide) een gedeelde-staat-brug aanbiedt, gaat
      // de code via die brug: het lock-record wordt dan gedeeld met de
      // andere tablets zodat een redder op de locatie de invoer krijgt.
      if (window.ZilverweideSchaduwServer && window.ZilverweideSchaduwServer.vraagCode) {
        const code = await window.ZilverweideSchaduwServer.vraagCode(spelerId);
        this._code = code;                       // lokale kopie als vangnet
        return code;
      }
      const code = willekeurigeCode();           // ← stub: solo-test op één tablet
      this._code = code;
      return code;
    },

    // (2) Redder biedt een ingevoerde code aan ter controle.
    //     ECHTE SERVER: stuur de code naar Firebase; de server controleert en
    //     zet BEIDE spelers (gever + redder) op "vrij". Geef true/false terug.
    async controleerCode(spelerId, ingevoerd) {
      // Via de host-brug: vergelijk tegen ALLE open locks in de gedeelde
      // staat (de redder staat op een ander tablet dan de vergrendelde).
      if (window.ZilverweideSchaduwServer && window.ZilverweideSchaduwServer.controleerCode) {
        return await window.ZilverweideSchaduwServer.controleerCode(spelerId, ingevoerd);
      }
      const goed = !!this._code && ingevoerd.toUpperCase() === this._code;
      if (goed) this._code = null;
      return goed;
    }
  };
  /* ═══════════════════════════════════════════════════════════════
     SERVER-STUB  ▲▲▲  EINDE FIREBASE-HAAKJES  ▲▲▲
  ═══════════════════════════════════════════════════════════════ */

  function willekeurigeCode() {
    const tekens = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // geen I/O/0/1 (leesbaar)
    let s = '';
    for (let i = 0; i < 4; i++) s += tekens[Math.floor(Math.random() * tekens.length)];
    return s;
  }

  // ── DOM opbouwen ─────────────────────────────────────────────────
  function bouwDom() {
    const root = document.createElement('div');
    root.id = 'zv-schaduw';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = `
      <div id="zv-rook">
        <div class="zv-rand zv-l"></div><div class="zv-rand zv-r"></div>
        <div class="zv-rand zv-t"></div><div class="zv-rand zv-b"></div>
        <div class="zv-bank zv-b1"></div><div class="zv-bank zv-b2"></div><div class="zv-bank zv-b3"></div>
        <div class="zv-bank zv-b4"></div><div class="zv-bank zv-b5"></div><div class="zv-bank zv-b6"></div>
      </div>
      <div id="zv-fluister"></div>

      <div id="zv-meter" aria-hidden="true">
        <div class="zv-meter-label">De schaduw groeit</div>
        <div class="zv-meter-track"><div class="zv-meter-fill" id="zv-meter-fill"></div></div>
      </div>

      <div id="zv-memory" class="zv-overlay">
        <div class="zv-eyebrow">De schaduw sluit zich</div>
        <div id="zv-mem-intro">
          <svg class="zv-schim" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs><radialGradient id="zvsg" cx="50%" cy="34%" r="68%">
              <stop offset="0%" stop-color="#241420"/><stop offset="100%" stop-color="#070409"/>
            </radialGradient></defs>
            <path d="M100 14 C72 14 60 40 62 66 C42 76 32 110 34 150 C26 176 22 208 26 220 L174 220 C178 208 174 176 166 150 C168 110 158 76 138 66 C140 40 128 14 100 14 Z" fill="url(#zvsg)"/>
            <ellipse cx="86" cy="58" rx="7" ry="10" fill="#d9b3c8" opacity=".55"/>
            <ellipse cx="114" cy="58" rx="7" ry="10" fill="#d9b3c8" opacity=".55"/>
          </svg>
          <div class="zv-title">Chaos</div>
          <div class="zv-line">Je hoofd loopt vol. Stemmen buitelen over elkaar, de grond kantelt.
            Uit de nevel kijkt een schim je recht aan.</div>
          <div class="zv-sub">"Wijs de juiste volgorde van tekens aan… of de schaduw houdt je."</div>
        </div>
        <div class="zv-title" id="zv-mem-title" style="display:none">Herinner het zegel</div>
        <div class="zv-line" id="zv-mem-instr" style="display:none">Let goed op…</div>
        <div class="zv-progress" id="zv-mem-progress"></div>
        <div class="zv-runes" id="zv-mem-runes"></div>
        <button class="zv-btn" id="zv-mem-start">Start</button>
      </div>

      <div id="zv-lock" class="zv-overlay">
        <div class="zv-eyebrow">Vervloekt</div>
        <div class="zv-line">Het zegel brandt. De fluisteringen kruipen over elkaar heen
          tot je je eigen gedachten niet meer hoort. De grond kantelt onder je.</div>
        <div class="zv-line">Je kunt geen kant op. Niet alleen.</div>
        <div class="zv-sub">Dit is het teken dat de schaduw op je heeft achtergelaten.
          Laat het zien aan wie je komt halen.</div>
        <div class="zv-code" id="zv-lock-code">····</div>
        <div class="zv-sub">Pas als zij het teken kennen, laat de schaduw je los.</div>
        <div class="zv-wacht">Roep een medespeler — hardop, hier waar je staat</div>
        <button id="zv-lock-test" class="zv-test" style="display:none">● ontgrendel (test)</button>
      </div>

      <div id="zv-redder" class="zv-overlay">
        <div class="zv-eyebrow">Een medespeler in nood</div>
        <div class="zv-line">Je vindt hen op de grond, omringd door fluisteringen.
          Je spreekt het teken uit dat de schaduw op hen achterliet.</div>
        <input id="zv-redder-input" class="zv-input" maxlength="4" autocomplete="off"
               autocapitalize="characters" spellcheck="false" placeholder="····">
        <div class="zv-err" id="zv-redder-err"></div>
        <button class="zv-btn" id="zv-redder-btn">Spreek het teken uit</button>
      </div>

      <div id="zv-vloekintro"><div id="zv-vloekintro-tekst"></div></div>
      <div id="zv-flits"></div>`;
    document.body.appendChild(root);

    el.root = root;
    el.rook = root.querySelector('#zv-rook');
    el.fluister = root.querySelector('#zv-fluister');
    el.meter = root.querySelector('#zv-meter');
    el.meterFill = root.querySelector('#zv-meter-fill');
    el.memory = root.querySelector('#zv-memory');
    el.memIntro = root.querySelector('#zv-mem-intro');
    el.memTitle = root.querySelector('#zv-mem-title');
    el.memInstr = root.querySelector('#zv-mem-instr');
    el.memProgress = root.querySelector('#zv-mem-progress');
    el.memRunes = root.querySelector('#zv-mem-runes');
    el.memStart = root.querySelector('#zv-mem-start');
    el.vloekIntro = root.querySelector('#zv-vloekintro');
    el.vloekIntroTekst = root.querySelector('#zv-vloekintro-tekst');
    el.flits = root.querySelector('#zv-flits');
    el.lock = root.querySelector('#zv-lock');
    el.lockCode = root.querySelector('#zv-lock-code');
    el.redder = root.querySelector('#zv-redder');
    el.redderInput = root.querySelector('#zv-redder-input');
    el.redderErr = root.querySelector('#zv-redder-err');
    el.redderBtn = root.querySelector('#zv-redder-btn');
    el.lockTest = root.querySelector('#zv-lock-test');

    // fog-textuur op de banken zetten (configureerbaar pad)
    root.querySelectorAll('.zv-bank').forEach(m => {
      m.style.backgroundImage = `url("${CFG.fogSrc}")`;
    });

    el.redderBtn.addEventListener('click', redderVerstuur);
    el.redderInput.addEventListener('keydown', e => { if (e.key === 'Enter') redderVerstuur(); });
    el.memStart.addEventListener('click', startMemReeks);   // intro → reeks
    // Solo-ontgrendelknop: alleen in debug-modus, om zonder medespeler los te komen.
    if (CFG.debug && el.lockTest) {
      el.lockTest.style.display = 'inline-block';
      el.lockTest.addEventListener('click', bevrijd);
    }
  }

  // ── Fog: schaalt met de meter (vol vanaf 90%) ────────────────────
  function applyMist() {
    const t = Math.min(meter, 90) / 90;
    const factor = MIST_BODEM + (1 - MIST_BODEM) * t;
    const vis = CFG.mistVis * factor;
    ['zv-b1', 'zv-b2', 'zv-b3', 'zv-b4', 'zv-b5', 'zv-b6'].forEach((c, i) => {
      const b = el.rook.querySelector('.' + c);
      if (b) b.style.opacity = (BANK_BASE[i] * vis).toFixed(3);
    });
  }
  function updateSmoke() {
    const v = cursed ? (0.25 + 0.75 * (meter / 100)) : 0;
    el.root.style.setProperty('--zv-smoke', v.toFixed(3));
    applyMist();
    updateMeterUI();
  }
  function updateMeterUI() {
    if (!el.meter) return;
    el.meter.classList.toggle('zv-zichtbaar', cursed);   // alleen zichtbaar als vervloekt
    el.meter.style.setProperty('--zv-mi', (meter / 100).toFixed(3)); // opvallender bij voller
    if (el.meterFill) el.meterFill.style.width = Math.round(meter) + '%';
  }

  // ── Gefluister (tekst + geluid), volgt de meter ──────────────────
  function whisperIntervalMs() {
    const t = Math.min(meter, 100) / 100;        // 0..1 over de hele meter
    const basis = 40000 - t * 20000;             // 40s (laag) → 20s (vol)
    const variatie = 0.75 + Math.random() * 0.5; // ±25% willekeur
    // Schaalt mee met de meter-snelheid: sneller testen = sneller gefluister,
    // maar de verhouding op normale snelheid (1,1) blijft gelijk.
    const snelheidFactor = 1.1 / Math.max(0.1, CFG.meterPerSec);
    return Math.max(20000 * snelheidFactor, basis * variatie * snelheidFactor);
  }
  function whisperVolume() { return 0.45 + 0.55 * (meter / 100); } // hoorbaar boven de muziek

  function initMp3() {
    if (fluisterEl) return;
    fluisterEl = new Audio();
    fluisterEl.preload = 'auto';
    const probeer = () => {
      if (pathIdx >= CFG.geluidPaden.length) { mp3Ok = false; return; }
      fluisterEl.src = CFG.geluidPaden[pathIdx];
      fluisterEl.load();
    };
    fluisterEl.addEventListener('canplaythrough', () => { mp3Ok = true; }, { once: false });
    fluisterEl.addEventListener('error', () => { pathIdx++; probeer(); });
    probeer();
  }
  function speelFluisterGeluid(vol) {
    if (mp3Ok && fluisterEl) {
      try { fluisterEl.currentTime = 0; fluisterEl.volume = Math.max(0, Math.min(1, vol)); fluisterEl.play(); } catch (e) {}
    }
  }
  function stopFluisterGeluid() {
    if (fluisterEl) { try { fluisterEl.pause(); fluisterEl.currentTime = 0; } catch (e) {} }
  }

  function scheduleFluister(eersteKeer) {
    clearTimeout(fluisterTimer);
    let wait;
    if (eersteKeer) {
      // De vloek kondigt zich direct aan: eerste fluistering al na 3-5s,
      // meeschalend met de testsnelheid zodat je 'm ook bij snel testen hoort.
      const snelheidFactor = 1.1 / Math.max(0.1, CFG.meterPerSec);
      wait = (3000 + Math.random() * 2000) * snelheidFactor;
    } else {
      wait = Math.max(whisperIntervalMs(), whisperReadyAt - Date.now());
    }
    fluisterTimer = setTimeout(fluisterTick, Math.max(250, wait));
  }
  function fluisterTick() {
    if (cursed && !overlayOpen() && !busy && Date.now() >= whisperReadyAt) toonFluister();
    scheduleFluister();
  }
  function toonFluister() {
    const f = el.fluister;
    f.textContent = FLUISTERS[Math.floor(Math.random() * FLUISTERS.length)];
    f.style.opacity = (0.35 + 0.6 * (meter / 100)).toFixed(2);  // fletser laag, duidelijker vol
    speelFluisterGeluid(whisperVolume());
    const durMs = (mp3Ok && fluisterEl && isFinite(fluisterEl.duration) && fluisterEl.duration > 0)
      ? fluisterEl.duration * 1000 : 2600;
    whisperReadyAt = Date.now() + durMs + 300;   // korte stilte ná afloop (geen overlap)
    setTimeout(() => { f.style.opacity = '0'; }, 2600);  // en weer weg via opacity
  }

  // ── Meter-lus ────────────────────────────────────────────────────
  function tick() {
    if (cursed && !overlayOpen() && !busy && !vergrendeld) {
      meter = Math.min(100, meter + CFG.meterPerSec);
      updateSmoke();
      if (meter >= 100) startMemory();
    }
  }

  // ── Memory-puzzel (runes naspelen) ───────────────────────────────
  function overlayOpen() {
    return el.memory.classList.contains('zv-open')
      || el.lock.classList.contains('zv-open')
      || el.redder.classList.contains('zv-open');
  }
  function startMemory() {
    if (overlayOpen()) return;
    meter = 100; updateSmoke();
    stopFluisterGeluid();                       // geen 2 geluiden door elkaar
    whisperReadyAt = Date.now() + 9e8;          // blokkeer gefluister tijdens puzzel
    el.memory.classList.add('zv-open');
    // Symbolen alvast tonen (zichtbaar maar nog niet aanklikbaar).
    el.memRunes.innerHTML = RUNES.map((r, i) =>
      `<div class="zv-rune zv-disabled" data-i="${i}">${r}</div>`).join('');
    el.memRunes.querySelectorAll('.zv-rune').forEach(r =>
      r.addEventListener('click', () => memTap(+r.dataset.i)));
    memSeq = Array.from({ length: 5 }, () => Math.floor(Math.random() * RUNES.length));
    memInput = []; memAccept = false;
    // Intro-tussenmoment: chaos + schim + Start-knop. Reeks start pas op Start.
    el.memIntro.style.display = '';
    el.memStart.style.display = '';
    el.memTitle.style.display = 'none';
    el.memInstr.style.display = 'none';
    el.memProgress.innerHTML = '';
  }
  function startMemReeks() {
    el.memIntro.style.display = 'none';
    el.memStart.style.display = 'none';
    el.memTitle.style.display = '';
    el.memInstr.style.display = '';
    renderMemProgress(0);
    el.memInstr.textContent = 'Let goed op…';
    setTimeout(playMemSeq, 500);
  }
  function renderMemProgress(filled) {
    el.memProgress.innerHTML = memSeq.map((_, i) =>
      `<div class="zv-dot${i < filled ? ' zv-fill' : ''}"></div>`).join('');
  }
  function rune(i) { return el.memRunes.querySelector(`.zv-rune[data-i="${i}"]`); }
  function playMemSeq() {
    let k = 0;
    const stap = () => {
      if (k >= memSeq.length) {
        memAccept = true;
        el.memInstr.textContent = 'Herhaal het zegel.';
        el.memRunes.querySelectorAll('.zv-rune').forEach(r => r.classList.remove('zv-disabled'));
        return;
      }
      const r = rune(memSeq[k]); r.classList.add('zv-lit');
      setTimeout(() => { r.classList.remove('zv-lit'); k++; setTimeout(stap, 240); }, 520);
    };
    stap();
  }
  function memTap(i) {
    if (!memAccept) return;
    const r = rune(i); r.classList.add('zv-lit'); setTimeout(() => r.classList.remove('zv-lit'), 200);
    memInput.push(i);
    renderMemProgress(memInput.length);
    const idx = memInput.length - 1;
    if (memInput[idx] !== memSeq[idx]) { memAccept = false; setTimeout(memFout, 350); return; }
    if (memInput.length === memSeq.length) { memAccept = false; setTimeout(memGoed, 350); }
  }
  function memGoed() {
    el.memInstr.textContent = 'De schaduw trekt zich terug…';
    el.memRunes.querySelectorAll('.zv-rune').forEach(r => r.classList.add('zv-disabled'));
    setTimeout(() => {
      el.memory.classList.remove('zv-open');
      meter = 0; updateSmoke();
      whisperReadyAt = Date.now() + 2000;
    }, 1100);
  }
  function memFout() {
    el.memInstr.textContent = 'Verkeerd. Het zegel verbreekt.';
    el.memRunes.querySelectorAll('.zv-rune').forEach(r => r.classList.add('zv-disabled'));
    setTimeout(() => { el.memory.classList.remove('zv-open'); vergrendel(); }, 900);
  }

  // ── Vergrendeling: speler zit vast op locatie tot redder de code geeft ──
  async function vergrendel() {
    vergrendeld = true;
    meter = 100; updateSmoke();                 // rook blijft vol
    stopFluisterGeluid();
    whisperReadyAt = Date.now() + 9e8;          // geen gefluister tijdens vergrendeling
    actieveCode = await Server.vraagCode(CFG.spelerId);   // ← code uit de server
    bewaarLock(actieveCode);
    el.lockCode.textContent = actieveCode;
    el.lock.classList.add('zv-open');
    if (typeof CFG.onVergrendel === 'function') CFG.onVergrendel(actieveCode);
  }

  // De redder (op een ánder tablet) opent dit en typt de code van de vastzittende speler.
  function toonRedderInvoer() {
    el.redderErr.textContent = '';
    el.redderInput.value = '';
    el.redder.classList.add('zv-open');
    setTimeout(() => el.redderInput.focus(), 100);
  }
  async function redderVerstuur() {
    const code = el.redderInput.value.trim().toUpperCase();
    if (code.length < 4) { return schud('Vul het volledige teken in.'); }
    const goed = await Server.controleerCode(CFG.spelerId, code);   // ← server geeft beiden vrij
    if (goed) { el.redder.classList.remove('zv-open'); bevrijd(); }
    else { schud('Dit teken klopt niet.'); }
  }
  function schud(msg) {
    el.redderErr.textContent = msg;
    el.redderInput.classList.remove('zv-shake'); void el.redderInput.offsetWidth;
    el.redderInput.classList.add('zv-shake');
  }

  // Bevrijding — geldt voor beide spelers (server heeft beiden vrijgegeven).
  function bevrijd() {
    vergrendeld = false;
    actieveCode = null;
    wisLock();
    el.lock.classList.remove('zv-open');
    // korte bevrijdings-flits via het lock-scherm? Houd het simpel: rook trekt op.
    meter = 0; updateSmoke();
    whisperReadyAt = Date.now() + 2500;
    if (typeof CFG.onBevrijd === 'function') CFG.onBevrijd();
  }

  // ── Persistentie (stub) — vergrendeling onthouden bij verversen ──
  // Lokaal via localStorage zodat een per ongeluk verversen je niet bevrijdt.
  // In productie is de SERVER de waarheid; dit is enkel een lokale vangnet.
  function bewaarLock(code) {
    if (!CFG.persist) return;
    try { localStorage.setItem(LS_KEY, JSON.stringify({ code, t: Date.now() })); } catch (e) {}
  }
  function wisLock() { try { localStorage.removeItem(LS_KEY); } catch (e) {} }
  function herstelLock() {
    if (!CFG.persist) return false;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (!d || !d.code) return false;
      // herstel de vergrendelde toestand
      cursed = true; vergrendeld = true; meter = 100;
      Server._code = d.code; actieveCode = d.code;     // stub: code weer "bij de server"
      el.rook.classList.add('zv-actief'); updateSmoke();
      el.lockCode.textContent = d.code; el.lock.classList.add('zv-open');
      return true;
    } catch (e) { return false; }
  }

  // ── Publieke API ─────────────────────────────────────────────────
  function init(opts) {
    Object.assign(CFG, opts || {});
    bouwDom();
    initMp3();
    updateSmoke();
    tickTimer = setInterval(tick, 1000);
    if (CFG.persist) herstelLock();             // stond de speler nog vast? toon weer.
    else wisLock();                             // geen persistentie → ruim oude lock op
    return api;
  }
  function vervloek() {
    if (vergrendeld) return;                    // niet opnieuw vervloeken tijdens lock
    if (cursed) { updateSmoke(); return; }      // al vervloekt → niet dubbel inplannen
    cursed = true;
    el.rook.classList.add('zv-actief');
    updateSmoke();
    scheduleFluister(true);                      // eerste fluistering snel (3-5s)
  }

  // ── Vloek-intro: zwart scherm + twee teksten, dan onDone() ───────
  const wacht = ms => new Promise(r => setTimeout(r, ms));
  function toonTekstFade(tekst, inMs, holdMs, outMs) {
    const t = el.vloekIntroTekst;
    return new Promise(res => {
      t.textContent = tekst;
      t.style.transition = `opacity ${inMs}ms ease`;
      requestAnimationFrame(() => { t.style.opacity = '1'; });
      setTimeout(() => {
        t.style.transition = `opacity ${outMs}ms ease`;
        t.style.opacity = '0';
        setTimeout(res, outMs + 150);
      }, inMs + holdMs);
    });
  }
  async function toonVloekIntro(onDone) {
    const o = el.vloekIntro, t = el.vloekIntroTekst, fl = el.flits;
    // Witte flits — de schok op het moment dat de vloek toeslaat.
    fl.style.transition = 'none';
    fl.style.display = 'block';
    fl.style.opacity = '1';                       // vol wit
    requestAnimationFrame(() => {
      fl.style.opacity = '1';                     // even vol wit vasthouden (feller)
    });
    setTimeout(() => {
      fl.style.transition = 'opacity .7s ease-out';
      fl.style.opacity = '0';                     // daarna wegfaden
    }, 450);                                      // ~0,45s vol wit, dan .7s uitfaden
    setTimeout(() => { fl.style.display = 'none'; }, 1200);
    // Zwart eronder meteen klaarzetten zodat het naadloos overgaat.
    o.style.transition = 'none';
    o.style.display = 'flex';
    o.style.opacity = '1';                        // zwart al onder de flits
    t.style.opacity = '0';
    await wacht(1150);                            // flits (vol wit → uitfaden) → zwart
    await toonTekstFade('Schreeuw filler', 2000, 800, 1000);   // langzaam in (2s)
    await wacht(300);
    await toonTekstFade('Alles voelt zwaar, je hoofd doet pijn, wa- wat is dit?', 1600, 1500, 1100);
    await wacht(200);
    if (typeof onDone === 'function') onDone();   // pop-up nu aanmaken, nog ónder het zwart
    o.style.transition = 'opacity .9s ease';       // zwart trekt op → pop-up wordt onthuld
    o.style.opacity = '0';
    setTimeout(() => {
      o.style.display = 'none'; o.style.transition = 'none';
    }, 950);
  }
  function kalmeer() {
    cursed = false; meter = 0;
    if (vergrendeld) {                          // ook een lopende vergrendeling opheffen
      vergrendeld = false; actieveCode = null;
      el.lock.classList.remove('zv-open');
      el.redder.classList.remove('zv-open');
    }
    el.memory.classList.remove('zv-open');
    wisLock();                                  // opgeslagen vergrendeling weg
    el.rook.classList.remove('zv-actief');
    clearTimeout(fluisterTimer);
    updateSmoke();
  }
  function setBusy(b) {
    busy = !!b;
    if (busy) { stopFluisterGeluid(); }         // host-geluid → schaduw zwijgt + meter bevriest
  }

  const api = {
    init, vervloek, kalmeer, setBusy,
    isVergrendeld: () => vergrendeld,
    isVervloekt: () => cursed,
    toonVloekIntro,                             // zwart intro-scherm met de twee teksten
    toonRedderInvoer,                           // in productie: op het tablet van de redder
    wisVergrendeling: () => { wisLock(); },     // opgeslagen lock wissen (bijv. bij reset)
    // ── debug / test (mag in productie blijven, hindert niet) ──
    _ontgrendel: () => bevrijd(),               // solo eruit zonder code
    _setMeter: n => { meter = Math.max(0, Math.min(100, n)); updateSmoke(); },
    _setSpeed: v => { CFG.meterPerSec = +v; },
    _forceMemory: () => { if (cursed) startMemory(); },
    _getCode: () => actieveCode
  };
  return api;
})();
