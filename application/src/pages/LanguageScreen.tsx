import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Globe } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useI18n } from "@/hooks/useI18n";
import type { Language } from "@/i18n/translations";

const languages = [
  { code: "ar" as Language, name: "العربية", nameEn: "Arabic", flag: "🇸🇦" },
  { code: "en" as Language, name: "English", nameEn: "English", flag: "🇺🇸" },
];

const LanguageScreen = () => {
  const navigate = useNavigate();
  const { lang, setLang, t } = useI18n();

  const handleSelect = (code: Language) => {
    setLang(code);
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-12 pb-28">
      <button onClick={() => navigate("/settings")} className="mb-4 text-muted-foreground">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="flex items-center gap-3 mb-6">
        <Globe className="w-7 h-7 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">{t("language.title")}</h1>
      </div>

      <p className="text-muted-foreground text-sm mb-6">{t("language.description")}</p>

      <div className="space-y-3">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => handleSelect(l.code)}
            className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all active:scale-[0.98] ${
              lang === l.code
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border bg-card/50 hover:bg-muted/50"
            }`}
          >
            <span className="text-2xl">{l.flag}</span>
            <div className="flex-1 text-left">
              <p className="text-foreground font-semibold">{l.name}</p>
              <p className="text-xs text-muted-foreground">{l.nameEn}</p>
            </div>
            {lang === l.code && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default LanguageScreen;
