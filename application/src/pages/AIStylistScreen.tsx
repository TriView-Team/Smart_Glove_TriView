import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pause, Play, Sparkles, Lightbulb, Volume2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useTTS } from "@/hooks/useTTS";
import { useI18n } from "@/hooks/useI18n";
import { supabase } from "@/integrations/supabase/client";
import { matchStylistRecommendation, type StylistRow } from "@/lib/aiStylistMatcher";

import modelImg from "@/assets/ai-stylist-model.png";
import sunglassesImg from "@/assets/accessory-sunglasses.png";
import earringsBagImg from "@/assets/accessory-earrings-bag.png";
import sandalsImg from "@/assets/accessory-sandals.png";

const accessories = [
  { img: sunglassesImg, label: "Sunglasses" },
  { img: earringsBagImg, label: "Earrings & Bag" },
  { img: sandalsImg, label: "Sandals" },
];

const AIStylistScreen = () => {
  const navigate = useNavigate();
  const { speak, stop, speaking } = useTTS();
  const { t, lang } = useI18n();
  const [currentAccessory, setCurrentAccessory] = useState(0);

  const [match, setMatch] = useState<StylistRow | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(true);

  // Pull most recent recognition for this user, then match against the stylist dataset.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingMatch(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingMatch(false); return; }
      const { data: recs } = await supabase
        .from("recognition_results")
        .select("color,fabric_type,pattern")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      const latest = recs?.[0];
      const matched = await matchStylistRecommendation({
        color: latest?.color,
        fabric_type: latest?.fabric_type,
        pattern: latest?.pattern,
      });
      if (!cancelled) { setMatch(matched); setLoadingMatch(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const isAr = lang === "ar";
  const datasetRecText = match ? (isAr ? match.recommendation_ar : match.recommendation_en) : null;
  const datasetAudioText = match
    ? (isAr ? (match.audio_text_ar || match.recommendation_ar) : (match.audio_text_en || match.recommendation_en))
    : null;

  const recommendations = datasetRecText
    ? [datasetRecText, t("aiStylist.recommendation2"), t("aiStylist.recommendation3")]
    : [t("aiStylist.recommendation1"), t("aiStylist.recommendation2"), t("aiStylist.recommendation3")];

  const handleStyleMyLook = () => {
    speak(datasetAudioText || t("aiStylist.styledLookDesc"), lang);
  };

  const handleNext = () => {
    const nextIdx = (currentAccessory + 1) % accessories.length;
    setCurrentAccessory(nextIdx);
    speak(`${t("aiStylist.suggestedAccessory")} ${accessories[nextIdx].label}`, lang);
  };

  const handlePlayAudio = () => {
    if (speaking) {
      stop();
      return;
    }
    const intro = datasetAudioText || t("aiStylist.styledLookDesc");
    const text = `${intro}. ${recommendations.join(". ")}`;
    speak(text, lang);
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-12 pb-28">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate("/ai-features")} className="text-muted-foreground" aria-label="Back">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-secondary border border-secondary/30">
          {t("ai.future")}
        </span>
      </div>

      <h1 className="text-3xl font-bold text-foreground text-center mb-2">{t("aiStylist.title")}</h1>
      <p className="text-sm text-muted-foreground text-center mb-6">{t("ai.powered")}</p>

      <div className="flex justify-center mb-8">
        <button
          onClick={handleStyleMyLook}
          className="gradient-button text-primary-foreground font-semibold py-3 px-8 rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-transform"
        >
          {t("aiStylist.styleMyLook")}
        </button>
      </div>

      {/* Section 1: Outfit Suggestions */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">{t("aiStylist.outfitSuggestions")}</h2>
        </div>

        <div className="flex gap-2 xs:gap-3 items-start">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-3xl gradient-primary opacity-10 blur-2xl" />
              <img
                src={modelImg}
                alt="Styled outfit"
                className="w-full max-w-[260px] xs:max-w-[300px] sm:max-w-[360px] md:max-w-[420px] mx-auto object-contain drop-shadow-2xl"
                width={512}
                height={768}
              />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 sm:gap-2.5 flex-shrink-0 w-[88px] xs:w-[100px] sm:w-[110px]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[3, 5, 3, 6, 4, 2, 5, 3].map((h, i) => (
                  <div
                    key={i}
                    className={`w-0.5 bg-primary rounded-full transition-all ${speaking ? "animate-pulse" : ""}`}
                    style={{ height: `${h * 3}px` }}
                  />
                ))}
              </div>
              <button
                onClick={() => (speaking ? stop() : handleStyleMyLook())}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                aria-label={speaking ? "Pause" : "Play"}
              >
                {speaking ? (
                  <Pause className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
                )}
              </button>
            </div>
            {accessories.map((acc, idx) => (
              <div
                key={idx}
                className={`w-full bg-card rounded-2xl p-2 border transition-all ${
                  currentAccessory === idx ? "border-primary shadow-lg shadow-primary/10" : "border-border"
                }`}
              >
                <img
                  src={acc.img}
                  alt={acc.label}
                  className="w-full h-14 object-contain rounded-lg"
                  loading="lazy"
                  width={512}
                  height={512}
                />
              </div>
            ))}
            <button
              onClick={handleNext}
              className="gradient-button text-primary-foreground font-semibold py-2.5 px-6 rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-transform text-sm w-full"
            >
              {t("aiStylist.next")}
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: Smart Recommendations + inline Audio Tips button */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Lightbulb className="w-4 h-4 text-primary flex-shrink-0" />
            <h2 className="text-base font-semibold text-foreground truncate">{t("aiStylist.smartRecommendations")}</h2>
          </div>
          <button
            onClick={handlePlayAudio}
            className="w-9 h-9 rounded-full bg-card border border-border hover:border-primary/50 active:scale-95 transition-all flex-shrink-0 flex items-center justify-center"
            aria-label={speaking ? "Pause tips" : "Play tips"}
          >
            {speaking ? (
              <Pause className="w-4 h-4 text-primary" />
            ) : (
              <Volume2 className="w-4 h-4 text-primary" />
            )}
          </button>
        </div>
        <div className="space-y-2">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="glass-card px-4 py-3 flex items-start gap-3"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                {idx + 1}
              </div>
              <p className="text-sm text-foreground leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
};

export default AIStylistScreen;
