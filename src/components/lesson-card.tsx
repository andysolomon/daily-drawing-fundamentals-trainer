"use client";

import Link from "next/link";
import { Check, Lock, Crown, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LessonStatus } from "@/lib/lesson-rules";

interface LessonCardProps {
  slug: string;
  title: string;
  description: string;
  track: string;
  difficulty: string;
  estimatedMinutes: number;
  isPremium: boolean;
  status: LessonStatus;
  isNextUp?: boolean;
}

const trackColors: Record<string, string> = {
  fundamentals: "bg-blue-500/10 text-blue-500",
  shading: "bg-purple-500/10 text-purple-500",
  perspective: "bg-amber-500/10 text-amber-500",
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-500",
  intermediate: "bg-yellow-500/10 text-yellow-500",
  advanced: "bg-red-500/10 text-red-500",
};

function StatusIcon({ status }: { status: LessonStatus }) {
  switch (status) {
    case "completed":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
          <Check className="h-4 w-4 text-green-500" />
        </div>
      );
    case "unlocked":
      return null;
    case "locked":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
      );
    case "premium-locked":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
          <Crown className="h-4 w-4 text-amber-500" />
        </div>
      );
  }
}

export function LessonCard({
  slug,
  title,
  description,
  track,
  difficulty,
  estimatedMinutes,
  status,
  isNextUp,
}: LessonCardProps) {
  const isClickable = status === "completed" || status === "unlocked";

  const cardContent = (
    <Card
      className={cn(
        "relative flex items-start gap-4 p-4 transition-colors",
        isClickable && "hover:bg-accent cursor-pointer",
        !isClickable && "opacity-60 cursor-not-allowed",
        isNextUp && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      <StatusIcon status={status} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-sm truncate">{title}</h3>
          {isNextUp && (
            <Badge variant="default" className="text-xs shrink-0">
              Next Up
            </Badge>
          )}
          {status === "premium-locked" && (
            <Badge variant="outline" className="text-xs shrink-0 border-amber-500 text-amber-500">
              Premium
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {description}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className={cn("text-xs", trackColors[track])}>
            {track}
          </Badge>
          <Badge variant="secondary" className={cn("text-xs", difficultyColors[difficulty])}>
            {difficulty}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {estimatedMinutes}m
          </span>
        </div>
      </div>
    </Card>
  );

  if (isClickable) {
    return <Link href={`/lessons/${slug}`}>{cardContent}</Link>;
  }

  return cardContent;
}
