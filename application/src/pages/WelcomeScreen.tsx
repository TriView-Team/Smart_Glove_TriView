import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import welcomeHero from "@/assets/welcome-hero.jpg";
import TriviewLogo from "@/components/TriviewLogo";

const WelcomeScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/wardrobe", { replace: true }), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden">
      <img
        src={welcomeHero}
        alt="Person using assistive technology"
        className="absolute inset-0 w-full h-full object-cover"
        width={512}
        height={1024}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,60%,30%)]/70 via-[hsl(210,70%,40%)]/60 to-[hsl(200,80%,50%)]/80" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-8">
        <div className="opacity-0 animate-[fade-in_1s_ease-out_0.3s_forwards]">
          <TriviewLogo size="lg" light />
        </div>
        <p className="text-xl text-white/90 font-light tracking-wide mt-2 opacity-0 animate-[fade-in_1s_ease-out_0.8s_forwards]">
          Welcome to Triview!
        </p>
        <div className="mt-6 flex items-center gap-2 opacity-0 animate-[fade-in_0.5s_ease-out_1.3s_forwards]">
          <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0s" }} />
          <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0.2s" }} />
          <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
