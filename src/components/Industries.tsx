"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Building2, HeartPulse, GraduationCap, Factory, LandPlot, Shield, Coins, Truck, Zap, Monitor, FlaskConical, Sprout, Users } from "lucide-react";

const industries = [
  { id: "agriculture", name: "Agriculture", icon: Sprout, description: "AI-driven precision farming, crop health monitoring, and yield prediction.", image: "/assets/industries/agriculture.jpeg", useCases: ["Precision Agriculture", "Crop Health Analysis"], stats: { accuracy: "93%", savings: "15% water" }, gradient: "from-green-500/20 to-emerald-500/10", borderColor: "border-green-500/30" },
  { id: "automotive", name: "Automotive", icon: Truck, description: "AI for vehicle telematics, predictive maintenance, and fleet optimization.", image: "/assets/industries/automotive.jpeg", useCases: ["Fleet Telematics", "Predictive Maintenance"], stats: { accuracy: "94%", speed: "20% faster" }, gradient: "from-sky-500/20 to-indigo-500/10", borderColor: "border-sky-500/30" },
  { id: "real-estate", name: "Real Estate", icon: LandPlot, description: "Property valuation, site selection, construction monitoring.", image: "/assets/industries/real-estate.jpeg", useCases: ["Property Valuation", "Site Analysis"], stats: { accuracy: "89%" }, gradient: "from-stone-500/20 to-slate-500/10", borderColor: "border-stone-500/30" },
  { id: "retail", name: "Retail & E-Commerce", icon: Truck, description: "Personalized recommendations, inventory optimization, demand forecasting.", image: "/assets/industries/retail-ecommerce.jpeg", useCases: ["Recommendation Engines", "Demand Forecasting"], stats: { accuracy: "92%" }, gradient: "from-rose-500/20 to-pink-500/10", borderColor: "border-rose-500/30" },
  { id: "healthcare", name: "Healthcare", icon: HeartPulse, description: "AI-powered diagnostics and clinical decision support.", image: "/assets/industries/healthcare.jpeg", useCases: ["Medical Imaging", "Risk Stratification"], stats: { accuracy: "97%" }, gradient: "from-emerald-500/20 to-teal-500/10", borderColor: "border-emerald-500/30" },
  { id: "transportation", name: "Transportation", icon: Truck, description: "Routing, logistics optimization, and autonomous vehicle systems.", image: "/assets/industries/transportation.jpeg", useCases: ["Routing", "Logistics Optimization"], stats: { accuracy: "93%" }, gradient: "from-indigo-500/20 to-blue-500/10", borderColor: "border-indigo-500/30" },
  { id: "manufacturing", name: "Manufacturing", icon: Factory, description: "Predictive maintenance, quality control, and supply chain automation.", image: "/assets/industries/manufacturing.jpeg", useCases: ["Predictive Maintenance", "Quality Inspection"], stats: { accuracy: "95%" }, gradient: "from-amber-500/20 to-orange-500/10", borderColor: "border-amber-500/30" },
  { id: "travel", name: "Travel & Tourism", icon: Zap, description: "Customer personalization, demand forecasting, and route optimization.", image: "/assets/industries/tourism-travel.jpeg", useCases: ["Personalization", "Demand Forecasting"], stats: { accuracy: "90%" }, gradient: "from-yellow-500/20 to-amber-500/10", borderColor: "border-yellow-500/30" },
  { id: "professional-services", name: "Professional Services", icon: Building2, description: "Automation for client services, resource allocation, and project analytics.", image: "/assets/industries/professional-services.jpeg", useCases: ["Resource Optimization", "Client Insights"], stats: { accuracy: "91%" }, gradient: "from-stone-500/20 to-slate-500/10", borderColor: "border-stone-500/30" },
  { id: "software-vendors", name: "Software Vendors", icon: Monitor, description: "Embedded AI features, product analytics, and DevOps automation.", image: "/assets/industries/software-vendor.jpeg", useCases: ["Product Analytics", "DevOps Automation"], stats: { accuracy: "96%" }, gradient: "from-purple-500/20 to-violet-500/10", borderColor: "border-purple-500/30" },
  { id: "human-resources", name: "Human Resources", icon: Users, description: "AI-enabled talent acquisition, resume parsing, and employee sentiment analysis.", image: "/assets/industries/human-resources.jpeg", useCases: ["Automated Screening", "Sentiment Analysis"], stats: { efficiency: "40% faster", retention: "+18%" }, gradient: "from-teal-500/20 to-cyan-500/10", borderColor: "border-teal-500/30" },
  { id: "education", name: "Education", icon: GraduationCap, description: "Adaptive learning, automated assessment, and student analytics.", image: "/assets/industries/education.jpeg", useCases: ["Adaptive Learning", "Automated Assessment"], stats: { accuracy: "91%" }, gradient: "from-cyan-500/20 to-sky-500/10", borderColor: "border-cyan-500/30" },
];

function IndustrySVG({ id, className }: { id: string; className?: string }) {
  // Simple, original SVG illustrations (stroke-based) that use currentColor
  switch (id) {
    case "healthcare":
      return (
        <svg viewBox="0 0 48 48" className={className} style={{ color: 'var(--color-primary)' }} aria-hidden>
          <rect x="4" y="6" width="40" height="28" rx="3" stroke="currentColor" strokeWidth={1.6} fill="none" />
          <polyline points="6,24 14,24 18,16 22,28 30,12 34,24 42,24" stroke="currentColor" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "finance":
      return (
        <svg viewBox="0 0 48 48" className={className} style={{ color: 'var(--color-primary)' }} aria-hidden>
          <circle cx="14" cy="18" r="6" stroke="currentColor" strokeWidth={1.6} fill="none" />
          <rect x="26" y="12" width="16" height="12" rx="2" stroke="currentColor" strokeWidth={1.6} fill="none" />
          <line x1="26" y1="22" x2="42" y2="22" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
        </svg>
      );
    case "manufacturing":
      return (
        <svg viewBox="0 0 48 48" className={className} style={{ color: 'var(--color-primary)' }} aria-hidden>
          <rect x="6" y="22" width="10" height="14" rx="1" stroke="currentColor" strokeWidth={1.6} fill="none" />
          <rect x="20" y="18" width="8" height="18" rx="1" stroke="currentColor" strokeWidth={1.6} fill="none" />
          <rect x="34" y="14" width="8" height="22" rx="1" stroke="currentColor" strokeWidth={1.6} fill="none" />
        </svg>
      );
    case "retail":
      return (
        <svg viewBox="0 0 48 48" className={className} style={{ color: 'var(--color-primary)' }} aria-hidden>
          <rect x="10" y="14" width="28" height="22" rx="3" stroke="currentColor" strokeWidth={1.6} fill="none" />
          <path d="M16 16a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        </svg>
      );
    case "energy":
      return (
        <svg viewBox="0 0 48 48" className={className} style={{ color: 'var(--color-primary)' }} aria-hidden>
          <path d="M22 6 L12 28 L22 28 L14 42 L36 18 L26 18 Z" stroke="currentColor" strokeWidth={1.6} fill="none" strokeLinejoin="round" />
        </svg>
      );
    case "technology":
      return (
        <svg viewBox="0 0 48 48" className={className} style={{ color: 'var(--color-primary)' }} aria-hidden>
          <rect x="6" y="8" width="36" height="24" rx="2" stroke="currentColor" strokeWidth={1.6} fill="none" />
          <rect x="20" y="34" width="8" height="3" stroke="currentColor" strokeWidth={1.6} fill="none" />
        </svg>
      );
    case "education":
      return (
        <svg viewBox="0 0 48 48" className={className} style={{ color: 'var(--color-primary)' }} aria-hidden>
          <path d="M4 20 L24 10 L44 20 L24 28 Z" stroke="currentColor" strokeWidth={1.6} fill="none" strokeLinejoin="round" />
          <path d="M24 10 L24 28" stroke="currentColor" strokeWidth={1.2} />
        </svg>
      );
    case "real-estate":
      return (
        <svg viewBox="0 0 48 48" className={className} style={{ color: 'var(--color-primary)' }} aria-hidden>
          <path d="M4 22 L24 6 L44 22" stroke="currentColor" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          <rect x="10" y="22" width="12" height="14" stroke="currentColor" strokeWidth={1.6} fill="none" />
          <rect x="26" y="22" width="12" height="14" stroke="currentColor" strokeWidth={1.6} fill="none" />
        </svg>
      );
    case "government":
      return (
        <svg viewBox="0 0 48 48" className={className} style={{ color: 'var(--color-primary)' }} aria-hidden>
          <path d="M6 16 L24 6 L42 16" stroke="currentColor" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          <rect x="8" y="18" width="4" height="12" stroke="currentColor" strokeWidth={1.6} fill="none" />
          <rect x="18" y="18" width="4" height="12" stroke="currentColor" strokeWidth={1.6} fill="none" />
          <rect x="28" y="18" width="4" height="12" stroke="currentColor" strokeWidth={1.6} fill="none" />
          <rect x="38" y="18" width="4" height="12" stroke="currentColor" strokeWidth={1.6} fill="none" />
        </svg>
      );
    case "agriculture":
      return (
        <svg viewBox="0 0 48 48" className={className} style={{ color: 'var(--color-primary)' }} aria-hidden>
          <path d="M8 30 C18 10, 36 10, 40 22 C32 34, 14 42, 8 30 Z" stroke="currentColor" strokeWidth={1.6} fill="none" strokeLinejoin="round" />
        </svg>
      );
    case "human-resources":
      return (
        <svg viewBox="0 0 48 48" className={className} style={{ color: 'var(--color-primary)' }} aria-hidden>
          <circle cx="24" cy="16" r="6" stroke="currentColor" strokeWidth={1.6} fill="none" />
          <path d="M12 38 C12 30, 36 30, 36 38" stroke="currentColor" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          <circle cx="12" cy="22" r="4" stroke="currentColor" strokeWidth={1.2} fill="none" />
          <path d="M4 34 C4 30, 20 30, 20 34" stroke="currentColor" strokeWidth={1.2} fill="none" strokeLinecap="round" />
        </svg>
      );
    case "telecom":
      return (
        <svg viewBox="0 0 48 48" className={className} style={{ color: 'var(--color-primary)' }} aria-hidden>
          <line x1="24" y1="8" x2="24" y2="40" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
          <path d="M10 16 A14 14 0 0 1 38 16" stroke="currentColor" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d="M14 24 A10 10 0 0 1 34 24" stroke="currentColor" strokeWidth={1.2} fill="none" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Industries() {
  const [activeIndustry, setActiveIndustry] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "detail">("grid");

  const handleIndustryClick = (industryId: string) => {
    setActiveIndustry(industryId);
    setViewMode("detail");
  };

  const handleBackClick = () => {
    setActiveIndustry(null);
    setViewMode("grid");
  };

  const selectedIndustry = industries.find((i) => i.id === activeIndustry);

  if (viewMode === "detail" && selectedIndustry) {
    const heroImage = selectedIndustry.image ?? "/assets/industries/industries.png";
    return (
      <section id="industries" className="section-padding glass-section relative overflow-hidden">
        <div className="silver-divider absolute top-0 left-0 right-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12">
            <button
              onClick={handleBackClick}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-4 sm:mb-6 text-silver hover:text-silver-bright transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span className="text-[11px] sm:text-sm font-medium">All Industries</span>
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-start">
            <div className="relative rounded-2xl overflow-hidden glass-card border border-white/[0.08]">
              <div className="aspect-[4/3] relative">
                <Image
                  src={heroImage}
                  alt={selectedIndustry.name}
                  fill
                  className="object-contain object-center sm:object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card mb-3">
                    <IndustrySVG id={selectedIndustry.id} className="w-4 h-4 text-silver" />
                    <span className="text-sm font-medium text-silver">{selectedIndustry.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                  {selectedIndustry.name} <span className="gradient-text">Solutions</span>
                </h2>
                <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl">
                  {selectedIndustry.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-white/[0.08]">
                {Object.entries(selectedIndustry.stats).map(([key, value]) => (
                  <div key={key} className="glass-card p-4 sm:p-5 rounded-xl text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-silver-bright">{value}</div>
                    <div className="text-[10px] sm:text-xs text-muted uppercase tracking-wider mt-1">{key}</div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-silver-bright mb-4">Key Use Cases</h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {selectedIndustry.useCases.map((useCase) => (
                    <span
                      key={useCase}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 glass-chip rounded-lg text-sm sm:text-base text-gray-300 hover:text-silver-bright hover:border-white/[0.15] transition-all"
                    >
                      {useCase}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08]">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 glass-card hover:bg-white/[0.05] text-silver hover:text-silver-bright font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 group border border-white/[0.08] hover:border-white/[0.15]"
                >
                  Discuss Your {selectedIndustry.name} Project
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="industries" className="section-padding glass-section relative overflow-hidden">
      <div className="silver-divider absolute top-0 left-0 right-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12">
          <div className="relative rounded-2xl overflow-hidden glass-card border border-white/[0.06]">
              <div className="aspect-[16/8] xs:aspect-[16/7] sm:aspect-[16/6] relative min-h-[240px] sm:min-h-0">
              {/* hero image removed per request; keep subtle gradient and decorative blob */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/100 via-background/60 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center p-6">
                    {/* Decorative soft blob behind hero text (uses theme colors) */}
                    <svg
                      className="industries-hero-blob pointer-events-none"
                      viewBox="0 0 600 600"
                      aria-hidden
                    >
                      <defs>
                        <radialGradient id="industries-hero-grad" cx="50%" cy="40%" r="50%">
                          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.16" />
                          <stop offset="100%" stopColor="var(--color-background)" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      <circle cx="300" cy="300" r="280" fill="url(#industries-hero-grad)" />
                    </svg>

                    <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-4 sm:mb-6">
                    <span className="text-[11px] sm:text-sm text-silver font-medium">Industries We Serve</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
                    AI Solutions Across <span className="gradient-text">Every Industry</span>
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto">
                    Deep domain expertise combined with cutting-edge AI to solve your industry's unique challenges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {industries.map((industry, index) => {
            const Icon = industry.icon;
            return (
                <div
                  key={industry.id}
                  className={`group industries-card relative rounded-xl sm:rounded-2xl glass-card silver-shine overflow-hidden animate-reveal border transition-all duration-400 ${industry.borderColor}`}
                  style={{ animationDelay: `${index * 60}ms`, opacity: 0, animationFillMode: "forwards" }}
                >
                  <div className={`h-40 sm:h-44 lg:h-48 bg-gradient-to-br ${industry.gradient} relative overflow-hidden flex items-end`}>
                    {/* Background image if it exists */}
                    {industry.image && (
                      <Image
                        src={industry.image}
                        alt={industry.name}
                        fill
                        className="object-contain object-center sm:object-cover transition-opacity duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 250px"
                      />
                    )}

                    {/* subtle card decor (SVG) */}
                    <svg className="industries-card-decor absolute -top-6 -right-6 pointer-events-none" viewBox="0 0 200 120" aria-hidden>
                      <defs>
                        <linearGradient id={`${industry.id}-grad`} x1="0" x2="1">
                          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.12" />
                          <stop offset="100%" stopColor="var(--color-silver)" stopOpacity="0.03" />
                        </linearGradient>
                      </defs>
                      <path d="M0 60 C40 10, 160 10, 200 60 L200 120 L0 120 Z" fill={`url(#${industry.id}-grad)`} />
                    </svg>

                    <IndustrySVG id={industry.id} className="industries-svg absolute bottom-3 right-3 w-20 h-20 opacity-20 transition-opacity duration-400 pointer-events-none" />

                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                    <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 p-4 sm:p-5 w-full">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg glass-icon flex items-center justify-center flex-shrink-0 industries-icon">
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-silver transition-colors" />
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-5">
                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-silver-bright group-hover:text-white transition-colors duration-300 line-clamp-1">
                          {industry.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
            );
          })}
          </div>

          {/* 'View All Industries' button removed — all industries are shown in the grid above */}
        </div>
      </section>
    );
  }