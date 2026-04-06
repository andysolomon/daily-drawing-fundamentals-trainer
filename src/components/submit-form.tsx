"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SketchCanvas,
  type SketchCanvasHandle,
} from "@/components/sketch-canvas";
import { PhotoUpload } from "@/components/photo-upload";
import { api } from "@/lib/convex";

export function SubmitForm({ slug }: { slug: string }) {
  const lesson = useQuery(api.lessons.getBySlug, { slug });
  const canvasRef = useRef<SketchCanvasHandle>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"draw" | "photo">("draw");

  const handleSubmit = () => {
    // Wired up in PR2
    if (activeTab === "draw") {
      console.log("Canvas submit (PR2 will wire upload)");
    } else if (photoFile) {
      console.log("Photo submit (PR2 will wire upload)", photoFile.name);
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
        <Button size="lg" onClick={handleSubmit} disabled={!canSubmit}>
          Submit Sketch
        </Button>
      </div>
    </div>
  );
}
