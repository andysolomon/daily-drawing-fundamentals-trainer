"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/convex";
import { useTrackLessonStart } from "@/hooks/use-track-lesson-start";
import { Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-500",
  intermediate: "bg-yellow-500/10 text-yellow-500",
  advanced: "bg-red-500/10 text-red-500",
};

const trackColors: Record<string, string> = {
  fundamentals: "bg-blue-500/10 text-blue-500",
  shading: "bg-purple-500/10 text-purple-500",
  perspective: "bg-amber-500/10 text-amber-500",
};

export function LessonDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const lesson = useQuery(api.lessons.getBySlug, { slug });
  const submission = useQuery(
    api.submissions.getLatestForLesson,
    lesson?._id ? { lessonId: lesson._id } : "skip"
  );

  // Track lesson start event
  useTrackLessonStart(lesson?._id);

  // Redirect if lesson not found (after loading completes)
  useEffect(() => {
    if (lesson === null) {
      toast.error("Lesson not found");
      router.replace("/lessons");
    }
  }, [lesson, router]);

  // Loading state
  if (lesson === undefined) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href="/lessons"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to lessons
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{lesson.title}</h1>
        <p className="text-muted-foreground mt-1">{lesson.description}</p>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Badge variant="secondary" className={trackColors[lesson.track]}>
            {lesson.track}
          </Badge>
          <Badge variant="secondary" className={difficultyColors[lesson.difficulty]}>
            {lesson.difficulty}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {lesson.estimatedMinutes} minutes
          </span>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="font-medium mb-3">Instructions</h2>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {lesson.instructions}
        </p>
      </Card>

      {submission ? (
        <Card className="p-6 space-y-4">
          <h2 className="font-medium">Your latest submission</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={submission.imageUrl}
            alt="Your submitted sketch"
            className="w-full max-w-sm rounded-md border"
          />
          <div className="flex flex-wrap gap-3">
            <Link href={`/lessons/${slug}/feedback/${submission._id}`}>
              <Button>View Feedback</Button>
            </Link>
            <Link href={`/lessons/${slug}/submit`}>
              <Button variant="outline">Resubmit</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="flex gap-3">
          <Link href={`/lessons/${slug}/submit`}>
            <Button size="lg">Submit Sketch</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
