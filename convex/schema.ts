import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    tier: v.string(), // "free" | "premium"
    streakCount: v.number(),
    lastPracticeDate: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  lessons: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    order: v.number(),
    track: v.string(), // "fundamentals" | "shading" | "perspective"
    difficulty: v.string(), // "beginner" | "intermediate" | "advanced"
    isPremium: v.boolean(),
    instructions: v.string(),
    estimatedMinutes: v.number(),
  })
    .index("by_order", ["order"])
    .index("by_slug", ["slug"]),

  submissions: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    imageUrl: v.string(),
    submittedAt: v.number(),
    feedbackStatus: v.string(), // "pending" | "completed" | "failed"
  }).index("by_user_lesson", ["userId", "lessonId"]),

  feedback: defineTable({
    submissionId: v.id("submissions"),
    scores: v.object({
      proportion: v.number(),
      lineQuality: v.number(),
      composition: v.number(),
    }),
    hints: v.array(v.string()),
    strengths: v.array(v.string()),
    summary: v.string(),
    createdAt: v.number(),
  }).index("by_submission", ["submissionId"]),
});
