// apps/api/src/plugins/auth.ts
// auth guard for routes

import fp from "fastify-plugin";

//app.requireAuth(request) on any route
export const authPlugin = fp(async (app) => {

    app.decorate("requireAuth", async (request: any) => {
        await request.jwtVerify()
    })
})

declare module "fastify" {
    interface FastifyInstance {
        requireAuth: (request: any) => Promise<void>
    }
}