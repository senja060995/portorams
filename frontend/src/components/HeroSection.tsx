'use client';

import React from 'react';
import { ArrowRight, Cpu, Layers, ShieldCheck, Zap, Terminal, Sparkles } from 'lucide-react';
import { playSubtleHover, playClickSfx } from '@/utils/sfx';
import { TypewriterText } from '@/components/TypewriterText';
import { Interactive3DGlobe } from '@/components/Interactive3DGlobe';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen pt-36 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center space-grid-bg">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-neon-violet/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto text-center z-10">

        {/* Telemetry Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-neon-cyan/30 text-slate-300 text-xs font-mono mb-8 backdrop-blur-md shadow-neon-cyan">
          <Sparkles className="w-4 h-4 text-neon-cyan animate-pulse" />
          <span>AEROSPACE-INSPIRED DIGITAL SOLUTIONS</span>
          <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-ping"></span>
        </div>

        {/* Impactful Futuristic Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
          Membangun Solusi Digital{' '}
          <span className="text-gradient-cyan">Berdampak Nyata</span> Untuk Masyarakat
        </h1>

        {/* Subtitle / Brand Story Teaser */}
        <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed mb-10">
          <strong className="text-white font-semibold">PT. Ragam Manfaat Sinergi</strong> menghadirkan arsitektur perangkat lunak skala enterprise (ERP, POS, CRM, & Automated System) yang tumbuh dari pengalaman lapangan, berorientasi solusi, dan terintegrasi penuh.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-16">
          <a
            href="/portfolio"
            onMouseEnter={playSubtleHover}
            onClick={playClickSfx}
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-violet text-space-950 font-bold text-sm hover:shadow-neon-cyan hover:scale-[1.03] transition-all shadow-lg"
          >
            <span>Jelajahi Portofolio</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </a>

          <a
            href="/simulator"
            onMouseEnter={playSubtleHover}
            onClick={playClickSfx}
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-space-900/80 hover:bg-space-850 border border-white/15 hover:border-neon-cyan/50 text-white font-semibold text-sm transition-all backdrop-blur-md"
          >
            <Cpu className="w-4 h-4 text-neon-cyan" />
            <span>Simulasi Solusi Bisnis</span>
          </a>
        </div>

        {/* Telemetry Stats Bar Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-space-900/80 border border-white/10 text-center backdrop-blur-md">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-neon-cyan font-mono">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase text-slate-400">Kasir Performance</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">100% Offline</div>
            <div className="text-[11px] text-slate-400">Zero-Downtime POS</div>
          </div>

          <div className="p-4 rounded-2xl bg-space-900/80 border border-white/10 text-center backdrop-blur-md">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-neon-blue font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase text-slate-400">Ticketing SLA</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">150.000 TPS</div>
            <div className="text-[11px] text-slate-400">Event Ticketing Peak</div>
          </div>

          <div className="p-4 rounded-2xl bg-space-900/80 border border-white/10 text-center backdrop-blur-md">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-neon-violet font-mono">
              <Layers className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase text-slate-400">Multi-Tenant ERP</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">Multi-Company</div>
            <div className="text-[11px] text-slate-400">Enterprise ERP System</div>
          </div>

          <div className="p-4 rounded-2xl bg-space-900/80 border border-white/10 text-center backdrop-blur-md">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-neon-cyan font-mono">
              <Terminal className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase text-slate-400">Architecture</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">Clean Go</div>
            <div className="text-[11px] text-slate-400">Microservices Ready</div>
          </div>
        </div>

      </div>

      {/* ReactBits 3D Interactive Globe Component */}
      <div className="relative mt-12 w-full max-w-3xl flex justify-center items-center">
        <Interactive3DGlobe />
      </div>
    </section>
  );
};
