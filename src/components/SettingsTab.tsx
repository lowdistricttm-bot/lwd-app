"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { useTranslation, Language } from '@/hooks/use-translation';
import { 
  LogOut, 
  Bell, 
  Shield, 
  Smartphone, 
  Globe, 
  HelpCircle, 
  ChevronRight, 
  Trash2,
  Info,
  Loader2,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SettingsTab = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [platePrivacy, setPlatePrivacy] = useState('private');

  useEffect(() => {
    const fetchSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('push_notifications, email_notifications, license_plate_privacy')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setPushEnabled(data.push_notifications ?? true);
        setEmailEnabled(data.email_notifications ?? false);
        setPlatePrivacy(data.license_plate_privacy ?? 'private');
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const updateSetting = async (field: string, value: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (field === 'push_notifications') setPushEnabled(value);
    if (field === 'email_notifications') setEmailEnabled(value);
    if (field === 'license_plate_privacy') setPlatePrivacy(value);

    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value })
      .eq('id', user.id);

    if (error) {
      showError(t.errors?.connection || "Errore durante il salvataggio");
    } else {
      showSuccess(language === 'it' ? "Impostazione aggiornata" : "Setting updated");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'it', label: 'Italiano' },
    { code: 'en', label: 'English' },
  ];

  const privacyOptions = [
    { value: 'public', label: language === 'it' ? 'Pubblica' : 'Public', icon: Eye },
    { value: 'private', label: language === 'it' ? 'Solo Amministratori' : 'Admins Only', icon: EyeOff },
  ];

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="animate-spin text-zinc-500" />
      </div>
    );
  }

  const settingsGroups = [
    {
      title: t.settings?.notifications || "Notifiche",
      items: [
        { 
          icon: Bell, 
          label: t.settings?.notifications || "Notifiche Push", 
          desc: language === 'it' ? "Ricevi avvisi per messaggi e like" : "Receive alerts for messages and likes",
          action: (
            <Switch 
              checked={pushEnabled} 
              onCheckedChange={(val) => updateSetting('push_notifications', val)} 
            />
          )
        },
        { 
          icon: Smartphone, 
          label: t.settings?.emailNotifications || "Notifiche Email", 
          desc: language === 'it' ? "Ricevi aggiornamenti sulle selezioni" : "Receive updates on applications",
          action: (
            <Switch 
              checked={emailEnabled} 
              onCheckedChange={(val) => updateSetting('email_notifications', val)} 
            />
          )
        }
      ]
    },
    {
      title: t.settings?.account || "Account & Sicurezza",
      items: [
        { 
          icon: Globe, 
          label: t.settings?.language || "Lingua App", 
          desc: languages.find(l => l.code === language)?.label || "Italiano",
          isLanguage: true
        },
        { 
          icon: Shield, 
          label: language === 'it' ? "Privacy Targa" : "Plate Privacy", 
          desc: language === 'it' ? "Gestisci chi può vedere la tua targa" : "Manage who can see your license plate",
          isPrivacy: true
        },
        { 
          icon: Trash2, 
          label: t.settings?.deleteAccount || "Elimina Account", 
          desc: language === 'it' ? "Info sulla cancellazione dati" : "Data deletion info",
          onClick: () => alert("Contatta info@lowdistrict.it per la cancellazione."),
          action: <Info size={16} className="text-zinc-700" />
        }
      ]
    },
    {
      title: t.settings?.support || "Supporto",
      items: [
        { 
          icon: HelpCircle, 
          label: t.settings?.support || "Centro Assistenza", 
          desc: language === 'it' ? "Domande frequenti e supporto tecnico" : "FAQ and technical support",
          action: <ChevronRight size={16} className="text-zinc-700" />
        }
      ]
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <h3 className="text-xl font-black italic uppercase">{t.settings?.title || "Impostazioni"}</h3>

      <div className="space-y-10">
        {settingsGroups.map((group, i) => (
          <div key={i} className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] italic border-b border-white/5 pb-2">
              {group.title}
            </h4>
            <div className="space-y-2">
              {group.items.map((item, j) => {
                const content = (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center text-zinc-400">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase italic tracking-tight">{item.label}</p>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase">{item.desc}</p>
                    </div>
                  </div>
                );

                if (item.isLanguage) {
                  return (
                    <DropdownMenu key={j}>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full flex items-center justify-between p-4 bg-zinc-900/30 border border-white/5 transition-all cursor-pointer hover:bg-zinc-900/50 text-left">
                          {content}
                          <ChevronRight size={16} className="text-zinc-700" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 rounded-none min-w-[180px] z-[200]">
                        {languages.map((lang) => (
                          <DropdownMenuItem 
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code);
                              showSuccess(lang.code === 'it' ? "Lingua aggiornata" : "Language updated");
                            }}
                            className="text-[10px] font-black uppercase tracking-widest italic focus:bg-white focus:text-black cursor-pointer flex justify-between items-center py-3"
                          >
                            {lang.label}
                            {language === lang.code && <Check size={12} />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }

                if (item.isPrivacy) {
                  return (
                    <DropdownMenu key={j}>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full flex items-center justify-between p-4 bg-zinc-900/30 border border-white/5 transition-all cursor-pointer hover:bg-zinc-900/50 text-left">
                          {content}
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black uppercase italic text-zinc-500">
                              {privacyOptions.find(o => o.value === platePrivacy)?.label}
                            </span>
                            <ChevronRight size={16} className="text-zinc-700" />
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 rounded-none min-w-[200px] z-[200]">
                        {privacyOptions.map((opt) => (
                          <DropdownMenuItem 
                            key={opt.value}
                            onClick={() => updateSetting('license_plate_privacy', opt.value)}
                            className="text-[10px] font-black uppercase tracking-widest italic focus:bg-white focus:text-black cursor-pointer flex justify-between items-center py-4"
                          >
                            <div className="flex items-center gap-3">
                              <opt.icon size={14} />
                              {opt.label}
                            </div>
                            {platePrivacy === opt.value && <Check size={12} />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }

                return (
                  <div 
                    key={j} 
                    onClick={item.onClick}
                    className={`flex items-center justify-between p-4 bg-zinc-900/30 border border-white/5 transition-all ${item.onClick ? 'cursor-pointer hover:bg-zinc-900/50' : ''}`}
                  >
                    {content}
                    {item.action}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="pt-6">
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="w-full border-white/10 text-zinc-400 hover:bg-white hover:text-black rounded-none font-black uppercase text-[10px] tracking-widest italic h-14 transition-all"
          >
            <LogOut className="mr-2" size={14} /> {t.settings?.logout || "ESCI"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;