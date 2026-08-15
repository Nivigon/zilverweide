/* ═══════════════════════════════════════════════════════════════════
   SCHADUW-MODULE, engine  (hoort bij schaduw.css + fog.png)

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
    meterPerSec: 0.4167,          // % per seconde: 100 / 240 = vol in 4 minuten
    memTempo: 1,                  // toon-tempo van de Chaos-knoppenreeks (1 = normaal, hoger = trager getoond, dus makkelijker)
    mistVis: 1.0,                 // bovengrens fog-zichtbaarheid (banken vol opaak bij 90%)
    mistDensity: 0.6,             // hoeveel mistlagen meedoen
    geluidPaden: [
      'geluid/Schaduwmechanic/schaduwfluister.mp3',
      './geluid/Schaduwmechanic/schaduwfluister.mp3',
      'Schaduwmechanic/schaduwfluister.mp3',
      'schaduwfluister.mp3'
    ],
    // Mag deze speler nu vergrendeld worden? De host beslist dat, want het
    // hangt af van gedeelde stand (zit er al iemand anders vast?) en van het
    // verhaal (Felix opgesloten in H2 kan door niemand bereikt worden).
    // Geeft null terug als vergrendelen mag, of een object als het NIET mag:
    //   { reden: 'ander_vast', tekst: '...', meterNa: 70 }
    // meterNa is de stand waarop de meter verder gaat na het loslaten.
    blokkeerVergrendeling: null,
    onVergrendel: null,           // callback(code) als deze speler vastraakt
    onBevrijd: null,              // callback() als deze speler vrijkomt
    onDropLocatie: null,          // callback(klaar) als je vastraakt buiten een locatie:
                                  // de host brengt je naar een locatie, roept klaar(locId) aan
    getVastzitTekst: null,        // callback() → zin voor het wachtscherm ("Je zakt op de grond bij ...")
    onTerugNaarStraat: null,      // callback() als de schaduw wijkt na een gedwongen drop: terug naar de straat
    huidigeLocatie: null,         // id van de locatie waar je nu bent (host houdt dit bij)
    persist: true,                // vergrendeling onthouden bij verversen
    debug: false                  // toont een solo-ontgrendelknop op het vergrendel-scherm
  };

  const BANK_BASE = [0.95, 0.9, 1.0, 0.92, 0.88, 0.97]; // basis-opacity per fogbank
  const MIST_BODEM = 0.14;             // fog-aanwezigheid bij meter 0 (heel licht begin)
  const RUNES = ['ᛟ', 'ᚦ', 'ᛉ'];
  const MEM_EYEBROW_STANDAARD = 'Een schim en de stemmen dringen zich op';
  const FLUISTERS = [
    'zij komt…', 'stil nu…', 'je hoort het ook…', 'niemand luistert…',
    'blijf…', 'dichterbij…', 'het wordt donker…', 'nog even…'
  ];
  const LS_KEY = 'zilverweide_schaduw_lock';
  // Cadans van het gefluister. MAX geldt bij een lege meter, MIN bij een volle.
  const FLUISTER_MAX_MS = 45000;
  const FLUISTER_MIN_MS = 22000;
  // De snelheid waarop de meter hoort te lopen (vol in 4 minuten). Dient als
  // ijkpunt voor de testfactor van het gefluister.
  const NORMAAL_PER_SEC = 0.4167;

  // ── Toestand ─────────────────────────────────────────────────────
  let el = {};                    // DOM-verwijzingen
  let cursed = false, meter = 0;
  // Pauze: de host kan de schaduw stilzetten (eigen geluid, mini-game, film).
  // Meerdere dingen kunnen dat tegelijk willen, dus houden we bij WIE er
  // pauze vraagt in plaats van één schakelaar. Anders zet de eerste die klaar
  // is de pauze van de ander ook uit. busy is de afgeleide: pauze zolang er
  // nog iemand in de set staat.
  let busyRedenen = new Set();
  let busy = false;               // afgeleid uit busyRedenen, niet los zetten
  let vergrendeld = false;
  let opLocatie = false;          // sta je op een locatie-scherm? (host meldt dit via setOpLocatie)
  let gedroptVoorPuzzel = false;  // ben je door de schaduw naar een lege huls getrokken?
  // De finale vroeg om kalmeer terwijl de Chaos-puzzel liep: puzzel eerst
  // laten uitspelen, daarna alsnog kalmeren (zie kalmeer met laatPuzzelUitspelen).
  let kalmeerUitgesteld = false;
  let tickTimer = null, fluisterTimer = null;
  let memSeq = [], memInput = [], memAccept = false;
  // Losstaand hand-ritueel (Kelly bij Naald en Masker): dezelfde rune-puzzel,
  // maar zonder meter, zonder vergrendeling en zonder code. Oneindig herhalen
  // tot ze het zegel goed naspeelt; dan wijkt de schim. Losgekoppeld van de
  // echte vloek (cursed/meter/lock blijven ongemoeid).
  let handModus = false, handActief = false, handWhisperTimer = null, handKlaarCb = null;
  let fluisterSnelTest = false;   // testknop: fluisteringen snel achter elkaar
  let andereVastTest = false;     // testknop: doe alsof een teamgenoot vastzit
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
      <img id="zv-vloekmerk" src="karakters/special/schaduwvloek.png" alt="" aria-hidden="true"
           style="position:fixed;right:0;bottom:0;width:46vw;height:auto;max-width:none;opacity:0;pointer-events:none;z-index:700;transition:opacity .8s ease;filter:drop-shadow(0 0 14px rgba(0,0,0,.55))">
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
        <div class="zv-eyebrow">Een schim en de stemmen dringen zich op</div>
        <div id="zv-mem-intro">
          <div class="zv-title">Chaos</div>
          <div class="zv-line">Je hoofd loopt vol. Stemmen buitelen over elkaar, de grond kantelt.
            Uit de nevel kijkt een schim je recht aan.</div>
          <div class="zv-sub">"Wijs de juiste volgorde van tekens aan… of de schaduw houdt je."</div>
        </div>
        <div class="zv-title" id="zv-mem-title" style="display:none">Orden je gedachten</div>
        <div class="zv-line" id="zv-mem-instr" style="display:none">Let goed op…</div>
        <div class="zv-progress" id="zv-mem-progress"></div>
        <div class="zv-runes" id="zv-mem-runes"></div>
        <button class="zv-btn" id="zv-mem-start">Start</button>
      </div>

      <div id="zv-lock" class="zv-overlay">
        <div class="zv-eyebrow">De druk in je hoofd wordt te veel</div>
        <div class="zv-line" id="zv-lock-loc" style="display:none;color:#ffd27a;font-style:normal;font-weight:600"></div>
        <div class="zv-line">Je voelt je vervloekt. De fluisteringen kruipen over elkaar heen
          tot je je eigen gedachten niet meer hoort. Een duistere schim verschijnt heel vaag
          achter in je hoofd. Je zakt naar de grond en kunt geen kant op. Iemand moet je helpen.</div>
        <div class="zv-sub">Laat een medespeler op jouw locatie deze code invoeren om je te helpen.</div>
        <div class="zv-code" id="zv-lock-code">····</div>
        <div class="zv-wacht">Roep een medespeler. Hardop, hier waar je staat.</div>
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
        <button class="zv-btn-sec" id="zv-redder-terug">Stap terug</button>
      </div>

      <div id="zv-vloekintro"><div id="zv-vloekintro-tekst"></div></div>
      <div id="zv-flits"></div>`;
    document.body.appendChild(root);

    el.root = root;
    el.vloekmerk = root.querySelector('#zv-vloekmerk');
    el.rook = root.querySelector('#zv-rook');
    el.fluister = root.querySelector('#zv-fluister');
    el.meter = root.querySelector('#zv-meter');
    el.meterFill = root.querySelector('#zv-meter-fill');
    el.memory = root.querySelector('#zv-memory');
    el.memEyebrow = root.querySelector('#zv-memory .zv-eyebrow');
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
    el.lockLoc = root.querySelector('#zv-lock-loc');
    el.redder = root.querySelector('#zv-redder');
    el.redderInput = root.querySelector('#zv-redder-input');
    el.redderErr = root.querySelector('#zv-redder-err');
    el.redderBtn = root.querySelector('#zv-redder-btn');
    el.redderTerug = root.querySelector('#zv-redder-terug');
    el.lockTest = root.querySelector('#zv-lock-test');

    // fog-textuur op de banken zetten (configureerbaar pad)
    root.querySelectorAll('.zv-bank').forEach(m => {
      m.style.backgroundImage = `url("${CFG.fogSrc}")`;
    });

    el.redderBtn.addEventListener('click', redderVerstuur);
    if (el.redderTerug) el.redderTerug.addEventListener('click', sluitRedderInvoer);
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
  // Testfactor: alleen VERSNELLEN. Zet iemand de meter sneller (testpaneel),
  // dan komt het gefluister evenredig sneller. Zet iemand hem langzamer, dan
  // blijft de cadans staan, zodat de bovengrens van 45s een echte bovengrens
  // is en het niet stil wordt.
  function fluisterFactor() {
    if (fluisterSnelTest) return 0.15;           // testknop: snel achter elkaar
    var f = NORMAAL_PER_SEC / Math.max(0.01, CFG.meterPerSec);
    return Math.min(1, f);
  }
  // Cadans loopt op met de meter: 45s bij een lege meter, 22s bij een volle.
  // Bewust niet de oude formule maal een snelheidsfactor: bij 4 minuten kwam
  // die op 105s uit, en dan drukte een plafond van 45s het oplopen helemaal weg.
  function whisperIntervalMs() {
    const t = Math.min(meter, 100) / 100;        // 0..1 over de hele meter
    const basis = FLUISTER_MAX_MS - t * (FLUISTER_MAX_MS - FLUISTER_MIN_MS);
    const variatie = 0.9 + Math.random() * 0.2;  // ±10% willekeur
    const ms = basis * variatie * fluisterFactor();
    // Nooit langer dan de bovengrens, en nooit zo kort dat twee fluisteringen
    // over elkaar heen vallen.
    return Math.max(2000, Math.min(FLUISTER_MAX_MS * fluisterFactor(), ms));
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
      // De vloek kondigt zich direct aan: eerste fluistering na 3-5s, altijd
      // binnen tien seconden. De factor kan alleen versnellen, dus die grens
      // blijft ook bij snel testen staan.
      wait = (3000 + Math.random() * 2000) * fluisterFactor();
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
  // Vloekmerk alleen tonen tijdens de puzzel of het vergrendelscherm.
  function updateVloekmerk() {
    if (!el.vloekmerk) return;
    var toon = (el.memory && el.memory.classList.contains('zv-open'))
            || (el.lock && el.lock.classList.contains('zv-open'));
    el.vloekmerk.style.opacity = toon ? '0.3' : '0';
  }
  function startMemory() {
    if (overlayOpen()) return;
    meter = 100; updateSmoke();
    stopFluisterGeluid();                       // geen 2 geluiden door elkaar
    whisperReadyAt = Date.now() + 9e8;          // blokkeer gefluister tijdens puzzel
    // Sta je niet op een locatie (overworld/straat)? De schaduw trekt je eerst
    // naar een lege huls, zodat de puzzel over die locatie-achtergrond speelt.
    if (!opLocatie && typeof CFG.onDropLocatie === 'function') {
      gedroptVoorPuzzel = true;
      CFG.onDropLocatie(function (locId) {
        if (locId) { opLocatie = true; CFG.huidigeLocatie = locId; }
        startMemoryUI();
      });
      return;
    }
    startMemoryUI();
  }
  function startMemoryUI() {
    el.memory.classList.add('zv-open');
    if (el.memEyebrow) el.memEyebrow.textContent = MEM_EYEBROW_STANDAARD;  // echte vloek: standaardtekst
    updateVloekmerk();
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
    el.memInstr.textContent = 'let goed op';
    setTimeout(playMemSeq, 500);
  }
  function renderMemProgress(filled) {
    el.memProgress.innerHTML = memSeq.map((_, i) =>
      `<div class="zv-dot${i < filled ? ' zv-fill' : ''}"></div>`).join('');
  }
  function rune(i) { return el.memRunes.querySelector(`.zv-rune[data-i="${i}"]`); }
  function playMemSeq() {
    let k = 0;
    // Toon-tempo: de begeleider (of het testpaneel) kan de reeks trager of
    // sneller laten oplichten. Alleen het TONEN schaalt mee; het natikken
    // door de speler blijft ongewijzigd.
    const t = CFG.memTempo || 1;
    const stap = () => {
      if (k >= memSeq.length) {
        memAccept = true;
        el.memInstr.textContent = 'Herhaal het zegel.';
        el.memRunes.querySelectorAll('.zv-rune').forEach(r => r.classList.remove('zv-disabled'));
        return;
      }
      const r = rune(memSeq[k]); r.classList.add('zv-lit');
      setTimeout(() => { r.classList.remove('zv-lit'); k++; setTimeout(stap, 240 * t); }, 520 * t);
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
    // Hand-ritueel: geen meter/vloek-afhandeling, alleen de schim laten wijken
    // en de host terugroepen.
    if (handModus) {
      setTimeout(handRitueelAfsluiten, 1100);
      return;
    }
    setTimeout(() => {
      el.memory.classList.remove('zv-open');
      updateVloekmerk();
      meter = 0; updateSmoke();
      whisperReadyAt = Date.now() + 2000;
      // Was je hierheen getrokken (lege huls)? Dan wandel je nu terug naar de
      // straat. Was je al écht op een locatie, dan blijf je daar (verhaal gaat door).
      if (gedroptVoorPuzzel) {
        gedroptVoorPuzzel = false;
        opLocatie = false;
        if (typeof CFG.onTerugNaarStraat === 'function') CFG.onTerugNaarStraat();
      }
      // Vroeg de finale om kalmeer terwijl deze puzzel liep? Dan wijkt de
      // vloek nu helemaal, als beloning direct na het gehaalde zegel.
      if (kalmeerUitgesteld) kalmeer();
    }, 1100);
  }
  function memFout() {
    el.memInstr.textContent = 'Verkeerd. Het zegel verbreekt.';
    el.memRunes.querySelectorAll('.zv-rune').forEach(r => r.classList.add('zv-disabled'));
    // Hand-ritueel: geen vergrendeling. Ze mag het oneindig opnieuw proberen.
    if (handModus) { setTimeout(handHerstart, 900); return; }
    setTimeout(() => {
      el.memory.classList.remove('zv-open');
      // Vroeg de finale om kalmeer terwijl deze puzzel liep? Dan niet
      // vergrendelen: niemand komt je tijdens de finale nog bevrijden.
      // De schim laat los en de vloek wijkt na de flits alsnog.
      if (kalmeerUitgesteld) {
        stopFluisterGeluid();
        toonVloekFlits('De schaduw reikt naar je uit... en laat je gaan.', function () { kalmeer(); });
        return;
      }
      vergrendel();
    }, 900);
  }

  // ── Losstaand hand-ritueel ───────────────────────────────────────
  // Alleen de fluister (geen tekst, enkel het geluid): 1x bij de start en
  // daarna elke 10s tot het zegel goed is. Losgekoppeld van de meter-lus.
  function handFluister() { speelFluisterGeluid(0.8); }
  function handStopFluister() {
    handActief = false;
    clearInterval(handWhisperTimer);
    handWhisperTimer = null;
    stopFluisterGeluid();
    if (el.fluister) el.fluister.style.opacity = '0';
  }
  // Nieuw zegel opzetten binnen de bestaande overlay (na een fout of bij start).
  function handNieuwZegel() {
    memSeq = Array.from({ length: 5 }, () => Math.floor(Math.random() * RUNES.length));
    memInput = []; memAccept = false;
  }
  function handHerstart() {
    handNieuwZegel();
    el.memInstr.textContent = 'Opnieuw. Let goed op.';
    renderMemProgress(0);
    el.memRunes.querySelectorAll('.zv-rune').forEach(r => r.classList.add('zv-disabled'));
    setTimeout(playMemSeq, 600);
  }
  function handRitueelAfsluiten() {
    el.memory.classList.remove('zv-open');
    handModus = false;
    updateVloekmerk();
    handStopFluister();
    if (el.vloekmerk) el.vloekmerk.style.opacity = '0';
    var cb = handKlaarCb; handKlaarCb = null;
    if (typeof cb === 'function') cb();
  }
  // Publiek: start het hand-ritueel. onKlaar() draait zodra het zegel klopt.
  function startHandRitueel(opts) {
    opts = opts || {};
    handKlaarCb = (typeof opts.onKlaar === 'function') ? opts.onKlaar : null;
    handModus = true;
    handActief = true;
    // De schim + het zegel: dezelfde puzzel-overlay, maar zonder meter/lock.
    el.memory.classList.add('zv-open');
    // Eigen aanhef voor het hand-ritueel (Kelly bij Naald en Masker); valt
    // terug op de standaardtekst als de host niets meegeeft.
    if (el.memEyebrow) el.memEyebrow.textContent = opts.eyebrow || MEM_EYEBROW_STANDAARD;
    updateVloekmerk();                                   // toont het vloekmerk (de schim)
    el.memRunes.innerHTML = RUNES.map((r, i) =>
      `<div class="zv-rune zv-disabled" data-i="${i}">${r}</div>`).join('');
    el.memRunes.querySelectorAll('.zv-rune').forEach(r =>
      r.addEventListener('click', () => memTap(+r.dataset.i)));
    handNieuwZegel();
    el.memIntro.style.display = '';
    el.memStart.style.display = '';
    el.memTitle.style.display = 'none';
    el.memInstr.style.display = 'none';
    el.memProgress.innerHTML = '';
    // Fluister: nu meteen 1x, daarna elke 10 seconden tot ze klaar is.
    handFluister();
    clearInterval(handWhisperTimer);
    handWhisperTimer = setInterval(function () { if (handActief) handFluister(); }, 10000);
  }

  // ── Vergrendeling: speler zit vast op locatie tot redder de code geeft ──
  // De schaduw reikt naar je uit, maar laat je gaan. Gebruikt wanneer
  // vergrendelen niet mag: er zit al iemand anders vast (dan kan niemand jou
  // komen halen), of je bent Felix opgesloten in H2. Je krijgt hetzelfde
  // schrikmoment, maar geen slot.
  function laatLos(blokkade) {
    var meterNa = (blokkade && typeof blokkade.meterNa === 'number') ? blokkade.meterNa : 70;
    var tekst = (blokkade && blokkade.tekst)
      || 'De schaduw reikt naar je uit... en laat je gaan.';
    vergrendeld = false;
    actieveCode = null;
    meter = Math.max(0, Math.min(99, meterNa));
    updateSmoke();
    // Even geen gefluister, zodat het schrikmoment niet overspoeld wordt.
    whisperReadyAt = Date.now() + 4000;
    stopFluisterGeluid();
    toonVloekFlits(tekst, function () {
      // Was je hierheen getrokken naar een lege huls? Dan loop je terug naar
      // de straat, net als na een goed nagespeeld zegel.
      if (gedroptVoorPuzzel) {
        gedroptVoorPuzzel = false;
        opLocatie = false;
        if (typeof CFG.onTerugNaarStraat === 'function') CFG.onTerugNaarStraat();
      }
      scheduleFluister(false);
    });
  }

  // Korte flits met één regel tekst over het zwarte introscherm. Werd al door
  // de host aangeroepen (de vloek-herinnering na het woud) maar bestond niet,
  // dus die melding bleef achterwege.
  async function toonVloekFlits(tekst, onDone) {
    const o = el.vloekIntro;
    if (!o) { if (typeof onDone === 'function') onDone(); return; }
    o.style.display = 'flex';
    o.style.transition = 'opacity .35s ease';
    o.style.opacity = '1';
    await toonTekstFade(tekst, 700, 1400, 700);
    if (typeof onDone === 'function') onDone();
    o.style.transition = 'opacity .7s ease';
    o.style.opacity = '0';
    setTimeout(() => { o.style.display = 'none'; o.style.transition = 'none'; }, 750);
  }

  async function vergrendel() {
    // Mag ik nu wel vergrendeld worden? Zit er al iemand anders vast, dan zou
    // niemand mij kunnen bevrijden en zit het hele team klem. Dan laat de
    // schaduw me gaan in plaats van me op te sluiten.
    var blokkade = null;
    if (typeof CFG.blokkeerVergrendeling === 'function') {
      try { blokkade = CFG.blokkeerVergrendeling(); } catch (e) { console.warn('blokkeerVergrendeling:', e); }
    }
    if (!blokkade && andereVastTest) {
      blokkade = { reden: 'test_ander_vast', meterNa: 70,
                   tekst: 'De schaduw reikt naar je uit... maar houdt al iemand anders vast.' };
    }
    if (blokkade) { laatLos(blokkade); return; }
    vergrendeld = true;
    meter = 100; updateSmoke();                 // rook blijft vol
    stopFluisterGeluid();
    whisperReadyAt = Date.now() + 9e8;          // geen gefluister tijdens vergrendeling
    // Zit je niet op een locatie (overworld/invoerscherm)? Laat de host je
    // eerst naar een locatie brengen, zodat je altijd ziet waar je vastzit.
    if (!opLocatie && typeof CFG.onDropLocatie === 'function') {
      CFG.onDropLocatie(function (locId) {
        if (locId) { opLocatie = true; CFG.huidigeLocatie = locId; }
        vergrendelAfmaken();
      });
      return;
    }
    vergrendelAfmaken();
  }

  async function vergrendelAfmaken() {
    actieveCode = await Server.vraagCode(CFG.spelerId);   // ← code uit de server
    bewaarLock(actieveCode);
    el.lockCode.textContent = actieveCode;
    // Textuele "waar zit ik vast"-regel op het wachtscherm.
    var waar = (typeof CFG.getVastzitTekst === 'function') ? (CFG.getVastzitTekst() || '') : '';
    if (el.lockLoc) {
      el.lockLoc.textContent = waar;
      el.lockLoc.style.display = waar ? '' : 'none';
    }
    el.lock.classList.add('zv-open');
    updateVloekmerk();
    if (typeof CFG.onVergrendel === 'function') CFG.onVergrendel(actieveCode);
  }

  // De redder (op een ánder tablet) opent dit en typt de code van de vastzittende speler.
  function toonRedderInvoer() {
    el.redderErr.textContent = '';
    el.redderInput.value = '';
    el.redder.classList.add('zv-open');
    setTimeout(() => el.redderInput.focus(), 100);
  }
  // De redder loopt weg zonder te helpen, of het invoerscherm heeft geen doel
  // meer omdat een ander eerder was met de code. Alleen dit scherm gaat dicht:
  // de vergrendeling van de ander blijft staan. De host merkt het sluiten op
  // en brengt de redder terug naar de straat.
  function sluitRedderInvoer() {
    el.redderErr.textContent = '';
    el.redderInput.value = '';
    el.redder.classList.remove('zv-open');
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

  // Bevrijding, geldt voor beide spelers (server heeft beiden vrijgegeven).
  function bevrijd() {
    vergrendeld = false;
    actieveCode = null;
    gedroptVoorPuzzel = false;   // terugkeer naar de straat regelt de host
    wisLock();
    el.lock.classList.remove('zv-open');
    updateVloekmerk();
    // korte bevrijdings-flits via het lock-scherm? Houd het simpel: rook trekt op.
    meter = 0; updateSmoke();
    whisperReadyAt = Date.now() + 2500;
    if (typeof CFG.onBevrijd === 'function') CFG.onBevrijd();
  }

  // ── Persistentie (stub), vergrendeling onthouden bij verversen ──
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
  // opts.startMeter: stand waarop de meter begint (0-100). De host geeft per
  // rol een andere waarde mee zodat de vier spelers niet gelijktijdig vollopen
  // en dus niet tegelijk vast kunnen raken. Werd eerder genegeerd omdat deze
  // functie geen parameter had; alle vier begonnen daardoor op 0.
  function vervloek(opts) {
    if (vergrendeld) return;                    // niet opnieuw vervloeken tijdens lock
    if (cursed) { updateSmoke(); return; }      // al vervloekt → niet dubbel inplannen
    kalmeerUitgesteld = false;                  // een verse vloek erft geen oud uitstel
    var start = opts && typeof opts.startMeter === 'number' ? opts.startMeter : 0;
    meter = Math.max(0, Math.min(99, start));   // 99 als plafond: nooit meteen vol
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
  // onEersteTekst (optioneel): vuurt precies wanneer de eerste intro-regel
  // in beeld komt, zodat de host daar zijn geluid op kan laten aansluiten.
  async function toonVloekIntro(onDone, onEersteTekst) {
    const o = el.vloekIntro, t = el.vloekIntroTekst, fl = el.flits;
    // Witte flits, de schok op het moment dat de vloek toeslaat.
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
    if (typeof onEersteTekst === 'function') { try { onEersteTekst(); } catch (e) {} }
    await toonTekstFade('Een hoofd vol stemmen ontwakend...', 2000, 800, 1000);   // langzaam in (2s)
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
  function kalmeer(opts) {
    // Zachte variant (finale): zit de speler middenin de Chaos-puzzel, laat
    // die dan uitspelen in plaats van hem onder de handen weg te trekken.
    // De vloek eindigt daarna alsnog: bij succes direct na de puzzel, bij
    // falen via "de schim laat je gaan" (zie memGoed en memFout). Wie al
    // vergrendeld is valt hier bewust buiten: die wordt direct bevrijd,
    // want tijdens de finale komt niemand meer langs met de code.
    if (opts && opts.laatPuzzelUitspelen && cursed && !vergrendeld
        && !handModus && el.memory.classList.contains('zv-open')) {
      kalmeerUitgesteld = true;
      return;
    }
    kalmeerUitgesteld = false;
    // Was de speler voor de puzzel naar een lege huls getrokken, dan hoort
    // hij terug naar de straat, net als in de succes-route en laatLos.
    // Zonder dit bleef hij achter in een locatie die hij nooit zelf koos.
    var wasGedropt = gedroptVoorPuzzel;
    cursed = false; meter = 0; gedroptVoorPuzzel = false;
    if (vergrendeld) {                          // ook een lopende vergrendeling opheffen
      vergrendeld = false; actieveCode = null;
      el.lock.classList.remove('zv-open');
      el.redder.classList.remove('zv-open');
    }
    el.memory.classList.remove('zv-open');
    if (handModus) { handModus = false; handStopFluister(); }  // hand-ritueel netjes afbreken
    wisPauzes();                                // geen enkele pauze mag de volgende vloek bevriezen
    wisLock();                                  // opgeslagen vergrendeling weg
    el.rook.classList.remove('zv-actief');
    if (el.vloekmerk) el.vloekmerk.style.opacity = '0';   // vloekmerk weg als de vloek wijkt
    clearTimeout(fluisterTimer);
    updateSmoke();
    if (wasGedropt) {
      opLocatie = false;
      if (typeof CFG.onTerugNaarStraat === 'function') CFG.onTerugNaarStraat();
    }
  }
  // Pauze aan- of uitzetten namens één reden. Twee keer dezelfde reden
  // aanzetten telt als één (idempotent), zodat een defensieve dubbele aanroep
  // geen pauze achterlaat die nooit meer opgeheven wordt. Zonder reden loopt
  // alles via 'algemeen', precies zoals de oude schakelaar deed.
  function setBusy(b, reden) {
    const sleutel = reden || 'algemeen';
    if (b) busyRedenen.add(sleutel); else busyRedenen.delete(sleutel);
    busy = busyRedenen.size > 0;
    if (busy) { stopFluisterGeluid(); }         // host-geluid → schaduw zwijgt + meter bevriest
  }
  function wisPauzes() { busyRedenen.clear(); busy = false; }
  // De host meldt of we op een locatie-scherm staan (locId) of niet (null).
  // Bepaalt of je bij vergrendeling eerst naar een locatie gebracht wordt.
  function setOpLocatie(locId) {
    opLocatie = !!locId;
    CFG.huidigeLocatie = locId || null;
  }

  const api = {
    init, vervloek, kalmeer, setBusy, setOpLocatie,
    startHandRitueel,                           // losstaand hand-ritueel (Kelly, K8)
    isVergrendeld: () => vergrendeld,
    isVervloekt: () => cursed,
    isBezig: () => busy,                        // staat de schaduw nu op pauze?
    pauzeRedenen: () => Array.from(busyRedenen),// wie houdt hem tegen (testpaneel)
    isHandRitueelBezig: () => handActief,
    toonVloekIntro,                             // zwart intro-scherm met de twee teksten
    toonVloekFlits,                             // korte flits met één regel (vloek-herinnering)
    toonRedderInvoer,                           // in productie: op het tablet van de redder
    sluitRedderInvoer,                          // redder loopt weg, of de lock is al door een ander opgelost
    wisVergrendeling: () => { wisLock(); },     // opgeslagen lock wissen (bijv. bij reset)
    // ── debug / test (mag in productie blijven, hindert niet) ──
    _ontgrendel: () => bevrijd(),               // solo eruit zonder code
    _setMeter: n => { meter = Math.max(0, Math.min(100, n)); updateSmoke(); },
    getMeter: () => meter,                      // metervulling 0-100 (begeleider-status)
    _setSpeed: v => { CFG.meterPerSec = +v; },
    _getSpeed: () => CFG.meterPerSec,
    // Toon-tempo van de Chaos-reeks: factor op de toon-tijden (1 = normaal,
    // hoger = trager getoond dus makkelijker, lager = sneller dus moeilijker).
    _setMemTempo: v => { CFG.memTempo = Math.max(0.2, Math.min(4, +v || 1)); },
    _getMemTempo: () => CFG.memTempo || 1,
    _forceMemory: () => { if (cursed) startMemory(); },
    _setFluisterSnel: aan => { fluisterSnelTest = !!aan; scheduleFluister(false); },
    // Testknoppen voor de vergrendel-blokkade: doen alsof er een teamgenoot
    // vastzit, zonder een echt tweede tablet.
    setAndereVast: b => { andereVastTest = !!b; },
    isAndereVast: () => andereVastTest,
    _getCode: () => actieveCode
  };
  return api;
})();
