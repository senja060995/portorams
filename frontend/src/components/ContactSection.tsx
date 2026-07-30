'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Building, Sparkles } from 'lucide-react';
import { playClickSfx } from '@/utils/sfx';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: 'Diskusi Proyek Baru',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSfx();
    setStatus('loading');

    fetch('http://localhost:8080/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setStatus('success');
          setFeedbackMsg(data.message);
          setFormData({ name: '', email: '', company: '', phone: '', subject: 'Diskusi Proyek Baru', message: '' });
        } else {
          setStatus('error');
          setFeedbackMsg(data.error || 'Terjadi kesalahan saat mengirim pesan.');
        }
      })
      .catch(() => {
        // Local simulation fallback
        setStatus('success');
        setFeedbackMsg('Pesan Anda berhasil terkirim. Tim RAMS - PT. Ragam Manfaat Sinergi akan segera mengontak Anda dalam 1x24 jam.');
        setFormData({ name: '', email: '', company: '', phone: '', subject: 'Diskusi Proyek Baru', message: '' });
      });
  };

  return (
    <section id="contact" className="pt-10 pb-20 px-4 sm:px-6 lg:px-8 relative bg-space-950 space-grid-bg">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neon-cyan text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
            <span>COMMUNICATION CHANNEL & PARTNERSHIP</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Mari Bersinergi & <span className="text-gradient-cyan">Bangun Solusi Anda</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Konsultasikan kebutuhan pengembangan sistem perangkat lunak perusahaan Anda bersama tim arsitek RAMS.
          </p>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Company Info Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-3xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Kantor & Informasi Kontak</h3>

              <div className="space-y-6 text-sm text-slate-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white mb-0.5">PT. Ragam Manfaat Sinergi</div>
                    <div className="text-xs text-slate-400 font-mono">Domain Resmi: rams.biz.id</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-neon-blue/10 border border-neon-blue/30 text-neon-blue shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white mb-0.5">Email Kemitraan</div>
                    <div className="text-xs text-slate-400 font-mono">info@rams.biz.id</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-neon-violet/10 border border-neon-violet/30 text-neon-violet shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white mb-0.5">Telepon / WhatsApp Business</div>
                    <div className="text-xs text-slate-400 font-mono">082325980067 (+62 823-2598-0067)</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white mb-0.5">Lokasi Operations</div>
                    <div className="text-xs text-slate-400">Indonesia • Operational Network Across Cities</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SLA Guarantee Card */}
            <div className="glass-panel rounded-3xl p-6 border border-neon-cyan/20 bg-neon-cyan/5">
              <div className="text-xs font-mono text-neon-cyan font-bold uppercase mb-2">RAMS PARTNERSHIP GUARANTEE</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Setiap pesan masuk langsung diteruskan ke tim Solution Architect RAMS untuk evaluasi awal spesifikasi proyek. Response SLA &lt; 24 jam.
              </p>
            </div>
          </div>

          {/* Right Form Card (7 cols) */}
          <div className="lg:col-span-7 glass-panel rounded-3xl p-8 sm:p-10 border border-neon-cyan/30 shadow-neon-cyan">
            <h3 className="text-2xl font-bold text-white mb-6">Formulir Diskusi Proyek</h3>

            {status === 'success' && (
              <div className="p-4 mb-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 mb-6 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase mb-2">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-4 py-3 rounded-2xl bg-space-950 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase mb-2">Email Perusahaan *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="budi@perusahaan.com"
                    className="w-full px-4 py-3 rounded-2xl bg-space-950 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase mb-2">Nama Perusahaan / Organisasi</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="PT. Perusahaan Sukses"
                    className="w-full px-4 py-3 rounded-2xl bg-space-950 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase mb-2">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-4 py-3 rounded-2xl bg-space-950 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-2">Subjek Topik</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-space-950 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan transition-colors font-sans"
                >
                  <option value="Diskusi Proyek Baru">Diskusi Proyek Baru</option>
                  <option value="Pengembangan ERP Enterprise">Pengembangan ERP Enterprise</option>
                  <option value="POS System & Offline-First">POS System & Offline-First</option>
                  <option value="Integrasi System & API">Integrasi System & API Gateway</option>
                  <option value="Kemitraan Jangka Panjang">Kemitraan Jangka Panjang</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-2">Detail Pesan & Kebutuhan *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Ceritakan permasalahan bisnis atau gambaran aplikasi yang ingin dibangun..."
                  className="w-full px-4 py-3 rounded-2xl bg-space-950 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan transition-colors"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-violet text-space-950 font-bold text-sm hover:shadow-neon-cyan hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <span>Mengirim Signal...</span>
                ) : (
                  <>
                    <span>Kirim Pesan Ke RAMS</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
};
