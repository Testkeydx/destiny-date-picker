import rational from "../../rationals.json";
import type { RationalData, DateMeaning } from "@/types";

export function getRational(): RationalData {
  return rational as unknown as RationalData;
}

export function getMeaningMapForYear(year: string): Map<string, DateMeaning> {
  const all = getRational().meanings?.[year] || [];
  return new Map(all.map(m => [m.date, m]));
}

export function getInterpretationNotes(): string | undefined {
  return getRational().meta?.interpretation_notes;
}
