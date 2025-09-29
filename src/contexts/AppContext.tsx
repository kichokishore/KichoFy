// src/contexts/AppContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Product, CartItem, Order } from '../types';

export type Language = 'en' | 'ta' | 'hi' | 'te';

interface AppState {
  user: User | null;
  cart: CartItem[];
  orders: Order[];
  darkMode: boolean;
  language: Language;
  isLoading: boolean;
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
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  user: null,
  cart: [],
  orders: [],
  darkMode: false,
  language: 'en',
  isLoading: false,
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

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};