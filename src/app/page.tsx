'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ServiceStatusBanner from '@/components/ServiceStatusBanner';
import { 
  PlusCircle, 
  Search, 
  BookOpen, 
  Wifi, 
  GraduationCap, 
  Mail, 
  Monitor, 
  Tv, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  HelpCircle,
  Sparkles,
  ChevronRight,
  Database
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [quickQuery, setQuickQuery] = useState('');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = quickQuery.trim();
    if (!q) return;

    // If starts with UPITRA- or looks like a ticket number, redirect to tracking
    if (q.toUpperCase().startsWith('UPITRA') || /^\d{4}$/.test(q)) {
      router.push(`/track?q=${encodeURIComponent(q)}`);
    } else {
      router.push(`/kb?q=${encodeURIComponent(q)}`);
    }
  };

  const serviceCategories = [
    {
      id: 1,
      name: 'Jaringan & WiFi Kampus',
      desc: 'WiFi UPITRA-Hotspot, eduroam, port LAN, dan akses internet berkecepatan tinggi.',
      icon: Wifi,
      sla: 'SLA: 4 Jam',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      id: 2,
      name: 'SIAKAD & Sistem Akademik',
      desc: 'Pemulihan akun, pengisian KRS, sinkronisasi nilai, dan kendala portal akademik.',
      icon: GraduationCap,
      sla: 'SLA: 6 Jam',
      color: 'from-indigo-600 to-blue-700',
    },
    {
      id: 4,
      name: 'Akun & Email Institusi',
      desc: 'Aktivasi @student.upitra.ac.id, lisensi Microsoft 365, dan Single Sign-On (SSO).',
      icon: Mail,
      sla: 'SLA: 8 Jam',
      color: 'from-emerald-600 to-teal-700',
    },
    {
      id: 5,
      name: 'Hardware & Lab Komputer',
      desc: 'Perangkat PC Lab, instalasi software praktikum (SPSS, MATLAB), dan printer.',
      icon: Monitor,
      sla: 'SLA: 12 Jam',
      color: 'from-amber-600 to-orange-700',
    },
    {
      id: 6,
      name: 'Multimedia Ruang Kuliah',
      desc: 'Proyektor kelas, audio visual auditorium, dan perlengkapan perkuliahan hybrid.',
      icon: Tv,
      sla: 'SLA: 2 Jam (Prioritas)',
      color: 'from-rose-600 to-pink-700',
    },
    {
      id: 3,
      name: 'Pusat Bantuan Umum BTIK',
      desc: 'Konsultasi teknis, peminjaman fasilitas TIK, dan panduan penggunaan sistem kampus.',
      icon: HelpCircle,
      sla: 'SLA: 24 Jam',
      color: 'from-slate-700 to-slate-900',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-upitra-navy via-upitra-blue to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Decorative Grid and Glow */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pusat Layanan Terpadu Biro TIK Universitas Pignatelli Triputra</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            IT Helpdesk & Ticketing <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-300 to-amber-300">
              Sivitas Akademika UPITRA
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Sistem pelaporan kendala teknologi informasi yang transparan, terukur dengan Service Level Agreement (SLA), dan terintegrasi langsung dengan database institusi.
          </p>

          {/* Quick Search & Ticket Tracker Bar */}
          <form
            onSubmit={handleQuickSearch}
            className="max-w-2xl mx-auto relative flex items-center bg-white rounded-2xl shadow-2xl p-2 text-slate-900 border border-slate-200"
          >
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Ketik kata kunci kendala (misal: WiFi, SIAKAD) atau Nomor Tiket (misal: UPITRA-2026-0891)..."
              className="w-full text-xs sm:text-sm px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden"
            />
            <button
              type="submit"
              className="bg-upitra-navy hover:bg-upitra-blue text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors shrink-0 shadow-md flex items-center gap-1.5"
            >
              <span>Cari / Lacak</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold">
            <Link
              href="/submit"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-950/40 hover:scale-102 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ajukan Tiket Kendala Baru</span>
            </Link>

            <Link
              href="/track"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 px-5 py-3 rounded-xl backdrop-blur-sm transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Lacak Tiket Tanpa Login</span>
            </Link>

            <Link
              href="/kb"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/15 text-slate-200 border border-white/15 px-4 py-3 rounded-xl transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Panduan Mandiri (FAQ)</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Real-time Server Health Section */}
        <ServiceStatusBanner />

        {/* Layanan Utama / Kategori IT UPITRA */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Katalog Layanan BTIK
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Kategori Layanan Dukungan TIK
              </h2>
            </div>
            <Link
              href="/submit"
              className="text-xs font-bold text-upitra-navy hover:text-emerald-600 flex items-center gap-1 group"
            >
              <span>Lihat semua alur pengajuan</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {serviceCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {cat.sla}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-upitra-navy transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <Link
                      href={`/submit?cat=${cat.id}`}
                      className="font-bold text-upitra-navy hover:text-emerald-600 flex items-center gap-1"
                    >
                      <span>Lapor Kendala Ini</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/kb"
                      className="text-slate-400 hover:text-slate-600"
                    >
                      Lihat Solusi
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Alur Pelayanan BTIK UPITRA */}
        <section className="bg-gradient-to-br from-slate-900 to-upitra-navy text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Standar Operasional Prosedur (SOP)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Bagaimana Tiket Anda Diproses oleh Tim BTIK?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Setiap keluhan tercatat dengan nomor pelacakan unik dan dipertanggungjawabkan sesuai komitmen mutu SLA UPITRA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="font-bold text-white text-sm">Ajukan Laporan</h4>
              <p className="text-xs text-slate-300">
                Pilih kategori kendala, isi lokasi gedung/ruangan, serta nomor kontak WhatsApp/email.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="font-bold text-white text-sm">Delegasi Teknisi</h4>
              <p className="text-xs text-slate-300">
                Sistem menugaskan teknisi spesialis jaringan, aplikasi, atau hardware sesuai kategori.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="font-bold text-white text-sm">Penanganan & Chat</h4>
              <p className="text-xs text-slate-300">
                Teknisi menangani di lokasi/server. Anda dapat berdiskusi melalui chat real-time tiket.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h4 className="font-bold text-white text-sm">Selesai & Rating</h4>
              <p className="text-xs text-slate-300">
                Tiket diselesaikan dan Anda memberikan ulasan kepuasan 1-5 bintang untuk evaluasi pimpinan.
              </p>
            </div>
          </div>
        </section>

        {/* Database & Synology NAS Integration Highlight */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">
                Siap Terhubung dengan Database Synology NAS (phpMyAdmin)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Tersedia berkas skrip <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">database.sql</code> yang siap diimpor ke MariaDB/phpMyAdmin pada server Synology NAS kampus Anda untuk penyimpanan permanen skala perguruan tinggi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard"
              className="bg-upitra-navy hover:bg-upitra-blue text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors"
            >
              Buka Dashboard Sistem
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

