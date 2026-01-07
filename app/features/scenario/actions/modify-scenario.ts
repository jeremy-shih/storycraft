"use server";

import { generateContent } from "@/lib/api/gemini";
import { z } from "zod";
import logger from "@/app/logger";
import { generateImageForScenario } from "@/app/features/shared/actions/image-generation";
import { Character, Setting, Prop, Scenario } from "@/app/types";
import {
    deleteCharacterSchema,
    deletePropSchema,
    deleteSettingSchema,
    regenerateCharacterImageSchema,
    regenerateCharacterTextSchema,
    regeneratePropImageSchema,
    regeneratePropTextSchema,
    regenerateSettingImageSchema,
    regenerateSettingTextSchema,
} from "@/app/schemas";

import { DEFAULT_SETTINGS } from "@/lib/ai-config";
import { requireAuth } from "@/lib/api/auth-utils";
import { validateActionInput } from "@/lib/utils/validation";

// UpdatedEntityResult interface for entity modifications
export interface UpdatedEntityResult {
    updatedCharacter?: {
        name: string;
        description: string;
        voice: string;
    };
    updatedSetting?: {
        name: string;
        description: string;
    };
    updatedProp?: {
        name: string;
        description: string;
    };
    newImageGcsUri?: string;
}

// DeletedEntityResult for when an entity is removed and scenario text is updated
export interface DeletedEntityResult {
    updatedScenario: string;
}

// Zod schema for character updates
const CharacterUpdateSchema = z.object({
    updatedCharacter: z.object({
        name: z.string(),
        description: z.string(),
        voice: z.string(),
    }),
});

const SettingUpdateSchema = z.object({
    updatedSetting: z.object({
        name: z.string(),
        description: z.string(),
    }),
});

const PropUpdateSchema = z.object({
    updatedProp: z.object({
        name: z.string(),
        description: z.string(),
    }),
});

// Common error handling
const handleError = (operation: string, error: unknown): never => {
    const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error in ${operation}:`, error);
    throw new Error(`Failed to ${operation}: ${errorMessage}`);
};

// Common Gemini configuration
const geminiConfig = {
    thinkingConfig: {
        includeThoughts: false,
        thinkingBudget: -1,
    },
    responseMimeType: "text/plain" as const,
};

// Shared function to update scenario text
export async function updateScenarioTextAction(
    currentScenario: string,
    oldName: string,
    newName: string,
    newDescription: string,
    entityType: "character" | "setting" | "prop" = "character",
    modelName: string = DEFAULT_SETTINGS.llmModel,
    thinkingBudget: number = DEFAULT_SETTINGS.thinkingBudget,
): Promise<string> {
    await requireAuth();
    const text = await generateContent(
        `Update the following scenario to reflect ${entityType} changes. The ${entityType} previously named "${oldName}" is now named "${newName}" with the following updated description: "${newDescription}".

CURRENT SCENARIO:
"${currentScenario}"\n\nINSTRUCTIONS:
1. Replace all references to "${oldName}" with "${newName}" (if the name changed)
2. Update any ${entityType} descriptions in the scenario to match the new ${entityType} description
3. Ensure the story flow and narrative remain coherent
4. Maintain the same tone and style as the original scenario
5. Keep the scenario length similar to the original

Return ONLY the updated scenario text, no additional formatting or explanations.`,
        {
            ...geminiConfig,
            thinkingConfig: {
                includeThoughts: false,
                thinkingBudget,
            },
        },
        modelName,
    );

    return text!.trim();
}

async function deleteFromScenarioText(
    currentScenario: string,
    oldName: string,
    oldDescription: string,
    entityType: "character" | "setting" | "prop" = "character",
): Promise<string> {
    const text = await generateContent(
        `Delete the following ${entityType} from the scenario.

CURRENT SCENARIO:
"${currentScenario}"\n\nINSTRUCTIONS:
1. Delete all references to "${oldName}" and "${oldDescription}" from the scenario
2. Ensure the story flow and narrative remain coherent
3. Maintain the same tone and style as the original scenario
4. Keep the scenario length similar to the original

Return ONLY the updated scenario text, no additional formatting or explanations.`,
        geminiConfig,
    );
    return text!.trim();
}

export async function deleteCharacterFromScenario(
    currentScenario: string,
    oldName: string,
    oldDescription: string,
): Promise<DeletedEntityResult> {
    await requireAuth();
    try {
        validateActionInput(
            {
                currentScenario,
                oldName,
                oldDescription,
            },
            deleteCharacterSchema,
            "Validation error in deleteCharacterFromScenario",
        );
        // Update scenario text
        const updatedScenario = await deleteFromScenarioText(
            currentScenario,
            oldName,
            oldDescription,
            "character",
        );

        return {
            updatedScenario,
        };
    } catch (error) {
        handleError("delete character from scenario text", error);
    }
    throw new Error("Unreachable code");
}

export async function deleteSettingFromScenario(
    currentScenario: string,
    oldName: string,
    oldDescription: string,
): Promise<DeletedEntityResult> {
    await requireAuth();
    try {
        validateActionInput(
            {
                currentScenario,
                oldName,
                oldDescription,
            },
            deleteSettingSchema,
            "Validation error in deleteSettingFromScenario",
        );
        const updatedScenario = await deleteFromScenarioText(
            currentScenario,
            oldName,
            oldDescription,
            "setting",
        );

        return {
            updatedScenario,
        };
    } catch (error) {
        handleError("delete setting from scenario text", error);
    }
    throw new Error("Unreachable code");
}

export async function deletePropFromScenario(
    currentScenario: string,
    oldName: string,
    oldDescription: string,
): Promise<DeletedEntityResult> {
    await requireAuth();
    try {
        validateActionInput(
            {
                currentScenario,
                oldName,
                oldDescription,
            },
            deletePropSchema,
            "Validation error in deletePropFromScenario",
        );
        const updatedScenario = await deleteFromScenarioText(
            currentScenario,
            oldName,
            oldDescription,
            "prop",
        );

        return {
            updatedScenario,
        };
    } catch (error) {
        handleError("delete prop from scenario text", error);
    }
    throw new Error("Unreachable code");
}

/**
 * Regenerate character image only
 */
export async function regenerateCharacterImageAction(
    scenario: Scenario,
    newCharacterName: string,
    newCharacterDescription: string,
    imageModel: string = DEFAULT_SETTINGS.imageModel,
): Promise<UpdatedEntityResult> {
    await requireAuth();
    logger.info("regenerateCharacterImageAction");
    try {
        validateActionInput(
            {
                currentScenario: scenario.scenario,
                oldCharacterName: newCharacterName,
                newCharacterName: newCharacterName,
                newCharacterDescription: newCharacterDescription,
                style: scenario.style,
                imageModel,
            },
            regenerateCharacterTextSchema,
            "Validation error in regenerateCharacterImageAction",
        );

        // Generate new character image
        const imageResult = await generateImageForScenario({
            scenario,
            entity: {
                name: newCharacterName,
                description: newCharacterDescription,
            },
            entityType: "character",
            modelName: imageModel,
        });

        return {
            newImageGcsUri: imageResult.imageGcsUri,
        };
    } catch (error) {
        handleError("regenerate character image", error);
    }
    throw new Error("Unreachable code");
}

/**
 * Analyze character image and update description/voice, then regenerate image for style consistency
 */
export async function syncCharacterFromImageAction(
    scenario: Scenario,
    characterName: string,
    currentCharacterDescription: string,
    currentCharacterVoice: string,
    imageGcsUri: string,
    allCharacters: Character[],
    llmModel: string = DEFAULT_SETTINGS.llmModel,
    thinkingBudget: number = DEFAULT_SETTINGS.thinkingBudget,
    imageModel: string = DEFAULT_SETTINGS.imageModel,
): Promise<UpdatedEntityResult> {
    await requireAuth();
    try {
        validateActionInput(
            {
                currentScenario: scenario.scenario,
                characterName,
                currentCharacterDescription,
                currentCharacterVoice,
                imageGcsUri,
                allCharacters,
                style: scenario.style,
                llmModel,
                thinkingBudget,
                imageModel,
            },
            regenerateCharacterImageSchema,
            "Validation error in syncCharacterFromImageAction",
        );

        const characterListText = allCharacters
            .map((char) => `- ${char.name}: ${char.description}`)
            .join("\n");

        const text = await generateContent(
            [
                {
                    fileData: {
                        fileUri: imageGcsUri,
                        mimeType: "image/png",
                    },
                },
                `Analyze the provided image and update the character description and voice to match the visual characteristics shown.

ALL CHARACTERS IN THE STORY:
${characterListText}

CHARACTER TO UPDATE (${characterName}):
"Description: ${currentCharacterDescription}"\n"Voice: ${currentCharacterVoice}"\n
INSTRUCTIONS:
1. Examine the uploaded image carefully
2. Update ONLY the description and voice of ${characterName} to accurately reflect what you see in the image (appearance, clothing, features, etc.)
3. Do NOT modify the scenario text.

Return a JSON object with updatedCharacter (name, description, voice).`,
            ],
            {
                ...geminiConfig,
                thinkingConfig: {
                    includeThoughts: false,
                    thinkingBudget,
                },
                responseMimeType: "application/json",
                responseSchema: z.toJSONSchema(CharacterUpdateSchema),
            },
            llmModel,
        );

        const characterUpdateResult = CharacterUpdateSchema.safeParse(
            JSON.parse(text!),
        );
        if (!characterUpdateResult.success) {
            handleError(
                "parse character scenario update",
                characterUpdateResult.error,
            );
        }
        const characterUpdate = characterUpdateResult.data!;

        // Regenerate image for style consistency
        const imageResult = await generateImageForScenario({
            scenario,
            entity: characterUpdate.updatedCharacter,
            entityType: "character",
            modelName: imageModel,
            referenceImageGcsUri: imageGcsUri,
        });

        return {
            updatedCharacter: characterUpdate.updatedCharacter,
            newImageGcsUri: imageResult.imageGcsUri,
        };
    } catch (error) {
        handleError("sync character from image", error);
    }
    throw new Error("Unreachable code");
}

/**
 * Regenerate setting image only
 */
export async function regenerateSettingImageAction(
    scenario: Scenario,
    newSettingName: string,
    newSettingDescription: string,
    aspectRatio: string = "16:9",
    imageModel: string = DEFAULT_SETTINGS.imageModel,
): Promise<UpdatedEntityResult> {
    await requireAuth();
    try {
        validateActionInput(
            {
                currentScenario: scenario.scenario,
                oldSettingName: newSettingName,
                newSettingName: newSettingName,
                newSettingDescription: newSettingDescription,
                style: scenario.style,
                aspectRatio,
                imageModel,
            },
            regenerateSettingTextSchema,
            "Validation error in regenerateSettingImageAction",
        );

        const imageResult = await generateImageForScenario({
            scenario,
            entity: {
                name: newSettingName,
                description: newSettingDescription,
            },
            entityType: "setting",
            modelName: imageModel,
            aspectRatio,
        });

        return {
            newImageGcsUri: imageResult.imageGcsUri,
        };
    } catch (error) {
        handleError("regenerate setting image", error);
    }
    throw new Error("Unreachable code");
}

/**
 * Analyze setting image and regenerate for style consistency
 */
export async function syncSettingFromImageAction(
    scenario: Scenario,
    settingName: string,
    currentSettingDescription: string,
    imageGcsUri: string,
    allSettings: Setting[],
    llmModel: string = DEFAULT_SETTINGS.llmModel,
    thinkingBudget: number = DEFAULT_SETTINGS.thinkingBudget,
    imageModel: string = DEFAULT_SETTINGS.imageModel,
): Promise<UpdatedEntityResult> {
    await requireAuth();
    try {
        validateActionInput(
            {
                currentScenario: scenario.scenario,
                settingName,
                currentSettingDescription,
                imageGcsUri,
                allSettings,
                style: scenario.style,
                llmModel,
                thinkingBudget,
                imageModel,
            },
            regenerateSettingImageSchema,
            "Validation error in syncSettingFromImageAction",
        );

        const settingListText = allSettings
            .map((setting) => `- ${setting.name}: ${setting.description}`)
            .join("\n");

        const text = await generateContent(
            [
                {
                    fileData: {
                        fileUri: imageGcsUri,
                        mimeType: "image/png",
                    },
                },
                `Analyze the provided image and update the setting description to match the visual characteristics shown.

ALL SETTINGS IN THE STORY:
${settingListText}

SETTING TO UPDATE (${settingName}):
"${currentSettingDescription}"\n
INSTRUCTIONS:
1. Examine the uploaded image carefully
2. Update ONLY the description of ${settingName} to accurately reflect what you see in the image
3. Do NOT modify the scenario text.

Return a JSON object with updatedSetting (name, description).`,
            ],
            {
                ...geminiConfig,
                thinkingConfig: {
                    includeThoughts: false,
                    thinkingBudget,
                },
                responseMimeType: "application/json",
                responseSchema: z.toJSONSchema(SettingUpdateSchema),
            },
            llmModel,
        );

        const settingUpdateResult = SettingUpdateSchema.safeParse(
            JSON.parse(text!),
        );
        if (!settingUpdateResult.success) {
            handleError(
                "parse setting scenario update",
                settingUpdateResult.error,
            );
        }
        const settingUpdate = settingUpdateResult.data!;

        // Regenerate image for style consistency
        const imageResult = await generateImageForScenario({
            scenario,
            entity: settingUpdate.updatedSetting,
            entityType: "setting",
            modelName: imageModel,
            aspectRatio: scenario.aspectRatio,
            referenceImageGcsUri: imageGcsUri,
        });

        return {
            updatedSetting: settingUpdate.updatedSetting,
            newImageGcsUri: imageResult.imageGcsUri,
        };
    } catch (error) {
        handleError("sync setting from image", error);
    }
    throw new Error("Unreachable code");
}

/**
 * Regenerate prop image only
 */
export async function regeneratePropImageAction(
    scenario: Scenario,
    newPropName: string,
    newPropDescription: string,
    imageModel: string = DEFAULT_SETTINGS.imageModel,
): Promise<UpdatedEntityResult> {
    await requireAuth();
    try {
        validateActionInput(
            {
                currentScenario: scenario.scenario,
                oldPropName: newPropName,
                newPropName: newPropName,
                newPropDescription: newPropDescription,
                style: scenario.style,
                imageModel,
            },
            regeneratePropTextSchema,
            "Validation error in regeneratePropImageAction",
        );

        const imageResult = await generateImageForScenario({
            scenario,
            entity: { name: newPropName, description: newPropDescription },
            entityType: "prop",
            modelName: imageModel,
        });

        return {
            newImageGcsUri: imageResult.imageGcsUri,
        };
    } catch (error) {
        handleError("regenerate prop image", error);
    }
    throw new Error("Unreachable code");
}

/**
 * Analyze prop image and regenerate for style consistency
 */
export async function syncPropFromImageAction(
    scenario: Scenario,
    propName: string,
    currentPropDescription: string,
    imageGcsUri: string,
    allProps: Prop[],
    llmModel: string = DEFAULT_SETTINGS.llmModel,
    thinkingBudget: number = DEFAULT_SETTINGS.thinkingBudget,
    imageModel: string = DEFAULT_SETTINGS.imageModel,
): Promise<UpdatedEntityResult> {
    await requireAuth();
    try {
        validateActionInput(
            {
                currentScenario: scenario.scenario,
                propName,
                currentPropDescription,
                imageGcsUri,
                allProps,
                style: scenario.style,
                llmModel,
                thinkingBudget,
                imageModel,
            },
            regeneratePropImageSchema,
            "Validation error in syncPropFromImageAction",
        );

        const propListText = allProps
            .map((prop) => `- ${prop.name}: ${prop.description}`)
            .join("\n");

        const text = await generateContent(
            [
                {
                    fileData: {
                        fileUri: imageGcsUri,
                        mimeType: "image/png",
                    },
                },
                `Analyze the provided image and update the prop description to match the visual characteristics shown.

ALL PROPS IN THE STORY:
${propListText}

PROP TO UPDATE (${propName}):
"${currentPropDescription}"\n
INSTRUCTIONS:
1. Examine the uploaded image carefully
2. Update ONLY the description of ${propName} to accurately reflect what you see in the image
3. Do NOT modify the scenario text.

Return a JSON object with updatedProp (name, description).`,
            ],
            {
                ...geminiConfig,
                thinkingConfig: {
                    includeThoughts: false,
                    thinkingBudget,
                },
                responseMimeType: "application/json",
                responseSchema: z.toJSONSchema(PropUpdateSchema),
            },
            llmModel,
        );

        const propUpdateResult = PropUpdateSchema.safeParse(JSON.parse(text!));
        if (!propUpdateResult.success) {
            handleError("parse prop scenario update", propUpdateResult.error);
        }
        const propUpdate = propUpdateResult.data!;

        // Regenerate image for style consistency
        const imageResult = await generateImageForScenario({
            scenario,
            entity: propUpdate.updatedProp,
            entityType: "prop",
            modelName: imageModel,
            referenceImageGcsUri: imageGcsUri,
        });

        return {
            updatedProp: propUpdate.updatedProp,
            newImageGcsUri: imageResult.imageGcsUri,
        };
    } catch (error) {
        handleError("sync prop from image", error);
    }
    throw new Error("Unreachable code");
}
