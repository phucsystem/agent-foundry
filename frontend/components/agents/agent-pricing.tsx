import type { PricingTier } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface AgentPricingProps {
  tiers: PricingTier[];
}

export function AgentPricing({ tiers }: AgentPricingProps) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Pricing</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`bg-white dark:bg-slate-800 border-2 rounded-lg p-8 text-center transition-shadow ${
              tier.highlighted
                ? "border-primary shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                : "border-border"
            }`}
          >
            <div className="text-lg font-bold mb-2">{tier.name}</div>
            <div className="text-3xl font-bold text-primary mb-4">
              ${tier.price}
              <span className="text-sm font-normal text-text-secondary">{tier.period}</span>
            </div>
            <ul className="list-none text-left mb-6">
              {tier.features.map((feature) => (
                <li
                  key={feature}
                  className="py-2 text-sm text-text-secondary flex items-center gap-2"
                >
                  <span className="text-success font-bold">&#10003;</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button variant="primary" className="w-full">
              {tier.name === "Small Team" ? "Hire Team" : tier.name === "Full Squad" ? "Hire Squad" : "Hire"}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
