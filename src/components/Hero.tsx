import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Banner } from '../types';

interface HeroProps {
  banners: Banner[];
  onCtaClick: (slug: string) => void;
}

export default function Hero({ banners, onCtaClick }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeBanners = banners.filter(b => b.isActive);

  // Auto scroll effect
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const slide = activeBanners[currentSlide];

  return (
    <div className="relative h-[480px] md:h-[580px] w-full bg-[#f8ede3] overflow-hidden rounded-[40px] md:my-4 luxury-shadow group">
      
      {/* Background Image with Referral Protection & Overlay */}
      <div className="absolute inset-0 transition-all duration-1000 ease-out">
        <img
          src={slide.image}
          alt={slide.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform scale-102 transition-transform duration-[6000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cozzy-cream/85 via-cozzy-cream/55 to-transparent md:from-cozzy-cream/75 md:via-cozzy-cream/45" />
      </div>

      {/* Slide Content */}
      <div className="relative h-full max-w-7xl mx-auto flex items-center px-6 md:px-16">
        <div className="max-w-xl flex flex-col items-start gap-4 animate-soft-fade-in" key={currentSlide}>
          
          {slide.badge && (
            <span className="inline-block bg-cozzy-taupe/15 text-cozzy-taupe text-[10px] font-extrabold tracking-[0.25em] px-3.5 py-1.5 rounded-full uppercase" id="hero-slide-badge">
              {slide.badge}
            </span>
          )}

          <h2 className="text-3xl md:text-5xl font-serif tracking-tight text-cozzy-cocoa leading-[1.15]" id="hero-slide-title">
            {slide.title}
          </h2>

          <p className="text-sm md:text-base text-cozzy-taupe/90 max-w-lg leading-relaxed font-light" id="hero-slide-subtitle">
            {slide.subtitle}
          </p>

          <button
            onClick={() => onCtaClick(slide.link)}
            className="mt-4 bg-cozzy-cocoa hover:bg-cozzy-taupe text-[#fffaf7] font-semibold tracking-wider text-xs px-7 py-3.5 rounded-full shadow-cozzy-lg hover:shadow-cozzy-rose hover:translate-y-[-2px] hover:scale-[1.03] transition-all cursor-pointer uppercase"
            id="hero-slide-cta-button"
          >
            Explore Collection
          </button>
        </div>
      </div>

      {/* Slides navigation buttons */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 hover:bg-white text-cozzy-cocoa opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 hover:bg-white text-cozzy-cocoa opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Navigation Indicators */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-6 bg-cozzy-taupe' : 'w-2 bg-cozzy-taupe/30'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

    </div>
  );
}
