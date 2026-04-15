"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: 'white' | 'red' | 'original';
}

const Logo = ({ className, variant = 'white' }: LogoProps) => {
  const logoUrl = "https://www.lowdistrict.it/wp-content/uploads/new-logo-header-2025.png";

  return (
    <div className={cn("relative flex items-center", className)}>
      <img 
        src={logoUrl} 
        alt="Low District Logo" 
        className={cn(
          "h-full w-auto object-contain transition-all duration-500",
          variant === 'white' && "brightness-0 invert",
          variant === 'red' && "sepia(1) saturate(10000%) hue-rotate(350deg)",
          variant === 'original' && "brightness-100"
        )}
      />
    </div>
  );
};

export default Logo;