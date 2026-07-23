/* ──────────────────────────────────────────────────────────────────
   Felix' spiek-mechanic als losse module.
   Draait het geteste mini-game-bestand (felix-focus-demo.html) in een
   overlay die onder de inventaris-balk begint, zodat de normale
   zilverweide-UI (inventaris plus rol-indicator) zichtbaar blijft.

   Gebruik:
     window.FelixSpiek.start({ bestand, onKlaar });
     window.FelixSpiek.stop();
     window.FelixSpiek.reset();   // terug naar de klim-knop, moeilijkheid blijft

   Zodra de Schaduw oppopt (vergrendeling van ZilverweideSchaduw) reset de
   spiek automatisch naar de klim-knop.
   ────────────────────────────────────────────────────────────────── */
(function () {
  var OVERLAY_ID = 'felix-spiek-overlay';
  var actieveFrame = null;
  var actieveOpruim = null;
  var pollId = null;
  var wasOver = false;

  // Neemt de Schaduw het scherm over (runen-slot, code-slot of redder-scherm,
  // of een lopende vergrendeling)? Dan moet de spiek stilvallen.
  function schaduwNeemtOver() {
    try {
      if (document.querySelector('#zv-memory.zv-open, #zv-lock.zv-open, #zv-redder.zv-open')) return true;
      if (window.ZilverweideSchaduw && window.ZilverweideSchaduw.isVergrendeld &&
          window.ZilverweideSchaduw.isVergrendeld()) return true;
    } catch (e) {}
    return false;
  }

  function resetFrame() {
    try {
      if (actieveFrame && actieveFrame.contentWindow) {
        actieveFrame.contentWindow.postMessage('felix-spiek-reset', '*');
      }
    } catch (e) {}
  }

  function start(opts) {
    opts = opts || {};
    var bestand = opts.bestand || 'technischefiles/felix-focus-demo.html';
    if (document.getElementById(OVERLAY_ID)) return;

    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    // Start onder de inventaris-balk zodat die (met rol-indicator) blijft
    // staan; lage z-index zodat de vaste zilverweide-knoppen erboven blijven.
    var invBar = document.getElementById('inv-bar');
    var topPx = 0;
    if (invBar && invBar.style.display !== 'none') {
      var r = invBar.getBoundingClientRect();
      topPx = Math.max(0, Math.round(r.bottom));
    }
    overlay.style.cssText =
      'position:fixed;top:' + topPx + 'px;left:0;right:0;bottom:0;z-index:70;' +
      'background:#0d0a06;display:flex;flex-direction:column';

    var frame = document.createElement('iframe');
    frame.src = bestand;
    frame.setAttribute('allow', 'autoplay');
    frame.style.cssText = 'flex:1;width:100%;border:0;display:block';
    actieveFrame = frame;

    // Uitstapknop: links, gespiegeld aan de moeilijkheidsmeter (die rechts
    // staat), groter en duidelijk.
    var sluitBtn = document.createElement('button');
    sluitBtn.textContent = 'Laat het kratje even';
    sluitBtn.style.cssText =
      "position:absolute;top:50%;left:clamp(4rem,18vw,15rem);transform:translateY(-50%);z-index:2;" +
      "font-family:'Cinzel',serif;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;" +
      "padding:.9rem 1.5rem;border:1px solid rgba(201,168,76,.55);background:rgba(13,10,6,.9);" +
      "color:#c9a84c;border-radius:8px;cursor:pointer;max-width:9.5rem;line-height:1.4;text-align:center;" +
      "box-shadow:0 0 20px rgba(0,0,0,.55)";

    var klaarGemeld = false;
    var vorigeOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Host speelt eigen geluid (het kraken): demp alleen het fluister-geluid
    // van de Schaduw, anders maskeert het het kraken van het kratje. De vloek
    // en de meter lopen gewoon door.
    try { if (window.ZilverweideSchaduw && window.ZilverweideSchaduw.setFluisterStil) window.ZilverweideSchaduw.setFluisterStil(true); } catch (e) {}
    wasOver = false;

    function opruimen() {
      // Fluister-geluid mag weer klinken zodra de spiek dicht is.
      try { if (window.ZilverweideSchaduw && window.ZilverweideSchaduw.setFluisterStil) window.ZilverweideSchaduw.setFluisterStil(false); } catch (e) {}
      window.removeEventListener('message', onMsg);
      if (pollId) { clearInterval(pollId); pollId = null; }
      actieveFrame = null;
      actieveOpruim = null;
      document.body.style.overflow = vorigeOverflow;
      try { overlay.remove(); } catch (e) {}
    }
    function sluit() {
      opruimen();
      if (typeof opts.onKlaar === 'function') opts.onKlaar();
    }
    function onMsg(e) {
      if (e && e.data === 'felix-spiek-klaar' && !klaarGemeld) { klaarGemeld = true; sluit(); }
    }

    sluitBtn.onclick = sluit;
    actieveOpruim = opruimen;
    window.addEventListener('message', onMsg);

    // Zodra de Schaduw het scherm overneemt, reset de spiek naar de klim-knop
    // en valt het geluid stil. De moeilijkheid blijft behouden.
    pollId = setInterval(function () {
      // Onderbreek de spiek als er een scène-interactie klaarstaat (Jan komt
      // langs, of de code is binnen): Felix wordt dan uit de spiek gehaald.
      if (typeof opts.onderbreek === 'function') {
        var onderbreek = false;
        try { onderbreek = !!opts.onderbreek(); } catch (e) {}
        if (onderbreek) {
          opruimen();
          if (typeof opts.onOnderbreek === 'function') opts.onOnderbreek();
          else if (typeof opts.onKlaar === 'function') opts.onKlaar();
          return;
        }
      }
      var v = schaduwNeemtOver();
      if (v && !wasOver) resetFrame();
      wasOver = v;
    }, 250);

    overlay.appendChild(frame);
    overlay.appendChild(sluitBtn);
    document.body.appendChild(overlay);
  }

  function stop() {
    if (typeof actieveOpruim === 'function') { actieveOpruim(); return; }
    var ov = document.getElementById(OVERLAY_ID);
    if (ov) { try { ov.remove(); } catch (e) {} }
    if (pollId) { clearInterval(pollId); pollId = null; }
    actieveFrame = null;
    document.body.style.overflow = '';
  }

  function reset() { resetFrame(); }

  window.FelixSpiek = { start: start, stop: stop, reset: reset };
})();
