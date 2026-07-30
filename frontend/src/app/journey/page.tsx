'use client';

import React from 'react';
import { CommandCenterBar } from '@/components/CommandCenterBar';
import { SpaceCanvas } from '@/components/SpaceCanvas';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { JourneySection } from '@/components/JourneySection';
import { Trophy, TrendingUp, Flag } from 'lucide-react';

export default function JourneyPage() {
  return (
    <main className="relative min-h-screen bg-space-950 text-slate-100 selection:bg-neon-cyan selection:text-space-950 pt-28">
      <CommandCenterBar />
      <SpaceCanvas />
      <Navbar />

      {/* Timeline Component */}
      <JourneySection />

      {/* Corporate Growth Telemetry Highlights */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-space-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel rounded-3xl p-8 border border-neon-cyan/30">
              <Trophy className="w-8 h-8 text-neon-cyan mb-4" />
              <div className="text-3xl font-extrabold text-white font-mono mb-1">25+ Projects</div>
              <div className="text-xs font-mono text-neon-cyan uppercase mb-3">Enterprise & Retail Delivered</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Berbagai modul software dari kasir POS, ERP percetakan, ticketing konser masal, hingga integrasi WhatsApp API.
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-8 border border-neon-blue/30">
              <TrendingUp className="w-8 h-8 text-neon-blue mb-4" />
              <div className="text-3xl font-extrabold text-white font-mono mb-1">99.98% Uptime</div>
              <div className="text-xs font-mono text-neon-blue uppercase mb-3">Production Reliability</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Arsitektur offline-first dan failover otomatis yang memastikan transaksi bisnis tidak pernah terhenti.
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-8 border border-neon-violet/30">
              <Flag className="w-8 h-8 text-neon-violet mb-4" />
              <div className="text-3xl font-extrabold text-white font-mono mb-1">150K TPS</div>
              <div className="text-xs font-mono text-neon-violet uppercase mb-3">Peak Event Throughput</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Platform ticketing TixNova mampu menangani lonjakan antrean war ticket konser tanpa server overload.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
