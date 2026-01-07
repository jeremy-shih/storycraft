import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import {
    deleteCharacterFromScenario,
    updateScenarioTextAction,
    regenerateCharacterImageAction,
    syncCharacterFromImageAction,
} from "@/app/features/scenario/actions/modify-scenario";
import * as gemini from "@/lib/api/gemini";
import * as imageGeneration from "@/app/features/shared/actions/image-generation";
import * as authUtils from "@/lib/api/auth-utils";
import { Scenario, Character } from "@/app/types";

// Mock dependencies
vi.mock("@/lib/api/gemini");
vi.mock("@/app/features/shared/actions/image-generation");
vi.mock("@/lib/api/auth-utils");
vi.mock("@/app/logger", () => ({
    default: {
        debug: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
    },
}));

describe("modify-scenario actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (authUtils.requireAuth as Mock).mockResolvedValue("user-id");
    });

    describe("deleteCharacterFromScenario", () => {
        it("should delete character and return updated scenario", async () => {
            const currentScenario = "Scenario text with Character A.";
            const oldName = "Character A";
            const oldDescription = "A brave hero.";
            const updatedText = "Scenario text without Character A.";

            (gemini.generateContent as Mock).mockResolvedValue(updatedText);

            const result = await deleteCharacterFromScenario(
                currentScenario,
                oldName,
                oldDescription,
            );

            expect(result).toEqual({ updatedScenario: updatedText });
            expect(gemini.generateContent).toHaveBeenCalled();
        });

        it("should throw error on validation failure", async () => {
            await expect(
                deleteCharacterFromScenario("", "", ""),
            ).rejects.toThrow("Failed to delete character");
        });
    });

    describe("updateScenarioTextAction", () => {
        it("should update scenario text based on character changes", async () => {
            const currentScenario = "Scenario with Old Char.";
            const oldName = "Old Char";
            const newName = "New Char";
            const newDesc = "New Desc";
            const updatedText = "Scenario with New Char.";

            (gemini.generateContent as Mock).mockResolvedValue(updatedText);

            const result = await updateScenarioTextAction(
                currentScenario,
                oldName,
                newName,
                newDesc,
                "character",
            );

            expect(result).toBe(updatedText);
            expect(gemini.generateContent).toHaveBeenCalled();
        });
    });

    describe("regenerateCharacterImageAction", () => {
        it("should regenerate character image", async () => {
            const scenario = {
                scenario: "Some scenario",
                style: "Cinematic",
            } as unknown as Scenario;
            const name = "Hero";
            const description = "A brave warrior";
            const newImageUri = "gs://bucket/hero.png";

            (
                imageGeneration.generateImageForScenario as Mock
            ).mockResolvedValue({
                imageGcsUri: newImageUri,
            });

            const result = await regenerateCharacterImageAction(
                scenario,
                name,
                description,
            );

            expect(result).toEqual({
                newImageGcsUri: newImageUri,
            });
            expect(imageGeneration.generateImageForScenario).toHaveBeenCalled();
        });

        it("should validate input and throw error if invalid", async () => {
            const scenario = {
                scenario: "", // Invalid
                style: "Cinematic",
            } as unknown as Scenario;

            await expect(
                regenerateCharacterImageAction(scenario, "", ""),
            ).rejects.toThrow("Failed to regenerate character image");
        });
    });

    describe("syncCharacterFromImageAction", () => {
        it("should analyze image, regenerate style-consistent image, and return updates", async () => {
            const scenario = {
                scenario: "Some scenario",
                style: "Cinematic",
            } as unknown as Scenario;
            const characterName = "Hero";
            const currentDescription = "Description";
            const currentVoice = "Voice";
            const imageGcsUri = "gs://bucket/image.png";
            const allCharacters = [
                { name: "Hero", description: "Desc", voice: "Voice" },
            ] as unknown as Character[];

            const updatedCharacter = {
                name: "Hero",
                description: "Analyzed description",
                voice: "Analyzed voice",
            };
            const mockGeminiResponse = JSON.stringify({
                updatedCharacter,
            });
            const regeneratedImageUri = "gs://bucket/regenerated-hero.png";

            (gemini.generateContent as Mock).mockResolvedValue(
                mockGeminiResponse,
            );
            (
                imageGeneration.generateImageForScenario as Mock
            ).mockResolvedValue({
                imageGcsUri: regeneratedImageUri,
            });

            const result = await syncCharacterFromImageAction(
                scenario,
                characterName,
                currentDescription,
                currentVoice,
                imageGcsUri,
                allCharacters,
            );

            expect(result.updatedCharacter).toEqual(updatedCharacter);
            expect(result.newImageGcsUri).toBe(regeneratedImageUri);

            // Verify Gemini call
            expect(gemini.generateContent).toHaveBeenCalled();
            // Verify Image generation call
            // Verify Image generation call
            expect(
                imageGeneration.generateImageForScenario,
            ).toHaveBeenCalledWith({
                scenario,
                entity: updatedCharacter,
                entityType: "character",
                modelName: expect.any(String),
                referenceImageGcsUri: imageGcsUri,
            });
        });

        it("should throw error on validation failure", async () => {
            const scenario = {
                scenario: "Some scenario",
                style: "Cinematic",
            } as unknown as Scenario;

            await expect(
                syncCharacterFromImageAction(
                    scenario,
                    "",
                    "",
                    "",
                    "not-gs-uri",
                    [],
                ),
            ).rejects.toThrow("Failed to sync character from image");
        });
    });
});
