"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export interface Tutorial {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: string;
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

const DEFAULT_TUTORIALS: Tutorial[] = [
  {
    id: 'def-1',
    author_id: 'system',
    title: 'GUIDA AL FITMENT PERFETTO',
    content: 'Il fitment è l\'anima dello stance. Per ottenere un risultato "flush", devi calcolare millimetricamente il rapporto tra canale del cerchio ed ET. In questa guida vedremo come usare i distanziali per portare il labbro del cerchio a filo del parafango senza toccare.',
    category: 'wheels',
    created_at: new Date().toISOString(),
    profiles: { username: 'Low District Staff', avatar_url: '' }
  },
  {
    id: 'def-2',
    author_id: 'system',
    title: 'MANUTENZIONE ASSETTI AD ARIA',
    content: 'Gli assetti air-ride richiedono una cura particolare, specialmente in inverno. È fondamentale spurgare regolarmente la condensa dal serbatoio per evitare che l\'umidità ghiacci nelle valvole. Controlla sempre le linee d\'aria per eventuali sfregamenti.',
    category: 'air-suspension',
    created_at: new Date().toISOString(),
    profiles: { username: 'Low District Staff', avatar_url: '' }
  },
  {
    id: 'def-3',
    author_id: 'system',
    title: 'ROLLING DEI PARAFANGHI (FENDER ROLLING)',
    content: 'Quando il fitment diventa aggressivo, lo spazio tra gomma e lamiera si riduce a zero. Il rolling consiste nel ripiegare il bordo interno del parafango per evitare tagli alla gomma. È fondamentale scaldare bene la vernice con una pistola termica per evitare che si crepi durante l\'operazione con il roller.',
    category: 'bodywork',
    created_at: new Date().toISOString(),
    profiles: { username: 'Low District Staff', avatar_url: '' }
  },
  {
    id: 'def-4',
    author_id: 'system',
    title: 'INTRODUZIONE AL CAMBER NEGATIVO',
    content: 'Il camber non è solo estetica, ma tecnica. Un angolo negativo permette di far rientrare la parte superiore della ruota all\'interno del passaruota, permettendo setup più larghi. Attenzione però: un camber eccessivo riduce l\'impronta a terra e accelera l\'usura interna degli pneumatici.',
    category: 'mechanics',
    created_at: new Date().toISOString(),
    profiles: { username: 'Low District Staff', avatar_url: '' }
  },
  {
    id: 'def-5',
    author_id: 'system',
    title: 'DETAILING: LA PREPARAZIONE PER IL SHOW',
    content: 'Un progetto stance deve brillare. La tecnica dei due secchi è la base per evitare graffi (swirls). Usa un decontaminante ferroso per i cerchi e una cera di alta qualità o un sigillante ceramico per esaltare le linee della carrozzeria sotto le luci degli eventi.',
    category: 'bodywork',
    created_at: new Date().toISOString(),
    profiles: { username: 'Low District Staff', avatar_url: '' }
  }
];

export const useAcademy = (categoryFilter: string = 'all') => {
  const queryClient = useQueryClient();

  const { data: tutorials = [], isLoading } = useQuery({
    queryKey: ['academy-tutorials', categoryFilter],
    queryFn: async () => {
      try {
        let query = supabase
          .from('academy_tutorials')
          .select(`
            *,
            profiles:author_id (
              username,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false });

        if (categoryFilter !== 'all') {
          query = query.eq('category', categoryFilter);
        }

        const { data: dbData, error } = await query;
        
        if (error) throw error;

        const formattedDbData = (dbData || []).map((t: any) => ({
          ...t,
          profiles: Array.isArray(t.profiles) ? t.profiles[0] : t.profiles
        }));

        const tutorialMap = new Map<string, Tutorial>();

        DEFAULT_TUTORIALS.forEach(t => {
          tutorialMap.set(t.title.trim().toUpperCase(), t);
        });

        formattedDbData.forEach(t => {
          tutorialMap.set(t.title.trim().toUpperCase(), t);
        });

        let combined = Array.from(tutorialMap.values());

        combined.sort((a, b) => {
          const aIsDefault = a.id.startsWith('def-');
          const bIsDefault = b.id.startsWith('def-');
          if (aIsDefault && !bIsDefault) return 1;
          if (!aIsDefault && bIsDefault) return -1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        if (categoryFilter !== 'all') {
          return combined.filter(t => t.category === categoryFilter);
        }

        return combined;
      } catch (err) {
        console.error("[Academy] Errore caricamento:", err);
        return DEFAULT_TUTORIALS;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 1
  });

  const createTutorial = useMutation({
    mutationFn: async (data: { title: string, content: string, category: string, video_url?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non autenticato");

      const { error } = await supabase
        .from('academy_tutorials')
        .insert([{
          author_id: user.id,
          title: data.title.toUpperCase(),
          content: data.content,
          category: data.category,
          video_url: data.video_url
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-tutorials'] });
      showSuccess("Tutorial pubblicato in Low Academy!");
    },
    onError: (err: any) => showError(err.message)
  });

  const updateTutorial = useMutation({
    mutationFn: async (data: { id: string, title: string, content: string, category: string, video_url?: string }) => {
      const { error } = await supabase
        .from('academy_tutorials')
        .update({
          title: data.title.toUpperCase(),
          content: data.content,
          category: data.category,
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