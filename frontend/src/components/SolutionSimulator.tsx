'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Layers, Server, Activity, ArrowUpRight } from 'lucide-react';
import { playSubtleHover, playClickSfx } from '@/utils/sfx';

interface Blueprint {
  title: string;
  recommended_arch: string;
  tech_stack: string;
  features: string;
  estimated_impact: string;
}

export const SolutionSimulator: React.FC = () => {
  const [industry, setIndustry] = useState('retail');
  const [scale, setScale] = useState('medium');
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBlueprint = (ind: string, sc: string) => {
    setLoading(true);
    fetch(`http://localhost:8080/api/simulate-solution?industry=${ind}&scale=${sc}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.title && (data.industry_key === ind || !data.industry_key)) {
          setBlueprint(data);
        } else {
          setBlueprint(getFallback(ind, sc));
        }
        setLoading(false);
      })
      .catch(() => {
        setBlueprint(getFallback(ind, sc));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBlueprint(industry, scale);
  }, [industry, scale]);

  const getFallback = (ind: string, sc: string): Blueprint => {
    if (ind === 'retail') {
      if (sc === 'enterprise') {
        return {
          title: 'Enterprise High-Throughput Retail POS & Automated Supply Chain',
          recommended_arch: 'Distributed SQLite Nodes + Nginx Load Balancer + Event-Driven Kafka + Cloud PostgreSQL Cluster',
          tech_stack: 'React Native, SQLite Engine, Golang Microservices, Apache Kafka, PostgreSQL Active-Standby',
          features: 'Multi-store warehouse sync, automated purchase orders, central pricing dispatch, real-time sales telemetry',
          estimated_impact: 'Skalabilitas 500+ outlet retail bersamaan, rekonsiliasi data inventoris nasional dalam 3 detik',
        };
      }
      return {
        title: 'Offline-First POS & Retail Multi-Outlet Network',
        recommended_arch: 'SQLite Local Transaction Engine + Sync Gateway Worker + Central Cloud PostgreSQL',
        tech_stack: 'React Native, Expo, SQLite Local Buffer, Golang REST API, Redis, Docker',
        features: 'Offline transaction buffer, auto-sync backoff, multi-outlet stock tracking, Bluetooth receipt printing',
        estimated_impact: '100% uptime kasir tanpa mati transaksi saat internet terputus, akurasi stok otomatis 99%',
      };
    } else if (ind === 'enterprise') {
      if (sc === 'enterprise') {
        return {
          title: 'Multi-Tenant Enterprise ERP Superapp & Financial Audit Engine',
          recommended_arch: 'Microservices API Gateway + Isolated Tenant DBs + Active-Active Database Cluster + Distributed Redis Cache',
          tech_stack: 'Next.js 14, Golang Microservices, PostgreSQL Active-Active Cluster, Apache Kafka, Redis, Docker, Kubernetes',
          features: 'Multi-company consolidation, real-time HPP & WIP tracking, automated tax & e-Faktur compliance, multi-currency ledger',
          estimated_impact: 'Audit finansial real-time 100% terverifikasi, penghematan biaya operasional manufaktur hingga 35%',
        };
      }
      return {
        title: 'Modular ERP Printing & Manufacturing Automation',
        recommended_arch: 'Modular Monolithic Architecture + Isolated Tenant Schemas + Redis In-Memory Cache',
        tech_stack: 'Next.js 14, Golang Clean Architecture, PostgreSQL, Redis, Nginx',
        features: 'Kalkulasi otomatis HPP percetakan, Work Order live kanban, stok bahan baku otomatis, laporan keuangan real-time',
        estimated_impact: 'Efisiensi kalkulasi HPP percetakan naik 85%, waktu penyusunan laporan keuangan berkurang dari 5 hari ke 10 detik',
      };
    } else if (ind === 'ticketing') {
      if (sc === 'enterprise') {
        return {
          title: 'High-Throughput Stadium & National Event Ticketing Infrastructure',
          recommended_arch: 'Distributed Token Queue + Multi-Region Redis Cluster + Real-time Gate Analytics',
          tech_stack: 'Next.js, Golang High-Throughput Microservices, Redis Cluster, WebSockets, PostgreSQL Active-Standby',
          features: 'Throughput 150.000 TPS, multi-gate sync, seat map locking, auto-refund queue',
          estimated_impact: 'Kapasitas 150.000 TPS tanpa kelambatan, 100% validasi tiket stadion nasional',
        };
      }
      return {
        title: 'Automated Event Ticketing & Gate Access System',
        recommended_arch: 'Queue Waiting Room + Redis Worker Engine + QR Offline Gate Validator',
        tech_stack: 'Next.js, Golang Engine, Redis Queue, PostgreSQL',
        features: 'Rate limiting ticket buffer, dynamic encrypted QR validation, anti-duplikasi tiket, live gate counter',
        estimated_impact: 'Zero crash saat war ticket masal, validasi gate masuk <0.5 detik/pengunjung',
      };
    } else if (ind === 'logistics') {
      if (sc === 'enterprise') {
        return {
          title: 'Enterprise Logistics Network & Automated Warehouse WMS',
          recommended_arch: 'Distributed IoT Telematics + Kafka Event Bus + WMS Warehouse Engine',
          tech_stack: 'Golang Microservices, Apache Kafka, PostGIS, React Native, Kubernetes',
          features: 'Cross-docking automation, barcode scanner dispatch, route optimization AI, real-time SLA monitor',
          estimated_impact: 'Penghematan biaya bahan bakar armada 30%, akurasi inventoris gudang 99.8%',
        };
      }
      return {
        title: 'Smart Logistics Fleet Tracking & Automated Dispatch',
        recommended_arch: 'IoT Telematics Ingestion Pipeline + Geospatial Indexing + Driver Mobile App',
        tech_stack: 'Golang IoT Ingestion Engine, PostGIS / PostgreSQL, Flutter / React Native, Redis',
        features: 'Live GPS fleet tracking, geofencing alert, fuel consumption analytics, digital Proof of Delivery',
        estimated_impact: 'Efisiensi rute armada 25%, akurasi pengiriman tepat waktu naik hingga 98%',
      };
    } else {
      if (sc === 'enterprise') {
        return {
          title: 'Enterprise Microservices Ecosystem & High-Security Gateway',
          recommended_arch: 'Kubernetes Microservices Mesh + Distributed DB Sharding + Zero-Trust Auth',
          tech_stack: 'Next.js, Golang, Python, PostgreSQL Sharded, Kafka, Redis, Kubernetes',
          features: 'Zero-trust OAuth2/JWT security, automated failover, load balancing, audit log compliance',
          estimated_impact: 'Zero single point of failure, kesiapan skalabilitas hingga jutaan transaksi harian',
        };
      }
      return {
        title: 'Custom High Availability Software Architecture',
        recommended_arch: 'Clean Architecture Modular System + REST/GraphQL Gateway + Redis Cache',
        tech_stack: 'Next.js, Golang, Python, PostgreSQL, Redis',
        features: 'Clean Architecture codebase, role-based access control, automated CI/CD pipeline, real-time telemetry',
        estimated_impact: 'Skalabilitas tinggi dengan SLA Uptime 99.99% dan maintenance terukur',
      };
    }
  };

  const industries = [
    { key: 'retail', label: 'Retail & Offline-First POS Network' },
    { key: 'enterprise', label: 'Manufaktur, Percetakan & Enterprise ERP' },
    { key: 'ticketing', label: 'High-Throughput Event Ticketing & Gate' },
    { key: 'logistics', label: 'Smart Logistics, Fleet & Supply Chain' },
    { key: 'custom', label: 'Custom Enterprise System & Microservices' },
  ];

  const scales = [
    { key: 'medium', label: 'Skala Menengah (Mid-Market Enterprise)' },
    { key: 'enterprise', label: 'Skala Besar Enterprise (High-Throughput)' },
  ];

  return (
    <section id="simulator" className="pt-10 pb-20 px-4 sm:px-6 lg:px-8 relative bg-space-950">
      <div className="max-w-6xl mx-auto">
        
        {/* Executive Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-neon-violet/30 text-neon-violet text-xs font-mono mb-4 backdrop-blur-md">
            <Cpu className="w-4 h-4 text-neon-violet" />
            <span>ENTERPRISE ARCHITECTURE GENERATOR & BLUEPRINT SIMULATOR</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Simulator Arsitektur & <span className="text-gradient-cyan">Solusi Sistem Bisnis</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Formulasikan rekomendasi blueprint arsitektur perangkat lunak skala enterprise, estimasi efisiensi operasional, serta integrasi modul presisi dari PT. Ragam Manfaat Sinergi.
          </p>
        </div>

        {/* Simulator Workspace Grid */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-neon-cyan/30 shadow-neon-cyan grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
                01. Sektor / Industri Bisnis Anda
              </label>
              <div className="space-y-2">
                {industries.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      playClickSfx();
                      setIndustry(item.key);
                    }}
                    onMouseEnter={playSubtleHover}
                    className={`w-full p-3.5 rounded-2xl text-xs font-semibold text-left transition-all flex items-center justify-between border ${
                      industry === item.key
                        ? 'bg-neon-cyan/20 border-neon-cyan text-white shadow-neon-cyan'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{item.label}</span>
                    {industry === item.key && <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-sm shadow-neon-cyan"></span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
                02. Skala Operasional Perusahaan
              </label>
              <div className="space-y-2">
                {scales.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      playClickSfx();
                      setScale(item.key);
                    }}
                    onMouseEnter={playSubtleHover}
                    className={`w-full p-3.5 rounded-2xl text-xs font-semibold text-left transition-all flex items-center justify-between border ${
                      scale === item.key
                        ? 'bg-neon-violet/20 border-neon-violet text-white shadow-neon-violet'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{item.label}</span>
                    {scale === item.key && <span className="w-2 h-2 rounded-full bg-neon-violet"></span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Architecture Result Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-space-900/90 rounded-2xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
            
            {loading && (
              <div className="absolute inset-0 bg-space-950/80 backdrop-blur-sm z-20 flex items-center justify-center font-mono text-neon-cyan text-xs">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 animate-spin" />
                  <span>Kalkulasi Blueprint Arsitektur Sistem...</span>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-bold">
                  RAMS ENTERPRISE BLUEPRINT RESULT
                </span>
                <span className="text-xs text-slate-400 font-mono">SLA Uptime: 99.99%</span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                {blueprint?.title || 'Formula Blueprint Arsitektur'}
              </h3>

              {/* Recommended Architecture Box */}
              <div className="p-4 rounded-xl bg-space-950 border border-white/10 mb-6 font-mono text-xs">
                <div className="text-slate-400 text-[10px] uppercase mb-1">Recommended System Architecture</div>
                <div className="text-neon-cyan font-semibold leading-relaxed">
                  {blueprint?.recommended_arch}
                </div>
              </div>

              {/* Impact Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 mb-6">
                <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold mb-1">
                  ESTIMASI DAMPAK & EFISIENSI BISNIS
                </div>
                <div className="text-xs sm:text-sm font-semibold text-white">
                  {blueprint?.estimated_impact}
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-3 mb-6">
                <div className="text-xs font-mono text-slate-400 uppercase">Fitur Kapabilitas Utama</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {blueprint?.features.split(',').map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-neon-cyan shrink-0" />
                      <span>{feat.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase mb-2">Recommended Tech Stack</div>
                <div className="flex flex-wrap gap-1.5 font-mono text-xs text-slate-300">
                  {blueprint?.tech_stack.split(',').map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-white/5 border border-white/10">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-6 border-t border-white/10 mt-6 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-400 font-mono">Konsultasikan arsitektur ini langsung bersama tim RAMS</span>
              <a
                href="/contact"
                onClick={playClickSfx}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-cyan hover:bg-cyan-400 text-space-950 font-bold text-xs transition-all shadow-neon-cyan"
              >
                <span>Konsultasi Arsitek RAMS</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
