// src/hooks/useDebounce.ts
import { useState, useEffect, useRef } from 'react';

/**
 * A custom hook that debounces a value
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear the previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * A custom hook that debounces a function call
 * @param callback The function to debounce
 * @param delay The delay in milliseconds (default: 500ms)
 * @returns The debounced function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef<T>(callback);

  // Update callback ref if callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  };

  return debouncedCallback;
}

/**
 * A custom hook that debounces state updates
 * Useful for search inputs, form fields, etc.
 * @param initialValue The initial value
 * @param delay The delay in milliseconds (default: 500ms)
 * @returns [value, setValue, debouncedValue] - The current value, setter, and debounced value
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 500
): [T, (value: T | ((prev: T) => T)) => void, T] {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(value, delay);

  return [value, setValue, debouncedValue];
}

/**
 * A custom hook that provides both immediate and debounced versions of a value
 * Useful when you need both real-time and debounced values
 * @param initialValue The initial value
 * @param delay The delay in milliseconds (default: 500ms)
 * @returns { immediate: T, debounced: T, setValue: (value: T) => void } - Object with both values and setter
 */
export function useDualValue<T>(
  initialValue: T,
  delay: number = 500
): {
  immediate: T;
  debounced: T;
  setValue: (value: T | ((prev: T) => T)) => void;
} {
  const [immediate, setValue] = useState<T>(initialValue);
  const debounced = useDebounce(immediate, delay);

  return {
    immediate,
    debounced,
    setValue,
  };
}

/**
 * A custom hook that debounces API calls or expensive operations
 * Provides loading state and cancellation
 * @param asyncFunction The async function to debounce
 * @param delay The delay in milliseconds (default: 500ms)
 * @returns [execute, loading, cancel] - The execute function, loading state, and cancel function
 */
export function useDebouncedAsync<T extends (...args: any[]) => Promise<any>>(
  asyncFunction: T,
  delay: number = 500
): [
  (...args: Parameters<T>) => Promise<void>,
  boolean,
  () => void
] {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [loading, setLoading] = useState<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const execute = async (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return new Promise<void>((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        if (!mountedRef.current) return;

        setLoading(true);
        try {
          await asyncFunction(...args);
          resolve();
        } catch (error) {
          console.error('Debounced async function error:', error);
          resolve();
        } finally {
          if (mountedRef.current) {
            setLoading(false);
          }
        }
      }, delay);
    });
  };

  const cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLoading(false);
  };

  return [execute, loading, cancel];
}

/**
 * A custom hook that provides debounced value with leading edge invocation
 * Useful for instant response on first keystroke then debounce subsequent ones
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default: 500ms)
 * @param leading Whether to invoke on leading edge (default: false)
 * @returns The debounced value
 */
export function useDebounceWithLeading<T>(
  value: T,
  delay: number = 500,
  leading: boolean = false
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const isLeading = useRef<boolean>(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (leading && isLeading.current) {
      // Leading edge invocation
      setDebouncedValue(value);
      isLeading.current = false;
    } else {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for trailing edge
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        isLeading.current = true; // Reset for next leading edge
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, leading]);

  return debouncedValue;
}

/**
 * A custom hook that combines multiple debounced values
 * Useful when you need to debounce multiple related values together
 * @param values Array of values to debounce
 * @param delay The delay in milliseconds (default: 500ms)
 * @returns The debounced values array
 */
export function useDebounceMultiple<T>(
  values: T[],
  delay: number = 500
): T[] {
  const [debouncedValues, setDebouncedValues] = useState<T[]>(values);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValues(values);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [values, delay]);

  return debouncedValues;
}

export default {
  useDebounce,
  useDebouncedCallback,
  useDebouncedState,
  useDualValue,
  useDebouncedAsync,
  useDebounceWithLeading,
  useDebounceMultiple,
};