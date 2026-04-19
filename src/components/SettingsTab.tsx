"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from './ui/button';
import { useTranslation, Language } from '@/hooks/use-translation';
import FAQModal from './FAQModal';
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
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

const SettingsTab = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [platePrivacy, setPlatePrivacy] = useState('private');
  const [isFAQOpen, setIsFAQOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('license_plate_privacy')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setPlatePrivacy(data.license_plate_privacy ?? 'private');
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const updateSetting = async (field: string, value: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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

  const ActiveIndicator = () => (
    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
      <CheckCircle2 size={10} className="text-white" />
      <span className="text-[7px] font-black uppercase tracking-widest text-white italic">Attive</span>
    </div>
  );

  const settingsGroups = [
    {
      title: t.settings?.notifications || "Notifiche",
      items: [
        { 
          icon: Bell, 
          label: t.settings?.notifications || "Notifiche Push", 
          desc: language === 'it' ? "Avvisi in tempo reale" : "Real-time alerts",
          action: <ActiveIndicator />,
          iconBg: "bg-blue-500"
        },
        { 
          icon: Smartphone, 
          label: t.settings?.emailNotifications || "Notifiche Email", 
          desc: language === 'it' ? "Aggiornamenti ufficiali" : "Official updates",
          action: <ActiveIndicator />,
          iconBg: "bg-zinc-700"
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
          isLanguage: true,
          iconBg: "bg-indigo-500"
        },
        { 
          icon: Shield, 
          label: language === 'it' ? "Privacy Targa" : "Plate Privacy", 
          desc: language === 'it' ? "Gestisci visibilità" : "Manage visibility",
          isPrivacy: true,
          iconBg: "bg-green-600"
        },
        { 
          icon: HelpCircle, 
          label: t.settings?.support || "Centro Assistenza", 
          desc: language === 'it' ? "FAQ e Supporto Staff" : "FAQ and Staff Support",
          onClick: () => setIsFAQOpen(true),
          iconBg: "bg-amber-500"
        },
        { 
          icon: Trash2, 
          label: t.settings?.deleteAccount || "Elimina Account", 
          desc: language === 'it' ? "Info cancellazione" : "Deletion info",
          onClick: () => alert("Contatta info@lowdistrict.it per la cancellazione."),
          action: <Info size={16} className="text-zinc-600" />,
          iconBg: "bg-red-500"
        }
      ]
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <h3 className="text-xl font-black italic uppercase tracking-tighter">{t.settings?.title || "Impostazioni"}</h3>

      <div className="space-y-8">
        {settingsGroups.map((group, i) => (
          <div key={i} className="space-y-3">
            <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] italic ml-4">
              {group.title}
            </h4>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
              {group.items.map((item, j) => {
                const isLast = j === group.items.length - 1;
                const content = (
                  <div className="flex items-center gap-4">
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg", item.iconBg)}>
                      <item.icon size={16} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase italic tracking-tight text-white">{item.label}</p>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest truncate">{item.desc}</p>
                    </div>
                  </div>
                );

                const wrapperClass = cn(
                  "w-full flex items-center justify-between p-5 transition-all text-left group",
                  !isLast && "border-b border-white/5",
                  item.onClick || item.isLanguage || item.isPrivacy ? "hover:bg-white/5 cursor-pointer" : ""
                );

                if (item.isLanguage) {
                  return (
                    <DropdownMenu key={j}>
                      <DropdownMenuTrigger asChild>
                        <button className={wrapperClass}>
                          {content}
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black uppercase italic text-zinc-500">
                              {languages.find(l => l.code === language)?.label}
                            </span>
                            <ChevronRight size={14} className="text-zinc-700 group-hover:text-white transition-colors" />
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900/90 backdrop-blur-xl border-white/10 rounded-2xl min-w-[180px] z-[200] p-2">
                        {languages.map((lang) => (
                          <DropdownMenuItem 
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className="text-[10px] font-black uppercase tracking-widest italic focus:bg-white focus:text-black cursor-pointer flex justify-between items-center py-3 px-4 rounded-xl"
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
                        <button className={wrapperClass}>
                          {content}
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black uppercase italic text-zinc-500">
                              {privacyOptions.find(o => o.value === platePrivacy)?.label}
                            </span>
                            <ChevronRight size={14} className="text-zinc-700 group-hover:text-white transition-colors" />
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900/90 backdrop-blur-xl border-white/10 rounded-2xl min-w-[200px] z-[200] p-2">
                        {privacyOptions.map((opt) => (
                          <DropdownMenuItem 
                            key={opt.value}
                            onClick={() => updateSetting('license_plate_privacy', opt.value)}
                            className="text-[10px] font-black uppercase tracking-widest italic focus:bg-white focus:text-black cursor-pointer flex justify-between items-center py-4 px-4 rounded-xl"
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
                    className={wrapperClass}
                  >
                    {content}
                    {item.action || <ChevronRight size={14} className="text-zinc-700" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="pt-4">
          <Button 
            onClick={handleLogout}
            className="w-full bg-white text-black hover:bg-zinc-200 rounded-full font-black uppercase text-[10px] tracking-widest italic h-14 transition-all shadow-xl shadow-white/5"
          >
            <LogOut className="mr-2" size={14} /> {t.settings?.logout || "ESCI DAL DISTRICT"}
          </Button>
        </div>
      </div>

      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
    </div>
  );
};

export default SettingsTab;