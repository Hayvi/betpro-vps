import { useState, useEffect, useRef } from 'react';

// Lazy loading component that only renders when in viewport
export function LazySection({ children, fallback = null, rootMargin = '100px' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      { rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, hasLoaded]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
}

// Skeleton loader for dashboard cards
export function DashboardSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-slate-200 dark:bg-slate-800 h-16 rounded-xl" />
      ))}
    </div>
  );
}
