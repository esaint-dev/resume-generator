import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "1 Resume Template",
      "Basic AI Suggestions",
      "Export to PDF",
      "Grammar Check",
    ],
  },
  {
    name: "Pro",
    price: "$12",
    description: "Best for job seekers",
    features: [
      "All Free Features",
      "Unlimited Templates",
      "ATS Optimization",
      "Cover Letter Generator",
      "Priority Support",
    ],
  },
  {
    name: "Enterprise",
    price: "$29",
    description: "For teams and businesses",
    features: [
      "All Pro Features",
      "Career Coaching",
      "Interview Preparation",
      "Custom Branding",
      "API Access",
    ],
  },
];

const Pricing = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Choose the perfect plan for your career journey
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="glass-card flex flex-col justify-between rounded-3xl p-8 ring-1 ring-white/10"
            >
              <div>
                <h3 className="text-lg font-semibold leading-8">
                  {tier.name}
                </h3>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-sm font-semibold leading-6">/month</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                className="mt-8"
                variant={tier.name === "Pro" ? "default" : "outline"}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;