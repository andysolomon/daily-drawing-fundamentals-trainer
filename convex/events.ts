import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const track = mutation({
  args: {
    type: v.string(),
    lessonId: v.id("lessons"),
    metadata: v.optional(
      v.object({
        durationMs: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    return await ctx.db.insert("events", {
      userId: user._id,
      type: args.type,
      lessonId: args.lessonId,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

export const hasEvent = query({
  args: {
    type: v.string(),
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return false;

    const event = await ctx.db
      .query("events")
      .withIndex("by_user_type_lesson", (q) =>
        q.eq("userId", user._id).eq("type", args.type).eq("lessonId", args.lessonId)
      )
      .first();

    return !!event;
  },
});
