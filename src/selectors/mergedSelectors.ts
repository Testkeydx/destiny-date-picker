import type { MergedDate } from "@/types";

export const hasRx = (d: MergedDate): boolean =>
  d.meaning?.signals?.mercury_state === "retrograde" ||
  /retrograde/i.test(d.bodies.Mercury || "");

export const suitabilityBucket = (d: MergedDate): "High" | "Medium–High" | "Medium" | "Other" => {
  const s = d.meaning?.suitability || "";
  if (/^high\b/i.test(s)) return "High";
  if (/^medium–high\b/i.test(s) || /^medium-high\b/i.test(s)) return "Medium–High";
  if (/^medium\b/i.test(s)) return "Medium";
  return "Other";
};

export const getMercuryState = (d: MergedDate): "retrograde" | "direct" | "stationary" | "unknown" => {
  // First check meaning signals
  if (d.meaning?.signals?.mercury_state) {
    const state = d.meaning.signals.mercury_state.toLowerCase();
    if (state.includes("retrograde")) return "retrograde";
    if (state.includes("direct")) return "direct";
    if (state.includes("station")) return "stationary";
  }
  
  // Fallback to body text
  const mercuryText = d.bodies.Mercury?.toLowerCase() || "";
  if (mercuryText.includes("retrograde")) return "retrograde";
  if (mercuryText.includes("stationary")) return "stationary";
  if (mercuryText.includes("direct")) return "direct";
  
  return "unknown";
};
