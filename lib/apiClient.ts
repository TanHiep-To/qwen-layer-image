const isVercel =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";
// On Vercel, always use the proxy to avoid CORS/mixed-content issues.
// Locally, use the env var if set, otherwise fallback to localhost.
const BASE_URL = isVercel
  ? "/api-proxy"
  : process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  return handleResponse<T>(res);
}

export async function postMultipart<T>(
  path: string,
  body: FormData,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    body,
  });
  return handleResponse<T>(res);
}
