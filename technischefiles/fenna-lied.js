/* ══════════════════════════════════════════════════════════════════
   FennaLied — Mastermind-mechanic voor Fenna's lied.
   De speler kiest per rol (genre, lied, eerste regel) een antwoord.
   Na "Vastleggen" hoort de speler HOEVEEL er kloppen, niet welke.
   Alle drie goed = opgelost.

   Presentatie: de rollen komen een voor een uit de duisternis, na
   het vastleggen verdwijnt de vorige en verschijnt de volgende.
   Het antwoord "draait" door het perkament-venster bij het scrollen.

   Publieke API (aangeroepen vanuit zilverweide.html):
     FennaLied.open(liedKey, onKlaar)  – overlay tonen, mechanic starten
                                          liedKey: 'robbie' | 'stiltevijver'
                                          onKlaar(): callback bij opgelost
     FennaLied.close()                 – overlay opruimen

   Config (optioneel vooraf zetten):
     FennaLied.setSnelheid(rollMs, emergeMs)
     FennaLied.DEBUG = true             – snelheidsregelaars tonen
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────
  // Content. Pas hier de teksten aan. correct = index van het juiste
  // antwoord (husselvolgorde staat vast zodat het niet altijd bovenaan staat).
  // ─────────────────────────────────────────────────────────────────
  var LIEDEREN = {
    robbie: {
      titel: 'Robbie verdient een lied. Maar welke...',
      hint: '1 op 1 met zo\'n fan. Dit vraagt om iets intiems.',
      vragen: [
        { id: 'genre', label: 'Toon', correct: 1, options: [
          'Bombastische operette, groots en meeslepend voor volle zalen',
          'Zwoele fluister-chanson, verleidelijk en persoonlijk',
          'Dramatische klaagzang, tranen en groot verdriet'
        ] },
        { id: 'lied', label: 'Liedtitel', correct: 2, options: [
          'Sta Op En Juich Voor Mij',
          'Hoor Mij Brullen Door De Zaal',
          'Adem Me In'
        ] },
        { id: 'eersteRegel', label: 'Eerste regel', correct: 0, options: [
          'Luister, en verlies je in mijn lied',
          'Sta op, o volk, en hoor mijn kreet',
          'Ik zing dit lied voor iedereen die luistert'
        ] }
      ],
      liedtitel: 'Adem Me In',
      regels: [
        'Luister, en verlies je in mijn lied,',
        'Kom nader nu, en adem wat je ziet,',
        'Ik ben de gloed die zacht je zinnen streelt,',
        'Blijf dicht bij mij, tot niets je nog verveelt.'
      ]
    },
    stiltevijver: {
      titel: 'Deze mensen verdienen een lied. Maar welke...',
      hint: 'Neem deze mensen mee. Het is een zware avond.',
      vragen: [
        { id: 'genre', label: 'Toon', correct: 2, options: [
          'Zwoele fluister-chanson, verleidelijk en persoonlijk',
          'Opzwepende danswijs, uitbundig en vrolijk',
          'Sussende hymne, plechtig en troostrijk met haar als lichtbaken'
        ] },
        { id: 'lied', label: 'Liedtitel', correct: 0, options: [
          'Volg Mijn Licht Door Deze Nacht',
          'Kom Dans En Vier Het Leven Mee',
          'Fluister Mij Je Diepste Wensen'
        ] },
        { id: 'eersteRegel', label: 'Eerste regel', correct: 1, options: [
          'Sta op en dans, de nacht is jong',
          'Sluit je ogen, mijn stem houdt wacht',
          'Kom dichterbij, ik fluister enkel jou'
        ] }
      ],
      liedtitel: 'Volg Mijn Licht Door Deze Nacht',
      regels: [
        'Sluit je ogen, mijn stem houdt wacht,',
        'Geen schaduw raakt je deze nacht,',
        'Laat gaan wat drukt, geef mij je pijn,',
        'Dan zal de morgen milder zijn.'
      ]
    },
    herberg: {
      titel: 'Deze situatie vraagt een lied, maar welke?',
      hint: 'Agressiviteit kan soms agressie beantwoorden, maar de juiste afleiding of ver...',
      vragen: [
        { id: 'genre', label: 'Toon', correct: 0, options: [
          'Betoverend en verleidelijk, ze pakt de hele meute in',
          'Fel en overdonderend, ze schreeuwt boven de meute uit',
          'Zacht en troostend, ze sust de gemoederen'
        ] },
        { id: 'lied', label: 'Liedtitel', correct: 0, options: [
          'Honing En Vuur',
          'Sta Op En Vecht Met Mij',
          'Huil Maar Uit Aan Mijn Schouder'
        ] },
        { id: 'eersteRegel', label: 'Eerste regel', correct: 1, options: [
          'Sta op en vecht, de tijd is daar',
          'Vergeet waarvoor je hier ook kwam',
          'Kom leg je hoofd, ik troost je pijn'
        ] }
      ],
      liedtitel: 'Honing En Vuur',
      regels: [
        'Vergeet waarvoor je hier ook kwam,',
        'Er is geen strijd, geen oude vlam,',
        'Alleen mijn stem die zacht je streelt,',
        'Tot niets van gisteren je nog verveelt.',
        '',
        'Honing... en vuur...',
        'Smelt met me samen, in ons laatste uur.'
      ]
    }
  };

  var cfg = { rollMs: 2500, emergeMs: 900 };

  // ── Interne toestand ──
  var root = null, stageEl = null, panelEl = null;
  var vragen = null, titel = '', liedHint = '', liedTitel = '', liedRegels = null;
  var currentIndex = 0, selections = {}, onKlaarCb = null;

  // ─────────────────────────────────────────────────────────────────
  // Stijl (eenmalig injecteren)
  // ─────────────────────────────────────────────────────────────────
  function ensureStyle() {
    if (document.getElementById('fl-style')) return;
    var s = document.createElement('style');
    s.id = 'fl-style';
    s.textContent = [
      '#fl-root{position:fixed;inset:0;z-index:9500;overflow:auto;',
        'font-family:"Cinzel",Georgia,serif;-webkit-user-select:none;user-select:none;',
        'background:#0d0a06}',
      '#fl-root::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;',
        'background:radial-gradient(ellipse at 30% 20%,rgba(60,44,24,.25) 0%,transparent 50%),',
        'radial-gradient(ellipse at 75% 75%,rgba(40,30,18,.3) 0%,transparent 55%)}',
      '#fl-panel{position:relative;z-index:1;max-width:700px;margin:0 auto;padding:70px 20px 40px;',
        'min-height:100vh;box-sizing:border-box;display:flex;flex-direction:column}',

      // Ingebed in de bestaande locatie-UI: geen fullscreen, geen eigen
      // achtergrond, compacter. De spel-UI eromheen blijft zichtbaar.
      '#fl-panel.fl-ingebed{min-height:0;padding:4px 0 0;max-width:none}',
      '.fl-ingebed .fl-header{margin-bottom:14px}',
      '.fl-ingebed .fl-header h2{font-size:19px;margin-bottom:6px}',
      '.fl-ingebed .fl-intro{font-size:12px;max-width:360px}',
      '.fl-ingebed .fl-stage{min-height:0}',
      '.fl-ingebed .fl-emerge{gap:10px}',
      '.fl-ingebed .fl-qlabel{font-size:12px;letter-spacing:4px}',
      '.fl-ingebed .fl-arrow{width:38px;height:38px}',
      '.fl-ingebed .fl-arrow svg{width:19px;height:19px}',
      '.fl-ingebed .fl-scroll{width:300px}',
      '.fl-ingebed .fl-sheet{padding:16px 18px}',
      '.fl-ingebed{--fl-win:62px}',
      '.fl-ingebed .fl-answer{font-size:15px}',
      '.fl-ingebed .fl-progress{margin-top:8px}',
      '.fl-ingebed .fl-actions{margin-top:16px}',
      '.fl-ingebed .fl-btn{padding:11px 36px}',
      '.fl-ingebed .fl-feedback{padding:20px 26px}',
      '.fl-ingebed .fl-lied-titel{font-size:18px;margin-bottom:14px}',
      '.fl-ingebed .fl-lied-regel{font-size:16px;line-height:1.45}',
      '.fl-ingebed .fl-lied-actie{margin-top:18px}',
      '.fl-ingebed .fl-speed{position:static;transform:none;width:auto;margin-top:16px}',

      '.fl-header{text-align:center;margin-bottom:34px}',
      '.fl-eyebrow{font-size:11px;color:#8a6d3b;letter-spacing:3px;text-transform:uppercase;',
        'margin-bottom:12px;font-style:italic;font-family:"Crimson Text",Georgia,serif}',
      '.fl-header h2{font-size:28px;margin:0 0 12px;font-weight:500;color:#c9a84c;letter-spacing:1px}',
      '.fl-intro{font-size:13px;color:#7d6640;margin:0 auto;max-width:400px;line-height:1.6;',
        'font-family:"Crimson Text",Georgia,serif}',

      '.fl-stage{position:relative;flex:1;min-height:360px;display:flex;align-items:center;justify-content:center}',

      '.fl-emerge{display:flex;flex-direction:column;align-items:center;gap:16px;',
        'transition:opacity var(--fl-emerge) ease,transform var(--fl-emerge) ease,filter var(--fl-emerge) ease}',
      '.fl-emerge.shown{opacity:1;transform:translateY(0) scale(1);filter:brightness(1)}',
      '.fl-emerge.hidden{opacity:0;transform:translateY(30px) scale(.94);filter:brightness(.1)}',

      '.fl-qlabel{font-size:13px;font-weight:500;color:#c9a84c;text-transform:uppercase;',
        'letter-spacing:5px;margin-bottom:2px}',

      '.fl-arrow{background:transparent;border:1px solid rgba(201,168,76,.4);color:#c9a84c;',
        'cursor:pointer;width:44px;height:44px;display:flex;align-items:center;justify-content:center;',
        'transition:all .3s ease;border-radius:50%;flex-shrink:0}',
      '.fl-arrow:hover{border-color:#c9a84c;color:#e8c87f;box-shadow:0 0 14px rgba(201,168,76,.3)}',
      '.fl-arrow:active{transform:scale(.93)}',
      '.fl-arrow svg{width:22px;height:22px}',

      '.fl-scroll{width:340px;max-width:80vw;display:flex;flex-direction:column;align-items:center}',
      '.fl-roll{position:relative;width:102%;height:18px;border-radius:10px;',
        'background:linear-gradient(180deg,#1c150c 0%,#2a2012 45%,#17110a 100%);',
        'border:1px solid rgba(201,168,76,.35);',
        'box-shadow:inset 0 1px 1px rgba(201,168,76,.15),inset 0 -2px 3px rgba(0,0,0,.6);z-index:3}',
      '.fl-roll.top{margin-bottom:-4px}',
      '.fl-roll.bottom{margin-top:-4px}',
      '.fl-cap{position:absolute;top:50%;width:14px;height:22px;border-radius:50%;',
        'background:radial-gradient(ellipse at 40% 35%,#4a3a1e 0%,#1c150c 70%);',
        'border:1px solid rgba(201,168,76,.4);transform:translateY(-50%)}',
      '.fl-cap.left{left:-6px}',
      '.fl-cap.right{right:-6px}',
      '.fl-sheet{width:100%;background:linear-gradient(180deg,rgba(30,22,12,.9) 0%,rgba(18,13,7,.95) 100%);',
        'border-left:1px solid rgba(201,168,76,.25);border-right:1px solid rgba(201,168,76,.25);',
        'padding:26px 20px;position:relative;z-index:2;box-sizing:border-box}',
      '.fl-window{width:100%;height:var(--fl-win,82px);overflow:hidden;display:flex;align-items:center;',
        'justify-content:center;position:relative}',
      '.fl-answer{display:block;text-align:center;padding:0 6px;font-size:17px;color:#d9bd72;',
        'font-weight:500;line-height:1.4;letter-spacing:.3px;font-family:"Crimson Text",Georgia,serif;',
        'text-shadow:0 1px 6px rgba(201,168,76,.2)}',
      '.fl-answer.roll-down{animation:fl-fromtop var(--fl-roll) cubic-bezier(.25,.6,.3,1)}',
      '.fl-answer.roll-up{animation:fl-frombottom var(--fl-roll) cubic-bezier(.25,.6,.3,1)}',
      '@keyframes fl-fromtop{0%{transform:translateY(calc(-1 * var(--fl-win,82px)));opacity:0}45%{opacity:.4}100%{transform:translateY(0);opacity:1}}',
      '@keyframes fl-frombottom{0%{transform:translateY(var(--fl-win,82px));opacity:0}45%{opacity:.4}100%{transform:translateY(0);opacity:1}}',

      '.fl-progress{display:flex;gap:12px;margin-top:14px}',
      '.fl-dot{width:7px;height:7px;border-radius:50%;border:1px solid rgba(201,168,76,.4);',
        'background:transparent;transition:all .4s ease}',
      '.fl-dot.on{background:#c9a84c;box-shadow:0 0 8px rgba(201,168,76,.5)}',
      '.fl-dot.done{background:rgba(201,168,76,.35)}',

      '.fl-actions{text-align:center;margin-top:32px}',
      '.fl-btn{background:transparent;color:#c9a84c;border:1px solid rgba(201,168,76,.5);',
        'padding:14px 44px;font-size:13px;font-weight:500;font-family:"Cinzel",Georgia,serif;',
        'cursor:pointer;border-radius:3px;text-transform:uppercase;letter-spacing:3px;transition:all .3s ease}',
      '.fl-btn:disabled{opacity:.3;cursor:default}',
      '.fl-btn:not(:disabled):hover{border-color:#c9a84c;color:#e8c87f;box-shadow:0 0 18px rgba(201,168,76,.25)}',

      // Het lied klinkt op: titel, dan de regels een voor een, met een zachte
      // gouden gloed. Geen kader, want het moet klinken, niet ingelijst staan.
      // Tijdens het zingen valt de kop weg: het lied krijgt het hele podium.
      '#fl-panel.fl-zingt .fl-header{display:none}',
      '.fl-lied{text-align:center;max-width:440px;padding:0 16px;animation:fl-liedin 1.4s ease}',
      '.fl-lied-eyebrow{font-size:11px;color:#8a6d3b;letter-spacing:4px;text-transform:uppercase;',
        'font-family:"Crimson Text",Georgia,serif;font-style:italic;margin-bottom:8px}',
      '.fl-lied-titel{font-size:20px;font-weight:500;color:#c9a84c;margin:0 0 16px;letter-spacing:1px;',
        'font-family:"Cinzel",Georgia,serif;text-shadow:0 0 24px rgba(201,168,76,.35)}',
      '.fl-lied-titel::before{content:"\\201C"}',
      '.fl-lied-titel::after{content:"\\201D"}',
      '.fl-lied-regels{display:flex;flex-direction:column;gap:0}',
      '.fl-lied-regel{margin:0;font-family:"Crimson Text",Georgia,serif;font-style:italic;',
        'font-size:17px;line-height:1.5;color:#e0c882;opacity:0;',
        'text-shadow:0 0 18px rgba(201,168,76,.25);',
        'animation:fl-regelin 1.5s ease forwards}',
      '.fl-lied-regel.leeg{height:10px;animation:none}',
      '.fl-lied-actie{margin-top:20px;animation:fl-liedin 1.2s ease}',
      '@keyframes fl-liedin{0%{opacity:0}100%{opacity:1}}',
      '@keyframes fl-regelin{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}',

      '.fl-feedback{text-align:center;padding:28px 32px;border:1px solid rgba(201,168,76,.4);',
        'border-radius:3px;background:rgba(20,14,8,.6);max-width:380px;animation:fl-emerge 1s ease}',
      '.fl-feedback.solved{border-color:rgba(201,168,76,.7);box-shadow:0 0 24px rgba(201,168,76,.2)}',
      '.fl-count{font-size:22px;font-weight:500;color:#c9a84c;margin:0;letter-spacing:1px}',
      '.fl-hint{font-size:13px;color:#7d6640;margin:12px 0 22px;font-family:"Crimson Text",Georgia,serif;font-style:italic}',
      '@keyframes fl-emerge{0%{opacity:0;transform:scale(.92);filter:brightness(.2)}100%{opacity:1;transform:scale(1);filter:brightness(1)}}',

      '.fl-speed{position:fixed;right:16px;top:50%;transform:translateY(-50%);z-index:9550;',
        'width:220px;padding:16px;background:rgba(0,0,0,.55);',
        'border:1px dashed rgba(125,102,64,.4);border-radius:4px;display:flex;flex-direction:column;gap:12px}',
      '.fl-speed-row{display:flex;flex-direction:column;gap:4px}',
      '.fl-speed-row label{font-size:11px;color:#7d6640;letter-spacing:1px;text-transform:uppercase;',
        'font-family:"Crimson Text",Georgia,serif}',
      '.fl-speed-row input[type=range]{width:100%;accent-color:#c9a84c}'
    ].join('');
    document.head.appendChild(s);
  }

  // ─────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  var ARROW_UP = '<svg viewBox="0 0 40 40"><path d="M 20 12 L 32 26 M 20 12 L 8 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ARROW_DOWN = '<svg viewBox="0 0 40 40"><path d="M 20 28 L 32 14 M 20 28 L 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // ─────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────
  function renderVraag(rollDir, nieuw) {
    var q = vragen[currentIndex];
    var idx = selections[q.id];

    stageEl.innerHTML = '';
    // Nieuw = de vraag verschijnt vers (fade-in uit duisternis).
    // Anders (bij scrollen) staat hij meteen zichtbaar.
    var wrap = el('div', 'fl-emerge ' + (nieuw ? 'hidden' : 'shown'));

    // Label
    wrap.appendChild(el('div', 'fl-qlabel', q.label));

    // Pijl omhoog
    var up = el('button', 'fl-arrow', ARROW_UP);
    up.setAttribute('aria-label', 'Vorige');
    up.onclick = function () { schuif(-1); };
    wrap.appendChild(up);

    // Scroll
    var scroll = el('div', 'fl-scroll');
    var rTop = el('div', 'fl-roll top');
    rTop.appendChild(el('span', 'fl-cap left'));
    rTop.appendChild(el('span', 'fl-cap right'));
    scroll.appendChild(rTop);

    var sheet = el('div', 'fl-sheet');
    var win = el('div', 'fl-window');
    var ansCls = 'fl-answer' + (rollDir === 1 ? ' roll-down' : rollDir === -1 ? ' roll-up' : '');
    var ans = el('span', ansCls, q.options[idx]);
    win.appendChild(ans);
    sheet.appendChild(win);
    scroll.appendChild(sheet);

    var rBot = el('div', 'fl-roll bottom');
    rBot.appendChild(el('span', 'fl-cap left'));
    rBot.appendChild(el('span', 'fl-cap right'));
    scroll.appendChild(rBot);
    wrap.appendChild(scroll);

    // Pijl omlaag
    var down = el('button', 'fl-arrow', ARROW_DOWN);
    down.setAttribute('aria-label', 'Volgende');
    down.onclick = function () { schuif(1); };
    wrap.appendChild(down);

    // Voortgang
    var prog = el('div', 'fl-progress');
    for (var i = 0; i < vragen.length; i++) {
      var dcls = 'fl-dot' + (i === currentIndex ? ' on' : '') + (i < currentIndex ? ' done' : '');
      prog.appendChild(el('span', dcls));
    }
    wrap.appendChild(prog);

    stageEl.appendChild(wrap);

    // Fade-in triggeren: forceer reflow, wacht twee frames zodat de
    // browser de 'hidden'-staat vastlegt, ga dan naar 'shown'. Dubbele
    // rAF is de betrouwbaarste manier om de trage transitie te laten spelen.
    if (nieuw) {
      void wrap.offsetWidth;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          wrap.classList.remove('hidden');
          wrap.classList.add('shown');
        });
      });
    }

    // Actieknop
    renderActie(true);
  }

  function renderActie(actief) {
    var old = panelEl.querySelector('.fl-actions');
    if (old) old.remove();
    if (!actief) return;
    var acts = el('div', 'fl-actions');
    var btn = el('button', 'fl-btn');
    btn.textContent = (currentIndex < vragen.length - 1) ? 'Vastleggen' : 'Vastleggen en luisteren';
    btn.onclick = vastleggen;
    acts.appendChild(btn);
    panelEl.appendChild(acts);
  }

  function schuif(richting) {
    var q = vragen[currentIndex];
    var max = q.options.length;
    var ni = selections[q.id] + richting;
    if (ni < 0) ni = max - 1;
    if (ni >= max) ni = 0;
    selections[q.id] = ni;
    renderVraag(richting, false);
  }

  function vastleggen() {
    renderActie(false);
    var wrap = stageEl.querySelector('.fl-emerge');
    if (wrap) { wrap.classList.remove('shown'); wrap.classList.add('hidden'); }
    setTimeout(function () {
      if (currentIndex < vragen.length - 1) {
        currentIndex++;
        renderVraag(0, true);
      } else {
        beoordeel();
      }
    }, cfg.emergeMs);
  }

  function beoordeel() {
    var goed = 0;
    for (var i = 0; i < vragen.length; i++) {
      var q = vragen[i];
      if (selections[q.id] === q.correct) goed++;
    }
    stageEl.innerHTML = '';
    if (goed === vragen.length) {
      toonLied();
    } else {
      var fb = el('div', 'fl-feedback');
      fb.appendChild(el('p', 'fl-count', goed + ' van ' + vragen.length + ' goed'));
      fb.appendChild(el('p', 'fl-hint', liedHint || 'Maar welke? Probeer een andere volgorde.'));
      var btn = el('button', 'fl-btn', 'Opnieuw');
      btn.onclick = function () { currentIndex = 0; renderVraag(0, true); };
      fb.appendChild(btn);
      stageEl.appendChild(fb);
    }
  }

  // Het juiste lied klinkt op: titel, dan de regels een voor een, alsof
  // Fenna ze zingt. De speler gaat zelf verder als hij uitgeluisterd is.
  function toonLied() {
    renderActie(false);

    // De kop en de uitleg hebben hun werk gedaan. Weg ermee, zodat het lied
    // de ruimte krijgt en de speler niet hoeft te scrollen.
    if (panelEl) panelEl.classList.add('fl-zingt');

    var wrap = el('div', 'fl-lied');
    wrap.appendChild(el('div', 'fl-lied-eyebrow', 'Ze zingt'));
    if (liedTitel) wrap.appendChild(el('h3', 'fl-lied-titel', liedTitel));

    var regelsEl = el('div', 'fl-lied-regels');
    wrap.appendChild(regelsEl);
    stageEl.appendChild(wrap);

    // Breng het lied in beeld. De scene eromheen (locatiekop, dialoog) kan
    // hoog zijn; zonder dit zou de speler moeten scrollen om het te zien.
    try {
      wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) {
      // Oudere browsers: geen opties-object.
      if (wrap.scrollIntoView) wrap.scrollIntoView();
    }

    // Regels een voor een laten opkomen. Lege regels in de data zijn
    // strofe-scheidingen en krijgen alleen ruimte, geen tekst.
    var regels = liedRegels || [];
    var vertraging = 700;
    regels.forEach(function (regel, i) {
      var r = el('p', regel === '' ? 'fl-lied-regel leeg' : 'fl-lied-regel', regel);
      r.style.animationDelay = (600 + i * vertraging) + 'ms';
      regelsEl.appendChild(r);
    });

    // Verder-knop pas als het lied is uitgeklonken.
    var wachtMs = 600 + regels.length * vertraging + 700;
    setTimeout(function () {
      if (!stageEl || !stageEl.contains(wrap)) return;   // scene is inmiddels weg
      var acts = el('div', 'fl-lied-actie');
      var btn = el('button', 'fl-btn', 'Verder');
      btn.onclick = function () {
        if (typeof onKlaarCb === 'function') onKlaarCb();
      };
      acts.appendChild(btn);
      wrap.appendChild(acts);
      // Zorg dat de knop zichtbaar is, ook als het lied lang is.
      try {
        acts.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (e) {
        if (acts.scrollIntoView) acts.scrollIntoView();
      }
    }, wachtMs);
  }

  function renderSpeed() {
    if (!api.DEBUG) return;
    var p = el('div', 'fl-speed');
    p.appendChild(speedRow('Antwoord draaien', 'rollMs', 300, 4000));
    p.appendChild(speedRow('Vraag verschijnen', 'emergeMs', 600, 5000));
    panelEl.appendChild(p);
  }

  function speedRow(labelText, key, min, max) {
    var row = el('div', 'fl-speed-row');
    var lab = el('label', null, labelText + ': ' + cfg[key] + ' ms');
    var inp = el('input');
    inp.type = 'range'; inp.min = min; inp.max = max; inp.step = 100; inp.value = cfg[key];
    inp.oninput = function () {
      cfg[key] = Number(inp.value);
      lab.textContent = labelText + ': ' + cfg[key] + ' ms';
      applyVars();
    };
    row.appendChild(lab);
    row.appendChild(inp);
    return row;
  }

  function applyVars() {
    if (!root) return;
    root.style.setProperty('--fl-roll', cfg.rollMs + 'ms');
    root.style.setProperty('--fl-emerge', cfg.emergeMs + 'ms');
  }

  // ─────────────────────────────────────────────────────────────────
  // Publieke API
  // ─────────────────────────────────────────────────────────────────
  // Gedeelde opbouw voor open() en mount().
  // ─────────────────────────────────────────────────────────────────
  function bouwPaneel(liedKey, onKlaar, ingebed) {
    var data = LIEDEREN[liedKey];
    if (!data) { console.warn('FennaLied: onbekend lied "' + liedKey + '"'); return null; }
    ensureStyle();

    vragen = data.vragen;
    titel = data.titel;
    liedHint = data.hint || '';
    liedTitel = data.liedtitel || '';
    liedRegels = data.regels || [];
    currentIndex = 0;
    selections = {};
    for (var i = 0; i < vragen.length; i++) selections[vragen[i].id] = 0;
    onKlaarCb = onKlaar || null;

    panelEl = el('div');
    panelEl.id = 'fl-panel';
    if (ingebed) panelEl.className = 'fl-ingebed';

    var header = el('div', 'fl-header');
    header.appendChild(el('h2', null, titel));
    header.appendChild(el('p', 'fl-intro', 'Kies toon, lied en eerste regel. Leg elk vast om te horen hoeveel er kloppen.'));
    panelEl.appendChild(header);

    stageEl = el('div', 'fl-stage');
    panelEl.appendChild(stageEl);

    return panelEl;
  }

  // ─────────────────────────────────────────────────────────────────
  var api = {
    DEBUG: false,

    setSnelheid: function (rollMs, emergeMs) {
      if (rollMs != null) cfg.rollMs = rollMs;
      if (emergeMs != null) cfg.emergeMs = emergeMs;
      applyVars();
    },

    // Ingebed in de bestaande locatie-UI (via `extra` van renderLocatieScene).
    // Geef een container mee; de mechanic rendert daarbinnen. De omliggende
    // spel-UI (kop, dialoog, inventaris) blijft gewoon staan.
    mount: function (container, liedKey, onKlaar) {
      if (!container) { console.warn('FennaLied.mount: geen container'); return; }
      var p = bouwPaneel(liedKey, onKlaar, true);
      if (!p) return;

      root = container;              // bij ingebed gebruik: container is de root
      container.innerHTML = '';
      container.appendChild(p);

      applyVars();
      renderSpeed();
      renderVraag(0, true);
    },

    // Volledig scherm-overlay (los van de spel-UI).
    open: function (liedKey, onKlaar) {
      this.close();
      var p = bouwPaneel(liedKey, onKlaar, false);
      if (!p) return;

      root = el('div');
      root.id = 'fl-root';
      root.appendChild(p);
      document.body.appendChild(root);

      applyVars();
      renderSpeed();
      renderVraag(0, true);
    },

    close: function () {
      // Alleen de eigen overlay opruimen; een meegegeven container niet slopen.
      if (root && root.id === 'fl-root' && root.parentNode) root.parentNode.removeChild(root);
      root = null; stageEl = null; panelEl = null;
      vragen = null; onKlaarCb = null; liedHint = ''; liedTitel = ''; liedRegels = null;
    }
  };

  window.FennaLied = api;
})();
