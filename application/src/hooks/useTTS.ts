import { useState, useCallback, useRef } from "react";

const getPreferredVoice = (lang: string): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices();
  if (lang === "ar") {
    return voices.find(v => v.lang.startsWith("ar")) || null;
  }
  // Prefer high-quality English voices
  const preferred = [
    "Google UK English Female",
    "Google US English",
    "Samantha",           // macOS / iOS
    "Karen",              // macOS Australian
    "Daniel",             // macOS British
    "Microsoft Zira",     // Windows
    "Microsoft David",    // Windows
  ];
  for (const name of preferred) {
    const match = voices.find(v => v.name.includes(name));
    if (match) return match;
  }
  // Fallback: any en voice that's not "compact" or low-quality
  return voices.find(v => v.lang.startsWith("en") && !v.name.toLowerCase().includes("compact")) 
    || voices.find(v => v.lang.startsWith("en")) 
    || null;
};

export const useTTS = () => {
  const [speaking, setSpeaking] = useState(false);
  const voicesLoaded = useRef(false);

  const ensureVoices = useCallback((): Promise<void> => {
    if (voicesLoaded.current && window.speechSynthesis.getVoices().length > 0) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesLoaded.current = true;
        resolve();
        return;
      }
      window.speechSynthesis.onvoiceschanged = () => {
        voicesLoaded.current = true;
        resolve();
      };
      // Fallback timeout
      setTimeout(resolve, 500);
    });
  }, []);

  const speak = useCallback(async (text: string, lang?: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    
    await ensureVoices();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const isArabic = lang === "ar";
    utterance.lang = isArabic ? "ar-SA" : "en-US";
    
    const voice = getPreferredVoice(isArabic ? "ar" : "en");
    if (voice) utterance.voice = voice;
    
    // Read saved settings
    const savedSpeed = localStorage.getItem("voice-speed");
    const savedVolume = localStorage.getItem("voice-volume");
    
    utterance.rate = savedSpeed ? parseFloat(savedSpeed) : (isArabic ? 0.85 : 0.92);
    utterance.pitch = isArabic ? 1.0 : 1.05;
    utterance.volume = savedVolume ? parseFloat(savedVolume) : 1;
    
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [ensureVoices]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking };
};
