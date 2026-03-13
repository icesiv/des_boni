import { useState, useEffect, useRef } from 'react';
import { Mail, Phone } from 'lucide-react';

export function ContactUs() {
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

  // Split title into letters for stagger animation
  const titleLetters = 'CONTACT US'.split('');

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative py-20 overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-110 translate-y-12'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <img
          src="/assets/asset_19.jpg"
          alt="Angel statue background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dark Overlay */}
      <div
        className={`absolute inset-0 bg-[#1a1f2e] transition-opacity duration-800 ${
          isVisible ? 'opacity-70' : 'opacity-0'
        }`}
        style={{ transitionDelay: '200ms' }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title with Letter Stagger */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {titleLetters.map((letter, index) => (
              <span
                key={index}
                className={`inline-block transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: `${400 + index * 50}ms`,
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            ))}
          </h2>
          <div
            className={`mx-auto mt-2 h-1 bg-[#4a9eff] transition-all duration-500 ${
              isVisible ? 'w-24' : 'w-0'
            }`}
            style={{
              transitionDelay: '900ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>

        {/* Contact Information */}
        <div className="flex flex-col items-center gap-6">
          {/* Email */}
          <a
            href="mailto:bonin@dynamiccreativestudios"
            className={`group flex items-center gap-4 text-white hover:text-[#6ab3ff] transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
            style={{
              transitionDelay: '700ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="w-12 h-12 rounded-full bg-[#4a9eff]/20 flex items-center justify-center group-hover:bg-[#4a9eff]/40 group-hover:scale-110 transition-all duration-300">
              <Mail className="w-5 h-5 text-[#4a9eff] group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="relative">
              <span className="text-lg">bonin@dynamiccreativestudios</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4a9eff] transition-all duration-300 group-hover:w-full" />
            </div>
          </a>

          {/* Phone */}
          <a
            href="tel:+8801675216604"
            className={`group flex items-center gap-4 text-white hover:text-[#6ab3ff] transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
            style={{
              transitionDelay: '850ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="w-12 h-12 rounded-full bg-[#4a9eff]/20 flex items-center justify-center group-hover:bg-[#4a9eff]/40 group-hover:scale-110 transition-all duration-300">
              <Phone className="w-5 h-5 text-[#4a9eff] group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="relative">
              <span className="text-lg">Hotline: +880 1675216604</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4a9eff] transition-all duration-300 group-hover:w-full" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
