import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsert = mutation({
  args: {
    submissionId: v.id("submissions"),
    scores: v.object({
      proportion: v.number(),
      lineQuality: v.number(),
      composition: v.number(),
    }),
    hints: v.array(v.string()),
    strengths: v.array(v.string()),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    // Update submission status
    await ctx.db.patch(args.submissionId, { feedbackStatus: "completed" });

    // Upsert feedback
    const existing = await ctx.db
      .query("feedback")
      .withIndex("by_submission", (q) =>
        q.eq("submissionId", args.submissionId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        scores: args.scores,
        hints: args.hints,
        strengths: args.strengths,
        summary: args.summary,
        createdAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("feedback", {
      submissionId: args.submissionId,
      scores: args.scores,
      hints: args.hints,
      strengths: args.strengths,
      summary: args.summary,
      createdAt: Date.now(),
    });
  },
});

export const getBySubmission = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("feedback")
      .withIndex("by_submission", (q) =>
        q.eq("submissionId", args.submissionId)
      )
      .first();
  },
});
