import type Stripe from "stripe";

type Handler = (event: Stripe.Event) => Promise<void>;

const registry: Record<string, Handler> = {
  // TODO: wire specific handlers per event type
};

export async function dispatchStripeEvent(event: Stripe.Event) {
  const handler = registry[event.type];
  if (!handler) {
    // TODO: create missing-handler alert
    return;
  }
  await handler(event);
}
