"use client";

import Image from "next/image";

type Founder = {
  name: string;
  role: string;
  image: string;
  linkedin: string;
  initials: string;
  message: string;
  time: string;
};

const founders: Founder[] = [
  {
    name: "Sartaj Ahmad",
    role: "Founder & CEO",
    image: "/assets/Sartaj-ahmad.jpeg",
    linkedin: "https://www.linkedin.com/in/sartajahmed/",
    initials: "SA",
    message:
      "At State AI, we don't just build AI tools — we engineer intelligent systems that stay ahead of our clients. Every product we ship is designed to create a real, lasting competitive edge.",
    time: "10:42 AM",
  },
  {
    name: "Rayees Amin",
    role: "Co-Founder & CTO",
    image: "/assets/Rayees-amin.png",
    linkedin: "https://www.linkedin.com/in/rayees-ahmad-rather-a6914b281",
    initials: "RA",
    message:
      "I love solving the hard problems. On the engineering side we obsess over architecture and reliable pipelines, so the AI we ship feels effortless for the teams and customers who depend on it.",
    time: "11:26 AM",
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

function FounderPhoto({ person }: { person: Founder }) {
  return (
    <div className="group relative glass-card rounded-xl sm:rounded-2xl overflow-hidden border-white/[0.1] hover:border-white/[0.12] transition-all duration-400 aspect-[4/5] max-w-xs sm:max-w-sm md:max-w-none mx-auto w-full">
      <Image
        src={person.image}
        alt={person.name}
        fill
        className="object-cover object-[center_25%] origin-center md:group-hover:scale-105 transition-transform duration-500"
        sizes="(max-width: 767px) 40vw, (max-width: 1024px) 42vw, 420px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 text-center backdrop-blur-md bg-white/[0.03]">
        <h4 className="text-sm sm:text-lg font-bold text-silver-bright leading-tight">
          {person.name}
        </h4>
        <p className="text-[11px] sm:text-xs text-silver/70">{person.role}</p>
      </div>
    </div>
  );
}

function FounderChat({ person }: { person: Founder }) {
  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border-white/[0.1] hover:border-white/[0.15] transition-all duration-400 max-w-[560px] md:max-w-none mx-auto">
      {/* Chat header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-xs font-bold text-silver-bright">
            {person.initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#0b0b11]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-silver-bright truncate">{person.name}</p>
          <p className="text-[11px] text-gray-400 truncate">{person.role}</p>
        </div>
        <a
          href={person.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-300 hover:text-silver transition-colors duration-200 bg-white/[0.08] hover:bg-white/[0.12] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-white/[0.1] hover:border-white/[0.15]"
        >
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <span>Connect</span>
        </a>
      </div>

      {/* Conversation */}
      <div className="space-y-3">
        <div className="flex justify-center">
          <span className="rounded-md bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 text-[10px] text-gray-500">
            Today
          </span>
        </div>

        {/* Message bubble */}
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-tr-md glass-card bg-white/[0.06] border border-white/[0.08] px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
            <div className="flex gap-3 items-start">
              <Image
                src={person.image}
                alt={person.name}
                width={28}
                height={28}
                className="h-7 w-7 rounded-full ring-1 ring-white/10 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-silver-bright mb-0.5">{person.name}</p>
                <p className="text-xs sm:text-sm text-silver leading-relaxed">
                  {person.message}
                </p>
                <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-silver/40">
                  <span>{person.time}</span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.7 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Typing indicator */}
        <div className="flex items-center gap-2 max-w-[150px] rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/60 animate-pulse" />
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/60 animate-pulse [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/60 animate-pulse [animation-delay:300ms]" />
          <span className="ml-1 text-[10px] text-gray-500">State AI is replying</span>
        </div>
      </div>
    </div>
  );
}

function FounderRow({ person, flipped }: { person: Founder; flipped?: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-5 lg:gap-8">
      {/* Photo */}
      <div
        className={`md:col-span-5 ${
          flipped ? "md:order-2 md:col-start-8" : "md:order-1 md:col-start-1"
        }`}
      >
        <FounderPhoto person={person} />
      </div>
      {/* Message */}
      <div
        className={`md:col-span-7 ${
          flipped ? "md:order-1 md:col-start-1" : "md:order-2 md:col-start-6"
        }`}
      >
        <FounderChat person={person} />
      </div>
    </div>
  );
}

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
        <div className="mb-10 sm:mb-16">
          <h3 className="text-[10px] sm:text-xs font-bold text-silver-dim uppercase tracking-[0.2em] text-center mb-6 sm:mb-10">
            Founders
          </h3>
          <div className="space-y-10 sm:space-y-12 lg:space-y-16 max-w-5xl mx-auto px-4 sm:px-0">
            {founders.map((person, index) => (
              <FounderRow key={person.name} person={person} flipped={index % 2 === 1} />
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