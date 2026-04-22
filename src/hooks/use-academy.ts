"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';
import { uploadToCloudinary } from '@/utils/cloudinary';

export interface Tutorial {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: string;
  image_url?: string;
  video_url?: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

export const ACADEMY_CATEGORIES = [
  { id: 'mechanics', label: 'Meccanica' },
  { id: 'bodywork', label: 'Carrozzeria' },
  { id: 'wheels', label: 'Cerchi & Fitment' },
  { id: 'air-suspension', label: 'Assetti Aria' },
  { id: 'static', label: 'Assetti Statici' }
];

export const useAcademy = (categoryFilter: string = 'all') => {
  const queryClient = useQueryClient();

  const { data: tutorials = [], isLoading } = useQuery({
    queryKey: ['academy-tutorials', categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('academy_tutorials')
        .select(`
          *,
          profiles:author_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Tutorial[];
    }
  });

  const createTutorial = useMutation({
    mutationFn: async (data: { title: string, content: string, category: string, file?: File, video_url?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non autenticato");

      let image_url = null;
      if (data.file) {
        image_url = await uploadToCloudinary(data.file);
      }

      const { error } = await supabase
        .from('academy_tutorials')
        .insert([{
          author_id: user.id,
          title: data.title.toUpperCase(),
          content: data.content,
          category: data.category,
          image_url,
          video_url: data.video_url
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-tutorials'] });
      showSuccess("Tutorial pubblicato in Academy!");
    },
    onError: (err: any) => showError(err.message)
  });

  const updateTutorial = useMutation({
    mutationFn: async (data: { id: string, title: string, content: string, category: string, file?: File, video_url?: string, existingImage?: string }) => {
      let image_url = data.existingImage;
      
      if (data.file) {
        image_url = await uploadToCloudinary(data.file);
      }

      const { error } = await supabase
        .from('academy_tutorials')
        .update({
          title: data.title.toUpperCase(),
          content: data.content,
          category: data.category,
          image_url,
          video_url: data.video_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-tutorials'] });
      showSuccess("Tutorial aggiornato!");
    },
    onError: (err: any) => showError(err.message)
  });

  const deleteTutorial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('academy_tutorials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-tutorials'] });
      showSuccess("Tutorial rimosso.");
    }
  });

  return { tutorials, isLoading, createTutorial, updateTutorial, deleteTutorial };
};