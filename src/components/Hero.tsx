"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Headphones,
  Workflow,
  Layers,
  BarChart3,
  Bot,
  Check,
  ChevronDown,
} from "lucide-react";
import TechMarquee from "@/components/TechMarquee";

const aiCards = [
  {
    icon: Headphones,
    title: "AI AGENTS",
    description:
      "Intelligent voice & chat agents that engage, qualify, and support customers 24/7.",
    features: ["Voice AI", "Chat AI", "Lead Qualification", "Customer Support"],
  },
  {
    icon: Workflow,
    title: "AI WORKFLOW AUTOMATION",
    description:
      "Automate repetitive tasks and business processes with intelligent workflows.",
    features: [
      "Process Automation",
      "Approval Workflows",
      "Task Management",
      "Team Collaboration",
    ],
  },
  {
    icon: Layers,
    title: "AI INFRASTRUCTURE",
    description:
      "Scalable, secure, and high-performance infrastructure built for enterprise AI.",
    features: [
      "Scalable Architecture",
      "Model Operations",
      "Data & Retrieval Systems",
      "Security & Compliance",
    ],
  },
  {
    icon: BarChart3,
    title: "AI ANALYTICS",
    description:
      "Turn data into actionable insights with advanced AI analytics.",
    features: [
      "Performance Insights",
      "Predictive Analytics",
      "Real-time Dashboards",
      "Data Visualizations",
    ],
  },
  {
    icon: Bot,
    title: "AI WORKFORCE",
    description:
      "Build and deploy a digital workforce that works around the clock to grow your business.",
    features: [
      "24/7 Availability",
      "Multi-task Execution",
      "Continuous Learning",
      "Cost Efficiency",
    ],
  },
];

const MOBILE_BREAKPOINT = 767;

export default function Hero() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setScrollProgress(0);
      return;
    }

    const handleScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.min(1, scrolled / (heroRef.current.offsetHeight * 0.25));
      setScrollProgress(progress);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  const textOpacity = Math.max(0, 1 - scrollProgress * 1.6);
  const showCards = scrollProgress > 0.3;

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen md:min-h-0"
      style={isMobile ? undefined : { height: "300vh" }}
    >
      <div className="relative md:sticky md:top-0 h-screen overflow-hidden">
        {/* Phase 1 background */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={isMobile ? undefined : { opacity: 1 - scrollProgress }}
        >
          <Image
            src="/assets/herobg1.jpeg"
            alt="State AI"
            fill
            className="object-cover object-right"
            priority
            sizes="(max-width: 640px) 100vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/60 to-transparent" />
        </div>

        {/* Phase 2 background - desktop scroll transition only */}
        <div
          className="hidden md:block absolute inset-0 transition-opacity duration-500"
          style={{ opacity: scrollProgress }}
        >
          <div className="absolute inset-0 md:scale-65 scale-50" style={{ transformOrigin: "center center" }}>
            <Image
              src="/assets/herobg2.jpeg"
              alt="State AI"
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-background/20" />
        </div>

        {/* PHASE 1 - Text */}
        <div
          className="absolute inset-0 z-10 flex items-center"
          style={
            isMobile
              ? undefined
              : {
                  opacity: textOpacity,
                  transform: `translateY(${-scrollProgress * 30}px) translateX(-${scrollProgress * 15}px)`,
                }
          }
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl md:-ml-8 glass-subtle rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/[0.08]">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-6 sm:mb-8 animate-reveal">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-silver animate-pulse" />
                <span className="text-[11px] sm:text-sm text-silver font-medium">
                  Emerging AI Development Company
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-3 sm:mb-4 animate-reveal stagger-1" style={{ opacity: 0, animationFillMode: "forwards" }}>
                <span className="text-foreground">The Strategic AI Partner</span>
                <br />
                <span className="gradient-text">for Modern Enterprises</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-silver mb-2 sm:mb-3 font-medium animate-reveal stagger-2 max-w-xl" style={{ opacity: 0, animationFillMode: "forwards" }}>
                From strategy to deployment, we build intelligent solutions that drive measurable business outcomes.
              </p>
              <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 max-w-lg leading-relaxed animate-reveal stagger-2" style={{ opacity: 0, animationFillMode: "forwards" }}>
                Transforming Ideas into AI-Powered Solutions — empowering businesses to innovate, scale, and lead in the digital era.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-reveal stagger-3" style={{ opacity: 0, animationFillMode: "forwards" }}>
                <a href="#contact" className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-silver-bright/10 hover:bg-silver-bright/20 text-silver-bright font-semibold text-sm sm:text-base rounded-lg border border-silver-bright/15 hover:border-silver-bright/30 transition-all duration-300 group whitespace-nowrap">
                  Get a Strategy Call
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#services" className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 glass-card hover:bg-white/[0.05] text-foreground font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 whitespace-nowrap">
                  Explore Solutions
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 transition-opacity duration-300"
          style={isMobile ? undefined : { opacity: scrollProgress < 0.1 ? 1 : 0 }}
        >
          <span className="text-[10px] sm:text-xs text-muted tracking-[0.2em] uppercase">Scroll to Explore</span>
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-silver animate-bounce" />
        </div>

        {/* PHASE 2 - Cards (hidden on mobile, visible md+) */}
        <div className="hidden md:block absolute inset-0 z-10 pointer-events-none" style={{ opacity: showCards ? Math.min(1, scrollProgress * 1.2) : 0 }}>
          <div className="absolute pointer-events-auto transition-all duration-700 ease-out" style={{ top: "14%", left: "12%", width: "250px", opacity: showCards ? 1 : 0, transform: showCards ? "translateY(0)" : "translateY(20px)", transitionDelay: "0ms" }}>
            <FloatingCard card={aiCards[0]} />
          </div>
          <div className="absolute pointer-events-auto transition-all duration-700 ease-out" style={{ top: "12%", right: "12%", width: "250px", opacity: showCards ? 1 : 0, transform: showCards ? "translateY(0)" : "translateY(20px)", transitionDelay: "120ms" }}>
            <FloatingCard card={aiCards[1]} />
          </div>
          <div className="absolute pointer-events-auto transition-all duration-700 ease-out" style={{ bottom: "22%", left: "10%", width: "250px", opacity: showCards ? 1 : 0, transform: showCards ? "translateY(0)" : "translateY(-20px)", transitionDelay: "240ms" }}>
            <FloatingCard card={aiCards[2]} />
          </div>
          <div className="absolute pointer-events-auto transition-all duration-700 ease-out" style={{ bottom: "22%", right: "10%", width: "250px", opacity: showCards ? 1 : 0, transform: showCards ? "translateY(0)" : "translateY(-20px)", transitionDelay: "360ms" }}>
            <FloatingCard card={aiCards[3]} />
          </div>
          <div className="absolute pointer-events-auto transition-all duration-700 ease-out" style={{ bottom: "6%", left: "50%", width: "280px", opacity: showCards ? 1 : 0, transform: showCards ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-20px)", transitionDelay: "480ms" }}>
            <FloatingCard card={aiCards[4]} />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-auto transition-all duration-700" style={{ bottom: "15%", opacity: showCards ? 0.6 : 0, transitionDelay: "550ms" }}>
            <div className="w-10 h-px bg-silver/30" />
            <span className="text-[10px] text-silver-dim tracking-[0.25em] uppercase font-medium">Click the Cube</span>
            <div className="w-10 h-px bg-silver/30" />
          </div>
        </div>

        {/* Tech stack marquee - always visible on mobile, scroll-revealed on desktop */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 transition-all duration-600"
          style={
            isMobile
              ? undefined
              : {
                  opacity: showCards ? 1 : 0,
                  transform: showCards ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: "300ms",
                }
          }
        >
          <div className="glass-strong border-t border-white/[0.06]">
            <TechMarquee />
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingCard({ card }: { card: (typeof aiCards)[number] }) {
  const Icon = card.icon;
  return (
    <div className="glass-card rounded-xl p-4 silver-shine hover:border-white/[0.15] transition-all duration-400 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:-translate-y-0.5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg glass-icon flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-silver" />
        </div>
        <h3 className="text-[11px] font-bold text-silver-bright tracking-wider">{card.title}</h3>
      </div>
      <p className="text-[11px] text-gray-400 leading-relaxed mb-2">{card.description}</p>
      <div className="space-y-1">
        {card.features.map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-[11px] text-gray-300">
            <Check className="w-3 h-3 text-silver flex-shrink-0" />
            {feature}
          </div>
        ))}
      </div>
    </div>
  );
}