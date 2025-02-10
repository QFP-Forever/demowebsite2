import React, { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add error boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo);
    // Report error to Clarity
    try {
      window.clarity?.('consent');
      window.clarity?.('error', {
        error: error.toString(),
        errorInfo: errorInfo.componentStack
      });
    } catch (e) {
      console.error('Error reporting to Clarity:', e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Add loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
  </div>
);

// Initialize Microsoft Clarity
const initClarity = () => {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.innerHTML = `
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "pws7ncyw1n");
  `;
  document.head.appendChild(script);
};

// Initialize analytics in production
if (process.env.NODE_ENV === 'production') {
  initClarity();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);

// Only register service worker in production
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  try {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Silently fail if service worker registration fails
      });
    });
  } catch {
    // Ignore any errors related to service worker registration
  }
}

// Add performance monitoring only in production
if (process.env.NODE_ENV === 'production') {
  const reportWebVitals = async (metric: any) => {
    try {
      // Report web vitals to Clarity
      window.clarity?.('webVitals', metric);
      
      const body = JSON.stringify(metric);
      (navigator.sendBeacon && navigator.sendBeacon('/analytics', body)) || 
        fetch('/analytics', { body, method: 'POST', keepalive: true });
    } catch {
      // Silently fail if analytics reporting fails
    }
  };

  try {
    reportWebVitals();
  } catch {
    // Ignore any errors in reporting web vitals
  }
}