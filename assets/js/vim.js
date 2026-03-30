document.addEventListener('DOMContentLoaded', () => {
  const fileNameEl = document.getElementById('file-name');
  const fileTypeEl = document.getElementById('file-type');
  const posEl = document.getElementById('pos');

  if (!fileNameEl || !fileTypeEl || !posEl) return;

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

  document.addEventListener('keydown', e => e.key === 'v' && document.getElementById("vim-footer").classList.toggle("hidden"));

  window.addEventListener('scroll', updatePosition, { passive: true });
  window.addEventListener('resize', updatePosition);
  updatePosition();
});

