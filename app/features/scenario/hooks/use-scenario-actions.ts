import { useScenarioStore } from "@/app/features/scenario/stores/useScenarioStore";
import { useLoadingStore } from "@/app/features/shared/stores/useLoadingStore";
import { useEditorStore } from "@/app/features/editor/stores/useEditorStore";
import { useSettings } from "@/app/features/shared/hooks/use-settings";
import { clientLogger } from "@/lib/utils/client-logger";
import { generateStoryboard } from "@/app/features/scenario/actions/generate-scenes";
import {
    regenerateCharacterImageAction,
    syncCharacterFromImageAction,
    regenerateSettingImageAction,
    syncSettingFromImageAction,
    regeneratePropImageAction,
    syncPropFromImageAction,
} from "@/app/features/scenario/actions/modify-scenario";
import { useImageUpload } from "@/app/features/shared/hooks/use-image-upload";
import { toast } from "sonner";

export function useScenarioActions() {
    const { scenario, numScenes, setScenario, setErrorMessage } =
        useScenarioStore();

    const { style, language } = scenario;

    const { setLoading, startLoading, stopLoading } = useLoadingStore();
    const { setActiveTab } = useEditorStore();
    const { settings } = useSettings();
    const { uploadImageFile } = useImageUpload();

    const handleGenerateStoryBoard = async () => {
        clientLogger.log("Generating storyboard");

        if (!scenario) return;
        setLoading("scenario", true);
        setErrorMessage(null);
        try {
            const scenarioWithStoryboard = await generateStoryboard(
                scenario,
                numScenes,
                style,
                language,
                settings.llmModel,
                settings.thinkingBudget,
            );
            setScenario(scenarioWithStoryboard);
            setActiveTab("storyboard");
        } catch (error) {
            clientLogger.error("Error generating storyboard:", error);
            const message =
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred while generating storyboard";
            setErrorMessage(message);
            toast.error(message);
            setActiveTab("scenario");
        } finally {
            setLoading("scenario", false);
        }
    };

    const handleRegenerateCharacterImage = async (
        characterIndex: number,
        name: string,
        description: string,
        voice: string,
    ) => {
        if (!scenario) return;

        startLoading("characters", characterIndex);
        setErrorMessage(null);
        try {
            const { newImageGcsUri } = await regenerateCharacterImageAction(
                scenario,
                name,
                description,
                settings.imageModel,
            );

            return {
                name,
                description,
                voice,
                imageGcsUri: newImageGcsUri,
            };
        } catch (error) {
            clientLogger.error("Error regenerating character image:", error);
            const message = `Failed to regenerate character image: ${error instanceof Error ? error.message : "Unknown error"}`;
            setErrorMessage(message);
            toast.error(message);
        } finally {
            stopLoading("characters", characterIndex);
        }
    };

    const handleUploadCharacterImage = async (
        characterIndex: number,
        file: File,
    ) => {
        if (!scenario) return;

        clientLogger.log(
            "Starting character image upload for index:",
            characterIndex,
        );
        setErrorMessage(null);
        startLoading("characters", characterIndex);

        try {
            const resizedImageGcsUri = await uploadImageFile(file);

            const result = await syncCharacterFromImageAction(
                scenario,
                scenario.characters[characterIndex].name,
                scenario.characters[characterIndex].description,
                scenario.characters[characterIndex].voice || "",
                resizedImageGcsUri,
                scenario.characters,
                settings.llmModel,
                settings.thinkingBudget,
                settings.imageModel,
            );

            if (result.updatedCharacter) {
                return {
                    ...result.updatedCharacter,
                    imageGcsUri: result.newImageGcsUri,
                };
            } else {
                return {
                    imageGcsUri: result.newImageGcsUri,
                };
            }
        } catch (error) {
            clientLogger.error("Error uploading character image:", error);
            const message =
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred while uploading the character image";
            setErrorMessage(message);
            toast.error(message);
        } finally {
            stopLoading("characters", characterIndex);
        }
    };

    const handleRegenerateSettingImage = async (
        settingIndex: number,
        name: string,
        description: string,
    ) => {
        if (!scenario) return;

        startLoading("settings", settingIndex);
        setErrorMessage(null);
        try {
            const { newImageGcsUri } = await regenerateSettingImageAction(
                scenario,
                name,
                description,
                scenario.aspectRatio,
                settings.imageModel,
            );

            return {
                name,
                description,
                imageGcsUri: newImageGcsUri,
            };
        } catch (error) {
            clientLogger.error("Error regenerating setting image:", error);
            const message = `Failed to regenerate setting image: ${error instanceof Error ? error.message : "Unknown error"}`;
            setErrorMessage(message);
            toast.error(message);
        } finally {
            stopLoading("settings", settingIndex);
        }
    };

    const handleUploadSettingImage = async (
        settingIndex: number,
        file: File,
    ) => {
        if (!scenario) return;

        setErrorMessage(null);
        startLoading("settings", settingIndex);

        try {
            const resizedImageGcsUri = await uploadImageFile(file);

            const result = await syncSettingFromImageAction(
                scenario,
                scenario.settings[settingIndex].name,
                scenario.settings[settingIndex].description,
                resizedImageGcsUri,
                scenario.settings,
                settings.llmModel,
                settings.thinkingBudget,
                settings.imageModel,
            );

            if (result.updatedSetting) {
                return {
                    ...result.updatedSetting,
                    imageGcsUri: result.newImageGcsUri,
                };
            } else {
                return {
                    imageGcsUri: result.newImageGcsUri,
                };
            }
        } catch (error) {
            clientLogger.error("Error uploading setting image:", error);
            const message =
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred while uploading the setting image";
            setErrorMessage(message);
            toast.error(message);
        } finally {
            stopLoading("settings", settingIndex);
        }
    };

    const handleRegeneratePropImage = async (
        propIndex: number,
        name: string,
        description: string,
    ) => {
        if (!scenario) return;

        startLoading("props", propIndex);
        setErrorMessage(null);
        try {
            const { newImageGcsUri } = await regeneratePropImageAction(
                scenario,
                name,
                description,
                settings.imageModel,
            );

            return {
                name,
                description,
                imageGcsUri: newImageGcsUri,
            };
        } catch (error) {
            clientLogger.error("Error regenerating prop image:", error);
            const message = `Failed to regenerate prop image: ${error instanceof Error ? error.message : "Unknown error"}`;
            setErrorMessage(message);
            toast.error(message);
        } finally {
            stopLoading("props", propIndex);
        }
    };

    const handleUploadPropImage = async (propIndex: number, file: File) => {
        if (!scenario) return;

        setErrorMessage(null);
        startLoading("props", propIndex);

        try {
            const resizedImageGcsUri = await uploadImageFile(file);

            const result = await syncPropFromImageAction(
                scenario,
                scenario.props[propIndex].name,
                scenario.props[propIndex].description,
                resizedImageGcsUri,
                scenario.props,
                settings.llmModel,
                settings.thinkingBudget,
                settings.imageModel,
            );

            if (result.updatedProp) {
                return {
                    ...result.updatedProp,
                    imageGcsUri: result.newImageGcsUri,
                };
            } else {
                return {
                    imageGcsUri: result.newImageGcsUri,
                };
            }
        } catch (error) {
            clientLogger.error("Error uploading prop image:", error);
            const message =
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred while uploading the prop image";
            setErrorMessage(message);
            toast.error(message);
        } finally {
            stopLoading("props", propIndex);
        }
    };

    return {
        handleGenerateStoryBoard,
        handleRegenerateCharacterImage,
        handleUploadCharacterImage,
        handleRegenerateSettingImage,
        handleUploadSettingImage,
        handleRegeneratePropImage,
        handleUploadPropImage,
    };
}
