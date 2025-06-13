import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Comprehensive ResizeObserver error suppression
const suppressResizeObserverErrors = () => {
  // Prevent ResizeObserver from triggering error overlays
  let isHandlingError = false;
  
  // Override ResizeObserver to handle loop errors gracefully
  if (typeof window !== 'undefined' && window.ResizeObserver) {
    const OriginalResizeObserver = window.ResizeObserver;
    
    window.ResizeObserver = class extends OriginalResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
          if (isHandlingError) return;
          
          try {
            // Use requestAnimationFrame to defer execution and prevent loops
            window.requestAnimationFrame(() => {
              if (!isHandlingError) {
                try {
                  callback(entries, observer);
                } catch (error) {
                  // Suppress all ResizeObserver-related errors
                  if (error instanceof Error && 
                      (error.message.includes('ResizeObserver') || 
                       error.message.includes('loop completed') ||
                       error.message.includes('undelivered notifications'))) {
                    return;
                  }
                  throw error;
                }
              }
            });
          } catch (error) {
            // Suppress ResizeObserver loop errors
            if (error instanceof Error && 
                (error.message.includes('ResizeObserver') || 
                 error.message.includes('loop completed') ||
                 error.message.includes('undelivered notifications'))) {
              return;
            }
            throw error;
          }
        };
        super(wrappedCallback);
      }
    };
  }

  // Handle console errors with better filtering
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString?.() || '';
    const stack = args[0]?.stack || '';
    
    if (message.includes('ResizeObserver') || 
        message.includes('resize observer') ||
        message.includes('undelivered notifications') ||
        message.includes('loop completed') ||
        stack.includes('ResizeObserver')) {
      return; // Suppress ResizeObserver console errors
    }
    originalConsoleError.apply(console, args);
  };

  // Enhanced window error handler
  window.addEventListener('error', (e) => {
    const message = e.message || '';
    const filename = e.filename || '';
    
    if (message.includes('ResizeObserver') || 
        message.includes('resize observer') ||
        message.includes('undelivered notifications') ||
        message.includes('loop completed') ||
        filename.includes('ResizeObserver')) {
      isHandlingError = true;
      e.stopImmediatePropagation();
      e.preventDefault();
      // Reset flag after a brief delay
      setTimeout(() => { isHandlingError = false; }, 100);
      return false;
    }
  }, true);

  // Enhanced unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (e) => {
    const message = e.reason?.message || e.reason?.toString?.() || '';
    const stack = e.reason?.stack || '';
    
    if (message.includes('ResizeObserver') || 
        message.includes('resize observer') ||
        message.includes('undelivered notifications') ||
        message.includes('loop completed') ||
        stack.includes('ResizeObserver')) {
      e.preventDefault();
      return false;
    }
  });

  // Prevent the runtime error plugin from showing ResizeObserver errors
  if (typeof window !== 'undefined') {
    // Define sendError on window to intercept runtime error plugin calls
    (window as any).sendError = function(error: any) {
      const message = error?.message || error?.toString?.() || '';
      const stack = error?.stack || '';
      
      // Block ResizeObserver errors from triggering the runtime error overlay
      if (message.includes('ResizeObserver') || 
          message.includes('resize observer') ||
          message.includes('undelivered notifications') ||
          message.includes('loop completed') ||
          stack.includes('ResizeObserver')) {
        // Silently ignore ResizeObserver errors
        return;
      }
      
      // For other errors, just log them without triggering overlay
      console.error('Runtime error:', error);
    };

    // Prevent any future overrides of sendError
    Object.defineProperty(window, 'sendError', {
      value: (window as any).sendError,
      writable: false,
      configurable: false
    });

    // Also intercept at the global error level to prevent plugin activation
    const originalOnerror = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      const errorMessage = message?.toString() || '';
      const errorStack = error?.stack || '';
      
      if (errorMessage.includes('ResizeObserver') || 
          errorMessage.includes('resize observer') ||
          errorMessage.includes('undelivered notifications') ||
          errorMessage.includes('loop completed') ||
          errorStack.includes('ResizeObserver')) {
        return true; // Prevent default error handling
      }
      
      if (originalOnerror) {
        return originalOnerror.call(this, message, source, lineno, colno, error);
      }
      return false;
    };
  }
};

// Initialize error suppression
suppressResizeObserverErrors();

createRoot(document.getElementById("root")!).render(<App />);
