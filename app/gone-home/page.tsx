import type { Metadata } from "next";
import { GoneHomePage } from "@/components/pages/GoneHomePage";

export const metadata: Metadata = {
  title: "Gone home",
  description: "TeddyPups puppies who have already joined their families.",
};

export default function Page() {
  return <GoneHomePage />;
}
