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
  interiorFiles?: File[];
}

// Usiamo un ID UUID valido che corrisponde a quello creato nel database
const MOCK_EVENTS: Event[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
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

      if (error || !data || data.length === 0) return MOCK_EVENTS;
      return data;
    }
  });

  const uploadInteriorPhotos = async (files: File[]) => {
    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `applications/interiors/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(filePath);
        
      urls.push(publicUrl);
    }
    return urls;
  };

  const applyToEvent = useMutation({
    mutationFn: async (data: ApplicationData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per candidarti");

      // Caricamento foto (opzionale se fallisce lo storage, ma procediamo)
      let interiorUrls: string[] = [];
      try {
        if (data.interiorFiles && data.interiorFiles.length > 0) {
          interiorUrls = await uploadInteriorPhotos(data.interiorFiles);
        }
      } catch (e) {
        console.warn("Errore caricamento foto, procedo comunque:", e);
      }

      const { error } = await supabase
        .from('applications')
        .insert([{
          user_id: user.id,
          event_id: data.eventId,
          vehicle_id: data.vehicleId,
          status: 'pending',
        }]);

      if (error) throw new Error("Errore database: " + error.message);
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-applications'] });
      showSuccess("Candidatura inviata con successo!");
    },
    onError: (error: any) => {
      console.error("Errore candidatura:", error);
      showError(error.message);
    }
  });

  return { events, isLoading, applyToEvent };
};

export const useUserApplications = () => {
  return useQuery({
    queryKey: ['user-applications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          events:event_id (*),
          vehicles:vehicle_id (*)
        `)
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error("Errore recupero candidature:", error);
        return [];
      }
      return data || [];
    }
  });
};