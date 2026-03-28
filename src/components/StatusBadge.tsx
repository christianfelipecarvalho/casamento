"use client";

import { useState, useRef, useEffect } from "react";
import { getStatusInfo, STATUS_OPTIONS } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  editable?: boolean;
  onStatusChange?: (newStatus: string) => void;
  saving?: boolean;
}

export default function StatusBadge({
  status,
  editable,
  onStatusChange,
  saving,
}: StatusBadgeProps) {
  const info = getStatusInfo(status);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!editable) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${info.color}`}
      >
        <span className={`w-2 h-2 rounded-full ${info.dot}`} />
        {info.label}
      </span>
    );
  }

  return (
    <div ref={ref} className="relative" data-edit-area>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        disabled={saving}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${info.color} ${saving ? "opacity-50" : ""}`}
      >
        <span className={`w-2 h-2 rounded-full ${info.dot}`} />
        {info.label}
        <span className="ml-0.5 text-[10px]">&#9662;</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 min-w-[140px]">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={(e) => {
                e.stopPropagation();
                if (s.value !== status) {
                  onStatusChange?.(s.value);
                }
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-gray-50 ${
                s.value === status ? "bg-gray-50" : ""
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              {s.label}
              {s.value === status && (
                <span className="ml-auto text-pink-600">&#10003;</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
