import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import React from 'react';

// Virtual scrolling hook for large datasets
export function useVirtualScroll({
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef(null);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + overscan, items.length);
    
    return {
      start: Math.max(0, start - overscan),
      end,
      visibleItems: items.slice(Math.max(0, start - overscan), end)
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    scrollElementRef,
    visibleItems: visibleRange.visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex: visibleRange.start
  };
}

// Memoized table row component to prevent unnecessary re-renders
export const MemoizedTableRow = ({ children, ...props }) => {
  return <tr {...props}>{children}</tr>;
};

// Optimize with React.memo and custom comparison
export const OptimizedTableRow = React.memo(MemoizedTableRow, (prevProps, nextProps) => {
  // Only re-render if data actually changed
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
});
