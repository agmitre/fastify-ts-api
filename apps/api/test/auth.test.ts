import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildTestApp } from "./helpers/buildTestApp.js";

function randomEmail() {
    return `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
}

describe("auth", () => {
    const app = buildTestApp()

    beforeAll(async () => {
        await app.ready()
    })
    afterAll(async () => {
        await app.close()
    })

    it("health should return ok", async () => {
        const res = await app.inject({
            method: "GET",
            url: "/health"
        })

        expect(res.statusCode).toBe(200)
        expect(res.json()).toEqual({ ok: true })
    })

    it("register should create a user and return token", async () => {
        const email = randomEmail()
        const res = await app.inject({
            method: "POST",
            url: "/auth/register",
            payload: {
                email,
                username: `user_${Date.now()}`,
                password: "password123",
            }
        })
        expect(res.statusCode).toBe(201)
        const body = res.json()
        expect(body.token).toBeTypeOf("string")
        expect(body.user.email).toBe(email.toLowerCase())
    })

    it("login should return token for valid credentials", async () => {
        const email = randomEmail();
        const username = `user_${Date.now()}`;

        // register first
        await app.inject({
            method: "POST",
            url: "/auth/register",
            payload: { email, username, password: "password123" },
        });

        const res = await app.inject({
            method: "POST",
            url: "/auth/login",
            payload: { email, password: "password123" },
        });

        expect(res.statusCode).toBe(200);
        const body = res.json();
        expect(body.token).toBeTypeOf("string");
        expect(body.user.username).toBe(username.toLowerCase());
    });
})