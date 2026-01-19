import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

export const jwtPlugin = fp(async (app: any) => {
    const { JWT_SECRET, JWT_EXPIRES_IN } = app.ctx.env;

    app.register(jwt, {
        secret: JWT_SECRET,
        sign: {
            expiresIn: JWT_EXPIRES_IN,
        },
    });
});