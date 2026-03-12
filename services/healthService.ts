import { useQuery } from "@tanstack/react-query";

const isVercel =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";
const BASE_URL = isVercel
  ? "/api-proxy"
  : process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export function useHealthCheck() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/health`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.text();
    },
    refetchInterval: 30_000,
  });
}
