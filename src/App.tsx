import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import Map from "./pages/Map";
import GIS from "./pages/GIS";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Sonner />
          <Toaster />

          {/* Simple header nav so you can reach all modes */}
          <header className="w-full border-b border-slate-800 bg-slate-950/95 text-slate-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="text-sm font-semibold tracking-wide">
                NEX Data Map
              </div>
              <nav className="flex gap-2 text-xs">
                <Link
                  to="/"
                  className="px-3 py-1.5 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800"
                >
                  Home
                </Link>
                <Link
                  to="/map"
                  className="px-3 py-1.5 rounded-md border border-emerald-500/70 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                >
                  Play (GeoQuest)
                </Link>
                <Link
                  to="/gis"
                  className="px-3 py-1.5 rounded-md border border-sky-500/70 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
                >
                  Pro GIS
                </Link>
              </nav>
            </div>
          </header>

          {/* Route views */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/map" element={<Map />} />
            <Route path="/gis" element={<GIS />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
