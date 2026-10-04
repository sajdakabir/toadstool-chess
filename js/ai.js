/* Alpha-beta search with piece-square tables. Depth comes from difficulty. */
(function (global) {
  'use strict';

  var E = global.Engine;

  var VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

  // Tables are written from white's point of view, rank 8 first.
  function flip(table) {
    var out = new Array(64);
    for (var r = 0; r < 8; r++) {
      for (var f = 0; f < 8; f++) out[r * 8 + f] = table[(7 - r) * 8 + f];
    }
    return out;
  }

  var PST_RAW = {
    p: [0, 0, 0, 0, 0, 0, 0, 0,
        50, 50, 50, 50, 50, 50, 50, 50,
        10, 10, 20, 30, 30, 20, 10, 10,
        5, 5, 10, 25, 25, 10, 5, 5,
        0, 0, 0, 20, 20, 0, 0, 0,
        5, -5, -10, 0, 0, -10, -5, 5,
        5, 10, 10, -20, -20, 10, 10, 5,
        0, 0, 0, 0, 0, 0, 0, 0],
    n: [-50, -40, -30, -30, -30, -30, -40, -50,
        -40, -20, 0, 0, 0, 0, -20, -40,
        -30, 0, 10, 15, 15, 10, 0, -30,
        -30, 5, 15, 20, 20, 15, 5, -30,
        -30, 0, 15, 20, 20, 15, 0, -30,
        -30, 5, 10, 15, 15, 10, 5, -30,
        -40, -20, 0, 5, 5, 0, -20, -40,
        -50, -40, -30, -30, -30, -30, -40, -50],
    b: [-20, -10, -10, -10, -10, -10, -10, -20,
        -10, 0, 0, 0, 0, 0, 0, -10,
        -10, 0, 5, 10, 10, 5, 0, -10,
        -10, 5, 5, 10, 10, 5, 5, -10,
        -10, 0, 10, 10, 10, 10, 0, -10,
        -10, 10, 10, 10, 10, 10, 10, -10,
        -10, 5, 0, 0, 0, 0, 5, -10,
        -20, -10, -10, -10, -10, -10, -10, -20],
    r: [0, 0, 0, 0, 0, 0, 0, 0,
        5, 10, 10, 10, 10, 10, 10, 5,
        -5, 0, 0, 0, 0, 0, 0, -5,
        -5, 0, 0, 0, 0, 0, 0, -5,
        -5, 0, 0, 0, 0, 0, 0, -5,
        -5, 0, 0, 0, 0, 0, 0, -5,
        -5, 0, 0, 0, 0, 0, 0, -5,
        0, 0, 0, 5, 5, 0, 0, 0],
    q: [-20, -10, -10, -5, -5, -10, -10, -20,
        -10, 0, 0, 0, 0, 0, 0, -10,
        -10, 0, 5, 5, 5, 5, 0, -10,
        -5, 0, 5, 5, 5, 5, 0, -5,
        0, 0, 5, 5, 5, 5, 0, -5,
        -10, 5, 5, 5, 5, 5, 0, -10,
        -10, 0, 5, 0, 0, 0, 0, -10,
        -20, -10, -10, -5, -5, -10, -10, -20],
    k: [-30, -40, -40, -50, -50, -40, -40, -30,
        -30, -40, -40, -50, -50, -40, -40, -30,
        -30, -40, -40, -50, -50, -40, -40, -30,
        -30, -40, -40, -50, -50, -40, -40, -30,
        -20, -30, -30, -40, -40, -30, -30, -20,
        -10, -20, -20, -20, -20, -20, -20, -10,
        20, 20, 0, 0, 0, 20, 20, 20,
        20, 30, 10, 0, 0, 10, 30, 20]
  };

  var PST = { w: {}, b: {} };
  Object.keys(PST_RAW).forEach(function (t) {
    PST.w[t] = flip(PST_RAW[t]);   // index 0 = a1, so white reads the flipped table
    PST.b[t] = PST_RAW[t].slice(); // black reads it as written
  });

  /* Score from the point of view of `side`. */
  function evaluate(state, side) {
    var score = 0;
    for (var i = 0; i < 64; i++) {
      var p = state.board[i];
      if (!p) continue;
      var v = VALUE[p.t] + PST[p.c][p.t][i];
      score += p.c === side ? v : -v;
    }
    return score;
  }

  function moveScore(state, move) {
    var victim = state.board[move.to];
    var attacker = state.board[move.from];
    var s = 0;
    if (victim) s += 10 * VALUE[victim.t] - VALUE[attacker.t];
    if (move.promo) s += VALUE[move.promo];
    return s;
  }

  function ordered(state, moves) {
    return moves.slice().sort(function (a, b) {
      return moveScore(state, b) - moveScore(state, a);
    });
  }

  function quiesce(state, alpha, beta, side, depth) {
    var stand = evaluate(state, side);
    if (depth === 0) return stand;
    if (state.turn === side) {
      if (stand >= beta) return beta;
      if (stand > alpha) alpha = stand;
    } else {
      if (stand <= alpha) return alpha;
      if (stand < beta) beta = stand;
    }

    var captures = E.legalMoves(state).filter(function (m) {
      return state.board[m.to] || m.promo || m.ep;
    });
    captures = ordered(state, captures);

    for (var i = 0; i < captures.length; i++) {
      var score = quiesce(E.makeMove(state, captures[i]), alpha, beta, side, depth - 1);
      if (state.turn === side) {
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
      } else {
        if (score <= alpha) return alpha;
        if (score < beta) beta = score;
      }
    }
    return state.turn === side ? alpha : beta;
  }

  /* For the strongest setting the search runs against a clock: every 1024
     nodes it checks the time, and if it is out it gives up on this depth. */
  var deadline = Infinity, nodes = 0, outOfTime = false;

  function search(state, depth, alpha, beta, side) {
    if ((++nodes & 1023) === 0 && Date.now() > deadline) outOfTime = true;
    if (outOfTime) return 0;
    var moves = E.legalMoves(state);
    if (!moves.length) {
      if (E.inCheck(state, state.turn)) {
        // prefer the fastest mate / slowest loss
        return state.turn === side ? -100000 - depth : 100000 + depth;
      }
      return 0;
    }
    if (depth === 0) return quiesce(state, alpha, beta, side, 4);

    moves = ordered(state, moves);
    var maximizing = state.turn === side;
    var best = maximizing ? -Infinity : Infinity;

    for (var i = 0; i < moves.length; i++) {
      var score = search(E.makeMove(state, moves[i]), depth - 1, alpha, beta, side);
      if (maximizing) {
        if (score > best) best = score;
        if (best > alpha) alpha = best;
      } else {
        if (score < best) best = score;
        if (best < beta) beta = best;
      }
      if (beta <= alpha) break;
    }
    return best;
  }

  /* Pick a move for the side to move. `level` is 1..4. */
  function chooseMove(state, level) {
    var moves = E.legalMoves(state);
    if (!moves.length) return null;

    var side = state.turn;

    if (level <= 1) {
      // Sleepy: grab the best immediate capture, otherwise wander.
      var shuffled = moves.slice().sort(function () { return Math.random() - 0.5; });
      shuffled.sort(function (a, b) { return moveScore(state, b) - moveScore(state, a); });
      var pick = Math.random() < 0.55 ? 0 : Math.floor(Math.random() * shuffled.length);
      return shuffled[pick];
    }

    if (level >= 5) return deepest(state, moves, side, 2200);

    var depth = level === 2 ? 2 : level === 3 ? 3 : 4;
    var best = rootSearch(state, ordered(state, moves), depth, side).best;
    return best[Math.floor(Math.random() * best.length)];
  }

  function rootSearch(state, candidates, depth, side) {
    var best = [], bestScore = -Infinity, scored = [];
    for (var i = 0; i < candidates.length; i++) {
      var score = search(E.makeMove(state, candidates[i]), depth - 1, -Infinity, Infinity, side);
      if (outOfTime) break;
      scored.push({ move: candidates[i], score: score });
      if (score > bestScore + 0.5) { bestScore = score; best = [candidates[i]]; }
      else if (score >= bestScore - 0.5) { best.push(candidates[i]); }
    }
    return { best: best, scored: scored };
  }

  /* Iterative deepening: search 3 ply, then 4, then 5... until the time is
     up, keeping the answer of the last depth that finished. Each new depth
     looks at the previous one's best moves first. */
  function deepest(state, moves, side, ms) {
    var order = ordered(state, moves), answer = null;
    deadline = Date.now() + ms;
    outOfTime = false;
    nodes = 0;
    for (var depth = 3; depth <= 8; depth++) {
      var result = rootSearch(state, order, depth, side);
      if (outOfTime) break;
      answer = result.best;
      order = result.scored.sort(function (x, y) { return y.score - x.score; }).map(function (s) { return s.move; });
    }
    deadline = Infinity;
    outOfTime = false;
    if (!answer || !answer.length) answer = [order[0]];
    return answer[Math.floor(Math.random() * answer.length)];
  }

  global.AI = { chooseMove: chooseMove, evaluate: evaluate };
})(window);
