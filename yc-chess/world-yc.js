/* The sheet around the /yc-chess board, YC-flavoured: the Golden Gate in the
   fog, "make something people want" on a ribbon, a launching rocket, ramen
   (profitable) and coffee, Demo Day, SF hills with a cable car, a hockey-stick
   dot-to-dot and a runway. Same pencil pipeline and the same World API as
   ../js/world-mount.js, which this page uses instead; each doodle takes over
   a woodland doodle's layout slot (its class), so the page still fits the
   window everywhere. */
(function (global) {
  'use strict';

  var W = global.WorldSky, L = global.WorldLand, C = W.C;
  var part = W.part, doodle = W.doodle;
  var ORANGE = '#f26625', ORANGE_LINE = '#c4501a', BRIDGE = '#e0613f', BRIDGE_LINE = '#a8402a';

  function layer(name, box, markup, cls, place) {
    return '<div class="ddp ' + (cls || '') + '" style="' + (place || 'inset:0') + '">' +
      Pencil.layers('yc-' + name, box, markup) + '</div>';
  }

  /* ---------------- the bridge, in the fog (the whale's slot) ---------------- */
  function bridge() {
    var box = [0, 0, 280, 170];
    function tower(x) {
      return '<path d="M' + (x - 7) + ',132 V22 h4 V132 M' + (x + 3) + ',132 V22 h4 V132" fill="' + BRIDGE + '" stroke="' + BRIDGE_LINE + '" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<path d="M' + (x - 7) + ',34 h14 M' + (x - 7) + ',58 h14 M' + (x - 7) + ',84 h14" stroke="' + BRIDGE_LINE + '" stroke-width="3"/>' +
        '<path d="M' + (x - 3) + ',40 q3,-4 6,0 M' + (x - 3) + ',64 q3,-4 6,0" fill="none" stroke="' + BRIDGE_LINE + '" stroke-width="1.2"/>';
    }
    var hangers = '';
    for (var x = 104; x < 196; x += 8) {
      var t = (x - 95) / 105, y = 22 + 4 * 74 * t * (1 - t) * 1;   // the cable's sag between the towers
      hangers += 'M' + x + ',' + (22 + (1 - 4 * t * (1 - t)) * 0 + 4 * t * (1 - t) * 72).toFixed(1) + ' V112 ';
    }
    var scene =
      // sea
      '<path d="M0,134 C40,130 80,138 120,134 C160,130 200,138 280,132 V170 H0 Z" fill="#dbe8f6"/>' +
      '<path d="M8,146 q10,-4 20,0 M60,152 q10,-4 20,0 M150,148 q10,-4 20,0 M220,156 q10,-4 20,0" fill="none" stroke="' + C.BLUE + '" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>' +
      // the deck and its cables
      '<path d="M0,110 H280 V118 H0 Z" fill="' + BRIDGE + '" stroke="' + BRIDGE_LINE + '" stroke-width="1.6"/>' +
      '<path d="M0,104 Q48,96 88,24 Q147,108 200,24 Q236,96 280,104" fill="none" stroke="' + BRIDGE_LINE + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="' + hangers + '" stroke="' + BRIDGE_LINE + '" stroke-width="1" opacity=".75"/>' +
      '<path d="M12,108 V104 M24,108 V100 M36,108 V96 M48,108 V90 M60,108 V80 M72,108 V64 M216,108 V64 M228,108 V80 M240,108 V90 M252,108 V96 M264,108 V100" stroke="' + BRIDGE_LINE + '" stroke-width="1" opacity=".75"/>' +
      tower(95) + tower(200) +
      '<path d="M88,132 h14 M193,132 h14" stroke="' + BRIDGE_LINE + '" stroke-width="2"/>';
    var fog = '<path d="' + 'M10,40 C2,40 2,28 12,26 C10,14 28,10 36,18 C42,6 64,6 70,18 C80,8 100,12 100,24 C112,22 120,32 112,40 Z' +
      '" fill="#f7f4ec" stroke="#9aa6c9" stroke-width="1.6" stroke-linejoin="round"/>' +
      W.closedEye(52, 28, 3.2) + W.closedEye(66, 28, 3.2) + '<path d="M56,34 q3,2 6,0" fill="none" stroke="' + C.INK + '" stroke-width="1.4" stroke-linecap="round"/>';
    var boat = '<path d="M4,22 h28 l-5,7 h-18 Z" fill="#f4e6cc" stroke="' + C.INK + '" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<path d="M18,22 V2 L30,20 Z" fill="#fdfaf1" stroke="' + C.INK + '" stroke-width="1.3" stroke-linejoin="round"/><path d="M16,20 L8,10 L16,6 Z" fill="' + ORANGE + '" stroke="' + ORANGE_LINE + '" stroke-width="1.1"/>';
    return doodle('whale yc-bridge',
      layer('bridge', box, scene) +
      layer('fog', [0, 0, 120, 44], fog, 'yc-fog', 'left:-6%;top:50%;width:46%;height:28%') +
      layer('boat', [0, 0, 36, 30], boat, 'yc-boat', 'left:62%;top:74%;width:13%;height:18%'),
      'the Golden Gate Bridge in the fog');
  }

  /* ---------------- the motto, on a ribbon (the star garland's slot) ---------------- */
  function motto() {
    var box = [0, 0, 540, 60];
    var ribbon = '<path d="M60,10 Q270,0 480,10 L480,46 Q270,36 60,46 Z" fill="#fdf3e6" stroke="' + ORANGE_LINE + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M60,16 L20,18 L36,30 L18,42 L60,40 Z M480,16 L520,18 L504,30 L522,42 L480,40 Z" fill="#fbd8bd" stroke="' + ORANGE_LINE + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M60,16 v24 M480,16 v24" stroke="' + ORANGE_LINE + '" stroke-width="1.2" opacity=".6"/>';
    return doodle('bunting yc-motto', part('yc-motto', box, ribbon) +
      '<span class="yc-text yc-motto-text">make something people want</span>', 'make something people want');
  }

  /* ---------------- a rocket lifting off (the dandelion's slot) ---------------- */
  function rocket() {
    var box = [0, 0, 120, 150];
    var body = '<path d="M60,8 C78,24 82,54 78,92 H42 C38,54 42,24 60,8 Z" fill="#fdfaf1" stroke="' + C.INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M48,28 Q60,18 72,28" fill="none" stroke="' + ORANGE + '" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="60" cy="52" r="11" fill="#cfe2f6" stroke="' + ORANGE_LINE + '" stroke-width="3"/>' +
      '<path d="M55,48 l5,6 5,-6 M60,54 v6" fill="none" stroke="' + ORANGE + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M42,72 L28,96 L44,92 Z M78,72 L92,96 L76,92 Z" fill="' + ORANGE + '" stroke="' + ORANGE_LINE + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M52,92 v6 h16 v-6" fill="#cfd5dd" stroke="' + C.INK + '" stroke-width="1.6"/>';
    var flame = '<path d="M14,0 C24,10 26,24 14,40 C2,24 4,10 14,0 Z" fill="#f6c14a" stroke="#e0613f" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M14,8 C19,14 19,22 14,30 C9,22 9,14 14,8 Z" fill="#fdf0b0"/>';
    var puff = '<circle cx="8" cy="8" r="6" fill="#f7f4ec" stroke="#9a8a78" stroke-width="1.3"/>';
    var smoke = '';
    for (var i = 0; i < 3; i++) {
      smoke += '<div class="ddp yc-smoke" style="left:' + (36 + i * 10) + '%;top:80%;width:14%;height:12%;animation-delay:' + (i * 0.5) + 's">' +
        Pencil.layers('yc-puff', [0, 0, 16, 16], puff) + '</div>';
    }
    return doodle('dandelion yc-rocket',
      smoke + '<div class="ddp yc-lift" style="inset:0">' +
      layer('flame', [0, 0, 28, 40], flame, 'yc-flame', 'left:38%;top:64%;width:24%;height:26%') +
      Pencil.layers('yc-rocket', box, body) + '</div>', 'a rocket lifting off');
  }

  /* ---------------- ramen, profitable (the left molehill's slot) ---------------- */
  function ramen() {
    var bowl = '<path d="M10,30 H90 C88,48 74,58 50,58 C26,58 12,48 10,30 Z" fill="#e3604e" stroke="#a83a2e" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M20,40 q6,-4 12,0 t12,0 t12,0 t12,0 t12,0" fill="none" stroke="#fdfaf1" stroke-width="1.6"/>' +
      '<path d="M12,30 C24,22 76,22 88,30" fill="#f6dc9a" stroke="#c99a2a" stroke-width="1.6"/>' +
      '<path d="M22,28 q4,-4 8,0 q4,-4 8,0 q4,-4 8,0 q4,-4 8,0 q4,-4 8,0" fill="none" stroke="#c99a2a" stroke-width="1.2"/>' +
      '<ellipse cx="66" cy="26" rx="7" ry="4.6" fill="#fdfaf1" stroke="' + C.INK + '" stroke-width="1.2"/><circle cx="66" cy="26" r="2.6" fill="#f6c14a"/>' +
      '<circle cx="36" cy="26" r="4.4" fill="#fdfaf1" stroke="#e98fb0" stroke-width="1.3"/>' +
      '<path d="M58,22 L92,2 M64,24 L96,8" stroke="#a9825a" stroke-width="2.4" stroke-linecap="round"/>';
    var steam = '<path d="M6,24 q-4,-6 0,-12 t0,-12 M18,24 q-4,-6 0,-12 t0,-12" fill="none" stroke="#9a8a78" stroke-width="1.6" stroke-linecap="round"/>';
    return doodle('molehill-l yc-ramen', part('yc-ramen', [0, 0, 100, 60], bowl) +
      layer('steam', [0, 0, 24, 26], steam, 'yc-steam', 'left:30%;top:-22%;width:24%;height:44%') +
      '<span class="yc-text yc-tiny" style="left:0;right:0;top:100%">ramen profitable</span>', 'a bowl of ramen: ramen profitable');
  }

  /* ---------------- late-night coffee (the right molehill's slot) ---------------- */
  function coffee() {
    var mug = '<path d="M26,14 H66 V48 C66,54 60,58 54,58 H38 C32,58 26,54 26,48 Z" fill="#fdfaf1" stroke="' + C.INK + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M66,22 C80,22 80,42 66,42" fill="none" stroke="' + C.INK + '" stroke-width="2.4"/>' +
      '<path d="M28,18 H64" stroke="#8a5a3a" stroke-width="4" opacity=".7"/>' +
      '<rect x="40" y="28" width="12" height="12" rx="2" fill="' + ORANGE + '" stroke="' + ORANGE_LINE + '" stroke-width="1"/>' +
      '<path d="M43,30.5 L46,34.5 L49,30.5 M46,34.5 V38" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="80" cy="54" rx="10" ry="4" fill="#d9b98c" stroke="#8a6a4a" stroke-width="1.3"/><circle cx="77" cy="53" r="1" fill="#5a4634"/><circle cx="83" cy="54" r="1" fill="#5a4634"/>';
    var steam = '<path d="M6,24 q-4,-6 0,-12 t0,-12 M18,24 q-4,-6 0,-12 t0,-12" fill="none" stroke="#9a8a78" stroke-width="1.6" stroke-linecap="round"/>';
    return doodle('molehill-r yc-coffee', part('yc-coffee', [0, 0, 100, 60], mug) +
      layer('steam', [0, 0, 24, 26], steam, 'yc-steam', 'left:36%;top:-34%;width:24%;height:44%'), 'a late-night coffee');
  }

  /* ---------------- Demo Day (the rainbow pond's slot) ---------------- */
  function demoDay() {
    var box = [0, 0, 300, 228];
    var stage =
      // curtains and the valance
      '<path d="M10,20 H290 V44 Q276,54 262,44 Q248,54 234,44 Q220,54 206,44 Q192,54 178,44 Q164,54 150,44 Q136,54 122,44 Q108,54 94,44 Q80,54 66,44 Q52,54 38,44 Q24,54 10,44 Z" fill="#e3604e" stroke="#a83a2e" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M10,44 C26,90 22,150 30,186 L10,186 Z M290,44 C274,90 278,150 270,186 L290,186 Z" fill="#d9504a" stroke="#a83a2e" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M20,60 C26,100 24,140 26,180 M280,60 C274,100 276,140 274,180" fill="none" stroke="#a83a2e" stroke-width="1.2" opacity=".6"/>' +
      // the stage floor
      '<path d="M10,186 H290 L280,204 H20 Z" fill="#d9b98c" stroke="#8a6a4a" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M40,195 H260" stroke="#8a6a4a" stroke-width="1" opacity=".6"/>' +
      // a podium with the Y, and a microphone
      '<path d="M128,186 V136 H172 V186 Z" fill="#f4e6cc" stroke="' + C.INK + '" stroke-width="2"/>' +
      '<path d="M122,136 H178 V128 H122 Z" fill="#e9d6b4" stroke="' + C.INK + '" stroke-width="2"/>' +
      '<rect x="141" y="146" width="18" height="18" rx="2.6" fill="' + ORANGE + '" stroke="' + ORANGE_LINE + '" stroke-width="1.4"/>' +
      '<path d="M145.5,150.5 L150,156.6 L154.5,150.5 M150,156.6 V161" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M162,128 C164,118 170,112 176,110" fill="none" stroke="' + C.INK + '" stroke-width="1.8"/><ellipse cx="178" cy="108" rx="4" ry="5" fill="#4a4a52" transform="rotate(30 178 108)"/>' +
      // the audience, from behind
      '<g fill="#cfc4b0" stroke="#8a7a6a" stroke-width="1.4">' +
      '<circle cx="46" cy="214" r="12"/><circle cx="84" cy="218" r="11"/><circle cx="120" cy="214" r="12"/><circle cx="160" cy="218" r="11"/>' +
      '<circle cx="198" cy="214" r="12"/><circle cx="236" cy="218" r="11"/><circle cx="268" cy="214" r="10"/></g>';
    var spot = '<path d="M40,0 L0,170 H80 Z" fill="#fff6c8" opacity=".55"/>';
    var clap = '<path d="M4,10 l-4,-4 M10,6 l0,-6 M16,10 l4,-4" stroke="' + ORANGE_LINE + '" stroke-width="2" stroke-linecap="round" fill="none"/>';
    var claps = '';
    [[16, 80], [44, 82], [70, 80], [86, 82]].forEach(function (p, i) {
      claps += '<div class="ddp yc-clap" style="left:' + p[0] + '%;top:' + p[1] + '%;width:6%;height:6%;animation-delay:' + (i * 0.45) + 's">' +
        Pencil.layers('yc-clap', [0, 0, 20, 12], clap) + '</div>';
    });
    return doodle('pond yc-demoday',
      '<div class="ddp yc-spot" style="left:36%;top:10%;width:28%;height:76%">' + Pencil.layers('yc-spot', [0, 0, 80, 170], spot) + '</div>' +
      part('yc-stage', box, stage) + claps +
      '<span class="yc-text yc-stage-text">demo day</span>', 'the Demo Day stage');
  }

  /* ---------------- SF hills and a cable car (the cottage hills' slot) ---------------- */
  function cableCar() {
    var box = [0, 0, 260, 80];
    var hill = '<path d="M0,78 L0,64 L250,8 L260,8 L260,78 Z" fill="#eef2e4" stroke="' + C.GREEN + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M0,58 L250,2" stroke="' + C.INK + '" stroke-width="1.2"/>' +
      // painted ladies along the slope
      '<g stroke="' + C.INK + '" stroke-width="1.3" stroke-linejoin="round">' +
      '<path d="M150,60 V40 L158,30 L166,40 V60 Z" fill="#f3c3d0"/><path d="M168,56 V36 L176,26 L184,36 V56 Z" fill="#c9dcf2"/>' +
      '<path d="M186,52 V32 L194,22 L202,32 V52 Z" fill="#f6df98"/><path d="M204,48 V28 L212,18 L220,28 V48 Z" fill="#c9e4c0"/></g>' +
      '<g fill="#fdfaf1" stroke="' + C.INK + '" stroke-width=".9"><rect x="155" y="44" width="6" height="7"/><rect x="173" y="40" width="6" height="7"/>' +
      '<rect x="191" y="36" width="6" height="7"/><rect x="209" y="32" width="6" height="7"/></g>';
    var car = '<path d="M2,26 H48 V10 H2 Z" fill="#c9504a" stroke="' + C.INK + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M0,10 H50 L46,4 H4 Z" fill="#f4e6cc" stroke="' + C.INK + '" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<rect x="7" y="13" width="8" height="7" fill="#fdf3c4" stroke="' + C.INK + '" stroke-width="1"/><rect x="21" y="13" width="8" height="7" fill="#fdf3c4" stroke="' + C.INK + '" stroke-width="1"/>' +
      '<rect x="35" y="13" width="8" height="7" fill="#fdf3c4" stroke="' + C.INK + '" stroke-width="1"/>' +
      '<path d="M25,4 V-6" stroke="' + C.INK + '" stroke-width="1.4"/><circle cx="12" cy="28" r="3" fill="#4a4a52"/><circle cx="38" cy="28" r="3" fill="#4a4a52"/>';
    return doodle('hills yc-hills', part('yc-hills', box, hill) +
      '<div class="ddp yc-cablecar" style="left:2%;top:46%;width:19%;height:42%">' + Pencil.layers('yc-car', [0, -8, 50, 40], car) + '</div>',
      'San Francisco hills with a cable car');
  }

  /* ---------------- a hockey-stick dot-to-dot (the fish's slot) ---------------- */
  var STICK = [[14, 108], [30, 110], [46, 106], [62, 108], [78, 104], [94, 104], [110, 98], [124, 90],
    [136, 78], [146, 64], [154, 50], [162, 36], [170, 24], [178, 12]];

  function hockeyStick() {
    var marks = '<path d="M6,6 V120 H196" fill="none" stroke="' + C.INK + '" stroke-width="1.4" stroke-linecap="round"/>' +
      '<path d="M2,12 L6,4 L10,12 M188,116 L196,120 L188,124" fill="none" stroke="' + C.INK + '" stroke-width="1.4" stroke-linejoin="round"/>';
    STICK.forEach(function (p, i) {
      marks += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.4" fill="' + C.INK + '"/>' +
        '<text x="' + (p[0] + (i > 7 ? -7 : 0)) + '" y="' + (p[1] - 6) + '" font-size="10" fill="' + C.INK +
        '" font-family="Comic Sans MS, cursive" text-anchor="middle">' + (i + 1) + '</text>';
    });
    return doodle('dots yc-growth', part('yc-growth', [0, 0, 200, 130], marks) +
      '<svg class="ddface dots-lines" viewBox="0 0 200 130" style="inset:0" aria-hidden="true"></svg>' +
      '<span class="yc-text yc-tiny" style="left:6%;top:100%">growth</span>',
      'a dot-to-dot that draws a hockey-stick growth curve as the game goes on');
  }

  /* ---------------- the runway (the garden's slot) ---------------- */
  function runway() {
    var strip = '<path d="M2,84 L318,84 L318,100 L2,100 Z" fill="#dcd6cc" stroke="#8a7a6a" stroke-width="1.6"/>' +
      '<path d="M12,92 H308" stroke="#fdfaf1" stroke-width="2.4" stroke-dasharray="12 10"/>' +
      '<path d="M290,84 V40" stroke="#8a6a4a" stroke-width="2"/>' +
      '<g stroke="' + C.GREEN + '" stroke-width="1.2" fill="none"><path d="M8,84 l1,-6 M12,84 l3,-7 M100,84 l1,-6 M200,84 l1,-6 M204,84 l2,-6"/></g>';
    var sock = '<path d="M0,4 L28,8 L26,18 L0,22 Z" fill="' + ORANGE + '" stroke="' + ORANGE_LINE + '" stroke-width="1.3" stroke-linejoin="round"/>' +
      '<path d="M9,6 V20 M18,7 V19" stroke="#fdfaf1" stroke-width="3"/>';
    var plane = '<path d="M2,16 L44,10 L30,16 L44,22 Z" fill="#fdfaf1" stroke="' + C.INK + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M30,16 L2,16" stroke="' + C.INK + '" stroke-width="1"/>' + W.closedEye(36, 14.5, 1.6);
    return doodle('garden yc-runway', part('yc-runway', [0, 0, 320, 104], strip) +
      '<div class="ddp yc-sock" style="left:90.5%;top:36%;width:9%;height:22%">' + Pencil.layers('yc-sock', [0, 0, 30, 24], sock) + '</div>' +
      '<div class="ddp yc-plane" style="width:15%;height:30%;top:56%">' + Pencil.layers('yc-plane', [0, 0, 46, 26], plane) + '</div>' +
      '<span class="yc-text yc-tiny" style="left:2%;top:100%">runway</span>',
      'a runway with a paper plane that taxis further every move');
  }

  /* ---------------- the hand-drawn controls (as on the woodland sheet) ---------------- */
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

  var sheet, sunEl, sunTimer = 0;

  /* the plane taxis a little further every move and lifts off late in the
     game; the growth curve joins one dot per move */
  function progress(plies) {
    var plane = sheet.querySelector('.yc-plane');
    if (plane) {
      var t = Math.min(1, plies / 80);
      plane.style.left = (2 + 70 * t) + '%';
      plane.classList.toggle('airborne', t >= 1);
    }
    var lines = sheet.querySelector('.yc-growth .dots-lines');
    if (!lines) return;
    var joined = Math.min(STICK.length - 1, Math.floor(plies / 2)), out = '';
    for (var i = 0; i < joined; i++) {
      out += '<path d="M' + STICK[i][0] + ',' + STICK[i][1] + ' L' + STICK[i + 1][0] + ',' + STICK[i + 1][1] + '"/>';
    }
    if (joined === STICK.length - 1) out += '<path d="M171,10 L178,2 L183,12"/>';
    lines.innerHTML = '<g fill="none" stroke="' + ORANGE + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" filter="url(#pencil)">' + out + '</g>';
  }

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
      b.classList.toggle('on', Number(b.dataset.level) <= level);
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
    document.getElementById('sky').innerHTML = W.sun() + motto() + W.moon();
    document.getElementById('above').innerHTML = bridge() + W.cloud('cloud-r', true) + hockeyStick() + rocket() + L.cloudy();
    document.getElementById('below').innerHTML =
      '<div class="dock">' + L.chick().replace('new<br>game', 'new<br>batch').replace('aria-label="new game"', 'aria-label="new batch: start a new game"') +
      controls() + '</div>' +
      L.note('note-l', 'acquired') + L.note('note-r', 'weekly update') +
      demoDay() + runway() + cableCar() + ramen() + coffee();
    sunEl = sheet.querySelector('.dd-sun');

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
