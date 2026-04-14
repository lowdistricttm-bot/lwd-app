"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { 
  LogOut, 
  Bell, 
  Shield, 
  Smartphone, 
  Globe, 
  HelpCircle, 
  ChevronRight, 
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const SettingsTab = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    if (confirm("ATTENZIONE: Questa azione è irreversibile. Tutti i tuoi dati, veicoli e post verranno eliminati permanentemente. Procedere?")) {
      showError("Contatta il supporto per l'eliminazione definitiva dell'account.");
    }
  };

  const settingsGroups = [
    {
      title: "Notifiche",
      items: [
        { 
          icon: Bell, 
          label: "Notifiche Push", 
          desc: "Ricevi avvisi per messaggi e like",
          action: <Switch checked={notifications} onCheckedChange={setNotifications} />
        },
        { 
          icon: Smartphone, 
          label: "Notifiche Email", 
          desc: "Ricevi aggiornamenti sulle selezioni",
          action: <Switch checked={marketing} onCheckedChange={setMarketing} />
        }
      ]
    },
    {
      title: "Account & Sicurezza",
      items: [
        { 
          icon: Shield, 
          label: "Privacy Profilo", 
          desc: "Gestisci chi può vedere il tuo garage",
          action: <ChevronRight size={16} className="text-zinc-700" />
        },
        { 
          icon: Globe, 
          label: "Lingua App", 
          desc: "Italiano (Predefinito)",
          action: <ChevronRight size={16} className="text-zinc-700" />
        }
      ]
    },
    {
      title: "Supporto",
      items: [
        { 
          icon: HelpCircle, 
          label: "Centro Assistenza", 
          desc: "Domande frequenti e supporto tecnico",
          action: <ChevronRight size={16} className="text-zinc-700" />
        }
      ]
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <h3 className="text-xl font-black italic uppercase">Impostazioni</h3>

      <div className="space-y-10">
        {settingsGroups.map((group, i) => (
          <div key={i} className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] italic border-b border-white/5 pb-2">
              {group.title}
            </h4>
            <div className="space-y-2">
              {group.items.map((item, j) => (
                <div key={j} className="flex items-center justify-between p-4 bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center text-zinc-400">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase italic tracking-tight">{item.label}</p>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase">{item.desc}</p>
                    </div>
                  </div>
                  {item.action}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="space-y-4 pt-6">
          <h4 className="text-[10px] font-black uppercase text-red-900 tracking-[0.3em] italic border-b border-red-900/20 pb-2">
            Zona Pericolo
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="w-full border-white/10 text-zinc-400 hover:bg-white hover:text-black rounded-none font-black uppercase text-[10px] tracking-widest italic h-14"
            >
              <LogOut className="mr-2" size={14} /> Logout Sessione
            </Button>
            <Button 
              onClick={handleDeleteAccount}
              variant="outline" 
              className="w-full border-red-900/20 text-red-900 hover:bg-red-900 hover:text-white rounded-none font-black uppercase text-[10px] tracking-widest italic h-14"
            >
              <Trash2 className="mr-2" size={14} /> Elimina Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;