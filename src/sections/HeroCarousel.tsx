import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const heroImages = [
  {
    src: '/assets/asset_1.jpg',
    alt: 'Robotic dog 3D render in forest environment',
  },
  {
    src: '/assets/asset_2.jpg',
    alt: 'Character with fire hand 3D render',
  },
  {
    src: '/assets/asset_3.jpg',
    alt: 'Orc warrior character 3D render',
  },
  {
    src: '/assets/asset_4.jpg',
    alt: 'Sci-fi gauntlet 3D model',
  },
  {
    src: '/assets/asset_5.jpg',
    alt: 'Leather boot 3D model',
  },
  {
    src: '/assets/asset_6.jpg',
    alt: 'Brown robe clothing 3D model',
  },
  {
    src: '/assets/asset_7.jpg',
    alt: 'Wireframe glove 3D model',
  },
  {
    src: '/assets/asset_8.jpg',
    alt: 'Fire hand character shop view',
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % heroImages.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + heroImages.length) % heroImages.length);
  }, [currentSlide, goToSlide]);

  // Auto-advance
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <section
      className="relative w-full pt-[70px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Carousel Container with 3D perspective */}
        <div
          className="relative overflow-hidden rounded-lg"
          style={{
            perspective: '1200px',
            aspectRatio: '16/9',
            maxHeight: '500px',
          }}
        >
          {/* Slides */}
          <div className="relative w-full h-full">
            {heroImages.map((image, index) => {
              const isActive = index === currentSlide;
              const isPrev = index === (currentSlide - 1 + heroImages.length) % heroImages.length;
              const isNext = index === (currentSlide + 1) % heroImages.length;

              return (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-600 ${
                    isActive ? 'z-20' : 'z-10'
                  }`}
                  style={{
                    transform: isActive
                      ? 'rotateY(0deg) translateZ(100px)'
                      : isPrev
                      ? 'rotateY(-90deg) translateZ(-100px)'
                      : isNext
                      ? 'rotateY(90deg) translateZ(-100px)'
                      : 'rotateY(0deg) translateZ(-200px)',
                    opacity: isActive ? 1 : 0,
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e]/30 to-transparent" />
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-[0_0_30px_rgba(74,158,255,0.3)] disabled:opacity-50"
            style={{
              animation: 'pulse 3s ease-in-out infinite',
            }}
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-[0_0_30px_rgba(74,158,255,0.3)] disabled:opacity-50"
            style={{
              animation: 'pulse 3s ease-in-out infinite',
            }}
          >
            <ChevronRight size={28} />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-6 bg-[#4a9eff]'
                    : 'w-2 bg-white/50 hover:bg-white/80 hover:scale-125'
                }`}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.7;
            transform: translateY(-50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-50%) scale(1.05);
          }
        }
      `}</style>
    </section>
  );
}
