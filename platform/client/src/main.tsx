// Initialize Sentry BEFORE React app initialization
import { initSentry, setupConsoleLogging } from "./sentry";
initSentry();
setupConsoleLogging();

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ConditionalClerkProvider } from "./components/conditional-clerk-provider";

// Initialize theme from localStorage before rendering
const storedTheme = localStorage.getItem("theme-preference");
if (storedTheme === "dark") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

createRoot(document.getElementById("root")!).render(
  <ConditionalClerkProvider>
    <App />
  </ConditionalClerkProvider>
);
