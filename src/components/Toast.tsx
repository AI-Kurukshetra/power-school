"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type ToastVariant = "error" | "success" | "info";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  toast: (item: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-slate-200 bg-white text-slate-700",
};

function createToastId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeouts = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timeout = timeouts.current.get(id);
    if (timeout) window.clearTimeout(timeout);
    timeouts.current.delete(id);
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = createToastId();
      setToasts((prev) => [...prev, { id, ...item }]);
      const timeout = window.setTimeout(() => removeToast(id), 4000);
      timeouts.current.set(id, timeout);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "surface w-[320px] rounded-xl border px-4 py-3 text-sm shadow-lg",
              variantStyles[item.variant ?? "info"]
            )}
          >
            <p className="font-semibold">{item.title}</p>
            {item.description && (
              <p className="mt-1 text-xs text-slate-600">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }
  return context;
}
