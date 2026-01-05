"use server";

import { generateMusicRest } from "@/lib/api/lyria";
import logger from "@/app/logger";
import { generateMusicSchema } from "@/app/schemas";
import { requireAuth } from "@/lib/api/auth-utils";
import { validateActionInput } from "@/lib/utils/validation";

export async function generateMusic(prompt: string): Promise<string> {
    await requireAuth();
    validateActionInput(
        { prompt },
        generateMusicSchema,
        "Validation error in generateMusic",
    );
    logger.debug("Generating music");
    try {
        const musicUrl = await generateMusicRest(prompt);
        logger.debug("Music generated!");
        return musicUrl;
    } catch (error) {
        logger.error("Error generating music:", error);
        throw new Error(
            `Failed to music: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
    }
}
