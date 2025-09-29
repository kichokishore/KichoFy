import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AppProvider, useApp } from './contexts/AppContext';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { BackToTop } from './components/Layout/BackToTop';

// Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Collections } from './pages/Collections';
import { NewArrivals } from './pages/NewArrivals';
import { BestSellers } from './pages/BestSellers';
import { Cart } from './pages/Cart';
import { Login } from './pages/Auth/Login';

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
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <Header />
        <main>
          <Footer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/:category" element={<Collections />} />
            <Route path="/new-arrivals" element={<NewArrivals />} />
            <Route path="/best-sellers" element={<BestSellers />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            
            {/* Placeholder routes - would be implemented in full version */}
            <Route path="/orders" element={<div className="py-20 text-center">Orders page coming soon...</div>} />
            <Route path="/profile" element={<div className="py-20 text-center">Profile page coming soon...</div>} />
            <Route path="/payments" element={<div className="py-20 text-center">Payments page coming soon...</div>} />
            <Route path="/product/:id" element={<div className="py-20 text-center">Product details coming soon...</div>} />
          </Routes>
        </main>
        <Footer />
        <BackToTop />
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
      <AppContent />
    </AppProvider>
  );
}

export default App;