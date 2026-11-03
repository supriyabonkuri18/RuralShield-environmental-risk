import { Droplets, Sun, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FEATURE_LABELS, LEVEL_MEANING, type HazardPrediction } from "@/lib/ruralshield";

const LEVEL_STYLE: Record<string, string> = {
  Low: "bg-risk-low text-primary-foreground",
  Moderate: "bg-risk-moderate text-foreground",
  High: "bg-risk-high text-foreground",
  "Very High": "bg-risk-veryhigh text-primary-foreground",
};
const ORDER = ["Low", "Moderate", "High", "Very High"];

type Props = {
  hazard: "flood" | "drought";
  prediction?: HazardPrediction;
  loading: boolean;
  error?: string | null;
};

export function RiskCard({ hazard, prediction, loading, error }: Props) {
  const Icon = hazard === "flood" ? Droplets : Sun;
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={hazard === "flood" ? "h-5 w-5 text-water" : "h-5 w-5 text-sun"} />
          <h3 className="text-xl font-semibold capitalize">{hazard} risk</h3>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          Model prediction
        </span>
      </div>

      {loading && (
        <div className="mt-6 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Asking the Python model…
        </div>
      )}

      {!loading && error && (
        <div className="mt-6 flex gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>No prediction: the Python model service isn't reachable. Indicators below are still shown.</span>
        </div>
      )}

      {!loading && !error && prediction && (
        <>
          <div className={`mt-5 inline-block rounded-lg px-4 py-2 text-2xl font-bold ${LEVEL_STYLE[prediction.level]}`}>
            {prediction.level}
          </div>
          <p className="mt-3 text-sm">{LEVEL_MEANING[prediction.level]}</p>

          <div className="mt-4 space-y-1.5">
            {ORDER.map((l) => {
              const p = prediction.probabilities[l] ?? 0;
              return (
                <div key={l} className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-muted-foreground">{l}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${p * 100}%` }} />
                  </div>
                  <span className="w-10 text-right tabular-nums">{Math.round(p * 100)}%</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border-t pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Indicators the model leans on most
            </p>
            <ul className="mt-1 text-sm">
              {prediction.top_factors.map((f) => (
                <li key={f.feature}>
                  {FEATURE_LABELS[f.feature] ?? f.feature}{" "}
                  <span className="text-muted-foreground">({Math.round(f.importance * 100)}% weight)</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </Card>
  );
}
