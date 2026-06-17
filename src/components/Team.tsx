"use client";

import Image from "next/image";

const founders = [
  {
    name: "Sartaj Ahmad",
    role: "Founder & CEO",
    image: "/assets/Sartaj-ahmad.jpeg",
    linkedin: "https://www.linkedin.com/in/sartajahmed/",
  },
  {
    name: "Rayees Amin",
    role: "Co-Founder & CTO",
    image: "/assets/Rayees-amin.png",
    linkedin: "https://www.linkedin.com/in/rayees-ahmad-rather-a6914b281",
  },
];

const teamMembers = [
  {
    name: "Hikaru Saito",
    role: "Senior Software Engineer",
    image: "/assets/Hikaru-Saito.jpeg",
  },
  {
    name: "Ghulam Mustafa",
    role: "AI Automation Engineer",
    image: "/assets/Ghulam-Mustafa.jpeg",
  },
  {
    name: "Shamil",
    role: "Full Stack Developer",
    image: "/assets/Shamil.jpeg",
  },
];

export default function Team() {
  return (
    <section id="team" className="section-padding relative glass-section overflow-hidden">
      <div className="silver-divider absolute top-0 left-0 right-0" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-4 sm:mb-6 animate-silver-glow-box">
            <span className="text-[11px] sm:text-sm text-silver font-medium animate-silver-glow-text">
              Our People
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
            Meet the <span className="gradient-text">Team</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto px-4">
            The talented individuals behind State AI — passionate about building
            the future of intelligent technology.
          </p>
        </div>

        {/* Founders */}
        <div className="mb-8 sm:mb-10">
          <h3 className="text-[10px] sm:text-xs font-bold text-silver-dim uppercase tracking-[0.2em] text-center mb-4 sm:mb-6">
            Founders
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto px-4 sm:px-0">
            {founders.map((person) => (
              <div
                key={person.name}
                className="group relative glass-card rounded-xl sm:rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all duration-400 aspect-[3/4] sm:aspect-auto h-auto sm:h-80 max-w-[280px] sm:max-w-none mx-auto w-full"
              >
                <Image
                  src={person.image}
                  alt={person.name}
                  fill
                  className="object-cover object-[center_20%] sm:object-top origin-center sm:origin-top sm:group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 280px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 sm:px-3 sm:py-2 text-center backdrop-blur-md bg-white/[0.03]">
                  <h4 className="text-sm sm:text-base font-bold text-silver-bright leading-tight">
                    {person.name}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-silver/70 mb-1">{person.role}</p>
                  <a
                    href={person.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-gray-300 hover:text-silver transition-colors duration-200 group/link bg-white/[0.08] hover:bg-white/[0.12] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-white/[0.1] hover:border-white/[0.15]"
                  >
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    <span>Connect</span>
                    <svg className="w-2.5 h-2.5 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members */}
        <div>
          <h3 className="text-[10px] sm:text-xs font-bold text-silver-dim uppercase tracking-[0.2em] text-center mb-4 sm:mb-6">
            Team Members
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto px-4 sm:px-0">
            {teamMembers.map((person) => (
              <div
                key={person.name}
                className="group relative glass-card rounded-xl sm:rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all duration-400 aspect-[3/4] sm:aspect-auto h-auto sm:h-60 max-w-[280px] sm:max-w-none mx-auto w-full"
              >
                <Image
                  src={person.image}
                  alt={person.name}
                  fill
                  className="object-cover object-[center_20%] sm:object-top origin-center sm:origin-top sm:group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 280px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 sm:px-3 sm:py-2 text-center backdrop-blur-md bg-white/[0.03]">
                  <h4 className="text-xs sm:text-sm font-bold text-silver-bright leading-tight">
                    {person.name}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-silver/70">{person.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}