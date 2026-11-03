import type { HazardPrediction, Indicators } from "./ruralshield";

export type Rec = { text: string; reason: string };
export type RecSet = { flood: Rec[]; drought: Rec[]; basis: "model" | "indicators" };

const HIGH = new Set(["High", "Very High"]);

/** Illustrative guidance from model levels (if present) plus observed indicators. */
export function buildRecommendations(
  ind: Indicators,
  pred?: { flood: HazardPrediction; drought: HazardPrediction },
): RecSet {
  const flood: Rec[] = [];
  const drought: Rec[] = [];
  const fl = pred?.flood.level;
  const dl = pred?.drought.level;

  if (fl && HIGH.has(fl)) {
    flood.push({ text: "Check official flood bulletins and local authority messages frequently.", reason: `Model flood output: ${fl}.` });
    flood.push({ text: "Move documents, seed stock and stored grain to raised, dry places.", reason: `Model flood output: ${fl}.` });
  } else if (fl === "Moderate") {
    flood.push({ text: "Keep an eye on official forecasts over the next few days.", reason: "Model flood output: Moderate." });
  }
  if (ind.rain_24h_mm >= 50) flood.push({ text: "Avoid crossing flowing water on foot or by vehicle.", reason: `${ind.rain_24h_mm} mm of rain in the last 24 h.` });
  if (ind.rain_7d_mm >= 150) flood.push({ text: "Clear field and yard drainage channels where it is safe to do so.", reason: `${ind.rain_7d_mm} mm of rain over 7 days.` });
  if (ind.soil_moisture_m3m3 >= 0.4) flood.push({ text: "Delay irrigation; the topsoil is likely already saturated.", reason: `Estimated topsoil moisture ${ind.soil_moisture_m3m3} m³/m³.` });
  if (flood.length === 0) flood.push({ text: "Good time for preparedness: keep an emergency kit and family contact list ready.", reason: fl ? `Model flood output: ${fl}; rainfall indicators are not elevated.` : "Rainfall indicators are not elevated." });

  if (dl && HIGH.has(dl)) {
    drought.push({ text: "Prioritise stored water for drinking and livestock.", reason: `Model drought output: ${dl}.` });
    drought.push({ text: "Irrigate in early morning or evening and mulch to reduce evaporation.", reason: `Model drought output: ${dl}.` });
  } else if (dl === "Moderate") {
    drought.push({ text: "Check tanks and pipes for leaks and plan water use for the coming week.", reason: "Model drought output: Moderate." });
  }
  if (ind.rain_7d_mm < 5) drought.push({ text: "Consider drip or furrow irrigation instead of flooding fields.", reason: `Only ${ind.rain_7d_mm} mm of rain in 7 days.` });
  if (ind.temp_mean_c >= 35) drought.push({ text: "Provide shade and water for livestock during the hottest hours.", reason: `Mean temperature ${ind.temp_mean_c} °C.` });
  if (ind.soil_moisture_m3m3 < 0.12) drought.push({ text: "Check soil before sowing; topsoil looks dry.", reason: `Estimated topsoil moisture ${ind.soil_moisture_m3m3} m³/m³.` });
  if (drought.length === 0) drought.push({ text: "Everyday conservation: harvest rooftop rainwater and fix leaks.", reason: dl ? `Model drought output: ${dl}; dryness indicators are not elevated.` : "Dryness indicators are not elevated." });

  return { flood, drought, basis: pred ? "model" : "indicators" };
}
