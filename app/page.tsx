import { Hero } from "@/components/home/Hero";
import { MeetThePups } from "@/components/home/MeetThePups";
import { TwoWays } from "@/components/home/TwoWays";
import { Journey } from "@/components/home/Journey";
import { Passport } from "@/components/home/Passport";
import { HappyFamilies } from "@/components/home/HappyFamilies";
import { FaqTeaser } from "@/components/home/FaqTeaser";
import { WelcomeHome } from "@/components/home/WelcomeHome";
import { puppies } from "@/lib/puppies";

/**
 * The home page is one long "morning to night" story: each section's sky
 * gradient picks up where the previous one ended.
 */
export default function HomePage() {
  const available = puppies.filter((p) => p.status === "available");
  return (
    <>
      <Hero />
      <MeetThePups puppies={available} />
      <TwoWays />
      <Journey />
      <Passport />
      <HappyFamilies />
      <FaqTeaser />
      <WelcomeHome />
    </>
  );
}
