/**
 * API base URL for requests. Empty string = same origin (dev server).
 * In extension build, set VITE_API_BASE_URL to your hosted backend (e.g. https://your-api.com).
 */
export function getApiBase(): string {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) {
    const base = (import.meta.env.VITE_API_BASE_URL as string).replace(/\/$/, "");
    return base;
  }
  return "";
}

export function buildApiUrl(path: string, searchParams?: Record<string, string>): string {
  const base = getApiBase();
  const pathWithLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  const url = base ? `${base}${pathWithLeadingSlash}` : pathWithLeadingSlash;
  if (searchParams && Object.keys(searchParams).length > 0) {
    const params = new URLSearchParams(searchParams);
    return `${url}?${params.toString()}`;
  }
  return url;
}

export function getApiHeaders(options?: { walletAddress?: string | null }): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options?.walletAddress) {
    headers["X-Wallet-Address"] = options.walletAddress;
  }
  return headers;
}
