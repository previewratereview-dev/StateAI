"use client";

import Image from "next/image";
import { technologies } from "@/data/technologies";

function MarqueeLogo({ logo, name }: { logo: string; name: string }) {
  const isAzure = name === "Azure";
  return (
    <div className="relative w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0">
      <Image
        src={logo}
        alt={`${name} logo`}
        fill
        className={`brightness-0 invert opacity-70 ${
          isAzure ? "object-cover scale-125" : "object-contain"
        }`}
        sizes="28px"
      />
    </div>
  );
}

function MarqueeTrack({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div className="flex flex-shrink-0" aria-hidden={ariaHidden || undefined}>
      {technologies.map((tech) => (
        <div
          key={tech.name}
          className="flex items-center gap-2 sm:gap-2.5 px-5 sm:px-7 flex-shrink-0"
        >
          <MarqueeLogo logo={tech.logo} name={tech.name} />
          <span className="text-xs sm:text-sm font-medium text-silver-bright whitespace-nowrap">
            {tech.name}
          </span>
          <span className="w-px h-4 bg-white/[0.08] flex-shrink-0" aria-hidden />
        </div>
      ))}
    </div>
  );
}

export default function TechMarquee() {
  return (
    <div className="relative overflow-hidden py-2.5 sm:py-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max animate-marquee">
        <MarqueeTrack />
        <MarqueeTrack ariaHidden />
      </div>
    </div>
  );
}
