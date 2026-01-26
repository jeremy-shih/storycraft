import { z } from "zod";

const envSchema = z.object({
    // Google Cloud
    PROJECT_ID: z.string().min(1),
    LOCATION: z.string().min(1),
    GCS_VIDEOS_STORAGE_URI: z.string().min(1),
    FIRESTORE_DATABASE_ID: z.string().optional(),

    // Auth
    AUTH_SECRET: z.string().min(1),
    AUTH_GOOGLE_ID: z.string().min(1),
    AUTH_GOOGLE_SECRET: z.string().min(1),

    // App config
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    LOG_LEVEL: z.string().default("info"),
    NEXT_PUBLIC_E2E_MOCK_AUTH: z
        .string()
        .optional()
        .transform((v) => v === "true"),
});

// Use safeParse to avoid crashing during build time if env vars are missing
// but they are required at runtime.
const parsed = envSchema.safeParse(process.env);

if (!parsed.success && typeof window === "undefined") {
    console.warn(
        "⚠️ Invalid environment variables (Validation Skipped):",
        JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
    );
    // Do not throw to allow build without env vars (runtime injection)
}

export const env = (parsed.success ? parsed.data : process.env) as z.infer<
    typeof envSchema
>;
