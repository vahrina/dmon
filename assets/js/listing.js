(function () {
  const LISTING_TTL = 24 * 60 * 60 * 1000;
  const SIZE_TTL = 7 * 24 * 60 * 60 * 1000;
  const CP = 'dmon_';

  async function cachedFetch(url) {
    const key = CP + url;
    try {
      const hit = localStorage.getItem(key);
      if (hit) {
        const { ts, data } = JSON.parse(hit);
        if (Date.now() - ts < LISTING_TTL) return Promise.resolve(data);
      }
    } catch (_) { }
    return fetch(url)
      .then(r => { if (!r.ok) throw 0; return r.json(); })
      .then(data => {
        try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch (_) { }
        return data;
      });
  }

  window.dmonFetch = cachedFetch;

  function dirTotalBytes(relPath) {
    const tkey = CP + 'total:' + relPath;
    try {
      const hit = localStorage.getItem(tkey);
      if (hit) {
        const { ts, total } = JSON.parse(hit);
        if (Date.now() - ts < SIZE_TTL) return Promise.resolve(total);
      }
    } catch (_) { }
    return cachedFetch('/api/' + relPath)
      .then(entries => {
        let filesSum = 0;
        const subdirs = [];
        for (const e of entries) {
          if (e.name === 'index.html') continue;
          if (e.type === 'directory') subdirs.push(relPath + e.name + '/');
          else filesSum += e.size || 0;
        }
        return Promise.all(subdirs.map(dirTotalBytes)).then(parts => {
          const total = filesSum + parts.reduce((a, b) => a + b, 0);
          try { localStorage.setItem(tkey, JSON.stringify({ ts: Date.now(), total })); } catch (_) { }
          return total;
        });
      });
  }

  function fmtSize(b) {
    if (!b) return '-';
    const u = ['b', 'k', 'm', 'g', 't'];
    let i = 0;
    while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
    return (i === 0 ? b : b.toFixed(1)) + u[i];
  }

  function fmtDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d)) return '-';
    const mon = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return `${String(d.getDate()).padStart(2, '0')}-${mon[d.getMonth()]}-${d.getFullYear()}`;
  }

  const tbody = document.querySelector('#list tbody');
  if (!tbody) return;

  const dataRel = location.pathname.replace(/^\/data\/?/, '');
  const listUrl = `/api/${dataRel}`;

  // mark completed dirs with a star
  const completeP = fetch('/complete.json')
    .then(r => r.json())
    .catch(() => []);

  // ^ matching ^\/data\/?
  const normalizeCompletePath = p =>
  (p ? (s => s.endsWith('/') ? s : s + '/')(
    String(p).trim().replace(/^\/+/, '')
  ) : '');

  Promise.all([cachedFetch(listUrl), completeP])
    .then(([entries, completeDirs]) => {
      const completeSet = new Set((completeDirs || []).map(normalizeCompletePath));
      window.dmonCompleteDirs = completeSet;

      entries
        .filter(e => e.name !== 'index.html')
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
          return a.name.localeCompare(b.name);
        })
        .forEach(e => {
          const isDir = e.type === 'directory';
          const name = isDir ? e.name + '/' : e.name;
          const size = isDir ? '~' : fmtSize(e.size);
          const date = fmtDate(e.mtime);
          const badge = (isDir && completeSet.has(dataRel + name))
            ? '<span class="complete-mark">*</span>' : '';

          const tr = document.createElement('tr');
          tr.innerHTML =
            `<td class="link"><a href="${encodeURI(name)}">${name}${badge}</a></td>` +
            `<td class="size">${size}</td>` +
            `<td class="date">${date}</td>`;
          tbody.appendChild(tr);

          if (isDir) {
            const sizeCell = tr.querySelector('td.size');
            const rel = dataRel + e.name + '/';
            dirTotalBytes(rel)
              .then(total => { sizeCell.textContent = total ? fmtSize(total) : '~'; })
              .catch(() => { sizeCell.textContent = '~'; });
          }
        });
    })
    .catch(() => { });
})();
