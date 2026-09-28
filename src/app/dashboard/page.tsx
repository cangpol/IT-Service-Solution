'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import { useToast } from '@/context/ToastContext';
import { Ticket, AnalyticsSummary } from '@/lib/types';
import { 
  getStatusBadge, 
  getPriorityBadge, 
  calculateSlaStatus, 
  formatDateIndonesian 
} from '@/lib/utils';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import ResolutionCharts from '@/components/ResolutionCharts';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  UserCheck, 
  ShieldAlert, 
  RefreshCw,
  LayoutDashboard,
  BarChart2,
  FileText,
  Users,
  ShieldCheck,
  Lock,
  LogIn
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, isLoggedIn, isLoading: isAuthLoading, refreshCurrentUser } = useRole();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'tickets' | 'analytics'>('tickets');

  const isTechOrAdmin = currentUser?.role === 'TECHNICIAN' || currentUser?.role === 'ADMIN';

  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce search query to prevent excessive fetches while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadTickets = useCallback(async () => {
    if (!isLoggedIn || !currentUser) return;
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (selectedStatus !== 'ALL') queryParams.set('status', selectedStatus);
      if (selectedPriority !== 'ALL') queryParams.set('priority', selectedPriority);
      if (debouncedSearch) queryParams.set('search', debouncedSearch);

      // If regular student/lecturer, filter by their email
      if (!isTechOrAdmin) {
        queryParams.set('requesterEmail', currentUser.email);
      }

      const ticketsRes = await fetch(`/api/tickets?${queryParams.toString()}`);
      const ticketsData = await ticketsRes.json();

      if (ticketsData.success) setTickets(ticketsData.data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, selectedPriority, debouncedSearch, isTechOrAdmin, currentUser?.email, isLoggedIn]);

  const loadAnalytics = useCallback(async () => {
    if (!isLoggedIn || !isTechOrAdmin) return;
    try {
      const analyticsRes = await fetch('/api/analytics');
      const analyticsData = await analyticsRes.json();
      if (analyticsData.success) setAnalytics(analyticsData.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  }, [isLoggedIn, isTechOrAdmin]);

  // Load tickets on filter or debounced search changes
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      loadTickets();
    }
  }, [loadTickets, isLoggedIn, currentUser?.id]);

  // Load analytics when switching to analytics tab or when tech/admin logs in
  useEffect(() => {
    if (isLoggedIn && isTechOrAdmin && (activeTab === 'analytics' || !analytics)) {
      loadAnalytics();
    }
  }, [isLoggedIn, isTechOrAdmin, activeTab, analytics, loadAnalytics]);

  const handleRefreshAll = async () => {
    await Promise.all([loadTickets(), isTechOrAdmin ? loadAnalytics() : Promise.resolve()]);
    refreshCurrentUser();
  };

  // Quick Status changer for Technician/Admin
  const handleQuickStatusChange = async (
    ticketNumber: string,
    newStatus: 'IN_PROGRESS' | 'RESOLVED'
  ) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/tickets/${ticketNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          assignedToId: currentUser.id,
          actorName: currentUser.name,
          note:
            newStatus === 'IN_PROGRESS'
              ? `Tiket diambil dan sedang ditangani oleh ${currentUser.name}`
              : `Kendala telah diselesaikan oleh teknisi ${currentUser.name}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        loadTickets();
        if (isTechOrAdmin) loadAnalytics();
        toast.success(
          newStatus === 'IN_PROGRESS'
            ? 'Tiket berhasil diambil dan dipindahkan ke antrean penanganan aktif Anda.'
            : 'Tiket berhasil ditandai selesai (RESOLVED).',
          'Status Tiket Diperbarui'
        );
      } else {
        toast.error(data.message || 'Gagal mengubah status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghubungi server.');
    }
  };

  if (isAuthLoading) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-upitra-navy" />
        <p className="text-xs text-slate-500">Memeriksa status sesi login...</p>
      </div>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return (
      <div className="max-w-md mx-auto my-20 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-upitra-navy mx-auto flex items-center justify-center">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Login Diperlukan</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Portal Dashboard dan antrean penanganan tiket hanya dapat diakses oleh civitas akademika atau tim BTIK UPITRA yang telah masuk.
        </p>
        <Link
          href="/login?redirect=/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-upitra-navy hover:bg-upitra-blue text-white text-xs font-bold transition-all shadow-md"
        >
          <LogIn className="w-4 h-4" />
          <span>Masuk ke Akun Anda</span>
        </Link>
        <div className="pt-2">
          <Link href="/" className="text-[11px] text-slate-400 hover:text-slate-600 underline">
            Kembali ke Beranda Utama
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Welcome Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {currentUser.role === 'ADMIN'
                ? 'Portal Pimpinan Biro TIK'
                : currentUser.role === 'TECHNICIAN'
                ? 'Antrean Operasional Teknisi'
                : 'Portal Layanan Mahasiswa & Dosen'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Selamat Datang, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-500">
            {currentUser.department} • {currentUser.email}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {currentUser.role === 'ADMIN' && (
            <Link
              href="/admin/users"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Kelola Pengguna & Auth</span>
            </Link>
          )}

          <Link
            href="/submit"
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-950/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Tiket Baru</span>
          </Link>

          <button
            onClick={handleRefreshAll}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Tabs (For Tech / Admin: Tickets vs KPI Analytics) */}
      {isTechOrAdmin && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tickets'
                ? 'bg-upitra-navy text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Manajemen & Antrean Tiket ({tickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-upitra-navy text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Analitik Resolusi & Keamanan SLA</span>
          </button>
        </div>
      )}

      {/* View 1: Analytics (for Admin / Tech) */}
      {isTechOrAdmin && activeTab === 'analytics' && analytics && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <ResolutionCharts
            trendData={analytics.weeklyResolutionTrend || []}
            resolutionSpeed={analytics.categoryResolutionSpeed || []}
            securityLogs={analytics.securityLogs || []}
            spamCount={analytics.spamTicketsCount || 0}
          />
          <AnalyticsCharts analytics={analytics} />
        </div>
      )}

      {/* View 2: Ticket Queue / List */}
      {(activeTab === 'tickets' || !isTechOrAdmin) && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor tiket, judul, atau pelapor..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
              />
            </div>

            {/* Status & Priority selects */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-xl border border-slate-300 p-2 bg-white text-slate-700 focus:outline-hidden font-medium"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="OPEN">Menunggu Antrean (OPEN)</option>
                  <option value="IN_PROGRESS">Sedang Ditangani (IN_PROGRESS)</option>
                  <option value="RESOLVED">Selesai (RESOLVED)</option>
                  <option value="CLOSED">Ditutup (CLOSED)</option>
                  <option value="REJECTED_SPAM">Tiket Usil / Ditolak (Spam)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Prioritas:</span>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="rounded-xl border border-slate-300 p-2 bg-white text-slate-700 focus:outline-hidden font-medium"
                >
                  <option value="ALL">Semua Prioritas</option>
                  <option value="CRITICAL">Darurat (Kelas/Ujian)</option>
                  <option value="HIGH">Tinggi</option>
                  <option value="MEDIUM">Sedang</option>
                  <option value="LOW">Rendah</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tickets Table / Cards */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
            {isLoading ? (
              <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-300" />
                <p>Memuat daftar tiket...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <LayoutDashboard className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Tidak ada tiket ditemukan
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isTechOrAdmin
                    ? 'Tidak ada tiket yang sesuai dengan kriteria filter saat ini.'
                    : 'Anda belum memiliki tiket keluhan aktif. Ajukan tiket baru jika mengalami kendala.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {tickets.map((t) => {
                  const statusInfo = getStatusBadge(t.status);
                  const priorityInfo = getPriorityBadge(t.priority);
                  const slaInfo = calculateSlaStatus(t.slaDueAt, t.status === 'RESOLVED' || t.status === 'CLOSED');

                  return (
                    <div
                      key={t.id}
                      className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        {/* Header Badges */}
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="font-mono font-bold text-upitra-navy bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                            {t.ticketNumber}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${statusInfo.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                            {statusInfo.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full font-semibold border ${priorityInfo.bg}`}>
                            {priorityInfo.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] border ${slaInfo.badgeColor}`}>
                            {slaInfo.text}
                          </span>
                        </div>

                        {/* Title */}
                        <Link
                          href={`/dashboard/tickets/${t.ticketNumber}`}
                          className="font-bold text-slate-900 hover:text-upitra-navy text-sm sm:text-base line-clamp-1 block transition-colors"
                        >
                          {t.title}
                        </Link>

                        {/* Metadata snippet */}
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                          <span>
                            Kategori: <strong className="text-slate-700">{t.category?.name || 'Umum'}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Lokasi: <strong className="text-slate-700">{t.locationBuilding} ({t.locationRoom})</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Pelapor: <strong className="text-slate-700">{t.requesterName}</strong> ({t.requesterRole})
                          </span>
                          <span>•</span>
                          <span className="text-slate-400">
                            {formatDateIndonesian(t.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                        {/* Quick technician action buttons */}
                        {isTechOrAdmin && t.status === 'OPEN' && (
                          <button
                            onClick={() => handleQuickStatusChange(t.ticketNumber, 'IN_PROGRESS')}
                            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                          >
                            Ambil Tiket
                          </button>
                        )}

                        {isTechOrAdmin && t.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleQuickStatusChange(t.ticketNumber, 'RESOLVED')}
                            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Tandai Selesai</span>
                          </button>
                        )}

                        <Link
                          href={`/dashboard/tickets/${t.ticketNumber}`}
                          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-upitra-navy hover:bg-upitra-blue text-white transition-colors shadow-xs"
                        >
                          <span>Buka Tiket & Chat</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

