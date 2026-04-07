import { z } from "zod";

export const feedbackSchema = z.object({
  scores: z.object({
    proportion: z
      .number()
      .min(1)
      .max(10)
      .describe("How well-proportioned the drawing is, 1-10"),
    lineQuality: z
      .number()
      .min(1)
      .max(10)
      .describe("Confidence and consistency of line work, 1-10"),
    composition: z
      .number()
      .min(1)
      .max(10)
      .describe("Overall composition and use of space, 1-10"),
  }),
  hints: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe("2-4 specific, actionable improvement suggestions"),
  strengths: z
    .array(z.string())
    .min(1)
    .max(2)
    .describe("1-2 things the artist did well"),
  summary: z
    .string()
    .describe("1-2 sentence overall assessment"),
});

export type Feedback = z.infer<typeof feedbackSchema>;
