import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { installMockApi } from "./lib/mockApi";
import {
  registerServiceWorker,
  setupPWAInstallPrompt,
  setupNetworkStatusHandling,
  cacheImportantAssets
} from "./lib/serviceWorker";

// Demo mode: route /api/* through an in-memory mock so the app runs as a
// pure static SPA on Vercel with no backend.
installMockApi();

// Register service worker and set up PWA functionality
if (import.meta.env.PROD) {
  // Only register service worker in production
  registerServiceWorker().then((registration) => {
    if (registration) {
      console.log('Service Worker registered successfully');
      // Cache important assets after service worker is ready
      setTimeout(() => {
        cacheImportantAssets();
      }, 1000);
    }
  });
} else {
  console.log('Service Worker registration skipped in development mode');
}

// Set up PWA install prompt handling
setupPWAInstallPrompt();

// Set up network status handling
setupNetworkStatusHandling();

createRoot(document.getElementById("root")!).render(<App />);
