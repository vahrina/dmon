(function () {
  var slow = (function () {
    try { if (/(?:^|[?&])logoFire=1/.test(location.search) || localStorage.getItem('logoFire') === '1') return false; } catch (e) {}
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  })();

  if (slow) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn("enable os animations for full fire effects");
    }
    try {
      if (!document.getElementById('motion-debug')) {
        var dbg = document.createElement('div');
        dbg.id = 'motion-debug';
        dbg.className = 'motion-debug';
        dbg.textContent = 'reduced motion [on] - enable os animations for effects';
        document.body.appendChild(dbg);
      }
    } catch (e) {}
  }

  var hue = { 'fire-tip':[-28,32], 'fire-core':[-18,24], 'fire-hot':[-10,16], 'fire-mid':[-7,15], 'fire-deep':[-5,18], 'fire-ember':[-4,10], 'fire-ash':[-3,6] };
  function rand(lo, hi) { return lo + Math.random() * (hi - lo); }

  var timing = {
    'fire-tip':   { oLo:.38, oHi: 1.0, bLo:.72, bHi:1.28, dLo: 85, dHi:460 },
    'fire-core':  { oLo:.50, oHi: .98, bLo:.80, bHi:1.20, dLo:115, dHi:580 },
    'fire-hot':   { oLo:.60, oHi: .97, bLo:.84, bHi:1.15, dLo:175, dHi:760 },
    'fire-mid':   { oLo:.65, oHi: .97, bLo:.87, bHi:1.12, dLo:235, dHi:920 },
    'fire-deep':  { oLo:.68, oHi: .96, bLo:.88, bHi:1.10, dLo:300, dHi:1080 },
    'fire-ember': { oLo:.72, oHi: .95, bLo:.90, bHi:1.08, dLo:390, dHi:1250 },
    'fire-ash':   { oLo:.76, oHi: .94, bLo:.93, bHi:1.04, dLo:500, dHi:1480 }
  };

  function flicker(el) {
    var cls  = el.className || '';
    var band = [-6,12], t = { oLo:.68, oHi:.96, bLo:.88, bHi:1.10, dLo:320, dHi:1260 };
    for (var k in hue)    { if (cls.indexOf(k) > -1) { band = hue[k]; break; } }
    for (var k in timing) { if (cls.indexOf(k) > -1) { t = timing[k]; break; } }
    (function tick() {
      if (slow) {
        el.style.opacity = rand(.80,.94);
        el.style.filter  = 'brightness('+rand(.96,1.03)+') hue-rotate('+rand(band[0],band[1])*.35+'deg)';
        return setTimeout(tick, rand(1050,3100));
      }
      el.style.opacity = rand(t.oLo, t.oHi);
      el.style.filter  = 'brightness('+rand(t.bLo,t.bHi)+') hue-rotate('+rand(band[0],band[1])+'deg) saturate('+rand(.75,1.25)+')';
      setTimeout(tick, rand(t.dLo, t.dHi));
    })();
  }

  var morphPool = ['(',')','\'',',','.','`','|','/','\\'];
  function morph() {
    var all = document.querySelectorAll('pre.logo .logo-morph');
    if (!all.length) return;
    var weights = [], sum = 0;
    for (var i = 0; i < all.length; i++) {
      var w = all[i].className.indexOf('fire-tip') > -1 ? 3 : all[i].className.indexOf('fire-core') > -1 ? 2 : 1;
      sum += w; weights.push(sum);
    }
    var r = Math.random() * sum, el = all[all.length - 1];
    for (var i = 0; i < weights.length; i++) { if (r < weights[i]) { el = all[i]; break; } }
    var next, j = 0;
    do { next = morphPool[Math.floor(Math.random() * morphPool.length)]; } while (next === el.textContent && ++j < 12);
    el.textContent = next;
    setTimeout(morph, slow ? rand(4000,10000) : rand(280,1650));
  }

  function init() {
    try {
      var spans = document.querySelectorAll('pre.logo [class^="fire-"]');
      for (var i = 0; i < spans.length; i++) flicker(spans[i]);
      morph();
    } catch (e) {}
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();

