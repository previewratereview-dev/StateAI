"use client";

import { Search, Target, Code2, Rocket } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Discovery & Analysis",
    description:
      "We dive deep into your business challenge, analyze your data landscape, and identify the best AI approach.",
    details: ["Requirement Analysis", "Data Audit", "Feasibility Study"],
  },
  {
    icon: Target,
    step: "02",
    title: "Strategy & Design",
    description:
      "Our team designs a comprehensive AI strategy with clear milestones, architecture blueprints, and a roadmap.",
    details: ["AI Roadmap", "Architecture Design", "Sprint Planning"],
  },
  {
    icon: Code2,
    step: "03",
    title: "Development & Testing",
    description:
      "We build, train, and rigorously test your AI models using agile methodologies and continuous integration.",
    details: ["Model Development", "Training & Validation", "QA Testing"],
  },
  {
    icon: Rocket,
    step: "04",
    title: "Deployment & Support",
    description:
      "We deploy your AI solution to production, monitor performance, and provide ongoing optimization.",
    details: ["Cloud Deployment", "Performance Monitoring", "24/7 Support"],
  },
];

export default function Process() {
  return (
    <section id="process" className="section-padding glass-section-alt relative overflow-hidden">
      <div className="silver-divider absolute top-0 left-0 right-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-4 sm:mb-6">
            <span className="text-[11px] sm:text-sm text-silver font-medium">How We Work</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
            Our <span className="gradient-text">Process</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto">
            A proven methodology that ensures successful AI implementation, from concept to production.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative group animate-reveal glass-card-hover rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 h-full"
                  style={{ animationDelay: `${index * 120}ms`, opacity: 0, animationFillMode: "forwards" }}>
                  <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl glass-icon group-hover:border-silver/30 flex items-center justify-center mb-4 sm:mb-6 transition-all duration-400 group-hover:shadow-[0_0_20px_rgba(177,178,180,0.08)]">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-silver" />
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-silver-dim mb-1.5 sm:mb-2 tracking-[0.2em] uppercase">
                    Step {step.step}
                  </div>
                  <h3 className="text-sm sm:text-base lg:text-lg font-bold text-silver-bright mb-2 sm:mb-3 group-hover:text-white transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-3 sm:mb-4">
                    {step.description}
                  </p>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted">
                        <div className="w-1 h-1 rounded-full bg-silver/40 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}