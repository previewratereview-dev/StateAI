"use client";

import Image from "next/image";

interface TechItem {
  name: string;
  category: string;
  logo: string;
}

const technologies: TechItem[] = [
  { name: "Python", category: "Language", logo: "/assets/tech-logos/python.svg" },
  { name: "TensorFlow", category: "Framework", logo: "/assets/tech-logos/tensorflow.svg" },
  { name: "PyTorch", category: "Framework", logo: "/assets/tech-logos/pytorch.svg" },
  { name: "OpenAI", category: "API", logo: "/assets/tech-logos/openai.png" },
  { name: "AWS", category: "Cloud", logo: "/assets/tech-logos/aws.svg" },
  { name: "Google Cloud", category: "Cloud", logo: "/assets/tech-logos/google-cloud.svg" },
  { name: "Azure", category: "Cloud", logo: "/assets/tech-logos/azure.png" },
  { name: "Kubernetes", category: "DevOps", logo: "/assets/tech-logos/kubernetes.svg" },
  { name: "Docker", category: "DevOps", logo: "/assets/tech-logos/docker.svg" },
  { name: "React", category: "Frontend", logo: "/assets/tech-logos/react.svg" },
  { name: "Node.js", category: "Backend", logo: "/assets/tech-logos/nodejs.svg" },
  { name: "PostgreSQL", category: "Database", logo: "/assets/tech-logos/postgresql.svg" },
  { name: "MongoDB", category: "Database", logo: "/assets/tech-logos/mongodb.svg" },
  { name: "Spark", category: "Big Data", logo: "/assets/tech-logos/spark.svg" },
  { name: "Hugging Face", category: "NLP", logo: "/assets/tech-logos/huggingface.svg" },
  { name: "LangChain", category: "LLM", logo: "/assets/tech-logos/langchain.svg" },
  { name: "Scikit-learn", category: "ML", logo: "/assets/tech-logos/scikit-learn.svg" },
  { name: "Keras", category: "Framework", logo: "/assets/tech-logos/keras.svg" },
];

function TechLogo({ logo, name }: { logo: string; name: string }) {
  if (!logo) return null;
  const isAzure = name === "Azure";
  return (
    <div className="relative w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3">
      <Image
        src={logo}
        alt={`${name} logo`}
        fill
        className={`brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity duration-300 ${
          isAzure ? "object-cover scale-125" : "object-contain"
        }`}
        sizes="40px"
      />
    </div>
  );
}

export default function Technologies() {
  return (
    <section className="section-padding glass-section relative overflow-hidden">
      <div className="silver-divider absolute top-0 left-0 right-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-4 sm:mb-6">
            <span className="text-[11px] sm:text-sm text-silver font-medium">Tech Stack</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
            Technologies <span className="gradient-text">We Work With</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto">
            We leverage the latest and most powerful technologies to build robust, scalable AI solutions.
          </p>
        </div>

        <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {technologies.map((tech, index) => (
            <div key={tech.name} className="group p-3 sm:p-4 lg:p-5 rounded-xl glass-card-hover silver-shine text-center cursor-default animate-reveal"
              style={{ animationDelay: `${index * 50}ms`, opacity: 0, animationFillMode: "forwards" }}>
              <TechLogo logo={tech.logo} name={tech.name} />
              <div className="text-xs sm:text-sm lg:text-base font-bold text-silver-bright group-hover:text-white transition-colors duration-300 mb-0.5 sm:mb-1">
                {tech.name}
              </div>
              <div className="text-[10px] sm:text-xs text-muted">{tech.category}</div>
            </div>
          ))}
        </div>

        <div className="md:hidden grid grid-cols-3 gap-2">
          {technologies.slice(0, 12).map((tech, index) => (
            <div key={tech.name} className="p-3 rounded-xl glass-card text-center animate-reveal"
              style={{ animationDelay: `${index * 50}ms`, opacity: 0, animationFillMode: "forwards" }}>
              <TechLogo logo={tech.logo} name={tech.name} />
              <div className="text-xs font-bold text-silver-bright mb-0.5">{tech.name}</div>
              <div className="text-[10px] text-muted">{tech.category}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}