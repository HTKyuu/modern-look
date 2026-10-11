import type { ArtworkConfig, TrailConfig } from "../config/types";

/**
 * Canvas renderer for the delicate light layer over the hero ribbon:
 * orbit trails with travelling glints, and restrained twinkling particles.
 * All coordinates are in artwork-frame px and scaled to the canvas size.
 */

export interface LightColors {
  trail: string; // "r, g, b"
  trailCool: string;
  glint: string;
  particleWarm: string;
  particleCool: string;
  particleAlpha: number;
}

interface Particle {
  x: number;
  y: number;
  r: number;
  warm: boolean;
  bokeh: boolean;
  phase: number;
  twinkle: number;
  driftX: number;
  driftY: number;
  base: number;
}

const TAU = Math.PI * 2;

/** Small deterministic PRNG so the particle layout is stable between renders. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ellipsePoint(t: TrailConfig, theta: number): [number, number] {
  const phi = (t.rotation * Math.PI) / 180;
  const ct = Math.cos(theta) * t.rx;
  const st = Math.sin(theta) * t.ry;
  return [t.cx + ct * Math.cos(phi) - st * Math.sin(phi), t.cy + ct * Math.sin(phi) + st * Math.cos(phi)];
}

function arcOf(t: TrailConfig): [number, number] {
  const [a, b] = t.arc ?? [0, 1];
  return [a * TAU, b * TAU];
}

/** Soft fade near the ends of a partial arc (1 for full ellipses). */
function arcFade(t: TrailConfig, theta: number): number {
  if (!t.arc) return 1;
  const [a, b] = arcOf(t);
  const u = (theta - a) / (b - a);
  const edge = Math.min(u, 1 - u) / 0.18;
  return Math.max(0, Math.min(1, edge));
}

export class LightField {
  private ctx: CanvasRenderingContext2D;
  private trailsCache: HTMLCanvasElement;
  private particles: Particle[] = [];
  private sprites: Record<string, HTMLCanvasElement> = {};
  private scale = 1;
  private dpr = 1;
  private colors: LightColors | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private anim: ArtworkConfig["animation"],
    private frame: ArtworkConfig["frame"],
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;
    this.trailsCache = document.createElement("canvas");
    this.buildParticles();
  }

  private buildParticles() {
    const rand = mulberry32(20261010);
    const density = this.anim.particleDensity;
    for (const zone of this.anim.particles) {
      const count = Math.round(zone.count * density);
      for (let i = 0; i < count; i++) {
        const sizeT = Math.pow(rand(), 2.4);
        this.particles.push({
          x: zone.x + rand() * zone.w,
          y: zone.y + rand() * zone.h,
          r: zone.size[0] + (zone.size[1] - zone.size[0]) * sizeT,
          warm: rand() < zone.warm,
          bokeh: !!zone.bokeh && sizeT > 0.35,
          phase: rand() * TAU,
          twinkle: 0.25 + rand() * 0.9,
          driftX: (rand() - 0.5) * 10,
          driftY: (rand() - 0.5) * 8,
          base: 0.45 + rand() * 0.55,
        });
      }
    }
  }

  resize(cssWidth: number, cssHeight: number) {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.round(cssWidth * this.dpr));
    this.canvas.height = Math.max(1, Math.round(cssHeight * this.dpr));
    this.scale = (cssWidth / this.frame.width) * this.dpr;
    this.buildCaches();
  }

  setColors(colors: LightColors) {
    this.colors = colors;
    this.buildCaches();
  }

  private buildCaches() {
    if (!this.colors) return;
    const c = this.colors;
    this.trailsCache.width = this.canvas.width;
    this.trailsCache.height = this.canvas.height;
    const g = this.trailsCache.getContext("2d")!;
    g.clearRect(0, 0, this.trailsCache.width, this.trailsCache.height);
    g.lineCap = "round";
    for (const [i, t] of this.anim.trails.entries()) this.strokeTrail(g, t, i);

    const sprite = (rgb: string, soft: boolean) => {
      const size = 64;
      const cv = document.createElement("canvas");
      cv.width = cv.height = size;
      const sg = cv.getContext("2d")!;
      const grad = sg.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      if (soft) {
        grad.addColorStop(0, `rgba(${rgb},0.95)`);
        grad.addColorStop(0.5, `rgba(${rgb},0.75)`);
        grad.addColorStop(0.72, `rgba(${rgb},0.25)`);
        grad.addColorStop(1, `rgba(${rgb},0)`);
      } else {
        grad.addColorStop(0, `rgba(255,255,255,1)`);
        grad.addColorStop(0.22, `rgba(${rgb},1)`);
        grad.addColorStop(0.5, `rgba(${rgb},0.4)`);
        grad.addColorStop(1, `rgba(${rgb},0)`);
      }
      sg.fillStyle = grad;
      sg.fillRect(0, 0, size, size);
      return cv;
    };
    this.sprites = {
      warm: sprite(c.particleWarm, false),
      cool: sprite(c.particleCool, false),
      warmSoft: sprite(c.particleWarm, true),
      coolSoft: sprite(c.particleCool, true),
      glint: sprite(c.glint, false),
    };
  }

  private strokeTrail(g: CanvasRenderingContext2D, t: TrailConfig, index: number) {
    const c = this.colors!;
    const [a, b] = arcOf(t);
    const steps = Math.ceil(((b - a) / TAU) * 360);
    const s = this.scale;
    for (let pass = 0; pass < 2; pass++) {
      // pass 0: soft halo, pass 1: hairline
      g.lineWidth = pass === 0 ? 4 * s : Math.max(0.9 * s, this.dpr * 0.75);
      let prev = ellipsePoint(t, a);
      for (let i = 1; i <= steps; i++) {
        const theta = a + ((b - a) * i) / steps;
        const p = ellipsePoint(t, theta);
        // brightness varies along the orbit, like light catching a wire
        const shimmer = 0.45 + 0.55 * Math.pow(0.5 + 0.5 * Math.sin(theta * 2 + index * 1.7), 2);
        const alpha = t.opacity * shimmer * arcFade(t, theta) * (pass === 0 ? 0.09 : 0.8);
        const rgb = Math.sin(theta + index) > -0.2 ? c.trail : c.trailCool;
        g.strokeStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
        g.beginPath();
        g.moveTo(prev[0] * s, prev[1] * s);
        g.lineTo(p[0] * s, p[1] * s);
        g.stroke();
        prev = p;
      }
    }
  }

  render(time: number) {
    const { ctx, canvas, colors } = this;
    if (!colors) return;
    const s = this.scale;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(this.trailsCache, 0, 0);

    // travelling glints with short comet tails
    for (const t of this.anim.trails) {
      const [a, b] = arcOf(t);
      const len = b - a;
      for (let k = 0; k < t.glints; k++) {
        const turn = (time / 60) * t.speed + k / t.glints;
        const u = ((turn % 1) + 1) % 1;
        const theta = a + u * len;
        const fade = arcFade(t, theta);
        if (fade <= 0.01) continue;
        const dir = Math.sign(t.speed) || 1;
        ctx.lineCap = "round";
        for (let j = 1; j <= 16; j++) {
          const th0 = theta - dir * (j - 1) * 0.012;
          const th1 = theta - dir * j * 0.012;
          if (t.arc && (th1 < a || th1 > b)) break;
          const p0 = ellipsePoint(t, th0);
          const p1 = ellipsePoint(t, th1);
          ctx.strokeStyle = `rgba(${colors.glint},${(fade * 0.7 * (1 - j / 16)).toFixed(3)})`;
          ctx.lineWidth = 1.6 * s;
          ctx.beginPath();
          ctx.moveTo(p0[0] * s, p0[1] * s);
          ctx.lineTo(p1[0] * s, p1[1] * s);
          ctx.stroke();
        }
        const [x, y] = ellipsePoint(t, theta);
        const r = 9 * s;
        ctx.globalAlpha = fade * 0.95;
        ctx.drawImage(this.sprites.glint, x * s - r, y * s - r, r * 2, r * 2);
        ctx.globalAlpha = 1;
      }
    }

    // particles: slow drift and gentle twinkle
    const pa = colors.particleAlpha;
    for (const p of this.particles) {
      const tw = 0.7 + 0.3 * Math.sin(time * p.twinkle + p.phase);
      const x = p.x + Math.sin(time * 0.05 + p.phase) * p.driftX;
      const y = p.y + Math.cos(time * 0.04 + p.phase) * p.driftY;
      const key = p.bokeh ? (p.warm ? "warmSoft" : "coolSoft") : p.warm ? "warm" : "cool";
      const r = (p.bokeh ? p.r * 2.2 : p.r * 2.8) * s;
      ctx.globalAlpha = Math.min(1, p.base * tw * pa);
      ctx.drawImage(this.sprites[key], x * s - r, y * s - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }
}

export function readLightColors(el: Element): LightColors {
  const cs = getComputedStyle(el);
  const v = (name: string) => cs.getPropertyValue(name).trim();
  return {
    trail: v("--trail-color"),
    trailCool: v("--trail-cool"),
    glint: v("--glint-color"),
    particleWarm: v("--particle-warm"),
    particleCool: v("--particle-cool"),
    particleAlpha: parseFloat(v("--particle-alpha")) || 1,
  };
}
