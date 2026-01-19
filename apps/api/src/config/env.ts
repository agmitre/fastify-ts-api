// api/src/config/env.ts

// Calidate and parse env vars usign zod

import { z } from "zod";

const EnvSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),


    // Allows hosting at "/" or "/api" (or any subpath).
    // We'll normalize it to either "/" or "/something" with no trailing slash.
    APP_PATH: z.string().default("/"),

    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_SECRET: z.string().min(16, "JWT_SECRET should be at least 16 characters"),
    JWT_EXPIRES_IN: z.string().default("15m"),

})

function normalizeAppPath(input: string): string {

    const raw = input = (input || "/").trim()

    // Common messy inputs we normalize:
    // "" -> "/"
    // "api" -> "/api"
    // "/api/" -> "/api"
    // "/" -> "/"
    if (raw === "" || raw === "/") return "/";

    const withLeadingSlash = raw.startsWith("/") ? raw : `/${raw}`;

    const noTrailingSlash = withLeadingSlash.length > 1
        ? withLeadingSlash.replace(/\/+$/, "")
        : withLeadingSlash;

    return noTrailingSlash;

}

export type Env = z.infer<typeof EnvSchema> & { APP_PATH: string };

export function loadEnv(processEnv: NodeJS.ProcessEnv = process.env): Env {
    const parsed = EnvSchema.safeParse(processEnv);

    if (!parsed.success) {
        // Make the error readable in terminal and CI
        const formatted = parsed.error.format();
        // eslint-disable-next-line no-console
        console.error("Invalid environment variables:", formatted);
        throw new Error("Invalid environment variables");
    }

    return {
        ...parsed.data,
        APP_PATH: normalizeAppPath(parsed.data.APP_PATH),
    };
}