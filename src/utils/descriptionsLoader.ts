import desc from "../../descriptions.json";
import type { DescriptionsData, DateDescription } from "@/types";

export function getDescriptions(): DescriptionsData {
  return desc as unknown as DescriptionsData;
}

export function getDescriptionMapForYear(year: string): Map<string, DateDescription> {
  const list = getDescriptions().descriptions?.[year] || [];
  return new Map(list.map(d => [d.date, d]));
}
