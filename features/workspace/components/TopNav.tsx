"use client";

import type Konva from "konva";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspaceStore } from "@/features/workspace/store/workspaceStore";
import { exportStageToPng } from "@/utils/canvas";
import type { ViewMode } from "@/types/domain";
import { useHealthCheck } from "@/services/healthService";
import { DownloadIcon, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopNavProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

export function TopNav({ stageRef }: TopNavProps) {
  const { viewMode, setViewMode, showOriginalImage, setShowOriginalImage, resetFlow, canvasSize } = useWorkspaceStore();
  const { data, isError } = useHealthCheck();

  const health = data === 'Healthcheck: OK'

  function handleDownload() {
    if (stageRef.current) {
      exportStageToPng(stageRef.current, canvasSize?.width, canvasSize?.height);
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold tracking-tight">AI Image Editor</span>
        <span
          className={`inline-block h-2 w-2 rounded-full ${isError ? "bg-destructive" : health ? "bg-green-500" : "bg-yellow-400"
            }`}
          title={isError ? "Backend offline" : health ? "Backend online" : "Checking…"}
        />
      </div>

      <div className="flex flex-1 items-center justify-center gap-4">
        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as ViewMode)}
        >
          <TabsList>
            <TabsTrigger value="single" className="cursor-pointer">Single Layer</TabsTrigger>
            <TabsTrigger value="all" className="cursor-pointer">All Layers</TabsTrigger>
          </TabsList>
        </Tabs>


        <label className={cn("flex cursor-pointer items-center gap-2 rounded-md border bg-muted/30",
          "px-3 py-1.5 text-sm font-medium hover:bg-muted/50 transition-colors",
          viewMode === "all" ? "" : "invisible"
          )}>
          <input
            type="checkbox"
            checked={showOriginalImage}
            onChange={(e) => setShowOriginalImage(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 cursor-pointer"
          />
          <span>Show Original</span>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <DownloadIcon className="mr-2 h-4 w-4" />
          <b>Download</b>
        </Button>
        <Button variant="outline" size="sm" onClick={resetFlow} title="Start again from the beginning">
          <RotateCcw className="mr-2 h-4 w-4" />
          Start Again
        </Button>
      </div>
    </header>
  );
}
