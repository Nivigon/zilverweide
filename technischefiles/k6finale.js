/* ══════════════════════════════════════════════════════════════════
   K6-FINALE (eindscene Kraaienkwartier, module), fase 1
   ------------------------------------------------------------------
   Fase 1 uit het bouwvoorstel: een zwart scherm, de eerste still van
   de heks op de rug links in beeld, het tikgeluid eronder, en een heel
   langzame doordrift zodat het beeld niet bevriest. Meer niet: geen
   tekst, geen beweging, geen tweede beeld. Latere fases bouwen hierop
   voort binnen dezelfde module.

   Publieke API (zelfde geest als WoudScene):
     var scene = new K6Finale(container[, opts]);
     scene.start();                 // bouwt en start de scene
     scene.replay();                // stop en begin opnieuw
     scene.set('figuur.x', 30);     // live instelling wijzigen (dot-pad)
     scene.getConfig();             // huidige config (diepe kopie)
     scene.destroy();               // timers/geluid/DOM opruimen

   container : DOM-element of selector. De scene zelf is
               position:absolute;inset:0 binnen die container
               (position:relative wordt gezet als dat nog niet zo is).
   opts      : diepe override van DEFAULTS hieronder. Ontbrekende
               velden vallen terug op de standaardwaarden.

   Placeholders: het beeld wordt vooraf geprobeerd te laden (Image met
   onload/onerror, nooit een reject die iets blokkeert). Lukt het niet,
   dan komt er een effen donker vlak met de bestandsnaam erop in de
   plaats, en draait de scene gewoon door met correcte timing. Een
   ontbrekend geluidsbestand betekent gewoon stilte, precies zoals bij
   WoudScene en Regen/Bliksem elders in dit project.
   ══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var DEFAULTS = {
    images: {
      // Nog aan te leveren: de heks volledig op de rug, png met
      // transparante achtergrond (zie het bouwvoorstel, hoofdstuk 4).
      heksRug: 'locaties/kraaienkwartier/k6-heks-rug.png'
    },
    audio: {
      // Nog aan te leveren: het tikgeluid, droog en dichtbij, zonder
      // galm. Loopt onder de hele scene door.
      tik: 'geluid/k6finale/k6-tik.mp3'
    },
    volumes: {
      tik: 0.5
    },
    // De figuur: positie en maat als fractie/percentage van de stage,
    // zodat het op tablet en laptop hetzelfde beeld geeft.
    figuur: {
      x: 30,            // % horizontaal, middelpunt van de figuur (links in beeld)
      y: 58,            // % verticaal, middelpunt van de figuur
      schaal: 0.85,     // hoogte van de figuur als fractie van de stage-hoogte
      helderheid: 0.55  // filter: brightness(); donker genoeg dat je moeite moet doen
    },
    // De doordrift: nauwelijks merkbaar, alleen genoeg om te voelen dat
    // het beeld leeft. Twee sinusgolven met ongelijke periodes (de
    // tweede loopt op duur maal 1.37), zodat de baan nooit zichtbaar
    // herhaalt.
    drift: {
      afstand: 5,       // px maximale uitwijking
      duur: 18000       // ms voor een volledige golf
    }
  };

  // ── Kleine hulpjes (zelfde patronen als woudscene.js) ───────────
  function diepeKopie(v) { return JSON.parse(JSON.stringify(v)); }

  function diepeMerge(basis, over) {
    var uit = diepeKopie(basis);
    if (!over) return uit;
    Object.keys(over).forEach(function (k) {
      var bv = basis ? basis[k] : undefined;
      var ov = over[k];
      if (ov && typeof ov === 'object' && !Array.isArray(ov) && bv && typeof bv === 'object' && !Array.isArray(bv)) {
        uit[k] = diepeMerge(bv, ov);
      } else {
        uit[k] = ov;
      }
    });
    return uit;
  }

  // Palet voor placeholder-vlakken; kleur op basis van de bestandsnaam,
  // zodat hetzelfde ontbrekende bestand altijd dezelfde kleur krijgt.
  var PLACEHOLDER_PALET = ['#2c3b2e', '#3a2c2c', '#2c2f3b', '#3b342c', '#332c3b', '#2c3b37'];
  function placeholderKleur(naam) {
    var h = 0;
    for (var i = 0; i < naam.length; i++) h = (h * 31 + naam.charCodeAt(i)) >>> 0;
    return PLACEHOLDER_PALET[h % PLACEHOLDER_PALET.length];
  }

  function K6Finale(container, opts) {
    this.container = (typeof container === 'string') ? document.querySelector(container) : container;
    this.config = diepeMerge(DEFAULTS, opts || {});
    this.el = null;            // root-element van de scene
    this._figuurWrap = null;   // gepositioneerde laag (positie + schaal)
    this._figuurEl = null;     // het img-element of het placeholder-vlak
    this._audio = {};          // key naar Audio-instantie (persistent, geen vroege GC)
    this._audioOk = {};        // key naar boolean: bestand bestaat en is afspeelbaar
    this._rafId = null;
    this._driftStart = 0;
    this._running = false;
  }

  // ── Laden met terugval ──────────────────────────────────────────
  // Resolven altijd, nooit rejecten: een ontbrekend bestand mag de
  // scene niet breken.
  K6Finale.prototype._laadBeeld = function (src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(true); };
      img.onerror = function () { resolve(false); };
      img.src = src;
    });
  };

  K6Finale.prototype._maakAudio = function (key, src) {
    var self = this;
    var a = new Audio();
    self._audio[key] = a;
    self._audioOk[key] = false;
    a.addEventListener('loadedmetadata', function () { self._audioOk[key] = true; });
    a.addEventListener('error', function () { self._audioOk[key] = false; });
    a.src = src;
    a.preload = 'auto';
    return a;
  };

  // ── Opbouw ──────────────────────────────────────────────────────
  K6Finale.prototype._build = function () {
    if (this.el) return;
    var stijl = getComputedStyle(this.container);
    if (stijl.position === 'static') this.container.style.position = 'relative';

    this.el = document.createElement('div');
    this.el.className = 'k6-scene';

    this._figuurWrap = document.createElement('div');
    this._figuurWrap.className = 'k6-figuur-wrap';
    this.el.appendChild(this._figuurWrap);

    this.container.appendChild(this.el);
  };

  K6Finale.prototype._toonFiguur = function (geladen) {
    var src = this.config.images.heksRug;
    this._figuurWrap.innerHTML = '';
    if (geladen) {
      var img = document.createElement('img');
      img.className = 'k6-figuur';
      img.src = src;
      img.alt = '';
      img.draggable = false;
      this._figuurEl = img;
    } else {
      var vlak = document.createElement('div');
      vlak.className = 'k6-placeholder';
      vlak.style.background = placeholderKleur(src);
      vlak.textContent = src.split('/').pop();
      this._figuurEl = vlak;
    }
    this._figuurWrap.appendChild(this._figuurEl);
    this._pasFiguurToe();
  };

  // Positie, schaal en helderheid uit de config op de DOM zetten. Wordt
  // ook live aangeroepen vanuit set(), zodat het debugpaneel direct
  // effect heeft.
  K6Finale.prototype._pasFiguurToe = function () {
    if (!this._figuurWrap) return;
    var f = this.config.figuur;
    this._figuurWrap.style.left = f.x + '%';
    this._figuurWrap.style.top = f.y + '%';
    this._figuurWrap.style.height = (f.schaal * 100) + '%';
    if (this._figuurEl) this._figuurEl.style.filter = 'brightness(' + f.helderheid + ')';
  };

  // ── De doordrift ────────────────────────────────────────────────
  // rAF-lus die de wrap een minieme translate geeft bovenop zijn
  // positionering. De basis-translate(-50%,-50%) centreert de figuur op
  // het (x,y)-punt; de drift komt daar als px-verschuiving overheen.
  K6Finale.prototype._driftLus = function () {
    var self = this;
    function stap(nu) {
      if (!self._running) return;
      var d = self.config.drift;
      var t = nu - self._driftStart;
      var dx = 0, dy = 0;
      if (d.afstand > 0 && d.duur > 0) {
        dx = Math.sin(t * 2 * Math.PI / d.duur) * d.afstand;
        dy = Math.sin(t * 2 * Math.PI / (d.duur * 1.37) + 1.2) * d.afstand * 0.6;
      }
      self._figuurWrap.style.transform =
        'translate(-50%, -50%) translate(' + dx.toFixed(2) + 'px, ' + dy.toFixed(2) + 'px)';
      self._rafId = requestAnimationFrame(stap);
    }
    this._driftStart = performance.now();
    this._rafId = requestAnimationFrame(stap);
  };

  // ── Publieke API ────────────────────────────────────────────────
  K6Finale.prototype.start = function () {
    var self = this;
    if (self._running) return;
    self._running = true;
    self._build();

    self._laadBeeld(self.config.images.heksRug).then(function (geladen) {
      if (!self._running) return;
      self._toonFiguur(geladen);
    });

    var tik = self._audio.tik || self._maakAudio('tik', self.config.audio.tik);
    tik.loop = true;
    tik.volume = self.config.volumes.tik;
    tik.currentTime = 0;
    var p = tik.play();
    if (p && p.catch) p.catch(function () { /* geen gebaar of bestand ontbreekt: stilte */ });

    self._driftLus();
  };

  K6Finale.prototype.replay = function () {
    this.stop();
    this.start();
  };

  K6Finale.prototype.stop = function () {
    this._running = false;
    if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
    var audio = this._audio;
    Object.keys(audio).forEach(function (k) { audio[k].pause(); });
  };

  K6Finale.prototype.set = function (pad, waarde) {
    var delen = pad.split('.');
    var obj = this.config;
    for (var i = 0; i < delen.length - 1; i++) obj = obj[delen[i]];
    obj[delen[delen.length - 1]] = waarde;
    this._pasFiguurToe();
    if (this._audio.tik) this._audio.tik.volume = this.config.volumes.tik;
  };

  K6Finale.prototype.getConfig = function () {
    return diepeKopie(this.config);
  };

  K6Finale.prototype.destroy = function () {
    this.stop();
    this._audio = {};
    this._audioOk = {};
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
    this._figuurWrap = null;
    this._figuurEl = null;
  };

  global.K6Finale = K6Finale;
})(window);
