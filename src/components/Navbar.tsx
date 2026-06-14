"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";

const navLinks = [
  {
    label: "Services",
    href: "#services",
    dropdown: [
      "AI & Machine Learning",
      "Natural Language Processing",
      "Computer Vision",
      "Generative AI",
      "AI Strategy & Consulting",
      "AI Integration",
    ],
  },
  { label: "About", href: "#about" },
  { label: "Process", href: "#process" },
  { label: "Industries", href: "#industries" },
  { label: "Team", href: "#team" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-nav shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <Image
                src="/assets/logo.png"
                alt="State AI Logo"
                fill
                className="object-contain group-hover:drop-shadow-[0_0_8px_rgba(0,212,255,0.5)] transition-all duration-300"
                style={{ filter: "invert(1) brightness(2)" }}
                sizes="40px"
              />
            </div>
            <span className="text-xl font-bold">
              <span className="text-foreground">State</span>
              <span className="text-primary"> AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() =>
                  link.dropdown && setActiveDropdown(link.label)
                }
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={link.href}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-400 hover:text-silver-bright transition-colors duration-200 rounded-lg hover:bg-white/[0.05]"
                >
                  {link.label}
                  {link.dropdown && (
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-200 ${
                        activeDropdown === link.label ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </a>

                {/* Dropdown */}
                {link.dropdown && activeDropdown === link.label && (
                  <div className="absolute top-full left-0 mt-1 w-64 glass-strong rounded-xl shadow-2xl py-2 animate-fade-in">
                    {link.dropdown.map((item) => (
                      <a
                        key={item}
                        href={link.href}
                        className="block px-4 py-2.5 text-sm text-gray-400 hover:text-silver-bright hover:bg-white/[0.05] transition-colors duration-200"
                        onClick={() => setActiveDropdown(null)}
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="#contact"
              className="px-6 py-2.5 bg-silver-bright/10 hover:bg-silver-bright/20 text-silver-bright font-semibold text-sm rounded-lg border border-silver-bright/10 hover:border-silver-bright/20 transition-all duration-300"
            >
              Book a Strategy Call
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-300 hover:text-primary transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="lg:hidden glass-strong border-t border-white/[0.08] animate-slide-up">
          <div className="px-4 py-6 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-4 py-3 text-gray-300 hover:text-silver-bright hover:bg-white/[0.03] rounded-lg transition-colors duration-200"
                onClick={() => setIsMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4">
              <a
                href="#contact"
                className="block text-center px-6 py-3 bg-silver-bright/10 hover:bg-silver-bright/20 text-silver-bright font-semibold rounded-lg border border-silver-bright/10 transition-all duration-300"
                onClick={() => setIsMobileOpen(false)}
              >
                Book a Strategy Call
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}