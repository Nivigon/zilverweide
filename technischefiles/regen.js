/* ══════════════════════════════════════════════════════════════════
   REGEN — regen-overlay + constante regen-audio (module)
   ------------------------------------------------------------------
   Publieke API:
     var regen = new Regen(container[, opts]);
     regen.start();              // visueel aan + audio-loop starten
     regen.stop();               // visueel uit + audio faden/pauzeren
     regen.setIntensity(0..1);   // dichtheid/aanwezigheid van de regen
     regen.setVolume(0..1);      // regen-audio volume
     regen.destroy();            // alles opruimen

   container : DOM-element of selector. MOET position:relative/absolute/
               fixed zijn (de laag is position:absolute; inset:0).
   opts      : { intensity, audioSrc, volume, loop }
               audioSrc standaard 'regen.mp3' (naast het bestand plaatsen).
               Zonder audiobestand werkt de regen gewoon visueel.

   Realisme: per streep willekeurige lengte, dikte, hoek én transparantie;
   strepen worden rondom doorgetekend (9 kopieën) zodat de tegel naadloos
   herhaalt; grote tegels + per-laag rotatie/fase verbergen herhaling.
   ══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var DEFAULTS = {
    intensity: 0.8,
    audioSrc: 'regen.mp3',
    volume: 0.6,
    loop: true
  };

  // Lagen: ver (klein/zwak/traag) → dichtbij (lang/fel/snel).
  // Grote tegels + brede waarde-ranges = organische, niet-herhalende regen.
  var LAGEN = [
    { size:320, streaks:24, lenMin:9,  lenMax:24, angMin:8,  angMax:14, aMin:.08, aMax:.26, wMin:.7, wMax:1.1, dur:0.95, rot:-2,   rgb:'190,208,232' },
    { size:380, streaks:22, lenMin:18, lenMax:40, angMin:9,  angMax:15, aMin:.16, aMax:.40, wMin:1.0,wMax:1.5, dur:0.62, rot:1.2,  rgb:'202,220,242' },
    { size:300, streaks:15, lenMin:30, lenMax:62, angMin:10, angMax:16, aMin:.26, aMax:.58, wMin:1.4,wMax:2.2, dur:0.42, rot:-3.5, rgb:'216,230,250' }
  ];

  function rand(a, b) { return Math.random() * (b - a) + a; }
  function randInt(a, b) { return Math.floor(rand(a, b + 1)); }

  // Naadloze regen-tegel. Elke streep wordt 9x getekend (omliggende
  // kopieën) zodat strepen die over een rand lopen aan de andere kant
  // terugkomen — geen zichtbare tegelnaden meer.
  function maakTile(c) {
    var s = c.size, inner = '';
    for (var i = 0; i < c.streaks; i++) {
      var len = rand(c.lenMin, c.lenMax);
      var ang = rand(c.angMin, c.angMax) * Math.PI / 180;
      var dx = -Math.sin(ang) * len;     // schuin naar links
      var dy =  Math.cos(ang) * len;
      var x1 = rand(0, s), y1 = rand(0, s);
      var alpha = rand(c.aMin, c.aMax).toFixed(2);
      var w = rand(c.wMin, c.wMax).toFixed(2);
      for (var ox = -1; ox <= 1; ox++) {
        for (var oy = -1; oy <= 1; oy++) {
          var X1 = (x1 + ox * s).toFixed(1), Y1 = (y1 + oy * s).toFixed(1);
          var X2 = (x1 + dx + ox * s).toFixed(1), Y2 = (y1 + dy + oy * s).toFixed(1);
          inner += '<line x1="' + X1 + '" y1="' + Y1 + '" x2="' + X2 + '" y2="' + Y2 +
                   '" stroke="rgba(' + c.rgb + ',' + alpha + ')" stroke-width="' + w + '"/>';
        }
      }
    }
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s +
      '" viewBox="0 0 ' + s + ' ' + s + '" style="overflow:hidden">' +
      '<g stroke-linecap="round">' + inner + '</g></svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  function Regen(container, opts) {
    this.container = (typeof container === 'string') ? document.querySelector(container) : container;
    this.opts = Object.assign({}, DEFAULTS, opts || {});
    this.layer = null;
    this.audio = null;
    this.running = false;
    this._fadeTimer = null;
  }

  Regen.prototype._build = function () {
    if (this.layer || !this.container) return;
    var layer = document.createElement('div');
    layer.className = 'rg-layer';
    layer.setAttribute('aria-hidden', 'true');

    for (var i = 0; i < LAGEN.length; i++) {
      var cfg = LAGEN[i];
      var el = document.createElement('div');
      el.className = 'rg-streaks';
      el.style.backgroundImage = 'url("' + maakTile(cfg) + '")';
      el.style.backgroundSize = cfg.size + 'px ' + cfg.size + 'px';
      el.style.animationDuration = cfg.dur + 's';
      el.style.setProperty('--rg-shiftY', cfg.size + 'px');
      el.style.setProperty('--rg-rot', cfg.rot + 'deg');
      el.style.setProperty('--rg-x', randInt(0, cfg.size) + 'px');  // eigen horizontale fase
      layer.appendChild(el);
    }
    this.layer = layer;
    this.container.appendChild(layer);
    this.setIntensity(this.opts.intensity);

    if (this.opts.audioSrc) {
      this.audio = new Audio(this.opts.audioSrc);
      this.audio.loop = this.opts.loop;
      this.audio.preload = 'auto';
      this.audio.volume = this.opts.volume;
    }
  };

  Regen.prototype.start = function () {
    this._build();
    this.running = true;
    if (this.layer) this.layer.classList.add('rg-on');
    if (this.audio) {
      clearInterval(this._fadeTimer);
      this.audio.volume = this.opts.volume;
      var p = this.audio.play();
      if (p && p.catch) p.catch(function () {});
    }
    return this;
  };

  Regen.prototype.stop = function () {
    this.running = false;
    if (this.layer) this.layer.classList.remove('rg-on');
    this._fadeAudioUit();
    return this;
  };

  Regen.prototype._fadeAudioUit = function () {
    var a = this.audio;
    if (!a) return;
    var self = this;
    clearInterval(this._fadeTimer);
    this._fadeTimer = setInterval(function () {
      if (a.volume > 0.05) { a.volume = Math.max(0, a.volume - 0.05); }
      else { a.pause(); a.volume = self.opts.volume; clearInterval(self._fadeTimer); }
    }, 60);
  };

  Regen.prototype.setIntensity = function (level) {
    level = Math.max(0, Math.min(1, Number(level) || 0));
    this.opts.intensity = level;
    if (this.layer) this.layer.style.setProperty('--rg-intensity', level.toFixed(2));
    return this;
  };

  Regen.prototype.setVolume = function (vol) {
    vol = Math.max(0, Math.min(1, Number(vol) || 0));
    this.opts.volume = vol;
    if (this.audio) this.audio.volume = vol;
    return this;
  };

  Regen.prototype.destroy = function () {
    clearInterval(this._fadeTimer);
    if (this.audio) { try { this.audio.pause(); } catch (e) {} this.audio = null; }
    if (this.layer && this.layer.parentNode) this.layer.parentNode.removeChild(this.layer);
    this.layer = null;
    this.running = false;
  };

  global.Regen = Regen;
})(typeof window !== 'undefined' ? window : this);
