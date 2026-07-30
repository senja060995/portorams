'use client';

import React from 'react';
import { CommandCenterBar } from '@/components/CommandCenterBar';
import { SpaceCanvas } from '@/components/SpaceCanvas';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ContactSection } from '@/components/ContactSection';
import { Mail, Phone, MapPin, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const faqs = [
    {
      q: 'Berapa lama estimasi durasi pengerjaan proyek perangkat lunak di RAMS?',
      a: 'Durasi pengerjaan bervariasi bergantung pada skala sistem. Skala Kecil/Medium berkisar 2-6 minggu, sementara skala Enterprise ERP/Multi-Tenant berkisar 2-4 bulan dengan sistem rilis modul bertahap (Agile Sprints).',
    },
    {
      q: 'Apakah RAMS menyediakan garansi pemeliharaan (maintenance)?',
      a: 'Ya, setiap proyek yang diserahterimakan mendapatkan garansi pemeliharaan teknis gratis selama 3-6 bulan, mencakup bug fixing, pemantauan performa server, dan pendampingan tim.',
    },
    {
      q: 'Bagaimana keamanan data bisnis kami jika menggunakan sistem RAMS?',
      a: 'RAMS menerapkan standar enkripsi ketat, isolasi database multi-tenant, serta penandatanganan NDA (Non-Disclosure Agreement) legal sebelum proyek dimulai.',
    },
  ];

  return (
    <main className="relative min-h-screen bg-space-950 text-slate-100 selection:bg-neon-cyan selection:text-space-950">
      <CommandCenterBar />
      <SpaceCanvas />
      <Navbar />

      {/* Hero Header Banner */}
      <section className="pt-40 pb-12 px-4 sm:px-6 lg:px-8 space-grid-bg relative border-b border-white/10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-neon-cyan/30 text-neon-cyan text-xs font-mono mb-6">
            <Mail className="w-4 h-4 text-neon-cyan" />
            <span>RAMS OFFICIAL COMMUNICATION CHANNEL</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-6">
            Hubungi & <span className="text-gradient-cyan">Konsultasikan Proyek Anda</span>
          </h1>
          <p className="max-w-3xl mx-auto text-slate-300 text-base sm:text-xl leading-relaxed">
            Tim Solution Architect RAMS siap mendiskusikan alur kerja bisnis Anda dan memberikan rekomendasi solusi perangkat lunak terbaik.
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <ContactSection />

      {/* Corporate FAQ Accordion / Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-space-900 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neon-violet text-xs font-mono mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-neon-violet" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="text-3xl font-bold text-white">Pertanyaan Sering Diajukan (FAQ)</h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-2 flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-neon-cyan shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed pl-7">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
