import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Volume2, AudioLines, ArrowLeft, Save, ShirtIcon, Radio } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useGlove } from "@/hooks/useGlove";
import { useWardrobe, type WardrobeItem } from "@/hooks/useWardrobe";
import { useTTS } from "@/hooks/useTTS";
import { useI18n } from "@/hooks/useI18n";
import { supabase } from "@/integrations/supabase/client";
import { parseBlePayload } from "@/lib/blePayloadSchema";
import { toast } from "sonner";
import {
  fabricTranslations,
  colorTranslations,
  patternTranslations,
  textureTranslations,
  translateValue,
} from "@/i18n/translations";

const mockDetect = (): Omit<WardrobeItem, "id" | "savedAt"> => ({
  name: "Detected Item",
  color: ["Beige", "Blue", "Black", "White", "Red", "Navy"][Math.floor(Math.random() * 6)],
  colorHex: ["#d4c5a9", "#4a90d9", "#1a1a1a", "#f0f0f0", "#c0392b", "#1a237e"][Math.floor(Math.random() * 6)],
  fabric: ["Cotton", "Silk", "Polyester", "Denim", "Linen", "Wool"][Math.floor(Math.random() * 6)],
  pattern: ["Plain", "Striped", "Checked", "Floral"][Math.floor(Math.random() * 4)],
  texture: ["Smooth", "Rough", "Soft", "Ribbed"][Math.floor(Math.random() * 4)],
  size: ["Small", "Medium", "Large"][Math.floor(Math.random() * 3)],
  category: "Bottom / Shirt / Dress",
  detectedAt: new Date().toISOString(),
});

type Mode = "live" | "wardrobe";

const DetectionScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { connected, onData } = useGlove();
  const { items, addItem } = useWardrobe();
  const { speak, speaking } = useTTS();
  const { t, lang } = useI18n();

  const passedItem = (location.state as { item?: WardrobeItem })?.item;

  const [mode, setMode] = useState<Mode>(passedItem ? "wardrobe" : "live");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Omit<WardrobeItem, "id" | "savedAt"> | null>(passedItem || null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(passedItem?.id || null);
  const [liveStream, setLiveStream] = useState(false);
  const [lastConfidence, setLastConfidence] = useState<number | null>(null);
  const scanTimeoutRef = useRef<number | null>(null);

  const tv = (value: string, map: Record<string, Record<"en" | "ar", string>>) =>
    translateValue(value, map, lang);

  const buildDesc = (item: Omit<WardrobeItem, "id" | "savedAt">) =>
    `${t("detection.itemIs")} ${tv(item.color, colorTranslations)}, ${tv(item.fabric, fabricTranslations)} ${t("detection.fabricWord")}, ${tv(item.texture, textureTranslations)} ${t("detection.textureWord")}, ${tv(item.pattern, patternTranslations)} ${t("detection.patternWord")}.`;

  // Persist a recognition row. Requires authenticated user (RLS).
  const persistRecognition = async (
    detected: Omit<WardrobeItem, "id" | "savedAt">,
    isLive: boolean,
    confidence: number | null,
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn("[recognition] skipped — sign-in required to save to database");
      return;
    }
    const { error } = await supabase.from("recognition_results").insert({
      user_id: user.id,
      fabric_type: detected.fabric,
      color: detected.color,
      pattern: detected.pattern,
      texture: detected.texture,
      is_live: isLive,
      confidence,
    });
    if (error) console.error("[recognition] insert failed:", error);
  };

  // Parse + strictly validate a BLE packet via zod schema.
  // Invalid packets are dropped (logged) and never reach the database.
  const parsePacket = (data: DataView): {
    detected: Omit<WardrobeItem, "id" | "savedAt">;
    confidence: number | null;
  } | null => {
    const payload = parseBlePayload(data);
    if (!payload) return null;
    return {
      detected: {
        name: payload.name || "Detected Item",
        color: payload.color,
        colorHex: payload.colorHex,
        fabric: payload.fabric,
        pattern: payload.pattern,
        texture: payload.texture,
        size: payload.size,
        category: payload.category || "Bottom / Shirt / Dress",
        detectedAt: new Date().toISOString(),
      },
      confidence: payload.confidence ?? null,
    };
  };

  // Subscribe to BLE stream when connected & on live mode.
  useEffect(() => {
    if (!connected || mode !== "live") {
      setLiveStream(false);
      return;
    }
    setLiveStream(true);
    const unsubscribe = onData((data) => {
      const parsed = parsePacket(data);
      if (!parsed) return;
      setResult(parsed.detected);
      setLastConfidence(parsed.confidence);
      setScanning(false);
      if (scanTimeoutRef.current) {
        window.clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }
      toast.success(t("detection.completed"), {
        icon: "✅",
        description: `${tv(parsed.detected.color, colorTranslations)} ${tv(parsed.detected.fabric, fabricTranslations)} ${t("detection.detected")}`,
      });
      speak(buildDesc(parsed.detected), lang);
      void persistRecognition(parsed.detected, true, parsed.confidence);
    });
    return () => {
      setLiveStream(false);
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, mode, lang]);

  const startScan = () => {
    if (!connected) { toast.error(t("detection.connectFirst")); return; }
    setScanning(true);
    setResult(null);
    // Fallback: if no BLE packet arrives within 2.5s, fall back to mock
    // so the UX still works while Pi firmware is in development.
    scanTimeoutRef.current = window.setTimeout(() => {
      const detected = mockDetect();
      setResult(detected);
      setLastConfidence(null);
      setScanning(false);
      toast.success(t("detection.completed"), { icon: "✅", description: `${tv(detected.color, colorTranslations)} ${tv(detected.fabric, fabricTranslations)} ${t("detection.detected")}` });
      speak(buildDesc(detected), lang);
      void persistRecognition(detected, false, null);
    }, 2500);
  };

  const handleSelectWardrobe = (item: WardrobeItem) => {
    setSelectedItemId(item.id);
    setResult(item);
    speak(buildDesc(item), lang);
  };

  const handleSave = () => {
    if (!result) return;
    addItem(result);
    toast.success(t("detection.itemSaved"), { icon: "👕", description: `${tv(result.color, colorTranslations)} ${tv(result.fabric, fabricTranslations)} ${t("detection.added")}` });
  };

  const handleReplay = () => {
    if (!result) return;
    speak(buildDesc(result), lang);
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-12 pb-28">
      <button onClick={() => navigate("/wardrobe")} className="mb-4 text-muted-foreground">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <h1 className="text-3xl font-bold text-foreground mb-4">{t("detection.title")}</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setMode("live"); setResult(null); setSelectedItemId(null); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${mode === "live" ? "gradient-button text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          {t("detection.liveDetection")}
        </button>
        <button
          onClick={() => { setMode("wardrobe"); setResult(null); setSelectedItemId(null); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${mode === "wardrobe" ? "gradient-button text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          <ShirtIcon className="w-4 h-4" />
          {t("detection.fromWardrobe")}
        </button>
      </div>

      {mode === "live" && (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={startScan}
            disabled={scanning}
            className="relative w-24 h-24 rounded-full gradient-button flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform disabled:opacity-60"
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-foreground">
              <path d="M5.636 18.364a9 9 0 0 1 0-12.728" strokeLinecap="round" />
              <path d="M8.464 15.536a5 5 0 0 1 0-7.072" strokeLinecap="round" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <path d="M15.536 8.464a5 5 0 0 1 0 7.072" strokeLinecap="round" />
              <path d="M18.364 5.636a9 9 0 0 1 0 12.728" strokeLinecap="round" />
            </svg>
            {scanning && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" />
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" style={{ animationDelay: "0.75s" }} />
              </>
            )}
          </button>
          <p className="text-sm text-muted-foreground">
            {scanning ? t("detection.scanning") : t("detection.touchFabric")}
          </p>
          {liveStream && (
            <div className="flex items-center gap-1.5 text-xs text-primary">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Live stream active</span>
              {lastConfidence !== null && (
                <span className="text-muted-foreground">· {Math.round(lastConfidence * 100)}%</span>
              )}
            </div>
          )}
        </div>
      )}

      {mode === "wardrobe" && !result && (
        <div>
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground mt-12">{t("detection.noItems")}</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectWardrobe(item)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${selectedItemId === item.id ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted/50"}`}
                >
                  <div className="w-full aspect-square rounded-full border-2 border-border" style={{ backgroundColor: item.colorHex || "#888" }} />
                  <span className="text-xs text-muted-foreground truncate w-full text-center">{tv(item.color, colorTranslations)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {result && (
        <>
          <div className="flex items-center gap-2 mt-6 mb-3">
            <Volume2 className="w-5 h-5 text-primary" />
            <AudioLines className={`w-5 h-5 text-primary ${speaking ? "animate-pulse" : ""}`} />
          </div>

          <div className="glass-card p-4 flex gap-4">
            <div className="w-28 h-28 rounded-xl border border-border flex-shrink-0" style={{ backgroundColor: result.colorHex || "#888" }} />
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">{t("detection.fabric")}</span> <span className="text-foreground">{tv(result.fabric, fabricTranslations)}</span></div>
              <div><span className="text-muted-foreground">{t("detection.color")}</span> <span className="text-foreground">{tv(result.color, colorTranslations)}</span></div>
              <div><span className="text-muted-foreground">{t("detection.pattern")}</span> <span className="text-foreground">{tv(result.pattern, patternTranslations)}</span></div>
              <div><span className="text-muted-foreground">{t("detection.texture")}</span> <span className="text-foreground">{tv(result.texture, textureTranslations)}</span></div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 mt-6">
            <button onClick={handleReplay} className="border border-primary text-primary font-medium py-2.5 px-8 rounded-xl flex items-center gap-2 active:scale-95 transition-transform">
              <Volume2 className="w-4 h-4" />
              {t("detection.listen")}
            </button>
            {mode === "live" && (
              <button onClick={handleSave} className="gradient-button text-primary-foreground font-semibold py-2.5 px-8 rounded-xl flex items-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/20">
                <Save className="w-4 h-4" />
                {t("detection.save")}
              </button>
            )}
            <button
              onClick={() => { setResult(null); setSelectedItemId(null); }}
              className="border border-destructive text-destructive font-medium py-2.5 px-8 rounded-xl active:scale-95 transition-transform"
            >
              {mode === "live" ? t("detection.remove") : t("detection.backToList")}
            </button>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
};

export default DetectionScreen;
