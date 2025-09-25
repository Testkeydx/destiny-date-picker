"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Sliders, Target, ArrowRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Slider } from "@/components/ui/slider";
import { GradientFrame } from "@/components/ui/gradient-frame";
import { BrandBadge } from "@/components/ui/brand-badge";
import { useNavigate } from "react-router-dom";
import { YearSelector } from "@/components/YearSelector";

interface OnboardingData {
  birthDate: Date | undefined;
  birthTime: string;
  city: string;
  country: string;
  energyPreference: number;
  riskTolerance: number;
  preferredTestStart: Date | undefined;
  preferredTestEnd: Date | undefined;
  timezone: string;
  selectedYear: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [data, setData] = useState<OnboardingData>({
    birthDate: undefined,
    birthTime: "",
    city: "",
    country: "",
    energyPreference: 50,
    riskTolerance: 50,
    preferredTestStart: new Date(2026, 0, 1), // January 1, 2026
    preferredTestEnd: new Date(2026, 0, 31),  // January 31, 2026
    timezone: "America/New_York",
    selectedYear: "2026",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store data in localStorage for mock functionality
    localStorage.setItem("mcatStarData", JSON.stringify(data));
    navigate("/results");
  };

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 md:py-6 flex justify-between items-center">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <img src="/src/assets/upangea-logo.png" alt="UPangea Logo" className="h-5 w-5 md:h-6 md:w-6" />
          <span className="font-semibold text-sm md:text-base text-foreground">MCAT Star</span>
        </button>
        <BrandBadge size="sm" variant="glass" />
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Tell Us About Your 2026 MCAT Journey
            </h1>
            <p className="text-foreground-secondary">
              A few details to create your personalized 2026 cosmic MCAT timeline
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Birth Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <GradientFrame variant="surface" padding="lg">
                  <div className="flex items-center space-x-2 mb-6">
                    <Calendar className="h-5 w-5 text-upangea-blue" />
                    <h2 className="text-xl font-semibold text-foreground">Birth Information</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="birthDate" className="text-foreground-secondary">Birth Date *</Label>
                      <div className="mt-2">
                        <DatePicker
                          date={data.birthDate}
                          onSelect={(date) => updateData("birthDate", date)}
                          placeholder="Select your birth date"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="birthTime" className="text-foreground-secondary">Birth Time (Optional)</Label>
                      <Input
                        id="birthTime"
                        type="time"
                        value={data.birthTime}
                        onChange={(e) => updateData("birthTime", e.target.value)}
                        className="mt-2"
                        placeholder="For more accurate readings"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city" className="text-foreground-secondary">City/State *</Label>
                      <div className="relative mt-2">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                        <Input
                          id="city"
                          value={data.city}
                          onChange={(e) => updateData("city", e.target.value)}
                          placeholder="e.g., New York, NY"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="country" className="text-foreground-secondary">Country *</Label>
                      <Select value={data.country} onValueChange={(value) => updateData("country", value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </GradientFrame>
              </motion.div>

              {/* Right Column - Preferences */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <GradientFrame variant="surface" padding="lg" className="mb-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Sliders className="h-5 w-5 text-upangea-blue" />
                    <h2 className="text-xl font-semibold text-foreground">Your Preferences</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-foreground-secondary flex items-center justify-between">
                        Energy Preference
                        <span className="text-sm">
                          {data.energyPreference < 30 ? "🧘 Calm" : 
                           data.energyPreference > 70 ? "🔥 High-Energy" : "⚖️ Balanced"}
                        </span>
                      </Label>
                      <div className="mt-3 px-3">
                        <Slider
                          value={[data.energyPreference]}
                          onValueChange={([value]) => updateData("energyPreference", value)}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-foreground-secondary flex items-center justify-between">
                        Risk Tolerance
                        <span className="text-sm">
                          {data.riskTolerance < 30 ? "🛬 Safe" : 
                           data.riskTolerance > 70 ? "🚀 YOLO" : "📊 Balanced"}
                        </span>
                      </Label>
                      <div className="mt-3 px-3">
                        <Slider
                          value={[data.riskTolerance]}
                          onValueChange={([value]) => updateData("riskTolerance", value)}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </GradientFrame>

                <GradientFrame variant="surface" padding="lg">
                  <div className="flex items-center space-x-2 mb-6">
                    <Target className="h-5 w-5 text-upangea-blue" />
                    <h2 className="text-xl font-semibold text-foreground">Test Date Preferences</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="selectedYear" className="text-foreground-secondary">Test Year</Label>
                      <div className="mt-2">
                        <YearSelector
                          selectedYear={data.selectedYear}
                          onYearChange={(year) => updateData("selectedYear", year)}
                          className="w-full"
                        />
                      </div>
                    </div>
                     
                     <p className="text-sm text-foreground-secondary">
                       When would you ideally like to take the MCAT? We'll find the best dates within your preferred window.
                     </p>
                     
                       <div className="space-y-4">
                        <div>
                          <Label htmlFor="releaseStart" className="text-foreground-secondary">Earliest Test Date</Label>
                          <div className="mt-2">
                            <DatePicker
                              date={data.preferredTestStart}
                              onSelect={(date) => updateData("preferredTestStart", date)}
                              placeholder="Earliest date"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="releaseEnd" className="text-foreground-secondary">Latest Test Date</Label>
                          <div className="mt-2">
                            <DatePicker
                              date={data.preferredTestEnd}
                              onSelect={(date) => updateData("preferredTestEnd", date)}
                              placeholder="Latest date"
                            />
                          </div>
                        </div>
                      </div>

                    <div>
                      <Label htmlFor="timezone" className="text-foreground-secondary">Test Center Timezone</Label>
                      <Select value={data.timezone} onValueChange={(value) => updateData("timezone", value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </GradientFrame>
              </motion.div>
            </div>

            {/* Submit Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 text-center"
            >
              <GradientFrame variant="glass" padding="lg" className="max-w-md mx-auto">
                <Button
                  type="submit"
                  size="lg"
                  disabled={!data.birthDate || !data.city || !data.country}
                  className="bg-gradient-primary hover:opacity-90 text-white px-8 py-3 rounded-2xl shadow-glow transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                  See My Best Dates
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <p className="text-xs text-foreground-muted mt-4">
                  We never store personal birth data.
                </p>
                
                <div className="mt-4">
                  <BrandBadge size="sm" variant="minimal" />
                </div>
              </GradientFrame>
            </motion.div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}