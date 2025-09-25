import { AstrologicalData, MCATTestDate, ProcessedDate, UserPreferences, MercuryInfo, AstroData, YearView, MergedDate } from "@/types";
import astroData from "../../data.json";
import { getMeaningMapForYear } from "./rationalLoader";
import { getDescriptionMapForYear } from "./descriptionsLoader";
import { getAstroCopyMapForYear } from "./astroCopyLoader";
import { calculatePersonalizedFactors, generatePersonalizedRecommendation } from "./natalCalculator";

/**
 * Load astrological data from data.json
 */
export function loadAstrologicalData(): AstrologicalData {
  return astroData as AstrologicalData;
}

/**
 * Load astrological data with new type system
 */
export function getAstroData(): AstroData {
  return astroData as unknown as AstroData;
}

/**
 * Get available years from the data
 */
export function getAvailableYears(): string[] {
  const data = loadAstrologicalData();
  return Object.keys(data.data).sort();
}

/**
 * List all available years with new type system
 */
export function listYears(): string[] {
  return Object.keys(getAstroData().data).sort();
}

/**
 * Get test dates for a specific year
 */
export function getTestDatesForYear(year: string): MCATTestDate[] {
  const data = loadAstrologicalData();
  return data.data[year]?.dates || [];
}

/**
 * Get all test dates from all years
 */
export function getAllTestDates(): { year: string; dates: MCATTestDate[] }[] {
  const data = loadAstrologicalData();
  return Object.entries(data.data).map(([year, yearData]) => ({
    year,
    dates: yearData.dates,
  }));
}

/**
 * Get merged year view with astrological data, rational meanings, descriptions, and astro copy
 */
export function getYearView(year: string): YearView {
  const base = getAstroData().data[year];
  const meaningMap = getMeaningMapForYear(year);
  const descMap = getDescriptionMapForYear(year);
  const copyMap = getAstroCopyMapForYear(year);

  const dates: MergedDate[] = (base?.dates ?? []).map(d => ({
    ...d,
    meaning: meaningMap.get(d.date),
    description: descMap.get(d.date),
    astroCopy: copyMap.get(d.date)
  }));

  return { year, summary: base?.summary ?? "", dates };
}

/**
 * Detect Mercury retrograde status from the Mercury field
 */
export function getMercuryStatus(mercuryText: string): MercuryInfo {
  const lowerText = mercuryText.toLowerCase();
  const badges: string[] = [];
  
  let status: "direct" | "retrograde" | "stationary" = "direct";
  let isRetrograde = false;
  
  if (lowerText.includes("retrograde")) {
    status = "retrograde";
    isRetrograde = true;
    badges.push("🔄 Mercury Retrograde");
  } else if (lowerText.includes("stationary")) {
    status = "stationary";
    isRetrograde = true;
    badges.push("🌀 Mercury Stationary");
  } else if (lowerText.includes("direct")) {
    status = "direct";
    badges.push("💫 Mercury Direct");
  } else {
    // Default to direct if not specified
    status = "direct";
    badges.push("💫 Mercury Direct");
  }
  
  return { status, isRetrograde, badges };
}

/**
 * Score a date based on user preferences and astrological factors
 */
export function scoreDate(
  testDate: MCATTestDate,
  year: string,
  userPreferences: UserPreferences
): ProcessedDate {
  let score = 50; // Base score
  const badges: string[] = [];
  const why: string[] = [];
  
  // Get Mercury status and add to badges
  const mercuryInfo = getMercuryStatus(testDate.bodies.Mercury);
  badges.push(...mercuryInfo.badges);
  
  // Score based on Mercury status
  if (mercuryInfo.status === "direct") {
    score += 15;
    why.push("Mercury direct supports clear thinking and communication");
  } else if (mercuryInfo.status === "retrograde") {
    score -= 20;
    why.push("Mercury retrograde may cause confusion or delays");
  } else if (mercuryInfo.status === "stationary") {
    score -= 10;
    why.push("Mercury stationary brings unpredictable energy");
  }
  
  // Add moon phase information from notes
  testDate.notes.forEach(note => {
    if (note.toLowerCase().includes("new moon")) {
      score += 10;
      badges.push("🌑 New Moon");
      why.push("New Moon energy for fresh starts and new beginnings");
    } else if (note.toLowerCase().includes("full moon")) {
      score += 15;
      badges.push("🌕 Full Moon");
      why.push("Full Moon energy for peak performance and clarity");
    } else if (note.toLowerCase().includes("first quarter")) {
      score += 8;
      badges.push("🌓 First Quarter");
      why.push("First Quarter Moon supports building momentum");
    } else if (note.toLowerCase().includes("last quarter")) {
      score += 5;
      badges.push("🌗 Last Quarter");
      why.push("Last Quarter Moon for releasing and letting go");
    }
  });
  
  // Weekend bonus
  if (testDate.weekday === "Friday" || testDate.weekday === "Saturday") {
    score += 5;
    badges.push("📅 Weekend");
    why.push("Weekend test day for relaxed scheduling");
  }
  
  // Check if it's within user's preferred date range
  if (userPreferences.scoreReleaseStart && userPreferences.scoreReleaseEnd) {
    const testDateObj = new Date(testDate.date);
    const startDate = userPreferences.scoreReleaseStart;
    const endDate = userPreferences.scoreReleaseEnd;
    
    // For scoring purposes, we'll assume score release is ~30 days after test
    const estimatedScoreRelease = new Date(testDateObj);
    estimatedScoreRelease.setDate(estimatedScoreRelease.getDate() + 30);
    
    if (estimatedScoreRelease >= startDate && estimatedScoreRelease <= endDate) {
      score += 20;
      badges.push("🎯 Ideal Timing");
      why.push("Score releases within your preferred timeframe");
    }
  }
  
  // Risk tolerance factors
  if (userPreferences.riskTolerance) {
    if (userPreferences.riskTolerance > 70) {
      // High risk tolerance - bonus for unique dates
      if (testDate.notes.length > 0) {
        score += 5;
        why.push("Unique astrological aspects for adventurous spirits");
      }
    } else if (userPreferences.riskTolerance < 30) {
      // Low risk tolerance - prefer safer dates
      if (mercuryInfo.status === "direct" && testDate.notes.length === 0) {
        score += 10;
        why.push("Stable planetary conditions for conservative approach");
      }
    }
  }
  
  // Energy preference factors
  if (userPreferences.energyPreference && userPreferences.energyPreference > 70) {
    // High energy preference - bonus for full moons and fire sign influences
    if (testDate.notes.some(note => note.toLowerCase().includes("full moon"))) {
      score += 5;
      why.push("High-energy lunar phase matches your preference");
    }
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  return {
    ...testDate,
    score,
    badges: badges.slice(0, 5), // Limit badges
    why: why.slice(0, 3), // Limit reasons
    mercuryStatus: mercuryInfo.status,
    isMercuryRetrograde: mercuryInfo.isRetrograde,
    year,
  };
}

/**
 * Get scored dates for a specific year
 */
export function getScoredDatesForYear(
  year: string,
  userPreferences: UserPreferences
): ProcessedDate[] {
  const dates = getTestDatesForYear(year);
  return dates
    .map(date => scoreDate(date, year, userPreferences))
    .sort((a, b) => b.score - a.score); // Sort by score descending
}

/**
 * Get all scored dates from all years
 */
export function getAllScoredDates(
  userPreferences: UserPreferences
): ProcessedDate[] {
  const allDates = getAllTestDates();
  const scoredDates: ProcessedDate[] = [];
  
  allDates.forEach(({ year, dates }) => {
    dates.forEach(date => {
      scoredDates.push(scoreDate(date, year, userPreferences));
    });
  });
  
  return scoredDates.sort((a, b) => b.score - a.score);
}

/**
 * Format date string for display
 */
export function formatTestDate(dateString: string): string {
  // Input format: "July 25, 2025"
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateString; // Fallback to original string
  }
}

/**
 * Get score release date (estimate 30 days after test)
 */
export function getEstimatedScoreReleaseDate(testDateString: string): string {
  try {
    const testDate = new Date(testDateString);
    const scoreDate = new Date(testDate);
    scoreDate.setDate(scoreDate.getDate() + 30);
    return scoreDate.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return "~30 days after test";
  }
}
