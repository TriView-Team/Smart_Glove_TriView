import { useI18n } from "@/hooks/useI18n";

interface ConnectionStatusProps {
  connected: boolean;
}

const ConnectionStatus = ({ connected }: ConnectionStatusProps) => {
  const { t } = useI18n();

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/50">
      <div className={`w-2 h-2 rounded-full ${connected ? "bg-[hsl(var(--success))]" : "bg-destructive"} ${connected ? "animate-pulse" : ""}`} />
      <span className="text-xs text-muted-foreground font-medium">
        {connected ? t("status.connected") : t("status.notConnected")}
      </span>
    </div>
  );
};

export default ConnectionStatus;
