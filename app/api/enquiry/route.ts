import { NextResponse } from "next/server";
import { validateEnquiry, type EnquiryInput } from "@/lib/enquiry";

/**
 * Receives enquiries from the puppy and contact forms.
 *
 * The reference site's backend isn't public, so this validates the data
 * server-side and logs it. To deliver enquiries for real, forward `data` to an
 * email service, a CRM or a WhatsApp Business API here.
 */
export async function POST(request: Request) {
  let data: EnquiryInput;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request." },
      { status: 400 },
    );
  }

  // Bots fill every field, including the hidden honeypot: pretend it worked
  if (data.website) return NextResponse.json({ ok: true });

  const errors = validateEnquiry(data);
  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  console.info("[enquiry]", {
    name: data.name?.trim(),
    puppy: data.puppy ?? null,
    at: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}
