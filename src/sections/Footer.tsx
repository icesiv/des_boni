import { useState, useEffect, useRef } from 'react';




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


  return (
    <footer
      ref={footerRef}
      className="bg-[#242b3d] border-t border-[#3d4554]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Bottom Bar */}
        <div
          className={`p-2  border-t border-[#3d4554] text-center transition-all duration-600 ${isVisible ? 'opacity-100' : 'opacity-0'
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
