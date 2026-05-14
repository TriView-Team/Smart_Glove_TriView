import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GloveProvider } from "@/hooks/useGlove";
import { WardrobeProvider } from "@/hooks/useWardrobe";
import { I18nProvider } from "@/hooks/useI18n";
import WelcomeScreen from "./pages/WelcomeScreen";

import ConnectScreen from "./pages/ConnectScreen";
import PairingGuideScreen from "./pages/PairingGuideScreen";
import DetectionScreen from "./pages/DetectionScreen";
import WardrobeScreen from "./pages/WardrobeScreen";
import SettingsScreen from "./pages/SettingsScreen";
import AIFeaturesScreen from "./pages/AIFeaturesScreen";
import AIStylistScreen from "./pages/AIStylistScreen";
import HistoryScreen from "./pages/HistoryScreen";
import HistoryDetailScreen from "./pages/HistoryDetailScreen";

import LanguageScreen from "./pages/LanguageScreen";
import VoiceControlScreen from "./pages/VoiceControlScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <I18nProvider>
        <GloveProvider>
          <WardrobeProvider>
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<WelcomeScreen />} />
                <Route path="/connect" element={<ConnectScreen />} />
                <Route path="/pairing-guide" element={<PairingGuideScreen />} />
                <Route path="/detection" element={<DetectionScreen />} />
                <Route path="/wardrobe" element={<WardrobeScreen />} />
                <Route path="/settings" element={<SettingsScreen />} />
                <Route path="/ai-features" element={<AIFeaturesScreen />} />
                <Route path="/ai-stylist" element={<AIStylistScreen />} />
                <Route path="/history" element={<HistoryScreen />} />
                <Route path="/history/:id" element={<HistoryDetailScreen />} />
                
                <Route path="/settings/language" element={<LanguageScreen />} />
                <Route path="/settings/voice" element={<VoiceControlScreen />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </WardrobeProvider>
        </GloveProvider>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
