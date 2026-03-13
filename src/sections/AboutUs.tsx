import { useState, useEffect, useRef } from 'react';

const teamMembers = [
  {
    name: 'SM BONIN',
    role: 'Proprietor',
    image: '/assets/team_1.jpg',
  },
  {
    name: 'LUTHFUN NAHAR',
    role: 'MD',
    image: '/assets/asset_15.jpg',
  },
  {
    name: 'ASHIM AHAMED',
    role: 'MD',
    image: '/assets/asset_16.jpg',
  },
  {
    name: 'ASHIM AHAMED',
    role: 'MD',
    image: '/assets/team_4.jpg',
  },
  {
    name: 'ASHIM AHAMED',
    role: 'MD',
    image: '/assets/asset_18.jpg',
  },
];

export function AboutUs() {
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
      id="about"
      className="py-16 bg-[#1a1f2e]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2
            className={`text-3xl md:text-4xl font-bold text-white transition-all duration-600 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            ABOUT US
          </h2>
          <div
            className={`mx-auto mt-2 h-1 bg-[#4a9eff] transition-all duration-500 ${
              isVisible ? 'w-24' : 'w-0'
            }`}
            style={{
              transitionDelay: '300ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>

        {/* Team Members Grid */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {teamMembers.map((member, index) => {
            // Calculate entrance animation based on position
            const entranceAnimations = [
              { x: -100, y: 0, rotate: -30 },    // Left
              { x: 0, y: -80, rotate: 0 },       // Top
              { x: 100, y: 0, rotate: 30 },      // Right
              { x: -60, y: 60, rotate: -15 },    // Bottom-left
              { x: 60, y: 60, rotate: 15 },      // Bottom-right
            ];
            const anim = entranceAnimations[index];

            return (
              <div
                key={index}
                className={`group relative transition-all duration-700 ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  transform: isVisible
                    ? 'translate(0, 0) rotate(0deg)'
                    : `translate(${anim.x}px, ${anim.y}px) rotate(${anim.rotate}deg)`,
                  transitionDelay: `${200 + index * 100}ms`,
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  animation: isVisible ? `float${index} 5s ease-in-out infinite` : 'none',
                  animationDelay: `${index * 0.5}s`,
                }}
              >
                {/* Member Card */}
                <div className="flex flex-col items-center">
                  {/* Avatar */}
                  <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-[#3d4554] group-hover:border-[#4a9eff] transition-all duration-400 group-hover:shadow-[0_0_30px_rgba(74,158,255,0.4)]">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* Name & Role */}
                  <div className="mt-4 text-center">
                    <h3 className="text-white font-semibold text-sm tracking-wide group-hover:text-[#4a9eff] transition-colors duration-300">
                      {member.name}
                    </h3>
                    <p className="text-[#a0aec0] text-xs mt-1 relative">
                      {member.role}
                      <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-[#4a9eff] transition-all duration-300 group-hover:w-full group-hover:left-0" />
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes float0 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float4 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
      `}</style>
    </section>
  );
}
