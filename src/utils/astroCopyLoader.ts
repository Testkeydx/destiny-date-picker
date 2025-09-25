import copy from "../../astro_copy.json";
import type { AstroCopyData, DateAstroCopy } from "@/types";

export function getAstroCopy(): AstroCopyData {
  return copy as unknown as AstroCopyData;
}

export function getAstroCopyMapForYear(year: string): Map<string, DateAstroCopy> {
  const list = getAstroCopy().astro_copy?.[year] || [];
  return new Map(list.map(x => [x.date, x]));
}
