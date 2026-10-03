import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { HERO_SLIDES } from '../data/hotelsData.js';

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const totalSlides = HERO_SLIDES.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Autoplay with pause on hover or interaction
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, currentSlide, totalSlides]);

  return (
    <div 
      className="hero-slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Khuyến mãi & Điểm đến nổi bật"
    >
      {/* Slides */}
      {HERO_SLIDES.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className={`hero-slide ${isActive ? 'active' : ''}`}
          >
            {/* Background Image */}
            <img
              src={slide.image}
              alt={slide.headline}
              className="hero-slide-image"
              referrerPolicy="no-referrer"
            />

            {/* Dark Scrim Gradient for perfect typography legibility */}
            <div className="hero-slide-scrim" />

            {/* Slide Content */}
            <div className="hero-slide-content-wrapper">
              <div className="container-7xl" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
                <div className="hero-slide-inner">
                  {slide.badge && (
                    <div className="hero-slide-badge">
                      <Sparkles style={{ width: '14px', height: '14px' }} />
                      <span>{slide.badge}</span>
                    </div>
                  )}

                  <h1 className="hero-slide-headline">
                    {slide.headline}
                  </h1>

                  <p className="hero-slide-description">
                    {slide.description}
                  </p>

                  {slide.cta && (
                    <div style={{ paddingTop: '8px' }}>
                      <Link
                        to={slide.link || '/search'}
                        className="hero-slide-cta-btn"
                      >
                        {slide.cta}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrow Buttons */}
      <button
        type="button"
        onClick={prevSlide}
        className="slider-nav-btn slider-nav-btn--prev"
        aria-label="Slide trước"
      >
        <ChevronLeft style={{ width: '20px', height: '20px' }} />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        className="slider-nav-btn slider-nav-btn--next"
        aria-label="Slide tiếp theo"
      >
        <ChevronRight style={{ width: '20px', height: '20px' }} />
      </button>

      {/* Slide Indicators (Dots) */}
      <div className="slider-indicators">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => goToSlide(idx)}
            className={`slider-dot ${idx === currentSlide ? 'active' : ''}`}
            aria-label={`Chuyển đến slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
