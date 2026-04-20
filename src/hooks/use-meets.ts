"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';
import { uploadToCloudinary } from '@/utils/cloudinary';

export interface Meet {
  id: string;
  user_id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url?: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

export const useMeets = () => {
  const queryClient = useQueryClient();

  const { data: meets, isLoading } = useQuery({
    queryKey: ['district-meets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meets')
        .select('*, profiles:user_id(username, avatar_url)')
        .order('date', { ascending: true });

      if (error) throw error;
      return data as Meet[];
    }
  });

  const createMeet = useMutation({
    mutationFn: async (data: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per creare un meet");

      let image_url = null;
      if (data.file) {
        image_url = await uploadToCloudinary(data.file);
      }

      const { error } = await supabase
        .from('meets')
        .insert([{ 
          user_id: user.id,
          title: data.title,
          description: data.description,
          date: data.date,
          location: data.location,
          image_url
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['district-meets'] });
      showSuccess("District Meet creato!");
    },
    onError: (err: any) => showError(err.message)
  });

  const deleteMeet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('meets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['district-meets'] });
      showSuccess("Meet rimosso.");
    }
  });

  return { meets, isLoading, createMeet, deleteMeet };
};