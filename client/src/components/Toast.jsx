import React from 'react';
import { Info, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;
  const currentToast = toasts[toasts.length - 1]; // Strictly max 1 toast at a time!

  return (
    <div className="fixed top-20 sm:bottom-6 sm:top-auto left-4 right-4 sm:left-auto sm:right-6 z-50 flex justify-center pointer-events-none">
      <div
        key={currentToast.id}
        className="pointer-events-auto flex items-center gap-2.5 bg-zinc-950/95 backdrop-blur-xl border border-white/20 text-zinc-100 px-4 py-2.5 rounded-full shadow-2xl shadow-black/80 text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-top-2 sm:slide-in-from-bottom-2 duration-200 max-w-md w-auto"
      >
        {currentToast.type === 'error' ? (
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
        ) : currentToast.type === 'success' ? (
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : (
          <Info className="w-4 h-4 text-purple-400 shrink-0" />
        )}
        <span className="truncate">{currentToast.message}</span>
      </div>
    </div>
  );
}

