export type LessonStatus =
  | "completed"
  | "unlocked"
  | "locked"
  | "premium-locked";

export interface LessonInput {
  _id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  track: string;
  difficulty: string;
  isPremium: boolean;
  instructions: string;
  estimatedMinutes: number;
}

export interface LessonWithStatus extends LessonInput {
  status: LessonStatus;
}

export function computeUnlockStatus(
  lessons: LessonInput[],
  completedLessonIds: Set<string>,
  userTier: "free" | "premium"
): LessonWithStatus[] {
  const sorted = [...lessons].sort((a, b) => a.order - b.order);

  return sorted.map((lesson, index) => {
    // Already completed
    if (completedLessonIds.has(lesson._id)) {
      return { ...lesson, status: "completed" as const };
    }

    // Premium lesson on free tier
    if (lesson.isPremium && userTier === "free") {
      return { ...lesson, status: "premium-locked" as const };
    }

    // First lesson is always unlocked
    if (index === 0) {
      return { ...lesson, status: "unlocked" as const };
    }

    // Unlocked if previous lesson is completed
    const previousLesson = sorted[index - 1];
    if (completedLessonIds.has(previousLesson._id)) {
      return { ...lesson, status: "unlocked" as const };
    }

    // Otherwise locked
    return { ...lesson, status: "locked" as const };
  });
}
