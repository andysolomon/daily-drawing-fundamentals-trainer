"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];

interface PhotoUploadProps {
  onFileSelected: (file: File | null) => void;
}

export function PhotoUpload({ onFileSelected }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please select an image (JPG, PNG, WebP, or HEIC)");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error("Image must be under 10MB");
      e.target.value = "";
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setFileName(file.name);
    onFileSelected(file);
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
    onFileSelected(null);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload photo"
      />

      {!previewUrl ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center hover:border-primary hover:bg-accent transition-colors"
        >
          <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">Upload Photo</p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG, WebP, or HEIC up to 10MB
          </p>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-lg border overflow-hidden bg-muted">
            <Image
              src={previewUrl}
              alt={fileName ?? "Sketch preview"}
              width={800}
              height={600}
              className="w-full h-auto object-contain max-h-[60vh]"
              unoptimized
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground truncate flex-1">
              {fileName}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
              Choose Different Photo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
