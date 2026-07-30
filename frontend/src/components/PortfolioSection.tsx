'use client';

import React, { useEffect, useState } from 'react';
import { Layers, Activity, Server, ArrowUpRight, CheckCircle2, Shield, X, Filter, Zap, ExternalLink, Briefcase } from 'lucide-react';
import { playSubtleHover, playClickSfx } from '@/utils/sfx';

interface Project {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  category: string;
  scale: string;
  scale_badge: string;
  client: string;
  year: string;
  problem: string;
  solution: string;
  impact: string;
  tech_stack: string;
  architecture: string;
  image_url: string;
  featured: boolean;
  throughput: string;
  microservices: number;
}

export const PortfolioSection: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeScale, setActiveScale] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch((err) => console.log('Using default project data', err));
  }, []);

  const defaultProjects: Project[] = [
    {
      id: 1,
      title: 'RAMS Enterprise Printing ERP',
      slug: 'rams-enterprise-printing-erp',
      subtitle: 'Multi-tenant ERP System for Printing & Advertising Business',
      category: 'ERP & Management',
      scale: 'Besar',
      scale_badge: 'Enterprise Core',
      client: 'PT Sidomulyo Advertising & Network',
      year: '2024',
      problem: 'Proses alur kerja percetakan dan pengiklanan terpisah-pisah, stok bahan baku tidak akurat, kalkulasi HPP manual memicu kebocoran margin.',
      solution: 'RAMS membangun ERP terpusat mencakup kalkulasi otomatis HPP percetakan, Work Order live tracking, stok otomatis, dan laporan keuangan real-time.',
      impact: 'Efisiensi estimasi harga meningkat 85%, transparansi stok bahan naik hingga 99%, dan waktu penyusunan laporan keuangan berkurang dari 5 hari menjadi 10 detik.',
      tech_stack: 'Next.js, Golang, PostgreSQL, Redis, Docker',
      architecture: 'Client App (Next.js) -> API Gateway (Golang) -> Accounting & Work Order Microservices -> PostgreSQL Cluster -> Redis Cache',
      image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      featured: true,
      throughput: '45.000 req/min',
      microservices: 8,
    },
    {
      id: 2,
      title: 'TixNova Smart Event & Ticketing Platform',
      slug: 'tixnova-smart-event-ticketing-platform',
      subtitle: 'High-Traffic Automated Event Ticketing & Gate Access',
      category: 'Ticketing & Automation',
      scale: 'Besar',
      scale_badge: 'High Throughput',
      client: 'TixNova Indonesia',
      year: '2024',
      problem: 'Lonjakan pengunjung saat war ticket menyebabkan server crash, validator QR Code gate lambat saat koneksi internet lokasi konser terganggu.',
      solution: 'Arsitektur Queue Buffer berbasis Golang + Redis untuk mencegah server overload saat pembelian masal, disertai QR Offline Scanner sync.',
      impact: 'Mampu menangani 150.000 transaksi bersamaan tanpa downtime, proses validasi gate masuk menjadi di bawah 0.5 detik per pengunjung.',
      tech_stack: 'Next.js, Golang, Redis, PostgreSQL, WebSockets',
      architecture: 'Waiting Room Token Queue -> Order Engine -> QR Token Generator -> Offline Gate Validator Sync',
      image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
      featured: true,
      throughput: '150.000 TPS',
      microservices: 12,
    },
    {
      id: 3,
      title: 'Offline-First POS Retail Network',
      slug: 'offline-first-pos-retail-network',
      subtitle: 'Offline-first POS with Real-Time Local Sync for Network Outlets',
      category: 'POS System',
      scale: 'Menengah',
      scale_badge: 'Zero-Downtime POS',
      client: 'Chain Store Franchise Network',
      year: '2023',
      problem: 'Koneksi internet outlet di daerah terpencil sering terputus, menyebabkan kasir tidak bisa melayani transaksi pelanggan.',
      solution: 'Aplikasi POS berbasis SQLite lokal yang terus menyimpan transaksi tanpa internet, lalu secara otomatis menyinkronkan data ke Cloud saat sinyal kembali online.',
      impact: 'Kasir tetap dapat melayani 100% transaksi meski internet mati total seharian. Data outlet otomatis tersinkronisasi tanpa kehilangan data.',
      tech_stack: 'React Native, Expo, SQLite, Node.js, WebSocket',
      architecture: 'React Native POS -> Local SQLite Engine -> Sync Manager -> Cloud Central Database',
      image_url: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=1200&q=80',
      featured: true,
      throughput: '12.000 tx/day',
      microservices: 4,
    },
    {
      id: 4,
      title: 'Omnichannel WhatsApp CRM & Ticket Resolver',
      slug: 'omnichannel-whatsapp-crm-ticket-resolver',
      subtitle: 'Automated Customer Communication & Ticketing Queue',
      category: 'Digital Solution',
      scale: 'Menengah',
      scale_badge: 'AI Automation',
      client: 'PT RAMS Service Division',
      year: '2024',
      problem: 'Pesan pelanggan dari berbagai channel sering terlewat, waktu balasan lambat, dan tidak ada penjejakan tiket masalah pelanggan.',
      solution: 'Integrasi WhatsApp Cloud API resmi dengan dashboard helpdesk multi-agent, bot penjawab otomatis, dan penentuan prioritas tiket.',
      impact: 'SLA penanganan keluhan turun dari 4 jam menjadi 15 menit. 70% pertanyaan umum terselesaikan otomatis oleh bot.',
      tech_stack: 'Golang, WhatsApp API, RabbitMQ, Vue.js, PostgreSQL',
      architecture: 'WhatsApp Cloud API -> Webhook Receiver -> RabbitMQ Queue -> Agent Desk & Auto-Bot Engine',
      image_url: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=1200&q=80',
      featured: false,
      throughput: '200.000 msgs/mo',
      microservices: 5,
    },
  ];

  const items = projects.length > 0 ? projects : defaultProjects;

  const categories = ['All', 'ERP & Management', 'Ticketing & Automation', 'POS System', 'Digital Solution'];
  const scales = ['All', 'Kecil', 'Menengah', 'Besar'];

  const filteredProjects = items.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchScale = activeScale === 'All' || p.scale === activeScale;
    return matchCat && matchScale;
  });

  return (
    <section id="portfolio" className="pt-10 pb-20 px-4 sm:px-6 lg:px-8 relative bg-space-900 border-t border-white/5 space-grid-bg">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-neon-cyan/30 text-neon-cyan text-xs font-mono mb-4">
            <Briefcase className="w-3.5 h-3.5" />
            <span>EXECUTIVE PORTFOLIO SHOWCASE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Portofolio Arsitektur Sistem Berdampak Tinggi
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Rekam jejak implementasi solusi enterprise RAMS yang terbukti memecahkan tantangan operasional bisnis skala nasional.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 p-4 rounded-2xl bg-space-950/60 border border-white/10">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-1">Kategori:</span>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  playClickSfx();
                  setActiveCategory(c);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium font-mono transition-all ${
                  activeCategory === c
                    ? 'bg-neon-cyan text-space-950 font-bold shadow-neon-cyan'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Scale Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-1">Scale:</span>
            {scales.map((s) => (
              <button
                key={s}
                onClick={() => {
                  playClickSfx();
                  setActiveScale(s);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium font-mono transition-all ${
                  activeScale === s
                    ? 'bg-neon-violet text-white font-bold shadow-neon-violet'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onMouseEnter={playSubtleHover}
              className="glass-panel glass-panel-hover rounded-3xl border border-white/10 overflow-hidden group flex flex-col justify-between"
            >
              <div>
                {/* Project Image Banner */}
                <div className="relative h-56 w-full overflow-hidden bg-space-950">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=1200&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-space-900/40 to-transparent"></div>

                  {/* Telemetry Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-space-950/80 backdrop-blur-md text-neon-cyan border border-neon-cyan/40">
                      {project.scale_badge}
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-neon-violet/20 backdrop-blur-md text-neon-violet border border-neon-violet/40">
                      Skala {project.scale}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-slate-300">
                    <span className="flex items-center gap-1.5 bg-space-950/70 px-2.5 py-1 rounded-lg border border-white/10">
                      <Activity className="w-3.5 h-3.5 text-neon-cyan" />
                      {project.throughput}
                    </span>
                    <span className="flex items-center gap-1.5 bg-space-950/70 px-2.5 py-1 rounded-lg border border-white/10">
                      <Server className="w-3.5 h-3.5 text-neon-violet" />
                      {project.microservices} Services
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-7">
                  <div className="text-xs font-mono text-neon-cyan mb-1">{project.category} • {project.year}</div>
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                    {project.subtitle}
                  </p>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-6 text-xs space-y-2">
                    <div>
                      <strong className="text-neon-cyan font-mono">Dampak: </strong>
                      <span className="text-slate-200">{project.impact}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="px-7 pb-7">
                <button
                  onClick={() => {
                    playClickSfx();
                    setSelectedProject(project);
                  }}
                  className="w-full py-3 rounded-2xl bg-white/5 hover:bg-neon-cyan/20 border border-white/10 hover:border-neon-cyan/50 text-white font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 group-hover:text-neon-cyan"
                >
                  <span>Buka Detail Studi Kasus</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Case Study Detailed Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/90 backdrop-blur-xl animate-fade-in">
          <div className="glass-panel rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-neon-cyan/40 p-6 sm:p-8 relative shadow-neon-cyan">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-mono mb-4">
              <span>STUDI KASUS PROYEK RAMS</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              {selectedProject.title}
            </h3>
            <p className="text-slate-300 text-sm font-mono mb-6">
              Klien: {selectedProject.client} • Skala: {selectedProject.scale} ({selectedProject.scale_badge})
            </p>

            {/* Problem -> Solution -> Impact Blocks */}
            <div className="space-y-6 mb-8 text-sm">
              <div className="p-5 rounded-2xl bg-red-950/30 border border-red-500/30">
                <h4 className="text-xs font-mono uppercase text-red-400 font-bold mb-2">01. Masalah / Challenge</h4>
                <p className="text-slate-200">{selectedProject.problem}</p>
              </div>

              <div className="p-5 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30">
                <h4 className="text-xs font-mono uppercase text-neon-cyan font-bold mb-2">02. Solusi Teknis RAMS</h4>
                <p className="text-slate-200">{selectedProject.solution}</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold mb-2">03. Hasil & Dampak Bisnis</h4>
                <p className="text-slate-200">{selectedProject.impact}</p>
              </div>
            </div>

            {/* Architecture Flow Box */}
            <div className="p-6 rounded-2xl bg-space-950 border border-white/10 mb-8 font-mono text-xs">
              <div className="text-neon-violet font-bold uppercase mb-3 flex items-center gap-2">
                <Server className="w-4 h-4" /> Architectural Flow Diagram
              </div>
              <div className="p-4 rounded-xl bg-space-900 border border-white/5 text-slate-300 leading-relaxed overflow-x-auto">
                {selectedProject.architecture}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="mb-8">
              <div className="text-xs font-mono text-slate-400 uppercase mb-2">Teknologi Yang Digunakan</div>
              <div className="flex flex-wrap gap-2">
                {selectedProject.tech_stack.split(',').map((t, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-neon-cyan">
                    {t.trim()}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedProject(null)}
              className="w-full py-3 rounded-2xl bg-neon-cyan text-space-950 font-bold text-sm"
            >
              Tutup Case Study
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
