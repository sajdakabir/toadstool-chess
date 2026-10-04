/* Board UI: selection, moves, AI turn, history, promotion, sounds. */
(function () {
  'use strict';

  var E = window.Engine, AI = window.AI, P = window.Pieces, M = window.Marks, World = window.World;

  World.mount(document.getElementById('sheet'));

  var boardEl = document.getElementById('board');
  var ranksEl = document.getElementById('ranks');
  var filesEl = document.getElementById('files');
  var captionEl = document.getElementById('caption');
  var promoEl = document.getElementById('promo');
  var promoChoices = document.getElementById('promo-choices');
  var level = 3;   // opponent strength, 1-5 stars
  var boardWrap = document.getElementById('board-wrap');
  var trailEl = null;

  var state, history, selected, legal, lastMove, lastMover, playerColor, flipped, thinking, soundOn, pendingPromo;
  var aiTimer = null, gameId = 0;

  var VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  var INK = '#232032';   // what the pieces' pupils are drawn in

  /* ---------------- the paper ---------------- */

  /* A tiny seeded random, so the scribbles come out the same on every load. */
  function scribbler(seed) {
    return function () {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
  }

  /* Green crayon hatching for the dark squares: strokes leaning like ////,
     uneven in length, weight and pressure. A handful of tiles are drawn once
     and shared out, so neighbouring squares never look stamped. */
  var HATCH = (function () {
    var rnd = scribbler(7);
    var greens = ['#93b97c', '#86ae6f', '#a5c68d', '#7aa363'];
    var tiles = [];
    for (var t = 0; t < 6; t++) {
      var strokes = '';
      for (var i = 0; i < 112; i++) {
        var x = rnd() * 106 - 3, y = rnd() * 106 - 3;
        var len = 9 + rnd() * 20;
        var ang = (-63 + (rnd() - 0.5) * 12) * Math.PI / 180;
        var dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2;
        var bow = (rnd() - 0.5) * 4;
        strokes += '<path d="M' + (x - dx).toFixed(1) + ' ' + (y - dy).toFixed(1) +
          ' q' + (dx + bow).toFixed(1) + ' ' + (dy + bow).toFixed(1) + ' ' +
          (2 * dx).toFixed(1) + ' ' + (2 * dy).toFixed(1) +
          '" stroke="' + greens[Math.floor(rnd() * greens.length)] +
          '" stroke-width="' + (1.2 + rnd() * 1.5).toFixed(2) +
          '" opacity="' + (0.38 + rnd() * 0.45).toFixed(2) + '"/>';
      }
      // crayon tooth: break the strokes up with the same kind of grain as the pieces
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">' +
        '<filter id="t" x="0" y="0" width="100%" height="100%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="1.1 0.45" numOctaves="2" seed="' + (t + 5) + '" result="n"/>' +
        '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 2.2 0 0 0 -0.6" result="m"/>' +
        '<feComposite in="SourceGraphic" in2="m" operator="in" result="g"/>' +
        '<feComposite in="g" in2="SourceGraphic" operator="arithmetic" k2="0.6" k3="0.4"/></filter>' +
        '<g fill="none" stroke-linecap="round" filter="url(#t)">' + strokes + '</g></svg>';
      tiles.push('url("data:image/svg+xml,' + encodeURIComponent(svg) + '")');
    }
    return tiles;
  })();

  /* The grid, ruled by hand in dark pencil: every line wobbles a little and
     overshoots the corners, and it is drawn once since it never changes. */
  function drawGrid() {
    var rnd = scribbler(3);
    var out = '';
    function rule(x1, y1, x2, y2, w) {
      var jx = (rnd() - 0.5) * 5, jy = (rnd() - 0.5) * 5;
      out += '<path d="M' + x1.toFixed(1) + ',' + y1.toFixed(1) +
        ' C' + (x1 + (x2 - x1) / 3 + jx).toFixed(1) + ',' + (y1 + (y2 - y1) / 3 + jy).toFixed(1) +
        ' ' + (x1 + 2 * (x2 - x1) / 3 - jx).toFixed(1) + ',' + (y1 + 2 * (y2 - y1) / 3 - jy).toFixed(1) +
        ' ' + x2.toFixed(1) + ',' + y2.toFixed(1) + '" stroke-width="' + w + '" vector-effect="non-scaling-stroke"/>';
    }
    for (var i = 0; i <= 8; i++) {
      var at = i * 100, w = i === 0 || i === 8 ? 2.6 : 1.9;
      rule(-4 - rnd() * 12, at + (rnd() - 0.5) * 3, 804 + rnd() * 12, at + (rnd() - 0.5) * 3, w);
      rule(at + (rnd() - 0.5) * 3, -4 - rnd() * 12, at + (rnd() - 0.5) * 3, 804 + rnd() * 12, w);
    }
    boardWrap.insertAdjacentHTML('beforeend',
      '<svg class="grid-lines" viewBox="0 0 800 800" preserveAspectRatio="none" aria-hidden="true">' +
      '<g fill="none" stroke="#3b2d22" stroke-linecap="round" filter="url(#pencil)">' + out + '</g></svg>' +
      '<svg class="trail" viewBox="0 0 800 800" preserveAspectRatio="none" aria-hidden="true"></svg>');
    trailEl = boardWrap.querySelector('.trail');
  }

  /* the little pencil tallies doodled under a few of the letters */
  var TALLY = {
    a: 'M3,2 l-2,10 M8,1 l-3,11 M12,2 l-1,10',
    c: 'M5,2 l-1,10 M10,2 l-1.5,10',
    f: 'M2,1 l3,11 M8,2 v10 M12,2 v10'
  };

  /* ---------------- sound ---------------- */
  var audioCtx = null;

  function blip(freq, duration, type, gain) {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var amp = audioCtx.createGain();
      osc.type = type || 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      amp.gain.setValueAtTime(gain == null ? 0.07 : gain, audioCtx.currentTime);
      amp.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(amp).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (err) { /* audio is a nicety, never a blocker */ }
  }

  var SOUND = {
    move: function () { blip(420, 0.12); },
    capture: function () { blip(240, 0.18, 'sawtooth', 0.06); },
    check: function () { blip(660, 0.2); setTimeout(function () { blip(520, 0.22); }, 110); },
    end: function () { [523, 659, 784].forEach(function (f, i) { setTimeout(function () { blip(f, 0.3); }, i * 130); }); },
    nope: function () { blip(150, 0.1, 'square', 0.04); }
  };

  /* ---------------- setup ---------------- */
  function newGame() {
    // drop any search already queued for the previous game
    clearTimeout(aiTimer);
    aiTimer = null;
    gameId++;
    state = E.newGame();
    history = [];
    selected = null;
    legal = [];
    lastMove = null;
    lastMover = null;
    thinking = false;
    pendingPromo = null;
    playerColor = 'w';
    flipped = playerColor === 'b';
    promoEl.hidden = true;
    clearFx();
    render();
    drawTrail(0);
    if (state.turn !== playerColor) scheduleAI();
  }

  function buildLabels() {
    var files = 'abcdefgh'.split('');
    var ranks = [8, 7, 6, 5, 4, 3, 2, 1];
    if (flipped) { files.reverse(); ranks.reverse(); }
    ranksEl.innerHTML = ranks.map(function (r) { return '<i>' + r + '</i>'; }).join('');
    filesEl.innerHTML = files.map(function (f) {
      var tally = TALLY[f] ? '<svg class="tally" viewBox="0 0 14 13"><path d="' + TALLY[f] +
        '" fill="none" stroke="#5a4634" stroke-width="1.4" stroke-linecap="round" opacity=".7"/></svg>' : '';
      return '<i>' + f + tally + '</i>';
    }).join('');
  }

  /* Squares in display order, top-left first. */
  function displayOrder() {
    var out = [];
    for (var row = 0; row < 8; row++) {
      for (var col = 0; col < 8; col++) {
        var rank = flipped ? row : 7 - row;
        var file = flipped ? 7 - col : col;
        out.push(E.sq(file, rank));
      }
    }
    return out;
  }

  /* ---------------- rendering ---------------- */

  /* Rebuild the board after the position changes. */
  function render() {
    buildLabels();
    boardEl.innerHTML = '';

    displayOrder().forEach(function (s) {
      var cell = document.createElement('div');
      var file = E.fileOf(s), rank = E.rankOf(s);
      cell.className = 'sq' + ((file + rank) % 2 === 0 ? ' dark' : '');
      if ((file + rank) % 2 === 0) cell.style.backgroundImage = HATCH[(file * 5 + rank * 3) % HATCH.length];
      cell.dataset.sq = String(s);
      cell.setAttribute('role', 'gridcell');

      var piece = state.board[s];
      cell.setAttribute('aria-label', E.name(s) + ' ' +
        (piece ? P.TEAM[piece.c] + ' ' + P.NAMES[piece.t] : 'empty'));

      if (piece) {
        var wrap = document.createElement('div');
        wrap.className = 'piece';
        // a little tilt and an offset breath so no two pieces move in step
        wrap.style.setProperty('--tilt', (((s * 7) % 5) - 2) * 1.1 + 'deg');
        wrap.style.animationDelay = ((s * 137) % 2400) + 'ms';
        wrap.style.setProperty('--phase', -((s * 61) % 500) + 'ms');
        wrap.innerHTML = P.render(piece.t, piece.c);
        cell.appendChild(wrap);
      }
      boardEl.appendChild(cell);
    });

    decorate();
    renderHistory();
    renderCaptured();
  }

  /* Redraw only what selection and turns change: the rings, check, and which
     squares can be clicked. Pieces are left alone, so a hop or a tumble that
     is under way carries on undisturbed. */
  function decorate() {
    var playing = E.status(state) === 'playing';
    var checkSquare = E.inCheck(state, state.turn) ? E.findKing(state.board, state.turn) : -1;
    var targets = {};
    legal.forEach(function (m) { targets[m.to] = m; });

    [].forEach.call(boardEl.children, function (cell) {
      var s = Number(cell.dataset.sq), piece = state.board[s];
      var mine = playing && !thinking && piece && piece.c === playerColor && state.turn === playerColor;
      cell.classList.toggle('selected', s === selected);
      cell.classList.toggle('check', s === checkSquare);
      cell.classList.toggle('pickable', !!(mine || targets[s]));

      [].slice.call(cell.children).forEach(function (el) {
        if (el.classList.contains('mark')) cell.removeChild(el);
      });

      // the piece you hold is delighted; anything you could take looks worried
      var wrap = cell.querySelector('.piece');
      if (wrap) {
        var base = s === selected ? 'happy'
          : targets[s] && piece && piece.c !== playerColor ? 'worried'
            : s === checkSquare ? 'check' : null;
        feel(wrap, 'base', base);
        if (base) feel(wrap, 'idle', null);   // nobody sleeps through that
      }
      if (s === selected) {
        cell.insertAdjacentHTML('afterbegin', M.selectRing(playerColor));
      } else if (targets[s]) {
        cell.insertAdjacentHTML('afterbegin', M.target(!!(piece || targets[s].ep)) + M.brackets());
      }
    });
    renderCaption();
  }

  function renderCaption() {
    var result = E.status(state);
    captionEl.classList.remove('them', 'over');

    if (result === 'checkmate') {
      var winner = E.other(state.turn);
      captionEl.textContent = winner === playerColor ? 'you win! 🎉' : 'checkmate — the woods win';
      captionEl.classList.add('over');
      return;
    }
    if (result === 'stalemate') {
      captionEl.textContent = 'stalemate — nobody moves';
      captionEl.classList.add('over');
      return;
    }
    if (result === 'draw') {
      captionEl.textContent = 'a draw — shake hands';
      captionEl.classList.add('over');
      return;
    }

    var check = E.inCheck(state, state.turn);
    if (state.turn === playerColor) {
      captionEl.textContent = check ? 'check! your move' : 'your move';
    } else {
      captionEl.textContent = check ? 'check! they are thinking…' : 'thinking…';
      captionEl.classList.add('them');
    }
  }

  /* the last few moves, pencilled on the right-hand note */
  function renderHistory() {
    var rows = '';
    var from = Math.max(0, history.length - 8);
    from -= from % 2;
    for (var i = from; i < history.length; i += 2) {
      rows += '<span class="mv"><em>' + (i / 2 + 1) + '.</em> <b>' + history[i].san + '</b>' +
        (history[i + 1] ? ' <i>' + history[i + 1].san + '</i>' : '') + '</span>';
    }
    World.writeNote('note-r', rows || '<span class="hint">nothing yet</span>');
    World.progress(history.length);
  }

  function renderCaptured() {
    var lost = { w: [], b: [] };
    history.forEach(function (h) {
      if (h.captured) lost[h.captured.c].push(h.captured);
    });
    var order = { q: 0, r: 1, b: 2, n: 3, p: 4 };
    function draw(list) {
      return list.slice().sort(function (a, b) { return order[a.t] - order[b.t]; })
        .map(function (p) { return P.render(p.t, p.c, true); }).join('');
    }
    var mine = lost[E.other(playerColor)].reduce(function (n, p) { return n + VALUE[p.t]; }, 0);
    var theirs = lost[playerColor].reduce(function (n, p) { return n + VALUE[p.t]; }, 0);
    var diff = mine - theirs;
    // what each side has caught, pencilled on the left-hand note
    World.writeNote('note-l',
      '<span class="tray">' + (draw(lost[E.other(playerColor)]) || '<span class="hint">-</span>') + '</span>' +
      '<span class="tray">' + (draw(lost[playerColor]) || '<span class="hint">-</span>') + '</span>' +
      '<span class="hint">' + (diff === 0 ? 'even so far' : diff > 0 ? 'you are up ' + diff : 'you are down ' + (-diff)) + '</span>');
  }

  /* ---------------- moods ---------------- */

  /* A piece can have three reasons to pull a face; the strongest one shows.
       base  - what the board says now: picked up, threatened, in check
       react - a passing reaction: startled by a neighbour, cheering a capture
       idle  - nodding off when nothing is going on */
  var FACE = { check: 'worried', cheer: 'happy', yawn: 'sleepy', giggle: 'happy', stretch: 'happy', look: '' };
  var MOUTH = { wide: 'o', yawn: 'o' };
  var EMOTE = { worried: 'alert', check: 'sweat', cheer: 'note', sleepy: 'zzz', giggle: 'sparkle' };

  function showFeeling(wrap) {
    var feeling = wrap.dataset.base || wrap.dataset.react || wrap.dataset.act || wrap.dataset.idle || '';
    var face = feeling in FACE ? FACE[feeling] : feeling;
    if (face) wrap.dataset.mood = face; else delete wrap.dataset.mood;
    if (MOUTH[feeling]) wrap.dataset.mouth = MOUTH[feeling]; else delete wrap.dataset.mouth;

    var kind = EMOTE[feeling] || '';
    var shown = wrap.querySelector('.emote');
    if (shown && shown.dataset.kind !== kind) { wrap.removeChild(shown); shown = null; }
    if (kind && !shown) wrap.insertAdjacentHTML('beforeend', M.emote(kind));
  }

  function feel(wrap, slot, value) {
    if (!wrap || (wrap.dataset[slot] || null) === (value || null)) return;
    if (value) wrap.dataset[slot] = value; else delete wrap.dataset[slot];
    showFeeling(wrap);
  }

  /* a reaction that wears off by itself */
  function react(wrap, value, ms) {
    if (!wrap) return;
    feel(wrap, 'react', value);
    clearTimeout(wrap.reactTimer);
    wrap.reactTimer = setTimeout(function () { feel(wrap, 'react', null); }, ms);
  }

  /* Little things an idle piece does on its own: a yawn, a look round, a
     giggle, a big stretch. Each is a body move (a CSS class) plus a face. */
  var ACTS = {
    yawn: { ms: 1700, puffAt: 1050 },
    look: { ms: 2300 },
    giggle: { ms: 1300 },
    stretch: { ms: 1450 }
  };

  function perform(wrap, act) {
    var spec = ACTS[act];
    wrap.classList.add('act-' + act);
    feel(wrap, 'act', act);
    if (spec.puffAt) {
      setTimeout(function () {
        if (wrap.dataset.act !== act) return;
        wrap.insertAdjacentHTML('beforeend', M.emote('puff').replace('class="emote', 'class="emote emote-once'));
      }, spec.puffAt);
    }
    setTimeout(function () {
      wrap.classList.remove('act-' + act);
      var once = wrap.querySelector('.emote-once');
      if (once) wrap.removeChild(once);
      feel(wrap, 'act', null);
    }, spec.ms);
  }

  function pieceAt(square) {
    var cell = cellFor(square);
    return cell && cell.querySelector('.piece');
  }

  function neighbours(square) {
    var f = E.fileOf(square), r = E.rankOf(square), out = [];
    for (var df = -1; df <= 1; df++) {
      for (var dr = -1; dr <= 1; dr++) {
        if ((df || dr) && f + df >= 0 && f + df < 8 && r + dr >= 0 && r + dr < 8) out.push(E.sq(f + df, r + dr));
      }
    }
    return out;
  }

  /* ---------------- motion ---------------- */

  /* Centre of a square in the 0..800 units the board overlays are drawn in. */
  function centerOf(file, rank) {
    var col = flipped ? 7 - file : file, row = flipped ? rank : 7 - rank;
    return { x: col * 100 + 50, y: row * 100 + 50 };
  }

  /* The squares a piece passes over: a straight line, or an L for a knight. */
  function routeOf(move, type) {
    var f0 = E.fileOf(move.from), r0 = E.rankOf(move.from);
    var df = E.fileOf(move.to) - f0, dr = E.rankOf(move.to) - r0;
    var stops = [];
    if (type === 'n') {
      var alongFile = Math.abs(df) === 2;
      stops = alongFile
        ? [[f0, r0], [f0 + df / 2, r0], [f0 + df, r0], [f0 + df, r0 + dr]]
        : [[f0, r0], [f0, r0 + dr / 2], [f0, r0 + dr], [f0 + df, r0 + dr]];
    } else {
      var n = Math.max(Math.abs(df), Math.abs(dr));
      for (var i = 0; i <= n; i++) stops.push([f0 + df * i / n, r0 + dr * i / n]);
    }
    return stops.map(function (p) { return centerOf(p[0], p[1]); });
  }

  /* Walk a piece from its old square to its new one in little hops, the way
     the drawings shuffle across the paper. Returns how long the walk takes. */
  function travel(square, route) {
    var cell = cellFor(square);
    var wrap = cell && cell.querySelector('.piece');
    if (!wrap || !wrap.animate || route.length < 2) return 0;

    // even a long slide only takes up to three hops
    var hops = Math.min(route.length - 1, 3);
    var pts = [];
    for (var i = 0; i <= hops; i++) pts.push(route[Math.round(i * (route.length - 1) / hops)]);

    var unit = cell.getBoundingClientRect().width / 100;
    var end = pts[hops];
    var tilt = wrap.style.getPropertyValue('--tilt') || '0deg';
    function at(x, y, turn, squash) {
      return 'translate(' + ((x - end.x) * unit).toFixed(1) + 'px,' +
        ((y - end.y) * unit).toFixed(1) + 'px) rotate(' + turn + ') scale(' + squash + ')';
    }
    // crouch on the ground, stretch tall in the air
    var frames = [];
    for (var h = 0; h <= hops; h++) {
      frames.push({ offset: h / hops, easing: 'ease-out', transform: at(pts[h].x, pts[h].y, tilt, h === hops ? '1, 1' : '1.08, .92') });
      if (h < hops) {
        frames.push({
          offset: (h + 0.5) / hops, easing: 'ease-in',
          transform: at((pts[h].x + pts[h + 1].x) / 2, (pts[h].y + pts[h + 1].y) / 2 - 24, (h % 2 ? 7 : -7) + 'deg', '.93, 1.09')
        });
      }
    }

    var ms = 140 + hops * 220;
    wrap.classList.add('moving');
    wrap.animate(frames, { duration: ms }).onfinish = function () {
      wrap.classList.remove('moving');
      puffOfDust(square);
      // a little squash as it lands
      wrap.animate([
        { transform: 'scale(1.14, .86) rotate(' + tilt + ')' },
        { transform: 'scale(1, 1) rotate(' + tilt + ')' }
      ], { duration: 200, easing: 'ease-out' });
    };
    return ms;
  }

  /* The last move stays drawn on the paper: footprint dots in the mover's
     colour from where it was to where it is now, and a ring round its feet.
     Given `ms`, the dots appear as the piece passes over them. */
  function drawTrail(ms) {
    if (!trailEl) return;
    if (!lastMove) { trailEl.innerHTML = ''; return; }
    var piece = state.board[lastMove.to];
    var route = routeOf(lastMove, lastMove.promo || !piece ? 'p' : piece.t);
    var color = M.TEAM[lastMover];

    var legs = [], total = 0;
    for (var i = 1; i < route.length; i++) {
      var len = Math.hypot(route[i].x - route[i - 1].x, route[i].y - route[i - 1].y);
      legs.push(len);
      total += len;
    }
    var out = '';
    for (var d = 32, n = 0; d < total - 44; d += 24, n++) {
      var k = 0, run = 0;
      while (k < legs.length - 1 && run + legs[k] < d) { run += legs[k]; k++; }
      var t = (d - run) / legs[k];
      var x = route[k].x + (route[k + 1].x - route[k].x) * t;
      var y = route[k].y + (route[k + 1].y - route[k].y) * t + 12;
      out += '<circle class="trail-dot" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (n % 2 ? 3.4 : 4.2) +
        '" fill="' + color + '" style="animation-delay:' + Math.round(ms * d / total) + 'ms"/>';
    }
    var end = route[route.length - 1];
    out += '<path class="trail-ring" d="' + M.ring(end.x, end.y + 14, 41, 31) + '" fill="none" stroke="' + color +
      '" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" style="animation-delay:' + ms + 'ms"/>';
    if (ms) {
      out += '<g class="trail-shake" style="animation-delay:' + ms + 'ms">' +
        M.shakeMarks(end.x, end.y - 72, 26, '#5a4634') + '</g>';
    }
    trailEl.classList.toggle('still', !ms);
    trailEl.innerHTML = out;
  }

  /* The taken piece waits on its square until the attacker lands on it, then
     sees stars: its eyes go to spirals, it wobbles, and it tumbles away. */
  function knockoutFx(square, piece, landMs) {
    var c = centerOf(E.fileOf(square), E.rankOf(square));
    var fx = document.createElement('div');
    fx.className = 'fx';
    fx.style.left = (c.x - 50) / 8 + '%';
    fx.style.top = (c.y - 50) / 8 + '%';
    fx.style.setProperty('--land', landMs + 'ms');
    fx.innerHTML = '<div class="fx-piece">' + P.render(piece.t, piece.c) + '</div>' + M.sparks() + M.poof();

    var art = fx.querySelector('.face');
    var pupils = [].filter.call(art.querySelectorAll('.eyes ellipse'), function (e) {
      return e.getAttribute('fill') === INK;
    });
    var dizzy = '', headX = 50, headY = 40;
    if (pupils.length) {
      headX = 0;
      headY = 100;
      pupils.forEach(function (e) {
        var x = +e.getAttribute('cx'), y = +e.getAttribute('cy');
        dizzy += '<path d="' + M.spiral(x, y, +e.getAttribute('rx') * 1.3) + '"/>';
        headX += x / pupils.length;
        headY = Math.min(headY, y);
      });
    }
    art.lastElementChild.insertAdjacentHTML('beforeend',
      '<g class="ko-dizzy" fill="none" stroke="' + INK + '" stroke-width="1.7" stroke-linecap="round">' + dizzy + '</g>' +
      M.seeingStars(headX, headY - 20, 15) +
      M.shakeMarks(headX, headY, 30, '#5a4634'));

    boardWrap.appendChild(fx);
    setTimeout(function () {
      if (fx.parentNode) fx.parentNode.removeChild(fx);
    }, landMs + 1900);
  }

  /* little clouds kicked up either side of a piece as it lands */
  function puffOfDust(square) {
    var c = centerOf(E.fileOf(square), E.rankOf(square));
    var el = document.createElement('div');
    el.className = 'dust';
    el.style.left = (c.x - 50) / 8 + '%';
    el.style.top = (c.y - 50) / 8 + '%';
    el.innerHTML = M.dust();
    boardWrap.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 700);
  }

  function clearFx() {
    [].slice.call(boardWrap.querySelectorAll('.fx, .dust')).forEach(function (f) {
      f.parentNode.removeChild(f);
    });
  }

  function cellFor(square) {
    return boardEl.querySelector('[data-sq="' + square + '"]');
  }

  /* ---------------- interaction ---------------- */
  boardEl.addEventListener('click', function (ev) {
    var cell = ev.target.closest('.sq');
    if (!cell || thinking || pendingPromo) return;
    if (E.status(state) !== 'playing') return;
    if (state.turn !== playerColor) return;

    var square = Number(cell.dataset.sq);
    var chosen = legal.filter(function (m) { return m.to === square; });

    if (chosen.length) {
      if (chosen[0].promo) askPromotion(chosen);
      else applyMove(chosen[0]);
      return;
    }

    var piece = state.board[square];
    if (piece && piece.c === playerColor) {
      selected = square === selected ? null : square;
      legal = selected === null ? [] : E.movesFrom(state, selected);
      decorate();
    } else if (selected !== null) {
      selected = null;
      legal = [];
      SOUND.nope();
      decorate();
    }
  });

  function askPromotion(options) {
    pendingPromo = options;
    promoChoices.innerHTML = ['q', 'r', 'b', 'n'].map(function (t) {
      return '<button data-promo="' + t + '" title="' + P.NAMES[t] + '">' +
        P.render(t, playerColor, true) + '</button>';
    }).join('');
    promoEl.hidden = false;
  }

  promoChoices.addEventListener('click', function (ev) {
    var btn = ev.target.closest('button');
    if (!btn || !pendingPromo) return;
    var pick = pendingPromo.find(function (m) { return m.promo === btn.dataset.promo; });
    pendingPromo = null;
    promoEl.hidden = true;
    if (pick) applyMove(pick);
  });

  function applyMove(move) {
    var mover = state.board[move.from];
    var fallen = move.ep ? E.sq(E.fileOf(move.to), E.rankOf(move.from)) : move.to;
    var captured = state.board[fallen];
    var san = E.toSAN(state, move);

    history.push({ state: state, move: move, san: san, captured: captured });
    lastMover = state.turn;
    state = E.makeMove(state, move);
    lastMove = move;
    selected = null;
    legal = [];

    render();
    var ms = travel(move.to, routeOf(move, move.promo ? 'p' : mover.t));
    if (move.castle) {
      // the rook hops over to the king's other side at the same time
      var home = E.rankOf(move.from);
      var rookFrom = E.sq(move.castle === 'k' ? 7 : 0, home);
      var rookTo = E.sq(move.castle === 'k' ? 5 : 3, home);
      travel(rookTo, routeOf({ from: rookFrom, to: rookTo }, 'r'));
    }
    drawTrail(ms);
    if (captured) knockoutFx(fallen, captured, ms);

    var result = E.status(state);
    var check = result === 'playing' && E.inCheck(state, state.turn);
    var turnOf = gameId;
    setTimeout(function () {
      if (turnOf !== gameId) return;
      // whoever it landed next to gets a start; a capture is worth a cheer
      neighbours(move.to).forEach(function (sq) {
        if (sq !== fallen) react(pieceAt(sq), 'wide', 1100);
      });
      if (captured) {
        react(pieceAt(move.to), 'cheer', 1800);
        World.sunFace(lastMover === playerColor ? 'laugh' : 'oops');
      }
      if (result !== 'playing') SOUND.end();
      else if (check) SOUND.check();
      else if (captured) SOUND.capture();
      else SOUND.move();
    }, ms);

    // let this move play out before the reply starts
    if (result === 'playing' && state.turn !== playerColor) scheduleAI(ms + (captured ? 1850 : 150));
  }

  /* How long the opponent mulls before answering: longer for the stronger
     ones, longer again when the position is busy, and never twice the same. */
  function thinkTime(level) {
    var base = { 1: 850, 2: 1300, 3: 1900, 4: 2600, 5: 2600 }[level] || 1600;
    var busy = Math.min(E.legalMoves(state).length, 40) / 40;
    return base * (0.75 + 0.55 * busy) + Math.random() * 700;
  }

  function scheduleAI(settle) {
    var turnOf = gameId;

    var target = thinkTime(level);
    var started = Date.now();

    thinking = true;
    decorate();

    // wait for the last move to finish playing out (and for "thinking…" to
    // paint) before the search ties up the page
    clearTimeout(aiTimer);
    aiTimer = setTimeout(function () {
      if (turnOf !== gameId) return;   // the game was restarted while we waited
      var move = AI.chooseMove(state, level);
      if (turnOf !== gameId) return;   // ...or while we were searching

      // hold the pause for whatever is left of the time it meant to take
      aiTimer = setTimeout(function () {
        if (turnOf !== gameId) return;
        thinking = false;
        if (!move) { decorate(); return; }
        applyMove(move);
      }, Math.max(0, target - (Date.now() - started)));
    }, Math.max(220, settle || 0));
  }

  /* ---------------- controls ---------------- */
  document.getElementById('new-game').addEventListener('click', newGame);

  document.getElementById('undo').addEventListener('click', function () {
    if (thinking || !history.length) return;
    // step back to the player's own turn
    while (history.length) {
      var last = history.pop();
      state = last.state;
      if (state.turn === playerColor) break;
    }
    lastMove = history.length ? history[history.length - 1].move : null;
    lastMover = history.length ? history[history.length - 1].state.turn : null;
    selected = null;
    legal = [];
    pendingPromo = null;
    promoEl.hidden = true;
    clearFx();
    render();
    drawTrail(0);
  });

  document.getElementById('sound').addEventListener('click', function () {
    soundOn = !soundOn;
    World.setSound(soundOn);
    if (soundOn) SOUND.move();
  });

  [].forEach.call(document.querySelectorAll('.dd-star'), function (star) {
    star.addEventListener('click', function () {
      level = Number(star.dataset.level);
      World.setLevel(level);
      if (!thinking && state.turn !== playerColor && E.status(state) === 'playing') scheduleAI();
    });
  });

  // the chick hops when you hover it and cheers when it starts a new game
  document.getElementById('new-game').addEventListener('click', function () {
    var chick = document.getElementById('new-game');
    chick.classList.remove('cheer');
    void chick.offsetWidth;
    chick.classList.add('cheer');
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      if (pendingPromo) { pendingPromo = null; promoEl.hidden = true; return; }
      selected = null; legal = []; decorate();
    }
  });

  /* Somebody on the board is always doing something small: a blink here,
     a fidget there, one piece at a time. */
  function nudgeSomeone(cls, ms) {
    if (document.hidden) return;
    var idle = boardEl.querySelectorAll('.sq:not(.selected) .piece:not(.moving)');
    if (!idle.length) return;
    var who = idle[Math.floor(Math.random() * idle.length)];
    who.classList.add(cls);
    setTimeout(function () { who.classList.remove(cls); }, ms);
  }
  setInterval(function () { nudgeSomeone('blink', 260); }, 1300);

  /* every few seconds someone with nothing to do dozes off for a while */
  setInterval(function () {
    if (document.hidden || boardEl.querySelectorAll('.piece[data-idle]').length >= 3) return;
    var awake = [].filter.call(boardEl.querySelectorAll('.piece'), function (w) {
      return !w.dataset.base && !w.dataset.react && !w.dataset.idle && !w.classList.contains('moving');
    });
    if (!awake.length) return;
    var who = awake[Math.floor(Math.random() * awake.length)];
    feel(who, 'idle', 'sleepy');
    setTimeout(function () { feel(who, 'idle', null); }, 6000 + Math.random() * 6000);
  }, 3500);
  /* every couple of seconds someone with nothing to do performs a little act */
  setInterval(function () {
    if (document.hidden) return;
    var idle = [].filter.call(boardEl.querySelectorAll('.piece'), function (w) {
      return !w.dataset.base && !w.dataset.react && !w.dataset.act && !w.dataset.idle &&
        !w.classList.contains('moving');
    });
    if (!idle.length) return;
    var names = Object.keys(ACTS);
    perform(idle[Math.floor(Math.random() * idle.length)], names[Math.floor(Math.random() * names.length)]);
  }, 1900);

  /* Eyes follow the pencil: every face turns a little towards the pointer
     while it is over the paper, and settles back when it leaves. */
  var lookFrame = 0;
  function lookAt(x, y) {
    cancelAnimationFrame(lookFrame);
    lookFrame = requestAnimationFrame(function () {
      [].forEach.call(boardEl.querySelectorAll('.piece'), function (w) {
        if (x === null) {
          w.style.removeProperty('--lx');
          w.style.removeProperty('--ly');
          return;
        }
        var r = w.getBoundingClientRect();
        var dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height * 0.45);
        var d = Math.hypot(dx, dy) || 1, reach = Math.min(1, d / 120) * 2;
        w.style.setProperty('--lx', (dx / d * reach).toFixed(2));
        w.style.setProperty('--ly', (dy / d * reach * 0.7).toFixed(2));
      });
    });
  }
  document.getElementById('sheet').addEventListener('pointermove', function (ev) { lookAt(ev.clientX, ev.clientY); });
  document.getElementById('sheet').addEventListener('pointerleave', function () { lookAt(null, null); });

  drawGrid();
  soundOn = true;
  World.setLevel(level);
  World.setSound(soundOn);
  newGame();
})();
