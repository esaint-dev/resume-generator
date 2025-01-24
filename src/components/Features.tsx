import { Award, BriefcaseIcon, CheckCircle2, Globe } from "lucide-react";

const features = [
  {
    name: "AI-Powered Resume Builder",
    description: "Create professional resumes with intelligent content suggestions tailored to your industry.",
    icon: BriefcaseIcon,
  },
  {
    name: "ATS-Optimized Templates",
    description: "Ensure your resume gets past applicant tracking systems with our optimized templates.",
    icon: CheckCircle2,
  },
  {
    name: "Global Job Search",
    description: "Connect with employers worldwide and track your applications in one place.",
    icon: Globe,
  },
  {
    name: "Career Growth Tools",
    description: "Access career coaching, skill assessments, and interview preparation resources.",
    icon: Award,
  },
];

const Features = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to Land Your Dream Job
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our comprehensive suite of tools helps you create winning job applications and advance your career.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="glass-card relative p-8 rounded-2xl">
                <div className="mb-6">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold leading-8 tracking-tight">
                  {feature.name}
                </h3>
                <p className="mt-2 text-base leading-7 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;