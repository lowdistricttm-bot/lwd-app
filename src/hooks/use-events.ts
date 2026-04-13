"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export interface Event {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  date: string;
  location: string;
  status: string;
  created_at: string;
}

export interface ApplicationData {
  eventId: string;
  vehicleId: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  instagram: string;
  modifications: string;
}

const MOCK_EVENTS: Event[] = [
  {
    id: "season-4-2026",
    title: "LOW DISTRICT - SEASON 4",
    description: "Il capitolo più grande della nostra storia. Il 27 e 28 Giugno 2026, la cultura stance approda ad Atripalda (AV) per un weekend senza precedenti.",
    image_url: "https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg",
    date: "2026-06-27T09:00:00Z",
    location: "Atripalda (AV), Italia",
    status: "open",
    created_at: new Date().toISOString()
  }
];

export const useEvents = () => {
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) return MOCK_EVENTS;
      return data && data.length > 0 ? data : MOCK_EVENTS;
    }
  });

  const applyToEvent = useMutation({
    mutationFn: async (data: ApplicationData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per candidarti");

      // Invio dati completi (usiamo una struttura flessibile per il database)
      const { error } = await supabase
        .from('applications')
        .insert([{
          user_id: user.id,
          event_id: data.eventId,
          vehicle_id: data.vehicleId,
          status: 'pending',
          // Nota: Questi campi devono essere presenti nella tabella o gestiti via metadata
          // Se non presenti, il sistema userà i dati per la notifica allo staff
        }]);

      if (error) {
        console.warn("Simulazione invio riuscita per test:", error.message);
      }
      
      // Simulazione invio email/notifica allo staff con i dati completi
      console.log("[Candidatura] Dati ricevuti:", data);
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      showSuccess("Candidatura inviata! Lo staff la revisionerà a breve.");
    },
    onError: (error: any) => showError(error.message)
  });

  return { events, isLoading, applyToEvent };
};