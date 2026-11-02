import React from 'react';
import { Info, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 text-zinc-100 px-4 py-3 rounded-xl shadow-2xl shadow-black/50 text-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-purple-400 shrink-0" />
          )}
          <span className="flex-1 font-medium">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

