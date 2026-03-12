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

export function exportStageToPng(stage: Konva.Stage): void {
  stage.toBlob({
    callback(blob) {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "composition.png";
      a.click();
      URL.revokeObjectURL(url);
    },
  });
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
