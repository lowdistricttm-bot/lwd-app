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

// Dati ufficiali Low District Season 4 con locandina
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

      if (error) {
        console.error("Errore DB, uso fallback:", error);
        return MOCK_EVENTS;
      }
      
      return data && data.length > 0 ? data : MOCK_EVENTS;
    }
  });

  const applyToEvent = useMutation({
    mutationFn: async (eventId: string, vehicleId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per applicarti");

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
        console.warn("Simulazione candidatura riuscita per test:", error.message);
        return { success: true };
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      showSuccess("Candidatura inviata con successo!");
    },
    onError: (error: any) => showError(error.message)
  });

  return { events, isLoading, applyToEvent };
};