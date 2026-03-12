"use client";

import { useRef } from "react";
import type Konva from "konva";
import { Layers, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useWorkspaceStore } from "@/features/workspace/store/workspaceStore";
import { useSplitLayers } from "@/services/imageService";
import { dataUrlToFile } from "@/utils/base64";
import { identityTransform } from "@/utils/canvas";
import { v4 as uuidv4 } from "uuid";
import { WorkspaceCanvas } from "./WorkspaceCanvas";
import { TopNav } from "./TopNav";

export function Workspace() {
  const stageRef = useRef<Konva.Stage>(null);
  const {
    baseImage,
    numLayers,
    splitLayers,
    layers,
    setLayers,
    setNumLayers,
    setIsSplitPreview,
    setCanvasSize,
    isSplitPreview,
    isSplitting,
  } = useWorkspaceStore();
  const splitMutation = useSplitLayers();

  const showSplitControls = !!baseImage && layers.length === 0 && !isSplitPreview && !isSplitting;

  function handleSplit() {
    if (!baseImage) return;
    const file = dataUrlToFile(baseImage.dataUrl, "base_image.png");
    splitMutation.mutate({ input_image: file, num_layers: numLayers });
  }

  function handleReSplit() {
    handleSplit();
  }

  function handleStartEditing() {
    if (isSplitPreview && splitLayers.length > 0) {
      // Commit the split layers into normal layers array
      setLayers(splitLayers);
      setIsSplitPreview(false);
    } else if (baseImage && layers.length === 0) {
      // Start editing with the current image as a single layer
      setCanvasSize({ width: baseImage.width, height: baseImage.height });
      setLayers([
        {
          id: uuidv4(),
          name: "Layer 1",
          dataUrl: baseImage.dataUrl,
          transform: identityTransform(),
          visible: true,
        },
      ]);
      setIsSplitPreview(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopNav stageRef={stageRef} />

      <div className="relative flex-1 overflow-hidden">
        <WorkspaceCanvas stageRef={stageRef} />

        {/* Center controls: split + start editing (before splitting) */}
        {showSplitControls && (
          <div className="absolute inset-x-0 bottom-6 flex justify-center">
            <div className="flex items-center gap-3 rounded-full bg-background/80 px-4 py-2 shadow-lg backdrop-blur-md">
              {/* Split layer controls */}
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-muted-foreground">Layers:</Label>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setNumLayers(Math.max(2, numLayers - 1))}
                  disabled={numLayers <= 2}
                >
                  -
                </Button>
                <span className="w-4 text-center text-sm font-medium">{numLayers}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setNumLayers(Math.min(6, numLayers + 1))}
                  disabled={numLayers >= 6}
                >
                  +
                </Button>
                <Button size="sm" onClick={handleSplit}>
                  <Layers className="mr-1.5 h-4 w-4" />
                  Split Layers
                </Button>
              </div>

              <div className="mx-1 h-6 w-px bg-border" />

              <Button size="sm" variant="outline" onClick={handleStartEditing}>
                <Play className="mr-1.5 h-4 w-4" />
                Start Editing
              </Button>
            </div>
          </div>
        )}

        {/* Controls after split preview */}
        {isSplitPreview && (
          <div className="absolute inset-x-0 bottom-6 flex justify-center">
            <div className="flex items-center gap-3 rounded-full bg-background/80 px-4 py-2 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-muted-foreground">Layers:</Label>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setNumLayers(Math.max(2, numLayers - 1))}
                  disabled={numLayers <= 2 || isSplitting}
                >
                  -
                </Button>
                <span className="w-4 text-center text-sm font-medium">{numLayers}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setNumLayers(Math.min(6, numLayers + 1))}
                  disabled={numLayers >= 6 || isSplitting}
                >
                  +
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReSplit}
                  disabled={isSplitting}
                >
                  Re-Split
                </Button>
              </div>

              <div className="mx-1 h-6 w-px bg-border" />

              <Button
                size="sm"
                onClick={handleStartEditing}
                disabled={isSplitting}
              >
                <Play className="mr-1.5 h-4 w-4" />
                Start Editing
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
