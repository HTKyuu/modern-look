/*
 * Checks every brand in config/brands.js against WCAG 2.2 AA contrast.
 * Run: node scripts/check-contrast.mjs
 * Exit code 1 if any pair fails.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(join(root, 'config/brands.js'), 'utf8'), sandbox);
const brands = sandbox.window.BRANDS;

function luminance(hex) {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/* [foreground, background, minimum, why] */
const PAIRS = [
  ['text', 'bg', 4.5, 'body text'],
  ['text', 'surface', 4.5, 'text on cards'],
  ['text', 'surfaceSunken', 4.5, 'text on sunken sections'],
  ['textMuted', 'bg', 4.5, 'muted text'],
  ['textMuted', 'surface', 4.5, 'muted text on cards'],
  ['textMuted', 'surfaceSunken', 4.5, 'muted text on sunken sections'],
  ['accent', 'bg', 4.5, 'links'],
  ['accent', 'surface', 4.5, 'links on cards'],
  ['onAccent', 'accent', 4.5, 'primary button label'],
  ['onAccent', 'accentHover', 4.5, 'primary button label (hover)'],
  ['accent', 'accentSoft', 3, 'icons on soft accent tiles'],
  ['borderStrong', 'bg', 1.5, 'input borders stay visible'],
  ['border', 'bg', 1.15, 'hairlines stay visible']
];

let failed = 0;
for (const brand of Object.values(brands)) {
  console.log(`\n${brand.name}`);
  for (const mode of ['light', 'dark']) {
    const c = brand.colors[mode];
    for (const [fg, bg, min, why] of PAIRS) {
      if (!c[fg] || !c[bg]) continue;
      const r = ratio(c[fg], c[bg]);
      const ok = r >= min;
      if (!ok) failed++;
      console.log(`  ${ok ? 'pass' : 'FAIL'}  ${mode.padEnd(5)} ${fg} on ${bg}: ${r.toFixed(2)} (min ${min}) ${why}`);
    }
  }
}
console.log(failed ? `\n${failed} pair(s) below target.` : '\nAll pairs meet their targets.');
process.exit(failed ? 1 : 0);
