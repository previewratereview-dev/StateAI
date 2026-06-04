"use client";

import Image from "next/image";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

const serviceLinks = [
  "AI & Machine Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Generative AI Solutions",
  "AI Strategy & Consulting",
  "AI Integration & Deployment",
];

const companyLinks = [
  { label: "About Us", href: "#about" },
  { label: "Our Process", href: "#process" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Careers", href: "#" },
  { label: "Blog", href: "#" },
];

const socialLinks = [
  {
    href: "#",
    label: "LinkedIn",
    svg: (
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    href: "#",
    label: "X",
    svg: (
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: "#",
    label: "GitHub",
    svg: (
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    href: "#",
    label: "YouTube",
    svg: (
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06]">
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/footer-bg.jpeg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-background/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/50 to-background/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-10 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                <Image
                  src="/assets/logo.png"
                  alt="State AI Logo"
                  fill
                  className="object-contain"
                  style={{ filter: "invert(1) brightness(2)" }}
                  sizes="40px"
                />
              </div>
              <span className="text-lg sm:text-xl font-bold">
                <span className="text-foreground">State</span>
                <span className="text-silver"> AI</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4 sm:mb-6">
              Leading AI development company delivering cutting-edge artificial
              intelligence solutions for businesses worldwide.
            </p>
            <div className="space-y-2 sm:space-y-3">
              <a href="mailto:contact@stateai.com" className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400 hover:text-silver transition-colors duration-200">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                contact@stateai.com
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400 hover:text-silver transition-colors duration-200">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                +1 (234) 567-890
              </a>
              <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                <span>123 Innovation Drive, Suite 500<br />San Francisco, CA 94105</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-[11px] sm:text-sm font-bold text-foreground uppercase tracking-wider mb-4 sm:mb-6">
              Services
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {serviceLinks.map((link) => (
                <li key={link}>
                  <a href="#services" className="text-xs sm:text-sm text-gray-400 hover:text-silver transition-colors duration-200">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-[11px] sm:text-sm font-bold text-foreground uppercase tracking-wider mb-4 sm:mb-6">
              Company
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-xs sm:text-sm text-gray-400 hover:text-silver transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-[11px] sm:text-sm font-bold text-foreground uppercase tracking-wider mb-4 sm:mb-6">
              Stay Updated
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
              Subscribe for the latest AI insights.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs sm:text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-silver/30 transition-colors duration-200"
              />
              <button
                type="submit"
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-silver-bright/10 hover:bg-silver-bright/20 text-silver rounded-lg border border-silver-bright/10 transition-colors duration-200 flex-shrink-0"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </form>

            <div className="flex gap-2 sm:gap-3 mt-5 sm:mt-8">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg glass-card border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-silver hover:border-white/[0.12] transition-all duration-300"
                  aria-label={social.label}
                >
                  {social.svg}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-4 sm:py-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-muted text-center sm:text-left">
            © {new Date().getFullYear()} State AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <a href="#" className="text-xs sm:text-sm text-muted hover:text-silver transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-xs sm:text-sm text-muted hover:text-silver transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="text-xs sm:text-sm text-muted hover:text-silver transition-colors duration-200">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}