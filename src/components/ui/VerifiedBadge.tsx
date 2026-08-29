import React from "react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  title?: string;
}

export function VerifiedBadge({ className = "w-4 h-4", title = "Tasdiqlangan PRO Usta" }: VerifiedBadgeProps) {
  return (
    <svg
      className={cn("text-blue-500 shrink-0 inline-block fill-blue-500/20", className)}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <title>{title}</title>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}
