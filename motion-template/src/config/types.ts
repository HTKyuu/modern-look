/** Shape of the per-company configuration. Components only read from this. */

export interface LinkItem {
  label: string;
  href: string;
}

export interface Stat {
  value: string;
  label: string;
}

/** Frame-space rectangle, in px of the artwork frame (see ArtworkConfig.frame). */
export interface FrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TrailConfig {
  /** Ellipse centre and radii in frame px. */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** Ellipse rotation in degrees. */
  rotation: number;
  /** 0–1 stroke strength. */
  opacity: number;
  /** Visible arc, as fractions of a full turn (0–1). Omit for the whole ellipse. */
  arc?: [number, number];
  /** Number of travelling glints. */
  glints: number;
  /** Turns per minute for the glints; negative runs counter-clockwise. */
  speed: number;
}

export interface ParticleZone extends FrameRect {
  count: number;
  /** Radius range in frame px. */
  size: [number, number];
  /** Share of warm (gold) particles, 0–1. The rest are cool white. */
  warm: number;
  /** Soft "bokeh" particles are drawn larger and blurrier. */
  bokeh?: boolean;
}

export interface ArtworkLayers {
  back?: string;
  main: string;
  front?: string;
}

export interface ArtworkConfig {
  /**
   * The coordinate frame the artwork was authored in. All layer images share this
   * size (at any resolution) and all trail/particle coordinates use it.
   */
  frame: { width: number; height: number };
  /** Layer images per theme. Layers are stacked back → main → (trails/particles) → front. */
  layers: { dark: ArtworkLayers; light: ArtworkLayers };
  /**
   * Frame x (px) where the artwork's subject starts. On small desktops (1024–1303px)
   * the stage is positioned so this point sits just right of the hero copy.
   */
  subjectStartX: number;
  /** Region of the frame kept in view on tablet/mobile, where the artwork sits below the text. */
  mobileFocus: FrameRect;
  animation: {
    /** Master switch. prefers-reduced-motion always wins and renders a still frame. */
    enabled: boolean;
    /** Slow floating drift of the ribbon: amplitude in frame px, period in seconds. */
    float: { amplitude: number; period: number };
    /** Max pointer parallax offset of the main layer in frame px (0 disables). */
    parallax: number;
    trails: TrailConfig[];
    particles: ParticleZone[];
    /** Global particle multiplier (e.g. 0.5 to halve). */
    particleDensity: number;
  };
}

export interface VideoConfig {
  /** MP4/WebM file (e.g. /media/brand-film.mp4). */
  src: string;
  poster?: string;
  title: string;
}

export interface SiteConfig {
  company: {
    name: string;
    /** Wordmark text shown next to the logo mark. */
    wordmark: string;
    /** Path to an SVG/PNG logo mark in /public. Omit for a wordmark-only logo. */
    logoMark?: string;
    /**
     * true: the mark is used as a mask and painted in the theme text colour (ideal for
     * single-colour marks). false: the image is shown as-is (multi-colour logos).
     */
    logoTint: boolean;
    homeHref: string;
  };
  meta: { title: string; description: string };
  nav: LinkItem[];
  headerCta: LinkItem;
  hero: {
    eyebrow: string;
    /** Headline lines; each line is a list of segments, `accent` segments get the accent colour. */
    headline: { text: string; accent?: boolean }[][];
    body: string;
    primaryCta: LinkItem;
    /** Set to null to hide the video action. */
    video: (VideoConfig & { label: string }) | null;
    stats: Stat[];
    /** Small editorial labels near the right edge. */
    editorialLabels: string[];
  };
  intro: {
    id: string;
    eyebrow: string;
    headline: { text: string; accent?: boolean }[][];
    body: string;
  };
  artwork: ArtworkConfig;
  /** localStorage key for the theme preference (must match the inline script in index.html). */
  themeStorageKey: string;
}
