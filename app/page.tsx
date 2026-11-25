import { Hero } from "@/components/home/Hero";
import { MeetThePups } from "@/components/home/MeetThePups";
import { puppies } from "@/lib/puppies";

export default function HomePage() {
  const available = puppies.filter((p) => p.status === "available");
  return (
    <>
      <Hero />
      <MeetThePups puppies={available} />
    </>
  );
}
