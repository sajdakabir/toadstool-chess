/* Puts the doodles on the page and lets the game talk to them: the snail and
   the dot-to-dot keep up with the game, the sun reacts to captures, the
   notes keep score, and the hand-drawn controls report back. */
(function (global) {
  'use strict';

  var W = global.WorldSky, L = global.WorldLand, C = W.C;

  function control(id, label, svg) {
    return '<button class="dd-control" type="button" id="' + id + '" aria-label="' + label + '">' + svg + '</button>';
  }

  function controls() {
    var undo = '<svg viewBox="0 0 48 48" aria-hidden="true"><g filter="url(#pencil)" fill="none" stroke="' + C.INK + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M14,18 A15,15 0 1 1 12,32" stroke-dasharray="4 4"/><path d="M6,12 L14,18 L18,9"/></g></svg>';
    var sound = '<svg viewBox="0 0 48 48" aria-hidden="true"><g filter="url(#pencil)" fill="none" stroke="' + C.INK + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M8,19 h7 l9,-8 v26 l-9,-8 h-7 Z" fill="' + C.PAPER + '"/>' +
      '<g class="waves"><path d="M30,18 q5,6 0,12"/><path d="M35,13 q9,11 0,22"/></g>' +
      '<g class="muted"><path d="M31,19 l9,10 M40,19 l-9,10"/></g></g></svg>';
    var stars = '';
    for (var i = 1; i <= 5; i++) {
      stars += '<button class="dd-star" type="button" data-level="' + i + '" aria-label="opponent strength ' + i + ' of 5">' +
        '<svg viewBox="0 0 40 40" aria-hidden="true"><g filter="url(#pencil)"><path d="' + W.starPath(20, 21, 17) +
        '" fill="url(#scribble)" stroke="#6b4a33" stroke-width="2" stroke-linejoin="round"/></g></svg></button>';
    }
    return '<div class="dd dd-controls">' + control('undo', 'take back a move', undo) + control('sound', 'sound on or off', sound) +
      '<div class="dd-stars" role="group" aria-label="opponent strength">' + stars + '</div></div>';
  }

  /* ---------------- the game talks to the page ---------------- */

  var sheet, sunEl;

  /* the snail creeps along and the fish joins up as moves are played */
  function progress(plies) {
    var snail = sheet.querySelector('.dd-garden .snail');
    if (snail) snail.style.left = (2 + 52 * Math.min(1, plies / 120)) + '%';

    var lines = sheet.querySelector('.dots-lines');
    if (!lines) return;
    var joined = Math.min(L.FISH.length, Math.floor(plies / 2)), out = '';
    for (var i = 0; i < joined; i++) {
      var a = L.FISH[i], b = L.FISH[(i + 1) % L.FISH.length];
      out += '<path d="M' + a[0] + ',' + a[1] + ' L' + b[0] + ',' + b[1] + '"/>';
    }
    if (joined === L.FISH.length) {
      out += '<circle cx="54" cy="58" r="4" fill="' + C.INK + '"/><path d="M38,70 q6,4 10,0" stroke-width="1.6"/>';
    }
    lines.innerHTML = '<g fill="none" stroke="' + C.BLUE + '" stroke-width="2" stroke-linecap="round" filter="url(#pencil)">' + out + '</g>';
  }

  /* the sun has a face for the moment: 'laugh', 'oops', or calm */
  var sunTimer = 0;
  function sunFace(kind, ms) {
    if (!sunEl) return;
    sunEl.classList.remove('laugh', 'oops');
    if (kind) sunEl.classList.add(kind);
    clearTimeout(sunTimer);
    if (kind) sunTimer = setTimeout(function () { sunEl.classList.remove(kind); }, ms || 1800);
  }

  function writeNote(name, html) {
    var body = sheet.querySelector('.dd-' + name + ' .note-body');
    if (body) body.innerHTML = html;
  }

  function setLevel(level) {
    [].forEach.call(sheet.querySelectorAll('.dd-star'), function (b) {
      var on = Number(b.dataset.level) <= level;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(Number(b.dataset.level) === level));
    });
  }

  function setSound(on) {
    var btn = document.getElementById('sound');
    btn.classList.toggle('off', !on);
    btn.setAttribute('aria-pressed', String(on));
  }

  function mount(el) {
    sheet = el;
    document.getElementById('sky').innerHTML = W.sun() + W.bunting() + W.moon();
    document.getElementById('above').innerHTML =
      L.whale() + W.cloud('cloud-r', true) + L.dots() + L.dandelion() + L.cloudy();
    document.getElementById('below').innerHTML =
      '<div class="dock">' + L.chick() + controls() + '</div>' +
      L.note('note-l', 'caught') + L.note('note-r', 'moves') +
      L.rainbowPond() + L.garden() + L.hills() + L.molehill('molehill-l', 'ants') + L.molehill('molehill-r', 'grub');
    sunEl = sheet.querySelector('.dd-sun');

    // now and then the sun, the chick and the stars blink
    setInterval(function () {
      if (document.hidden) return;
      var blinkers = sheet.querySelectorAll('.blinker');
      var one = blinkers[Math.floor(Math.random() * blinkers.length)];
      if (!one) return;
      one.classList.add('shut');
      setTimeout(function () { one.classList.remove('shut'); }, 180);
    }, 1600);
  }

  global.World = { mount: mount, progress: progress, sunFace: sunFace, writeNote: writeNote, setLevel: setLevel, setSound: setSound };
})(window);
