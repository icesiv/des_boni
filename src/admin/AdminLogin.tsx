import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';

export const AUTH_TOKEN_KEY = 'dcs_admin_token';

interface Props {
  onLogin: (token: string) => void;
}

export function AdminLogin({ onLogin }: Props) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // Auto-check existing token on mount
  useEffect(() => {
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (token) onLogin(token);
  }, [onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.token) {
        sessionStorage.setItem(AUTH_TOKEN_KEY, data.token);
        onLogin(data.token);
      } else {
        setError(data.error || 'Incorrect password');
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setPassword('');
      }
    } catch {
      setError('Server error — is the dev server running?');
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a2a4a 0%, #0a1018 70%)' }}
    >
      {/* Subtle animated grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#4a9eff33 1px, transparent 1px), linear-gradient(90deg, #4a9eff33 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Glowing orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4a9eff]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className={`relative w-full max-w-sm mx-4 transition-all ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}>
        {/* Card */}
        <div className="rounded-2xl border border-white/10 p-8 shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
          style={{ background: 'linear-gradient(160deg, #0f1724 0%, #1a2233 100%)', backdropFilter: 'blur(20px)' }}>

          {/* Logo / Icon */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#4a9eff]/15 border border-[#4a9eff]/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(74,158,255,0.2)]">
              <Shield className="w-7 h-7 text-[#4a9eff]" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">Admin Panel</h1>
            <p className="text-white/40 text-sm mt-1">Enter your password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#4a9eff]/60 focus:bg-white/8 transition-all"
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2 bg-[#4a9eff] hover:bg-[#3b82f6] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-[0_0_25px_rgba(74,158,255,0.4)] hover:scale-[1.02] active:scale-95"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {loading ? 'Verifying…' : 'Enter Admin Panel'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">DCS Admin · Local access only</p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-10px); }
          40%       { transform: translateX(10px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
