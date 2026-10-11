/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  COMPANY CONFIGURATION
 *  Everything company-specific lives here (plus tokens.css and /public assets).
 *  Components never hard-code copy, links or artwork paths.
 *
 *  Demo content: "Nexora" is fictional. The statistics below (10K+ teams,
 *  99.9% uptime, global infrastructure) are DEMO VALUES — replace them with
 *  figures you can substantiate before publishing.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { SiteConfig } from "./types";

export const site: SiteConfig = {
  company: {
    name: "Nexora",
    wordmark: "NEXORA",
    logoMark: "brand/logo-mark.svg",
    logoTint: true,
    homeHref: "./",
  },

  meta: {
    title: "Nexora — Intelligence in Motion",
    description:
      "Nexora builds advanced AI infrastructure for real-world impact — helping ambitious teams turn possibility into progress.",
  },

  // Demo destinations point at the intro section; replace with your real routes.
  nav: [
    { label: "Product", href: "#intro" },
    { label: "Solutions", href: "#intro" },
    { label: "Developers", href: "#intro" },
    { label: "Pricing", href: "#intro" },
    { label: "Company", href: "#intro" },
  ],
  headerCta: { label: "Get started", href: "mailto:hello@nexora.example?subject=Getting%20started" },

  hero: {
    eyebrow: "Built for a brighter tomorrow",
    headline: [
      [{ text: "Intelligence" }],
      [{ text: "in " }, { text: "Motion", accent: true }],
    ],
    body: "Nexora builds advanced AI infrastructure for real-world impact — helping ambitious teams turn possibility into progress.",
    primaryCta: { label: "Get started", href: "mailto:hello@nexora.example?subject=Getting%20started" },
    video: {
      label: "Watch video",
      title: "Nexora — brand film",
      src: "media/brand-film.mp4",
      poster: "media/brand-film-poster.webp",
    },
    stats: [
      { value: "10K+", label: "Teams building" },
      { value: "99.9%", label: "Uptime" },
      { value: "Global", label: "Infrastructure" },
    ],
    editorialLabels: ["Ideas", "Infrastructure", "Impact"],
  },

  intro: {
    id: "intro",
    eyebrow: "A more capable tomorrow",
    headline: [
      [{ text: "Powering what’s next" }],
      [{ text: "for " }, { text: "ambitious builders", accent: true }],
    ],
    body: "From idea to global scale, Nexora provides the infrastructure, tools, and intelligence to help you build, ship, and make a lasting impact.",
  },

  artwork: {
    frame: { width: 1536, height: 754 },
    layers: {
      dark: {
        back: "artwork/dark/ribbon-back.webp",
        main: "artwork/dark/ribbon-main.webp",
        front: "artwork/dark/ribbon-front.webp",
      },
      light: {
        back: "artwork/light/ribbon-back.webp",
        main: "artwork/light/ribbon-main.webp",
        front: "artwork/light/ribbon-front.webp",
      },
    },
    subjectStartX: 560,
    mobileFocus: { x: 480, y: 50, w: 1056, h: 704 },
    animation: {
      enabled: true,
      float: { amplitude: 7, period: 16 },
      parallax: 14,
      particleDensity: 1,
      trails: [
        // orbit around the upper loop
        { cx: 1040, cy: 128, rx: 282, ry: 66, rotation: -4, opacity: 0.55, glints: 2, speed: 1.1 },
        // small inner arc at the top left of the loop
        { cx: 930, cy: 175, rx: 82, ry: 28, rotation: -12, opacity: 0.6, arc: [0.45, 0.95], glints: 1, speed: 1.6 },
        // long sweep crossing the ribbon towards the right edge
        { cx: 1180, cy: 470, rx: 560, ry: 175, rotation: -14, opacity: 1, arc: [0.55, 0.98], glints: 2, speed: 0.7 },
        // orbit around the lower loop
        { cx: 930, cy: 560, rx: 300, ry: 118, rotation: 10, opacity: 0.45, glints: 2, speed: -0.9 },
        // faint outer sweep through the bottom left
        { cx: 820, cy: 640, rx: 520, ry: 210, rotation: 4, opacity: 0.3, arc: [0.0, 0.5], glints: 1, speed: 0.5 },
      ],
      particles: [
        // gold bokeh along the lower-left swoosh
        { x: 20, y: 540, w: 720, h: 214, count: 170, size: [0.8, 3.6], warm: 0.85, bokeh: true },
        // fine dust drifting left of the ribbon
        { x: 560, y: 140, w: 300, h: 330, count: 110, size: [0.4, 1.2], warm: 0.35 },
        // sparkle on the upper right ribbon
        { x: 1250, y: 130, w: 286, h: 230, count: 130, size: [0.6, 2.8], warm: 0.75, bokeh: true },
        // scattered specks around the loop
        { x: 980, y: 90, w: 330, h: 160, count: 40, size: [0.5, 1.6], warm: 0.6 },
        { x: 640, y: 420, w: 560, h: 320, count: 60, size: [0.5, 1.8], warm: 0.7 },
      ],
    },
  },

  themeStorageKey: "theme-preference",
};
