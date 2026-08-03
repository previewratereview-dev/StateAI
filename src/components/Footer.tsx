"use client";

import Image from "next/image";
import { Mail, ArrowRight } from "lucide-react";

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
  { label: "Careers", href: "/careers" },
  { label: "Blog", href: "#" },
];

const socialLinks = [
  {
    href: "https://www.linkedin.com/company/stateintelligencetechnologies/",
    label: "LinkedIn",
    svg: (
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    href: "https://x.com/_stateai",
    label: "X",
    svg: (
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: "https://www.instagram.com/state_intelligencetechnologies?igsh=MTlpM3preThwa3JxMQ==",
    label: "Instagram",
    svg: (
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    href: "https://www.youtube.com/channel/UCtkBvvvjhMa74mhhAPE0bag",
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
        <div className="absolute inset-0 glass-strong" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/90" />
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
              Emerging AI Development Company delivering cutting-edge artificial
              intelligence solutions for businesses worldwide.
            </p>
            <div className="space-y-2 sm:space-y-3">
              <a href="mailto:info@stateai.in" className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400 hover:text-silver transition-colors duration-200">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                info@stateai.in
              </a>
              <a
                href="https://wa.me/917006993325"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-400 glass-chip rounded-lg border border-white/[0.08] hover:text-silver hover:border-white/[0.15] transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
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
                className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 glass-input rounded-lg text-xs sm:text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-silver/30 transition-colors duration-200"
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
            <a href="/privacy-policy" className="text-xs sm:text-sm text-muted hover:text-silver transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="/terms" className="text-xs sm:text-sm text-muted hover:text-silver transition-colors duration-200">
              Terms of Service
            </a>
            <a href="/cookie-policy" className="text-xs sm:text-sm text-muted hover:text-silver transition-colors duration-200">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}