/* ════════════════════════════════════════════════════════════════════
   LOCKPICK-ENGINE  (timing-variant, afgeleid van de slijp-mechanic)
   Je peutert een slot open met een dunne vleeshaak. Elke pin moet op de
   schaarlijn gezet worden. De haak beweegt op en neer over de pin-hoogte;
   tik 'Zet' op het juiste moment.
       te LAAG  → de pin valt terug, opnieuw
       juist    → de pin klikt vast op de schaar, door naar de volgende
       te HOOG  → de pin klemt, alle pinnen vallen → terug naar pin 1

   De pin-hoogten samen zijn het slot-patroon (deelbaar, zoals de doolhof-
   route). Drie modi via kiesModus:true:
       makkelijk — schaarzone zichtbaar, geen tijd
       moeilijk  — geen zone (voel/lees de pinnen), geen tijd
       diehard   — geen zone + 30s per slot; klemmen óf tijd op = fout;
                   3 fouten → alles opnieuw

   CONFIG
   ──────
     reeks: [ { pins:[..0..1], band, snelheid, label }, ... ]
     dieHard: { tijd:30000, maxFouten:3 }
     straf: 'slot' | 'pin'
     images, teksten
   ════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class')            e.className = attrs[k];
      else if (k === 'html')        e.innerHTML = attrs[k];
      else if (k === 'text')        e.textContent = attrs[k];
      else if (k === 'style')       Object.assign(e.style, attrs[k]);
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), attrs[k]);
      else                          e.setAttribute(k, attrs[k]);
    });
    if (kids) kids.forEach(function (k) { if (k) e.appendChild(k); });
    return e;
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  var KEYHOLE_SVG =   // gouden plaat met sleutelgat
    '<svg viewBox="0 0 110 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<defs><linearGradient id="lp-plaat" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#e0c476"/><stop offset=".5" stop-color="#b7963f"/>' +
        '<stop offset="1" stop-color="#6f5824"/></linearGradient></defs>' +
      '<rect x="14" y="12" width="82" height="146" rx="30" fill="url(#lp-plaat)" stroke="#3a2c12" stroke-width="2"/>' +
      '<rect x="22" y="20" width="66" height="130" rx="24" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="3"/>' +
      '<path d="M30 26 A28 28 0 0 1 60 18" fill="none" stroke="#fff6d6" stroke-width="2.5" stroke-linecap="round" opacity=".45"/>' +
      '<circle cx="55" cy="66" r="17" fill="#0a0806"/>' +
      '<path d="M44 76 L66 76 L60 130 L50 130 Z" fill="#0a0806"/>' +
    '</svg>';

  var HOLE_SVG =   // alleen de donkere gat-opening (front-laag; punt verdwijnt hierin)
    '<svg viewBox="0 0 110 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<circle cx="55" cy="66" r="17" fill="#0a0806"/>' +
      '<path d="M44 76 L66 76 L60 130 L50 130 Z" fill="#0a0806"/>' +
      '<path d="M42 60 A17 17 0 0 1 68 60" fill="none" stroke="rgba(0,0,0,.6)" stroke-width="2"/>' +
      '<path d="M42 72 A17 17 0 0 0 68 72" fill="none" stroke="#e0c476" stroke-width="1.4" opacity=".35"/>' +
    '</svg>';

  var PEN_SVG =   // gevulde taps toelopende vleespen met cilinder-shading (licht boven, donker onder)
    '<svg viewBox="0 0 520 120" preserveAspectRatio="xMinYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="lp-pen" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#f6e097"/><stop offset=".4" stop-color="#e8cf7c"/>' +
          '<stop offset=".56" stop-color="#c9a84c"/><stop offset=".8" stop-color="#8f7331"/>' +
          '<stop offset="1" stop-color="#5f4a1c"/></linearGradient>' +
        '<filter id="lp-pensch" x="-4%" y="-70%" width="108%" height="240%">' +
          '<feDropShadow dx="2" dy="6" stdDeviation="5" flood-color="#000" flood-opacity=".55"/></filter>' +
      '</defs>' +
      '<g filter="url(#lp-pensch)">' +
        // gevulde omtrek: spitse punt links, dik naar rechts
        '<path d="M20 60 C60 50 120 42 200 38 C320 34 430 34 510 34 L510 86 C430 86 320 86 200 82 C120 78 60 70 20 60 Z" ' +
          'fill="url(#lp-pen)" stroke="#3a2c12" stroke-width="1.5" stroke-linejoin="round"/>' +
        // glans-streep langs de bovenkant (cilinder)
        '<path d="M64 47 C200 40 400 38 502 37" fill="none" stroke="#fff6d6" stroke-width="4" stroke-linecap="round" opacity=".5"/>' +
        // schaduw langs de onderkant
        '<path d="M80 76 C250 80 430 82 505 82" fill="none" stroke="#4a3a18" stroke-width="4" stroke-linecap="round" opacity=".55"/>' +
        // bindingen bij de greep (rechts)
        '<line x1="430" y1="37" x2="430" y2="85" stroke="#5a4326" stroke-width="3"/>' +
        '<line x1="452" y1="36" x2="452" y2="86" stroke="#5a4326" stroke-width="3"/>' +
        '<line x1="474" y1="36" x2="474" y2="86" stroke="#5a4326" stroke-width="3"/>' +
        // glans op de punt
        '<path d="M30 58 C70 52 120 50 170 48" fill="none" stroke="#fff6d6" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>' +
      '</g>' +
    '</svg>';

  function Lockpick(opts) {
    if (!opts || !opts.container) throw new Error('Lockpick: opts.container is verplicht');
    if (!opts.config)            throw new Error('Lockpick: opts.config is verplicht');
    this.container = opts.container;
    this.config = opts.config;
    this.onWin      = opts.onWin      || function () {};
    this.onExit     = opts.onExit     || null;
    this.onMislukt  = opts.onMislukt  || function () {};
    this.onVoltooid = opts.onVoltooid || function () {};
    this.musicSrc   = opts.music      || null;
    this.audioCfg = Object.assign({}, opts.audio || this.config.audio || {});
    this._vol = Object.assign({ drops: 0.5, mes: 0.5, whistle: 0.5, klik: 0.85 }, opts.volumes || {});
    this._interval = Object.assign({ drops: 5000, mes: 8000 }, opts.intervals || this.config.intervals || {});
    this._jitter = (opts.intervalJitter != null) ? opts.intervalJitter
                 : (this.config.intervalJitter != null ? this.config.intervalJitter : 0.25);
    this._itimers = {};
    this._audio = {};
    this.showStart  = opts.showStart !== false;
    this.showDebug  = !!opts.showDebug;
    this.compactHeader = !!opts.compactHeader;
    this.kiesModus  = !!opts.kiesModus;
    this.testMode   = !!opts.testMode;
    this._swayAmp   = (opts.swayAmp != null) ? opts.swayAmp : 4;
    this._introGestart = false;

    var cfg = this.config;
    this._reeks = (cfg.reeks && cfg.reeks.length) ? cfg.reeks.slice()
      : [{ pins: cfg.pins || [0.4, 0.7, 0.5], band: cfg.band, snelheid: cfg.snelheid, label: cfg.label }];
    this._straf = cfg.straf || 'slot';
    this._dh = Object.assign({ tijd: 30000, maxFouten: 3 }, cfg.dieHard || {});

    this._pins     = this._reeks[0].pins.slice();
    this._band     = this._reeks[0].band || 0.13;
    this._snelheid = this._reeks[0].snelheid || 1500;

    this.modus = opts.modus || 'makkelijk';
    this._pasModusAf();

    this._state = { slotIdx: 0, pinIdx: 0, gezet: [], cycleStart: 0, bevroren: false, lopend: false, fouten: 0, deadline: 0 };
    this._raf = null; this._timer = null; this._nodes = {};
    this._trackNodes = [];
  }

  Lockpick.prototype._pasModusAf = function () {
    this.toonZone = (this.modus === 'makkelijk');
    this.dieHard  = (this.modus === 'diehard');
  };

  Lockpick.prototype._laadSlot = function (idx) {
    var s = this._state, k = this._reeks[idx];
    s.slotIdx = idx; s.pinIdx = 0;
    this._pins = k.pins.slice();
    this._band = k.band || 0.13;
    this._snelheid = k.snelheid || 1500;
    s.gezet = this._pins.map(function () { return null; });
    s.cycleStart = performance.now();
    s.bevroren = false;
    if (this.dieHard) s.deadline = performance.now() + this._dh.tijd;
    this._bouwSlot();
    this._bouwPinnen();
    this._updateReeksLabel();
    this._plaatsSfeer();
  };

  // ─── Build UI ───────────────────────────────────────────────────
  Lockpick.prototype.mount = function () {
    var self = this, cfg = this.config, t = cfg.teksten || {};
    var hasScene = !!(cfg.images && cfg.images.scene);
    var root = el('div', { class: 'lp-root' });

    // Modus-keuze
    var kiesScreen = null;
    if (this.kiesModus) {
      kiesScreen = el('section', { class: 'lp-screen' });
      if (this.compactHeader) kiesScreen.appendChild(this._maakCompactHeader());
      if (t.titel) kiesScreen.appendChild(el('h1', { class: 'lp-titel-compact', html: t.titel }));
      if (t.sub)   kiesScreen.appendChild(el('div', { class: 'lp-sub-onder-titel', text: t.sub }));
      kiesScreen.appendChild(el('p', { class: 'lp-kies-vraag', text: 'Kies je beproeving' }));
      kiesScreen.appendChild(el('div', { class: 'lp-kies-wrap' }, [
        el('button', { class: 'lp-kies-btn', onclick: function () { self._kiesModus('makkelijk'); } }, [
          el('span', { class: 'lp-kies-label', text: 'Makkelijk' }),
          el('span', { class: 'lp-kies-desc', text: 'Schaarzone zichtbaar · geen tijd' })
        ]),
        el('button', { class: 'lp-kies-btn', onclick: function () { self._kiesModus('moeilijk'); } }, [
          el('span', { class: 'lp-kies-label', text: 'Moeilijk' }),
          el('span', { class: 'lp-kies-desc', text: 'Geen zone · voel de pinnen · geen tijd' })
        ]),
        el('button', { class: 'lp-kies-btn lp-kies-btn-hard', onclick: function () { self._kiesModus('diehard'); } }, [
          el('span', { class: 'lp-kies-label', text: 'Die Hard' }),
          el('span', { class: 'lp-kies-desc', text: '30 sec per slot · 3 fouten = alles opnieuw' })
        ])
      ]));
    }

    // Startscherm
    var startScreen = el('section', { class: 'lp-screen lp-screen-start' });
    if (this.compactHeader) startScreen.appendChild(this._maakCompactHeader());
    if (t.titel) startScreen.appendChild(el('h1', { class: 'lp-titel-compact', html: t.titel }));
    if (t.sub)   startScreen.appendChild(el('div', { class: 'lp-sub-onder-titel', text: t.sub }));
    var startSceneImg = el('div', { class: 'lp-scene-image' + (hasScene ? '' : ' lp-scene-leeg'),
      style: hasScene ? { backgroundImage: "url('" + cfg.images.scene + "')" } : null });
    startScreen.appendChild(startSceneImg);
    this._nodes.startSceneImg = startSceneImg;
    var startBtn = el('button', { class: 'lp-btn lp-btn-full', text: 'Steek de haak erin',
      onclick: function () { self.start(); } });
    if (t.intro && t.intro.length) startBtn.style.display = 'none';
    startScreen.appendChild(startBtn);
    this._nodes.startBtn = startBtn;

    // Spel-scherm
    var spelScreen = el('section', { class: 'lp-screen' });
    if (this.compactHeader) spelScreen.appendChild(this._maakCompactHeader());
    var topRij = el('div', { class: 'lp-toprij' }, [
      el('div', { class: 'lp-reeks-label' }),
      el('div', { class: 'lp-timer' }, [
        el('span', { class: 'lp-timer-num', text: '0:30' }),
        el('div', { class: 'lp-timer-balk' }, [ el('div', { class: 'lp-timer-vul' }) ])
      ])
    ]);
    spelScreen.appendChild(topRij);

    // Het slot (doorsnede met pin-kolommen + haak)
    var slot = el('div', { class: 'lp-slot' });
    spelScreen.appendChild(slot);
    var keyhole = el('div', { class: 'lp-feel-keyhole', html: KEYHOLE_SVG });     // plaat (achter)
    var pen = el('div', { class: 'lp-feel-pen lp-haak-sway', html: PEN_SVG });     // pen ervoor (sway-laag)
    var hole = el('div', { class: 'lp-feel-hole', html: HOLE_SVG });               // donker gat (voor, punt verdwijnt hierin)
    var feel = el('div', { class: 'lp-feel' }, [keyhole, pen, hole]);
    root.appendChild(feel);
    this._nodes.feel = feel;
    this._nodes.haakSway = pen;
    pen.style.setProperty('--lp-amp', String(this._swayAmp));

    // Fouten-indicator (links van de puzzel, dicht ertegenaan)
    var foutDots = [el('div', { class: 'lp-fout-dot' }), el('div', { class: 'lp-fout-dot' }), el('div', { class: 'lp-fout-dot' })];
    var foutenBox = el('div', { class: 'lp-fouten' }, [
      el('div', { class: 'lp-fout-label', text: 'fouten' })
    ].concat(foutDots));
    spelScreen.appendChild(foutenBox);
    this._nodes.foutenBox = foutenBox;
    this._nodes.foutDots = foutDots;

    // Pin-patroon (clue + voortgang)
    spelScreen.appendChild(el('div', { class: 'lp-mini-label', text: 'De pinnen:' }));
    var patroon = el('div', { class: 'lp-patroon' });
    spelScreen.appendChild(patroon);

    var status = el('div', { class: 'lp-status' }, [
      el('span', { class: 'lp-naam', text: (t.naam || 'De haak') + ' — ' }),
      el('span', { class: 'lp-status-tekst', text: t.instructie || 'zet elke pin op de schaarlijn' })
    ]);
    spelScreen.appendChild(status);

    var zetBtn = el('button', { class: 'lp-zet-btn', onclick: function () { self.zet(); } }, [
      el('span', { class: 'lp-zet-icon', text: '⤒' }), el('span', { class: 'lp-zet-label', text: 'Zet' })
    ]);
    spelScreen.appendChild(zetBtn);
    spelScreen.appendChild(el('div', { class: 'lp-hint', text: 'Te laag mag je opnieuw. Te hoog klemt de pin en alles valt.' }));

    // Win
    var winScreen = el('section', { class: 'lp-screen' });
    if (this.compactHeader) winScreen.appendChild(this._maakCompactHeader());
    var winT = t.winAlles || {};
    winScreen.appendChild(el('div', { class: 'lp-win-block' }, [
      el('div', { class: 'lp-win-icoon', text: '🗝' }),
      el('h2', { text: winT.titel || 'Alle sloten open' }),
      el('p',  { text: winT.body  || 'De grendel springt terug.' })
    ]));

    if (kiesScreen) root.appendChild(kiesScreen);
    root.appendChild(startScreen); root.appendChild(spelScreen); root.appendChild(winScreen);

    if (this.musicSrc) {
      var audio = el('audio', { id: 'lp-bg-music', loop: '', preload: 'auto' }, [ el('source', { src: this.musicSrc, type: 'audio/mpeg' }) ]);
      var musicBtn = el('button', { class: 'lp-music-toggle', title: 'Muziek aan/uit', text: '♪', onclick: function () { self.toggleMusic(); } });
      root.appendChild(audio); root.appendChild(musicBtn);
      this._nodes.audio = audio; this._nodes.musicBtn = musicBtn;
    }
    if (this.showDebug) { var dbg = el('div', { class: 'lp-debug' }); root.appendChild(dbg); this._nodes.debug = dbg; }

    // Audio + geluidspaneel (linksonder)
    this._laadAudio();
    if (this._audio.drops || this._audio.mes || this._audio.whistle || this._audio.klik) {
      var paneel = el('div', { class: 'lp-vol-paneel' });
      paneel.appendChild(el('div', { class: 'lp-vol-titel', text: 'Geluid' }));
      var volRij = function (naam, label) {
        if (!self._audio[naam]) return;
        var slider = el('input', { type: 'range', min: '0', max: '100', value: String(Math.round(self._vol[naam] * 100)),
          class: 'lp-vol-slider', oninput: function (e) { self.setVolume(naam, (+e.target.value) / 100); } });
        paneel.appendChild(el('div', { class: 'lp-vol-rij' }, [ el('span', { class: 'lp-vol-label', text: label }), slider ]));
      };
      var intRij = function (naam) {
        if (!self._audio[naam]) return;
        var uit = el('span', { class: 'lp-int-uit', text: (self._interval[naam] / 1000).toFixed(1) + 's' });
        var slider = el('input', { type: 'range', min: '500', max: '15000', step: '250', value: String(self._interval[naam]),
          class: 'lp-vol-slider', oninput: function (e) { var v = +e.target.value; self.setIntervalMs(naam, v); uit.textContent = (v / 1000).toFixed(1) + 's'; } });
        paneel.appendChild(el('div', { class: 'lp-vol-rij lp-int-rij' }, [ el('span', { class: 'lp-vol-label', text: 'interval' }), slider, uit ]));
      };
      volRij('drops', 'Drops');   intRij('drops');
      volRij('mes', 'Mes');       intRij('mes');
      volRij('whistle', 'Whistle');
      volRij('klik', 'Klik');
      root.appendChild(paneel);
      this._nodes.paneel = paneel;
    }

    // Test-modus: schuif om de hoeveelheid haak-beweging te regelen
    if (this.testMode) {
      var uit = el('span', { class: 'lp-test-uit', text: String(this._swayAmp) });
      var slider = el('input', { type: 'range', min: '0', max: '20', step: '1', value: String(this._swayAmp),
        class: 'lp-vol-slider', oninput: function (e) {
          var v = +e.target.value; self._swayAmp = v;
          if (self._nodes.haakSway) self._nodes.haakSway.style.setProperty('--lp-amp', String(v));
          uit.textContent = String(v);
        } });
      var testPaneel = el('div', { class: 'lp-test-paneel' }, [
        el('div', { class: 'lp-vol-titel', text: 'Test · haak-beweging' }),
        el('div', { class: 'lp-vol-rij' }, [ el('span', { class: 'lp-vol-label', text: 'sway' }), slider, uit ])
      ]);
      root.appendChild(testPaneel);
      this._nodes.testPaneel = testPaneel;
    }

    this.container.appendChild(root);

    this._nodes.root = root;
    this._nodes.screens = { start: startScreen, spel: spelScreen, win: winScreen };
    if (kiesScreen) this._nodes.screens.kies = kiesScreen;
    this._nodes.slot = slot;
    this._nodes.patroon = patroon;
    this._nodes.status = status;
    this._nodes.statusTekst = status.querySelector('.lp-status-tekst');
    this._nodes.zetBtn = zetBtn;
    this._nodes.reeksLabel = topRij.querySelector('.lp-reeks-label');
    this._nodes.timerNum = topRij.querySelector('.lp-timer-num');
    this._nodes.timerVul = topRij.querySelector('.lp-timer-vul');

    this._laadSlot(0);
    this._pasUiAf();

    if (this.kiesModus)      this._toonScreen('kies');
    else if (this.showStart) this._toonStart();
    else                     this._toonScreen('spel');
  };

  // ─── Flow ────────────────────────────────────────────────────────
  Lockpick.prototype.start = function () {
    this._state.fouten = 0;
    this._laadSlot(0);
    this._toonScreen('spel');
    this._updateFouten(); this._plaatsSfeer();
    if (!this._resizeH) { var self = this; this._resizeH = function () { self._plaatsSfeer(); }; window.addEventListener('resize', this._resizeH); }
    this._startMuziek();
    this._startGeluid();
    this._startLoop();
  };
  Lockpick.prototype.destroy = function () {
    this._stopLoop(); clearTimeout(this._timer); this._stopAudio();
    if (this._resizeH) { window.removeEventListener('resize', this._resizeH); this._resizeH = null; }
    if (this._nodes.audio) { try { this._nodes.audio.pause(); } catch (e) {} }
    if (this._nodes.root && this._nodes.root.parentNode) this._nodes.root.parentNode.removeChild(this._nodes.root);
    this._nodes = {};
  };

  // ─── Spelersactie: pin zetten op de huidige haak-hoogte ───────────
  Lockpick.prototype.zet = function () {
    var s = this._state; if (s.bevroren) return;
    var pos = this._pos();
    var doel = this._pins[s.pinIdx];
    var lo = clamp(doel - this._band / 2, 0, 1), hi = clamp(doel + this._band / 2, 0, 1);
    if (pos > hi)      this._klemt();                 // te hoog → klemt
    else if (pos < lo) this._teLaag();                // te laag → opnieuw
    else {                                            // juist → pin gezet
      s.gezet[s.pinIdx] = doel;
      this._klik();
      this._zetToken(s.pinIdx, doel, true);
      this._bouwPinnen(); this._flash('goed');
      s.pinIdx++;
      if (s.pinIdx >= this._pins.length) { this._slotOpen(); return; }
      this._zetActieveZone();
    }
  };

  // ─── Loop + timer ────────────────────────────────────────────────
  Lockpick.prototype._startLoop = function () {
    if (this._state.lopend) return; this._state.lopend = true; var self = this;
    (function frame() { if (!self._state.lopend) return; self._tick(); self._raf = requestAnimationFrame(frame); })();
  };
  Lockpick.prototype._stopLoop = function () { this._state.lopend = false; if (this._raf) cancelAnimationFrame(this._raf); this._raf = null; };
  Lockpick.prototype._tick = function () {
    var s = this._state; if (s.bevroren) return;
    var now = performance.now();
    var pos = ((now - s.cycleStart) % this._snelheid) / this._snelheid;
    this._updateActief(pos);
    if (this.dieHard) {
      var rest = Math.max(0, s.deadline - now), sec = Math.ceil(rest / 1000);
      if (this._nodes.timerNum) this._nodes.timerNum.textContent = '0:' + (sec < 10 ? '0' : '') + sec;
      if (this._nodes.timerVul) this._nodes.timerVul.style.width = (rest / this._dh.tijd * 100) + '%';
      if (this._nodes.timer) this._nodes.timer.classList.toggle('lp-timer-laag', sec <= 10);
      if (rest <= 0) { this._fout('tijd'); return; }
    }
    if (this._nodes.debug) this._nodes.debug.textContent =
      'slot ' + (s.slotIdx + 1) + '/' + this._reeks.length + ' · pin ' + (s.pinIdx + 1) + '/' + this._pins.length +
      ' · ' + pos.toFixed(2) + (this.dieHard ? (' · fout ' + s.fouten) : '');
  };
  Lockpick.prototype._pos = function () { return ((performance.now() - this._state.cycleStart) % this._snelheid) / this._snelheid; };

  // ─── Uitkomsten ──────────────────────────────────────────────────
  Lockpick.prototype._teLaag = function () {
    var t = this.config.teksten || {};
    this._flash('laag'); this._tijdelijkeStatus(t.teLaag || 'Te laag — de pin valt terug.');
  };
  Lockpick.prototype._klemt = function () {
    if (this.dieHard) { this._fout('klem'); return; }
    var self = this, s = this._state, t = this.config.teksten || {};
    s.fouten++; try { this.onMislukt(s.fouten); } catch (e) {}
    this._updateFouten();
    var laatste = s.fouten >= this._dh.maxFouten;
    this._overlay(laatste ? (t.allesOpnieuw || 'Drie fouten. Alle sloten weer dicht — begin opnieuw.')
                          : (t.teHoog || 'Te hoog! De pin klemt en alle pinnen vallen.'));
    this._timer = setTimeout(function () {
      if (laatste) {
        s.fouten = 0; self._laadSlot(0); self._herstelVisueel(); self._updateFouten();
      } else if (self._straf === 'pin') {
        s.gezet[s.pinIdx] = null; self._herstel();
      } else {
        s.pinIdx = 0; s.gezet = self._pins.map(function () { return null; }); self._herstel();
      }
    }, 2100);
  };
  Lockpick.prototype._fout = function (reden) {
    var self = this, s = this._state, t = this.config.teksten || {};
    s.fouten++; try { this.onMislukt(s.fouten); } catch (e) {}
    this._updateFouten();
    var melding = reden === 'tijd' ? (t.tijdOp || 'De tijd is op — je hand verkrampt.')
                                   : (t.teHoog || 'Te hoog! De pin klemt en alles valt.');
    var laatste = s.fouten >= this._dh.maxFouten;
    if (laatste) melding = (t.allesOpnieuw || 'Drie fouten. Alle sloten weer op slot.');
    this._overlay(melding);
    this._timer = setTimeout(function () {
      if (laatste) { s.fouten = 0; self._laadSlot(0); } else { self._laadSlot(s.slotIdx); }
      self._herstelVisueel();
    }, 2100);
  };

  Lockpick.prototype._slotOpen = function () {
    var self = this, s = this._state, t = this.config.teksten || {};
    try { this.onVoltooid(s.slotIdx, this._reeks.length); } catch (e) {}
    if (s.slotIdx >= this._reeks.length - 1) { this._winnen(); return; }
    s.bevroren = true;
    var label = this._reeks[s.slotIdx].label || ('Slot ' + (s.slotIdx + 1));
    this._nodes.status.classList.add('lp-goed-mode');
    this._nodes.status.innerHTML = '<span class="lp-goed-tekst">✦ ' + label + ' open — volgende slot</span>';
    this._nodes.slot.classList.add('lp-slot-open');
    this._timer = setTimeout(function () {
      self._nodes.status.classList.remove('lp-goed-mode');
      self._nodes.slot.classList.remove('lp-slot-open');
      self._nodes.status.innerHTML =
        '<span class="lp-naam">' + ((t.naam || 'De haak') + ' — ') + '</span>' +
        '<span class="lp-status-tekst">' + (t.instructie || 'zet elke pin op de schaarlijn') + '</span>';
      self._nodes.statusTekst = self._nodes.status.querySelector('.lp-status-tekst');
      self._laadSlot(s.slotIdx + 1);
    }, 1400);
  };
  Lockpick.prototype._winnen = function () {
    this._stopLoop(); this._toonScreen('win');
    try { this.onWin(); } catch (e) { console.error('Lockpick onWin:', e); }
  };

  // ─── Overlay / herstel ───────────────────────────────────────────
  Lockpick.prototype._overlay = function (tekst) {
    var s = this._state; s.bevroren = true;
    if (this._nodes.haakSway) this._nodes.haakSway.style.animationPlayState = 'paused';
    this._nodes.slot.classList.add('lp-klem-mode');
    this._nodes.status.classList.add('lp-klem-mode');
    this._nodes.status.innerHTML = '<span class="lp-klem-tekst">' + tekst + '</span>';
  };
  Lockpick.prototype._herstelVisueel = function () {
    var t = this.config.teksten || {};
    if (this._nodes.haakSway) this._nodes.haakSway.style.animationPlayState = '';
    this._nodes.slot.classList.remove('lp-klem-mode');
    this._nodes.status.classList.remove('lp-klem-mode');
    this._nodes.status.innerHTML =
      '<span class="lp-naam">' + ((t.naam || 'De haak') + ' — ') + '</span>' +
      '<span class="lp-status-tekst">' + (t.instructie || 'zet elke pin op de schaarlijn') + '</span>';
    this._nodes.statusTekst = this._nodes.status.querySelector('.lp-status-tekst');
  };
  Lockpick.prototype._herstel = function () {
    var s = this._state; s.bevroren = false; s.cycleStart = performance.now();
    this._herstelVisueel(); this._bouwSlot(); this._bouwPinnen(); this._zetActieveZone();
  };

  // ─── Slot-visual (pin-kolommen + haak) ───────────────────────────
  Lockpick.prototype._bouwSlot = function () {
    var self = this, n = this._pins.length, slot = this._nodes.slot;
    slot.innerHTML = '';
    this._trackNodes = [];
    var tracks = el('div', { class: 'lp-tracks' });
    for (var i = 0; i < n; i++) {
      var band  = el('div', { class: 'lp-band' });
      var tick  = el('div', { class: 'lp-tick' });
      var token = el('div', { class: 'lp-pin' });
      var track = el('div', { class: 'lp-track' }, [band, tick, token]);
      tracks.appendChild(track);
      this._trackNodes.push({ track: track, band: band, tick: tick, token: token });
    }
    slot.appendChild(tracks);
    slot.appendChild(el('div', { class: 'lp-schaar' }));           // schaarlijn-decor
    slot.appendChild(el('div', { class: 'lp-keyway' }));           // sleutelgat-decor
    // zet reeds gezette pinnen + ruststand
    for (var j = 0; j < n; j++) {
      if (this._state.gezet[j] != null) this._zetToken(j, this._state.gezet[j], true);
      else this._zetToken(j, 0, false);
    }
    this._zetActieveZone();
  };
  Lockpick.prototype._zetToken = function (i, hoogte, gezet) {
    var tn = this._trackNodes[i]; if (!tn) return;
    tn.token.style.bottom = (hoogte * 90) + '%';
    tn.token.classList.toggle('lp-gezet', !!gezet);
  };
  Lockpick.prototype._zetActieveZone = function () {
    var s = this._state, n = this._pins.length;
    for (var i = 0; i < n; i++) {
      var tn = this._trackNodes[i]; if (!tn) continue;
      var actief = i === s.pinIdx && s.gezet[i] == null;
      tn.track.classList.toggle('lp-actief', actief);
      var doel = this._pins[i], lo = clamp(doel - this._band / 2, 0, 1), hi = clamp(doel + this._band / 2, 0, 1);
      tn.band.style.bottom = (lo * 90) + '%';
      tn.band.style.height = ((hi - lo) * 90) + '%';
      tn.tick.style.bottom = (doel * 90) + '%';
    }
  };
  Lockpick.prototype._updateActief = function (pos) {
    var s = this._state, i = s.pinIdx, tn = this._trackNodes[i];
    if (tn && s.gezet[i] == null) tn.token.style.bottom = (pos * 90) + '%';
    // De haak is losgekoppeld van de meter: hij staat vast (zie _plaatsHaak).
  };

  // Plaats de vaste haak zo dat de punt in het slot steekt (vaste referentie,
  // NIET de actieve pin). Aangeroepen na (her)bouw van het slot en bij resize.
  Lockpick.prototype._plaatsHaak = function () {
    var haak = this._nodes.haak, slot = this._nodes.slot;
    if (!haak || !slot) return;
    var H = slot.clientHeight || 190, W = slot.clientWidth || 300;
    var keyway = 42, trackTop = 8, trackH = Math.max(1, H - trackTop - keyway);
    var refPos = 0.55;                                  // vaste hoogte, midden-ish
    var pinPx = keyway + refPos * 0.9 * trackH;
    var cx = W * 0.60;                                   // iets rechts van het midden
    var tipX = slot.offsetLeft + cx, tipY = slot.offsetTop + (H - pinPx);
    var w = haak.offsetWidth || 230, h = haak.offsetHeight || 900;
    var ax = w * 0.5, ay = h * (12 / 470);              // apex-positie in het element
    haak.style.transformOrigin = ax + 'px ' + ay + 'px';
    haak.style.left = (tipX - ax) + 'px';
    haak.style.top = (tipY - ay) + 'px';
  };

  // ─── Pin-patroon (clue-rij) ──────────────────────────────────────
  Lockpick.prototype._bouwPinnen = function () {
    var p = this._nodes.patroon; if (!p) return;
    p.innerHTML = ''; var s = this._state;
    for (var i = 0; i < this._pins.length; i++) {
      var klaar = s.gezet[i] != null, actief = i === s.pinIdx && !klaar;
      var kolom = el('div', { class: 'lp-prof-kolom' + (actief ? ' lp-actief' : '') + (klaar ? ' lp-klaar' : '') });
      kolom.appendChild(el('div', { class: 'lp-prof-vul', style: { height: (this._pins[i] * 100) + '%' } }));
      p.appendChild(kolom);
    }
  };

  Lockpick.prototype._pasUiAf = function () {
    if (!this._nodes.root) return;
    this._nodes.root.classList.toggle('lp-zonder-zone', !this.toonZone);
    this._nodes.root.classList.toggle('lp-diehard', !!this.dieHard);
    this._nodes.timer = this._nodes.root.querySelector('.lp-timer');
  };
  Lockpick.prototype._updateReeksLabel = function () {
    if (!this._nodes.reeksLabel) return;
    var s = this._state, label = this._reeks[s.slotIdx].label || '';
    this._nodes.reeksLabel.innerHTML = 'Slot <strong>' + (s.slotIdx + 1) + '</strong> / ' + this._reeks.length +
      (label ? ' · <span class="lp-reeks-naam">' + label + '</span>' : '');
  };
  Lockpick.prototype._flash = function (soort) {
    var b = this._nodes.slot;
    b.classList.remove('lp-flash-goed', 'lp-flash-laag'); void b.offsetWidth;
    b.classList.add(soort === 'goed' ? 'lp-flash-goed' : 'lp-flash-laag');
  };
  Lockpick.prototype._tijdelijkeStatus = function (tekst) {
    var st = this._nodes.statusTekst; if (!st) return;
    var orig = st.dataset.vast || st.textContent; st.dataset.vast = orig;
    st.textContent = tekst; var self = this; clearTimeout(this._statusTimer);
    this._statusTimer = setTimeout(function () { if (self._nodes.statusTekst) self._nodes.statusTekst.textContent = orig; }, 1000);
  };

  // ─── Schermen / modus / intro ────────────────────────────────────
  Lockpick.prototype._toonScreen = function (name) {
    var sc = this._nodes.screens;
    Object.keys(sc).forEach(function (k) { sc[k].classList.remove('lp-active'); });
    sc[name].classList.add('lp-active'); window.scrollTo(0, 0);
  };
  Lockpick.prototype._kiesModus = function (modus) {
    this.modus = modus; this._pasModusAf(); this._pasUiAf(); this._laadSlot(0); this._toonStart();
  };
  Lockpick.prototype._toonStart = function () {
    this._toonScreen('start');
    var t = this.config.teksten || {}, startBtn = this._nodes.startBtn;
    if (!this._introGestart && t.intro && t.intro.length) {
      this._introGestart = true;
      this._toonDialog(this._nodes.startSceneImg, t.intro, function () { if (startBtn) startBtn.style.display = ''; });
    } else if (startBtn) startBtn.style.display = '';
  };
  Lockpick.prototype._maakCompactHeader = function () {
    var self = this, children = [];
    if (this.onExit) children.push(el('button', { class: 'lp-back-btn', text: '← Terug', onclick: function () { self.onExit(); } }));
    children.push(el('div', { class: 'lp-header-sep' }));
    return el('div', { class: 'lp-header' }, children);
  };
  Lockpick.prototype._toonDialog = function (sceneEl, lines, onComplete) {
    if (!sceneEl || !lines || !lines.length) { if (onComplete) onComplete(); return; }
    var idx = 0;
    var spreker = el('div', { class: 'lp-dialog-spreker' });
    var tekst   = el('div', { class: 'lp-dialog-tekst' });
    var body    = el('div', { class: 'lp-dialog-body' }, [spreker, tekst]);
    var verderBtn = el('button', { class: 'lp-dialog-verder', title: 'Verder',
      onclick: function (e) { e.preventDefault(); e.stopPropagation(); volgende(); } }, [
      el('span', { class: 'lp-verder-ornament', text: '❧' }), el('span', { class: 'lp-verder-label', text: 'Verder' }) ]);
    var dialog = el('div', { class: 'lp-dialog' }, [body, verderBtn]);
    if (sceneEl.parentNode) sceneEl.parentNode.insertBefore(dialog, sceneEl.nextSibling);
    function toonRegel(i) {
      var r = lines[i], sp = '', tx = '';
      if (typeof r === 'string') tx = r; else if (r && typeof r === 'object') { sp = r.spreker || ''; tx = r.tekst || ''; }
      if (sp) { spreker.textContent = sp; spreker.style.display = ''; } else spreker.style.display = 'none';
      tekst.textContent = tx; tekst.style.animation = 'none'; void tekst.offsetWidth; tekst.style.animation = '';
    }
    function volgende() { idx++; if (idx >= lines.length) { if (dialog.parentNode) dialog.parentNode.removeChild(dialog); if (onComplete) onComplete(); return; } toonRegel(idx); }
    toonRegel(0);
  };
  // ─── Audio: whistle-loop + drops/mes op instelbaar interval + klik ─
  Lockpick.prototype._laadAudio = function () {
    if (typeof Audio === 'undefined') return;
    var a = this.audioCfg, self = this;
    ['drops', 'mes', 'whistle', 'klik'].forEach(function (naam) {
      if (a[naam]) { try { var au = new Audio(a[naam]); au.preload = 'auto'; self._audio[naam] = au; } catch (e) {} }
    });
    if (this._audio.whistle) this._audio.whistle.loop = true;   // alleen whistle loopt
  };
  Lockpick.prototype._startGeluid = function () {
    if (this._audio.whistle) { this._audio.whistle.volume = this._vol.whistle; var p = this._audio.whistle.play(); if (p && p.catch) p.catch(function () {}); }
    this._planInterval('drops'); this._planInterval('mes');
  };
  Lockpick.prototype._planInterval = function (naam) {
    if (!this._audio[naam]) return;
    clearTimeout(this._itimers[naam]);
    var basis = Math.max(300, this._interval[naam] || 5000);
    var jit = 1 + (Math.random() * 2 - 1) * this._jitter;
    var wacht = Math.max(250, basis * jit);
    var self = this;
    this._itimers[naam] = setTimeout(function () { self._speelEen(naam); self._planInterval(naam); }, wacht);
  };
  Lockpick.prototype._speelEen = function (naam) {
    var au = this._audio[naam]; if (!au) return;
    try { var k = au.cloneNode(); k.volume = this._vol[naam]; var p = k.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  };
  Lockpick.prototype._klik = function () { this._speelEen('klik'); };
  Lockpick.prototype._stopAudio = function () {
    var self = this;
    clearTimeout(this._itimers.drops); clearTimeout(this._itimers.mes);
    Object.keys(this._audio).forEach(function (k) { try { self._audio[k].pause(); } catch (e) {} });
  };
  Lockpick.prototype.setVolume = function (naam, v) {
    this._vol[naam] = clamp(v, 0, 1);
    if (naam === 'whistle' && this._audio.whistle) this._audio.whistle.volume = this._vol.whistle;
  };
  Lockpick.prototype.setIntervalMs = function (naam, ms) {
    this._interval[naam] = Math.max(300, ms);
    this._planInterval(naam);
  };

  Lockpick.prototype._startMuziek = function () {
    var audio = this._nodes.audio, btn = this._nodes.musicBtn; if (!audio) return;
    audio.volume = 0.5; var p = audio.play(); if (p && p.catch) p.catch(function () {}); if (btn) btn.classList.remove('lp-muted');
  };
  Lockpick.prototype.toggleMusic = function () {
    var audio = this._nodes.audio, btn = this._nodes.musicBtn; if (!audio) return;
    if (audio.paused) { audio.play().catch(function () {}); btn.classList.remove('lp-muted'); }
    else { audio.pause(); btn.classList.add('lp-muted'); }
  };

  // ─── Fouten-indicator (links) + sfeer-plaatsing ──────────────────
  Lockpick.prototype._updateFouten = function () {
    if (!this._nodes.foutDots) return;
    for (var i = 0; i < this._nodes.foutDots.length; i++)
      this._nodes.foutDots[i].classList.toggle('lp-vol', i < this._state.fouten);
  };
  Lockpick.prototype._plaatsSfeer = function () {
    var slot = this._nodes.slot; if (!slot) return;
    var cy = slot.offsetTop + slot.clientHeight / 2;
    var feel = this._nodes.feel;
    if (feel) feel.style.top = (cy - feel.offsetHeight / 2) + 'px';
    var fb = this._nodes.foutenBox;
    if (fb) {
      fb.style.top = (cy - fb.offsetHeight / 2) + 'px';
      fb.style.left = Math.max(2, slot.offsetLeft - fb.offsetWidth - 12) + 'px';
    }
  };

  global.Lockpick = Lockpick;
})(window);
