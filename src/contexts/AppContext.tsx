// src/contexts/AppContext.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode
} from 'react';
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
  isAuthChecking: boolean;
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
  | { type: 'SET_AUTH_CHECKING'; payload: boolean };

const initialState: AppState = {
  user: null,
  cart: [],
  orders: [],
  darkMode: false,
  language: 'en',
  isLoading: false,
  notification: {
    type: 'info',
    message: '',
    show: false
  },
  isAuthChecking: true
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(
        item =>
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
          )
        };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
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
        notification: { ...state.notification, show: false }
      };
    case 'SET_AUTH_CHECKING':
      return { ...state, isAuthChecking: action.payload };
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
    if (['en', 'ta', 'hi', 'te'].includes(saved)) {
      return saved as Language;
    }
    return 'en';
  };

  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    darkMode: getInitialDarkMode(),
    language: getInitialLanguage()
  });

  // ✅ Fetch user profile and set to state
  const fetchAndSetProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        return;
      }

      if (data) {
        dispatch({
          type: 'SET_USER',
          payload: {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            mobile_number: data.mobile_number,
            address_line1: data.address_line1,
            address_line2: data.address_line2,
            city: data.city,
            state: data.state,
            country: data.country,
            pincode: data.pincode,
            role: data.role,
            created_at: data.created_at,
            updated_at: data.updated_at,
            avatar_url: data.avatar_url
          }
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // ✅ Initialize auth session and attach listener
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
      }

      const session = data?.session;
      if (session?.user) {
        await fetchAndSetProfile(session.user.id);
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }

      dispatch({ type: 'SET_AUTH_CHECKING', payload: false });

      // Now attach auth state change listener
      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('[Auth event]', event);

        if (session?.user) {
          await fetchAndSetProfile(session.user.id);
        } else {
          dispatch({ type: 'SET_USER', payload: null });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
