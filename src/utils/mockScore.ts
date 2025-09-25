interface MCATDate {
  testDate: string;
  scoreReleaseDate: string;
}

interface UserInput {
  birthDate?: string;
  birthTime?: string;
  city?: string;
  country?: string;
  energyPreference?: number; // 0-100
  riskTolerance?: number; // 0-100
  scoreReleaseStart?: string;
  scoreReleaseEnd?: string;
  timezone?: string;
}

interface ScoredDate extends MCATDate {
  score: number;
  badges: string[];
  why: string[];
  moonPhase: string;
  moonSign: string;
  mercuryStatus: "direct" | "retrograde";
  jupiterAspect: "positive" | "neutral" | "negative";
  saturnAspect: "positive" | "neutral" | "negative";
}

// Simple deterministic "random" generator using date as seed
function pseudoRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) / 2147483647; // Normalize to 0-1
}

function getMoonPhase(date: string): { phase: string; percentage: number } {
  // Mock moon phases - in reality would use astronomical calculations
  const phases = [
    "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", 
    "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"
  ];
  const seed = date + "moon";
  const random = pseudoRandom(seed);
  const phaseIndex = Math.floor(random * phases.length);
  const percentage = Math.floor(random * 100);
  return { phase: phases[phaseIndex], percentage };
}

function getMoonSign(date: string): string {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  const seed = date + "sign";
  const random = pseudoRandom(seed);
  return signs[Math.floor(random * signs.length)];
}

function getMercuryStatus(date: string): "direct" | "retrograde" {
  const seed = date + "mercury";
  const random = pseudoRandom(seed);
  return random > 0.75 ? "retrograde" : "direct"; // Mercury retrograde ~25% of the time
}

function getAspectStatus(date: string, planet: string): "positive" | "neutral" | "negative" {
  const seed = date + planet;
  const random = pseudoRandom(seed);
  if (random > 0.7) return "positive";
  if (random < 0.3) return "negative"; 
  return "neutral";
}

export function scoreDate(
  mcatDate: MCATDate, 
  userInput: UserInput
): ScoredDate {
  const { testDate, scoreReleaseDate } = mcatDate;
  
  // Base score calculation
  let score = 50;
  const badges: string[] = [];
  const why: string[] = [];
  
  // Get astrological data
  const moonData = getMoonPhase(testDate);
  const moonSign = getMoonSign(testDate);
  const mercuryStatus = getMercuryStatus(testDate);
  const jupiterAspect = getAspectStatus(testDate, "jupiter");
  const saturnAspect = getAspectStatus(testDate, "saturn");
  
  // Score based on moon phase
  if (moonData.phase === "Full Moon") {
    score += 15;
    badges.push("🌕 Full Moon");
    why.push("Full Moon energy for peak performance");
  } else if (moonData.phase === "New Moon") {
    score += 10;
    badges.push("🌑 New Moon");  
    why.push("New Moon for fresh starts");
  }
  
  // Score based on Mercury status
  if (mercuryStatus === "direct") {
    score += 10;
    badges.push("💫 Mercury Direct");
    why.push("Mercury direct supports clear thinking");
  } else {
    score -= 15;
    badges.push("🔄 Mercury Retrograde");
    why.push("Mercury retrograde may cause confusion");
  }
  
  // Score based on Jupiter aspect
  if (jupiterAspect === "positive") {
    score += 12;
    badges.push("✨ Jupiter Boost");
    why.push("Jupiter brings luck and expansion");
  } else if (jupiterAspect === "negative") {
    score -= 8;
    badges.push("⚠️ Jupiter Challenge");
  }
  
  // Score based on Saturn aspect  
  if (saturnAspect === "positive") {
    score += 8;
    badges.push("🪐 Saturn Support");
    why.push("Saturn provides discipline and focus");
  } else if (saturnAspect === "negative") {
    score -= 10;
    badges.push("⛔ Saturn Restriction");
  }
  
  // Score based on moon sign compatibility with user preferences
  const focusSigns = ["Virgo", "Capricorn", "Scorpio"];
  const energySigns = ["Aries", "Leo", "Sagittarius"];
  
  if (userInput.energyPreference && userInput.energyPreference > 70) {
    if (energySigns.includes(moonSign)) {
      score += 8;
      why.push(`Moon in ${moonSign} matches your high-energy preference`);
    }
  } else {
    if (focusSigns.includes(moonSign)) {
      score += 8; 
      why.push(`Moon in ${moonSign} supports focus and precision`);
    }
  }
  
  // Score based on release date preferences
  if (userInput.scoreReleaseStart && userInput.scoreReleaseEnd) {
    const releaseDate = new Date(scoreReleaseDate);
    const startDate = new Date(userInput.scoreReleaseStart);
    const endDate = new Date(userInput.scoreReleaseEnd);
    
    if (releaseDate >= startDate && releaseDate <= endDate) {
      score += 20;
      badges.push("🎯 Release Window");
      why.push("Score releases within your preferred timeframe");
    } else {
      score -= 10;
    }
  }
  
  // Weekend bonus/penalty based on risk tolerance
  const testDateObj = new Date(testDate);
  const isWeekend = testDateObj.getDay() === 0 || testDateObj.getDay() === 6;
  
  if (isWeekend) {
    if (userInput.riskTolerance && userInput.riskTolerance > 60) {
      score += 5;
      badges.push("📅 Weekend Test");
      why.push("Weekend test day for a relaxed schedule");
    } else {
      score -= 5;
    }
  }
  
  // Add some randomness based on date
  const randomFactor = pseudoRandom(testDate + "bonus");
  score += (randomFactor - 0.5) * 10;
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  return {
    ...mcatDate,
    score,
    badges,
    why: why.slice(0, 3), // Limit to top 3 reasons
    moonPhase: moonData.phase,
    moonSign,
    mercuryStatus,
    jupiterAspect,
    saturnAspect,
  };
}