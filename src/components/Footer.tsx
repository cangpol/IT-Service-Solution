import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-upitra-accent flex items-center justify-center font-black text-lg text-white">
                UP
              </div>
              <span className="font-bold text-white text-base">
                BTIK UPITRA
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Biro Teknologi Informasi & Komunikasi Universitas Pignatelli Triputra. Memberikan dukungan teknologi handal untuk seluruh civitas akademika.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Sistem Terintegrasi Synology NAS</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Layanan Utama
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/submit" className="hover:text-emerald-400 transition-colors">
                  Buat Tiket Kendala Baru
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-emerald-400 transition-colors">
                  Lacak Progres Tiket
                </Link>
              </li>
              <li>
                <Link href="/kb" className="hover:text-emerald-400 transition-colors">
                  Pusat Solusi Mandiri (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Dashboard Layanan Civitas
                </Link>
              </li>
            </ul>
          </div>

          {/* IT Operating Hours & Emergency */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Jam Operasional BTIK
            </h3>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">Senin - Jumat: 07.30 - 17.00 WIB</p>
                  <p className="text-[11px]">Sabtu: 08.00 - 13.00 WIB (Piket Ujian)</p>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-900/40 text-red-300 text-xs">
                <p className="font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Hotline Darurat Ruang Kuliah:
                </p>
                <p className="font-mono mt-0.5 text-white">Ext. 204 / WA: 0812-3456-7890</p>
              </div>
            </div>
          </div>

          {/* Contact & Campus Info */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Kampus UPITRA
            </h3>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                <span>Jl. Wolter Monginsidi No. 19, Solo, Jawa Tengah</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-300 shrink-0" />
                <span>btik@upitra.ac.id</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-300 shrink-0" />
                <span>(0271) 642878</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Universitas Pignatelli Triputra. All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            Dikelola dengan <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> oleh Biro TIK UPITRA
          </p>
        </div>
      </div>
    </footer>
  );
}

