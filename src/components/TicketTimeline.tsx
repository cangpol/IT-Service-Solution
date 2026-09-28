'use client';

import React from 'react';
import { TicketTimeline as ITimeline } from '@/lib/types';
import { formatDateIndonesian } from '@/lib/utils';
import { CheckCircle2, Clock, PlayCircle, AlertCircle, Sparkles } from 'lucide-react';

interface TicketTimelineProps {
  timelines?: ITimeline[];
}

export default function TicketTimeline({ timelines = [] }: TicketTimelineProps) {
  if (!timelines || timelines.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-400">
        Belum ada riwayat aktivitas pada tiket ini.
      </div>
    );
  }

  const getStepIcon = (statusCode: string, isLast: boolean) => {
    switch (statusCode) {
      case 'OPEN':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'IN_PROGRESS':
        return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case 'RESOLVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'CLOSED':
        return <Sparkles className="w-4 h-4 text-slate-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {timelines.map((item, index) => {
        const isLast = index === timelines.length - 1;
        return (
          <div key={item.id || index} className="relative flex flex-col gap-1 text-xs">
            {/* Step Bullet */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-xs">
              {getStepIcon(item.statusCode, isLast)}
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 text-xs">{item.title}</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {formatDateIndonesian(item.createdAt)}
              </span>
            </div>

            {item.description && (
              <p className="text-slate-600 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {item.description}
              </p>
            )}

            <span className="text-[10px] text-slate-400 font-medium">
              Oleh: <strong className="text-slate-600">{item.actorName}</strong>
            </span>
          </div>
        );
      })}
    </div>
  );
}

