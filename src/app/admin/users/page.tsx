'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { User, UserRole } from '@/lib/types';
import { useRole } from '@/context/RoleContext';
import { useToast } from '@/context/ToastContext';
import UserModal from '@/components/admin/UserModal';
import ResetPasswordModal from '@/components/admin/ResetPasswordModal';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  KeyRound, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  RefreshCw,
  GraduationCap,
  Wrench,
  Lock,
  LogIn
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

export default function AdminUsersPage() {
  const { currentUser, isLoggedIn, isLoading: isAuthLoading, updateUserSession } = useRole();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);

  const loadUsers = useCallback(async () => {
    if (!isLoggedIn || currentUser?.role !== 'ADMIN') return;
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (selectedRole !== 'ALL') queryParams.set('role', selectedRole);
      if (selectedStatus !== 'ALL') queryParams.set('isActive', selectedStatus === 'ACTIVE' ? 'true' : 'false');
      if (searchQuery) queryParams.set('search', searchQuery);

      const res = await fetch(`/api/users?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRole, selectedStatus, searchQuery, isLoggedIn, currentUser]);

  useEffect(() => {
    if (isLoggedIn && currentUser?.role === 'ADMIN') {
      loadUsers();
    }
  }, [loadUsers, isLoggedIn, currentUser]);

  const handleToggleActive = async (user: User) => {
    const actionName = user.isActive ? 'menonaktifkan / memblokir' : 'mengaktifkan kembali';
    if (!confirm(`Apakah Anda yakin ingin ${actionName} akun ${user.name}?`)) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        if (currentUser && user.id === currentUser.id) {
          updateUserSession({ isActive: !user.isActive });
        }
        loadUsers();
        toast.success(
          `Akun ${user.name} berhasil ${user.isActive ? 'dinonaktifkan' : 'diaktifkan kembali'}.`,
          'Status Akun Diperbarui'
        );
      } else {
        toast.error(data.message || 'Gagal mengubah status keaktifan');
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghubungi server.');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Hapus akun ${user.name} secara permanen?`)) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadUsers();
        toast.success(`Akun pengguna ${user.name} telah berhasil dihapus.`, 'Pengguna Dihapus');
      } else {
        toast.error(data.message || 'Gagal menghapus pengguna');
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghubungi server.');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin BTIK', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'TECHNICIAN':
        return { label: 'Teknisi IT', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'LECTURER':
        return { label: 'Dosen', bg: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 'STAFF':
        return { label: 'Tendik / Staf', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'STUDENT':
      default:
        return { label: 'Mahasiswa', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  // Metrics
  const totalUsers = users.length;
  const studentCount = users.filter((u) => u.role === 'STUDENT').length;
  const staffLecturerCount = users.filter((u) => u.role === 'LECTURER' || u.role === 'STAFF').length;
  const techAdminCount = users.filter((u) => u.role === 'TECHNICIAN' || u.role === 'ADMIN').length;
  const suspendedCount = users.filter((u) => !u.isActive).length;

  if (isAuthLoading) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-upitra-navy" />
        <p className="text-xs text-slate-500">Memeriksa hak akses administrator...</p>
      </div>
    );
  }

  if (!isLoggedIn || currentUser?.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-20 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Akses Terbatas: Login Diperlukan</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Semua data direktori pengguna dan administrasi akun terproteksi secara ketat. Anda harus login menggunakan akun <strong>Administrator Biro TIK UPITRA</strong> untuk mengakses halaman ini.
        </p>
        <Link
          href="/login?redirect=/admin/users"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-upitra-navy hover:bg-upitra-blue text-white text-xs font-bold transition-all shadow-md"
        >
          <LogIn className="w-4 h-4" />
          <span>Masuk sebagai Administrator</span>
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
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-upitra-navy mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard Utama</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Manajemen Pengguna & Autentikasi
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Admin BTIK
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Kelola direktori akun sivitas akademika, pengaturan hak akses, reset sandi, dan penindakan akun usil.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setUserToEdit(null);
              setIsUserModalOpen(true);
            }}
            className="flex items-center gap-2 bg-upitra-navy hover:bg-upitra-blue text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pengguna Baru</span>
          </button>

          <button
            onClick={loadUsers}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Sivitas
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalUsers}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Mahasiswa
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{studentCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Dosen & Staf
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{staffLecturerCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Teknisi & Admin
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{techAdminCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Akun Ditangguhkan
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1">{suspendedCount}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, NIM, prodi..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Peran:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="rounded-xl border border-slate-300 p-2 bg-white text-slate-700 focus:outline-hidden font-medium"
            >
              <option value="ALL">Semua Peran</option>
              <option value="STUDENT">Mahasiswa</option>
              <option value="LECTURER">Dosen</option>
              <option value="STAFF">Tendik / Staf</option>
              <option value="TECHNICIAN">Teknisi BTIK</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-300 p-2 bg-white text-slate-700 focus:outline-hidden font-medium"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="SUSPENDED">Nonaktif / Terblokir</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-300" />
            <p>Memuat direktori pengguna...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">Tidak ada data pengguna yang sesuai.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Pengguna</th>
                  <th className="py-3.5 px-4">NIM / NIP</th>
                  <th className="py-3.5 px-4">Peran</th>
                  <th className="py-3.5 px-4">Prodi / Unit</th>
                  <th className="py-3.5 px-4">Status Akun</th>
                  <th className="py-3.5 px-4">Terakhir Login</th>
                  <th className="py-3.5 px-4 text-right">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const roleBadge = getRoleBadge(u.role);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Identifier */}
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {u.identifier || '-'}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-semibold border text-[11px] ${roleBadge.bg}`}>
                          {roleBadge.label}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {u.department || '-'}
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>Ditangguhkan (Spam)</span>
                          </span>
                        )}
                      </td>

                      {/* Last login */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {formatDateIndonesian(u.lastLoginAt)}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setUserToReset(u);
                              setIsResetModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Reset Kata Sandi"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Edit User */}
                          <button
                            onClick={() => {
                              setUserToEdit(u);
                              setIsUserModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-upitra-navy hover:bg-slate-100 transition-colors"
                            title="Edit Data & Peran"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Toggle Active / Suspend */}
                          <button
                            onClick={() => handleToggleActive(u)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.isActive
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.isActive ? 'Tangguhkan / Blokir Akun' : 'Aktifkan Kembali Akun'}
                          >
                            {u.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        userToEdit={userToEdit}
        onSuccess={(savedUser, isNew) => {
          loadUsers();
          if (currentUser && savedUser && savedUser.id === currentUser.id) {
            updateUserSession(savedUser);
          }
          toast.success(
            isNew
              ? `Pengguna ${savedUser.name} berhasil didaftarkan ke sistem!`
              : `Data pengguna ${savedUser.name} berhasil diperbarui!`,
            'Data Pengguna Disimpan'
          );
        }}
      />

      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        user={userToReset}
      />
    </div>
  );
}

