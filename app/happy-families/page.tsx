import type { Metadata } from "next";
import { HappyFamiliesPage } from "@/components/pages/HappyFamiliesPage";

export const metadata: Metadata = {
  title: "Happy families",
  description: "Real photos shared by TeddyPups families after welcoming their new puppy home.",
};

export default function Page() {
  return <HappyFamiliesPage />;
}
