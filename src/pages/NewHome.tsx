"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  ExternalLink,
  Menu,
  ArrowDown,
  ShoppingBag,
  Trophy,
  ArrowRight,
  Pencil,
  Paintbrush,
  Sparkles,
  Send,
  Palette,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  X
} from 'lucide-react';

export function NewHome() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxData, setLightboxData] = useState<{ src: string; cat: string; title: string; tools: string } | null>(null);
  const [formMsgVisible, setFormMsgVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    // Scroll active nav logic
    const handleScroll = () => {
      let current = '';
      sectionsRef.current.forEach((section) => {
        if (section) {
          const sectionTop = section.offsetTop - 120;
          if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id') || '';
          }
        }
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Scroll-triggered fade-in
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = '1';
          (entry.target as HTMLElement).style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.portfolio-item, .stat-card, .store-badge');
    elements.forEach((el) => {
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.transform = 'translateY(20px)';
      (el as HTMLElement).style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxData(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsgVisible(true);
    setTimeout(() => setFormMsgVisible(false), 4000);
    (e.target as HTMLFormElement).reset();
  };

  const openLightbox = (src: string, cat: string, title: string, tools: string) => {
    setLightboxData({ src, cat, title, tools });
  };

  interface HomeGalleryImage {
    id: string;
    categories: string[];
    src: string;
    title: string;
    tools: string;
    link?: string;
  }
  const [galleryItems, setGalleryItems] = useState<HomeGalleryImage[]>([]);
  const [galleryCategories, setGalleryCategories] = useState<{ id: string, label: string }[]>([{ id: 'all', label: 'All' }]);

  useEffect(() => {
    fetch('/api/gallery-images')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const items: HomeGalleryImage[] = data.map((img: any, idx: number) => ({
            id: img.filename || String(idx),
            categories: (img.categories || []).map((c: string) => c.toLowerCase()),
            src: img.src,
            title: img.alt || 'Untitled',
            tools: '',
            link: img.link
          }));
          setGalleryItems(items);

          const uniqueCats = Array.from(new Set(data.flatMap((img: any) => img.categories || [])));
          const catFilters = [
            { id: 'all', label: 'All' },
            ...uniqueCats.map(cat => ({
              id: (cat as string).toLowerCase(),
              label: (cat as string).toUpperCase()
            }))
          ];
          setGalleryCategories(catFilters);
        }
      })
      .catch(err => console.error('Failed to load gallery images:', err));
  }, []);

  const filteredGallery = galleryItems.filter(item => activeFilter === 'all' || item.categories.includes(activeFilter));

  interface HomeShopItem {
    id: string;
    category: string;
    src: string;
    title: string;
    price: string;
    link?: string;
    desc: string;
  }
  const [shopItems, setShopItems] = useState<HomeShopItem[]>([]);

  useEffect(() => {
    fetch('/api/shop-items')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const items: HomeShopItem[] = data.map((item: any, idx: number) => ({
            id: item.id || String(idx),
            category: item.category || 'Uncategorized',
            src: item.src,
            title: item.name || 'Untitled',
            price: item.price || '$0.00',
            link: item.link,
            desc: item.alt || ''
          }));
          setShopItems(items);
        }
      })
      .catch(err => console.error('Failed to load shop items:', err));
  }, []);

  interface HomeTeamMember {
    filename: string;
    src: string;
    name: string;
    role: string;
  }
  const [teamMembers, setTeamMembers] = useState<HomeTeamMember[]>([]);

  useEffect(() => {
    fetch('/api/team-members')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTeamMembers(data); })
      .catch(err => console.error('Failed to load team members:', err));
  }, []);

  return (
    <div className="bg-[#050505] text-zinc-100 overflow-x-hidden min-h-screen font-sans">
      <style>{`
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }

        .glass-panel { background: rgba(10, 10, 10, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); }
        .glass-card { background: rgba(10, 10, 10, 0.8); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.05); }
        
        .text-gradient { background: linear-gradient(to right, #ffffff, #a1a1aa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .text-gradient-accent { background: linear-gradient(135deg, #f97316, #fb923c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        
        .glow-orange { box-shadow: 0 0 40px rgba(249,115,22,0.15); }
        
        .portfolio-item img { transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), filter 0.6s ease; }
        .portfolio-item:hover img { transform: scale(1.05); filter: brightness(1.1); }
        .portfolio-item .overlay { opacity: 0; transition: opacity 0.4s ease; }
        .portfolio-item:hover .overlay { opacity: 1; }
        
        .hero-glow { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%); pointer-events: none; }
        
        .nav-link { position: relative; }
        .nav-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 1px; background: #f97316; transition: width 0.3s ease; }
        .nav-link:hover::after, .nav-link.active::after { width: 100%; }
        
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .float-anim { animation: float 6s ease-in-out infinite; }
        
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in-up { opacity: 0; animation: fadeInUp 0.8s ease forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        
        .stat-card { transition: border-color 0.3s ease, box-shadow 0.3s ease; }
        .stat-card:hover { border-color: rgba(249,115,22,0.3); box-shadow: 0 0 30px rgba(249,115,22,0.05); }
        
        .store-badge { transition: all 0.3s ease; }
        .store-badge:hover { border-color: rgba(249,115,22,0.5); box-shadow: 0 0 25px rgba(249,115,22,0.15); transform: translateY(-2px); }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-4 group">
            <div className="relative transition-all duration-300 group-hover:scale-110 w-12 h-12">
              <img src="assets/logo/dcs-logo-128.png" alt="DCS Logo" className="w-full h-full object-contain" />
            </div>
            <span
              style={{ fontFamily: '"Graduate", sans-serif' }}
              className="font-extrabold text-white text-sm md:text-base transition-all duration-300"
            >
              DYNAMIC CREATIVE STUDIOS
            </span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {['work', 'about', 'store', 'contact'].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className={`nav-link text-sm text-zinc-400 hover:text-zinc-100 transition-colors duration-150 ${activeSection === id ? 'active' : ''}`}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.artstation.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-orange-400 transition-colors duration-150 border border-zinc-800 rounded-full px-4 py-2 hover:border-orange-500/30"
            >
              <ExternalLink className="w-3 h-3" />
              ArtStation
            </a>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800/50 px-6 py-4 space-y-3 glass-panel">
            {['work', 'about', 'store', 'contact'].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="hero-glow top-1/4 left-0 float-anim"></div>
        <div className="hero-glow bottom-1/4 right-0 float-anim" style={{ animationDelay: '-3s' }}></div>

        <div className="absolute top-20 right-1/2 w-1 h-1 bg-orange-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 left-32 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 left-1/2 w-1 h-1 bg-zinc-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 mt-10">

          {/* Left: Text Content */}
          <div className="text-left">
            <div className="fade-in-up">
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-orange-500 mb-6">
                <span className="w-8 h-px bg-orange-500"></span>
                3D Character Artist
              </span>
            </div>

            <h1 className="fade-in-up delay-100 text-5xl md:text-6xl lg:text-7xl font-medium tracking-tighter leading-none mb-6">
              <span className="text-gradient">Crafting</span><br />
              <span className="text-gradient-accent">Characters</span>
              <span className="text-gradient"> That</span><br />
              <span className="text-gradient">Breathe Life</span>
            </h1>

            <p className="fade-in-up delay-200 text-zinc-400 text-base md:text-lg max-w-xl mb-10 leading-relaxed">
              Sculpting heroes, creatures, and worlds — from concept to real-time ready assets. Every polygon tells a story.
            </p>

            <div className="fade-in-up delay-300 flex flex-col sm:flex-row items-center gap-4">
              <a
                href="#work"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-b from-orange-500 to-orange-600 text-white text-sm font-medium px-8 py-3.5 rounded-full hover:from-orange-400 hover:to-orange-500 transition-all duration-150 shadow-lg shadow-orange-900/20 w-full sm:w-auto"
              >
                View Portfolio
                <ArrowDown className="w-4 h-4" />
              </a>
              <a
                href="#store"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-zinc-300 border border-zinc-700 px-8 py-3.5 rounded-full hover:border-orange-500/40 hover:text-orange-400 transition-all duration-150 w-full sm:w-auto"
              >
                <ShoppingBag className="w-4 h-4" />
                Visit Store
              </a>
            </div>
          </div>

          {/* Right: 360 3D Viewer */}
          <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[650px] fade-in-up delay-400 group">
            {/* Ambient glow behind the model */}
            <div className="absolute inset-0 bg-orange-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none transition-opacity duration-700 group-hover:bg-orange-500/20"></div>

            <div className="relative w-full h-full glass-card rounded-2xl overflow-hidden border border-zinc-800/50 shadow-2xl shadow-orange-900/10 glow-orange">
              {/* 
                Spider-bot PENI PARKER: THE FRESHMAN
                Parameters used: transparent=1 (removes background), autostart=1, ui_theme=dark
                NOTE: Sketchfab forces UI on free accounts. We use CSS cropping to hide the top/bottom UI bars.
              */}
              <iframe
                title="Spider-bot PENI PARKER: THE FRESHMAN"
                className="absolute top-[-70px] left-[-2px] w-[calc(100%+4px)] h-[calc(100%+140px)]"
                src="https://sketchfab.com/models/ebc5906ea6724549bd4aa65a9ed87bf1/embed?autostart=1&transparent=1&ui_theme=dark&ui_infos=0&ui_watermark=0&ui_controls=0&ui_stop=0&ui_hint=0"
                frameBorder="0"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
              ></iframe>
            </div>
          </div>

        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 fade-in-up delay-500 hidden lg:block">
          <div className="w-5 h-8 border border-zinc-700 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-orange-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 border-y border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="stat-card glass-card rounded-xl p-5 text-center border border-zinc-800/50">
            <div className="text-2xl md:text-3xl font-semibold text-white mb-1">8+</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Years Experience</div>
          </div>
          <div className="stat-card glass-card rounded-xl p-5 text-center border border-zinc-800/50">
            <div className="text-2xl md:text-3xl font-semibold text-white mb-1">120+</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Characters Created</div>
          </div>
          <div className="stat-card glass-card rounded-xl p-5 text-center border border-zinc-800/50">
            <div className="text-2xl md:text-3xl font-semibold text-white mb-1">40+</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Store Products</div>
          </div>
          <div className="stat-card glass-card rounded-xl p-5 text-center border border-zinc-800/50">
            <div className="text-2xl md:text-3xl font-semibold text-white mb-1">15+</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Shipped Titles</div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="work" className="py-24 relative" ref={el => sectionsRef.current[0] = el}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-orange-500 mb-4">
              <span className="w-8 h-px bg-orange-500"></span>
              Portfolio
            </span>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tighter text-gradient mb-4">Selected Work</h2>
            <p className="text-zinc-400 max-w-xl">A curated selection of characters, creatures, and sculpts — from AAA game assets to collectible figurines.</p>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {galleryCategories.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`filter-btn text-xs font-medium px-4 py-2 rounded-full border transition-all duration-150 ${activeFilter === filter.id
                  ? 'border-orange-500/40 text-orange-400 bg-orange-500/5'
                  : 'border-zinc-700 text-zinc-400 hover:border-orange-500/40 hover:text-orange-400'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity duration-300">
            {filteredGallery.map((item, index) => (
              <div
                key={item.id}
                className="portfolio-item fade-in-up group cursor-pointer rounded-xl overflow-hidden relative border border-zinc-800/50"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => openLightbox(item.src, item.categories[0] || '', item.title, item.tools)}
              >
                <div className="aspect-[3/4] overflow-hidden bg-zinc-900/50">
                  <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                  {item.categories.length > 0 && (
                    <span className="text-[10px] uppercase tracking-widest text-orange-400 mb-1">{item.categories[0]}</span>
                  )}
                  <h3 className="text-lg font-medium text-white">{item.title}</h3>
                  {item.tools && <p className="text-xs text-zinc-400 mt-1">{item.tools}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ArtStation Store Section */}
      <section id="store" className="py-24 relative border-t border-zinc-800/50" ref={el => sectionsRef.current[1] = el}>
        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-orange-500 mb-4">
              <span className="w-8 h-px bg-orange-500"></span>
              Store
            </span>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tighter text-gradient mb-4">ArtStation Store</h2>
            <p className="text-zinc-400 max-w-xl">Ready-to-use 3D assets, brushes, alphas, and full character kits — available now on my ArtStation store.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {shopItems.slice(0, 4).map((product) => (
              <div key={product.id} onClick={() => product.link && window.open(product.link, '_blank')} className="store-badge glass-card rounded-xl overflow-hidden border border-zinc-800/50 group cursor-pointer">
                <div className="aspect-square overflow-hidden bg-zinc-900/50">
                  <img src={product.src} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <span className="text-[10px] uppercase tracking-widest text-orange-400">{product.category}</span>
                  <h3 className="text-sm font-medium text-zinc-100 mt-1">{product.title}</h3>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-orange-400 font-semibold text-sm">{product.price}</span>
                    <span className="text-[10px] text-zinc-500 truncate max-w-[100px]" title={product.desc}>{product.desc}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="https://bony.artstation.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-gradient-to-b from-orange-500 to-orange-600 text-white text-sm font-medium px-10 py-4 rounded-full hover:from-orange-400 hover:to-orange-500 transition-all duration-150 shadow-lg shadow-orange-900/20 glow-orange"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Full Store on ArtStation
              <ArrowRight className="w-4 h-4" />
            </a>
            <p className="text-xs text-zinc-600 mt-4">Instant download · Commercial license included</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 border-t border-zinc-800/50" ref={el => sectionsRef.current[2] = el}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative flex flex-wrap justify-center gap-x-8 gap-y-12">
              {teamMembers.map((member, index) => (
                <div
                  key={member.filename}
                  className="group relative fade-in-up w-[40%] sm:w-[45%] flex justify-center"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-orange-500 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                      <img
                        src={member.src}
                        alt={member.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <h3 className="text-white font-semibold text-sm sm:text-base tracking-wide group-hover:text-orange-400 transition-colors duration-300">
                        {member.name}
                      </h3>
                      <p className="text-zinc-500 text-xs sm:text-sm mt-1 relative inline-block">
                        {member.role}
                        <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full group-hover:left-0" />
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-orange-500 mb-4">
                <span className="w-8 h-px bg-orange-500"></span>
                About
              </span>
              <h2 className="text-3xl md:text-5xl font-medium tracking-tighter text-gradient mb-2">DCS</h2>
              <h2 className="text-sm md:text-xs uppercase tracking-tighter text-gradient mb-6">DYNAMIC CREATIVE STUDIOS</h2>
              <div className="space-y-4 text-zinc-400 leading-relaxed">
                <p>We are a premier 3D character art studio bringing over eight years of industry expertise to the gaming and collectibles sectors. Our team specializes in high-fidelity sculpting, optimized real-time character pipelines, and the seamless delivery of production-ready assets for both AAA and independent studios.</p>
                <p>Our comprehensive portfolio encompasses diverse art directions, ranging from grounded sci-fi and high fantasy to highly stylized aesthetics. Our design philosophy is rooted in a rigorous understanding of anatomy and visual storytelling, allowing us to consistently push the technical and narrative boundaries of character art in interactive media.</p>
                <p>Beyond our core client services, we are committed to advancing the global 3D art community. We engineer and distribute professional-grade production resources—including proprietary brushes, foundational base meshes, and comprehensive asset kits—accessible via our studio’s ArtStation storefront.</p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {['ZBrush', 'Blender', 'Maya', 'Substance Painter', 'Unreal Engine', 'Marmoset', 'Keyshot', 'Marvelous Designer'].map((tool) => (
                  <span key={tool} className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-zinc-800 text-zinc-400">{tool}</span>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-4">
                <a href="#contact" className="inline-flex items-center gap-2 bg-gradient-to-b from-orange-500 to-orange-600 text-white text-sm font-medium px-6 py-3 rounded-full hover:from-orange-400 hover:to-orange-500 transition-all duration-150">
                  Get in Touch
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a href="https://bony.artstation.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-orange-400 transition-colors duration-150">
                  <ExternalLink className="w-4 h-4" />
                  ArtStation Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-orange-500 mb-4">
              <span className="w-8 h-px bg-orange-500"></span>
              Process
              <span className="w-8 h-px bg-orange-500"></span>
            </span>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tighter text-gradient">How I Work</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card rounded-xl p-6 border border-zinc-800/50 text-center stat-card">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center mx-auto mb-4">
                <Pencil className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-orange-500 mb-2">Step 01</div>
              <h3 className="text-lg font-medium text-zinc-100 mb-2">Concept</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Gathering reference, sketching silhouettes, and defining the character's story and visual language.</p>
            </div>

            <div className="glass-card rounded-xl p-6 border border-zinc-800/50 text-center stat-card">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center mx-auto mb-4">
                <Box className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-orange-500 mb-2">Step 02</div>
              <h3 className="text-lg font-medium text-zinc-100 mb-2">Blockout</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Establishing proportions, pose, and major forms before committing to detail work.</p>
            </div>

            <div className="glass-card rounded-xl p-6 border border-zinc-800/50 text-center stat-card">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center mx-auto mb-4">
                <Paintbrush className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-orange-500 mb-2">Step 03</div>
              <h3 className="text-lg font-medium text-zinc-100 mb-2">Sculpt & Texture</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">High-poly sculpting, retopology, UV mapping, and hand-painted or PBR texturing.</p>
            </div>

            <div className="glass-card rounded-xl p-6 border border-zinc-800/50 text-center stat-card">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-orange-500 mb-2">Step 04</div>
              <h3 className="text-lg font-medium text-zinc-100 mb-2">Present</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Rigging, posing, lighting, and final renders — real-time or offline for maximum impact.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 border-t border-zinc-800/50" ref={el => sectionsRef.current[3] = el}>
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-orange-500 mb-4">
              <span className="w-8 h-px bg-orange-500"></span>
              Contact
              <span className="w-8 h-px bg-orange-500"></span>
            </span>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tighter text-gradient mb-4">Let's Work Together</h2>
            <p className="text-zinc-400">Available for freelance, contract, and full-time opportunities. Drop me a message.</p>
          </div>

          <form onSubmit={handleContactSubmit} className="glass-card rounded-2xl p-8 border border-zinc-800/50 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Name</label>
                <input type="text" required placeholder="Your name" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Email</label>
                <input type="email" required placeholder="you@email.com" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Project Type</label>
              <select className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-400 focus:outline-none focus:border-orange-500/50 transition-colors">
                <option>Character Design</option>
                <option>Creature Design</option>
                <option>Asset Creation</option>
                <option>Full Pipeline</option>
                <option>Consulting</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Message</label>
              <textarea rows={5} required placeholder="Tell me about your project..." className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"></textarea>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-b from-orange-500 to-orange-600 text-white text-sm font-medium px-8 py-3.5 rounded-full hover:from-orange-400 hover:to-orange-500 transition-all duration-150 shadow-lg shadow-orange-900/20">
                Send Message
                <Send className="w-4 h-4" />
              </button>
              {formMsgVisible && (
                <span className="text-xs text-green-400">Message sent! I'll get back to you soon.</span>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 relative">
                <img src="assets/logo/dcs-logo-128.png" alt="DCS Logo" className="w-full h-full object-contain" />
              </div>
              <span
                style={{ fontFamily: '"Graduate", sans-serif' }}
                className="text-sm font-extrabold text-white tracking-tight"
              >
                DYNAMIC CREATIVE STUDIOS
              </span>
            </div>

            <div className="flex items-center gap-6">
              <a href="https://www.artstation.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-orange-400 transition-colors duration-150" title="ArtStation">
                <Palette className="w-5 h-5" />
              </a>
              <a href="#" className="text-zinc-500 hover:text-orange-400 transition-colors duration-150" title="Twitter / X">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-zinc-500 hover:text-orange-400 transition-colors duration-150" title="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-zinc-500 hover:text-orange-400 transition-colors duration-150" title="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-zinc-500 hover:text-orange-400 transition-colors duration-150" title="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            <p className="text-xs text-zinc-600">© 2025 Studio3D. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Lightbox */}
      {lightboxData && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxData(null)}
        >
          <button
            onClick={() => setLightboxData(null)}
            className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-4xl max-h-[85vh] relative" onClick={e => e.stopPropagation()}>
            <img src={lightboxData.src} alt={lightboxData.title} className="max-w-full max-h-[85vh] object-contain rounded-xl" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl p-5">
              <span className="text-[10px] uppercase tracking-widest text-orange-400">{lightboxData.cat}</span>
              <h3 className="text-lg font-medium text-white">{lightboxData.title}</h3>
              <p className="text-xs text-zinc-400 mt-1">{lightboxData.tools}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewHome;