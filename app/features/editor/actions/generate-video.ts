"use server";

import { exportMovie as exportMovieFFMPEG } from "@/lib/utils/ffmpeg";
import { TimelineLayer } from "@/app/types";
import logger from "@/app/logger";
import { exportMovieSchema } from "@/app/schemas";
import { requireAuth } from "@/lib/api/auth-utils";
import { validateActionInput } from "@/lib/utils/validation";

export async function exportMovieAction(
    layers: Array<TimelineLayer>,
): Promise<{ videoUrl: string; vttUrl?: string }> {
    await requireAuth();
    try {
        validateActionInput(
            { layers },
            exportMovieSchema,
            "Validation error in exportMovieAction",
        );

        logger.debug("Exporting movie...");
        const { videoUrl, vttUrl } = await exportMovieFFMPEG(layers);
        logger.debug(`videoUrl: ${videoUrl}`);
        if (vttUrl) logger.debug(`vttUrl: ${vttUrl}`);
        logger.debug(`Generated video!`);
        return { videoUrl, vttUrl };
    } catch (error) {
        logger.error("Error in generateVideo:", error);
        throw error;
    }
}
