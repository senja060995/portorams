'use client';

import React from 'react';
import { CommandCenterBar } from '@/components/CommandCenterBar';
import { SpaceCanvas } from '@/components/SpaceCanvas';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AboutSection } from '@/components/AboutSection';
import { ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-space-950 text-slate-100 selection:bg-neon-cyan selection:text-space-950 pt-28">
      <CommandCenterBar />
      <SpaceCanvas />
      <Navbar />

      {/* Main Philosophy Component */}
      <AboutSection />

      {/* Deep-Dive Corporate Culture & Engineering Principles */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-space-900 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Prinsip Rekayasa Perangkat Lunak RAMS</h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Setiap sistem yang diproduksi oleh RAMS berlandaskan pada 4 pilar teknologis utama untuk menjamin kinerja jangka panjang.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel rounded-3xl p-6 border border-white/10">
              <div className="text-neon-cyan font-mono font-bold text-2xl mb-2">01</div>
              <h3 className="text-lg font-bold text-white mb-2">Clean Architecture</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pemisahan tanggung jawab lapisan kode (Separation of Concerns) agar sistem mudah diuji, dimutakhirkan, dan bebas dari ketergantungan framework.
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-6 border border-white/10">
              <div className="text-neon-blue font-mono font-bold text-2xl mb-2">02</div>
              <h3 className="text-lg font-bold text-white mb-2">Offline-First Reliability</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Menjamin operasional kasir & lapangan tetap 100% aktif walau internet terputus dengan sinkronisasi otomatis multi-region.
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-6 border border-white/10">
              <div className="text-neon-violet font-mono font-bold text-2xl mb-2">03</div>
              <h3 className="text-lg font-bold text-white mb-2">High Throughput API</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Arsitektur backend berbasis Golang yang mampu menangani puluhan ribu permintaan per detik dengan latency milidetik.
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-6 border border-white/10">
              <div className="text-emerald-400 font-mono font-bold text-2xl mb-2">04</div>
              <h3 className="text-lg font-bold text-white mb-2">Enterprise Security</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Enkripsi data sesuai standar industri, perlindungan enkripsi token JWT, serta isolasi data multi-tenant yang ketat.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <a
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-neon-cyan text-space-950 font-bold text-sm hover:shadow-neon-cyan transition-all"
            >
              <span>Jelajahi Layanan RAMS</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
