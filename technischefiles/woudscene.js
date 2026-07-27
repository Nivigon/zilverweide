/* ══════════════════════════════════════════════════════════════════
   WOUDSCENE (filmische aanloop/aankomst/draai-sequentie, module)
   ------------------------------------------------------------------
   Publieke API:
     var scene = new WoudScene(container[, opts]);
     scene.start(onKlaar);      // start bij deel 1, roept onKlaar aan na deel 3
     scene.goTo(1|2|3);         // spring direct naar een deel (voor debug/demo)
     scene.replay(onKlaar);     // stop de huidige loop en begin opnieuw
     scene.set('deel2.panAfstand', 30);   // live instelling wijzigen (dot-pad)
     scene.getConfig();         // huidige config (diepe kopie), voor het debugpaneel
     scene.destroy();           // alle timers/geluid/DOM opruimen

   container : DOM-element of selector. Wordt volledig gevuld (position:
               relative wordt gezet als dat nog niet zo is); de scène zelf
               is position:absolute;inset:0 binnen die container.
   opts      : diepe override van DEFAULTS hieronder (images/audio/volumes/
               deel1/deel2/deel3). Ontbrekende velden vallen terug op de
               standaardwaarden.

   Deel 4 (dialoog) valt buiten deze module: na deel 3 blijft beeld a3
   gewoon staan en wordt onKlaar aangeroepen, zonder naar zwart te gaan.

   Placeholders: elk beeld wordt vooraf geprobeerd te laden (Image met
   onload/onerror, nooit een reject die de sequentie blokkeert). Lukt het
   niet, dan komt er een effen gekleurd vlak met de bestandsnaam erop in
   de plaats, en draait de scène gewoon door met correcte timing. Geluid
   heeft geen aparte placeholder nodig: een falende Audio.play() faalt
   altijd stil (try/catch + promise-catch), dus ontbrekend geluid is
   gewoon stilte, precies zoals bij Regen/Bliksem elders in dit project.
   ══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var DEFAULTS = {
    images: {
      bos: [
        'locaties/dorendael/ws-bos-1.jpg',
        'locaties/dorendael/ws-bos-2.jpg',
        'locaties/dorendael/ws-bos-3.jpg'
      ],
      spook: [
        'locaties/dorendael/ws-spook-1.png',
        'locaties/dorendael/ws-spook-2.png'
      ],
      a0: 'locaties/dorendael/ws-a0.jpg',
      a1: 'locaties/dorendael/ws-a1.jpg',
      a3: 'locaties/dorendael/ws-a3.jpg',
      b0: 'locaties/dorendael/ws-b0.jpg',
      b1: 'locaties/dorendael/ws-b1.jpg'
    },
    audio: {
      muziek:   'geluid/doolhof/ws-muziek.mp3',
      geritsel: ['geluid/doolhof/ws-geritsel-1.mp3', 'geluid/doolhof/ws-geritsel-2.mp3'],
      fluister: ['geluid/doolhof/ws-fluister-1.mp3', 'geluid/doolhof/ws-fluister-2.mp3'],
      adem:     'geluid/doolhof/ws-adem.mp3',
      zwelling: 'geluid/doolhof/ws-zwelling.mp3',
      draai:    'geluid/doolhof/ws-draai.mp3'
    },
    volumes: {
      muziek: 0.5,
      geritsel: 0.6,
      fluister: 0.7,
      adem: 0.35,
      zwelling: 0.5,
      draai: 0.4
    },
    // Deel 1: aanloop door het donkere bos.
    deel1: {
      duurMin: 18000, duurMax: 25000,     // richtduur van heel deel 1
      crossfadeDuur: 2200,                // overvloeiing tussen de 3 bosbeelden
      driftSchaal: 1.06,                  // minieme continue in/uit-drift per beeld
      driftDuur: 9000,
      spookAantalMin: 2, spookAantalMax: 3,
      spookDekking: 0.08,                 // 0..1, opacity-plafond van een spookvorm
      spookZichtDuur: 1600,               // totale zichtbare tijd incl. in/uit-faden
      muziekFadeIn: 800
    },
    // Deel 2: aankomst op het veld.
    deel2: {
      muziekFadeOutDuur: 3000,
      schaal: 1.25,                       // zoomfactor waarbinnen gepand wordt
      panAfstand: 22,                     // % van de beeldbreedte, links/rechts
      panDuurHeen: 900,                   // snel starten
      panDuurTerug: 1100,                 // lang uitdempen (met licht doorschieten)
      terugDuur: 1000,                    // rustiger dan de heenweg
      blurPan: 6,                         // px bewegingsonscherpte tijdens het pannen
      holdRust: 2000,                     // 1. rust op het lege veld
      holdLinks: 1500,                    // 4. vasthouden na pan naar links
      holdRechts: 1500,                   // 7. vasthouden na pan naar rechts
      holdHeks1: 3000                     // 10. vasthouden nadat heks 1 er blijkt te staan
    },
    // Deel 3: de draai-sequentie.
    deel3: {
      draaiDuur: 350,                     // 0,35s, de meeste omdraaiingen
      draaiDuurRustig: 900,               // de laatste, rustige terugdraai naar a3
      blurDraai: 14,                      // px onscherpte tijdens een schrik-omdraaiing
      blurDraaiRustig: 4,                 // px onscherpte tijdens de rustige terugdraai
      holdB1: 2500,                       // na omdraaien naar heks 2 (dichtbij)
      holdA0Leeg: 2500,                   // na omdraaien terug, heks 1 is weg
      holdB0Stilte: 3000,                 // na omdraaien naar leeg (volledige stilte)
      holdA3Eind: 4000,                   // na de rustige terugdraai, alle drie de heksen
      zwellingVertraging: 1500            // na de onthulling van b1, voor de lage zwelling
    }
  };

  // ── Kleine hulpjes ──────────────────────────────────────────────
  function rand(a, b) { return Math.random() * (b - a) + a; }
  function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
  function kies(arr) { return arr[randInt(0, arr.length - 1)]; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // Diepe merge: opts overschrijft alleen de velden die het zelf heeft,
  // de rest komt uit DEFAULTS. Voorkomt dat een gedeeltelijke override
  // (bv. alleen deel2.panAfstand) de rest van dat blok wist.
  function diepeMerge(basis, over) {
    var uit = Array.isArray(basis) ? basis.slice() : Object.assign({}, basis);
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

  function diepeKopie(v) { return JSON.parse(JSON.stringify(v)); }

  // Palet voor placeholder-vlakken; kleur wordt gekozen op basis van de
  // bestandsnaam, zodat dezelfde ontbrekende afbeelding altijd dezelfde
  // kleur krijgt (handig bij het herkennen tijdens het timen).
  var PLACEHOLDER_PALET = ['#2c3b2e', '#3a2c2c', '#2c2f3b', '#3b342c', '#332c3b', '#2c3b37'];
  function placeholderKleur(naam) {
    var h = 0;
    for (var i = 0; i < naam.length; i++) h = (h * 31 + naam.charCodeAt(i)) >>> 0;
    return PLACEHOLDER_PALET[h % PLACEHOLDER_PALET.length];
  }

  function WoudScene(container, opts) {
    this.container = (typeof container === 'string') ? document.querySelector(container) : container;
    this.config = diepeMerge(DEFAULTS, opts || {});
    this.el = null;               // root-element van de scène
    this._laagA = null;           // onderste beeld-laag
    this._laagB = null;           // bovenste beeld-laag (voor crossfade/wissel)
    this._spookLaag = null;       // laag voor de vage heksvormen in deel 1
    this._running = false;
    this._gestopt = true;         // true na destroy() of vóór start()
    this._timers = [];
    this._audio = {};              // key → Audio-instantie (persistent, geen vroege GC)
    this._beeldStatus = {};        // src → true (geladen) / false (placeholder)
    this._huidigDeel = 0;
    this._onKlaar = null;
  }

  // ── Voorladen ───────────────────────────────────────────────────
  // Probeert elke afbeelding te laden; onthoudt alleen of het lukte.
  // Rejecteert nooit: een ontbrekend bestand mag de scène niet blokkeren.
  WoudScene.prototype._laadBeeld = function (src) {
    var self = this;
    return new Promise(function (resolve) {
      if (self._beeldStatus.hasOwnProperty(src)) { resolve(); return; }
      var img = new Image();
      img.onload = function () { self._beeldStatus[src] = true; resolve(); };
      img.onerror = function () { self._beeldStatus[src] = false; resolve(); };
      img.src = src;
    });
  };

  WoudScene.prototype._alleBeeldPaden = function () {
    var im = this.config.images;
    return [].concat(im.bos, im.spook, [im.a0, im.a1, im.a3, im.b0, im.b1]);
  };

  WoudScene.prototype._voorladen = function (cb) {
    var self = this;
    var paden = this._alleBeeldPaden();
    Promise.all(paden.map(function (src) { return self._laadBeeld(src); })).then(function () {
      if (typeof cb === 'function') cb();
    });
  };

  // ── DOM opbouwen ────────────────────────────────────────────────
  WoudScene.prototype._build = function () {
    if (this.el || !this.container) return;
    if (getComputedStyle(this.container).position === 'static') {
      this.container.style.position = 'relative';
    }
    var el = document.createElement('div');
    el.className = 'ws-root';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="ws-laag ws-laag-a"></div>' +
      '<div class="ws-laag ws-laag-b"></div>' +
      '<div class="ws-spooklaag"></div>';
    this.container.appendChild(el);
    this.el = el;
    this._laagA = el.querySelector('.ws-laag-a');
    this._laagB = el.querySelector('.ws-laag-b');
    this._spookLaag = el.querySelector('.ws-spooklaag');
  };

  // Vult een laag-element met óf de echte afbeelding, óf een placeholder-
  // vlak met de bestandsnaam erop. Retourneert het binnenste beeld-element
  // (waarop transform/blur voor pan/zoom wordt toegepast).
  WoudScene.prototype._vulLaag = function (laagEl, src) {
    laagEl.innerHTML = '';
    var beeld = document.createElement('div');
    beeld.className = 'ws-beeld';
    if (this._beeldStatus[src]) {
      beeld.style.backgroundImage = 'url("' + src + '")';
    } else {
      var naam = src.split('/').pop();
      beeld.classList.add('ws-beeld-placeholder');
      beeld.style.background = placeholderKleur(src);
      beeld.textContent = '[Placeholder: ' + naam + ']';
    }
    laagEl.appendChild(beeld);
    return beeld;
  };

  // ── Geluid ──────────────────────────────────────────────────────
  // Eén persistente Audio-instantie per laag (geen losse `new Audio()`
  // zonder referentie): voorkomt dat de browser 'm halverwege opruimt
  // voor het afspelen klaar is.
  WoudScene.prototype._speel = function (key, src, opts) {
    opts = opts || {};
    var vol = (opts.volume != null) ? opts.volume : (this.config.volumes[key] || 0.5);
    try {
      var a = new Audio(src);
      a.volume = clamp(vol, 0, 1);
      a.loop = !!opts.loop;
      this._audio[key + '_' + (opts.slot || 0)] = a;
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
      return a;
    } catch (e) { return null; }
  };

  WoudScene.prototype._faadUit = function (audioEl, duurMs) {
    if (!audioEl) return;
    var stapTijd = 60;
    var stappen = Math.max(1, Math.round(duurMs / stapTijd));
    var startVol = audioEl.volume;
    var i = 0;
    var timer = setInterval(function () {
      i++;
      audioEl.volume = Math.max(0, startVol * (1 - i / stappen));
      if (i >= stappen) {
        clearInterval(timer);
        try { audioEl.pause(); } catch (e) {}
      }
    }, stapTijd);
    this._timers.push(timer);
  };

  WoudScene.prototype._setTimeout = function (fn, ms) {
    var self = this;
    var id = setTimeout(function () {
      self._timers = self._timers.filter(function (t) { return t !== id; });
      if (self._gestopt) return;
      fn();
    }, ms);
    this._timers.push(id);
    return id;
  };

  WoudScene.prototype._alleTimersWissen = function () {
    this._timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
    this._timers = [];
  };

  // ── Publieke API ────────────────────────────────────────────────
  WoudScene.prototype.start = function (onKlaar) {
    var self = this;
    this._onKlaar = onKlaar;
    this._gestopt = false;
    this._running = true;
    this._build();
    this._voorladen(function () {
      if (self._gestopt) return;
      self._deel1();
    });
    return this;
  };

  WoudScene.prototype.replay = function (onKlaar) {
    this._alleTimersWissen();
    this._stopAlleAudio();
    this._gestopt = false;
    return this.start(onKlaar || this._onKlaar);
  };

  // Voor de demo/debugpaneel: spring direct naar een deel, met voorladen
  // als dat nog niet gebeurd is. Start geen vorig deel opnieuw op.
  WoudScene.prototype.goTo = function (deel, onKlaar) {
    var self = this;
    this._alleTimersWissen();
    this._stopAlleAudio();
    this._onKlaar = onKlaar || this._onKlaar;
    this._gestopt = false;
    this._running = true;
    this._build();
    this._voorladen(function () {
      if (self._gestopt) return;
      if (deel <= 1) self._deel1();
      else if (deel === 2) self._deel2();
      else self._deel3();
    });
    return this;
  };

  WoudScene.prototype.set = function (pad, waarde) {
    var delen = pad.split('.');
    var obj = this.config;
    for (var i = 0; i < delen.length - 1; i++) {
      if (!obj[delen[i]]) return this;
      obj = obj[delen[i]];
    }
    obj[delen[delen.length - 1]] = waarde;
    return this;
  };

  WoudScene.prototype.getConfig = function () {
    return diepeKopie(this.config);
  };

  WoudScene.prototype._stopAlleAudio = function () {
    Object.keys(this._audio).forEach(function (k) {
      var a = this._audio[k];
      if (!a) return;
      try { a.pause(); } catch (e) {}
    }, this);
    this._audio = {};
  };

  WoudScene.prototype.destroy = function () {
    this._gestopt = true;
    this._running = false;
    this._alleTimersWissen();
    this._stopAlleAudio();
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = this._laagA = this._laagB = this._spookLaag = null;
  };

  // ── Deel 1, aanloop door het donkere bos ──────────────────────
  WoudScene.prototype._deel1 = function () {
    this._huidigDeel = 1;
    var self = this;
    var cfg = this.config.deel1;
    var im = this.config.images.bos;

    var totaalDuur = rand(cfg.duurMin, cfg.duurMax);
    var perBeeld = totaalDuur / im.length;

    this._speel('muziek', this.config.audio.muziek, { volume: 0, loop: true });
    var muziekAudio = this._audio['muziek_0'];
    if (muziekAudio) this._faadIn(muziekAudio, this.config.volumes.muziek, cfg.muziekFadeIn);

    // Losse geritsel/fluister-achtige omgevingsgeluidjes, willekeurig
    // verspreid, puur sfeer, niet gesynchroniseerd met een beeldwissel.
    var aantalOmgevingsgeluiden = randInt(2, 3);
    for (var g = 0; g < aantalOmgevingsgeluiden; g++) {
      this._setTimeout(function () {
        self._speel('geritsel', kies(self.config.audio.geritsel));
      }, rand(0.15, 0.85) * totaalDuur);
    }

    // Beelden na elkaar met langzame overvloeiing + minieme drift.
    im.forEach(function (src, i) {
      self._setTimeout(function () {
        var laag = (i % 2 === 0) ? self._laagA : self._laagB;
        var ander = (i % 2 === 0) ? self._laagB : self._laagA;
        var beeld = self._vulLaag(laag, src);
        beeld.style.transition = 'none';
        beeld.style.transform = 'scale(1)';
        void beeld.offsetWidth;
        beeld.style.transition = 'transform ' + cfg.driftDuur + 'ms linear';
        beeld.style.transform = 'scale(' + cfg.driftSchaal + ')';
        laag.style.transition = 'opacity ' + cfg.crossfadeDuur + 'ms ease';
        laag.style.opacity = '1';
        ander.style.transition = 'opacity ' + cfg.crossfadeDuur + 'ms ease';
        ander.style.opacity = '0';
      }, i * perBeeld);
    });

    // Vage heksvormen: 2 of 3 keer, op willekeurige momenten (niet in de
    // eerste/laatste 10% van deel 1, zodat ze niet samenvallen met een
    // beeldwissel of de overgang naar deel 2).
    var aantalSpoken = randInt(cfg.spookAantalMin, cfg.spookAantalMax);
    for (var s = 0; s < aantalSpoken; s++) {
      this._setTimeout(function () {
        self._toonSpook();
      }, rand(0.15, 0.85) * totaalDuur);
    }

    this._setTimeout(function () { self._deel2(); }, totaalDuur);
  };

  WoudScene.prototype._faadIn = function (audioEl, doelVol, duurMs) {
    if (!audioEl) return;
    var stapTijd = 60;
    var stappen = Math.max(1, Math.round(duurMs / stapTijd));
    var i = 0;
    var timer = setInterval(function () {
      i++;
      audioEl.volume = clamp(doelVol * (i / stappen), 0, 1);
      if (i >= stappen) clearInterval(timer);
    }, stapTijd);
    this._timers.push(timer);
  };

  // Eén vage heksvorm: korte fade-in, hold, fade-out. Nooit in het midden,
  // altijd tegen een rand of tussen de "bomen" (dus in de buitenste 40%
  // van de breedte, willekeurig links of rechts).
  WoudScene.prototype._toonSpook = function () {
    if (!this._spookLaag) return;
    var cfg = this.config.deel1;
    var src = kies(this.config.images.spook);
    var el = document.createElement('div');
    el.className = 'ws-spook';
    if (this._beeldStatus[src]) {
      el.style.backgroundImage = 'url("' + src + '")';
    } else {
      el.classList.add('ws-beeld-placeholder');
      el.style.background = placeholderKleur(src);
    }
    var linksOfRechts = Math.random() < 0.5;
    var horizontaal = linksOfRechts ? rand(2, 18) : rand(82, 98);
    el.style.left = horizontaal + '%';
    el.style.top = rand(30, 75) + '%';
    el.style.setProperty('--ws-spook-dekking', cfg.spookDekking);
    var fadeDuur = Math.round(cfg.spookZichtDuur * 0.3);
    var holdDuur = Math.max(0, cfg.spookZichtDuur - fadeDuur * 2);
    el.style.transition = 'opacity ' + fadeDuur + 'ms ease';
    this._spookLaag.appendChild(el);
    void el.offsetWidth;
    el.style.opacity = 'var(--ws-spook-dekking)';
    var self = this;
    this._setTimeout(function () {
      el.style.opacity = '0';
      self._setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, fadeDuur);
    }, fadeDuur + holdDuur);
  };

  // ── Deel 2, aankomst op het veld ──────────────────────────────
  WoudScene.prototype._deel2 = function () {
    this._huidigDeel = 2;
    var self = this;
    var cfg = this.config.deel2;
    var im = this.config.images;

    // Muziek weg, lage adem-laag blijft over.
    var muziekAudio = this._audio['muziek_0'];
    if (muziekAudio) this._faadUit(muziekAudio, cfg.muziekFadeOutDuur);
    this._speel('adem', this.config.audio.adem, { volume: 0, loop: true });
    var ademAudio = this._audio['adem_0'];
    if (ademAudio) this._faadIn(ademAudio, this.config.volumes.adem, cfg.muziekFadeOutDuur);

    // Spooklaag opruimen: deel 1 se sfeer-elementen horen hier niet meer.
    if (this._spookLaag) this._spookLaag.innerHTML = '';

    var beeld = this._vulLaag(this._laagA, im.a0);
    this._laagA.style.transition = 'none';
    this._laagA.style.opacity = '1';
    this._laagB.style.transition = 'none';
    this._laagB.style.opacity = '0';
    beeld.style.transition = 'none';
    beeld.style.transform = 'scale(' + cfg.schaal + ') translateX(0%)';
    beeld.style.filter = 'blur(0px)';

    function pan(pctX, duur, metBlur, cb) {
      beeld.style.transition = 'transform ' + duur + 'ms cubic-bezier(.19,1,.22,1), filter ' + Math.min(duur, 260) + 'ms ease';
      if (metBlur) beeld.style.filter = 'blur(' + cfg.blurPan + 'px)';
      beeld.style.transform = 'scale(' + cfg.schaal + ') translateX(' + pctX + '%)';
      self._setTimeout(function () {
        beeld.style.transition = 'filter 260ms ease';
        beeld.style.filter = 'blur(0px)';
      }, Math.max(0, duur - 260));
      self._setTimeout(cb, duur);
    }

    this._setTimeout(function () {
      // 2. geritsel links, 3. pan naar links
      self._speel('geritsel', kies(self.config.audio.geritsel));
      pan(-cfg.panAfstand, cfg.panDuurHeen, true, function () {
        // 4. hold
        self._setTimeout(function () {
          // 5. terug naar midden
          pan(0, cfg.terugDuur, true, function () {
            // 6. geritsel rechts, 7. pan naar rechts
            self._speel('geritsel', kies(self.config.audio.geritsel));
            pan(cfg.panAfstand, cfg.panDuurHeen, true, function () {
              // 8. hold
              self._setTimeout(function () {
                // 9. terug naar midden, de wissel naar a1 (heks 1) gebeurt
                // tijdens déze terugdraai, onder de beweging/onscherpte.
                beeld.style.transition = 'transform ' + cfg.terugDuur + 'ms cubic-bezier(.19,1,.22,1), filter 260ms ease';
                beeld.style.filter = 'blur(' + cfg.blurPan + 'px)';
                self._setTimeout(function () {
                  var nieuw = self._vulLaag(self._laagA, im.a1);
                  nieuw.style.transition = 'none';
                  nieuw.style.transform = 'scale(' + cfg.schaal + ') translateX(0%)';
                  nieuw.style.filter = 'blur(' + cfg.blurPan + 'px)';
                  beeld = nieuw;
                  self._setTimeout(function () {
                    beeld.style.transition = 'filter 260ms ease';
                    beeld.style.filter = 'blur(0px)';
                  }, 20);
                }, cfg.terugDuur * 0.4);
                self._setTimeout(function () {
                  // 10. heks 1 staat er, geen geluid, meteen 3s vasthouden
                  self._setTimeout(function () { self._deel3(); }, cfg.holdHeks1);
                }, cfg.terugDuur);
              }, cfg.panDuurTerug);
            }, cfg.holdRechts);
          });
        }, cfg.panDuurTerug);
      }, cfg.holdLinks);
    }, cfg.holdRust);
  };

  // ── Deel 3, de draai-sequentie ────────────────────────────────
  WoudScene.prototype._deel3 = function () {
    this._huidigDeel = 3;
    var self = this;
    var cfg = this.config.deel3;
    var im = this.config.images;

    // Vanaf hier vlak, ongepand beeld: de laag die net actief was (a1,
    // met schaal/transform van deel 2) wordt hier gereset naar rust.
    var actief = (this._laagA.style.opacity !== '0') ? this._laagA : this._laagB;
    var beeld = actief.querySelector('.ws-beeld') || this._vulLaag(actief, im.a1);
    beeld.style.transition = 'none';
    beeld.style.transform = 'scale(1)';
    beeld.style.filter = 'blur(0px)';

    // Eén omdraaiing: kort blur-moment, wissel het beeld op het midden van
    // de beweging, laat de blur weer wegtrekken. Geen tussenbeelden nodig,
    // de veeg zelf dekt de wissel af.
    function draaiNaar(nieuweSrc, duur, blurPx, cb) {
      beeld.style.transition = 'filter ' + Math.round(duur / 2) + 'ms ease-in';
      beeld.style.filter = 'blur(' + blurPx + 'px)';
      self._setTimeout(function () {
        beeld = self._vulLaag(actief, nieuweSrc);
        beeld.style.transition = 'none';
        beeld.style.transform = 'scale(1)';
        beeld.style.filter = 'blur(' + blurPx + 'px)';
        void beeld.offsetWidth;
        beeld.style.transition = 'filter ' + Math.round(duur / 2) + 'ms ease-out';
        beeld.style.filter = 'blur(0px)';
      }, Math.round(duur / 2));
      self._setTimeout(cb, duur);
    }

    // 1. fluistering vlak achter de speler
    this._speel('fluister', kies(this.config.audio.fluister));

    this._setTimeout(function () {
      // 2. omdraaien naar heks 2, dichtbij
      draaiNaar(im.b1, cfg.draaiDuur, cfg.blurDraai, function () {
        // 3. hold, geen geluid bij onthulling; na ~1,5s een lage zwelling
        self._setTimeout(function () {
          self._speel('zwelling', self.config.audio.zwelling);
        }, cfg.zwellingVertraging);
        self._setTimeout(function () {
          // 4. omdraaien terug, heks 1 is weg
          draaiNaar(im.a0, cfg.draaiDuur, cfg.blurDraai, function () {
            // 5. hold
            self._setTimeout(function () {
              // 6. tweede, andere fluistering
              self._speel('fluister', kies(self.config.audio.fluister));
              self._setTimeout(function () {
                // 7. omdraaien, er is niets
                draaiNaar(im.b0, cfg.draaiDuur, cfg.blurDraai, function () {
                  // 8. drie seconden volledige stilte
                  self._setTimeout(function () {
                    // 9. rustig terugdraaien: langzamer, minder onscherpte
                    draaiNaar(im.a3, cfg.draaiDuurRustig, cfg.blurDraaiRustig, function () {
                      // 11. vier seconden vasthouden, dan klaar
                      self._setTimeout(function () {
                        self._running = false;
                        if (typeof self._onKlaar === 'function') self._onKlaar();
                      }, cfg.holdA3Eind);
                    });
                  }, cfg.holdB0Stilte);
                });
              }, 400);
            }, cfg.holdA0Leeg);
          });
        }, cfg.holdB1);
      });
    }, 900);
  };

  global.WoudScene = WoudScene;
})(typeof window !== 'undefined' ? window : this);
