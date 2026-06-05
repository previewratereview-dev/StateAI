import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import WhyChooseUs from "@/components/WhyChooseUs";
import Technologies from "@/components/Technologies";
import Process from "@/components/Process";
import Industries from "@/components/Industries";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import Team from "@/components/Team";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen glass-page">
      <Navbar />
      <Hero />
      <Services />
      <WhyChooseUs />
      <Technologies />
      <Process />
      <Industries />
      <Team />
      <Testimonials />
      <CTASection />
      <Footer />
    </main>
  );
}
