document.addEventListener('DOMContentLoaded', () => {
  const search = document.getElementById("search");

  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== search) {
      e.preventDefault();
      search.focus();
    } else if (e.key === 'Escape' && document.activeElement === search) {
      search.blur();
    }
  });
});
