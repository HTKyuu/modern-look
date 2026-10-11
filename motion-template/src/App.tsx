import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { IntroSection } from "./components/IntroSection";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  const { preference, resolved, setPreference } = useTheme();
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header themePreference={preference} onThemeChange={setPreference} />
      <main id="main" tabIndex={-1}>
        <Hero theme={resolved} />
        <IntroSection />
      </main>
    </>
  );
}
