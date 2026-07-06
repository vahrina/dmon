(function () {
  const INDEX_KEY = 'dmon_global_index';
  const CACHE_TTL = 24 * 60 * 60 * 1000;

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
      return cf('/api/' + relPath).then(entries => {
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

  window.dmonBuildIndex = buildIndex;
  window.dmonStatusHint = ' | ~f file · ~d dir · !dirX,dirY';

  const STATUS_HINT = window.dmonStatusHint;

  function norm(s) { return s.toLowerCase().replace(/-/g, ' '); }

  function dirPathHitExclude(dirPathLower, excludes) {
    const segments = dirPathLower.split('/').filter(Boolean);
    const segn = segments.map(norm);
    return excludes.some(ex => {
      const exn = norm(ex);
      return exn && segn.some(s => s === exn);
    });
  }

  function highlightTokens(text, tokens) {
    if (!tokens.length) return text;
    const n = norm(text);
    const ranges = [];
    for (const t of tokens) {
      const nt = norm(t);
      let i = 0;
      while (i < n.length) {
        const p = n.indexOf(nt, i);
        if (p === -1) break;
        ranges.push([p, p + nt.length]);
        i = p + 1;
      }
    }
    if (!ranges.length) return text;
    ranges.sort((a, b) => a[0] - b[0]);
    const merged = [ranges[0].slice()];
    for (let i = 1; i < ranges.length; i++) {
      const last = merged[merged.length - 1];
      if (ranges[i][0] <= last[1]) last[1] = Math.max(last[1], ranges[i][1]);
      else merged.push(ranges[i].slice());
    }
    let out = '', prev = 0;
    for (const [s, e] of merged) {
      out += text.slice(prev, s) + '<mark>' + text.slice(s, e) + '</mark>';
      prev = e;
    }
    return out + text.slice(prev);
  }

  function displayName(entry) {
    if (entry.dir) return entry.name;
    const n = entry.name;
    const lower = n.toLowerCase();
    const exts = [
      '.zip', '.7z', '.rar', '.iso', '.rvz',
      '.tar.gz', '.tar.xz', '.tar.bz2',
    ];
    for (const ext of exts) {
      if (lower.endsWith(ext)) return n.slice(0, n.length - ext.length);
    }
    return n;
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
    document.body.classList.add('gs-open');

    const inp = document.getElementById('gs-input');
    const status = document.getElementById('gs-status');
    const list = document.getElementById('gs-results');
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
      if (rawQ.startsWith('~d')) { filterDirs = true; term = rawQ.slice(2).trim(); }
      else if (rawQ.startsWith('~f')) { filterDirs = false; term = rawQ.slice(2).trim(); }
      else if (rawQ.startsWith('~')) { setStatus('invalid argument'); return; }

      const excludes = [];
      term = term.split(/\s+/).filter(w => {
        if (w.startsWith('!') && w.length > 1) {
          const body = w.slice(1).toLowerCase();
          for (const part of body.split(',').map(p => p.trim()).filter(Boolean)) {
            excludes.push(part);
          }
          return false;
        }
        return true;
      }).join(' ');

      const tokens = term ? term.split(/\s+/).filter(Boolean) : [];

      if (filterDirs === false && !tokens.length && !excludes.length) { setStatus('filter files'); return; }
      if (filterDirs === null && !tokens.length && !excludes.length) { setStatus(index.length.toLocaleString() + ' entries indexed'); return; }
      if (!excludes.length && tokens.length > 0 && tokens.every(t => t.length <= 1)) return;

      const normTokens = tokens.map(norm);

      const t0 = performance.now();

      let hits = index.filter(e => {
        if (filterDirs !== null && e.dir !== filterDirs) return false;
        if (normTokens.length) {
          const n = norm(e.name);
          if (!normTokens.every(t => n.includes(t))) return false;
        }
        if (excludes.length) {
          const dirPath = e.dir
            ? e.path.toLowerCase()
            : e.path.slice(0, e.path.length - e.name.length).toLowerCase();
          if (dirPathHitExclude(dirPath, excludes)) return false;
        }
        return true;
      });

      hits.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);

      if (filterDirs === true && !term) {
        setStatus(`${hits.length.toLocaleString()} director${hits.length !== 1 ? 'ies' : 'y'}`);
      } else {
        const elapsed = (performance.now() - t0).toFixed(1);
        setStatus(`${hits.length.toLocaleString()} result${hits.length !== 1 ? 's' : ''} in ${elapsed}ms`);
      }

      const frag = document.createDocumentFragment();
      for (const e of hits) {
        const rel = e.path.slice(6); // strip '/data/'
        const dirPart = rel.slice(0, rel.length - e.name.length - (e.dir ? 1 : 0));

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = encodeURI(e.path);

        if (dirPart) {
          const ds = document.createElement('span');
          ds.className = 'gs-dir';
          ds.textContent = dirPart;
          ds.addEventListener('click', ev => {
            ev.preventDefault();
            ev.stopPropagation();
            location.href = encodeURI('/data/' + dirPart);
          });
          a.appendChild(ds);
        }

        const ns = document.createElement('span');
        ns.className = 'gs-name';
        const shown = displayName(e);
        ns.innerHTML = highlightTokens(shown, tokens) + (e.dir ? '/' : '');
        if (e.dir && window.dmonCompleteDirs?.has(e.path.slice(6))) {
          const badge = document.createElement('span');
          badge.className = 'gs-complete';
          badge.textContent = '*';
          ns.appendChild(badge);
        }
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
    document.body.classList.remove('gs-open');
  }

  document.addEventListener('keydown', e => {
    const typing = document.activeElement?.tagName === 'INPUT' ||
      document.activeElement?.tagName === 'TEXTAREA';
    if (typing || e.key !== 'g') return;
    e.preventDefault();
    openModal();
  });
})();
