"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

const services = [
  {
    title: "AI-Powered Customer Support",
    description:
      "Intelligent voice & chat agents that engage, qualify, and support your customers 24/7 with human-like conversations and instant responses.",
    image: "/assets/service-customer-support.png",
    features: ["Voice AI", "Chat AI", "Lead Qualification", "Customer Support"],
    link: "#contact",
  },
  {
    title: "Medical Image Analysis",
    description:
      "Deep learning systems for early detection of diseases from medical scans — delivering radiologist-level accuracy with AI speed.",
    image: "/assets/service-medical-imaging.png",
    features: ["Image Recognition", "Object Detection", "Video Analytics"],
    link: "#contact",
  },
  {
    title: "Predictive Analytics Platform",
    description:
      "Real-time analytics platforms that predict customer behavior, market trends, and business outcomes with remarkable precision.",
    image: "/assets/service-predictive-analytics.png",
    features: ["Machine Learning", "Real-time Processing", "Data Visualization"],
    link: "#contact",
  },
  {
    title: "AI Content Generation Engine",
    description:
      "LLM-powered content platforms that generate marketing copy, blogs, social media posts, and creative assets at scale.",
    image: "/assets/service-ai-content.png",
    features: ["LLM Integration", "Content Generation", "AI Assistants"],
    link: "#contact",
  },
  {
    title: "Autonomous Quality Inspection",
    description:
      "Computer vision deployed on manufacturing lines to detect defects in real-time, reducing waste and ensuring consistent quality.",
    image: "/assets/service-quality-inspection.png",
    features: ["YOLO Detection", "Edge AI", "Real-time Monitoring"],
    link: "#contact",
  },
  {
    title: "Fraud Detection System",
    description:
      "ML-based fraud detection processing millions of transactions daily with near-perfect precision and zero false positives.",
    image: "/assets/service-fraud-detection.png",
    features: ["XGBoost", "Real-time Analysis", "Pattern Recognition"],
    link: "#contact",
  },
];

export default function Services() {
  return (
    <section id="services" className="section-padding bg-background relative">
      <div className="silver-divider absolute top-0 left-0 right-0" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-4 sm:mb-6">
            <span className="text-[11px] sm:text-sm text-silver font-medium">
              What We Offer
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 px-4">
            Our <span className="gradient-text">AI Services</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto px-4">
            End-to-end artificial intelligence solutions designed to transform
            your business operations and drive measurable results.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 px-4 sm:px-0">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group glass-card-hover silver-shine rounded-xl sm:rounded-2xl overflow-hidden cursor-default animate-reveal"
              style={{
                animationDelay: `${index * 80}ms`,
                opacity: 0,
                animationFillMode: "forwards",
              }}
            >
              <div className="relative h-40 sm:h-44 lg:h-52 overflow-hidden bg-white/[0.02]">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card-bg via-transparent to-transparent opacity-60" />
              </div>

              <div className="p-4 sm:p-5 lg:p-6">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-silver-bright mb-2 sm:mb-3 group-hover:text-white transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">
                  {service.description}
                </p>

                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-5">
                  {service.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-silver/80 bg-white/[0.03] rounded-full border border-white/[0.06]"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <a
                  href={service.link}
                  className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-silver hover:text-silver-bright transition-colors duration-200 group/link"
                >
                  Learn More
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}