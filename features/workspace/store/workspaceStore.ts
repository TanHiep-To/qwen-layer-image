import { create } from "zustand";
import type { BaseImage, Layer, LayerTransform, PromptHistoryEntry, ViewMode } from "@/types/domain";

interface WorkspaceState {
  baseImage: BaseImage | null;
  layers: Layer[];
  selectedLayerId: string | null;
  viewMode: ViewMode;
  promptHistory: PromptHistoryEntry[];
  /** The working resolution for the canvas (from split layer dimensions) */
  canvasSize: { width: number; height: number } | null;

  numLayers: number;
  splitLayers: Layer[];
  isSplitting: boolean;
  isSplitPreview: boolean;
  showOriginalImage: boolean;
}

interface WorkspaceActions {
  setBaseImage: (image: BaseImage | null) => void;
  setLayers: (layers: Layer[]) => void;
  selectLayer: (id: string | null) => void;
  updateLayerTransform: (id: string, transform: Partial<LayerTransform>) => void;
  updateLayerDataUrl: (id: string, dataUrl: string) => void;
  setViewMode: (mode: ViewMode) => void;
  addPromptHistory: (entry: PromptHistoryEntry) => void;
  updateHistoryImage: (historyId: string, image: BaseImage) => void;
  reset: () => void;
  /** Reset flow back to step 1 but keep prompt history */
  resetFlow: () => void;
  setCanvasSize: (size: { width: number; height: number } | null) => void;

  // Split Layers Actions
  setNumLayers: (num: number) => void;
  setSplitLayers: (layers: Layer[]) => void;
  setIsSplitting: (isSplitting: boolean) => void;
  setIsSplitPreview: (isPreview: boolean) => void;
  setShowOriginalImage: (show: boolean) => void;
}

const initialState: WorkspaceState = {
  baseImage: null,
  layers: [],
  selectedLayerId: null,
  viewMode: "single",
  promptHistory: [],
  canvasSize: null,
  numLayers: 3,
  splitLayers: [],
  isSplitting: false,
  isSplitPreview: false,
  showOriginalImage: false,
};

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>((set) => ({
  ...initialState,

  setBaseImage: (image) => set({ baseImage: image }),

  setLayers: (layers) => set({ layers }),

  selectLayer: (id) => set({ selectedLayerId: id }),

  updateLayerTransform: (id, partial) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, transform: { ...layer.transform, ...partial } } : layer,
      ),
    })),

  updateLayerDataUrl: (id, dataUrl) =>
    set((state) => ({
      layers: state.layers.map((layer) => (layer.id === id ? { ...layer, dataUrl } : layer)),
    })),

  setViewMode: (mode) => set({ viewMode: mode }),

  addPromptHistory: (entry) =>
    set((state) => ({
      promptHistory: [entry, ...state.promptHistory],
    })),

  updateHistoryImage: (historyId, image) =>
    set((state) => ({
      promptHistory: state.promptHistory.map((entry) =>
        entry.id === historyId ? { ...entry, baseImage: image } : entry,
      ),
    })),

  reset: () => set(initialState),

  resetFlow: () =>
    set((state) => ({
      ...initialState,
      promptHistory: state.promptHistory,
    })),

  setCanvasSize: (size) => set({ canvasSize: size }),

  setNumLayers: (num) => set({ numLayers: num }),
  setSplitLayers: (layers) => set({ splitLayers: layers }),
  setIsSplitting: (isSplitting) => set({ isSplitting }),
  setIsSplitPreview: (isSplitPreview) => set({ isSplitPreview }),
  setShowOriginalImage: (show: boolean) => set({ showOriginalImage: show }),
}));
