"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';
import { compressImage } from '@/utils/media';

export interface Vehicle {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: string;
  license_plate: string;
  suspension_type: string;
  description: string;
  image_url?: string;
  images?: string[];
  is_main: boolean;
  created_at: string;
}

export const useGarage = (targetUserId?: string) => {
  const queryClient = useQueryClient();

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['garage-vehicles', targetUserId],
    queryFn: async () => {
      let uid = targetUserId;
      
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        uid = user.id;
      }

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map((v: any) => ({
        ...v,
        images: Array.isArray(v.images) ? v.images : (v.image_url ? [v.image_url] : [])
      })) as Vehicle[];
    }
  });

  const uploadImages = async (files: File[]) => {
    const urls: string[] = [];
    for (let file of files) {
      file = await compressImage(file);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `vehicles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(filePath);
        
      urls.push(publicUrl);
    }
    return urls;
  };

  const addVehicle = useMutation({
    mutationFn: async (newVehicle: Partial<Vehicle> & { files?: File[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per aggiungere un veicolo");

      let imageUrls: string[] = [];
      if (newVehicle.files && newVehicle.files.length > 0) {
        imageUrls = await uploadImages(newVehicle.files);
      }

      const { files, ...vehicleData } = newVehicle;
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{ 
          ...vehicleData, 
          user_id: user.id, 
          images: imageUrls,
          image_url: imageUrls[0] || null
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garage-vehicles'] });
      showSuccess("Veicolo aggiunto al garage!");
    },
    onError: (error: any) => showError(error.message)
  });

  const updateVehicle = useMutation({
    mutationFn: async (updatedVehicle: Partial<Vehicle> & { files?: File[], existingImages?: string[] }) => {
      const { id, files, existingImages, ...vehicleData } = updatedVehicle;
      
      let imageUrls = existingImages || [];
      if (files && files.length > 0) {
        const newUrls = await uploadImages(files);
        imageUrls = [...imageUrls, ...newUrls].slice(0, 6);
      }

      const { error } = await supabase
        .from('vehicles')
        .update({ 
          ...vehicleData, 
          images: imageUrls,
          image_url: imageUrls[0] || null
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garage-vehicles'] });
      showSuccess("Veicolo aggiornato!");
    },
    onError: (error: any) => showError(error.message)
  });

  const deleteVehicle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garage-vehicles'] });
      showSuccess("Veicolo rimosso.");
    }
  });

  return { vehicles, isLoading, addVehicle, updateVehicle, deleteVehicle };
};