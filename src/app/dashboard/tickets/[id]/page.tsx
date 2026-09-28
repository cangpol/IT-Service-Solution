'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ticket, TicketMessage, Feedback, User } from '@/lib/types';
import { 
  getStatusBadge, 
  getPriorityBadge, 
  calculateSlaStatus, 
  formatDateIndonesian 
} from '@/lib/utils';
import { useRole } from '@/context/RoleContext';
import { useToast } from '@/context/ToastContext';
import TicketTimeline from '@/components/TicketTimeline';
import TicketChat from '@/components/TicketChat';
import CsatModal from '@/components/CsatModal';
import SpamReportModal from '@/components/admin/SpamReportModal';
import { 
  ArrowLeft, 
  MapPin, 
  User as UserIcon, 
  Clock, 
  Star, 
  Wrench, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  ShieldCheck,
  ShieldAlert,
  Save,
  Phone,
  Mail,
  Lock,
  LogIn
} from 'lucide-react';

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: ticketNumber } = use(params);
  const router = useRouter();
  const { currentUser, isLoggedIn, isLoading: isAuthLoading } = useRole();
  const { toast, showPopup } = useToast();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCsatOpen, setIsCsatOpen] = useState(false);
  const [isSpamModalOpen, setIsSpamModalOpen] = useState(false);

  // Technician controls state
  const [editStatus, setEditStatus] = useState<any>('OPEN');
  const [editPriority, setEditPriority] = useState<any>('MEDIUM');
  const [editAssignedId, setEditAssignedId] = useState<string>('');
  const [techNote, setTechNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isStaffOrTech = currentUser?.role === 'TECHNICIAN' || currentUser?.role === 'ADMIN';

  const fetchTicket = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/tickets/${ticketNumber}`);
      const data = await res.json();
      if (data.success && data.data) {
        setTicket(data.data);
        setEditStatus(data.data.status);
        setEditPriority(data.data.priority);
        setEditAssignedId(data.data.assignedToId || '');
      } else {
        setErrorMsg(data.message || 'Tiket tidak ditemukan');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal memuat detail tiket dari server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      fetchTicket();
    }
  }, [ticketNumber, isLoggedIn, currentUser]);

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !currentUser) return;

    try {
      setIsSaving(true);
      const res = await fetch(`/api/tickets/${ticket.ticketNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          priority: editPriority,
          assignedToId: editAssignedId || null,
          actorName: currentUser.name,
          note: techNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTicket(data.data);
        setTechNote('');
        showPopup({
          type: 'success',
          title: 'Perubahan Berhasil Disimpan!',
          message: 'Data status tiket, tingkat prioritas, dan delegasi teknisi telah berhasil diperbarui ke sistem Helpdesk UPITRA.',
          confirmText: 'Selesai & Lanjutkan',
        });
      } else {
        toast.error(data.message || 'Gagal memperbarui tiket');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan koneksi ke server.');
    } finally {
      setIsSaving(false);
    }
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

  if (isAuthLoading) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-3">
        <Clock className="w-8 h-8 animate-spin mx-auto text-upitra-navy" />
        <p className="text-xs text-slate-500">Memeriksa sesi login...</p>
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
          Informasi detail penanganan tiket, riwayat chat teknisi, dan kendali status tiket terproteksi. Silakan masuk terlebih dahulu atau gunakan fitur pelacakan publik.
        </p>
        <Link
          href={`/login?redirect=/dashboard/tickets/${ticketNumber}`}
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-upitra-navy hover:bg-upitra-blue text-white text-xs font-bold transition-all shadow-md"
        >
          <LogIn className="w-4 h-4" />
          <span>Masuk ke Akun Anda</span>
        </Link>
        <div className="pt-2">
          <Link
            href={`/track?ticket=${ticketNumber}`}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Lacak Status Tiket Secara Publik
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-3">
        <Clock className="w-8 h-8 animate-spin mx-auto text-upitra-navy" />
        <p className="text-xs text-slate-500">Memuat data tiket {ticketNumber}...</p>
      </div>
    );
  }

  if (errorMsg || !ticket) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Tiket Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">{errorMsg || 'Nomor tiket tidak terdaftar pada sistem.'}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-upitra-navy hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusBadge(ticket.status);
  const priorityInfo = getPriorityBadge(ticket.priority);
  const slaInfo = calculateSlaStatus(ticket.slaDueAt, ticket.status === 'RESOLVED' || ticket.status === 'CLOSED');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-upitra-navy transition-colors bg-white px-3 py-1.5 rounded-xl border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Tiket</span>
        </Link>

        <span className="text-xs text-slate-400">
          Dibuat: {formatDateIndonesian(ticket.createdAt)}
        </span>
      </div>

      {/* Spam Notice Banner if flagged */}
      {(ticket.isSpamFlagged || ticket.status === 'REJECTED_SPAM') && (
        <div className="bg-red-50 border border-red-200 p-5 rounded-3xl flex items-start gap-3.5 text-red-800 shadow-soft animate-in fade-in duration-200">
          <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-red-900 text-sm">
              Tiket Diidentifikasi Sebagai Laporan Usil / Spam & Ditolak
            </h4>
            <p className="text-red-700 leading-relaxed">
              Tiket ini telah diisolasi dari perhitungan metrik performa SLA & tingkat resolusi teknis BTIK UPITRA. Akun pelapor dapat dibatasi dari pembuatan tiket selanjutnya.
            </p>
            {ticket.spamReason && (
              <div className="mt-2 bg-white/80 border border-red-200 p-2.5 rounded-xl">
                <span className="font-bold text-red-900">Alasan Penolakan: </span>
                <span className="italic text-red-700">{ticket.spamReason}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Ticket Info Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs sm:text-sm font-black px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                {ticket.ticketNumber}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 ${statusInfo.bg}`}>
                <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></span>
                {statusInfo.label}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${priorityInfo.bg}`}>
                {priorityInfo.label}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${slaInfo.badgeColor}`}>
                {slaInfo.text}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {ticket.title}
            </h1>
          </div>

          {/* CSAT / Feedback Display or Button */}
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

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <UserIcon className="w-5 h-5 text-upitra-navy shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                Pelapor ({ticket.requesterRole})
              </span>
              <p className="font-bold text-slate-800">{ticket.requesterName}</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{ticket.requesterEmail}</span>
              </div>
              {ticket.requesterPhone && (
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{ticket.requesterPhone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-upitra-navy shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                Lokasi Kampus
              </span>
              <p className="font-bold text-slate-800">{ticket.locationBuilding}</p>
              <p className="text-slate-600 text-xs mt-0.5">{ticket.locationRoom}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Tag className="w-5 h-5 text-upitra-navy shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                Kategori Layanan
              </span>
              <p className="font-bold text-slate-800">
                {ticket.category ? ticket.category.name : 'Layanan BTIK'}
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Target SLA: {ticket.category?.slaHours || 24} Jam
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Wrench className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                Teknisi Ditugaskan
              </span>
              <p className="font-bold text-emerald-800">
                {ticket.assignedTo ? ticket.assignedTo.name : 'Belum Ditugaskan'}
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {ticket.assignedTo?.department || 'Biro TIK UPITRA'}
              </p>
            </div>
          </div>
        </div>

        {/* Description Box */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Deskripsi Keluhan dari Pelapor
          </span>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>
      </div>

      {/* Technician / Admin Control Panel */}
      {isStaffOrTech && (
        <form
          onSubmit={handleUpdateTicket}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Panel Pengendalian Status & Delegasi Teknisi (Khusus Tim BTIK)
              </h3>
            </div>

            {ticket.status !== 'REJECTED_SPAM' && (
              <button
                type="button"
                onClick={() => setIsSpamModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-bold text-xs transition-colors self-start sm:self-auto"
              >
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Tandai Tiket Usil (Spam)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Ubah Status Tiket:
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden font-medium"
              >
                <option value="OPEN">Menunggu Antrean (OPEN)</option>
                <option value="IN_PROGRESS">Sedang Ditangani (IN_PROGRESS)</option>
                <option value="PENDING_VENDOR">Menunggu Vendor / Sparepart (PENDING)</option>
                <option value="RESOLVED">Telah Selesai (RESOLVED)</option>
                <option value="CLOSED">Tutup Tiket (CLOSED)</option>
                <option value="REJECTED_SPAM">Ditolak / Tiket Usil (Spam)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Tingkat Prioritas:
              </label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden font-medium"
              >
                <option value="LOW">Rendah (LOW)</option>
                <option value="MEDIUM">Sedang (MEDIUM)</option>
                <option value="HIGH">Tinggi (HIGH)</option>
                <option value="CRITICAL">Darurat Kelas / Ujian (CRITICAL)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Delegasikan Teknisi:
              </label>
              <select
                value={editAssignedId}
                onChange={(e) => setEditAssignedId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden font-medium"
              >
                <option value="">-- Belum Ditugaskan --</option>
                <option value="usr-btik-002">Robertus Wijaya, S.Kom. (Jaringan & HW)</option>
                <option value="usr-btik-003">Kevin Triputra, S.Inf. (Aplikasi & SSO)</option>
                <option value="usr-btik-001">Ir. Haryanto, M.T. (Kepala BTIK)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 text-xs">
              Catatan Progres / Alasan Perubahan Status (Akan dicatat di riwayat audit timeline):
            </label>
            <input
              type="text"
              value={techNote}
              onChange={(e) => setTechNote(e.target.value)}
              placeholder="Contoh: Penggantian kabel HDMI telah selesai dilakukan, proyektor normal..."
              className="w-full text-xs rounded-xl p-3 border border-slate-300 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Status'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Stepper Timeline & Interactive Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Timeline Stepper (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
            <Clock className="w-5 h-5 text-upitra-navy" />
            <h3 className="font-bold text-slate-900 text-sm">
              Riwayat Audit Penanganan Tiket
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

      {/* Anti-Spam / Malicious Ticket Modal */}
      <SpamReportModal
        isOpen={isSpamModalOpen}
        onClose={() => setIsSpamModalOpen(false)}
        ticketNumber={ticket.ticketNumber}
        requesterEmail={ticket.requesterEmail}
        actorName={currentUser?.name || 'Administrator'}
        onSuccess={fetchTicket}
      />
    </div>
  );
}

