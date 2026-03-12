import type Konva from "konva";
import type { LayerTransform } from "@/types/domain";

export function identityTransform(): LayerTransform {
  return {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    flipX: false,
    flipY: false,
    hue: 0,
    saturation: 0,
    brightness: 0,
  };
}

/**
 * Export the stage to PNG cropped to the original image region.
 * @param stage    Konva stage
 * @param imgWidth  Original base image width (pixels)
 * @param imgHeight Original base image height (pixels)
 */
export function exportStageToPng(
  stage: Konva.Stage,
  imgWidth?: number,
  imgHeight?: number,
): void {
  const stageWidth = stage.width();
  const stageHeight = stage.height();

  // If original image dimensions are provided, export only the image region
  // The image/layers are centered in the stage, so the region is:
  const exportW = imgWidth || stageWidth;
  const exportH = imgHeight || stageHeight;
  const exportX = (stageWidth - exportW) / 2;
  const exportY = (stageHeight - exportH) / 2;

  // Hide all transformers before export so bounding boxes don't appear
  const transformers = stage.find("Transformer");
  transformers.forEach((t) => t.visible(false));
  stage.batchDraw();

  // Render the image region at 1:1 pixel ratio (original resolution)
  const pixelRatio = 1;
  const stageCanvas = stage.toCanvas({
    x: exportX,
    y: exportY,
    width: exportW,
    height: exportH,
    pixelRatio,
  });

  // Restore transformers immediately
  transformers.forEach((t) => t.visible(true));
  stage.batchDraw();

  // Output canvas at original image dimensions
  const offscreen = document.createElement("canvas");
  offscreen.width = exportW;
  offscreen.height = exportH;
  const ctx = offscreen.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(stageCanvas, 0, 0, exportW, exportH);

  offscreen.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "composition.png";
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

export function getKonvaFilters(transform: LayerTransform): {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: any[];
  hue: number;
  saturation: number;
  luminance: number;
} {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const KonvaRaw = require("konva");
  const Konva = (KonvaRaw.default ?? KonvaRaw) as typeof import("konva").default;
  const needsHsl =
    transform.hue !== 0 || transform.saturation !== 0 || transform.brightness !== 0;

  return {
    filters: needsHsl ? [Konva.Filters.HSL] : [],
    hue: transform.hue,
    saturation: transform.saturation,
    luminance: transform.brightness,
  };
}
