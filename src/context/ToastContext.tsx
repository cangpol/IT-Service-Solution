'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

export interface PopupModalOptions {
  type?: ToastType;
  title: string;
  message: string;
  details?: string;
  confirmText?: string;
  showConfetti?: boolean;
  onConfirm?: () => void;
}

interface ToastContextType {
  // Toast notifications (floating top-right)
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    popup: (options: PopupModalOptions) => void;
  };
  // Dynamic Popup Modal
  showPopup: (options: PopupModalOptions) => void;
  closePopup: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [modalOptions, setModalOptions] = useState<PopupModalOptions | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Remove toast by ID
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Add a new toast
  const addToast = useCallback(
    (type: ToastType, message: string, title?: string, duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const defaultTitles: Record<ToastType, string> = {
        success: 'Berhasil',
        error: 'Terjadi Kesalahan',
        warning: 'Peringatan',
        info: 'Informasi',
      };

      const newToast: ToastItem = {
        id,
        type,
        title: title || defaultTitles[type],
        message,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  // Dynamic centered popup modal
  const showPopup = useCallback((options: PopupModalOptions) => {
    setModalOptions(options);
    setIsModalOpen(true);

    if (options.showConfetti || (options.type === 'success' && options.showConfetti !== false)) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.55 },
          zIndex: 10000,
        });
      } catch {}
    }
  }, []);

  const closePopup = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setModalOptions(null), 200);
  }, []);

  const handleModalConfirm = () => {
    if (modalOptions?.onConfirm) {
      modalOptions.onConfirm();
    }
    closePopup();
  };

  const toastMethods = {
    success: (message: string, title?: string) => addToast('success', message, title),
    error: (message: string, title?: string) => addToast('error', message, title),
    warning: (message: string, title?: string) => addToast('warning', message, title),
    info: (message: string, title?: string) => addToast('info', message, title),
    popup: (options: PopupModalOptions) => showPopup(options),
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods, showPopup, closePopup }}>
      {children}

      {/* Floating Toast Notification Container (Top Right) */}
      <div className="fixed top-5 right-5 z-[9998] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const styles = {
            success: {
              border: 'border-emerald-200/90',
              iconBg: 'bg-emerald-50 text-emerald-600 ring-4 ring-emerald-500/10',
              progress: 'bg-emerald-500',
              badge: 'bg-emerald-50 text-emerald-700',
              icon: CheckCircle2,
            },
            error: {
              border: 'border-rose-200/90',
              iconBg: 'bg-rose-50 text-rose-600 ring-4 ring-rose-500/10',
              progress: 'bg-rose-500',
              badge: 'bg-rose-50 text-rose-700',
              icon: AlertCircle,
            },
            warning: {
              border: 'border-amber-200/90',
              iconBg: 'bg-amber-50 text-amber-600 ring-4 ring-amber-500/10',
              progress: 'bg-amber-500',
              badge: 'bg-amber-50 text-amber-700',
              icon: AlertTriangle,
            },
            info: {
              border: 'border-sky-200/90',
              iconBg: 'bg-sky-50 text-upitra-navy ring-4 ring-sky-500/10',
              progress: 'bg-upitra-navy',
              badge: 'bg-sky-50 text-upitra-navy',
              icon: Info,
            },
          }[t.type];

          const IconComponent = styles.icon;

          return (
            <div
              key={t.id}
              className={`pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 border ${styles.border} shadow-xl shadow-slate-900/5 flex items-start gap-3.5 relative overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${styles.iconBg}`}>
                <IconComponent className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{t.title}</h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed break-words">{t.message}</p>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Progress bar countdown */}
              {t.duration && t.duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full ${styles.progress} origin-left transition-all duration-linear`}
                    style={{
                      animation: `shrinkWidth ${t.duration}ms linear forwards`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dynamic Centered Modal Popup */}
      {isModalOpen && modalOptions && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background ambient glow */}
            <div
              className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 ${
                modalOptions.type === 'error'
                  ? 'bg-rose-400'
                  : modalOptions.type === 'warning'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
            />

            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Dynamic Icon */}
            <div className="mb-5 flex justify-center">
              {modalOptions.type === 'error' ? (
                <div className="w-16 h-16 rounded-2xl bg-rose-50 border-2 border-rose-200/80 text-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/10">
                  <AlertCircle className="w-8 h-8" />
                </div>
              ) : modalOptions.type === 'warning' ? (
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200/80 text-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              ) : modalOptions.type === 'info' ? (
                <div className="w-16 h-16 rounded-2xl bg-sky-50 border-2 border-sky-200/80 text-upitra-navy flex items-center justify-center shadow-lg shadow-sky-500/10">
                  <Info className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-200/80 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-bounce duration-1000">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
              )}
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-2">{modalOptions.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">{modalOptions.message}</p>

            {modalOptions.details && (
              <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500 text-left font-mono">
                {modalOptions.details}
              </div>
            )}

            <button
              onClick={handleModalConfirm}
              className={`w-full py-3 px-5 rounded-xl font-bold text-xs text-white shadow-md transition-all ${
                modalOptions.type === 'error'
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-rose-950/20'
                  : modalOptions.type === 'warning'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-950/20'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-950/20'
              }`}
            >
              {modalOptions.confirmText || 'Selesai & Lanjutkan'}
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

