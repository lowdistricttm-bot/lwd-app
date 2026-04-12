"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: 'white' | 'red';
}

const Logo = ({ className, variant = 'white' }: LogoProps) => {
  // Aggiungiamo un timestamp per forzare il refresh dell'immagine se la cache è ostinata
  const logoUrl = `https://www.lowdistrict.it/wp-content/uploads/new-logo-header-2025.png?v=${Date.now()}`;

  return (
    <div className={cn("relative flex items-center", className)}>
      <img 
        src={logoUrl} 
        alt="Low District Logo" 
        className={cn(
          "h-full w-auto object-contain transition-all",
          variant === 'red' ? "brightness-100" : "brightness-0 invert"
        )}
      />
    </div>
  );
};

export default Logo;