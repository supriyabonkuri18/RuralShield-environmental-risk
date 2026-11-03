import { describe, expect, it } from "vitest";
import { buildRecommendations } from "./recommendations";

const dry = { rain_24h_mm: 0, rain_7d_mm: 1, temp_mean_c: 39, humidity_pct: 20, soil_moisture_m3m3: 0.05 };

describe("buildRecommendations", () => {
  it("is labelled indicator-based when no model prediction exists", () => {
    const r = buildRecommendations(dry);
    expect(r.basis).toBe("indicators");
    expect(r.drought.some((x) => x.reason.includes("Model"))).toBe(false);
  });
  it("adds heavy-rain advice at 50 mm in 24 h", () => {
    const r = buildRecommendations({ ...dry, rain_24h_mm: 50 });
    expect(r.flood.some((x) => x.reason.includes("50 mm"))).toBe(true);
  });
});
