import { useState, useEffect, useRef } from 'react';
import { Mail, Phone } from 'lucide-react';

// Simple WhatsApp SVG icon
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="contact" className="relative overflow-hidden">
      {/* Section Title */}
      <div className="max-w-7xl bg-dark mx-auto">
        <h2 className="text-center text-xl md:text-2xl font-bold text-white py-4">CONTACT US</h2>
      </div>

      {/* Full-width background image */}
      <div className="max-w-7xl mx-auto relative">
        <img
          src="/assets/common/asset_19.jpg"
          alt="Angel statue background"
          className="w-full object-contain"
        />

        {/* Overlay content centred on the image */}
        <div className="absolute top-40 inset-0 flex flex-col items-center justify-start gap-6 px-4 pt-25">

          {/* Email */}
          <a
            href="mailto:bonin@dynamiccreativestudios"
            className={`group flex items-center gap-4 text-white hover:text-[#6ab3ff] transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
            style={{ transitionDelay: '300ms', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="w-11 h-11 rounded-full bg-[#4a9eff]/20 flex items-center justify-center group-hover:bg-[#4a9eff]/40 group-hover:scale-110 transition-all duration-300">
              <Mail className="w-5 h-5 text-[#4a9eff] group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="relative">
              <span className="text-base md:text-lg">bonin@dynamiccreativestudios</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4a9eff] transition-all duration-300 group-hover:w-full" />
            </div>
          </a>

          {/* Phone + WhatsApp */}
          <div
            className={`flex items-center gap-4 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
            style={{ transitionDelay: '450ms', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {/* Phone call */}
            <a href="tel:+8801675216604" className="group flex items-center gap-3 text-white hover:text-[#6ab3ff] transition-all duration-300">
              <div className="w-11 h-11 rounded-full bg-[#4a9eff]/20 flex items-center justify-center group-hover:bg-[#4a9eff]/40 group-hover:scale-110 transition-all duration-300">
                <Phone className="w-5 h-5 text-[#4a9eff] group-hover:text-white transition-colors duration-300" />
              </div>
            </a>

            {/* WhatsApp link */}
            <a
              href="https://wa.me/8801675216604"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-11 h-11 rounded-full bg-[#25d366]/20 flex items-center justify-center hover:bg-[#25d366]/40 hover:scale-110 transition-all duration-300"
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon className="w-5 h-5 text-[#25d366] group-hover:text-white transition-colors duration-300" />
            </a>

            {/* Number text */}
            <span className="text-base md:text-lg text-white">+880 1675216604</span>

          </div>
        </div>
      </div>
    </section>
  );
}
