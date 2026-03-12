"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkspaceStore } from "@/features/workspace/store/workspaceStore";
import { useGenerateImage, useEditLayer, splitLayerImageToFile } from "@/services/imageService";
import type { GenerateImageRequest } from "@/types/api";

const ASPECT_RATIOS: GenerateImageRequest["aspect_ratio"][] = [
  "1:1",
  "3:2",
  "2:3",
  "4:3",
  "3:4",
  "16:9",
  "9:16",
];

export function PromptBar() {
  const { baseImage, layers, selectedLayerId, addPromptHistory, updateHistoryImage } =
    useWorkspaceStore();

  const generateMutation = useGenerateImage();
  const editLayerMutation = useEditLayer();

  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<GenerateImageRequest["aspect_ratio"]>("1:1");
  const lastHistoryIdRef = useRef<string | null>(null);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) ?? null;
  const isLoading = generateMutation.isPending || editLayerMutation.isPending;

  // Allow generating when: no layers committed yet (even if baseImage exists from a prior generation)
  const canGenerate = layers.length === 0;
  const canEditLayer = !!selectedLayer;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const trimmedPrompt = prompt.trim();
    const historyId = uuidv4();

    addPromptHistory({
      id: historyId,
      prompt: trimmedPrompt,
      timestamp: Date.now(),
      layerId: selectedLayer?.id,
    });

    if (canEditLayer) {
      // Edit the selected layer
      const file = splitLayerImageToFile(selectedLayer.dataUrl, selectedLayer.name);
      editLayerMutation.mutate({
        layerId: selectedLayer.id,
        input_image: file,
        prompt: trimmedPrompt,
      });
    } else if (canGenerate) {
      // Generate a new base image (works even if baseImage already exists)
      lastHistoryIdRef.current = historyId;
      generateMutation.mutate(
        { prompt: trimmedPrompt, aspect_ratio: aspectRatio },
        {
          onSuccess: () => {
            // After generation succeeds, store the new baseImage in the history entry
            const newBaseImage = useWorkspaceStore.getState().baseImage;
            if (newBaseImage && lastHistoryIdRef.current) {
              updateHistoryImage(lastHistoryIdRef.current, newBaseImage);
            }
          },
        },
      );
    }
    // Do NOT clear prompt — keep old prompt for user convenience
  }

  const placeholder =
    canEditLayer
      ? `Edit "${selectedLayer!.name}" — describe changes…`
      : canGenerate
        ? "Describe an image to generate…"
        : "Select a layer to edit it with AI";

  const isDisabled = isLoading || (!canGenerate && !canEditLayer);

  return (
    <footer className="border-t bg-background p-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Aspect ratio selector (when generating is possible) */}
        {canGenerate && !canEditLayer && (
          <Select
            value={aspectRatio}
            onValueChange={(v) => setAspectRatio(v as GenerateImageRequest["aspect_ratio"])}
          >
            <SelectTrigger className="w-24 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              position="popper"
            >
              <SelectGroup>
                {ASPECT_RATIOS.map((r) => (
                  <SelectItem key={r} value={r!} className="cursor-pointer">
                    {r}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}

        {/* Prompt input */}
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          disabled={isDisabled}
          className="flex-1"
        />

        {/* Submit */}
        <Button
          type="submit"
          disabled={isDisabled || !prompt.trim()}
        >
          <Send className="mr-2 h-4 w-4" />
          {isLoading ? "Working…" : "Send"}
        </Button>
      </form>

      {generateMutation.isError && (
        <p className="mt-1 text-xs text-destructive">
          {(generateMutation.error as Error).message}
        </p>
      )}
      {editLayerMutation.isError && (
        <p className="mt-1 text-xs text-destructive">
          {(editLayerMutation.error as Error).message}
        </p>
      )}
    </footer>
  );
}
