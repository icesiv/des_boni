import { useState, useEffect, useRef } from 'react';
import { Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

const navLinks = [
  { label: 'Gallery', href: '#gallery' },
  { label: 'Shop', href: '#shop' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (href: string) => {
    if (href === '#') return;
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      ref={footerRef}
      className="bg-[#242b3d] py-12 border-t border-[#3d4554]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Logo & Description */}
          <div
            className={`transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              {/* DCS Cube Logo */}
              <div className="relative w-10 h-10">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  <defs>
                    <linearGradient id="footerCubeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4a9eff" />
                      <stop offset="100%" stopColor="#6ab3ff" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M24 4L44 14L24 24L4 14L24 4Z"
                    fill="url(#footerCubeGradient)"
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
                </svg>
              </div>
              <span className="font-semibold text-white tracking-wider text-sm">
                DYNAMIC CREATIVE STUDIOS
              </span>
            </div>
            <p className="text-[#a0aec0] text-sm leading-relaxed">
              Creating immersive 3D experiences and digital artistry that pushes the boundaries of imagination.
            </p>
          </div>

          {/* Navigation */}
          <div
            className={`transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{
              transitionDelay: '100ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-[#a0aec0] hover:text-[#4a9eff] transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div
            className={`transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{
              transitionDelay: '200ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <h3 className="text-white font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-[#3d4554] flex items-center justify-center text-[#a0aec0] hover:bg-[#4a9eff] hover:text-white transition-all duration-300 hover:scale-110"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={`mt-10 pt-6 border-t border-[#3d4554] text-center transition-all duration-600 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transitionDelay: '400ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <p className="text-[#a0aec0] text-sm">
            © {new Date().getFullYear()} Dynamic Creative Studios. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
