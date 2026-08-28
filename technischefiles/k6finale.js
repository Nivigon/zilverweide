/* k6finale.js
   Kraaienkwartier finale cinematic, aanloop: beeld, geluid en een dwarrelend blad.
   Losse module naar voorbeeld van woudscene.js. IIFE met een object op window.

   Geluid:
   - wind.mp3 loopt vanaf het begin en valt weg zodra de deur vol open is (beat D).
   - kraai.mp3 speelt een keer af, standaard drie seconden na de start van de scene.
   - deur.mp3 start zodra de deur begint open te gaan (beat C1) en fade daarna uit.
   - woosh.mp3 speelt een keer af bij de inzoom naar binnen (beat E), naar zwart.

   Blad:
   - leaf1, leaf2 en leaf3 zijn drie standen van hetzelfde blad. Het blad maakt losse
     overtochten die aan een beat gekoppeld zijn. Elke overtocht loopt een keer, van
     een startpunt naar een eindpunt buiten beeld, en wisselt onderweg via cross-fade
     door de standen zodat het lijkt te draaien.
   - Standaard: bij de trede (beat A) van linksboven naar rechtsonder uit beeld, en bij
     de dichte deur (beat B) van linksonder naar rechtsonder, licht golvend.

   Alle getallen in STANDAARD zijn richtwaarden en overschrijfbaar via het debugpaneel
   of via window.K6Finale.config voordat de scene start.

   y is een verticale verschuiving in procenten. Positief schuift het beeld omlaag.
*/
(function () {
  'use strict';

  var STANDAARD = {
    beeldmap: 'locaties/kraaienkwartier/k6finale/',
    beats: [
      { id: 'A',  naam: 'Opstapje',    beeld: 'treden.jpg',   duur: 6000, fade: 0,    easing: 'ease-out',
        camVanScale: 1.65, camNaarScale: 1.20, camVanY: -12, camNaarY: 10 },

      { id: 'B',  naam: 'Deur dicht',  beeld: 'deurdicht.jpg', duur: 4500, fade: 1600, easing: 'linear',
        camVanScale: 1.08, camNaarScale: 1.13, camVanY: 0, camNaarY: 0 },

      { id: 'C1', naam: 'Op een kier', beeld: 'deurkier.jpg', duur: 2000, fade: 1800, easing: 'linear',
        camVanScale: 1.13, camNaarScale: 1.15, camVanY: 0, camNaarY: 0 },

      { id: 'C2', naam: 'Halfopen',    beeld: 'deurhalf.jpg', duur: 2000, fade: 1800, easing: 'linear',
        camVanScale: 1.15, camNaarScale: 1.17, camVanY: 0, camNaarY: 0 },

      { id: 'C3', naam: 'Vol open',    beeld: 'deuropen.jpg', duur: 2000, fade: 1800, easing: 'linear',
        camVanScale: 1.17, camNaarScale: 1.20, camVanY: 0, camNaarY: 0 },

      { id: 'D',  naam: 'De stilte',   beeld: 'deuropen.jpg', duur: 3500, fade: 0,    easing: 'linear',
        camVanScale: 1.20, camNaarScale: 1.30, camVanY: 0, camNaarY: 0 },

      { id: 'E',  naam: 'Naar binnen', beeld: 'deuropen.jpg', duur: 700, fade: 0,    easing: 'ease-in',
        camVanScale: 1.30, camNaarScale: 4.60, camVanY: 0, camNaarY: 0,
        zwartStart: 250, zwartDuur: 450 }
    ],
    vonken: {
      x: 20,             // haardpositie horizontaal in procenten
      y: 66,             // haardpositie verticaal, waar de vlammen zijn
      aantal: 6,         // hoeveel vonkjes tegelijk zichtbaar
      stijg: 30,         // opstijgsnelheid in px per seconde
      drift: 12,         // zijwaartse dwarreling in px per seconde
      spreidX: 3,        // spreiding van de oorsprong, horizontaal in procenten
      spreidY: 2,        // spreiding van de oorsprong, verticaal in procenten
      grootte: 2.4,      // straal van een vonkje in px
      leven: 2.4,        // hoe lang een vonkje leeft, seconden
      kleur: '#ff8a3c'   // warme vonkkleur
    },
    haardgloed: {
      x: 20,             // haardpositie horizontaal, meestal gelijk aan de vonken
      y: 66,             // haardpositie verticaal
      grootte: 26,       // straal van de gloed in procent van de schermbreedte
      zachtrand: 25,     // waar de gloed begint uit te lopen, lager is zachter en diffuser
      kleur: '#ff7a2c',  // warme gloedkleur
      basis: 0.16,       // rustige grondhelderheid van het haardlicht
      flikker: 0.1,      // hoeveel het licht op en neer kruipt
      tempo: 2.4,        // snelheid van het flikkeren
      oplaai: 0.1,       // extra stoot als het vuur even oplaait
      oplaaiKans: 0.01,  // hoe vaak het oplaait, kans per frame
      infade: 1200       // de gloed komt op samen met de kamer, niet vol ineens
    },
    geluid: {
      map: 'geluid/k6finale/',
      wind:  { bestand: 'wind.mp3',  volume: 0.55, infade: 600, uitfade: 500 },
      kraai: { bestand: 'kraai.mp3', volume: 1.0,  na: 3000 },
      deur:  { bestand: 'deur.mp3',  volume: 0.9,  speelDuur: 5000, uitfade: 1000 },
      woosh: { bestand: 'woosh.mp3', volume: 1.0 },
      mumble: { bestand: 'mumble.mp3', volume: 1.0, startPositie: 5 },
      vuur:  { bestand: 'vuur.mp3',  volume: 0.8, infade: 800 },
      ttt:   { bestand: 'ttt.wav',   volume: 1.0, startPositie: 2, speelDuur: 5000 },
      vernedering: { bestand: 'vernedering.wav', volume: 1.0, pauzeOp: 8 },
      lach: { bestand: 'lach.mpeg', volume: 1.0 },
      telaat: { bestand: 'telaatmodule.wav', volume: 1.0 },
      horrorhit: { bestand: 'horrorhit2.mp3', volume: 1.0 },
      swell: { bestand: 'swell.mp3', volume: 1.0 },
      steps: { bestand: 'steps.mp3', volume: 0.7, uitfade: 300 }
    },
    beat2: {
      nagloed: { duur: 2000, dekking: 0.8, kleur: '#ff6a1a', zachtheid: 24, breedte: 26, hoogte: 52, x: 50, y: 47 },
      stuk1: 2000,   // zwart en stil
      stuk2: 3000,   // mumble gaat even verder, een seconde langer, dan stop
      stuk3: 2000,   // zwart en stil
      vuurNa: 0,     // extra wachttijd voor het vuur na de drie stukken
      tttNa: 1500,   // wachttijd voor de t-t-t na het opkomen van het vuur
      naarBeat3: 0   // extra wachttijd voor beat 3 na afloop van de t-t-t
    },
    beat3: {
      beeld: 'deurpost.jpg',
      opkomst: 1500,       // beeld komt op vanuit het zwart, als een langzame gloed
      richtduur: 11000,    // lang genoeg voor regel 1 (schatting), regelbaar
      camVanX: 3,          // start van de horizontale camerabeweging, procent
      camNaarX: -6,        // eind van de horizontale camerabeweging, procent
      camScale: 1.12,      // lichte inzoom zodat de beweging geen rand toont
      blur: 0.8,           // lichte bewegingsonscherpte in px, 0 is uit
      schaduw: {
        startX: 52,        // baan in het middenvlak, rechts van de post
        eindX: 78,
        y: 45,
        grootte: 26,       // procent van de schermbreedte
        zachtheid: 40,     // blur in px
        dekking: 0.5,      // hoogste dekking van de vlek
        snelheid: 8,       // procent per seconde, bepaalt hoe traag hij overtrekt
        na: 1800           // moment waarop de schaduw begint, ms na begin beat 3
      },
      lichtje: {
        x: 84,             // positie van het lichtje rechtsachter
        y: 38,
        grootte: 8,        // procent van de schermbreedte
        sterkte: 0.35,     // hoogste extra helderheid
        tempo: 0.5         // flakkersnelheid, laag is traag
      },
      dialoog: {
        tekst: 'Kijk nou toch. De helden van het festival.',
        geluid: 'vernedering',
        na: 1800,          // wanneer de stem valt, ms na begin beat 3
        tekstNa: 1000,     // de ondertiteling volgt de stem met deze vertraging
        infade: 500,       // ondertiteling fade in
        uithoud: 7000      // hoe lang de ondertiteling blijft voor hij uitfaadt
      }
    },
    beat4: {
      beeld: 'vloer.jpg',
      overgang: 1000,      // cross-fade van beat 3 naar de vloer
      richtduur: 6000,
      camScale: 1.14,      // vaste inzoom, de beweging zit in het schuiven
      loopVoor: 5,         // loopsnelheid voor de stop, procent per seconde omlaag
      loopNa: 2.5,         // langzamer na de stop
      bob: 0.7,            // lichte op-en-neer deining van het lopen, procent, 0 is uit
      bobTempo: 1.6,       // stappen per seconde van de deining
      stopMoment: 2500,    // ms na begin beat 4, de beweging stopt abrupt
      stopDuur: 2000       // ms volledig stil, de bijna-schrik zonder trigger
    },
    beat5: {
      beeld1: 'muur1.jpg',
      beeld2: 'muur2.jpg',
      overgang: 1000,      // cross-fade van de vloer naar de muur
      richtduur: 8000,
      camVanY: 5,          // camera loopt traag omhoog langs de muur
      camNaarY: -5,
      camScale: 1.12,      // lichte inzoom zodat de beweging geen rand toont
      blur: 0.8,           // lichte bewegingsonscherpte in px, 0 is uit
      armNa: 3000,         // moment waarop de arm begint te stijgen, ms na begin beat 5
      armDuur: 4500,       // hele trage cross-fade naar muur2, je ziet de arm stijgen
      terugFade: false,    // schakelaar: aan het eind terug naar muur1, het portret hangt weer
      terugDuur: 2000,     // duur van de terugfade, eindigt op het einde van de beat
      dialoog: {
        tekst: 'Sluipen door mijn tuin als ratten. Zo voorspelbaar.',
        na: 800,           // wanneer de dialoog hervat, ms na begin beat 5
        infade: 500,
        uithoud: 5000
      }
    },
    beat6: {
      beeld: 'doorgang.jpg',
      overgang: 1000,      // cross-fade van de muur naar de doorgang
      richtduur: 9000,     // terugval als de lengte van het lachbestand onbekend is
      uitloop: 800,        // korte stilte na de lach
      camSnelheid: 0.02,   // scale-toename per seconde, de opening komt langzaam dichterbij
      camVanScale: 1.06,   // beginstand van de camera
      blur: 0.8,           // lichte bewegingsonscherpte in px, 0 is uit
      shade: {
        bestand: 'shade.png',
        oogBestand: 'oog.png',  // los uitgeknipt rood oog, ligt exact over de shade
        x: 50,             // horizontaal in de opening
        y: 52,             // verticaal in de opening
        grootte: 17.6,     // breedte, procent van de schermbreedte
        hoogte: 48,        // hoogte, procent van de schermhoogte
        opacity: 0.1,      // de gestalte heel zwak, je twijfelt of je iets ziet
        oogOpacity: 0.85,  // het oog juist fel en duidelijk zichtbaar
        oogAdem: 0.12,     // trage kleine puls op het oog, 0 is uit
        oogTempo: 0.4,     // ademhalingen per seconde
        wegNa: 400,        // na de lach: wanneer ze begint te verdwijnen, ms na de lach
        oogDim: 500,       // het oog dooft eerst uit, ms
        wegPauze: 300,     // korte tel niets tussen oog en gestalte
        gestalteWeg: 900   // dan lost de gestalte op, ms, alsof ze het donker in loopt
      },
      dialoog: {
        tekst: '',          // een lach, geen ondertiteling
        geluid: 'lach',
        na: 3400,          // na de cross-fade en het stilstaan
        infade: 500,
        uithoud: 5000
      }
    },
    beat7: {
      beeld: 'kamer.jpg',
      overgang: 1200,      // cross-fade van de doorgang naar de kamer met de haard
      richtduur: 13000,    // terugval, echte einde op de lengte van telaatmodule
      stilteVoor: 2000,    // je komt de kamer in, even niets, dan pas begint haar stem
      uitloop: 600,        // korte stilte na de gesproken regel
      geluid: 'telaat',
      heks: {
        frames: ['1.png', '2.png', '3.png', '4.png', '5.png'],
        x: 50,             // voor de deur
        y: 66,             // op de vloer
        grootte: 18,       // breedte, procent van de schermbreedte
        hoogte: 52,        // hoogte, procent van de schermhoogte
        omdraaiStart: 500, // ms na het einde van de stilte, ze begint te draaien
        omdraaiDuur: 10000, // over deze tijd draait ze helemaal om, klaar net voor "Laat"
        fade: 1400         // cross-fade tussen twee standen
      },
      ondertitels: [
        { tekst: 'Zal ik jullie een geheimpje verklappen', op: 0 },
        { tekst: 'jullie zijn veel', op: 4500 },
        { tekst: 'en veel', op: 7000 },
        { tekst: 'te laat', op: 10000 }
      ],
      ondertitelInfade: 400   // hoe zacht elke regel verschijnt
    },
    beat8: {
      jumpBeeld: 'jump.png',
      jumpVerhouding: 408 / 612, // breedte gedeeld door hoogte van jump.png, terugval
                                 // zolang het plaatje zelf nog niet geladen is
      gaatje: 1350,        // stilte na "Laat", het gat waar de sprong in valt
      flinchDuur: 220,     // korte terugdeins, nu duidelijker merkbaar
      flinchTerug: 0.7,    // ze deinst verder terug voor ze uithaalt
      sprongDuur: 360,     // de doorschieter, kort en versnellend
      sprongStart: 0.4,    // beginformaat, klein op de plek van de heks bij de deur
      // De sprong draait om haar gezicht, niet om het midden van het plaatje.
      // Deze waarden zeggen waar het gezicht in jump.png zelf zit, in procenten
      // van het plaatje. Aanpassen zodra jump.png vervangen wordt.
      gezicht: {
        x: 52,             // midden van het gezicht, horizontaal in het plaatje
        y: 30,             // net tussen de ogen en de open mond
        breedte: 27        // breedte van het gezicht, waarop de eindzoom gerekend wordt
      },
      sprongMidX: 50,      // waar het gezicht op het scherm ligt tijdens de sprong
      sprongMidY: 50,      // recht voor je: daar gaat het door de camera heen
      sprongBedekking: 1.15, // eindmaat, het gezicht is 1.15 keer de schermbreedte
      sprongZoomMax: 14,   // bovengrens op de eindzoom, tegen extreem uitvergroten
      zwartNaSprong: 3000, // volledig zwart en stil na de schrik
      mumbleInZwart: 3000, // dan hoor je Robbie mompelen in het zwart, nog onzichtbaar
      oogOpen: 3500,       // dan open je je ogen, afgestemd op de piek van de swell
      mumbleUitNa: 2000,   // als Robbie twee seconden in beeld is, fade het mompelen weg
      mumbleUitfade: 1200, // hoe traag het mompelen uitsterft
      robbie: {
        beeld: 'robbie.png',
        x: 50,             // bij de deur, waar de heks stond
        y: 62,
        grootte: 24,       // breedte, procent van de schermbreedte
        hoogte: 66,        // hoogte, procent van de schermhoogte
        zoom: 1.4,         // langzame inzoom op Robbie
        zoomDuur: 5000,
        naarZwart: 2500    // en alles fade naar zwart, Robbie eindigt in het donker
      }
    },
    blad: {
      map: 'locaties/kraaienkwartier/k6finale/',
      standen: ['leaf1.png', 'leaf2.png', 'leaf3.png'],
      grootte: 12,        // breedte van het blad, procent van de schermbreedte
      snelheid: 40,       // horizontaal, procent schermbreedte per seconde
      draaitempo: 700,    // milliseconden dat een stand blijft staan
      draaifade: 500,     // milliseconden cross-fade tussen twee standen
      golfFreq: 2,        // aantal golven dat een overtocht met golf maakt
      overtochten: [
        { beat: 'A', vanX: -15, vanY: 12, naarX: 115, naarY: 112, golf: 0 },
        { beat: 'B', vanX: -15, vanY: 86, naarX: 115, naarY: 86,  golf: 6 }
      ]
    }
  };

  function kloon(obj) { return JSON.parse(JSON.stringify(obj)); }
  function klem01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

  var K6 = {
    config: kloon(STANDAARD),
    scene: null,
    zwartEl: null,
    actieveLaag: null,
    voorladers: null,
    timers: [],
    audioEls: {},
    audioTimers: [],
    bladLaag: null,
    vonkenCanvas: null,
    vonkenCtx: null,
    vonkenRaf: null,
    vonkenActief: false,
    vonkenLijst: null,
    vonkenSprite: null,
    vonkenLaatste: 0,
    vonkenLoopBound: null,
    haardgloedEl: null,
    vonkenTijd: 0,
    gloedOplaai: 0,
    gloedInfade: 0,
    bladState: null,
    bladRaf: null,
    bladerenActief: false,
    bladLaatste: 0,
    bladLoopBound: null,
    nagloedEl: null,
    mumbleGestart: false,
    schaduwEl: null,
    lichtjeEl: null,
    ondertitelEl: null,
    beat3Raf: null,
    beat3Actief: false,
    beat3Start0: 0,
    schaduwDuur: 3000,
    beat3LoopBound: null,
    beat4Raf: null,
    beat4Actief: false,
    beat4Start0: 0,
    beat4Laatste: 0,
    beat4Afstand: 0,
    beat4Beeld: null,
    beat4LoopBound: null,
    beat6Raf: null,
    beat6Actief: false,
    beat6Laatste: 0,
    beat6Scale: 1,
    beat6Zoomt: false,
    beat6Weg: false,
    beat6Tijd: 0,
    beat6Laag: null,
    beat6Oog: null,
    beat6ShadeEl: null,
    beat6LoopBound: null,
    beat7Laag: null,
    beat7Frames: null,
    beat8Raf: null,
    beat8Actief: false,
    beat8Laatste: 0,
    beat8Scale: 1,
    beat8Laag: null,
    beat8LoopBound: null,
    opts: {},
    bezig: false,

    mount: function (container) {
      this.stop();
      container.classList.add('k6-scene');
      container.innerHTML = '';
      this.scene = container;

      this.bladLaag = document.createElement('div');
      this.bladLaag.className = 'k6-bladeren';
      container.appendChild(this.bladLaag);

      this.haardgloedEl = document.createElement('div');
      this.haardgloedEl.className = 'k6-haardgloed';
      container.appendChild(this.haardgloedEl);

      this.vonkenCanvas = document.createElement('canvas');
      this.vonkenCanvas.className = 'k6-vonken';
      container.appendChild(this.vonkenCanvas);

      this.zwartEl = document.createElement('div');
      this.zwartEl.className = 'k6-zwart';
      container.appendChild(this.zwartEl);

      this.nagloedEl = document.createElement('div');
      this.nagloedEl.className = 'k6-nagloed';
      container.appendChild(this.nagloedEl);

      this.lichtjeEl = document.createElement('div');
      this.lichtjeEl.className = 'k6-lichtje';
      container.appendChild(this.lichtjeEl);

      this.schaduwEl = document.createElement('div');
      this.schaduwEl.className = 'k6-schaduw';
      container.appendChild(this.schaduwEl);

      this.ondertitelEl = document.createElement('div');
      this.ondertitelEl.className = 'k6-ondertitel';
      container.appendChild(this.ondertitelEl);

      this.actieveLaag = null;
      // jump.png alvast laden: de sprong rekent met de echte beeldverhouding en
      // het plaatje moet hoe dan ook klaarstaan als de schrik valt
      this.jumpBeeldEl = new Image();
      this.jumpBeeldEl.src = (this.config.beeldmap || '') + this.config.beat8.jumpBeeld;
      // alle beat-beelden alvast inladen, in speelvolgorde. Zonder dit start een
      // cross-fade soms voordat het beeld binnen is en zie je te lang de zwarte
      // scene-achtergrond in plaats van het beeld, vooral op een trager tablet.
      this.voorlaadBeelden();
      if (!this.bladLoopBound) { this.bladLoopBound = this.bladerenLoop.bind(this); }
      if (!this.beat3LoopBound) { this.beat3LoopBound = this.beat3Loop.bind(this); }
      if (!this.beat4LoopBound) { this.beat4LoopBound = this.beat4Loop.bind(this); }
      if (!this.beat6LoopBound) { this.beat6LoopBound = this.beat6Loop.bind(this); }
      if (!this.beat8LoopBound) { this.beat8LoopBound = this.beat8Loop.bind(this); }
      if (!this.vonkenLoopBound) { this.vonkenLoopBound = this.vonkenLoop.bind(this); }
    },

    // Alle beelden die de finale gebruikt vooraf inladen, afgeleid uit de config
    // zodat de lijst meebeweegt als beelden vervangen worden. De volgorde is de
    // speelvolgorde: eerste beats eerst, zodat het begin sowieso op tijd klaar is.
    // De Image-objecten blijven in this.voorladers hangen, anders kan de browser
    // ze opruimen voordat de beat ze nodig heeft.
    voorlaadBeelden: function () {
      var c = this.config;
      var map = c.beeldmap || '';
      var urls = [];
      function voegtoe(pad, bestand) { if (bestand) { urls.push((pad || '') + bestand); } }

      if (c.beats) {
        for (var i = 0; i < c.beats.length; i++) { voegtoe(map, c.beats[i].beeld); }
      }
      if (c.beat3) { voegtoe(map, c.beat3.beeld); }
      if (c.beat4) { voegtoe(map, c.beat4.beeld); }
      if (c.beat5) { voegtoe(map, c.beat5.beeld1); voegtoe(map, c.beat5.beeld2); }
      if (c.beat6) {
        voegtoe(map, c.beat6.beeld);
        if (c.beat6.shade) { voegtoe(map, c.beat6.shade.bestand); voegtoe(map, c.beat6.shade.oogBestand); }
      }
      if (c.beat7) {
        voegtoe(map, c.beat7.beeld);
        var fr = c.beat7.heks && c.beat7.heks.frames;
        if (fr) { for (var h = 0; h < fr.length; h++) { voegtoe(map, fr[h]); } }
      }
      if (c.beat8) {
        voegtoe(map, c.beat8.jumpBeeld);
        if (c.beat8.robbie) { voegtoe(map, c.beat8.robbie.beeld); }
      }
      if (c.blad && c.blad.standen) {
        for (var b = 0; b < c.blad.standen.length; b++) { voegtoe(c.blad.map || map, c.blad.standen[b]); }
      }

      this.voorladers = [];
      var gezien = {};
      for (var u = 0; u < urls.length; u++) {
        var url = urls[u];
        if (gezien[url]) { continue; }
        gezien[url] = true;
        var img = new Image();
        img.src = url;
        this.voorladers.push(img);
      }
    },

    start: function (container, opts) {
      this.opts = opts || {};
      if (container) { this.mount(container); }
      if (!this.scene) { return; }
      this.geluidOntgrendel();
      this.speelVanaf(0);
    },

    herstart: function () {
      if (!this.scene) { return; }
      this.speelVanaf(0);
    },

    stop: function () {
      this.clearTimers();
      this.audioStopAlles();
      this.bladStop();
      this.beat3Reset();
      this.bezig = false;
      this.mumbleGestart = false;
      if (this.nagloedEl) {
        this.nagloedEl.style.transition = 'none';
        this.nagloedEl.style.opacity = 0;
      }
      if (this.zwartEl) {
        this.zwartEl.style.transition = 'none';
        this.zwartEl.style.opacity = 0;
      }
    },

    resetScene: function () {
      this.clearTimers();
      this.audioStopAlles();
      this.bladStop();
      this.vonkenUit();
      this.beat3Reset();
      this.beat4Reset();
      this.beat6Reset();
      this.beat7Reset();
      this.beat8Reset();
      this.mumbleGestart = false;
      var lagen = this.scene.querySelectorAll('.k6-laag');
      for (var i = 0; i < lagen.length; i++) { lagen[i].remove(); }
      this.actieveLaag = null;
      this.zwartEl.style.transition = 'none';
      this.zwartEl.style.opacity = 0;
      this.nagloedEl.style.transition = 'none';
      this.nagloedEl.style.opacity = 0;
    },

    speelVanaf: function (index) {
      this.resetScene();
      this.bezig = true;
      this.toonBeat(index);
    },

    // instappen op een aanloop-beat (index in de beats-lijst)
    startVanafBeat: function (index, opts) {
      if (opts) { this.opts = opts; }
      if (!this.scene) { return; }
      this.speelVanaf(index);
    },

    // instappen op beat 2, het zwart na de klap
    startBeat2: function (opts) {
      if (opts) { this.opts = opts; }
      if (!this.scene) { return; }
      this.resetScene();
      this.bezig = true;
      this.zwartEl.style.transition = 'none';
      this.zwartEl.style.opacity = 1;
      this.naZwartSequentie();
    },

    // instappen op beat 3, de deurpost. De haard loopt hier al als kamertoon.
    startBeat3: function (opts) {
      if (opts) { this.opts = opts; }
      if (!this.scene) { return; }
      this.resetScene();
      this.bezig = true;
      this.zwartEl.style.transition = 'none';
      this.zwartEl.style.opacity = 1;
      var v = this.config.geluid.vuur;
      this.audioSpeel('vuur', { loop: true, infade: (v && v.infade) || 800 });
      this.beat3Start();
    },

    // instappen op beat 4, de vloer. De haard loopt hier al als kamertoon.
    startBeat4: function (opts) {
      if (opts) { this.opts = opts; }
      if (!this.scene) { return; }
      this.resetScene();
      this.bezig = true;
      this.zwartEl.style.transition = 'none';
      this.zwartEl.style.opacity = 0;
      var v = this.config.geluid.vuur;
      this.audioSpeel('vuur', { loop: true, infade: (v && v.infade) || 800 });
      this.beat4Start();
    },

    // instappen op beat 5, de muur. De stem hervat vanaf het pauzepunt.
    startBeat5: function (opts) {
      if (opts) { this.opts = opts; }
      if (!this.scene) { return; }
      this.resetScene();
      this.bezig = true;
      this.zwartEl.style.transition = 'none';
      this.zwartEl.style.opacity = 0;
      var v = this.config.geluid.vuur;
      this.audioSpeel('vuur', { loop: true, infade: (v && v.infade) || 800 });
      this.beat5Start();
    },

    // instappen op beat 6, de doorgang. De haard loopt hier al als kamertoon.
    startBeat6: function (opts) {
      if (opts) { this.opts = opts; }
      if (!this.scene) { return; }
      this.resetScene();
      this.bezig = true;
      this.zwartEl.style.transition = 'none';
      this.zwartEl.style.opacity = 0;
      var v = this.config.geluid.vuur;
      this.audioSpeel('vuur', { loop: true, infade: (v && v.infade) || 800 });
      this.beat6Start();
    },

    // instappen op beat 7, de kamer met de omdraaiende heks.
    startBeat7: function (opts) {
      if (opts) { this.opts = opts; }
      if (!this.scene) { return; }
      this.resetScene();
      this.bezig = true;
      this.zwartEl.style.transition = 'none';
      this.zwartEl.style.opacity = 0;
      var v = this.config.geluid.vuur;
      this.audioSpeel('vuur', { loop: true, infade: (v && v.infade) || 800 });
      this.beat7Start();
    },

    // instappen op beat 8, de jumpscare en de landing op Robbie.
    startBeat8: function (opts) {
      if (opts) { this.opts = opts; }
      if (!this.scene) { return; }
      this.resetScene();
      this.bezig = true;
      this.zwartEl.style.transition = 'none';
      this.zwartEl.style.opacity = 0;
      var v = this.config.geluid.vuur;
      this.audioSpeel('vuur', { loop: true, infade: (v && v.infade) || 800 });
      // de kamer eronder zetten, anders springt ze uit een leeg scherm
      this.beat8Kamer();
      this.beat8Start();
    },

    // De sprong los starten, met scene en geluid erbij. Voor het afstellen van
    // de jumpscare zonder de hele aanloop ervoor af te wachten.
    startVanafSprong: function (container, opts) {
      this.opts = opts || {};
      if (container) { this.mount(container); }
      if (!this.scene) { return; }
      this.geluidOntgrendel();
      this.startBeat8();
    },

    toonBeat: function (index) {
      if (!this.bezig) { return; }
      var beats = this.config.beats;
      if (index >= beats.length) { this.einde(); return; }

      var beat = beats[index];
      var url = (this.config.beeldmap || '') + beat.beeld;
      var zelfdeBeeld = this.actieveLaag && this.actieveLaag.dataset.beeld === url;

      if (zelfdeBeeld) {
        var beeldEl = this.actieveLaag.querySelector('.k6-beeld');
        this.zetCamera(beeldEl, beat, false);
      } else {
        var laag = this.nieuweLaag(url);
        var beeldNieuw = laag.querySelector('.k6-beeld');
        this.zetCamera(beeldNieuw, beat, true);
        void laag.offsetWidth;
        laag.style.transition = 'opacity ' + beat.fade + 'ms linear';
        laag.style.opacity = 1;
        this.zetCamera(beeldNieuw, beat, false);

        var vorige = this.actieveLaag;
        this.actieveLaag = laag;
        if (vorige) {
          var wachtFade = beat.fade > 0 ? beat.fade : 0;
          this.plan(function () { if (vorige && vorige.parentNode) { vorige.remove(); } }, wachtFade + 40);
        }
      }

      this.effectenVoorBeat(beat);

      var self = this;
      if (typeof beat.zwartStart === 'number') {
        var zs = beat.zwartStart;
        var zd = (typeof beat.zwartDuur === 'number') ? beat.zwartDuur : 600;
        this.plan(function () { self.naarZwart(zd); }, zs);
        var totaal = Math.max(beat.duur, zs + zd);
        this.plan(function () { self.naZwartSequentie(); }, totaal);
      } else {
        this.plan(function () { self.toonBeat(index + 1); }, beat.duur);
      }
    },

    effectenVoorBeat: function (beat) {
      var g = this.config.geluid;
      var self = this;

      if (beat.id === 'A') {
        this.audioSpeel('wind', { loop: true, infade: g.wind.infade });
        if (g.kraai) {
          var na = (typeof g.kraai.na === 'number') ? g.kraai.na : 3000;
          this.plan(function () { self.audioSpeel('kraai', {}); }, na);
        }
      } else if (beat.id === 'C1') {
        this.audioSpeel('deur', {});
      } else if (beat.id === 'D') {
        this.audioFadeUit('wind', g.wind.uitfade || 500);
      } else if (beat.id === 'E') {
        this.audioSpeel('woosh', {});
      }

      var ot = this.bladVindOvertocht(beat.id);
      if (ot) { this.bladStartOvertocht(ot); }
    },

    zetCamera: function (beeldEl, beat, beginStand) {
      if (beginStand) {
        beeldEl.style.transition = 'none';
        beeldEl.style.transform = 'scale(' + beat.camVanScale + ') translateY(' + beat.camVanY + '%)';
      } else {
        beeldEl.style.transition = 'transform ' + beat.duur + 'ms ' + (beat.easing || 'linear');
        beeldEl.style.transform = 'scale(' + beat.camNaarScale + ') translateY(' + beat.camNaarY + '%)';
      }
    },

    nieuweLaag: function (url) {
      var laag = document.createElement('div');
      laag.className = 'k6-laag';
      laag.dataset.beeld = url;
      var beeld = document.createElement('div');
      beeld.className = 'k6-beeld';
      beeld.style.backgroundImage = 'url("' + url + '")';
      var test = new Image();
      test.onerror = function () {
        if (window && window.console) { console.warn('k6finale: beeld niet gevonden, ' + url); }
      };
      test.src = url;
      laag.appendChild(beeld);
      this.scene.insertBefore(laag, this.bladLaag);
      return laag;
    },

    naarZwart: function (ms, klaar) {
      var self = this;
      this.zwartEl.style.transition = 'opacity ' + ms + 'ms linear';
      void this.zwartEl.offsetWidth;
      this.zwartEl.style.opacity = 1;
      this.plan(function () { if (klaar) { klaar.call(self); } }, ms + 40);
    },

    einde: function () {
      this.bezig = false;
      this.clearTimers();
      this.bladerenActief = false;
      if (this.bladRaf) { cancelAnimationFrame(this.bladRaf); this.bladRaf = null; }
      this.beat3Actief = false;
      if (this.beat3Raf) { cancelAnimationFrame(this.beat3Raf); this.beat3Raf = null; }
      this.beat4Actief = false;
      if (this.beat4Raf) { cancelAnimationFrame(this.beat4Raf); this.beat4Raf = null; }
      this.beat6Actief = false;
      if (this.beat6Raf) { cancelAnimationFrame(this.beat6Raf); this.beat6Raf = null; }
      if (this.opts && typeof this.opts.onEinde === 'function') {
        this.opts.onEinde();
      }
    },

    // beat 2: het zwart na de klap. Nagloed, drie zwarte stukken, dan vuur en de t-t-t.
    naZwartSequentie: function () {
      var self = this;
      var b2 = this.config.beat2 || {};
      var n = b2.nagloed || {};

      this.toonNagloed();

      var nagloedDuur = (typeof n.duur === 'number') ? n.duur : 2000;
      var s1 = (typeof b2.stuk1 === 'number') ? b2.stuk1 : 2000;
      var s2 = (typeof b2.stuk2 === 'number') ? b2.stuk2 : 2000;
      var s3 = (typeof b2.stuk3 === 'number') ? b2.stuk3 : 2000;
      var vuurNa = (typeof b2.vuurNa === 'number') ? b2.vuurNa : 0;
      var tttNa = (typeof b2.tttNa === 'number') ? b2.tttNa : 1500;

      // stuk 1 begint zodra de nagloed is uitgedoofd
      var t = nagloedDuur;

      // stuk 1: zwart en stil
      t += s1;

      // stuk 2: mumble gaat even verder, dan stop
      (function (tt) {
        self.plan(function () { self.mumbleHervat(); }, tt);
        self.plan(function () { self.mumblePauze(); }, tt + s2);
      })(t);
      t += s2;

      // stuk 3: zwart en stil
      t += s3;

      // vuur komt op
      var vuurStart = t + vuurNa;
      this.plan(function () { self.audioSpeel('vuur', { loop: true, infade: (self.config.geluid.vuur && self.config.geluid.vuur.infade) || 800 }); }, vuurStart);

      // en vervolgens de t-t-t
      var tttStart = vuurStart + tttNa;
      this.plan(function () { self.audioSpeel('ttt', {}); }, tttStart);

      // beeld blijft zwart tot de t-t-t klaar is, daarna komt beat 3 op
      var tttDuur = (this.config.geluid.ttt && typeof this.config.geluid.ttt.speelDuur === 'number') ? this.config.geluid.ttt.speelDuur : 0;
      var naarBeat3 = (typeof b2.naarBeat3 === 'number') ? b2.naarBeat3 : 0;
      this.plan(function () { self.beat3Start(); }, tttStart + tttDuur + naarBeat3);
    },

    toonNagloed: function () {
      if (!this.nagloedEl) { return; }
      var n = (this.config.beat2 && this.config.beat2.nagloed) || {};
      var el = this.nagloedEl;
      var kleur = n.kleur || '#ff6a1a';
      var br = (typeof n.breedte === 'number') ? n.breedte : 26;
      var ho = (typeof n.hoogte === 'number') ? n.hoogte : 52;
      var x = (typeof n.x === 'number') ? n.x : 50;
      var y = (typeof n.y === 'number') ? n.y : 47;
      var zacht = (typeof n.zachtheid === 'number') ? n.zachtheid : 24;
      var dekking = (typeof n.dekking === 'number') ? n.dekking : 0.8;
      var duur = (typeof n.duur === 'number') ? n.duur : 2000;

      el.style.background = 'radial-gradient(ellipse ' + br + '% ' + ho + '% at ' + x + '% ' + y + '%, ' +
        kleur + ' 0%, ' + kleur + ' 20%, rgba(0,0,0,0) 72%)';
      el.style.filter = 'blur(' + zacht + 'px)';
      el.style.transition = 'none';
      el.style.opacity = dekking;
      void el.offsetWidth;
      el.style.transition = 'opacity ' + duur + 'ms ease-out';
      el.style.opacity = 0;
    },

    mumbleHervat: function () {
      var m = this.config.geluid.mumble;
      if (!m) { return; }
      var el = this.audioEls['mumble'] || this.audioMaak('mumble');
      if (!el) { return; }
      el.loop = false;
      el.volume = klem01(typeof m.volume === 'number' ? m.volume : 1);
      if (!this.mumbleGestart) {
        var startPos = (typeof m.startPositie === 'number') ? m.startPositie : 0;
        try { el.currentTime = startPos; } catch (x) {}
        this.mumbleGestart = true;
      }
      var p = el.play();
      if (p && p.catch) { p.catch(function () {}); }
    },

    mumblePauze: function () {
      var el = this.audioEls['mumble'];
      if (!el) { return; }
      try { el.pause(); } catch (x) {}
    },

    /* beat 3: de deurpost */

    beat3Start: function () {
      var self = this;
      var c = this.config.beat3;

      var lagen = this.scene.querySelectorAll('.k6-laag');
      for (var i = 0; i < lagen.length; i++) { lagen[i].remove(); }

      var url = (this.config.beeldmap || '') + c.beeld;
      var laag = this.nieuweLaag(url);
      this.actieveLaag = laag;
      laag.style.transition = 'none';
      laag.style.opacity = 1;

      var beeld = laag.querySelector('.k6-beeld');
      beeld.style.transition = 'none';
      beeld.style.transform = 'scale(' + c.camScale + ') translateX(' + c.camVanX + '%)';
      beeld.style.filter = (c.blur > 0) ? 'blur(' + c.blur + 'px)' : 'none';
      void beeld.offsetWidth;
      // trage horizontale camerabeweging langs de post
      beeld.style.transition = 'transform ' + c.richtduur + 'ms linear';
      beeld.style.transform = 'scale(' + c.camScale + ') translateX(' + c.camNaarX + '%)';

      // beeld komt op vanuit het zwart
      this.nagloedEl.style.transition = 'none';
      this.nagloedEl.style.opacity = 0;
      this.zwartEl.style.transition = 'opacity ' + c.opkomst + 'ms ease-in';
      this.zwartEl.style.opacity = 0;

      this.beat3PrepEffecten();

      var d = c.dialoog;
      this.plan(function () { self.beat3Dialoog(); }, d.na);

      var sch = c.schaduw;
      this.schaduwDuur = Math.max(Math.abs(sch.eindX - sch.startX) / (sch.snelheid || 8) * 1000, 200);
      this.beat3Actief = true;
      this.beat3Start0 = performance.now();
      this.beat3Raf = requestAnimationFrame(this.beat3LoopBound);

      this.plan(function () { self.beat3Klaar(); }, c.richtduur);
    },

    beat3PrepEffecten: function () {
      var c = this.config.beat3;
      var sch = c.schaduw;
      var li = c.lichtje;

      var s = this.schaduwEl;
      s.style.transition = 'none';
      s.style.width = sch.grootte + '%';
      s.style.height = sch.grootte + '%';
      s.style.top = sch.y + '%';
      s.style.left = sch.startX + '%';
      s.style.background = 'radial-gradient(closest-side, rgba(0,0,0,1), rgba(0,0,0,0))';
      s.style.filter = 'blur(' + sch.zachtheid + 'px)';
      s.style.opacity = 0;

      var l = this.lichtjeEl;
      l.style.transition = 'none';
      l.style.width = li.grootte + '%';
      l.style.height = li.grootte + '%';
      l.style.top = li.y + '%';
      l.style.left = li.x + '%';
      l.style.background = 'radial-gradient(closest-side, rgba(255,180,90,0.9), rgba(255,140,50,0))';
      l.style.opacity = 0;
    },

    beat3Loop: function (nu) {
      if (!this.beat3Actief) { return; }
      var c = this.config.beat3;
      var e = nu - this.beat3Start0;

      // het lichtje flakkert heel traag, als het vuur dat je straks in de kamer ziet
      var li = c.lichtje;
      var t = e / 1000;
      var tempo = (typeof li.tempo === 'number') ? li.tempo : 0.5;
      var f = 0.5 + 0.30 * Math.sin(t * tempo * 1.7) + 0.20 * Math.sin(t * tempo * 0.6 + 1.3);
      if (f < 0) { f = 0; }
      if (f > 1) { f = 1; }
      this.lichtjeEl.style.opacity = (li.sterkte || 0.35) * f;

      // de schaduw trekt een keer traag over het middenvlak en valt weer weg
      var sch = c.schaduw;
      var na = (typeof sch.na === 'number') ? sch.na : 1800;
      if (e >= na) {
        var sp = (e - na) / this.schaduwDuur;
        if (sp <= 1) {
          var sx = sch.startX + (sch.eindX - sch.startX) * sp;
          this.schaduwEl.style.left = sx + '%';
          this.schaduwEl.style.opacity = (sch.dekking || 0.5) * Math.sin(sp * Math.PI);
        } else {
          this.schaduwEl.style.opacity = 0;
        }
      }

      this.beat3Raf = requestAnimationFrame(this.beat3LoopBound);
    },

    beat3Dialoog: function () {
      var d = this.config.beat3.dialoog;
      var g = this.config.geluid;
      var naam = d.geluid || 'vernedering';
      this.audioSpeel(naam, {});

      // pauzeer het gesproken bestand op het ingestelde punt, hervat later op de muur
      var def = g[naam];
      var el = this.audioEls[naam];
      if (def && el && typeof def.pauzeOp === 'number') {
        var startPos = (typeof def.startPositie === 'number') ? def.startPositie : 0;
        var wacht = Math.max((def.pauzeOp - startPos) * 1000, 0);
        this.plan(function () { try { el.pause(); } catch (x) {} }, wacht);
      }

      var o = this.ondertitelEl;
      if (!o) { return; }
      var self = this;
      var tekstNa = (typeof d.tekstNa === 'number') ? d.tekstNa : 0;
      this.plan(function () {
        o.textContent = d.tekst;
        o.style.transition = 'opacity ' + (d.infade || 500) + 'ms ease';
        void o.offsetWidth;
        o.style.opacity = 1;
        self.plan(function () {
          o.style.transition = 'opacity ' + (d.infade || 500) + 'ms ease';
          o.style.opacity = 0;
        }, (d.infade || 500) + (d.uithoud || 3000));
      }, tekstNa);
    },

    beat3Klaar: function () {
      this.beat3Actief = false;
      if (this.beat3Raf) { cancelAnimationFrame(this.beat3Raf); this.beat3Raf = null; }
      this.beat4Start();
    },

    beat3Reset: function () {
      this.beat3Actief = false;
      if (this.beat3Raf) { cancelAnimationFrame(this.beat3Raf); this.beat3Raf = null; }
      if (this.schaduwEl) { this.schaduwEl.style.transition = 'none'; this.schaduwEl.style.opacity = 0; }
      if (this.lichtjeEl) { this.lichtjeEl.style.transition = 'none'; this.lichtjeEl.style.opacity = 0; }
      if (this.ondertitelEl) { this.ondertitelEl.style.transition = 'none'; this.ondertitelEl.style.opacity = 0; }
    },

    /* beat 4: de vloer */

    beat4Start: function () {
      var self = this;
      var c = this.config.beat4;

      // de deurpost gaat via cross-fade over in de vloer
      var url = (this.config.beeldmap || '') + c.beeld;
      var laag = this.nieuweLaag(url);
      var beeld = laag.querySelector('.k6-beeld');
      this.beat4Beeld = beeld;

      beeld.style.transition = 'none';
      beeld.style.transform = 'scale(' + c.camScale + ') translateY(0%)';
      beeld.style.filter = 'none';

      laag.style.opacity = 0;
      void laag.offsetWidth;
      laag.style.transition = 'opacity ' + c.overgang + 'ms linear';
      laag.style.opacity = 1;

      var vorige = this.actieveLaag;
      this.actieveLaag = laag;
      if (vorige) {
        this.plan(function () { if (vorige && vorige.parentNode) { vorige.remove(); } }, c.overgang + 40);
      }

      // beat 3 effecten uit, zij zwijgt op de vloer
      this.beat3Reset();
      this.zwartEl.style.transition = 'none';
      this.zwartEl.style.opacity = 0;

      // het loopgeluid volgt de beweging: het pauzeert als de camera stilstaat
      this.audioSpeel('steps', { loop: true });
      this.plan(function () { self.audioPauzeer('steps'); }, c.stopMoment);
      this.plan(function () { self.audioHervat('steps'); }, c.stopMoment + c.stopDuur);

      // camera loopt over de vloer, met de abrupte stop halverwege
      this.beat4Afstand = 0;
      this.beat4Actief = true;
      this.beat4Start0 = performance.now();
      this.beat4Laatste = this.beat4Start0;
      this.beat4Raf = requestAnimationFrame(this.beat4LoopBound);

      this.plan(function () { self.beat4Klaar(); }, c.richtduur);
    },

    beat4Loop: function (nu) {
      if (!this.beat4Actief || !this.beat4Beeld) { return; }
      var c = this.config.beat4;
      var e = nu - this.beat4Start0;
      var dt = (nu - this.beat4Laatste) / 1000;
      this.beat4Laatste = nu;
      if (dt > 0.1) { dt = 0.1; }

      var stilstand = (e >= c.stopMoment && e < c.stopMoment + c.stopDuur);
      var snel = stilstand ? 0 : (e < c.stopMoment ? c.loopVoor : c.loopNa);

      // de vloer schuift onder je door, en het lopen deint licht op en neer.
      // tijdens de stop bevriest ook de deining, alles staat abrupt stil.
      this.beat4Afstand += snel * dt;
      if (!stilstand) { this.beat4LoopFase = (this.beat4LoopFase || 0) + dt; }
      var bob = (c.bob || 0) * Math.sin((this.beat4LoopFase || 0) * (c.bobTempo || 1.6) * Math.PI * 2);
      var y = this.beat4Afstand + bob;
      this.beat4Beeld.style.transform = 'scale(' + c.camScale + ') translateY(' + y + '%)';

      this.beat4Raf = requestAnimationFrame(this.beat4LoopBound);
    },

    beat4Klaar: function () {
      this.beat4Actief = false;
      if (this.beat4Raf) { cancelAnimationFrame(this.beat4Raf); this.beat4Raf = null; }
      // bij de muur is het lopen voorbij, het loopgeluid valt weg
      this.audioFadeUit('steps', (this.config.geluid.steps && this.config.geluid.steps.uitfade) || 300);
      this.beat5Start();
    },

    beat4Reset: function () {
      this.beat4Actief = false;
      if (this.beat4Raf) { cancelAnimationFrame(this.beat4Raf); this.beat4Raf = null; }
      this.beat4Afstand = 0;
      this.beat4LoopFase = 0;
      this.beat4Beeld = null;
    },

    /* beat 5: de muur met de portretten. Hier hervat haar stem waar hij stilviel. */

    beat5Start: function () {
      var self = this;
      var c = this.config.beat5;

      // een laag met twee gestapelde platen: muur1 zichtbaar, muur2 (de arm) erboven op 0
      var laag = document.createElement('div');
      laag.className = 'k6-laag';
      laag.dataset.beeld = 'beat5';

      var url1 = (this.config.beeldmap || '') + c.beeld1;
      var url2 = (this.config.beeldmap || '') + c.beeld2;

      function maakBeeld(url) {
        var el = document.createElement('div');
        el.className = 'k6-beeld';
        el.style.backgroundImage = 'url("' + url + '")';
        var test = new Image();
        test.onerror = function () {
          if (window && window.console) { console.warn('k6finale: beeld niet gevonden, ' + url); }
        };
        test.src = url;
        return el;
      }

      var beeld1 = maakBeeld(url1);
      var beeld2 = maakBeeld(url2);
      beeld2.style.opacity = 0;
      laag.appendChild(beeld1);
      laag.appendChild(beeld2);
      this.scene.insertBefore(laag, this.bladLaag);

      // camera op de laag zelf, zodat beide platen exact samen bewegen
      laag.style.transform = 'scale(' + c.camScale + ') translateY(' + c.camVanY + '%)';
      laag.style.filter = (c.blur > 0) ? 'blur(' + c.blur + 'px)' : 'none';

      // cross-fade vanaf de vloer
      laag.style.opacity = 0;
      void laag.offsetWidth;
      laag.style.transition = 'opacity ' + c.overgang + 'ms linear';
      laag.style.opacity = 1;

      var vorige = this.actieveLaag;
      this.actieveLaag = laag;
      if (vorige) {
        this.plan(function () { if (vorige && vorige.parentNode) { vorige.remove(); } }, c.overgang + 40);
      }

      // trage doorlopende beweging omhoog langs de muur
      this.plan(function () {
        laag.style.transition = 'opacity 0ms, transform ' + c.richtduur + 'ms linear';
        laag.style.transform = 'scale(' + c.camScale + ') translateY(' + c.camNaarY + '%)';
      }, 20);

      // de arm stijgt: tergend trage cross-fade naar muur2, zonder enig geluid
      this.plan(function () {
        beeld2.style.transition = 'opacity ' + c.armDuur + 'ms linear';
        beeld2.style.opacity = 1;
      }, c.armNa);

      // optioneel: aan het eind terug naar muur1, het portret hangt weer zoals het hing
      if (c.terugFade) {
        var terugStart = Math.max(c.richtduur - c.terugDuur, c.armNa + c.armDuur);
        this.plan(function () {
          beeld2.style.transition = 'opacity ' + c.terugDuur + 'ms linear';
          beeld2.style.opacity = 0;
        }, terugStart);
      }

      var d = c.dialoog;
      this.plan(function () { self.beat5Dialoog(); }, d.na);

      // de doorgang begint pas als haar regel helemaal is uitgesproken
      this.plan(function () {
        var stem = self.audioEls['vernedering'];
        if (stem && !stem.paused && !stem.ended) {
          stem.addEventListener('ended', function () { self.beat6Start(); }, { once: true });
        } else {
          self.beat6Start();
        }
      }, c.richtduur);
    },

    beat5Dialoog: function () {
      var d = this.config.beat5.dialoog;
      // hervat het gesproken bestand waar het op de deurpost werd gepauzeerd
      var el = this.audioEls['vernedering'];
      if (el) {
        var p = el.play();
        if (p && p.catch) { p.catch(function () {}); }
      } else {
        // losse instap zonder beat 3: begin dan op het pauzepunt
        var def = this.config.geluid.vernedering;
        if (def) {
          var nieuw = this.audioMaak('vernedering');
          if (nieuw) {
            nieuw.volume = klem01(typeof def.volume === 'number' ? def.volume : 1);
            try { nieuw.currentTime = (typeof def.pauzeOp === 'number') ? def.pauzeOp : 0; } catch (x) {}
            var p2 = nieuw.play();
            if (p2 && p2.catch) { p2.catch(function () {}); }
          }
        }
      }

      var o = this.ondertitelEl;
      if (!o) { return; }
      o.textContent = d.tekst;
      o.style.transition = 'opacity ' + (d.infade || 500) + 'ms ease';
      void o.offsetWidth;
      o.style.opacity = 1;
      this.plan(function () {
        o.style.transition = 'opacity ' + (d.infade || 500) + 'ms ease';
        o.style.opacity = 0;
      }, (d.infade || 500) + (d.uithoud || 5000));
    },

    /* beat 6: de doorgang. Een zwakke gestalte in de opening, en haar lach. */

    beat6Start: function () {
      var self = this;
      var c = this.config.beat6;

      var url = (this.config.beeldmap || '') + c.beeld;
      var laag = this.nieuweLaag(url);
      var beeld = laag.querySelector('.k6-beeld');
      beeld.style.filter = (c.blur > 0) ? 'blur(' + c.blur + 'px)' : 'none';

      // de zwakke gestalte in de opening, zit in de laag zodat hij meeschaalt met de camera
      var s = c.shade;
      var shade = document.createElement('div');
      shade.className = 'k6-shade';
      shade.style.backgroundImage = 'url("' + (this.config.beeldmap || '') + s.bestand + '")';
      shade.style.left = s.x + '%';
      shade.style.top = s.y + '%';
      shade.style.width = s.grootte + '%';
      shade.style.height = s.hoogte + '%';
      shade.style.opacity = s.opacity;
      laag.appendChild(shade);

      // het rode oog als losse fellere laag, exact over de gestalte
      var oog = document.createElement('div');
      oog.className = 'k6-shade k6-shade-oog';
      oog.style.backgroundImage = 'url("' + (this.config.beeldmap || '') + s.oogBestand + '")';
      oog.style.left = s.x + '%';
      oog.style.top = s.y + '%';
      oog.style.width = s.grootte + '%';
      oog.style.height = s.hoogte + '%';
      oog.style.opacity = s.oogOpacity;
      laag.appendChild(oog);
      this.beat6Oog = oog;
      this.beat6ShadeEl = shade;
      this.beat6Weg = false;

      // camera op de laag, zodat beeld en gestalte samen bewegen
      laag.style.transform = 'scale(' + c.camVanScale + ')';
      laag.style.transformOrigin = 'center center';
      laag.style.opacity = 0;
      void laag.offsetWidth;
      laag.style.transition = 'opacity ' + c.overgang + 'ms linear';
      laag.style.opacity = 1;

      var vorige = this.actieveLaag;
      this.actieveLaag = laag;
      this.beat6Laag = laag;
      if (vorige) {
        this.plan(function () { if (vorige && vorige.parentNode) { vorige.remove(); } }, c.overgang + 40);
      }

      // het beeld staat stil, de camera wacht op haar lach
      this.beat6Scale = c.camVanScale;
      this.beat6Zoomt = false;
      this.beat6Actief = true;
      this.beat6Laatste = performance.now();
      this.beat6Raf = requestAnimationFrame(this.beat6LoopBound);

      var d = c.dialoog;
      this.plan(function () { self.beat6Dialoog(); }, d.na);

      // de beat eindigt op de werkelijke lengte van de lach, met terugval
      var el = this.audioEls[d.geluid] || this.audioMaak(d.geluid);
      var fallback = d.na + c.richtduur;
      var eindTimer = this.plan(function () { self.beat6Klaar(); }, fallback);
      if (el) {
        var herplan = function () {
          if (isFinite(el.duration) && el.duration > 0) {
            clearTimeout(eindTimer);
            self.plan(function () { self.beat6Klaar(); }, d.na + el.duration * 1000 + c.uitloop);
          }
        };
        if (isFinite(el.duration) && el.duration > 0) { herplan(); }
        else { el.addEventListener('loadedmetadata', herplan, { once: true }); }
      }
    },

    beat6Loop: function (nu) {
      if (!this.beat6Actief) { return; }
      var c = this.config.beat6;
      var dt = (nu - this.beat6Laatste) / 1000;
      this.beat6Laatste = nu;
      if (dt > 0.1) { dt = 0.1; }
      this.beat6Tijd = (this.beat6Tijd || 0) + dt;

      // de opening komt dichterbij zodra haar lach klinkt
      if (this.beat6Zoomt && this.beat6Laag) {
        this.beat6Scale += c.camSnelheid * dt;
        this.beat6Laag.style.transform = 'scale(' + this.beat6Scale + ')';
      }

      // het oog ademt zwak, zodat het leeft en geen statisch stipje is
      if (this.beat6Oog && !this.beat6Weg) {
        var s = c.shade;
        var adem = 1 - (s.oogAdem || 0) * (0.5 + 0.5 * Math.sin(this.beat6Tijd * (s.oogTempo || 0.4) * Math.PI * 2));
        this.beat6Oog.style.opacity = s.oogOpacity * adem;
      }

      this.beat6Raf = requestAnimationFrame(this.beat6LoopBound);
    },

    beat6Dialoog: function () {
      var d = this.config.beat6.dialoog;
      var s = this.config.beat6.shade;
      var self = this;
      this.audioSpeel(d.geluid || 'lach', {});

      // nu pas komt de camera in beweging
      this.beat6Zoomt = true;

      // ze gaat weg: eerst dooft het oog, dan lost de gestalte op, alsof ze het donker in loopt
      this.plan(function () {
        self.beat6Weg = true;
        if (self.beat6Oog) {
          self.beat6Oog.style.transition = 'opacity ' + (s.oogDim || 500) + 'ms ease-in';
          self.beat6Oog.style.opacity = 0;
        }
        self.plan(function () {
          if (self.beat6ShadeEl) {
            self.beat6ShadeEl.style.transition = 'opacity ' + (s.gestalteWeg || 900) + 'ms ease-in';
            self.beat6ShadeEl.style.opacity = 0;
          }
        }, (s.oogDim || 500) + (s.wegPauze || 300));
      }, s.wegNa || 400);

      // een lach heeft geen ondertiteling, tenzij er tekst is ingesteld
      var o = this.ondertitelEl;
      if (!o || !d.tekst) { return; }
      o.textContent = d.tekst;
      o.style.transition = 'opacity ' + (d.infade || 500) + 'ms ease';
      void o.offsetWidth;
      o.style.opacity = 1;
      this.plan(function () {
        o.style.transition = 'opacity ' + (d.infade || 500) + 'ms ease';
        o.style.opacity = 0;
      }, (d.infade || 500) + (d.uithoud || 5000));
    },

    beat6Klaar: function () {
      this.beat6Actief = false;
      this.beat6Zoomt = false;
      if (this.beat6Raf) { cancelAnimationFrame(this.beat6Raf); this.beat6Raf = null; }
      this.beat7Start();
    },

    beat6Reset: function () {
      this.beat6Actief = false;
      this.beat6Zoomt = false;
      this.beat6Weg = false;
      this.beat6Tijd = 0;
      if (this.beat6Raf) { cancelAnimationFrame(this.beat6Raf); this.beat6Raf = null; }
      this.beat6Laag = null;
      this.beat6Oog = null;
      this.beat6ShadeEl = null;
    },

    /* beat 7: de kamer. De heks staat voor de deur en draait zich langzaam om. */

    beat7Start: function () {
      var self = this;
      var c = this.config.beat7;
      var h = c.heks;

      var url = (this.config.beeldmap || '') + c.beeld;
      var laag = this.nieuweLaag(url);

      // de heks-standen, gestapeld voor de deur, in de kamerlaag
      this.beat7Frames = [];
      for (var i = 0; i < h.frames.length; i++) {
        var fr = document.createElement('div');
        fr.className = 'k6-heksframe';
        fr.style.backgroundImage = 'url("' + (this.config.beeldmap || '') + h.frames[i] + '")';
        fr.style.left = h.x + '%';
        fr.style.top = h.y + '%';
        fr.style.width = h.grootte + '%';
        fr.style.height = h.hoogte + '%';
        fr.style.opacity = (i === 0) ? 1 : 0;
        laag.appendChild(fr);
        this.beat7Frames.push(fr);
      }

      laag.style.opacity = 0;
      void laag.offsetWidth;
      laag.style.transition = 'opacity ' + c.overgang + 'ms linear';
      laag.style.opacity = 1;

      var vorige = this.actieveLaag;
      this.actieveLaag = laag;
      this.beat7Laag = laag;
      if (vorige) {
        this.plan(function () { if (vorige && vorige.parentNode) { vorige.remove(); } }, c.overgang + 40);
      }

      // je komt de kamer in, even stilte, dan pas begint haar stem en de omdraai
      var stil = (typeof c.stilteVoor === 'number') ? c.stilteVoor : 0;

      // haar stem, de opbouw naar "Laat", en de levende haard
      this.vonkenAan();
      this.plan(function () { self.audioSpeel(c.geluid || 'telaat', {}); }, stil);

      // de ondertiteling, in stukjes, gelijk met haar stem
      var subs = c.ondertitels || [];
      for (var m = 0; m < subs.length; m++) {
        (function (sub) {
          self.plan(function () { self.beat7Ondertitel(sub.tekst); }, stil + sub.op);
        })(subs[m]);
      }

      // de omdraai: gelijkmatig door de standen, klaar net voor "Laat"
      var n = h.frames.length;
      var interval = h.omdraaiDuur / Math.max(n - 1, 1);
      for (var k = 1; k < n; k++) {
        (function (idx) {
          self.plan(function () { self.beat7Draai(idx); }, stil + h.omdraaiStart + idx * interval);
        })(k);
      }

      // de beat eindigt op de lengte van de gesproken regel, dan de jumpscare
      var el = this.audioEls[c.geluid] || this.audioMaak(c.geluid);
      var fallback = stil + c.richtduur;
      var eindTimer = this.plan(function () { self.beat8Start(); }, fallback);
      if (el) {
        var herplan = function () {
          if (isFinite(el.duration) && el.duration > 0) {
            clearTimeout(eindTimer);
            self.plan(function () { self.beat8Start(); }, stil + el.duration * 1000 + c.uitloop);
          }
        };
        if (isFinite(el.duration) && el.duration > 0) { herplan(); }
        else { el.addEventListener('loadedmetadata', herplan, { once: true }); }
      }
    },

    beat7Draai: function (idx) {
      var f = this.beat7Frames;
      if (!f || !f[idx]) { return; }
      var fade = this.config.beat7.heks.fade;
      f[idx].style.transition = 'opacity ' + fade + 'ms linear';
      f[idx].style.opacity = 1;
      if (f[idx - 1]) {
        f[idx - 1].style.transition = 'opacity ' + fade + 'ms linear';
        f[idx - 1].style.opacity = 0;
      }
    },

    beat7Ondertitel: function (tekst) {
      var o = this.ondertitelEl;
      if (!o) { return; }
      var inf = this.config.beat7.ondertitelInfade || 400;
      o.style.transition = 'none';
      o.style.opacity = 0;
      o.textContent = tekst;
      void o.offsetWidth;
      o.style.transition = 'opacity ' + inf + 'ms ease';
      o.style.opacity = 1;
    },

    beat7Reset: function () {
      this.beat7Laag = null;
      this.beat7Frames = null;
    },

    /* beat 8: de jumpscare, en de landing op Robbie. */

    // De kamer zoals beat 7 hem achterlaat: de haard brandt en de heks staat
    // omgedraaid voor de deur. Alleen nodig als er bij de sprong wordt
    // ingestapt, in de gewone volgorde staat die kamer er al.
    beat8Kamer: function () {
      var c = this.config.beat7;
      var h = c.heks;
      var laag = this.nieuweLaag((this.config.beeldmap || '') + c.beeld);
      var fr = document.createElement('div');
      fr.className = 'k6-heksframe';
      fr.style.backgroundImage = 'url("' + (this.config.beeldmap || '') +
        h.frames[h.frames.length - 1] + '")';
      fr.style.left = h.x + '%';
      fr.style.top = h.y + '%';
      fr.style.width = h.grootte + '%';
      fr.style.height = h.hoogte + '%';
      fr.style.opacity = 1;
      laag.appendChild(fr);
      laag.style.transition = 'none';
      laag.style.opacity = 1;
      this.actieveLaag = laag;
      this.beat7Laag = laag;
      this.vonkenAan();
    },

    beat8Start: function () {
      var self = this;
      var b = this.config.beat8;

      // de ondertiteling weg voor de sprong. De haard blijft branden tot ze aanvalt.
      if (this.ondertitelEl) {
        this.ondertitelEl.style.transition = 'opacity 200ms ease';
        this.ondertitelEl.style.opacity = 0;
      }

      // het gat: alles valt stil, ook de haard, dat is waar de schrik in zit
      this.audioFadeUit('vuur', 200);
      this.plan(function () { self.beat8Knal(); }, b.gaatje);
    },

    // Waar haar gezicht op het scherm ligt en hoe ver de sprong inzoomt.
    // jump.png is een staand plaatje dat met contain in een liggend scherm valt,
    // dus het gezicht zit niet op een vaste procentplek van het scherm: dat hangt
    // van de schermverhouding af en wordt hier uitgerekend.
    sprongMeetkunde: function () {
      var b = this.config.beat8;
      var g = b.gezicht || { x: 50, y: 50, breedte: 30 };
      var vak = this.scene.getBoundingClientRect();
      var sw = vak.width || 1;
      var sh = vak.height || 1;

      var verhouding = b.jumpVerhouding || 1;
      var img = this.jumpBeeldEl;
      if (img && img.naturalWidth && img.naturalHeight) {
        verhouding = img.naturalWidth / img.naturalHeight;
      }

      // contain: het hele plaatje past in het scherm, gecentreerd
      var bw, bh;
      if (sw / sh > verhouding) { bh = sh; bw = sh * verhouding; }
      else { bw = sw; bh = sw / verhouding; }
      var links = (sw - bw) / 2;
      var boven = (sh - bh) / 2;

      // het gezicht in pixels op het scherm, bij schaal 1
      var gx = links + (g.x / 100) * bw;
      var gy = boven + (g.y / 100) * bh;

      // eindzoom: zo groot dat het gezicht het scherm vult en er doorheen gaat
      var breed = Math.max((g.breedte / 100) * bw, 1);
      var zoom = (b.sprongBedekking * sw) / breed;
      if (b.sprongZoomMax && zoom > b.sprongZoomMax) { zoom = b.sprongZoomMax; }

      return {
        // het gezicht is het draaipunt: bij elke schaal blijft dat punt liggen
        origin: gx + 'px ' + gy + 'px',
        // en het ligt de hele sprong op de plek waar ze door je heen komt
        verschuif: 'translate(' + ((b.sprongMidX / 100) * sw - gx) + 'px, ' +
                   ((b.sprongMidY / 100) * sh - gy) + 'px) ',
        zoom: zoom
      };
    },

    beat8Knal: function () {
      var self = this;
      var b = this.config.beat8;

      var laag = this.nieuweLaag((this.config.beeldmap || '') + b.jumpBeeld);
      var beeld = laag.querySelector('.k6-beeld');
      beeld.style.backgroundSize = 'contain';
      beeld.style.backgroundPosition = 'center';

      // de zoom richt zich op haar gezicht, daar gaat de camera doorheen
      var meet = this.sprongMeetkunde();
      beeld.style.transformOrigin = meet.origin;

      beeld.style.transition = 'none';
      beeld.style.transform = meet.verschuif + 'scale(' + b.sprongStart + ')';
      // ze is nog niet te zien; ze verschijnt pas als de aanval al loopt
      laag.style.transition = 'none';
      laag.style.opacity = 0;

      var vorige = this.actieveLaag;
      this.actieveLaag = laag;
      // de kamer blijft staan achter haar; alleen de omgedraaide heks erin verdwijnt
      if (vorige) {
        var frames = vorige.querySelectorAll('.k6-heksframe');
        for (var i = 0; i < frames.length; i++) {
          frames[i].style.transition = 'opacity 120ms linear';
          frames[i].style.opacity = 0;
        }
      }

      // de flinch: heel even inhouden, maar nog onzichtbaar, dan valt ze aan
      void beeld.offsetWidth;
      beeld.style.transition = 'transform ' + b.flinchDuur + 'ms ease-out';
      beeld.style.transform = meet.verschuif + 'scale(' + (b.sprongStart * b.flinchTerug) + ')';

      // de doorschieter: ze verschijnt pas nu, al in volle beweging, met de klap.
      // op ditzelfde moment dooft de haard, zodat niets over haar heen ligt.
      this.plan(function () {
        self.vonkenUit();
        laag.style.opacity = 1;
        self.audioSpeel('horrorhit', {});
        beeld.style.transition = 'transform ' + b.sprongDuur + 'ms cubic-bezier(0.7, 0, 1, 0.4)';
        beeld.style.transform = meet.verschuif + 'scale(' + meet.zoom + ')';
      }, b.flinchDuur);

      // op het hoogtepunt: hard weg, zwart
      this.plan(function () { self.beat8Doorheen(); }, b.flinchDuur + b.sprongDuur);
    },

    beat8Doorheen: function () {
      var self = this;
      var b = this.config.beat8;

      // harde cut naar zwart, precies wanneer ze het grootst is
      this.zwartEl.style.transition = 'none';
      this.zwartEl.style.opacity = 1;

      // de klap klinkt door in het zwart, het geluid overleeft het beeld
      // alles weg
      var lagen = this.scene.querySelectorAll('.k6-laag');
      for (var i = 0; i < lagen.length; i++) { lagen[i].remove(); }
      this.actieveLaag = null;

      // een moment volledig zwart, dan hoor je Robbie in het donker
      this.plan(function () { self.beat8Mompel(); }, b.zwartNaSprong);
    },

    beat8Mompel: function () {
      var self = this;
      var b = this.config.beat8;
      // Robbie mompelt in het zwart, hetzelfde gedempte geluid als eerder, nog onzichtbaar
      this.mumbleGestart = false;
      this.mumbleHervat();
      this.plan(function () { self.beat8Robbie(); }, b.mumbleInZwart);
    },

    beat8Robbie: function () {
      var self = this;
      var b = this.config.beat8;
      var r = b.robbie;

      // de kamer met Robbie bij de deur, klaargezet onder het zwart
      var laag = this.nieuweLaag((this.config.beeldmap || '') + this.config.beat7.beeld);
      var robbie = document.createElement('div');
      robbie.className = 'k6-heksframe';
      robbie.style.backgroundImage = 'url("' + (this.config.beeldmap || '') + r.beeld + '")';
      robbie.style.left = r.x + '%';
      robbie.style.top = r.y + '%';
      robbie.style.width = r.grootte + '%';
      robbie.style.height = r.hoogte + '%';
      robbie.style.opacity = 1;
      laag.appendChild(robbie);

      laag.style.transform = 'scale(1)';
      laag.style.transformOrigin = r.x + '% ' + r.y + '%';
      laag.style.transition = 'none';
      laag.style.opacity = 1;

      this.actieveLaag = laag;
      this.beat8Laag = laag;

      // de haard leeft weer in de kamer
      this.vonkenAan();

      // de swell komt op en piekt op het moment dat Robbie zichtbaar wordt
      this.audioSpeel('swell', {});

      // als Robbie een moment in beeld is, sterft het mompelen weg
      this.plan(function () {
        self.audioFadeUit('mumble', b.mumbleUitfade);
      }, b.oogOpen + b.mumbleUitNa);

      // je opent langzaam je ogen: het zwart trekt weg, met een trage knipper
      var oog = b.oogOpen;
      var z = this.zwartEl;
      z.style.transition = 'opacity ' + Math.round(oog * 0.45) + 'ms ease-out';
      void z.offsetWidth;
      z.style.opacity = 0.18;
      this.plan(function () {
        z.style.transition = 'opacity ' + Math.round(oog * 0.15) + 'ms ease-in';
        z.style.opacity = 0.5;
      }, Math.round(oog * 0.5));
      this.plan(function () {
        z.style.transition = 'opacity ' + Math.round(oog * 0.35) + 'ms ease-out';
        z.style.opacity = 0;
      }, Math.round(oog * 0.65));

      // dan pas langzaam inzoomen op Robbie
      this.plan(function () {
        self.beat8Scale = 1;
        self.beat8Actief = true;
        self.beat8Laatste = performance.now();
        self.beat8Raf = requestAnimationFrame(self.beat8LoopBound);

        self.plan(function () {
          z.style.transition = 'opacity ' + r.naarZwart + 'ms ease-in';
          void z.offsetWidth;
          z.style.opacity = 1;
        }, Math.max(r.zoomDuur - r.naarZwart, 0));

        self.plan(function () {
          self.beat8Actief = false;
          if (self.beat8Raf) { cancelAnimationFrame(self.beat8Raf); self.beat8Raf = null; }
          self.einde();
        }, r.zoomDuur + 200);
      }, oog + 200);
    },

    beat8Loop: function (nu) {
      if (!this.beat8Actief || !this.beat8Laag) { return; }
      var r = this.config.beat8.robbie;
      var dt = (nu - this.beat8Laatste) / 1000;
      this.beat8Laatste = nu;
      if (dt > 0.1) { dt = 0.1; }
      var stap = (r.zoom - 1) / (r.zoomDuur / 1000);
      this.beat8Scale += stap * dt;
      this.beat8Laag.style.transform = 'scale(' + this.beat8Scale + ')';
      this.beat8Raf = requestAnimationFrame(this.beat8LoopBound);
    },

    beat8Reset: function () {
      this.beat8Actief = false;
      if (this.beat8Raf) { cancelAnimationFrame(this.beat8Raf); this.beat8Raf = null; }
      this.beat8Laag = null;
    },

    plan: function (fn, ms) {
      var t = setTimeout(fn, ms);
      this.timers.push(t);
      return t;
    },

    clearTimers: function () {
      for (var i = 0; i < this.timers.length; i++) { clearTimeout(this.timers[i]); }
      this.timers = [];
    },

    /* het dwarrelende blad */

    bladVindOvertocht: function (beatId) {
      var lijst = this.config.blad.overtochten || [];
      for (var i = 0; i < lijst.length; i++) {
        if (lijst[i].beat === beatId) { return lijst[i]; }
      }
      return null;
    },

    bladStartOvertocht: function (ot) {
      var b = this.config.blad;
      this.bladStop();
      this.bladLaag.innerHTML = '';
      var self = this;

      var imgs = [];
      for (var i = 0; i < 2; i++) {
        var img = document.createElement('img');
        img.className = 'k6-blad-stand';
        img.style.opacity = 0;
        img.onerror = (function (naam) {
          return function () {
            if (window && window.console) { console.warn('k6finale: blad niet gevonden, ' + naam); }
          };
        })(b.standen[0]);
        self.bladLaag.appendChild(img);
        imgs.push(img);
      }

      this.bladState = {
        imgs: imgs,
        actief: 0,
        standIndex: 0,
        x: ot.vanX,
        ot: ot,
        fase: Math.random() * 6.28,
        standAccu: 0
      };

      imgs[0].src = (b.map || '') + b.standen[0];
      imgs[0].style.opacity = 1;

      this.bladLaag.style.transition = 'none';
      this.bladLaag.style.opacity = 1;

      this.bladerenActief = true;
      this.bladLaatste = performance.now();
      this.bladRaf = requestAnimationFrame(this.bladLoopBound);
    },

    bladWisselStand: function () {
      var b = this.config.blad;
      var s = this.bladState;
      var volgende = (s.standIndex + 1) % b.standen.length;
      var inactief = s.imgs[1 - s.actief];
      var actief = s.imgs[s.actief];

      inactief.src = (b.map || '') + b.standen[volgende];
      inactief.style.transition = 'opacity ' + b.draaifade + 'ms linear';
      actief.style.transition = 'opacity ' + b.draaifade + 'ms linear';
      void inactief.offsetWidth;
      inactief.style.opacity = 1;
      actief.style.opacity = 0;

      s.actief = 1 - s.actief;
      s.standIndex = volgende;
    },

    bladerenLoop: function (nu) {
      if (!this.bladerenActief || !this.bladState) { return; }
      var dt = (nu - this.bladLaatste) / 1000;
      this.bladLaatste = nu;
      if (dt > 0.1) { dt = 0.1; }

      var b = this.config.blad;
      var s = this.bladState;
      var ot = s.ot;

      s.x += b.snelheid * dt;

      if (s.x >= ot.naarX) {
        // overtocht klaar, blad is uit beeld
        this.bladerenActief = false;
        if (this.bladRaf) { cancelAnimationFrame(this.bladRaf); this.bladRaf = null; }
        this.bladLaag.style.opacity = 0;
        return;
      }

      var span = (ot.naarX - ot.vanX) || 1;
      var progress = (s.x - ot.vanX) / span;
      if (progress < 0) { progress = 0; }

      s.fase += dt;
      var golf = (typeof ot.golf === 'number') ? ot.golf : 0;
      var y = ot.vanY + (ot.naarY - ot.vanY) * progress + golf * Math.sin(progress * Math.PI * (b.golfFreq || 2));
      var rot = 18 * Math.sin(s.fase * 1.0);

      s.standAccu += dt * 1000;
      if (s.standAccu >= b.draaitempo) {
        s.standAccu = 0;
        this.bladWisselStand();
      }

      for (var i = 0; i < s.imgs.length; i++) {
        var el = s.imgs[i];
        el.style.width = b.grootte + '%';
        el.style.left = s.x + '%';
        el.style.top = y + '%';
        el.style.transform = 'translate(-50%, -50%) rotate(' + rot + 'deg)';
      }

      this.bladRaf = requestAnimationFrame(this.bladLoopBound);
    },

    bladStop: function () {
      this.bladerenActief = false;
      if (this.bladRaf) { cancelAnimationFrame(this.bladRaf); this.bladRaf = null; }
      this.bladState = null;
      if (this.bladLaag) {
        this.bladLaag.style.transition = 'none';
        this.bladLaag.style.opacity = 0;
        this.bladLaag.innerHTML = '';
      }
    },

    /* vonken van de haard */

    vonkenSpriteMaak: function () {
      var kleur = this.config.vonken.kleur;
      var r = 24;
      var s = document.createElement('canvas');
      s.width = r * 2;
      s.height = r * 2;
      var sc = s.getContext('2d');
      var grad = sc.createRadialGradient(r, r, 0, r, r, r);
      grad.addColorStop(0, kleur);
      grad.addColorStop(0.35, kleur);
      grad.addColorStop(1, kleur + '00');
      sc.fillStyle = grad;
      sc.beginPath();
      sc.arc(r, r, r, 0, 6.2832);
      sc.fill();
      this.vonkenSprite = s;
    },

    vonkNieuw: function (spreidLeeftijd) {
      var cfg = this.config.vonken;
      var w = this.vonkenCanvas.width;
      var h = this.vonkenCanvas.height;
      var ox = (cfg.x / 100) * w + (Math.random() * 2 - 1) * (cfg.spreidX / 100) * w;
      var oy = (cfg.y / 100) * h + (Math.random() * 2 - 1) * (cfg.spreidY / 100) * h;
      return {
        x0: ox,
        x: ox,
        y: oy,
        vy: cfg.stijg * (0.6 + Math.random() * 0.8),
        fase: Math.random() * 6.2832,
        driftAmp: cfg.drift * (0.5 + Math.random()),
        leeftijd: spreidLeeftijd ? Math.random() * cfg.leven : 0,
        leven: cfg.leven * (0.7 + Math.random() * 0.6),
        grootte: cfg.grootte * (0.6 + Math.random() * 0.8)
      };
    },

    vonkenAan: function () {
      if (!this.vonkenCanvas || !this.scene) { return; }
      var w = this.scene.clientWidth || 1280;
      var h = this.scene.clientHeight || 720;
      this.vonkenCanvas.width = w;
      this.vonkenCanvas.height = h;
      this.vonkenCtx = this.vonkenCanvas.getContext('2d');
      this.vonkenSpriteMaak();
      var cfg = this.config.vonken;
      this.vonkenLijst = [];
      for (var i = 0; i < cfg.aantal; i++) {
        this.vonkenLijst.push(this.vonkNieuw(true));
      }
      this.vonkenCanvas.style.opacity = 1;
      this.vonkenActief = true;
      this.vonkenTijd = 0;
      this.gloedOplaai = 0;
      this.gloedInfade = 0;

      // de haardgloed, een warm licht dat leeft en flikkert
      var gl = this.config.haardgloed;
      var ge = this.haardgloedEl;
      if (ge) {
        var k = gl.kleur;
        var mid = Math.min(gl.zachtrand * 2.4, 85);
        // geleidelijk uitlopende rand, geen herkenbare cirkel meer
        ge.style.background = 'radial-gradient(circle, ' +
          k + 'ff 0%, ' +
          k + '66 ' + gl.zachtrand + '%, ' +
          k + '1a ' + mid + '%, ' +
          k + '00 100%)';
        ge.style.left = gl.x + '%';
        ge.style.top = gl.y + '%';
        ge.style.width = gl.grootte + '%';
        ge.style.height = gl.grootte + '%';
        ge.style.transition = 'none';
        ge.style.opacity = 0;
      }

      this.vonkenLaatste = performance.now();
      this.vonkenRaf = requestAnimationFrame(this.vonkenLoopBound);
    },

    vonkenLoop: function (nu) {
      if (!this.vonkenActief) { return; }
      var ctx = this.vonkenCtx;
      var cw = this.vonkenCanvas.width;
      var ch = this.vonkenCanvas.height;
      var dt = (nu - this.vonkenLaatste) / 1000;
      this.vonkenLaatste = nu;
      if (dt > 0.05) { dt = 0.05; }

      ctx.clearRect(0, 0, cw, ch);
      ctx.globalCompositeOperation = 'lighter';
      var s = this.vonkenSprite;
      var lijst = this.vonkenLijst;
      for (var i = 0; i < lijst.length; i++) {
        var p = lijst[i];
        p.leeftijd += dt;
        if (p.leeftijd >= p.leven) { lijst[i] = this.vonkNieuw(false); continue; }
        // opstijgen, iets vertragend, en zijwaarts dwarrelen
        p.vy *= (1 - 0.25 * dt);
        p.y -= p.vy * dt;
        p.x = p.x0 + Math.sin(p.fase + p.leeftijd * 2.2) * p.driftAmp;
        var f = p.leeftijd / p.leven;
        var helder = (f < 0.15) ? (f / 0.15) : (1 - (f - 0.15) / 0.85);
        if (helder < 0) { helder = 0; }
        if (helder > 1) { helder = 1; }
        var g = p.grootte * (1 - 0.4 * f);
        ctx.globalAlpha = helder;
        ctx.drawImage(s, p.x - g, p.y - g, g * 2, g * 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      // de haardgloed leeft mee: een onregelmatige puls, met af en toe een oplaaiing
      this.vonkenTijd += dt;
      var gl = this.config.haardgloed;
      var ge = this.haardgloedEl;
      if (ge) {
        var t = this.vonkenTijd;
        var f1 = 0.5 + 0.5 * Math.sin(t * gl.tempo);
        var f2 = 0.5 + 0.5 * Math.sin(t * gl.tempo * 0.53 + 2.1);
        var puls = gl.basis + gl.flikker * (0.6 * f1 + 0.4 * f2);
        this.gloedOplaai *= (1 - 3 * dt);
        if (Math.random() < gl.oplaaiKans) { this.gloedOplaai = gl.oplaai; }
        // de gloed komt op samen met de kamer, niet vol ineens
        var infadeS = (gl.infade || 0) / 1000;
        if (infadeS > 0 && this.gloedInfade < 1) {
          this.gloedInfade += dt / infadeS;
          if (this.gloedInfade > 1) { this.gloedInfade = 1; }
        } else if (infadeS <= 0) {
          this.gloedInfade = 1;
        }
        ge.style.opacity = (puls + this.gloedOplaai) * this.gloedInfade;
      }

      this.vonkenRaf = requestAnimationFrame(this.vonkenLoopBound);
    },

    vonkenUit: function () {
      this.vonkenActief = false;
      if (this.vonkenRaf) { cancelAnimationFrame(this.vonkenRaf); this.vonkenRaf = null; }
      if (this.vonkenCtx && this.vonkenCanvas) {
        this.vonkenCtx.clearRect(0, 0, this.vonkenCanvas.width, this.vonkenCanvas.height);
      }
      if (this.vonkenCanvas) { this.vonkenCanvas.style.opacity = 0; }
      if (this.haardgloedEl) {
        this.haardgloedEl.style.transition = 'none';
        this.haardgloedEl.style.opacity = 0;
      }
    },

    /* geluid */

    audioMaak: function (naam) {
      var g = this.config.geluid;
      var def = g[naam];
      if (!def) { return null; }
      var el = new Audio((g.map || '') + def.bestand);
      el.preload = 'auto';
      el.addEventListener('error', function () {
        if (window && window.console) { console.warn('k6finale: geluid niet gevonden, ' + def.bestand); }
      });
      this.audioEls[naam] = el;
      return el;
    },

    /* Tablets, en Safari in het bijzonder, spelen geluid alleen af als het
       audio-element al een keer is aangesproken binnen een echte tik van de
       speler. De beats starten hun geluid later via timers, en dat telt niet
       meer als zo'n tik: de browser weigert dan stil, zonder foutmelding, en
       de hele scene blijft geluidloos. start() draait wel synchroon vanuit de
       tik waarmee de speler naar binnen gaat, dus daar prikken we elk element
       een keer aan en meteen weer uit. Daarna mogen de beats ze zelf starten. */
    geluidOntgrendel: function () {
      var g = this.config.geluid;
      var namen = [];
      for (var naam in g) {
        if (!g.hasOwnProperty(naam)) { continue; }
        var def = g[naam];
        if (def && typeof def === 'object' && def.bestand) { namen.push(naam); }
      }
      for (var i = 0; i < namen.length; i++) {
        this.geluidPrik(this.audioEls[namen[i]] || this.audioMaak(namen[i]));
      }
    },

    // Stil aan en meteen weer uit. Het pauzeren gebeurt synchroon, nog voordat
    // de eerste beat zijn geluid start, zodat we hier niets wegdrukken dat
    // net legitiem begonnen is.
    geluidPrik: function (el) {
      if (!el || el.k6Ontgrendeld) { return; }
      el.k6Ontgrendeld = true;
      try {
        el.muted = true;
        var p = el.play();
        if (p && p.catch) { p.catch(function () {}); }
        el.pause();
        el.currentTime = 0;
      } catch (x) {}
      el.muted = false;
    },

    audioSpeel: function (naam, opties) {
      var g = this.config.geluid;
      var def = g[naam];
      if (!def) { return; }
      opties = opties || {};
      var el = this.audioEls[naam] || this.audioMaak(naam);
      if (!el) { return; }
      el.loop = !!opties.loop;
      var startPos = (typeof def.startPositie === 'number') ? def.startPositie : 0;
      try { el.currentTime = startPos; } catch (x) {}
      var doel = (typeof def.volume === 'number') ? def.volume : 1;
      el.volume = opties.infade ? 0 : klem01(doel);
      var p = el.play();
      if (p && p.catch) { p.catch(function () {}); }
      if (opties.infade) { this.audioFade(el, 0, doel, opties.infade); }

      // stop na een vaste speelduur, eventueel met uitfade
      if (typeof def.speelDuur === 'number') {
        var self = this;
        var sp = def.speelDuur;
        var uf = (typeof def.uitfade === 'number') ? def.uitfade : 0;
        this.plan(function () {
          if (uf > 0) {
            self.audioFade(el, el.volume, 0, uf, function () { try { el.pause(); } catch (x) {} });
          } else {
            try { el.pause(); } catch (x) {}
          }
        }, sp);
      }
    },

    audioPauzeer: function (naam) {
      var el = this.audioEls[naam];
      if (!el) { return; }
      try { el.pause(); } catch (x) {}
    },

    audioHervat: function (naam) {
      var el = this.audioEls[naam];
      if (!el) { return; }
      var p = el.play();
      if (p && p.catch) { p.catch(function () {}); }
    },

    audioFadeUit: function (naam, ms) {
      var el = this.audioEls[naam];
      if (!el) { return; }
      this.audioFade(el, el.volume, 0, ms, function () { try { el.pause(); } catch (x) {} });
    },

    audioFade: function (el, van, naar, ms, klaar) {
      if (ms <= 0) {
        el.volume = klem01(naar);
        if (naar === 0) { try { el.pause(); } catch (x) {} }
        if (klaar) { klaar(); }
        return;
      }
      var stappen = 24;
      var dt = Math.max(ms / stappen, 12);
      var i = 0;
      var iv = setInterval(function () {
        i++;
        el.volume = klem01(van + (naar - van) * (i / stappen));
        if (i >= stappen) { clearInterval(iv); if (klaar) { klaar(); } }
      }, dt);
      this.audioTimers.push(iv);
    },

    audioStopAlles: function () {
      for (var i = 0; i < this.audioTimers.length; i++) { clearInterval(this.audioTimers[i]); }
      this.audioTimers = [];
      this.mumbleGestart = false;
      for (var k in this.audioEls) {
        if (this.audioEls.hasOwnProperty(k)) {
          var e = this.audioEls[k];
          try { e.pause(); e.currentTime = 0; } catch (x) {}
        }
      }
    },

    exporteer: function () {
      var blok = JSON.stringify(this.config, null, 2);
      if (window && window.console) {
        console.log('k6finale config:');
        console.log(blok);
      }
      return blok;
    },

    herstelStandaard: function () {
      this.config = kloon(STANDAARD);
    }
  };

  window.K6Finale = K6;
})();
