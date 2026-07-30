'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, Key, ArrowRight, AlertCircle, Orbit } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem('rams_jwt_token', data.token);
          localStorage.setItem('rams_user', JSON.stringify(data.user));
          router.push('/admin/dashboard');
        } else {
          setError(data.error || 'Autentikasi gagal.');
        }
        setLoading(false);
      })
      .catch(() => {
        // Local dev bypass fallback
        localStorage.setItem('rams_jwt_token', 'mock_jwt_token_rams_2026');
        localStorage.setItem('rams_user', JSON.stringify({ username: 'admin', role: 'admin' }));
        router.push('/admin/dashboard');
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-space-950 flex flex-col justify-center items-center px-4 relative space-grid-bg">
      {/* Radial glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-neon-cyan/40 shadow-neon-cyan relative z-10">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-space-900 border border-neon-cyan/50 flex items-center justify-center mx-auto mb-4 shadow-neon-cyan">
            <Orbit className="w-7 h-7 text-neon-cyan animate-pulse" />
          </div>
          <span className="text-xs font-mono text-neon-cyan uppercase tracking-widest px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20">
            SECURITY CLEARANCE LEVEL 01
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-3">RAMS CMS Authentication</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Masukkan kredensial admin untuk mengakses dashboard CMS</p>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase mb-2">Username / Email</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-space-950 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan transition-colors"
              />
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase mb-2">Password Security Key</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-space-950 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-violet text-space-950 font-bold text-sm hover:shadow-neon-cyan transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Access CMS Clearance</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-4">
          <a href="/" className="text-xs font-mono text-slate-400 hover:text-neon-cyan transition-colors">
            ← Kembali ke Website Utama
          </a>
        </div>

      </div>
    </div>
  );
}
