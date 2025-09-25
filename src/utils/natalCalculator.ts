import { ZodiacSign, ZodiacProfile, PersonalizedFactors, PersonalizedRecommendation } from '@/types/astrology';
import { MergedDate } from '@/types';
import zodiacData from '../../zodiac-profiles.json';

/**
 * Calculate sun sign from birth date
 */
export function calculateSunSign(birthDate: Date): ZodiacSign {
  const month = birthDate.getMonth() + 1; // getMonth() is 0-indexed
  const day = birthDate.getDate();
  const dateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
  // Find the zodiac sign that contains this date
  for (const [sign, profile] of Object.entries(zodiacData.profiles)) {
    const { start, end } = profile.dateRange;
    
    // Handle year boundary (Capricorn spans Dec-Jan)
    if (start > end) {
      if (dateStr >= start || dateStr <= end) {
        return sign as ZodiacSign;
      }
    } else {
      if (dateStr >= start && dateStr <= end) {
        return sign as ZodiacSign;
      }
    }
  }
  
  // Default fallback (shouldn't happen)
  return "Aries";
}

/**
 * Get zodiac profile by sign
 */
export function getZodiacProfile(sign: ZodiacSign): ZodiacProfile {
  return zodiacData.profiles[sign] as ZodiacProfile;
}

/**
 * Calculate personalized astrological factors from birth date
 */
export function calculatePersonalizedFactors(birthDate: Date): PersonalizedFactors {
  const sunSign = calculateSunSign(birthDate);
  const profile = getZodiacProfile(sunSign);
  
  // Mercury sensitivity mapping
  const mercuryCompatibilityMap = {
    "High": 20,    // Highly sensitive to Mercury Rx
    "Medium": 60,  // Moderately affected
    "Low": 90      // Handles Mercury Rx well
  };
  
  // Moon phase affinities based on sign element and modality
  const moonPhaseAffinities: Record<string, number> = {};
  profile.traits.optimalMoonPhases.forEach(phase => {
    moonPhaseAffinities[phase] = 80;
  });
  
  // Default affinities for all phases
  ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", 
   "Full Moon", "Waning Gibbous", "Third Quarter", "Waning Crescent"].forEach(phase => {
    if (!moonPhaseAffinities[phase]) {
      moonPhaseAffinities[phase] = 50; // neutral
    }
  });
  
  // Planetary affinities
  const planetaryAffinities: Record<string, number> = {};
  profile.traits.beneficialPlanets.forEach(planet => {
    planetaryAffinities[planet] = 80;
  });
  profile.traits.challengingPlanets.forEach(planet => {
    planetaryAffinities[planet] = 30;
  });
  
  // Testing personality based on sign traits
  const testingPersonality = {
    performsUnderPressure: profile.element === "Fire" || profile.sign === "Scorpio",
    prefersRoutine: profile.element === "Earth" || profile.modality === "Fixed",
    intuitive: profile.element === "Water" || profile.sign === "Pisces",
    analytical: profile.element === "Earth" || profile.element === "Air",
    resilient: profile.modality === "Fixed" || profile.element === "Earth"
  };
  
  return {
    sunSign,
    mercuryCompatibility: mercuryCompatibilityMap[profile.traits.mercuryRxSensitivity],
    moonPhaseAffinities,
    planetaryAffinities,
    testingPersonality
  };
}

/**
 * Generate personalized recommendation for a test date
 */
export function generatePersonalizedRecommendation(
  date: MergedDate,
  personalizedFactors: PersonalizedFactors,
  baseScore: number
): PersonalizedRecommendation {
  const profile = getZodiacProfile(personalizedFactors.sunSign);
  let personalizedScore = baseScore;
  const personalizedBoosts: string[] = [];
  const personalizedCautions: string[] = [];
  const whyItWorks: string[] = [];
  const personalTips: string[] = [];
  
  // Mercury retrograde personalization
  if (date.meaning?.signals?.mercury_state === "retrograde") {
    const mercuryBonus = (personalizedFactors.mercuryCompatibility - 50) * 0.4;
    personalizedScore += mercuryBonus;
    
    if (personalizedFactors.mercuryCompatibility > 70) {
      personalizedBoosts.push(`${personalizedFactors.sunSign} handles Mercury retrograde better than most`);
      whyItWorks.push("Your sign's natural adaptability helps during Mercury Rx periods");
    } else if (personalizedFactors.mercuryCompatibility < 40) {
      personalizedCautions.push(`${personalizedFactors.sunSign} may be extra sensitive to Mercury retrograde effects`);
      personalTips.push("Double-check all logistics and allow extra travel time");
    }
  }
  
  // Moon phase personalization
  const currentMoonPhase = getCurrentMoonPhase(date);
  if (currentMoonPhase && personalizedFactors.moonPhaseAffinities[currentMoonPhase]) {
    const moonAffinity = personalizedFactors.moonPhaseAffinities[currentMoonPhase];
    const moonBonus = (moonAffinity - 50) * 0.3;
    personalizedScore += moonBonus;
    
    if (moonAffinity > 70) {
      personalizedBoosts.push(`${currentMoonPhase} aligns perfectly with your ${personalizedFactors.sunSign} energy`);
      whyItWorks.push(`This lunar phase enhances your natural ${personalizedFactors.sunSign} strengths`);
    }
  }
  
  // Planetary aspects personalization
  if (date.meaning?.signals?.tone) {
    date.meaning.signals.tone.forEach(tone => {
      const planet = mapToneToPlanet(tone);
      if (planet && personalizedFactors.planetaryAffinities[planet]) {
        const planetAffinity = personalizedFactors.planetaryAffinities[planet];
        const planetBonus = (planetAffinity - 50) * 0.2;
        personalizedScore += planetBonus;
        
        if (planetAffinity > 70) {
          personalizedBoosts.push(`${planet} energy supports your ${personalizedFactors.sunSign} nature`);
        } else if (planetAffinity < 40) {
          personalizedCautions.push(`${planet} energy may challenge your ${personalizedFactors.sunSign} approach`);
        }
      }
    });
  }
  
  // Testing personality bonuses
  if (personalizedFactors.testingPersonality.performsUnderPressure && date.meaning?.signals?.tone?.includes("confident")) {
    personalizedScore += 10;
    personalizedBoosts.push("High-pressure energy matches your natural test-taking style");
  }
  
  if (personalizedFactors.testingPersonality.prefersRoutine && !date.meaning?.signals?.mercury_state) {
    personalizedScore += 5;
    whyItWorks.push("Stable planetary conditions support your preference for routine");
  }
  
  // Add personalized tips based on sign
  personalTips.push(...profile.personalizedAdvice.testDay.slice(0, 2));
  
  // Ensure score stays within bounds
  personalizedScore = Math.max(0, Math.min(100, Math.round(personalizedScore)));
  
  return {
    baseScore,
    personalizedScore,
    personalizedBoosts,
    personalizedCautions,
    whyItWorks,
    personalTips
  };
}

/**
 * Helper function to extract moon phase from date data
 */
function getCurrentMoonPhase(date: MergedDate): string | null {
  // Check notes for moon phase information
  const moonPhaseNote = date.notes.find(note => 
    note.toLowerCase().includes('moon') && 
    (note.includes('New') || note.includes('Full') || note.includes('Quarter'))
  );
  
  if (moonPhaseNote) {
    if (moonPhaseNote.includes('New Moon')) return 'New Moon';
    if (moonPhaseNote.includes('Full Moon')) return 'Full Moon';
    if (moonPhaseNote.includes('First Quarter')) return 'First Quarter';
    if (moonPhaseNote.includes('Last Quarter') || moonPhaseNote.includes('Third Quarter')) return 'Third Quarter';
  }
  
  return null;
}

/**
 * Map astrological tone to planet
 */
function mapToneToPlanet(tone: string): string | null {
  const toneMap: Record<string, string> = {
    'confident': 'Sun',
    'dramatic': 'Sun',
    'energetic': 'Mars',
    'aggressive': 'Mars',
    'gentle': 'Venus',
    'harmonious': 'Venus',
    'communicative': 'Mercury',
    'analytical': 'Mercury',
    'intuitive': 'Moon',
    'emotional': 'Moon',
    'optimistic': 'Jupiter',
    'expansive': 'Jupiter',
    'disciplined': 'Saturn',
    'structured': 'Saturn',
    'innovative': 'Uranus',
    'unconventional': 'Uranus',
    'spiritual': 'Neptune',
    'mystical': 'Neptune',
    'transformative': 'Pluto',
    'intense': 'Pluto'
  };
  
  return toneMap[tone.toLowerCase()] || null;
}
