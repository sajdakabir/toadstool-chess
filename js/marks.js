/* Pencil-drawn overlays: move circles, hover brackets, the ring under a
   picked-up piece, and the bits of a knockout (dizzy spirals, seeing stars,
   wobble marks). Everything is drawn in 0..100 units per square. */
(function (global) {
  'use strict';

  var GOLD = '#d4a034';
  var LEAF = '#5c9e69', LEAF_DARK = '#3b7149';
  var TEAM = { w: '#c9503f', b: '#3f4fa8' };

  function svg(inner, cls) {
    return '<svg class="' + cls + '" viewBox="0 0 100 100" aria-hidden="true">' + inner + '</svg>';
  }

  /* a ring drawn by hand: never quite round, never quite closed the same way */
  function ring(cx, cy, rx, ry) {
    var k = 0.55;
    return 'M' + (cx + 0.6) + ',' + (cy - ry) +
      ' C' + (cx + rx * k) + ',' + (cy - ry) + ' ' + (cx + rx) + ',' + (cy - ry * k * 1.06) + ' ' + (cx + rx) + ',' + (cy + 0.4) +
      ' C' + (cx + rx) + ',' + (cy + ry * k) + ' ' + (cx + rx * k * 0.94) + ',' + (cy + ry) + ' ' + cx + ',' + (cy + ry) +
      ' C' + (cx - rx * k * 1.05) + ',' + (cy + ry) + ' ' + (cx - rx) + ',' + (cy + ry * k) + ' ' + (cx - rx) + ',' + cy +
      ' C' + (cx - rx) + ',' + (cy - ry * k * 0.98) + ' ' + (cx - rx * k) + ',' + (cy - ry * 1.03) + ' ' + (cx + 0.6) + ',' + (cy - ry) + ' Z';
  }

  /* a little pointed leaf growing up and to the right from (x, y) */
  function leaf(x, y, size) {
    var s = size;
    return '<g transform="translate(' + x + ',' + y + ') rotate(-42)">' +
      '<path d="M0,0 C' + (s * 0.3) + ',' + (-s * 0.46) + ' ' + (s * 0.84) + ',' + (-s * 0.46) + ' ' + s + ',0 ' +
      'C' + (s * 0.84) + ',' + (s * 0.42) + ' ' + (s * 0.3) + ',' + (s * 0.42) + ' 0,0 Z" fill="' + LEAF +
      '" stroke="' + LEAF_DARK + '" stroke-width="1.3" stroke-linejoin="round"/>' +
      '<path d="M1,0 H' + (s * 0.84) + '" stroke="' + LEAF_DARK + '" stroke-width="1" opacity=".75"/></g>';
  }

  /* where you can go: a gold circle with a leaf on top, like a little orange.
     On an enemy piece the circle grows to go round it. */
  function target(capture) {
    var cy = capture ? 56 : 50, rx = capture ? 44 : 30, ry = capture ? 40 : 28;
    var lx = 50 + rx * 0.62, ly = cy - ry * 0.78;
    return svg('<path d="' + ring(50, cy, rx, ry) + '" fill="none" stroke="' + GOLD +
      '" stroke-width="' + (capture ? 2.8 : 2.4) + '" stroke-linecap="round"/>' +
      leaf(lx - 1, ly + 1, capture ? 15 : 12), 'mark mark-target' + (capture ? ' mark-capture' : ''));
  }

  /* gold corner brackets, shown on the target square under the cursor */
  function brackets() {
    return svg('<g fill="none" stroke="' + GOLD + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M10,27 V10 H27"/><path d="M73,10 H90 V27"/><path d="M90,73 V90 H73"/><path d="M27,90 H10 V73"/></g>',
      'mark mark-hover');
  }

  /* the ring drawn round the piece you have picked up, in its team colour */
  function selectRing(color) {
    return svg('<path d="' + ring(50, 58, 45, 40) + '" fill="none" stroke="' + TEAM[color] +
      '" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>', 'mark mark-select');
  }

  /* a spiral wound out from (cx, cy) in four growing half-turns */
  function spiral(cx, cy, r) {
    var s = r / 4;
    return 'M' + cx + ',' + cy +
      ' A' + s + ',' + s + ' 0 0 1 ' + (cx + 2 * s) + ',' + cy +
      ' A' + 2 * s + ',' + 2 * s + ' 0 0 1 ' + (cx - 2 * s) + ',' + cy +
      ' A' + 3 * s + ',' + 3 * s + ' 0 0 1 ' + (cx + 4 * s) + ',' + cy +
      ' A' + 4 * s + ',' + 4 * s + ' 0 0 1 ' + (cx - 4 * s) + ',' + cy;
  }

  function starPoints(cx, cy, r) {
    var pts = [];
    for (var k = 0; k < 10; k++) {
      var rad = k % 2 ? r * 0.42 : r;
      var a = -Math.PI / 2 + k * Math.PI / 5;
      pts.push((cx + rad * Math.cos(a)).toFixed(1) + ',' + (cy + rad * Math.sin(a)).toFixed(1));
    }
    return pts.join(' ');
  }

  /* little stars wheeling round a dizzy head */
  function seeingStars(cx, cy, r) {
    var out = '';
    for (var i = 0; i < 5; i++) {
      var a = i / 5 * Math.PI * 2;
      out += '<polygon points="' + starPoints(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.45, i % 2 ? 4 : 5.4) +
        '" fill="#f0c24f" stroke="#c8922d" stroke-width="1" stroke-linejoin="round"/>';
    }
    return '<g class="ko-stars">' + out + '</g>';
  }

  /* the (( )) a drawing gets when it is wobbling */
  function shakeMarks(cx, cy, gap, color) {
    return '<g class="shake-marks" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round">' +
      '<path d="M' + (cx - gap) + ',' + (cy - 8) + ' q-5,8 0,16 M' + (cx - gap - 6) + ',' + (cy - 11) + ' q-7,11 0,22"/>' +
      '<path d="M' + (cx + gap) + ',' + (cy - 8) + ' q5,8 0,16 M' + (cx + gap + 6) + ',' + (cy - 11) + ' q7,11 0,22"/></g>';
  }

  /* gold sparks bursting off a piece that has just been hit */
  function sparks() {
    var out = '';
    [[12, 24, 7], [86, 30, 6], [72, 8, 5], [22, 60, 5], [90, 64, 6], [50, 2, 4.5]].forEach(function (s, i) {
      out += '<polygon points="' + starPoints(s[0], s[1], s[2]) + '" fill="#f0c24f" stroke="#c8922d" ' +
        'stroke-width="1" stroke-linejoin="round" style="--i:' + i + '"/>';
    });
    return svg(out, 'mark mark-spark');
  }

  /* Little drawings that pop up over a piece's head to say how it feels. */
  var EMOTES = {
    // "!" when something is coming for it
    alert: '<path d="M52,10 L44,60 Q50,66 56,60 Z" fill="#e0614d" stroke="#a83a2e" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<circle cx="50" cy="80" r="7" fill="#e0614d" stroke="#a83a2e" stroke-width="2.6"/>',
    // a bead of sweat for a king in check
    sweat: '<path d="M52,8 C42,32 32,46 32,60 C32,74 42,84 52,84 C62,84 72,74 72,60 C72,46 62,32 52,8 Z" fill="#b5dbf2" stroke="#4f8fc0" stroke-width="3.2" stroke-linejoin="round"/>' +
      '<path d="M44,58 q0,10 7,15" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>',
    // a happy note after a good capture
    note: '<path d="M44,74 V20 L78,10 V62" fill="none" stroke="#7b4a22" stroke-width="5" stroke-linejoin="round"/>' +
      '<ellipse cx="34" cy="76" rx="11" ry="8.5" fill="#7b4a22" transform="rotate(-18 34 76)"/>' +
      '<ellipse cx="68" cy="64" rx="11" ry="8.5" fill="#7b4a22" transform="rotate(-18 68 64)"/>',
    // a giggle
    sparkle: '<g fill="#f0c24f" stroke="#c8922d" stroke-width="2" stroke-linejoin="round">' +
      '<path d="M30,20 l5,13 13,5 -13,5 -5,13 -5,-13 -13,-5 13,-5 Z"/>' +
      '<path d="M70,46 l4,10 10,4 -10,4 -4,10 -4,-10 -10,-4 10,-4 Z"/></g>',
    // the breath let out at the end of a yawn
    puff: '<path d="M20,64 a10,10 0 0 1 10,-12 a13,13 0 0 1 24,-4 a11,11 0 0 1 18,10 a8,8 0 0 1 -4,15 h-42 a8,8 0 0 1 -6,-9 Z" ' +
      'fill="#fbf6ea" stroke="#9a8a78" stroke-width="3" stroke-linejoin="round"/>',
    // dozing off
    zzz: '<g fill="none" stroke="#5a4634" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">' +
      '<path class="z1" d="M14,70 h16 l-16,18 h16"/><path class="z2" d="M40,44 h20 l-20,22 h20"/>' +
      '<path class="z3" d="M68,12 h24 l-24,26 h24"/></g>'
  };

  function emote(kind) {
    return '<div class="emote emote-' + kind + '" data-kind="' + kind + '">' +
      '<svg viewBox="0 0 100 100" aria-hidden="true">' + EMOTES[kind] + '</svg></div>';
  }

  /* a pencil puff of cloud: three bumps on a flat bottom */
  function cloud(cx, cy, s, cls) {
    return '<path class="' + cls + '" d="M' + (cx - 10 * s) + ',' + cy +
      ' a' + 5 * s + ',' + 5 * s + ' 0 0 1 ' + 5 * s + ',' + (-6 * s) +
      ' a' + 6.5 * s + ',' + 6.5 * s + ' 0 0 1 ' + 11 * s + ',' + (-1 * s) +
      ' a' + 5 * s + ',' + 5 * s + ' 0 0 1 ' + 4 * s + ',' + 7 * s + ' Z" fill="#fbf6ea" stroke="#9a8a78" ' +
      'stroke-width="1.7" stroke-linejoin="round"/>';
  }

  /* dust kicked up either side of the feet when a piece lands */
  function dust() {
    return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      cloud(24, 96, 1, 'puff puff-l') + cloud(76, 96, 1, 'puff puff-r') + cloud(50, 99, 0.7, 'puff puff-c') + '</svg>';
  }

  /* the cloud a captured piece vanishes into */
  function poof() {
    return '<svg class="mark mark-poof" viewBox="0 0 100 100" aria-hidden="true">' +
      cloud(34, 70, 1.6, 'puff') + cloud(64, 64, 1.9, 'puff') + cloud(48, 52, 1.5, 'puff') + '</svg>';
  }

  global.Marks = {
    emote: emote,
    dust: dust,
    poof: poof,
    TEAM: TEAM,
    ring: ring,
    target: target,
    brackets: brackets,
    selectRing: selectRing,
    spiral: spiral,
    seeingStars: seeingStars,
    shakeMarks: shakeMarks,
    sparks: sparks
  };
})(window);
