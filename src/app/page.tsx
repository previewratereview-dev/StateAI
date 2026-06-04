import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import WhyChooseUs from "@/components/WhyChooseUs";
import Technologies from "@/components/Technologies";
import Process from "@/components/Process";
import Portfolio from "@/components/Portfolio";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import Team from "@/components/Team";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Services />
      <WhyChooseUs />
      <Technologies />
      <Process />
      <Portfolio />
      <Team />
      <Testimonials />
      <CTASection />
      <Footer />
    </main>
  );
}