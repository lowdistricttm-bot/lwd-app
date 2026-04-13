import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./hooks/use-translation";
import { CartProvider } from "./hooks/use-cart";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Events from "./pages/Events";
import Garage from "./pages/Garage";
import Profile from "./pages/Profile";
import Selections from "./pages/Selections";
import PaymentMethods from "./pages/PaymentMethods";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Community from "./pages/Community";
import Members from "./pages/Members";
import WPPage from "./pages/WPPage";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/community" element={<Community />} />
              <Route path="/members" element={<Members />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/events" element={<Events />} />
              <Route path="/garage" element={<Garage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/selections" element={<Selections />} />
              <Route path="/payments" element={<PaymentMethods />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/wp-portal" element={<WPPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;