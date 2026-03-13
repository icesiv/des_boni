import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Eye } from 'lucide-react';

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

const shopItems = [
  {
    src: '/assets/asset_8.jpg',
    alt: 'Fire hand character model',
    category: 'GAMES',
    price: '$49.99',
    name: 'Fire Mage Character',
  },
  {
    src: '/assets/asset_9.jpg',
    alt: 'Orc warrior model',
    category: 'ANIMATION',
    price: '$59.99',
    name: 'Orc Warrior',
  },
  {
    src: '/assets/asset_10.jpg',
    alt: 'Sci-fi gauntlet model',
    category: '3D PRINT',
    price: '$29.99',
    name: 'Sci-Fi Gauntlet',
  },
  {
    src: '/assets/asset_11.jpg',
    alt: 'Leather boot model',
    category: 'CONCEPT',
    price: '$24.99',
    name: 'Combat Boot',
  },
  {
    src: '/assets/asset_12.jpg',
    alt: 'Robe clothing model',
    category: '2D PAINT',
    price: '$34.99',
    name: 'Traditional Robe',
  },
  {
    src: '/assets/asset_13.jpg',
    alt: 'Tactical glove model',
    category: 'PORTRAIT',
    price: '$19.99',
    name: 'Tactical Glove',
  },
];

export function Shop() {
  const [activeCategory, setActiveCategory] = useState('GAMES');
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
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
      id="shop"
      className="py-16 bg-[#242b3d]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-8">
          <h2
            className={`text-3xl md:text-4xl font-bold text-white transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            SHOP
          </h2>
          <div
            className={`mx-auto mt-2 h-1 bg-[#4a9eff] transition-all duration-500 origin-left ${
              isVisible ? 'w-24 scale-x-100' : 'w-24 scale-x-0'
            }`}
            style={{
              transitionDelay: '300ms',
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
                transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${100 + index * 80}ms`,
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {shopItems.map((item, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-lg bg-[#2d3548] transition-all duration-500 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{
                transitionDelay: `${100 + index * 100}ms`,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Product Image */}
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-[#1a1f2e]/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                  <button className="w-12 h-12 rounded-full bg-[#4a9eff] flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 hover:bg-[#6ab3ff] hover:scale-110"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', transitionDelay: '50ms' }}
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </button>
                  <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 hover:bg-gray-100 hover:scale-110"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', transitionDelay: '100ms' }}
                  >
                    <ShoppingCart className="w-5 h-5 text-[#1a1f2e]" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-white font-medium text-sm mb-1 group-hover:text-[#4a9eff] transition-colors duration-300">
                  {item.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-[#4a9eff] font-semibold">{item.price}</span>
                  <span className="text-[#a0aec0] text-xs">{item.category}</span>
                </div>
              </div>

              {/* Hover Shadow */}
              <div
                className={`absolute inset-0 rounded-lg pointer-events-none transition-all duration-300 ${
                  hoveredItem === index ? 'shadow-[0_25px_50px_rgba(0,0,0,0.5)]' : ''
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
