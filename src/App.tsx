import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Import i18n (needs to happen before any components that use translations)
import "./i18n";

// Pages
import Index from "./pages/Index";
import Results from "./pages/Results";
import History from "./pages/History";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Tips from "./pages/Tips";
import NotFound from "./pages/NotFound";
import PWAOnboarding from "./components/PWAOnboarding";
// Layout
import { Navbar } from "@/components/layout/Navbar";

// Contexts
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { SleepHistoryProvider } from "@/contexts/SleepHistoryContext";

// PWA initialization
import { registerPWA } from "@/utils/pwaUtils";

// Initialize PWA
registerPWA();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <SettingsProvider>
        <SleepHistoryProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/tips" element={<Tips />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <PWAOnboarding />
                </main>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </SleepHistoryProvider>
      </SettingsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
