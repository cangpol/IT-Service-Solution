'use client';

import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface SpamReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketNumber: string;
  requesterEmail: string;
  actorName: string;
  onSuccess: () => void;
}

export default function SpamReportModal({
  isOpen,
  onClose,
  ticketNumber,
  requesterEmail,
  actorName,
  onSuccess,
}: SpamReportModalProps) {
  const { toast, showPopup } = useToast();
  const [reason, setReason] = useState('Laporan palsu / prank yang menyalahgunakan prioritas layanan BTIK');
  const [shouldBlockUser, setShouldBlockUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/tickets/${ticketNumber}/mark-spam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason.trim(),
          actorName,
          shouldBlockUser,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showPopup({
          type: 'warning',
          title: 'Tiket Berhasil Ditolak (Spam)',
          message: data.message || 'Tiket telah ditandai sebagai spam dan dikeluarkan dari perhitungan SLA.',
          confirmText: 'Tutup',
        });
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Gagal menandai tiket sebagai spam');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-red-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tandai Tiket Usil / Spam
            </h3>
            <p className="text-xs text-slate-500">
              Tiket: <span className="font-mono font-bold text-slate-800">{ticketNumber}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
            <p className="font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Perlindungan Mutu Layanan:
            </p>
            <p className="text-[11px] leading-relaxed text-rose-700">
              Tiket ini akan diubah statusnya menjadi <strong>REJECTED_SPAM</strong> dan <strong>dikeluarkan dari perhitungan SLA & CSAT</strong> agar performa BTIK tidak terdistorsi oleh laporan palsu.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Alasan Penolakan Tiket Usil:
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan alasan (misal: isi keluhan lelucon/prank, meminta hal di luar IT kampus)..."
              className="w-full text-xs rounded-xl p-3 border border-slate-300 focus:ring-2 focus:ring-rose-600 focus:outline-hidden resize-none"
            />
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={shouldBlockUser}
                onChange={(e) => setShouldBlockUser(e.target.checked)}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 mt-0.5"
              />
              <div className="text-[11px]">
                <span className="font-bold text-slate-800 block">
                  Blokir Akun Pelapor ({requesterEmail})
                </span>
                <span className="text-slate-500">
                  Pengguna ini tidak dapat mengajukan tiket keluhan baru sampai diaktifkan kembali oleh Admin.
                </span>
              </div>
            </label>
          </div>

          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isSubmitting ? 'Memproses...' : 'Tolak Sebagai Tiket Usil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

