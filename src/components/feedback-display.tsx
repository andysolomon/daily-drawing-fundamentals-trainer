"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowLeft, Loader2, RefreshCw, Sparkles, Lightbulb, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreBar } from "@/components/score-bar";
import { api } from "@/lib/convex";

interface FeedbackDisplayProps {
  slug: string;
  submissionId: string;
}

export function FeedbackDisplay({ slug, submissionId }: FeedbackDisplayProps) {
  const submission = useQuery(api.submissions.getById, {
    id: submissionId,
  });
  const feedback = useQuery(api.feedback.getBySubmission, {
    submissionId: submissionId,
  });
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!submission) return;
    setIsRetrying(true);
    try {
      const res = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          lessonSlug: slug,
          imageUrl: submission.imageUrl,
        }),
      });
      if (!res.ok) throw new Error("Retry failed");
    } catch (err) {
      console.error(err);
    } finally {
      setIsRetrying(false);
    }
  };

  if (submission === undefined) {
    return (
      <div className="space-y-4 max-w-3xl">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="space-y-4 max-w-3xl">
        <p className="text-muted-foreground">Submission not found.</p>
        <Link href={`/lessons/${slug}`}>
          <Button variant="outline">Back to lesson</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href={`/lessons/${slug}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to lesson
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">Your feedback</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date(submission.submittedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <Card className="overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={submission.imageUrl}
          alt="Your submitted sketch"
          className="w-full max-h-[60vh] object-contain bg-muted"
        />
      </Card>

      {submission.feedbackStatus === "pending" && (
        <Card className="p-8">
          <div className="flex flex-col items-center text-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="font-medium">Generating feedback...</p>
            <p className="text-sm text-muted-foreground">
              Our AI is analyzing your sketch. This usually takes 10–30 seconds.
            </p>
          </div>
        </Card>
      )}

      {submission.feedbackStatus === "failed" && (
        <Card className="p-6 border-destructive/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1 space-y-3">
              <div>
                <p className="font-medium">Feedback could not be generated</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Something went wrong while analyzing your sketch. Try again
                  in a moment.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isRetrying ? "Retrying..." : "Retry"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {submission.feedbackStatus === "completed" && feedback && (
        <>
          <Card className="p-6 space-y-4">
            <h2 className="font-medium">Scores</h2>
            <ScoreBar label="proportion" score={feedback.scores.proportion} />
            <ScoreBar label="line quality" score={feedback.scores.lineQuality} />
            <ScoreBar label="composition" score={feedback.scores.composition} />
          </Card>

          <Card className="p-6">
            <h2 className="font-medium mb-2">Summary</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feedback.summary}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-green-500" />
              <h2 className="font-medium">Strengths</h2>
            </div>
            <ul className="space-y-2">
              {feedback.strengths.map((s: string, i: number) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-green-500 mt-0.5">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h2 className="font-medium">To improve</h2>
            </div>
            <ul className="space-y-2">
              {feedback.hints.map((h: string, i: number) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-amber-500 mt-0.5">•</span>
                  {h}
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
