import { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, Loader2, X, ChevronLeft, ChevronRight, Plus, ChevronDown } from 'lucide-react';

interface GalleryImage {
  filename: string;
  src: string;
  alt: string;
  categories: string[];
  link?: string;
}

// ── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ images, index, onClose }: {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);
  const [loaded, setLoaded] = useState(false);

  const prev = useCallback(() => { setLoaded(false); setCurrent(c => (c - 1 + images.length) % images.length); }, [images.length]);
  const next = useCallback(() => { setLoaded(false); setCurrent(c => (c + 1) % images.length); }, [images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose, prev, next]);

  const img = images[current];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X size={20} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {current + 1} / {images.length}
      </div>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev(); }}
          className="absolute left-3 md:left-6 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110"
        >
          <ChevronLeft size={26} />
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
        {!loaded && <Loader2 className="absolute w-10 h-10 text-[#4a9eff] animate-spin" />}
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          onLoad={() => setLoaded(true)}
          className={`max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {loaded && img.categories.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {img.categories.map(cat => (
              <span key={cat} className="text-[10px] font-semibold bg-[#4a9eff]/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                {cat}
              </span>
            ))}
          </div>
        )}

      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next(); }}
          className="absolute right-3 md:right-6 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110"
        >
          <ChevronRight size={26} />
        </button>
      )}
    </div>
  );
}

// ── Gallery Section ─────────────────────────────────────────────────────────
export function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isVisible, setIsVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // State to track how many images to show
  const [visibleCount, setVisibleCount] = useState(6);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch('/api/gallery-images')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setImages(data);
          const cats = Array.from(new Set(data.flatMap((img: GalleryImage) => img.categories)));
          setCategories(cats);
        }
      })
      .catch(err => console.error('Failed to load gallery images:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Reset visible count when category changes
  useEffect(() => {
    setVisibleCount(6);
  }, [activeCategory]);

  const filtered = activeCategory === 'ALL'
    ? images
    : images.filter(img => img.categories.includes(activeCategory));

  // Slice the array based on visibleCount
  const visibleImages = filtered.slice(0, visibleCount);

  // Check if there are more images to load
  const hasMore = filtered.length > visibleCount;

  return (
    <section ref={sectionRef} id="gallery">
      {lightboxIndex !== null && (
        <Lightbox
          images={visibleImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <div className="max-w-7xl bg-dark mx-auto">
        <h2 className="text-center text-xl md:text-2xl font-bold text-white py-4">GALLERY</h2>

        {loading ? (
          <div className="flex justify-start py-16">
            <Loader2 className="w-10 h-10 text-[#4a9eff] animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="text-5xl text-white/20">🖼️</div>
            <p className="text-white/60">No gallery images yet.</p>
            <p className="text-white/40 text-sm">Go to the <a href="/admin" className="text-[#4a9eff] hover:underline">Admin Panel</a> to add images.</p>
          </div>
        ) : (
          <>
            {/* Category Filter - Responsive */}
            <div className="px-8 lg:px-10 relative z-30">
              {/* Desktop Tabs */}
              <div className="hidden md:flex flex-wrap">
                {['ALL', ...categories].map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`relative px-8 pr-10 py-2 font-semibold transition-all duration-300 ${activeCategory === category
                      ? 'bg-[#202938] text-white'
                      : 'text-[#a0aec0] hover:text-white hover:bg-[#202938]/60'}`}
                    style={{ clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 100%, 0 100%)' }}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Mobile Dropdown */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between bg-[#202938] text-white px-6 py-3 font-semibold rounded-t-lg border-b border-white/10"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[#4a9eff] text-xs uppercase tracking-widest font-bold">Category:</span>
                    {activeCategory}
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-8 right-8 top-full bg-[#1a1f2e] border border-white/10 rounded-b-lg shadow-2xl overflow-hidden transition-all duration-300">
                    {['ALL', ...categories].map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setActiveCategory(category);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-6 py-3 transition-colors ${activeCategory === category
                          ? 'bg-[#4a9eff] text-white font-bold'
                          : 'text-[#a0aec0] hover:bg-white/5 hover:text-white'}`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content Wrapper for Background consistency */}
            <div className="bg-[#202938] pt-4 lg:pt-8 pb-8 lg:pb-10 px-4 sm:px-8 lg:px-10">
              <div className="grid grid-cols-2 lg:grid-cols-3" style={{ perspective: '1000px' }}>
                {visibleImages.map((image, index) => (
                  <div
                    key={image.filename}
                    onClick={() => setLightboxIndex(index)}
                    className={`group bg-black p-1 relative overflow-hidden cursor-pointer transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                      transform: isVisible ? 'rotateY(0deg)' : 'rotateY(-90deg)',
                      transformStyle: 'preserve-3d',
                      transitionDelay: `${300 + index * 100}ms`,
                      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <div className="aspect-[1/1] overflow-hidden">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                      />
                    </div>

                    {/* Category badges on hover */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      {image.categories.map(cat => (
                        <span key={cat} className="text-[10px] font-semibold bg-[#4a9eff]/80 text-white px-2 py-0.5 rounded-full">
                          {cat}
                        </span>
                      ))}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Hover Icons Container */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      {/* View Icon (Lightbox) */}
                      <div
                        className="w-12 h-12 rounded-full bg-white/10 hover:bg-[#4a9eff] backdrop-blur-md flex items-center justify-center transform scale-0 group-hover:scale-100 transition-all duration-300 border border-white/20 hover:border-[#4a9eff]"
                        style={{ transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}
                      >
                        <Eye className="w-5 h-5 text-white" />
                      </div>

                      {/* ArtStation Link */}
                      {image.link && (
                        <a
                          href={image.link.startsWith('http') ? image.link : `https://${image.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-[#4a9eff] backdrop-blur-md text-white rounded-full text-[10px] font-bold tracking-widest uppercase transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 border border-white/10 hover:border-[#4a9eff]"
                        >
                          ArtStation
                        </a>
                      )}
                    </div>

                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#4a9eff] transition-all duration-300 pointer-events-none" />
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 6)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#4a9eff]/10 hover:bg-[#4a9eff]/20 text-[#4a9eff] font-semibold rounded-lg transition-colors border border-[#4a9eff]/30 hover:border-[#4a9eff]/60"
                  >
                    <Plus size={18} />
                    Load More
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
