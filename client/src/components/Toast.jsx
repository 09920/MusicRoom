import React from 'react';
import { Info, CheckCircle, AlertTriangle, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-20 sm:top-auto sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 flex flex-col items-center sm:items-end gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 bg-zinc-950/95 backdrop-blur-xl border border-white/20 text-zinc-100 px-4 py-2.5 rounded-full shadow-2xl shadow-black/80 text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-top-2 sm:slide-in-from-bottom-2 duration-200 max-w-md w-full sm:w-auto shrink-0"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-purple-400 shrink-0" />
            )}
            <span className="truncate">{toast.message}</span>
          </div>
          {onDismiss && (
            <button
              onClick={() => onDismiss(toast.id)}
              className="w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors shrink-0 -mr-1"
              title="Dismiss alert"
              aria-label="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
