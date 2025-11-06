// Centralized API base URL. In dev, leave VITE_API_BASE_URL empty to use Vite proxy at "/api".
export const API_BASE: string =
  (import.meta as any).env?.VITE_API_BASE_URL?.toString()?.trim() || "/api";

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed ${response.status}: ${text}`);
  }
  return (await response.json()) as T;
}


