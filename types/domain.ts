export interface LayerTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  hue: number;
  saturation: number;
  brightness: number;
}

export interface Layer {
  id: string;
  name: string;
  dataUrl: string;
  transform: LayerTransform;
  visible: boolean;
}

export interface BaseImage {
  dataUrl: string;
  width: number;
  height: number;
}

export interface PromptHistoryEntry {
  id: string;
  prompt: string;
  timestamp: number;
  layerId?: string;
  /** The base image that was generated/active when this prompt was used */
  baseImage?: BaseImage;
}

export interface EditHistoryEntry {
  id: string;
  layerId: string;
  prompt: string;
  dataUrl: string;
  timestamp: number;
}

export type ViewMode = "single" | "all";
