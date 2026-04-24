import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export const useBattles = () => {
  const { user } = useAuth();
  const [battle, setBattle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [stats, setStats] = useState({ a: 0, b: 0, total: 0 });

  const fetchBattle = async () => {
    setLoading(true);
    // Prendi la battaglia attiva più recente
    const { data: battleData } = await supabase
      .from('stance_battles')
      .select(`
        *,
        car_a:vehicles!car_a_id(*),
        car_b:vehicles!car_b_id(*)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .single();

    if (battleData) {
      setBattle(battleData);
      
      // Prendi i voti per le statistiche
      const { data: votes } = await supabase
        .from('battle_votes')
        .select('voted_for_id')
        .eq('battle_id', battleData.id);

      if (votes) {
        const a = votes.filter(v => v.voted_for_id === battleData.car_a_id).length;
        const b = votes.filter(v => v.voted_for_id === battleData.car_b_id).length;
        setStats({ a, b, total: votes.length });
      }

      // Controlla se l'utente ha già votato
      if (user) {
        const { data: myVote } = await supabase
          .from('battle_votes')
          .select('voted_for_id')
          .eq('battle_id', battleData.id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (myVote) setUserVote(myVote.voted_for_id);
      }
    }
    setLoading(false);
  };

  const castVote = async (carId: string) => {
    if (!user) {
      toast.error("Devi accedere per votare");
      return;
    }
    if (userVote) return;

    const { error } = await supabase
      .from('battle_votes')
      .insert({
        battle_id: battle.id,
        user_id: user.id,
        voted_for_id: carId
      });

    if (error) {
      toast.error("Errore durante il voto");
    } else {
      setUserVote(carId);
      fetchBattle(); // Ricarica per aggiornare le percentuali
      toast.success("Voto registrato!");
    }
  };

  useEffect(() => {
    fetchBattle();
  }, [user]);

  return { battle, loading, userVote, stats, castVote };
};