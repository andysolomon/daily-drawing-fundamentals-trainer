import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!WEBHOOK_SECRET) {
    return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 401 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const { id, email_addresses, first_name, last_name } = event.data;
    const email = email_addresses[0]?.email_address ?? "";
    const name =
      [first_name, last_name].filter(Boolean).join(" ") || undefined;

    if (CONVEX_URL) {
      const client = new ConvexHttpClient(CONVEX_URL);
      await client.mutation(
        // Use anyApi for build-time safety — convex/_generated/api requires `convex dev`
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "users:upsertFromClerk" as any,
        { clerkId: id, email, name }
      );
    }
  }

  return new Response("OK", { status: 200 });
}
