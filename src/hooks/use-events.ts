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

export const useEvents = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return data as Event[];
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

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      showSuccess("Applicazione inviata!");
    },
    onError: (error: any) => showError(error.message)
  });

  return { events, isLoading, applyToEvent };
};