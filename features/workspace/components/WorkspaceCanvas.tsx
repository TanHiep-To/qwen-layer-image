"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type Konva from "konva";
import { Upload } from "lucide-react";
import { useWorkspaceStore } from "@/features/workspace/store/workspaceStore";
import { getKonvaFilters } from "@/utils/canvas";
import { fileToDataUrl, getImageDimensions } from "@/utils/base64";
import type { Layer as DomainLayer } from "@/types/domain";

let Stage: typeof import("react-konva").Stage;
let KonvaLayer: typeof import("react-konva").Layer;
let Image: typeof import("react-konva").Image;
let Transformer: typeof import("react-konva").Transformer;

if (typeof window !== "undefined") {
  const rk = require("react-konva");
  Stage = rk.Stage;
  KonvaLayer = rk.Layer;
  Image = rk.Image;
  Transformer = rk.Transformer;
}

function UploadZone() {
  const { setBaseImage } = useWorkspaceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const dataUrl = await fileToDataUrl(file);
    const { width, height } = await getImageDimensions(dataUrl);
    setBaseImage({ dataUrl, width, height });
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  return (
    <div
      className={`absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed transition-colors ${
        isDragOver
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/30 bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center gap-2 text-center">
        <Upload className="h-10 w-10 text-muted-foreground" />
        <p className="text-base font-medium text-muted-foreground">
          Drop an image here or click to browse
        </p>
        <p className="text-xs text-muted-foreground/70">
          Or generate one with a prompt below
        </p>
      </div>
    </div>
  );
}

function useImage(src: string | null): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) {
      setImg(null);
      return;
    }
    const el = new window.Image();
    el.crossOrigin = "anonymous";
    el.onload = () => setImg(el);
    el.src = src;
  }, [src]);
  return img;
}

interface LayerNodeProps {
  layer: DomainLayer;
  isSelected: boolean;
  stageWidth: number;
  stageHeight: number;
  onSelect: () => void;
  onTransformEnd: (id: string, attrs: Partial<DomainLayer["transform"]>) => void;
  overrideFrame?: { x: number; y: number; width: number; height: number };
}

function LayerNode({
  layer,
  isSelected,
  stageWidth,
  stageHeight,
  onSelect,
  onTransformEnd,
  overrideFrame,
}: LayerNodeProps) {
  const nodeRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const img = useImage(layer.dataUrl);
  const { filters, hue, saturation, luminance } = getKonvaFilters(layer.transform);

  useEffect(() => {
    if (isSelected && transformerRef.current && nodeRef.current) {
      transformerRef.current.nodes([nodeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    if (img && nodeRef.current) {
      nodeRef.current.cache();
    }
  }, [img]);

  if (!img) return null;

  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  // Center-based positioning: x/y refer to image center (offset shifts draw origin)
  const defaultX = stageWidth / 2;
  const defaultY = stageHeight / 2;

  let { x, y, scaleX, scaleY, rotation } = layer.transform;

  let finalX = x !== 0 || y !== 0 ? x : defaultX;
  let finalY = x !== 0 || y !== 0 ? y : defaultY;
  let finalScaleX = scaleX;
  let finalScaleY = scaleY;

  if (overrideFrame) {
    // overrideFrame uses top-left coords; convert to center
    finalX = overrideFrame.x + overrideFrame.width / 2;
    finalY = overrideFrame.y + overrideFrame.height / 2;
    finalScaleX = overrideFrame.width / imgW;
    finalScaleY = overrideFrame.height / imgH;
    rotation = 0; // reset rotation for comparison
  }

  function handleDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
    onTransformEnd(layer.id, { x: e.target.x(), y: e.target.y() });
  }

  function handleTransformEnd(e: Konva.KonvaEventObject<Event>) {
    const node = e.target as Konva.Image;
    onTransformEnd(layer.id, {
      x: node.x(),
      y: node.y(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
      rotation: node.rotation(),
    });
  }    

  const normedHue  = hue >= 0 ? hue : 360 + hue;
  const normedSaturation = saturation / 2;
  const normedLuminance =  luminance;

  return (
    <>
      <Image
        ref={nodeRef}
        image={img}
        x={finalX}
        y={finalY}
        offsetX={imgW / 2}
        offsetY={imgH / 2}
        scaleX={finalScaleX}
        scaleY={finalScaleY}
        rotation={rotation}
        draggable={isSelected && !overrideFrame}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        filters={filters}
        hue={normedHue}
        saturation={normedSaturation}
        luminance={normedLuminance}
        listening={true}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

interface WorkspaceCanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

export function WorkspaceCanvas({ stageRef }: WorkspaceCanvasProps) {
  const {
    layers,
    selectedLayerId,
    viewMode,
    baseImage,
    selectLayer,
    updateLayerTransform,
    isSplitPreview,
    splitLayers,
    isSplitting,
    numLayers,
    showOriginalImage
  } = useWorkspaceStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const baseImg = useImage(baseImage?.dataUrl ?? null);

  const handleTransformEnd = useCallback(
    (id: string, attrs: Partial<DomainLayer["transform"]>) => {
      updateLayerTransform(id, attrs);
    },
    [updateLayerTransform],
  );

  const visibleLayers =
    viewMode === "all"
      ? layers.filter((l) => l.visible)
      : layers.filter((l) => l.id === selectedLayerId);

  const showBase = layers.length === 0;

  if (!mounted) {
    return (
      <div ref={containerRef} className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading canvas…</p>
      </div>
    );
  }

  if (isSplitting) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">Splitting image into {numLayers} layers. This may take a minute...</p>
      </div>
    );
  }

  if (isSplitPreview) {
    return (
      <div className="flex h-full w-full items-center justify-center overflow-auto bg-muted/30 p-8">
        <div className="mx-auto grid w-full max-w-[900px] gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          {splitLayers.map((layer, index) => (
            <div key={layer.id} className="flex flex-col overflow-hidden rounded-lg border bg-background shadow-sm">
              <div className="border-b bg-muted/50 px-3 py-1.5">
                <p className="text-xs font-medium">Layer {index + 1}</p>
              </div>
              <div className="relative aspect-square w-full bg-transparent p-2">
                <img
                  src={layer.dataUrl}
                  alt={`Layer ${index + 1}`}
                  className="h-full w-full object-contain drop-shadow-sm"
                  crossOrigin="anonymous"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isTopBottom = viewMode === "all" && showOriginalImage && baseImage && layers.length > 0;
  const topBottomSpacing = 20;
  const imgWidth = baseImg ? (baseImg.naturalWidth || baseImg.width || 400) : 400;
  const imgHeight = baseImg ? (baseImg.naturalHeight || baseImg.height || 400) : 400;

  const requiredHeight = imgHeight * 2 + topBottomSpacing;
  const requiredWidth = imgWidth;

  const padding = 20;
  const availableWidth = size.width - padding * 2;
  const availableHeight = size.height - padding * 2;

  let scaleFactor = 1;
  if (isTopBottom) {
    const scaleX = availableWidth / requiredWidth;
    const scaleY = availableHeight / requiredHeight;
    scaleFactor = Math.min(scaleX, scaleY, 1);
  }

  const scaledImgWidth = imgWidth * scaleFactor;
  const scaledImgHeight = imgHeight * scaleFactor;

  const totalScaledHeight = scaledImgHeight * 2 + topBottomSpacing;

  const centerX = (size.width - scaledImgWidth) / 2;
  const startY = (size.height - totalScaledHeight) / 2;

  const editedY = startY;
  const originalY = startY + scaledImgHeight + topBottomSpacing;

  return (
    <div ref={containerRef} className="flex h-full w-full flex-col bg-muted/30">
      <div className="relative flex-1 overflow-hidden">
        {Stage && KonvaLayer && (
          <Stage
            ref={stageRef as React.RefObject<Konva.Stage>}
            width={size.width}
            height={size.height}
            onClick={(e) => {
              if (e.target === e.target.getStage()) selectLayer(null);
            }}
          >
            <KonvaLayer>
              {isTopBottom && baseImg && (
                <Image
                  image={baseImg}
                  x={centerX}
                  y={originalY}
                  scaleX={scaleFactor}
                  scaleY={scaleFactor}
                  listening={false}
                />
              )}

              {showBase && baseImg && !isTopBottom && (
                <Image
                  image={baseImg}
                  x={(size.width - imgWidth) / 2}
                  y={(size.height - imgHeight) / 2}
                  listening={false}
                />
              )}
              {visibleLayers.map((layer) => {
                const overrideFrame = isTopBottom ? {
                  x: centerX,
                  y: editedY,
                  width: scaledImgWidth,
                  height: scaledImgHeight,
                } : undefined;

                return (
                  <LayerNode
                    key={layer.id}
                    layer={layer}
                    isSelected={layer.id === selectedLayerId}
                    stageWidth={size.width}
                    stageHeight={size.height}
                    onSelect={() => selectLayer(layer.id)}
                    onTransformEnd={handleTransformEnd}
                    overrideFrame={overrideFrame}
                  />
                );
              })}
            </KonvaLayer>
          </Stage>
        )}
        {!baseImg && layers.length === 0 && !isSplitting && !isSplitPreview && (
          <UploadZone />
        )}
      </div>
    </div>
  );
}
