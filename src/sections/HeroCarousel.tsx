import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export function HeroCarousel() {
  const [heroImages, setHeroImages] = useState<{ src: string, alt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetch('/api/hero-images')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHeroImages(data.map(url => ({ src: url, alt: url.split('/').pop() || 'Slide' })));
        }
      })
      .catch(err => {
        console.error('Failed to load hero images:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    if (heroImages.length === 0) return;
    goToSlide((currentSlide + 1) % heroImages.length);
  }, [currentSlide, goToSlide, heroImages.length]);

  const prevSlide = useCallback(() => {
    if (heroImages.length === 0) return;
    goToSlide((currentSlide - 1 + heroImages.length) % heroImages.length);
  }, [currentSlide, goToSlide, heroImages.length]);

  // Auto-advance — re-fires when images are loaded
  useEffect(() => {
    if (isPaused || heroImages.length === 0) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, heroImages.length]);

  return (
    <section
      className="relative w-full pt-[70px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto">
        {/* Carousel Container with 3D perspective */}
        <div
          className="relative overflow-hidden h-[80vh] bg-dark"
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-[#4a9eff] animate-spin" />
            </div>
          ) : heroImages.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-4">
              <div className="text-6xl text-white/20 mb-2">🖼️</div>
              <p className="text-white/60 text-lg font-medium">No hero images found</p>
              <p className="text-white/40 text-sm">Go to the <a href="/admin" className="text-[#4a9eff] hover:underline">Admin Panel</a> to upload images.</p>
            </div>
          ) : (
            <>
              <div className="relative w-full h-full">
                {heroImages.map((image, index) => {
                  const isActive = index === currentSlide;
                  const isPrev = index === (currentSlide - 1 + heroImages.length) % heroImages.length;
                  const isNext = index === (currentSlide + 1) % heroImages.length;

                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-600 ${isActive ? 'z-20' : 'z-10'
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
                      {/* Blurred Stretched Background */}
                      <img
                        src={image.src}
                        alt=""
                        className="absolute inset-0 w-full h-full object-fill blur-2xl scale-110 opacity-50"
                      />
                      {/* Foreground Fitted Image */}
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="absolute z-10 top-0 left-1/2 -translate-x-1/2 h-full w-auto max-w-none"
                      />
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#1a1f2e]/30 to-transparent" />
                    </div>
                  );
                })}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                disabled={isTransitioning}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full backdrop-blur-sm text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-[0_0_30px_rgba(74,158,255,0.3)] disabled:opacity-50"
                style={{
                  animation: 'pulse 3s ease-in-out infinite',
                }}
              >
                <ChevronLeft size={48} />
              </button>
              <button
                onClick={nextSlide}
                disabled={isTransitioning}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full backdrop-blur-sm text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-[0_0_30px_rgba(74,158,255,0.3)] disabled:opacity-50"
                style={{
                  animation: 'pulse 3s ease-in-out infinite',
                }}
              >
                <ChevronRight size={48} />
              </button>

              {/* Dot Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    disabled={isTransitioning}
                    className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                      ? 'w-6 bg-[#4a9eff]'
                      : 'w-2 bg-white/50 hover:bg-white/80 hover:scale-125'
                      }`}
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                    }}
                  />
                ))}
              </div>
            </>
          )}
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
            transform: translateY(-50%) scale(1.2);
          }
        }
      `}</style>
    </section>
  );
}
