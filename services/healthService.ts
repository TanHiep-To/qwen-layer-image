import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/apiClient";

export function useHealthCheck() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const isVercel =
        process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
        process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL &&
        !process.env.NEXT_PUBLIC_API_BASE_URL.startsWith("http://101")
          ? process.env.NEXT_PUBLIC_API_BASE_URL
          : isVercel
            ? "/api-proxy"
            : "http://localhost:8000";
      return fetch(`${baseUrl}/health`).then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.text();
      });
    },
    refetchInterval: 30_000,
  });
}
