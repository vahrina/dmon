(function () {
  const INDEX_KEY = 'dmon_global_index';
  const CACHE_TTL = 60 * 60 * 1000;

  function buildIndex() {
    try {
      const hit = localStorage.getItem(INDEX_KEY);
      if (hit) {
        const { ts, index } = JSON.parse(hit);
        if (Date.now() - ts < CACHE_TTL) return Promise.resolve(index);
      }
    } catch (_) { }

    const index = [];
    const cf = window.dmonFetch;

    function crawl(relPath) {
      return cf('/api/list/' + relPath).then(entries => {
        const subs = [];
        for (const e of entries) {
          if (e.name === 'index.html') continue;
          const full = '/data/' + relPath + e.name;
          if (e.type === 'directory') {
            index.push({ path: full + '/', name: e.name, dir: true });
            subs.push(crawl(relPath + e.name + '/'));
          } else {
            index.push({ path: full, name: e.name, dir: false });
          }
        }
        return Promise.all(subs);
      });
    }

    return crawl('').then(() => {
      try { localStorage.setItem(INDEX_KEY, JSON.stringify({ ts: Date.now(), index })); } catch (_) { }
      return index;
    });
  }

  function highlight(text, query) {
    if (!query) return text;
    const i = text.toLowerCase().indexOf(query.toLowerCase());
    if (i === -1) return text;
    return text.slice(0, i) +
      '<mark>' + text.slice(i, i + query.length) + '</mark>' +
      text.slice(i + query.length);
  }

  function openModal() {
    if (document.getElementById('gs-overlay')) return;

    const STATUS_HINT = ' |  >d dir · >f file';

    const overlay = document.createElement('div');
    overlay.id = 'gs-overlay';
    overlay.innerHTML =
      '<div id="gs-modal">' +
      '<input id="gs-input" type="text" autocomplete="off" spellcheck="false">' +
      '<div id="gs-status">building index...</div>' +
      '<ul id="gs-results"></ul>' +
      '</div>';
    document.body.appendChild(overlay);

    const inp = document.getElementById('gs-input');
    const status = document.getElementById('gs-status');
    const list = document.getElementById('gs-results');
    inp.placeholder = 'search...';
    inp.focus();

    function setStatus(main) {
      status.textContent = main + STATUS_HINT;
    }

    setStatus('building index...');

    let index = null;

    buildIndex().then(idx => {
      index = idx;
      setStatus(idx.length.toLocaleString() + ' entries indexed');
    }).catch(() => {
      setStatus('failed to index');
    });

    function render(rawQ) {
      list.innerHTML = '';

      if (!rawQ) {
        setStatus(index
          ? index.length.toLocaleString() + ' entries indexed'
          : 'building index...');
        return;
      }

      if (!index) { setStatus('still indexing...'); return; }

      let filterDirs = null, term = rawQ;
      if (rawQ.startsWith('>d')) { filterDirs = true; term = rawQ.slice(2).trim(); }
      else if (rawQ.startsWith('>f')) { filterDirs = false; term = rawQ.slice(2).trim(); }
      else if (rawQ.startsWith('>')) { setStatus('invalid argument'); return; }

      if (filterDirs === false && !term) {
        setStatus('filter files');
        return;
      }

      // no prefix + no term
      if (filterDirs === null && !term) {
        setStatus(index.length.toLocaleString() + ' entries indexed');
        return;
      }

      // require 2+ chars in search term
      if (term.length === 1) {
        return;
      }

      const ql = term.toLowerCase();
      const t0 = term ? performance.now() : null;

      let hits = index.filter(e =>
        (filterDirs === null || e.dir === filterDirs) &&
        (!ql || e.name.toLowerCase().includes(ql))
      );

      if (filterDirs === null) hits.sort((a, b) => b.dir - a.dir);

      // >d with no term
      if (filterDirs === true && !term) {
        setStatus(`${hits.length} director${hits.length !== 1 ? 'ies' : 'y'}`);
      } else {
        const elapsed = (performance.now() - t0).toFixed(1);
        setStatus(`${hits.length} results in ${elapsed}ms`);
      }

      hits.forEach(e => {
        const li = document.createElement('li');
        const a = document.createElement('a');

        // parent path relative to /data/
        const rel = e.path.replace(/^\/data\//, '');
        const dirPart = rel.slice(0, rel.length - e.name.length - (e.dir ? 1 : 0));

        a.href = encodeURI(e.path);
        a.title = e.path;
        a.innerHTML =
          (dirPart ? '<span class="gs-dir">' + dirPart + '</span>' : '') +
          '<span class="gs-name">' + highlight(e.name, term) + (e.dir ? '/' : '') + '</span>';
        li.appendChild(a);
        list.appendChild(li);
      });
    }

    inp.addEventListener('input', () => render(inp.value.trim()));

    inp.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        list.querySelector('li a')?.focus();
      }
    });

    list.addEventListener('keydown', e => {
      const items = [...list.querySelectorAll('li a')];
      const i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        (items[i + 1] ?? items[0])?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (i <= 0) inp.focus();
        else items[i - 1]?.focus();
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
        inp.focus();
        inp.value += e.key;
        inp.dispatchEvent(new Event('input'));
      }
    });

    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    overlay.addEventListener('keydown', e => {
      if (e.key === 'Escape') { close(); return; }
      e.stopPropagation();
    });
  }

  function close() {
    const el = document.getElementById('gs-overlay');
    if (el) el.remove();
  }

  document.addEventListener('keydown', e => {
    const typing = document.activeElement &&
      (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA');
    if (e.key === 'g' && !typing) {
      e.preventDefault();
      openModal();
    }
  });
})();

