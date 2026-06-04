"use client";

import { useState } from "react";
import { ExternalLink, ArrowRight } from "lucide-react";

const categories = ["All", "AI/ML", "NLP", "Computer Vision", "Generative AI"];

const projects = [
  {
    title: "AI-Powered Customer Support",
    category: "NLP",
    description: "Built an intelligent chatbot handling 10K+ daily queries with 95% accuracy.",
    tags: ["NLP", "GPT-4", "Python"],
    gradient: "from-white/[0.03] to-white/[0.01]",
  },
  {
    title: "Medical Image Analysis",
    category: "Computer Vision",
    description: "Deep learning system for early disease detection from medical scans with 97% accuracy.",
    tags: ["Computer Vision", "PyTorch", "DICOM"],
    gradient: "from-white/[0.04] to-white/[0.01]",
  },
  {
    title: "Predictive Analytics Platform",
    category: "AI/ML",
    description: "Real-time platform predicting customer behavior with 89% accuracy.",
    tags: ["Machine Learning", "TensorFlow", "BigQuery"],
    gradient: "from-white/[0.03] to-white/[0.02]",
  },
  {
    title: "AI Content Generation Engine",
    category: "Generative AI",
    description: "LLM-powered platform generating marketing copy, blogs, and social posts.",
    tags: ["LLM", "RAG", "LangChain"],
    gradient: "from-white/[0.04] to-white/[0.01]",
  },
  {
    title: "Autonomous Quality Inspection",
    category: "Computer Vision",
    description: "Computer vision on manufacturing lines for real-time defect detection.",
    tags: ["YOLO", "Edge AI", "OpenCV"],
    gradient: "from-white/[0.03] to-white/[0.02]",
  },
  {
    title: "Fraud Detection System",
    category: "AI/ML",
    description: "ML-based fraud detection processing 1M+ transactions daily.",
    tags: ["XGBoost", "Real-time", "Spark"],
    gradient: "from-white/[0.04] to-white/[0.01]",
  },
];

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="portfolio" className="section-padding glass-section relative overflow-hidden">
      <div className="silver-divider absolute top-0 left-0 right-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card mb-4 sm:mb-6">
            <span className="text-[11px] sm:text-sm text-silver font-medium">Our Work</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto">
            Successful AI implementations across diverse industries.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-12 px-2 sm:px-0">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg text-[11px] sm:text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? "glass-strong text-silver-bright border border-silver-bright/20"
                  : "glass-card text-gray-400 hover:text-silver-bright hover:border-white/[0.12]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredProjects.map((project, index) => (
            <div key={project.title} className="group relative rounded-xl sm:rounded-2xl glass-card-hover silver-shine overflow-hidden cursor-default animate-reveal"
              style={{ animationDelay: `${index * 80}ms`, opacity: 0, animationFillMode: "forwards" }}>
              <div className={`h-36 sm:h-40 lg:h-44 bg-gradient-to-br ${project.gradient} flex items-center justify-center relative overflow-hidden`}>
                <div className="relative z-10 text-center">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 opacity-30">
                    {project.category === "AI/ML" ? "🧠" : project.category === "NLP" ? "💬" : project.category === "Computer Vision" ? "👁️" : "✨"}
                  </div>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-silver bg-white/[0.04] rounded-full border border-white/[0.06]">
                    {project.category}
                  </span>
                </div>
                <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 sm:w-7 sm:h-7 text-silver opacity-0 group-hover:opacity-80 transition-all duration-300 transform group-hover:scale-110" />
                </div>
              </div>
              <div className="p-4 sm:p-5 lg:p-6">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-silver-bright mb-1.5 sm:mb-2 group-hover:text-white transition-colors duration-300">
                  {project.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs text-muted glass-chip rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <a href="#contact" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 glass-card hover:bg-white/[0.05] text-silver hover:text-silver-bright font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 group border border-white/[0.08] hover:border-white/[0.15]">
            View All Projects
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}