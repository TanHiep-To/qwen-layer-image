"use client";

import { FlipHorizontal2, FlipVertical2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";
import { useWorkspaceStore } from "@/features/workspace/store/workspaceStore";
import { useSplitLayers } from "@/services/imageService";
import { dataUrlToFile } from "@/utils/base64";

export function Toolbox() {
  const {
    baseImage,
    layers,
    selectedLayerId,
    promptHistory,
    updateLayerTransform,
    numLayers,
    setNumLayers,
    isSplitting,
    isSplitPreview,
  } = useWorkspaceStore();

  const splitMutation = useSplitLayers();

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) ?? null;
  const t = selectedLayer?.transform;

  const showSplitControls = !!baseImage && layers.length === 0 && !isSplitPreview;

  function handleSplitConfirm() {
    if (!baseImage) return;
    const file = dataUrlToFile(baseImage.dataUrl, "base_image.png");
    splitMutation.mutate({ input_image: file, num_layers: numLayers });
  }

  function update(partial: Parameters<typeof updateLayerTransform>[1]) {
    if (!selectedLayerId) return;
    updateLayerTransform(selectedLayerId, partial);
  }

  return (
    <aside className="flex h-full w-[280px] flex-col overflow-hidden border-r bg-background">
      <div className="p-4">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Toolbox
        </p>

        {!selectedLayer && !showSplitControls && (
          <p className="text-xs text-muted-foreground">Select a layer to edit its properties.</p>
        )}

        {showSplitControls && (
          <div className="space-y-4 rounded-md border p-3 bg-muted/20">
            <div>
              <Label className="mb-2 block text-xs font-medium text-muted-foreground">
                Layers to Split
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setNumLayers(Math.max(2, numLayers - 1))}
                  disabled={numLayers <= 2 || isSplitting}
                >
                  -
                </Button>
                <span className="w-4 text-center text-sm font-medium">{numLayers}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setNumLayers(Math.min(6, numLayers + 1))}
                  disabled={numLayers >= 6 || isSplitting}
                >
                  +
                </Button>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleSplitConfirm}
              disabled={isSplitting}
            >
              <Layers className="mr-2 h-4 w-4" />
              {isSplitting ? "Splitting layers..." : "Split Layers"}
            </Button>
          </div>
        )}

        {selectedLayer && (
          <div className="space-y-5">
            {/* Translate */}
            <section>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Translate</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="mb-1 text-xs">X</Label>
                  <Input
                    type="number"
                    value={t!.x}
                    onChange={(e) => update({ x: Number(e.target.value) })}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="mb-1 text-xs">Y</Label>
                  <Input
                    type="number"
                    value={t!.y}
                    onChange={(e) => update({ y: Number(e.target.value) })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* Scale */}
            <section>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Scale</p>
              <div className="space-y-2">
                <div>
                  <Label className="mb-1 text-xs">Scale X ({t!.scaleX.toFixed(2)})</Label>
                  <Slider
                    min={0.1}
                    max={3}
                    step={0.01}
                    value={[Math.abs(t!.scaleX)]}
                    onValueChange={([v]) => update({ scaleX: t!.flipX ? -v : v })}
                  />
                </div>
                <div>
                  <Label className="mb-1 text-xs">Scale Y ({t!.scaleY.toFixed(2)})</Label>
                  <Slider
                    min={0.1}
                    max={3}
                    step={0.01}
                    value={[Math.abs(t!.scaleY)]}
                    onValueChange={([v]) => update({ scaleY: t!.flipY ? -v : v })}
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* Rotation */}
            <section>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Rotation ({t!.rotation}°)
              </p>
              <Slider
                min={-180}
                max={180}
                step={1}
                value={[t!.rotation]}
                onValueChange={([v]) => update({ rotation: v })}
              />
            </section>

            <Separator />

            {/* Flip */}
            <section>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Flip</p>
              <div className="flex gap-2">
                <Button
                  variant={t!.flipX ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    const newFlipX = !t!.flipX;
                    update({ flipX: newFlipX, scaleX: newFlipX ? -Math.abs(t!.scaleX) : Math.abs(t!.scaleX) });
                  }}
                >
                  <FlipHorizontal2 className="mr-1 h-4 w-4" /> Horizontal
                </Button>
                <Button
                  variant={t!.flipY ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    const newFlipY = !t!.flipY;
                    update({ flipY: newFlipY, scaleY: newFlipY ? -Math.abs(t!.scaleY) : Math.abs(t!.scaleY) });
                  }}
                >
                  <FlipVertical2 className="mr-1 h-4 w-4" /> Vertical
                </Button>
              </div>
            </section>

            <Separator />

            {/* Color Adjustments */}
            <section>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Color Adjustments</p>
              <div className="space-y-2">
                <div>
                  <Label className="mb-1 text-xs">Hue ({t!.hue}°)</Label>
                  <Slider
                    min={-180}
                    max={180}
                    step={1}
                    value={[t!.hue]}
                    onValueChange={([v]) => update({ hue: v })}
                  />
                </div>
                <div>
                  <Label className="mb-1 text-xs">Saturation ({t!.saturation.toFixed(2)})</Label>
                  <Slider
                    min={-2}
                    max={2}
                    step={0.01}
                    value={[t!.saturation]}
                    onValueChange={([v]) => update({ saturation: v })}
                  />
                </div>
                <div>
                  <Label className="mb-1 text-xs">Brightness ({t!.brightness.toFixed(2)})</Label>
                  <Slider
                    min={-1}
                    max={1}
                    step={0.01}
                    value={[t!.brightness]}
                    onValueChange={([v]) => update({ brightness: v })}
                  />
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      <Separator />

      {/* Prompt History */}
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Prompt History
        </p>
        <ScrollArea className="flex-1">
          {promptHistory.length === 0 && (
            <p className="text-xs text-muted-foreground">No prompts yet.</p>
          )}
          <div className="space-y-2">
            {promptHistory.map((entry) => (
              <div key={entry.id} className="rounded-md border p-2">
                <p className="text-xs">{entry.prompt}</p>
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  {entry.layerId && (
                    <Badge variant="secondary" className="text-[10px]">
                      Layer edit
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
