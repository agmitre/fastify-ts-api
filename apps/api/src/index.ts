import { buildApp } from "./app.js";

const app = buildApp()

const port = app.ctx.env.PORT
const host = "0.0.0.0"
const basePath = app.ctx.env.APP_PATH === "/" ? "" : app.ctx.env.APP_PATH

try { //try to start the server
    await app.listen({ port, host })
    app.log.info(`API ready: http://localhost:${port}${basePath}`)
} catch (err) {//report error and exit
    app.log.error(err)
    process.exit(1)
}