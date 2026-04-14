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

export const useEvents = () => {
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw new Error(error.message);
      return data as Event[];
    }
  });

  const uploadMedia = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('post-media')
      .upload(filePath, file);

    if (uploadError) throw new Error(uploadError.message);

    const { data: { publicUrl } } = supabase.storage
      .from('post-media')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  // --- ADMIN ACTIONS ---

  const createEvent = useMutation({
    mutationFn: async (data: Partial<Event> & { file?: File }) => {
      let image_url = data.image_url;
      if (data.file) {
        image_url = await uploadMedia(data.file, 'events');
      }

      const { file, ...eventData } = data;
      const { error } = await supabase
        .from('events')
        .insert([{ 
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          location: eventData.location,
          status: eventData.status,
          image_url: image_url 
        }]);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      showSuccess("Evento creato con successo!");
    },
    onError: (error: any) => showError(error.message || "Errore durante la creazione dell'evento")
  });

  const updateEvent = useMutation({
    mutationFn: async (data: Partial<Event> & { file?: File }) => {
      let image_url = data.image_url;
      if (data.file) {
        image_url = await uploadMedia(data.file, 'events');
      }

      const { file, id, ...eventData } = data;
      const updatePayload: any = { 
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        location: eventData.location,
        status: eventData.status
      };
      
      if (image_url !== undefined) {
        updatePayload.image_url = image_url;
      }

      const { error } = await supabase
        .from('events')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      showSuccess("Evento aggiornato!");
    },
    onError: (error: any) => showError(error.message || "Errore durante l'aggiornamento dell'evento")
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      showSuccess("Evento eliminato.");
    },
    onError: (error: any) => showError(error.message || "Errore durante l'eliminazione")
  });

  // --- USER ACTIONS ---

  const applyToEvent = useMutation({
    mutationFn: async (data: ApplicationData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per candidarti");

      let interiorUrls: string[] = [];
      if (data.interiorFiles && data.interiorFiles.length > 0) {
        for (const file of data.interiorFiles) {
          const url = await uploadMedia(file, 'interiors');
          interiorUrls.push(url);
        }
      }

      const { error } = await supabase
        .from('applications')
        .insert([{
          user_id: user.id,
          event_id: data.eventId,
          vehicle_id: data.vehicleId,
          status: 'pending',
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          city: data.city,
          instagram: data.instagram,
          modifications: data.modifications,
          interior_urls: interiorUrls
        }]);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-applications'] });
      showSuccess("Candidatura inviata!");
    },
    onError: (error: any) => showError(error.message || "Errore durante l'invio della candidatura")
  });

  const cancelApplication = useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-applications'] });
      showSuccess("Candidatura annullata.");
    },
    onError: (error: any) => showError(error.message || "Errore durante l'annullamento")
  });

  return { events, isLoading, createEvent, updateEvent, deleteEvent, applyToEvent, cancelApplication };
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
        .eq('user_id', user.id);

      if (error) return [];
      return data || [];
    }
  });
};