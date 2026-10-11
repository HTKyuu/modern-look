import type { CSSProperties } from "react";
import { site } from "../config/site";

export function Logo({ onNavigate }: { onNavigate?: () => void }) {
  const { company } = site;
  return (
    <a className="logo" href={company.homeHref} aria-label={`${company.name} home`} onClick={onNavigate}>
      {!company.logoMark ? null : company.logoTint ? (
        <span className="logo__mark logo__mark--tint" style={{ "--logo-url": `url("${company.logoMark}")` } as CSSProperties} aria-hidden="true" />
      ) : (
        <img className="logo__mark" src={company.logoMark} alt="" aria-hidden="true" />
      )}
      <span className="logo__wordmark" aria-hidden="true">{company.wordmark}</span>
    </a>
  );
}
