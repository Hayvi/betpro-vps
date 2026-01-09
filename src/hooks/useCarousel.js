import { useState, useEffect } from 'react';
import { CAROUSEL_INTERVAL } from '@/constants/homeDefaults';

export function useCarousel(totalSlides) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (totalSlides <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, CAROUSEL_INTERVAL);

    return () => clearInterval(timer);
  }, [totalSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return { currentSlide, nextSlide, prevSlide, goToSlide };
}

