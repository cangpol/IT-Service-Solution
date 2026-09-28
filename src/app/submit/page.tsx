'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { 
  PlusCircle, 
  Send, 
  CheckCircle2, 
  Copy, 
  ArrowRight, 
  Upload, 
  AlertCircle,
  Building,
  UserCheck,
  Tag,
  Flame
} from 'lucide-react';
import { useRole } from '@/context/RoleContext';

function SubmitTicketContent() {
  const searchParams = useSearchParams();
  const { currentUser } = useRole();

  const [categories, setCategories] = useState<{ id: number; name: string; slaHours: number }[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: searchParams.get('cat') ? Number(searchParams.get('cat')) : 1,
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    requesterName: currentUser?.name || '',
    requesterEmail: currentUser?.email || '',
    requesterRole: currentUser?.role === 'LECTURER' ? 'Dosen' : 'Mahasiswa',
    requesterId: currentUser?.identifier || '',
    requesterPhone: currentUser?.phone || '',
    locationBuilding: 'Gedung A',
    locationRoom: '',
  });

  // Honeypot field for anti-spam bots
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdTicket, setCreatedTicket] = useState<{ ticketNumber: string; title: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        requesterName: currentUser.name,
        requesterEmail: currentUser.email,
        requesterRole: currentUser.role === 'LECTURER' ? 'Dosen' : currentUser.role === 'STUDENT' ? 'Mahasiswa' : 'Tenaga Kependidikan',
        requesterId: currentUser.identifier || '',
        requesterPhone: currentUser.phone || '',
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Anti-spam bot trap
    if (honeypot.trim()) {
      setErrorMsg('Pengajuan terdeteksi sebagai aktivitas mencurigakan.');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.locationRoom.trim()) {
      setErrorMsg('Mohon lengkapi judul kendala, rincian keluhan, dan nomor ruangan/lab.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
        setCreatedTicket({
          ticketNumber: data.data.ticketNumber,
          title: data.data.title,
        });
      } else {
        setErrorMsg(data.message || 'Gagal membuat tiket. Silakan coba kembali.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi gangguan koneksi ke server. Pastikan jaringan stabil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTicketNumber = () => {
    if (createdTicket) {
      navigator.clipboard.writeText(createdTicket.ticketNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Formulir Layanan Mandiri BTIK UPITRA</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Pengajuan Tiket Bantuan & Kendala IT
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Sampaikan kendala teknis yang Anda alami di lingkungan kampus. Tiket akan langsung masuk ke antrean teknisi BTIK UPITRA dan terdata di server.
        </p>
      </div>

      {/* Success Modal / Banner */}
      {createdTicket ? (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-200 shadow-xl space-y-6 text-center animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">
              Tiket Keluhan Berhasil Dibuat!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Laporan Anda dengan judul <span className="font-semibold text-slate-900">“{createdTicket.title}”</span> telah terdaftar dalam sistem antrean BTIK.
            </p>
          </div>

          {/* Ticket Number Card */}
          <div className="max-w-md mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Nomor Tiket Anda (Simpan untuk Melacak)
              </span>
              <p className="font-mono text-xl sm:text-2xl font-black text-upitra-navy">
                {createdTicket.ticketNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={copyTicketNumber}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-colors shrink-0 text-slate-700"
            >
              <Copy className="w-4 h-4 text-emerald-600" />
              <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href={`/track?q=${createdTicket.ticketNumber}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-upitra-navy hover:bg-upitra-blue text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-colors"
            >
              <span>Pantau Progres Tiket Ini</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => {
                setCreatedTicket(null);
                setFormData((prev) => ({ ...prev, title: '', description: '', locationRoom: '' }));
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Buat Tiket Baru Lainnya
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-soft space-y-8">
          {/* Honeypot hidden input for bot detection */}
          <input
            type="text"
            name="upitra_verification_code"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Data Pemohon */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <UserCheck className="w-5 h-5 text-upitra-navy" />
              <h3 className="font-bold text-slate-900 text-sm">
                1. Data Identitas Pelapor (Sivitas Akademika UPITRA)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Peran Pemohon *
                </label>
                <select
                  value={formData.requesterRole}
                  onChange={(e) => setFormData({ ...formData, requesterRole: e.target.value })}
                  className="w-full text-xs rounded-xl p-2.5 border border-slate-300 bg-white focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
                >
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Dosen">Dosen</option>
                  <option value="Tenaga Kependidikan">Tenaga Kependidikan / Tendik</option>
                  <option value="Tamu / Rekanan">Tamu / Rekanan Kampus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formData.requesterName}
                  onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                  placeholder="Nama pemohon..."
                  className="w-full text-xs rounded-xl p-2.5 border border-slate-300 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  NIM / NIP / NIDN
                </label>
                <input
                  type="text"
                  value={formData.requesterId}
                  onChange={(e) => setFormData({ ...formData, requesterId: e.target.value })}
                  placeholder="Contoh: 2023010045"
                  className="w-full text-xs rounded-xl p-2.5 border border-slate-300 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Institusi UPITRA *
                </label>
                <input
                  type="email"
                  required
                  value={formData.requesterEmail}
                  onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                  placeholder="email@student.upitra.ac.id atau @upitra.ac.id"
                  className="w-full text-xs rounded-xl p-2.5 border border-slate-300 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  No. WhatsApp / HP Aktif
                </label>
                <input
                  type="text"
                  value={formData.requesterPhone}
                  onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full text-xs rounded-xl p-2.5 border border-slate-300 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Lokasi Kejadian */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building className="w-5 h-5 text-upitra-navy" />
              <h3 className="font-bold text-slate-900 text-sm">
                2. Lokasi Kendala di Kampus UPITRA
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Gedung Kampus *
                </label>
                <select
                  value={formData.locationBuilding}
                  onChange={(e) => setFormData({ ...formData, locationBuilding: e.target.value })}
                  className="w-full text-xs rounded-xl p-2.5 border border-slate-300 bg-white focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
                >
                  <option value="Gedung A">Gedung A (Perkuliahan & Lab)</option>
                  <option value="Gedung B">Gedung B (Ruang Kelas & Dosen)</option>
                  <option value="Gedung Rektorat">Gedung Rektorat & Administrasi</option>
                  <option value="Gedung Perpustakaan">Gedung Perpustakaan</option>
                  <option value="Auditorium">Auditorium Kampus</option>
                  <option value="Area Terbuka / Selasar">Area Taman / Kantin Kampus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nomor Ruangan / Nama Lab / Lantai *
                </label>
                <input
                  type="text"
                  required
                  value={formData.locationRoom}
                  onChange={(e) => setFormData({ ...formData, locationRoom: e.target.value })}
                  placeholder="Contoh: Ruang Kelas B.302 / Lab Komputer 2 (Lt 3)"
                  className="w-full text-xs rounded-xl p-2.5 border border-slate-300 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Kategori & Detail Kendala */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Tag className="w-5 h-5 text-upitra-navy" />
              <h3 className="font-bold text-slate-900 text-sm">
                3. Klasifikasi & Rincian Kendala
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kategori Layanan *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                  className="w-full text-xs rounded-xl p-2.5 border border-slate-300 bg-white focus:ring-2 focus:ring-upitra-navy focus:outline-hidden font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} (SLA: {cat.slaHours} Jam)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Tingkat Urgensi / Prioritas *</span>
                  {formData.priority === 'CRITICAL' && (
                    <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5">
                      <Flame className="w-3 h-3 text-red-600" />
                      Prioritas Tertinggi (Kelas/Ujian)
                    </span>
                  )}
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className={`w-full text-xs rounded-xl p-2.5 border focus:outline-hidden font-semibold ${
                    formData.priority === 'CRITICAL'
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <option value="LOW">Rendah (Pertanyaan umum / usulan)</option>
                  <option value="MEDIUM">Sedang (Kendala individu, tidak mendesak)</option>
                  <option value="HIGH">Tinggi (Batas waktu KRS / materi kuliah penting)</option>
                  <option value="CRITICAL">Darurat (Kuliah/Ujian sedang berlangsung di kelas)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Judul Keluhan / Ringkasan Masalah *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Proyektor ruang B.302 tidak menyala saat perkuliahan berlangsung"
                className="w-full text-xs rounded-xl p-3 border border-slate-300 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Deskripsi Lengkap Kendala & Kronologi *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Jelaskan secara detail: pesan error apa yang muncul, tindakan apa yang sudah dicoba, dan kapan kendala mulai terjadi..."
                className="w-full text-xs rounded-xl p-3 border border-slate-300 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden resize-none leading-relaxed"
              />
            </div>

            {/* Mock Attachment Upload */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-center transition-colors">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-700">
                Lampirkan Tangkapan Layar (Screenshot) / Bukti Kendala (Opsional)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Format: JPG, PNG, PDF (Maksimal 5MB)
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Dengan mengirimkan tiket, Anda menyetujui komitmen SLA dan penanganan oleh Biro TIK UPITRA.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-upitra-navy hover:from-emerald-500 hover:to-upitra-blue text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Mendaftarkan Tiket...' : 'Kirim Tiket Sekarang'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function SubmitTicketPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Memuat formulir pengajuan...</div>}>
        <SubmitTicketContent />
      </Suspense>
    </div>
  );
}

