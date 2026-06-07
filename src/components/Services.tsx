"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Code2, Smartphone, Globe, Cpu } from "lucide-react";

type CategoryKey = "software" | "mobile" | "web" | "ai";

interface ServiceItem {
  title: string;
  description: string;
  image: string;
  features: string[];
  link: string;
}

interface Category {
  id: CategoryKey;
  label: string;
  icon: React.ReactNode;
  services: ServiceItem[];
}

const categories: Category[] = [
  {
    id: "software",
    label: "Software Development",
    icon: <Code2 className="w-4 h-4" />,
    services: [
      {
        title: "Custom Software Development",
        description:
          "Tailor-made enterprise software solutions built with modern architectures to solve your unique business challenges and scale with your growth.",
        image: "/assets/service-custom-software.png",
        features: ["Microservices", "REST/GraphQL APIs", "Cloud Native"],
        link: "#contact",
      },
      {
        title: "Cloud-Native Solutions",
        description:
          "Design, deploy, and manage cloud-native applications on AWS, Azure, and GCP with containerization, orchestration, and auto-scaling.",
        image: "/assets/service-cloud-native.png",
        features: ["AWS/Azure/GCP", "Docker & Kubernetes", "Serverless"],
        link: "#contact",
      },
      {
        title: "DevOps & Infrastructure",
        description:
          "Streamline your development lifecycle with CI/CD pipelines, infrastructure as code, monitoring, and automated testing frameworks.",
        image: "/assets/service-devops.png",
        features: ["CI/CD Pipelines", "Infrastructure as Code", "Monitoring"],
        link: "#contact",
      },
      {
        title: "Enterprise API Integration",
        description:
          "Seamlessly connect your business systems with robust API gateways, middleware solutions, and third-party integrations.",
        image: "/assets/service-api-integration.png",
        features: ["API Gateways", "Middleware", "Third-party Integration"],
        link: "#contact",
      },
    ],
  },
  {
    id: "mobile",
    label: "Mobile App Development",
    icon: <Smartphone className="w-4 h-4" />,
    services: [
      {
        title: "iOS App Development",
        description:
          "Native iOS applications built with Swift and SwiftUI that deliver exceptional user experiences and leverage the full power of Apple's ecosystem.",
        image: "/assets/service-ios-dev.png",
        features: ["Swift & SwiftUI", "App Store Deployment", "Apple Ecosystem"],
        link: "#contact",
      },
      {
        title: "Android App Development",
        description:
          "High-performance Android apps built with Kotlin and Jetpack Compose, optimized for the diverse Android device landscape.",
        image: "/assets/service-android-dev.png",
        features: ["Kotlin & Jetpack", "Material Design", "Play Store"],
        link: "#contact",
      },
      {
        title: "Cross-Platform Solutions",
        description:
          "Build once, deploy everywhere with React Native and Flutter — delivering native performance with shared codebases across iOS and Android.",
        image: "/assets/service-cross-platform.png",
        features: ["React Native", "Flutter", "Code Sharing"],
        link: "#contact",
      },
      {
        title: "Mobile UI/UX Design",
        description:
          "User-centered mobile interfaces designed with precision — from wireframes to polished prototypes that drive engagement and retention.",
        image: "/assets/service-mobile-uiux.png",
        features: ["Wireframing", "Prototyping", "User Testing"],
        link: "#contact",
      },
    ],
  },
  {
    id: "web",
    label: "Web Apps Development",
    icon: <Globe className="w-4 h-4" />,
    services: [
      {
        title: "Modern Web Applications",
        description:
          "Blazing-fast single-page and server-side rendered applications using Next.js, React, and TypeScript with optimal performance and SEO.",
        image: "/assets/service-modern-web.png",
        features: ["Next.js & React", "TypeScript", "SSR & SSG"],
        link: "#contact",
      },
      {
        title: "E-Commerce Platforms",
        description:
          "End-to-end e-commerce solutions with custom storefronts, payment gateways, inventory management, and personalized shopping experiences.",
        image: "/assets/service-ecommerce.png",
        features: ["Payment Integration", "Inventory Management", "Analytics"],
        link: "#contact",
      },
      {
        title: "Progressive Web Apps",
        description:
          "Transform your web presence into installable, offline-capable PWAs that deliver app-like experiences with web technologies.",
        image: "/assets/service-pwa.png",
        features: ["Offline Support", "Push Notifications", "App-like UX"],
        link: "#contact",
      },
      {
        title: "Headless CMS Solutions",
        description:
          "Flexible content management with decoupled architectures, enabling seamless omnichannel content delivery at scale.",
        image: "/assets/service-headless-cms.png",
        features: ["Content APIs", "Omnichannel Delivery", "No-code Editor"],
        link: "#contact",
      },
    ],
  },
  {
    id: "ai",
    label: "AI Automation & Development",
    icon: <Cpu className="w-4 h-4" />,
    services: [
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
    ],
  },
];

export default function Services() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("software");

  const activeServices = categories.find((c) => c.id === activeCategory)?.services ?? [];

  return (
    <section id="services" className="section-padding glass-section relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/bg1.jpeg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 glass-strong" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/90" />
      </div>
      <div className="silver-divider absolute top-0 left-0 right-0 z-10" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-4 sm:mb-6">
            <span className="text-[11px] sm:text-sm text-silver font-medium">
              What We Offer
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 px-4">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto px-4">
            End-to-end technology solutions designed to transform
            your business operations and drive measurable results.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-4 mb-8 sm:mb-10">
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-white/[0.08] text-silver-bright border border-white/[0.15] shadow-lg shadow-white/[0.03]"
                    : "text-gray-400 bg-blue-500/10 border border-blue-400/20 shadow-lg shadow-blue-500/10 hover:bg-blue-500/20 hover:text-silver hover:border-blue-400/30"
                }`}
              >
                <span className={isActive ? "text-silver-bright" : "text-gray-500"}>
                  {category.icon}
                </span>
                {category.label}
                <span className="text-[10px] opacity-60">({category.services.length})</span>
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 px-4 sm:px-0">
          {activeServices.map((service, index) => (
            <div
              key={service.title}
              className="group relative glass-card rounded-xl sm:rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all duration-400 animate-reveal"
              style={{
                animationDelay: `${index * 80}ms`,
                opacity: 0,
                animationFillMode: "forwards",
              }}
            >
              <div className="relative aspect-square overflow-hidden bg-white/[0.02] p-2 z-0">
                <div className="relative w-full h-full z-0 rounded-[5%] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500 z-0"
                    sizes="(max-width: 640px) 100vw, 280px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-0" />
                </div>
              </div>

              <div className="p-4 sm:p-5 lg:p-6 relative z-10 bg-transparent">
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
                      className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-silver/80 glass-chip rounded-full"
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