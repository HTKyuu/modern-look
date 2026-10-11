/* Mobile navigation disclosure. Desktop shows the nav inline via CSS. */
export function initMenu(root = document) {
  root.querySelectorAll('.nav-toggle').forEach((btn) => {
    const nav = document.getElementById(btn.getAttribute('aria-controls'));
    if (!nav) return;
    const isOpen = () => btn.getAttribute('aria-expanded') === 'true';
    const set = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      nav.setAttribute('data-open', String(open));
    };
    btn.addEventListener('click', () => set(!isOpen()));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) { set(false); btn.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (isOpen() && !nav.contains(e.target) && !btn.contains(e.target)) set(false);
    });
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    const desktop = window.matchMedia('(min-width: 56rem)');
    desktop.addEventListener('change', (e) => { if (e.matches) set(false); });
  });
}
