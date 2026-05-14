import { Sparkles, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import GloveDiscoveryModal from "@/components/GloveDiscoveryModal";
import ConnectionStatus from "@/components/ConnectionStatus";
import { useGlove } from "@/hooks/useGlove";
import { useI18n } from "@/hooks/useI18n";

const AIFeaturesScreen = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { connected } = useGlove();

  const features = [
    {
      title: t("ai.stylist"),
      description: t("ai.stylistDesc"),
      icon: Sparkles,
      path: "/ai-stylist",
      gradient: "from-secondary to-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-background px-5 pt-12 pb-28">
      <ConnectionStatus connected={connected} />

      <div className="flex items-center gap-2 mb-2 mt-4">
        <h1 className="text-3xl font-bold text-foreground">{t("ai.title")}</h1>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-secondary border border-secondary/30">
          {t("ai.future")}
        </span>
      </div>
      <p className="text-muted-foreground text-sm mb-8">{t("ai.powered")}</p>

      <div className="space-y-4">
        {features.map((feature) => (
          <button
            key={feature.title}
            onClick={() => navigate(feature.path)}
            className="glass-card p-5 w-full text-left relative overflow-hidden active:scale-[0.98] transition-transform"
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl"
              style={{ background: `linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--primary)))` }}
            />
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0`}>
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">{t("ai.comingSoon")}</span>
        </div>
      </div>

      <GloveDiscoveryModal />
      <BottomNav />
    </div>
  );
};

export default AIFeaturesScreen;
