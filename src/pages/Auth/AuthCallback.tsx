// src/pages/Auth/AuthCallback.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useApp } from '../../contexts/AppContext';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash from URL (contains the verification token)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        console.log('Callback type:', type);

        if (type === 'signup' || type === 'email') {
          // Email verification callback
          if (accessToken) {
            // Set the session with the token
            const { data: { session }, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || '',
            });

            if (sessionError) {
              throw sessionError;
            }

            if (session?.user) {
              // Fetch user profile
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (!profileError && profileData) {
                // Update context with user data
                dispatch({
                  type: 'SET_USER',
                  payload: {
                    id: profileData.id,
                    name: profileData.name,
                    email: profileData.email,
                    phone: profileData.phone,
                    mobile_number: profileData.mobile_number,
                    address_line1: profileData.address_line1,
                    address_line2: profileData.address_line2,
                    city: profileData.city,
                    state: profileData.state,
                    country: profileData.country,
                    pincode: profileData.pincode,
                    role: profileData.role,
                    created_at: profileData.created_at,
                    updated_at: profileData.updated_at,
                    avatar_url: profileData.avatar_url,
                  },
                });

                setStatus('success');
                setMessage('Email verified successfully! Redirecting to home...');
                
                // Redirect after 2 seconds
                setTimeout(() => {
                  navigate('/');
                }, 2000);
              } else {
                throw new Error('Failed to load profile');
              }
            }
          } else {
            throw new Error('No verification token found');
          }
        } else {
          // Not a verification callback, redirect to login
          setStatus('error');
          setMessage('Invalid verification link');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Email verification failed. Please try again or contact support.');
        
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      }
    };

    handleCallback();
  }, [navigate, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verifying Email
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-light transition-colors"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};