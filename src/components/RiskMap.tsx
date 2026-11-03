import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Location } from "@/lib/ruralshield";

const LEVEL_VAR: Record<string, string> = {
  Low: "var(--risk-low)", Moderate: "var(--risk-moderate)", High: "var(--risk-high)", "Very High": "var(--risk-veryhigh)",
};

type Props = { loc: Location; flood?: string | undefined; drought?: string | undefined; dataTime?: string | undefined };

export default function RiskMap({ loc, flood, drought, dataTime }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { scrollWheelZoom: false }).setView([loc.lat, loc.lon], 9);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18, attribution: "© OpenStreetMap contributors",
    }).addTo(map.current);
    return () => { map.current?.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const worst = [flood, drought].includes("Very High") ? "Very High" : [flood, drought].includes("High") ? "High"
      : [flood, drought].includes("Moderate") ? "Moderate" : flood || drought ? "Low" : null;
    const color = worst ? LEVEL_VAR[worst] : "var(--muted-foreground)";
    const icon = L.divIcon({
      className: "",
      html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:3px solid var(--card);box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
      iconSize: [22, 22], iconAnchor: [11, 11],
    });
    const fmt = (v?: string) => v ?? "unavailable";
    const html = `<strong>${loc.name}</strong>, ${loc.region}<br/>Flood: ${fmt(flood)}<br/>Drought: ${fmt(drought)}` +
      (flood || drought ? "" : "<br/><em>No model prediction</em>") +
      (dataTime ? `<br/><small>Weather data: ${new Date(dataTime).toLocaleString()}</small>` : "");
    marker.current?.remove();
    marker.current = L.marker([loc.lat, loc.lon], { icon }).addTo(m).bindPopup(html).openPopup();
    m.setView([loc.lat, loc.lon], 9);
  }, [loc, flood, drought, dataTime]);

  return <div ref={el} className="h-72 w-full overflow-hidden rounded-lg sm:h-96" />;
}
