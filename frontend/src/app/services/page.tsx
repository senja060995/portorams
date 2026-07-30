'use client';

import React from 'react';
import { CommandCenterBar } from '@/components/CommandCenterBar';
import { SpaceCanvas } from '@/components/SpaceCanvas';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ServicesSection } from '@/components/ServicesSection';
import { Layers, Cpu, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ServicesPage() {
  return (
    <main className="relative min-h-screen bg-space-950 text-slate-100 selection:bg-neon-cyan selection:text-space-950 pt-28">
      <CommandCenterBar />
      <SpaceCanvas />
      <Navbar />

      {/* Services Grid */}
      <ServicesSection />

      {/* Deep-Dive Tech Architecture Breakdown */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-space-900 border-t border-white/5 space-grid-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Mengapa Memilih Layanan RAMS?</h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Kami tidak hanya memproduksi kode, tetapi membangun infrastruktur sistem yang adaptif, aman, dan siap bertumbuh bersama bisnis Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="glass-panel rounded-3xl p-8 border border-white/10">
              <Shield className="w-8 h-8 text-neon-cyan mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">High Security & Isolation</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Skema database multi-tenant terisolasi, enkripsi token JWT, dan perlindungan API gateway terpusat.
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-8 border border-white/10">
              <Layers className="w-8 h-8 text-neon-blue mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Modular Microservices</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sistem terbagi ke dalam modul-modul independen (Order, Inventory, Accounting) sehingga perubahan pada satu modul tidak mengganggu modul lainnya.
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-8 border border-white/10">
              <Cpu className="w-8 h-8 text-neon-violet mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Clean Golang & Next.js Engine</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Performa backend berkecapatan tinggi dengan Golang, dikombinasikan dengan antarmuka Next.js yang sangat cepat & SEO-friendly.
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-neon-cyan/40 text-center relative overflow-hidden shadow-neon-cyan">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ingin Mensimulasikan Blueprint Sistem Anda?</h3>
            <p className="text-slate-300 text-sm max-w-2xl mx-auto mb-8">
              Gunakan simulator interaktif RAMS untuk menentukan rekomendasi teknologi dan estimasi efisiensi sesuai sektor industri Anda.
            </p>
            <Link
              href="/simulator"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-violet text-space-950 font-bold text-sm hover:shadow-neon-cyan transition-all"
            >
              <span>Uji Simulator Sistem Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
