import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useNotificationListener } from "@/hooks/use-notification-listener";
import { LanguageProvider } from "@/hooks/use-translation";
import { useProfileSync } from "@/hooks/use-profile-sync";
import { PresenceProvider } from "@/hooks/use-presence";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { unlockAudio } from "@/utils/sound";
import PullToRefresh from "@/components/PullToRefresh";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import ScrollToTop from "@/components/ScrollToTop";
import BackgroundDecoration from "@/components/BackgroundDecoration";
import SwipeNavigation from "@/components/SwipeNavigation";
import Index from "./pages/Index";
import Bacheca from "./pages/Bacheca";
import Discover from "./pages/Discover";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Events from "./pages/Events";
import AdminDashboard from "./pages/AdminDashboard";
import AdminApplications from "./pages/AdminApplications";
import AdminUsers from "./pages/AdminUsers";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import PostDetail from "./pages/PostDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContent = () => {
  useNotificationListener();
  
  const [currentUsername, setCurrentUsername] = useState<string | undefined>();

  useEffect(() => {
    // Sblocco audio per mobile al primo tocco dell'utente
    const handleFirstInteraction = () => {
      unlockAudio();
      // Rimuoviamo i listener dopo la prima interazione
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const username = session.user.user_metadata?.username;
        if (username) setCurrentUsername(username);
        
        supabase.from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data?.username) setCurrentUsername(data.username);
          });
      }
    });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  useProfileSync(currentUsername);
  
  return (
    <SwipeNavigation>
      <BackgroundDecoration />
      <PullToRefresh />
      <SpotifyPlayer />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/bacheca" element={<Bacheca />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/chat/:userId" element={<Chat />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SwipeNavigation>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <PresenceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </PresenceProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;