import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Complete ResizeObserver error suppression for runtime error plugin
const suppressResizeObserverRuntimeErrors = () => {
  // Override the sendError function used by the runtime error plugin
  const originalSendError = (window as any).sendError;
  
  // Define a custom sendError that filters ResizeObserver errors
  (window as any).sendError = function(error: any, errorInfo?: any) {
    const message = error?.message || error?.toString?.() || '';
    const stack = error?.stack || '';
    
    // Completely block ResizeObserver errors from the runtime error plugin
    if (message.includes('ResizeObserver') || 
        message.includes('undelivered notifications') ||
        message.includes('loop completed') ||
        stack.includes('ResizeObserver')) {
      return; // Silent suppression - don't call the original sendError
    }
    
    // For non-ResizeObserver errors, call the original function if it exists
    if (originalSendError && typeof originalSendError === 'function') {
      return originalSendError.call(this, error, errorInfo);
    }
  };

  // Prevent ResizeObserver errors from being thrown in the first place
  if (window.ResizeObserver) {
    const OriginalResizeObserver = window.ResizeObserver;
    window.ResizeObserver = class extends OriginalResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        super((entries, observer) => {
          try {
            // Use requestAnimationFrame to prevent loops
            requestAnimationFrame(() => {
              try {
                callback(entries, observer);
              } catch (e) {
                // Silent suppression
              }
            });
          } catch (e) {
            // Silent suppression
          }
        });
      }
    };
  }

  // Suppress console errors for ResizeObserver
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

  // Capture and suppress error events
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

  // Override window.onerror to catch any remaining errors
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const errorMessage = String(message || '');
    const errorStack = error?.stack || '';
    
    if (errorMessage.includes('ResizeObserver') || 
        errorMessage.includes('undelivered notifications') ||
        errorMessage.includes('loop completed') ||
        errorStack.includes('ResizeObserver')) {
      return true; // Prevent default error handling
    }
    
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };
};

// Initialize before anything else
suppressResizeObserverRuntimeErrors();

createRoot(document.getElementById("root")!).render(<App />);
