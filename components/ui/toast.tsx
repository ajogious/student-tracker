"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg: string) => addToast(msg, "success"), [addToast]);
  const error = useCallback((msg: string) => addToast(msg, "error"), [addToast]);
  const info = useCallback((msg: string) => addToast(msg, "info"), [addToast]);

  const value = React.useMemo(
    () => ({
      toast: { success, error, info },
    }),
    [success, error, info]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Portal Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 p-4 rounded-xl border bg-background/80 backdrop-blur-md shadow-lg pointer-events-auto transition-all duration-300 animate-in slide-in-from-right-5 ${
              t.type === "success"
                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : t.type === "error"
                ? "border-destructive/30 text-destructive"
                : "border-primary/30 text-primary"
            }`}
          >
            {t.type === "success" && <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />}
            {t.type === "error" && <AlertTriangle className="size-5 shrink-0 text-destructive" />}
            {t.type === "info" && <Info className="size-5 shrink-0 text-primary" />}

            <p className="text-sm font-medium flex-1 text-foreground">{t.message}</p>

            <button
              onClick={() => removeToast(t.id)}
              className="text-muted-foreground hover:text-foreground rounded-lg p-0.5 hover:bg-muted/80 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
