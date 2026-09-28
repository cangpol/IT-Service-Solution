import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TicketPriority, TicketStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateIndonesian(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit yang lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam yang lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari yang lalu`;
  } catch {
    return dateStr;
  }
}

export function calculateSlaStatus(
  slaDueAt: string | null | undefined, 
  isResolved: boolean,
  isSpam: boolean = false
) {
  if (isSpam) {
    return {
      text: 'Diabaikan dari SLA (Tiket Usil)',
      isOverdue: false,
      badgeColor: 'bg-slate-900 text-slate-300 border-slate-700 font-medium',
    };
  }

  if (isResolved) {
    return {
      text: 'Selesai Tepat Waktu',
      isOverdue: false,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  if (!slaDueAt) {
    return {
      text: 'SLA Standar (24 Jam)',
      isOverdue: false,
      badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
    };
  }

  const diffMs = new Date(slaDueAt).getTime() - Date.now();
  if (diffMs <= 0) {
    const overdueHours = Math.abs(Math.floor(diffMs / (1000 * 3600)));
    return {
      text: `Terlambat ${overdueHours} jam`,
      isOverdue: true,
      badgeColor: 'bg-red-50 text-red-700 border-red-200 animate-pulse',
    };
  }

  const hoursRemaining = Math.floor(diffMs / (1000 * 3600));
  const minutesRemaining = Math.floor((diffMs % (1000 * 3600)) / (1000 * 60));

  if (hoursRemaining < 2) {
    return {
      text: `Sisa ${hoursRemaining}j ${minutesRemaining}m`,
      isOverdue: false,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-300 font-semibold',
    };
  }

  return {
    text: `Sisa ${hoursRemaining} jam`,
    isOverdue: false,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  };
}

export function getStatusBadge(status: TicketStatus) {
  switch (status) {
    case 'OPEN':
      return {
        label: 'Menunggu Antrean',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'IN_PROGRESS':
      return {
        label: 'Sedang Ditangani',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'PENDING_VENDOR':
      return {
        label: 'Menunggu Vendor / Sparepart',
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-500',
      };
    case 'RESOLVED':
      return {
        label: 'Selesai Ditangani',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'CLOSED':
      return {
        label: 'Tiket Ditutup',
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
    case 'REJECTED_SPAM':
      return {
        label: 'Tiket Usil / Ditolak (Spam)',
        bg: 'bg-rose-950 text-rose-300 border-rose-800 shadow-xs',
        dot: 'bg-rose-500',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

export function getPriorityBadge(priority: TicketPriority) {
  switch (priority) {
    case 'CRITICAL':
      return {
        label: 'Darurat (Kuliah/Ujian)',
        bg: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-600 animate-ping',
      };
    case 'HIGH':
      return {
        label: 'Tinggi',
        bg: 'bg-orange-50 text-orange-700 border-orange-200',
        dot: 'bg-orange-500',
      };
    case 'MEDIUM':
      return {
        label: 'Sedang',
        bg: 'bg-sky-50 text-sky-700 border-sky-200',
        dot: 'bg-sky-500',
      };
    case 'LOW':
      return {
        label: 'Rendah',
        bg: 'bg-slate-50 text-slate-600 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

export function generateTicketNumber(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `UPITRA-${year}-${randomDigits}`;
}

export function generateRandomPassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
  let pass = '';
  for (let i = 0; i < 10; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}
