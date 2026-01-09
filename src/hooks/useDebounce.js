import { useState, useEffect } from 'react';
import { logger } from '@/services/logger';


export const useDebounce = (value, delay = 500, options = {}) => {
  const { onDebounce = null, context = 'useDebounce' } = options;

  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    logger.debug(`Debounce started: ${context}`, { value, delay });

    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      logger.debug(`Debounce completed: ${context}`, { value });

      if (onDebounce) {
        onDebounce(value);
      }
    }, delay);

    // Clean up the timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, context, onDebounce]);

  return debouncedValue;
};

export default useDebounce;
