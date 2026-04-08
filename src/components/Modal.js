"use client";

import { useEffect } from "react";

export default function Modal({ open, title, description, onClose, children }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(35,21,11,0.4)] p-4">
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />
      <div className="card-surface relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)]">{title}</h2>
            {description ? <p className="mt-2 text-sm text-[var(--muted)]">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="btn-secondary px-4 py-2 text-sm">
            Close
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
