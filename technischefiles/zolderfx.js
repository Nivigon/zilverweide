/* ══════════════════════════════════════════════════════════════════
   ZolderFx — cinematic overlay voor de herberg-zolderscène (DD4).
   Losse laag bovenop de bestaande scaffold: de timer, check-state
   (herbergAlleBinnen) en de schaduw-vloek blijven de motor; deze module
   levert alleen de beleving.

   Publieke API (aangeroepen vanuit zilverweide.html):
     ZolderFx.open()                     – overlay tonen + sfeer starten
     ZolderFx.playFennaArc(onHelp)       – Fenna's 30s taunt-arc → Help
     ZolderFx.showArriver(role, onErbij) – aankomende speler treft Fenna/Robbie
     ZolderFx.showWaiting(role)          – teller + timer terwijl de klok loopt
     ZolderFx.playResolution(onDone)     – gedeelde afsluiter (heks vertrekt)
     ZolderFx.setTeller(aantal, totaal)  – live teller bijwerken
     ZolderFx.close()                    – alles opruimen

   Assets in dezelfde map: ogen_beide.png, zolderbg.mp3, zolderlach.mp3,
   donder.mp3, scratch.mp3, dramaticdrop.mp3, raamopen.mp3
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var EYES = 'ogen_beide.png';

  var cfg = {
    eyeFadeIn: 2200, eyeHold: 900, eyeFadeOut: 1600,
    eyeGapMin: 2200, eyeGapMax: 5200,
    laughGapMin: 5000, laughGapMax: 10000,
    boltMin: 6000, boltMax: 13000,
    scratchMin: 2500, scratchMax: 4000,
    bgVol: 0.5, laughVol: 0.85, thunderVol: 0.85, scratchVol: 0.7, dreunVol: 1.0
  };
  function rand(a, b) { return Math.random() * (b - a) + a; }

  // ── Interne toestand ──
  var root = null, stage = null, textWrap = null, flash = null,
      lid = null, reveal = null, blurEl = null, hud = null, actions = null, lock = null;
  var running = false, ambientStopped = false, currentLaugh = null, curLine = null;
  var activeRects = [];
  var T = {};                 // timers
  var bg = null;
  var bgWasPlaying = false;   // speelde de hoofd-achtergrondmuziek vóór de scène?

  function clearTimers() { for (var k in T) { clearTimeout(T[k]); } T = {}; }

  // ─────────────────────────────────────────────────────────────────
  // Stijl (eenmalig injecteren)
  // ─────────────────────────────────────────────────────────────────
  function ensureStyle() {
    if (document.getElementById('zc-style')) return;
    var s = document.createElement('style');
    s.id = 'zc-style';
    s.textContent = [
      '#zc-root{position:fixed;inset:0;z-index:9500;overflow:hidden;',
        'font-family:"Crimson Text",Georgia,serif;color:#f5ead6;-webkit-user-select:none;user-select:none}',
      '#zc-stage{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 40%,#0c0a10 0%,#070509 55%,#030203 100%)}',
      '#zc-stage::after{content:"";position:absolute;inset:0;pointer-events:none;',
        'box-shadow:inset 0 0 220px 80px rgba(0,0,0,.92);',
        'background:radial-gradient(130% 100% at 50% 45%,transparent 40%,rgba(0,0,0,.7) 100%)}',
      '.zc-eyes{position:absolute;pointer-events:none;opacity:0;transform:scale(.9);',
        'filter:brightness(.25) saturate(1.1);transition:opacity 2s ease,transform 2s ease,filter 2s ease}',
      '.zc-eyes img{display:block;width:100%;height:auto;filter:drop-shadow(0 0 10px rgba(70,150,255,.55))}',
      '.zc-eyes.on{opacity:.95;transform:scale(1);filter:brightness(1.1) saturate(1.15)}',
      '@keyframes zc-pulse{0%,100%{filter:drop-shadow(0 0 8px rgba(70,150,255,.45))}50%{filter:drop-shadow(0 0 16px rgba(90,170,255,.85))}}',
      '.zc-eyes.on img{animation:zc-pulse 2.4s ease-in-out infinite}',
      '#zc-flash{position:absolute;inset:0;pointer-events:none;background:#cfe3ff;opacity:0;mix-blend-mode:screen;z-index:30}',
      '@keyframes zc-bolt{0%{opacity:0}4%{opacity:.92}10%{opacity:.12}16%{opacity:.78}24%{opacity:.05}30%{opacity:.55}100%{opacity:0}}',
      '#zc-flash.strike{animation:zc-bolt .55s linear}',
      // zachte lichtlaag achter het ooglid, zodat het opengaan zichtbaar wordt
      '#zc-reveal{position:absolute;inset:0;z-index:52;opacity:0;transition:opacity 1.6s ease;',
        'background:radial-gradient(130% 100% at 50% 42%,#dfd8c8 0%,#bcb5a4 58%,#8f8879 100%)}',
      '#zc-reveal.on{opacity:1}',
      // eyelid
      '#zc-lid{position:absolute;left:0;top:0;width:100%;height:114%;background:#000;z-index:56;pointer-events:none;',
        'transform:translateY(-115%);border-radius:0 0 46% 46% / 0 0 13% 13%}',
      '#zc-lid.shut{transform:translateY(0);transition:transform .32s ease-in}',
      '#zc-lid.open{animation:zc-lidup 6.5s cubic-bezier(.4,.1,.35,1) forwards}',
      '@keyframes zc-lidup{',
        '0%{transform:translateY(0)}',        /* dicht */
        '7%{transform:translateY(-16%)}',     /* kier open */
        '13%{transform:translateY(-8%)}',     /* wegduiken, te fel */
        '28%{transform:translateY(-60%)}',    /* verder open, over de helft */
        '34%{transform:translateY(-52%)}',    /* kleine settle */
        '38%{transform:translateY(0)}',       /* KNIPPER: dicht */
        '42%{transform:translateY(-68%)}',    /* knipper: weer open */
        '60%{transform:translateY(-98%)}',    /* bijna open */
        '68%{transform:translateY(-86%)}',    /* laatste knijp */
        '100%{transform:translateY(-115%)}}', /* helemaal open, blijft */
      // waas over de onthulde scène: blur + overbelichting die langzaam bijtrekt
      '#zc-blur{position:absolute;inset:0;z-index:53;pointer-events:none;-webkit-backdrop-filter:blur(0);backdrop-filter:blur(0)}',
      '#zc-blur.clearing{animation:zc-defocus 6.8s ease-out forwards}',
      '@keyframes zc-defocus{',
        '0%{-webkit-backdrop-filter:blur(13px) brightness(1.32);backdrop-filter:blur(13px) brightness(1.32)}',
        '55%{-webkit-backdrop-filter:blur(6px) brightness(1.12);backdrop-filter:blur(6px) brightness(1.12)}',
        '100%{-webkit-backdrop-filter:blur(0) brightness(1);backdrop-filter:blur(0) brightness(1)}}',
      // onthul-modus: overlay doorzichtig, alleen het zwarte ooglid blijft over,
      // zodat het opengaan de echte locatie-scène eronder onthult
      '#zc-root.zc-peek #zc-stage{background:transparent}',
      '#zc-root.zc-peek #zc-stage::after{display:none}',
      '#zc-root.zc-peek #zc-reveal,#zc-root.zc-peek #zc-flash{display:none}',
      '#zc-root.zc-peek #zc-text,#zc-root.zc-peek #zc-story,#zc-root.zc-peek #zc-hud,#zc-root.zc-peek #zc-actions{display:none}',
      // tekst
      '#zc-text{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:60;',
        'pointer-events:none;padding:0 7%;text-align:center}',
      '.zc-line{position:absolute;font-family:"Cinzel",Georgia,serif;font-weight:500;letter-spacing:.04em;',
        'line-height:1.35;font-size:clamp(15px,2.3vw,23px);color:#cfc7b6;opacity:0;transform:translateY(8px) scale(.99);',
        'transition:opacity 1.1s ease,transform 1.1s ease;text-shadow:0 0 18px rgba(0,0,0,.95);max-width:72%}',
      '.zc-line.show{opacity:1;transform:none}',
      '.zc-line.out{transition:opacity .4s ease,transform .4s ease}',
      '.zc-line.rage{color:#e23b2e;animation:zc-ragepulse .55s ease-in-out infinite}',
      '@keyframes zc-ragepulse{0%,100%{text-shadow:0 0 24px rgba(226,59,46,.5)}50%{text-shadow:0 0 44px rgba(226,59,46,.95)}}',
      '.zc-line.threat{color:#c22b22;font-size:clamp(17px,2.7vw,27px);letter-spacing:.05em;text-shadow:0 0 30px rgba(160,15,15,.75);animation:zc-threat 1.4s ease-in-out infinite}',
      '@keyframes zc-threat{0%,100%{text-shadow:0 0 26px rgba(160,15,15,.6)}50%{text-shadow:0 0 46px rgba(200,25,25,.95)}}',
      // grote ogen
      '.zc-bigeyes{position:absolute;left:50%;top:44%;z-index:66;pointer-events:none;width:min(72vw,540px);',
        'opacity:0;transform:translate(-50%,-50%) scale(.55);transition:opacity .35s ease,transform .4s cubic-bezier(.2,.8,.2,1)}',
      '.zc-bigeyes img{display:block;width:100%;height:auto;filter:drop-shadow(0 0 34px rgba(85,165,255,.75))}',
      '.zc-bigeyes.on{opacity:1;transform:translate(-50%,-50%) scale(1)}',
      '.zc-bigeyes.fade{opacity:0;transition:opacity 1.4s ease}',
      // aankomst / verhalende laag
      '#zc-story{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:62;width:min(90vw,560px);',
        'text-align:center;opacity:0;transition:opacity 1s ease;pointer-events:none}',
      '#zc-story.show{opacity:1}',
      '#zc-story p{font-family:"Crimson Text",Georgia,serif;font-size:clamp(15px,2.4vw,20px);line-height:1.65;color:#e7dcc6;',
        'margin:0 0 1rem;text-shadow:0 0 22px rgba(0,0,0,.9)}',
      '#zc-story .zc-red{color:#e0655c}',
      // HUD (teller + timer)
      '#zc-hud{position:absolute;left:50%;bottom:6%;transform:translateX(-50%);z-index:64;text-align:center;',
        'opacity:0;transition:opacity .8s ease;pointer-events:none}',
      '#zc-hud.show{opacity:1}',
      '#zc-hud .zc-flavor{font-family:"Crimson Text",serif;font-size:clamp(14px,2.2vw,18px);color:#d8cfbc;margin-bottom:.9rem;text-shadow:0 0 20px rgba(0,0,0,.9)}',
      '#zc-hud .zc-teller{display:inline-block;padding:.5rem 1rem;border:1px solid rgba(201,168,76,.3);border-radius:4px;',
        'background:rgba(201,168,76,.05)}',
      '#zc-hud .zc-teller span{font-family:"Cinzel",serif;font-size:.7rem;letter-spacing:.15em;color:#8a7a45;text-transform:uppercase}',
      '#zc-hud .zc-teller b{display:block;font-family:"Cinzel",serif;font-size:1.4rem;color:#c9a84c;margin-top:.25rem;font-weight:600}',
      '#zc-hud #herberg-timer{margin-top:.8rem;font-family:"Cinzel",serif;font-size:1.05rem;color:#9bb0c9}',
      // actieknoppen
      '#zc-actions{position:absolute;left:50%;bottom:12%;transform:translateX(-50%);z-index:70;display:flex;gap:.6rem;',
        'flex-wrap:wrap;justify-content:center;opacity:0;transition:opacity .6s ease}',
      '#zc-actions.show{opacity:1}',
      '.zc-btn{padding:.85rem 1.8rem;border-radius:999px;font-family:"Cinzel",serif;letter-spacing:.08em;',
        'font-size:clamp(15px,2.4vw,18px);cursor:pointer;background:rgba(201,168,76,.06);color:#c9a84c;border:1px solid #c9a84c}',
      '.zc-btn.alarm{color:#ff6a5c;border-color:#e23b2e;background:rgba(226,59,46,.12);animation:zc-alarm 1s ease-in-out infinite}',
      '@keyframes zc-alarm{0%,100%{box-shadow:0 0 22px rgba(226,59,46,.35)}50%{box-shadow:0 0 46px rgba(226,59,46,.85)}}',
      '#zc-lock{position:absolute;inset:0;z-index:68;display:none}',
      '#zc-lock.on{display:block}',
      '#zc-dbg{position:absolute;top:8px;right:8px;z-index:9600;display:flex;gap:6px}',
      '#zc-dbg button{font-family:"Cinzel",serif;font-size:11px;letter-spacing:.04em;color:#c9a84c;',
        'background:rgba(13,10,6,.85);border:1px solid rgba(201,168,76,.4);border-radius:5px;padding:5px 9px;cursor:pointer;opacity:.72}',
      '#zc-dbg button:hover{opacity:1}'
    ].join('');
    document.head.appendChild(s);
  }

  // ─────────────────────────────────────────────────────────────────
  // Audio
  // ─────────────────────────────────────────────────────────────────
  function oneShot(src, vol) {
    try { var a = new Audio(src); a.volume = vol; a.play().catch(function () {}); return a; }
    catch (e) { return null; }
  }
  function playThunder() { oneShot('donder.mp3', cfg.thunderVol); }

  // ─────────────────────────────────────────────────────────────────
  // Sfeer: ogen, lach, onweer, gekras
  // ─────────────────────────────────────────────────────────────────
  function overlapFrac(a, b) {
    var ix = Math.max(0, Math.min(a.left + a.w, b.left + b.w) - Math.max(a.left, b.left));
    var iy = Math.max(0, Math.min(a.top + a.h, b.top + b.h) - Math.max(a.top, b.top));
    var inter = ix * iy;
    if (inter <= 0) return 0;
    return inter / Math.min(a.w * a.h, b.w * b.h);
  }
  function findSpot(w, h) {
    var vw = window.innerWidth, vh = window.innerHeight;
    for (var t = 0; t < 25; t++) {
      var c = { left: rand(vw * 0.05, vw * 0.95 - w), top: rand(vh * 0.14, vh * 0.78 - h), w: w, h: h };
      var ok = true;
      for (var i = 0; i < activeRects.length; i++) {
        if (overlapFrac(c, activeRects[i]) > 0.06) { ok = false; break; }
      }
      if (ok) return c;
    }
    return null;
  }
  function spawnEyes(quick) {
    if (!stage) return;
    var vw = window.innerWidth;
    var w = rand(Math.min(150, vw * 0.28), Math.min(300, vw * 0.42));
    var h = w * (52 / 163);
    var spot = findSpot(w, h);
    if (!spot) return;
    var rect = { left: spot.left, top: spot.top, w: w, h: h };
    activeRects.push(rect);
    function release() { var k = activeRects.indexOf(rect); if (k > -1) activeRects.splice(k, 1); }

    var el = document.createElement('div');
    el.className = 'zc-eyes';
    el.style.width = w + 'px'; el.style.left = spot.left + 'px'; el.style.top = spot.top + 'px';
    var img = document.createElement('img'); img.src = EYES; img.alt = '';
    el.appendChild(img); stage.appendChild(el);

    if (quick) {
      el.style.transition = 'opacity .12s ease, transform .12s ease, filter .12s ease';
      requestAnimationFrame(function () { el.classList.add('on'); });
      setTimeout(function () { el.classList.remove('on'); }, 280);
      setTimeout(function () { release(); if (el.parentNode) el.parentNode.removeChild(el); }, 900);
      return;
    }
    el.style.transition = 'opacity ' + cfg.eyeFadeIn + 'ms ease, transform ' + cfg.eyeFadeIn + 'ms ease, filter ' + cfg.eyeFadeIn + 'ms ease';
    requestAnimationFrame(function () { el.classList.add('on'); });
    var vis = cfg.eyeFadeIn + cfg.eyeHold;
    setTimeout(function () {
      el.style.transition = 'opacity ' + cfg.eyeFadeOut + 'ms ease, transform ' + cfg.eyeFadeOut + 'ms ease, filter ' + cfg.eyeFadeOut + 'ms ease';
      el.classList.remove('on');
    }, vis);
    setTimeout(function () { release(); if (el.parentNode) el.parentNode.removeChild(el); }, vis + cfg.eyeFadeOut + 100);
  }
  function scheduleEyes() {
    if (!running || ambientStopped) return;
    spawnEyes(false);
    T.eye = setTimeout(scheduleEyes, cfg.eyeFadeIn + cfg.eyeHold + cfg.eyeFadeOut + rand(cfg.eyeGapMin, cfg.eyeGapMax));
  }
  function loopLaugh() {
    if (!running || ambientStopped) return;
    var a; try { a = new Audio('zolderlach.mp3'); } catch (e) { a = null; }
    var queued = false;
    function next() {
      if (queued) return; queued = true; currentLaugh = null;
      if (!running || ambientStopped) return;
      T.laugh = setTimeout(loopLaugh, rand(cfg.laughGapMin, cfg.laughGapMax));
    }
    if (!a) { next(); return; }
    a.volume = cfg.laughVol; currentLaugh = a;
    a.addEventListener('ended', next, { once: true });
    a.play().then(function () {
      if (Math.random() < 0.5) setTimeout(function () { if (!ambientStopped) spawnEyes(false); }, rand(300, 900));
    }).catch(function () { next(); });
  }
  function flashVisual() { if (!flash) return; flash.classList.remove('strike'); void flash.offsetWidth; flash.classList.add('strike'); }
  function strike() { flashVisual(); playThunder(); if (Math.random() < 0.7) spawnEyes(true); }
  function scheduleBolt() {
    if (!running || ambientStopped) return;
    T.bolt = setTimeout(function () { strike(); scheduleBolt(); }, rand(cfg.boltMin, cfg.boltMax));
  }
  function loopScratch() {
    if (!running || ambientStopped) return;
    oneShot('scratch.mp3', cfg.scratchVol);
    T.scratch = setTimeout(loopScratch, rand(cfg.scratchMin, cfg.scratchMax));
  }
  function startAmbient() {
    ambientStopped = false;
    scheduleEyes(); loopLaugh(); scheduleBolt(); loopScratch();
  }
  function stopAmbient() {
    ambientStopped = true;
    clearTimeout(T.eye); clearTimeout(T.laugh); clearTimeout(T.bolt); clearTimeout(T.scratch);
    if (currentLaugh) { try { currentLaugh.pause(); } catch (e) {} currentLaugh = null; }
  }

  // ─────────────────────────────────────────────────────────────────
  // Tekstregels
  // ─────────────────────────────────────────────────────────────────
  function showLine(txt, cls) {
    if (!textWrap) return;
    var delay = 0;
    if (curLine) {
      var old = curLine; curLine = null;
      old.classList.add('out'); old.classList.remove('show');
      setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 460);
      delay = 400;
    }
    var ln = document.createElement('div');
    ln.className = 'zc-line' + (cls ? ' ' + cls : '');
    ln.textContent = txt;
    textWrap.appendChild(ln);
    setTimeout(function () {
      curLine = ln;
      requestAnimationFrame(function () { requestAnimationFrame(function () { ln.classList.add('show'); }); });
    }, delay);
  }
  function hideLine() {
    if (!curLine) return;
    var old = curLine; curLine = null;
    old.classList.remove('show');
    setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 1100);
  }

  function clearOverlayContent() {
    if (curLine) { curLine.classList.remove('show'); curLine = null; }
    if (textWrap) textWrap.innerHTML = '';
    if (actions) { actions.classList.remove('show'); actions.innerHTML = ''; }
    if (hud) { hud.classList.remove('show'); }
    if (reveal) reveal.classList.remove('on');
    if (blurEl) blurEl.classList.remove('clearing');
    if (lid) lid.classList.remove('shut', 'open');
    if (root) root.classList.remove('zc-peek');
    var story = document.getElementById('zc-story'); if (story) { story.classList.remove('show'); }
  }

  function setActions(list) {
    if (!actions) return;
    actions.innerHTML = '';
    list.forEach(function (a) {
      var b = document.createElement('button');
      b.className = 'zc-btn' + (a.alarm ? ' alarm' : '');
      b.textContent = a.label;
      b.addEventListener('click', a.onclick);
      actions.appendChild(b);
    });
    requestAnimationFrame(function () { actions.classList.add('show'); });
  }

  // ─────────────────────────────────────────────────────────────────
  // Publiek: open / close
  // ─────────────────────────────────────────────────────────────────
  function open() {
    ensureStyle();
    // Character-pops (speler links, NPC rechts) horen niet bij de zolderscène
    // en zouden in de doorzichtige onthul-fase doorschemeren. Verberg ze.
    var pops = document.querySelectorAll('#char-pop, #npc-pop');
    for (var pi = 0; pi < pops.length; pi++) pops[pi].style.display = 'none';
    if (!root) {
      // Standaard achtergrondmuziek uit tijdens de zolderscène (zelfde patroon
      // als het doolhof). Onthoud of hij speelde, zodat we 'm bij close hervatten.
      var main = document.getElementById('bg-music');
      bgWasPlaying = !!(main && !main.paused);
      if (main) { try { main.pause(); } catch (e) {} }

      root = document.createElement('div'); root.id = 'zc-root';
      root.innerHTML =
        '<div id="zc-stage"></div>' +
        '<div id="zc-flash"></div>' +
        '<div id="zc-reveal"></div>' +
        '<div id="zc-blur"></div>' +
        '<div id="zc-lid"></div>' +
        '<div id="zc-text"></div>' +
        '<div id="zc-story"></div>' +
        '<div id="zc-hud"><div class="zc-flavor"></div>' +
          '<div class="zc-teller"><span>Binnen</span><b id="herberg-teller">1 / 4</b></div>' +
          '<div id="herberg-timer">Resterend: — sec</div></div>' +
        '<div id="zc-actions"></div>' +
        '<div id="zc-lock"></div>';
      document.body.appendChild(root);
      stage = document.getElementById('zc-stage');
      flash = document.getElementById('zc-flash');
      reveal = document.getElementById('zc-reveal');
      blurEl = document.getElementById('zc-blur');
      lid = document.getElementById('zc-lid');
      textWrap = document.getElementById('zc-text');
      hud = document.getElementById('zc-hud');
      actions = document.getElementById('zc-actions');
      lock = document.getElementById('zc-lock');
    }
    running = true;
    clearTimers();
    if (!bg) { bg = new Audio('zolderbg.mp3'); bg.loop = true; }
    bg.volume = cfg.bgVol; bg.play().catch(function () {});
    startAmbient();
    showDebugBar();
  }

  // In-scène skip-knoppen (alleen als de game window.ZOLDER_DEBUG aan zet).
  function showDebugBar() {
    if (!window.ZOLDER_DEBUG || !root) return;
    if (document.getElementById('zc-dbg')) return;
    var bar = document.createElement('div'); bar.id = 'zc-dbg';
    bar.innerHTML = '<button data-m="succes">\u23e9 vrienden er</button>' +
                    '<button data-m="gefaald">\u23e9 te laat</button>';
    bar.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('button') : null;
      if (!b) return;
      if (typeof window.zolderSkip === 'function') window.zolderSkip(b.getAttribute('data-m'));
    });
    root.appendChild(bar);
  }

  function close() {
    running = false;
    stopAmbient();
    clearTimers();
    activeRects.length = 0;
    if (bg) { try { bg.pause(); bg.currentTime = 0; } catch (e) {} }
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = stage = textWrap = flash = lid = reveal = blurEl = hud = actions = lock = null;
    curLine = null;
    // Standaard achtergrondmuziek weer aan, als die vóór de scène speelde.
    var main = document.getElementById('bg-music');
    if (main && bgWasPlaying) { try { main.play().catch(function () {}); } catch (e) {} }
    bgWasPlaying = false;
  }

  // ─────────────────────────────────────────────────────────────────
  // Publiek: teller bijwerken (door de timer-loop)
  // ─────────────────────────────────────────────────────────────────
  function setTeller(aantal, totaal) {
    var el = document.getElementById('herberg-teller');
    if (el) el.textContent = aantal + ' / ' + totaal;
  }

  // ─────────────────────────────────────────────────────────────────
  // Publiek: Fenna's taunt-arc (30s) → Help
  // ─────────────────────────────────────────────────────────────────
  var PHRASES = [
    'Zo zoet\u2026 dat stemmetje van je',
    'Mijn kleine fruitbloempje\u2026 rijp om te plukken',
    'Zing nog maar, klein vogeltje. Zing zo hard je kan.',
    'Want straks naai ik dat liedje voorgoed achter je lippen.'
  ];
  function playFennaArc(onHelp) {
    clearOverlayContent();
    // sfeer loopt door; alleen tekst + Help
    T.p1 = setTimeout(function () { showLine(PHRASES[0]); }, 5000);
    T.p1h = setTimeout(hideLine, 8600);
    T.p2 = setTimeout(function () { showLine(PHRASES[1]); }, 12000);
    T.p2h = setTimeout(hideLine, 15900);
    T.p3 = setTimeout(function () { showLine(PHRASES[2]); }, 20000);
    T.p4 = setTimeout(function () { showLine(PHRASES[3], 'rage'); }, 27000);
    T.help = setTimeout(function () {
      // Geen knop: de schreeuw gebeurt vanzelf. Drie seconden in beeld,
      // daarna gaat de arc automatisch door.
      showLine('Schreeuw om hulp!', 'rage');
      T.helpDoor = setTimeout(function () {
        hideLine();
        if (typeof onHelp === 'function') onHelp();
      }, 3000);
    }, 30000);
  }

  // ─────────────────────────────────────────────────────────────────
  // Publiek: aankomende speler treft Fenna en Robbie
  // ─────────────────────────────────────────────────────────────────
  function showArriver(role, onErbij) {
    clearOverlayContent();
    var story = document.getElementById('zc-story');
    story.innerHTML =
      '<p>Je stormt de kraakende trap op. Boven staan Fenna en Robbie tegen elkaar aan gedrukt, doodsbang, starend het donker in.</p>' +
      '<p>De lucht klopt niet. Iets fluistert. Iets lacht.</p>' +
      '<p class="zc-red">Wat is dit\u2026</p>';
    requestAnimationFrame(function () { story.classList.add('show'); });
    setActions([{ label: 'Ga snel bij ze staan', alarm: true, onclick: function () {
      story.classList.remove('show');
      setActions([]);
      if (typeof onErbij === 'function') onErbij();
    } }]);
  }

  // ─────────────────────────────────────────────────────────────────
  // Publiek: wachtstand — teller + timer terwijl de klok loopt
  // ─────────────────────────────────────────────────────────────────
  function showWaiting(role) {
    clearOverlayContent();
    var flavor = hud.querySelector('.zc-flavor');
    flavor.textContent = (role === 'fenna')
      ? 'Blijf schreeuwen. Je vrienden moeten snel naar de herberg komen.'
      : 'Blijf bij Fenna en Robbie. Houd vol tot er genoeg hulp is.';
    requestAnimationFrame(function () { hud.classList.add('show'); });
  }

  // ─────────────────────────────────────────────────────────────────
  // Gedeelde afsluiter: de heks vertrekt. Identiek bij succes én falen.
  // dreun → grote ogen + dreigement → raam vliegt open → wennen →
  // oogleden gaan langzaam open → onDone. Wat er dáárna gebeurt (opluchting
  // of, bij falen, de uitgestelde schaduw) regelt de aanroeper.
  // ─────────────────────────────────────────────────────────────────
  function playResolution(onReveal, onDone) {
    if (!root) open();
    clearOverlayContent();
    clearTimers();
    stopAmbient();
    if (bg) { try { bg.pause(); } catch (e) {} }
    lock.classList.add('on');
    oneShot('dramaticdrop.mp3', cfg.dreunVol);

    var big = document.createElement('div');
    big.className = 'zc-bigeyes';
    var img = document.createElement('img'); img.src = EYES; img.alt = '';
    big.appendChild(img); stage.appendChild(big);
    requestAnimationFrame(function () { big.classList.add('on'); });

    T.r1 = setTimeout(function () { showLine('Ik kom terug, vogeltje\u2026 voor elke noot.', 'threat'); }, 700);
    T.r2 = setTimeout(function () { if (curLine) curLine.classList.remove('show'); big.classList.add('fade'); }, 2600);
    T.r3 = setTimeout(function () { if (big.parentNode) big.remove(); }, 4100);
    T.r4 = setTimeout(function () { oneShot('raamopen.mp3', 0.9); }, 4300);          // raam vliegt open
    T.r5 = setTimeout(function () { showLine('Je ogen moeten wennen aan het licht.'); }, 4900);
    T.r6 = setTimeout(hideLine, 7200);
    T.r7 = setTimeout(function () { lid.classList.add('shut'); }, 8300);            // helemaal zwart
    // Overlay doorzichtig achter het zwarte ooglid; echte scène rendert eronder.
    T.rp = setTimeout(function () {
      if (root) root.classList.add('zc-peek');
      if (typeof onReveal === 'function') onReveal();
    }, 8700);
    // Waas over de onthulde scène, trekt langzaam op (blur + overbelichting).
    T.rb = setTimeout(function () { if (blurEl) blurEl.classList.add('clearing'); }, 8900);
    // Zwaar ooglid: kier → wegduiken → half → knipper → bijna open → knijp → open.
    T.r8 = setTimeout(function () { lid.classList.remove('shut'); lid.classList.add('open'); }, 9100);
    T.r9 = setTimeout(function () {
      lock.classList.remove('on');
      if (typeof onDone === 'function') onDone();
    }, 16200);
  }

  window.ZolderFx = {
    open: open, close: close, setTeller: setTeller,
    playFennaArc: playFennaArc, showArriver: showArriver, showWaiting: showWaiting,
    playResolution: playResolution
  };
})();
