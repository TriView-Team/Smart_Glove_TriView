import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarIcon, Radio, FlaskConical, History as HistoryIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  fabricTranslations,
  colorTranslations,
  patternTranslations,
  textureTranslations,
  translateValue,
} from "@/i18n/translations";

type Row = {
  id: string;
  created_at: string;
  fabric_type: string | null;
  color: string | null;
  pattern: string | null;
  texture: string | null;
  is_live: boolean;
  confidence: number | null;
};

type SourceFilter = "all" | "live" | "mock";

const HistoryScreen = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [source, setSource] = useState<SourceFilter>("all");
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();

  const tv = (value: string | null, map: Record<string, Record<"en" | "ar", string>>) =>
    value ? translateValue(value, map, lang) : "—";

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setSignedIn(!!user);
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("recognition_results")
      .select("id, created_at, fabric_type, color, pattern, texture, is_live, confidence")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      toast.error("Failed to load history");
      console.error(error);
    }
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (source === "live" && !r.is_live) return false;
      if (source === "mock" && r.is_live) return false;
      const created = new Date(r.created_at);
      if (from) {
        const f = new Date(from); f.setHours(0, 0, 0, 0);
        if (created < f) return false;
      }
      if (to) {
        const t = new Date(to); t.setHours(23, 59, 59, 999);
        if (created > t) return false;
      }
      return true;
    });
  }, [rows, source, from, to]);

  const clearFilters = () => { setSource("all"); setFrom(undefined); setTo(undefined); };

  const remove = async (id: string) => {
    const { error } = await supabase.from("recognition_results").delete().eq("id", id);
    if (error) { toast.error("Delete failed"); return; }
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Removed");
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-12 pb-28">
      <button onClick={() => navigate("/wardrobe")} className="mb-4 text-muted-foreground">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="flex items-center gap-2 mb-5">
        <HistoryIcon className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Detection History</h1>
      </div>

      {/* Source filter */}
      <div className="flex gap-2 mb-3">
        {(["all", "live", "mock"] as SourceFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setSource(s)}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
              source === s ? "gradient-button text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {s === "live" && <Radio className="w-3.5 h-3.5" />}
            {s === "mock" && <FlaskConical className="w-3.5 h-3.5" />}
            {s === "all" ? "All" : s === "live" ? "Live (BLE)" : "Mock"}
          </button>
        ))}
      </div>

      {/* Date range */}
      <div className="flex gap-2 mb-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("flex-1 justify-start text-xs font-normal", !from && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {from ? format(from, "PP") : "From"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={from} onSelect={setFrom} initialFocus className={cn("p-3 pointer-events-auto")} />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("flex-1 justify-start text-xs font-normal", !to && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {to ? format(to, "PP") : "To"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={to} onSelect={setTo} initialFocus className={cn("p-3 pointer-events-auto")} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-xs text-muted-foreground">{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
        {(source !== "all" || from || to) && (
          <button onClick={clearFilters} className="text-xs text-primary underline">Clear filters</button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <p className="text-center text-muted-foreground mt-12">Loading…</p>
      ) : signedIn === false ? (
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">Sign in to view your detection history.</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground mt-12">No detections match these filters.</p>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((r) => (
            <li key={r.id} className="glass-card p-3 flex items-start gap-3 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => navigate(`/history/${r.id}`)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1",
                    r.is_live ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                  )}>
                    {r.is_live ? <Radio className="w-2.5 h-2.5" /> : <FlaskConical className="w-2.5 h-2.5" />}
                    {r.is_live ? "Live" : "Mock"}
                  </span>
                  {r.confidence !== null && (
                    <span className="text-[10px] text-muted-foreground">
                      {Math.round(r.confidence * 100)}%
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {format(new Date(r.created_at), "PP p")}
                  </span>
                </div>
                <div className="text-sm text-foreground truncate">
                  <span className="font-medium">{tv(r.color, colorTranslations)}</span>
                  <span className="text-muted-foreground"> · </span>
                  {tv(r.fabric_type, fabricTranslations)}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {tv(r.pattern, patternTranslations)} · {tv(r.texture, textureTranslations)}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); remove(r.id); }}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <BottomNav />
    </div>
  );
};

export default HistoryScreen;
