import { useEffect, useRef, useState } from 'react';

const raf = (callback) => {
  if (typeof globalThis !== 'undefined' && typeof globalThis.requestAnimationFrame === 'function') {
    return globalThis.requestAnimationFrame(callback);
  }
  return setTimeout(() => callback(Date.now()), 16);
};

const caf = (id) => {
  if (typeof globalThis !== 'undefined' && typeof globalThis.cancelAnimationFrame === 'function') {
    globalThis.cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
};


export function useAnimatedNumber(value, { duration = 400 } = {}) {
  const [displayValue, setDisplayValue] = useState(value || 0);
  const previousValueRef = useRef(value || 0);
  const frameRef = useRef(null);
  const startTimeRef = useRef(0);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const startValue = previousValueRef.current ?? 0;
    const endValue = typeof value === 'number' ? value : 0;

    if (startValue === endValue) {
      setDisplayValue(endValue);
      previousValueRef.current = endValue;
      return;
    }

    // PERFORMANCE FIX #8: Prevent RAF leaks by ensuring only one animation runs at a time
    if (frameRef.current) {
      caf(frameRef.current);
      frameRef.current = null;
    }
    
    // Reset animation state
    startTimeRef.current = 0;
    isAnimatingRef.current = true;

    const diff = endValue - startValue;
    const durationMs = duration;

    const step = (timestamp) => {
      // Check if animation was cancelled
      if (!isAnimatingRef.current) {
        return;
      }

      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / durationMs, 1);

      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + diff * eased;
      setDisplayValue(current);

      if (progress < 1 && isAnimatingRef.current) {
        frameRef.current = raf(step);
      } else {
        // Animation complete
        previousValueRef.current = endValue;
        startTimeRef.current = 0;
        isAnimatingRef.current = false;
        frameRef.current = null;
      }
    };

    frameRef.current = raf(step);

    return () => {
      // PERFORMANCE FIX #8: Comprehensive cleanup to prevent RAF leaks
      isAnimatingRef.current = false;
      if (frameRef.current) {
        caf(frameRef.current);
        frameRef.current = null;
      }
      startTimeRef.current = 0;
    };
  }, [value, duration]);

  return displayValue;
}
