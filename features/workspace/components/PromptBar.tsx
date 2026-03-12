"use client";

import { useState } from "react";
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
  const { baseImage, layers, selectedLayerId, addPromptHistory } =
    useWorkspaceStore();

  const generateMutation = useGenerateImage();
  const editLayerMutation = useEditLayer();

  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<GenerateImageRequest["aspect_ratio"]>("1:1");

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) ?? null;
  const isLoading = generateMutation.isPending || editLayerMutation.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const trimmedPrompt = prompt.trim();

    addPromptHistory({
      id: uuidv4(),
      prompt: trimmedPrompt,
      timestamp: Date.now(),
      layerId: selectedLayer?.id,
    });

    if (!baseImage) {
      // Generate a new base image
      generateMutation.mutate({ prompt: trimmedPrompt, aspect_ratio: aspectRatio });
    } else if (selectedLayer) {
      // Edit the selected layer
      const file = splitLayerImageToFile(selectedLayer.dataUrl, selectedLayer.name);
      editLayerMutation.mutate({
        layerId: selectedLayer.id,
        input_image: file,
        prompt: trimmedPrompt,
      });
    }

    setPrompt("");
  }

  const placeholder =
    selectedLayer
      ? `Edit "${selectedLayer.name}" — describe changes…`
      : baseImage
        ? "Select a layer to edit it with AI"
        : "Describe an image to generate…";

  return (
    <footer className="border-t bg-background p-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Aspect ratio selector (only when no base image) */}
        {!baseImage && (
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
          disabled={isLoading || (!!baseImage && !selectedLayer && layers.length > 0)}
          className="flex-1"
        />

        {/* Submit */}
        <Button
          type="submit"
          disabled={
            isLoading ||
            !prompt.trim() ||
            (!!baseImage && !selectedLayer && layers.length > 0)
          }
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
