import { useNavigate } from "react-router-dom";
import { Bluetooth, BluetoothSearching, BluetoothConnected, CheckCircle2, AlertCircle, ArrowLeft, RotateCw } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useGlove } from "@/hooks/useGlove";
import { useI18n } from "@/hooks/useI18n";

const ConnectScreen = () => {
  const navigate = useNavigate();
  const { connected, connect, disconnect, state, deviceName, error, supported, retry } = useGlove();
  const { t } = useI18n();

  const isScanning = state === "scanning";
  const isConnecting = state === "connecting";
  const isError = state === "error";

  if (connected) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
        <div className="w-24 h-24 gradient-button rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
          <CheckCircle2 className="w-14 h-14 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">{t("connect.pairingSuccess")}</h1>
        {deviceName && <p className="text-sm text-muted-foreground mb-8">{deviceName}</p>}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => navigate("/wardrobe")}
            className="gradient-button text-primary-foreground font-semibold py-3 rounded-xl active:scale-95 transition-transform"
          >
            {t("connect.continue")}
          </button>
          <button
            onClick={disconnect}
            className="border border-destructive text-destructive font-medium py-3 rounded-xl active:scale-95 transition-transform"
          >
            {t("connect.disconnect")}
          </button>
        </div>
      </div>
    );
  }

  const renderIcon = () => {
    if (isError) return <AlertCircle className="w-10 h-10 text-destructive-foreground" />;
    if (isConnecting) return <BluetoothConnected className="w-10 h-10 text-primary-foreground animate-pulse" />;
    if (isScanning) return <BluetoothSearching className="w-10 h-10 text-primary-foreground animate-pulse" />;
    return <Bluetooth className="w-10 h-10 text-primary-foreground" />;
  };

  const statusLine = () => {
    if (!supported) return "Web Bluetooth not supported on this browser. Use Chrome on Android or desktop.";
    if (isError) return error ?? "Connection failed";
    if (isConnecting) return `Connecting${deviceName ? ` to ${deviceName}` : "..."}`;
    if (isScanning) return t("connect.scanning");
    return t("connect.makesSure");
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-12 pb-28">
      <button onClick={() => navigate(-1)} className="mb-4 text-muted-foreground" aria-label="Back">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="bg-gradient-to-b from-secondary/30 to-primary/20 rounded-2xl p-4 mb-6">
        <p className="text-sm text-foreground/80 flex items-center gap-2">
          <Volume2Icon />
          {t("connect.wearGlove")}
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 mt-8">
        <div className="relative">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isError ? "bg-destructive" : "gradient-button"}`}>
            {renderIcon()}
          </div>
          {(isScanning || isConnecting) && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" />
              <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
            </>
          )}
        </div>

        <p className={`text-sm text-center max-w-[280px] ${isError ? "text-destructive" : "text-muted-foreground"}`}>
          {statusLine()}
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          {isError ? (
            <button
              onClick={retry}
              disabled={!supported}
              className="gradient-button text-primary-foreground font-semibold py-3 rounded-xl active:scale-95 transition-transform shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RotateCw className="w-4 h-4" />
              Retry
            </button>
          ) : (
            <button
              onClick={connect}
              disabled={isScanning || isConnecting || !supported}
              className="gradient-button text-primary-foreground font-semibold py-3 rounded-xl active:scale-95 transition-transform shadow-lg shadow-primary/30 disabled:opacity-60"
            >
              {isScanning ? t("connect.scanning") : isConnecting ? "Connecting..." : t("connect.pairNow")}
            </button>
          )}
          {!isError && !isScanning && !isConnecting && (
            <button
              onClick={() => navigate("/pairing-guide")}
              className="bg-card border border-border text-foreground font-semibold py-3 rounded-xl active:scale-95 transition-transform"
            >
              Pairing Guide
            </button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

const Volume2Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

export default ConnectScreen;
