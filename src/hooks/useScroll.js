import { useState, useEffect } from 'react';
import { SCROLL_THRESHOLD } from '@/constants/theme';

export function useScroll() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateScrollState = () => {
      const scrolled = window.scrollY > SCROLL_THRESHOLD;
      setIsScrolled((prev) => {
        // Avoid unnecessary re-renders if the value didn't change
        if (prev === scrolled) return prev;
        return scrolled;
      });
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateScrollState);
      }
    };

    // Initialize based on current position
    updateScrollState();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return isScrolled;
}

