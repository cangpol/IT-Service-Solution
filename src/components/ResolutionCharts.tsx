'use client';

import React from 'react';
import { ResolutionTrendItem, CategoryResolutionSpeed, SecurityLog } from '@/lib/types';
import { 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface ResolutionChartsProps {
  trendData: ResolutionTrendItem[];
  resolutionSpeed: CategoryResolutionSpeed[];
  securityLogs: SecurityLog[];
  spamCount: number;
}

export default function ResolutionCharts({
  trendData,
  resolutionSpeed,
  securityLogs,
  spamCount,
}: ResolutionChartsProps) {
  const maxWeeklyValue = Math.max(
    ...trendData.map((d) => Math.max(d.created, d.resolved)),
    20
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Security & Resolution Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-800/40 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
              Penyelesaian Masalah
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">96.8%</p>
          <p className="text-[11px] text-emerald-300/80 mt-1">
            Tingkat keberhasilan resolusi teknis tanpa eskalasi ulang
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-950 to-slate-900 text-white p-5 rounded-2xl border border-blue-800/40 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-sky-400">
              Rata-rata Waktu Solusi
            </span>
            <Clock className="w-5 h-5 text-sky-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">2.8 <span className="text-sm font-normal text-slate-400">Jam</span></p>
          <p className="text-[11px] text-sky-300/80 mt-1">
            Jauh lebih cepat dari batas maksimal SLA standar 24 jam
          </p>
        </div>

        <div className="bg-gradient-to-br from-rose-950 to-slate-900 text-white p-5 rounded-2xl border border-rose-800/40 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-rose-400">
              Keamanan Anti-Spam
            </span>
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{spamCount} <span className="text-sm font-normal text-slate-400">Tiket</span></p>
          <p className="text-[11px] text-rose-300/80 mt-1">
            Laporan usil berhasil diisolasi & akun pelapor ditindak
          </p>
        </div>
      </div>

      {/* Grid: Weekly Trend & Category Resolution Speed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Grafik Tren Penyelesaian Masalah Mingguan</span>
              </h3>
              <p className="text-xs text-slate-500">Perbandingan tiket diajukan vs diselesaikan</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span> Tiket Masuk
              </span>
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Selesai
              </span>
            </div>
          </div>

          {/* Bar chart visualization */}
          <div className="pt-4 flex items-end justify-between gap-2 h-52 border-b border-slate-100 pb-3">
            {trendData.map((item, idx) => {
              const createdHeight = Math.round((item.created / maxWeeklyValue) * 100);
              const resolvedHeight = Math.round((item.resolved / maxWeeklyValue) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1 h-40">
                    {/* Created bar */}
                    <div
                      title={`Masuk: ${item.created}`}
                      className="w-3 sm:w-4 bg-blue-500 rounded-t-md hover:bg-blue-600 transition-all cursor-pointer relative group"
                      style={{ height: `${Math.max(createdHeight, 6)}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {item.created}
                      </span>
                    </div>

                    {/* Resolved bar */}
                    <div
                      title={`Selesai: ${item.resolved}`}
                      className="w-3 sm:w-4 bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-all cursor-pointer relative group"
                      style={{ height: `${Math.max(resolvedHeight, 6)}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {item.resolved}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resolution Speed per Category */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-5">
          <div className="space-y-0.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-upitra-navy" />
              <span>Kecepatan Resolusi per Kategori (Rata-rata Jam)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Durasi penanganan aktual dibandingkan target batas Service Level Agreement (SLA)
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {resolutionSpeed.map((cat, idx) => {
              const speedRatio = Math.round((cat.avgHours / cat.targetSla) * 100);
              const isFast = cat.avgHours < cat.targetSla;

              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{cat.categoryName}</span>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="font-bold text-emerald-700">{cat.avgHours} Jam</span>
                      <span className="text-slate-400">/ Target: {cat.targetSla} Jam</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFast ? 'bg-gradient-to-r from-upitra-navy to-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(speedRatio, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Security & Anti-Spam Incident Logs */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Log Keamanan & Perlindungan Tiket Usil Terdeteksi
              </h3>
              <p className="text-xs text-slate-500">
                Daftar tiket yang ditolak karena pelanggaran etika pelaporan atau indikasi spam
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
            {securityLogs.length} Insiden Tercatat
          </span>
        </div>

        {securityLogs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            Tidak ada insiden keamanan atau tiket usil yang tercatat.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {securityLogs.map((log) => (
              <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {log.ticketNumber || 'NO-TICKET'}
                    </span>
                    <span className="font-semibold text-slate-800">{log.reporterEmail}</span>
                    {log.ipAddress && (
                      <span className="text-[10px] text-slate-400 font-mono">IP: {log.ipAddress}</span>
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px]">{log.reason}</p>
                </div>

                <div className="flex sm:flex-col sm:items-end justify-between text-[11px] shrink-0">
                  <span className="font-semibold text-rose-600">{log.actionTaken}</span>
                  <span className="text-slate-400">{formatDateIndonesian(log.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

