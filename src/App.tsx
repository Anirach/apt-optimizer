import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Booking from "./pages/Booking";
import Calendar from "./pages/Calendar";
import AppointmentDetails from "./pages/AppointmentDetails";
import WaitlistDetails from "./pages/WaitlistDetails";
import AnalyticsDetails from "./pages/AnalyticsDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/appointment/:id" element={<AppointmentDetails />} />
          <Route path="/waitlist/:id" element={<WaitlistDetails />} />
          <Route path="/analytics" element={<AnalyticsDetails />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
