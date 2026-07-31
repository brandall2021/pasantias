"use client"

import { useEffect, useState, useCallback } from "react"
import { apiFetch, ApiClientError } from "@/lib/api"

export function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!!url)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    if (!url) return
    setLoading(true)
    setError(null)
    try {
      const result = await apiFetch<T>(url)
      setData(result)
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Error de conexión")
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    cargar()
  }, [cargar])

  return { data, loading, error, reload: cargar }
}

export function useMutation<T = unknown>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(url: string, options: RequestInit = {}): Promise<T | null> {
    setLoading(true)
    setError(null)
    try {
      return await apiFetch<T>(url, options)
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Error de conexión")
      return null
    } finally {
      setLoading(false)
    }
  }

  return { run, loading, error }
}
