import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useNotificationListener } from "@/hooks/use-notification-listener";
import { LanguageProvider } from "@/hooks/use-translation";
import Index from "./pages/Index";
import Bacheca from "./pages/Bacheca";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Events from "./pages/Events";
import AdminApplications from "./pages/AdminApplications";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import PostDetail from "./pages/PostDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente wrapper per attivare gli hook globali
const AppContent = () => {
  useNotificationListener();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/bacheca" element={<Bacheca />} />
      <Route path="/post/:postId" element={<PostDetail />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/events" element={<Events />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/chat/:userId" element={<Chat />} />
      <Route path="/admin/applications" element={<AdminApplications />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;