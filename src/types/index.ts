// Types for the real astrological data from data.json

export type AstroBodies = {
  Sun: string;
  Moon: string;
  Mercury: string;
  Venus: string;
  Mars: string;
  Jupiter: string;
  Saturn: string;
  Uranus: string;
  Neptune: string;
  Pluto: string;
  "North Node": string;
};

export type AstroDate = {
  date: string; // e.g., "July 25, 2025"
  weekday: string; // e.g., "Friday"
  bodies: AstroBodies;
  notes: string[];
  sources_inline: string[];
};

export type AstroYear = {
  summary: string;
  dates: AstroDate[];
};

export type AstroData = {
  metadata: {
    description: string;
    sources: {
      planetary_positions: string[];
      moon_phase_context: string[];
    };
  };
  data: Record<string, AstroYear>;
  overall_sources_note: string;
};

// Types for rational.json (plain-English meanings)
export type MeaningSignals = {
  moon_sign?: string;
  mercury_state?: "retrograde" | "direct" | "station" | string;
  tone?: string[];
  discipline?: "low" | "moderate" | "good" | "strong" | string;
};

export type DateMeaning = {
  date: string; // exact string match with AstroDate.date
  headline: string;
  tags: string[];
  strengths: string[];
  cautions: string[];
  suitability: string; // e.g., "High", "Medium–High", etc.
  signals?: MeaningSignals;
};

export type RationalData = {
  meta: {
    version: string;
    generated_for: string;
    interpretation_notes?: string;
  };
  meanings: Record<string, DateMeaning[]>;
};

// Types for descriptions.json (test-day feel + why + advice)
export type DateDescription = {
  date: string; // exact match with AstroDate.date
  feel: string; // short sentence
  why: string; // short sentence
  advice: string[]; // 2-4 short bullets
};

export type DescriptionsData = {
  meta: {
    version: string;
    generated_for: string;
    note?: string;
  };
  descriptions: Record<string, DateDescription[]>; // year -> array
};

// Types for astro_copy.json (horoscope-style text)
export type DateAstroCopy = {
  date: string; // exact match with AstroDate.date
  text: string; // 3–4 sentence plain text block
};

export type AstroCopyData = {
  meta: {
    version: string;
    generated_for: string;
    note?: string;
  };
  astro_copy: Record<string, DateAstroCopy[]>; // year -> list
};

// Merged types
export type MergedDate = AstroDate & {
  meaning?: DateMeaning; // optional; undefined if not found
  description?: DateDescription; // optional; undefined if not found
  astroCopy?: DateAstroCopy; // optional; undefined if not found
};

export type YearView = {
  year: string;
  summary: string;
  dates: MergedDate[];
};

// Legacy types for compatibility
export interface PlanetaryBodies extends AstroBodies {}
export interface MCATTestDate extends AstroDate {}
export interface YearData extends AstroYear {}
export interface AstrologicalData extends AstroData {}

// Utility types for processing and scoring
export interface ProcessedDate extends MergedDate {
  score: number;
  badges: string[];
  why: string[];
  mercuryStatus: "direct" | "retrograde" | "stationary";
  isMercuryRetrograde: boolean;
  year: string;
}

export interface UserPreferences {
  birthDate?: Date;
  birthTime?: string;
  city?: string;
  country?: string;
  energyPreference?: number; // 0-100
  riskTolerance?: number; // 0-100
  scoreReleaseStart?: Date;
  scoreReleaseEnd?: Date;
  timezone?: string;
  selectedYear?: string;
}

// Helper type for Mercury status detection
export interface MercuryInfo {
  status: "direct" | "retrograde" | "stationary";
  isRetrograde: boolean;
  badges: string[];
}
