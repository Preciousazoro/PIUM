"use client";

import * as React from "react";

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  return <div className="relative inline-block text-left">{children}</div>;
}

export function DropdownMenuTrigger(
  { asChild = false, children, onClick }: { asChild?: boolean; children: React.ReactNode; onClick?: () => void }
) {
  if (asChild) {
    return <div onClick={onClick}>{children}</div>;
  }
  return (
    <button onClick={onClick} className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-purple-600 text-white hover:opacity-90">
      {children}
    </button>
  );
}

export function DropdownMenuContent(
  { open, onClose, children, className = "" }: { open?: boolean; onClose?: () => void; children: React.ReactNode; className?: string }
) {
  if (open !== true) return null;
  return (
    <div className={`absolute z-20 mt-2 w-44 rounded-lg border border-border bg-background shadow-lg overflow-hidden transition-colors ${className}`}>
      <div role="menu" onClick={onClose}>{children}</div>
    </div>
  );
}

export function DropdownMenuItem(
  { onSelect, active = false, children }: { onSelect?: () => void; active?: boolean; children: React.ReactNode }
) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-4 py-2 text-sm hover:bg-muted ${active ? "text-green-400" : "text-foreground"}`}
    >
      {children}
    </button>
  );
}
