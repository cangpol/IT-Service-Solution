'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Ticket, TicketMessage, Feedback } from '@/lib/types';
import { 
  getStatusBadge, 
  getPriorityBadge, 
  calculateSlaStatus, 
  formatDateIndonesian 
} from '@/lib/utils';
import TicketTimeline from '@/components/TicketTimeline';
import TicketChat from '@/components/TicketChat';
import CsatModal from '@/components/CsatModal';
import { 
  Search, 
  MapPin, 
  User, 
  Clock, 
  Star, 
  AlertCircle, 
  Tag,
  ArrowRight
} from 'lucide-react';

function TrackTicketContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCsatOpen, setIsCsatOpen] = useState(false);

  const fetchTicket = async (code: string) => {
    if (!code.trim()) return;
    try {
      setIsLoading(true);
      setErrorMsg('');
      const res = await fetch(`/api/tickets/${encodeURIComponent(code.trim().toUpperCase())}`);
      const data = await res.json();

      if (data.success && data.data) {
        setTicket(data.data);
      } else {
        setTicket(null);
        setErrorMsg(data.message || 'Tiket dengan nomor tersebut tidak ditemukan.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal terhubung ke server untuk melacak tiket.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchTicket(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTicket(searchQuery);
  };

  const handleNewMessage = (newMsg: TicketMessage) => {
    if (!ticket) return;
    setTicket({
      ...ticket,
      messages: [...(ticket.messages || []), newMsg],
    });
  };

  const handleCsatSuccess = (feedback: Feedback) => {
    if (!ticket) return;
    setTicket({
      ...ticket,
      feedback,
    });
  };

  const statusInfo = ticket ? getStatusBadge(ticket.status) : null;
  const priorityInfo = ticket ? getPriorityBadge(ticket.priority) : null;
  const slaInfo = ticket
    ? calculateSlaStatus(ticket.slaDueAt, ticket.status === 'RESOLVED' || ticket.status === 'CLOSED')
    : null;

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          <Search className="w-3.5 h-3.5" />
          <span>Pelacakan Tiket Mandiri Real-Time</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Lacak Progres Tiket Layanan IT
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Masukkan Nomor Tiket (contoh: <code className="font-mono text-upitra-navy font-bold">UPITRA-2026-0891</code>) yang Anda dapatkan saat pengajuan.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex gap-2 pt-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Contoh: UPITRA-2026-0891 atau UPITRA-2026-0892..."
              className="w-full text-xs sm:text-sm pl-4 pr-10 py-3 rounded-2xl border border-slate-300 shadow-xs focus:ring-2 focus:ring-upitra-navy focus:outline-hidden font-mono uppercase placeholder:font-sans placeholder:normal-case"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            className="px-6 py-3 rounded-2xl bg-upitra-navy hover:bg-upitra-blue text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <span>{isLoading ? 'Mencari...' : 'Lacak Tiket'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Example Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-slate-500">
          <span>Contoh Tiket Aktif:</span>
          {['UPITRA-2026-0891', 'UPITRA-2026-0892', 'UPITRA-2026-0893'].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setSearchQuery(code);
                fetchTicket(code);
              }}
              className="font-mono px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 max-w-2xl mx-auto">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Ticket Details View */}
      {ticket && statusInfo && priorityInfo && slaInfo && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
            {/* Header badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs sm:text-sm font-black px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                    {ticket.ticketNumber}
                  </span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 ${statusInfo.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></span>
                    {statusInfo.label}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${priorityInfo.bg}`}>
                    Prioritas: {priorityInfo.label}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {ticket.title}
                </h2>
              </div>

              {/* CSAT / Feedback Action Button */}
              {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
                <div>
                  {ticket.feedback ? (
                    <div className="bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl text-left">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(ticket.feedback.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-xs font-bold text-amber-800 ml-1.5">
                          {ticket.feedback.rating} / 5 Bintang
                        </span>
                      </div>
                      {ticket.feedback.comment && (
                        <p className="text-[11px] text-slate-600 mt-1 italic">
                          “{ticket.feedback.comment}”
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsCsatOpen(true)}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all animate-bounce"
                    >
                      <Star className="w-4 h-4 fill-white" />
                      <span>Beri Penilaian Layanan (CSAT)</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-upitra-navy shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Lokasi Kampus
                  </span>
                  <p className="font-bold text-slate-800">{ticket.locationBuilding}</p>
                  <p className="text-slate-500">{ticket.locationRoom}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <User className="w-5 h-5 text-upitra-navy shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Pelapor ({ticket.requesterRole})
                  </span>
                  <p className="font-bold text-slate-800">{ticket.requesterName}</p>
                  <p className="text-slate-500 text-[11px]">{ticket.requesterEmail}</p>
                  {ticket.requesterId && (
                    <p className="text-slate-400 text-[10px] font-mono">ID: {ticket.requesterId}</p>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <Tag className="w-5 h-5 text-upitra-navy shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Kategori & Penanggung Jawab
                  </span>
                  <p className="font-bold text-slate-800">
                    {ticket.category ? ticket.category.name : 'Layanan BTIK'}
                  </p>
                  <p className="text-emerald-700 font-medium text-[11px]">
                    Teknisi: {ticket.assignedTo ? ticket.assignedTo.name : 'Dalam Antrean Delegasi'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <Clock className="w-5 h-5 text-upitra-navy shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Komitmen Waktu (SLA)
                  </span>
                  <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${slaInfo.badgeColor}`}>
                    {slaInfo.text}
                  </span>
                  <p className="text-slate-400 text-[10px] mt-1">
                    Diajukan: {formatDateIndonesian(ticket.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Description Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Deskripsi Kendala yang Dilaporkan
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          </div>

          {/* Stepper Timeline & Interactive Chat Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Timeline Stepper (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
                <Clock className="w-5 h-5 text-upitra-navy" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Jejak Langkah Penanganan
                </h3>
              </div>
              <TicketTimeline timelines={ticket.timelines} />
            </div>

            {/* Interactive Chat (3 cols) */}
            <div className="lg:col-span-3">
              <TicketChat
                ticketNumber={ticket.ticketNumber}
                messages={ticket.messages || []}
                onMessageSent={handleNewMessage}
                isTicketClosed={ticket.status === 'CLOSED'}
              />
            </div>
          </div>

          {/* CSAT Modal */}
          <CsatModal
            isOpen={isCsatOpen}
            onClose={() => setIsCsatOpen(false)}
            ticketNumber={ticket.ticketNumber}
            onSuccess={handleCsatSuccess}
          />
        </div>
      )}
    </div>
  );
}

export default function TrackTicketPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Memuat pelacak tiket...</div>}>
        <TrackTicketContent />
      </Suspense>
    </div>
  );
}

