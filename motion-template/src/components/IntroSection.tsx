import { site } from "../config/site";
import { Headline } from "./Headline";

export function IntroSection() {
  const { intro } = site;
  return (
    <section className="intro" id={intro.id} aria-labelledby={`${intro.id}-title`}>
      <div className="intro__inner container">
        <div className="intro__lead">
          <p className="eyebrow">{intro.eyebrow}</p>
          <Headline as="h2" id={`${intro.id}-title`} lines={intro.headline} className="intro__title" />
        </div>
        <p className="intro__body">{intro.body}</p>
      </div>
    </section>
  );
}
