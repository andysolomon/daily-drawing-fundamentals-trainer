"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SketchCanvas,
  type SketchCanvasHandle,
} from "@/components/sketch-canvas";
import { PhotoUpload } from "@/components/photo-upload";
import { api } from "@/lib/convex";

export function SubmitForm({ slug }: { slug: string }) {
  const router = useRouter();
  const lesson = useQuery(api.lessons.getBySlug, { slug });
  const createSubmission = useMutation(api.submissions.create);
  const canvasRef = useRef<SketchCanvasHandle>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"draw" | "photo">("draw");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!lesson) return;
    setIsSubmitting(true);

    try {
      // Get the file/blob to upload
      let fileToUpload: Blob | File | null = null;
      let filename: string;

      if (activeTab === "draw") {
        const blob = await canvasRef.current?.exportToBlob();
        if (!blob) {
          toast.error("Failed to export canvas");
          setIsSubmitting(false);
          return;
        }
        fileToUpload = blob;
        filename = `sketches/${lesson.slug}-${Date.now()}.png`;
      } else if (photoFile) {
        fileToUpload = photoFile;
        const ext = photoFile.name.split(".").pop() ?? "jpg";
        filename = `sketches/${lesson.slug}-${Date.now()}.${ext}`;
      } else {
        setIsSubmitting(false);
        return;
      }

      // Upload to Vercel Blob
      const result = await upload(filename, fileToUpload, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      // Create submission record in Convex
      const submissionId = await createSubmission({
        lessonId: lesson._id,
        imageUrl: result.url,
      });

      toast.success("Sketch submitted!");
      router.push(`/lessons/${slug}/feedback/${submissionId}`);
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error(
        error instanceof Error
          ? `Upload failed: ${error.message}`
          : "Upload failed. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  if (lesson === undefined) {
    return (
      <div className="space-y-4 max-w-3xl">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="space-y-4 max-w-3xl">
        <p className="text-muted-foreground">Lesson not found.</p>
        <Link href="/lessons">
          <Button variant="outline">Back to lessons</Button>
        </Link>
      </div>
    );
  }

  const canSubmit =
    (activeTab === "draw") || (activeTab === "photo" && photoFile !== null);

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href={`/lessons/${slug}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {lesson.title}
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">Submit your sketch</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lesson.title} — choose how you want to submit your work.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "draw" | "photo")}
      >
        <TabsList>
          <TabsTrigger value="draw">Draw in browser</TabsTrigger>
          <TabsTrigger value="photo">Upload photo</TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="mt-4">
          <SketchCanvas ref={canvasRef} />
        </TabsContent>

        <TabsContent value="photo" className="mt-4">
          <PhotoUpload onFileSelected={setPhotoFile} />
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Uploading..." : "Submit Sketch"}
        </Button>
      </div>
    </div>
  );
}
