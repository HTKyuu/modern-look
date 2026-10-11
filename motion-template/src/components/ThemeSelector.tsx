import { useId } from "react";
import type { ThemePreference } from "../hooks/useTheme";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

interface Props {
  value: ThemePreference;
  onChange: (value: ThemePreference) => void;
  className?: string;
}

/** Segmented System / Light / Dark control built on native radio inputs (arrow keys work). */
export function ThemeSelector({ value, onChange, className }: Props) {
  const name = useId();
  return (
    <fieldset className={["theme-selector", className].filter(Boolean).join(" ")}>
      <legend className="visually-hidden">Colour theme</legend>
      {OPTIONS.map((opt) => (
        <label key={opt.value} className="theme-selector__option" data-selected={value === opt.value || undefined}>
          <input
            type="radio"
            className="theme-selector__input"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            aria-label={`${opt.label} theme`}
          />
          <span className="theme-selector__dot" aria-hidden="true" />
          <span className="theme-selector__label">{opt.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
