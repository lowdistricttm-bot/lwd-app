"use client";

import React from 'react';
import { Instagram, Facebook, Youtube, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <a href="/" className="text-3xl font-black tracking-tighter text-white mb-6 block">
              LOW<span className="text-red-600">DISTRICT</span>
            </a>
            <p className="text-gray-400 max-w-sm mb-8">
              Definiamo lo standard della cultura stance in Italia. Qualità, stile e passione in ogni dettaglio.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Youtube, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6">Quick Links</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Shop All</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Upcoming Events</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gallery</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-4">Iscriviti per ricevere i drop esclusivi e news sugli eventi.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-zinc-900 border-none text-white px-4 py-3 w-full focus:ring-1 focus:ring-red-600 outline-none"
              />
              <button className="bg-red-600 text-white px-6 py-3 font-bold uppercase text-xs tracking-widest hover:bg-red-700 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs uppercase tracking-widest">
          <p>© 2024 LOW DISTRICT. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;