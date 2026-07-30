'use client';

import React from 'react';
import { Orbit, ArrowUp, Lock } from 'lucide-react';
import { playClickSfx } from '@/utils/sfx';
import { TypewriterText } from '@/components/TypewriterText';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    playClickSfx();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-space-950 border-t border-white/10 text-slate-400 py-16 px-4 sm:px-6 lg:px-8 relative space-grid-bg">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
        
        {/* Brand Col (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-space-900 border border-neon-cyan/40 flex items-center justify-center overflow-hidden p-1.5">
              <img
                src="/logo.png"
                alt="RAMS Logo"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.svg';
                }}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-bold text-white tracking-wider font-mono text-xl">
                RAMS
              </div>
              <div className="text-xs text-slate-400 font-mono">
                <TypewriterText text="PT. Ragam Manfaat Sinergi" />
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            RAMS hadir sebagai penyedia arsitektur sistem perangkat lunak yang solutif, adaptif, dan berorientasi pada efisiensi operasional bisnis serta kemanfaatan masyarakat luas.
          </p>

          <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neon-cyan">Next.js 14</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neon-blue">Golang API</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neon-violet">PostgreSQL</span>
          </div>
        </div>

        {/* Links Col (3 cols) */}
        <div className="md:col-span-3 space-y-3 text-xs">
          <div className="font-bold text-white uppercase font-mono tracking-wider mb-2">Navigasi Utama</div>
          <ul className="space-y-2">
            <li><a href="/about" className="hover:text-neon-cyan transition-colors">About RAMS</a></li>
            <li><a href="/journey" className="hover:text-neon-cyan transition-colors">Milestone Journey</a></li>
            <li><a href="/services" className="hover:text-neon-cyan transition-colors">Services & Arsenal</a></li>
            <li><a href="/portfolio" className="hover:text-neon-cyan transition-colors">Portfolio & Case Studies</a></li>
            <li><a href="/simulator" className="hover:text-neon-cyan transition-colors">Solution Simulator</a></li>
            <li><a href="/blog" className="hover:text-neon-cyan transition-colors">Tech Insights</a></li>
          </ul>
        </div>

        {/* Philosophy Col (4 cols) */}
        <div className="md:col-span-4 space-y-3 text-xs">
          <div className="font-bold text-white uppercase font-mono tracking-wider mb-2">Filosofi Perusahaan</div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <div><strong className="text-neon-cyan font-mono">Ragam: </strong><span className="text-slate-300">Beragam project dari kecil hingga enterprise.</span></div>
            <div><strong className="text-neon-blue font-mono">Manfaat: </strong><span className="text-slate-300">Solusi berangkat dari masalah nyata masyarakat.</span></div>
            <div><strong className="text-neon-violet font-mono">Sinergi: </strong><span className="text-slate-300">Kolaborasi & integrasi sistem tanpa batas.</span></div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div>
          © {new Date().getFullYear()} RAMS • PT. Ragam Manfaat Sinergi. All rights reserved.
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
          >
            <span>Top</span>
            <ArrowUp className="w-3 h-3 text-neon-cyan" />
          </button>
        </div>
      </div>
    </footer>
  );
};
