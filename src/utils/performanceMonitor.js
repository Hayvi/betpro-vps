// Performance monitoring for 5K+ users
import { useEffect } from 'react';

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.thresholds = {
      queryTime: 1000, // 1 second
      renderTime: 100,  // 100ms
      memoryUsage: 100 * 1024 * 1024, // 100MB
    };
  }

  // Track query performance
  trackQuery(name, startTime, endTime = Date.now()) {
    const duration = endTime - startTime;
    this.recordMetric('query', name, duration);
    
    if (duration > this.thresholds.queryTime) {
      console.warn(`Slow query detected: ${name} took ${duration}ms`);
    }
  }

  // Track render performance
  trackRender(component, startTime, endTime = Date.now()) {
    const duration = endTime - startTime;
    this.recordMetric('render', component, duration);
    
    if (duration > this.thresholds.renderTime) {
      console.warn(`Slow render detected: ${component} took ${duration}ms`);
    }
  }

  // Track memory usage
  trackMemory() {
    if (performance.memory) {
      const usage = performance.memory.usedJSHeapSize;
      this.recordMetric('memory', 'heap', usage);
      
      if (usage > this.thresholds.memoryUsage) {
        console.warn(`High memory usage detected: ${(usage / 1024 / 1024).toFixed(2)}MB`);
      }
    }
  }

  recordMetric(type, name, value) {
    const key = `${type}_${name}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    const values = this.metrics.get(key);
    values.push({ value, timestamp: Date.now() });
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics() {
    const summary = {};
    
    for (const [key, values] of this.metrics.entries()) {
      if (values.length === 0) continue;
      
      const recent = values.slice(-10);
      const avg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
      const max = Math.max(...recent.map(m => m.value));
      const min = Math.min(...recent.map(m => m.value));
      
      summary[key] = { avg, max, min, count: values.length };
    }
    
    return summary;
  }

  // Performance-aware query wrapper
  async monitoredQuery(name, queryFn) {
    const start = Date.now();
    try {
      const result = await queryFn();
      this.trackQuery(name, start);
      return result;
    } catch (error) {
      this.trackQuery(`${name}_error`, start);
      throw error;
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor(componentName) {
  const startTime = Date.now();
  
  useEffect(() => {
    return () => {
      performanceMonitor.trackRender(componentName, startTime);
    };
  }, [componentName, startTime]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      performanceMonitor.trackMemory();
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, []);
}
