// Memory optimization utilities for 5K+ users
import { useEffect, useRef, useCallback } from 'react';

// Cleanup intervals and timeouts on unmount
export function useCleanupTimers() {
  const timersRef = useRef(new Set());

  const addTimer = useCallback((timer) => {
    timersRef.current.add(timer);
    return timer;
  }, []);

  const clearTimer = useCallback((timer) => {
    clearTimeout(timer);
    clearInterval(timer);
    timersRef.current.delete(timer);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup all timers on unmount
      timersRef.current.forEach(timer => {
        clearTimeout(timer);
        clearInterval(timer);
      });
      timersRef.current.clear();
    };
  }, []);

  return { addTimer, clearTimer };
}

// Throttle function calls to prevent excessive re-renders
export function useThrottle(callback, delay) {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
}

// Memory-efficient array operations
export const arrayUtils = {
  // Chunk large arrays for processing
  chunk: (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  // Remove duplicates efficiently
  unique: (array, key) => {
    const seen = new Set();
    return array.filter(item => {
      const value = key ? item[key] : item;
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  },

  // Batch operations to prevent blocking
  batchProcess: async (array, processor, batchSize = 100) => {
    const chunks = arrayUtils.chunk(array, batchSize);
    const results = [];
    
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(chunk.map(processor));
      results.push(...chunkResults);
      
      // Yield control to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return results;
  }
};
