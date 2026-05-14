import { Eye } from "lucide-react";

interface TriviewLogoProps {
  size?: "sm" | "md" | "lg";
  light?: boolean;
}

const sizeMap = {
  sm: { icon: 32, text: "text-xl" },
  md: { icon: 56, text: "text-3xl" },
  lg: { icon: 80, text: "text-5xl" },
};

const TriviewLogo = ({ size = "md", light = false }: TriviewLogoProps) => {
  const s = sizeMap[size];
  const color = light ? "text-white" : "text-foreground";
  const dotColor = light ? "bg-white/70" : "bg-foreground/60";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Eye className={color} size={s.icon} strokeWidth={1.5} />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 space-y-0.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-0.5 justify-center">
              {[...Array(4 + i)].map((_, j) => (
                <div key={j} className={`w-1 h-1 rounded-full ${dotColor}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <h1 className={`${s.text} font-bold tracking-tight ${color}`}>Triview</h1>
    </div>
  );
};

export default TriviewLogo;
