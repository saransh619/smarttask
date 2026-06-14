"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  titleIcon?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, titleIcon, isOpen, onClose, children }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6">
      <section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
            {titleIcon}
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close modal"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
