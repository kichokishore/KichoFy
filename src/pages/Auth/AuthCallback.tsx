import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useApp } from '../../contexts/AppContext';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback triggered');
        
        // Get the session after email verification
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session data:', session);
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (session?.user) {
          console.log('User verified and logged in:', session.user.email);
          
          // Check if email is confirmed
          if (!session.user.email_confirmed_at) {
            throw new Error('Email not confirmed yet. Please check your email and click the verification link.');
          }

          // Get or create user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.log('Profile not found, creating one...');
            // Create profile if it doesn't exist
            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                name: session.user.user_metadata?.name || 'User',
                email: session.user.email,
                role: 'customer',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (createProfileError) {
              console.error('Profile creation error:', createProfileError);
            }
          }

          // Set user in context
          dispatch({
            type: 'SET_USER',
            payload: {
              id: session.user.id,
              name: session.user.user_metadata?.name || 'User',
              email: session.user.email!,
              language: 'en',
              created_at: session.user.created_at,
            },
          });

          console.log('Redirecting to home page...');
          // Redirect to home page
          navigate('/');
        } else {
          setError('Email verification failed. Please try signing up again.');
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Email verification failed. Please check your email and click the verification link.');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Verification Failed</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/signup')}
            className="w-full bg-primary hover:bg-primary-light text-white py-3 px-6 rounded-xl font-semibold transition-colors mb-3"
          >
            Try Sign Up Again
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};