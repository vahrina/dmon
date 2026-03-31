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
    } catch (_) {}

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
      try { localStorage.setItem(INDEX_KEY, JSON.stringify({ ts: Date.now(), index })); } catch (_) {}
      return index;
    });
  }

  // expose for ui.js
  window.dmonBuildIndex = buildIndex;
  window.dmonStatusHint = ' | >d dir · >f file · <exclude';

  const STATUS_HINT = window.dmonStatusHint;

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

    const overlay = document.createElement('div');
    overlay.id = 'gs-overlay';
    overlay.innerHTML =
      '<div id="gs-modal">' +
      '<input id="gs-input" type="text" autocomplete="off" spellcheck="false" placeholder="search...">' +
      '<div id="gs-status"></div>' +
      '<ul id="gs-results"></ul>' +
      '</div>';
    document.body.appendChild(overlay);

    const inp    = document.getElementById('gs-input');
    const status = document.getElementById('gs-status');
    const list   = document.getElementById('gs-results');
    inp.focus();

    function setStatus(main) { status.textContent = main + STATUS_HINT; }

    setStatus('building index...');

    let index = null;

    buildIndex().then(idx => {
      index = idx;
      setStatus(idx.length.toLocaleString() + ' entries indexed');
    }).catch(() => setStatus('failed to index'));

    function render(rawQ) {
      list.innerHTML = '';

      if (!rawQ) {
        setStatus(index ? index.length.toLocaleString() + ' entries indexed' : 'building index...');
        return;
      }

      if (!index) { setStatus('still indexing...'); return; }

      let filterDirs = null, term = rawQ;
      if (rawQ.startsWith('>d')) { filterDirs = true;  term = rawQ.slice(2).trim(); }
      else if (rawQ.startsWith('>f')) { filterDirs = false; term = rawQ.slice(2).trim(); }
      else if (rawQ.startsWith('>')) { setStatus('invalid argument'); return; }

      // Extract <exclusion tokens; only apply those with 3+ chars (too short = too expensive)
      const excludes = [];
      term = term.split(/\s+/).filter(w => {
        if (w.startsWith('<') && w.length > 1) {
          const ex = w.slice(1).toLowerCase();
          if (ex.length >= 3) excludes.push(ex);
          return false;
        }
        return true;
      }).join(' ');

      if (filterDirs === false && !term && !excludes.length) { setStatus('filter files'); return; }
      if (filterDirs === null  && !term && !excludes.length) { setStatus(index.length.toLocaleString() + ' entries indexed'); return; }
      if (!excludes.length && term.length === 1) return;

      const ql = term.toLowerCase();
      const t0 = performance.now();

      let hits = index.filter(e => {
        if (filterDirs !== null && e.dir !== filterDirs) return false;
        if (ql && !e.name.toLowerCase().includes(ql)) return false;
        if (excludes.length) {
          // For files, check only the parent directory path (not the filename).
          // For dirs, check the dir's own path so '<amiibo' excludes the amiibo dir itself.
          const dirPath = e.dir
            ? e.path.toLowerCase()
            : e.path.slice(0, e.path.length - e.name.length).toLowerCase();
          if (excludes.some(ex => dirPath.includes(ex))) return false;
        }
        return true;
      });

      hits.sort((a, b) => a.path.localeCompare(b.path));

      if (filterDirs === true && !term) {
        setStatus(`${hits.length} director${hits.length !== 1 ? 'ies' : 'y'}`);
      } else {
        const elapsed = (performance.now() - t0).toFixed(1);
        setStatus(`${hits.length} result${hits.length !== 1 ? 's' : ''} in ${elapsed}ms`);
      }

      const frag = document.createDocumentFragment();
      for (const e of hits) {
        const rel     = e.path.slice(6); // strip '/data/'
        const dirPart = rel.slice(0, rel.length - e.name.length - (e.dir ? 1 : 0));

        const li = document.createElement('li');
        const a  = document.createElement('a');
        a.href  = encodeURI(e.path);
        a.title = e.path;

        if (dirPart) {
          const ds = document.createElement('span');
          ds.className = 'gs-dir';
          ds.textContent = dirPart;
          a.appendChild(ds);
        }

        const ns = document.createElement('span');
        ns.className = 'gs-name';
        ns.innerHTML = highlight(e.name, term) + (e.dir ? '/' : '');
        a.appendChild(ns);

        li.appendChild(a);
        frag.appendChild(li);
      }
      list.appendChild(frag);
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
    document.getElementById('gs-overlay')?.remove();
  }

  document.addEventListener('keydown', e => {
    const typing = document.activeElement?.tagName === 'INPUT' ||
                   document.activeElement?.tagName === 'TEXTAREA';
    if (typing || e.key !== 'g') return;
    e.preventDefault();
    openModal();
  });
})();
