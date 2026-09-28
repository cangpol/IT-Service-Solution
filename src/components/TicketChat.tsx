'use client';

import React, { useState } from 'react';
import { TicketMessage } from '@/lib/types';
import { useRole } from '@/context/RoleContext';
import { useToast } from '@/context/ToastContext';
import { formatDateIndonesian } from '@/lib/utils';
import { Send, Lock, MessageSquare, Sparkles } from 'lucide-react';

interface TicketChatProps {
  ticketNumber: string;
  messages: TicketMessage[];
  onMessageSent: (newMessage: TicketMessage) => void;
  isTicketClosed?: boolean;
}

export default function TicketChat({
  ticketNumber,
  messages,
  onMessageSent,
  isTicketClosed = false,
}: TicketChatProps) {
  const { currentUser } = useRole();
  const { toast } = useToast();
  const [inputText, setInputText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStaffOrTech = currentUser?.role === 'TECHNICIAN' || currentUser?.role === 'ADMIN';

  const cannedResponses = [
    'Halo, laporan Anda sedang kami investigasi langsung di sistem.',
    'Teknisi BTIK sedang dalam perjalanan ke lokasi ruangan Anda.',
    'Mohon restart perangkat dan coba sambungkan kembali ke WiFi.',
    'Kendala telah diselesaikan, mohon lakukan verifikasi mandiri.',
  ];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/tickets/${ticketNumber}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: currentUser?.name || 'Pelapor Kampus',
          senderRole: isStaffOrTech ? 'Teknisi BTIK' : currentUser?.role === 'LECTURER' ? 'Dosen' : 'Pelapor',
          message: inputText.trim(),
          isInternal: isStaffOrTech ? isInternal : false,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onMessageSent(data.data);
        setInputText('');
        setIsInternal(false);
      } else {
        toast.error(data.message || 'Gagal mengirim pesan');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Terjadi kesalahan saat mengirim pesan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter internal notes if user is not technician/admin
  const visibleMessages = messages.filter((m) => {
    if (!m.isInternal) return true;
    return isStaffOrTech;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden flex flex-col h-[520px]">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
          <MessageSquare className="w-4 h-4 text-upitra-navy" />
          <span>Ruang Diskusi & Catatan Penanganan</span>
        </div>
        <span className="text-[11px] text-slate-500">
          {visibleMessages.length} pesan
        </span>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40">
        {visibleMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs">Belum ada percakapan pada tiket ini.</p>
            <p className="text-[11px] text-slate-400">Kirim pesan di bawah untuk berkomunikasi langsung dengan pelapor atau teknisi.</p>
          </div>
        ) : (
          visibleMessages.map((msg) => {
            const isMe = !!currentUser && msg.senderName.toLowerCase() === currentUser.name.toLowerCase();
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[11px] font-semibold text-slate-700">
                    {msg.senderName}
                  </span>
                  <span className="text-[10px] bg-slate-200/70 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                    {msg.senderRole}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatDateIndonesian(msg.createdAt)}
                  </span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                    msg.isInternal
                      ? 'bg-amber-50 border border-amber-200 text-amber-900'
                      : isMe
                      ? 'bg-upitra-navy text-white'
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}
                >
                  {msg.isInternal && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1 border-b border-amber-200/60 pb-0.5">
                      <Lock className="w-3 h-3" />
                      <span>Catatan Khusus Tim Internal BTIK</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Canned Responses Suggestion (for Tech / Admin) */}
      {isStaffOrTech && !isTicketClosed && (
        <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-500 font-semibold flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Template Cepat:
          </span>
          {cannedResponses.map((cr, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputText(cr)}
              className="shrink-0 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 transition-colors truncate max-w-[220px]"
              title={cr}
            >
              {cr}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      {isTicketClosed ? (
        <div className="p-3.5 bg-slate-100 text-center text-xs text-slate-500 border-t border-slate-200">
          Tiket ini telah berstatus ditutup. Percakapan telah diarsipkan.
        </div>
      ) : (
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white border-t border-slate-200 flex flex-col gap-2"
        >
          {isStaffOrTech && (
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="flex items-center gap-1 text-amber-700">
                  <Lock className="w-3.5 h-3.5" />
                  Kirim sebagai Catatan Rahasia Internal (Hanya dilihat tim BTIK)
                </span>
              </label>
            </div>
          )}

          <div className="flex gap-2">
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isInternal
                  ? 'Tulis catatan teknis internal (misal: serial number pengganti, log switch)...'
                  : 'Ketik balasan atau informasi tambahan...'
              }
              className={`flex-1 text-xs rounded-xl p-2.5 border resize-none focus:outline-hidden focus:ring-2 ${
                isInternal
                  ? 'border-amber-300 bg-amber-50/40 focus:ring-amber-400'
                  : 'border-slate-300 focus:ring-upitra-navy focus:border-upitra-navy'
              }`}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSubmitting}
              className={`px-4 rounded-xl flex items-center justify-center text-white transition-all ${
                isInternal
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-upitra-navy hover:bg-upitra-blue'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

