"use client";

import { useRef } from "react";
import type Konva from "konva";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/features/workspace/store/workspaceStore";
import { useSplitLayers } from "@/services/imageService";
import { dataUrlToFile } from "@/utils/base64";
import { WorkspaceCanvas } from "./WorkspaceCanvas";
import { TopNav } from "./TopNav";

export function Workspace() {
  const stageRef = useRef<Konva.Stage>(null);
  const { baseImage, numLayers, splitLayers, setLayers, setIsSplitPreview, isSplitPreview, isSplitting } = useWorkspaceStore();
  const splitMutation = useSplitLayers();

  function handleReSplit() {
    if (!baseImage) return;
    const file = dataUrlToFile(baseImage.dataUrl, "base_image.png");
    splitMutation.mutate({ input_image: file, num_layers: numLayers });
  }

  function handleStartEditing() {
    // Commit the split layers into normal layers array
    setLayers(splitLayers);
    setIsSplitPreview(false);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopNav stageRef={stageRef} />

      <div className="relative flex-1 overflow-hidden">
        <WorkspaceCanvas stageRef={stageRef} />

        {isSplitPreview && (
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3 rounded-full bg-background/80 p-2 shadow-lg backdrop-blur-md">
            <Button
              variant="outline"
              onClick={handleReSplit}
              disabled={isSplitting}
            >
              Re-Split
            </Button>
            <Button
              onClick={handleStartEditing}
              disabled={isSplitting}
            >
              Start Editing
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
