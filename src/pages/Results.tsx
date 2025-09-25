"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Filter, Moon, Zap, Share2, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientFrame } from "@/components/ui/gradient-frame";
import { BrandBadge } from "@/components/ui/brand-badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { ScoreChip } from "@/components/ui/score-chip";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShareModal } from "@/components/ShareModal";
import { useNavigate } from "react-router-dom";
import { YearSelector } from "@/components/YearSelector";
import { 
  getAvailableYears, 
  getScoredDatesForYear, 
  formatTestDate, 
  getEstimatedScoreReleaseDate,
  getYearView,
  getAstroData 
} from "@/utils/dataLoader";
import { getInterpretationNotes } from "@/utils/rationalLoader";
import { hasRx, suitabilityBucket, getMercuryState } from "@/selectors/mergedSelectors";
import { truncateText } from "@/utils/textUtils";
import { ProcessedDate, UserPreferences, MergedDate, YearView } from "@/types";
import { calculatePersonalizedFactors, generatePersonalizedRecommendation } from "@/utils/natalCalculator";
import upangeaLogo from "@/assets/upangea-logo.png";

export default function Results() {
  const navigate = useNavigate();
  const [yearView, setYearView] = useState<YearView | null>(null);
  const [selectedDate, setSelectedDate] = useState<MergedDate | null>(null);
  const [shareDate, setShareDate] = useState<MergedDate | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({});
  const [filters, setFilters] = useState({
    avoidMercuryRx: false,
    preferWeekends: false,
    suitabilityFilter: "All" as "All" | "High" | "Medium–High" | "Medium",
    showCoachTips: true,
  });

  useEffect(() => {
    const userData = localStorage.getItem("mcatStarData");
    if (!userData) {
      navigate("/onboarding");
      return;
    }

    const userInput = JSON.parse(userData);
    
    // Convert birth date string back to Date object
    if (userInput.birthDate) {
      userInput.birthDate = new Date(userInput.birthDate);
    }
    
    // Convert other date fields
    if (userInput.preferredTestStart) {
      userInput.preferredTestStart = new Date(userInput.preferredTestStart);
    }
    if (userInput.preferredTestEnd) {
      userInput.preferredTestEnd = new Date(userInput.preferredTestEnd);
    }
    
    console.log('User preferences loaded:', userInput); // Debug log
    setUserPreferences(userInput);
    
    // Set default year to 2026, or first available year if 2026 not available
    const availableYears = getAvailableYears();
    if (availableYears.length > 0 && !selectedYear) {
      const preferredYear = availableYears.includes("2026") ? "2026" : availableYears[0];
      setSelectedYear(preferredYear);
    }
  }, [navigate, selectedYear]);

  useEffect(() => {
    if (selectedYear) {
      const yearData = getYearView(selectedYear);
      setYearView(yearData);
    }
  }, [selectedYear]);

  // Smart sorting function that prioritizes best matches
  const getDateScore = (date: MergedDate): number => {
    let score = 0;
    
    // Suitability scoring (higher is better)
    const suitability = suitabilityBucket(date);
    switch (suitability) {
      case "High": score += 1000; break;
      case "Medium–High": score += 800; break;
      case "Medium": score += 600; break;
      default: score += 400; break;
    }
    
    // Personalized astrological scoring
    if (userPreferences.birthDate && userPreferences.birthDate instanceof Date) {
      try {
        const personalizedFactors = calculatePersonalizedFactors(userPreferences.birthDate);
        const personalizedRec = generatePersonalizedRecommendation(date, personalizedFactors, score);
        
        // Add personalized bonus (scaled down for sorting)
        const personalizedBonus = (personalizedRec.personalizedScore - personalizedRec.baseScore) * 0.5;
        score += personalizedBonus;
        
        // Debug log
        if (personalizedBonus !== 0) {
          console.log(`Personalized bonus for ${date.date}:`, personalizedBonus, 'Sun sign:', personalizedFactors.sunSign);
        }
      } catch (error) {
        console.warn('Error calculating personalized score:', error);
      }
    } else if (userPreferences.birthDate) {
      console.warn('Birth date is not a Date object:', typeof userPreferences.birthDate, userPreferences.birthDate);
    }
    
    // User preference bonuses
    if (filters.preferWeekends && (date.weekday === "Friday" || date.weekday === "Saturday")) {
      score += 100;
    }
    
    if (filters.avoidMercuryRx && !hasRx(date)) {
      score += 50;
    }
    
    // Mercury state scoring (avoid retrograde)
    if (hasRx(date)) {
      score -= 200; // Heavy penalty for Mercury retrograde
    }
    
    // Date proximity scoring (earlier dates get slight bonus)
    const testDate = new Date(date.date);
    const today = new Date();
    const daysFromNow = Math.floor((testDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Slight preference for dates that are not too far in the future
    if (daysFromNow > 0 && daysFromNow < 120) {
      score += Math.max(0, 50 - (daysFromNow / 10)); // Bonus decreases as date gets further
    }
    
    // Weekend preference bonus (even if not explicitly filtered)
    if (date.weekday === "Saturday") score += 20;
    if (date.weekday === "Friday") score += 10;
    
    return score;
  };

  // Filter and sort dates
  const filteredDates = (yearView?.dates || [])
    .filter(date => {
      if (filters.avoidMercuryRx && hasRx(date)) return false;
      if (filters.preferWeekends) {
        if (date.weekday !== "Friday" && date.weekday !== "Saturday") return false;
      }
      if (filters.suitabilityFilter !== "All") {
        const bucket = suitabilityBucket(date);
        if (bucket !== filters.suitabilityFilter) return false;
      }
    return true;
    })
    .sort((a, b) => getDateScore(b) - getDateScore(a)); // Sort by score descending (best first)

  const getBadgeVariant = (badge: string) => {
    if (badge.includes("Mercury Retrograde") || badge.includes("Mercury Stationary")) return "destructive";
    if (badge.includes("Mercury Direct")) return "default";
    if (badge.includes("Full Moon") || badge.includes("New Moon")) return "secondary";
    return "outline";
  };

  // Get personalized insights for a date
  const getPersonalizedInsights = (date: MergedDate) => {
    if (!userPreferences.birthDate || !(userPreferences.birthDate instanceof Date)) {
      console.log('No valid birth date for personalized insights:', userPreferences.birthDate);
      return null;
    }
    
    try {
      const personalizedFactors = calculatePersonalizedFactors(userPreferences.birthDate);
      const personalizedRec = generatePersonalizedRecommendation(date, personalizedFactors, 50);
      
      console.log(`Personalized insights for ${date.date}:`, {
        sunSign: personalizedFactors.sunSign,
        boosts: personalizedRec.personalizedBoosts.length,
        recommendations: personalizedRec
      });
      
      return {
        sunSign: personalizedFactors.sunSign,
        recommendation: personalizedRec
      };
    } catch (error) {
      console.warn('Error calculating personalized insights:', error);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/onboarding")}
            className="text-foreground-secondary hover:text-upangea-blue"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            <img src={upangeaLogo} alt="UPangea Logo" className="h-6 w-6" />
            <span className="font-semibold text-foreground">MCAT Star</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Personalized User Badge */}
          {userPreferences.birthDate && userPreferences.birthDate instanceof Date && (() => {
            try {
              const personalizedFactors = calculatePersonalizedFactors(userPreferences.birthDate);
              return (
                <div className="bg-purple-100 px-3 py-1 rounded-full flex items-center space-x-2">
                  <span className="text-purple-600 text-sm">✨</span>
                  <span className="text-purple-700 text-sm font-medium">
                    Personalized for {personalizedFactors.sunSign}
                  </span>
                </div>
              );
            } catch (error) {
              return null;
            }
          })()}
          
        <BrandBadge size="sm" variant="glass" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Your Top 2026 MCAT Dates
            </h1>
            <p className="text-foreground-secondary mb-6">
              Cosmic timing meets practical planning
            </p>
            
            {/* Quick Summary */}
            {yearView && filteredDates.length > 0 && (
              <div className="mb-6">
                <GradientFrame variant="glass" padding="md" className="max-w-3xl mx-auto">
                  <div className="text-sm text-center">
                    <p className="text-foreground-secondary">
                      <strong className="text-foreground">What makes a good match:</strong> We analyze planetary positions, 
                      Mercury states, moon phases, and your personal preferences to identify dates with optimal cosmic conditions 
                      for test-taking success.
                    </p>
                    <div className="flex justify-center items-center space-x-4 mt-2 text-xs">
                      <span className="text-green-600">✓ Strong focus energy</span>
                      <span className="text-blue-600">✓ Clear communication</span>
                      <span className="text-purple-600">✓ Emotional stability</span>
                      <span className="text-amber-600">⚠ Manageable challenges</span>
                    </div>
                  </div>
                </GradientFrame>
              </div>
            )}
            
            {/* Year Selector */}
            <div className="flex items-center justify-center space-x-4">
              <Calendar className="h-5 w-5 text-upangea-blue" />
              <span className="text-foreground font-medium">Test Year:</span>
              <YearSelector
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                className="w-32"
              />
              {getInterpretationNotes() && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-upangea-blue">
                      ℹ️ How we interpret
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>How We Interpret These Dates</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Suitability Ratings Explained</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start space-x-3">
                            <Badge variant="default" className="text-xs mt-0.5">High</Badge>
                            <p className="text-foreground-secondary">Excellent cosmic conditions with minimal challenges. Strong planetary support for focus, clarity, and peak performance.</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Badge variant="secondary" className="text-xs mt-0.5">Medium–High</Badge>
                            <p className="text-foreground-secondary">Very good conditions with manageable challenges. Great energy with some minor factors to be aware of.</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Badge variant="outline" className="text-xs mt-0.5">Medium</Badge>
                            <p className="text-foreground-secondary">Good conditions for certain personality types. May require extra preparation or specific strategies to optimize.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Our Interpretation Method</h4>
                        <p className="text-sm text-foreground-secondary">
                          {getInterpretationNotes()}
                        </p>
                      </div>
                      
                      <div className="border-t pt-4">
                        <BrandBadge variant="minimal" />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <GradientFrame variant="glass" padding="md">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-upangea-blue" />
                  <span className="font-medium text-foreground">Filters:</span>
                </div>
                
                {/* Toggle Filters */}
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filters.avoidMercuryRx 
                        ? 'bg-red-500 text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setFilters(prev => ({ ...prev, avoidMercuryRx: !prev.avoidMercuryRx }))}
                  >
                    🔁 {filters.avoidMercuryRx ? 'Hiding' : 'Hide'} Mercury Rx
                  </button>
                  
                  <button
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filters.preferWeekends 
                        ? 'bg-blue-500 text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setFilters(prev => ({ ...prev, preferWeekends: !prev.preferWeekends }))}
                  >
                    📅 {filters.preferWeekends ? 'Weekends Only' : 'Weekend Filter'}
                  </button>
                  
                  <button
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filters.showCoachTips 
                        ? 'bg-green-500 text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setFilters(prev => ({ ...prev, showCoachTips: !prev.showCoachTips }))}
                  >
                    💡 {filters.showCoachTips ? 'Tips On' : 'Tips Off'}
                  </button>
                </div>
                
                {/* Suitability Filter */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-foreground-secondary">Quality:</span>
                  <div className="flex gap-1">
                    {[
                      { label: "All", icon: "🌟" },
                      { label: "High", icon: "⭐" },
                      { label: "Medium–High", icon: "✨" },
                      { label: "Medium", icon: "📋" }
                    ].map(({ label, icon }) => (
                      <button
                        key={label}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          filters.suitabilityFilter === label
                            ? 'bg-purple-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setFilters(prev => ({ ...prev, suitabilityFilter: label as any }))}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Clear All */}
                {(() => {
                  const hasActiveFilters = filters.avoidMercuryRx || filters.preferWeekends || !filters.showCoachTips || filters.suitabilityFilter !== "All";
                  return hasActiveFilters ? (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setFilters({ avoidMercuryRx: false, preferWeekends: false, suitabilityFilter: "All", showCoachTips: true })}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Clear All
                    </Button>
                  ) : null;
                })()}
              </div>
            </GradientFrame>
          </motion.div>

          {/* Results */}
          <div className="space-y-6">
            {/* Sorting indicator */}
            {filteredDates.length > 0 && (
              <div className="text-center py-2">
                {userPreferences.birthDate && userPreferences.birthDate instanceof Date ? (
                  <p className="text-sm text-foreground-secondary">
                    Results sorted by <span className="font-medium text-foreground">personalized compatibility</span> for{' '}
                    <span className="font-medium text-purple-600">
                      {(() => {
                        try {
                          return calculatePersonalizedFactors(userPreferences.birthDate).sunSign;
                        } catch {
                          return 'you';
                        }
                      })()}
                    </span> ✨
                  </p>
                ) : (
                  <p className="text-sm text-foreground-secondary">
                    Results sorted by <span className="font-medium text-foreground">match quality</span> ✨
                  </p>
                )}
              </div>
            )}
            
            {filteredDates.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <GradientFrame variant="surface" padding="lg" className="text-center">
                  <Moon className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No dates match your filters
                  </h3>
                  <p className="text-foreground-secondary mb-4">
                    Try adjusting your filters to see more options.
                  </p>
                  <Button 
                    onClick={() => setFilters({ avoidMercuryRx: false, preferWeekends: false, suitabilityFilter: "All", showCoachTips: true })}
                    variant="outline"
                  >
                    Reset Filters
                  </Button>
                  <div className="mt-6">
                    <BrandBadge size="sm" variant="minimal" />
                  </div>
                </GradientFrame>
              </motion.div>
            ) : (
              filteredDates.map((date, index) => (
                <motion.div
                  key={date.testDate}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                >
                  <GradientFrame 
                    variant={
                      date.meaning && suitabilityBucket(date) === "High" ? "hero" :
                      date.meaning && suitabilityBucket(date) === "Medium–High" ? "glass" : "surface"
                    }
                    padding="lg" 
                    className={`hover:shadow-glow transition-all duration-200 hover:-translate-y-1 ${
                      date.meaning && suitabilityBucket(date) === "High" ? "ring-2 ring-green-200" :
                      date.meaning && suitabilityBucket(date) === "Medium–High" ? "ring-1 ring-blue-200" : ""
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Header Section */}
                      <div className="flex items-start justify-between">
                      <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-foreground">
                              {formatTestDate(date.date)}
                            </h3>
                            {/* Match Quality Indicator */}
                            {date.meaning && suitabilityBucket(date) === "High" && (
                              <span className="text-lg" title="Excellent match">⭐</span>
                            )}
                            {date.meaning && suitabilityBucket(date) === "Medium–High" && (
                              <span className="text-lg" title="Very good match">✨</span>
                            )}
                            {date.meaning && suitabilityBucket(date) === "Medium" && (
                              <span className="text-lg" title="Good match for certain types">📋</span>
                            )}
                            {/* Mercury Retrograde Warning */}
                            {hasRx(date) && (
                              <Badge variant="destructive" size="sm" className="text-xs">
                                🔁 Mercury Rx
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-foreground-secondary">
                            <span className="font-medium">{date.weekday}</span>
                            <span>•</span>
                            <span>Score Release: {getEstimatedScoreReleaseDate(date.date)}</span>
                          </div>
                        </div>
                        
                        {/* UPangea Badge */}
                        <div className="flex-shrink-0">
                          <BrandBadge size="sm" variant="minimal" />
                        </div>
                      </div>

                      {/* Content Sections */}
                      <div className="space-y-3">
                        {/* Main Headline */}
                        {date.meaning?.headline && (
                          <div className="bg-gradient-to-r from-upangea-blue/5 to-transparent p-3 rounded-lg border-l-2 border-upangea-blue">
                            <h4 className="text-lg font-semibold text-foreground line-clamp-2">
                              {date.meaning.headline}
                            </h4>
                          </div>
                        )}
                        
                        {/* Horoscope Preview */}
                        {(date.astroCopy?.text || date.description?.feel) && (
                          <div className="bg-slate-50 p-3 rounded-lg" aria-label="Cosmic insight">
                            <p className="text-sm text-foreground-secondary italic line-clamp-3 leading-relaxed">
                              "{date.astroCopy?.text 
                                ? truncateText(date.astroCopy.text, 180)
                                : date.description?.feel && truncateText(date.description.feel, 180)
                              }"
                            </p>
                          </div>
                        )}

                        {/* Key Insights Grid */}
                        {date.meaning && (
                          <div className="grid md:grid-cols-2 gap-3">
                            {/* Strengths */}
                            {date.meaning.strengths.length > 0 && (
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                  <span className="text-sm font-medium text-green-700">Strengths</span>
                                </div>
                                <ul className="space-y-1">
                                  {date.meaning.strengths.slice(0, 2).map((strength, i) => (
                                    <li key={i} className="text-xs text-green-600 line-clamp-1">
                                      • {strength}
                                    </li>
                                  ))}
                                </ul>
                            </div>
                            )}
                            
                            {/* Cautions */}
                            {date.meaning.cautions.length > 0 && (
                              <div className="bg-amber-50 p-3 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                  <span className="text-sm font-medium text-amber-700">Cautions</span>
                                </div>
                                <ul className="space-y-1">
                                  {date.meaning.cautions.slice(0, 2).map((caution, i) => (
                                    <li key={i} className="text-xs text-amber-600 line-clamp-1">
                                      • {caution}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tags Row */}
                        {date.meaning?.tags && (
                              <div className="flex flex-wrap gap-2">
                            {date.meaning.tags.slice(0, 6).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs font-normal">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Coach Tips (when enabled) */}
                        {filters.showCoachTips && date.description?.advice && date.description.advice.length > 0 && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              <span className="text-sm font-medium text-blue-700">Quick Coach Tips</span>
                            </div>
                            <ul className="space-y-1">
                              {date.description.advice.slice(0, 2).map((tip, i) => (
                                <li key={i} className="text-xs text-blue-600 line-clamp-1">
                                  • {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Personalized Insights */}
                        {(() => {
                          const insights = getPersonalizedInsights(date);
                          if (!insights || insights.recommendation.personalizedBoosts.length === 0) return null;
                          
                          return (
                            <div className="bg-purple-50 p-3 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                <span className="text-sm font-medium text-purple-700">
                                  For {insights.sunSign}
                                  </span>
                              </div>
                              <ul className="space-y-1">
                                {insights.recommendation.personalizedBoosts.slice(0, 2).map((boost, i) => (
                                  <li key={i} className="text-xs text-purple-600 line-clamp-1">
                                    ✨ {boost}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })()}

                        {/* Suitability Footer */}
                        {date.meaning?.suitability && (
                          <div className="border-t pt-3">
                            <p className="text-xs text-foreground-secondary">
                              <span className="font-medium text-foreground">Overall:</span> {date.meaning.suitability}
                            </p>
                          </div>
                        )}

                        {/* Fallback if no meaning */}
                        {!date.meaning && (
                          <div className="text-center py-4">
                            <p className="text-sm text-foreground-secondary italic">
                              Detailed interpretation coming soon
                            </p>
                        </div>
                        )}
                      </div>

                      {/* Action Footer */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedDate(date)}
                              className="flex items-center space-x-2"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Full Details</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                {formatTestDate(date.date)} - Cosmic Details
                              </DialogTitle>
                            </DialogHeader>
                            {selectedDate && (
                              <div className="space-y-6">
                                {/* Cosmic Insight */}
                                {selectedDate.astroCopy?.text && (
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-3">Cosmic Insight</h4>
                                    <p className="text-sm text-foreground-secondary leading-relaxed" aria-label="Cosmic insight">
                                      {selectedDate.astroCopy.text}
                                    </p>
                                  </div>
                                )}

                                {/* What this means (rational) */}
                                {selectedDate.meaning && (
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-3">What this means</h4>
                                    <div className="space-y-4">
                                      <div>
                                        <h5 className="text-lg font-semibold text-foreground mb-2">{selectedDate.meaning.headline}</h5>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                          {selectedDate.meaning.tags.map((tag, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      {selectedDate.meaning.strengths.length > 0 && (
                                        <div>
                                          <h6 className="font-medium text-green-600 mb-2">Strengths</h6>
                                          <ul className="space-y-1 text-sm">
                                            {selectedDate.meaning.strengths.map((strength, i) => (
                                              <li key={i} className="text-foreground-secondary">• {strength}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      
                                      {selectedDate.meaning.cautions.length > 0 && (
                                        <div>
                                          <h6 className="font-medium text-amber-600 mb-2">Cautions</h6>
                                          <ul className="space-y-1 text-sm">
                                            {selectedDate.meaning.cautions.map((caution, i) => (
                                              <li key={i} className="text-foreground-secondary">• {caution}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      
                                <div>
                                        <h6 className="font-medium text-foreground mb-2">Suitability</h6>
                                        <p className="text-sm text-foreground-secondary">{selectedDate.meaning.suitability}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* How test day will feel */}
                                {selectedDate.description?.feel && (
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-3">How test day will feel</h4>
                                    <p className="text-sm text-foreground-secondary italic">
                                      {selectedDate.description.feel}
                                    </p>
                                  </div>
                                )}

                                {/* Why it may feel this way */}
                                {selectedDate.description?.why && (
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-3">Why it may feel this way</h4>
                                    <p className="text-sm text-foreground-secondary">
                                      {selectedDate.description.why}
                                    </p>
                                  </div>
                                )}

                                {/* Coach tips for today */}
                                {selectedDate.description?.advice && selectedDate.description.advice.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-3">Coach tips for today</h4>
                                    <ul className="space-y-2 text-sm">
                                      {selectedDate.description.advice.map((tip, i) => (
                                        <li key={i} className="text-foreground-secondary flex items-start">
                                          <span className="text-blue-600 mr-2">•</span>
                                          <span>{tip}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Signals */}
                                {selectedDate.meaning?.signals && (
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-3">Signals</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      {selectedDate.meaning.signals.moon_sign && (
                                        <div>
                                      <span className="text-foreground-secondary">Moon Sign:</span>
                                          <span className="ml-2 text-foreground">{selectedDate.meaning.signals.moon_sign}</span>
                                    </div>
                                      )}
                                      {selectedDate.meaning.signals.mercury_state && (
                                        <div>
                                      <span className="text-foreground-secondary">Mercury:</span>
                                          <span className="ml-2 text-foreground">{selectedDate.meaning.signals.mercury_state}</span>
                                        </div>
                                      )}
                                      {selectedDate.meaning.signals.tone && (
                                        <div>
                                          <span className="text-foreground-secondary">Tone:</span>
                                          <span className="ml-2 text-foreground">{selectedDate.meaning.signals.tone.join(", ")}</span>
                                    </div>
                                      )}
                                      {selectedDate.meaning.signals.discipline && (
                                        <div>
                                          <span className="text-foreground-secondary">Discipline:</span>
                                          <span className="ml-2 text-foreground">{selectedDate.meaning.signals.discipline}</span>
                                    </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Practical Info */}
                                <div>
                                  <h4 className="font-semibold text-foreground mb-3">Test Information</h4>
                                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-foreground-secondary">Test Date:</span>
                                      <span className="text-foreground">{formatTestDate(selectedDate.date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-foreground-secondary">Day of Week:</span>
                                      <span className="text-foreground">{selectedDate.weekday}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-foreground-secondary">Score Release:</span>
                                      <span className="text-foreground">{getEstimatedScoreReleaseDate(selectedDate.date)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Planetary Positions */}
                                <div>
                                  <h4 className="font-semibold text-foreground mb-3">Planetary Positions (00:00 GMT)</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    {Object.entries(selectedDate.bodies).map(([planet, position]) => (
                                      <div key={planet} className="flex justify-between bg-card/50 p-2 rounded">
                                        <span className="text-foreground-secondary font-medium">{planet}:</span>
                                        <span className="text-foreground font-mono text-xs">{position}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Notes and Sources */}
                                {(selectedDate.notes.length > 0 || selectedDate.sources_inline.length > 0) && (
                                  <div className="grid md:grid-cols-2 gap-6">
                                    {selectedDate.notes.length > 0 && (
                                      <div>
                                        <h4 className="font-semibold text-foreground mb-3">Astrological Notes</h4>
                                        <ul className="space-y-1 text-sm">
                                          {selectedDate.notes.map((note, i) => (
                                            <li key={i} className="text-foreground-secondary">• {note}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {selectedDate.sources_inline.length > 0 && (
                                      <div>
                                        <h4 className="font-semibold text-foreground mb-3">Data Sources</h4>
                                        <ul className="space-y-1 text-sm">
                                          {selectedDate.sources_inline.map((source, i) => (
                                            <li key={i} className="text-foreground-secondary">• {source}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Footer with UPangea branding */}
                                <div className="border-t pt-4 text-center">
                                  <BrandBadge variant="minimal" />
                                  {yearView && (
                                    <p className="text-xs text-foreground-muted mt-2">
                                      {getAstroData().overall_sources_note}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm" 
                          className="bg-gradient-accent hover:opacity-90"
                          onClick={() => {
                            setShareDate(date);
                            setIsShareModalOpen(true);
                          }}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </GradientFrame>
                </motion.div>
              ))
            )}
          </div>

          {/* Legend */}
          {filteredDates.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mt-12 text-center"
            >
              <GradientFrame variant="surface" padding="md" className="max-w-2xl mx-auto">
                <h4 className="font-semibold text-foreground mb-3">Match Quality Legend</h4>
                <div className="flex justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">⭐</span>
                    <span className="text-foreground-secondary">Excellent match</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">✨</span>
                    <span className="text-foreground-secondary">Very good match</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">📋</span>
                    <span className="text-foreground-secondary">Good for certain types</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">🔁</span>
                    <span className="text-foreground-secondary">Mercury retrograde</span>
                  </div>
                </div>
              </GradientFrame>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 text-center"
          >
            <BrandBadge variant="minimal" />
            <p className="text-xs text-foreground-muted mt-2 max-w-2xl mx-auto">
              {getAstroData().overall_sources_note}
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        date={shareDate}
      />
    </div>
  );
}