"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

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
  is_main: boolean;
  created_at: string;
}

export const useGarage = () => {
  const queryClient = useQueryClient();

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['garage-vehicles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Vehicle[];
    }
  });

  const uploadVehicleImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `vehicles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('post-media') // Riutilizziamo il bucket esistente o ne usiamo uno nuovo se configurato
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('post-media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const addVehicle = useMutation({
    mutationFn: async (newVehicle: Partial<Vehicle> & { file?: File }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per aggiungere un veicolo");

      let image_url = newVehicle.image_url;
      if (newVehicle.file) {
        image_url = await uploadVehicleImage(newVehicle.file);
      }

      const { file, ...vehicleData } = newVehicle;
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{ ...vehicleData, user_id: user.id, image_url }])
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

  return { vehicles, isLoading, addVehicle, deleteVehicle };
};