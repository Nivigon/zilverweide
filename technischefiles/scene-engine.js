/* ════════════════════════════════════════════════════════════════════
   SCENE-ENGINE — renderScene()
   Eén functie die elke locatie-scène opbouwt met dezelfde layout:
     ← Terug ────────────────────
              [TITEL]
            [subtitel]
     [ afbeelding (of placeholder) ]
     [ dialoog-regel    | VERDER ]
     [ actie-knoppen (na laatste dialoog-regel) ]

   GEBRUIK
   ───────
   renderScene({
     container: document.getElementById('locatie-content'),
     titel:    'Nummer 10',
     sub:      'Een huis met opgetrokken gordijnen',
     image:    'dd3-nummer10.jpg',     // null/leeg → placeholder
     video:    'intro.mp4',            // OF: video i.p.v. afbeelding
     videoMuted: false,                // optioneel: video gedempt starten
     mediaSlot: '<div>...</div>',      // OF: custom content (string/element/functie) in de 16:9 slot
     mediaSlotAfterDialog: '<div>...</div>',  // optioneel: vervangt media-container na laatste dialoog-regel (met fade)
     dialog: [
       'Voor je staat een huis met de gordijnen open.',
       { spreker: 'Brem', tekst: 'Goedendag.' },
       { tekst: 'Een beat die tijd moet krijgen.', lockMs: 4000 }
     ],
     extra: '<div class="code-section">...</div>',  // optioneel: HTML/element/functie
     acties: [
       { label: 'Klop aan',  onclick: function(){ ... } },
       { label: 'Loop door', onclick: function(){ ... }, stijl: 'blood' }
     ],
     onBack: function() { ... }   // optioneel — vervangt standaard back-knop gedrag
   });

   `extra` kan zijn:
     - string (HTML)
     - DOM-element
     - functie(wrapEl) die zelf elementen toevoegt aan wrapEl

   `extra` verschijnt pas na de laatste dialoog-regel, vóór de acties.

   Een dialoog-regel mag `lockMs` meekrijgen: dat overschrijft de
   berekende Verder-lock voor die ene regel (zie VERDER-LOCK hieronder).
   `lockMs: 0` zet de lock voor die regel helemaal uit.

   De terug-knop:
     - Default: roept goBackFromLocatie() aan als die bestaat
     - Anders: roept opts.onBack aan
   ════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  // ─── Hulpfunctie om DOM-elementen te maken ──────────────────────
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class')             e.className = attrs[k];
        else if (k === 'html')         e.innerHTML = attrs[k];
        else if (k === 'text')         e.textContent = attrs[k];
        else if (k === 'style')        Object.assign(e.style, attrs[k]);
        else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), attrs[k]);
        else                            e.setAttribute(k, attrs[k]);
      });
    }
    if (kids) kids.forEach(function (k) { if (k) e.appendChild(k); });
    return e;
  }

  /* ─── VERDER-LOCK ────────────────────────────────────────────────
     Testspelers klikten sneller door dan ze konden lezen. Solo omdat de
     duim al onderweg was naar de knop, in duo omdat de snelste speler de
     knop had en de ander nog las. Daarom staat Verder na elke nieuwe
     regel even op slot.

     De lock schaalt mee met de regellengte: LOCK_BASIS plus
     LOCK_PER_TEKEN per teken, begrensd tussen LOCK_MIN en LOCK_MAX. Op
     de mediane regel in dit spel (65 tekens) komt dat op 2,0 seconde,
     oftewel ruim 300 woorden per minuut. Dat is sneller dan vrijwel
     iedereen leest, dus de lock raakt alleen wie onmogelijk gelezen kan
     hebben. Wie wel leest, merkt er niets van. Het is een ondergrens,
     geen opgelegd leestempo; daarom bewust niet de volle leestijd.

     In beginnersmodus loopt de lock maal LOCK_BEGINNER_FACTOR, want dat
     is precies de speler waar deze feedback vandaan kwam.

     Uit te zetten via het debugpaneel (window._verderLockUit).
  */
  var LOCK_BASIS           = 400;
  var LOCK_PER_TEKEN       = 25;
  var LOCK_MIN             = 800;
  var LOCK_MAX             = 3000;
  var LOCK_BEGINNER_FACTOR = 1.5;

  // Vaste, kortere lock op de knoppen die na de laatste dialoog-regel
  // verschijnen. De dialoogbalk verdwijnt dan uit de DOM en de acties
  // schuiven omhoog naar ongeveer dezelfde plek, dus een tweede reflex-
  // klik landt zo op een verse knop. Hier is niets te lezen, het gaat
  // puur om die dubbele tik, vandaar een vaste korte waarde.
  var LOCK_ACTIES = 700;

  // Berekent de lockduur in ms. `override` (een getal, ook 0) wint van de
  // berekening en gaat bewust buiten de beginners-factor om: wie een beat
  // handmatig instelt, bedoelt precies dat aantal.
  function dialoogLockMs(tekst, override) {
    if (global._verderLockUit) return 0;
    if (typeof override === 'number') return override;
    var ms = LOCK_BASIS + String(tekst || '').length * LOCK_PER_TEKEN;
    if (ms < LOCK_MIN) ms = LOCK_MIN;
    if (ms > LOCK_MAX) ms = LOCK_MAX;
    if (global._beginnerModus) ms = Math.round(ms * LOCK_BEGINNER_FACTOR);
    return ms;
  }

  // Zet een knop ms lang op slot. `disabled` zorgt dat de klik echt
  // wegvalt en niet wordt bewaard: een bewaarde klik doet na afloop
  // alsnog precies wat we willen voorkomen. De lock-klasse dimt de knop
  // en zet de ornament-pulse stil, want een knop die niets doet voelt
  // kapot en dan gaan mensen juist harder tikken. De pulse die weer gaat
  // lopen is het teken dat je mag klikken.
  function lockKnop(btn, ms, lockKlasse) {
    if (!btn) return;
    var kl = lockKlasse || 'sc-verder-locked';
    if (btn._lockTimer) { clearTimeout(btn._lockTimer); btn._lockTimer = null; }
    if (!ms || ms <= 0) {
      btn.disabled = false;
      btn.classList.remove(kl);
      return;
    }
    btn.disabled = true;
    btn.classList.add(kl);
    btn._lockTimer = setTimeout(function () {
      btn._lockTimer = null;
      btn.disabled = false;
      btn.classList.remove(kl);
    }, ms);
  }

  // Timer opruimen als de knop uit beeld gaat voordat de lock afloopt.
  function lockOpruimen(btn) {
    if (btn && btn._lockTimer) { clearTimeout(btn._lockTimer); btn._lockTimer = null; }
  }

  // ─── Main render-functie ────────────────────────────────────────
  function renderScene(opts) {
    if (!opts || !opts.container) {
      console.warn('renderScene: container ontbreekt');
      return;
    }
    var c = opts.container;
    c.innerHTML = '';

    // Header met terug-knop
    var backBtn = el('button', {
      class: 'sc-back-btn',
      text: '← Terug',
      onclick: function () {
        if (opts.onBack) {
          opts.onBack();
        } else if (typeof global.goBackFromLocatie === 'function') {
          global.goBackFromLocatie();
        }
      }
    });
    var header = el('div', { class: 'sc-header' }, [
      backBtn,
      el('div', { class: 'sc-header-sep' })
    ]);
    c.appendChild(header);

    // Titel + sub
    if (opts.titel) {
      c.appendChild(el('h1', { class: 'sc-titel', text: opts.titel }));
    }
    if (opts.sub) {
      c.appendChild(el('div', { class: 'sc-sub', text: opts.sub }));
    }

    // Media-container: custom slot, video, afbeelding, of placeholder.
    // `geenMedia: true` slaat de container volledig over (geen placeholder),
    // handig als de scene zelf al hoog is (bijvoorbeeld een mini-game) en
    // de speler anders moet scrollen.
    var imageEl;
    if (opts.geenMedia) {
      imageEl = null;
    } else if (opts.mediaSlot) {
      // Custom-mode: zelfde container-formaat (16:9), maar arbitraire content erin.
      // Handig voor interactieve grids, keuzes, kaarten, mini-games etc.
      imageEl = el('div', { class: 'sc-image sc-image-slot' });
      if (typeof opts.mediaSlot === 'string') {
        imageEl.innerHTML = opts.mediaSlot;
      } else if (opts.mediaSlot.nodeType === 1) {
        imageEl.appendChild(opts.mediaSlot);
      } else if (typeof opts.mediaSlot === 'function') {
        try { opts.mediaSlot(imageEl); } catch (e) { console.error('mediaSlot() error:', e); }
      }
    } else if (opts.video) {
      // Video-modus: zelfde container-formaat, maar een <video> erin.
      // `videoPortret: true` zet de container rechtop (9:16) voor staande
      // video's; anders zou een portret-video in een 16:9-vak piepklein
      // in het midden staan met zwarte balken links en rechts.
      var videoCls = 'sc-image sc-image-video' + (opts.videoPortret ? ' sc-image-portret' : '');
      imageEl = el('div', { class: videoCls });
      var vid = el('video', {
        class: 'sc-video',
        src: opts.video,
        autoplay: '',
        playsinline: '',
        controls: ''
      });
      // Audio aan/uit: default met geluid. Pass video: { src, muted: true }
      // om gedempt te starten (handig voor autoplay zonder user-gesture).
      if (opts.videoMuted) vid.muted = true;
      imageEl.appendChild(vid);
    } else if (opts.image) {
      var imgStyle = { backgroundImage: "url('" + opts.image + "')" };
      // imageFit: 'contain' toont de hele afbeelding (passend, met donkere
      // randen) i.p.v. de standaard 'cover' die staande portretten bijsnijdt.
      if (opts.imageFit === 'contain') {
        imgStyle.backgroundSize = 'contain';
        imgStyle.backgroundPosition = 'center';
        imgStyle.backgroundRepeat = 'no-repeat';
      }
      imageEl = el('div', {
        class: 'sc-image',
        style: imgStyle
      });
    } else {
      imageEl = el('div', { class: 'sc-image sc-image-placeholder' });
    }
    if (imageEl) c.appendChild(imageEl);

    // Acties-container — leeg, wordt gevuld na laatste dialoog-regel
    var actiesContainer = el('div', { class: 'sc-acties-mount' });

    // Dialoog (als aanwezig), anders meteen "klaar"-flow uitvoeren
    var dialog = opts.dialog || [];
    if (dialog.length === 0) {
      c.appendChild(actiesContainer);
      naDialoog();
    } else {
      var dialogResult = bouwDialog(dialog, function () {
        // Klaar met dialoog → toon extra-content + acties
        naDialoog();
      }, opts.sprekerPops);
      c.appendChild(dialogResult);
      c.appendChild(actiesContainer);
    }

    function naDialoog() {
      swapMediaSlot();
      toonExtra();
      toonActies();
    }

    function swapMediaSlot() {
      if (!opts.mediaSlotAfterDialog) return;
      console.log('[scene-engine] swapMediaSlot triggered');
      // Fade naar nieuwe inhoud. We bouwen een nieuwe slot-image en
      // wisselen de oude eruit met een korte cross-fade.
      var nieuw = el('div', { class: 'sc-image sc-image-slot sc-fade-in' });
      if (typeof opts.mediaSlotAfterDialog === 'string') {
        nieuw.innerHTML = opts.mediaSlotAfterDialog;
      } else if (opts.mediaSlotAfterDialog.nodeType === 1) {
        nieuw.appendChild(opts.mediaSlotAfterDialog);
      } else if (typeof opts.mediaSlotAfterDialog === 'function') {
        try { opts.mediaSlotAfterDialog(nieuw); } catch (e) { console.error('mediaSlotAfterDialog() error:', e); }
      }
      // Veilige lookup: gebruik niet de stale closure-referentie, maar
      // zoek het huidige .sc-image element opnieuw op in de container.
      var huidig = c.querySelector('.sc-image');
      console.log('[scene-engine] huidig element:', huidig);
      if (!huidig || !huidig.parentNode) {
        console.warn('[scene-engine] geen huidig .sc-image gevonden, append direct');
        c.insertBefore(nieuw, c.firstChild);
        imageEl = nieuw;
        return;
      }
      huidig.classList.add('sc-fade-out');
      setTimeout(function () {
        if (huidig.parentNode) {
          huidig.parentNode.replaceChild(nieuw, huidig);
          imageEl = nieuw;
          console.log('[scene-engine] swap voltooid');
        }
      }, 250);
    }

    function toonExtra() {
      if (!opts.extra) return;
      var wrap = el('div', { class: 'sc-extra' });
      if (typeof opts.extra === 'string') {
        wrap.innerHTML = opts.extra;
      } else if (opts.extra.nodeType === 1) {
        // Het is een DOM-element
        wrap.appendChild(opts.extra);
      } else if (typeof opts.extra === 'function') {
        // Functie: roept render-callback aan met de wrapper als argument
        try { opts.extra(wrap); } catch (e) { console.error('extra() error:', e); }
      }
      actiesContainer.appendChild(wrap);
    }

    function toonActies() {
      if (!opts.acties || !opts.acties.length) return;
      var groep = el('div', { class: 'sc-acties' });
      opts.acties.forEach(function (actie) {
        var klasse = 'sc-actie-btn';
        if (actie.stijl === 'blood') klasse += ' sc-actie-blood';
        if (actie.stijl === 'groot') klasse += ' sc-actie-groot';
        var btn = el('button', {
          class: klasse,
          text: actie.label,
          onclick: function (e) {
            e.preventDefault();
            if (actie.onclick) actie.onclick();
          }
        });
        // Korte lock: deze knoppen verschijnen op het moment van de
        // laatste Verder-klik, dus een dubbele tik zou hier landen.
        lockKnop(btn, global._verderLockUit ? 0 : LOCK_ACTIES, 'sc-actie-locked');
        groep.appendChild(btn);
      });
      actiesContainer.appendChild(groep);
    }
  }

  // ─── Dialoog-box bouwen ─────────────────────────────────────────
  function bouwDialog(lines, onComplete, sprekerPops) {
    var idx = 0;

    var spreker = el('div', { class: 'sc-dialog-spreker' });
    var tekst   = el('div', { class: 'sc-dialog-tekst' });
    var body    = el('div', { class: 'sc-dialog-body' }, [spreker, tekst]);

    var verderBtn = el('button', {
      class: 'sc-dialog-verder',
      title: 'Verder',
      onclick: function (e) { e.preventDefault(); e.stopPropagation(); volgende(); }
    }, [
      el('span', { class: 'sc-verder-ornament', text: '❧' }),
      el('span', { class: 'sc-verder-label',    text: 'Verder' })
    ]);

    var dialog = el('div', { class: 'sc-dialog' }, [body, verderBtn]);

    function toonRegel(i) {
      var regel = lines[i];
      var sp = '', tx = '', onShow = null, lockOverride = null;
      if (typeof regel === 'string') {
        tx = regel;
      } else if (regel && typeof regel === 'object') {
        sp = regel.spreker || '';
        tx = regel.tekst || '';
        onShow = regel.onShow || null;
        lockOverride = (typeof regel.lockMs === 'number') ? regel.lockMs : null;
      }
      // Verder gaat op slot zolang deze regel niet gelezen kan zijn.
      lockKnop(verderBtn, dialoogLockMs(tx, lockOverride), 'sc-verder-locked');
      if (sp) {
        spreker.textContent = sp;
        spreker.style.display = '';
      } else {
        spreker.style.display = 'none';
      }
      tekst.textContent = tx;
      // re-trigger fade-in op tekst
      tekst.style.animation = 'none';
      void tekst.offsetWidth;
      tekst.style.animation = '';
      // sprekerPops: { 'Herbergier': 'pad/naar/pop.png' }. Zodra een regel
      // van die spreker in beeld komt, verschijnt zijn pop vanzelf. Scheelt
      // een onShow op elke losse regel, en je vergeet er dan ook geen.
      if (sprekerPops && sp && sprekerPops[sp] && typeof window.toonNpcPop === 'function') {
        try { window.toonNpcPop(sprekerPops[sp]); } catch (e) {}
      }
      // Optionele callback wanneer deze regel in beeld komt — handig
      // om bv. de NPC-pop te wisselen op het juiste moment.
      if (onShow) {
        try { onShow(); } catch (e) { console.error('dialog onShow() error:', e); }
      }
    }

    function volgende() {
      idx++;
      if (idx >= lines.length) {
        lockOpruimen(verderBtn);
        if (dialog.parentNode) dialog.parentNode.removeChild(dialog);
        if (onComplete) onComplete();
        return;
      }
      toonRegel(idx);
    }

    toonRegel(0);
    return dialog;
  }

  // Expose
  global.renderScene = renderScene;
  // De doolhof- en lockpick-engine hebben een eigen Verder-knop met
  // hetzelfde patroon en gebruiken deze twee, zodat de lock overal
  // dezelfde is en op één plek te verstellen valt.
  global.dialoogLockMs  = dialoogLockMs;
  global.dialoogLockKnop = lockKnop;
  global.dialoogLockOpruimen = lockOpruimen;
})(window);
