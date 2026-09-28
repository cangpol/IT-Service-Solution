'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { 
  Headphones, 
  PlusCircle, 
  Search, 
  BookOpen, 
  LayoutDashboard, 
  Menu, 
  X, 
  ChevronDown, 
  ShieldCheck, 
  Wrench, 
  GraduationCap, 
  Users, 
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, isLoggedIn, logout } = useRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Standard public navigation
  const publicNavLinks = [
    { name: 'Beranda', href: '/', icon: Headphones },
    { name: 'Buat Tiket', href: '/submit', icon: PlusCircle },
    { name: 'Lacak Tiket', href: '/track', icon: Search },
    { name: 'Pusat Bantuan', href: '/kb', icon: BookOpen },
  ];

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      case 'TECHNICIAN':
        return <Wrench className="w-4 h-4 text-emerald-400" />;
      case 'LECTURER':
      case 'STUDENT':
      case 'STAFF':
      default:
        return <GraduationCap className="w-4 h-4 text-sky-300" />;
    }
  };

  const getRoleBadgeLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Admin BTIK';
      case 'TECHNICIAN':
        return 'Teknisi IT';
      case 'LECTURER':
        return 'Dosen';
      case 'STUDENT':
        return 'Mahasiswa';
      case 'STAFF':
        return 'Staf / Tendik';
      default:
        return 'Civitas';
    }
  };

  // Only show Admin Pengguna if user is ADMIN AND currently in admin / dashboard workspace (not on public home)
  const isInsideAdminArea = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');
  const showAdminTab = isLoggedIn && currentUser?.role === 'ADMIN' && isInsideAdminArea;

  return (
    <header className="sticky top-0 z-50 bg-upitra-navy text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-upitra-accent flex items-center justify-center shadow-lg shadow-emerald-900/30 font-black text-xl text-white tracking-wider border border-white/20 group-hover:scale-105 transition-transform">
              UP
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight leading-tight text-white flex items-center gap-1.5">
                BTIK UPITRA
                <span className="text-[10px] uppercase font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                  Helpdesk
                </span>
              </span>
              <span className="text-xs text-slate-300 font-normal">
                Universitas Pignatelli Triputra
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {publicNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white/15 text-white font-bold shadow-inner'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-300'}`} />
                  {link.name}
                </Link>
              );
            })}

            {/* Dashboard link (visible if logged in) */}
            {isLoggedIn && (
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  pathname === '/dashboard'
                    ? 'bg-white/15 text-white font-bold shadow-inner'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <LayoutDashboard className={`w-4 h-4 ${pathname === '/dashboard' ? 'text-emerald-400' : 'text-slate-300'}`} />
                <span>Dashboard</span>
              </Link>
            )}

            {/* Special link for Admin: User Management (ONLY when in admin/dashboard area, hidden on front page) */}
            {showAdminTab && (
              <Link
                href="/admin/users"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  pathname === '/admin/users'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-amber-300 hover:bg-amber-500/20 border border-amber-500/40'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Admin Pengguna</span>
              </Link>
            )}
          </nav>

          {/* Right Area: User Profile or Login */}
          <div className="flex items-center gap-3">
            {isLoggedIn && currentUser ? (
              /* Authenticated User Menu */
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs transition-all text-slate-200"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-[11px]">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left leading-tight">
                    <div className="font-semibold text-white truncate max-w-[130px]">
                      {currentUser.name.split(',')[0]}
                    </div>
                    <div className="text-[10px] text-emerald-400">
                      {getRoleBadgeLabel(currentUser.role)}
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2.5 border-b border-slate-800">
                      <p className="font-bold text-white text-xs truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      <div className="mt-1.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-slate-700">
                        {getRoleBadgeLabel(currentUser.role)}
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5 text-xs">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Dashboard Saya</span>
                      </Link>

                      {currentUser.role === 'ADMIN' && (
                        <Link
                          href="/admin/users"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-amber-300 hover:bg-amber-500/10 transition-colors"
                        >
                          <Users className="w-4 h-4 text-amber-400" />
                          <span>Kelola Pengguna & Auth</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 mt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Non-authenticated: Direct Login Link */
              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Portal</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {publicNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-600/30 text-emerald-300 font-semibold'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 text-slate-400" />
                {link.name}
              </Link>
            );
          })}

          {isLoggedIn && (
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              <LayoutDashboard className="w-5 h-5 text-slate-400" />
              <span>Dashboard</span>
            </Link>
          )}

          {showAdminTab && (
            <Link
              href="/admin/users"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40"
            >
              <Users className="w-5 h-5" />
              <span>Manajemen Pengguna (Admin)</span>
            </Link>
          )}

          <div className="pt-3 border-t border-slate-800">
            {isLoggedIn && currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 px-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-xs leading-tight">{currentUser.name}</p>
                    <p className="text-[11px] text-emerald-400">{getRoleBadgeLabel(currentUser.role)}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold bg-red-950/60 border border-red-800/60 text-red-300 rounded-lg hover:bg-red-900/60 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Halaman Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
