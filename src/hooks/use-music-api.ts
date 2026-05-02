import { useQuery } from '@tanstack/react-query';

export const useMusicSearch = (query: string) => {
  return useQuery({
    queryKey: ['music-search', query],
    queryFn: async () => {
      // Cerchiamo un host disponibile per l'API di Audius
      const hostResponse = await fetch('https://api.audius.co');
      const hostData = await hostResponse.json();
      const host = hostData.data[0]; // Prende il primo server disponibile

      const baseUrl = `${host}/v1/tracks`;
      const url = query.length > 2 
        ? `${baseUrl}/search?query=${encodeURIComponent(query)}&app_name=LOW_DISTRICT`
        : `${baseUrl}/trending?app_name=LOW_DISTRICT`;

      const response = await fetch(url);
      const data = await response.json();
      
      return data.data.map((track: any) => ({
        id: track.id,
        title: track.title,
        artist: track.user.name,
        // URL per lo streaming audio
        audio_url: `${host}/v1/tracks/${track.id}/stream?app_name=LOW_DISTRICT`,
        // Immagine di copertina (Audius offre diverse dimensioni)
        cover_url: track.artwork?.['150x150'] || track.artwork?.['480x480'] || 'https://public.placeholder.svg',
        duration: track.duration
      }));
    },
    staleTime: 1000 * 60 * 10,
  });
};