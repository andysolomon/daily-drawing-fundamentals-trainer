"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex";

export function useTrackLessonStart(lessonId: string | undefined) {
  const track = useMutation(api.events.track);
  const tracked = useRef(false);

  useEffect(() => {
    if (!lessonId || tracked.current) return;

    // Session-level dedup via sessionStorage
    const key = `lesson_started:${lessonId}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(key)) return;

    tracked.current = true;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(key, "1");
    }

    track({ type: "lesson_started", lessonId: lessonId as never }).catch(() => {
      // Silent fail — analytics shouldn't block the UI
    });
  }, [lessonId, track]);
}
