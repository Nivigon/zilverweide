/* ══════════════════════════════════════════════════════════════════
   BLIKSEM — flits + bliksemschicht + donder (module)
   ------------------------------------------------------------------
   Publieke API:
     var bliksem = new Bliksem(container[, opts]);
     bliksem.flits();              // één losse flits (+ evt. schicht + donder)
     bliksem.start();              // automatisch op willekeurig interval
     bliksem.stop();               // auto-interval stoppen
     bliksem.setInterval(min,max); // ms tussen flitsen (auto-modus)
     bliksem.setThunderVolume(0..1);
     bliksem.destroy();

   container : DOM-element of selector. MOET position:relative/absolute/
               fixed zijn (de laag is position:absolute; inset:0).
   opts      : {
       intervalMin, intervalMax,   // ms (auto-modus)
       boltChance,                 // 0..1 kans op zichtbare schicht per flits
       thunder: {
         srcs: ['donder.mp3', ...],// 1+ fragmenten, willekeurig gekozen
         delayMin, delayMax,       // ms na de flits (afstand-gevoel)
         volume                    // 0..1
       }
     }
   Zonder donder-mp3 werkt de bliksem gewoon visueel.
   ══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var DEFAULTS = {
    intervalMin: 4000,
    intervalMax: 12000,
    boltChance: 0.5,
    thunder: {
      srcs: ['donder.mp3'],
      delayMin: 250,
      delayMax: 1700,
      volume: 0.8
    }
  };

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

  // Bouw een gekartelde bliksem-schicht als SVG-pad (boven → midden).
  function maakBolt() {
    var W = 100, H = 240;
    var x = 50, y = 0;
    var d = 'M' + x.toFixed(1) + ',' + y.toFixed(1);
    var segmenten = randInt(5, 8);
    var stap = H / segmenten;
    var tak = '';
    for (var i = 1; i <= segmenten; i++) {
      y = stap * i;
      var amp = 28 * (1 - i / (segmenten + 2));   // jag wordt naar onder smaller
      x = 50 + rand(-amp, amp);
      d += ' L' + x.toFixed(1) + ',' + y.toFixed(1);
      // af en toe een korte zijtak
      if (Math.random() < 0.3 && i > 1 && i < segmenten) {
        var bx = x + rand(-22, 22);
        var by = y + stap * 0.7;
        tak += '<path d="M' + x.toFixed(1) + ',' + y.toFixed(1) +
               ' L' + bx.toFixed(1) + ',' + by.toFixed(1) + '"/>';
      }
    }
    return '<svg class="bl-bolt-svg" xmlns="http://www.w3.org/2000/svg" ' +
           'viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMin meet" ' +
           'width="100%" height="100%"><path d="' + d + '"/>' + tak + '</svg>';
  }

  function Bliksem(container, opts) {
    this.container = (typeof container === 'string') ? document.querySelector(container) : container;
    this.opts = Object.assign({}, DEFAULTS, opts || {});
    this.opts.thunder = Object.assign({}, DEFAULTS.thunder, (opts && opts.thunder) || {});
    this.layer = null;
    this.flash = null;
    this.bolt = null;
    this.running = false;
    this._timer = null;
  }

  Bliksem.prototype._build = function () {
    if (this.layer || !this.container) return;
    var layer = document.createElement('div');
    layer.className = 'bl-layer';
    layer.setAttribute('aria-hidden', 'true');

    var flash = document.createElement('div');
    flash.className = 'bl-flash';

    var bolt = document.createElement('div');
    bolt.className = 'bl-bolt';

    layer.appendChild(flash);
    layer.appendChild(bolt);
    this.container.appendChild(layer);

    this.layer = layer;
    this.flash = flash;
    this.bolt = bolt;

    // class na de animatie weer weghalen, zodat hij opnieuw kan vuren
    var self = this;
    flash.addEventListener('animationend', function () { flash.classList.remove('bl-fire'); });
    bolt.addEventListener('animationend', function () { bolt.classList.remove('bl-fire'); });
  };

  // Eén flits. opts (optioneel): { bolt:true/false, donder:true/false }
  Bliksem.prototype.flits = function (over) {
    this._build();
    if (!this.layer) return this;
    over = over || {};

    var xPct = rand(15, 85);
    var dur = rand(0.6, 1.0).toFixed(2) + 's';

    // ── Flits ──
    this.flash.style.setProperty('--bl-x', xPct.toFixed(1) + '%');
    this.flash.style.setProperty('--bl-dur', dur);
    this._herstart(this.flash);

    // ── Schicht (optioneel/kans) ──
    var toonBolt = (over.bolt != null) ? over.bolt : (Math.random() < this.opts.boltChance);
    if (toonBolt) {
      this.bolt.style.left = (xPct - 15).toFixed(1) + '%';
      this.bolt.style.setProperty('--bl-dur', dur);
      this.bolt.innerHTML = maakBolt();
      this._herstart(this.bolt);
    }

    // ── Donder (na vertraging) ──
    if (over.donder !== false) this._speelDonder();

    return this;
  };

  // Animatie opnieuw triggeren via class-toggle + reflow.
  Bliksem.prototype._herstart = function (el) {
    el.classList.remove('bl-fire');
    void el.offsetWidth;        // forceer reflow
    el.classList.add('bl-fire');
  };

  Bliksem.prototype._speelDonder = function () {
    var t = this.opts.thunder;
    if (!t || !t.srcs || !t.srcs.length) return;
    var src = t.srcs[randInt(0, t.srcs.length - 1)];
    var delay = rand(t.delayMin, t.delayMax);
    setTimeout(function () {
      try {
        var a = new Audio(src);
        a.volume = Math.max(0, Math.min(1, t.volume));
        var p = a.play();
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
    }, delay);
  };

  Bliksem.prototype.start = function () {
    this._build();
    this.running = true;
    var self = this;
    function loop() {
      if (!self.running) return;
      self.flits();
      self._timer = setTimeout(loop, rand(self.opts.intervalMin, self.opts.intervalMax));
    }
    clearTimeout(this._timer);
    // eerste flits met korte willekeurige aanloop
    this._timer = setTimeout(loop, rand(600, 2500));
    return this;
  };

  Bliksem.prototype.stop = function () {
    this.running = false;
    clearTimeout(this._timer);
    this._timer = null;
    return this;
  };

  Bliksem.prototype.setInterval = function (min, max) {
    this.opts.intervalMin = Math.max(200, min);
    this.opts.intervalMax = Math.max(this.opts.intervalMin, max);
    return this;
  };

  Bliksem.prototype.setThunderVolume = function (vol) {
    this.opts.thunder.volume = Math.max(0, Math.min(1, Number(vol) || 0));
    return this;
  };

  Bliksem.prototype.destroy = function () {
    this.stop();
    if (this.layer && this.layer.parentNode) this.layer.parentNode.removeChild(this.layer);
    this.layer = this.flash = this.bolt = null;
  };

  global.Bliksem = Bliksem;
})(typeof window !== 'undefined' ? window : this);
