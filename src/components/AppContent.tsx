// src/components/AppContent.tsx
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

// Layout components
import { Header } from './Layout/Header';
import { Footer } from './Layout/Footer';
import { Notification } from './Notification';
import { LoadingSpinner } from './UI';
import { BackToTop } from './Layout/BackToTop';
import { FloatingAdminIcon } from './Layout/FloatingAdminIcon';
import { ScrollToTop } from './Layout/ScrollToTop';

// Page components - Main pages
import Home from '../pages/Home';
import About from '../pages/About';
import Collections from '../pages/Collections';
import BestSellers from '../pages/BestSellers';
import NewArrivals from '../pages/NewArrivals';
import SearchResults from '../pages/SearchResults';
import NotFound from '../pages/NotFound';

// Product pages
import Products from '../pages/Products';
import CategoryProducts from '../pages/CategoryProducts';
import ProductDetails from '../pages/product/ProductDetails';
import ProductReviews from '../pages/product/ProductReviews';
import RelatedProducts from '../pages/product/RelatedProducts';

// Cart & Checkout
import Cart from '../pages/Cart';
import { Checkout } from './checkout';
import PaymentRecovery from '../pages/PaymentRecovery';

// Auth pages
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Signup';
import { AuthCallback } from '../pages/Auth/AuthCallback';

// User pages
import Profile from '../pages/user/Profile';
import Addresses from '../pages/user/Addresses';
import OrderHistory from '../pages/user/OrderHistory';
import Settings from '../pages/user/Settings';
import Wishlist from '../pages/user/Wishlist';

// Order pages
import Orders from '../pages/order/Orders';
import OrderDetails from '../pages/order/OrderDetails';
import OrderConfirmation from '../pages/order/OrderConfirmation';
import TrackOrder from '../pages/order/TrackOrder';

// Admin pages
import AdminDashboard from '../pages/Admin/Dashboard';
import { CMS } from '../pages/Admin/CMS';

// Protected Route component
import ProtectedRoute from './Layout/ProtectedRoute';

const AppContent: React.FC = () => {
  // ✅ All hooks called unconditionally at the top level
  const { state: { user, isLoading }, dispatch } = useApp();
  const [initialLoad, setInitialLoad] = useState(true);

  // Safe message handler for cross-origin frames
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only process messages from trusted origins
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
        // Safely handle messages without accessing cross-origin frames
        if (event.data && typeof event.data === 'object') {
          // Handle payment success/failure messages
          if (event.data.type === 'payment-success') {
            console.log('Payment successful');
          }
        }
      } catch (error) {
        // Silently handle cross-origin access errors
        console.warn('Safe message handling:', error);
      }
    };

    // Safe error handler for security policy violations
    const handleSecurityError = (event: SecurityPolicyViolationEvent) => {
      // Silently handle security errors
      console.warn('Security policy violation (safe):', event);
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('securitypolicyviolation', handleSecurityError);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('securitypolicyviolation', handleSecurityError);
    };
  }, []);

  // ✅ Mark initial load as complete after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 1000); // Short delay to prevent flash

    return () => clearTimeout(timer);
  }, []);

  // ✅ Handle retry when there's an auth error
  const handleRetry = () => {
    window.location.reload();
  };

  // In AppContent.tsx - replace the loading section
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="text-gray-600 dark:text-gray-300 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Main app content
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/best-sellers" element={<BestSellers />} />
          <Route path="/new-arrivals" element={<NewArrivals />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/category/:category" element={<CategoryProducts />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/product/:id/reviews" element={<ProductReviews />} />
          <Route path="/product/:id/related" element={<RelatedProducts />} />

          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/callback/*" element={<AuthCallback />} />

          {/* Cart & Checkout */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment-recovery" element={<PaymentRecovery />} />

          {/* Protected User Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addresses"
            element={
              <ProtectedRoute>
                <Addresses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation"
            element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/track-order"
            element={
              <ProtectedRoute>
                <TrackOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cms"
            element={
              <ProtectedRoute requireAdmin>
                <CMS />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <BackToTop />
      <FloatingAdminIcon />
      <Notification />
    </>
  );
};

export default AppContent;