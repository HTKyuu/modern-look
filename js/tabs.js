/*
 * Tabs (WAI-ARIA pattern, automatic activation).
 * Markup: [data-tabs] > [role=tablist] > button[role=tab][aria-controls]
 *         and matching [role=tabpanel] elements.
 */
export function initTabs(root = document) {
  root.querySelectorAll('[data-tabs]').forEach((widget) => {
    const tabs = Array.from(widget.querySelectorAll('[role="tab"]'));
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    if (!tabs.length) return;

    const activate = (index, focus = true) => {
      tabs.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (panels[i]) panels[i].hidden = !selected;
      });
      if (focus) tabs[index].focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activate(i, false));
      tab.addEventListener('keydown', (e) => {
        const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in keys)) return;
        e.preventDefault();
        activate((keys[e.key] + tabs.length) % tabs.length);
      });
    });

    const initial = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
    activate(initial, false);
  });
}
