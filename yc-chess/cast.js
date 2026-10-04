/* The YC Partners cast for /yc-chess: Y Combinator's partners and founders
   as chibi pencil doodles. Fan-made and affectionate; not affiliated with or
   endorsed by Y Combinator.

   Every figure is built from one paper-doll recipe (head, hair, beard,
   glasses, team hoodie, chess-role costume and a prop from their bio), baked
   into boiling pencil frames by ../js/pencil.js, with a live inked face on
   top that has the same five moods as the woodland pieces. */
(function (global) {
  'use strict';

  /* team colours: orange is Team Garry (you), blue is Team PG */
  var PALETTE = {
    w: {
      line: '#b55a2a', mouth: '#7a3a22', team: '#f39a5b', teamLine: '#c4612b', teamLight: '#fcd6b6',
      gold: '#f0c24f', goldLine: '#c8922d', pale: '#fdf0e0', belly: '#fdf0e0'
    },
    b: {
      line: '#34408f', mouth: '#2a2a5a', team: '#8296de', teamLine: '#3c4ea3', teamLight: '#d2daf6',
      gold: '#f0c24f', goldLine: '#c8922d', pale: '#eef1fc', belly: '#eef1fc'
    }
  };

  var INK = '#232032';
  var BLUSH = '#ee8c9c';

  /* ---- shared bits ---------------------------------------------------- */

  /* faint pencil marks so the piece sits on the paper instead of floating */
  function ground(P) {
    return '<g stroke="' + P.line + '" stroke-width="1.4" stroke-linecap="round" opacity=".38" fill="none">' +
      '<path d="M29,97 q8,2 15,0 M55,97 q8,2 14,-1 M36,99 l-2,2.5 M48,99.5 l0,2.5 M62,99 l2,2.5"/></g>';
  }

  function grad(id, top, bottom) {
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + top + '"/><stop offset="1" stop-color="' + bottom + '"/>' +
      '</linearGradient></defs>';
  }

  /* The other faces a piece can pull, stacked beside its resting eyes:
     wide (surprised), happy (^ ^), sleepy (closed) and worried (brows up).
     `pts` are the eye centres; k is -1/1 for left/right, 0 for a profile. */
  function eyeMoods(pts, rx, ry, s) {
    function each(fn) { return pts.map(fn).join(''); }
    var line = '" fill="none" stroke="' + INK + '" stroke-width="' + (2 * s) + '" stroke-linecap="round"/>';
    var wide = each(function (p) {
      return '<ellipse cx="' + p.x + '" cy="' + p.y + '" rx="' + rx * 1.28 + '" ry="' + ry * 1.3 + '" fill="' + INK + '"/>' +
        '<circle cx="' + (p.x + 1.9 * s) + '" cy="' + (p.y - 2.4 * s) + '" r="' + 2.1 * s + '" fill="#fff"/>' +
        '<circle cx="' + (p.x - 1.7 * s) + '" cy="' + (p.y + 2.4 * s) + '" r="' + s + '" fill="#fff" opacity=".8"/>';
    });
    var happy = each(function (p) {
      return '<path d="M' + (p.x - rx) + ',' + (p.y + 1.6 * s) + ' Q' + p.x + ',' + (p.y - ry * 1.5) + ' ' +
        (p.x + rx) + ',' + (p.y + 1.6 * s) + line;
    });
    var sleepy = each(function (p) {
      return '<path d="M' + (p.x - rx) + ',' + (p.y - 0.6 * s) + ' Q' + p.x + ',' + (p.y + ry * 1.1) + ' ' +
        (p.x + rx) + ',' + (p.y - 0.6 * s) + line;
    });
    var worried = each(function (p) {
      var inner = p.k === 0 ? -1 : -p.k;   // brows climb towards the middle of the face
      var y = p.y - ry - 2 * s;
      return '<ellipse cx="' + p.x + '" cy="' + p.y + '" rx="' + rx + '" ry="' + ry + '" fill="' + INK + '"/>' +
        '<circle cx="' + (p.x + 1.5 * s) + '" cy="' + (p.y - 1.8 * s) + '" r="' + 1.6 * s + '" fill="#fff"/>' +
        '<path d="M' + (p.x - inner * rx) + ',' + (y + 1.2 * s) + ' L' + (p.x + inner * rx) + ',' + (y - 2.6 * s) + line;
    });
    return '<g class="mood mood-wide ink">' + wide + '</g>' +
      '<g class="mood mood-happy ink">' + happy + '</g>' +
      '<g class="mood mood-sleepy ink">' + sleepy + '</g>' +
      '<g class="mood mood-worried ink">' + worried + '</g>';
  }

  /* big shiny eyes, inked rather than pencilled */
  function eyes(cx, cy, s) {
    var ex = 8.2 * s, rx = 4.5 * s, ry = 5.1 * s;
    var out = '<g class="eyes ink">';
    [-1, 1].forEach(function (k) {
      var x = cx + k * ex;
      out += '<ellipse cx="' + x + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + INK + '"/>' +
        '<circle cx="' + (x + 1.6 * s) + '" cy="' + (cy - 1.9 * s) + '" r="' + (1.7 * s) + '" fill="#fff"/>' +
        '<circle cx="' + (x - 1.5 * s) + '" cy="' + (cy + 2 * s) + '" r="' + (0.8 * s) + '" fill="#fff" opacity=".75"/>';
    });
    return out + '</g>' + eyeMoods([{ x: cx - ex, y: cy, k: -1 }, { x: cx + ex, y: cy, k: 1 }], rx, ry, s);
  }

  /* the owl's unimpressed look: pupils resting low under heavy lids */
  function sleepyEyes(cx, cy, s, lid) {
    var ex = 11 * s;
    var out = '<g class="eyes ink">';
    [-1, 1].forEach(function (k) {
      var x = cx + k * ex, w = 7 * s;
      out += '<ellipse cx="' + x + '" cy="' + cy + '" rx="' + (6.4 * s) + '" ry="' + (4.8 * s) + '" fill="#fffaf0"/>' +
        '<ellipse cx="' + (x + k * 0.8 * s) + '" cy="' + (cy + 1.3 * s) + '" rx="' + (3.7 * s) + '" ry="' + (3.3 * s) + '" fill="' + INK + '"/>' +
        '<circle cx="' + (x + k * 0.8 * s + 1.3 * s) + '" cy="' + (cy + 0.4 * s) + '" r="' + (1.05 * s) + '" fill="#fff"/>' +
        '<path d="M' + (x - w) + ',' + (cy - 0.4 * s) + ' Q' + x + ',' + (cy - 2.6 * s) + ' ' + (x + w) + ',' + (cy - 0.4 * s) +
        ' L' + (x + w) + ',' + (cy - 6 * s) + ' L' + (x - w) + ',' + (cy - 6 * s) + ' Z" fill="' + lid + '"/>' +
        '<path d="M' + (x - w - 0.4) + ',' + (cy - 0.2 * s) + ' Q' + x + ',' + (cy - 2.8 * s) + ' ' + (x + w + 0.4) + ',' + (cy - 0.2 * s) +
        '" fill="none" stroke="' + INK + '" stroke-width="' + (2 * s) + '" stroke-linecap="round"/>';
    });
    return out + '</g>' + eyeMoods([{ x: cx - ex, y: cy, k: -1 }, { x: cx + ex, y: cy, k: 1 }], 5.4 * s, 5.8 * s, s);
  }

  function blush(cx, cy, s, spread) {
    var dx = (spread || 14) * s;
    return '<ellipse cx="' + (cx - dx) + '" cy="' + cy + '" rx="' + (4.4 * s) + '" ry="' + (2.6 * s) + '" fill="' + BLUSH + '" opacity=".6"/>' +
      '<ellipse cx="' + (cx + dx) + '" cy="' + cy + '" rx="' + (4.4 * s) + '" ry="' + (2.6 * s) + '" fill="' + BLUSH + '" opacity=".6"/>';
  }

  function smile(cx, cy, w, color) {
    return '<g class="mouth ink"><path d="M' + (cx - w) + ',' + cy + ' q' + w + ',' + (w * 0.95) + ' ' + (2 * w) + ',0" ' +
      'fill="none" stroke="' + color + '" stroke-width="1.7" stroke-linecap="round"/></g>' +
      '<g class="mouthv mouth-o ink"><ellipse cx="' + cx + '" cy="' + (cy + w * 0.5) + '" rx="' + w * 0.62 + '" ry="' + w * 0.8 +
      '" fill="#7a3a3a" stroke="' + color + '" stroke-width="1.3"/></g>';
  }

  /* the bit of paper left unshaded */
  function shine(cx, cy, rx, ry, rot) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry +
      '" fill="#fff" opacity=".42" transform="rotate(' + (rot || -25) + ' ' + cx + ' ' + cy + ')"/>';
  }

  /* a slightly lumpy oval, the way a pencil fills a dot */
  function spot(cx, cy, rx, ry, fill) {
    return '<path d="M' + (cx - rx) + ',' + cy +
      ' q' + (rx * 0.1) + ',' + (-ry) + ' ' + rx + ',' + (-ry * 0.95) +
      ' q' + (rx * 0.95) + ',' + (ry * 0.1) + ' ' + rx + ',' + (ry * 0.95) +
      ' q' + (-rx * 0.1) + ',' + (ry * 1.05) + ' ' + (-rx) + ',' + ry +
      ' q' + (-rx * 0.95) + ',' + (-ry * 0.05) + ' ' + (-rx) + ',' + (-ry) + ' Z" fill="' + fill + '"/>';
  }

  function crown(cx, y, w, P, cross, feather) {
    var h = 12, half = w / 2;
    var d = 'M' + (cx - half) + ',' + (y + h) + ' L' + (cx - half - 1) + ',' + y +
      ' L' + (cx - half / 2.1) + ',' + (y + 6) + ' L' + cx + ',' + (y - 3) +
      ' L' + (cx + half / 2.1) + ',' + (y + 6) + ' L' + (cx + half + 1) + ',' + y +
      ' L' + (cx + half) + ',' + (y + h) + ' Z';
    var out = '';
    if (cross) {
      var c = 'M' + cx + ',' + (y - 16) + ' V' + (y - 3) + ' M' + (cx - 4.5) + ',' + (y - 11.5) + ' H' + (cx + 4.5);
      out += '<path d="' + c + '" stroke="' + P.goldLine + '" stroke-width="4" stroke-linecap="round" fill="none"/>' +
        '<path d="' + c + '" stroke="' + P.gold + '" stroke-width="2" stroke-linecap="round" fill="none"/>';
    }
    out += '<path d="' + d + '" fill="' + P.gold + '" stroke="' + P.goldLine + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M' + (cx - half + 2) + ',' + (y + h - 3.5) + ' H' + (cx + half - 2) + '" stroke="' + P.goldLine + '" stroke-width="1.1" opacity=".6"/>';
    if (feather) {
      out += '<path d="M' + (cx + half - 3) + ',' + (y + 3) + ' q5,-10 13,-10 q-2,9 -13,10 Z" fill="#e0604f" stroke="#b5433a" stroke-width="1.3" stroke-linejoin="round"/>';
    }
    return out;
  }

  function star(cx, cy, r, fill, stroke) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var rad = i % 2 ? r * 0.45 : r;
      var a = -Math.PI / 2 + i * Math.PI / 5;
      pts.push((cx + rad * Math.cos(a)).toFixed(1) + ',' + (cy + rad * Math.sin(a)).toFixed(1));
    }
    return '<polygon points="' + pts.join(' ') + '" fill="' + fill + '" stroke="' + (stroke || 'none') +
      '" stroke-width="1.2" stroke-linejoin="round"/>';
  }


  /* ---------------- the paper doll ---------------- */

  var SKIN = {
    fair: ['#f8dcc6', '#d39a78'], light: ['#f3d0b0', '#c98f69'], tan: ['#ecc9a0', '#bf8a5c'],
    medium: ['#cf9a70', '#9a6440'], brown: ['#b8825a', '#83532f']
  };
  var HAIR = {
    black: '#2b2523', darkbrown: '#4a3326', brown: '#6b4a32', lightbrown: '#9a7350',
    sandy: '#bf9862', blonde: '#e3c47e', strawberry: '#b97a50', grey: '#a9a39b', silver: '#cfcac2'
  };

  function hairBack(o) {
    var c = HAIR[o.hairColor];
    if (o.hair === 'long') {
      return '<path d="M28,40 C22,56 24,74 30,82 L40,80 C35,68 34,54 36,42 Z M72,40 C78,56 76,74 70,82 L60,80 C65,68 66,54 64,42 Z" fill="' + c + '" stroke="' + shade(c) + '" stroke-width="1.6" stroke-linejoin="round"/>';
    }
    if (o.hair === 'tied') {
      return '<circle cx="64" cy="20" r="7" fill="' + c + '" stroke="' + shade(c) + '" stroke-width="1.6"/>';
    }
    return '';
  }

  var HAIR_FRONT = {
    short: 'M29,40 C29,22 40,18 50,18 C62,18 72,24 71,40 C66,32 58,29 50,30 C42,29 34,32 29,40 Z',
    quiff: 'M29,40 C28,24 38,16 50,15 C60,12 71,15 72,26 C69,24 65,24 63,26 C66,30 70,34 71,40 C64,31 54,29 46,30 C38,31 32,35 29,40 Z',
    swept: 'M29,38 C30,21 42,15 55,17 C65,18 72,26 71,38 C67,29 60,25 52,25 C42,26 34,30 29,38 Z',
    tousled: 'M29,41 C25,31 31,21 39,21 C41,14 51,13 54,18 C58,13 68,15 68,23 C74,25 75,35 71,41 C67,33 61,30 55,32 C49,28 43,30 39,34 C35,32 31,36 29,41 Z',
    crop: 'M30,36 C32,24 42,20 50,20 C58,20 68,24 70,36 C64,30 56,28 50,28 C44,28 36,30 30,36 Z',
    long: 'M29,44 C27,24 40,17 50,17 C61,17 73,24 71,44 C68,33 62,28 53,27 C45,31 36,34 29,44 Z',
    tied: 'M29,38 C29,23 40,18 50,18 C61,18 71,23 71,38 C66,30 58,27 50,27 C42,27 34,30 29,38 Z',
    side: 'M29,40 C28,23 40,17 51,17 C62,17 72,24 71,40 C67,30 60,26 44,28 C38,30 32,34 29,40 Z',
    receding: 'M30,34 C30,26 34,22 38,21 C36,26 35,30 35,34 Z M70,34 C70,26 66,22 62,21 C64,26 65,30 65,34 Z M38,21 C44,19 56,19 62,21 C58,23 42,23 38,21 Z',
    bald: ''
  };

  function hairFront(o) {
    var d = HAIR_FRONT[o.hair];
    if (!d) return '<ellipse cx="42" cy="28" rx="6" ry="3.4" fill="#fff" opacity=".35" transform="rotate(-20 42 28)"/>';
    var c = HAIR[o.hairColor];
    return '<path d="' + d + '" fill="' + c + '" stroke="' + shade(c) + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M42,22 q4,-2 9,-1 M55,21 q4,1 7,4" fill="none" stroke="#fff" stroke-width="1.4" opacity=".28" stroke-linecap="round"/>';
  }

  /* Beards leave the mouth showing: the beard runs round the jaw below the
     smile, with a separate moustache above it. */
  function beard(o) {
    if (!o.beard) return '';
    var c = HAIR[o.beardColor || o.hairColor], line = shade(c);
    if (o.beard === 'stubble') {
      return '<path d="M32,49 C34,60 42,64 50,64 C58,64 66,60 68,49 C64,57 58,60 50,60 C42,60 36,57 32,49 Z" fill="' + c + '" opacity=".28"/>';
    }
    var low = o.beard === 'full' ? 70 : 65;
    return '<path d="M31,46 C31,60 40,' + low + ' 50,' + low + ' C60,' + low + ' 69,60 69,46 C67,54 63,59.5 57,59.5 C54,58.6 46,58.6 43,59.5 C37,59.5 33,54 31,46 Z" fill="' + c +
      '" stroke="' + line + '" stroke-width="1.3" stroke-linejoin="round" opacity=".92"/>' +
      '<path d="M43,52.4 Q50,48.6 57,52.4 Q50,51.2 43,52.4 Z" fill="' + c + '" stroke="' + line + '" stroke-width="1.1" stroke-linejoin="round"/>';
  }

  function glasses(o) {
    if (!o.glasses) return '';
    var col = o.glassesColor || INK, w = o.glasses === 'thick' ? 2.4 : 1.4, out = '';
    [42.6, 57.4].forEach(function (x) {
      out += o.glasses === 'round'
        ? '<circle cx="' + x + '" cy="45" r="6.2" fill="#fff" fill-opacity=".18" stroke="' + col + '" stroke-width="' + w + '"/>'
        : '<rect x="' + (x - 6.6) + '" y="39.6" width="13.2" height="10.6" rx="3" fill="#fff" fill-opacity=".18" stroke="' + col + '" stroke-width="' + w + '"/>';
    });
    return out + '<path d="M48.8,44.6 q1.2,-1.2 2.4,0 M29.6,44 h6 M64.4,44 h6" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round"/>';
  }

  function shade(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.round(((n >> 16) & 255) * 0.62), g = Math.round(((n >> 8) & 255) * 0.62), b = Math.round((n & 255) * 0.62);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /* ---------------- chess-role costumes ---------------- */

  var COSTUME = {
    k: function (P) { return crown(50, 9, 26, P, true); },
    q: function (P) {
      return crown(50, 12, 22, P, false) +
        '<circle cx="50" cy="8" r="2.6" fill="#e98fb0" stroke="' + P.goldLine + '" stroke-width="1"/>';
    },
    r: function (P) {
      return '<path d="M37,24 V10 H42 V14 H47 V10 H53 V14 H58 V10 H63 V24 Z" fill="' + P.teamLight + '" stroke="' + P.teamLine + '" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="M38,19 H62 M44,24 V19 M56,24 V19" stroke="' + P.teamLine + '" stroke-width="1" opacity=".55"/>';
    },
    b: function (P) {
      return '<path d="M38,25 L44,6 Q50,0 56,6 L62,25 Z" fill="' + P.team + '" stroke="' + P.teamLine + '" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="M50,3 L46,15" stroke="' + P.teamLine + '" stroke-width="1.4"/>' +
        '<rect x="37" y="21" width="26" height="5" rx="2" fill="' + P.gold + '" stroke="' + P.goldLine + '" stroke-width="1.1"/>';
    },
    n: function (P) {
      // a hobby horse held in the right hand
      return '<path d="M76,95 L79,50" stroke="#8a6a4a" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M73,54 C70,42 78,33 87,35 C95,37 98,47 92,51 C88,53 84,51 82,56 Z" fill="' + P.teamLight + '" stroke="' + P.teamLine + '" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="M77,37 l-1,-7 6,5 Z" fill="' + P.team + '" stroke="' + P.teamLine + '" stroke-width="1.3" stroke-linejoin="round"/>' +
        '<path d="M75,40 l-5,-1 3,5 Z M73,46 l-5,1 4,4 Z" fill="' + P.team + '" stroke="' + P.teamLine + '" stroke-width="1.1" stroke-linejoin="round"/>' +
        '<circle cx="86" cy="41" r="1.8" fill="' + INK + '"/><circle cx="93" cy="47" r="1" fill="' + P.teamLine + '"/>';
    },
    p: function () { return ''; }
  };

  /* ---------------- props from each bio ---------------- */

  var PROPS = {
    pencil: '<path d="M68,88 L86,66" stroke="#f2c64e" stroke-width="5" stroke-linecap="round"/><path d="M86,66 l3,-4 -5,1 Z" fill="#5a4634"/><path d="M68,88 l-1.5,2" stroke="#e8909a" stroke-width="5" stroke-linecap="round"/>',
    scroll: '<rect x="14" y="74" width="16" height="12" rx="2" fill="#fdfaf1" stroke="#5a4634" stroke-width="1.4"/><path d="M17,78 h10 M17,81 h8" stroke="#5a4634" stroke-width="1"/><circle cx="14" cy="80" r="2.6" fill="#fdfaf1" stroke="#5a4634" stroke-width="1.2"/>',
    brush: '<path d="M68,90 L84,66" stroke="#a9825a" stroke-width="3" stroke-linecap="round"/><path d="M84,66 l4,-6 -1,6 Z" fill="#e3604e" stroke="#5a4634" stroke-width="1"/><circle cx="88" cy="70" r="2" fill="#5ba3d9"/><circle cx="91" cy="64" r="1.6" fill="#f0c24f"/>',
    book: '<rect x="13" y="73" width="17" height="14" rx="1.5" fill="#d9604e" stroke="#5a4634" stroke-width="1.4"/><path d="M16,73 v14" stroke="#5a4634" stroke-width="1.2"/><path d="M19,77 h8 M19,80 h6" stroke="#fdfaf1" stroke-width="1.2"/>',
    robot: '<rect x="80" y="76" width="14" height="12" rx="3" fill="#cfd8e8" stroke="#5a4634" stroke-width="1.4"/><rect x="82" y="68" width="10" height="8" rx="2" fill="#cfd8e8" stroke="#5a4634" stroke-width="1.4"/><circle cx="85" cy="72" r="1.2" fill="' + INK + '"/><circle cx="89" cy="72" r="1.2" fill="' + INK + '"/><path d="M87,68 v-4" stroke="#5a4634" stroke-width="1.2"/><circle cx="87" cy="63" r="1.6" fill="#e3604e"/><path d="M82,88 v5 M92,88 v5" stroke="#5a4634" stroke-width="2" stroke-linecap="round"/>',
    tube: '<path d="M18,64 v18 a4,4 0 0 0 8,0 v-18 Z" fill="#fdfaf1" stroke="#5a4634" stroke-width="1.4"/><path d="M18,74 h8 v8 a4,4 0 0 1 -8,0 Z" fill="#8fd1a8"/><path d="M16,64 h12" stroke="#5a4634" stroke-width="1.6" stroke-linecap="round"/><circle cx="21" cy="70" r="1" fill="#8fd1a8"/>',
    magnifier: '<circle cx="18" cy="70" r="7" fill="#e3f0fa" fill-opacity=".7" stroke="#5a4634" stroke-width="2"/><path d="M23,75 L29,82" stroke="#5a4634" stroke-width="3.2" stroke-linecap="round"/>',
    pager: '<rect x="12" y="72" width="16" height="11" rx="2.4" fill="#4a4a52" stroke="#2a2a30" stroke-width="1.2"/><rect x="14.5" y="74.5" width="11" height="4.5" rx="1" fill="#9fd98a"/><path d="M8,71 l-3,-3 M8,76 h-4" stroke="#e3604e" stroke-width="1.4" stroke-linecap="round"/>',
    coins: '<g fill="#f0c24f" stroke="#c8922d" stroke-width="1.2"><ellipse cx="20" cy="86" rx="7" ry="2.6"/><ellipse cx="20" cy="82" rx="7" ry="2.6"/><ellipse cx="20" cy="78" rx="7" ry="2.6"/><ellipse cx="20" cy="74" rx="7" ry="2.6"/></g>',
    wrench: '<path d="M14,86 L26,70" stroke="#9aa3ad" stroke-width="3.6" stroke-linecap="round"/><path d="M24,66 a5,5 0 1 0 6,6 l-3,-1 -2,-3 Z" fill="#9aa3ad" stroke="#5a4634" stroke-width="1.2" stroke-linejoin="round"/>',
    ab: '<rect x="10" y="68" width="22" height="14" rx="2" fill="#fdfaf1" stroke="#5a4634" stroke-width="1.4"/><path d="M14,79 l3,-8 3,8 M15,76 h4 M24,71 v8 h3 a2,2 0 0 0 0,-4 h-3 M24,71 h2.6 a2,2 0 0 1 0,4" fill="none" stroke="#4a6fb0" stroke-width="1.4" stroke-linejoin="round"/><path d="M21,82 v8" stroke="#8a6a4a" stroke-width="2.4"/>',
    storm: '<path d="M10,72 a5,5 0 0 1 5,-6 a7,7 0 0 1 13,-1 a5,5 0 0 1 3,9 Z" fill="#dfe4f0" stroke="#5a4634" stroke-width="1.3"/><path d="M20,74 l-3,6 h4 l-3,7" fill="none" stroke="#f0b72f" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>',
    chart: '<rect x="10" y="68" width="20" height="18" rx="2" fill="#fdfaf1" stroke="#5a4634" stroke-width="1.3"/><path d="M13,82 l5,-5 4,3 6,-9" fill="none" stroke="#3f9a5c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M28,71 l0,4 -4,-3 Z" fill="#3f9a5c"/>',
    newspaper: '<rect x="10" y="70" width="22" height="16" rx="1.5" fill="#fdfaf1" stroke="#5a4634" stroke-width="1.3"/><path d="M13,74 h16 M13,78 h7 M13,81 h7 M23,78 h6 v5 h-6 Z" fill="none" stroke="#5a4634" stroke-width="1.1"/>',
    palette: '<path d="M10,78 C10,68 22,64 30,70 C34,73 30,77 27,77 C24,77 24,81 27,82 C30,84 24,90 18,88 C13,87 10,84 10,78 Z" fill="#f4e6cc" stroke="#5a4634" stroke-width="1.3"/><circle cx="16" cy="74" r="2" fill="#e3604e"/><circle cx="21" cy="71" r="2" fill="#f0c24f"/><circle cx="15" cy="81" r="2" fill="#5ba3d9"/>',
    phones: '<rect x="8" y="70" width="9" height="15" rx="2" fill="#4a4a52" transform="rotate(-14 12 77)"/><rect x="19" y="70" width="9" height="15" rx="2" fill="#4a4a52" transform="rotate(14 23 77)"/><path d="M17,66 l1,-4 M20,66 l2,-3 M14,67 l-2,-3" stroke="#e3604e" stroke-width="1.4" stroke-linecap="round"/>',
    card: '<rect x="9" y="72" width="22" height="14" rx="2.4" fill="#ff6f61" stroke="#a83a2e" stroke-width="1.3"/><rect x="12" y="76" width="5" height="4" rx="1" fill="#f0c24f"/><path d="M12,83 h12" stroke="#fff" stroke-width="1.2" opacity=".8"/>',
    apple: '<circle cx="20" cy="79" r="7" fill="#e3604e" stroke="#a83a2e" stroke-width="1.3"/><path d="M20,72 q1,-4 4,-5" stroke="#5a4634" stroke-width="1.3" fill="none"/><path d="M21,71 q5,-4 8,0 q-4,3 -8,0 Z" fill="#9cc58a" stroke="#4f8a4a" stroke-width="1"/>',
    calendar: '<rect x="10" y="70" width="20" height="17" rx="2" fill="#fdfaf1" stroke="#5a4634" stroke-width="1.3"/><path d="M10,75 h20" stroke="#e3604e" stroke-width="3"/><path d="M14,79 h3 M19,79 h3 M24,79 h3 M14,83 h3 M19,83 h3" stroke="#5a4634" stroke-width="1.3"/>',
    truck: '<rect x="6" y="74" width="16" height="10" rx="1.5" fill="#f4e6cc" stroke="#5a4634" stroke-width="1.3"/><path d="M22,77 h6 l3,4 v3 h-9 Z" fill="#5ba3d9" stroke="#5a4634" stroke-width="1.3" stroke-linejoin="round"/><circle cx="11" cy="86" r="2.4" fill="#4a4a52"/><circle cx="26" cy="86" r="2.4" fill="#4a4a52"/>',
    notebook: '<rect x="10" y="70" width="18" height="16" rx="1.5" fill="#a9c4e8" stroke="#3f4fa8" stroke-width="1.3"/><path d="M13,70 v16" stroke="#3f4fa8" stroke-width="1.1"/><path d="M28,66 L20,80" stroke="#f2c64e" stroke-width="2.6" stroke-linecap="round"/>',
    laptop: '<path d="M35,72 H65 L68,86 H32 Z" fill="#cfd5dd" stroke="#5a4634" stroke-width="1.5" stroke-linejoin="round"/><rect x="38" y="74" width="24" height="9" rx="1" fill="#e8f1f8"/><circle cx="50" cy="78.5" r="1.6" fill="#f39a5b"/>',
    horn: '<path d="M44,22 L50,2 L56,22 Z" fill="#fdf3c4" stroke="#c8922d" stroke-width="1.4" stroke-linejoin="round"/><path d="M46,16 l8,-2 M47,11 l6,-1.6" stroke="#c8922d" stroke-width="1"/>'
  };

  /* ---------------- who's who ---------------- */
  /* Looks are kept to a few kind cues from public headshots: hair, glasses,
     beard. Props come from each person's bio on ycombinator.com/people. */
  var PEOPLE = {
    garry: { name: 'Garry Tan', title: 'President & CEO', skin: 'tan', hair: 'quiff', hairColor: 'black', beard: 'trim', glasses: 'thick', prop: 'pencil' },
    jared: { name: 'Jared Friedman', title: 'Managing Partner', skin: 'fair', hair: 'swept', hairColor: 'strawberry', beard: 'stubble', prop: 'scroll' },
    harj: { name: 'Harj Taggar', title: 'Managing Partner', skin: 'medium', hair: 'quiff', hairColor: 'black' },
    diana: { name: 'Diana Hu', title: 'Managing Partner', skin: 'tan', hair: 'long', hairColor: 'black', glasses: 'rect', glassesColor: '#4a5fae' },
    pg: { name: 'Paul Graham', title: 'Founder', skin: 'fair', hair: 'crop', hairColor: 'grey', prop: 'brush' },
    jessica: { name: 'Jessica Livingston', title: 'Founder', skin: 'fair', hair: 'long', hairColor: 'blonde', prop: 'book' },
    rtm: { name: 'Robert Morris', title: 'Founder', skin: 'fair', hair: 'tousled', hairColor: 'brown', glasses: 'round' },
    trevor: { name: 'Trevor Blackwell', title: 'Founder', skin: 'fair', hair: 'crop', hairColor: 'silver', beard: 'full', beardColor: 'grey', glasses: 'thick', prop: 'robot' },
    // general partners who think on the diagonal: the technical ones
    ankit: { name: 'Ankit Gupta', title: 'General Partner', skin: 'brown', hair: 'crop', hairColor: 'black', beard: 'trim', prop: 'tube', play: 'b' },
    nicolas: { name: 'Nicolas Dessaigne', title: 'General Partner', skin: 'light', hair: 'receding', hairColor: 'darkbrown', prop: 'magnifier', play: 'b' },
    andrew: { name: 'Andrew Miklas', title: 'General Partner', skin: 'fair', hair: 'side', hairColor: 'brown', prop: 'pager', play: 'b' },
    jon: { name: 'Jon Xu', title: 'General Partner', skin: 'tan', hair: 'short', hairColor: 'black', prop: 'coins', play: 'b' },
    grey: { name: 'Grey Baker', title: 'General Partner', skin: 'fair', hair: 'tousled', hairColor: 'brown', prop: 'wrench', play: 'b' },
    pete: { name: 'Pete Koomen', title: 'General Partner', skin: 'light', hair: 'bald', beard: 'trim', beardColor: 'brown', prop: 'ab', play: 'b' },
    chris: { name: 'Chris Golda', title: 'General Partner', skin: 'light', hair: 'swept', hairColor: 'black', beard: 'full', glasses: 'thick', prop: 'storm', play: 'b' },
    // and those who leap: growth, product and design
    gustaf: { name: 'Gustaf Alströmer', title: 'General Partner', skin: 'fair', hair: 'crop', hairColor: 'lightbrown', prop: 'chart', play: 'n' },
    brad: { name: 'Brad Flora', title: 'General Partner', skin: 'fair', hair: 'crop', hairColor: 'sandy', beard: 'stubble', prop: 'newspaper', play: 'n' },
    aaron: { name: 'Aaron Epstein', title: 'General Partner', skin: 'fair', hair: 'short', hairColor: 'brown', prop: 'palette', play: 'n' },
    david: { name: 'David Lieb', title: 'General Partner', skin: 'fair', hair: 'short', hairColor: 'lightbrown', beard: 'trim', prop: 'phones', play: 'n' },
    tom: { name: 'Tom Blomfield', title: 'General Partner', skin: 'fair', hair: 'swept', hairColor: 'sandy', beard: 'stubble', beardColor: 'strawberry', prop: 'card', play: 'n' },
    tyler: { name: 'Tyler Bosmeny', title: 'General Partner', skin: 'fair', hair: 'side', hairColor: 'darkbrown', prop: 'apple', play: 'n' },
    raphael: { name: 'Raphael Schaad', title: 'General Partner', skin: 'light', hair: 'quiff', hairColor: 'darkbrown', prop: 'calendar', play: 'n' },
    harshita: { name: 'Harshita Arora', title: 'General Partner', skin: 'brown', hair: 'tied', hairColor: 'black', glasses: 'rect', prop: 'truck', play: 'n' },
    vivian: { name: 'Vivian Midha Shen', title: 'General Partner', skin: 'tan', hair: 'long', hairColor: 'black', prop: 'notebook', play: 'n' }
  };

  /* founders make up the pawns: a mixed batch in team hoodies, with laptops */
  var FOUNDERS = [
    { skin: 'light', hair: 'tousled', hairColor: 'brown' }, { skin: 'brown', hair: 'long', hairColor: 'black' },
    { skin: 'fair', hair: 'crop', hairColor: 'blonde' }, { skin: 'medium', hair: 'quiff', hairColor: 'black' },
    { skin: 'tan', hair: 'tied', hairColor: 'darkbrown' }, { skin: 'fair', hair: 'side', hairColor: 'strawberry', glasses: 'round' },
    { skin: 'brown', hair: 'crop', hairColor: 'black', beard: 'trim' }, { skin: 'light', hair: 'long', hairColor: 'lightbrown' }
  ];

  var ROLE_NAMES = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };
  var TEAM = { w: 'Team Garry', b: 'Team PG' };

  /* Who stands where. The heads of each side are fixed; the bishop and
     knight squares go to a fresh draw of general partners every game, so
     over a couple of games everyone gets to play. */
  var lineup = {};

  function shuffled(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i];
      a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function newLineup() {
    var diagonal = shuffled(Object.keys(PEOPLE).filter(function (k) { return PEOPLE[k].play === 'b'; }));
    var leaping = shuffled(Object.keys(PEOPLE).filter(function (k) { return PEOPLE[k].play === 'n'; }));
    lineup = {
      e1: 'garry', d1: 'jared', a1: 'harj', h1: 'diana',
      e8: 'pg', d8: 'jessica', a8: 'rtm', h8: 'trevor',
      c1: diagonal[0], f1: diagonal[1], c8: diagonal[2], f8: diagonal[3],
      b1: leaping[0], g1: leaping[1], b8: leaping[2], g8: leaping[3]
    };
    'abcdefgh'.split('').forEach(function (f, i) {
      lineup[f + '2'] = 'founder' + i;
      lineup[f + '7'] = 'founder' + ((i + 3) % 8);
    });
    return lineup;
  }

  function who(piece) {
    var key = piece && piece.id ? lineup[piece.id] : null;
    if (!key) key = piece && piece.t === 'p' ? 'founder0' : 'garry';
    return key;
  }

  function looks(key) {
    if (key.indexOf('founder') === 0) return FOUNDERS[Number(key.slice(7)) % FOUNDERS.length];
    return PEOPLE[key];
  }

  /* ---------------- drawing a person ---------------- */

  function person(o, P, role, promoted) {
    var skin = SKIN[o.skin];
    var hands = '<circle cx="27" cy="84" r="4" fill="' + skin[0] + '" stroke="' + skin[1] + '" stroke-width="1.3"/>' +
      '<circle cx="73" cy="84" r="4" fill="' + skin[0] + '" stroke="' + skin[1] + '" stroke-width="1.3"/>';
    return [
      ground(P),
      hairBack(o),
      '<ellipse cx="42" cy="93.5" rx="6" ry="3" fill="#5a4634"/><ellipse cx="58" cy="93.5" rx="6" ry="3" fill="#5a4634"/>',
      // team hoodie
      '<ellipse cx="30" cy="75" rx="5.2" ry="10" fill="' + P.team + '" stroke="' + P.teamLine + '" stroke-width="1.6" transform="rotate(22 30 75)"/>',
      '<ellipse cx="70" cy="75" rx="5.2" ry="10" fill="' + P.team + '" stroke="' + P.teamLine + '" stroke-width="1.6" transform="rotate(-22 70 75)"/>',
      '<path d="M33,66 C33,62 38,60 44,60 L56,60 C62,60 67,62 67,66 L70,88 C70,92 66,94 62,94 L38,94 C34,94 30,92 30,88 Z" fill="' + P.team + '" stroke="' + P.teamLine + '" stroke-width="1.9" stroke-linejoin="round"/>',
      '<path d="M40,61 Q50,70 60,61" fill="none" stroke="' + P.teamLine + '" stroke-width="1.5"/>',
      '<path d="M46,65 l-1,7 M54,65 l1,7" stroke="' + P.teamLight + '" stroke-width="1.4" stroke-linecap="round"/>',
      '<path d="M41,82 Q50,86 59,82" fill="none" stroke="' + P.teamLine + '" stroke-width="1.2" opacity=".7"/>',
      '<rect x="55" y="68" width="8" height="8" rx="1.2" fill="#f26625" stroke="#c4501a" stroke-width="1"/>',
      '<path d="M57.2,70 L59,72.6 L60.8,70 M59,72.6 V74.6" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>',
      shine(38, 72, 3, 7, -10),
      role === 'p' && !promoted ? PROPS.laptop : '',
      hands,
      // head
      '<ellipse cx="29.5" cy="45" rx="3.4" ry="4.4" fill="' + skin[0] + '" stroke="' + skin[1] + '" stroke-width="1.4"/>',
      '<ellipse cx="70.5" cy="45" rx="3.4" ry="4.4" fill="' + skin[0] + '" stroke="' + skin[1] + '" stroke-width="1.4"/>',
      '<ellipse cx="50" cy="42" rx="21" ry="20" fill="' + skin[0] + '" stroke="' + skin[1] + '" stroke-width="1.9"/>',
      beard(o),
      hairFront(o),
      blush(50, 51.5, 0.9, 13.5),
      glasses(o),
      o.prop ? PROPS[o.prop] : '',
      eyes(50, 45, 0.9),
      smile(50, 53.5, 3.2, P.mouth)
    ].join('');
  }

  /* ---------------- the Pieces API the game expects ---------------- */

  var INK_LAYER = /<g class="(?:eyes |mood mood-[a-z]+ |mouth |mouthv mouth-[a-z]+ )?ink">[\s\S]*?<\/g>/g;
  var BOX = [-10, -14, 120, 120];

  function render(type, color, still, piece) {
    var key = who(piece), promoted = !!(piece && piece.promoted);
    var P = PALETTE[color];
    var ink = '';
    var body = person(looks(key), P, type, promoted).replace(INK_LAYER, function (m) { ink += m; return ''; });
    var frames = Pencil.layers('yc-' + key + type + color + (promoted ? '+' : ''), BOX, body, still);
    var face = '<svg class="face" viewBox="' + BOX.join(' ') + '" aria-hidden="true"><g class="look"><g>' + ink + '</g></g></svg>';
    // crown, tiara, tower, mitre or unicorn horn: its own layer, on top of the hair
    var hat = COSTUME[type](P) + (promoted ? PROPS.horn : '');
    var costume = hat ? Pencil.layers('yc-hat-' + type + color + (promoted ? '+' : ''), BOX, hat, still) : '';
    return '<span class="art' + (still ? ' still' : '') + '">' + frames + face + costume + '</span>';
  }

  /* who a piece is, for the name tag: name, then their title and role */
  function who2(piece) {
    var key = who(piece), role = ROLE_NAMES[piece.t];
    if (key.indexOf('founder') === 0) {
      return { name: piece.promoted ? 'a founder who made it' : 'a founder', about: TEAM[piece.c] + ' \u00b7 ' + role };
    }
    return { name: PEOPLE[key].name, about: PEOPLE[key].title + ' \u00b7 ' + role };
  }

  /* "Garry Tan, king" / "a founder, pawn" for labels and tooltips */
  function label(piece) {
    var key = who(piece);
    var role = ROLE_NAMES[piece.t];
    if (key.indexOf('founder') === 0) return (piece.promoted ? 'a founder who made it, ' : 'a founder, ') + role;
    return PEOPLE[key].name + ', ' + role;
  }

  global.Pieces = {
    render: render, label: label, whoIs: who2, newLineup: newLineup, PEOPLE: PEOPLE,
    NAMES: ROLE_NAMES, TEAM: TEAM, PALETTE: PALETTE
  };
})(window);
