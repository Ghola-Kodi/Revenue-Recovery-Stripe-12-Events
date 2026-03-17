import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { dispatchStripeEvent } from "@/lib/stripe/handlers";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // naive idempotency: rely on unique stripe_event_id on events table
  const { error } = await supabase.from("events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    raw_payload: event,
  });

  if (error && error.code === "23505") {
    return NextResponse.json({ received: true });
  }

  dispatchStripeEvent(event).catch(console.error);

  return NextResponse.json({ received: true });
}
