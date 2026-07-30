'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, Tag, User, ArrowRight, X, Sparkles } from 'lucide-react';
import { playSubtleHover, playClickSfx } from '@/utils/sfx';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  author: string;
  status: string;
  image_url: string;
  views: number;
  read_time: string;
  published_at: string;
}

export const BlogSection: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/articles')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setArticles(data);
      })
      .catch((err) => console.log('Using fallback article data', err));
  }, []);

  const defaultArticles: Article[] = [
    {
      id: 1,
      title: 'Arsitektur Offline-First pada POS Modern: Solusi Transaksi Tanpa Tergantung Internet',
      slug: 'arsitektur-offline-first-pada-pos-modern',
      excerpt: 'Bagaimana strategi SQLite local buffer dan algoritma Conflict-Free Replicated Data Type (CRDT) menjaga outlet retail Anda beroperasi 24/7.',
      content: `## Mengapa Offline-First Sangat Penting Bagi Retailer Indonesia?\n\nKoneksi internet di Indonesia masih menghadapi tantangan ketidakstabilan di berbagai wilayah. Ketika sistem kasir (POS) mengandalkan 100% koneksi cloud, terputusnya sinyal selama 10 menit saja dapat membatalkan belasan transaksi dan merugikan bisnis.\n\n### Pendekatan RAMS: Local SQLite + Asynchronous Sync\n\n1. **Local Transaction Storage**: Setiap transaksi kasir langsung ditulis ke database lokal SQLite di perangkat kasir.\n2. **Zero-Latency Print**: Struk langsung dicetak via Thermal Bluetooth/USB tanpa menunggu response server.\n3. **Smart Background Sync**: Worker thread mendeteksi sinyal internet dan mengirimkan batch paket transaksi secara aman ke cloud central API.\n\nDengan arsitektur ini, reliabilitas operasional naik hingga 99.99%.`,
      category: 'Technology Insight',
      tags: 'POS, Offline-First, SQLite, Golang, Retail Tech',
      author: 'Tim Engineering RAMS',
      status: 'published',
      image_url: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=80',
      views: 342,
      read_time: '5 min read',
      published_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Transformasi Digital Melalui Multi-Tenant ERP: Efisiensi Biaya dan Kecepatan Operasional',
      slug: 'transformasi-digital-melalui-multi-tenant-erp',
      excerpt: 'Mengenal bagaimana pendekatan arsitektur Multi-Tenant pada ERP memungkinkan efisiensi resource server dan mempermudah isolasi data bisnis.',
      content: `## Filosofi Sinergi dalam Sistem ERP Perusahaan\n\nDalam lanskap industri percetakan dan manufaktur modern, integrasi data dari Work Order, Bahan Baku, hingga Akuntansi Finansial adalah kunci profitabilitas.\n\n### Keunggulan Arsitektur Multi-Tenant RAMS ERP\n\n- **Shared Code, Isolated Schema**: Meminimalkan biaya infrastruktur server sembari memastikan keamanan tingkat tinggi.\n- **Real-Time HPP Calculation**: Biaya produksi dihitung detik itu juga saat spesifikasi produk dipilih.\n- **Automated Tax & Financial Audit**: Kepatuhan pajak terintegrasi secara otomatis tanpa perlu rekonsiliasi manual.`,
      category: 'Enterprise Strategy',
      tags: 'ERP, Multi-Tenant, Clean Architecture, Productivity',
      author: 'Tim Arsitektur Sistem RAMS',
      status: 'published',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      views: 518,
      read_time: '7 min read',
      published_at: new Date().toISOString(),
    },
  ];

  const items = articles.length > 0 ? articles : defaultArticles;

  return (
    <section id="blog" className="pt-10 pb-20 px-4 sm:px-6 lg:px-8 relative bg-space-900 border-t border-white/5 space-grid-bg">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neon-blue text-xs font-mono mb-4">
            <BookOpen className="w-3.5 h-3.5 text-neon-blue" />
            <span>RAMS TECH INSIGHTS & ARTICLES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Edukasi & <span className="text-gradient-cyan">Wawasan Teknologi</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Artikel teknis dan pemikiran seputar pengembangan software, arsitektur sistem, dan efisiensi digital industri.
          </p>
        </div>

        {/* Articles Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((article) => (
            <div
              key={article.id}
              onMouseEnter={playSubtleHover}
              className="glass-panel glass-panel-hover rounded-3xl border border-white/10 overflow-hidden group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-space-950">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-space-950/80 backdrop-blur-md text-neon-cyan border border-neon-cyan/30">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neon-cyan" /> {article.read_time}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-neon-violet" /> {article.author}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-neon-cyan transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-6">
                <button
                  onClick={() => {
                    playClickSfx();
                    setSelectedArticle(article);
                  }}
                  className="flex items-center gap-2 text-xs font-mono font-bold text-neon-cyan hover:underline"
                >
                  <span>Baca Artikel Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Article Detail Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/90 backdrop-blur-xl animate-fade-in">
          <div className="glass-panel rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-neon-cyan/40 p-6 sm:p-10 relative shadow-neon-cyan">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-mono px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan mb-4 inline-block">
              {selectedArticle.category}
            </span>

            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {selectedArticle.title}
            </h3>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mb-8 border-b border-white/10 pb-4">
              <span>Penulis: {selectedArticle.author}</span>
              <span>• {selectedArticle.read_time}</span>
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line mb-8">
              {selectedArticle.content}
            </div>

            <button
              onClick={() => setSelectedArticle(null)}
              className="w-full py-3 rounded-2xl bg-neon-cyan text-space-950 font-bold text-sm"
            >
              Tutup Reader
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
