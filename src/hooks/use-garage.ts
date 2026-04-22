"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';
import { compressImage } from '@/utils/media';
import { uploadToCloudinary } from '@/utils/cloudinary';

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
  likes_count?: number;
  is_liked?: boolean;
  stance_score?: number; // Aggiunto punteggio AI
  profiles?: {
    username?: string;
    avatar_url?: string;
    role?: string;
    is_admin?: boolean;
    license_plate_privacy?: string;
  };
}

export const useGarage = (targetUserId?: string) => {
  const queryClient = useQueryClient();

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['garage-vehicles', targetUserId],
    queryFn: async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      let uid = targetUserId;
      
      if (!uid) {
        if (!currentUser) return [];
        uid = currentUser.id;
      }

      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          profiles:user_id (id, username, license_plate_privacy),
          vehicle_likes (user_id)
        `)
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("[Garage] Errore caricamento:", error.message);
        return [];
      }
      
      if (!data) return [];
      
      return data.map((v: any) => ({
        ...v,
        images: Array.isArray(v.images) ? v.images : (v.image_url ? [v.image_url] : []),
        likes_count: v.vehicle_likes?.length || 0,
        is_liked: currentUser ? v.vehicle_likes?.some((l: any) => l.user_id === currentUser.id) : false
      })) as Vehicle[];
    }
  });

  const uploadImages = async (files: File[]) => {
    const urls: string[] = [];
    for (let file of files) {
      file = await compressImage(file);
      const publicUrl = await uploadToCloudinary(file);
      urls.push(publicUrl);
    }
    return urls;
  };

  const toggleLike = useMutation({
    mutationFn: async (vehicleId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per mettere like");

      const { data: existingLike } = await supabase
        .from('vehicle_likes')
        .select('id')
        .eq('vehicle_id', vehicleId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        await supabase.from('vehicle_likes').delete().eq('id', existingLike.id);
      } else {
        await supabase.from('vehicle_likes').insert([{ vehicle_id: vehicleId, user_id: user.id }]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garage-vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['discover-vehicles'] });
    }
  });

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
      showSuccess("Veicolo aggiunto!");
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

  // Nuova mutation per salvare il punteggio stance
  const updateStanceScore = useMutation({
    mutationFn: async ({ vehicleId, score }: { vehicleId: string, score: number }) => {
      const { error } = await supabase
        .from('vehicles')
        .update({ stance_score: score })
        .eq('id', vehicleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garage-vehicles'] });
    }
  });

  return { vehicles, isLoading, addVehicle, updateVehicle, deleteVehicle, toggleLike, updateStanceScore };
};