/* The page around the board: a margin full of sleepy, fidgeting doodles in
   the same coloured pencil as the pieces. Every drawing is baked into boiling
   frames (see pencil.js); anything that moves is its own small layer, so the
   GPU can push it about without anything being redrawn. */
(function (global) {
  'use strict';

  var INK = '#4a3a2c', BROWN = '#8a6a4a', PAPER = '#fbf6ea';
  var SUN = '#f7d97a', SUN_LINE = '#d9a03a', GOLD = '#f0c24f', GOLD_LINE = '#c8922d';
  var BLUE = '#4a5fae', BLUE_SOFT = '#dfe4f5', GREEN = '#6d9b55', GREEN_SOFT = '#b9d69c';
  var BLUSH = '#ee8c9c', RED = '#d9604e';

  /* one baked, boiling layer of a doodle, placed in % of its doodle's box */
  function part(name, box, markup, cls, place) {
    return '<div class="ddp ' + (cls || '') + '" style="' + (place || 'inset:0') + '">' +
      Pencil.layers('dd-' + name, box, markup) + '</div>';
  }

  /* a face drawn live on top of a layer, so it can blink and change */
  function face(box, markup, place) {
    return '<svg class="ddface" viewBox="' + box.join(' ') + '" style="' + (place || 'inset:0') +
      '" aria-hidden="true">' + markup + '</svg>';
  }

  function doodle(name, inner, label) {
    return '<div class="dd dd-' + name + '"' + (label ? ' role="img" aria-label="' + label + '"' : ' aria-hidden="true"') +
      '>' + inner + '</div>';
  }

  function starPath(cx, cy, r) {
    var pts = [];
    for (var k = 0; k < 10; k++) {
      var rad = k % 2 ? r * 0.45 : r, a = -Math.PI / 2 + k * Math.PI / 5;
      pts.push((cx + rad * Math.cos(a)).toFixed(1) + ',' + (cy + rad * Math.sin(a)).toFixed(1));
    }
    return 'M' + pts.join(' L') + ' Z';
  }

  function closedEye(x, y, w) {
    return '<path d="M' + (x - w) + ',' + y + ' q' + w + ',' + (w * 0.9) + ' ' + 2 * w + ',0" fill="none" stroke="' + INK +
      '" stroke-width="2" stroke-linecap="round"/>';
  }

  /* ---------------- the sky ---------------- */

  function sun() {
    var rays = '';
    for (var i = 0; i < 12; i++) {
      var a = i * Math.PI / 6, r1 = 41, r2 = i % 2 ? 50 : 56;
      rays += '<path d="M' + (60 + Math.cos(a) * r1).toFixed(1) + ',' + (60 + Math.sin(a) * r1).toFixed(1) +
        ' L' + (60 + Math.cos(a) * r2).toFixed(1) + ',' + (60 + Math.sin(a) * r2).toFixed(1) + '"/>';
    }
    var box = [0, 0, 120, 120];
    return doodle('sun',
      part('sun-rays', box, '<g fill="none" stroke="' + SUN_LINE + '" stroke-width="3.2" stroke-linecap="round">' + rays + '</g>', 'spin') +
      part('sun-body', box,
        '<circle cx="60" cy="60" r="34" fill="' + SUN + '" stroke="' + SUN_LINE + '" stroke-width="2.6"/>' +
        '<ellipse cx="49" cy="47" rx="8" ry="5" fill="#fff" opacity=".45" transform="rotate(-30 49 47)"/>' +
        '<path d="M51,27 l1.5,-9 5,5.5 2.5,-8 2.5,8 5,-5.5 1.5,9 Z" fill="' + GOLD + '" stroke="' + GOLD_LINE + '" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<ellipse cx="44" cy="68" rx="5" ry="3" fill="' + BLUSH + '" opacity=".6"/><ellipse cx="76" cy="68" rx="5" ry="3" fill="' + BLUSH + '" opacity=".6"/>',
        'bob') +
      face(box,
        '<g class="mood-calm"><g class="blinker"><ellipse cx="50" cy="57" rx="3.4" ry="4" fill="' + INK + '"/><ellipse cx="70" cy="57" rx="3.4" ry="4" fill="' + INK + '"/></g>' +
        '<path d="M51,68 q9,8 18,0" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/></g>' +
        '<g class="mood-laugh"><path d="M45,54 l6,4 -6,4 M75,54 l-6,4 6,4" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M50,66 h20 q-2,10 -10,10 q-8,0 -10,-10 Z" fill="#a8483e" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/></g>' +
        '<g class="mood-oops"><circle cx="50" cy="57" r="4.4" fill="' + INK + '"/><circle cx="70" cy="57" r="4.4" fill="' + INK + '"/>' +
        '<ellipse cx="60" cy="71" rx="3.6" ry="4.6" fill="#a8483e" stroke="' + INK + '" stroke-width="1.6"/></g>',
        'inset:0'),
      'a smiling sun wearing a tiny crown');
  }

  /* a garland of little stars hanging on threads, each swinging on its own */
  function bunting() {
    var box = [0, 0, 540, 60], n = 14, stars = '';
    var line = '<path d="M6,10 Q270,44 534,10" fill="none" stroke="' + BROWN + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '<circle cx="6" cy="10" r="3.2" fill="none" stroke="' + BROWN + '" stroke-width="2"/>' +
      '<circle cx="534" cy="10" r="3.2" fill="none" stroke="' + BROWN + '" stroke-width="2"/>';
    for (var i = 0; i < n; i++) {
      var t = (i + 0.5) / n, x = 6 + 528 * t, y = 10 + 68 * t * (1 - t);
      var drop = i % 2 ? 0 : 1;
      stars += '<div class="ddp hanging" style="left:' + ((x - 20) / 540 * 100).toFixed(2) + '%;top:' + (y / 60 * 100).toFixed(2) +
        '%;width:' + (40 / 540 * 100).toFixed(2) + '%;height:' + (64 / 60 * 100).toFixed(2) + '%;animation-delay:' + (-i * 0.37).toFixed(2) + 's">' +
        Pencil.layers('dd-star' + drop, [0, 0, 40, 64],
          '<path d="M20,0 V' + (drop ? 18 : 10) + '" stroke="' + BROWN + '" stroke-width="1.4"/>' +
          '<path d="' + starPath(20, drop ? 34 : 26, 14) + '" fill="' + GOLD + '" stroke="' + GOLD_LINE + '" stroke-width="1.8" stroke-linejoin="round"/>' +
          (drop ? closedEye(15.5, 33, 2.6) + closedEye(24.5, 33, 2.6)
            : '<circle cx="16" cy="25" r="1.8" fill="' + INK + '"/><circle cx="24" cy="25" r="1.8" fill="' + INK + '"/>') +
          '<path d="M17.5,' + (drop ? 38.5 : 30.5) + ' q2.5,2.4 5,0" fill="none" stroke="' + INK + '" stroke-width="1.3" stroke-linecap="round"/>') +
        '</div>';
    }
    return doodle('bunting', part('bunting-line', box, line) + stars);
  }

  function moon() {
    var box = [0, 0, 130, 130];
    var crescent = 'M75.6,25 A44,44 0 1 1 26.2,86.7 A40,40 0 0 0 75.6,25 Z';
    return doodle('moon',
      part('moon', box,
        '<path d="' + crescent + '" fill="#f1ecd0" stroke="' + BLUE + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<circle cx="88" cy="88" r="4" fill="none" stroke="' + BLUE + '" stroke-width="1.4" opacity=".5"/>' +
        '<circle cx="98" cy="64" r="2.6" fill="none" stroke="' + BLUE + '" stroke-width="1.4" opacity=".5"/>' +
        // a floppy nightcap with a pompom flopped over the top horn
        '<path d="M62,34 C66,18 86,12 98,22 C90,8 62,2 40,12 C34,15 30,20 32,26 C42,22 52,26 62,34 Z" fill="#9aa6dc" stroke="' + BLUE + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M58,30 C70,24 86,22 98,24" fill="none" stroke="' + BLUE + '" stroke-width="2"/>' +
        '<path d="' + starPath(62, 15, 3.6) + '" fill="' + GOLD + '"/><path d="' + starPath(78, 13, 2.8) + '" fill="' + GOLD + '"/>' +
        '<circle cx="30" cy="30" r="5.4" fill="#f4f0ff" stroke="' + BLUE + '" stroke-width="1.8"/>' +
        closedEye(56, 60, 4) +
        '<path d="M50,73 q5,4 10,0" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>' +
        '<ellipse cx="46" cy="66" rx="4" ry="2.4" fill="' + BLUSH + '" opacity=".6"/>',
        'bob slow') +
      '<div class="snore">' + zzz() + '</div>',
      'a crescent moon asleep in a nightcap');
  }

  function zzz() {
    return '<svg viewBox="0 0 60 60" aria-hidden="true"><g fill="none" stroke="' + BLUE + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
      '<path class="z1" d="M6,46 h9 l-9,10 h9"/><path class="z2" d="M22,28 h12 l-12,13 h12"/><path class="z3" d="M40,6 h14 l-14,15 h14"/></g></svg>';
  }

  function cloudPath() {
    return 'M18,58 C6,58 4,44 14,40 C10,26 28,18 40,26 C46,10 72,8 80,22 C88,8 116,10 118,28 C132,24 146,34 140,46 C152,50 148,60 136,60 Z';
  }

  function cloud(name, bubbles) {
    var box = [0, 0, 160, 70];
    var body = '<path d="' + cloudPath() + '" fill="' + PAPER + '" stroke="' + BLUE + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      closedEye(62, 40, 4.2) + closedEye(86, 40, 4.2) +
      '<ellipse cx="56" cy="48" rx="4.4" ry="2.4" fill="' + BLUSH + '" opacity=".5"/><ellipse cx="92" cy="48" rx="4.4" ry="2.4" fill="' + BLUSH + '" opacity=".5"/>' +
      (bubbles ? '<ellipse cx="74" cy="50" rx="3" ry="3.6" fill="none" stroke="' + INK + '" stroke-width="1.6"/>'
        : '<path d="M70,49 q4,3 8,0" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>');
    var extra = '';
    if (bubbles) {
      for (var i = 0; i < 3; i++) {
        extra += '<div class="ddp bubble" style="left:' + (50 + i * 3) + '%;top:66%;width:8%;height:18%;animation-delay:' + (i * 1.1) + 's">' +
          Pencil.layers('dd-bubble', [0, 0, 14, 14], '<circle cx="7" cy="7" r="5" fill="none" stroke="' + BLUE + '" stroke-width="1.4"/>' +
            '<path d="M4.6,5.2 q1,-1.6 2.6,-1.6" stroke="' + BLUE + '" stroke-width="1" fill="none"/>') + '</div>';
      }
    }
    return doodle(name, part(name, box, body, 'drift') + extra, 'a sleeping cloud');
  }

  global.WorldSky = { sun: sun, bunting: bunting, moon: moon, cloud: cloud, zzz: zzz, part: part, face: face,
    doodle: doodle, starPath: starPath, closedEye: closedEye,
    C: { INK: INK, BROWN: BROWN, PAPER: PAPER, SUN: SUN, SUN_LINE: SUN_LINE, GOLD: GOLD, GOLD_LINE: GOLD_LINE,
      BLUE: BLUE, BLUE_SOFT: BLUE_SOFT, GREEN: GREEN, GREEN_SOFT: GREEN_SOFT, BLUSH: BLUSH, RED: RED } };
})(window);
