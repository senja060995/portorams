'use client';

import React, { useEffect, useState } from 'react';
import { Layers, ShoppingCart, Code2, MessageSquare, Cpu, CheckCircle2, Sparkles } from 'lucide-react';
import { playSubtleHover } from '@/utils/sfx';

interface Service {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  category: string;
  features: string;
  tech_stack: string;
}

export const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
      })
      .catch((err) => console.log('Using default services', err));
  }, []);

  const defaultServices: Service[] = [
    {
      id: 1,
      title: 'Pengembangan Sistem ERP Enterprise',
      subtitle: 'Enterprise Resource Planning & Automation',
      description: 'Solusi terintegrasi untuk manufaktur, percetakan, akuntansi, inventoris, dan operasional skala besar.',
      icon: 'Layers',
      category: 'Enterprise',
      features: 'Multi-Tenant Architecture|Real-time Accounting & Tax|Smart Inventory Tracking|Automated Work Orders',
      tech_stack: 'Next.js, Golang, PostgreSQL, Redis',
    },
    {
      id: 2,
      title: 'Offline-First POS & Retail System',
      subtitle: 'Point of Sale & Multi-Outlet Sync',
      description: 'Sistem kasir cerdas berkecepatan tinggi yang tetap beroperasi 100% tanpa koneksi internet dan melakukan auto-sync saat online.',
      icon: 'ShoppingCart',
      category: 'Retail',
      features: 'Offline Transaction Buffer|Local SQLite Engine|Multi-Outlet Cloud Sync|Bluetooth Hardware Print',
      tech_stack: 'React Native, Expo, SQLite, Node.js',
    },
    {
      id: 3,
      title: 'Custom Software Development',
      subtitle: 'Tailored High-Performance System',
      description: 'Rancang bangun aplikasi web dan mobile sesuai alur kerja spesifik bisnis untuk efisiensi maksimum.',
      icon: 'Code2',
      category: 'Custom',
      features: 'Clean Architecture Codebase|Scalable Microservices|RESTful & GraphQL API|High Availability Deployment',
      tech_stack: 'Next.js, Golang, Python, Docker',
    },
    {
      id: 4,
      title: 'Automated CRM & WhatsApp API Integration',
      subtitle: 'Omnichannel Customer Engagement',
      description: 'Sistem komunikasi dan manajemen tiket otomatis yang terhubung langsung dengan WhatsApp Cloud API resmi.',
      icon: 'MessageSquare',
      category: 'Automation',
      features: 'Automated Bot Dispatcher|Queue Worker Engine|Ticket Escalation Routing|Broadcast & Analytics',
      tech_stack: 'Golang, WhatsApp API, RabbitMQ, Vue.js',
    },
    {
      id: 5,
      title: 'System Integration & API Gateway',
      subtitle: 'Enterprise Interoperability',
      description: 'Menghubungkan berbagai sistem legacy, payment gateway, e-commerce, dan aplikasi pihak ketiga secara aman.',
      icon: 'Cpu',
      category: 'Integration',
      features: 'High Throughput API Gateway|Bank Payment Webhooks|Data Normalization Layer|Rate Limiting & Auth',
      tech_stack: 'Golang, PostgreSQL, Docker, Nginx',
    },
  ];

  const items = services.length > 0 ? services : defaultServices;

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingCart':
        return ShoppingCart;
      case 'Code2':
        return Code2;
      case 'MessageSquare':
        return MessageSquare;
      case 'Cpu':
        return Cpu;
      default:
        return Layers;
    }
  };

  return (
    <section id="services" className="pt-10 pb-20 px-4 sm:px-6 lg:px-8 relative bg-space-950">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neon-cyan text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
            <span>RAMS SERVICES & TECH ARSENAL</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Layanan Utama & <span className="text-gradient-cyan">Kapabilitas Sistem</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Solusi pengembangan sistem modular yang dapat disesuaikan dengan skala bisnis dan tingkat kompleksitas operasional Anda.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((service) => {
            const Icon = getIconComponent(service.icon);
            const featureList = service.features.split('|');
            const techList = service.tech_stack.split(',');

            return (
              <div
                key={service.id}
                onMouseEnter={playSubtleHover}
                className="glass-panel glass-panel-hover rounded-3xl p-8 border border-white/10 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Glowing Corner Trace */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/5 rounded-full blur-2xl group-hover:bg-neon-cyan/15 transition-all"></div>

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-space-900 border border-neon-cyan/30 flex items-center justify-center group-hover:border-neon-cyan group-hover:shadow-neon-cyan transition-all">
                      <Icon className="w-6 h-6 text-neon-cyan" />
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                      {service.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors">
                    {service.title}
                  </h3>
                  <div className="text-xs font-mono text-neon-blue mb-4">{service.subtitle}</div>

                  <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Feature Checklist */}
                  <ul className="space-y-2 mb-6">
                    {featureList.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-neon-cyan shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack Badges */}
                <div className="pt-4 border-t border-white/10 mt-4">
                  <div className="text-[10px] font-mono text-slate-400 uppercase mb-2">Primary Tech Stack</div>
                  <div className="flex flex-wrap gap-1.5">
                    {techList.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-space-900 text-slate-300 border border-white/10"
                      >
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
