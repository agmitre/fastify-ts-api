const base = import.meta.env.BASE_URL

export async function apiFetch<T>(
    path: string,
    opts: RequestInit = {},
    token?: string
): Promise<T> {

    const res = await fetch(`${base}${path}`, {
        ...opts,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(opts.headers || {})
        }
    })

    const text = await res.text()
    const data = text ? JSON.parse(text) : null

    if (!res.ok) {
        throw new Error(data?.message || data?.error || `HTTP ${res.status}`)
    }

    return data as T
}