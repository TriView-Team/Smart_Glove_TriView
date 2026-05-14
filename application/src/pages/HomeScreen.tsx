import { useNavigate } from "react-router-dom";
import { Bluetooth, ScanLine, Archive, Volume2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ConnectionStatus from "@/components/ConnectionStatus";
import GloveDiscoveryModal from "@/components/GloveDiscoveryModal";
import TriviewLinkButton from "@/components/TriviewLinkButton";
import { useGlove } from "@/hooks/useGlove";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useI18n } from "@/hooks/useI18n";

const HomeScreen = () => {
  const navigate = useNavigate();
  const { connected } = useGlove();
  const { items } = useWardrobe();
  const { t } = useI18n();
  const recentItems = items.slice(0, 3);

  return (
    <div className="min-h-screen bg-background px-5 pt-12 pb-28">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold text-foreground">{t("home.welcome")}</h2>
        <TriviewLinkButton />
      </div>
      <p className="text-muted-foreground text-sm mb-6">{t("home.subtitle")}</p>

      <ConnectionStatus connected={connected} />

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/connect")}
          className="glass-card p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform"
        >
          <Bluetooth className="w-8 h-8 text-primary" />
          <span className="text-sm text-foreground font-medium">{t("home.connectGlove")}</span>
        </button>
        <button
          onClick={() => navigate("/detection")}
          className="gradient-button p-4 rounded-2xl flex flex-col items-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/20"
        >
          <ScanLine className="w-8 h-8 text-primary-foreground" />
          <span className="text-sm text-primary-foreground font-semibold">{t("home.startRecognition")}</span>
        </button>
        <button
          onClick={() => navigate("/wardrobe")}
          className="glass-card p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform"
        >
          <Archive className="w-8 h-8 text-primary" />
          <span className="text-sm text-foreground font-medium">{t("home.wardrobe")}</span>
        </button>
        <button
          onClick={() => navigate("/settings")}
          className="glass-card p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform"
        >
          <Volume2 className="w-8 h-8 text-primary" />
          <span className="text-sm text-foreground font-medium">{t("home.voiceTips")}</span>
        </button>
      </div>

      {recentItems.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-3">{t("home.recentDetections")}</h3>
          <div className="space-y-2">
            {recentItems.map((item) => (
              <div key={item.id} className="glass-card p-3 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg border border-border"
                  style={{ backgroundColor: item.colorHex || "#888" }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.fabric} · {item.color}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <GloveDiscoveryModal />
      <BottomNav />
    </div>
  );
};

export default HomeScreen;
