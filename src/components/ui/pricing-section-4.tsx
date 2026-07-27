"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

const NumberFlow = dynamic(() => import("@number-flow/react"), {
  ssr: false,
  loading: () => <span>0</span>,
});

const plans = [
  {
    name: "Starter",
    description:
      "Great for small businesses and startups looking to get started with AI",
    price: 12,
    yearlyPrice: 99,
    buttonText: "Get started",
    buttonVariant: "outline" as const,
    includes: [
      "Free includes:",
      "Unlimted Cards",
      "Custom background & stickers",
      "2-factor authentication",
    ],
  },
  {
    name: "Business",
    description:
      "For medium to large businesses looking to scale their AI workflow",
    price: 32,
    yearlyPrice: 299,
    buttonText: "Get started",
    buttonVariant: "default" as const,
    popular: true,
    includes: [
      "Everything in Starter, plus:",
      "Priority AI processing",
      "Custom voice models",
      "Dedicated account manager",
    ],
  },
  {
    name: "Enterprise",
    description:
      "Customized AI voice and automation solutions for high-volume needs",
    price: 72,
    yearlyPrice: 699,
    buttonText: "Contact sales",
    buttonVariant: "outline" as const,
    includes: [
      "Everything in Business, plus:",
      "Custom SLA & uptime guarantee",
      "On-premise deployment option",
      "Unlimited seats & vault entries",
    ],
  },
];

function PricingSwitch({ onSwitch }: { onSwitch: (val: string) => void }) {
  const [activeTab, setActiveTab] = useState<"monthly" | "yearly">("monthly");

  const handleTabChange = (tab: "monthly" | "yearly") => {
    setActiveTab(tab);
    onSwitch(tab);
  };

  return (
    <div className="flex justify-center mb-8">
      <div className="bg-[#151728] p-1.5 rounded-full border border-white/10 flex items-center relative gap-1">
        <button
          onClick={() => handleTabChange("monthly")}
          className={cn(
            "px-5 py-2 text-sm font-semibold rounded-full transition-colors relative z-10",
            activeTab === "monthly" ? "text-white" : "text-gray-400 hover:text-white"
          )}
        >
          {activeTab === "monthly" && (
            <motion.div
              layoutId="pricing-tab"
              className="absolute inset-0 bg-violet-600 rounded-full -z-10"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          Monthly
        </button>
        <button
          onClick={() => handleTabChange("yearly")}
          className={cn(
            "px-5 py-2 text-sm font-semibold rounded-full transition-colors relative z-10 flex items-center gap-1.5",
            activeTab === "yearly" ? "text-white" : "text-gray-400 hover:text-white"
          )}
        >
          {activeTab === "yearly" && (
            <motion.div
              layoutId="pricing-tab"
              className="absolute inset-0 bg-violet-600 rounded-full -z-10"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span>Yearly</span>
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
            Save 20%
          </span>
        </button>
      </div>
    </div>
  );
}

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const togglePricingPeriod = (val: string) => {
    setIsYearly(val === "yearly");
  };

  return (
    <section className="py-16 px-4 relative overflow-hidden" ref={pricingRef}>
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
        <VerticalCutReveal
          splitBy="words"
          staggerDuration={0.025}
          staggerFrom="first"
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 40,
            delay: 0,
          }}
        >
          Plans that work best for your team
        </VerticalCutReveal>

        <p className="text-gray-300 max-w-xl mx-auto text-sm">
          Flexible pricing built for developers, creators, and enterprises in Tanzania & globally.
        </p>

        <PricingSwitch onSwitch={togglePricingPeriod} />
      </div>

      <div className="grid md:grid-cols-3 max-w-5xl gap-6 mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "relative text-white border-white/10 rounded-3xl p-2 transition-all",
              plan.popular
                ? "bg-gradient-to-b from-violet-950/80 via-slate-900/90 to-slate-950 border-violet-500/50 shadow-2xl shadow-violet-500/20"
                : "bg-slate-900/60 border-white/10"
            )}
          >
            <CardHeader className="text-left">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                {plan.popular && (
                  <span className="bg-violet-500/20 border border-violet-500/40 text-violet-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Popular
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-4xl font-extrabold text-white">
                  ${isYearly ? plan.yearlyPrice : plan.price}
                </span>
                <span className="text-gray-400 text-xs font-mono">
                  /{isYearly ? "year" : "month"}
                </span>
              </div>
              <p className="text-xs text-gray-300 min-h-[36px]">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <button
                className={cn(
                  "w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-lg",
                  plan.popular
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                )}
              >
                {plan.buttonText}
              </button>

              <div className="space-y-2 pt-4 border-t border-white/10 text-xs">
                <p className="font-semibold text-gray-300">{plan.includes[0]}</p>
                <ul className="space-y-1.5">
                  {plan.includes.slice(1).map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default PricingSection;