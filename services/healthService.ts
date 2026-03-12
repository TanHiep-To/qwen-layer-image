import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/apiClient";

export function useHealthCheck() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/health`)
        .then( (res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.text();
        })
    },
    refetchInterval: 30_000,
  });
}
