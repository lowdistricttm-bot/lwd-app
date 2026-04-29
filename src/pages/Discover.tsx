"use client";
import DailyWinner from '@/components/DailyWinner';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useDiscover } from '@/hooks/use-discover';
import { useGarage, Vehicle } from '@/hooks/use-garage';
import { useAdmin } from '@/hooks/use-admin';
import { usePresence } from '@/hooks/use-presence';
import { useLeaderboards } from '@/hooks/use-leaderboards';
import { 
  Loader2, Car, Search, LayoutGrid, StretchHorizontal, User, 
  ChevronRight, ShieldCheck, Sparkles, Users, Heart, Gauge, 
  Calendar, CreditCard, Trophy, ArrowRight, Star 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import VehicleDetailModal from '@/components/VehicleDetailModal';
import StanceAnalyzer from '@/components/StanceAnalyzer';
import RankBadge from '@/components/RankBadge';
import TrophyBadge from '@/components/TrophyBadge';
import { useTranslation } from '@/hooks/use-translation';
import { supabase } from "@/integrations/supabase/client";
import useEmblaCarousel from 'embla-carousel-react';

const Discover = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { canVote } = useAdmin();
  const { isUserOnline } = usePresence();
  const { topScored, mostLiked, topReputation, isLoading: leaderboardsLoading } = useLeaderboards();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [stanceVehicle, setStanceVehicle] = useState<Vehicle | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [emblaScoreRef] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps', dragFree: true });
  const [emblaLikeRef] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps', dragFree: true });
  const [emblaRepRef] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps', dragFree: true });

  const stanceId = searchParams.get('stance_id');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
  }, []);

  useEffect(() => {
    if (stanceId) {
      const fetchStanceVehicle = async () => {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', stanceId)
          .maybeSingle();
        
        if (data && !error) {
          setStanceVehicle(data as Vehicle);
        }
        
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('stance_id');
        setSearchParams(newParams, { replace: true });
      };
      fetchStanceVehicle();
    }
  }, [stanceId, searchParams, setSearchParams]);

  const { vehicles, users, newMembers, isLoading } = useDiscover(debouncedSearch);
  const { toggleLike } = useGarage();

  const getRoleLabel = (role: string) => {
    return t.profile.roles[role] || t.profile.roles.member;
  };

  const handleOpenProject = (vehicle: any) => {
    setSelectedVehicle(vehicle as Vehicle);
  };

  const getVehicleRank = (id: string) => {
    const scoreRank = topScored?.findIndex(v => v.id === id);
    if (scoreRank !== undefined && scoreRank !== -1 && scoreRank < 3) return { rank: scoreRank + 1, type: 'score' as const };
    
    const likeRank = mostLiked?.findIndex(v => v.id === id);
    if (likeRank !== undefined && likeRank !== -1 && likeRank < 3) return { rank: likeRank + 1, type: 'likes' as const };
    
    return null;
  };

  // Funzione helper per renderizzare la scheda veicolo (Griglia o Lista)
  const renderVehicleCard = (vehicle: any, i: number, customRank?: { rank: number, type: 'score' | 'likes' | 'rep' }) => {
    const roleLabel = getRoleLabel(vehicle.profiles?.role || 'member');
    const isPublic = vehicle.profiles?.license_plate_privacy === 'public';
    const isOwn = currentUserId === vehicle.user_id;
    const canSeePlate = isOwn || canVote || isPublic;
    const rankInfo = customRank || getVehicleRank(vehicle.id);
    const vehicleTrophies = vehicle.user_trophies || [];
    
    return (
      <motion.div 
        key={`${customRank?.type || 'main'}-${vehicle.id}-${i}`}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className={cn(
          "bg-white/5 backdrop-blur-2xl border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-500 rounded-[2.5rem]",
          viewMode === 'list' && "flex flex-col md:flex-row items-stretch md:h-56"
        )}
      >
        <div 
          className={cn(
            "bg-black relative overflow-hidden cursor-pointer shrink-0",
            viewMode === 'grid' ? "aspect-[4/5]" : "aspect-video md:w-80"
          )}
          onClick={() => handleOpenProject(vehicle)}
        >
          {vehicle.images?.[0] ? (
            <img 
              src={vehicle.images[0]} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" 
              alt={vehicle.model} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-800"><Car size={48} /></div>
          )}
          
          <div className="absolute top-5 left-5 flex flex-col gap-2">
            {rankInfo && <RankBadge rank={rankInfo.rank} type={rankInfo.type as any} />}
            {vehicleTrophies.length > 0 && (
              <div className="flex gap-1.5">
                {vehicleTrophies.map((ut: any) => (
                  <TrophyBadge key={`trophy-${ut.id}`} trophy={ut.trophies} size="xs" />
                ))}
              </div>
            )}
            <span className="bg-white/90 backdrop-blur-md text-black text-[8px] font-black uppercase px-3 py-1.5 italic rounded-full shadow-2xl w-fit">
              {vehicle.suspension_type}
            </span>
            {vehicle.stance_score && (
              <span className="bg-black/60 backdrop-blur-md text-white text-[8px] font-black uppercase px-3 py-1.5 italic rounded-full border border-white/10 flex items-center gap-1.5 w-fit">
                <Sparkles size={10} /> 
                {viewMode === 'list' ? `LOW SCORE: ${vehicle.stance_score}` : vehicle.stance_score}
              </span>
            )}
          </div>

          <div className="absolute bottom-5 right-5">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleLike.mutate(vehicle.id); }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 backdrop-blur-md border rounded-full transition-all",
                vehicle.is_liked ? "bg-red-500 border-red-500 text-white" : "bg-black/40 border-white/10 text-white hover:bg-white/20"
              )}
            >
              <Heart size={12} fill={vehicle.is_liked ? "currentColor" : "none"} />
              <span className="text-[9px] font-black">{vehicle.likes_count || 0}</span>
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col justify-between flex-1 min-w-0">
          <div className={cn(
            "flex flex-col gap-6",
            viewMode === 'list' && "md:flex-row md:items-center md:justify-between h-full"
          )}>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-3 mb-2 overflow-hidden">
                <h4 className="text-lg md:text-2xl font-black italic uppercase tracking-tight truncate leading-none">
                  {vehicle.brand}
                </h4>
                <span className="text-[10px] md:text-xs font-black uppercase text-zinc-500 italic truncate">
                  {vehicle.model}
                </span>
              </div>
              
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Calendar size={12} className="text-white" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {vehicle.year || 'N