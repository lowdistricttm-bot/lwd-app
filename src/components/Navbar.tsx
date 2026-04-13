"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 h-[calc(4rem+env(safe-area-inset-top))] px-6 flex items-center justify-center">
      <Link to="/" className="hover:opacity-80 transition-opacity">
        <Logo className="h-6 md:h-8" />
      </Link>
    </nav>
  );
};

export default Navbar;