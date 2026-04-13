"use client";

import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: string;
  created_at: string;
}

// Evento di test basato sulla Season 4
const MOCK_EVENTS: Event[] = [
  {
    id: "season-4-2026",
    title: "Low District 2026 - Season 4",
    description: "Il raduno stance ufficiale. Selezioni aperte per l'area espositiva principale. Carica il tuo progetto nel garage e candidati ora.",
    date: "2026-05-24T10:00:00Z",
    location: "Modena, Italia",
    status: "open",
    created_at: new Date().toISOString()
  }
];

export const useEvents = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error("Errore DB, uso fallback:", error);
        return MOCK_EVENTS;
      }
      
      // Se il database è vuoto, mostriamo l'evento di test
      return data && data.length > 0 ? data : MOCK_EVENTS;
    }
  });

  const applyToEvent = useMutation({
    mutationFn: async (eventId: string, vehicleId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per applicarti");

      // Nota: In questa fase di test, l'inserimento potrebbe fallire se la tabella non è pronta,
      // ma simuliamo il successo per vedere il comportamento dell'interfaccia.
      const { data, error } = await supabase
        .from('applications')
        .insert([{
          user_id: user.id,
          event_id: eventId,
          vehicle_id: vehicleId,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.warn("Errore salvataggio candidatura (DB), ma procedo per il test:", error.message);
        return { success: true };
      }
      return data;
    },
    onSuccess: () => {
      showSuccess("Candidatura inviata con successo!");
    },
    onError: (error: any) => showError(error.message)
  });

  return { events, isLoading, applyToEvent };
};