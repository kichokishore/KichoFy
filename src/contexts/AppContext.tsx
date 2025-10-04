// src/contexts/AppContext.tsx
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User, Product, CartItem, Order } from '../types';
import { supabase } from '../utils/supabaseClient';

export type Language = 'en' | 'ta' | 'hi' | 'te';

interface Notification {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  show: boolean;
}

interface AppState {
  user: User | null;
  cart: CartItem[];
  orders: Order[];
  darkMode: boolean;
  language: Language;
  isLoading: boolean;
  notification: Notification;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_NOTIFICATION'; payload: Notification }
  | { type: 'CLEAR_NOTIFICATION' }
  | { type: 'SET_CART'; payload: CartItem[] };

const initialState: AppState = {
  user: null,
  cart: [],
  orders: [],
  darkMode: false,
  language: 'en',
  isLoading: true, // Start with loading true to check session
  notification: {
    type: 'info',
    message: '',
    show: false
  },
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => 
        item.product_id === action.payload.product_id &&
        item.size === action.payload.size &&
        item.color === action.payload.color
      );
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.id !== action.payload) };
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'TOGGLE_DARK_MODE':
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', String(!state.darkMode));
      }
      return { ...state, darkMode: !state.darkMode };
    case 'SET_LANGUAGE':
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', action.payload);
      }
      return { ...state, language: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.payload };
    case 'CLEAR_NOTIFICATION':
      return { 
        ...state, 
        notification: {
          ...state.notification,
          show: false
        }
      };
    case 'SET_CART':
      return { ...state, cart: action.payload };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getInitialDarkMode = () => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  };

  const getInitialLanguage = (): Language => {
    if (typeof window === 'undefined') return 'en';
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'ta' || saved === 'hi' || saved === 'te') {
      return saved as Language;
    }
    return 'en';
  };

  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    darkMode: getInitialDarkMode(),
    language: getInitialLanguage(),
  });

  // ✅ PERSISTENCE: Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔐 Checking for existing session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        if (session?.user) {
          console.log('✅ Found existing session for:', session.user.email);
          
          // Get user profile from database
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
            // Create basic user from session
            dispatch({
              type: 'SET_USER',
              payload: {
                id: session.user.id,
                name: session.user.user_metadata?.name || 'User',
                email: session.user.email!,
                role: 'customer',
                created_at: session.user.created_at,
                updated_at: new Date().toISOString(),
              }
            });
          } else {
            console.log('✅ User profile loaded:', profile);
            dispatch({ type: 'SET_USER', payload: profile });
          }
        } else {
          console.log('ℹ️ No existing session found');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkSession();

    // ✅ Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_OUT') {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'CLEAR_CART' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};