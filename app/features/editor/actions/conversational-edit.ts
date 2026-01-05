"use server";

import { generateImageForScenario } from "@/app/features/shared/actions/image-generation";
import logger from "@/app/logger";
import { conversationalEditSchema } from "@/app/schemas";
import { Scenario } from "@/app/types";
import { requireAuth } from "@/lib/api/auth-utils";
import { validateActionInput } from "@/lib/utils/validation";

interface ConversationalEditParams {
    imageGcsUri: string;
    instruction: string;
    sceneNumber: number;
    scenarioId: string;
    scenario?: Scenario; // Optional scenario context
}

export async function conversationalEdit(
    params: ConversationalEditParams,
): Promise<{ imageGcsUri: string }> {
    await requireAuth();
    const { imageGcsUri, instruction, sceneNumber, scenarioId, scenario } =
        params;
    try {
        validateActionInput(
            params,
            conversationalEditSchema,
            "Validation error in conversationalEdit",
        );

        logger.info(
            `Starting conversational edit for scene ${sceneNumber} in scenario ${scenarioId}`,
        );

        // We use a minimal scenario if none provided, but style might be missing.
        // In real usage, the caller should ideally provide the scenario.
        const result = await generateImageForScenario({
            scenario: scenario || ({ id: scenarioId } as Scenario),
            instruction,
            imageGcsUri,
        });

        if (result.imageGcsUri) {
            logger.info(
                `Successfully edited image for scene ${sceneNumber}. New image URI: ${result.imageGcsUri}`,
            );
            return {
                imageGcsUri: result.imageGcsUri,
            };
        } else {
            throw new Error("Failed to edit image: No URI returned");
        }
    } catch (error) {
        logger.error(
            `Error in conversational edit for scene ${params.sceneNumber}:`,
            error,
        );
        throw error;
    }
}
