import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText, Output } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { feedbackSchema } from "@/lib/feedback-schema";

const MODEL = "openai/gpt-5.4";
const MAX_RETRIES = 2;

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = (await request.json()) as {
    submissionId: string;
    lessonSlug: string;
    imageUrl: string;
  };

  const { submissionId, lessonSlug, imageUrl } = body;

  if (!submissionId || !lessonSlug || !imageUrl) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!CONVEX_URL) {
    return NextResponse.json(
      { error: "Convex not configured" },
      { status: 500 }
    );
  }

  const convex = new ConvexHttpClient(CONVEX_URL);

  // Fetch lesson context for the AI prompt
  let lesson: { title: string; instructions: string; description: string } | null = null;
  try {
    lesson = await convex.query(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "lessons:getBySlug" as any,
      { slug: lessonSlug }
    );
  } catch {
    return NextResponse.json({ error: "Lesson lookup failed" }, { status: 500 });
  }

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const prompt = `You are an experienced drawing instructor evaluating a beginner art student's sketch.

LESSON: ${lesson.title}
DESCRIPTION: ${lesson.description}
INSTRUCTIONS GIVEN: ${lesson.instructions}

The student submitted an image at this URL. Look at the image and provide structured feedback.

Score from 1 (poor) to 10 (excellent):
- proportion: how well-proportioned shapes and forms are
- lineQuality: confidence and consistency of line work
- composition: overall arrangement and use of space

Provide:
- 1-2 specific strengths (what they did well)
- 2-4 specific, actionable hints to improve
- A 1-2 sentence overall summary

Be encouraging but honest. Focus on the lesson objectives.`;

  // Retry loop
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { output } = await generateText({
        model: MODEL,
        output: Output.object({ schema: feedbackSchema }),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image", image: new URL(imageUrl) },
            ],
          },
        ],
      });

      // Save feedback to Convex
      await convex.mutation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "feedback:upsert" as any,
        { submissionId, ...output }
      );

      return NextResponse.json({ success: true, feedback: output });
    } catch (error) {
      lastError = error;
      console.error(`AI feedback attempt ${attempt + 1} failed:`, error);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  // All retries failed — mark submission as failed
  try {
    await convex.mutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "submissions:markFailed" as any,
      { submissionId }
    );
  } catch (e) {
    console.error("Failed to mark submission as failed:", e);
  }

  return NextResponse.json(
    {
      error: "Feedback generation failed after retries",
      details: lastError instanceof Error ? lastError.message : String(lastError),
    },
    { status: 500 }
  );
}
