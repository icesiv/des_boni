import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface TeamMember {
  filename: string;
  src: string;
  name: string;
  role: string;
  order: number;
}

export function AboutUs() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch('/api/team-members')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setMembers(data); })
      .catch(err => console.error('Failed to load team members:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const entranceAnimations = [
    { x: -100, y: 0, rotate: -30 },
    { x: 0, y: -80, rotate: 0 },
    { x: 100, y: 0, rotate: 30 },
    { x: -60, y: 60, rotate: -15 },
    { x: 60, y: 60, rotate: 15 },
  ];

  return (
    <section ref={sectionRef} id="about">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-7xl bg-dark mx-auto">
          <h2 className="text-center text-xl md:text-2xl font-bold text-white py-4">ABOUT US</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32 bg-lite">
            <Loader2 className="w-10 h-10 text-[#4a9eff] animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-lite gap-3">
            <p className="text-white/60">No team members yet.</p>
            <p className="text-white/40 text-sm">Go to the <a href="/admin" className="text-[#4a9eff] hover:underline">Admin Panel</a> to add team members.</p>
          </div>
        ) : (
          <div className="flex bg-lite flex-wrap justify-center gap-8 md:gap-12 py-32">
            {members.map((member, index) => {
              const anim = entranceAnimations[index % entranceAnimations.length];
              return (
                <div
                  key={member.filename}
                  className={`group relative transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    transform: isVisible
                      ? 'translate(0, 0) rotate(0deg)'
                      : `translate(${anim.x}px, ${anim.y}px) rotate(${anim.rotate}deg)`,
                    transitionDelay: `${200 + index * 100}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    animation: isVisible ? `float${index % 5} 5s ease-in-out infinite` : 'none',
                    animationDelay: `${index * 0.5}s`,
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-2 border-[#3d4554] group-hover:border-[#4a9eff] transition-all duration-400 group-hover:shadow-[0_0_30px_rgba(74,158,255,0.4)]">
                      <img
                        src={member.src}
                        alt={member.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                      />
                    </div>
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
        )}
      </div>

      <style>{`
        @keyframes float0 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes float1 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes float2 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
        @keyframes float3 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes float4 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
      `}</style>
    </section>
  );
}
