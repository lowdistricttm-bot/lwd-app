"use client";

import React from 'react';
import { Instagram, Facebook, Youtube, Music2 } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/lwdstrct.crw/" },
    { icon: Facebook, href: "https://www.facebook.com/lowdistrict_crew/" },
    { icon: Youtube, href: "https://www.youtube.com/@lowdistrictcrew" },
    { icon: Music2, href: "https://www.tiktok.com/@lowdistrictcrew" }
  ];

  return (
    <footer className="bg-transparent pt-12 px-6 pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
            <a href="/" className="mb-6 block">
              <Logo className="h-8" />
            </a>
            <p className="text-gray-400 mb-8 font-bold uppercase italic text-[8px] md:text-[10px] tracking-widest whitespace-nowrap">
              Qualità, stile e passione in ogni dettaglio
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <h4 className="text-white font-bold uppercase tracking-widest mb-6 italic">Link Rapidi</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="/shop" className="hover:text-white transition-colors uppercase text-xs font-black italic">Shop Online</a></li>
              <li><a href="https://www.lowdistrict.it/eventi/" target="_blank" className="hover:text-white transition-colors uppercase text-xs font-black italic">Eventi 2025</a></li>
              <li><a href="https://www.lowdistrict.it/contatti/" target="_blank" className="hover:text-white transition-colors uppercase text-xs font-black italic">Contatti</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col justify-center items-center gap-2 text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
          <p>© 2026 LOW DISTRICT. ALL RIGHTS RESERVED. ©</p>
          <a 
            href="https://www.lowdistrict.it" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-white transition-colors tracking-[0.3em]"
          >
            www.lowdistrict.it
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;