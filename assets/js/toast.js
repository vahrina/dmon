window.dmonToast = (function () {
  let el, timer;

  function getEl() {
    if (!el) {
      el = document.createElement('div');
      el.id = 'dmon-toast';
      document.body.appendChild(el);
    }
    return el;
  }

  return function toast(msg, ms) {
    const node = getEl();
    node.textContent = msg;
    node.classList.add('visible');
    clearTimeout(timer);
    timer = setTimeout(() => node.classList.remove('visible'), ms || 3000);
  };
})();
