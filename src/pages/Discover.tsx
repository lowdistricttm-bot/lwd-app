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
import { Loader2, Car, Search, LayoutGrid, StretchHorizontal, User, ChevronRight, ShieldCheck, Sparkles, Users, Heart, Gauge, Calendar, CreditCard, Trophy, ArrowRight } from 'lucide-react';
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
  const { topScored, mostLiked } = useLeaderboards();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [stanceVehicle, setStanceVehicle] = useState<Vehicle | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [emblaScoreRef] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps', dragFree: true });
  const [emblaLikeRef] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps', dragFree: true });

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

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top)+2rem)] pb-32 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <header className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8">
            <div className="min-w-0 flex-1">
              <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">
                {debouncedSearch ? "Risultati Ricerca" : "District Showroom"}
              </h2>
              <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                {debouncedSearch ? `"${debouncedSearch}"` : "Esplora"}
              </h1>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input 
                  type="text"
                  placeholder="CERCA AUTO O MEMBRI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full h-14 pl-14 text-[11px] font-black uppercase tracking-widest focus:border-white/20 focus:bg-white/10 transition-all placeholder:text-zinc-700"
                />
                {isLoading && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-zinc-600" size={16} />}
              </div>

              <div className="flex bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full p-1 h-14">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "flex-1 sm:w-14 flex items-center justify-center gap-2 px-4 rounded-full transition-all duration-500", 
                    viewMode === 'grid' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white"
                  )}
                >
                  <LayoutGrid size={18} />
                  <span className="text-[9px] font-black uppercase tracking-widest sm:hidden">Griglia</span>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "flex-1 sm:w-14 flex items-center justify-center gap-2 px-4 rounded-full transition-all duration-500", 
                    viewMode === 'list' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white"
                  )}
                >
                  <StretchHorizontal size={18} />
                  <span className="text-[9px] font-black uppercase tracking-widest sm:hidden">Lista</span>
                </button>
              </div>
            </div>
          </div>
        </header>
  <DailyWinner />
        {!debouncedSearch && newMembers && newMembers.length > 0 && (
          <section className="mb-14">
            <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2 italic mb-6">
              <Sparkles size={12} /> Nuovi nel Distretto
            </h3>
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
              {newMembers.map((member, i) => (
                <button 
                  key={`new-member-${member.id}-${i}`}
                  onClick={() => navigate(`/profile/${member.id}`)}
                  className="flex flex-col items-center gap-3 shrink-0 group"
                >
                  <div className={cn(
                    "w-16 h-16 rounded-full p-[2px] border-2 transition-all duration-500",
                    isUserOnline(member.id) ? "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "border-white/10"
                  )}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-black">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-800"><User size={24} /></div>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase italic truncate w-20 text-center text-zinc-500 group-hover:text-white transition-colors">
                    {member.username}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {!debouncedSearch && topScored && topScored.length > 0 && (
          <section className="mb-14">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2 italic">
                <Trophy size={12} className="text-yellow-500" /> Top 5 Low Score
              </h3>
              <Link to="/leaderboards" className="text-[6px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                Classifica Completa <ArrowRight size={10} />
              </Link>
            </div>
            <div className="embla overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaScoreRef}>
              <div className="embla__container flex gap-4">
                {topScored.slice(0, 5).map((v, i) => (
                  <div key={`score-${v.id}-${i}`} onClick={() => handleOpenProject(v)} className="embla__slide flex-[0_0_70%] sm:flex-[0_0_40%] md:flex-[0_0_25%] min-w-0 bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden group cursor-pointer">
                    <div className="aspect-video relative overflow-hidden">
                      <img src={v.images?.[0] || v.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" alt="" />
                      <div className="absolute top-3 left-3">
                        <RankBadge rank={i + 1} type="score" />
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-black uppercase italic truncate">{v.brand} {v.model}</p>
                      <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">@{v.profiles?.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {!debouncedSearch && mostLiked && mostLiked.length > 0 && (
          <section className="mb-14">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2 italic">
                <Heart size={12} className="text-red-500" /> Top 5 Like Score
              </h3>
              <Link to="/leaderboards" className="text-[6px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                Classifica Completa <ArrowRight size={10} />
              </Link>
            </div>
            <div className="embla overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaLikeRef}>
              <div className="embla__container flex gap-4">
                {mostLiked.slice(0, 5).map((v, i) => (
                  <div key={`liked-${v.id}-${i}`} onClick={() => handleOpenProject(v)} className="embla__slide flex-[0_0_70%] sm:flex-[0_0_40%] md:flex-[0_0_25%] min-w-0 bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden group cursor-pointer">
                    <div className="aspect-video relative overflow-hidden">
                      <img src={v.images?.[0] || v.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" alt="" />
                      <div className="absolute top-3 left-3">
                        <RankBadge rank={i + 1} type="likes" />
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-black uppercase italic truncate">{v.brand} {v.model}</p>
                      <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">@{v.profiles?.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <AnimatePresence>
          {debouncedSearch && users && users.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 space-y-6"
            >
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2 italic border-b border-white/5 pb-4">
                <Users size={12} /> Membri Trovati
              </h3>
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                {users.map((user, i) => (
                  <button 
                    key={`search-user-${user.id}-${i}`}
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="flex flex-col items-center gap-3 shrink-0 group"
                  >
                    <div className={cn(
                      "w-24 h-24 rounded-full p-[3px] border-2 transition-all duration-500",
                      isUserOnline(user.id) ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "border-white/10"
                    )}>
                      <div className="w-full h-full rounded-full overflow-hidden bg-black">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={32} /></div>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-black uppercase italic truncate w-28 group-hover:text-white transition-colors">{user.username}</p>
                      {user.is_admin && <p className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Staff</p>}
                    </div>
                  </button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2 italic">
              <Car size={12} /> {debouncedSearch ? "Progetti Corrispondenti" : "Ultimi Veicoli Caricati"}
            </h3>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin text-zinc-500" size={40} />
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">Sincronizzazione Garage...</p>
            </div>
          ) : (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
            )}>
              <AnimatePresence mode="popLayout">
                {vehicles?.map((vehicle, i) => {
                  const roleLabel = getRoleLabel(vehicle.profiles?.role || 'member');
                  const isPublic = vehicle.profiles?.license_plate_privacy === 'public';
                  const isOwn = currentUserId === vehicle.user_id;
                  const canSeePlate = isOwn || canVote || isPublic;
                  const rankInfo = getVehicleRank(vehicle.id);
                  const vehicleTrophies = vehicle.user_trophies || [];
                  
                  return (
                    <motion.div 
                      key={`vehicle-${vehicle.id}-${i}`}
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
                          {rankInfo && <RankBadge rank={rankInfo.rank} type={rankInfo.type} />}
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
                                    {vehicle.year || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-zinc-500">
                                  <Gauge size={12} className="text-white" />
                                  <span className="text-[10px] font-bold uppercase tracking-widest">
                                    {vehicle.suspension_type}
                                  </span>
                                </div>
                              </div>
                              
                              {vehicle.license_plate && canSeePlate && (
                                <div className="flex items-center gap-2 bg-white text-black px-2.5 py-1 rounded-lg w-fit shadow-lg">
                                  <CreditCard size={12} />
                                  <span className="text-[10px] font-black uppercase italic tracking-widest">{vehicle.license_plate}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className={cn(
                            "flex items-center justify-between",
                            viewMode === 'list' && "md:w-72 md:pl-10"
                          )}>
                            <button 
                              onClick={() => navigate(`/profile/${vehicle.user_id}`)}
                              className="flex items-center gap-4 hover:opacity-70 transition-opacity group/user text-left min-w-0"
                            >
                              <div className={cn(
                                "w-10 h-10 bg-black rounded-full overflow-hidden border-2 transition-all duration-500",
                                isUserOnline(vehicle.user_id) ? "border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "border-white/10"
                              )}>
                                {vehicle.profiles?.avatar_url ? (
                                  <img src={vehicle.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={18} /></div>
                                )}
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-[10px] font-black uppercase italic text-zinc-300 group-hover/user:text-white transition-colors truncate">
                                    {vehicle.profiles?.username}
                                  </span>
                                  {vehicle.profiles?.is_admin && <ShieldCheck size={10} className="text-white shrink-0" />}
                                </div>
                                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest truncate">
                                  {roleLabel}
                                </span>
                              </div>
                            </button>

                            <button 
                              onClick={() => handleOpenProject(vehicle)}
                              className="md:hidden p-2 text-zinc-500 hover:text-white transition-colors bg-white/5 rounded-full"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {selectedVehicle && (
          <VehicleDetailModal 
            isOpen={!!selectedVehicle} 
            onClose={() => setSelectedVehicle(null)} 
            vehicle={selectedVehicle}
            isOwnProfile={currentUserId === selectedVehicle.user_id}
            onLike={(id) => toggleLike.mutate(id)}
            currentUserId={currentUserId}
          />
        )}
        {stanceVehicle && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStanceVehicle(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-black border border-white/10 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl">
              <StanceAnalyzer 
                imageUrl={stanceVehicle.images?.[0] || stanceVehicle.image_url || ''} 
                vehicleId={stanceVehicle.id} 
                onClose={() => setStanceVehicle(null)} 
                autoStart={true}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Discover;