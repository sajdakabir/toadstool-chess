/* /yc-chess only: boil from sprite sheets instead of stacked images.

   The YC board has far more drawn layers than the woodland one (every
   partner wears a hat on its own layer), and one GPU layer per boiling frame
   proved too many: right after load some pieces were painted before their
   layers were ready. A sprite is one image holding all three wobbly frames
   side by side; CSS flicks through them with background-position, so a
   drawing costs no extra GPU layers. Loaded after ../js/pencil.js, it swaps
   in a sprite-based Pencil.layers for this page alone. */
(function (global) {
  'use strict';

  var WOBBLE_SEEDS = [3, 8, 14];
  var cache = {};

  function filter(id, seed) {
    return '<filter id="' + id + '" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="' + seed + '" result="warp"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="warp" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="wobble"/>' +
      '<feFlood flood-color="#fbf6ea" result="tone"/>' +
      '<feComposite in="tone" in2="wobble" operator="in" result="paper"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.8 0.3" numOctaves="2" seed="12" result="grain"/>' +
      '<feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.4 0 0 0 -0.7" result="tooth"/>' +
      '<feComposite in="wobble" in2="tooth" operator="in" result="grainy"/>' +
      '<feComposite in="grainy" in2="wobble" operator="arithmetic" k1="0" k2="0.45" k3="0.55" k4="0" result="pencilled"/>' +
      '<feMerge><feMergeNode in="paper"/><feMergeNode in="pencilled"/></feMerge></filter>';
  }

  /* one image, three frames across, each traced with its own wobble */
  function sheet(key, box, markup) {
    if (cache[key]) return cache[key];
    var w = box[2], h = box[3], frames = '';
    WOBBLE_SEEDS.forEach(function (seed, i) {
      frames += '<defs>' + filter('p' + i, seed) + '</defs>' +
        '<svg x="' + i * w + '" y="0" width="' + w + '" height="' + h + '" viewBox="' + box.join(' ') + '">' +
        '<g filter="url(#p' + i + ')">' + markup + '</g></svg>';
    });
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + 3 * w + '" height="' + h +
      '" viewBox="0 0 ' + 3 * w + ' ' + h + '">' + frames + '</svg>';
    cache[key] = "url('data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg).replace(/'/g, '%27') + "')";
    return cache[key];
  }

  global.Pencil.layers = function (key, box, markup, still) {
    return '<span class="sprite' + (still ? ' still' : '') + '" style="background-image:' + sheet(key, box, markup) + '"></span>';
  };
})(window);
