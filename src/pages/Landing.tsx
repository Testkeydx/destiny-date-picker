"use client";

import { motion } from "framer-motion";
import { Clock, Star, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientFrame } from "@/components/ui/gradient-frame";
import { BrandBadge } from "@/components/ui/brand-badge";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Clock,
    title: "Quick Setup",
    description: "Birth info + goals in under a minute."
  },
  {
    icon: Star,
    title: "Astrology-aware", 
    description: "Moon, Mercury, and more—made simple."
  },
  {
    icon: Zap,
    title: "Release-date smart",
    description: "We factor in your score release window."
  }
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Globe className="h-6 w-6 text-upangea-blue" />
          <span className="font-semibold text-foreground">MCAT Astro</span>
        </div>
        <BrandBadge size="sm" variant="glass" />
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Find Your MCAT Destiny Date{" "}
              <span className="inline-block">✨</span>
            </h1>
            <p className="text-xl text-foreground-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
              Astrology + practical scheduling to pick your best test day.
            </p>
          </motion.div>

          {/* Central Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mb-12"
          >
            <GradientFrame variant="glass" padding="lg" className="max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <Globe className="h-12 w-12 text-upangea-blue" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Cosmic Timing Meets Medical School Goals
              </h2>
              <p className="text-foreground-secondary mb-8">
                Let the stars guide your MCAT journey with data-driven astrological insights.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/onboarding")}
                className="bg-gradient-primary hover:opacity-90 text-white px-8 py-3 rounded-2xl shadow-glow transition-all duration-200 hover:scale-105"
              >
                Start Your Journey
              </Button>
            </GradientFrame>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1, ease: "easeOut" }}
              >
                <GradientFrame variant="surface" padding="md" className="h-full text-center hover:shadow-glow transition-all duration-200 hover:-translate-y-1">
                  <feature.icon className="h-8 w-8 text-upangea-blue mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-foreground-secondary">
                    {feature.description}
                  </p>
                </GradientFrame>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Signal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 text-center"
          >
            <p className="text-sm text-foreground-muted mb-4">
              Used by future doctors who believe in cosmic timing
            </p>
            <BrandBadge variant="minimal" />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center border-t border-border/50 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-foreground-muted">
              © 2025 UPangea — Powered by UPangea
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/about")}
                className="text-sm text-foreground-secondary hover:text-upangea-blue transition-colors"
              >
                About
              </button>
              <BrandBadge size="sm" variant="minimal" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}