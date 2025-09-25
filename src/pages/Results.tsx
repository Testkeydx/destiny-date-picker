"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe, Filter, Moon, Zap, Share2, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientFrame } from "@/components/ui/gradient-frame";
import { BrandBadge } from "@/components/ui/brand-badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { ScoreChip } from "@/components/ui/score-chip";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { scoreDate } from "@/utils/mockScore";
import mcatDatesData from "@/data/mcat-dates.json";

interface ScoredDate {
  testDate: string;
  scoreReleaseDate: string;
  score: number;
  badges: string[];
  why: string[];
  moonPhase: string;
  moonSign: string;
  mercuryStatus: "direct" | "retrograde";
  jupiterAspect: "positive" | "neutral" | "negative";
  saturnAspect: "positive" | "neutral" | "negative";
}

export default function Results() {
  const navigate = useNavigate();
  const [scoredDates, setScoredDates] = useState<ScoredDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<ScoredDate | null>(null);
  const [filters, setFilters] = useState({
    avoidMercuryRx: false,
    preferWeekends: false,
    insideWindow: false,
  });

  useEffect(() => {
    const userData = localStorage.getItem("mcatStarData");
    if (!userData) {
      navigate("/onboarding");
      return;
    }

    const userInput = JSON.parse(userData);
    
    // Score all dates
    const scored = mcatDatesData.map(date => scoreDate(date, userInput));
    
    // Sort by score (highest first)
    scored.sort((a, b) => b.score - a.score);
    
    setScoredDates(scored);
  }, [navigate]);

  const filteredDates = scoredDates.filter(date => {
    if (filters.avoidMercuryRx && date.mercuryStatus === "retrograde") return false;
    if (filters.preferWeekends) {
      const dayOfWeek = new Date(date.testDate).getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) return false;
    }
    if (filters.insideWindow && !date.badges.some(badge => badge.includes("Release Window"))) return false;
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getAspectVariant = (aspect: string) => {
    if (aspect === "positive") return "positive";
    if (aspect === "negative") return "negative";
    return "neutral";
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
            <img src="/src/assets/upangea-logo.png" alt="UPangea Logo" className="h-6 w-6" />
            <span className="font-semibold text-foreground">MCAT Star</span>
          </div>
        </div>
        <BrandBadge size="sm" variant="glass" />
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
              Your Top MCAT Dates
            </h1>
            <p className="text-foreground-secondary">
              Cosmic timing meets practical planning
            </p>
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
                
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={filters.avoidMercuryRx ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => setFilters(prev => ({ ...prev, avoidMercuryRx: !prev.avoidMercuryRx }))}
                  >
                    Avoid Mercury Retrograde
                  </Badge>
                  
                  <Badge 
                    variant={filters.preferWeekends ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => setFilters(prev => ({ ...prev, preferWeekends: !prev.preferWeekends }))}
                  >
                    Prefer Weekends
                  </Badge>
                  
                  <Badge 
                    variant={filters.insideWindow ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => setFilters(prev => ({ ...prev, insideWindow: !prev.insideWindow }))}
                  >
                    Inside Goal Window
                  </Badge>
                </div>
              </div>
            </GradientFrame>
          </motion.div>

          {/* Results */}
          <div className="space-y-6">
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
                    onClick={() => setFilters({ avoidMercuryRx: false, preferWeekends: false, insideWindow: false })}
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
                    variant={index === 0 ? "hero" : "surface"}
                    padding="lg" 
                    className="hover:shadow-glow transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                      {/* Date Info */}
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <ProgressRing value={date.score} size={60} />
                          
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">
                              {formatDate(date.testDate)}
                              {index === 0 && (
                                <span className="ml-2 text-lg">⭐</span>
                              )}
                            </h3>
                            <p className="text-foreground-secondary">
                              Score Release: {formatDate(date.scoreReleaseDate)}
                            </p>
                            
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {date.badges.slice(0, 3).map((badge, i) => (
                                <ScoreChip key={i} variant="neutral" size="sm">
                                  {badge}
                                </ScoreChip>
                              ))}
                              <ScoreChip variant={getAspectVariant(date.jupiterAspect)}>
                                Jupiter {date.jupiterAspect === "positive" ? "✨" : date.jupiterAspect === "negative" ? "⚠️" : "➖"}
                              </ScoreChip>
                            </div>
                            
                            {/* Why this date */}
                            <div className="mt-3">
                              <p className="text-sm font-medium text-foreground-secondary mb-1">
                                Why this date:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {date.why.slice(0, 2).map((reason, i) => (
                                  <span key={i} className="text-xs bg-upangea-blue/10 text-upangea-blue px-2 py-1 rounded-full">
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline"
                              onClick={() => setSelectedDate(date)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                {formatDate(date.testDate)} - Cosmic Details
                              </DialogTitle>
                            </DialogHeader>
                            {selectedDate && (
                              <div className="grid md:grid-cols-2 gap-6">
                                {/* Astro Details */}
                                <div>
                                  <h4 className="font-semibold text-foreground mb-3">Astrological Snapshot</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-foreground-secondary">Moon Phase:</span>
                                      <span className="text-foreground">{selectedDate.moonPhase}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-foreground-secondary">Moon Sign:</span>
                                      <span className="text-foreground">{selectedDate.moonSign}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-foreground-secondary">Mercury:</span>
                                      <ScoreChip variant={selectedDate.mercuryStatus === "direct" ? "positive" : "negative"}>
                                        {selectedDate.mercuryStatus}
                                      </ScoreChip>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-foreground-secondary">Jupiter:</span>
                                      <ScoreChip variant={getAspectVariant(selectedDate.jupiterAspect)}>
                                        {selectedDate.jupiterAspect}
                                      </ScoreChip>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-foreground-secondary">Saturn:</span>
                                      <ScoreChip variant={getAspectVariant(selectedDate.saturnAspect)}>
                                        {selectedDate.saturnAspect}
                                      </ScoreChip>
                                    </div>
                                  </div>
                                </div>

                                {/* Practical Details */}
                                <div>
                                  <h4 className="font-semibold text-foreground mb-3">Practical Info</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-foreground-secondary">Test Date:</span>
                                      <span className="text-foreground">{formatDate(selectedDate.testDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-foreground-secondary">Score Release:</span>
                                      <span className="text-foreground">{formatDate(selectedDate.scoreReleaseDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-foreground-secondary">Composite Score:</span>
                                      <ProgressRing value={selectedDate.score} size={40} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button className="bg-gradient-accent hover:opacity-90">
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

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 text-center"
          >
            <BrandBadge variant="minimal" />
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}