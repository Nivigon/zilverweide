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
   de plaats, en draait de scène gewoon door met correcte timing.

   Geluid wordt op dezelfde manier vooraf gecontroleerd (Audio met
   loadedmetadata/error). Bij een vaste, enkele geluidslaag (muziek,
   bosgeluiden, adem, zwelling) betekent een ontbrekend bestand gewoon
   stilte, precies zoals bij Regen/Bliksem elders in dit project. Bij een
   lijst met varianten (geritsel, fluister) kiest de scène alleen tussen
   de varianten die ook echt bestaan, en valt terug op de eerste variant
   als de rest ontbreekt, zodat er altijd geluid is zolang er minstens
   één bestand aanwezig is.
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
      muziek:     'geluid/doolhof/ws-muziek.mp3',
      bosgeluiden: 'geluid/doolhof/ws-scarywood.mp3',   // los bosgeluidenlaag, loopt onder de aanloop naast de muziek
      geritsel:   ['geluid/doolhof/ws-geritsel-1.mp3', 'geluid/doolhof/ws-geritsel-2.mp3'],
      fluister:   ['geluid/doolhof/ws-fluister-1.mp3', 'geluid/doolhof/ws-fluister-2.mp3'],
      adem:       'geluid/doolhof/ws-adem.mp3',
      zwelling:   'geluid/doolhof/ws-zwelling.mp3',
      draai:      'geluid/doolhof/ws-draai.mp3'
    },
    volumes: {
      muziek: 0.5,
      bosgeluiden: 0.45,
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
      wisselBlurDuur: 220,                // ms onscherpte voor/na de a0->a1-wissel, tijdens de hold rechts
      holdRust: 2000,                     // 1. rust op het lege veld
      holdLinks: 1500,                    // 4. vasthouden na pan naar links
      holdRechts: 1500,                   // 7. vasthouden na pan naar rechts, incl. de wissel naar a1
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
    },
    // Kleurregeling per deel. Standaard overal neutraal (geen wijziging
    // t.o.v. het originele beeld): helderheid/contrast 1 = ongewijzigd,
    // schaduwlicht 1 = ongewijzigd. schaduwlicht tilt alleen de donkerste
    // delen op (gamma-kromme: zwart blijft zwart, wit blijft wit, alleen
    // de tussentonen schuiven omhoog), in tegenstelling tot helderheid,
    // die alles gelijk optelt en het beeld grauw/gewassen maakt.
    kleur: {
      deel1: { helderheid: 1, contrast: 1, schaduwlicht: 1 },
      deel2: { helderheid: 1, contrast: 1, schaduwlicht: 1 },
      deel3: { helderheid: 1, contrast: 1, schaduwlicht: 1 }
    },
    // Rozen-posities per plaat: {x, y} als fractie (0..1) van de eigen
    // breedte/hoogte van het beeld, dus onafhankelijk van zoomfactor of
    // schermformaat. Alleen a0/a1/a3 hebben rozen (dezelfde plek in a0/a1/
    // a3, zie het bouwvoorstel); b0/b1 niet. Leeg totdat de plaatsmodus op
    // de testpagina ze vastlegt.
    rozen: {
      a0: [],
      a1: [],
      a3: []
    },
    // Gloed rond elke roos. Puls via dekking (opacity), niet grootte.
    gloed: {
      grootte: 90,          // px doorsnee van de gloed-cirkel
      dekking: 0.55,        // 0..1, dekking op het hoogtepunt van de puls
      kleur: '#4aa8ff',
      scherpte: 0.4,        // 0 = heel zacht/uitgewaaierd, 1 = strakke rand, korte uitloop
      kernAandeel: 0.25,    // 0..1, aandeel van de straal dat een egale, felle kern is
      pulsTempo: 4200,      // ms voor één volledige ademhaling, per roos willekeurig verschoven
      pulsDiepte: 0.45,     // 0..1, hoe ver de dekking terugzakt op het dal van de puls
      flakkerSterkte: 0.5,  // 0..1, extra dekking bovenop het plafond tijdens een onthulling
      flakkerDuur: 700      // ms, op/af totaal
    },
    // Losse lichtdeeltjes per roos, volledig uit te zetten (canvas-
    // gebaseerd, tekent elk frame, kan op een tablet zwaarder zijn dan de
    // gloed zelf).
    deeltjes: {
      aan: true,
      aantalPerRoos: 7,
      stijgSnelheid: 14,     // px/s
      dwarreling: 8,         // px, zijwaartse zwaai-amplitude tijdens het stijgen
      grootte: 3,            // px doorsnee
      levensduur: 5000,      // ms tot een deeltje dooft (altijd vóór de bovenkant)
      dekking: 0.7,
      scherpte: 0.5          // 0 = heel wazig bolletje, 1 = scherp puntje
    }
  };

  // ── Kleine hulpjes ──────────────────────────────────────────────
  function rand(a, b) { return Math.random() * (b - a) + a; }
  function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
  function kies(arr) { return arr[randInt(0, arr.length - 1)]; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // Maximale pan-afstand (in %, zelfde eenheid als deel2.panAfstand) die bij
  // een gegeven zoomfactor nog veilig is: de afbeelding is schaal keer zo
  // groot als de container en wordt door translateX(P%) verschoven met een
  // zichtbare afstand van P/100 * breedte * schaal (percentages resolven
  // tegen de eigen, ongeschaalde breedte, maar de daaropvolgende scale()
  // vermenigvuldigt de resulterende verschuiving mee). Die verschuiving mag
  // niet groter zijn dan de overhangende marge van (schaal - 1) / 2 keer de
  // breedte, anders schuift de rand van de afbeelding in beeld. Opgelost
  // naar P geeft: 50 * (schaal - 1) / schaal. Empirisch geverifieerd (niet
  // aangenomen) met getBoundingClientRect() bij verschillende schalen.
  function maxPanVoorSchaal(schaal) {
    return 50 * (schaal - 1) / schaal;
  }

  // Diepe merge: opts overschrijft alleen de velden die het zelf heeft,
  // de rest komt uit DEFAULTS. Voorkomt dat een gedeeltelijke override
  // (bv. alleen deel2.panAfstand) de rest van dat blok wist.
  // Belangrijk: de basis wordt hier ECHT diep gekopieerd (niet Object.
  // assign, dat alleen de bovenste laag kopieert). Zonder dit deelden alle
  // WoudScene-instanties (en de module-brede DEFAULTS zelf) dezelfde
  // geneste objecten: scene.set('kleur.deel1...', ...) op de ene instantie
  // muteerde dan ongemerkt ook DEFAULTS en dus elke andere instantie.
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

  // ── Rozen-gloed: kleur en verloop ────────────────────────────────
  function hexNaarRgb(hex) {
    hex = String(hex).replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    var getal = parseInt(hex, 16);
    return { r: (getal >> 16) & 255, g: (getal >> 8) & 255, b: getal & 255 };
  }

  // Bouwt de radiale gradiënt voor één gloed-cirkel. kernAandeel bepaalt
  // hoe groot het egale, felle hart is; scherpte bepaalt hoe kort de
  // uitloop daarna is (0 = helemaal uitgewaaierd tot de rand, 1 = strak,
  // met nog altijd een minimale uitloop zodat er geen harde rand ontstaat).
  function maakGloedGradient(kleurHex, kernAandeel, scherpte) {
    var rgb = hexNaarRgb(kleurHex);
    var kernPct = clamp(kernAandeel, 0, 0.95) * 100;
    var uitloop = Math.max(4, (1 - clamp(scherpte, 0, 1)) * (100 - kernPct));
    var randPct = Math.min(100, kernPct + uitloop);
    var vol = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',1)';
    var leeg = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0)';
    return 'radial-gradient(circle, ' + vol + ' 0%, ' + vol + ' ' + kernPct + '%, ' + leeg + ' ' + randPct + '%)';
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
    this._gepauzeerd = false;
    this._actieveTimers = [];      // pauzeerbare setTimeout-descriptors (zie _setTimeout)
    this._actieveFades = [];       // pauzeerbare audio-fade-descriptors (zie _faadIn/_faadUit)
    this._audio = {};              // key → Audio-instantie (persistent, geen vroege GC)
    this._beeldStatus = {};        // src → true (geladen) / false (placeholder)
    this._audioStatus = {};        // src → true (bestaat) / false (ontbreekt)
    this._huidigDeel = 0;
    this._huidigeBeat = null;      // { naam, voorToestand, actie }, zie _merkBeat/herhaalHuidigeBeat
    this._gammaFilterId = 'ws-gamma-filter';
    this._gammaSvg = null;
    this._gammaFuncs = null;
    this._deeltjesCanvassen = []; // { canvas, ctx, cssW, cssH, posities, deeltjes }
    this._deeltjesRafId = null;
    this._deeltjesPauzeStart = null;
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

  // Probeert een geluidsbestand te laden; onthoudt alleen of het lukte
  // (loadedmetadata = bestaat, error = niet). Rejecteert nooit, zelfde
  // aanpak als _laadBeeld hierboven.
  WoudScene.prototype._laadGeluid = function (src) {
    var self = this;
    return new Promise(function (resolve) {
      if (self._audioStatus.hasOwnProperty(src)) { resolve(); return; }
      var a = new Audio();
      a.oncanplaythrough = a.onloadedmetadata = function () { self._audioStatus[src] = true; resolve(); };
      a.onerror = function () { self._audioStatus[src] = false; resolve(); };
      a.src = src;
    });
  };

  WoudScene.prototype._alleGeluidPaden = function () {
    var au = this.config.audio;
    return [].concat(au.geritsel, au.fluister, [au.muziek, au.bosgeluiden, au.adem, au.zwelling, au.draai]);
  };

  WoudScene.prototype._voorladen = function (cb) {
    var self = this;
    var paden = this._alleBeeldPaden().map(function (src) { return self._laadBeeld(src); })
      .concat(this._alleGeluidPaden().map(function (src) { return self._laadGeluid(src); }));
    Promise.all(paden).then(function () {
      if (typeof cb === 'function') cb();
    });
  };

  // Kiest willekeurig tussen de varianten die ook echt bestaan; valt terug
  // op de eerste variant (arr[0]) als de rest ontbreekt, zodat er altijd
  // een geluid gekozen wordt zolang er minstens één bestand aanwezig is.
  WoudScene.prototype._kiesGeluid = function (arr) {
    var self = this;
    var bestaande = arr.filter(function (src) { return self._audioStatus[src]; });
    return bestaande.length ? kies(bestaande) : arr[0];
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
  // (waarop transform/blur voor pan/zoom wordt toegepast). De rozen-gloed
  // (en later de deeltjeslaag) komt als kind van dit beeld-element, zodat
  // hij automatisch meebeweegt met de pan/zoom-transform.
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
    var sleutel = this._sleutelVoorBeeld(src);
    // Altijd getagd, ook zonder rozen: de plaatsmodus in de testpagina moet
    // kunnen zien welke plaat (a0/a1/a3) nu in beeld is, ook vóórdat er
    // ooit een roos op vastgelegd is.
    if (sleutel) beeld.dataset.wsSleutel = sleutel;
    if (sleutel && this.config.rozen[sleutel] && this.config.rozen[sleutel].length) {
      this._bouwRozenLaag(beeld, sleutel);
      if (this.config.deeltjes.aan) this._bouwDeeltjesLaag(beeld, sleutel);
    }
    return beeld;
  };

  // Herleidt welke rozen-sleutel (a0/a1/a3) bij een gegeven bestandspad
  // hoort, puur op basis van de configuratie: geen aparte parameter nodig
  // bij elke _vulLaag-aanroep, dus geen enkele bestaande aanroep (deel1,
  // deel2, deel3) hoeft zijn eigen argumenten te veranderen.
  WoudScene.prototype._sleutelVoorBeeld = function (src) {
    var im = this.config.images;
    if (src === im.a0) return 'a0';
    if (src === im.a1) return 'a1';
    if (src === im.a3) return 'a3';
    return null;
  };

  // Zet duur en (negatieve) vertraging van de puls-animatie op één gloed-
  // element, op basis van diens eigen vastgelegde tempo-factor en fase.
  // Eén functie voor zowel het aanmaken (_bouwRozenLaag) als het live
  // bijstellen (_verversGloeden) van het tempo, zodat beide altijd gelijk
  // lopen.
  WoudScene.prototype._zetGloedTiming = function (el, gloedCfg) {
    var tempoFactor = parseFloat(el.dataset.wsTempoFactor);
    var faseFractie = parseFloat(el.dataset.wsFaseFractie);
    var tempo = gloedCfg.pulsTempo * tempoFactor;
    el.style.animationDuration = tempo + 'ms';
    // Negatieve delay: de animatie begint meteen halverwege zijn eigen
    // cyclus, in plaats van dat alle rozen een tijdlang synchroon "in rust"
    // staan voor ze voor het eerst pulseren.
    el.style.animationDelay = '-' + (faseFractie * tempo) + 'ms';
  };

  // Bouwt de gloedlaag (één ws-gloed per vastgelegde rozen-coördinaat) als
  // kind van het beeld-element, zodat panning/zoomen 'm automatisch meeneemt.
  WoudScene.prototype._bouwRozenLaag = function (beeld, sleutel) {
    var posities = this.config.rozen[sleutel];
    if (!posities || !posities.length) return;
    var gloedCfg = this.config.gloed;
    var gradient = maakGloedGradient(gloedCfg.kleur, gloedCfg.kernAandeel, gloedCfg.scherpte);
    var max = gloedCfg.dekking;
    var min = Math.max(0, gloedCfg.dekking * (1 - gloedCfg.pulsDiepte));
    var laag = document.createElement('div');
    laag.className = 'ws-gloedlaag';
    for (var i = 0; i < posities.length; i++) {
      var pos = posities[i];
      var el = document.createElement('div');
      el.className = 'ws-gloed';
      el.style.left = (pos.x * 100) + '%';
      el.style.top = (pos.y * 100) + '%';
      el.style.width = gloedCfg.grootte + 'px';
      el.style.height = gloedCfg.grootte + 'px';
      el.style.background = gradient;
      el.style.setProperty('--ws-gloed-max', max);
      el.style.setProperty('--ws-gloed-min', min);
      el.style.opacity = String(max);
      el.dataset.wsTempoFactor = String(0.8 + Math.random() * 0.45);
      el.dataset.wsFaseFractie = String(Math.random());
      this._zetGloedTiming(el, gloedCfg);
      laag.appendChild(el);
    }
    beeld.appendChild(laag);
  };

  // Werkt alle op dit moment bestaande gloed-elementen live bij wanneer een
  // gloed.*-instelling verandert (testmodus), zonder de scène opnieuw te
  // hoeven starten. Elke roos behoudt zijn eigen tempo-factor en fase.
  WoudScene.prototype._verversGloeden = function () {
    if (!this.el) return;
    var gloedCfg = this.config.gloed;
    var gradient = maakGloedGradient(gloedCfg.kleur, gloedCfg.kernAandeel, gloedCfg.scherpte);
    var max = gloedCfg.dekking;
    var min = Math.max(0, gloedCfg.dekking * (1 - gloedCfg.pulsDiepte));
    var els = this.el.querySelectorAll('.ws-gloed');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      el.style.width = gloedCfg.grootte + 'px';
      el.style.height = gloedCfg.grootte + 'px';
      el.style.background = gradient;
      el.style.setProperty('--ws-gloed-max', max);
      el.style.setProperty('--ws-gloed-min', min);
      this._zetGloedTiming(el, gloedCfg);
    }
  };

  // Laat alle op dit moment zichtbare gloeden kort feller oplichten en
  // daarna weer terugzakken naar hun normale plafond: gebruikt op de
  // momenten waarop een heks zichtbaar wordt. Gebruikt _setTimeout (de
  // pauzeerbare timer-wrapper) zodat dit ook correct pauzeert/hervat als
  // de speler middenin de flakkering op pauze drukt.
  WoudScene.prototype._flakkerGloed = function () {
    if (!this.el) return;
    var self = this;
    var gloedCfg = this.config.gloed;
    var stap = Math.max(1, Math.round(gloedCfg.flakkerDuur / 2));
    var piek = clamp(gloedCfg.dekking + gloedCfg.flakkerSterkte, 0, 1);
    var basis = gloedCfg.dekking;
    var els = this.el.querySelectorAll('.ws-gloed');
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        // Een CSS-animatie op dezelfde eigenschap wint altijd van een
        // transitie, ook als hij gepauzeerd is (animationPlayState alleen
        // volstaat dus niet): de animatie moet er echt even helemaal af.
        el.style.animationName = 'none';
        el.style.transition = 'opacity ' + stap + 'ms ease-out';
        el.style.opacity = String(piek);
        self._setTimeout(function () {
          el.style.transition = 'opacity ' + stap + 'ms ease-in';
          el.style.opacity = String(basis);
          self._setTimeout(function () {
            el.style.transition = '';
            el.style.opacity = '';
            el.style.animationName = '';
          }, stap);
        }, stap);
      })(els[i]);
    }
  };

  // ── Deeltjes (losse lichtpuntjes bij elke roos) ─────────────────
  // Canvas-gebaseerd (niet DOM/CSS-elementen): veel goedkoper om een klein
  // aantal deeltjes per frame te tekenen dan evenveel los geanimeerde
  // DOM-nodes te onderhouden. Eén canvas per beeld-met-rozen, als kind van
  // hetzelfde beeld-element als de gloed, zodat hij automatisch meedraait
  // met diens pan/zoom-transform.
  WoudScene.prototype._nieuwDeeltje = function (pos, nu, cfg) {
    var duur = cfg.levensduur * (0.85 + Math.random() * 0.3);
    // Elk deeltje begint zogenaamd al een stukje "onderweg" (net als de
    // negatieve delay bij de gloed-puls), anders ontstaan bij het laden
    // van een plaat alle deeltjes tegelijk onderaan.
    var vertraging = Math.random() * duur;
    return {
      ox: pos.x,
      oy: pos.y,
      geboorte: nu - vertraging,
      duur: duur,
      faseDwarreling: Math.random() * Math.PI * 2,
      dwarrelSnelheid: 0.8 + Math.random() * 0.6
    };
  };

  WoudScene.prototype._bouwDeeltjesLaag = function (beeld, sleutel) {
    var posities = this.config.rozen[sleutel];
    if (!posities || !posities.length || !this.el) return;
    var rect = this.el.getBoundingClientRect();
    var cssW = rect.width || 1;
    var cssH = rect.height || 1;
    var dpr = window.devicePixelRatio || 1;
    var canvas = document.createElement('canvas');
    canvas.className = 'ws-deeltjes-canvas';
    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    beeld.appendChild(canvas);

    var cfg = this.config.deeltjes;
    var nu = performance.now();
    var lijst = [];
    for (var i = 0; i < posities.length; i++) {
      for (var j = 0; j < cfg.aantalPerRoos; j++) {
        lijst.push(this._nieuwDeeltje(posities[i], nu, cfg));
      }
    }
    this._deeltjesCanvassen.push({
      canvas: canvas, ctx: ctx, cssW: cssW, cssH: cssH, posities: posities, deeltjes: lijst
    });
    this._startDeeltjesLoopAlsNodig();
  };

  WoudScene.prototype._startDeeltjesLoopAlsNodig = function () {
    if (this._deeltjesRafId || this._gepauzeerd || this._gestopt) return;
    if (!this.config.deeltjes.aan || !this._deeltjesCanvassen.length) return;
    var self = this;
    (function frame() {
      self._tekenDeeltjes();
      self._deeltjesRafId = requestAnimationFrame(frame);
    })();
  };

  WoudScene.prototype._stopDeeltjesLoop = function () {
    if (this._deeltjesRafId) {
      cancelAnimationFrame(this._deeltjesRafId);
      this._deeltjesRafId = null;
    }
  };

  WoudScene.prototype._tekenDeeltjes = function () {
    // Canvassen van intussen vervangen platen (elke _vulLaag-aanroep zet
    // laagEl.innerHTML leeg) hier opruimen; anders groeit deze lijst
    // ongelimiteerd door bij elke plaatwissel of beat-herhaling.
    this._deeltjesCanvassen = this._deeltjesCanvassen.filter(function (d) {
      return d.canvas.isConnected;
    });
    var cfg = this.config.deeltjes;
    var rgb = hexNaarRgb(this.config.gloed.kleur);
    var kleur = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',1)';
    var nu = performance.now();
    for (var c = 0; c < this._deeltjesCanvassen.length; c++) {
      var d = this._deeltjesCanvassen[c];
      var ctx = d.ctx;
      ctx.clearRect(0, 0, d.cssW, d.cssH);
      for (var i = 0; i < d.deeltjes.length; i++) {
        var p = d.deeltjes[i];
        var elapsed = nu - p.geboorte;
        var t = elapsed / p.duur;
        if (t >= 1) {
          p = this._nieuwDeeltje({ x: p.ox, y: p.oy }, nu, cfg);
          d.deeltjes[i] = p;
          elapsed = 0;
          t = 0;
        }
        var stijgPx = cfg.stijgSnelheid * (elapsed / 1000);
        var dwarrelPx = cfg.dwarreling * Math.sin(p.faseDwarreling + (elapsed / 1000) * p.dwarrelSnelheid * Math.PI);
        var px = p.ox * d.cssW + dwarrelPx;
        var py = p.oy * d.cssH - stijgPx;
        // Dekking-envelop: kort invagen, lang vol, dan doven voordat het
        // deeltje (tijdgebaseerd, niet positiegebaseerd) de bovenkant
        // bereikt.
        var op;
        if (t < 0.15) op = t / 0.15;
        else if (t > 0.7) op = (1 - t) / 0.3;
        else op = 1;
        op = clamp(op, 0, 1) * cfg.dekking;
        if (op <= 0.001) continue;
        ctx.globalAlpha = op;
        ctx.shadowBlur = (1 - clamp(cfg.scherpte, 0, 1)) * cfg.grootte * 1.5;
        ctx.shadowColor = kleur;
        ctx.fillStyle = kleur;
        ctx.beginPath();
        ctx.arc(px, py, cfg.grootte / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }
  };

  // Live bijstellen vanuit de testmodus: aan/uit meteen laten gelden, en
  // het aantal deeltjes per roos meteen aanvullen/inkorten zonder de scène
  // opnieuw te starten.
  WoudScene.prototype._verversDeeltjesConfig = function () {
    var cfg = this.config.deeltjes;
    var self = this;
    var nu = performance.now();
    this._deeltjesCanvassen.forEach(function (d) {
      var gewenst = d.posities.length * cfg.aantalPerRoos;
      if (d.deeltjes.length < gewenst) {
        while (d.deeltjes.length < gewenst) {
          var pos = d.posities[d.deeltjes.length % d.posities.length];
          d.deeltjes.push(self._nieuwDeeltje(pos, nu, cfg));
        }
      } else if (d.deeltjes.length > gewenst) {
        d.deeltjes.length = gewenst;
      }
    });
    if (cfg.aan) this._startDeeltjesLoopAlsNodig();
    else this._stopDeeltjesLoop();
  };

  // Herbouwt alleen de gloed/deeltjes-kinderen van elk op dit moment
  // getoond beeld met de gegeven rozen-sleutel, zonder de transform/filter
  // van dat beeld zelf aan te raken. Gebruikt door de plaatsmodus in de
  // testpagina: na het toevoegen/verwijderen van een rozen-coördinaat moet
  // de gloed/deeltjeslaag meteen kloppen, ook als de scène niet herstart.
  WoudScene.prototype.herbouwRozenLaag = function (sleutel) {
    if (!this.el) return;
    var self = this;
    var els = this.el.querySelectorAll('.ws-beeld[data-ws-sleutel="' + sleutel + '"]');
    els.forEach(function (beeld) {
      var oudeGloed = beeld.querySelector('.ws-gloedlaag');
      if (oudeGloed) oudeGloed.remove();
      var oudCanvas = beeld.querySelector('.ws-deeltjes-canvas');
      if (oudCanvas) {
        self._deeltjesCanvassen = self._deeltjesCanvassen.filter(function (d) { return d.canvas !== oudCanvas; });
        oudCanvas.remove();
      }
      if (self.config.rozen[sleutel] && self.config.rozen[sleutel].length) {
        self._bouwRozenLaag(beeld, sleutel);
        if (self.config.deeltjes.aan) self._bouwDeeltjesLaag(beeld, sleutel);
      }
    });
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

  // Fade-intervallen zijn pauzeerbaar: pause() zet het interval stil met
  // clearInterval, resume() herstart hetzelfde tick-sluiting (die zijn
  // eigen teller i nog onthoudt), zodat de fade precies verdergaat waar
  // hij was. Geen aparte tijdregistratie nodig, i/stappen is zelf al de
  // voortgang.
  WoudScene.prototype._faadUit = function (audioEl, duurMs) {
    if (!audioEl) return;
    var self = this;
    var stapTijd = 60;
    var stappen = Math.max(1, Math.round(duurMs / stapTijd));
    var startVol = audioEl.volume;
    var i = 0;
    var desc = { rawId: null, stapTijd: stapTijd };
    function tick() {
      i++;
      audioEl.volume = Math.max(0, startVol * (1 - i / stappen));
      if (i >= stappen) {
        clearInterval(desc.rawId);
        self._actieveFades = self._actieveFades.filter(function (f) { return f !== desc; });
        try { audioEl.pause(); } catch (e) {}
      }
    }
    desc.tick = tick;
    desc.rawId = setInterval(tick, stapTijd);
    this._actieveFades.push(desc);
  };

  // Timers zijn pauzeerbaar: pause() onthoudt hoeveel er nog resteerde op
  // het moment van pauzeren (i.p.v. de oorspronkelijke volledige duur) en
  // clear't de setTimeout; resume() plant 'm opnieuw met precies dat
  // restant, zodat de sequentie exact verdergaat waar hij was.
  WoudScene.prototype._setTimeout = function (fn, ms) {
    var self = this;
    var desc = { fn: fn, resterend: ms, rawId: null, gestart: 0 };
    function plan(duur) {
      desc.gestart = Date.now();
      desc.rawId = setTimeout(function () {
        self._actieveTimers = self._actieveTimers.filter(function (t) { return t !== desc; });
        if (self._gestopt) return;
        fn();
      }, duur);
    }
    desc.plan = plan;
    plan(ms);
    this._actieveTimers.push(desc);
    return desc;
  };

  WoudScene.prototype._alleTimersWissen = function () {
    this._actieveTimers.forEach(function (t) { if (t.rawId != null) clearTimeout(t.rawId); });
    this._actieveTimers = [];
    this._actieveFades.forEach(function (f) { if (f.rawId != null) clearInterval(f.rawId); });
    this._actieveFades = [];
  };

  // ── Publieke API ────────────────────────────────────────────────
  WoudScene.prototype.start = function (onKlaar) {
    var self = this;
    this._onKlaar = onKlaar;
    this._gestopt = false;
    this._gepauzeerd = false;
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
    this._gepauzeerd = false;
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
    this._gepauzeerd = false;
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
    // Kleurregeling van het deel dat NU in beeld is meteen live bijwerken;
    // van een ander deel hoeft dat pas te gebeuren als dat deel start.
    if (delen[0] === 'kleur' && delen[1] === ('deel' + this._huidigDeel)) {
      this._pasKleurToe(delen[1]);
    }
    if (delen[0] === 'gloed') {
      this._verversGloeden();
    }
    if (delen[0] === 'deeltjes') {
      this._verversDeeltjesConfig();
    }
    return this;
  };

  WoudScene.prototype.getConfig = function () {
    return diepeKopie(this.config);
  };

  // ── Kleurregeling (helderheid/contrast/schaduwlicht per deel) ──────
  // brightness()/contrast() zijn standaard CSS filter-functies. Voor
  // "schaduwlicht" (de donkerste delen optillen zonder de lichte delen
  // grauw te maken) bestaat geen standaard CSS-filter: dat vraagt een
  // gamma-kromme (output = input^exponent), die per definitie zwart op
  // zwart en wit op wit houdt en alleen de tussentonen verschuift. Dat
  // kan alleen via een SVG feComponentTransfer-filter, dus wordt er hier
  // eenmalig een verborgen SVG-filter aangemaakt en met url(#...)
  // gecombineerd met de CSS-filters op hetzelfde element.
  WoudScene.prototype._maakGammaFilter = function () {
    if (this._gammaSvg) return;
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    var defs = document.createElementNS(ns, 'defs');
    var filter = document.createElementNS(ns, 'filter');
    filter.setAttribute('id', this._gammaFilterId);
    var transfer = document.createElementNS(ns, 'feComponentTransfer');
    var funcs = ['feFuncR', 'feFuncG', 'feFuncB'].map(function (naam) {
      var f = document.createElementNS(ns, naam);
      f.setAttribute('type', 'gamma');
      f.setAttribute('amplitude', '1');
      f.setAttribute('exponent', '1');
      f.setAttribute('offset', '0');
      transfer.appendChild(f);
      return f;
    });
    filter.appendChild(transfer);
    defs.appendChild(filter);
    svg.appendChild(defs);
    document.body.appendChild(svg);
    this._gammaSvg = svg;
    this._gammaFuncs = funcs;
  };

  // schaduwlicht > 1 tilt de schaduwen op (exponent < 1); schaduwlicht = 1
  // is exponent = 1, dus een rechte lijn (geen wijziging).
  WoudScene.prototype._pasKleurToe = function (deelNaam) {
    this._maakGammaFilter();
    var k = this.config.kleur[deelNaam];
    if (!k || !this.el) return;
    var exponent = 1 / Math.max(0.01, k.schaduwlicht);
    this._gammaFuncs.forEach(function (f) { f.setAttribute('exponent', exponent); });
    this.el.style.filter =
      'url(#' + this._gammaFilterId + ') brightness(' + k.helderheid + ') contrast(' + k.contrast + ')';
  };

  // ── Pauze/hervat ────────────────────────────────────────────────
  // Bevriest de scène exact waar hij staat: CSS-transities/animaties via
  // de standaard Web Animations API (Element.getAnimations, native
  // pauzeren op het huidige frame, geen eigen tijd-/waarde-berekening
  // nodig), de setTimeout-keten van de sequencer (self._setTimeout, zie
  // hierboven) en alle geluid. resume() zet alles weer aan vanaf precies
  // dat punt.
  WoudScene.prototype.pause = function () {
    if (this._gepauzeerd || this._gestopt) return this;
    this._gepauzeerd = true;

    if (this.el && this.el.getAnimations) {
      this.el.getAnimations({ subtree: true }).forEach(function (a) {
        try { a.pause(); } catch (e) {}
      });
    }

    this._actieveTimers.forEach(function (t) {
      if (t.rawId != null) {
        clearTimeout(t.rawId);
        t.resterend = Math.max(0, t.resterend - (Date.now() - t.gestart));
        t.rawId = null;
      }
    });

    this._actieveFades.forEach(function (f) {
      if (f.rawId != null) { clearInterval(f.rawId); f.rawId = null; }
    });

    Object.keys(this._audio).forEach(function (k) {
      var a = this._audio[k];
      if (a && !a.paused) {
        a._wasSpelend = true;
        try { a.pause(); } catch (e) {}
      }
    }, this);

    // De deeltjes-loop draait op requestAnimationFrame, niet op een van
    // de pauzeerbare timers hierboven: gewoon stoppen met tekenen bevriest
    // het canvas al, maar elk deeltje rekent zijn positie uit t.o.v. zijn
    // eigen "geboorte"-tijdstip, dus die moet bij resume() ingehaald worden
    // (zie daar), anders springen alle deeltjes bij hervatten in één klap
    // vooruit met de volledige pauzeduur.
    this._stopDeeltjesLoop();
    this._deeltjesPauzeStart = performance.now();

    return this;
  };

  WoudScene.prototype.resume = function () {
    if (!this._gepauzeerd) return this;
    this._gepauzeerd = false;

    if (this.el && this.el.getAnimations) {
      this.el.getAnimations({ subtree: true }).forEach(function (a) {
        try { a.play(); } catch (e) {}
      });
    }

    this._actieveTimers.forEach(function (t) {
      if (t.rawId == null) t.plan(t.resterend);
    });

    this._actieveFades.forEach(function (f) {
      if (f.rawId == null) f.rawId = setInterval(f.tick, f.stapTijd);
    });

    Object.keys(this._audio).forEach(function (k) {
      var a = this._audio[k];
      if (a && a._wasSpelend) {
        a._wasSpelend = false;
        var p = a.play();
        if (p && p.catch) p.catch(function () {});
      }
    }, this);

    if (this._deeltjesPauzeStart != null) {
      var pauzeDuur = performance.now() - this._deeltjesPauzeStart;
      this._deeltjesCanvassen.forEach(function (d) {
        d.deeltjes.forEach(function (p) { p.geboorte += pauzeDuur; });
      });
      this._deeltjesPauzeStart = null;
    }
    this._startDeeltjesLoopAlsNodig();

    return this;
  };

  WoudScene.prototype.togglePause = function () {
    if (this._gepauzeerd) this.resume(); else this.pause();
    return this._gepauzeerd;
  };

  // ── Herhaal huidige beat ────────────────────────────────────────
  // Elke beat in deel 2/3 registreert zichzelf via _merkBeat (zie
  // verderop) met een voorToestand-functie (zet het beeld terug naar hoe
  // het er VOOR deze beat uitzag) en de beat-actie zelf. Zo kan een beat
  // die al (deels) geweest is opnieuw vanaf zijn eigen begin afgespeeld
  // worden, zonder de rest van de scène te herstarten.
  WoudScene.prototype._merkBeat = function (naam, voorToestandFn, actieFn) {
    this._huidigeBeat = { naam: naam, voorToestand: voorToestandFn, actie: actieFn };
    actieFn();
  };

  WoudScene.prototype.herhaalHuidigeBeat = function () {
    var b = this._huidigeBeat;
    if (!b) return this;
    if (this._gepauzeerd) this.resume();
    if (typeof b.voorToestand === 'function') b.voorToestand();
    b.actie();
    return this;
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
    this._gepauzeerd = false;
    this._running = false;
    this._alleTimersWissen();
    this._stopAlleAudio();
    this._stopDeeltjesLoop();
    this._deeltjesCanvassen = [];
    if (this._gammaSvg && this._gammaSvg.parentNode) this._gammaSvg.parentNode.removeChild(this._gammaSvg);
    this._gammaSvg = null;
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = this._laagA = this._laagB = this._spookLaag = null;
  };

  // ── Deel 1, aanloop door het donkere bos ──────────────────────
  WoudScene.prototype._deel1 = function () {
    this._huidigDeel = 1;
    this._pasKleurToe('deel1');
    var self = this;
    var cfg = this.config.deel1;
    var im = this.config.images.bos;

    var totaalDuur = rand(cfg.duurMin, cfg.duurMax);
    var perBeeld = totaalDuur / im.length;

    this._speel('muziek', this.config.audio.muziek, { volume: 0, loop: true });
    var muziekAudio = this._audio['muziek_0'];
    if (muziekAudio) this._faadIn(muziekAudio, this.config.volumes.muziek, cfg.muziekFadeIn);

    // Los bosgeluidenlaag, loopt onder de aanloop naast de muziek en zakt
    // in deel 2 op hetzelfde moment weg als de muziek.
    this._speel('bosgeluiden', this.config.audio.bosgeluiden, { volume: 0, loop: true });
    var bosgeluidenAudio = this._audio['bosgeluiden_0'];
    if (bosgeluidenAudio) this._faadIn(bosgeluidenAudio, this.config.volumes.bosgeluiden, cfg.muziekFadeIn);

    // Losse geritsel/fluister-achtige omgevingsgeluidjes, willekeurig
    // verspreid, puur sfeer, niet gesynchroniseerd met een beeldwissel.
    var aantalOmgevingsgeluiden = randInt(2, 3);
    for (var g = 0; g < aantalOmgevingsgeluiden; g++) {
      this._setTimeout(function () {
        self._speel('geritsel', self._kiesGeluid(self.config.audio.geritsel));
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
    var self = this;
    var stapTijd = 60;
    var stappen = Math.max(1, Math.round(duurMs / stapTijd));
    var i = 0;
    var desc = { rawId: null, stapTijd: stapTijd };
    function tick() {
      i++;
      audioEl.volume = clamp(doelVol * (i / stappen), 0, 1);
      if (i >= stappen) {
        clearInterval(desc.rawId);
        self._actieveFades = self._actieveFades.filter(function (f) { return f !== desc; });
      }
    }
    desc.tick = tick;
    desc.rawId = setInterval(tick, stapTijd);
    this._actieveFades.push(desc);
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
    this._pasKleurToe('deel2');
    var self = this;
    var cfg = this.config.deel2;
    var im = this.config.images;

    // Muziek en bosgeluidenlaag samen weg, lage adem-laag blijft over.
    var muziekAudio = this._audio['muziek_0'];
    if (muziekAudio) this._faadUit(muziekAudio, cfg.muziekFadeOutDuur);
    var bosgeluidenAudio = this._audio['bosgeluiden_0'];
    if (bosgeluidenAudio) this._faadUit(bosgeluidenAudio, cfg.muziekFadeOutDuur);
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

    // Zet het beeld direct (zonder transitie) op een bekende stand. Ook
    // gebruikt als "voorToestand" van elke beat hieronder, zodat
    // herhaalHuidigeBeat() een beat altijd weer vanaf zijn eigen begin
    // opnieuw kan afspelen, ongeacht hoe ver de beat al gevorderd was.
    function naarStand(img, pct, blurPx) {
      beeld = self._vulLaag(self._laagA, img);
      beeld.style.transition = 'none';
      beeld.style.transform = 'scale(' + cfg.schaal + ') translateX(' + pct + '%)';
      beeld.style.filter = 'blur(' + blurPx + 'px)';
      // Forceer een reflow: zonder dit kan de browser deze "instant"-zet
      // samenvoegen met de eerstvolgende stijlwijziging (de transitie die
      // de beat-actie meteen erna instelt), waardoor de reset genegeerd
      // wordt en herhaalHuidigeBeat() alsnog vanaf de oude positie verdergaat.
      void beeld.offsetWidth;
    }
    naarStand(im.a0, 0, 0);

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

    // Pan-afstand nooit groter dan wat bij de huidige zoomfactor nog veilig
    // is (anders schuift de rand van de afbeelding in beeld); opnieuw
    // berekend per pan, zodat live bijstellen van de zoomfactor (debug-
    // paneel) meteen klopt, ook bij het herhalen van een beat.
    function effectiefPan() {
      return Math.min(cfg.panAfstand, maxPanVoorSchaal(cfg.schaal));
    }

    // panRechts wordt elke keer dat beatPanRechts() echt draait opnieuw
    // berekend (niet één keer vooraf gecached), zodat een latere
    // beat-herhaling van "pan-rechts" een intussen bijgestelde zoom/pan-
    // afstand ook meteen laat gelden voor de wissel en de terugpan erna.
    var panRechts = 0;

    function beatHoldRust() {
      self._merkBeat('hold-rust', function () { naarStand(im.a0, 0, 0); }, function () {
        // 1. rust op het lege veld
        self._setTimeout(beatPanLinks, cfg.holdRust);
      });
    }
    function beatPanLinks() {
      self._merkBeat('pan-links', function () { naarStand(im.a0, 0, 0); }, function () {
        // 2. geritsel links, 3. pan naar links
        self._speel('geritsel', self._kiesGeluid(self.config.audio.geritsel));
        pan(-effectiefPan(), cfg.panDuurHeen, true, beatHoldLinks);
      });
    }
    function beatHoldLinks() {
      self._merkBeat('hold-links', function () { naarStand(im.a0, -effectiefPan(), 0); }, function () {
        // 4. hold
        self._setTimeout(beatTerug1, cfg.holdLinks);
      });
    }
    function beatTerug1() {
      self._merkBeat('terug-naar-midden-1', function () { naarStand(im.a0, -effectiefPan(), 0); }, function () {
        // 5. terug naar midden
        pan(0, cfg.terugDuur, true, beatPanRechts);
      });
    }
    function beatPanRechts() {
      self._merkBeat('pan-rechts', function () { naarStand(im.a0, 0, 0); }, function () {
        // 6. geritsel rechts, 7. pan naar rechts
        self._speel('geritsel', self._kiesGeluid(self.config.audio.geritsel));
        panRechts = effectiefPan();
        pan(panRechts, cfg.panDuurHeen, true, beatHoldWissel);
      });
    }
    function beatHoldWissel() {
      self._merkBeat('hold-rechts-wissel', function () { naarStand(im.a0, panRechts, 0); }, function () {
        // 8. hold rechts. De wissel naar a1 (heks 1) gebeurt HIER, terwijl
        // de camera stilstaat aan de rechterkant: haar plek (iets links
        // van het midden) is dan het verst uit beeld. Een korte
        // bewegingsonscherpte over het wisselmoment zelf verbergt de
        // omruil; de camera staat op dat moment stil.
        beeld.style.transition = 'filter ' + cfg.wisselBlurDuur + 'ms ease-in';
        beeld.style.filter = 'blur(' + cfg.blurPan + 'px)';
        self._setTimeout(function () {
          naarStand(im.a1, panRechts, cfg.blurPan);
          void beeld.offsetWidth;
          beeld.style.transition = 'filter ' + cfg.wisselBlurDuur + 'ms ease-out';
          beeld.style.filter = 'blur(0px)';
          self._flakkerGloed();
        }, cfg.wisselBlurDuur);
        self._setTimeout(function () {
          // Rest van de hold, na de (nu al onzichtbaar gemaakte) wissel.
          self._setTimeout(beatTerug2, Math.max(0, cfg.holdRechts - cfg.wisselBlurDuur * 2));
        }, cfg.wisselBlurDuur * 2);
      });
    }
    function beatTerug2() {
      self._merkBeat('terug-naar-midden-2', function () { naarStand(im.a1, panRechts, 0); }, function () {
        // 9. terug naar midden. Heks 1 zit al in het beeld, dus dit is een
        // gewone, ononderbroken pan: ze "verschijnt" niet, ze komt gewoon
        // in beeld zoals de rest van het beeld.
        pan(0, cfg.terugDuur, true, beatHoldHeks1);
      });
    }
    function beatHoldHeks1() {
      self._merkBeat('hold-heks1', function () { naarStand(im.a1, 0, 0); }, function () {
        // 10. bij aankomst in het midden: geen geluid, meteen vasthouden.
        self._setTimeout(function () { self._deel3(); }, cfg.holdHeks1);
      });
    }

    beatHoldRust();
  };

  // ── Deel 3, de draai-sequentie ────────────────────────────────
  WoudScene.prototype._deel3 = function () {
    this._huidigDeel = 3;
    this._pasKleurToe('deel3');
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

    // Zet een gegeven laag direct (zonder transitie) op een bekende
    // afbeelding en maakt hem actief; de andere laag wordt verborgen. Ook
    // gebruikt als "voorToestand" van elke beat hieronder (zie deel 2 voor
    // dezelfde aanpak), zodat herhaalHuidigeBeat() een beat, inclusief een
    // eventuele laag-wissel door kalmTerugdraaien, altijd deterministisch
    // vanaf zijn eigen begin herdoet.
    function naarStand(laag, img, blurPx) {
      actief = laag;
      beeld = self._vulLaag(laag, img);
      beeld.style.transition = 'none';
      beeld.style.transform = 'scale(1)';
      beeld.style.filter = 'blur(' + blurPx + 'px)';
      laag.style.transition = 'none';
      laag.style.opacity = '1';
      var ander = (laag === self._laagA) ? self._laagB : self._laagA;
      ander.style.transition = 'none';
      ander.style.opacity = '0';
      // Reflow forceren, zelfde reden als bij deel 2's naarStand: anders
      // kan de browser deze reset samenvoegen met de transitie die de
      // beat-actie er meteen na op start.
      void beeld.offsetWidth;
    }
    var eigenLaag = actief; // deel3 blijft op deze laag tot kalmTerugdraaien wisselt

    // Eén schrik-omdraaiing: kort blur-moment, wissel het beeld op het
    // midden van de beweging, laat de blur weer wegtrekken. Geen
    // tussenbeelden nodig, de veeg zelf dekt de wissel af (de blur is fel
    // en kort genoeg om de harde inhoud-wissel te verdoezelen).
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

    // De laatste, rustige terugdraai is geen schrikreactie meer: de blur
    // is met opzet licht, en licht genoeg maskeert de harde beeld-wissel
    // van draaiNaar() niet meer (dat oogt dan zelf als een flits). Deze
    // gebruikt daarom een echte overvloeiing tussen de twee beeld-lagen
    // (dezelfde laag-crossfade als deel 1), met de nieuwe laag die tegelijk
    // onwazig wordt terwijl hij invaagt.
    function kalmTerugdraaien(nieuweSrc, duur, blurPx, cb) {
      var ander = (actief === self._laagA) ? self._laagB : self._laagA;
      var nieuwBeeld = self._vulLaag(ander, nieuweSrc);
      nieuwBeeld.style.transition = 'none';
      nieuwBeeld.style.transform = 'scale(1)';
      nieuwBeeld.style.filter = 'blur(' + blurPx + 'px)';
      ander.style.transition = 'none';
      ander.style.opacity = '0';
      void nieuwBeeld.offsetWidth;
      ander.style.transition = 'opacity ' + duur + 'ms ease';
      ander.style.opacity = '1';
      actief.style.transition = 'opacity ' + duur + 'ms ease';
      actief.style.opacity = '0';
      nieuwBeeld.style.transition = 'filter ' + duur + 'ms ease-out';
      nieuwBeeld.style.filter = 'blur(0px)';
      actief = ander;
      beeld = nieuwBeeld;
      self._flakkerGloed();
      self._setTimeout(cb, duur);
    }

    function beatFluister1() {
      self._merkBeat('fluister-1-wacht', function () { naarStand(eigenLaag, im.a1, 0); }, function () {
        // 1. fluistering vlak achter de speler
        self._speel('fluister', self._kiesGeluid(self.config.audio.fluister));
        self._setTimeout(beatDraaiB1, 900);
      });
    }
    function beatDraaiB1() {
      self._merkBeat('draai-naar-b1', function () { naarStand(eigenLaag, im.a1, 0); }, function () {
        // 2. omdraaien naar heks 2, dichtbij
        draaiNaar(im.b1, cfg.draaiDuur, cfg.blurDraai, beatHoldB1);
      });
    }
    function beatHoldB1() {
      self._merkBeat('hold-b1-zwelling', function () { naarStand(eigenLaag, im.b1, 0); }, function () {
        // 3. hold, geen geluid bij onthulling; na ~1,5s een lage zwelling
        self._setTimeout(function () {
          self._speel('zwelling', self.config.audio.zwelling);
        }, cfg.zwellingVertraging);
        self._setTimeout(beatDraaiA0, cfg.holdB1);
      });
    }
    function beatDraaiA0() {
      self._merkBeat('draai-naar-a0', function () { naarStand(eigenLaag, im.b1, 0); }, function () {
        // 4. omdraaien terug, heks 1 is weg
        draaiNaar(im.a0, cfg.draaiDuur, cfg.blurDraai, beatHoldA0);
      });
    }
    function beatHoldA0() {
      self._merkBeat('hold-a0-leeg', function () { naarStand(eigenLaag, im.a0, 0); }, function () {
        // 5. hold
        self._setTimeout(beatFluister2, cfg.holdA0Leeg);
      });
    }
    function beatFluister2() {
      self._merkBeat('fluister-2-wacht', function () { naarStand(eigenLaag, im.a0, 0); }, function () {
        // 6. tweede, andere fluistering
        self._speel('fluister', self._kiesGeluid(self.config.audio.fluister));
        self._setTimeout(beatDraaiB0, 400);
      });
    }
    function beatDraaiB0() {
      self._merkBeat('draai-naar-b0', function () { naarStand(eigenLaag, im.a0, 0); }, function () {
        // 7. omdraaien, er is niets
        draaiNaar(im.b0, cfg.draaiDuur, cfg.blurDraai, beatHoldStilte);
      });
    }
    function beatHoldStilte() {
      self._merkBeat('hold-b0-stilte', function () { naarStand(eigenLaag, im.b0, 0); }, function () {
        // 8. drie seconden volledige stilte
        self._setTimeout(beatKalmTerugdraaien, cfg.holdB0Stilte);
      });
    }
    function beatKalmTerugdraaien() {
      self._merkBeat('kalm-terugdraaien', function () { naarStand(eigenLaag, im.b0, 0); }, function () {
        // 9. rustig terugdraaien: langzamer, minder onscherpte, en een
        // echte overvloeiing i.p.v. een harde wissel.
        kalmTerugdraaien(im.a3, cfg.draaiDuurRustig, cfg.blurDraaiRustig, beatHoldA3Eind);
      });
    }
    function beatHoldA3Eind() {
      var andereLaag = (eigenLaag === self._laagA) ? self._laagB : self._laagA;
      self._merkBeat('hold-a3-eind', function () { naarStand(andereLaag, im.a3, 0); }, function () {
        // 11. vier seconden vasthouden, dan klaar
        self._setTimeout(function () {
          self._running = false;
          if (typeof self._onKlaar === 'function') self._onKlaar();
        }, cfg.holdA3Eind);
      });
    }

    beatFluister1();
  };

  global.WoudScene = WoudScene;
})(typeof window !== 'undefined' ? window : this);
