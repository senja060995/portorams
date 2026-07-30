'use client';

import React, { useEffect, useState } from 'react';
import { Rocket, Zap, Building2, Globe2, Orbit } from 'lucide-react';
import { playSubtleHover } from '@/utils/sfx';

interface Milestone {
  id: number;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  scale_badge: string;
}

export const JourneySection: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/milestones')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMilestones(data);
      })
      .catch((err) => console.log('Using default milestone data', err));
  }, []);

  // Full authentic milestone history 2018 - 2026
  const defaultMilestones = [
    {
      id: 1,
      year: '2018',
      title: 'Membangun Dari Masalah Lapangan',
      subtitle: 'Perjalanan Awal Berbasis Solusi Nyata',
      description: 'RAMS lahir dari keberanian menghadapi berbagai permasalahan bisnis nyata di lapangan. Mulai membangun aplikasi-aplikasi sederhana yang didesain presisi untuk menyelesaikan kendala operasional awal.',
      icon: 'Rocket',
      scale_badge: 'Genesis Phase',
    },
    {
      id: 2,
      year: '2019',
      title: 'Kolaborasi Ekosistem Santri Online & E-Commerce',
      subtitle: 'Media Berita, Distro Kang Santri & Platform Ngaji Progresif',
      description: 'Bergabung dan berkolaborasi bersama Santri Online menciptakan platform media berita digital. Mendirikan e-commerce Distro Kang Santri (busana santri), platform bimbingan mengaji Santri Progresif, serta aplikasi pembukuan keuangan internal.',
      icon: 'Globe2',
      scale_badge: 'Ecosystem & Commerce',
    },
    {
      id: 3,
      year: '2020',
      title: 'Ekspansi Sistem Digital Marketing & SEO',
      subtitle: 'Pengembangan Engine Iklan & Optimasi Penjualan',
      description: 'Mengembangkan platform dan sistem Digital Marketing khusus untuk mendukung akselerasi penjualan online melalui optimasi SEO internet berkinerja tinggi serta iklan Facebook Ads yang presisi dan tepat sasaran.',
      icon: 'Zap',
      scale_badge: 'Digital Marketing Engine',
    },
    {
      id: 4,
      year: '2021',
      title: 'Inovasi Blockchain & Agri-Tech Digital NFT',
      subtitle: 'Menggabungkan Teknologi Blockchain dengan Pertanian Nyata',
      description: 'Tertarik pada proyek metaverse dan Web3, namun melihat banyaknya aset tanpa fundamental nyata. RAMS membangun Digital NFT Agriculture—mengintegrasikan teknologi blockchain dengan proyek pertanian riil yang ber-fundamental kuat.',
      icon: 'Cpu',
      scale_badge: 'Web3 & Agri-Tech',
    },
    {
      id: 5,
      year: '2022',
      title: 'Operasional NFT Agriculture & Stabilitas Sistem',
      subtitle: 'Pengelolaan Aset Riil & Ekosistem Terdesentralisasi',
      description: 'Proyek NFT Agriculture berjalan dengan lancar dan stabil, membuktikan integrasi teknologi Web3 dengan sektor riil pertanian dapat beroperasi secara akurat dan berkelanjutan.',
      icon: 'ShieldCheck',
      scale_badge: 'Real-Asset Blockchain',
    },
    {
      id: 6,
      year: '2023',
      title: 'Agency Digital Marketing & Live Streaming Commerce',
      subtitle: 'Dukungan Live Commerce TikTok & Facebook Ads',
      description: 'Memperluas jangkauan layanan dengan mendirikan jasa Digital Marketing Agency dan infrastruktur pendukung live streaming e-commerce di TikTok & Facebook untuk membantu brand lokal meningkatkan konversi penjualan.',
      icon: 'MessageSquare',
      scale_badge: 'Live Streaming Agency',
    },
    {
      id: 7,
      year: '2024',
      title: 'Sistem POS & ERP Mandiri Bisnis Franchise',
      subtitle: 'Rancang Bangun POS Offline-First & ERP Kuliner',
      description: 'Mengembangkan bisnis franchise makanan dengan merancang dan menggunakan sistem POS (Kasir Offline-First) serta sistem ERP buatan sendiri secara mandiri untuk efisiensi rantai pasok dan kasir multi-outlet.',
      icon: 'ShoppingCart',
      scale_badge: 'POS & ERP Integration',
    },
    {
      id: 8,
      year: '2025',
      title: 'Kemitraan Strategis Sidomulyo Advertising',
      subtitle: 'Transformasi Digital Percetakan & Advertising Enterprise',
      description: 'Resmi bekerja sama dengan Sidomulyo Advertising untuk merancang bangun sistem ERP terintegrasi khusus industri percetakan dan periklanan—mencakup kalkulasi otomatis HPP, stok bahan, dan keuangan real-time.',
      icon: 'Building2',
      scale_badge: 'Enterprise Partnership',
    },
    {
      id: 9,
      year: '2026',
      title: 'Peluncuran Agensi Web & Software Developer RAMS',
      subtitle: 'Solusi Perangkat Lunak Presisi & Terjangkau Untuk Masyarakat',
      description: 'Resmi membuka agency web & software development PT. Ragam Manfaat Sinergi untuk membantu seluruh lapisan masyarakat dan pelaku usaha yang terkendala biaya aplikasi berlangganan yang mahal serta software kustom yang tidak sesuai kebutuhan.',
      icon: 'Layers',
      scale_badge: 'Full Scale Agency',
    },
  ];

  const items = milestones.length >= 9 ? milestones : defaultMilestones;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return Zap;
      case 'Building2':
        return Building2;
      case 'Globe2':
        return Globe2;
      default:
        return Rocket;
    }
  };

  return (
    <section id="journey" className="pt-10 pb-20 px-4 sm:px-6 lg:px-8 relative bg-space-900 border-y border-white/5 space-grid-bg">
      <div className="max-w-5xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neon-blue text-xs font-mono mb-4">
            <Orbit className="w-3.5 h-3.5" />
            <span>COMPANY MILESTONES & EVOLUTION</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Perjalanan & <span className="text-gradient-cyan">Pertumbuhan RAMS</span>
          </h2>
          <p className="text-slate-300 text-base">
            Rekam jejak inovasi teknologi dari awal mula hingga menjadi penyedia arsitektur sistem skala enterprise.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative border-l border-neon-cyan/30 ml-4 sm:ml-32 space-y-12 pl-6 sm:pl-10">
          {items.map((item, idx) => {
            const IconComponent = getIcon(item.icon);
            return (
              <div
                key={item.id}
                onMouseEnter={playSubtleHover}
                className="relative group"
              >
                {/* Node Point Marker */}
                <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-6 h-6 rounded-full bg-space-950 border-2 border-neon-cyan flex items-center justify-center group-hover:scale-125 group-hover:border-neon-violet transition-all shadow-neon-cyan">
                  <div className="w-2 h-2 rounded-full bg-neon-cyan group-hover:bg-neon-violet"></div>
                </div>

                {/* Left Year Badge (Desktop) */}
                <div className="hidden sm:block absolute -left-36 top-0 font-mono text-neon-cyan font-bold text-lg text-right w-24">
                  {item.year}
                </div>

                {/* Milestone Glass Card */}
                <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-neon-cyan/50 transition-all duration-300 shadow-cyber-card">
                  <div className="sm:hidden font-mono text-neon-cyan font-bold text-sm mb-2">
                    {item.year}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan">
                      {item.scale_badge}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">PHASE 0{idx + 1}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-neon-cyan" />
                    {item.title}
                  </h3>
                  <div className="text-xs font-mono text-neon-blue mb-4">{item.subtitle}</div>

                  <p className="text-slate-300 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
