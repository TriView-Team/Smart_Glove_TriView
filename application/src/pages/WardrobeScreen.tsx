import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AudioLines, Search, Trash2, History } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import GloveDiscoveryModal from "@/components/GloveDiscoveryModal";
import ConnectionStatus from "@/components/ConnectionStatus";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useGlove } from "@/hooks/useGlove";
import { useTTS } from "@/hooks/useTTS";
import { useI18n } from "@/hooks/useI18n";

const categoryKeys = ["All", "Shirts", "Dresses", "Accessories", "Shoes"];

const WardrobeScreen = () => {
  const navigate = useNavigate();
  const { items, removeItem } = useWardrobe();
  const { connected } = useGlove();
  const { speak } = useTTS();
  const { t, lang } = useI18n();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = items.filter((item) => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.color.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background px-5 pt-12 pb-28">
      <ConnectionStatus connected={connected} />
      <div className="flex items-center justify-between mt-4 mb-4">
        <h1 className="text-3xl font-bold text-foreground">{t("wardrobe.title")}</h1>
        <button
          onClick={() => navigate("/history")}
          className="p-2 rounded-full bg-muted text-muted-foreground hover:text-primary transition-colors"
          aria-label="Detection history"
        >
          <History className="w-5 h-5" />
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("wardrobe.search")}
          className="w-full bg-muted rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto mb-6 pb-1 scrollbar-none">
        {categoryKeys.map((cat) => {
          const labelMap: Record<string, string> = {
            All: t("wardrobe.all"),
            Shirts: t("wardrobe.shirts"),
            Dresses: t("wardrobe.dresses"),
            Accessories: t("wardrobe.accessories"),
            Shoes: t("wardrobe.shoes"),
          };
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeCategory === cat ? "gradient-button text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {labelMap[cat] || cat}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground mt-12">{t("wardrobe.noItems")}</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((item) => (
            <div key={item.id} className="flex flex-col items-center gap-1">
              <div className="relative group">
                <button
                  onClick={() => navigate("/detection", { state: { item } })}
                  className="w-full aspect-square rounded-full border-2 border-border block"
                  style={{ backgroundColor: item.colorHex || "#888" }}
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-destructive-foreground" />
                </button>
              </div>
              <button onClick={() => speak(`${item.color} ${item.fabric}`, lang)} className="flex items-center gap-1">
                <AudioLines className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">{item.color}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <GloveDiscoveryModal />
      <BottomNav />
    </div>
  );
};

export default WardrobeScreen;
