import { useState } from 'react';
import { logger } from '@/services/logger';
import { safeSetItem, safeGetItem } from '@/services/localStorageService';


export const useLocalStorage = (key, initialValue, options = {}) => {
  const { context = 'useLocalStorage' } = options;

  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = typeof window !== 'undefined' ? safeGetItem(key) : null;

      if (item) {
        logger.debug(`LocalStorage retrieved: ${key}`);
        return JSON.parse(item);
      }

      logger.debug(`LocalStorage key not found, using initial value: ${key}`);
      return initialValue;
    } catch (error) {
      logger.error(`Error reading from localStorage: ${key}`, error, { context });
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== 'undefined') {
        const success = safeSetItem(key, JSON.stringify(valueToStore));
        if (success) {
          logger.debug(`LocalStorage saved: ${key}`, { value: valueToStore });
        } else {
          logger.warn(`LocalStorage save failed due to quota limits: ${key}`);
        }
      }
    } catch (error) {
      logger.error(`Error writing to localStorage: ${key}`, error, { context });
    }
  };

  return [storedValue, setValue];
};


export const clearLocalStorage = (key) => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
      logger.debug(`LocalStorage cleared: ${key}`);
    }
  } catch (error) {
    logger.error(`Error clearing localStorage: ${key}`, error);
  }
};


export const clearAllLocalStorage = () => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
      logger.info('All localStorage cleared');
    }
  } catch (error) {
    logger.error('Error clearing all localStorage', error);
  }
};

export default useLocalStorage;
