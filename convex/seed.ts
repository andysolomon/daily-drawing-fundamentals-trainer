import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import lessonsData from "./data/lessons.json";

export const run = internalAction({
  handler: async (ctx) => {
    for (const lesson of lessonsData) {
      const existing = await ctx.runQuery(internal.seed.getLessonBySlug, {
        slug: lesson.slug,
      });

      if (!existing) {
        await ctx.runMutation(internal.seed.insertLesson, lesson);
      }
    }
  },
});

import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getLessonBySlug = internalQuery({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const insertLesson = internalMutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    order: v.number(),
    track: v.string(),
    difficulty: v.string(),
    isPremium: v.boolean(),
    instructions: v.string(),
    estimatedMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("lessons", args);
  },
});
