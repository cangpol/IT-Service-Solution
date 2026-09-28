'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { useRole } from '@/context/RoleContext';
import { X, UserPlus, Save, AlertCircle, ShieldCheck } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedUser: User, isNew: boolean) => void;
  userToEdit?: User | null;
}

export default function UserModal({
  isOpen,
  onClose,
  onSuccess,
  userToEdit,
}: UserModalProps) {
  const { currentUser, updateUserSession } = useRole();
  const isAdmin = currentUser?.role === 'ADMIN';
  const isEditing = !!userToEdit;
  // Email institusi dapat diedit oleh admin saja
  const canEditEmail = !isEditing || isAdmin;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT' as UserRole,
    identifier: '',
    department: '',
    phone: '',
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        password: '',
        role: userToEdit.role,
        identifier: userToEdit.identifier || '',
        department: userToEdit.department || '',
        phone: userToEdit.phone || '',
        isActive: userToEdit.isActive,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: 'upitra123',
        role: 'STUDENT',
        identifier: '',
        department: '',
        phone: '',
        isActive: true,
      });
    }
    setErrorMsg('');
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg('Nama lengkap dan email wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      const url = isEditing ? `/api/users/${userToEdit.id}` : '/api/users';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        if (currentUser && userToEdit && userToEdit.id === currentUser.id) {
          updateUserSession(data.data);
        }
        onSuccess(data.data, !isEditing);
        onClose();
      } else {
        setErrorMsg(data.message || 'Gagal menyimpan data pengguna');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan koneksi ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-upitra-navy text-white flex items-center justify-center font-bold">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Perbarui Data & Peran Pengguna' : 'Tambah Pengguna Sivitas Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              {isEditing
                ? `Mengubah akun ${userToEdit.email}`
                : 'Daftarkan akun mahasiswa, dosen, teknisi, atau staf UPITRA'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Lengkap Sivitas *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Budi Santoso, S.Kom."
              className="w-full text-xs rounded-xl p-2.5 border border-slate-300 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">
                  Email Institusi UPITRA *
                </label>
                {isAdmin && isEditing && (
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Dapat diedit oleh Admin
                  </span>
                )}
              </div>
              <input
                type="email"
                required
                disabled={!canEditEmail}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nama@student.upitra.ac.id"
                className={`w-full text-xs rounded-xl p-2.5 border focus:ring-2 focus:ring-upitra-navy focus:outline-hidden ${
                  !canEditEmail
                    ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                    : 'border-slate-300 bg-white'
                }`}
              />
              {!canEditEmail && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Email institusi hanya dapat diedit oleh Administrator Biro TIK.
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Peran / Role Akses *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full text-xs rounded-xl p-2.5 border border-slate-300 bg-white focus:ring-2 focus:ring-upitra-navy focus:outline-hidden font-medium"
              >
                <option value="STUDENT">Mahasiswa</option>
                <option value="LECTURER">Dosen</option>
                <option value="STAFF">Tenaga Kependidikan / Tendik</option>
                <option value="TECHNICIAN">Teknisi BTIK</option>
                <option value="ADMIN">Administrator BTIK</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NIM / NIP / NIDN
              </label>
              <input
                type="text"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                placeholder="2023010045"
                className="w-full text-xs rounded-xl p-2.5 border border-slate-300 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Prodi / Unit Kerja
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="S1 Informatika / Rektorat"
                className="w-full text-xs rounded-xl p-2.5 border border-slate-300 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                No. WhatsApp / Telepon
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0812-xxxx-xxxx"
                className="w-full text-xs rounded-xl p-2.5 border border-slate-300 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
              />
            </div>

            {!isEditing && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kata Sandi Awal
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="upitra123"
                  className="w-full text-xs rounded-xl p-2.5 border border-slate-300 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden font-mono"
                />
              </div>
            )}

            {isEditing && (
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl border border-slate-200 bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800 text-[11px]">
                    Akun Aktif (Dapat Login & Buat Tiket)
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-100">
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
              className="flex-1 py-2.5 rounded-xl bg-upitra-navy hover:bg-upitra-blue text-white font-bold shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Pengguna'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

