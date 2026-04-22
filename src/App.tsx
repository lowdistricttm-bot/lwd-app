import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useNotificationListener } from "@/hooks/use-notification-listener";
import { LanguageProvider } from "@/hooks/use-translation";
import { useProfileSync } from "@/hooks/use-profile-sync";
import { PresenceProvider } from "@/hooks/use-presence";
import { AuthProvider } from "@/hooks/use-auth";
import PullToRefresh from "@/components/PullToRefresh";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import ScrollToTop from "@/components/ScrollToTop";
import BackgroundDecoration from "@/components/BackgroundDecoration";
import SwipeNavigation from "@/components/SwipeNavigation";
import BottomNav from "@/components/BottomNav";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import Bacheca from "./pages/Bacheca";
import Discover from "./pages/Discover";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Events from "./pages/Events";
import Meets from "./pages/Meets";
import AdminDashboard from "./pages/AdminDashboard";
import AdminApplications from "./pages/AdminApplications";
import AdminUsers from "./pages/AdminUsers";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import PostDetail from "./pages/PostDetail";
import Marketplace from "./pages/Marketplace";
import FitmentTool from "./pages/FitmentTool";
import Leaderboards from "./pages/Leaderboards";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  useNotificationListener();
  useProfileSync();
  
  return (
    <>
      {/* 
        Sfondo solido nero globale per la Status Bar di iOS. 
        Avendo z-[99999] rimarrà sempre in primo piano, impedendo a QUALSIASI modal,
        cassetto o pagina di finire dietro l'orario o la batteria.
      */}
      <div 
        className="fixed top-0 left-0 right-0 z-[99999] bg-black pointer-events-none" 
        style={{ height: 'env(safe-area-inset-top)' }} 
      />

      {/* Header Fisso Globale (gestisce da solo il suo nascondimento) */}
      <Navbar />
      
      <SwipeNavigation>
        <BackgroundDecoration />
        <PullToRefresh />
        <SpotifyPlayer />
        
        {/* Contenitore di scorrimento principale - Native Feel */}
        <main id="scroll-container" className="app-content-area">
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
            <Route path="/meets" element={<Meets />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/chat/:userId" element={<Chat />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/fitment" element={<FitmentTool />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/applications" element={<AdminApplications />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </SwipeNavigation>

      {/* Navigazione Inferiore Fissa Globale */}
      <BottomNav />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
    </AuthProvider>
  </QueryClientProvider>
);

export default App;