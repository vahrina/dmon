(function () {
  'use strict';

  var reduce = typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var morphPool = ['(', ')', "'", ',', '.', '`'];

  function flicker(el) {
    if (reduce) return;
    function tick() {
      var o = 0.68 + Math.random() * 0.28;
      var b = 0.92 + Math.random() * 0.14;
      el.style.opacity = String(o);
      el.style.filter = 'brightness(' + b + ')';
      setTimeout(tick, 320 + Math.random() * 1100);
    }
    tick();
  }

  function morphTick() {
    var morphs = document.querySelectorAll('pre.logo .logo-morph');
    if (!morphs.length) return;
    var el = morphs[Math.floor(Math.random() * morphs.length)];
    var cur = el.textContent;
    var next;
    var guard = 0;
    do {
      next = morphPool[Math.floor(Math.random() * morphPool.length)];
      guard++;
    } while (next === cur && morphPool.length > 1 && guard < 12);

    el.textContent = next;
    setTimeout(morphTick, 1200 + Math.random() * 3800);
  }

  function init() {
    var logos = document.querySelectorAll('pre.logo');
    if (!logos.length) return;

    logos.forEach(function (logo) {
      logo.querySelectorAll('[class^="fire-"]').forEach(flicker);
    });

    if (!reduce) morphTick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
