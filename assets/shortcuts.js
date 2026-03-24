const search = document.getElementById("search");

document.addEventListener('keydown', e => {
  if (!search) return;

  const active = document.activeElement;
  const typing = active === search;

  const actions = {
    'h': () => { if (!typing) window.location.href = '/'; },
    'd': () => { if (!typing) window.location.href = '/data/'; },
    'r': () => { if (!typing && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) window.open('https://github.com/vahrina/dmon', '_blank'); },
    '/': e => { if (!typing) { e.preventDefault(); search.focus(); } },
    'Escape': () => { if (typing) search.blur(); },
    'Backspace': () => { if (!typing) window.history.back(); },
  };

  const list = document.getElementById('list');
  const anchors = list ? [...list.querySelectorAll('tbody a[href]')] : [];

  if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && anchors.length && !typing) {
    e.preventDefault();

    const i = anchors.indexOf(active);
    const dir = e.key === 'ArrowUp' ? -1 : 1;
    const next = (i + dir + anchors.length) % anchors.length;

    anchors[next]?.focus();
  }

  if (actions[e.key]) actions[e.key](e);
})

