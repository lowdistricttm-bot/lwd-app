import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./hooks/use-translation";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Shop from "./pages/Shop";
import Events from "./pages/Events";
import Garage from "./pages/Garage";
import Profile from "./pages/Profile";
import Selections from "./pages/Selections";
import PaymentMethods from "./pages/PaymentMethods";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/events" element={<Events />} />
            <Route path="/garage" element={<Garage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/selections" element={<Selections />} />
            <Route path="/payments" element={<PaymentMethods />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;