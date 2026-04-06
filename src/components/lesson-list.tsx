"use client";

import { useQuery } from "convex/react";
import { LessonCard } from "@/components/lesson-card";
import { api } from "@/lib/convex";
import type { LessonStatus } from "@/lib/lesson-rules";

export function LessonList() {
  const lessons = useQuery(api.lessons.listWithStatus);

  if (!lessons) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Lessons</h1>
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  const firstUnlockedIndex = lessons.findIndex(
    (l: { status: LessonStatus }) => l.status === "unlocked"
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Lessons</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete each lesson in order to unlock the next.
        </p>
      </div>

      <div className="grid gap-3">
        {lessons.map(
          (
            lesson: {
              _id: string;
              slug: string;
              title: string;
              description: string;
              track: string;
              difficulty: string;
              estimatedMinutes: number;
              isPremium: boolean;
              status: LessonStatus;
            },
            index: number
          ) => (
            <LessonCard
              key={lesson._id}
              slug={lesson.slug}
              title={lesson.title}
              description={lesson.description}
              track={lesson.track}
              difficulty={lesson.difficulty}
              estimatedMinutes={lesson.estimatedMinutes}
              isPremium={lesson.isPremium}
              status={lesson.status}
              isNextUp={index === firstUnlockedIndex}
            />
          )
        )}
      </div>
    </div>
  );
}
