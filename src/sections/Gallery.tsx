import { useState, useEffect, useRef } from 'react';
import { Eye } from 'lucide-react';

const categories = [
  'GAMES',
  'ANIMATION',
  '3D PRINT',
  'CONCEPT',
  '2D PAINT',
  'PORTRAIT',
  'ILLUSTRATION',
  'GRAPHIC DESIGN',
];

const galleryImages = [
  {
    src: '/assets/asset_2.jpg',
    alt: 'Character with fire hand',
    category: 'GAMES',
  },
  {
    src: '/assets/asset_3.jpg',
    alt: 'Orc warrior character',
    category: 'ANIMATION',
  },
  {
    src: '/assets/asset_4.jpg',
    alt: 'Red sci-fi gauntlet',
    category: '3D PRINT',
  },
  {
    src: '/assets/asset_5.jpg',
    alt: 'Black leather boot',
    category: 'CONCEPT',
  },
  {
    src: '/assets/asset_6.jpg',
    alt: 'Brown robe clothing',
    category: '2D PAINT',
  },
  {
    src: '/assets/asset_7.jpg',
    alt: 'Black glove with wireframe',
    category: 'PORTRAIT',
  },
];

export function Gallery() {
  const [activeCategory, setActiveCategory] = useState('GAMES');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="gallery"
      className="py-16 bg-[#1a1f2e]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-8">
          <h2
            className={`text-3xl md:text-4xl font-bold text-white transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            GALLERY
          </h2>
          <div
            className={`mx-auto mt-2 h-1 bg-[#4a9eff] transition-all duration-500 ${
              isVisible ? 'w-24' : 'w-0'
            }`}
            style={{
              transitionDelay: '400ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>

        {/* Category Tabs */}
        <div
          className={`flex flex-wrap justify-center gap-2 mb-8 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{
            transitionDelay: '200ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {categories.map((category, index) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-xs font-medium rounded transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-[#4a9eff] text-white'
                  : 'text-[#a0aec0] hover:text-white hover:bg-[#4a9eff]/10'
              }`}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${300 + index * 80}ms`,
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          style={{ perspective: '1000px' }}
        >
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-700 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transform: isVisible
                  ? 'rotateY(0deg)'
                  : 'rotateY(-90deg)',
                transformStyle: 'preserve-3d',
                transitionDelay: `${300 + index * 100}ms`,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                />
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* View Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-14 h-14 rounded-full bg-[#4a9eff]/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}
                >
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Border Glow on Hover */}
              <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-[#4a9eff] transition-all duration-300 pointer-events-none" />

              {/* Shadow on Hover */}
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
