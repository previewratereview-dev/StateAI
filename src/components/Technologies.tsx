"use client";

const technologies = [
  { name: "Python", category: "Language" },
  { name: "TensorFlow", category: "Framework" },
  { name: "PyTorch", category: "Framework" },
  { name: "OpenAI", category: "API" },
  { name: "AWS", category: "Cloud" },
  { name: "Google Cloud", category: "Cloud" },
  { name: "Azure", category: "Cloud" },
  { name: "Kubernetes", category: "DevOps" },
  { name: "Docker", category: "DevOps" },
  { name: "React", category: "Frontend" },
  { name: "Node.js", category: "Backend" },
  { name: "PostgreSQL", category: "Database" },
  { name: "MongoDB", category: "Database" },
  { name: "Spark", category: "Big Data" },
  { name: "Hugging Face", category: "NLP" },
  { name: "LangChain", category: "LLM" },
  { name: "Scikit-learn", category: "ML" },
  { name: "Keras", category: "Framework" },
];

export default function Technologies() {
  return (
    <section className="section-padding bg-background relative">
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
              <div className="text-xs font-bold text-silver-bright mb-0.5">{tech.name}</div>
              <div className="text-[10px] text-muted">{tech.category}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}