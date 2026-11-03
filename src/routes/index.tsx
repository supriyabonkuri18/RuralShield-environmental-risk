import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { buildRecommendations } from "@/lib/recommendations";
import type { HazardPrediction } from "@/lib/ruralshield";
const RiskMap = lazy(() => import("@/components/RiskMap"));

function Recommendations({ ind, pred }: { ind: Indicators; pred?: { flood: HazardPrediction; drought: HazardPrediction } | undefined }) {
  const r = buildRecommendations(ind, pred);
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-semibold">Recommended actions</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
          {r.basis === "model" ? "Based on model output + indicators" : "General guidance — not a model prediction"}
        </span>
      </div>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {(["flood", "drought"] as const).map((h) => (
          <div key={h}>
            <h3 className="text-lg font-semibold capitalize">{h}</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {r[h].map((x) => (
                <li key={x.text}>{x.text}<div className="text-xs text-muted-foreground">Why: {x.reason}</div></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Illustrative suggestions only, not official or validated advice (the model is trained on synthetic data). Always follow official local weather and disaster-management instructions.
      </p>
    </Card>
  );
}
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Leaf, Loader2, RefreshCw, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RiskCard } from "@/components/RiskCard";
import {
  DEFAULT_API_URL, FEATURE_LABELS, LOCATIONS, demoData, fetchWeather, predictRisk, type Indicators,
} from "@/lib/ruralshield";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RuralShield AI — Flood & drought risk explorer" },
      { name: "description", content: "Experimental dashboard exploring flood and drought risk for rural communities from weather indicators and a Python ML model." },
      { property: "og:title", content: "RuralShield AI — Flood & drought risk explorer" },
      { property: "og:description", content: "Explore illustrative flood and drought risk for rural communities, with explanations." },
    ],
  }),
  component: Dashboard,
});

type Mode = "live" | "demo-wet" | "demo-dry";
const UNITS: Record<keyof Indicators, string> = {
  rain_24h_mm: "mm", rain_7d_mm: "mm", temp_mean_c: "°C", humidity_pct: "%", soil_moisture_m3m3: "m³/m³",
};

function Dashboard() {
  const [locId, setLocId] = useState("anantapur");
  const [mode, setMode] = useState<Mode>("live");
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const loc = LOCATIONS.find((l) => l.id === locId)!;

  const env = useQuery({
    queryKey: ["env", locId, mode],
    queryFn: () => (mode === "live" ? fetchWeather(loc) : Promise.resolve(demoData(mode === "demo-wet" ? "wet" : "dry"))),
    retry: 1,
  });
  const risk = useQuery({
    queryKey: ["risk", apiUrl, env.data?.indicators],
    queryFn: () => predictRisk(apiUrl, env.data!.indicators),
    enabled: !!env.data,
    retry: false,
  });
  const riskLoading = env.isLoading || risk.isLoading;
  const riskError = env.isError ? "no data" : risk.isError ? (risk.error as Error).message : null;

  return (
    <div className="min-h-screen">
      <header className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <div className="flex items-center gap-2 text-sm opacity-90"><Leaf className="h-4 w-4" /> NeuralStorm 2026 · Green Planet</div>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">RuralShield AI</h1>
          <p className="mt-3 max-w-2xl opacity-90">
            An experimental explorer for possible flood and drought risk in rural communities — showing the weather
            indicators behind every result. Prototype only, not an official warning system.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <Card className="grid gap-4 p-5 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Community</label>
            <Select value={locId} onValueChange={setLocId}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((l) => <SelectItem key={l.id} value={l.id}>{l.name} — {l.region}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Data</label>
            <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Live weather (Open-Meteo)</SelectItem>
                <SelectItem value="demo-wet">Demo: heavy monsoon week</SelectItem>
                <SelectItem value="demo-dry">Demo: hot dry spell</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="api">Python model address</label>
            <div className="mt-1 flex gap-2">
              <Input id="api" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
              <Button variant="outline" size="icon" aria-label="Retry" onClick={() => { env.refetch(); risk.refetch(); }}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {mode !== "live" && (
          <p className="rounded-md bg-accent px-4 py-2 text-sm text-accent-foreground">
            Demo mode: indicator values are made up for illustration and don't depend on the selected community.
          </p>
        )}

        <section className="grid gap-6 md:grid-cols-2">
          <RiskCard hazard="flood" prediction={risk.data?.predictions.flood} loading={riskLoading} error={riskError} />
          <RiskCard hazard="drought" prediction={risk.data?.predictions.drought} loading={riskLoading} error={riskError} />
        </section>
        {risk.data && <p className="text-xs text-muted-foreground">{risk.data.model} · trained on {risk.data.training_data} data. {risk.data.disclaimer}</p>}
        {risk.isError && (
          <p className="text-xs text-muted-foreground">
            Start the model with <code>uvicorn api:app --port 8000</code> in the <code>python/</code> folder, or enter the address of a hosted copy above. ({riskError})
          </p>
        )}

        <Card className="p-5">
          <h2 className="text-2xl font-semibold">Community risk map</h2>
          <div className="mt-3">
            <ClientOnly fallback={<div className="h-72 rounded-lg bg-muted sm:h-96" />}>
              <Suspense fallback={<div className="h-72 rounded-lg bg-muted sm:h-96" />}>
                <RiskMap loc={loc} flood={risk.data?.predictions.flood.level} drought={risk.data?.predictions.drought.level} dataTime={env.data?.fetchedAt} />
              </Suspense>
            </ClientOnly>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            {[["Low", "bg-risk-low"], ["Moderate", "bg-risk-moderate"], ["High", "bg-risk-high"], ["Very High", "bg-risk-veryhigh"], ["No prediction", "bg-muted-foreground"]].map(([l, c]) => (
              <span key={l} className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded-full ${c}`} />{l}</span>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Marker colour = higher of the two model levels for the selected community only. Coordinates are approximate town centres. No risk is shown for surrounding areas.</p>
        </Card>

        {env.data && <Recommendations ind={env.data.indicators} pred={risk.data?.predictions} />}

        <Card className="p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-semibold">Environmental indicators</h2>
            {env.data && <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{env.data.kind === "observed" ? "Observed / analysed" : "Demo values"}</span>}
          </div>
          {env.isLoading && <div className="mt-4 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading weather…</div>}
          {env.isError && (
            <div className="mt-4 flex items-start gap-2 text-sm">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              <span>Couldn't load live weather ({(env.error as Error).message}). Try again or switch to a demo scenario.</span>
            </div>
          )}
          {env.data && (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {(Object.keys(FEATURE_LABELS) as (keyof Indicators)[]).map((k) => (
                  <div key={k} className="rounded-lg bg-muted p-3">
                    <div className="text-xs text-muted-foreground">{FEATURE_LABELS[k]}</div>
                    <div className="mt-1 text-xl font-semibold tabular-nums">{env.data.indicators[k]} <span className="text-sm font-normal">{UNITS[k]}</span></div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Source: {env.data.source}. Retrieved {new Date(env.data.fetchedAt).toLocaleString()}.
                {env.data.soilEstimated && " Soil moisture is a modelled estimate (0–1 cm layer), not a ground measurement."}
              </p>
            </>
          )}
        </Card>

        {env.data && (
          <section className="grid gap-6 md:grid-cols-2">
            <Card className="p-5">
              <h3 className="text-lg font-semibold">Daily rainfall (mm), last 7 days</h3>
              <div className="mt-3 h-56">
                <ResponsiveContainer>
                  <BarChart data={env.data.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} fontSize={12} />
                    <YAxis fontSize={12} unit=" mm" width={55} />
                    <Tooltip />
                    <Bar dataKey="rain" name="Rain (mm)" fill="var(--water)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-lg font-semibold">Daily mean temperature (°C), last 7 days</h3>
              <div className="mt-3 h-56">
                <ResponsiveContainer>
                  <LineChart data={env.data.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} fontSize={12} />
                    <YAxis fontSize={12} unit="°" width={40} domain={["auto", "auto"]} />
                    <Tooltip />
                    <Line dataKey="temp" name="Temp (°C)" stroke="var(--sun)" strokeWidth={2.5} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>
        )}

        <Card className="p-5">
          <h2 className="text-2xl font-semibold">About & limitations</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
            <li>RuralShield AI is a hackathon prototype. It is <strong>not</strong> an official weather or disaster warning system — always follow your local authorities and meteorological services.</li>
            <li>Risk levels come from a small scikit-learn model trained on <strong>synthetic</strong> data. Results are illustrative and have not been validated against real floods or droughts.</li>
            <li>Weather values are model-analysed data from Open-Meteo; soil moisture is an estimate. River levels, terrain, and local drainage are not considered.</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
