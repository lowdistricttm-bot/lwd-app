"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import GarageTab from '@/components/GarageTab';
import ApplicationsTab from '@/components/ApplicationsTab';
import FeedPost from '@/components/FeedPost';
import CreatePostModal from '@/components/CreatePostModal';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { 
  User, 
  Settings, 
  LogOut, 
  Car, 
  MessageSquare, 
  ShoppingBag, 
  Loader2,
  Camera,
  ShieldCheck,
  ClipboardCheck,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useWcUserOrders } from '@/hooks/use-woocommerce';
import { showSuccess, showError } from '@/utils/toast';

const DEFAULT_COVER = "https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg";

const Profile = () => {
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [activeTab, setActiveTab] = useState('activity');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const { posts, isLoading: loadingPosts } = useSocialFeed();
  const { data: orders, isLoading: loadingOrders } = useWcUserOrders(user?.email);

  const userPosts = posts?.filter(p => p.user_id === user?.id) || [];

  const fetchProfile = async (userId: string) => {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) console.error("[Profile] Errore caricamento:", error);
    console.log("[Profile] Stato Admin:", profileData?.is_admin);
    setProfile(profileData);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      
      setUser(session.user);
      await fetchProfile(session.user.id);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const isAvatar = type === 'avatar';
    if (isAvatar) setUploadingAvatar(true);
    else setUploadingCover(true);

    try {
      const fileExt = file.name.split('.').pop();
      const bucket = isAvatar ? 'avatars' : 'covers';
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const updateData: any = { id: user.id, updated_at: new Date().toISOString() };
      if (isAvatar) updateData.avatar_url = publicUrl;
      else updateData.cover_url = publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(updateData);

      if (updateError) throw updateError;

      showSuccess(isAvatar ? "Foto profilo aggiornata!" : "Copertina aggiornata!");
      await fetchProfile(user.id);
    } catch (error: any) {
      showError("Errore durante il caricamento: " + error.message);
    } finally {
      if (isAvatar) setUploadingAvatar(false);
      else setUploadingCover(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  const displayName = profile?.username || 
                     (profile?.first_name || profile?.last_name ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : null) || 
                     user?.email?.split('@')[0] || 
                     'User';

  const tabs = [
    { id: 'activity', label: 'Feed', icon: MessageSquare },
    { id: 'orders', label: 'Ordini', icon: ShoppingBag },
    { id: 'garage', label: 'Garage', icon: Car },
    { id: 'selections', label: 'Selezioni', icon: ClipboardCheck },
    { id: 'profile', label: 'Info', icon: User },
    { id: 'settings', label: 'Set', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pb-32">
        {/* Cover Section */}
        <div className="relative h-56 md:h-80 bg-zinc-900">
          <div 
            className="absolute inset-0 group/cover cursor-pointer overflow-hidden"
            onClick={() => coverInputRef.current?.click()}
          >
            <img 
              src={profile?.cover_url || DEFAULT_COVER} 
              className="w-full h-full object-cover opacity-60 grayscale group-hover/cover:grayscale-0 group-hover/cover:scale-105 transition-all duration-700"
              alt="Cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-all duration-300 bg-black/20 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-2">
                {uploadingCover ? (
                  <Loader2 size={32} className="animate-spin text-white" />
                ) : (
                  <>
                    <Camera size={32} className="text-white" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Cambia Copertina</span>
                  </>
                )}
              </div>
            </div>

            <input 
              type="file" 
              ref={coverInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileUpload(e, 'cover')}
            />
          </div>

          <div className="absolute -bottom-12 left-6 flex items-end gap-4 z-20">
            <div className="relative group/avatar">
              <input 
                type="file" 
                ref={avatarInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileUpload(e, 'avatar')}
              />
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  avatarInputRef.current?.click();
                }}
                className="w-24 h-24 md:w-32 md:h-32 bg-zinc-900 border-4 border-white rounded-full overflow-hidden shadow-2xl flex items-center justify-center cursor-pointer relative"
              >
                {uploadingAvatar ? (
                  <Loader2 className="animate-spin text-red-600" />
                ) : profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover group-hover/avatar:opacity-50 transition-opacity" />
                ) : (
                  <User size={40} className="text-zinc-800" />
                )}
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity bg-black/40 rounded-full">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
            </div>
            <div className="mb-2">
              <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">
                {displayName}
              </h1>
              <p className="text-red-600 text-[8px] font-black uppercase tracking-[0.3em] italic mt-1">
                {profile?.is_admin ? 'DISTRICT ADMIN' : 'OFFICIAL MEMBER'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 px-4 md:px-12 max-w-6xl mx-auto">
          {/* Tab Bar */}
          <div className="grid grid-cols-6 border border-white/5 bg-zinc-900/30 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 py-4 transition-all border-b-2",
                  activeTab === tab.id 
                    ? "border-red-600 text-white bg-white/5" 
                    : "border-transparent text-zinc-600 hover:text-zinc-400"
                )}
              >
                <tab.icon size={18} className={activeTab === tab.id ? "text-red-600" : ""} />
                <span className="text-[8px] font-black uppercase tracking-widest hidden sm:block">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Admin Dashboard Box - Posizionato sotto i tab */}
          {profile?.is_admin && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 bg-zinc-900 border-l-4 border-red-600 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-black italic uppercase tracking-tighter">Dashboard Amministrazione</h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Gestisci selezioni, eventi e community</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/admin/applications')}
                className="bg-white text-black hover:bg-red-600 hover:text-white rounded-none px-8 h-12 font-black uppercase italic tracking-widest transition-all group"
              >
                Entra Ora <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
              </Button>
            </motion.div>
          )}

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'activity' && (
                <motion.div 
                  key="activity"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black italic uppercase">I Miei Post</h3>
                    <Button 
                      onClick={() => setIsPostModalOpen(true)}
                      className="bg-red-600 hover:bg-white hover:text-black text-white rounded-none text-[10px] font-black uppercase italicthink
The user wants me to continue the previous response exactly where it left off.
Looking at the previous response, it ended with:
`className="bg-red-600 hover:bg-white hover:text-black text-white rounded-none text-[10px] font-black uppercase italic`

I need to complete the `Profile.tsx` file.

The missing part of the `Profile.tsx` file is:
` tracking-widest h-10 px-6 transition-all"
                    >
                      <Plus size={14} className="mr-2" /> Nuovo Post
                    </Button>
                  </div>

                  {loadingPosts ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></div>
                  ) : userPosts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {userPosts.map((post) => (
                        <FeedPost key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-zinc-900/30 border border-white/5 p-12 text-center">
                      <MessageSquare className="mx-auto text-zinc-800 mb-6" size={48} />
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        Non hai ancora pubblicato nulla nel District.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h3 className="text-xl font-black italic uppercase mb-6">Ordini Shop</h3>
                  {loadingOrders ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></div>
                  ) : orders?.length > 0 ? (
                    <div className="space-y-3">
                      {orders.map((order: any) => (
                        <div key={order.id} className="bg-zinc-900/50 border border-white/5 p-6 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Ordine #{order.id}</p>
                            <p className="text-sm font-bold uppercase italic">{order.status}</p>
                          </div>
                          <p className="text-sm font-black tracking-tighter">€{order.total}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-zinc-900/30 border border-white/5 p-12 text-center">
                      <ShoppingBag className="mx-auto text-zinc-800 mb-6" size={48} />
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Nessun ordine trovato.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'garage' && (
                <motion.div key="garage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <GarageTab />
                </motion.div>
              )}

              {activeTab === 'selections' && (
                <motion.div key="selections" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <ApplicationsTab />
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                  <Button 
                    onClick={handleLogout} 
                    variant="outline" 
                    className="w-full border-red-600/20 text-red-600 hover:bg-red-600 hover:text-white rounded-none font-black uppercase text-[10px] tracking-widest italic h-14"
                  >
                    <LogOut className="mr-2" size={14} /> Logout Sessione
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
      />

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Profile;`

Wait, I should provide the full file content in a `dyad-write` block to ensure it's correct and complete.

The user said "Continue exactly where you left off without any preamble".
The previous response ended with:
`className="bg-red-600 hover:bg-white hover:text-black text-white rounded-none text-[10px] font-black uppercase italic`

So I will continue from ` tracking-widest h-10 px-6 transition-all"`.

However, the instructions say:
"IMPORTANT: Only use ONE <dyad-write> block per file that you write!"
"do NOT be lazy and ALWAYS write the entire file. It needs to be a complete file."

So I must write the entire file again.

Wait, the user said "Continue exactly where you left off". This is a bit contradictory to the "ALWAYS write the entire file" rule.
But usually, "Continue" in this context means "Finish the code you were writing".
If I just write the missing snippet, it won't be a valid `dyad-write` block because it's not a complete file.
So I will write the complete `src/pages/Profile.tsx` file.

Wait, the user's prompt is "Your previous response did not finish completely. Continue exactly where you left off without any preamble."
This usually implies they want the text that was cut off.
But I am an AI editor, I should use the tools.
I will use `dyad-write` for the full file.

Actually, looking at the previous turn, the `dyad-write` block itself was cut off.
So I will provide the full `dyad-write` block for `src/pages/Profile.tsx`.

Wait, I should also check if there are other files.
The user mentioned "dashboard amministratore per l'utente privatesk".
I already updated `Profile.tsx` to show the admin dashboard if `profile?.is_admin` is true.
I also suggested a SQL query in the chat text.

Let's rewrite `src/pages/Profile.tsx` completely.

One more thing: the user said "ancora non riesco a vedere il pannello d'amministrazione, vorrei vederlo proprio sotto la scheda con tutte le icone del garage profilo e quant'altro".
So I moved the admin dashboard below the tabs.

Let's verify the code.
Tabs are rendered first.
Then the Admin Dashboard.
Then the content of the active tab.

```tsx
        <div className="mt-20 px-4 md:px-12 max-w-6xl mx-auto">
          {/* Tab Bar */}
          <div className="grid grid-cols-6 border border-white/5 bg-zinc-900/30 mb-6">
            {/* ... tabs ... */}
          </div>

          {/* Admin Dashboard Box - Posizionato sotto i tab */}
          {profile?.is_admin && (
            <motion.div ...>
              {/* ... admin dashboard content ... */}
            </motion.div>
          )}

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {/* ... tab content ... */}
            </AnimatePresence>
          </div>
        </div>
```

This looks correct.

I will also include the SQL query in the chat response as requested by the user's context (though they said "without any preamble", usually a brief confirmation is okay, but I'll stick to the code if possible).
Actually, the user said "Continue exactly where you left off".
The previous response was:
"Ho completato la ristrutturazione della pagina profilo. Ora il pannello di amministrazione è posizionato strategicamente sotto la barra dei tab, rendendolo facilmente accessibile ma non invasivo. Ho anche aggiunto dei log in console per aiutarti a verificare se lo stato `is_admin` viene letto correttamente dal database.

### 1. Esegui questa query SQL aggiornata
...
### 2. Aggiornamento del Codice
Ho riposizionato il pannello e ottimizzato il caricamento del profilo.

<dyad-write path="src/pages/Profile.tsx" description="...">
... (cut off)
"
So I will start with the `dyad-write` block.

Wait, the user said "without any preamble".
So I will just output the `dyad-write` block.

Wait, I should also make sure the SQL query is executed or at least provided if it wasn't finished.
The previous response provided the SQL query fully.
It was the `dyad-write` block that was cut off.

So I will provide the full `dyad-write` block for `src/pages/Profile.tsx`.

One detail: the user said "sicuro che l'utente 'privatesk' sia davvero amministratore dell'app?".
I should ensure the code handles the case where `is_admin` might be null or false.
The code uses `profile?.is_admin`.

Let's write the file.<dyad-write path="src/pages/Profile.tsx" description="Completamento della pagina profilo con pannello admin posizionato sotto i tab e modulo post integrato.">
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import GarageTab from '@/components/GarageTab';
import ApplicationsTab from '@/components/ApplicationsTab';
import FeedPost from '@/components/FeedPost';
import CreatePostModal from '@/components/CreatePostModal';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { 
  User, 
  Settings, 
  LogOut, 
  Car, 
  MessageSquare, 
  ShoppingBag, 
  Loader2,
  Camera,
  ShieldCheck,
  ClipboardCheck,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useWcUserOrders } from '@/hooks/use-woocommerce';
import { showSuccess, showError } from '@/utils/toast';

const DEFAULT_COVER = "https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg";

const Profile = () => {
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [activeTab, setActiveTab] = useState('activity');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const { posts, isLoading: loadingPosts } = useSocialFeed();
  const { data: orders, isLoading: loadingOrders } = useWcUserOrders(user?.email);

  const userPosts = posts?.filter(p => p.user_id === user?.id) || [];

  const fetchProfile = async (userId: string) => {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) console.error("[Profile] Errore caricamento:", error);
    console.log("[Profile] Stato Admin:", profileData?.is_admin);
    setProfile(profileData);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      
      setUser(session.user);
      await fetchProfile(session.user.id);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const isAvatar = type === 'avatar';
    if (isAvatar) setUploadingAvatar(true);
    else setUploadingCover(true);

    try {
      const fileExt = file.name.split('.').pop();
      const bucket = isAvatar ? 'avatars' : 'covers';
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const updateData: any = { id: user.id, updated_at: new Date().toISOString() };
      if (isAvatar) updateData.avatar_url = publicUrl;
      else updateData.cover_url = publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(updateData);

      if (updateError) throw updateError;

      showSuccess(isAvatar ? "Foto profilo aggiornata!" : "Copertina aggiornata!");
      await fetchProfile(user.id);
    } catch (error: any) {
      showError("Errore durante il caricamento: " + error.message);
    } finally {
      if (isAvatar) setUploadingAvatar(false);
      else setUploadingCover(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  const displayName = profile?.username || 
                     (profile?.first_name || profile?.last_name ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : null) || 
                     user?.email?.split('@')[0] || 
                     'User';

  const tabs = [
    { id: 'activity', label: 'Feed', icon: MessageSquare },
    { id: 'orders', label: 'Ordini', icon: ShoppingBag },
    { id: 'garage', label: 'Garage', icon: Car },
    { id: 'selections', label: 'Selezioni', icon: ClipboardCheck },
    { id: 'profile', label: 'Info', icon: User },
    { id: 'settings', label: 'Set', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pb-32">
        {/* Cover Section */}
        <div className="relative h-56 md:h-80 bg-zinc-900">
          <div 
            className="absolute inset-0 group/cover cursor-pointer overflow-hidden"
            onClick={() => coverInputRef.current?.click()}
          >
            <img 
              src={profile?.cover_url || DEFAULT_COVER} 
              className="w-full h-full object-cover opacity-60 grayscale group-hover/cover:grayscale-0 group-hover/cover:scale-105 transition-all duration-700"
              alt="Cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-all duration-300 bg-black/20 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-2">
                {uploadingCover ? (
                  <Loader2 size={32} className="animate-spin text-white" />
                ) : (
                  <>
                    <Camera size={32} className="text-white" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Cambia Copertina</span>
                  </>
                )}
              </div>
            </div>

            <input 
              type="file" 
              ref={coverInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileUpload(e, 'cover')}
            />
          </div>

          <div className="absolute -bottom-12 left-6 flex items-end gap-4 z-20">
            <div className="relative group/avatar">
              <input 
                type="file" 
                ref={avatarInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileUpload(e, 'avatar')}
              />
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  avatarInputRef.current?.click();
                }}
                className="w-24 h-24 md:w-32 md:h-32 bg-zinc-900 border-4 border-white rounded-full overflow-hidden shadow-2xl flex items-center justify-center cursor-pointer relative"
              >
                {uploadingAvatar ? (
                  <Loader2 className="animate-spin text-red-600" />
                ) : profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover group-hover/avatar:opacity-50 transition-opacity" />
                ) : (
                  <User size={40} className="text-zinc-800" />
                )}
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity bg-black/40 rounded-full">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
            </div>
            <div className="mb-2">
              <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">
                {displayName}
              </h1>
              <p className="text-red-600 text-[8px] font-black uppercase tracking-[0.3em] italic mt-1">
                {profile?.is_admin ? 'DISTRICT ADMIN' : 'OFFICIAL MEMBER'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 px-4 md:px-12 max-w-6xl mx-auto">
          {/* Tab Bar */}
          <div className="grid grid-cols-6 border border-white/5 bg-zinc-900/30 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 py-4 transition-all border-b-2",
                  activeTab === tab.id 
                    ? "border-red-600 text-white bg-white/5" 
                    : "border-transparent text-zinc-600 hover:text-zinc-400"
                )}
              >
                <tab.icon size={18} className={activeTab === tab.id ? "text-red-600" : ""} />
                <span className="text-[8px] font-black uppercase tracking-widest hidden sm:block">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Admin Dashboard Box - Posizionato sotto i tab */}
          {profile?.is_admin && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 bg-zinc-900 border-l-4 border-red-600 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-black italic uppercase tracking-tighter">Dashboard Amministrazione</h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Gestisci selezioni, eventi e community</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/admin/applications')}
                className="bg-white text-black hover:bg-red-600 hover:text-white rounded-none px-8 h-12 font-black uppercase italic tracking-widest transition-all group"
              >
                Entra Ora <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
              </Button>
            </motion.div>
          )}

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'activity' && (
                <motion.div 
                  key="activity"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black italic uppercase">I Miei Post</h3>
                    <Button 
                      onClick={() => setIsPostModalOpen(true)}
                      className="bg-red-600 hover:bg-white hover:text-black text-white rounded-none text-[10px] font-black uppercase italic tracking-widest h-10 px-6 transition-all"
                    >
                      <Plus size={14} className="mr-2" /> Nuovo Post
                    </Button>
                  </div>

                  {loadingPosts ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></div>
                  ) : userPosts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {userPosts.map((post) => (
                        <FeedPost key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-zinc-900/30 border border-white/5 p-12 text-center">
                      <MessageSquare className="mx-auto text-zinc-800 mb-6" size={48} />
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        Non hai ancora pubblicato nulla nel District.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h3 className="text-xl font-black italic uppercase mb-6">Ordini Shop</h3>
                  {loadingOrders ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></div>
                  ) : orders?.length > 0 ? (
                    <div className="space-y-3">
                      {orders.map((order: any) => (
                        <div key={order.id} className="bg-zinc-900/50 border border-white/5 p-6 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Ordine #{order.id}</p>
                            <p className="text-sm font-bold uppercase italic">{order.status}</p>
                          </div>
                          <p className="text-sm font-black tracking-tighter">€{order.total}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-zinc-900/30 border border-white/5 p-12 text-center">
                      <ShoppingBag className="mx-auto text-zinc-800 mb-6" size={48} />
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Nessun ordine trovato.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'garage' && (
                <motion.div key="garage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <GarageTab />
                </motion.div>
              )}

              {activeTab === 'selections' && (
                <motion.div key="selections" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <ApplicationsTab />
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                  <Button 
                    onClick={handleLogout} 
                    variant="outline" 
                    className="w-full border-red-600/20 text-red-600 hover:bg-red-600 hover:text-white rounded-none font-black uppercase text-[10px] tracking-widest italic h-14"
                  >
                    <LogOut className="mr-2" size={14} /> Logout Sessione
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
      />

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Profile;