/* Doodles for the ground: dandelion and bees, the notes, a dot-to-dot,
   hills with a cottage, molehills, the whale, the rainbow pond, the garden,
   and the chick holding the "new game" sign. */
(function (global) {
  'use strict';

  var W = global.WorldSky, C = W.C, part = W.part, face = W.face, doodle = W.doodle;

  function blush(x, y, rx) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (rx || 4) + '" ry="' + ((rx || 4) * 0.6) + '" fill="' + C.BLUSH + '" opacity=".6"/>';
  }
  function dotEyes(x1, x2, y, r) {
    return '<circle cx="' + x1 + '" cy="' + y + '" r="' + r + '" fill="' + C.INK + '"/><circle cx="' + x2 + '" cy="' + y + '" r="' + r + '" fill="' + C.INK + '"/>' +
      '<circle cx="' + (x1 + r * 0.35) + '" cy="' + (y - r * 0.35) + '" r="' + r * 0.32 + '" fill="#fff"/><circle cx="' + (x2 + r * 0.35) + '" cy="' + (y - r * 0.35) + '" r="' + r * 0.32 + '" fill="#fff"/>';
  }

  function bee(name) {
    return Pencil.layers('dd-' + name, [0, 0, 30, 24],
      '<ellipse cx="10" cy="7" rx="6" ry="4.4" fill="#e9f3fa" stroke="#7fa3bd" stroke-width="1.2" class="wing"/>' +
      '<ellipse cx="18" cy="6" rx="5" ry="3.8" fill="#e9f3fa" stroke="#7fa3bd" stroke-width="1.2"/>' +
      '<ellipse cx="15" cy="15" rx="9" ry="6.5" fill="#f6d466" stroke="' + C.INK + '" stroke-width="1.5"/>' +
      '<path d="M12,9.5 v11 M17,9 v12" stroke="#6b4423" stroke-width="2.4"/>' +
      '<circle cx="21" cy="13" r="1.3" fill="' + C.INK + '"/><path d="M6,15 l-3,1" stroke="' + C.INK + '" stroke-width="1.4" stroke-linecap="round"/>');
  }

  /* ---------------- left margin ---------------- */

  function dandelion() {
    var rays = '', seeds = '';
    for (var i = 0; i < 16; i++) {
      var a = i / 16 * Math.PI * 2, x = 60 + Math.cos(a) * 19, y = 46 + Math.sin(a) * 19;
      rays += 'M60,46 L' + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
      seeds += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="1.6"/>';
    }
    var plant = '<path d="M60,148 C58,120 63,96 60,62" fill="none" stroke="' + C.GREEN + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M58,146 C44,138 34,128 26,112 l8,5 -2,-9 8,6 -1,-9 8,9 C48,124 54,134 58,146 Z" fill="' + C.GREEN_SOFT + '" stroke="' + C.GREEN + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M62,146 C76,140 86,130 94,116 l-8,4 3,-9 -8,6 1,-9 -8,8 C70,128 66,136 62,146 Z" fill="' + C.GREEN_SOFT + '" stroke="' + C.GREEN + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<g stroke="#9a8a78" stroke-width="1.2" fill="none">' + '<path d="' + rays + '"/></g>' +
      '<g fill="#9a8a78">' + seeds + '</g><circle cx="60" cy="46" r="4.6" fill="#c9b48e" stroke="#8a6a4a" stroke-width="1.4"/>';
    var seed = '<path d="M6,14 V4 M6,4 l-4,-3 M6,4 l0,-4 M6,4 l4,-3" fill="none" stroke="#9a8a78" stroke-width="1.1" stroke-linecap="round"/><circle cx="6" cy="15" r="1.3" fill="#8a6a4a"/>';
    var drifting = '';
    for (var k = 0; k < 3; k++) {
      drifting += '<div class="ddp seed" style="left:58%;top:22%;width:10%;height:12%;animation-delay:' + (k * 2.3) + 's">' +
        Pencil.layers('dd-seed', [0, 0, 12, 18], seed) + '</div>';
    }
    return doodle('dandelion',
      part('dandelion', [0, 0, 120, 150], plant, 'sway-slow') + drifting +
      '<div class="ddp flier fly-a">' + bee('bee') + '</div>' +
      '<div class="ddp flier fly-b">' + bee('bee') + '</div>',
      'a dandelion with bees buzzing round it');
  }

  /* a torn sticky note; the game writes on it */
  function note(name, title) {
    var paper = '<path d="M4,8 l10,-3 12,3 12,-3 12,3 12,-3 12,3 12,-3 12,3 12,-3 12,3 12,-3 12,3 V82 H4 Z" fill="#fdfaf1" stroke="' + C.INK + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M156,82 L142,82 L156,68 Z" fill="#efe6d2" stroke="' + C.INK + '" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<circle cx="14" cy="16" r="2.2" fill="none" stroke="' + C.INK + '" stroke-width="1.2"/>';
    return doodle(name, part('note', [0, 0, 160, 86], paper) +
      '<div class="note-text"><b>' + title + '</b><div class="note-body"></div></div>');
  }

  function cloudy() { return W.cloud('cloud-l', false); }

  function molehill(name, critter) {
    var mound = '<path d="M4,56 Q22,14 54,12 Q84,14 96,56 Z" fill="#e7d3b3" stroke="' + C.BROWN + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<g stroke="' + C.BROWN + '" stroke-width="1.1" opacity=".5"><path d="M24,46 l6,-8 M36,48 l6,-9 M64,46 l6,-8 M76,50 l6,-8 M50,30 l5,-7"/></g>' +
      '<ellipse cx="52" cy="50" rx="9" ry="6" fill="#5a4634"/>' +
      '<path d="M54,13 q-1,-7 3,-11 M54,8 q-6,-4 -9,-1 q4,4 9,1 M56,5 q4,-6 9,-4 q-3,6 -9,4" fill="' + C.GREEN_SOFT + '" stroke="' + C.GREEN + '" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<path d="M0,57 H100" stroke="' + C.BROWN + '" stroke-width="1.4" stroke-linecap="round"/>';
    var crawl = '';
    if (critter === 'ants') {
      var ant = '<g fill="' + C.INK + '"><circle cx="4" cy="6" r="2.6"/><circle cx="9.5" cy="5.5" r="2"/><circle cx="14" cy="5" r="2.4"/></g>' +
        '<path d="M8,7 l-2,4 M10,7 l0,4 M12,7 l2,4 M15,3 l3,-3" stroke="' + C.INK + '" stroke-width="1" fill="none"/>';
      for (var i = 0; i < 3; i++) {
        crawl += '<div class="ddp ant" style="animation-delay:' + (-i * 1.4) + 's">' + Pencil.layers('dd-ant', [0, 0, 20, 12], ant) + '</div>';
      }
    } else {
      var grub = '<g fill="#8fa3e0" stroke="' + C.BLUE + '" stroke-width="1.3"><circle cx="6" cy="12" r="5"/><circle cx="14" cy="10" r="5.4"/>' +
        '<circle cx="23" cy="9" r="5.6"/><circle cx="32" cy="10" r="6.2"/></g>' + W.closedEye(30.5, 9, 1.6) + W.closedEye(35, 9, 1.6) +
        '<path d="M32,4 l-2,-4 M36,4 l2,-4" stroke="' + C.BLUE + '" stroke-width="1.2"/>';
      crawl = '<div class="ddp inchworm">' + Pencil.layers('dd-grub', [0, 0, 40, 18], grub) + '</div>';
    }
    return doodle(name, part('mound', [0, 0, 100, 60], mound) + crawl, 'a molehill');
  }

  function rainbowPond() {
    var bands = ['#eaa69c', '#f2c48a', '#f2df8f', '#b9d69c', '#a9c4e8'], arcs = '';
    bands.forEach(function (col, i) {
      var r = 132 - i * 10;
      arcs += '<path d="M' + (150 - r) + ',158 A' + r + ',' + r + ' 0 0 1 ' + (150 + r) + ',158" fill="none" stroke="' + col + '" stroke-width="9"/>';
    });
    arcs += '<path d="M18,158 A132,132 0 0 1 282,158 M68,158 A82,82 0 0 1 232,158" fill="none" stroke="#8a7a6a" stroke-width="1.3"/>';
    var scene = arcs +
      // a tree with a little door in its trunk
      '<path d="M140,160 V128 M160,160 V128" stroke="' + C.BROWN + '" stroke-width="2"/>' +
      '<path d="M140,160 V126 Q150,120 160,126 V160 Z" fill="#d9b98c" stroke="' + C.BROWN + '" stroke-width="2"/>' +
      '<path d="M145,160 V146 q5,-7 10,0 V160 Z" fill="#a9825a" stroke="' + C.BROWN + '" stroke-width="1.4"/>' +
      '<circle cx="152" cy="153" r="1" fill="' + C.INK + '"/>' +
      '<path d="M122,124 C110,124 108,108 120,104 C116,90 134,84 142,92 C146,80 166,80 170,92 C182,86 194,98 186,108 C196,114 190,128 178,126 C168,134 132,134 122,124 Z" fill="' + C.GREEN_SOFT + '" stroke="' + C.GREEN + '" stroke-width="2" stroke-linejoin="round"/>' +
      // the pond
      '<ellipse cx="150" cy="186" rx="128" ry="32" fill="#dbe8f6" stroke="' + C.BLUE + '" stroke-width="2"/>' +
      '<path d="M60,180 q12,-4 24,0 M200,192 q12,-4 24,0 M120,200 q10,-3 20,0" fill="none" stroke="' + C.BLUE + '" stroke-width="1.2" opacity=".6"/>' +
      // a flat stone
      '<ellipse cx="266" cy="214" rx="26" ry="9" fill="#e8dcc5" stroke="' + C.BROWN + '" stroke-width="1.8"/>' +
      '<path d="M246,212 q20,4 40,0" fill="none" stroke="' + C.BROWN + '" stroke-width="1" opacity=".6"/>';
    var pad = '<path d="M20,10 C20,2 36,2 36,10 C36,17 4,17 4,10 C4,4 12,2 18,4 L20,10 Z" fill="#9cc58a" stroke="#4f8a4a" stroke-width="1.4" stroke-linejoin="round"/>';
    var pads = '';
    [[24, 76], [38, 82], [56, 78], [70, 84]].forEach(function (p, i) {
      pads += '<div class="ddp pad" style="left:' + p[0] + '%;top:' + p[1] + '%;width:13%;height:7%;animation-delay:' + (-i * 0.9) + 's">' +
        Pencil.layers('dd-pad', [0, 0, 40, 20], pad) + '</div>';
    });
    var reed = '<path d="M10,90 C10,60 8,30 12,8" fill="none" stroke="' + C.GREEN + '" stroke-width="1.8"/>' +
      '<rect x="8.5" y="6" width="7" height="22" rx="3.5" fill="#8a5a3a" stroke="#5a3a24" stroke-width="1.2"/>' +
      '<path d="M10,90 C4,70 2,50 2,40" fill="none" stroke="' + C.GREEN + '" stroke-width="1.4"/>';
    var reeds = '<div class="ddp reed" style="left:5%;top:44%;width:7%;height:42%">' + Pencil.layers('dd-reed', [0, 0, 20, 92], reed) + '</div>' +
      '<div class="ddp reed" style="left:85%;top:42%;width:7%;height:42%;animation-delay:-1.3s">' + Pencil.layers('dd-reed', [0, 0, 20, 92], reed) + '</div>';
    return doodle('pond', part('pond', [0, 0, 300, 228], scene) + pads + reeds +
      '<div class="ripple"></div>', 'a rainbow over a lily pond');
  }

  /* the chick holding the "new game" sign; it is a button */
  function chick() {
    var box = [0, 0, 120, 150];
    var body = '<path d="M20,96 l-6,12 M100,96 l6,12" stroke="' + C.SUN_LINE + '" stroke-width="2"/>' +
      '<ellipse cx="60" cy="62" rx="36" ry="34" fill="#f8da6c" stroke="#d99a3a" stroke-width="2.4"/>' +
      '<path d="M26,66 q-10,8 -6,22 q10,-2 14,-12 Z M94,66 q10,8 6,22 q-10,-2 -14,-12 Z" fill="#f2c64e" stroke="#d99a3a" stroke-width="2" stroke-linejoin="round"/>' +
      // leaf hat
      '<path d="M58,30 C46,26 34,16 32,2 C48,4 62,14 66,28 Z" fill="' + C.GREEN_SOFT + '" stroke="' + C.GREEN + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M62,28 C54,20 44,12 34,4" fill="none" stroke="' + C.GREEN + '" stroke-width="1.3"/>' +
      '<path d="M54,64 l12,0 -6,8 Z" fill="#ef9a43" stroke="#c46f2a" stroke-width="1.6" stroke-linejoin="round"/>' +
      blush(38, 66, 5) + blush(82, 66, 5) +
      // the sign
      '<rect x="20" y="88" width="80" height="54" rx="3" fill="#fdfaf1" stroke="' + C.INK + '" stroke-width="2" transform="rotate(-3 60 115)"/>' +
      '<path d="M30,92 q-6,-4 -4,-10 M90,92 q6,-4 4,-10" fill="none" stroke="#d99a3a" stroke-width="3" stroke-linecap="round"/>';
    return '<button class="dd dd-chick" type="button" id="new-game" aria-label="new game">' +
      part('chick', box, body, '') +
      face(box, '<g class="blinker">' + dotEyes(48, 72, 54, 4.2) + '</g>', 'inset:0') +
      '<span class="sign-text">new<br>game</span></button>';
  }

  /* ---------------- right margin ---------------- */

  /* a dot-to-dot fish; one more line gets joined for every move played */
  var FISH = [[22, 70], [40, 48], [68, 34], [102, 32], [132, 42], [152, 56], [180, 30], [174, 70], [182, 108],
    [152, 86], [128, 98], [96, 106], [62, 100], [38, 88]];

  function dots() {
    var marks = '';
    FISH.forEach(function (p, i) {
      marks += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.4" fill="' + C.INK + '"/>' +
        '<text x="' + (p[0] + (i < 6 || i > 12 ? -4 : 4)) + '" y="' + (p[1] - 6) + '" font-size="11" fill="' + C.INK +
        '" font-family="Comic Sans MS, cursive" text-anchor="middle">' + (i + 1) + '</text>';
    });
    return doodle('dots', part('dots', [0, 0, 200, 130], marks) +
      '<svg class="ddface dots-lines" viewBox="0 0 200 130" style="inset:0" aria-hidden="true"></svg>',
      'a dot-to-dot puzzle that joins up as the game goes on');
  }

  function hills() {
    var scene = '<path d="M2,70 C40,50 70,44 110,52 C150,60 190,42 258,58" fill="none" stroke="' + C.BLUE + '" stroke-width="1.8"/>' +
      '<path d="M2,78 C60,66 120,66 170,72 C200,76 230,70 258,72" fill="none" stroke="' + C.GREEN + '" stroke-width="1.6"/>' +
      '<g stroke="' + C.GREEN + '" stroke-width="1.2" fill="none"><path d="M20,66 l2,-6 M24,66 l3,-7 M90,52 l1,-6 M94,52 l2,-6 M200,54 l1,-6 M204,54 l2,-7 M236,58 l1,-5"/></g>' +
      // cottage
      '<path d="M70,50 V34 H92 V50 Z" fill="#f4e6cc" stroke="' + C.INK + '" stroke-width="1.6"/>' +
      '<path d="M66,36 L81,24 L96,36 Z" fill="#d9604e" stroke="' + C.INK + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M88,30 V20 h5 v14" fill="#c9b48e" stroke="' + C.INK + '" stroke-width="1.4"/>' +
      '<rect x="77" y="41" width="6" height="9" fill="#a9825a" stroke="' + C.INK + '" stroke-width="1.1"/>' +
      '<rect x="86" y="38" width="4" height="4" fill="#f2df8f" stroke="' + C.INK + '" stroke-width="1"/>' +
      // a little tree
      '<path d="M200,54 V40" stroke="' + C.BROWN + '" stroke-width="2"/>' +
      '<path d="M200,42 C190,42 188,32 194,28 C192,20 204,16 208,24 C216,24 216,36 208,40 C206,44 202,44 200,42 Z" fill="' + C.GREEN_SOFT + '" stroke="' + C.GREEN + '" stroke-width="1.6"/>';
    var puff = '<circle cx="8" cy="8" r="5" fill="' + C.PAPER + '" stroke="#9a8a78" stroke-width="1.3"/>';
    var smoke = '';
    for (var i = 0; i < 3; i++) {
      smoke += '<div class="ddp smoke" style="left:33.5%;top:4%;width:6%;height:20%;animation-delay:' + (i * 1.2) + 's">' +
        Pencil.layers('dd-smoke', [0, 0, 16, 16], puff) + '</div>';
    }
    return doodle('hills', part('hills', [0, 0, 260, 80], scene) + smoke, 'hills with a little cottage');
  }

  function whale() {
    var box = [0, 0, 280, 170];
    var body = '<path d="M30,108 C22,74 54,52 108,50 C164,48 214,62 226,90 C234,82 242,64 262,58 C258,70 254,80 246,88 C258,92 266,104 268,116 C254,108 240,104 228,108 C214,128 160,140 100,138 C58,136 34,126 30,108 Z" fill="#e7ecf8" stroke="' + C.BLUE + '" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<path d="M44,118 C80,130 150,132 200,118" fill="none" stroke="' + C.BLUE + '" stroke-width="1.4"/>' +
      '<path d="M60,124 l2,-6 M78,128 l2,-7 M96,130 l1,-7 M114,131 l1,-7 M132,130 l0,-7 M150,128 l0,-7" stroke="' + C.BLUE + '" stroke-width="1.1" opacity=".7"/>' +
      '<path d="M96,112 C102,126 120,134 134,130 C124,124 112,116 106,108 Z" fill="#cfd8f2" stroke="' + C.BLUE + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      W.closedEye(62, 92, 5) + '<path d="M42,104 q12,8 26,4" fill="none" stroke="' + C.INK + '" stroke-width="1.8" stroke-linecap="round"/>' +
      blush(74, 100, 5) +
      // palm tree growing out of its back
      '<path d="M150,52 C154,36 162,22 176,10" fill="none" stroke="' + C.BROWN + '" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M151,46 l6,1 M154,38 l6,2 M158,30 l6,2 M163,23 l6,2" stroke="#5a4634" stroke-width="1.1"/>' +
      '<circle cx="174" cy="14" r="3.4" fill="#8a5a3a"/><circle cx="180" cy="15" r="3.4" fill="#8a5a3a"/>' +
      // the sea
      '<path d="M10,148 q12,-6 24,0 t24,0 t24,0 t24,0 t24,0 t24,0 t24,0 t24,0 t24,0 t24,0" fill="none" stroke="' + C.BLUE + '" stroke-width="1.6" stroke-linecap="round"/>';
    var fronds = '<g fill="' + C.GREEN_SOFT + '" stroke="' + C.GREEN + '" stroke-width="1.6" stroke-linejoin="round">' +
      '<path d="M40,30 C26,18 12,20 2,30 C14,24 28,26 40,30 Z"/><path d="M40,30 C34,14 22,6 8,8 C22,12 32,20 40,30 Z"/>' +
      '<path d="M40,30 C46,14 60,8 74,12 C60,14 48,22 40,30 Z"/><path d="M40,30 C54,24 68,26 78,36 C66,32 52,30 40,30 Z"/>' +
      '<path d="M40,30 C40,18 44,6 52,0 C48,10 44,20 40,30 Z"/></g>';
    var spout = '<path d="M20,40 C18,28 14,20 8,14 M20,40 C20,26 22,16 26,8 M20,40 C24,30 30,24 36,20" fill="none" stroke="' + C.BLUE + '" stroke-width="1.6" stroke-linecap="round"/>' +
      '<circle cx="8" cy="12" r="2.2" fill="#a9c4e8"/><circle cx="26" cy="6" r="2.2" fill="#a9c4e8"/><circle cx="37" cy="18" r="2.2" fill="#a9c4e8"/>';
    return doodle('whale',
      '<div class="ddp bob slow" style="inset:0">' + Pencil.layers('dd-whale', box, body) +
      '<div class="ddp fronds" style="left:50%;top:-6%;width:30%;height:28%">' + Pencil.layers('dd-fronds', [0, 0, 80, 40], fronds) + '</div>' +
      '<div class="ddp spout" style="left:30%;top:6%;width:15%;height:26%">' + Pencil.layers('dd-spout', [0, 0, 44, 44], spout) + '</div></div>',
      'a sleeping whale with a palm tree on its back');
  }

  /* a sleepy sprout, a nodding sunflower with a bee asleep on it, a ladybird,
     and a snail that gets a little further along every move */
  function garden() {
    var ground = '<path d="M2,98 C60,94 120,100 180,96 C230,93 280,99 318,96" fill="none" stroke="' + C.BROWN + '" stroke-width="1.6" stroke-linecap="round"/>' +
      '<g stroke="' + C.GREEN + '" stroke-width="1.2" fill="none"><path d="M12,97 l1,-6 M16,97 l3,-7 M128,98 l1,-6 M132,98 l2,-6 M226,95 l1,-6 M230,95 l2,-5 M300,96 l1,-6"/></g>' +
      // mushrooms
      '<path d="M100,98 V90 h6 v8" fill="#f4e6cc" stroke="' + C.INK + '" stroke-width="1.2"/><path d="M94,91 q9,-12 18,0 Z" fill="#e3604e" stroke="#b5433a" stroke-width="1.3"/>' +
      '<path d="M244,96 V90 h5 v6" fill="#f4e6cc" stroke="' + C.INK + '" stroke-width="1.1"/><path d="M239,91 q8,-10 15,0 Z" fill="#e3604e" stroke="#b5433a" stroke-width="1.2"/>' +
      // ladybird
      '<path d="M150,97 a8,6 0 0 1 16,0 Z" fill="#e3604e" stroke="' + C.INK + '" stroke-width="1.2"/><circle cx="153" cy="94" r="1.2" fill="' + C.INK + '"/>' +
      '<circle cx="161" cy="93" r="1.2" fill="' + C.INK + '"/><path d="M158,91 V97" stroke="' + C.INK + '" stroke-width="1"/>';
    var sprout = '<path d="M30,62 C14,62 10,40 22,30 C34,20 48,26 50,40 C52,54 44,62 30,62 Z" fill="#a8cf8c" stroke="' + C.GREEN + '" stroke-width="2"/>' +
      '<path d="M22,30 C14,22 6,22 2,26 C8,32 16,32 22,30 Z M44,28 C50,18 60,18 64,22 C58,30 50,30 44,28 Z" fill="' + C.GREEN_SOFT + '" stroke="' + C.GREEN + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      W.closedEye(26, 44, 3) + W.closedEye(38, 44, 3) + blush(22, 50, 3.4) + blush(42, 50, 3.4) +
      '<ellipse cx="32" cy="53" rx="2" ry="2.6" fill="none" stroke="' + C.INK + '" stroke-width="1.3"/>';
    var flower = '<path d="M30,96 C30,70 34,50 30,30" fill="none" stroke="' + C.GREEN + '" stroke-width="2.2"/>' +
      '<path d="M31,70 C40,62 48,62 52,66 C46,72 38,74 31,70 Z M30,80 C20,74 12,76 10,80 C16,86 24,86 30,80 Z" fill="' + C.GREEN_SOFT + '" stroke="' + C.GREEN + '" stroke-width="1.4"/>';
    var petals = '';
    for (var i = 0; i < 12; i++) {
      var a = i / 12 * Math.PI * 2;
      petals += '<ellipse cx="' + (30 + Math.cos(a) * 13).toFixed(1) + '" cy="' + (22 + Math.sin(a) * 13).toFixed(1) + '" rx="6.5" ry="3.4" ' +
        'transform="rotate(' + (a * 180 / Math.PI).toFixed(0) + ' ' + (30 + Math.cos(a) * 13).toFixed(1) + ' ' + (22 + Math.sin(a) * 13).toFixed(1) + ')"/>';
    }
    var head = '<g fill="#f6cd4a" stroke="#c99a2a" stroke-width="1.2">' + petals + '</g>' +
      '<circle cx="30" cy="22" r="9" fill="#8a5a3a" stroke="#5a3a24" stroke-width="1.4"/>' +
      '<g transform="translate(36,4) scale(.55)"><ellipse cx="15" cy="15" rx="9" ry="6.5" fill="#f6d466" stroke="' + C.INK + '" stroke-width="1.8"/>' +
      '<path d="M12,9.5 v11 M17,9 v12" stroke="#6b4423" stroke-width="2.6"/>' + W.closedEye(20, 13, 1.8) + '</g>';
    var snail = '<path d="M4,22 C4,14 10,12 16,14 L30,14 C34,14 36,18 34,22 Z" fill="#e8dcc5" stroke="' + C.BROWN + '" stroke-width="1.3"/>' +
      '<path d="M30,14 l2,-7 M33,15 l5,-6" stroke="' + C.BROWN + '" stroke-width="1.1"/><circle cx="32" cy="7" r="1.2" fill="' + C.INK + '"/><circle cx="38" cy="9" r="1.2" fill="' + C.INK + '"/>' +
      '<circle cx="16" cy="12" r="9" fill="#e9b98a" stroke="' + C.BROWN + '" stroke-width="1.4"/>' +
      '<path d="M16,12 m-2,0 a2,2 0 1 1 4,0 a4,4 0 1 1 -8,0 a6,6 0 1 1 12,0" fill="none" stroke="' + C.BROWN + '" stroke-width="1.1"/>';
    return doodle('garden', part('garden', [0, 0, 320, 104], ground) +
      '<div class="ddp breathe" style="left:6%;top:30%;width:21%;height:62%">' + Pencil.layers('dd-sprout', [0, 0, 66, 66], sprout) + '</div>' +
      '<div class="dd-zzz" style="left:22%;top:8%">' + W.zzz() + '</div>' +
      '<div class="ddp nod" style="left:68%;top:0;width:19%;height:96%">' + Pencil.layers('dd-flower-stem', [0, 0, 60, 100], flower) +
      '<div class="ddp nod-head" style="left:0;top:0;width:100%;height:56%">' + Pencil.layers('dd-flower-head', [0, 0, 60, 56], head) + '</div></div>' +
      '<div class="ddp snail" style="width:14%;height:22%;top:76%">' + Pencil.layers('dd-snail', [0, 0, 42, 24], snail) + '</div>',
      'a garden with a sleepy sprout, a sunflower and a snail');
  }

  global.WorldLand = { dandelion: dandelion, note: note, cloudy: cloudy, molehill: molehill, rainbowPond: rainbowPond,
    chick: chick, dots: dots, FISH: FISH, hills: hills, whale: whale, garden: garden };
})(window);
