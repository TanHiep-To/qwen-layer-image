import { useMutation } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { postMultipart } from "@/lib/apiClient";
import { useWorkspaceStore } from "@/features/workspace/store/workspaceStore";
import { base64ToDataUrl, dataUrlToFile, getImageDimensions } from "@/utils/base64";
import { identityTransform } from "@/utils/canvas";
import type {
  EditLayerRequest,
  EditLayerResponse,
  GenerateImageRequest,
  GenerateImageResponse,
  SplitLayersRequest,
  SplitLayersResponse,
} from "@/types/api";

export function useGenerateImage() {
  const { setBaseImage, setIsGenerating } = useWorkspaceStore();

  return useMutation({
    mutationFn: async ({ prompt, aspect_ratio }: GenerateImageRequest) => {
      const form = new FormData();
      form.append("prompt", prompt);
      if (aspect_ratio) form.append("aspect_ratio", aspect_ratio);
      return postMultipart<GenerateImageResponse>("/api/generate", form);
    },
    onMutate: () => {
      setIsGenerating(true);
    },
    onSettled: () => {
      setIsGenerating(false);
    },
    onSuccess: async (data) => {
      const dataUrl = base64ToDataUrl(data.image, "image/png");
      const { width, height } = await getImageDimensions(dataUrl);
      setBaseImage({ dataUrl, width, height });
    },
  });
}

export function useSplitLayers() {
  const { setSplitLayers, setIsSplitting, setIsSplitPreview, setCanvasSize } = useWorkspaceStore();

  return useMutation({
    mutationFn: async ({ input_image, num_layers }: SplitLayersRequest) => {
      const form = new FormData();
      form.append("input_image", input_image);
      if (num_layers != null) form.append("num_layers", String(num_layers));
      return postMultipart<SplitLayersResponse>("/api/split-layers", form);
    },
    onMutate: () => {
      setIsSplitting(true);
    },
    onSettled: () => {
      setIsSplitting(false);
    },
    onSuccess: async (data) => {
      const layers = data.layers.map((b64, index) => ({
        id: uuidv4(),
        name: `Layer ${index + 1}`,
        dataUrl: base64ToDataUrl(b64, "image/png"),
        transform: identityTransform(),
        visible: true,
      }));
      setSplitLayers(layers);
      setIsSplitPreview(true);

      // Determine working canvas size from the first layer's dimensions
      if (layers.length > 0) {
        const dims = await getImageDimensions(layers[0].dataUrl);
        setCanvasSize({ width: dims.width, height: dims.height });
      }
    },
  });
}

export function useEditLayer() {
  const { updateLayerDataUrl, setIsEditingLayer, addEditHistory } = useWorkspaceStore();

  return useMutation({
    mutationFn: async ({
      layerId,
      input_image,
      prompt,
    }: EditLayerRequest & { layerId: string }) => {
      const form = new FormData();
      form.append("input_image", input_image);
      form.append("prompt", prompt);
      const data = await postMultipart<EditLayerResponse>("/api/edit-layer", form);
      return { data, layerId, prompt };
    },
    onMutate: () => {
      setIsEditingLayer(true);
    },
    onSettled: () => {
      setIsEditingLayer(false);
    },
    onSuccess: ({ data, layerId, prompt }) => {
      const dataUrl = base64ToDataUrl(data.image, "image/png");
      updateLayerDataUrl(layerId, dataUrl);
      addEditHistory({
        id: uuidv4(),
        layerId,
        prompt,
        dataUrl,
        timestamp: Date.now(),
      });
    },
  });
}

export function splitLayerImageToFile(dataUrl: string, layerName: string): File {
  return dataUrlToFile(dataUrl, `${layerName}.png`);
}
