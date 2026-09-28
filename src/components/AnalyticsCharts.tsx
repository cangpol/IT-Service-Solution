'use client';

import React from 'react';
import { AnalyticsSummary } from '@/lib/types';
import { 
  BarChart3, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  Star, 
  Ticket as TicketIcon,
  TrendingUp,
  Activity
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface AnalyticsChartsProps {
  analytics: AnalyticsSummary;
}

export default function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  const maxCategoryCount = Math.max(
    ...analytics.categoryDistribution.map((c) => c.count),
    1
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Tiket Masuk
            </span>
            <TicketIcon className="w-5 h-5 text-upitra-navy" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {analytics.totalTickets}
          </p>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
            <span className="font-semibold text-amber-600">{analytics.openTickets} menunggu</span>
            <span>•</span>
            <span className="font-semibold text-blue-600">{analytics.inProgressTickets} diproses</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Kepatuhan SLA
            </span>
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">
            {analytics.slaCompliancePercent}%
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Target institusi: ≥ 95%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Rata-rata Waktu Solusi
            </span>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {analytics.averageResolutionHours} <span className="text-sm font-medium text-slate-500">Jam</span>
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500">
            <span>Standar SLA: Maksimal 24 jam</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Kepuasan Civitas (CSAT)
            </span>
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-1">
            {analytics.averageCsat} <span className="text-sm font-medium text-slate-400">/ 5.0</span>
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-amber-700 font-medium">
            <span>Dari {analytics.totalFeedback} penilaian mahasiswa & dosen</span>
          </div>
        </div>
      </div>

      {/* Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-upitra-navy" />
              <h3 className="font-bold text-slate-900 text-sm">
                Distribusi Tiket Berdasarkan Kategori Layanan Kampus
              </h3>
            </div>
            <span className="text-xs text-slate-400">Periode Berjalan</span>
          </div>

          <div className="space-y-4">
            {analytics.categoryDistribution.map((item, idx) => {
              const percentage = Math.round((item.count / (analytics.totalTickets || 1)) * 100);
              const barWidth = Math.round((item.count / maxCategoryCount) * 100);

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{item.categoryName}</span>
                    <span className="text-slate-500 font-mono">
                      {item.count} tiket ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-upitra-navy to-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(barWidth, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Audit */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Aktivitas Tiket Terkini
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            {analytics.recentActivity.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-upitra-navy">
                    {act.ticketNumber}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatDateIndonesian(act.time)}
                  </span>
                </div>
                <p className="text-slate-700 font-medium text-[11px]">{act.action}</p>
                <span className="text-[10px] text-slate-500">
                  Petugas / Pelapor: <strong className="text-slate-700">{act.actor}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

