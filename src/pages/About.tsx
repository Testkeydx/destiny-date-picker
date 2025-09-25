"use client";

import { motion } from "framer-motion";
import { Globe, Book, HelpCircle, ArrowLeft, Star, Moon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientFrame } from "@/components/ui/gradient-frame";
import { BrandBadge } from "@/components/ui/brand-badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import upangeaLogo from "@/assets/upangea-logo.png";

const faqs = [
  {
    question: "What is Mercury retrograde and why does it matter?",
    answer: "Mercury retrograde occurs when Mercury appears to move backward in its orbit from Earth's perspective. Astrologically, it's associated with communication challenges, technology glitches, and delays. For test-taking, some believe it can affect mental clarity and focus, which is why we factor it into our scoring algorithm."
  },
  {
    question: "How do you score the dates?",
    answer: "Our algorithm considers multiple factors: moon phases (full moons are generally favored for peak energy), planetary aspects (Mercury direct vs. retrograde, Jupiter and Saturn influences), your personal preferences (energy levels, risk tolerance), and practical considerations (score release timing, weekends vs. weekdays). Each factor contributes to a composite score from 0-100."
  },
  {
    question: "Can I change the weights or add more preferences?",
    answer: "Currently, the algorithm uses preset weights based on traditional astrological principles and practical considerations. We're exploring options to let users customize these weights in future versions. Your feedback helps us prioritize which features to build next!"
  },
  {
    question: "Is this scientifically accurate?",
    answer: "This tool is designed for entertainment and inspiration, not scientific prediction. While we use real astronomical data for planetary positions and moon phases, the astrological interpretations are based on traditional beliefs rather than scientific evidence. Your study habits and preparation remain the most important factors for MCAT success!"
  },
  {
    question: "Do I need to know my exact birth time?",
    answer: "Birth time is optional but helpful for more personalized readings. If you don't know your exact time, the tool will still work using your birth date and location. For the most accurate astrological calculations, having your birth time within 2-3 hours is ideal."
  }
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/")}
            className="text-foreground-secondary hover:text-upangea-blue"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center space-x-2">
            <img src={upangeaLogo} alt="UPangea Logo" className="h-6 w-6" />
            <span className="font-semibold text-foreground">MCAT Star</span>
          </div>
        </div>
        <BrandBadge size="sm" variant="glass" />
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                About MCAT Star Date Picker
              </h1>
              <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
                Where cosmic timing meets medical school preparation
              </p>
            </motion.div>
          </div>

          {/* Key Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <GradientFrame variant="hero" padding="lg" className="text-center">
              <div className="flex justify-center space-x-4 mb-6">
                <Book className="h-8 w-8 text-upangea-blue" />
                <Star className="h-8 w-8 text-upangea-green" />
                <Moon className="h-8 w-8 text-upangea-blue" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                This is for fun + planning. Study still matters most.
              </h2>
              <p className="text-foreground-secondary">
                While we love exploring cosmic connections, your dedication to studying and preparation 
                remains the single most important factor in MCAT success. Use this tool for inspiration 
                and timing guidance, but never substitute it for solid preparation.
              </p>
            </GradientFrame>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <GradientFrame variant="surface" padding="md" className="text-center">
                <Star className="h-8 w-8 text-upangea-blue mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Astrological Analysis</h3>
                <p className="text-sm text-foreground-secondary">
                  We analyze moon phases, planetary aspects, and cosmic events for each test date.
                </p>
              </GradientFrame>

              <GradientFrame variant="surface" padding="md" className="text-center">
                <Zap className="h-8 w-8 text-upangea-green mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Personal Preferences</h3>
                <p className="text-sm text-foreground-secondary">
                  Your birth info and preferences help us personalize the cosmic timing recommendations.
                </p>
              </GradientFrame>

              <GradientFrame variant="surface" padding="md" className="text-center">
                <Book className="h-8 w-8 text-upangea-blue mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Practical Planning</h3>
                <p className="text-sm text-foreground-secondary">
                  We factor in score release windows, weekdays vs weekends, and your timeline goals.
                </p>
              </GradientFrame>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <GradientFrame variant="surface" padding="lg">
              <div className="flex items-center space-x-2 mb-6">
                <HelpCircle className="h-6 w-6 text-upangea-blue" />
                <h2 className="text-2xl font-semibold text-foreground">
                  Frequently Asked Questions
                </h2>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-foreground hover:text-upangea-blue">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground-secondary">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </GradientFrame>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center"
          >
            <GradientFrame variant="glass" padding="lg" className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Ready to Find Your Destiny Date?
              </h3>
              <Button
                size="lg"
                onClick={() => navigate("/")}
                className="bg-gradient-primary hover:opacity-90 text-white px-8 py-3 rounded-2xl shadow-glow transition-all duration-200 hover:scale-105 mb-4"
              >
                Start Your Journey
              </Button>
              <div className="mt-4">
                <BrandBadge size="sm" variant="minimal" />
              </div>
            </GradientFrame>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center border-t border-border/50 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-foreground-muted">
              © 2025 UPangea — Powered by UPangea
            </p>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-sm text-foreground-secondary hover:text-upangea-blue"
              >
                Home
              </Button>
              <BrandBadge size="sm" variant="minimal" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}