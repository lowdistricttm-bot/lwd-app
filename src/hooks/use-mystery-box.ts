"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export interface MysteryBox {
  id: string;
  title: string;
  description: string;
  price: number;
  total_quantity: number;
  remaining_quantity: number;
  expires_at: string;
  included_product_ids: number[];
  has_golden_ticket: boolean;
  is_active: boolean;
  created_at: string;
}

export const useMysteryBox = () => {
  const queryClient = useQueryClient();

  const { data: activeBox, isLoading } = useQuery({
    queryKey: ['active-mystery-box'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mystery_boxes')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .gt('remaining_quantity', 0)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return null;
      return data as MysteryBox;
    }
  });

  const { data: allBoxes } = useQuery({
    queryKey: ['all-mystery-boxes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mystery_boxes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as MysteryBox[];
    }
  });

  const createBox = useMutation({
    mutationFn: async (boxData: Partial<MysteryBox>) => {
      // Disattiva eventuali box precedenti se la nuova è attiva
      if (boxData.is_active) {
        await supabase.from('mystery_boxes').update({ is_active: false }).eq('is_active', true);
      }

      const { error } = await supabase
        .from('mystery_boxes')
        .insert([{
          ...boxData,
          remaining_quantity: boxData.total_quantity
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-mystery-box'] });
      queryClient.invalidateQueries({ queryKey: ['all-mystery-boxes'] });
      showSuccess("Mystery Box creata!");
    },
    onError: (err: any) => showError(err.message)
  });

  const updateBox = useMutation({
    mutationFn: async (boxData: Partial<MysteryBox>) => {
      const { id, ...updateData } = boxData;
      const { error } = await supabase
        .from('mystery_boxes')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-mystery-box'] });
      queryClient.invalidateQueries({ queryKey: ['all-mystery-boxes'] });
      showSuccess("Mystery Box aggiornata!");
    },
    onError: (err: any) => showError(err.message)
  });

  const deleteBox = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('mystery_boxes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-mystery-box'] });
      queryClient.invalidateQueries({ queryKey: ['all-mystery-boxes'] });
      showSuccess("Mystery Box eliminata.");
    },
    onError: (err: any) => showError(err.message)
  });

  const purchaseBox = useMutation({
    mutationFn: async (id: string) => {
      const { data: box } = await supabase.from('mystery_boxes').select('remaining_quantity').eq('id', id).single();
      if (!box || box.remaining_quantity <= 0) throw new Error("Esaurita!");

      const { error } = await supabase
        .from('mystery_boxes')
        .update({ remaining_quantity: box.remaining_quantity - 1 })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-mystery-box'] });
    }
  });

  return { activeBox, allBoxes, isLoading, createBox, updateBox, deleteBox, purchaseBox };
};