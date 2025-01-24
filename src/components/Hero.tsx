import { Button } from "@/components/ui/button";
import { FileText, Rocket } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative pt-20 pb-16 sm:pt-32 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8">
            Create Your Perfect Resume with
            <span className="text-gradient block mt-2">AI-Powered Precision</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl leading-8 text-muted-foreground">
            Transform your career journey with our intelligent resume builder. Craft ATS-optimized resumes and compelling cover letters tailored to your dream job.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" className="group">
              Get Started Free
              <Rocket className="ml-2 h-4 w-4 group-hover:animate-float" />
            </Button>
            <Button variant="outline" size="lg">
              View Templates
              <FileText className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;