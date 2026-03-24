import { useState, useEffect, useRef } from 'react';
import { Eye, Loader2 } from 'lucide-react';

interface GalleryImage {
  filename: string;
  src: string;
  alt: string;
  categories: string[];
}

export function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch('/api/gallery-images')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setImages(data);
          // Derive unique categories from data, preserve insertion order
          const cats = Array.from(new Set(data.flatMap((img: GalleryImage) => img.categories)));
          setCategories(cats);
        }
      })
      .catch(err => console.error('Failed to load gallery images:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const filtered = activeCategory === 'ALL'
    ? images
    : images.filter(img => img.categories.includes(activeCategory));

  return (
    <section ref={sectionRef} id="gallery">
      <div className="max-w-7xl bg-[#0a1018] mx-auto">
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
            {/* Category Tabs */}
            <div className="flex flex-wrap px-8 lg:px-10">
              {['ALL', ...categories].map((category, index) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`relative px-8 pr-10 py-2 font-semibold transition-all duration-300 ${activeCategory === category
                    ? 'bg-[#202938] text-white'
                    : 'text-[#a0aec0] hover:text-white hover:bg-[#202938]/60'}`}
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 100%, 0 100%)',
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Image Grid */}
            <div className="pt-4 lg:pt-8 pb-8 lg:pb-10 px-8 lg:px-10 bg-[#202938] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ perspective: '1000px' }}>
              {filtered.map((image, index) => (
                <div
                  key={image.filename}
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

                  {/* View Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div
                      className="w-14 h-14 rounded-full bg-[#4a9eff]/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}
                    >
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-[#4a9eff] transition-all duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
