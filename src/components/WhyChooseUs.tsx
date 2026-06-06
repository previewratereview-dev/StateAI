"use client";

import Image from "next/image";
import { Shield, Zap, Users, Award, CheckCircle } from "lucide-react";

const stats = [
  { number: "500+", label: "Projects Delivered", icon: Award },
  { number: "98%", label: "Client Satisfaction", icon: Shield },
  { number: "200+", label: "AI Experts", icon: Users },
  { number: "50+", label: "Countries Served", icon: Zap },
];

const features = [
  {
    title: "Proven AI Expertise",
    description:
      "Our team of 200+ AI specialists brings deep expertise in machine learning, deep learning, NLP, and computer vision.",
  },
  {
    title: "End-to-End Solutions",
    description:
      "From ideation and strategy to development and deployment, we handle the entire AI lifecycle.",
  },
  {
    title: "Industry-Specific Models",
    description:
      "We build AI models tailored to your industry — healthcare, finance, retail, manufacturing, and more.",
  },
  {
    title: "Scalable Architecture",
    description:
      "Our solutions are built on cloud-native, scalable architectures that grow with your business needs.",
  },
  {
    title: "Data Security First",
    description:
      "Enterprise-grade security and compliance standards to protect your sensitive data and IP.",
  },
  {
    title: "Continuous Support",
    description:
      "Ongoing monitoring, optimization, and support to ensure your AI systems perform at their best.",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="about" className="section-padding glass-section-alt relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/bg2.jpeg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 glass-strong" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/90" />
      </div>
      <div className="silver-divider absolute top-0 left-0 right-0 z-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-4 sm:mb-6">
            <span className="text-[11px] sm:text-sm text-silver font-medium">Why State AI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
            Why <span className="gradient-text">Choose Us</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto">
            We combine deep technical expertise with business acumen to deliver AI solutions that create real impact.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-10 sm:mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl glass-card-hover silver-shine cursor-default animate-reveal"
                style={{ animationDelay: `${index * 100}ms`, opacity: 0, animationFillMode: "forwards" }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl glass-icon flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-silver" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold gradient-text-silver mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-[10px] sm:text-xs lg:text-sm text-muted">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {features.map((feature, index) => (
            <div key={feature.title}
              className="flex gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl glass-card hover:border-white/[0.12] transition-all duration-400 animate-reveal"
              style={{ animationDelay: `${200 + index * 80}ms`, opacity: 0, animationFillMode: "forwards" }}>
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-silver" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-silver-bright mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}