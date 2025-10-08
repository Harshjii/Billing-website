import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NewBooking from "./pages/NewBooking";
import Stock from "./pages/Stock";
import Revenue from "./pages/Revenue";
import PendingPayments from "./pages/PendingPayments";
import PlayerAccounts from "./pages/PlayerAccounts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new-booking" element={<NewBooking />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/pending-payments" element={<PendingPayments />} />
          <Route path="/player-accounts" element={<PlayerAccounts />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
