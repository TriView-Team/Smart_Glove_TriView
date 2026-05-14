import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Bluetooth } from "lucide-react";
import smartGloveImg from "@/assets/smart-glove.png";
import { useGlove } from "@/hooks/useGlove";
import { useI18n } from "@/hooks/useI18n";

const GloveDiscoveryModal = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const { connected, connect } = useGlove();
  const { t } = useI18n();

  useEffect(() => {
    if (connected) { setVisible(false); return; }
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, [connected]);

  const handleConnect = async () => {
    setVisible(false);
    navigate("/connect");
    // Trigger the BLE chooser shortly after navigation so user gesture is preserved.
    await connect();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setVisible(false)} />
      <div className="relative bg-card rounded-3xl w-full max-w-sm mx-4 px-6 pt-5 pb-8 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bluetooth className="w-4 h-4 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{t("modal.title")}</h2>
          <button onClick={() => setVisible(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-center">
          <img src={smartGloveImg} alt="Smart Glove" className="w-40 h-40 object-contain mb-4" width={512} height={512} />
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-[280px]">{t("modal.description")}</p>
          <button onClick={handleConnect} className="w-full max-w-[240px] gradient-button text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-transform text-lg">
            {t("modal.connect")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GloveDiscoveryModal;
