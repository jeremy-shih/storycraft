import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import {
    deleteCharacterFromScenario,
    regenerateCharacterAndScenarioFromText,
} from "@/app/features/scenario/actions/modify-scenario";
import * as gemini from "@/lib/api/gemini";
import * as imageGeneration from "@/app/features/shared/actions/image-generation";
import * as authUtils from "@/lib/api/auth-utils";

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

    describe("regenerateCharacterAndScenarioFromText", () => {
        it("should regenerate character and update scenario", async () => {
            const scenario = {
                scenario: "Scenario with Old Char.",
                characters: [],
                settings: [],
                props: [],
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;
            const oldName = "Old Char";
            const newName = "New Char";
            const newDesc = "New Desc";
            const style = "Cinematic";
            const updatedText = "Scenario with New Char.";
            const newImageUri = "gs://bucket/new-char.png";

            (gemini.generateContent as Mock).mockResolvedValue(updatedText);
            (
                imageGeneration.generateImageForScenario as Mock
            ).mockResolvedValue({
                imageGcsUri: newImageUri,
            });

            const result = await regenerateCharacterAndScenarioFromText(
                scenario,
                oldName,
                newName,
                newDesc,
                style,
            );

            expect(result).toEqual({
                updatedScenario: updatedText,
                newImageGcsUri: newImageUri,
            });
        });
    });
});
