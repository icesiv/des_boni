import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'GALLERY', href: '#gallery' },
  { label: 'SHOP', href: '#shop' },
  { label: 'ABOUT', href: '#about' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#1a1f2e]/95 backdrop-blur-xl shadow-lg'
            : 'bg-transparent'
        }`}
        style={{
          height: isScrolled ? '60px' : '70px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <a
              href="#"
              className="flex items-center gap-3 group"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {/* DCS Cube Logo */}
              <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  <defs>
                    <linearGradient id="cubeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4a9eff" />
                      <stop offset="100%" stopColor="#6ab3ff" />
                    </linearGradient>
                  </defs>
                  {/* Cube faces */}
                  <path
                    d="M24 4L44 14L24 24L4 14L24 4Z"
                    fill="url(#cubeGradient)"
                    opacity="0.9"
                  />
                  <path
                    d="M4 14L24 24V44L4 34V14Z"
                    fill="#3d8aed"
                    opacity="0.8"
                  />
                  <path
                    d="M44 14L24 24V44L44 34V14Z"
                    fill="#2d7add"
                    opacity="0.7"
                  />
                  {/* Edges */}
                  <path
                    d="M24 4L44 14L24 24L4 14L24 4Z"
                    fill="none"
                    stroke="#6ab3ff"
                    strokeWidth="1"
                  />
                  <path
                    d="M4 14L24 24V44"
                    fill="none"
                    stroke="#6ab3ff"
                    strokeWidth="1"
                  />
                  <path
                    d="M44 14L24 24V44"
                    fill="none"
                    stroke="#6ab3ff"
                    strokeWidth="1"
                  />
                </svg>
              </div>
              <span
                className={`font-semibold text-white tracking-wider transition-all duration-300 ${
                  isScrolled ? 'text-sm' : 'text-base'
                }`}
              >
                DYNAMIC CREATIVE STUDIOS
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="relative text-sm font-medium text-[#a0aec0] hover:text-white transition-all duration-300 group"
                  style={{
                    animationDelay: `${100 + index * 80}ms`,
                  }}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-[#4a9eff] transition-all duration-300 group-hover:w-full group-hover:left-0" />
                </button>
              ))}
              <button
                onClick={() => scrollToSection('#contact')}
                className="px-5 py-2 border border-[#4a9eff] text-[#4a9eff] text-sm font-medium rounded hover:bg-[#4a9eff] hover:text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(74,158,255,0.4)] hover:scale-105"
              >
                CONTACT
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-[#1a1f2e]/98 backdrop-blur-xl transition-all duration-500 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <nav className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link, index) => (
            <button
              key={link.label}
              onClick={() => scrollToSection(link.href)}
              className="text-2xl font-medium text-white hover:text-[#4a9eff] transition-colors duration-300"
              style={{
                opacity: isMobileMenuOpen ? 1 : 0,
                transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.4s ease ${index * 0.1}s`,
              }}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => scrollToSection('#contact')}
            className="mt-4 px-8 py-3 border-2 border-[#4a9eff] text-[#4a9eff] text-xl font-medium rounded hover:bg-[#4a9eff] hover:text-white transition-all duration-300"
            style={{
              opacity: isMobileMenuOpen ? 1 : 0,
              transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.4s ease ${navLinks.length * 0.1}s`,
            }}
          >
            CONTACT
          </button>
        </nav>
      </div>
    </>
  );
}
