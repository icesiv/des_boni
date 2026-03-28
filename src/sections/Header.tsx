import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'GALLERY', href: '#gallery' },
  { label: 'SHOP', href: '#shop' },
  { label: 'ABOUT', href: '#about' },
  { label: 'CONTACT', href: '#contact' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const scrollPosition = window.scrollY + 100;
      let current = '';
      navLinks.forEach((link) => {
        const section = document.querySelector(link.href) as HTMLElement;
        if (section && section.offsetTop <= scrollPosition) {
          current = link.href;
        }
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
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
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-transparent"
        style={{
          height: isScrolled ? '60px' : '70px',
        }}
      >
        <div className="max-w-7xl bg-dark mx-auto px-4 sm:px-6 lg:px-8 h-full backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <a
              href="#"
              className="flex items-center gap-4 group h-full"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {/* DCS Cube Logo */}
              <div className={`relative transition-all duration-300 group-hover:scale-110 ${isScrolled ? 'w-14 h-14' : 'w-20 h-20'
                }`}>
                <div className='w-full h-full mt-5'>
                  <img src="assets/logo/dcs-logo-128.png" alt="DCS Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <span
                style={{ fontFamily: '"Graduate", sans-serif' }}
                className={`font-extrabold md:pt-8 text-white transition-all duration-300 ${isScrolled ? 'text-base' : 'text-base md:text-xl'
                  }`}
              >
                DYNAMIC CREATIVE STUDIOS
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 pt-8">
              {navLinks.map((link, index) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className={`relative text-sm font-medium transition-all duration-300 px-2 py-1 ${activeSection === link.href
                    ? 'text-white'
                    : 'text-[#a0aec0] hover:text-white'
                    }`}
                  style={{
                    animationDelay: `${100 + index * 80}ms`,
                  }}
                >
                  {activeSection === link.href && (
                    <img
                      src="assets/common/box.png"
                      alt="Active Box"
                      className="absolute inset-0 w-full h-full pointer-events-none object-fill"
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </button>
              ))}
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
        className={`fixed inset-0 z-40 bg-[#1a1f2e]/98 backdrop-blur-xl transition-all duration-500 md:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
      >
        <nav className="flex flex-col items-center justify-center h-full gap-6">
          {navLinks.map((link, index) => (
            <button
              key={link.label}
              onClick={() => scrollToSection(link.href)}
              className={`relative text-2xl font-medium transition-all duration-300 px-8 py-3 ${activeSection === link.href
                ? 'text-white'
                : 'text-white/70 hover:text-white'
                }`}
              style={{
                opacity: isMobileMenuOpen ? 1 : 0,
                transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.4s ease ${index * 0.1}s`,
              }}
            >
              {activeSection === link.href && (
                <img
                  src="assets/common/box.png"
                  alt="Active Box"
                  className="absolute inset-0 w-full h-full pointer-events-none object-fill"
                />
              )}
              <span className="relative z-10">{link.label}</span>
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
