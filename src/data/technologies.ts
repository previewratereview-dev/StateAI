export interface TechItem {
  name: string;
  category: string;
  logo: string;
}

export const technologies: TechItem[] = [
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
