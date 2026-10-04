/* Chess rules engine. Plain global, no modules, so it works from file://. */
(function (global) {
  'use strict';

  var FILES = 'abcdefgh';

  function sq(file, rank) { return rank * 8 + file; }
  function fileOf(s) { return s & 7; }
  function rankOf(s) { return s >> 3; }
  function name(s) { return FILES[fileOf(s)] + (rankOf(s) + 1); }
  function onBoard(f, r) { return f >= 0 && f < 8 && r >= 0 && r < 8; }

  var KNIGHT_DELTAS = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
  var KING_DELTAS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  var ROOK_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  var BISHOP_DIRS = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

  function initialBoard() {
    var board = new Array(64).fill(null);
    var back = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    for (var f = 0; f < 8; f++) {
      board[sq(f, 0)] = { t: back[f], c: 'w' };
      board[sq(f, 1)] = { t: 'p', c: 'w' };
      board[sq(f, 6)] = { t: 'p', c: 'b' };
      board[sq(f, 7)] = { t: back[f], c: 'b' };
    }
    return board;
  }

  function newGame() {
    return {
      board: initialBoard(),
      turn: 'w',
      castling: { wk: true, wq: true, bk: true, bq: true },
      ep: null,          // square index available for en-passant capture
      half: 0,           // halfmove clock
      full: 1
    };
  }

  function clone(state) {
    return {
      board: state.board.slice(),
      turn: state.turn,
      castling: {
        wk: state.castling.wk, wq: state.castling.wq,
        bk: state.castling.bk, bq: state.castling.bq
      },
      ep: state.ep,
      half: state.half,
      full: state.full
    };
  }

  function other(c) { return c === 'w' ? 'b' : 'w'; }

  function findKing(board, color) {
    for (var i = 0; i < 64; i++) {
      var p = board[i];
      if (p && p.t === 'k' && p.c === color) return i;
    }
    return -1;
  }

  /* Is `target` attacked by any piece of `by`? */
  function isAttacked(board, target, by) {
    var tf = fileOf(target), tr = rankOf(target), i, f, r, p;

    // pawns
    var pd = by === 'w' ? -1 : 1; // walk back from target toward the attacker
    for (i = -1; i <= 1; i += 2) {
      f = tf + i; r = tr + pd;
      if (onBoard(f, r)) {
        p = board[sq(f, r)];
        if (p && p.c === by && p.t === 'p') return true;
      }
    }
    // knights
    for (i = 0; i < KNIGHT_DELTAS.length; i++) {
      f = tf + KNIGHT_DELTAS[i][0]; r = tr + KNIGHT_DELTAS[i][1];
      if (onBoard(f, r)) {
        p = board[sq(f, r)];
        if (p && p.c === by && p.t === 'n') return true;
      }
    }
    // king
    for (i = 0; i < KING_DELTAS.length; i++) {
      f = tf + KING_DELTAS[i][0]; r = tr + KING_DELTAS[i][1];
      if (onBoard(f, r)) {
        p = board[sq(f, r)];
        if (p && p.c === by && p.t === 'k') return true;
      }
    }
    // sliding
    function ray(dirs, types) {
      for (var d = 0; d < dirs.length; d++) {
        var ff = tf + dirs[d][0], rr = tr + dirs[d][1];
        while (onBoard(ff, rr)) {
          var q = board[sq(ff, rr)];
          if (q) {
            if (q.c === by && types.indexOf(q.t) !== -1) return true;
            break;
          }
          ff += dirs[d][0]; rr += dirs[d][1];
        }
      }
      return false;
    }
    if (ray(ROOK_DIRS, ['r', 'q'])) return true;
    if (ray(BISHOP_DIRS, ['b', 'q'])) return true;
    return false;
  }

  function inCheck(state, color) {
    var k = findKing(state.board, color);
    return k >= 0 && isAttacked(state.board, k, other(color));
  }

  function push(list, move) { list.push(move); }

  /* Pseudo-legal moves for the side to move (king-safety not yet checked). */
  function pseudoMoves(state, color) {
    var board = state.board, moves = [], i;
    color = color || state.turn;

    for (var from = 0; from < 64; from++) {
      var p = board[from];
      if (!p || p.c !== color) continue;
      var f = fileOf(from), r = rankOf(from);

      if (p.t === 'p') {
        var dir = color === 'w' ? 1 : -1;
        var startRank = color === 'w' ? 1 : 6;
        var promoRank = color === 'w' ? 7 : 0;
        var one = sq(f, r + dir);

        if (onBoard(f, r + dir) && !board[one]) {
          if (r + dir === promoRank) {
            ['q', 'r', 'b', 'n'].forEach(function (t) {
              push(moves, { from: from, to: one, promo: t });
            });
          } else {
            push(moves, { from: from, to: one });
            var two = sq(f, r + 2 * dir);
            if (r === startRank && !board[two]) {
              push(moves, { from: from, to: two, dbl: true });
            }
          }
        }
        for (i = -1; i <= 1; i += 2) {
          var cf = f + i, cr = r + dir;
          if (!onBoard(cf, cr)) continue;
          var to = sq(cf, cr), tgt = board[to];
          if (tgt && tgt.c !== color) {
            if (cr === promoRank) {
              ['q', 'r', 'b', 'n'].forEach(function (t) {
                push(moves, { from: from, to: to, promo: t });
              });
            } else {
              push(moves, { from: from, to: to });
            }
          } else if (!tgt && state.ep === to) {
            push(moves, { from: from, to: to, ep: true });
          }
        }
        continue;
      }

      if (p.t === 'n' || p.t === 'k') {
        var deltas = p.t === 'n' ? KNIGHT_DELTAS : KING_DELTAS;
        for (i = 0; i < deltas.length; i++) {
          var nf = f + deltas[i][0], nr = r + deltas[i][1];
          if (!onBoard(nf, nr)) continue;
          var t2 = board[sq(nf, nr)];
          if (!t2 || t2.c !== color) push(moves, { from: from, to: sq(nf, nr) });
        }
        if (p.t === 'k') addCastles(state, color, from, moves);
        continue;
      }

      var dirs = p.t === 'r' ? ROOK_DIRS
        : p.t === 'b' ? BISHOP_DIRS
          : ROOK_DIRS.concat(BISHOP_DIRS);
      for (var d = 0; d < dirs.length; d++) {
        var ff = f + dirs[d][0], rr = r + dirs[d][1];
        while (onBoard(ff, rr)) {
          var s2 = sq(ff, rr), occ = board[s2];
          if (!occ) push(moves, { from: from, to: s2 });
          else {
            if (occ.c !== color) push(moves, { from: from, to: s2 });
            break;
          }
          ff += dirs[d][0]; rr += dirs[d][1];
        }
      }
    }
    return moves;
  }

  function addCastles(state, color, kingSq, moves) {
    var board = state.board, home = color === 'w' ? 0 : 7;
    if (kingSq !== sq(4, home)) return;
    if (isAttacked(board, kingSq, other(color))) return;

    var rights = state.castling;
    var canK = color === 'w' ? rights.wk : rights.bk;
    var canQ = color === 'w' ? rights.wq : rights.bq;

    if (canK && !board[sq(5, home)] && !board[sq(6, home)]
      && !isAttacked(board, sq(5, home), other(color))
      && !isAttacked(board, sq(6, home), other(color))) {
      moves.push({ from: kingSq, to: sq(6, home), castle: 'k' });
    }
    if (canQ && !board[sq(3, home)] && !board[sq(2, home)] && !board[sq(1, home)]
      && !isAttacked(board, sq(3, home), other(color))
      && !isAttacked(board, sq(2, home), other(color))) {
      moves.push({ from: kingSq, to: sq(2, home), castle: 'q' });
    }
  }

  /* Apply a move, returning a fresh state. Assumes the move is legal. */
  function makeMove(state, move) {
    var s = clone(state);
    var b = s.board;
    var piece = b[move.from];
    var home = piece.c === 'w' ? 0 : 7;

    s.half = (piece.t === 'p' || b[move.to]) ? 0 : s.half + 1;

    b[move.to] = move.promo ? { t: move.promo, c: piece.c } : piece;
    b[move.from] = null;

    if (move.ep) b[sq(fileOf(move.to), rankOf(move.from))] = null;

    if (move.castle === 'k') {
      b[sq(5, home)] = b[sq(7, home)];
      b[sq(7, home)] = null;
    } else if (move.castle === 'q') {
      b[sq(3, home)] = b[sq(0, home)];
      b[sq(0, home)] = null;
    }

    // castling rights
    if (piece.t === 'k') {
      if (piece.c === 'w') { s.castling.wk = s.castling.wq = false; }
      else { s.castling.bk = s.castling.bq = false; }
    }
    if (move.from === sq(0, 0) || move.to === sq(0, 0)) s.castling.wq = false;
    if (move.from === sq(7, 0) || move.to === sq(7, 0)) s.castling.wk = false;
    if (move.from === sq(0, 7) || move.to === sq(0, 7)) s.castling.bq = false;
    if (move.from === sq(7, 7) || move.to === sq(7, 7)) s.castling.bk = false;

    s.ep = move.dbl ? sq(fileOf(move.from), (rankOf(move.from) + rankOf(move.to)) / 2) : null;
    if (s.turn === 'b') s.full++;
    s.turn = other(s.turn);
    return s;
  }

  function legalMoves(state, color) {
    color = color || state.turn;
    var pseudo = pseudoMoves(state, color), out = [];
    for (var i = 0; i < pseudo.length; i++) {
      var next = makeMove(state, pseudo[i]);
      if (!inCheck(next, color)) out.push(pseudo[i]);
    }
    return out;
  }

  function movesFrom(state, from) {
    return legalMoves(state).filter(function (m) { return m.from === from; });
  }

  function insufficientMaterial(board) {
    var pieces = [];
    for (var i = 0; i < 64; i++) if (board[i]) pieces.push(board[i]);
    if (pieces.length > 4) return false;
    var minors = pieces.filter(function (p) { return p.t === 'b' || p.t === 'n'; });
    var others = pieces.filter(function (p) { return p.t !== 'k' && p.t !== 'b' && p.t !== 'n'; });
    if (others.length) return false;
    return minors.length <= 1 || (minors.length === 2 && pieces.length === 4);
  }

  /* 'playing' | 'checkmate' | 'stalemate' | 'draw' */
  function status(state) {
    var moves = legalMoves(state);
    if (!moves.length) return inCheck(state, state.turn) ? 'checkmate' : 'stalemate';
    if (state.half >= 100) return 'draw';
    if (insufficientMaterial(state.board)) return 'draw';
    return 'playing';
  }

  /* Short algebraic notation for a move in the given (pre-move) state. */
  function toSAN(state, move) {
    var piece = state.board[move.from];
    if (!piece) return '';
    if (move.castle === 'k') return decorate('O-O');
    if (move.castle === 'q') return decorate('O-O-O');

    var capture = !!state.board[move.to] || move.ep;
    var text;
    if (piece.t === 'p') {
      text = (capture ? FILES[fileOf(move.from)] + 'x' : '') + name(move.to);
      if (move.promo) text += '=' + move.promo.toUpperCase();
    } else {
      // disambiguate against same-type pieces reaching the same square
      var rivals = legalMoves(state).filter(function (m) {
        var q = state.board[m.from];
        return q && q.t === piece.t && q.c === piece.c
          && m.to === move.to && m.from !== move.from;
      });
      var hint = '';
      if (rivals.length) {
        var sameFile = rivals.some(function (m) { return fileOf(m.from) === fileOf(move.from); });
        var sameRank = rivals.some(function (m) { return rankOf(m.from) === rankOf(move.from); });
        hint = sameFile && sameRank ? name(move.from)
          : sameFile ? String(rankOf(move.from) + 1)
            : FILES[fileOf(move.from)];
      }
      text = piece.t.toUpperCase() + hint + (capture ? 'x' : '') + name(move.to);
    }
    return decorate(text);

    function decorate(base) {
      var next = makeMove(state, move);
      if (inCheck(next, next.turn)) {
        base += legalMoves(next).length ? '+' : '#';
      }
      return base;
    }
  }

  global.Engine = {
    newGame: newGame,
    clone: clone,
    sq: sq,
    fileOf: fileOf,
    rankOf: rankOf,
    name: name,
    other: other,
    legalMoves: legalMoves,
    movesFrom: movesFrom,
    makeMove: makeMove,
    inCheck: inCheck,
    isAttacked: isAttacked,
    findKing: findKing,
    status: status,
    toSAN: toSAN
  };
})(window);
