import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Comprehensive error suppression for ResizeObserver
const suppressResizeObserverErrors = () => {
  // Handle console errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString?.() || '';
    if (message.includes('ResizeObserver') || message.includes('resize observer')) {
      return; // Suppress ResizeObserver console errors
    }
    originalConsoleError.apply(console, args);
  };

  // Handle window errors
  window.addEventListener('error', (e) => {
    if (e.message?.includes('ResizeObserver') || e.message?.includes('resize observer')) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return false;
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    const message = e.reason?.message || e.reason?.toString?.() || '';
    if (message.includes('ResizeObserver') || message.includes('resize observer')) {
      e.preventDefault();
    }
  });

  // Override ResizeObserver to catch and suppress loop errors
  if (typeof ResizeObserver !== 'undefined') {
    const OriginalResizeObserver = ResizeObserver;
    window.ResizeObserver = class extends OriginalResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
          try {
            callback(entries, observer);
          } catch (error: any) {
            if (!error?.message?.includes('ResizeObserver')) {
              throw error; // Only suppress ResizeObserver errors
            }
          }
        };
        super(wrappedCallback);
      }
    };
  }
};

// Initialize error suppression
suppressResizeObserverErrors();

createRoot(document.getElementById("root")!).render(<App />);
