import { useNavigate } from "react-router-dom";
import { Bluetooth } from "lucide-react";
import { useGlove } from "@/hooks/useGlove";

const TriviewLinkButton = () => {
  const navigate = useNavigate();
  const { connected } = useGlove();

  return (
    <button
      onClick={() => navigate("/connect")}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-card/60 backdrop-blur-sm active:scale-95 transition-transform -mt-1"
    >
      <div className={`w-2 h-2 rounded-full ${connected ? "bg-[hsl(var(--success))]" : "bg-destructive"} ${connected ? "animate-pulse" : ""}`} />
      <Bluetooth className="w-3.5 h-3.5 text-primary" />
      <span className="text-xs font-medium text-foreground">Triview</span>
    </button>
  );
};

export default TriviewLinkButton;
