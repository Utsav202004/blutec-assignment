import type { Metadata } from "next";
import { HowItWorksPage } from "@/components/pages/HowItWorksPage";

export const metadata: Metadata = {
  title: "How it works",
  description: "Meet a local puppy in our Downtown Dubai showroom or reserve a premium teacup breed imported for you — every step, from choosing to coming home.",
};

export default function Page() {
  return <HowItWorksPage />;
}
