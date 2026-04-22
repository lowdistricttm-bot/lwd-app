"use client";

import React, { useState, useEffect } from 'react';
import { useUserMarketplace, MarketplaceItem, useMarketplace, useSellerReviews, useReviewSeller } from '@/hooks/use-marketplace';
import { Loader2, Tag, Euro, Edit3, Trash2, ChevronRight, ShoppingBag, Plus, Star, MessageSquare, User, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import MarketplaceItemDetailModal from './MarketplaceItemDetailModal';
import CreateMarketplaceItemModal from './CreateMarketplaceItemModal';
import ReviewSellerModal from './ReviewSellerModal';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";

const MarketplaceTab = ({ userId, isOwnProfile }: { userId: string, isOwnProfile: boolean }) => {
  const navigate = useNavigate();
  const { data: items, isLoading: loadingItems } = useUserMarketplace(userId);
  const { data: reviews, isLoading: loadingReviews } = useSellerReviews(userId);
  const { deleteItem } = useMarketplace();
  const { deleteReview } = useReviewSeller();
  
  const [mainTab, setMainTab] = useState<'listings' | 'reviews'>('listings');
  const [statusTab, setStatusTab] = useState<'active' | 'sold'>('active');
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
  }, []);

  const activeItems = items?.filter(i => !i.status || i.status === 'active') || [];
  const soldItems = items?.filter(i => i.status === 'sold') || [];
  const displayItems = statusTab === 'active' ? activeItems : soldItems;

  const isLoading = loadingItems || loadingReviews;

  const avgRating = reviews?.length 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            size={14} 
            className={cn(
              star <= Math.round(rating) ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"
            )} 
          />
        ))}
      </div>
    );
  };

  const handleDelete = async (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo annuncio?")) {
      await deleteItem.mutateAsync(id);
      setSelectedItem(null);
    }
  };

  const handleEdit = (item: MarketplaceItem) => {
    setEditingItem(item);
    setSelectedItem(null);
    setIsCreateModalOpen(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm("Vuoi eliminare definitivamente la tua recensione?")) {
      await deleteReview.mutateAsync({ reviewId, sellerId: userId });
    }
  };

  if (isLoading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-zinc-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black italic uppercase tracking-tighter">{isOwnProfile ? "I Miei Annunci" : "Annunci"}</h3>
        {isOwnProfile && (
          <Button 
            onClick={() => { setEditingItem(null); setIsCreateModalOpen(true); }}
            className="bg-white/10 text-white border border-white/10 rounded-full h-10 px-6 font-black uppercase italic text-[10px] shadow-xl hover:bg-white/20 transition-all"
          >
            <Plus size={16} className="mr-2" /> Nuovo
          </Button>
        )}
      </div>

      <div className="flex bg-zinc-900/50 backdrop-blur-md rounded-full p-1 border border-white/5 w-full max-w-xl">
        <button 
          onClick={() => setMainTab('listings')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[10px] font-black uppercase italic transition-all",
            mainTab === 'listings' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          <Tag size={14} /> Annunci
        </button>
        <button 
          onClick={() => setMainTab('reviews')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[10px] font-black uppercase italic transition-all",
            mainTab === 'reviews' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          <Star size={14} /> Valutazioni
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mainTab === 'listings' ? (
          <motion.div key="listings" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
            <div className="flex border-b border-white/10 mb-4 max-w-xl">
              <button 
                onClick={() => setStatusTab('active')}
                className={cn("flex-1 pb-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2", statusTab === 'active' ? "text-white border-white" : "text-zinc-500 border-transparent hover:text-zinc-300")}
              >
                Attivi ({activeItems.length})
              </button>
              <button 
                onClick={() => setStatusTab('sold')}
                className={cn("flex-1 pb-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2", statusTab === 'sold' ? "text-white border-white" : "text-zinc-500 border-transparent hover:text-zinc-300")}
              >
                Venduti ({soldItems.length})
              </button>
            </div>

            {displayItems.length === 0 ? (
              <div className="bg-zinc-900/30 border border-white/5 p-12 text-center rounded-[2.5rem]">
                <ShoppingBag className="mx-auto text-zinc-800 mb-6" size={48} />
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                  {statusTab === 'active' ? "Nessun annuncio attivo." : "Nessun annuncio venduto."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayItems.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedItem(item)}
                    className={cn(
                      "bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-[2rem] group hover:border-white/20 transition-all cursor-pointer flex flex-col relative",
                      item.status === 'sold' && "opacity-70 grayscale"
                    )}
                  >
                    <div className="flex gap-5">
                      <div className="w-24 h-24 bg-zinc-950 rounded-2xl overflow-hidden shrink-0 border border-white/5 relative">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-800"><Tag size={24} /></div>
                        )}
                        {item.status === 'sold' && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="bg-red-600 text-white text-[8px] font-black uppercase px-2 py-1 italic rounded-lg shadow-lg border border-red-500 -rotate-12">
                              VENDUTO
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-black italic uppercase truncate pr-4 text-white">{item.title}</h4>
                          <span className="text-xs font-black italic text-white shrink-0">{item.price} €</span>
                        </div>
                        <p className="text-[8px] font-bold uppercase text-zinc-500 tracking-widest mb-3">
                          Categoria: {item.category}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          {isOwnProfile && (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all"><Edit3 size={14} /></button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 size={14} /></button>
                            </>
                          )}
                          <div className="ml-auto flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-white transition-colors">
                            Dettagli <ChevronRight size={12} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="reviews" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
            <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 justify-between shadow-2xl">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full border border-white/10 bg-zinc-950 flex items-center justify-center">
                  <span className="text-2xl font-black italic">{avgRating}</span>
                </div>
                <div>
                  <div className="mb-2">{renderStars(parseFloat(avgRating))}</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Basato su {reviews?.length || 0} recensioni</p>
                </div>
              </div>
              {!isOwnProfile && (
                <Button 
                  onClick={() => setIsReviewModalOpen(true)}
                  className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 h-12 font-black uppercase italic text-[10px] tracking-widest shadow-xl transition-all"
                >
                  Lascia una recensione
                </Button>
              )}
            </div>

            {reviews?.length === 0 ? (
              <div className="bg-zinc-900/20 border border-dashed border-white/5 p-12 text-center rounded-[2.5rem]">
                <MessageSquare className="mx-auto text-zinc-800 mb-6" size={40} />
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Nessuna recensione ricevuta.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews?.map((review) => {
                  const isReviewer = currentUserId === review.reviewer_id;
                  const daysSince = differenceInDays(new Date(), new Date(review.created_at));
                  const canDelete = isReviewer && daysSince <= 15;

                  return (
                    <div key={review.id} className="bg-white/5 border border-white/5 rounded-[2rem] p-6 relative group/rev">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-10 h-10 rounded-full bg-black border border-white/10 overflow-hidden cursor-pointer"
                            onClick={() => navigate(`/profile/${review.reviewer_id}`)}
                          >
                            {review.reviewer?.avatar_url ? (
                              <img src={review.reviewer.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={16} className="m-auto h-full" /></div>
                            )}
                          </div>
                          <div>
                            <p 
                              className="text-[10px] font-black uppercase italic tracking-widest cursor-pointer hover:text-zinc-300 transition-colors"
                              onClick={() => navigate(`/profile/${review.reviewer_id}`)}
                            >
                              {review.reviewer?.username}
                            </p>
                            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: it })}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {renderStars(review.rating)}
                          {canDelete && (
                            <button 
                              onClick={() => handleDeleteReview(review.id)}
                              className="flex items-center gap-1.5 text-[8px] font-black uppercase text-red-500 hover:text-red-400 transition-colors bg-red-500/10 px-2 py-1 rounded-md"
                            >
                              <Trash2 size={10} /> Elimina
                            </button>
                          )}
                          {isReviewer && !canDelete && (
                            <div className="flex items-center gap-1 text-[7px] font-bold text-zinc-600 uppercase italic">
                              <Clock size={8} /> Limite 15gg superato
                            </div>
                          )}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-xs text-zinc-300 italic leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedItem && (
        <MarketplaceItemDetailModal 
          isOpen={!!selectedItem} 
          onClose={() => setSelectedItem(null)} 
          item={selectedItem}
          isOwnItem={isOwnProfile}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <CreateMarketplaceItemModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        editItem={editingItem} 
      />

      <ReviewSellerModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        sellerId={userId} 
      />
    </div>
  );
};

export default MarketplaceTab;