import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { DisclaimerFooter } from "@/components/DisclaimerFooter";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <DisclaimerFooter />
    </main>
  );
}
