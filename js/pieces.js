/* Hand-drawn creature pieces, one inline SVG per piece. viewBox is 0 0 100 100.
   Everything except the eyes and mouths is coloured through the #pencil filter
   defined in index.html, so fills come out grainy like coloured pencil on
   paper; the eyes stay crisp, as if inked in afterwards. */
(function (global) {
  'use strict';

  var PALETTE = {
    w: {
      line: '#bf6935', mouth: '#8c4524',
      body: '#f4c995', mid: '#eca461', dark: '#d9853f', pale: '#fcebd0', belly: '#faeacb',
      cap: '#e3604e', capDark: '#b5433a', spot: '#fde7dd',
      gold: '#f0c24f', goldLine: '#c8922d',
      leaf: '#98c27a', leafDark: '#5f8c45',
      hood: '#d99556', hoodDark: '#9c5d2c',
      tuft: '#f3b84e', hoof: '#a8542c',
      owl: '#ecd0a2', owlDark: '#d6a86f', wing: '#c0915e',
      bee: '#f8da6f', beeDark: '#efbb42', stripe: '#7b4a22',
      bug: '#fcefbd', bugDark: '#f1c662'
    },
    b: {
      line: '#2a2665', mouth: '#1f1c45',
      body: '#8d88d8', mid: '#6d67c7', dark: '#4d48a5', pale: '#c4c0f0', belly: '#bcd0f0',
      navy: '#3b4392', navyDark: '#262c6c',
      cap: '#6d67c7', capDark: '#4d48a5', spot: '#c4c0f0',
      gold: '#f0c24f', goldLine: '#c8922d',
      leaf: '#8d88d8', leafDark: '#4d48a5',
      hood: '#4d48a5', hoodDark: '#2a2665',
      tuft: '#4d48a5', hoof: '#2a2665',
      owl: '#8d88d8', owlDark: '#6d67c7', wing: '#4d48a5',
      bee: '#8d88d8', beeDark: '#6d67c7', stripe: '#2a2665',
      bug: '#a9a5e6', bugDark: '#7a75cc'
    }
  };

  var INK = '#232032';
  var BLUSH = '#ee8c9c';
  var uid = 0;

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

  var SHAPES = {};

  /* ---- Pawn: toadstool (cream) / little bell (purple) ----------------- */
  SHAPES.p = function (P, color, id) {
    var g = 'pg' + id;
    if (color === 'w') {
      return [
        grad(g, P.pale, P.mid),
        ground(P),
        '<ellipse cx="40" cy="92" rx="6" ry="3.4" fill="' + P.mid + '" stroke="' + P.line + '" stroke-width="1.8"/>',
        '<ellipse cx="60" cy="92" rx="6" ry="3.4" fill="' + P.mid + '" stroke="' + P.line + '" stroke-width="1.8"/>',
        '<ellipse cx="27" cy="79" rx="4.2" ry="6.2" fill="' + P.mid + '" stroke="' + P.line + '" stroke-width="1.8" transform="rotate(32 27 79)"/>',
        '<ellipse cx="73" cy="79" rx="4.2" ry="6.2" fill="' + P.mid + '" stroke="' + P.line + '" stroke-width="1.8" transform="rotate(-32 73 79)"/>',
        // round potato body tucked under the cap
        '<path d="M50,50 C66,50 74,62 73,75 C72,87 62,93 50,93 C38,93 28,87 27,75 C26,62 34,50 50,50 Z" fill="url(#' + g + ')" stroke="' + P.line + '" stroke-width="2.2"/>',
        shine(39, 64, 4.5, 8, -20),
        // the pale underside of the cap
        '<path d="M22,51 Q50,61 78,51 L76,56 Q50,64 24,56 Z" fill="' + P.pale + '" stroke="' + P.line + '" stroke-width="1.5" stroke-linejoin="round"/>',
        '<path d="M16,51 C16,30 31,19 50,19 C69,19 84,30 84,51 C66,58 34,58 16,51 Z" fill="' + P.cap + '" stroke="' + P.capDark + '" stroke-width="2.3" stroke-linejoin="round"/>',
        spot(33, 35, 5.4, 4.2, P.spot),
        spot(52, 27, 4.4, 3.4, P.spot),
        spot(67, 38, 4.8, 3.7, P.spot),
        spot(44, 45, 3.4, 2.6, P.spot),
        spot(24, 45, 2.8, 2.1, P.spot),
        spot(76, 47, 2.6, 2, P.spot),
        spot(59, 49, 2.4, 1.8, P.spot),
        shine(30, 30, 4, 7, -40),
        blush(50, 79, 1, 15),
        eyes(50, 70, 1.05),
        smile(50, 79, 3.3, P.mouth)
      ].join('');
    }
    return [
      grad(g, P.body, P.dark),
      ground(P),
      // a gold star on a little stalk, like an antenna
      '<path d="M50,39 V27" stroke="' + P.line + '" stroke-width="1.7" stroke-linecap="round"/>',
      star(50, 22, 6.2, P.gold, P.goldLine),
      '<path d="M23,88 C22,62 31,38 50,38 C69,38 78,62 77,88 Q50,94 23,88 Z" fill="url(#' + g + ')" stroke="' + P.line + '" stroke-width="2.3" stroke-linejoin="round"/>',
      shine(37, 53, 4.5, 10, -25),
      blush(50, 72, 1, 16),
      eyes(50, 63, 1.05),
      smile(50, 72, 3.3, P.mouth)
    ].join('');
  };

  /* ---- Rook: tree-stump castle (cream) / crystal-crowned berry ------- */
  SHAPES.r = function (P, color, id) {
    var g = 'rg' + id;
    if (color === 'w') {
      return [
        grad(g, P.body, P.mid),
        ground(P),
        // walls that flare into little roots at the bottom
        '<path d="M30,42 C29,60 27,75 21,87 Q24,93 31,91 Q35,95 42,92 Q50,96 58,92 Q65,95 69,91 Q76,93 79,87 C73,75 71,60 70,42 Z" fill="url(#' + g + ')" stroke="' + P.line + '" stroke-width="2.3" stroke-linejoin="round"/>',
        shine(38, 62, 4.5, 12, -6),
        '<path d="M35,48 q-2,16 -1,30 M65,50 q2,14 1,26" fill="none" stroke="' + P.line + '" stroke-width="1.2" opacity=".35"/>',
        // battlements
        '<path d="M26,43 V27 H36 V34 H45 V27 H55 V34 H64 V27 H74 V43 Q50,47 26,43 Z" fill="' + P.body + '" stroke="' + P.line + '" stroke-width="2.3" stroke-linejoin="round"/>',
        '<path d="M27,37 H73" stroke="' + P.line + '" stroke-width="1.2" opacity=".3"/>',
        // a knot in the wood
        '<path d="M36,83 a3.4,3.4 0 1,1 3.4,3 a1.6,1.6 0 1,1 -1.4,-1.8" fill="none" stroke="' + P.line + '" stroke-width="1.4" stroke-linecap="round"/>',
        // sprout
        '<path d="M68,27 q0,-5 -1,-9" fill="none" stroke="' + P.leafDark + '" stroke-width="1.8" stroke-linecap="round"/>',
        '<path d="M67,19 q-8,-5 -12,1 q7,4 12,-1 Z" fill="' + P.leaf + '" stroke="' + P.leafDark + '" stroke-width="1.3" stroke-linejoin="round"/>',
        '<path d="M67,19 q6,-7 12,-3 q-5,6 -12,3 Z" fill="' + P.leaf + '" stroke="' + P.leafDark + '" stroke-width="1.3" stroke-linejoin="round"/>',
        blush(50, 68, 1, 15),
        eyes(50, 59, 1),
        smile(50, 68, 3, P.mouth)
      ].join('');
    }
    var shard = function (x, y, w, h, tilt) {
      return '<g transform="rotate(' + tilt + ' ' + x + ' ' + (y + h) + ')">' +
        '<path d="M' + (x - w) + ',' + (y + h) + ' L' + (x - w) + ',' + (y + h * 0.42) +
        ' L' + x + ',' + y + ' L' + (x + w) + ',' + (y + h * 0.42) +
        ' L' + (x + w) + ',' + (y + h) + ' Z" fill="' + P.pale + '" stroke="' + P.line +
        '" stroke-width="1.7" stroke-linejoin="round"/>' +
        '<path d="M' + x + ',' + y + ' V' + (y + h) + '" stroke="' + P.mid + '" stroke-width="1.3" opacity=".6"/></g>';
    };
    return [
      grad(g, P.mid, P.dark),
      ground(P),
      shard(27, 20, 5, 22, -16),
      shard(38, 12, 5.5, 30, -7),
      shard(50, 8, 6, 34, 0),
      shard(62, 12, 5.5, 30, 7),
      shard(73, 20, 5, 22, 16),
      '<path d="M18,14 l1.2,3.2 3.2,1.2 -3.2,1.2 -1.2,3.2 -1.2,-3.2 -3.2,-1.2 3.2,-1.2 Z" fill="' + P.gold + '"/>',
      '<path d="M21,64 C21,46 33,38 50,38 C67,38 79,46 79,64 C79,82 67,91 50,91 C33,91 21,82 21,64 Z" fill="url(#' + g + ')" stroke="' + P.line + '" stroke-width="2.4"/>',
      shine(35, 50, 5, 9, -35),
      blush(50, 72, 1, 18),
      eyes(50, 62, 1.1)
    ].join('');
  };

  /* ---- Knight: a pony; cream ones face right, twilight ones carry arrows */
  SHAPES.n = function (P, color, id) {
    var g = 'ng' + id;
    var twilight = color === 'b';
    return [
      grad(g, P.body, P.mid),
      ground(P),
      twilight ? [
        '<path d="M34,52 L22,30" stroke="' + P.hoodDark + '" stroke-width="7.5" stroke-linecap="round"/>',
        '<path d="M24,31 L18,18 M28,30 L24,16 M31,32 L30,18" stroke="' + P.line + '" stroke-width="1.6" stroke-linecap="round"/>',
        '<path d="M16,19 l1,-5 l3,4 Z M22,17 l2,-5 l2,5 Z M28,19 l2,-5 l2,5 Z" fill="' + P.gold + '" stroke="' + P.goldLine + '" stroke-width="1" stroke-linejoin="round"/>'
      ].join('') : '',
      // spiky tail
      '<path d="M26,56 L10,45 L15,55 L4,59 L15,64 L8,74 L23,67 L28,63 Z" fill="' + P.tuft + '" stroke="' + P.line + '" stroke-width="1.8" stroke-linejoin="round"/>',
      // far legs, then near legs, then hooves
      '<rect x="35" y="66" width="8" height="25" rx="4" fill="' + P.dark + '" stroke="' + P.line + '" stroke-width="1.6"/>',
      '<rect x="57" y="66" width="8" height="25" rx="4" fill="' + P.dark + '" stroke="' + P.line + '" stroke-width="1.6"/>',
      '<rect x="27" y="66" width="8.5" height="26" rx="4" fill="' + P.mid + '" stroke="' + P.line + '" stroke-width="1.8"/>',
      '<rect x="49" y="66" width="8.5" height="26" rx="4" fill="' + P.mid + '" stroke="' + P.line + '" stroke-width="1.8"/>',
      '<ellipse cx="31" cy="91" rx="4.6" ry="2.6" fill="' + P.hoof + '"/><ellipse cx="53" cy="91" rx="4.6" ry="2.6" fill="' + P.hoof + '"/>',
      '<ellipse cx="39" cy="90" rx="4.2" ry="2.4" fill="' + P.hoof + '"/><ellipse cx="61" cy="90" rx="4.2" ry="2.4" fill="' + P.hoof + '"/>',
      // barrel, neck, head
      '<ellipse cx="45" cy="62" rx="23" ry="14" fill="url(#' + g + ')" stroke="' + P.line + '" stroke-width="2.2"/>',
      shine(36, 56, 6, 4, -10),
      '<path d="M55,57 C56,44 60,36 66,31 L78,38 C73,46 69,53 66,60 Z" fill="' + P.body + '" stroke="' + P.line + '" stroke-width="2.2" stroke-linejoin="round"/>',
      '<path d="M60,30 C60,19 70,13 79,15 C88,17 93,26 92,35 C91,43 84,47 76,46 C67,45 60,40 60,30 Z" fill="' + P.body + '" stroke="' + P.line + '" stroke-width="2.2"/>',
      '<ellipse cx="86" cy="38" rx="6.4" ry="5.2" fill="' + P.pale + '" opacity=".7"/>',
      '<circle cx="88.5" cy="36.5" r="1.1" fill="' + P.line + '"/>',
      '<path d="M64,20 L61,8 L71,15 Z" fill="' + P.mid + '" stroke="' + P.line + '" stroke-width="1.8" stroke-linejoin="round"/>',
      '<path d="M73,15 L75,4 L81,14 Z" fill="' + P.mid + '" stroke="' + P.line + '" stroke-width="1.8" stroke-linejoin="round"/>',
      // mane: a row of pointed tufts down the neck
      '<path d="M63,18 L52,13 L58,25 Z M60,27 L48,24 L55,34 Z M57,36 L45,35 L53,44 Z M55,45 L44,47 L53,53 Z" fill="' + P.tuft + '" stroke="' + P.line + '" stroke-width="1.6" stroke-linejoin="round"/>',
      twilight ? '<path d="M64,30 q7,10 18,12" fill="none" stroke="' + P.gold + '" stroke-width="1.6" opacity=".9"/>' + star(66, 37, 5, P.gold, P.goldLine) : '',
      '<ellipse cx="74" cy="39" rx="4.6" ry="2.7" fill="' + BLUSH + '" opacity=".6"/>',
      '<g class="eyes ink"><ellipse cx="76" cy="28" rx="5" ry="5.8" fill="' + INK + '"/>' +
        '<circle cx="77.8" cy="25.8" r="1.9" fill="#fff"/><circle cx="74.6" cy="30.6" r=".9" fill="#fff" opacity=".75"/></g>',
      eyeMoods([{ x: 76, y: 28, k: 0 }], 5, 5.8, 1),
      '<g class="ink"><path d="M83,43 q3.4,1.8 6.6,-.4" fill="none" stroke="' + P.mouth + '" stroke-width="1.6" stroke-linecap="round"/></g>'
    ].join('');
  };

  /* ---- Bishop: leaf beetle (cream) / turret-hatted herald (purple) ---- */
  SHAPES.b = function (P, color, id) {
    var g = 'bg' + id;
    if (color === 'w') {
      return [
        grad(g, P.bug, P.bugDark),
        ground(P),
        // long antennae, curling out from behind the leaf
        '<path d="M46,40 C40,28 32,18 21,15" fill="none" stroke="' + P.hoodDark + '" stroke-width="1.7" stroke-linecap="round"/>',
        '<path d="M54,40 C60,28 68,18 79,15" fill="none" stroke="' + P.hoodDark + '" stroke-width="1.7" stroke-linecap="round"/>',
        '<circle cx="20" cy="15" r="2.8" fill="' + P.hoodDark + '"/><circle cx="80" cy="15" r="2.8" fill="' + P.hoodDark + '"/>',
        // the dry leaf it wears like a cloak
        '<path d="M50,10 C67,22 74,44 63,62 Q50,70 37,62 C26,44 33,22 50,10 Z" fill="' + P.hood + '" stroke="' + P.hoodDark + '" stroke-width="2.2" stroke-linejoin="round"/>',
        '<path d="M50,13 V64" stroke="' + P.hoodDark + '" stroke-width="1.6" opacity=".8"/>',
        '<path d="M50,24 l7,-4 M50,33 l9,-5 M50,42 l10,-4 M50,51 l9,-3 M50,24 l-7,-4 M50,33 l-9,-5 M50,42 l-10,-4 M50,51 l-9,-3" fill="none" stroke="' + P.hoodDark + '" stroke-width="1.2" opacity=".6"/>',
        shine(42, 30, 3, 8, -20),
        // little legs and the egg-shaped body
        '<path d="M40,88 l-4,6 M60,88 l4,6" stroke="' + P.mid + '" stroke-width="3.2" stroke-linecap="round"/>',
        '<path d="M50,46 C64,46 72,60 71,74 C70,86 61,92 50,92 C39,92 30,86 29,74 C28,60 36,46 50,46 Z" fill="url(#' + g + ')" stroke="' + P.line + '" stroke-width="2.2"/>',
        shine(40, 60, 4, 8, -20),
        '<circle cx="44" cy="85" r="1" fill="' + P.line + '"/><circle cx="50" cy="87" r="1" fill="' + P.line + '"/><circle cx="56" cy="85" r="1" fill="' + P.line + '"/>',
        blush(50, 74, 1, 14),
        eyes(50, 65, 1),
        smile(50, 74, 3.2, P.mouth)
      ].join('');
    }
    var clip = 'bc' + id;
    return [
      grad(g, P.mid, P.dark),
      ground(P),
      '<defs><clipPath id="' + clip + '"><path d="M30,92 L36,52 H64 L70,92 Z"/></clipPath></defs>',
      '<path d="M30,92 L36,52 H64 L70,92 q-20,4 -40,0 Z" fill="url(#' + g + ')" stroke="' + P.line + '" stroke-width="2.4" stroke-linejoin="round"/>',
      '<g clip-path="url(#' + clip + ')">' +
        '<path d="M22,52 L8,92 M38,52 L24,92 M54,52 L40,92 M70,52 L56,92 M86,52 L72,92" stroke="' + P.pale + '" stroke-width="6" opacity=".5"/></g>',
      '<path d="M30,92 L36,52 H64 L70,92 q-20,4 -40,0 Z" fill="none" stroke="' + P.line + '" stroke-width="2.4" stroke-linejoin="round"/>',
      // turret hat: band, ribbed tower, domed roof, pennant
      '<rect x="34" y="44" width="32" height="9" rx="3" fill="' + P.gold + '" stroke="' + P.goldLine + '" stroke-width="1.6"/>',
      '<path d="M37,44 V30 H63 V44 Z" fill="' + P.pale + '" stroke="' + P.line + '" stroke-width="2.1" stroke-linejoin="round"/>',
      '<path d="M43,44 V30 M50,44 V30 M57,44 V30" stroke="' + P.mid + '" stroke-width="1.6" opacity=".55"/>',
      '<path d="M34,30 q16,-16 32,0 Z" fill="' + P.dark + '" stroke="' + P.line + '" stroke-width="2.1" stroke-linejoin="round"/>',
      '<path d="M50,20 V10" stroke="' + P.line + '" stroke-width="1.8" stroke-linecap="round"/>',
      '<path d="M50,10 l9,3 -9,3 Z" fill="#c9506a" stroke="' + P.line + '" stroke-width="1.3" stroke-linejoin="round"/>',
      blush(50, 75, 0.84, 15),
      eyes(50, 67, 0.88)
    ].join('');
  };

  /* ---- Queen: honeybee (cream) / crested songbird with a blade ------- */
  SHAPES.q = function (P, color, id) {
    var g = 'qg' + id;
    if (color === 'w') {
      var clip = 'qc' + id;
      var body = 'M50,30 C66,30 72,48 72,62 C72,80 63,92 50,92 C37,92 28,80 28,62 C28,48 34,30 50,30 Z';
      return [
        grad(g, P.bee, P.beeDark),
        ground(P),
        '<ellipse cx="26" cy="46" rx="10.5" ry="16" fill="#e2f0f7" stroke="#8fb2c8" stroke-width="1.7" opacity=".9" transform="rotate(-30 26 46)"/>',
        '<ellipse cx="74" cy="46" rx="10.5" ry="16" fill="#e2f0f7" stroke="#8fb2c8" stroke-width="1.7" opacity=".9" transform="rotate(30 74 46)"/>',
        '<ellipse cx="29" cy="62" rx="7.5" ry="11" fill="#e2f0f7" stroke="#8fb2c8" stroke-width="1.5" opacity=".8" transform="rotate(-52 29 62)"/>',
        '<ellipse cx="71" cy="62" rx="7.5" ry="11" fill="#e2f0f7" stroke="#8fb2c8" stroke-width="1.5" opacity=".8" transform="rotate(52 71 62)"/>',
        // honey dipper
        '<path d="M68,64 q10,-4 13,-15" fill="none" stroke="' + P.line + '" stroke-width="2.2" stroke-linecap="round"/>',
        '<ellipse cx="83" cy="44" rx="5.2" ry="6" fill="' + P.gold + '" stroke="' + P.goldLine + '" stroke-width="1.6"/>',
        '<path d="M78,42 h10 M78,45.5 h10" stroke="' + P.goldLine + '" stroke-width="1" opacity=".8"/>',
        '<path d="M84,50 q2,4 0,6" fill="none" stroke="' + P.gold + '" stroke-width="2" stroke-linecap="round"/>',
        '<path d="M42,90 l-3,5 M58,90 l3,5" stroke="' + P.stripe + '" stroke-width="2.4" stroke-linecap="round"/>',
        '<defs><clipPath id="' + clip + '"><path d="' + body + '"/></clipPath></defs>',
        '<path d="' + body + '" fill="url(#' + g + ')"/>',
        '<g clip-path="url(#' + clip + ')"><path d="M26,69 H74 M26,78 H74 M26,87 H74" stroke="' + P.stripe + '" stroke-width="5.6" opacity=".9"/></g>',
        '<path d="' + body + '" fill="none" stroke="' + P.line + '" stroke-width="2.2"/>',
        shine(40, 44, 4.5, 8, -30),
        crown(50, 18, 24, P, false),
        blush(50, 59, 1, 15),
        eyes(50, 50, 1),
        smile(50, 59, 3, P.mouth)
      ].join('');
    }
    var spikes = '';
    [[34, 20], [42, 13], [50, 9], [58, 13], [66, 20]].forEach(function (s) {
      spikes += '<path d="M' + s[0] + ',32 L' + s[0] + ',' + s[1] + '" stroke="' + P.gold +
        '" stroke-width="2.6" stroke-linecap="round"/>' +
        '<circle cx="' + s[0] + '" cy="' + (s[1] - 2) + '" r="3" fill="' + P.pale +
        '" stroke="' + P.line + '" stroke-width="1.3"/>';
    });
    return [
      grad(g, P.body, P.dark),
      ground(P),
      '<path d="M72,56 l18,16 q3,4 -1,5 q-4,1 -7,-2 L68,62 Z" fill="#a6c8ec" stroke="' + P.line + '" stroke-width="1.8" stroke-linejoin="round"/>',
      '<path d="M30,82 q-16,2 -22,-6 q11,-8 23,-5 Z" fill="' + P.dark + '" stroke="' + P.line + '" stroke-width="1.9" stroke-linejoin="round"/>',
      '<path d="M12,77 q9,0 16,2 M11,80 q9,-1 17,0" fill="none" stroke="' + P.line + '" stroke-width="1.1" opacity=".55"/>',
      '<path d="M50,92 q-20,-5 -22,-28 q-2,-26 22,-30 q24,4 22,30 q-2,23 -22,28 Z" fill="url(#' + g + ')" stroke="' + P.line + '" stroke-width="2.4" stroke-linejoin="round"/>',
      '<ellipse cx="50" cy="73" rx="12" ry="15" fill="' + P.pale + '" opacity=".45"/>',
      shine(38, 48, 5, 11, -25),
      '<path d="M58,50 q15,8 13,24 q-11,4 -17,-10 Z" fill="' + P.dark + '" stroke="' + P.line + '" stroke-width="1.9" stroke-linejoin="round"/>',
      '<path d="M60,54 q8,6 8,16 M57,58 q8,6 8,14" fill="none" stroke="' + P.pale + '" stroke-width="1.5" opacity=".6"/>',
      '<path d="M44,92 q-4,4 -9,4 M56,92 q4,4 9,4" fill="none" stroke="' + P.gold + '" stroke-width="2.6" stroke-linecap="round"/>',
      spikes,
      '<path d="M32,34 q18,-7 36,0 l-2,7 q-16,-6 -32,0 Z" fill="' + P.gold + '" stroke="' + P.goldLine + '" stroke-width="1.6" stroke-linejoin="round"/>',
      '<path d="M45,57 l5,7 5,-7 Z" fill="' + P.gold + '" stroke="' + P.goldLine + '" stroke-width="1.4" stroke-linejoin="round"/>',
      blush(50, 57, 0.9, 16),
      eyes(50, 50, 0.9)
    ].join('');
  };

  /* ---- King: deadpan owl (cream) / round navy penguin (purple) -------- */
  SHAPES.k = function (P, color, id) {
    var g = 'kg' + id;
    if (color === 'w') {
      return [
        grad(g, P.owl, P.owlDark),
        ground(P),
        '<ellipse cx="40" cy="93" rx="7" ry="3.6" fill="' + P.mid + '" stroke="' + P.line + '" stroke-width="1.8"/>',
        '<ellipse cx="60" cy="93" rx="7" ry="3.6" fill="' + P.mid + '" stroke="' + P.line + '" stroke-width="1.8"/>',
        // wings tucked at the sides
        '<path d="M27,56 C17,64 17,80 24,88 C29,84 31,70 29,58 Z" fill="' + P.wing + '" stroke="' + P.line + '" stroke-width="1.9" stroke-linejoin="round"/>',
        '<path d="M73,56 C83,64 83,80 76,88 C71,84 69,70 71,58 Z" fill="' + P.wing + '" stroke="' + P.line + '" stroke-width="1.9" stroke-linejoin="round"/>',
        // ear tufts
        '<path d="M30,42 L26,24 L41,33 Z" fill="' + P.wing + '" stroke="' + P.line + '" stroke-width="2" stroke-linejoin="round"/>',
        '<path d="M70,42 L74,24 L59,33 Z" fill="' + P.wing + '" stroke="' + P.line + '" stroke-width="2" stroke-linejoin="round"/>',
        '<path d="M50,28 C70,28 76,44 76,62 C76,82 66,92 50,92 C34,92 24,82 24,62 C24,44 30,28 50,28 Z" fill="url(#' + g + ')" stroke="' + P.line + '" stroke-width="2.3"/>',
        // pale face disc
        '<path d="M50,41 C56,35 70,35 72,45 C74,57 64,64 50,62 C36,64 26,57 28,45 C30,35 44,35 50,41 Z" fill="' + P.pale + '" stroke="' + P.line + '" stroke-width="1.5"/>',
        // chest feathers
        '<path d="M35,70 l3,3 3,-3 M43,70 l3,3 3,-3 M51,70 l3,3 3,-3 M59,70 l3,3 3,-3 M39,77 l3,3 3,-3 M47,77 l3,3 3,-3 M55,77 l3,3 3,-3 M43,84 l3,3 3,-3 M51,84 l3,3 3,-3" fill="none" stroke="' + P.line + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
        shine(34, 44, 3, 7, -30),
        blush(50, 59, 1, 18),
        '<path d="M46,55 L54,55 L50,63 Z" fill="#ec9a45" stroke="' + P.line + '" stroke-width="1.5" stroke-linejoin="round"/>',
        sleepyEyes(50, 50, 1, P.pale),
        crown(50, 16, 26, P, true, true)
      ].join('');
    }
    return [
      grad(g, P.navy, P.navyDark),
      ground(P),
      '<path d="M40,88 q-5,6 -12,6 M60,88 q5,6 12,6" fill="none" stroke="' + P.gold + '" stroke-width="3.2" stroke-linecap="round"/>',
      '<path d="M24,50 q-10,12 -7,26 q8,2 11,-9 Z" fill="' + P.navyDark + '" stroke="' + P.line + '" stroke-width="1.9" stroke-linejoin="round"/>',
      '<path d="M76,50 q10,12 7,26 q-8,2 -11,-9 Z" fill="' + P.navyDark + '" stroke="' + P.line + '" stroke-width="1.9" stroke-linejoin="round"/>',
      '<path d="M50,24 C70,24 77,42 77,58 C77,78 66,91 50,91 C34,91 23,78 23,58 C23,42 30,24 50,24 Z" fill="url(#' + g + ')" stroke="' + P.line + '" stroke-width="2.4"/>',
      // a pale scallop shell across the front
      '<path d="M34,88 Q32,66 50,62 Q68,66 66,88 Q50,92 34,88 Z" fill="' + P.belly + '" stroke="' + P.line + '" stroke-width="1.5" stroke-linejoin="round"/>',
      '<path d="M50,64 V89 M43,66 L40,88 M57,66 L60,88 M37,72 L35,86 M63,72 L65,86" fill="none" stroke="' + P.mid + '" stroke-width="1.3" opacity=".8"/>',
      shine(36, 38, 5, 10, -28),
      blush(50, 56, 1, 19),
      eyes(50, 46, 1.1),
      smile(50, 55, 3.4, '#f3eefe'),
      crown(50, 12, 24, P, true)
    ].join('');
  };

  /* pulled out of the pencilled layer so eyes and mouths stay crisp */
  var INK_LAYER = /<g class="(?:eyes |mood mood-[a-z]+ |mouth |mouthv mouth-[a-z]+ )?ink">[\s\S]*?<\/g>/g;

  /* Drawn in a box a little bigger than the 100-unit square so crowns, tails
     and the ground scribble don't get clipped once the body is baked. */
  var BOX = [-10, -14, 120, 120];

  /* A piece is two layers: the pencilled body, baked into boiling frames, and
     an inked face drawn live on top so it can blink, look about and pull
     faces. `still` gives one quiet frame, for small places like the tray. */
  function render(type, color, still) {
    var P = PALETTE[color];
    uid += 1;
    var ink = '';
    var body = SHAPES[type](P, color, uid).replace(INK_LAYER, function (m) { ink += m; return ''; });
    // the twilight ponies face left; the toadstool ponies face right
    var turn = type === 'n' && color === 'b' ? ' transform="translate(100,0) scale(-1,1)"' : '';
    var frames = Pencil.layers(type + color, BOX, '<g' + turn + '>' + stripIds(body) + '</g>', still);
    return '<span class="art' + (still ? ' still' : '') + '">' + frames +
      '<svg class="face" viewBox="' + BOX.join(' ') + '" aria-hidden="true"><g class="look"><g' + turn + '>' + ink + '</g></g></svg></span>';
  }

  /* A baked image is its own document, so the per-piece ids that kept
     gradients apart on the page can go back to one fixed name. */
  function stripIds(markup) {
    return markup.replace(/(id="|url\(#)([a-z]+)\d+/g, '$1$2');
  }

  var NAMES = { p: 'pawn', r: 'rook', n: 'knight', b: 'bishop', q: 'queen', k: 'king' };
  var TEAM = { w: 'Toadstool', b: 'Twilight' };

  global.Pieces = { render: render, NAMES: NAMES, TEAM: TEAM, PALETTE: PALETTE };
})(window);
