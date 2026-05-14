import { useNavigate } from "react-router-dom";
import { ArrowRight, Languages, Mic, Bluetooth, HelpCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import GloveDiscoveryModal from "@/components/GloveDiscoveryModal";
import ConnectionStatus from "@/components/ConnectionStatus";

import { useGlove } from "@/hooks/useGlove";
import { useI18n } from "@/hooks/useI18n";

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { connected } = useGlove();
  const { t } = useI18n();

  const settingsItems = [
    { icon: Languages, label: t("settings.language"), path: "/settings/language" },
    { icon: Mic, label: t("settings.voiceControl"), path: "/settings/voice" },
    { icon: Bluetooth, label: t("settings.bluetooth"), path: "/connect" },
    { icon: HelpCircle, label: t("settings.help"), path: "#" },
  ];

  return (
    <div className="min-h-screen bg-background px-5 pt-12 pb-28">
      <ConnectionStatus connected={connected} />

      <h1 className="text-3xl font-bold text-foreground mb-6 mt-4">{t("settings.title")}</h1>

      <div className="space-y-3">
        {settingsItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="w-full glass-card p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <item.icon className="w-5 h-5 text-foreground" />
            <span className="flex-1 text-left text-foreground font-medium">{item.label}</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      <GloveDiscoveryModal />
      <BottomNav />
    </div>
  );
};

export default SettingsScreen;
