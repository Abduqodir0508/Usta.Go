"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  fallbackText?: string;
}

export function AvatarImage({
  src,
  alt,
  className,
  fill = false,
  width,
  height,
  fallbackText,
}: AvatarImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    const initial = (fallbackText || alt || "U").trim().charAt(0).toUpperCase();
    return (
      <div
        className={cn(
          "w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-amber-500 font-bold border border-amber-500/30 select-none",
          fill ? "absolute inset-0" : "",
          className
        )}
      >
        {initial ? (
          <span className="text-current font-semibold">{initial}</span>
        ) : (
          <User className="w-1/2 h-1/2 text-amber-500 opacity-80" />
        )}
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        onError={() => setError(true)}
        unoptimized
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      onError={() => setError(true)}
    />
  );
}
