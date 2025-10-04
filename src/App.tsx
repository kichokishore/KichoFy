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
import { PaymentRecovery } from './pages/PaymentRecovery';

// CSS
import 'react-toastify/dist/ReactToastify.css';

// const LoadingScreen: React.FC = () => {
//   const [showSkip, setShowSkip] = React.useState(false);

//   React.useEffect(() => {
//     // Show skip button after 3 seconds
//     const timer = setTimeout(() => setShowSkip(true), 3000);
//     return () => clearTimeout(timer);
//   }, []);

  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
  //     <div className="text-center">
  //       <div className="w-16 h-16 border-4 border-t-primary border-gray-300 rounded-full animate-spin mx-auto mb-4"></div>
  //       <p className="text-gray-600 dark:text-gray-300 text-lg font-medium mb-4">Loading KichoFy...</p>
  //       {showSkip && (
  //         <button
  //           onClick={() => window.location.reload()}
  //           className="text-primary hover:text-primary-light text-sm underline"
  //         >
  //           Taking too long? Click to refresh
  //         </button>
  //       )}
  //     </div>
  //   </div>
  // );
// };

const AppContent: React.FC = () => {
  const { state } = useApp();

  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  // // Show loading screen while checking authentication
  // if (state.isAuthChecking) {
  //   return <LoadingScreen />;
  // }

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
            <Route path="/payment-recovery" element={<PaymentRecovery />} />
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