"use client";

import Image from "next/image";

const founders = [
  {
    name: "Sartaj Ahmad",
    role: "Founder & CEO",
    image: "/assets/Sartaj-ahmad.png",
    description:
      "Visionary leader driving State AI's mission to make artificial intelligence accessible and impactful for businesses worldwide.",
  },
  {
    name: "Rayees Amin",
    role: "Co-Founder & CTO",
    image: "/assets/Rayees-amin.png",
    description:
      "Technical architect behind State AI's cutting-edge AI solutions, specializing in machine learning and system design.",
  },
];

const teamMembers = [
  {
    name: "Hikaru Saito",
    role: "AI/ML Engineer",
    image: "/assets/Hikaru-Saito.jpeg",
  },
  {
    name: "Shamil",
    role: "Full Stack Developer",
    image: "/assets/Shamil.jpeg",
  },
];

export default function Team() {
  return (
    <section id="team" className="section-padding bg-background relative">
      <div className="silver-divider absolute top-0 left-0 right-0" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-4 sm:mb-6">
            <span className="text-[11px] sm:text-sm text-silver font-medium">
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
        <div className="mb-12 sm:mb-16">
          <h3 className="text-[10px] sm:text-sm font-bold text-silver-dim uppercase tracking-[0.2em] text-center mb-6 sm:mb-10">
            Founders
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 max-w-3xl mx-auto px-4 sm:px-0">
            {founders.map((person) => (
              <div
                key={person.name}
                className="group glass-card rounded-xl sm:rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all duration-400"
              >
                <div className="relative h-56 sm:h-72 lg:h-80 overflow-hidden bg-white/[0.02]">
                  <Image
                    src={person.image}
                    alt={person.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                </div>
                <div className="p-4 sm:p-6">
                  <h4 className="text-base sm:text-lg lg:text-xl font-bold text-silver-bright mb-1">
                    {person.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-silver mb-2 sm:mb-3">{person.role}</p>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    {person.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members */}
        <div>
          <h3 className="text-[10px] sm:text-sm font-bold text-silver-dim uppercase tracking-[0.2em] text-center mb-6 sm:mb-10">
            Team Members
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto px-4 sm:px-0">
            {teamMembers.map((person) => (
              <div
                key={person.name}
                className="group glass-card rounded-xl overflow-hidden hover:border-white/[0.12] transition-all duration-400"
              >
                <div className="relative h-36 sm:h-40 lg:h-48 overflow-hidden bg-white/[0.02]">
                  <Image
                    src={person.image}
                    alt={person.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>
                <div className="p-3 sm:p-4 text-center">
                  <h4 className="text-xs sm:text-sm lg:text-base font-bold text-silver-bright mb-0.5 sm:mb-1">
                    {person.name}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-muted">{person.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}