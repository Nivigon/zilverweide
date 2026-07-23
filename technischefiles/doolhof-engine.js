/* ════════════════════════════════════════════════════════════════════
   DOOLHOF-ENGINE
   Herbruikbare first-person doolhof in tegel-grid stijl.

   GEBRUIK
   ──────
   const dh = new Doolhof({
     container: document.getElementById('mount'),
     config:    WOUD_CONFIG,
     onWin:     function() { ... },
     onExit:    function() { ... },    // optioneel: back-knop
     music:     'audio.mp3',           // optioneel
     showStart: true,                  // optioneel, default true
     showDebug: false,                 // optioneel, default false
   });
   dh.mount();         // bouwt UI in container
   dh.start();         // skip startscherm, direct spelen
   dh.destroy();       // ruim alles op (DOM + listeners + audio)

   CONFIG-OBJECT
   ─────────────
   Zie WOUD_CONFIG in doolhof.html voor een volledig voorbeeld.
   Velden:
     gridSize:       {rows, cols}                — bv. {rows:4, cols:4}
     start:          {r, c}                      — startpositie
     exit:           {r, c}                      — uitgang-tegel
     tegelLetter:    { "r,c": "a" }              — label per tegel (optioneel, voor positie-display)
     safe:           { "r,c": ["vooruit", ...] } — veilige richtingen per tegel
     forceButtons:   { "r,c": ["achter"] }       — overschrijf zichtbare knoppen (optioneel)
     images:         { scene: 'woud.jpg', heks: 'heks.jpg' }
     teksten:        { titel, sub, intro: [..], caption, heks, win: {titel, body} }
   ════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  // ─── Hulpfuncties ───────────────────────────────────────────────
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class')         e.className = attrs[k];
        else if (k === 'html')     e.innerHTML = attrs[k];
        else if (k === 'text')     e.textContent = attrs[k];
        else if (k === 'style')    Object.assign(e.style, attrs[k]);
        else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), attrs[k]);
        else                       e.setAttribute(k, attrs[k]);
      });
    }
    if (kids) kids.forEach(function (k) { if (k) e.appendChild(k); });
    return e;
  }

  function tileKey(r, c) { return r + ',' + c; }

  var RICHTINGEN = ['vooruit', 'achter', 'links', 'rechts'];
  var PIJLEN = { vooruit: '↑', achter: '↓', links: '←', rechts: '→' };
  var LABELS = { vooruit: 'Vooruit', achter: 'Terug', links: 'Links', rechts: 'Rechts' };

  // ─── Klasse ─────────────────────────────────────────────────────
  function Doolhof(opts) {
    if (!opts || !opts.container) {
      throw new Error('Doolhof: opts.container is verplicht');
    }
    if (!opts.config) {
      throw new Error('Doolhof: opts.config is verplicht');
    }
    this.container  = opts.container;
    this.config     = opts.config;
    this.onWin      = opts.onWin      || function () {};
    this.onExit     = opts.onExit     || null;
    this.musicSrc   = opts.music      || null;
    this.showStart  = opts.showStart !== false;
    this.showDebug  = !!opts.showDebug;
    this.compactHeader = !!opts.compactHeader;
    this.startLabel = opts.startLabel || 'Start doolhof';   // instelbare start-knoptekst
    this.heksSound  = opts.heksSound  || null;              // geluid bij een heks-tegel (optioneel)

    this.state = {
      r: this.config.start.r,
      c: this.config.start.c
    };
    this._nodes = {};
    this._heksTimer = null;
    this._flashTimer = null;
  }

  // ─── Build UI ───────────────────────────────────────────────────
  Doolhof.prototype.mount = function () {
    var self = this;
    var cfg = this.config;
    var t = cfg.teksten || {};

    // Root
    var root = el('div', { class: 'dh-root' });

    // Startscherm
    var startScreen = el('section', { class: 'dh-screen dh-screen-start' + (this.showStart ? ' dh-active' : '') });

    // Header: compact (alleen terug-knop) of klassiek (titel + sub gestapeld)
    if (this.compactHeader) {
      startScreen.appendChild(this._maakCompactHeader());
      if (t.titel) {
        startScreen.appendChild(el('h1', {
          class: 'dh-titel-compact',
          html: t.titel
        }));
      }
      if (t.sub) {
        startScreen.appendChild(el('div', { class: 'dh-sub-onder-titel', text: t.sub }));
      }
    } else {
      if (t.titel) {
        startScreen.appendChild(el('div', { class: 'dh-crest' }, [
          el('h1', { class: 'dh-crest-titel', html: t.titel,
                     style: { fontFamily: "'Cinzel',serif", color: 'var(--gold)',
                              letterSpacing: '.08em', fontSize: 'clamp(1.8rem,6vw,2.8rem)',
                              textAlign: 'center', margin: '0' } })
        ]));
      }
      if (t.sub) {
        startScreen.appendChild(el('div', { class: 'dh-crest' }, [
          el('div', { class: 'dh-crest-sub', text: t.sub })
        ]));
      }
    }

    // Scene-image van startscherm — krijgt eigen referentie zodat we
    // de dialog-overlay erin kunnen mounten.
    var startSceneImg = el('div', { class: 'dh-scene-image',
      style: { backgroundImage: "url('" + (cfg.images.scene) + "')" } });
    startScreen.appendChild(startSceneImg);
    this._nodes.startSceneImg = startSceneImg;

    // Start-knop: pas zichtbaar als de intro-dialoog uitgespeeld is.
    // Bij geen intro is hij direct zichtbaar.
    var startBtn = el('button', {
      class: 'dh-btn dh-btn-full',
      text: this.startLabel,
      onclick: function () { self.start(); }
    });
    if (t.intro && t.intro.length) {
      startBtn.style.display = 'none';
    }
    startScreen.appendChild(startBtn);
    this._nodes.startBtn = startBtn;

    // Doolhof-scherm — minimaal: alleen terug-knop, geen titel/sub (max ruimte voor spelen)
    var doolhofScreen = el('section', { class: 'dh-screen' + (this.showStart ? '' : ' dh-active') });
    if (this.compactHeader) {
      doolhofScreen.appendChild(this._maakCompactHeader());
    } else if (t.sub) {
      doolhofScreen.appendChild(el('div', { class: 'dh-crest' }, [
        el('div', { class: 'dh-crest-sub', text: t.sub })
      ]));
    }
    var sceneImg = el('div', { class: 'dh-scene-image',
      style: { backgroundImage: "url('" + cfg.images.scene + "')" } });
    var sceneCap = el('div', { class: 'dh-scene-caption', text: t.caption || '— Een open plek —' });
    var posLabel = el('div', { class: 'dh-positie-label' });
    doolhofScreen.appendChild(sceneImg);
    doolhofScreen.appendChild(sceneCap);
    doolhofScreen.appendChild(posLabel);

    var moveControls = el('div', { class: 'dh-move-controls' });
    var rowTop = el('div', { class: 'dh-move-row-top' });
    var rowBot = el('div', { class: 'dh-move-row-bottom' });

    function maakBtn(richting) {
      return el('button', {
        class: 'dh-move-btn',
        'data-richting': richting,
        onclick: function () { self.beweeg(richting); }
      }, [
        el('span', { class: 'dh-arrow', text: PIJLEN[richting] }),
        el('span', { class: 'dh-label', text: LABELS[richting] })
      ]);
    }
    var btnVooruit = maakBtn('vooruit');
    var btnLinks   = maakBtn('links');
    var btnAchter  = maakBtn('achter');
    var btnRechts  = maakBtn('rechts');

    rowTop.appendChild(btnVooruit);
    rowBot.appendChild(btnLinks);
    rowBot.appendChild(btnAchter);
    rowBot.appendChild(btnRechts);
    moveControls.appendChild(rowTop);
    moveControls.appendChild(rowBot);
    doolhofScreen.appendChild(moveControls);

    // Win-scherm
    var winScreen = el('section', { class: 'dh-screen' });
    var winT = t.win || {};
    if (this.compactHeader) {
      winScreen.appendChild(this._maakCompactHeader());
    } else {
      winScreen.appendChild(el('div', { class: 'dh-crest' }, [
        el('div', { class: 'dh-crest-sub', text: t.sub || '' })
      ]));
    }
    var winBlock = el('div', { class: 'dh-win-block' });
    winBlock.appendChild(el('h2', { text: winT.titel || '[ PLACEHOLDER ]' }));
    winBlock.appendChild(el('p',  { text: winT.body  || 'Hier komt later de win-tekst.' }));
    winScreen.appendChild(winBlock);

    root.appendChild(startScreen);
    root.appendChild(doolhofScreen);
    root.appendChild(winScreen);

    // Music + debug
    if (this.musicSrc) {
      var audio = el('audio', { id: 'dh-bg-music', loop: '', preload: 'auto' }, [
        el('source', { src: this.musicSrc, type: 'audio/mpeg' })
      ]);
      var musicBtn = el('button', {
        class: 'dh-music-toggle',
        title: 'Muziek aan/uit',
        text: '♪',
        onclick: function () { self.toggleMusic(); }
      });
      root.appendChild(audio);
      root.appendChild(musicBtn);
      this._nodes.audio = audio;
      this._nodes.musicBtn = musicBtn;
    }
    if (this.showDebug) {
      var dbg = el('div', { class: 'dh-debug' });
      root.appendChild(dbg);
      this._nodes.debug = dbg;
    }

    this.container.appendChild(root);

    // Cache nodes
    this._nodes.root = root;
    this._nodes.screens = {
      start:   startScreen,
      doolhof: doolhofScreen,
      win:     winScreen
    };
    this._nodes.sceneImg = sceneImg;
    this._nodes.sceneCap = sceneCap;
    this._nodes.posLabel = posLabel;
    this._nodes.moveControls = moveControls;
    this._nodes.btns = {
      vooruit: btnVooruit, achter: btnAchter, links: btnLinks, rechts: btnRechts
    };

    this._updateKnoppen();
    this._updateDebug();

    // Start de intro-dialoog (alleen als showStart=true én er intro-lines zijn).
    if (this.showStart && t.intro && t.intro.length) {
      this._toonDialog(startSceneImg, t.intro, function () {
        // Klaar met intro — toon de Start-knop.
        startBtn.style.display = '';
      });
    }
  };

  // ─── Public flow ────────────────────────────────────────────────
  Doolhof.prototype.start = function () {
    this._reset();
    this._toonScreen('doolhof');
    this._startMuziek();
  };

  Doolhof.prototype.destroy = function () {
    if (this._nodes.audio) {
      try { this._nodes.audio.pause(); } catch (e) {}
    }
    clearTimeout(this._heksTimer);
    clearTimeout(this._flashTimer);
    if (this._nodes.root && this._nodes.root.parentNode) {
      this._nodes.root.parentNode.removeChild(this._nodes.root);
    }
    this._nodes = {};
  };

  // ─── Beweging ───────────────────────────────────────────────────
  Doolhof.prototype.beweeg = function (richting) {
    var here = tileKey(this.state.r, this.state.c);
    var cfg = this.config;
    var safe = (cfg.safe[here]) || [];
    var isUitgang = (this.state.r === cfg.exit.r && this.state.c === cfg.exit.c);

    // Vanaf uitgang "vooruit" → win
    if (isUitgang && richting === (cfg.exitRichting || 'vooruit')) {
      this._winnen();
      return;
    }

    if (safe.indexOf(richting) === -1) {
      this._heksReset();
      return;
    }

    var buur = this._buurTegel(this.state.r, this.state.c, richting);
    this.state.r = buur.r;
    this.state.c = buur.c;
    this._updateKnoppen();
    this._updateDebug();
  };

  // ─── Privé ──────────────────────────────────────────────────────
  Doolhof.prototype._buurTegel = function (r, c, richting) {
    if (richting === 'vooruit') return { r: r - 1, c: c };
    if (richting === 'achter')  return { r: r + 1, c: c };
    if (richting === 'links')   return { r: r, c: c - 1 };
    if (richting === 'rechts')  return { r: r, c: c + 1 };
    return null;
  };

  Doolhof.prototype._binnenGrid = function (r, c) {
    var g = this.config.gridSize;
    return r >= 0 && r < g.rows && c >= 0 && c < g.cols;
  };

  Doolhof.prototype._reset = function () {
    this.state.r = this.config.start.r;
    this.state.c = this.config.start.c;
  };

  Doolhof.prototype._toonScreen = function (name) {
    Object.keys(this._nodes.screens).forEach(function (k) {
      this._nodes.screens[k].classList.remove('dh-active');
    }, this);
    this._nodes.screens[name].classList.add('dh-active');
    window.scrollTo(0, 0);
  };

  Doolhof.prototype._winnen = function () {
    this._toonScreen('win');
    try { this.onWin(); } catch (e) { console.error('Doolhof onWin error:', e); }
  };

  Doolhof.prototype._heksReset = function () {
    var self = this;
    var sceneImg = this._nodes.sceneImg;
    var sceneCap = this._nodes.sceneCap;
    var controls = this._nodes.moveControls;
    var cfg = this.config;
    var heksTxt = (cfg.teksten && cfg.teksten.heks) ||
                  'Een schorre lach — alles wordt zwart.<br>Je ontwaakt bij de ingang.';

    // Schrikgeluid bij het raken van een heks-tegel (optioneel).
    if (this.heksSound) {
      try {
        var sfx = new Audio(this.heksSound);
        sfx.volume = 0.9;
        var p = sfx.play();
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
    }

    if (!sceneCap.dataset.origText) sceneCap.dataset.origText = sceneCap.textContent;

    sceneImg.style.backgroundImage = "url('" + cfg.images.heks + "')";
    sceneImg.classList.add('dh-heks-mode');
    sceneCap.classList.add('dh-heks-mode');
    sceneCap.innerHTML = heksTxt;
    controls.classList.add('dh-locked');

    clearTimeout(this._heksTimer);
    this._heksTimer = setTimeout(function () {
      self._reset();
      sceneImg.style.backgroundImage = "url('" + cfg.images.scene + "')";
      sceneImg.classList.remove('dh-heks-mode');
      sceneCap.classList.remove('dh-heks-mode');
      sceneCap.textContent = sceneCap.dataset.origText;
      controls.classList.remove('dh-locked');
      self._updateKnoppen();
      self._updateDebug();
    }, 2800);
  };

  // ─── Compacte header (alleen terug-knop) ──────────────────────
  Doolhof.prototype._maakCompactHeader = function () {
    var self = this;
    var children = [];
    if (this.onExit) {
      children.push(el('button', {
        class: 'dh-back-btn',
        text: '← Terug',
        onclick: function () { self.onExit(); }
      }));
    }
    children.push(el('div', { class: 'dh-header-sep' }));
    return el('div', { class: 'dh-header' }, children);
  };

  // ─── Dialoog-box ───────────────────────────────────────────────
  // Plaatst een dialoog-box NAAST de gegeven sceneEl (eronder in DOM),
  // toont regels één voor één. Klik op de sierlijke verder-knop rechts
  // = volgende regel. Bij laatste regel = box weg, onComplete().
  //
  // lines mag een array zijn van:
  //   - strings: regel zonder spreker-label
  //   - objecten: { spreker: 'Verteller', tekst: '...' }
  Doolhof.prototype._toonDialog = function (sceneEl, lines, onComplete) {
    if (!sceneEl || !lines || !lines.length) {
      if (onComplete) onComplete();
      return;
    }

    var idx = 0;

    var spreker = el('div', { class: 'dh-dialog-spreker' });
    var tekst   = el('div', { class: 'dh-dialog-tekst' });
    var body    = el('div', { class: 'dh-dialog-body' }, [spreker, tekst]);
    var verderBtn = el('button', {
      class: 'dh-dialog-verder',
      title: 'Verder',
      onclick: function (e) { e.preventDefault(); e.stopPropagation(); volgende(); }
    }, [
      el('span', { class: 'dh-verder-ornament', text: '❧' }),
      el('span', { class: 'dh-verder-label',    text: 'Verder' })
    ]);
    var dialog = el('div', { class: 'dh-dialog' }, [body, verderBtn]);

    // Mount net na de afbeelding
    if (sceneEl.parentNode) {
      sceneEl.parentNode.insertBefore(dialog, sceneEl.nextSibling);
    }

    function toonRegel(i) {
      var regel = lines[i];
      var sp = '';
      var tx = '';
      if (typeof regel === 'string') {
        tx = regel;
      } else if (regel && typeof regel === 'object') {
        sp = regel.spreker || '';
        tx = regel.tekst || '';
      }
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
    }

    function volgende() {
      idx++;
      if (idx >= lines.length) {
        if (dialog.parentNode) dialog.parentNode.removeChild(dialog);
        if (onComplete) onComplete();
        return;
      }
      toonRegel(idx);
    }

    toonRegel(0);
  };

  Doolhof.prototype._updateKnoppen = function () {
    var here = tileKey(this.state.r, this.state.c);
    var cfg = this.config;
    var forced = cfg.forceButtons && cfg.forceButtons[here];
    var isUitgang = (this.state.r === cfg.exit.r && this.state.c === cfg.exit.c);
    var self = this;

    RICHTINGEN.forEach(function (richting) {
      var btn = self._nodes.btns[richting];
      if (!btn) return;

      if (forced) {
        if (forced.indexOf(richting) >= 0) btn.classList.remove('dh-hidden');
        else btn.classList.add('dh-hidden');
        return;
      }

      if (isUitgang && richting === (cfg.exitRichting || 'vooruit')) {
        btn.classList.remove('dh-hidden');
        return;
      }

      var buur = self._buurTegel(self.state.r, self.state.c, richting);
      if (!self._binnenGrid(buur.r, buur.c)) {
        btn.classList.add('dh-hidden');
      } else {
        btn.classList.remove('dh-hidden');
      }
    });

    // Positie-label
    if (this._nodes.posLabel) {
      var letter = (cfg.tegelLetter && cfg.tegelLetter[here]) || '?';
      this._nodes.posLabel.innerHTML =
        'Je staat op tegel <span class="dh-positie-letter">' + letter + '</span>';
    }
  };

  Doolhof.prototype._updateDebug = function () {
    if (this._nodes.debug) {
      this._nodes.debug.textContent = 'pos ' + this.state.r + ',' + this.state.c;
    }
  };

  // ─── Muziek ─────────────────────────────────────────────────────
  Doolhof.prototype._startMuziek = function () {
    var audio = this._nodes.audio;
    var btn = this._nodes.musicBtn;
    if (!audio) return;
    audio.volume = 0.5;
    var p = audio.play();
    if (p && p.catch) p.catch(function (err) {
      console.warn('Doolhof: audio play geblokkeerd:', err);
    });
    if (btn) btn.classList.remove('dh-muted');
  };

  Doolhof.prototype.toggleMusic = function () {
    var audio = this._nodes.audio;
    var btn = this._nodes.musicBtn;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(function (err) { console.warn(err); });
      btn.classList.remove('dh-muted');
    } else {
      audio.pause();
      btn.classList.add('dh-muted');
    }
  };

  // Expose
  global.Doolhof = Doolhof;
})(window);
