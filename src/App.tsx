// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { ErrorBoundary } from './components/ErrorBoundry';
import AppContent from './components/AppContent';

import './index.css';
import './styles/animations.css';
import './styles/components.css';

function App() {
  // Single useEffect for all initialization
  useEffect(() => {
    // Suppress web-share warnings
    if (!navigator.share) {
      // Silently handle missing web-share support
    }

    // Safe message handler to prevent cross-origin frame errors
    const handleMessage = (event: MessageEvent) => {
      const trustedOrigins = [
        window.location.origin,
        'https://checkout.razorpay.com',
        'https://api.razorpay.com',
        'https://razorpay.com'
      ];

      if (!trustedOrigins.includes(event.origin)) {
        return;
      }

      try {
        if (event.data && typeof event.data === 'object') {
          if (event.data.type === 'payment-success') {
            console.log('Payment successful message received');
          }
        }
      } catch (error) {
        console.warn('Safe message handling:', error);
      }
    };

    const handleSecurityError = (event: SecurityPolicyViolationEvent) => {
      console.warn('Security policy violation (safe):', event);
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('securitypolicyviolation', handleSecurityError);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('securitypolicyviolation', handleSecurityError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <div className="App">
            <AppContent />
          </div>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;