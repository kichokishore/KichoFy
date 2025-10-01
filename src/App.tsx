import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AppProvider, useApp } from './contexts/AppContext';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { BackToTop } from './components/Layout/BackToTop';
import { FloatingAdminIcon } from './components/Layout/FloatingAdminIcon';

// Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Collections } from './pages/Collections';
import { NewArrivals } from './pages/NewArrivals';
import { BestSellers } from './pages/BestSellers';
import { Cart } from './pages/Cart';
import { Login } from './pages/Auth/Login';
import { Signup } from './pages/Auth/Signup';
import { Profile } from './pages/Profile';
import { CMS } from './pages/Admin/CMS';
import { ProductDetails } from './pages/ProductDetails';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { Notification } from './components/Notification';
import { AuthCallback } from './pages/Auth/AuthCallback';
import { ScrollToTop } from './components/Layout/ScrollToTop';
import { OrderDetails } from './pages/OrderDetails';

// CSS
import 'react-toastify/dist/ReactToastify.css';

const AppContent: React.FC = () => {
  const { state } = useApp();

  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/:category" element={<Collections />} />
            <Route path="/new-arrivals" element={<NewArrivals />} />
            <Route path="/best-sellers" element={<BestSellers />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/cms" element={<CMS />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path='/orders' element={<Orders />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/order-details/:orderId" element={<OrderDetails />} />

          </Routes>
        </main>
        <Footer />
        <BackToTop />

        <FloatingAdminIcon />

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={state.darkMode ? 'dark' : 'light'}
        />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AppProvider>
      <div className="App">
        <Notification />
      </div>
      <AppContent />
    </AppProvider>
  );
}

export default App;