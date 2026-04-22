"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
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
        <Button onClick={() => navigate('/')} className="bg-white text-black rounded-full font-black uppercase italic px-8 h-12">Torna alla Home</Button>
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
    { value: 'subscriber_plus', label: 'Iscritto+' },
    { value: 'member', label: 'Membro Ufficiale' },
    { value: 'support', label: 'Supporto Staff' },
    { value: 'staff', label: 'Staff' },
    { value: 'admin', label: 'Admin' }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top)+2rem)] pb-32 px-6 max-w-7xl mx-auto w-full">
        <div className="mb-12">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 uppercase text-[10px] font-black tracking-widest transition-colors"
          >
            <ChevronLeft size={16} /> Torna alla Dashboard
          </button>
          <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Admin Control Panel</h2>
          <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase">Membri</h1>
        </div>

        <div className="relative mb-10 max-w-3xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
          <Input 
            placeholder="CERCA PER USERNAME O NOME..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-900/50 border-white/5 rounded-full h-16 pl-14 font-black uppercase text-xs tracking-widest focus-visible:ring-white/20 placeholder:text-zinc-700"
          />
        </div>

        {loadingUsers ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-zinc-500" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Caricamento database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-5 flex items-center justify-between group hover:border-white/20 transition-all rounded-[2rem]">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 bg-zinc-800 rounded-full overflow-hidden border border-white/10 shrink-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={24} /></div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black italic uppercase tracking-tight truncate">{user.username || 'Utente'}</h4>
                      {user.role === 'admin' && <ShieldCheck size={12} className="text-white shrink-0" />}
                    </div>
                    <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                      {user.first_name} {user.last_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 bg-zinc-950 border border-white/10 px-5 py-2.5 rounded-full hover:bg-white hover:text-black transition-all shadow-lg">
                        <span className="text-[9px] font-black uppercase italic tracking-widest hidden sm:inline">
                          {roles.find(r => r.value === user.role)?.label || 'Iscritto'}
                        </span>
                        <ChevronLeft size={12} className="-rotate-90" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 rounded-2xl min-w-[200px] p-2">
                      {roles.map((role) => (
                        <DropdownMenuItem 
                          key={role.value}
                          onClick={() => updateUserRole.mutate({ userId: user.id, newRole: role.value })}
                          className="text-[10px] font-black uppercase tracking-widest italic focus:bg-white focus:text-black cursor-pointer flex justify-between items-center py-4 px-4 rounded-xl"
                        >
                          {role.label}
                          {user.role === role.value && <Check size={14} />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="col-span-full text-center py-24 bg-zinc-900/20 border border-white/5 rounded-[2.5rem]">
                <Users size={48} className="mx-auto text-zinc-800 mb-4" />
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nessun utente trovato.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsers;