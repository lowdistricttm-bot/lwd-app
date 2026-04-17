"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { useAdmin, UserRole } from '@/hooks/use-admin';
import { 
  Loader2, 
  XCircle, 
  ChevronLeft,
  Search,
  User,
  ShieldCheck,
  Users,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminUsers = () => {
  const navigate = useNavigate();
  const { isAdmin, checkingAdmin, allUsers, loadingUsers, updateUserRole } = useAdmin();
  const [search, setSearch] = useState('');

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-zinc-500" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Verifica permessi...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <XCircle size={64} className="text-zinc-800 mb-6" />
        <h1 className="text-2xl font-black uppercase italic mb-4">Accesso Negato</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">Solo gli amministratori possono gestire i ruoli.</p>
        <Button onClick={() => navigate('/')} className="bg-white text-black rounded-none font-black uppercase italic px-8 h-12">Torna alla Home</Button>
      </div>
    );
  }

  const filteredUsers = allUsers?.filter(u => 
    u.username?.toLowerCase().includes(search.toLowerCase()) || 
    u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const roles: { value: UserRole, label: string }[] = [
    { value: 'subscriber', label: 'Iscritto' },
    { value: 'member', label: 'Membro Ufficiale' },
    { value: 'support', label: 'Supporto Staff' },
    { value: 'staff', label: 'Staff' },
    { value: 'admin', label: 'Admin' }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 px-4 md:px-6 max-w-4xl mx-auto w-full">
        <div className="mb-12">
          <button 
            onClick={() => navigate('/admin/applications')}
            className="flex items-center gap-2 text-zinc-500 hover:text-white mb-4 uppercase text-[10px] font-black tracking-widest transition-colors"
          >
            <ChevronLeft size={14} /> Torna a Selezioni
          </button>
          <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Admin Control Panel</h2>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">Gestione Membri</h1>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <Input 
            placeholder="CERCA PER USERNAME O NOME..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-900/50 border-zinc-800 rounded-none h-14 pl-12 font-black uppercase text-xs tracking-widest focus-visible:ring-white placeholder:text-zinc-700"
          />
        </div>

        {loadingUsers ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-zinc-500" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Caricamento database...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-zinc-900/40 border border-white/5 p-4 flex items-center justify-between group hover:border-white/10 transition-all">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-zinc-800 rounded-full overflow-hidden border border-white/10 shrink-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={20} /></div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black italic uppercase tracking-tight truncate">{user.username || 'Utente'}</h4>
                      {user.role === 'admin' && <ShieldCheck size={12} className="text-white" />}
                    </div>
                    <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">
                      {user.first_name} {user.last_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 bg-zinc-950 border border-white/5 px-4 py-2 hover:bg-white hover:text-black transition-all">
                        <span className="text-[9px] font-black uppercase italic tracking-widest">
                          {roles.find(r => r.value === user.role)?.label || 'Iscritto'}
                        </span>
                        <ChevronLeft size={12} className="-rotate-90" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 rounded-none min-w-[180px]">
                      {roles.map((role) => (
                        <DropdownMenuItem 
                          key={role.value}
                          onClick={() => updateUserRole.mutate({ userId: user.id, newRole: role.value })}
                          className="text-[10px] font-black uppercase tracking-widest italic focus:bg-white focus:text-black cursor-pointer flex justify-between items-center py-3"
                        >
                          {role.label}
                          {user.role === role.value && <Check size={12} />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-20 border border-white/5 bg-zinc-900/30">
                <Users size={40} className="mx-auto text-zinc-800 mb-4" />
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nessun utente trovato.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default AdminUsers;