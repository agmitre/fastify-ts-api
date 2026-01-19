import { apiFetch } from "../api"
import type { User } from "../types"

export async function login({ loginEmail, loginPassword, setToken, setUser, setError }:
    { loginEmail: string, loginPassword: string, setToken: Function, setUser: Function, setError: Function }) {

    setError("")

    try {
        const res = await apiFetch<{ token: string, user: User }>("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: loginEmail,
                password: loginPassword
            })
        })

        setToken(res.token)
        setUser(res.user)
    } catch (e: any) {
        setError(e.message || "Login failed")
    }
}