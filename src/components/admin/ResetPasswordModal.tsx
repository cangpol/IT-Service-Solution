'use client';

import React, { useState } from 'react';
import { User } from '@/lib/types';
import { generateRandomPassword } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { X, KeyRound, Copy, Check, RefreshCw } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function ResetPasswordModal({
  isOpen,
  onClose,
  user,
}: ResetPasswordModalProps) {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState(generateRandomPassword());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !user) return null;

  const handleGenerate = () => {
    setNewPassword(generateRandomPassword());
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessResult(newPassword.trim());
        toast.success('Kata sandi pengguna berhasil diperbarui!', 'Reset Sandi Sukses');
      } else {
        toast.error(data.message || 'Gagal mereset kata sandi.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (successResult) {
      navigator.clipboard.writeText(successResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Reset Kata Sandi Pengguna
            </h3>
            <p className="text-xs text-slate-500">
              {user.name} ({user.email})
            </p>
          </div>
        </div>

        {successResult ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <span className="text-xs font-bold text-emerald-800 block">
                Kata Sandi Baru Berhasil Diterbitkan!
              </span>
              <div className="p-3 bg-white rounded-xl border border-emerald-200 font-mono text-base font-bold text-slate-900 select-all">
                {successResult}
              </div>
              <p className="text-[11px] text-slate-500">
                Berikan kata sandi ini kepada pemilik akun untuk masuk kembali ke sistem helpdesk UPITRA.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin!' : 'Salin Kata Sandi'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Selesai
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Anda dapat menggunakan kata sandi acak yang aman atau mengetik kata sandi sementara baru di bawah ini:
            </p>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700">
                  Kata Sandi Baru:
                </label>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="text-emerald-700 font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Acak Ulang</span>
                </button>
              </div>

              <input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs rounded-xl p-3 border border-slate-300 font-mono font-bold text-slate-900 bg-slate-50 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isSubmitting ? 'Memproses...' : 'Terapkan Password'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

