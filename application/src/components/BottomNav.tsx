import { Settings, Shirt } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();

  const navItems = [
    { label: "AI", path: "/ai-features", isAI: true },
    { icon: Shirt, label: t("nav.wardrobe"), path: "/wardrobe" },
    { icon: Settings, label: t("nav.settings"), path: "/settings" },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="gradient-nav rounded-2xl px-6 py-3 flex items-center justify-around shadow-lg shadow-primary/20">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? "scale-110" : "opacity-80 hover:opacity-100"}`}
            >
              {item.isAI ? (
                <span className="text-2xl font-bold tracking-tight text-primary-foreground">
                  Ai<span className="text-xs align-super">✦</span>
                </span>
              ) : (
                <>
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                  <span className="text-[10px] text-primary-foreground/80">{item.label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
