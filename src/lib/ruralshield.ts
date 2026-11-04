export type Location = { id: string; name: string; region: string; lat: number; lon: number };

export const LOCATIONS: Location[] = [
  { id: "majuli", name: "Majuli", region: "Assam, India", lat: 26.95, lon: 94.17 },
  { id: "anantapur", name: "Anantapur", region: "Andhra Pradesh, India", lat: 14.68, lon: 77.6 },
  { id: "darbhanga", name: "Darbhanga", region: "Bihar, India", lat: 26.15, lon: 85.9 },
  { id: "barmer", name: "Barmer", region: "Rajasthan, India", lat: 25.75, lon: 71.39 },
  { id: "kurigram", name: "Kurigram", region: "Rangpur, Bangladesh", lat: 25.8, lon: 89.64 },
  { id: "turkana", name: "Lodwar", region: "Turkana, Kenya", lat: 3.12, lon: 35.6 },
  { id: "hyderabad", name: "Hyderabad", region: "Telangana, India", lat: 17.385, lon: 78.4867 },
  { id: "warangal", name: "Warangal", region: "Telangana, India", lat: 17.9689, lon: 79.5941 },
  { id: "karimnagar", name: "Karimnagar", region: "Telangana, India", lat: 18.4386, lon: 79.1288 },
  { id: "nizamabad", name: "Nizamabad", region: "Telangana, India", lat: 18.6725, lon: 78.0941 },
  { id: "khammam", name: "Khammam", region: "Telangana, India", lat: 17.2473, lon: 80.1514 },
    { id: "adilabad", name: "Adilabad", region: "Telangana, India", lat: 19.6641, lon: 78.532 },
  { id: "bhadradri-kothagudem", name: "Bhadradri Kothagudem", region: "Telangana, India", lat: 17.556, lon: 80.619 },
  { id: "hanumakonda", name: "Hanumakonda", region: "Telangana, India", lat: 18.000, lon: 79.580 },
  { id: "jagtial", name: "Jagtial", region: "Telangana, India", lat: 18.794, lon: 78.916 },
  { id: "jangaon", name: "Jangaon", region: "Telangana, India", lat: 17.726, lon: 79.152 },
  { id: "jayashankar-bhupalpally", name: "Jayashankar Bhupalpally", region: "Telangana, India", lat: 18.435, lon: 79.864 },
  { id: "jogulamba-gadwal", name: "Jogulamba Gadwal", region: "Telangana, India", lat: 16.234, lon: 77.795 },
  { id: "kamareddy", name: "Kamareddy", region: "Telangana, India", lat: 18.320, lon: 78.342 },
  { id: "kumuram-bheem-asifabad", name: "Kumuram Bheem Asifabad", region: "Telangana, India", lat: 19.358, lon: 79.291 },
  { id: "mahabubabad", name: "Mahabubabad", region: "Telangana, India", lat: 17.598, lon: 80.005 },
  { id: "mahabubnagar", name: "Mahabubnagar", region: "Telangana, India", lat: 16.748, lon: 78.003 },
  { id: "mancherial", name: "Mancherial", region: "Telangana, India", lat: 18.871, lon: 79.444 },
  { id: "medak", name: "Medak", region: "Telangana, India", lat: 18.045, lon: 78.261 },
  { id: "medchal-malkajgiri", name: "Medchal-Malkajgiri", region: "Telangana, India", lat: 17.630, lon: 78.481 },
  { id: "mulugu", name: "Mulugu", region: "Telangana, India", lat: 18.192, lon: 79.943 },
  { id: "nagarkurnool", name: "Nagarkurnool", region: "Telangana, India", lat: 16.483, lon: 78.324 },
  { id: "nalgonda", name: "Nalgonda", region: "Telangana, India", lat: 17.057, lon: 79.268 },
  { id: "narayanpet", name: "Narayanpet", region: "Telangana, India", lat: 16.747, lon: 77.497 },
  { id: "nirmal", name: "Nirmal", region: "Telangana, India", lat: 19.096, lon: 78.344 },
  { id: "peddapalli", name: "Peddapalli", region: "Telangana, India", lat: 18.613, lon: 79.374 },
  { id: "rajanna-sircilla", name: "Rajanna Sircilla", region: "Telangana, India", lat: 18.389, lon: 78.810 },
  { id: "rangareddy", name: "Rangareddy", region: "Telangana, India", lat: 17.320, lon: 78.150 },
  { id: "sangareddy", name: "Sangareddy", region: "Telangana, India", lat: 17.624, lon: 78.086 },
  { id: "siddipet", name: "Siddipet", region: "Telangana, India", lat: 18.101, lon: 78.852 },
  { id: "suryapet", name: "Suryapet", region: "Telangana, India", lat: 17.141, lon: 79.623 },
  { id: "vikarabad", name: "Vikarabad", region: "Telangana, India", lat: 17.338, lon: 77.904 },
  { id: "wanaparthy", name: "Wanaparthy", region: "Telangana, India", lat: 16.362, lon: 78.062 },
  { id: "yadadri-bhuvanagiri", name: "Yadadri Bhuvanagiri", region: "Telangana, India", lat: 17.515, lon: 78.885 },
 ];

export type DailyPoint = { date: string; rain: number; temp: number | null };

export type Indicators = {
  rain_24h_mm: number;
  rain_7d_mm: number;
  temp_mean_c: number;
  humidity_pct: number;
  soil_moisture_m3m3: number;
};

export type EnvData = {
  indicators: Indicators;
  daily: DailyPoint[];
  fetchedAt: string;
  source: string;
  kind: "observed" | "demo";
  soilEstimated: boolean;
};

export async function fetchWeather(loc: Location): Promise<EnvData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}` +
    `&hourly=precipitation,temperature_2m,relative_humidity_2m,soil_moisture_0_to_1cm` +
    `&daily=precipitation_sum,temperature_2m_mean&past_days=7&forecast_days=1&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather service returned ${res.status}`);
  const j = await res.json();
  const times: string[] = j.hourly.time;
  const now = Date.now();
  const past = times.map((t, i) => ({ t: new Date(t).getTime(), i })).filter((p) => p.t <= now);
  if (past.length < 24) throw new Error("Not enough recent weather data");
  const last = past.slice(-24).map((p) => p.i);
  const week = past.slice(-168).map((p) => p.i);
  const sum = (idx: number[], arr: (number | null)[]) => idx.reduce((s, i) => s + (arr[i] ?? 0), 0);
  const mean = (idx: number[], arr: (number | null)[]) => {
    const v = idx.map((i) => arr[i]).filter((x): x is number => x != null);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
  };
  const soil = mean(last, j.hourly.soil_moisture_0_to_1cm);
  const daily: DailyPoint[] = j.daily.time.slice(0, 7).map((d: string, i: number) => ({
    date: d,
    rain: j.daily.precipitation_sum[i] ?? 0,
    temp: j.daily.temperature_2m_mean[i],
  }));
  return {
    indicators: {
      rain_24h_mm: round(sum(last, j.hourly.precipitation)),
      rain_7d_mm: round(sum(week, j.hourly.precipitation)),
      temp_mean_c: round(mean(last, j.hourly.temperature_2m)),
      humidity_pct: round(mean(last, j.hourly.relative_humidity_2m)),
      soil_moisture_m3m3: Number.isNaN(soil) ? 0.2 : Math.round(soil * 1000) / 1000,
    },
    daily,
    fetchedAt: new Date().toISOString(),
    source: "Open-Meteo forecast API (model-analysed weather, ~hourly)",
    kind: "observed",
    soilEstimated: true,
  };
}

const round = (n: number) => Math.round(n * 10) / 10;

export function demoData(scenario: "wet" | "dry"): EnvData {
  const today = new Date();
  const daily = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - 6 + i);
    return {
      date: d.toISOString().slice(0, 10),
      rain: (scenario === "wet" ? [12, 30, 22, 41, 18, 55, 70] : [0, 0, 1.2, 0, 0, 0, 0.4])[i] ?? 0,
      temp: (scenario === "wet" ? [26, 25, 25, 24, 25, 24, 24] : [36, 38, 39, 37, 40, 41, 39])[i] ?? null,
    };
  });
  return {
    indicators:
      scenario === "wet"
        ? { rain_24h_mm: 70, rain_7d_mm: 248, temp_mean_c: 24.5, humidity_pct: 92, soil_moisture_m3m3: 0.44 }
        : { rain_24h_mm: 0.4, rain_7d_mm: 1.6, temp_mean_c: 39, humidity_pct: 22, soil_moisture_m3m3: 0.06 },
    daily,
    fetchedAt: new Date().toISOString(),
    source: `Demo scenario (${scenario === "wet" ? "heavy monsoon week" : "hot dry spell"}) — made-up values`,
    kind: "demo",
    soilEstimated: true,
  };
}

export type HazardPrediction = {
  level: "Low" | "Moderate" | "High" | "Very High";
  probabilities: Record<string, number>;
  top_factors: { feature: keyof Indicators; importance: number }[];
};
export type PredictionResponse = {
  model: string;
  training_data: string;
  disclaimer: string;
  predictions: { flood: HazardPrediction; drought: HazardPrediction };
};

export const DEFAULT_API_URL =
  (import.meta.env["VITE_RISK_API_URL"] as string | undefined) ?? "http://localhost:8000";

export async function predictRisk(apiUrl: string, ind: Indicators): Promise<PredictionResponse> {
  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ind),
  });
  if (!res.ok) throw new Error(`Model API returned ${res.status}`);
  return res.json();
}

export const FEATURE_LABELS: Record<keyof Indicators, string> = {
  rain_24h_mm: "Rainfall, last 24 h",
  rain_7d_mm: "Rainfall, last 7 days",
  temp_mean_c: "Mean temperature, 24 h",
  humidity_pct: "Mean humidity, 24 h",
  soil_moisture_m3m3: "Topsoil moisture (estimated)",
};

export const LEVEL_MEANING: Record<string, string> = {
  Low: "Conditions look ordinary for this hazard based on the indicators.",
  Moderate: "Some indicators are elevated. Worth keeping an eye on official forecasts.",
  High: "Several indicators point toward this hazard. Check official local sources.",
  "Very High": "Indicators strongly resemble the model's high-risk pattern. Rely on official alerts.",
};
