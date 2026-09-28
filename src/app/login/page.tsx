'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const { login } = useRole();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Mohon isi email institusi dan kata sandi Anda.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (data.success && data.data?.user) {
        login(data.data.user);
        router.push(redirectPath);
      } else {
        setErrorMsg(data.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi gangguan koneksi ke server autentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft space-y-6">
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            Email Institusi UPITRA
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@upitra.ac.id atau nama@student.upitra.ac.id"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-slate-700">
              Kata Sandi
            </label>
            <Link
              href="/kb?q=reset+password"
              className="text-[11px] text-emerald-700 hover:underline font-medium"
            >
              Lupa Sandi?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
              title={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
              className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-slate-600" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-upitra-navy hover:bg-upitra-blue text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>{isLoading ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-3 border-t border-slate-100 text-center text-slate-500 text-[11px] space-y-1">
        <p>Gunakan akun civitas akademika atau akun staf resmi UPITRA.</p>
        <p className="text-slate-400">Belum memiliki akses? Hubungi Administrator Biro TIK UPITRA.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-upitra-accent mx-auto flex items-center justify-center font-black text-2xl text-white shadow-lg">
            UP
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Masuk ke Portal BTIK UPITRA
          </h1>
          <p className="text-xs text-slate-500">
            Sistem Informasi Layanan & Tiket Kendala Universitas Pignatelli Triputra
          </p>
        </div>

        {/* Form Card */}
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat formulir login...</div>}>
          <LoginForm />
        </Suspense>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Koneksi aman terenkripsi basis data Synology NAS</span>
        </div>
      </div>
    </div>
  );
}
