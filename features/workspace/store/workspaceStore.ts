import { create } from "zustand";
import type { BaseImage, Layer, LayerTransform, PromptHistoryEntry, ViewMode } from "@/types/domain";

interface WorkspaceState {
  baseImage: BaseImage | null;
  layers: Layer[];
  selectedLayerId: string | null;
  viewMode: ViewMode;
  promptHistory: PromptHistoryEntry[];

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
  reset: () => void;

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

  reset: () => set(initialState),

  setNumLayers: (num) => set({ numLayers: num }),
  setSplitLayers: (layers) => set({ splitLayers: layers }),
  setIsSplitting: (isSplitting) => set({ isSplitting }),
  setIsSplitPreview: (isSplitPreview) => set({ isSplitPreview }),
  setShowOriginalImage: (show: boolean) => set({ showOriginalImage: show }),
}));
