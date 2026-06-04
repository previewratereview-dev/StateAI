"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Aafaq Sir",
    role: "CEO, JKCS",
    content:
      "State AI implemented a smart record management system that transformed how we handle data. Their attention to detail and understanding of our business needs was exceptional.",
    rating: 5,
    avatar: "AS",
  },
  {
    name: "Romi Rajput",
    role: "GM, AEW",
    content:
      "They built custom Android apps for our service requests — a technician app, customer app, and admin app. The seamless integration between all three platforms has streamlined our entire service workflow.",
    rating: 5,
    avatar: "RR",
  },
  {
    name: "Dr. Omer Farooq",
    role: "GM, Nazira Memorial Hospital",
    content:
      "State AI developed an AI workflow for our patient record management that has revolutionized how we handle medical data. It has reduced our administrative burden by over 60%.",
    rating: 5,
    avatar: "OF",
  },
  {
    name: "Subreena Akhter",
    role: "CEO, Gulposh Tiffin Service",
    content:
      "They understood our unique business model and delivered solutions that perfectly fit our tiffin service operations. Highly recommended!",
    rating: 5,
    avatar: "SA",
  },
  {
    name: "Aqib Bashir",
    role: "GM, Rather Plaza",
    content:
      "State AI built a custom tenant management Android app that has simplified our entire property management process. Everything is now handled through a single, elegant platform.",
    rating: 5,
    avatar: "AB",
  },
  {
    name: "Irfan Amin",
    role: "GM, Alfalak Transport LLC",
    content:
      "They delivered a superfast website with advanced GPB management and custom ad generation capabilities. The perfect partner for our digital transformation.",
    rating: 5,
    avatar: "IA",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goTo = (index: number) => {
    setCurrent(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 12000);
  };

  const prev = () =>
    goTo((current - 1 + testimonials.length) % testimonials.length);
  const next = () => goTo((current + 1) % testimonials.length);

  return (
    <section id="testimonials" className="section-padding bg-surface relative">
      <div className="silver-divider absolute top-0 left-0 right-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-4 sm:mb-6">
            <span className="text-[11px] sm:text-sm text-silver font-medium">
              Client Stories
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
            What Our <span className="gradient-text">Clients Say</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto">
            Trusted by businesses across industries to deliver AI-powered
            solutions that drive real results.
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="hidden sm:block absolute -top-8 left-0 opacity-10">
            <Quote className="w-16 sm:w-20 h-16 sm:h-20 text-silver" />
          </div>

          <div className="relative glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 min-h-[280px] sm:min-h-[300px] flex flex-col justify-center">
            <div key={current} className="animate-fade-in">
              <div className="flex gap-1 mb-4 sm:mb-6">
                {Array.from({ length: testimonials[current].rating }).map(
                  (_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-silver fill-silver/30"
                    />
                  )
                )}
              </div>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed mb-6 sm:mb-8 italic">
                &ldquo;{testimonials[current].content}&rdquo;
              </p>

              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-silver font-bold text-xs sm:text-sm">
                  {testimonials[current].avatar}
                </div>
                <div>
                  <div className="text-sm sm:text-base font-semibold text-silver-bright">
                    {testimonials[current].name}
                  </div>
                  <div className="text-xs sm:text-sm text-muted">
                    {testimonials[current].role}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              onClick={prev}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full glass-card border border-white/[0.08] hover:border-silver/30 flex items-center justify-center text-gray-400 hover:text-silver transition-all duration-300"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex gap-1.5 sm:gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    index === current
                      ? "w-6 sm:w-8 bg-silver"
                      : "w-1.5 sm:w-2 bg-white/10 hover:bg-white/20"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full glass-card border border-white/[0.08] hover:border-silver/30 flex items-center justify-center text-gray-400 hover:text-silver transition-all duration-300"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Client Logos */}
        <div className="mt-12 sm:mt-16 md:mt-20 pt-8 sm:pt-12 border-t border-white/[0.06]">
          <p className="text-center text-xs sm:text-sm text-muted mb-6 sm:mb-8">
            Trusted by innovative companies worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 px-4">
            {["JKCS", "AEW", "Nazira Memorial", "Gulposh Tiffin", "Rather Plaza", "Alfalak Transport"].map(
              (company) => (
                <div
                  key={company}
                  className="text-xs sm:text-sm md:text-base font-semibold text-white/[0.08] hover:text-white/[0.15] transition-colors duration-300 cursor-default text-center"
                >
                  {company}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}