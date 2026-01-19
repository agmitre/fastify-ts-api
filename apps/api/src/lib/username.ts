//apps/api/src/lib/username.ts
// username related functions
// max length 24char

export function usernameFromEmail(email: string): string {
    const base = email.split("@")[0] ?? "user"
    // keep alnum + underscores, lowercase
    return base.trim()
        .toLocaleLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 24) || "user";
}

export function withSuffix(base: string, n: number): string {
    const suffix = `_${n}`
    const maxBase = Math.max(1, 24 - suffix.length)
    return `${base.slice(0, maxBase)}${suffix}`
}