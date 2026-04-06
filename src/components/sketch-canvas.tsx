"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Pencil, Eraser, Undo2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type Tool = "pen" | "eraser";

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  tool: Tool;
  color: string;
  width: number;
  points: Point[];
}

export interface SketchCanvasHandle {
  exportToBlob: () => Promise<Blob | null>;
  isEmpty: () => boolean;
}

interface SketchCanvasProps {
  width?: number;
  height?: number;
}

const COLORS = ["#000000", "#ef4444", "#3b82f6", "#10b981", "#f59e0b"];

export const SketchCanvas = forwardRef<SketchCanvasHandle, SketchCanvasProps>(
  function SketchCanvas({ width = 800, height = 600 }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tool, setTool] = useState<Tool>("pen");
    const [color, setColor] = useState("#000000");
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Redraw the entire canvas from stroke history
    const redraw = (allStrokes: Stroke[], inProgress: Stroke | null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const drawStroke = (stroke: Stroke) => {
        if (stroke.points.length < 2) return;
        ctx.globalCompositeOperation =
          stroke.tool === "eraser" ? "destination-out" : "source-over";
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      };

      for (const stroke of allStrokes) drawStroke(stroke);
      if (inProgress) drawStroke(inProgress);
    };

    useEffect(() => {
      redraw(strokes, currentStroke);
    }, [strokes, currentStroke]);

    useImperativeHandle(ref, () => ({
      exportToBlob: () =>
        new Promise<Blob | null>((resolve) => {
          const canvas = canvasRef.current;
          if (!canvas) return resolve(null);
          canvas.toBlob((blob) => resolve(blob), "image/png");
        }),
      isEmpty: () => strokes.length === 0,
    }));

    const getPointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const point = getPointFromEvent(e);
      setIsDrawing(true);
      setCurrentStroke({
        tool,
        color,
        width: tool === "eraser" ? strokeWidth * 4 : strokeWidth,
        points: [point],
      });
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !currentStroke) return;
      e.preventDefault();
      const point = getPointFromEvent(e);
      setCurrentStroke({
        ...currentStroke,
        points: [...currentStroke.points, point],
      });
    };

    const handlePointerUp = () => {
      if (!isDrawing || !currentStroke) return;
      setStrokes([...strokes, currentStroke]);
      setCurrentStroke(null);
      setIsDrawing(false);
    };

    const handleUndo = () => {
      setStrokes(strokes.slice(0, -1));
    };

    const handleClear = () => {
      setStrokes([]);
      setCurrentStroke(null);
    };

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg border bg-card">
          <Button
            type="button"
            variant={tool === "pen" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("pen")}
          >
            <Pencil className="h-4 w-4" />
            Pen
          </Button>
          <Button
            type="button"
            variant={tool === "eraser" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("eraser")}
          >
            <Eraser className="h-4 w-4" />
            Eraser
          </Button>

          <div className="h-6 w-px bg-border mx-1" />

          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                onClick={() => {
                  setColor(c);
                  setTool("pen");
                }}
                className={cn(
                  "h-6 w-6 rounded-full border-2 transition-transform",
                  color === c && tool === "pen"
                    ? "border-primary scale-110"
                    : "border-muted"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="h-6 w-px bg-border mx-1" />

          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-24"
            aria-label="Stroke width"
          />

          <div className="flex-1" />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={strokes.length === 0}
          >
            <Undo2 className="h-4 w-4" />
            Undo
          </Button>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={strokes.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear canvas?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will erase your entire sketch. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClear}>
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="rounded-lg border overflow-hidden bg-white touch-none">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full h-auto cursor-crosshair touch-none"
            style={{ maxHeight: "60vh" }}
          />
        </div>
      </div>
    );
  }
);
