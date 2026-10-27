import { Hero } from "@/components/landing/Hero";
import { AustinVenue } from "@/components/landing/AustinVenue";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { DisclaimerFooter } from "@/components/DisclaimerFooter";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <AustinVenue />
      <HowItWorks />
      <DisclaimerFooter />
    </main>
  );
}
