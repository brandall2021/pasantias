import type { ApiError } from "@/types/api"

export class ApiClientError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!res.ok) {
    let message = "Error de servidor"
    try {
      const body = (await res.json()) as ApiError
      if (body.error) message = body.error
    } catch {
      // ignore parse errors
    }
    throw new ApiClientError(message, res.status)
  }

  return res.json() as Promise<T>
}

export function apiGet<T>(url: string): Promise<T> {
  return apiFetch<T>(url)
}

export function apiPost<T>(url: string, body?: unknown): Promise<T> {
  return apiFetch<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined })
}

export function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  return apiFetch<T>(url, { method: "PATCH", body: body ? JSON.stringify(body) : undefined })
}

export function apiDelete<T>(url: string, body?: unknown): Promise<T> {
  return apiFetch<T>(url, { method: "DELETE", body: body ? JSON.stringify(body) : undefined })
}
