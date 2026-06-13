"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, X } from "lucide-react";
import BookingForm from "./BookingForm";

export default function CTASection() {
  const [showBooking, setShowBooking] = useState(false);

  return (
    <section id="contact" className="section-padding glass-section relative overflow-hidden">
      <div className="silver-divider absolute top-0 left-0 right-0" />
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.015] rounded-full blur-[120px]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/[0.01] rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center p-8 sm:p-12 md:p-16 rounded-2xl sm:rounded-3xl glass-card relative">
          
          {showBooking ? (
            <div className="max-w-xl mx-auto animate-fade-in text-left">
              <button
                onClick={() => setShowBooking(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full glass-card hover:bg-white/[0.05] text-gray-400 hover:text-silver-bright transition-colors cursor-pointer"
                aria-label="Back to contact info"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <BookingForm />
            </div>
          ) : (
            <>
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl glass-icon flex items-center justify-center mx-auto mb-6 sm:mb-8">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-silver" />
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
                Ready to Transform Your Business
                <br />
                <span className="gradient-text">with AI?</span>
              </h2>

              <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10">
                Let&apos;s discuss how our AI solutions can help you innovate, optimize,
                and grow. Our team is ready to bring your vision to life.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={() => setShowBooking(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-silver-bright/10 hover:bg-silver-bright/20 text-silver-bright font-semibold text-sm sm:text-base rounded-lg border border-silver-bright/15 hover:border-silver-bright/30 transition-all duration-300 group cursor-pointer whitespace-nowrap"
                >
                  Book a Strategy Call
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="https://wa.me/917006993325"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 glass-card hover:bg-white/[0.05] text-foreground font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 border border-white/[0.08] hover:border-white/[0.15] whitespace-nowrap"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </>
          )}

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/[0.06]">
            {["Free Consultation", "NDA Protected", "24/7 Support", "Agile Development"].map((point) => (
              <div key={point} className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm text-muted">
                <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-silver/50" />
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}