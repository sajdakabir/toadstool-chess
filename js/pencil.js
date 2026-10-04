/* Coloured-pencil rendering shared by pieces and doodles.

   A drawing is baked into three standalone SVG images, each run through the
   pencil filter with a slightly different hand-wobble. Stacked and flicked
   between at 8 frames a second they "boil", the way a hand-drawn cartoon
   shimmers because every frame was traced again. Baking means the filter runs
   once per image, not once per frame, and identical drawings (eight pawns)
   share one decoded image. */
(function (global) {
  'use strict';

  var WOBBLE_SEEDS = [3, 8, 14];
  var cache = {};

  function filter(seed) {
    return '<filter id="p" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="' + seed + '" result="warp"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="warp" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="wobble"/>' +
      // the drawing's own paper underneath, so nothing shows through it
      '<feFlood flood-color="#fbf6ea" result="tone"/>' +
      '<feComposite in="tone" in2="wobble" operator="in" result="paper"/>' +
      // streaky grain knocked out of the colour; same grain every frame, only the edges wobble
      '<feTurbulence type="fractalNoise" baseFrequency="0.8 0.3" numOctaves="2" seed="12" result="grain"/>' +
      '<feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.4 0 0 0 -0.7" result="tooth"/>' +
      '<feComposite in="wobble" in2="tooth" operator="in" result="grainy"/>' +
      '<feComposite in="grainy" in2="wobble" operator="arithmetic" k1="0" k2="0.45" k3="0.55" k4="0" result="pencilled"/>' +
      '<feMerge><feMergeNode in="paper"/><feMergeNode in="pencilled"/></feMerge></filter>';
  }

  /* Data URLs for the three boiling frames of a drawing. `key` names the
     drawing for the cache; `box` is its viewBox as [x, y, w, h]. */
  function frames(key, box, markup) {
    if (cache[key]) return cache[key];
    var vb = box.join(' ');
    cache[key] = WOBBLE_SEEDS.map(function (seed) {
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" width="' + box[2] + '" height="' + box[3] + '">' +
        '<defs>' + filter(seed) + '</defs><g filter="url(#p)">' + markup + '</g></svg>';
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
    return cache[key];
  }

  /* The three stacked <img> frames, ready to boil. `still` gives just one. */
  function layers(key, box, markup, still) {
    var urls = frames(key, box, markup);
    return (still ? urls.slice(0, 1) : urls).map(function (url, i) {
      // decode with the page so a body is never painted before it is ready
      return '<img class="boil b' + i + '" src="' + url + '" alt="" draggable="false" decoding="sync">';
    }).join('');
  }

  global.Pencil = { frames: frames, layers: layers };
})(window);
