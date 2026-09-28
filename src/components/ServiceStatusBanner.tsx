'use client';

import React, { useEffect, useState } from 'react';
import { ServiceStatus } from '@/lib/types';
import { CheckCircle, AlertTriangle, RefreshCw, Server } from 'lucide-react';

export default function ServiceStatusBanner() {
  const [statuses, setStatuses] = useState<ServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/system-status');
      const data = await res.json();
      if (data.success) {
        setStatuses(data.data);
      }
    } catch (err) {
      console.error('Failed to load system status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const allOperational = statuses.every((s) => s.status === 'OPERATIONAL');

  return (
    <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-upitra-navy">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Status Operasional Server & Layanan UPITRA
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {allOperational ? 'Semua Sistem Beroperasi Normal' : 'Sebagian Pemeliharaan'}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Pemantauan konektivitas server akademik, jaringan, dan cloud kampus secara berkala.
            </p>
          </div>
        </div>

        <button
          onClick={fetchStatus}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-upitra-navy bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Perbarui Status</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {statuses.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between"
          >
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-800">{item.serviceName}</p>
              <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <span className="text-[11px] font-mono font-medium text-slate-600">
                {item.uptimePercent}%
              </span>
              {item.status === 'OPERATIONAL' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

