"use client";

import { useState } from "react";
import { FlipHorizontal2, FlipVertical2, History, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useWorkspaceStore } from "@/features/workspace/store/workspaceStore";
import type { PromptHistoryEntry } from "@/types/domain";

export function Toolbox() {
  const {
    layers,
    selectedLayerId,
    promptHistory,
    updateLayerTransform,
    setBaseImage,
    setLayers,
    setIsSplitPreview,
    setSplitLayers,
    selectLayer,
  } = useWorkspaceStore();

  const [pendingHistoryEntry, setPendingHistoryEntry] = useState<PromptHistoryEntry | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) ?? null;
  const t = selectedLayer?.transform;

  function update(partial: Parameters<typeof updateLayerTransform>[1]) {
    if (!selectedLayerId) return;
    updateLayerTransform(selectedLayerId, partial);
  }

  return (
    <aside className="flex h-full w-[280px] flex-col border-r bg-background">
      {/* Toolbox controls — takes remaining space, scrollable */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Toolbox
          </p>

          {!selectedLayer && (
            <p className="text-xs text-muted-foreground">Select a layer to edit its properties.</p>
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
      </ScrollArea>

      {/* Prompt History — collapsible panel anchored at bottom */}
      <div className="flex shrink-0 flex-col border-t">
        {/* Toggle button — always visible */}
        <button
          className="flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-muted/50"
          onClick={() => setHistoryOpen(!historyOpen)}
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Prompt History
            </span>
            {promptHistory.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {promptHistory.length}
              </Badge>
            )}
          </div>
          <ChevronUp
            className={`h-4 w-4 text-muted-foreground transition-transform ${historyOpen ? "" : "rotate-180"}`}
          />
        </button>

        {/* Expandable history content */}
        {historyOpen && (
          <div className="border-t">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 p-3">
                {promptHistory.length === 0 && (
                  <p className="text-xs text-muted-foreground">No prompts yet.</p>
                )}
                {promptHistory.map((entry) => (
                  <button
                    key={entry.id}
                    className="w-full cursor-pointer rounded-md border p-2 text-left transition-colors hover:bg-muted/50"
                    onClick={() => handleHistoryClick(entry)}
                  >
                    <p className="text-xs">{entry.prompt}</p>
                    {entry.baseImage && (
                      <div className="mt-1.5 overflow-hidden rounded border bg-muted/30">
                        <img
                          src={entry.baseImage.dataUrl}
                          alt="Generated"
                          className="h-20 w-full object-contain"
                        />
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                      {entry.layerId && (
                        <Badge variant="secondary" className="text-[10px]">
                          Layer edit
                        </Badge>
                      )}
                      {entry.baseImage && (
                        <Badge variant="outline" className="text-[10px]">
                          Generated
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Warning dialog when clicking history during editing */}
      <Dialog open={!!pendingHistoryEntry} onOpenChange={(open) => { if (!open) setPendingHistoryEntry(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard current editing?</DialogTitle>
            <DialogDescription>
              You are currently editing layers. Jumping to this history item will discard your current editing progress. Do you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingHistoryEntry(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (pendingHistoryEntry?.baseImage) {
                  jumpToHistoryImage(pendingHistoryEntry);
                }
                setPendingHistoryEntry(null);
              }}
            >
              Discard & Jump
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );

  function handleHistoryClick(entry: PromptHistoryEntry) {
    if (!entry.baseImage) return;

    const isEditing = layers.length > 0;
    if (isEditing) {
      setPendingHistoryEntry(entry);
    } else {
      jumpToHistoryImage(entry);
    }
  }

  function jumpToHistoryImage(entry: PromptHistoryEntry) {
    if (!entry.baseImage) return;
    setLayers([]);
    setSplitLayers([]);
    setIsSplitPreview(false);
    selectLayer(null);
    setBaseImage(entry.baseImage);
  }
}
