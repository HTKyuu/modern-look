/*
 * Native <dialog> wiring.
 * [data-dialog-open="id"] opens; [data-dialog-close] inside closes;
 * clicking the backdrop closes; Escape is handled by the browser.
 * Focus returns to the opener automatically with showModal().
 */
export function initDialogs(root = document) {
  root.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-dialog-open]');
    if (opener) {
      const dialog = document.getElementById(opener.getAttribute('data-dialog-open'));
      if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
        const first = dialog.querySelector('[autofocus], input, select, textarea, button:not([data-dialog-close])');
        if (first) first.focus();
      }
      return;
    }
    const closer = e.target.closest('[data-dialog-close]');
    if (closer) {
      const dialog = closer.closest('dialog');
      if (dialog) dialog.close('cancel');
    }
  });

  root.querySelectorAll('dialog.dialog').forEach((dialog) => {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close('dismiss');
    });
  });
}
