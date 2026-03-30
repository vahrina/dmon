(function () {
  function clearCache() {
    Object.keys(localStorage)
      .filter(k => k.startsWith('dmon_'))
      .forEach(k => localStorage.removeItem(k));
  }

  document.addEventListener('keydown', e => {
    const typing = document.activeElement?.tagName === 'INPUT' ||
      document.activeElement?.tagName === 'TEXTAREA';
    if (typing) return;

    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      clearCache();
      window.dmonToast('cache cleared', 3000);

      const status = document.getElementById('gs-status');
      const inp = document.getElementById('gs-input');
      if (status && inp) {
        inp.value = '';
        status.textContent = 'rebuilding index...';
        (window.dmonBuildIndex?.() ?? Promise.reject())
          .then(idx => {
            inp.dispatchEvent(new Event('input'));
            status.textContent = idx.length.toLocaleString() + ' entries indexed | >d dir · >f file';
          })
          .catch(() => { status.textContent = 'failed to rebuild index'; });
      }
    }
  });
})();
