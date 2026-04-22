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
        .maybeSingle();

      if (error) return null;
      return data as MysteryBox;
    }
  });

  const createOrUpdateBox = useMutation({
    mutationFn: async (boxData: Partial<MysteryBox>) => {
      // Disattiva eventuali box precedenti
      await supabase.from('mystery_boxes').update({ is_active: false }).eq('is_active', true);

      const { error } = await supabase
        .from('mystery_boxes')
        .insert([{
          ...boxData,
          remaining_quantity: boxData.total_quantity,
          is_active: true
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-mystery-box'] });
      showSuccess("Mystery Box attivata con successo!");
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

  return { activeBox, isLoading, createOrUpdateBox, purchaseBox };
};