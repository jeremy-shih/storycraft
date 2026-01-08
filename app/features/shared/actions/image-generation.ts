"use server";

import { createPartFromUri, createPartFromText, Part } from "@google/genai";
import { generateImage } from "@/lib/api/gemini";
import yaml from "js-yaml";
import { Scenario, ImagePrompt, Entity } from "@/app/types";
import logger from "@/app/logger";
import { createCollage } from "@/app/features/storyboard/actions/resize-image";
import { DEFAULT_SETTINGS } from "@/lib/ai-config";
import { requireAuth } from "@/lib/api/auth-utils";

export interface GenerateImageOptions {
    scenario: Scenario;
    imagePrompt?: ImagePrompt;
    entity?: Entity;
    entityType?: "character" | "setting" | "prop";
    instruction?: string;
    imageGcsUri?: string;
    referenceImageGcsUri?: string;
    aspectRatio?: string;
    modelName?: string;
}

const STYLE_INSTRUCTION = `I am providing a reference image. Use this image strictly for its visual style (color palette, lighting, texture, and art medium). Ignore the subjects, settings, locations, and objects matter of the reference image entirely.
Constraints:

* Adopt: The color grading, shadow density, and line quality of the reference.
* Discard: The original composition and subject matter.
* Reference Strength: High for style, 0% for content.`;

const CONTENT_STYLE_INSTRUCTION = `I am providing a reference image. Update the visual style of this image to match the provided description and scenario style, while maintaining the subject matter and composition of the reference image.
Constraints:

* Adopt: The scenario style, lighting, and overall mood.
* Preserve: The subjects, setting, and core composition of the reference image.`;

/**
 * Centralized action to generate images for scenarios, including characters, settings, props, and scenes.
 * Handles Reference-to-Image (R2I), style reference images, and automatic collage creation.
 */
export async function generateImageForScenario({
    scenario,
    imagePrompt,
    entity,
    entityType,
    instruction,
    imageGcsUri,
    referenceImageGcsUri,
    aspectRatio,
    modelName = DEFAULT_SETTINGS.imageModel,
}: GenerateImageOptions): Promise<{ imageGcsUri: string }> {
    await requireAuth();
    try {
        let targetAspectRatio = aspectRatio || scenario.aspectRatio || "16:9";

        // Default aspect ratio for characters and props is usually 1:1 in the app
        if (entityType === "character" || entityType === "prop") {
            targetAspectRatio = "1:1";
        }

        const content: Part[] = [];

        logger.debug(`generateImageForScenario : ${modelName}`);

        // Add style image if available as a reference
        if (scenario.styleImageUri) {
            logger.debug("Adding style image to content");
            content.push(createPartFromText(STYLE_INSTRUCTION));
            content.push(
                createPartFromUri(scenario.styleImageUri, "image/png"),
            );
        } else {
            logger.debug("No style image found");
        }

        if (instruction && imageGcsUri) {
            // Conversational edit
            content.push(createPartFromUri(imageGcsUri, "image/png"));
            content.push(createPartFromText(instruction));
        } else if (imagePrompt) {
            // Scene generation or regeneration
            const presentCharacters = scenario.characters.filter((character) =>
                imagePrompt.Subject.map((subject) => subject.name).includes(
                    character.name,
                ),
            );
            const props = scenario.props.filter((prop) =>
                imagePrompt.Prop?.map((p) => p.name).includes(prop.name),
            );
            const settings = scenario.settings.filter((setting) =>
                imagePrompt.Context.map((context) => context.name).includes(
                    setting.name,
                ),
            );

            const orderedPrompt = {
                Style: imagePrompt.Style,
                Scene: imagePrompt.Scene,
                Composition: {
                    shot_type: imagePrompt.Composition.shot_type,
                    lighting: imagePrompt.Composition.lighting,
                    overall_mood: imagePrompt.Composition.overall_mood,
                },
            };
            const promptString = yaml.dump(orderedPrompt, {
                indent: 2,
                lineWidth: -1,
            });

            // Max parts is 32. We use 2 parts for style if present, 1 for prompt.
            // Each reference takes 2 parts. 14 items = 28 parts.
            // 2 + 28 + 1 = 31 parts. Fits in 32.
            if (
                presentCharacters.length + props.length + settings.length <=
                14
            ) {
                const characterParts = presentCharacters.flatMap(
                    (character) => [
                        createPartFromText(character.name),
                        createPartFromUri(character.imageGcsUri!, "image/png"),
                    ],
                );
                const propsParts = props.flatMap((prop) => [
                    createPartFromText(prop.name),
                    createPartFromUri(prop.imageGcsUri!, "image/png"),
                ]);
                const settingsParts = settings.flatMap((setting) => [
                    createPartFromText(setting.name),
                    createPartFromText(setting.description),
                ]);
                content.push(
                    ...characterParts,
                    ...propsParts,
                    ...settingsParts,
                );
            } else {
                const collageUri = await createCollage(
                    presentCharacters,
                    props,
                    targetAspectRatio,
                );
                const settingsParts = settings.flatMap((setting) => [
                    createPartFromText(setting.name),
                    createPartFromText(setting.description),
                ]);
                content.push(
                    createPartFromUri(collageUri, "image/png"),
                    ...settingsParts,
                );
            }
            content.push(createPartFromText(promptString));
        } else if (entity) {
            // Initial entity generation or regeneration from uploaded image
            if (referenceImageGcsUri) {
                logger.debug("Adding reference image for entity sync");
                content.push(createPartFromText(CONTENT_STYLE_INSTRUCTION));
                content.push(
                    createPartFromUri(referenceImageGcsUri, "image/png"),
                );
            }

            const shotType =
                entityType === "character"
                    ? "Medium Shot"
                    : entityType === "setting"
                      ? "Wide Shot"
                      : "Close Shot";
            const orderedPrompt = {
                style: scenario.style,
                shot_type: shotType,
                description: entity.description,
            };
            const promptString = yaml.dump(orderedPrompt, {
                indent: 2,
                lineWidth: -1,
            });
            content.push(createPartFromText(promptString));
        } else {
            throw new Error("Either imagePrompt or entity must be provided");
        }

        logger.debug(
            `Generating image with ${content.length} parts and aspect ratio ${targetAspectRatio}`,
        );

        const result = await generateImage(
            content,
            {
                responseModalities: ["IMAGE"],
                imageConfig: {
                    aspectRatio: targetAspectRatio,
                    imageSize: "2K",
                },
            },
            modelName,
        );

        if (!result.success) {
            throw new Error(result.errorMessage || "Failed to generate image");
        }

        logger.debug("Generated image: " + result.imageGcsUri);

        return { imageGcsUri: result.imageGcsUri! };
    } catch (error) {
        logger.error("Error in generateImageForScenario:", error);
        throw error;
    }
}
