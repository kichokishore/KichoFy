import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { PublicRoute } from '../../components/Layout/ProtectedRoute';
import { supabase } from '../../utils/supabaseClient';
import { useApp } from '../../contexts/AppContext';
import loginwrapper from '../../assets/loginwrapper.jpg';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const { state: { user }, dispatch } = useApp();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Attempt to sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // Step 2: Check if email is verified
      if (authData.user && !authData.user.email_confirmed_at) {
        await supabase.auth.signOut();
        throw new Error(
          'Please verify your email before logging in. Check your email inbox (including spam folder) for the verification link.'
        );
      }

      // Step 3: Get user profile and update AppContext
      if (authData.user) {
        // Get user profile from database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          // Create basic user from session
          dispatch({
            type: 'SET_USER',
            payload: {
              id: authData.user.id,
              name: authData.user.user_metadata?.name || 'User',
              email: authData.user.email!,
              role: 'customer',
              created_at: authData.user.created_at,
              updated_at: new Date().toISOString(),
            }
          });
        } else {
          console.log('User profile loaded:', profile);
          dispatch({ type: 'SET_USER', payload: profile });
        }
      }

      setIsLoading(false);
      navigate('/');

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null);
  };

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (resendError) {
        throw new Error(resendError.message);
      }

      setError('✅ Verification email sent! Please check your inbox and spam folder.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto items-center">
            {/* Left Side - Branding */}
            <div className="hidden lg:block">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                  Welcome Back to <span className="elegant-text text-primary">KichoFy</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Continue your fashion journey with us
                </p>
              </div>
              <img
                src={loginwrapper}
                alt="Fashion"
                className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
              />
            </div>

            {/* Right Side - Login Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl lg:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12">
              <div className="text-center mb-8">
                <div className="lg:hidden mb-6">
                  <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                    <span className="elegant-text text-primary">KichoFy</span>
                  </h1>
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                  {t('login')} to Your Account
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your credentials to access your account
                </p>
              </div>

              {error && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${error.includes('✅')
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                  }`}>
                  {error}
                  {error.includes('verify your email') && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={isLoading}
                        className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-primary-light transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Sending...' : 'Resend Verification Email'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm sm:text-base"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm sm:text-base"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-primary hover:text-primary-light text-sm font-medium transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary-light text-white py-3 px-6 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {t('login')}
                      <ArrowRight className="ml-2" size={18} />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white dark:bg-gray-800 px-4 text-gray-500 dark:text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
                  >
                    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5 mr-2" />
                    <span className="font-medium">Google</span>
                  </button>
                </div>
              </form>

              {/* Sign Up Link */}
              <div className="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  Don't have an account?{' '}
                  <Link
                    to="/auth/signup"
                    className="text-primary hover:text-primary-light font-medium transition-colors"
                  >
                    {t('signup')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
};

export default Login;