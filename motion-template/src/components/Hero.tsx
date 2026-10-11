import { useRef, useState } from "react";
import { site } from "../config/site";
import type { ResolvedTheme } from "../hooks/useTheme";
import { ArrowIcon, Button } from "./Button";
import { Headline } from "./Headline";
import { HeroArtwork } from "./HeroArtwork";
import { StatsRow } from "./StatsRow";
import { VideoDialog } from "./VideoDialog";

export function Hero({ theme }: { theme: ResolvedTheme }) {
  const { hero } = site;
  const [videoOpen, setVideoOpen] = useState(false);
  const videoButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__atmosphere" aria-hidden="true" />
      <HeroArtwork theme={theme} />

      <div className="hero__inner container">
        <div className="hero__content">
          <p className="eyebrow">{hero.eyebrow}</p>
          <Headline as="h1" id="hero-title" lines={hero.headline} className="hero__title" />
          <p className="hero__body">{hero.body}</p>
          <div className="hero__actions">
            <Button href={hero.primaryCta.href} icon={<ArrowIcon />}>
              {hero.primaryCta.label}
            </Button>
            {hero.video ? (
              <button ref={videoButtonRef} type="button" className="play-button" onClick={() => setVideoOpen(true)} aria-haspopup="dialog">
                <span className="play-button__ring" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M3 1.8v8.4L10 6z" fill="currentColor" />
                  </svg>
                </span>
                <span className="play-button__label">{hero.video.label}</span>
              </button>
            ) : null}
          </div>
        </div>

        <StatsRow stats={hero.stats} />

        {hero.editorialLabels.length ? (
          <ul className="editorial-labels">
            {hero.editorialLabels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {hero.video ? (
        <VideoDialog
          video={hero.video}
          open={videoOpen}
          onClose={() => {
            setVideoOpen(false);
            videoButtonRef.current?.focus({ preventScroll: true });
          }}
        />
      ) : null}
    </section>
  );
}
