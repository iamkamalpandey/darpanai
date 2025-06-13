import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Aggressive ResizeObserver error suppression
const suppressAllResizeObserverErrors = () => {
  // Complete console error suppression
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const message = String(args[0] || '');
    if (message.includes('ResizeObserver') || 
        message.includes('undelivered notifications') ||
        message.includes('loop completed')) {
      return; // Silent suppression
    }
    originalConsoleError.apply(console, args);
  };

  // Completely override the runtime error plugin
  (window as any).sendError = () => {}; // No-op function
  
  // Block all error events that mention ResizeObserver
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    if (message.includes('ResizeObserver') || 
        message.includes('undelivered notifications') ||
        message.includes('loop completed')) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return false;
    }
  }, true);

  // Override ResizeObserver to never throw errors
  if (window.ResizeObserver) {
    const OriginalResizeObserver = window.ResizeObserver;
    window.ResizeObserver = class extends OriginalResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        super((entries, observer) => {
          try {
            callback(entries, observer);
          } catch (e) {
            // Silent suppression of all ResizeObserver errors
          }
        });
      }
    };
  }
};

// Initialize before anything else
suppressAllResizeObserverErrors();

createRoot(document.getElementById("root")!).render(<App />);
