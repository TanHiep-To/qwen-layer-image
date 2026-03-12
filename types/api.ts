export interface GenerateImageResponse {
  image: string; // base64 encoded RGB
}

export interface SplitLayersResponse {
  layers: string[]; // array of base64 encoded RGBA PNG layers
}

export interface EditLayerResponse {
  image: string; // base64 encoded RGBA PNG
}

export interface GenerateImageRequest {
  prompt: string;
  aspect_ratio?: "1:1" | "3:2" | "2:3" | "4:3" | "3:4" | "16:9" | "9:16";
}

export interface SplitLayersRequest {
  input_image: File;
  num_layers?: number;
}

export interface EditLayerRequest {
  input_image: File;
  prompt: string;
}
