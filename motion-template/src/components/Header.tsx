import { useEffect, useRef, useState } from "react";
import { site } from "../config/site";
import type { ThemePreference } from "../hooks/useTheme";
import { Button } from "./Button";
import { Logo } from "./Logo";
import { ThemeSelector } from "./ThemeSelector";

interface Props {
  themePreference: ThemePreference;
  onThemeChange: (value: ThemePreference) => void;
}

export function Header({ themePreference, onThemeChange }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Native modal <dialog>: traps focus, makes the page inert and closes on Escape.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) {
      dialog.showModal();
      document.documentElement.classList.add("is-locked");
    } else if (!menuOpen && dialog.open) {
      dialog.close();
    }
  }, [menuOpen]);

  // Close the menu if the viewport grows past the mobile breakpoint.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1240px)");
    const onChange = () => mq.matches && setMenuOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const onDialogClose = () => {
    setMenuOpen(false);
    document.documentElement.classList.remove("is-locked");
    toggleRef.current?.focus({ preventScroll: true });
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <Logo />

        <nav className="site-nav" aria-label="Primary">
          <ul className="site-nav__list">
            {site.nav.map((item) => (
              <li key={item.label}>
                <a className="site-nav__link" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <ThemeSelector value={themePreference} onChange={onThemeChange} className="site-header__theme" />
          <Button href={site.headerCta.href} size="sm" className="site-header__cta">
            {site.headerCta.label}
          </Button>
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <span className="visually-hidden">Open menu</span>
            <span className="menu-toggle__bars" aria-hidden="true" />
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        id="mobile-menu"
        className="mobile-menu"
        aria-label="Menu"
        onClose={onDialogClose}
        onClick={(e) => {
          // backdrop click
          if (e.target === dialogRef.current) closeMenu();
        }}
      >
        <div className="mobile-menu__panel">
          <div className="mobile-menu__top">
            <Logo onNavigate={closeMenu} />
            <button type="button" className="mobile-menu__close" onClick={closeMenu}>
              <span className="visually-hidden">Close menu</span>
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 4l12 12M16 4 4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <nav aria-label="Mobile">
            <ul className="mobile-menu__list">
              {site.nav.map((item) => (
                <li key={item.label}>
                  <a className="mobile-menu__link" href={item.href} onClick={closeMenu}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mobile-menu__footer">
            <ThemeSelector value={themePreference} onChange={onThemeChange} />
            <Button href={site.headerCta.href} className="mobile-menu__cta" onClick={closeMenu}>
              {site.headerCta.label}
            </Button>
          </div>
        </div>
      </dialog>
    </header>
  );
}
