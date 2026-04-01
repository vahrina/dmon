document.addEventListener('DOMContentLoaded', () => {
  const VIM_LS = 'dmon_vim_visible';
  const fileNameEl = document.getElementById('file-name');
  const fileTypeEl = document.getElementById('file-type');
  const posEl = document.getElementById('pos');
  const footerEl = document.getElementById('vim-footer');

  if (!fileNameEl || !fileTypeEl || !posEl) return;

  try {
    if (localStorage.getItem(VIM_LS) === '1') footerEl?.classList.remove('hidden');
    else footerEl?.classList.add('hidden');
  } catch (_) { }

  const path = window.location.pathname;
  const segments = path.split('/').filter(Boolean);
  let fileName = segments.length ? segments[segments.length - 1] : 'index.html';
  if (!fileName || fileName.endsWith('/')) fileName = 'index.html';

  const dotIndex = fileName.lastIndexOf('.');
  const fileType = dotIndex > -1 && dotIndex < fileName.length - 1
    ? fileName.slice(dotIndex + 1).toLowerCase()
    : 'text';

  fileNameEl.textContent = fileName;
  fileTypeEl.textContent = fileType;

  function updatePosition() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (docHeight <= 0 || scrollTop <= 0) {
      posEl.textContent = 'top';
      return;
    }

    if (scrollTop >= docHeight - 1) {
      posEl.textContent = 'bot';
      return;
    }

    const percent = Math.round((scrollTop / docHeight) * 100);
    posEl.textContent = `${percent}%`;
  }

  document.addEventListener('keydown', e => {
    if (e.key !== 'v' || e.ctrlKey || e.metaKey || e.altKey) return;
    const typing = document.activeElement?.tagName === 'INPUT' ||
      document.activeElement?.tagName === 'TEXTAREA' ||
      document.activeElement?.isContentEditable;
    if (typing) return;
    if (!footerEl) return;
    e.preventDefault();
    footerEl.classList.toggle('hidden');
    try {
      localStorage.setItem(VIM_LS, footerEl.classList.contains('hidden') ? '0' : '1');
    } catch (_) { }
  });

  window.addEventListener('scroll', updatePosition, { passive: true });
  window.addEventListener('resize', updatePosition);
  updatePosition();
});

