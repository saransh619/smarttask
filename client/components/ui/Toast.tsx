"use client";

import { CheckCircle2, XCircle } from "lucide-react";

export type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

export function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null;

  const Icon = toast.type === "success" ? CheckCircle2 : XCircle;

  return (
    <div className="fixed right-4 top-4 z-50 flex max-w-sm items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-xl">
      <Icon
        className={toast.type === "success" ? "h-5 w-5 text-emerald-600" : "h-5 w-5 text-rose-600"}
      />
      <span>{toast.message}</span>
    </div>
  );
}
