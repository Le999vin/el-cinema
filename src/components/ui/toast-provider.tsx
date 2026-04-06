"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex w-[320px] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm ${
              t.type === "error"
                ? "border-red-800 bg-[color:var(--panel)] text-[color:var(--text-primary)]"
                : "border-[color:var(--accent)] bg-[color:var(--panel)] text-[color:var(--text-primary)]"
            }`}
          >
            {t.type === "error" ? (
              <AlertCircle size={16} className="shrink-0 text-red-400" />
            ) : (
              <CheckCircle size={16} className="shrink-0 text-[color:var(--accent-soft)]" />
            )}
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
