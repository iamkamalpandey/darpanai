import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Lightweight ResizeObserver error suppression
window.addEventListener('error', (e) => {
  if (e.message?.includes?.('ResizeObserver')) e.stopImmediatePropagation();
}, true);

createRoot(document.getElementById("root")!).render(<App />);
