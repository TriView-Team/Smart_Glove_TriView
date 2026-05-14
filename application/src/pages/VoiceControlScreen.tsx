import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, Play, Pause } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useTTS } from "@/hooks/useTTS";
import { useI18n } from "@/hooks/useI18n";

const VoiceControlScreen = () => {
  const navigate = useNavigate();
  const { speak, stop, speaking } = useTTS();
  const { t, lang } = useI18n();

  const [autoRead, setAutoRead] = useState(() => localStorage.getItem("voice-auto-read") !== "false");
  const [speed, setSpeed] = useState(() => parseFloat(localStorage.getItem("voice-speed") || "0.9"));
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem("voice-volume") || "1"));

  const handleAutoReadToggle = () => {
    const newVal = !autoRead;
    setAutoRead(newVal);
    localStorage.setItem("voice-auto-read", String(newVal));
  };

  const handleSpeedChange = (val: number) => { setSpeed(val); localStorage.setItem("voice-speed", String(val)); };
  const handleVolumeChange = (val: number) => { setVolume(val); localStorage.setItem("voice-volume", String(val)); };

  const testVoice = () => {
    if (speaking) { stop(); } else { speak(t("voice.testText"), lang); }
  };

  const speedOptions = [
    { label: t("voice.slow"), value: 0.7 },
    { label: t("voice.normal"), value: 0.9 },
    { label: t("voice.fast"), value: 1.2 },
  ];

  return (
    <div className="min-h-screen bg-background px-5 pt-12 pb-28">
      <button onClick={() => navigate("/settings")} className="mb-4 text-muted-foreground">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="flex items-center gap-3 mb-6">
        <Volume2 className="w-7 h-7 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">{t("voice.title")}</h1>
      </div>

      <p className="text-muted-foreground text-sm mb-8">{t("voice.description")}</p>

      <div className="glass-card p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-foreground font-medium">{t("voice.autoRead")}</p>
          <p className="text-xs text-muted-foreground">{t("voice.autoReadDesc")}</p>
        </div>
        <button
          onClick={handleAutoReadToggle}
          className={`w-12 h-7 rounded-full transition-colors relative ${autoRead ? "bg-primary" : "bg-muted"}`}
        >
          <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${autoRead ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>

      <div className="glass-card p-4 mb-4">
        <p className="text-foreground font-medium mb-3">{t("voice.speed")}</p>
        <div className="flex gap-2">
          {speedOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSpeedChange(opt.value)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${speed === opt.value ? "gradient-button text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-foreground font-medium">{t("voice.volume")}</p>
          <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.1" value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
        />
      </div>

      <div className="flex flex-col items-center gap-3 mt-8">
        <button
          onClick={testVoice}
          className="gradient-button text-primary-foreground font-semibold py-3 px-8 rounded-xl flex items-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/20"
        >
          {speaking ? <><Pause className="w-5 h-5" />{t("voice.stop")}</> : <><Play className="w-5 h-5" />{t("voice.testVoice")}</>}
        </button>
        {speaking && (
          <div className="flex items-center gap-0.5 mt-2">
            {[3, 5, 2, 6, 4, 3, 5, 2, 4, 6, 3, 5].map((h, i) => (
              <div key={i} className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: `${h * 3}px`, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default VoiceControlScreen;
