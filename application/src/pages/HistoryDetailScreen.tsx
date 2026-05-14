import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Radio, FlaskConical, Trash2, Volume2, Copy, Link2, Link2Off, Check } from "lucide-react";
import { format } from "date-fns";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/hooks/useI18n";
import { useTTS } from "@/hooks/useTTS";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  fabricTranslations,
  colorTranslations,
  patternTranslations,
  textureTranslations,
  translateValue,
} from "@/i18n/translations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Row = {
  id: string;
  user_id: string;
  wardrobe_id: string | null;
  created_at: string;
  fabric_type: string | null;
  color: string | null;
  pattern: string | null;
  texture: string | null;
  is_live: boolean;
  confidence: number | null;
};

type WardrobeItem = {
  id: string;
  item_name: string;
  color: string | null;
  fabric_type: string | null;
};

const Field = ({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) => (
  <div className="flex items-start justify-between gap-3 py-2.5 border-b border-border/50 last:border-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className={cn("text-sm text-foreground text-right break-all", mono && "font-mono text-xs")}>
      {value ?? "—"}
    </span>
  </div>
);

const ScoreBar = ({ label, value }: { label: string; value: number }) => {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-mono text-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full gradient-button transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const HistoryDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useI18n();
  const { speak } = useTTS();

  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [linkOpen, setLinkOpen] = useState(false);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [loadingWardrobe, setLoadingWardrobe] = useState(false);
  const [linking, setLinking] = useState(false);

  const tv = (value: string | null, map: Record<string, Record<"en" | "ar", string>>) =>
    value ? translateValue(value, map, lang) : "—";

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("recognition_results")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) {
        toast.error("Failed to load detection");
        console.error(error);
      }
      if (!data) setNotFound(true);
      setRow(data as Row | null);
      setLoading(false);
    })();
  }, [id]);

  // Derive a transparent confidence breakdown from the single overall score.
  // Each field gets the overall confidence as its baseline; if a field is
  // missing it scores 0. This gives a per-attribute view without inventing data.
  const breakdown = useMemo(() => {
    if (!row) return [];
    const base = row.confidence ?? 0;
    return [
      { key: "Fabric", present: !!row.fabric_type, raw: row.fabric_type ? base : 0 },
      { key: "Color", present: !!row.color, raw: row.color ? base : 0 },
      { key: "Pattern", present: !!row.pattern, raw: row.pattern ? base : 0 },
      { key: "Texture", present: !!row.texture, raw: row.texture ? base : 0 },
    ];
  }, [row]);

  const handleSpeak = () => {
    if (!row) return;
    const desc = `${t("detection.itemIs")} ${tv(row.color, colorTranslations)}, ${tv(row.fabric_type, fabricTranslations)} ${t("detection.fabricWord")}, ${tv(row.texture, textureTranslations)} ${t("detection.textureWord")}, ${tv(row.pattern, patternTranslations)} ${t("detection.patternWord")}.`;
    speak(desc, lang);
  };

  const handleDelete = async () => {
    if (!row) return;
    const { error } = await supabase.from("recognition_results").delete().eq("id", row.id);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Detection removed");
    navigate("/history");
  };

  const copyId = () => {
    if (!row) return;
    navigator.clipboard.writeText(row.id);
    toast.success("ID copied");
  };

  const openLinkDialog = async () => {
    setLinkOpen(true);
    if (wardrobe.length > 0) return;
    setLoadingWardrobe(true);
    const { data, error } = await supabase
      .from("wardrobe")
      .select("id, item_name, color, fabric_type")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load wardrobe");
    } else {
      setWardrobe((data ?? []) as WardrobeItem[]);
    }
    setLoadingWardrobe(false);
  };

  const linkTo = async (wardrobeId: string | null) => {
    if (!row) return;
    setLinking(true);
    const { error } = await supabase
      .from("recognition_results")
      .update({ wardrobe_id: wardrobeId })
      .eq("id", row.id);
    setLinking(false);
    if (error) {
      toast.error("Failed to update link");
      return;
    }
    setRow({ ...row, wardrobe_id: wardrobeId });
    toast.success(wardrobeId ? "Linked to wardrobe item" : "Link removed");
    setLinkOpen(false);
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-12 pb-28">
      <button onClick={() => navigate("/history")} className="mb-4 text-muted-foreground" aria-label="Back">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-5">Detection Details</h1>

      {loading ? (
        <p className="text-center text-muted-foreground mt-12">Loading…</p>
      ) : notFound || !row ? (
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-muted-foreground">This detection no longer exists.</p>
        </div>
      ) : (
        <>
          {/* Source + confidence header */}
          <div className="glass-card p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs px-2 py-1 rounded-full flex items-center gap-1.5",
                row.is_live ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
              )}>
                {row.is_live ? <Radio className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
                {row.is_live ? "Live (BLE)" : "Mock"}
              </span>
              {row.confidence !== null && (
                <span className="text-xs text-muted-foreground">
                  {Math.round(row.confidence * 100)}% confidence
                </span>
              )}
            </div>
            <button
              onClick={handleSpeak}
              className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Play audio description"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Recognition fields */}
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">Recognition</h2>
          <div className="glass-card px-4 py-1 mb-4">
            <Field label="Fabric" value={tv(row.fabric_type, fabricTranslations)} />
            <Field label="Color" value={tv(row.color, colorTranslations)} />
            <Field label="Pattern" value={tv(row.pattern, patternTranslations)} />
            <Field label="Texture" value={tv(row.texture, textureTranslations)} />
          </div>

          {/* Confidence breakdown */}
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Confidence breakdown
          </h2>
          <div className="glass-card px-4 py-3 mb-4">
            {row.confidence === null ? (
              <p className="text-xs text-muted-foreground py-2">
                No confidence score reported by the device for this detection.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                  <span className="text-sm text-foreground font-medium">Overall</span>
                  <span className="text-sm font-mono text-primary">
                    {(row.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                {breakdown.map((b) => (
                  <ScoreBar key={b.key} label={b.key} value={b.raw} />
                ))}
                <p className="text-[10px] text-muted-foreground mt-2 leading-snug">
                  Per-field scores reflect the device's overall confidence applied to each
                  reported attribute. Fields with no value score 0%.
                </p>
              </>
            )}
          </div>

          {/* Wardrobe link */}
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Wardrobe
          </h2>
          <div className="glass-card px-4 py-3 mb-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-foreground">
                {row.wardrobe_id ? "Linked to a wardrobe item" : "Not linked"}
              </p>
              {row.wardrobe_id && (
                <p className="text-[11px] font-mono text-muted-foreground truncate">
                  {row.wardrobe_id}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {row.wardrobe_id && (
                <button
                  onClick={() => linkTo(null)}
                  disabled={linking}
                  className="w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
                  aria-label="Unlink"
                >
                  <Link2Off className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={openLinkDialog}
                className="px-3 h-9 rounded-full gradient-button text-primary-foreground text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-transform"
              >
                <Link2 className="w-3.5 h-3.5" />
                {row.wardrobe_id ? "Change" : "Link item"}
              </button>
            </div>
          </div>

          {/* Metadata */}
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">Metadata</h2>
          <div className="glass-card px-4 py-1 mb-6">
            <Field
              label="Detected at"
              value={format(new Date(row.created_at), "PPpp")}
            />
            <Field
              label="Confidence"
              value={row.confidence !== null ? `${(row.confidence * 100).toFixed(1)}%` : "—"}
            />
            <Field label="Source" value={row.is_live ? "BLE stream" : "Mock fallback"} />
            <Field
              label="Wardrobe link"
              value={row.wardrobe_id ?? "Not linked"}
              mono={!!row.wardrobe_id}
            />
            <Field
              label="Record ID"
              value={
                <button onClick={copyId} className="inline-flex items-center gap-1.5 text-primary">
                  <span className="font-mono text-xs">{row.id.slice(0, 8)}…</span>
                  <Copy className="w-3 h-3" />
                </button>
              }
            />
          </div>

          <button
            onClick={handleDelete}
            className="w-full border border-destructive text-destructive font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Trash2 className="w-4 h-4" />
            Delete detection
          </button>
        </>
      )}

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Link to wardrobe item</DialogTitle>
          </DialogHeader>
          {loadingWardrobe ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
          ) : wardrobe.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No wardrobe items yet. Add items in your wardrobe first.
            </p>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto -mx-2 px-2">
              {wardrobe.map((w) => {
                const selected = w.id === row?.wardrobe_id;
                return (
                  <button
                    key={w.id}
                    onClick={() => linkTo(w.id)}
                    disabled={linking}
                    className={cn(
                      "w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border mb-1.5 transition-colors active:scale-[0.99]",
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{w.item_name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {[w.color, w.fabric_type].filter(Boolean).join(" · ") || "No details"}
                      </p>
                    </div>
                    {selected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default HistoryDetailScreen;
