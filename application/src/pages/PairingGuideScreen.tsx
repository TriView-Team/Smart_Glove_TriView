import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Power, Bluetooth, Smartphone, Hand, Wifi,
  CheckCircle2, RefreshCw, AlertTriangle, Loader2, Volume2, VolumeX,
} from "lucide-react";
import { useGlove } from "@/hooks/useGlove";
import { useI18n } from "@/hooks/useI18n";
import { useTTS } from "@/hooks/useTTS";
import smartGloveImg from "@/assets/smart-glove.png";

type PairingState = "instructions" | "connecting" | "success" | "failed";

const PairingGuideScreen = () => {
  const navigate = useNavigate();
  const { connect } = useGlove();
  const { t, lang } = useI18n();
  const { speak, stop, speaking } = useTTS();
  const [state, setState] = useState<PairingState>("instructions");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps = [
    { icon: Power, title: t("pairing.step1.title"), description: t("pairing.step1.desc") },
    { icon: Bluetooth, title: t("pairing.step2.title"), description: t("pairing.step2.desc") },
    { icon: Hand, title: t("pairing.step3.title"), description: t("pairing.step3.desc") },
    { icon: Smartphone, title: t("pairing.step4.title"), description: t("pairing.step4.desc") },
    { icon: Wifi, title: t("pairing.step5.title"), description: t("pairing.step5.desc") },
  ];

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  const speakStep = useCallback((idx: number) => {
    stop();
    const step = steps[idx];
    speak(`${idx + 1}. ${step.title}. ${step.description}`, lang);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop, speak, lang]);

  const startAutoPlay = useCallback((fromStep: number) => {
    setAutoPlaying(true);
    setCurrentStep(fromStep);
    speakStep(fromStep);

    const advanceStep = (stepIdx: number) => {
      autoTimerRef.current = setTimeout(() => {
        const next = stepIdx + 1;
        if (next < 5) {
          setCurrentStep(next);
          speakStep(next);
          advanceStep(next);
        } else {
          setAutoPlaying(false);
        }
      }, 5000);
    };
    advanceStep(fromStep);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakStep]);

  const stopAutoPlay = useCallback(() => {
    clearAutoTimer();
    stop();
    setAutoPlaying(false);
  }, [clearAutoTimer, stop]);

  // Auto-play on mount
  useEffect(() => {
    if (state === "instructions") {
      const timer = setTimeout(() => startAutoPlay(0), 800);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearAutoTimer(), [clearAutoTimer]);

  const handleReplayGuide = () => {
    if (autoPlaying || speaking) {
      stopAutoPlay();
    } else {
      startAutoPlay(0);
    }
  };

  useEffect(() => {
    if (state !== "connecting") return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [state]);

  useEffect(() => {
    if (progress === 100 && state === "connecting") {
      connect().then(() => setState("success")).catch(() => setState("failed"));
    }
  }, [progress, state, connect]);

  const handleStartPairing = () => { stopAutoPlay(); setState("connecting"); setProgress(0); };
  const handleRetry = () => { setState("instructions"); setProgress(0); setCurrentStep(0); };

  if (state === "success") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
        <div className="w-24 h-24 rounded-full bg-[hsl(var(--success))] flex items-center justify-center mb-6 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-14 h-14 text-background" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t("pairing.connected")}</h1>
        <p className="text-muted-foreground text-center mb-8">{t("pairing.readyToUse")}</p>
        <button onClick={() => navigate("/wardrobe")} className="gradient-button text-primary-foreground font-semibold px-10 py-3.5 rounded-xl active:scale-95 transition-transform shadow-lg shadow-primary/30">
          {t("pairing.startUsing")}
        </button>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
        <div className="w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center mb-6">
          <AlertTriangle className="w-14 h-14 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("pairing.failed")}</h1>
        <p className="text-muted-foreground text-center mb-4 max-w-xs">{t("pairing.failedDesc")}</p>
        <ul className="text-sm text-muted-foreground space-y-2 mb-8 max-w-xs">
          {["tip1", "tip2", "tip3", "tip4"].map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <span className="text-destructive mt-0.5">•</span>
              {t(`pairing.${tip}`)}
            </li>
          ))}
        </ul>
        <button onClick={handleRetry} className="gradient-button text-primary-foreground font-semibold px-8 py-3.5 rounded-xl active:scale-95 transition-transform shadow-lg shadow-primary/30 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          {t("pairing.tryAgain")}
        </button>
      </div>
    );
  }

  if (state === "connecting") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
        <div className="relative mb-8">
          <img src={smartGloveImg} alt="Smart Glove" className="w-32 h-32 object-contain" />
          <div className="absolute -inset-4 rounded-full border-2 border-primary/40 animate-ping" />
        </div>
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">{t("pairing.connecting")}</h2>
        <p className="text-muted-foreground text-sm mb-6">
          {progress < 30 ? t("pairing.searching") : progress < 70 ? t("pairing.deviceFound") : t("pairing.almostThere")}
        </p>
        <div className="w-full max-w-xs h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full gradient-button rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-muted-foreground mt-2">{progress}%</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-5 pt-12 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t("pairing.title")}</h1>
        </div>
        <button
          onClick={handleReplayGuide}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${speaking ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
        >
          {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span className="text-xs font-medium">{speaking ? t("pairing.stopGuide") : t("pairing.listenGuide")}</span>
        </button>
      </div>

      <div className="flex justify-center mb-6">
        <img src={smartGloveImg} alt="Smart Glove" className="w-28 h-28 object-contain" />
      </div>

      <div className="space-y-3 mb-8">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          return (
            <button
              key={i}
              onClick={() => {
                stopAutoPlay();
                setCurrentStep(i);
                speakStep(i);
              }}
              className={`w-full flex items-start gap-3 p-3.5 rounded-xl border transition-all text-left ${
                isActive ? "border-primary/50 bg-primary/10" : isDone ? "border-border/30 bg-muted/30" : "border-border/20 bg-card/40"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                isActive ? "gradient-button" : isDone ? "bg-[hsl(var(--success))]/20" : "bg-muted"
              }`}>
                {isDone ? <CheckCircle2 className="w-5 h-5 text-[hsl(var(--success))]" /> : <Icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />}
              </div>
              <div>
                <p className={`text-sm font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {i + 1}. {step.title}
                </p>
                {isActive && <p className="text-xs text-muted-foreground mt-1">{step.description}</p>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        {currentStep > 0 && (
          <button
            onClick={() => {
              stopAutoPlay();
              const prevStep = currentStep - 1;
              setCurrentStep(prevStep);
              speakStep(prevStep);
            }}
            className="flex-1 border border-border text-foreground font-semibold py-3.5 rounded-xl active:scale-95 transition-transform"
          >
            {t("pairing.prevStep")}
          </button>
        )}
        <button
          onClick={() => {
            if (currentStep < steps.length - 1) {
              stopAutoPlay();
              const nextStep = currentStep + 1;
              setCurrentStep(nextStep);
              speakStep(nextStep);
            } else {
              handleStartPairing();
            }
          }}
          className="flex-1 gradient-button text-primary-foreground font-semibold py-3.5 rounded-xl active:scale-95 transition-transform shadow-lg shadow-primary/30"
        >
          {currentStep < steps.length - 1 ? t("pairing.nextStep") : t("pairing.startPairing")}
        </button>
      </div>
    </div>
  );
};

export default PairingGuideScreen;
