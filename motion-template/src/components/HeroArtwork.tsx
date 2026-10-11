import { useEffect, useRef, type CSSProperties } from "react";
import { site } from "../config/site";
import type { ResolvedTheme } from "../hooks/useTheme";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { LightField, readLightColors } from "./lightField";

const TAU = Math.PI * 2;

/** Still frame used for reduced motion (chosen so glints sit at pleasant spots). */
const STILL_TIME = 21;

/**
 * Layered hero artwork: pre-rendered ribbon layers (back / main / front) plus a
 * canvas of light trails and particles. Purely decorative (aria-hidden).
 * Swap the artwork via `site.artwork` — no changes needed here.
 */
export function HeroArtwork({ theme }: { theme: ResolvedTheme }) {
  const { artwork } = site;
  const layers = artwork.layers[theme];
  const reduced = useReducedMotion();
  const animate = artwork.animation.enabled && !reduced;

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<LightField | null>(null);

  // Canvas setup + sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    let field: LightField;
    try {
      field = new LightField(canvas, artwork.animation, artwork.frame);
    } catch {
      return; // no canvas support: the static ribbon layers still render
    }
    fieldRef.current = field;
    field.setColors(readLightColors(document.documentElement));
    const ro = new ResizeObserver(() => {
      const rect = stage.getBoundingClientRect();
      field.resize(rect.width, rect.height);
      field.render(STILL_TIME);
    });
    ro.observe(stage);
    return () => {
      ro.disconnect();
      fieldRef.current = null;
    };
  }, [artwork]);

  // Theme colours for the canvas layer
  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    field.setColors(readLightColors(document.documentElement));
    field.render(STILL_TIME);
  }, [theme]);

  // Animation loop: float, pointer parallax, trails and particles.
  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!animate || !root || !stage) {
      for (const el of [backRef.current, mainRef.current, frontRef.current]) if (el) el.style.transform = "";
      fieldRef.current?.render(STILL_TIME);
      return;
    }

    const { float, parallax } = artwork.animation;
    let raf = 0;
    let visible = true;
    let running = false;
    const start = performance.now() - STILL_TIME * 1000;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const frame = (now: number) => {
      const t = (now - start) / 1000;
      const scale = stage.clientWidth / artwork.frame.width; // frame px → css px
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      const w = (TAU * t) / float.period;
      const amp = float.amplitude * scale;
      const px = pointer.x * parallax * scale;
      const py = pointer.y * parallax * scale;

      if (mainRef.current)
        mainRef.current.style.transform = `translate3d(${(px + Math.sin(w * 0.5) * amp * 0.4).toFixed(2)}px, ${(py * 0.6 + Math.sin(w) * amp).toFixed(2)}px, 0) rotate(${(Math.sin(w * 0.7) * 0.35).toFixed(3)}deg)`;
      if (backRef.current)
        backRef.current.style.transform = `translate3d(${(px * 0.45 + Math.cos(w * 0.8) * amp * 0.7).toFixed(2)}px, ${(py * 0.3 + Math.sin(w * 0.9 + 1) * amp * 0.6).toFixed(2)}px, 0)`;
      if (frontRef.current)
        frontRef.current.style.transform = `translate3d(${(px * 1.8 - Math.sin(w * 0.6) * amp * 1.2).toFixed(2)}px, ${(py * 1.2 + Math.cos(w * 0.5) * amp * 0.8).toFixed(2)}px, 0)`;

      fieldRef.current?.render(t);
      raf = requestAnimationFrame(frame);
    };

    const sync = () => {
      const shouldRun = visible && document.visibilityState === "visible";
      if (shouldRun && !running) {
        running = true;
        raf = requestAnimationFrame(frame);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };

    // pause whenever the hero is offscreen or the tab is hidden
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(root);
    document.addEventListener("visibilitychange", sync);
    if (finePointer && parallax > 0) window.addEventListener("pointermove", onPointer, { passive: true });
    sync();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [animate, artwork]);

  const { frame, mobileFocus: f } = artwork;
  const style = {
    "--frame-ratio": `${frame.width} / ${frame.height}`,
    "--focus-ratio": `${f.w} / ${f.h}`,
    "--focus-stage-w": `${(frame.width / f.w) * 100}%`,
    "--focus-left": `${(-f.x / f.w) * 100}%`,
    "--focus-top": `${(-f.y / f.h) * 100}%`,
    // subject start in px at the hero's 640px minimum height (see global.css)
    "--subject-offset": `${Math.round((artwork.subjectStartX / frame.height) * 640)}px`,
  } as CSSProperties;

  return (
    <div className="hero-artwork" ref={rootRef} style={style} aria-hidden="true" data-animated={animate || undefined}>
      <div className="hero-artwork__stage" ref={stageRef}>
        {layers.back ? (
          <div className="hero-artwork__layer" ref={backRef}>
            <img src={layers.back} alt="" decoding="async" />
          </div>
        ) : null}
        <div className="hero-artwork__layer" ref={mainRef}>
          <img src={layers.main} alt="" decoding="async" />
          <canvas className="hero-artwork__light" ref={canvasRef} />
        </div>
        {layers.front ? (
          <div className="hero-artwork__layer hero-artwork__layer--front" ref={frontRef}>
            <img src={layers.front} alt="" decoding="async" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
