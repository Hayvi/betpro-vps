import { useCallback, useRef } from 'react';
import { logger } from '@/services/logger';


export const usePerformance = () => {
  const metricsRef = useRef(new Map());

  
  const measure = useCallback(async (name, fn) => {
    const startTime = performance.now();
    const startMemory = process.memoryUsage?.().heapUsed || 0;

    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      const endMemory = process.memoryUsage?.().heapUsed || 0;
      const memoryDelta = endMemory - startMemory;

      const metric = {
        name,
        duration,
        memoryDelta,
        timestamp: Date.now(),
        success: true,
        error: null,
      };

      metricsRef.current.set(name, metric);
      logger.performance(`Performance: ${name}`, duration, { memoryDelta });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      const metric = {
        name,
        duration,
        timestamp: Date.now(),
        success: false,
        error: error.message,
      };

      metricsRef.current.set(name, metric);
      logger.error(`Performance error: ${name}`, error);

      throw error;
    }
  }, []);

  
  const getMetrics = useCallback((name) => {
    return metricsRef.current.get(name);
  }, []);

  
  const getAllMetrics = useCallback(() => {
    return Object.fromEntries(metricsRef.current);
  }, []);

  
  const clearMetrics = useCallback((name) => {
    if (name) {
      metricsRef.current.delete(name);
      logger.debug(`Metric cleared: ${name}`);
    } else {
      metricsRef.current.clear();
      logger.info('All metrics cleared');
    }
  }, []);

  
  const getAverageDuration = useCallback((name) => {
    const metric = metricsRef.current.get(name);
    return metric?.duration || 0;
  }, []);

  return {
    measure,
    getMetrics,
    getAllMetrics,
    clearMetrics,
    getAverageDuration,
  };
};

export default usePerformance;
