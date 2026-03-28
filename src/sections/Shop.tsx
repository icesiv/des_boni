
import { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, ShoppingCart, Loader2, X, ChevronLeft, ChevronRight, Plus, ChevronDown } from 'lucide-react';

interface ShopItem {
  id: string;
  filename: string;
  src: string;
  name: string;
  alt: string;
  category: string;
  price: string;
  link?: string;
}

// ── Shop Preview Modal ───────────────────────────────────────────────────────
function Lightbox({ items, index, onClose }: { items: ShopItem[]; index: number; onClose: () => void }) {
  const [current, setCurrent] = useState(index);
  const [loaded, setLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const thumbRef = useRef<HTMLDivElement>(null);

  const prev = useCallback(() => { setLoaded(false); setZoomed(false); setCurrent(c => (c - 1 + items.length) % items.length); }, [items.length]);
  const next = useCallback(() => { setLoaded(false); setZoomed(false); setCurrent(c => (c + 1) % items.length); }, [items.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose, prev, next]);

  // Scroll active thumbnail into view
  useEffect(() => {
    const el = thumbRef.current?.querySelector('[data-active="true"]') as HTMLElement;
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [current]);

  const item = items[current];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      style={{ background: 'rgba(5, 8, 18, 0.96)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      {/* Close */}
      <button onClick={onClose}
        className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90 hover:scale-110">
        <X size={18} />
      </button>

      {/* Main card */}
      <div
        className="relative w-full max-w-5xl flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10"
        style={{ background: 'linear-gradient(135deg, #0f1724 0%, #1a2233 100%)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Left: image ── */}
        <div className="relative md:w-3/5 flex-shrink-0 bg-black overflow-hidden cursor-zoom-in" onClick={() => setZoomed(z => !z)}>
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-[#4a9eff] animate-spin" />
            </div>
          )}
          <img
            key={item.src}
            src={item.src}
            alt={item.alt}
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-contain transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${zoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'}`}
            style={{ maxHeight: '65vh' }}
          />
          {/* Nav arrows on image */}
          {items.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 hover:bg-[#4a9eff]/80 text-white transition-all hover:scale-110">
                <ChevronLeft size={20} />
              </button>
              <button onClick={e => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 hover:bg-[#4a9eff]/80 text-white transition-all hover:scale-110">
                <ChevronRight size={20} />
              </button>
            </>
          )}
          {/* Counter badge */}
          <div className="absolute top-3 left-3 text-xs bg-black/60 text-white/70 px-2 py-0.5 rounded-full">
            {current + 1} / {items.length}
          </div>
          {/* Zoom hint */}
          {loaded && (
            <div className="absolute bottom-3 right-3 text-[10px] text-white/40 bg-black/50 px-2 py-1 rounded">
              {zoomed ? 'Click to zoom out' : 'Click to zoom in'}
            </div>
          )}
        </div>

        {/* ── Right: details panel ── */}
        <div className="flex flex-col flex-1 p-6 md:p-8 overflow-y-auto" style={{ maxHeight: '65vh' }}>
          {/* Category badge */}
          {item.category && (
            <span className="self-start text-[11px] font-bold tracking-widest px-3 py-1 rounded-full border border-[#4a9eff]/40 text-[#4a9eff] bg-[#4a9eff]/10 mb-4">
              {item.category}
            </span>
          )}

          {/* Name */}
          <h2 className="text-xl md:text-2xl font-bold text-white leading-tight mb-3">{item.name}</h2>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-5">
            <span className="text-3xl md:text-4xl font-extrabold text-[#4a9eff]">{item.price}</span>
          </div>

          {/* Description */}
          {item.alt && (
            <p className="text-[#a0aec0] text-sm leading-relaxed mb-6 flex-1">{item.alt}</p>
          )}

          {/* Divider */}
          <div className="h-px bg-white/10 mb-6" />

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {item.link ? (
              <a href={item.link} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#4a9eff] hover:bg-[#3b82f6] text-white font-semibold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(74,158,255,0.4)] active:scale-95">
                <ShoppingCart size={18} /> Buy on ArtStation
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 bg-white/5 text-white/40 font-semibold py-3 px-6 rounded-xl border border-white/10 cursor-not-allowed text-sm">
                <ShoppingCart size={16} /> No purchase link
              </div>
            )}
          </div>

          {/* Keyboard hint */}
          <p className="text-white/20 text-[10px] text-center mt-5">← → to navigate · Esc to close</p>
        </div>

        {/* ── Thumbnail strip ── */}
        {items.length > 1 && (
          <div ref={thumbRef}
            className="absolute bottom-0 left-0 md:left-0 md:bottom-auto md:top-0 flex md:flex-col gap-1.5 p-2 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden border-t md:border-t-0 md:border-l border-white/10"
            style={{ background: 'rgba(0,0,0,0.4)', maxHeight: '65vh', width: 'auto' }}>
            {items.map((it, i) => (
              <button key={it.id} data-active={i === current}
                onClick={() => { setLoaded(false); setZoomed(false); setCurrent(i); }}
                className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === current ? 'border-[#4a9eff] scale-105' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                <img src={it.src} alt={it.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shop Section ─────────────────────────────────────────────────────────────
export function Shop() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isVisible, setIsVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // State to track how many items to show
  const [visibleCount, setVisibleCount] = useState(6);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetch('/api/shop-items')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
          setCategories(Array.from(new Set(data.map((i: ShopItem) => i.category).filter(Boolean))));
        }
      })
      .catch(err => console.error('Failed to load shop items:', err))
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

  const filtered = activeCategory === 'ALL' ? items : items.filter(i => i.category === activeCategory);

  // Slice the array based on visibleCount
  const visibleItems = filtered.slice(0, visibleCount);

  // Check if there are more items to load
  const hasMore = filtered.length > visibleCount;

  return (
    <section ref={sectionRef} id="shop">
      {lightboxIndex !== null && <Lightbox items={visibleItems} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />}

      <div className="max-w-7xl bg-dark mx-auto">
        <h2 className="text-center text-xl md:text-2xl font-bold text-white py-4">SHOP</h2>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-16 bg-lite"><Loader2 className="w-10 h-10 text-[#4a9eff] animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-lite gap-3">
            <p className="text-white/60">No shop items yet.</p>
            <p className="text-white/40 text-sm">Go to the <a href="/admin" className="text-[#4a9eff] hover:underline">Admin Panel</a> to add items.</p>
          </div>
        ) : (
          <>
            {/* Category Filter - Responsive */}
            <div className="px-8 lg:px-10 relative z-30 bg-dark">
              {/* Desktop Tabs */}
              <div className="hidden md:flex flex-wrap">
                {['ALL', ...categories].map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`relative px-8 pr-10 py-2 font-semibold transition-all duration-300 ${activeCategory === cat ? 'bg-lite text-white' : 'text-[#a0aec0] hover:text-white hover:bg-lite/60'}`}
                    style={{ clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 100%, 0 100%)' }}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* Mobile Dropdown */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between bg-lite text-white px-6 py-3 font-semibold rounded-t-lg border-b border-white/10"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[#4a9eff] text-xs uppercase tracking-widest font-bold">Category:</span>
                    {activeCategory}
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-8 right-8 top-full bg-[#1a2233] border border-white/10 rounded-b-lg shadow-2xl overflow-hidden transition-all duration-300">
                    {['ALL', ...categories].map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-6 py-3 transition-colors ${activeCategory === cat
                          ? 'bg-[#4a9eff] text-white font-bold'
                          : 'text-[#a0aec0] hover:bg-white/5 hover:text-white'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content Wrapper for Background consistency */}
            <div className="bg-lite pt-4 lg:pt-8 pb-8 lg:pb-10 px-4 sm:px-8 lg:px-10">
              <div className="grid grid-cols-2 lg:grid-cols-3" style={{ perspective: '1000px' }}>
                {visibleItems.map((item, index) => (
                  <div key={item.id} onClick={() => setLightboxIndex(index)}
                    className={`group bg-black p-1 relative overflow-hidden cursor-pointer transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transform: isVisible ? 'rotateY(0deg)' : 'rotateY(-90deg)', transformStyle: 'preserve-3d', transitionDelay: `${300 + index * 100}ms`, transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>

                    {/* Changed aspect ratio to 16:9 using aspect-video */}
                    {/* <div className="aspect-video overflow-hidden"> */}
                    <img src={item.src} alt={item.alt} className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110" />

                    {/* badges */}
                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <span className="text-[10px] font-bold bg-[#4a9eff]/80 text-white px-2 py-0.5 rounded-full">{item.price}</span>
                      {item.category && <span className="text-[10px] font-semibold bg-black/60 text-white/80 px-2 py-0.5 rounded-full">{item.category}</span>}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-1 left-1 right-1 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <p className="text-white text-xs font-semibold truncate">{item.name}</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#4a9eff]/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300" style={{ transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', transitionDelay: '50ms' }}>
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                            className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 hover:bg-white"
                            style={{ transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', transitionDelay: '100ms' }}>
                            <ShoppingCart className="w-5 h-5 text-[#1a1f2e]" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#4a9eff] transition-all duration-300 pointer-events-none" />
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    // Changed increment from 6 to 9
                    onClick={() => setVisibleCount(prev => prev + 9)}
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
