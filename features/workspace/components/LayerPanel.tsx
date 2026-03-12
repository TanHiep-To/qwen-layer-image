"use client";

import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceStore } from "@/features/workspace/store/workspaceStore";
import { cn } from "@/lib/utils";

export function LayerPanel() {
  const { layers, selectedLayerId, selectLayer } = useWorkspaceStore();

  return (
    <aside className="flex h-full w-[280px] flex-col overflow-hidden border-l bg-background">
      <div className="border-b p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Layers
        </p>
      </div>

      {layers.length === 0 && (
        <p className="p-4 text-xs text-muted-foreground">
          No layers yet. Split the base image to create layers.
        </p>
      )}

      {layers.length > 0 && !selectedLayerId && (
        <p className="px-4 py-2 text-xs font-medium text-primary">
          Select a layer below to start editing
        </p>
      )}

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-3">
          {layers.map((layer, index) => (
            <button
              key={layer.id}
              onClick={() => selectLayer(layer.id)}
              className={cn(
                "cursor-pointer flex w-full items-center gap-3 rounded-md border p-2 text-left transition-colors hover:bg-muted",
                selectedLayerId === layer.id && "border-primary bg-primary/5",
              )}
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border bg-muted/50">
                <Image
                  src={layer.dataUrl}
                  alt={layer.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{layer.name}</p>
                <Badge variant="outline" className="mt-0.5 text-[10px]">
                  Layer {index + 1}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
