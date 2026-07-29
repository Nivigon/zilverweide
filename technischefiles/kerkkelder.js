/* ══════════════════════════════════════════════════════════════════
   KERKKELDER (cinematic ontknoping, module)
   ------------------------------------------------------------------
   Publieke API:
     var scene = new KerkkelderScene(container[, opts]);
     scene.start(onKlaar);        // start bij beat 1, roept onKlaar aan na beat 7
     scene.goTo(1..7);            // spring direct naar een beat (debug/demo)
     scene.replay(onKlaar);       // stop alles en begin opnieuw bij beat 1
     scene.pause() / scene.resume() / scene.togglePause();
     scene.herhaalHuidigeBeat();  // speel de huidige beat opnieuw vanaf zijn begin
     scene.set('veeg.duur', 300); // live instelling wijzigen (dot-pad)
     scene.getConfig();           // huidige config (diepe kopie), voor het debugpaneel
     scene.destroy();             // alle timers/geluid/DOM opruimen

   container : DOM-element of selector. Wordt volledig gevuld (position:
               relative wordt gezet als dat nog niet zo is); de scene zelf
               is position:absolute;inset:0 binnen die container.
   opts      : diepe override van DEFAULTS hieronder. Ontbrekende velden
               vallen terug op de standaardwaarden.

   De scene is puur kijken en luisteren, met als enige interactie het
   doorklikken van de dialoogregels (beat 4 t/m 6). De hoofdtruc is de
   omdraai-veeg uit de woudscene: een zeer korte, zeer onscherpe veeg
   waarna een compleet ander beeld staat. Elke beeldwissel gebeurt tijdens
   die veeg, nooit tijdens een rustig moment, en een personage fadet nooit
   in beeld: na de veeg staat het er gewoon.

   Placeholders: elk beeld wordt vooraf geprobeerd te laden (Image met
   onload/onerror, nooit een reject die de sequentie blokkeert). Lukt het
   niet, dan komt er een effen gekleurd vlak met een label ("KELDER",
   "SYBILLE", ...) in de plaats, en draait de scene gewoon door met
   correcte timing. Geluid wordt op dezelfde manier vooraf gecontroleerd;
   een ontbrekend geluidsbestand betekent gewoon stilte.
   ══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var DEFAULTS = {
    images: {
      kelder:   'locaties/heerdonatuslaan/kk-kelder-leeg.jpg',
      sybille:  'locaties/heerdonatuslaan/kk-sybille-staand.jpg',
      aaltje:   'locaties/heerdonatuslaan/kk-aaltje-deur.jpg',
      gebroken: 'locaties/heerdonatuslaan/kk-sybille-geknield.jpg'
    },
    audio: {
      ambience:     'geluid/heerdonatuslaan/kk-ambience.mp3',
      lach:         'geluid/heerdonatuslaan/kk-lach.mp3',
      zwelling:     'geluid/heerdonatuslaan/kk-zwelling.mp3',
      deur:         'geluid/heerdonatuslaan/kk-deur.mp3',
      muziekdoosje: 'geluid/heerdonatuslaan/kk-muziekdoosje.mp3'
    },
    volumes: {
      ambience: 0.5,
      lach: 0.7,
      zwelling: 0.55,
      deur: 0.6,
      muziekdoosje: 0.35
    },
    // De omdraai-veeg: zo kort en zo onscherp dat je tijdens de beweging
    // niets ziet, waardoor de beelden niet op elkaar hoeven aan te sluiten.
    veeg: {
      duur: 350,          // ms totaal (blur op, wissel, blur af)
      blur: 16            // px onscherpte op het diepste punt
    },
    // Langzame doordrift tijdens elke hold: lichte zoom plus een minieme
    // pan, anders bevriest het beeld als een diavoorstelling. De pan
    // wisselt per beeld van richting.
    drift: {
      schaal: 1.05,       // zoomfactor aan het eind van de drift
      panAfstand: 1.2,    // % van de beeldbreedte, wordt begrensd op wat bij de schaal veilig is
      duur: 30000         // ms; ruim langer dan elke hold, zodat het nooit stilvalt
    },
    tekstFadeDuur: 600,   // ms in-/uitfaden van een app-tekst
    // Beat 1, aankomst: kelder leeg, alleen ambience.
    beat1: {
      ambienceFadeIn: 1500,
      tekstVertraging: 2600,   // wachten voor de app-tekst opkomt
      tekstDuur: 5200,         // hoe lang de app-tekst blijft staan
      naTekst: 1200            // rust na het wegfaden, dan beat 2
    },
    // Beat 2, het gelach: beeld blijft staan, geluid stuurt de blik.
    beat2: {
      lachVertraging: 900,     // stilte voor het lachje
      tekstVertraging: 2200,   // een tel niets na het lachje, dan de tekst
      tekstDuur: 4600,
      naTekst: 1200,
      ambienceFadeUit: 1100,   // ambience valt weg VOOR de onthulling
      stilteVoorVeeg: 900      // volledige stilte, dan pas de veeg van beat 3
    },
    // Beat 3, de onthulling: veeg, stilte, dan pas de zwelling en de tekst.
    beat3: {
      zwellingVertraging: 1500, // na het beeld, niet erop: daar zit het effect
      tekstVertraging: 3400,    // app-tekst pas na de zwelling
      tekstDuur: 3600,
      naTekst: 900
    },
    // Beat 4 is volledig klik-gestuurd (de monoloog), geen eigen timing.
    // Beat 5, Aaltje: klein geluid bij de deur, dan de veeg.
    beat5: {
      deurVertraging: 700,     // na de laatste klik van beat 4
      veegVertraging: 1500     // na het deurgeluid, dan de veeg
    },
    // Beat 6, de breuk: terug naar Sybille, dan gezakt door haar knieen.
    beat6: {
      terugVeegVertraging: 600, // na de laatste klik van beat 5
      veegVertraging: 700,      // na Sybille's regel, dan de veeg omlaag
      stilte: 4200              // lange stilte op het gebroken beeld
    },
    // Beat 7, traag naar zwart en de slottekst.
    beat7: {
      geluidWegDuur: 800,
      zwartDuur: 4500,          // traag naar zwart
      tekstVertraging: 5000,    // ruim zwart aanhouden, dan pas de tekst
      tekstDuur: 6000           // tekst blijft staan; hierna de callback
    },
    dialoog: {
      boxBreedte: 46,           // % van de schermbreedte
      regelFadeDuur: 350        // ms in-/uitfaden van een regel
    },
    // Kleurregeling per beeld (de beelden zijn donker; dat werkt anders op
    // tablet dan op laptop). helderheid/contrast 1 = ongewijzigd.
    // schaduwlicht tilt alleen de donkerste delen op (gamma-kromme, zie
    // _pasKleurToe), in tegenstelling tot helderheid die alles optelt.
    kleur: {
      kelder:   { helderheid: 1, contrast: 1, schaduwlicht: 1 },
      sybille:  { helderheid: 1, contrast: 1, schaduwlicht: 1 },
      aaltje:   { helderheid: 1, contrast: 1, schaduwlicht: 1 },
      gebroken: { helderheid: 1, contrast: 1, schaduwlicht: 1 }
    },
    // Pulserende gloed rond de blauwe roos (optioneel, gloed.aan = false
    // zet alles uit). Posities als fractie (0..1) van het beeld zelf, dus
    // onafhankelijk van drift of schermformaat. In beat 6 dooft de gloed
    // langzaam uit zodra de roos uit haar hand gegleden is.
    gloed: {
      aan: true,
      kleur: '#4aa8ff',
      grootte: 90,          // px doorsnee
      dekking: 0.55,        // 0..1, dekking op het hoogtepunt van de puls
      scherpte: 0.4,        // 0 = zacht uitgewaaierd, 1 = strakke rand
      kernAandeel: 0.25,    // 0..1, aandeel van de straal dat egale kern is
      pulsTempo: 4200,      // ms voor een volledige ademhaling
      pulsDiepte: 0.45,     // 0..1, hoe ver de dekking terugzakt in het dal
      doofDuur: 3000,       // ms uitdoven in beat 6
      posities: {
        sybille:  { x: 0.5, y: 0.55 },   // de roos in haar hand
        gebroken: { x: 0.5, y: 0.8 }     // de roos op de stenen vloer
      }
    },
    sprekerNamen: { sybille: 'Sybille', aaltje: 'Aaltje' },
    // App-teksten: innerlijke stem in de je-vorm, gecentreerd, geen box.
    appTeksten: {
      beat1: 'De kelder is verlaten. Alleen je eigen adem, en het druppen ergens in het donker. Toch loop je verder.',
      beat2: 'Ergens vlakbij. Iemand lacht. Het staat je niet aan.',
      beat3: 'Ze stond er al.',
      beat7: 'Ga naar het podium.'
    },
    // De dialoogregels. wie: 'sybille' | 'aaltje'. deel ('voor'/'na') is
    // alleen voor beat 6, die halverwege een veeg en een lange stilte
    // heeft. effect: 'muziekdoosje' start het optionele flardje muziek.
    regels: [
      { beat: 4, wie: 'sybille', tekst: 'Jullie hadden hier niet moeten komen. Maar goed. Dan horen jullie het maar.' },
      { beat: 4, wie: 'sybille', tekst: 'Mijn man ging elke avond het huis uit. Naar een vrouw die telkens terugkwam, en telkens weg was voor ik thuiskwam. Dus heb ik de molen laten branden. Met hem erin. En mijn zusters lieten me zien dat ik gelijk had.' },
      { beat: 4, wie: 'sybille', tekst: 'En nu heb ik dit. (ze heft de blauwe roos) Jullie weten wat één zo\'n roos kan. Ga zitten. Het is nog niet voorbij.' },
      { beat: 5, wie: 'aaltje',  tekst: 'Sybille.' },
      { beat: 5, wie: 'aaltje',  tekst: 'Ik liep achter deze mensen aan. Ik wilde dat meisje bedanken voor het doosje.' },
      { beat: 5, wie: 'aaltje',  effect: 'muziekdoosje', tekst: 'Maar ik hoorde wat je zei. En het bracht me terug. Mijn moeder maakte muziekdoosjes. Op een avond kwam ze thuis en ze kon niet ophouden met huilen. Ze was bij een molenaar geweest. Hij liet haar avond na avond komen, in het geheim, om iets moois in elkaar te zetten. Een doosje. Voor zijn vrouw. Voor jou.' },
      { beat: 5, wie: 'aaltje',  tekst: 'Er was geen andere vrouw, Sybille. Er was alleen een man die je wilde verrassen.' },
      { beat: 6, deel: 'voor', wie: 'sybille', tekst: 'Nee. Dat kan niet. Ze hebben me... mijn zusters hebben me...' },
      { beat: 6, deel: 'na',   wie: 'sybille', tekst: 'Ga. Naar het podium. Daar gaat het gebeuren. Ik moest jullie tegenhouden, meer niet.' },
      { beat: 6, deel: 'na',   wie: 'aaltje',  tekst: 'Ga maar, vrienden. Ik blijf bij haar.' }
    ]
  };

  // Placeholder-vlakken: label plus vaste, herkenbare kleur per beeld,
  // zodat de hele scene op effen vlakken af te stellen is voordat de
  // echte beelden er zijn.
  var PLACEHOLDER_INFO = {
    kelder:   { label: 'KELDER',           kleur: '#1e2420' },
    sybille:  { label: 'SYBILLE',          kleur: '#2b1e26' },
    aaltje:   { label: 'AALTJE',           kleur: '#232134' },
    gebroken: { label: 'SYBILLE GEBROKEN', kleur: '#2b201b' }
  };

  // ── Kleine hulpjes ──────────────────────────────────────────────
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // Diepe merge: opts overschrijft alleen de velden die het zelf heeft,
  // de rest komt uit DEFAULTS. De basis wordt echt diep gekopieerd, zodat
  // instanties nooit geneste objecten (en dus elkaars wijzigingen) delen.
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

  function hexNaarRgb(hex) {
    hex = String(hex).replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    var getal = parseInt(hex, 16);
    return { r: (getal >> 16) & 255, g: (getal >> 8) & 255, b: getal & 255 };
  }

  // Iets lichtere tint van een hex-kleur, voor het hart van de radiale
  // gradient op een placeholder-vlak: zonder wat lichtval is de drift en
  // de veeg op een egaal vlak niet te zien, en dan valt er niets te timen.
  function lichter(hex, factor) {
    var rgb = hexNaarRgb(hex);
    var f = clamp(factor, 0, 1);
    var r = Math.round(rgb.r + (255 - rgb.r) * f);
    var g = Math.round(rgb.g + (255 - rgb.g) * f);
    var b = Math.round(rgb.b + (255 - rgb.b) * f);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  // Radiale gradient voor de gloed-cirkel; zelfde opzet als de rozen-gloed
  // in de woudscene (egale kern, instelbare uitloop).
  function maakGloedGradient(kleurHex, kernAandeel, scherpte) {
    var rgb = hexNaarRgb(kleurHex);
    var kernPct = clamp(kernAandeel, 0, 0.95) * 100;
    var uitloop = Math.max(4, (1 - clamp(scherpte, 0, 1)) * (100 - kernPct));
    var randPct = Math.min(100, kernPct + uitloop);
    var vol = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',1)';
    var leeg = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0)';
    return 'radial-gradient(circle, ' + vol + ' 0%, ' + vol + ' ' + kernPct + '%, ' + leeg + ' ' + randPct + '%)';
  }

  // Maximale pan (in %, zelfde eenheid als drift.panAfstand) die bij een
  // gegeven zoomfactor nog veilig is; zelfde afleiding als in de
  // woudscene: groter en de rand van de afbeelding schuift in beeld.
  function maxPanVoorSchaal(schaal) {
    return 50 * (schaal - 1) / schaal;
  }

  function KerkkelderScene(container, opts) {
    this.container = (typeof container === 'string') ? document.querySelector(container) : container;
    this.config = diepeMerge(DEFAULTS, opts || {});
    this.el = null;                // root-element van de scene
    this._laag = null;             // de ene beeld-laag (elke wissel zit onder een veeg)
    this._tekstLaag = null;        // app-teksten en dialoogbox
    this._zwartLaag = null;        // beat 7
    this._beeld = null;            // huidig .kk-beeld element
    this._huidigBeeldKey = null;   // kelder/sybille/aaltje/gebroken
    this._driftRichting = 1;       // pan wisselt per beeld van kant
    this._gestopt = true;          // true na destroy() of voor start()
    this._gepauzeerd = false;
    this._running = false;
    this._actieveTimers = [];      // pauzeerbare setTimeout-descriptors (zie _setTimeout)
    this._actieveFades = [];       // pauzeerbare audio-fade-descriptors
    this._audio = {};              // key -> Audio-instantie (persistent, geen vroege GC)
    this._beeldStatus = {};        // src -> true (geladen) / false (placeholder)
    this._audioStatus = {};        // src -> true (bestaat) / false (ontbreekt)
    this._voorgeladen = false;
    this._huidigeBeat = null;      // { naam, voorToestand, actie }
    this._dialoogActief = false;
    this._dialoogLijst = null;
    this._dialoogIndex = 0;
    this._dialoogKlaarCb = null;
    this._klikHandler = null;
    this._gammaFilterId = 'kk-gamma-filter';
    this._gammaSvg = null;
    this._gammaFuncs = null;
    this._onKlaar = null;
  }

  // ── Voorladen ───────────────────────────────────────────────────
  // Probeert elk bestand te laden en onthoudt alleen of het lukte.
  // Rejecteert nooit: een ontbrekend bestand mag de scene niet blokkeren.
  KerkkelderScene.prototype._laadBeeld = function (src) {
    var self = this;
    return new Promise(function (resolve) {
      if (self._beeldStatus.hasOwnProperty(src)) { resolve(); return; }
      var img = new Image();
      img.onload = function () { self._beeldStatus[src] = true; resolve(); };
      img.onerror = function () { self._beeldStatus[src] = false; resolve(); };
      img.src = src;
    });
  };

  KerkkelderScene.prototype._laadGeluid = function (src) {
    var self = this;
    return new Promise(function (resolve) {
      if (self._audioStatus.hasOwnProperty(src)) { resolve(); return; }
      var a = new Audio();
      a.oncanplaythrough = a.onloadedmetadata = function () { self._audioStatus[src] = true; resolve(); };
      a.onerror = function () { self._audioStatus[src] = false; resolve(); };
      a.src = src;
    });
  };

  KerkkelderScene.prototype._voorladen = function (cb) {
    var self = this;
    var im = this.config.images;
    var au = this.config.audio;
    var paden = Object.keys(im).map(function (k) { return self._laadBeeld(im[k]); })
      .concat(Object.keys(au).map(function (k) { return self._laadGeluid(au[k]); }));
    Promise.all(paden).then(function () {
      self._voorgeladen = true;
      if (typeof cb === 'function') cb();
    });
  };

  // ── DOM opbouwen ────────────────────────────────────────────────
  KerkkelderScene.prototype._build = function () {
    if (this.el || !this.container) return;
    if (getComputedStyle(this.container).position === 'static') {
      this.container.style.position = 'relative';
    }
    var el = document.createElement('div');
    el.className = 'kk-root';
    el.innerHTML =
      '<div class="kk-laag"></div>' +
      '<div class="kk-zwartlaag"></div>' +
      '<div class="kk-tekstlaag"></div>';
    this.container.appendChild(el);
    this.el = el;
    this._laag = el.querySelector('.kk-laag');
    this._zwartLaag = el.querySelector('.kk-zwartlaag');
    this._tekstLaag = el.querySelector('.kk-tekstlaag');

    // Een klikvanger over de hele scene: tijdens een dialoog zet elke tik
    // een regel door, daarbuiten doet klikken niets.
    var self = this;
    this._klikHandler = function () { self._dialoogKlik(); };
    el.addEventListener('click', this._klikHandler);
  };

  // Vult de beeld-laag met het gegeven beeld (of een placeholder-vlak met
  // label), past de kleurregeling van dat beeld toe, bouwt de gloed als
  // die op dit beeld hoort, en start de doordrift.
  // opts: { blur: px beginonscherpte, ontblurDuur: ms om naar scherp te
  //         faden (voor de tweede helft van een veeg), gloedUit: true om
  //         de gloed meteen gedoofd te tonen (beat 7 na een sprong) }
  KerkkelderScene.prototype._vulBeeld = function (key, opts) {
    opts = opts || {};
    var src = this.config.images[key];
    var beeld = document.createElement('div');
    beeld.className = 'kk-beeld';
    if (this._beeldStatus[src]) {
      beeld.style.backgroundImage = 'url("' + src + '")';
    } else {
      var info = PLACEHOLDER_INFO[key] || { label: key.toUpperCase(), kleur: '#242424' };
      var naam = src.split('/').pop();
      beeld.classList.add('kk-beeld-placeholder');
      beeld.style.background =
        'radial-gradient(ellipse at 50% 42%, ' + lichter(info.kleur, 0.14) + ' 0%, ' +
        info.kleur + ' 58%, #070503 100%)';
      beeld.innerHTML =
        '<div class="kk-ph-label"></div>' +
        '<div class="kk-ph-bestand"></div>';
      beeld.querySelector('.kk-ph-label').textContent = info.label;
      beeld.querySelector('.kk-ph-bestand').textContent = '[Placeholder: ' + naam + ']';
    }
    this._laag.innerHTML = '';
    this._laag.appendChild(beeld);
    this._beeld = beeld;
    this._huidigBeeldKey = key;
    this._pasKleurToe(key);
    this._bouwGloed(beeld, key, !!opts.gloedUit);

    // Beginstand direct (zonder transitie) neerzetten, dan de doordrift en
    // een eventueel ontblur-verloop starten. De reflow ertussen is nodig,
    // anders voegt de browser beide stijlwijzigingen samen en start de
    // drift vanaf de eindstand.
    beeld.style.transition = 'none';
    beeld.style.transform = 'scale(1) translateX(0%)';
    beeld.style.filter = 'blur(' + (opts.blur || 0) + 'px)';
    void beeld.offsetWidth;

    var drift = this.config.drift;
    var overgangen = ['transform ' + drift.duur + 'ms linear'];
    if (opts.ontblurDuur) overgangen.push('filter ' + opts.ontblurDuur + 'ms ease-out');
    beeld.style.transition = overgangen.join(', ');
    this._driftRichting = -this._driftRichting;
    var pan = Math.min(Math.abs(drift.panAfstand), maxPanVoorSchaal(drift.schaal)) * this._driftRichting;
    beeld.style.transform = 'scale(' + drift.schaal + ') translateX(' + pan + '%)';
    if (opts.ontblurDuur) beeld.style.filter = 'blur(0px)';
    return beeld;
  };

  // De omdraai-veeg: onscherpte op, beeldwissel op het diepste punt,
  // onscherpte af. Tijdens de beweging zie je niets, dus de beelden hoeven
  // niet op elkaar aan te sluiten; het nieuwe beeld "staat er gewoon".
  KerkkelderScene.prototype._veegNaar = function (key, cb) {
    var self = this;
    var cfg = this.config.veeg;
    var half = Math.max(1, Math.round(cfg.duur / 2));
    if (this._beeld) {
      // De transform-overgang moet in de lijst blijven staan: valt hij
      // weg, dan annuleert de browser de lopende drift en springt het
      // beeld in een klap naar de drift-eindstand, precies op het moment
      // dat de veeg nog scherp in beeld is (empirisch vastgesteld).
      this._beeld.style.transition =
        'transform ' + this.config.drift.duur + 'ms linear, filter ' + half + 'ms ease-in';
      this._beeld.style.filter = 'blur(' + cfg.blur + 'px)';
    }
    this._setTimeout(function () {
      self._vulBeeld(key, { blur: cfg.blur, ontblurDuur: half });
    }, half);
    this._setTimeout(function () { if (typeof cb === 'function') cb(); }, cfg.duur);
  };

  // ── Kleurregeling (helderheid/contrast/schaduwlicht per beeld) ──
  // Voor schaduwlicht (donkerste delen optillen zonder de rest grauw te
  // maken) bestaat geen standaard CSS-filter: dat is een gamma-kromme via
  // een verborgen SVG feComponentTransfer-filter, gecombineerd met de
  // gewone brightness()/contrast() op hetzelfde element.
  KerkkelderScene.prototype._maakGammaFilter = function () {
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

  KerkkelderScene.prototype._pasKleurToe = function (key) {
    if (!this.el) return;
    var k = this.config.kleur[key];
    if (!k) return;
    this._maakGammaFilter();
    var exponent = 1 / Math.max(0.01, k.schaduwlicht);
    this._gammaFuncs.forEach(function (f) { f.setAttribute('exponent', exponent); });
    this.el.style.filter =
      'url(#' + this._gammaFilterId + ') brightness(' + k.helderheid + ') contrast(' + k.contrast + ')';
  };

  // ── Roos-gloed ──────────────────────────────────────────────────
  // Kind van het beeld-element, zodat hij automatisch meebeweegt met de
  // drift en mee vervaagt in een veeg. Eén gloed per beeld, alleen op de
  // beelden waar de blauwe roos in beeld is.
  KerkkelderScene.prototype._bouwGloed = function (beeld, key, meteenUit) {
    var cfg = this.config.gloed;
    if (!cfg.aan) return;
    var pos = cfg.posities[key];
    if (!pos) return;
    var el = document.createElement('div');
    el.className = 'kk-gloed';
    el.dataset.kkKey = key;
    this._zetGloedStijl(el, pos);
    if (meteenUit) {
      el.style.animationName = 'none';
      el.style.opacity = '0';
    }
    beeld.appendChild(el);
  };

  KerkkelderScene.prototype._zetGloedStijl = function (el, pos) {
    var cfg = this.config.gloed;
    var max = clamp(cfg.dekking, 0, 1);
    var min = Math.max(0, max * (1 - cfg.pulsDiepte));
    el.style.left = (pos.x * 100) + '%';
    el.style.top = (pos.y * 100) + '%';
    el.style.width = cfg.grootte + 'px';
    el.style.height = cfg.grootte + 'px';
    el.style.background = maakGloedGradient(cfg.kleur, cfg.kernAandeel, cfg.scherpte);
    el.style.setProperty('--kk-gloed-max', max);
    el.style.setProperty('--kk-gloed-min', min);
    el.style.animationDuration = cfg.pulsTempo + 'ms';
  };

  // Live bijstellen vanuit het debugpaneel, zonder de scene te herstarten.
  // Een gloed die in beat 6 al gedoofd is (opacity 0, animatie uit) wordt
  // hier bewust niet opnieuw aangezet.
  KerkkelderScene.prototype._verversGloeden = function () {
    if (!this.el) return;
    var self = this;
    var cfg = this.config.gloed;
    var els = this.el.querySelectorAll('.kk-gloed');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!cfg.aan) { el.style.display = 'none'; continue; }
      el.style.display = '';
      var pos = cfg.posities[el.dataset.kkKey];
      if (pos) self._zetGloedStijl(el, pos);
    }
    // Gloed aangezet terwijl het huidige beeld er nog geen heeft: alsnog
    // bouwen, zodat de aan/uit-knop in het paneel direct effect heeft.
    if (cfg.aan && this._beeld && this._huidigBeeldKey &&
        cfg.posities[this._huidigBeeldKey] && !this._beeld.querySelector('.kk-gloed')) {
      this._bouwGloed(this._beeld, this._huidigBeeldKey, false);
    }
  };

  // Beat 6: de roos is uit haar hand gegleden, de gloed dooft langzaam.
  KerkkelderScene.prototype._doofGloed = function (duur) {
    if (!this.el) return;
    var els = this.el.querySelectorAll('.kk-gloed');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      // De puls-animatie moet er echt af, anders wint hij van de transitie.
      el.style.animationName = 'none';
      el.style.transition = 'opacity ' + duur + 'ms ease-out';
      el.style.opacity = '0';
    }
  };

  // ── Geluid ──────────────────────────────────────────────────────
  // Eén persistente Audio-instantie per key (geen losse new Audio()
  // zonder referentie, die kan de browser halverwege opruimen). Een
  // ontbrekend bestand betekent gewoon stilte, nooit een fout.
  KerkkelderScene.prototype._speel = function (key, opts) {
    opts = opts || {};
    var src = this.config.audio[key];
    if (!src || this._audioStatus[src] === false) return null;
    var vol = (opts.volume != null) ? opts.volume : (this.config.volumes[key] || 0.5);
    try {
      var a = new Audio(src);
      a.volume = clamp(vol, 0, 1);
      a.loop = !!opts.loop;
      this._audio[key] = a;
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
      return a;
    } catch (e) { return null; }
  };

  // Fade-intervallen zijn pauzeerbaar: pause() zet het interval stil,
  // resume() herstart dezelfde tick-sluiting (die zijn eigen teller nog
  // onthoudt), zodat de fade precies verdergaat waar hij was.
  KerkkelderScene.prototype._faadIn = function (audioEl, doelVol, duurMs) {
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

  KerkkelderScene.prototype._faadUit = function (audioEl, duurMs) {
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

  // Start (of herstart) de kelder-ambience als loop. Draait hij al, dan
  // wordt alleen het volume gelijkgetrokken; zo kan beat 2 naadloos op
  // beat 1 volgen, maar staat er ook meteen geluid na een sprong.
  KerkkelderScene.prototype._zorgAmbience = function (fadeInMs) {
    var doel = this.config.volumes.ambience;
    var a = this._audio.ambience;
    if (a && !a.paused) { a.volume = clamp(doel, 0, 1); return; }
    if (fadeInMs) {
      a = this._speel('ambience', { volume: 0, loop: true });
      if (a) this._faadIn(a, doel, fadeInMs);
    } else {
      this._speel('ambience', { loop: true });
    }
  };

  KerkkelderScene.prototype._stopAlleAudio = function () {
    Object.keys(this._audio).forEach(function (k) {
      var a = this._audio[k];
      if (!a) return;
      try { a.pause(); } catch (e) {}
    }, this);
    this._audio = {};
  };

  // ── Pauzeerbare timers ──────────────────────────────────────────
  // pause() onthoudt hoeveel er nog resteerde en wist de setTimeout;
  // resume() plant hem opnieuw met precies dat restant.
  KerkkelderScene.prototype._setTimeout = function (fn, ms) {
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

  KerkkelderScene.prototype._alleTimersWissen = function () {
    this._actieveTimers.forEach(function (t) { if (t.rawId != null) clearTimeout(t.rawId); });
    this._actieveTimers = [];
    this._actieveFades.forEach(function (f) { if (f.rawId != null) clearInterval(f.rawId); });
    this._actieveFades = [];
  };

  // ── Pauze/hervat ────────────────────────────────────────────────
  // Bevriest de scene exact waar hij staat: CSS-transities en -animaties
  // via de Web Animations API (native pauzeren op het huidige frame), de
  // timer-keten van de sequencer, de audio-fades en al het geluid.
  KerkkelderScene.prototype.pause = function () {
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

    return this;
  };

  KerkkelderScene.prototype.resume = function () {
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

    return this;
  };

  KerkkelderScene.prototype.togglePause = function () {
    if (this._gepauzeerd) this.resume(); else this.pause();
    return this._gepauzeerd;
  };

  // ── Beats registreren en herhalen ───────────────────────────────
  // Elke beat registreert zichzelf met een voorToestand-functie (zet het
  // toneel neer zoals het er aan het begin van die beat uitziet) en de
  // beat-actie zelf. In de normale ketting is het toneel al goed en draait
  // alleen de actie; bij een sprong (goTo) of een herhaling draait eerst
  // de voorToestand, zodat de beat altijd deterministisch begint.
  KerkkelderScene.prototype._merkBeat = function (naam, voorToestandFn, actieFn, metVoorToestand) {
    this._huidigeBeat = { naam: naam, voorToestand: voorToestandFn, actie: actieFn };
    if (metVoorToestand && typeof voorToestandFn === 'function') voorToestandFn();
    actieFn();
  };

  KerkkelderScene.prototype.herhaalHuidigeBeat = function () {
    var b = this._huidigeBeat;
    if (!b) return this;
    if (this._gepauzeerd) this.resume();
    // Lopende timers en geluiden van de (deels) gespeelde beat moeten weg,
    // anders vuurt de rest van de oude doorloop dwars door de herhaling.
    this._alleTimersWissen();
    this._stopAlleAudio();
    this._dialoogActief = false;
    this._resetOverlays();
    if (typeof b.voorToestand === 'function') b.voorToestand();
    b.actie();
    return this;
  };

  KerkkelderScene.prototype._resetOverlays = function () {
    if (this._zwartLaag) {
      this._zwartLaag.style.transition = 'none';
      this._zwartLaag.style.opacity = '0';
    }
    if (this._tekstLaag) this._tekstLaag.innerHTML = '';
    if (this.el) this.el.classList.remove('kk-klikbaar');
  };

  // ── Publieke API ────────────────────────────────────────────────
  KerkkelderScene.prototype.start = function (onKlaar) {
    var self = this;
    this._onKlaar = onKlaar || this._onKlaar;
    this._gestopt = false;
    this._gepauzeerd = false;
    this._running = true;
    this._build();
    this._voorladen(function () {
      if (self._gestopt) return;
      self._beat1(true);
    });
    return this;
  };

  KerkkelderScene.prototype.replay = function (onKlaar) {
    return this.goTo(1, onKlaar);
  };

  KerkkelderScene.prototype.goTo = function (beat, onKlaar) {
    var self = this;
    beat = Math.max(1, Math.min(7, Math.round(beat) || 1));
    this._alleTimersWissen();
    this._stopAlleAudio();
    this._onKlaar = onKlaar || this._onKlaar;
    this._gestopt = false;
    this._gepauzeerd = false;
    this._running = true;
    this._dialoogActief = false;
    this._build();
    this._resetOverlays();
    this._voorladen(function () {
      if (self._gestopt) return;
      self['_beat' + beat](true);
    });
    return this;
  };

  KerkkelderScene.prototype.set = function (pad, waarde) {
    var delen = pad.split('.');
    var obj = this.config;
    for (var i = 0; i < delen.length - 1; i++) {
      if (!obj[delen[i]]) return this;
      obj = obj[delen[i]];
    }
    obj[delen[delen.length - 1]] = waarde;
    // Live doorvoeren waar dat direct zichtbaar of hoorbaar is.
    if (delen[0] === 'kleur' && delen[1] === this._huidigBeeldKey) {
      this._pasKleurToe(delen[1]);
    }
    if (delen[0] === 'gloed') {
      this._verversGloeden();
    }
    if (delen[0] === 'volumes' && this._audio[delen[1]] && !this._audio[delen[1]].paused) {
      this._audio[delen[1]].volume = clamp(waarde, 0, 1);
    }
    if (pad === 'dialoog.boxBreedte' && this._tekstLaag) {
      var box = this._tekstLaag.querySelector('.kk-dialoogbox');
      if (box) box.style.width = waarde + '%';
    }
    return this;
  };

  KerkkelderScene.prototype.getConfig = function () {
    return diepeKopie(this.config);
  };

  KerkkelderScene.prototype.destroy = function () {
    this._gestopt = true;
    this._gepauzeerd = false;
    this._running = false;
    this._alleTimersWissen();
    this._stopAlleAudio();
    if (this._gammaSvg && this._gammaSvg.parentNode) this._gammaSvg.parentNode.removeChild(this._gammaSvg);
    this._gammaSvg = null;
    this._gammaFuncs = null;
    if (this.el && this._klikHandler) this.el.removeEventListener('click', this._klikHandler);
    this._klikHandler = null;
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = this._laag = this._tekstLaag = this._zwartLaag = this._beeld = null;
    this._huidigeBeat = null;
  };

  // ── App-teksten ─────────────────────────────────────────────────
  KerkkelderScene.prototype._toonAppTekst = function (tekst, opZwart) {
    if (!this._tekstLaag) return;
    this._tekstLaag.innerHTML = '';
    var el = document.createElement('div');
    el.className = 'kk-apptekst' + (opZwart ? ' kk-op-zwart' : '');
    el.textContent = tekst;
    el.style.transition = 'opacity ' + this.config.tekstFadeDuur + 'ms ease';
    this._tekstLaag.appendChild(el);
    void el.offsetWidth;
    el.classList.add('zichtbaar');
  };

  KerkkelderScene.prototype._verbergAppTekst = function () {
    if (!this._tekstLaag) return;
    var self = this;
    var el = this._tekstLaag.querySelector('.kk-apptekst');
    if (!el) return;
    el.classList.remove('zichtbaar');
    this._setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, this.config.tekstFadeDuur);
  };

  // ── Dialoog ─────────────────────────────────────────────────────
  KerkkelderScene.prototype._regelsVoorBeat = function (beatNr, deel) {
    return this.config.regels.filter(function (r) {
      if (r.beat !== beatNr) return false;
      if (deel && r.deel !== deel) return false;
      return true;
    });
  };

  KerkkelderScene.prototype._speelDialoog = function (lijst, cb) {
    if (!lijst || !lijst.length) { if (typeof cb === 'function') cb(); return; }
    this._dialoogLijst = lijst;
    this._dialoogIndex = 0;
    this._dialoogKlaarCb = cb;
    this._dialoogActief = true;
    if (this.el) this.el.classList.add('kk-klikbaar');
    this._toonDialoogRegel(lijst[0]);
  };

  KerkkelderScene.prototype._toonDialoogRegel = function (regel) {
    if (!this._tekstLaag) return;
    var cfg = this.config.dialoog;

    // Het muziekdoosje-flardje: start op de gemarkeerde regel, en zakt op
    // de eerstvolgende regel zonder markering weer weg.
    if (regel.effect === 'muziekdoosje') {
      this._speel('muziekdoosje');
    } else if (this._audio.muziekdoosje && !this._audio.muziekdoosje.paused) {
      this._faadUit(this._audio.muziekdoosje, 900);
    }

    this._tekstLaag.innerHTML = '';
    var box = document.createElement('div');
    box.className = 'kk-dialoogbox';
    box.style.width = cfg.boxBreedte + '%';
    box.innerHTML =
      '<div class="kk-dialoog-pijl"></div>' +
      '<div class="kk-dialoog-spreker"></div>' +
      '<p class="kk-dialoog-tekst"></p>' +
      '<div class="kk-dialoog-verder">&#9660;</div>';
    box.querySelector('.kk-dialoog-spreker').textContent = this.config.sprekerNamen[regel.wie] || regel.wie;
    box.querySelector('.kk-dialoog-tekst').textContent = regel.tekst;
    box.style.transition = 'opacity ' + cfg.regelFadeDuur + 'ms ease';
    this._tekstLaag.appendChild(box);
    void box.offsetWidth;
    box.classList.add('zichtbaar');
  };

  KerkkelderScene.prototype._dialoogKlik = function () {
    if (!this._dialoogActief || this._gepauzeerd || this._gestopt) return;
    var self = this;
    this._dialoogIndex++;
    if (this._dialoogIndex < this._dialoogLijst.length) {
      this._toonDialoogRegel(this._dialoogLijst[this._dialoogIndex]);
      return;
    }
    // Laatste regel gehad: box uitfaden en dan pas verder, zodat het
    // vervolg (een veeg, een stilte) niet dwars door de tekst valt.
    this._dialoogActief = false;
    if (this.el) this.el.classList.remove('kk-klikbaar');
    if (this._audio.muziekdoosje && !this._audio.muziekdoosje.paused) {
      this._faadUit(this._audio.muziekdoosje, 900);
    }
    var box = this._tekstLaag && this._tekstLaag.querySelector('.kk-dialoogbox');
    var cb = this._dialoogKlaarCb;
    this._dialoogKlaarCb = null;
    if (box) box.classList.remove('zichtbaar');
    this._setTimeout(function () {
      if (box && box.parentNode) box.parentNode.removeChild(box);
      if (typeof cb === 'function') cb();
    }, this.config.dialoog.regelFadeDuur);
  };

  // ── Beat 1, aankomst ────────────────────────────────────────────
  // Kelder leeg, lichte doordrift, alleen ambience. De app-tekst komt op
  // en fadet weer weg; verder gebeurt er niets. Dat is de bedoeling.
  KerkkelderScene.prototype._beat1 = function (sprong) {
    var self = this;
    var cfg = this.config.beat1;
    this._merkBeat('1-aankomst', function () {
      self._vulBeeld('kelder');
    }, function () {
      self._zorgAmbience(cfg.ambienceFadeIn);
      self._setTimeout(function () {
        self._toonAppTekst(self.config.appTeksten.beat1);
      }, cfg.tekstVertraging);
      self._setTimeout(function () {
        self._verbergAppTekst();
      }, cfg.tekstVertraging + cfg.tekstDuur);
      self._setTimeout(function () {
        self._beat2();
      }, cfg.tekstVertraging + cfg.tekstDuur + cfg.naTekst);
    }, sprong);
  };

  // ── Beat 2, het gelach ──────────────────────────────────────────
  // Geen beeldwissel. Geluid eerst, dan een tel niets, dan pas de tekst.
  // Daarna valt de ambience weg en volgt volledige stilte voor de veeg.
  KerkkelderScene.prototype._beat2 = function (sprong) {
    var self = this;
    var cfg = this.config.beat2;
    this._merkBeat('2-gelach', function () {
      self._vulBeeld('kelder');
      self._zorgAmbience(0);
    }, function () {
      var t = cfg.lachVertraging;
      self._setTimeout(function () { self._speel('lach'); }, t);
      t += cfg.tekstVertraging;
      self._setTimeout(function () {
        self._toonAppTekst(self.config.appTeksten.beat2);
      }, t);
      t += cfg.tekstDuur;
      self._setTimeout(function () { self._verbergAppTekst(); }, t);
      t += cfg.naTekst;
      self._setTimeout(function () {
        if (self._audio.ambience) self._faadUit(self._audio.ambience, cfg.ambienceFadeUit);
      }, t);
      t += cfg.ambienceFadeUit + cfg.stilteVoorVeeg;
      self._setTimeout(function () { self._beat3(); }, t);
    }, sprong);
  };

  // ── Beat 3, Sybille staat er ────────────────────────────────────
  // De veeg zelf, in volledige stilte. Geen tekst op de onthulling; de
  // lage zwelling komt pas ruim na het beeld, en de tekst pas daarna.
  KerkkelderScene.prototype._beat3 = function (sprong) {
    var self = this;
    var cfg = this.config.beat3;
    this._merkBeat('3-onthulling', function () {
      self._vulBeeld('kelder');
    }, function () {
      self._veegNaar('sybille', function () {
        self._setTimeout(function () { self._speel('zwelling'); }, cfg.zwellingVertraging);
        self._setTimeout(function () {
          self._toonAppTekst(self.config.appTeksten.beat3);
        }, cfg.tekstVertraging);
        self._setTimeout(function () {
          self._verbergAppTekst();
        }, cfg.tekstVertraging + cfg.tekstDuur);
        self._setTimeout(function () {
          self._beat4();
        }, cfg.tekstVertraging + cfg.tekstDuur + cfg.naTekst);
      });
    }, sprong);
  };

  // ── Beat 4, Sybille's monoloog ──────────────────────────────────
  // Beeld blijft staan met lichte doordrift; de dialoog klikt door.
  KerkkelderScene.prototype._beat4 = function (sprong) {
    var self = this;
    this._merkBeat('4-monoloog', function () {
      self._vulBeeld('sybille');
    }, function () {
      self._speelDialoog(self._regelsVoorBeat(4), function () {
        self._beat5();
      });
    }, sprong);
  };

  // ── Beat 5, Aaltje in de deuropening ────────────────────────────
  // Het geluid komt eerst (dat stuurt de blik naar de deur), dan pas de
  // veeg, en Aaltje staat er gewoon.
  KerkkelderScene.prototype._beat5 = function (sprong) {
    var self = this;
    var cfg = this.config.beat5;
    this._merkBeat('5-aaltje', function () {
      self._vulBeeld('sybille');
    }, function () {
      self._setTimeout(function () { self._speel('deur'); }, cfg.deurVertraging);
      self._setTimeout(function () {
        self._veegNaar('aaltje', function () {
          self._speelDialoog(self._regelsVoorBeat(5), function () {
            self._beat6();
          });
        });
      }, cfg.deurVertraging + cfg.veegVertraging);
    }, sprong);
  };

  // ── Beat 6, Sybille breekt ──────────────────────────────────────
  // Terug naar Sybille voor haar ontkenning, dan de veeg omlaag: gezakt
  // door haar knieen, de roos uit haar hand gegleden. De gloed dooft, en
  // na een lange stilte volgen de laatste twee regels.
  KerkkelderScene.prototype._beat6 = function (sprong) {
    var self = this;
    var cfg = this.config.beat6;
    this._merkBeat('6-breuk', function () {
      self._vulBeeld('aaltje');
    }, function () {
      self._setTimeout(function () {
        self._veegNaar('sybille', function () {
          self._speelDialoog(self._regelsVoorBeat(6, 'voor'), function () {
            self._setTimeout(function () {
              self._veegNaar('gebroken', function () {
                self._doofGloed(self.config.gloed.doofDuur);
                self._setTimeout(function () {
                  self._speelDialoog(self._regelsVoorBeat(6, 'na'), function () {
                    self._beat7();
                  });
                }, cfg.stilte);
              });
            }, cfg.veegVertraging);
          });
        });
      }, cfg.terugVeegVertraging);
    }, sprong);
  };

  // ── Beat 7, zwart en slottekst ──────────────────────────────────
  // Traag naar zwart, ruim zwart aanhouden (dat dekt de fysieke
  // verplaatsing naar het podium af), dan de slottekst. Die blijft staan;
  // na tekstDuur komt de callback en neemt het spel het over.
  KerkkelderScene.prototype._beat7 = function (sprong) {
    var self = this;
    var cfg = this.config.beat7;
    this._merkBeat('7-zwart', function () {
      self._vulBeeld('gebroken', { gloedUit: true });
    }, function () {
      Object.keys(self._audio).forEach(function (k) {
        var a = self._audio[k];
        if (a && !a.paused) self._faadUit(a, cfg.geluidWegDuur);
      });
      self._zwartLaag.style.transition = 'opacity ' + cfg.zwartDuur + 'ms ease-in';
      void self._zwartLaag.offsetWidth;
      self._zwartLaag.style.opacity = '1';
      self._setTimeout(function () {
        self._toonAppTekst(self.config.appTeksten.beat7, true);
      }, cfg.zwartDuur + cfg.tekstVertraging);
      self._setTimeout(function () {
        self._running = false;
        self._stopAlleAudio();
        if (typeof self._onKlaar === 'function') self._onKlaar();
      }, cfg.zwartDuur + cfg.tekstVertraging + cfg.tekstDuur);
    }, sprong);
  };

  global.KerkkelderScene = KerkkelderScene;
})(typeof window !== 'undefined' ? window : this);
