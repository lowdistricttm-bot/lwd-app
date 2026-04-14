"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface EmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailSettingsModal = ({ isOpen, onClose }: EmailSettingsModalProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('email_templates').select('*');
    if (error) showError("Errore caricamento template");
    else setTemplates(data || []);
    setLoading(false);
  };

  const handleSave = async (type: string) => {
    const template = templates.find(t => t.type === type);
    if (!template) return;

    setSaving(true);
    const { error } = await supabase
      .from('email_templates')
      .update({ 
        subject: template.subject, 
        body: template.body,
        updated_at: new Date().toISOString()
      })
      .eq('type', type);

    if (error) showError("Errore durante il salvataggio");
    else showSuccess(`Template ${type === 'approval' ? 'Approvazione' : 'Rifiuto'} aggiornato!`);
    setSaving(false);
  };

  const updateLocalTemplate = (type: string, field: string, value: string) => {
    setTemplates(prev => prev.map(t => t.type === type ? { ...t, [field]: value } : t));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[250]" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-x-0 bottom-0 z-[251] bg-zinc-950 border-t border-white/10 p-8 rounded-t-[2rem] max-h-[90vh] overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-10 pb-12">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Configurazione Email</h2>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Personalizza i messaggi automatici per gli utenti</p>
                </div>
                <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white"><X size={24} /></button>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={14} className="text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Guida ai Segnaposto</span>
                </div>
                <p className="text-[9px] text-zinc-400 font-bold uppercase leading-relaxed">
                  Usa questi codici nel testo per inserire dati dinamici: <br />
                  <span className="text-white">{"{{user_name}}"}</span> &rarr; Nome utente <br />
                  <span className="text-white">{"{{event_title}}"}</span> &rarr; Titolo dell'evento
                </p>
              </div>

              {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>
              ) : (
                <div className="space-y-12">
                  {templates.map((template) => (
                    <div key={template.id} className="space-y-6 p-6 border border-white/5 bg-black/20">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          template.type === 'approval' ? "bg-green-500" : "bg-red-500"
                        )} />
                        <h3 className="text-sm font-black uppercase italic tracking-widest">
                          Email di {template.type === 'approval' ? 'Approvazione' : 'Rifiuto'}
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-zinc-500">Oggetto Email</Label>
                        <Input 
                          value={template.subject} 
                          onChange={e => updateLocalTemplate(template.type, 'subject', e.target.value)}
                          className="bg-transparent border-zinc-800 rounded-none h-12 text-sm font-bold"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-zinc-500">Corpo del Messaggio</Label>
                        <Textarea 
                          value={template.body} 
                          onChange={e => updateLocalTemplate(template.type, 'body', e.target.value)}
                          className="bg-transparent border-zinc-800 rounded-none min-h-[200px] text-sm leading-relaxed"
                        />
                      </div>

                      <Button 
                        onClick={() => handleSave(template.type)}
                        disabled={saving}
                        className="w-full bg-white text-black hover:bg-zinc-200 rounded-none h-12 font-black uppercase italic tracking-wider text-[10px]"
                      >
                        {saving ? <Loader2 className="animate-spin" size={14} /> : <><Save size={14} className="mr-2" /> Salva Template {template.type === 'approval' ? 'Approvazione' : 'Rifiuto'}</>}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmailSettingsModal;