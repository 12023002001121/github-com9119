import React from 'react';
import { SorobanEvent } from '../types';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface ToastProps {
  event: SorobanEvent | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ event, onClose }) => {
  if (!event) return null;

  const getIcon = () => {
    switch (event.type) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'disputed':
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-[#161822] border border-indigo-500/40 rounded-xl p-4 shadow-2xl flex items-start space-x-3 transition transform animate-in slide-in-from-bottom-5">
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Soroban Event: {event.type}
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-slate-200 mt-1 leading-snug">{event.details}</p>
        <span className="text-[10px] text-slate-500 mt-1 block font-mono">
          Milestone #{event.milestoneId} • {new Date(event.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};
