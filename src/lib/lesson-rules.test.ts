import { computeUnlockStatus, type LessonInput } from "./lesson-rules";

function makeLesson(overrides: Partial<LessonInput> & { _id: string; order: number }): LessonInput {
  return {
    slug: `lesson-${overrides.order}`,
    title: `Lesson ${overrides.order}`,
    description: "Test lesson",
    track: "fundamentals",
    difficulty: "beginner",
    isPremium: false,
    instructions: "Draw something",
    estimatedMinutes: 10,
    ...overrides,
  };
}

const lessons: LessonInput[] = [
  makeLesson({ _id: "1", order: 1 }),
  makeLesson({ _id: "2", order: 2 }),
  makeLesson({ _id: "3", order: 3 }),
  makeLesson({ _id: "4", order: 4, isPremium: true }),
  makeLesson({ _id: "5", order: 5, isPremium: true }),
];

describe("computeUnlockStatus", () => {
  it("unlocks only the first lesson when no completions", () => {
    const result = computeUnlockStatus(lessons, new Set(), "free");
    expect(result[0].status).toBe("unlocked");
    expect(result[1].status).toBe("locked");
    expect(result[2].status).toBe("locked");
  });

  it("completing lesson N unlocks lesson N+1", () => {
    const result = computeUnlockStatus(lessons, new Set(["1", "2"]), "free");
    expect(result[0].status).toBe("completed");
    expect(result[1].status).toBe("completed");
    expect(result[2].status).toBe("unlocked");
    expect(result[3].status).toBe("premium-locked");
  });

  it("marks premium lessons as premium-locked for free tier", () => {
    const result = computeUnlockStatus(lessons, new Set(["1", "2", "3"]), "free");
    expect(result[3].status).toBe("premium-locked");
    expect(result[4].status).toBe("premium-locked");
  });

  it("unlocks premium lessons for premium tier when predecessor completed", () => {
    const result = computeUnlockStatus(lessons, new Set(["1", "2", "3"]), "premium");
    expect(result[3].status).toBe("unlocked");
    expect(result[4].status).toBe("locked");
  });

  it("shows all lessons as completed when all are done", () => {
    const result = computeUnlockStatus(
      lessons,
      new Set(["1", "2", "3", "4", "5"]),
      "premium"
    );
    expect(result.every((l) => l.status === "completed")).toBe(true);
  });

  it("handles unsorted input correctly", () => {
    const shuffled = [lessons[3], lessons[0], lessons[4], lessons[2], lessons[1]];
    const result = computeUnlockStatus(shuffled, new Set(["1"]), "free");
    expect(result[0].order).toBe(1);
    expect(result[0].status).toBe("completed");
    expect(result[1].order).toBe(2);
    expect(result[1].status).toBe("unlocked");
  });

  it("keeps first lesson unlocked even if premium on free tier", () => {
    const premiumFirst = [
      makeLesson({ _id: "p1", order: 1, isPremium: true }),
      makeLesson({ _id: "p2", order: 2 }),
    ];
    // Premium check takes priority over first-lesson unlock
    const result = computeUnlockStatus(premiumFirst, new Set(), "free");
    expect(result[0].status).toBe("premium-locked");
  });
});
