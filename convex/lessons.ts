import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("lessons").withIndex("by_order").collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

type LessonStatus = "completed" | "unlocked" | "locked" | "premium-locked";

export const listWithStatus = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    const lessons = await ctx.db.query("lessons").withIndex("by_order").collect();

    // If not authenticated, show first lesson unlocked, rest locked
    if (!identity) {
      return lessons.map((lesson, index) => ({
        ...lesson,
        status: (index === 0 ? "unlocked" : "locked") as LessonStatus,
      }));
    }

    // Look up user for tier info
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    const userTier = (user?.tier ?? "free") as "free" | "premium";

    // Get completed lesson IDs from submissions
    const completedLessonIds = new Set<string>();
    if (user) {
      const submissions = await ctx.db
        .query("submissions")
        .withIndex("by_user_lesson")
        .filter((q) => q.eq(q.field("userId"), user._id))
        .collect();

      for (const sub of submissions) {
        completedLessonIds.add(sub.lessonId);
      }
    }

    // Compute status for each lesson (same logic as src/lib/lesson-rules.ts)
    return lessons.map((lesson, index) => {
      if (completedLessonIds.has(lesson._id)) {
        return { ...lesson, status: "completed" as LessonStatus };
      }
      if (lesson.isPremium && userTier === "free") {
        return { ...lesson, status: "premium-locked" as LessonStatus };
      }
      if (index === 0) {
        return { ...lesson, status: "unlocked" as LessonStatus };
      }
      const prev = lessons[index - 1];
      if (completedLessonIds.has(prev._id)) {
        return { ...lesson, status: "unlocked" as LessonStatus };
      }
      return { ...lesson, status: "locked" as LessonStatus };
    });
  },
});
