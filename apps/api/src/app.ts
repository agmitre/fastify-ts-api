// api/app.ts

import "dotenv/config"
import Fastify, { type FastifyInstance } from "fastify";
import sensible from "@fastify/sensible";
import rateLimit from "@fastify/rate-limit";

import { jwtPlugin } from "./plugins/jwt.js";

import { prisma } from "./lib/prisma.js";

import { type Env, loadEnv } from "./config/env.js";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { authPlugin } from "./plugins/auth.js";
import { taskRoutes } from "./routes/tasks.js";

export type AppContext = {
    env: Env;
}

//Fastify app builder
export function buildApp(): FastifyInstance {
    const env = loadEnv()

    const app = Fastify({
        logger: env.NODE_ENV !== "test"
    })

    // for http errors like app.httpErrors.badRequest()
    app.register(sensible)
    app.register(jwtPlugin)
    app.register(authPlugin)

    //rateLimit
    app.register(rateLimit, { global: false }) //custom handling per route


    // Make env available via app.decorate (clean + testable)
    app.decorate("ctx", { env } satisfies AppContext)

    const prefix = env.APP_PATH === "/" ? "" : env.APP_PATH

    // Register routes under APP_PATH prefix
    app.register(healthRoutes, { prefix })
    app.register(authRoutes, { prefix })
    app.register(taskRoutes, { prefix })

    app.addHook("onReady", async () => {
        await prisma.$queryRaw`Select 1`
        app.log.info("Prisma connected (Database connected)")
    })

    return app
}

// Extend Fastify types
declare module "fastify" {
    interface FastifyInstance {
        ctx: AppContext;
    }
}