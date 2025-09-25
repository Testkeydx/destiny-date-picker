// Personalized astrology types

export type ZodiacSign = 
  | "Aries" | "Taurus" | "Gemini" | "Cancer" 
  | "Leo" | "Virgo" | "Libra" | "Scorpio" 
  | "Sagittarius" | "Capricorn" | "Aquarius" | "Pisces";

export type Element = "Fire" | "Earth" | "Air" | "Water";
export type Modality = "Cardinal" | "Fixed" | "Mutable";

export interface ZodiacProfile {
  sign: ZodiacSign;
  element: Element;
  modality: Modality;
  dateRange: { start: string; end: string }; // MM-DD format
  traits: {
    testTakingStyle: string[];
    strengths: string[];
    challenges: string[];
    mercuryRxSensitivity: "High" | "Medium" | "Low";
    optimalMoonPhases: string[];
    beneficialPlanets: string[];
    challengingPlanets: string[];
  };
  personalizedAdvice: {
    preparation: string[];
    testDay: string[];
    recovery: string[];
  };
}

export interface PersonalizedFactors {
  sunSign: ZodiacSign;
  mercuryCompatibility: number; // 0-100, how well they handle Mercury Rx
  moonPhaseAffinities: Record<string, number>; // moon phase -> compatibility score
  planetaryAffinities: Record<string, number>; // planet -> compatibility score
  testingPersonality: {
    performsUnderPressure: boolean;
    prefersRoutine: boolean;
    intuitive: boolean;
    analytical: boolean;
    resilient: boolean;
  };
}

export interface PersonalizedRecommendation {
  baseScore: number;
  personalizedScore: number;
  personalizedBoosts: string[];
  personalizedCautions: string[];
  whyItWorks: string[];
  personalTips: string[];
}
