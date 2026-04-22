"use client";

import { useQuery } from '@tanstack/react-query';

export interface WeatherVerdict {
  canWash: boolean;
  message: string;
  nextGoodDay?: string;
  currentCondition: string;
  city: string;
}

export const useWeather = (city?: string) => {
  return useQuery({
    queryKey: ['weather', city],
    queryFn: async (): Promise<WeatherVerdict | null> => {
      if (!city) return null;

      try {
        // 1. Geocoding della città per ottenere Lat/Lng (usando Nominatim)
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`);
        const geoData = await geoRes.json();
        
        if (!geoData[0]) throw new Error("Città non trovata");
        
        const { lat, lon } = geoData[0];

        // 2. Recupero previsioni (Open-Meteo)
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,precipitation_probability_max&timezone=auto`
        );
        const weatherData = await weatherRes.json();

        const daily = weatherData.daily;
        const todayProb = daily.precipitation_probability_max[0];
        const tomorrowProb = daily.precipitation_probability_max[1];
        
        // Analisi dei prossimi 5 giorni per trovare il primo giorno "sicuro" (prob < 20%)
        let nextGoodDayIndex = -1;
        for (let i = 1; i < 5; i++) {
          if (daily.precipitation_probability_max[i] < 20) {
            nextGoodDayIndex = i;
            break;
          }
        }

        const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
        const getDayName = (index: number) => {
          const date = new Date();
          date.setDate(date.getDate() + index);
          return days[date.getDay()];
        };

        let canWash = todayProb < 25 && tomorrowProb < 25;
        let message = "";

        if (canWash) {
          message = `Ottimo momento per il detailing! Il cielo su ${city} promette bene per le prossime 48 ore.`;
        } else if (todayProb >= 25) {
          const dayName = nextGoodDayIndex !== -1 ? getDayName(nextGoodDayIndex) : "più avanti";
          message = `Pianificando un lavaggio? Oggi a ${city} il rischio pioggia è alto (${todayProb}%). Aspetta ${dayName} per il massimo dello splendore!`;
        } else {
          const dayName = nextGoodDayIndex !== -1 ? getDayName(nextGoodDayIndex) : "più avanti";
          message = `Oggi è ok, ma domani a ${city} è prevista pioggia (${tomorrowProb}%). Ti consigliamo di rimandare a ${dayName}.`;
        }

        return {
          canWash,
          message,
          city,
          currentCondition: todayProb > 50 ? 'Rainy' : todayProb > 20 ? 'Cloudy' : 'Clear',
          nextGoodDay: nextGoodDayIndex !== -1 ? getDayName(nextGoodDayIndex) : undefined
        };
      } catch (err) {
        console.error("[Weather] Error:", err);
        return null;
      }
    },
    enabled: !!city,
    staleTime: 1000 * 60 * 30, // 30 minuti
  });
};