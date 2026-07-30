'use client';

import React from 'react';
import { Target, Compass, Network, CheckCircle2, Sparkles, Workflow, Lightbulb, Shield } from 'lucide-react';
import { playSubtleHover } from '@/utils/sfx';

export const AboutSection: React.FC = () => {
  const philosophyCards = [
    {
      title: 'Ragam',
      subtitle: 'Spektrum Project Luas',
      icon: Compass,
      color: 'from-neon-cyan/20 to-blue-500/10',
      borderColor: 'border-neon-cyan/40',
      iconColor: 'text-neon-cyan',
      description:
        'Pengalaman mengerjakan beragam project perangkat lunak mulai dari skala UKM, sistem POS retail outlet, event ticketing nasional, hingga ERP manufaktur enterprise.',
    },
    {
      title: 'Manfaat',
      subtitle: 'Solusi Berdampak Konkret',
      icon: Target,
      color: 'from-neon-blue/20 to-indigo-500/10',
      borderColor: 'border-neon-blue/40',
      iconColor: 'text-neon-blue',
      description:
        'Setiap baris kode dan arsitektur yang dikembangkan selalu berangkat dari analisis masalah nyata di lapangan, berorientasi pada efisiensi operasional dan hasil yang terukur.',
    },
    {
      title: 'Sinergi',
      subtitle: 'Integrasi & Kolaborasi',
      icon: Network,
      color: 'from-neon-violet/20 to-purple-500/10',
      borderColor: 'border-neon-violet/40',
      iconColor: 'text-neon-violet',
      description:
        'Mendorong integrasi antar-sistem legacy dengan infrastruktur cloud modern secara seamless, mengedepankan kolaborasi erat bersama klien sebagai mitra pertumbuhan.',
    },
  ];

  return (
    <section id="about" className="pt-10 pb-20 px-4 sm:px-6 lg:px-8 relative bg-space-950">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neon-cyan text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ABOUT PT. RAGAM MANFAAT SINERGI</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Filosofi Kami: <span className="text-gradient-cyan">Tumbuh Dari Pengalaman Lapangan</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            RAMS lahir dari pemahaman mendalam bahwa teknologi terbaik bukanlah yang paling rumit, tetapi yang paling presisi dalam menyelesaikan akar permasalahan bisnis dan masyarakat.
          </p>
        </div>

        {/* 3 Core Philosophy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {philosophyCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                onMouseEnter={playSubtleHover}
                className={`glass-panel rounded-3xl p-8 border ${card.borderColor} bg-gradient-to-b ${card.color} hover:scale-[1.02] transition-all duration-300 relative group overflow-hidden`}
              >
                <div className="w-14 h-14 rounded-2xl bg-space-900/90 border border-white/10 flex items-center justify-center mb-6 group-hover:border-neon-cyan transition-colors">
                  <Icon className={`w-7 h-7 ${card.iconColor}`} />
                </div>
                <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1">
                  {card.subtitle}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  {card.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Vision & Mission Split Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-neon-cyan/30 relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Visi RAMS</h3>
            </div>
            <p className="text-slate-300 text-base leading-relaxed">
              Menjadi mitra teknologi terpercaya dan terdepan di Indonesia yang dikenal karena kemampuan menghasilkan perangkat lunak berkualitas tinggi, adaptif, tahan uji di lapangan, dan memberikan dampak ekonomi-sosial positif secara konsisten.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-neon-violet/30 relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-neon-violet/10 text-neon-violet border border-neon-violet/20">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Misi RAMS</h3>
            </div>
            <ul className="space-y-3.5 text-slate-300 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-neon-violet shrink-0 mt-0.5" />
                <span>Mengembangkan arsitektur software berstandar clean architecture yang aman dan mudah di-scale.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-neon-violet shrink-0 mt-0.5" />
                <span>Membangun solusi offline-first dan real-time integration untuk meminimalkan downtime bisnis.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-neon-violet shrink-0 mt-0.5" />
                <span>Memberikan pendampingan teknis dan kolaborasi sinergis berkelanjutan bersama setiap klien.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Problem-Solving Workflow Steps */}
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/10">
          <div className="flex items-center gap-3 mb-8">
            <Workflow className="w-6 h-6 text-neon-cyan" />
            <h3 className="text-xl font-bold text-white font-mono uppercase tracking-wider">
              Metodologi Kerja RAMS (Problem Solving Framework)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-neon-cyan font-mono font-bold text-sm mb-2">01. DISCOVERY</div>
              <div className="font-bold text-white mb-2">Riset Lapangan</div>
              <p className="text-xs text-slate-400">Turun langsung menganalisis alur kerja nyata dan hambatan operasional tim di lapangan.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-neon-blue font-mono font-bold text-sm mb-2">02. ARCHITECTURE</div>
              <div className="font-bold text-white mb-2">Rancang Arsitektur</div>
              <p className="text-xs text-slate-400">Menyusun modul microservices / monolithic modular yang scalable dan aman.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-neon-violet font-mono font-bold text-sm mb-2">03. EXECUTION</div>
              <div className="font-bold text-white mb-2">Development Presisi</div>
              <p className="text-xs text-slate-400">Pengkodean standar tinggi (Golang/Next.js) dengan pengujian otomatis & CI/CD.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-emerald-400 font-mono font-bold text-sm mb-2">04. IMPACT</div>
              <div className="font-bold text-white mb-2">Deploy & Evaluasi</div>
              <p className="text-xs text-slate-400">Implementasi langsung di bisnis klien dan evaluasi parameter efisiensi secara berkala.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
