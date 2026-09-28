'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Star, X, ThumbsUp, Heart } from 'lucide-react';
import { Feedback } from '@/lib/types';
import { useToast } from '@/context/ToastContext';

interface CsatModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketNumber: string;
  onSuccess: (feedback: Feedback) => void;
}

export default function CsatModal({
  isOpen,
  onClose,
  ticketNumber,
  onSuccess,
}: CsatModalProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/tickets/${ticketNumber}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        toast.success('Terima kasih banyak atas ulasan dan penilaian layanan Anda!', 'Ulasan Berhasil Disimpan');
        onSuccess(data.data);
        onClose();
      } else {
        toast.error(data.message || 'Gagal menyimpan penilaian');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast.error('Terjadi kesalahan saat mengirim feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return 'Sangat Memuaskan! Solusi cepat & ramah';
      case 4:
        return 'Memuaskan, masalah terselesaikan';
      case 3:
        return 'Cukup baik, ada catatan penanganan';
      case 2:
        return 'Kurang memuaskan, respon agak lambat';
      case 1:
        return 'Sangat mengecewakan, kendala belum tuntas';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-3">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Penilaian Layanan IT UPITRA
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Tiket <span className="font-mono font-semibold text-slate-700">{ticketNumber}</span> telah diselesaikan. Bagaimana penilaian Anda terhadap respon teknisi BTIK?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Selector */}
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-hidden"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-amber-700 min-h-[1.25rem]">
              {getRatingLabel(hoverRating || rating)}
            </p>
          </div>

          {/* Comment Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan atau Masukan untuk Peningkatan Layanan (Opsional):
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Misal: Teknisi ramah dan penanganan proyektor sangat sigap sebelum kelas dimulai..."
              className="w-full text-xs rounded-xl p-3 border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-upitra-navy focus:border-upitra-navy resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Nanti Saja
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-upitra-navy text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim Penilaian'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

