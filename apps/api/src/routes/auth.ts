import z from "zod";
import argon2 from "argon2";
import { usernameFromEmail, withSuffix } from "../lib/username.js";
import { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";

// validation
const RegisterBodySchema = z.object({
    email: z.string().email().max(255),
    username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers, underscore"),
    password: z.string().min(8).max(200),
})

const LoginBodySchema = z.object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(200),
})

function buildUsernameSuggestions(base: string): string[] {
    return [1, 2, 3].map((n) => withSuffix(base, n))
}

export const authRoutes: FastifyPluginAsync = async (app) => {
    app.post("/auth/register",
        {
            config: {
                rateLimit: { max: 10, timeWindow: "1 minute" }
            }
        },
        async (request, reply) => {
            const parsed = RegisterBodySchema.safeParse(request.body);
            if (!parsed.success) {
                return reply.code(400).send({
                    error: "INVALID_BODY",
                    message: "Request body validation failed",
                    details: parsed.error.flatten(),
                });
            }
            const body = parsed.data;

            const email = body.email.toLowerCase().trim()
            const requestedUserName = body.username.toLowerCase().trim()

            //check email unique
            const existingByEmail = await prisma.user.findUnique({
                where: { email },
                select: { id: true }
            })

            if (existingByEmail) {
                return reply.code(409).send({
                    error: "EMAIL_ALREADY_IN_USE",
                    message: "Email is already registered"
                })
            }

            //check username unique
            const existingByUsername = await prisma.user.findUnique({
                where: { username: requestedUserName },
                select: { id: true }
            })

            if (existingByUsername) {
                const base = requestedUserName || usernameFromEmail(email)
                return reply.code(409).send({
                    error: "USERNAME_ALREADY_IN_USE",
                    message: "Username is already taken",
                    suggestions: buildUsernameSuggestions(base),
                })
            }

            const passwordHash = await argon2.hash(body.password)

            const user = await prisma.user.create({
                data: {
                    email,
                    username: requestedUserName,
                    passwordHash
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    createdAt: true,
                }
            })

            const token = await app.jwt.sign({
                sub: user.id,
                username: user.username
            })

            return reply.code(201).send({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    createdAt: user.createdAt
                }
            })
        })

    app.post("/auth/login",
        {
            config: {
                rateLimit: { max: 10, timeWindow: "1 minute" }
            }
        },
        async (request, reply) => {
            const parsed = LoginBodySchema.safeParse(request.body)
            if (!parsed.success) {
                return reply.code(400).send({
                    error: "INVALID_BODY",
                    message: "Request body validation failed",
                    details: parsed.error.flatten()
                })
            }

            const email = parsed.data.email.toLowerCase().trim()
            const password = parsed.data.password

            const user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    passwordHash: true,
                }
            })

            // no leaking “email exists” vs “password wrong”
            const invalidBodyError = {
                error: "INVALID_CREDENTIALS",
                message: "Invalid email or password"
            }

            if (!user) {
                return reply.code(401).send(invalidBodyError)
            }

            const ok = await argon2.verify(user.passwordHash, password)
            if (!ok) {
                return reply.code(401).send(invalidBodyError)
            }

            const token = await app.jwt.sign({
                sub: user.id,
                username: user.username
            })

            return reply.code(200).send({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username
                }
            })

        })
}