import GridBackground from "@/components/GridBackground";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Templates from "@/components/Templates";
import Pricing from "@/components/Pricing";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <GridBackground />
      <main>
        <Hero />
        <Features />
        <Templates />
        <Pricing />
      </main>
    </div>
  );
};

export default Index;