import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Brand fonts (self-hosted). Change these together with --font-* in config/tokens.css.
import "@fontsource-variable/inter";
import "./config/tokens.css";
import "./styles/global.css";
import App from "./App";
import { site } from "./config/site";

document.title = site.meta.title;
document.querySelector('meta[name="description"]')?.setAttribute("content", site.meta.description);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
