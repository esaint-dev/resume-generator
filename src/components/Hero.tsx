
import { Button } from "@/components/ui/button";
import { FileText, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

const Hero = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/resume-builder');
    } else {
      navigate('/auth/login');
    }
  };

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
            <Button size="lg" className="group" onClick={handleGetStarted}>
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
