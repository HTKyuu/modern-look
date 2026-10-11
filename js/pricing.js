/*
 * Billing period switch for the pricing page.
 * [data-billing-switch] is a button role="switch"; prices carry
 * data-price-monthly / data-price-annual; [data-billing-annual-only]
 * elements show only when annual is selected.
 */
export function initPricing(root = document) {
  const toggle = root.querySelector('[data-billing-switch]');
  if (!toggle) return;
  const update = () => {
    const annual = toggle.getAttribute('aria-checked') === 'true';
    root.querySelectorAll('[data-price-monthly]').forEach((el) => {
      el.textContent = annual ? el.dataset.priceAnnual : el.dataset.priceMonthly;
    });
    root.querySelectorAll('[data-billing-annual-only]').forEach((el) => { el.hidden = !annual; });
  };
  toggle.addEventListener('click', () => {
    toggle.setAttribute('aria-checked', String(toggle.getAttribute('aria-checked') !== 'true'));
    update();
  });
  update();
}
