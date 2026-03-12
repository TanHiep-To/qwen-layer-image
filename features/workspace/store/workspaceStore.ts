import { create } from "zustand";
import type { BaseImage, EditHistoryEntry, Layer, LayerTransform, PromptHistoryEntry, ViewMode } from "@/types/domain";

interface WorkspaceState {
  baseImage: BaseImage | null;
  layers: Layer[];
  selectedLayerId: string | null;
  viewMode: ViewMode;
  promptHistory: PromptHistoryEntry[];
  /** Per-layer edit history (prompt + resulting image) */
  editHistory: EditHistoryEntry[];
  /** The working resolution for the canvas (from split layer dimensions) */
  canvasSize: { width: number; height: number } | null;

  numLayers: number;
  splitLayers: Layer[];
  isSplitting: boolean;
  isSplitPreview: boolean;
  showOriginalImage: boolean;

  /** Loading states for API calls */
  isGenerating: boolean;
  isEditingLayer: boolean;
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
  addEditHistory: (entry: EditHistoryEntry) => void;
  restoreEditHistory: (entryId: string) => void;
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
  setIsGenerating: (v: boolean) => void;
  setIsEditingLayer: (v: boolean) => void;
}

const initialState: WorkspaceState = {
  baseImage: null,
  layers: [],
  selectedLayerId: null,
  viewMode: "single",
  promptHistory: [],
  editHistory: [],
  canvasSize: null,
  numLayers: 3,
  splitLayers: [],
  isSplitting: false,
  isSplitPreview: false,
  showOriginalImage: false,
  isGenerating: false,
  isEditingLayer: false,
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

  addEditHistory: (entry) =>
    set((state) => ({
      editHistory: [entry, ...state.editHistory],
    })),

  restoreEditHistory: (entryId) =>
    set((state) => {
      const entry = state.editHistory.find((e) => e.id === entryId);
      if (!entry) return state;
      return {
        layers: state.layers.map((layer) =>
          layer.id === entry.layerId ? { ...layer, dataUrl: entry.dataUrl } : layer,
        ),
      };
    }),

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
  setIsGenerating: (v) => set({ isGenerating: v }),
  setIsEditingLayer: (v) => set({ isEditingLayer: v }),
}));
