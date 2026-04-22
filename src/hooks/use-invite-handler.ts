"use client";

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';
import { useQueryClient } from '@tanstack/react-query';

export const useInviteHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processInvite = async () => {
      const params = new URLSearchParams(location.search);
      const inviteCode = params.get('code');
      
      if (!inviteCode) return;

      setIsProcessing(true);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Salva il codice per dopo il login
          sessionStorage.setItem('pending_invite_code', inviteCode);
          showError("Accedi per partecipare a questo evento privato");
          navigate('/login');
          return;
        }

        const { data, error } = await supabase.rpc('join_by_invite_code', { p_code: inviteCode });
        
        if (error) throw error;

        // Pulisci l'URL
        const newParams = new URLSearchParams(location.search);
        newParams.delete('code');
        const newSearch = newParams.toString();
        const newUrl = location.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.replaceState({}, '', newUrl);

        if (data.type === 'meet') {
          queryClient.invalidateQueries({ queryKey: ['district-meets'] });
          showSuccess("Ti sei unito all'incontro privato!");
          navigate('/meets');
        } else if (data.type === 'carovana') {
          queryClient.invalidateQueries({ queryKey: ['carovane'] });
          showSuccess("Ti sei unito alla carovana privata!");
          navigate(`/events?carovana_id=${data.id}`);
        }
        
      } catch (err: any) {
        showError(err.message || "Codice invito non valido o scaduto");
      } finally {
        setIsProcessing(false);
      }
    };

    processInvite();
  }, [location.search, navigate, queryClient]);

  // Gestione post-login
  useEffect(() => {
    const processPendingInvite = async () => {
      const pendingCode = sessionStorage.getItem('pending_invite_code');
      if (!pendingCode) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const { data, error } = await supabase.rpc('join_by_invite_code', { p_code: pendingCode });
        if (error) throw error;

        sessionStorage.removeItem('pending_invite_code');

        if (data.type === 'meet') {
          queryClient.invalidateQueries({ queryKey: ['district-meets'] });
          showSuccess("Ti sei unito all'incontro privato!");
          navigate('/meets');
        } else if (data.type === 'carovana') {
          queryClient.invalidateQueries({ queryKey: ['carovane'] });
          showSuccess("Ti sei unito alla carovana privata!");
          navigate(`/events?carovana_id=${data.id}`);
        }
      } catch (err: any) {
        sessionStorage.removeItem('pending_invite_code');
        showError(err.message || "Codice invito non valido o scaduto");
      }
    };

    processPendingInvite();
  }, []);

  return { isProcessing };
};