/**
 * PERFORMANCE FIX #15: Component Re-render Optimization Utilities
 * Utilities to help optimize component re-renders and performance
 */

import { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react';

/**
 * Custom memo with shallow comparison for props
 * More efficient than React.memo for simple props
 */
export function shallowMemo(Component, propKeys = []) {
  return memo(Component, (prevProps, nextProps) => {
    // If no specific keys provided, compare all props
    const keysToCompare = propKeys.length > 0 ? propKeys : Object.keys(prevProps);
    
    for (const key of keysToCompare) {
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Hook to memoize expensive computations with dependency tracking
 */
export function useExpensiveMemo(factory, deps, debugName = '') {
  const computationCount = useRef(0);
  
  const result = useMemo(() => {
    computationCount.current++;
    if (process.env.NODE_ENV === 'development' && debugName) {
      console.log(`[${debugName}] Expensive computation #${computationCount.current}`);
    }
    return factory();
  }, deps);
  
  return result;
}

/**
 * Hook to memoize callbacks with dependency tracking
 */
export function useStableCallback(callback, deps, debugName = '') {
  const callbackCount = useRef(0);
  
  return useCallback((...args) => {
    callbackCount.current++;
    if (process.env.NODE_ENV === 'development' && debugName) {
      console.log(`[${debugName}] Callback called #${callbackCount.current}`);
    }
    return callback(...args);
  }, deps);
}

/**
 * Hook to detect unnecessary re-renders
 */
export function useRenderTracker(componentName, props = {}) {
  const renderCount = useRef(0);
  const prevProps = useRef(props);
  
  useEffect(() => {
    renderCount.current++;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] Render #${renderCount.current}`);
      
      // Log changed props
      const changedProps = [];
      for (const key in props) {
        if (prevProps.current[key] !== props[key]) {
          changedProps.push({
            key,
            prev: prevProps.current[key],
            next: props[key]
          });
        }
      }
      
      if (changedProps.length > 0) {
        console.log(`[${componentName}] Changed props:`, changedProps);
      }
      
      prevProps.current = props;
    }
  });
  
  return renderCount.current;
}

/**
 * Hook to debounce expensive operations
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Hook to throttle expensive operations
 */
export function useThrottle(callback, delay) {
  const lastRun = useRef(Date.now());
  
  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
}

/**
 * Hook for lazy initialization of expensive values
 */
export function useLazyValue(factory) {
  const [value] = useState(factory);
  return value;
}

/**
 * Hook to memoize object/array props to prevent unnecessary re-renders
 */
export function useStableValue(value) {
  const ref = useRef(value);
  
  // Only update if the value has actually changed (deep comparison for objects/arrays)
  if (JSON.stringify(ref.current) !== JSON.stringify(value)) {
    ref.current = value;
  }
  
  return ref.current;
}

/**
 * Higher-order component to add performance monitoring
 */
export function withPerformanceMonitoring(Component, componentName) {
  const MonitoredComponent = (props) => {
    useRenderTracker(componentName, props);
    return <Component {...props} />;
  };
  
  MonitoredComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return MonitoredComponent;
}

/**
 * Hook to prevent unnecessary effect runs
 */
export function useStableEffect(effect, deps, debugName = '') {
  const depsRef = useRef(deps);
  const effectCount = useRef(0);
  
  const depsChanged = deps.some((dep, index) => dep !== depsRef.current[index]);
  
  useEffect(() => {
    if (depsChanged) {
      effectCount.current++;
      if (process.env.NODE_ENV === 'development' && debugName) {
        console.log(`[${debugName}] Effect run #${effectCount.current}`);
      }
      depsRef.current = deps;
      return effect();
    }
  }, deps);
}

/**
 * Component wrapper to prevent re-renders when children haven't changed
 */
export const StableChildren = memo(({ children }) => children);

/**
 * Utility to create stable event handlers
 */
export function createStableHandlers(handlers) {
  const stableHandlers = {};
  
  for (const [key, handler] of Object.entries(handlers)) {
    stableHandlers[key] = useCallback(handler, []);
  }
  
  return stableHandlers;
}

export default {
  shallowMemo,
  useExpensiveMemo,
  useStableCallback,
  useRenderTracker,
  useDebounce,
  useThrottle,
  useLazyValue,
  useStableValue,
  withPerformanceMonitoring,
  useStableEffect,
  StableChildren,
  createStableHandlers
};