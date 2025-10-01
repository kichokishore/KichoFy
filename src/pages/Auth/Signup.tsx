import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { supabase } from '../../utils/supabaseClient';
import signupwrapper from '../../assets/singupwrapper.jpg';

export const Signup: React.FC = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Starting signup process for:', formData.email);

      // Get current URL dynamically (works for both localhost and production)
      const currentUrl = window.location.origin;
      const redirectUrl = `${currentUrl}/auth/callback`;

      console.log('Using redirect URL:', redirectUrl);

      // Step 1: Create user in Supabase Auth with email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      console.log('Auth response:', { authData, authError });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('User creation failed. Please try again.');
      }

      // Step 2: Check if email confirmation was sent
      if (authData.user.identities && authData.user.identities.length === 0) {
        throw new Error('User already exists. Please try logging in or use a different email.');
      }

      // Step 3: Create profile only if user was created successfully
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          role: 'customer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't throw error - profile can be created later
      }

      // Show success message
      setSuccess('✅ Registration successful! Please check your email (including spam folder) to verify your account. You must verify your email before logging in.');

      // Clear form
      setFormData({
        name: '',
        email: '',
        password: '',
      });

    } catch (err: any) {
      console.error('Signup error:', err);
      
      if (err.message.includes('already exists') || err.message.includes('already registered')) {
        setError('This email is already registered. Please try logging in or use a different email.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear errors when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            {/* Left Side - Branding */}
            <div className="hidden lg:block">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                  Join <span className="elegant-text text-primary">KichoFy</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Start your fashion journey today
                </p>
              </div>
              <img
                src={signupwrapper}
                alt="Fashion"
                className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
              />
            </div>

            {/* Right Side - Signup Form */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 lg:p-12">
              <div className="text-center mb-8">
                <div className="lg:hidden mb-6">
                  <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                    <span className="elegant-text text-primary">KichoFy</span>
                  </h1>
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                  Create Your Account
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Sign up to explore the latest fashion trends
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
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
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      placeholder="Create a password"
                      required
                      minLength={6}
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary-light text-white py-3 px-6 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {t('signup')}
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

                {/* Social Login (optional) */}
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Google</span>
                  </button>
                </div>
              </form>

              {/* Login Link */}
              <div className="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-primary hover:text-primary-light font-medium transition-colors"
                  >
                    {t('login')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};