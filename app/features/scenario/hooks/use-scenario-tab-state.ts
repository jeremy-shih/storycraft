"use client";

import { useCallback } from "react";
import { useScenarioStore } from "@/app/features/scenario/stores/useScenarioStore";
import { useLoadingStore } from "@/app/features/shared/stores/useLoadingStore";
import { useScenarioActions } from "@/app/features/scenario/hooks/use-scenario-actions";
import {
    deleteCharacterFromScenario,
    deleteSettingFromScenario,
    deletePropFromScenario,
    updateScenarioTextAction,
} from "@/app/features/scenario/actions/modify-scenario";
import { useEntityState } from "./use-entity-state";
import { Character, Prop, Scenario, Setting } from "@/app/types";
import { toast } from "sonner";

export function useScenarioTabState() {
    const { scenario, setScenario } = useScenarioStore();
    const {
        scenario: isGeneratingStoryboard,
        characters: generatingCharacterImages,
        settings: generatingSettingImages,
        props: generatingPropImages,
    } = useLoadingStore();

    const {
        handleGenerateStoryBoard,
        handleRegenerateCharacterImage,
        handleUploadCharacterImage,
        handleRegenerateSettingImage,
        handleUploadSettingImage,
        handleRegeneratePropImage,
        handleUploadPropImage,
    } = useScenarioActions();

    const updateCharacters = useCallback(
        (
            updatedCharacters: Scenario["characters"],
            updatedScenarioText?: string,
        ) => {
            if (scenario) {
                setScenario({
                    ...scenario,
                    characters: updatedCharacters,
                    scenario: updatedScenarioText ?? scenario.scenario,
                });
            }
        },
        [scenario, setScenario],
    );

    const {
        entities: characters,
        isLoading: isCharacterLoading,
        isDeleting: isCharacterDeleting,
        handleUpdate: _handleUpdateCharacter,
        handleAdd: handleAddCharacter,
        handleRemove: handleRemoveCharacter,
        newEntityIndex: newCharacterIndex,
    } = useEntityState({
        entities: scenario?.characters,
        onUpdateEntities: updateCharacters,
        deleteEntityAction: deleteCharacterFromScenario,
        scenarioText: scenario?.scenario,
        entityType: "character",
        defaultNewEntity: {
            name: "",
            description: "",
            voice: "",
        },
        loadingStates: generatingCharacterImages,
    });

    const handleUpdateCharacter = useCallback(
        async (
            index: number,
            updatedCharacter: Character,
            updateScenarioText?: boolean,
        ) => {
            let newScenarioText: string | undefined;
            if (updateScenarioText && scenario) {
                try {
                    newScenarioText = await updateScenarioTextAction(
                        scenario.scenario,
                        scenario.characters[index]?.name || "",
                        updatedCharacter.name,
                        updatedCharacter.description,
                        "character",
                    );
                } catch (e) {
                    console.error("Failed to update scenario text", e);
                    toast.error("Failed to update scenario text");
                }
            }
            _handleUpdateCharacter(index, updatedCharacter, newScenarioText);
        },
        [_handleUpdateCharacter, scenario],
    );

    const updateSettings = useCallback(
        (
            updatedSettings: Scenario["settings"],
            updatedScenarioText?: string,
        ) => {
            if (scenario) {
                setScenario({
                    ...scenario,
                    settings: updatedSettings,
                    scenario: updatedScenarioText ?? scenario.scenario,
                });
            }
        },
        [scenario, setScenario],
    );

    const {
        entities: settings,
        isLoading: isSettingLoading,
        isDeleting: isSettingDeleting,
        handleUpdate: _handleUpdateSetting,
        handleAdd: handleAddSetting,
        handleRemove: handleRemoveSetting,
        newEntityIndex: newSettingIndex,
    } = useEntityState({
        entities: scenario?.settings,
        onUpdateEntities: updateSettings,
        deleteEntityAction: deleteSettingFromScenario,
        scenarioText: scenario?.scenario,
        entityType: "setting",
        defaultNewEntity: {
            name: "",
            description: "",
        },
        loadingStates: generatingSettingImages,
    });

    const handleUpdateSetting = useCallback(
        async (
            index: number,
            updatedSetting: Setting,
            updateScenarioText?: boolean,
        ) => {
            let newScenarioText: string | undefined;
            if (updateScenarioText && scenario) {
                try {
                    newScenarioText = await updateScenarioTextAction(
                        scenario.scenario,
                        scenario.settings[index]?.name || "",
                        updatedSetting.name,
                        updatedSetting.description,
                        "setting",
                    );
                } catch (e) {
                    console.error("Failed to update scenario text", e);
                    toast.error("Failed to update scenario text");
                }
            }
            _handleUpdateSetting(index, updatedSetting, newScenarioText);
        },
        [_handleUpdateSetting, scenario],
    );

    const updateProps = useCallback(
        (updatedProps: Scenario["props"], updatedScenarioText?: string) => {
            if (scenario) {
                setScenario({
                    ...scenario,
                    props: updatedProps,
                    scenario: updatedScenarioText ?? scenario.scenario,
                });
            }
        },
        [scenario, setScenario],
    );

    const {
        entities: props,
        isLoading: isPropLoading,
        isDeleting: isPropDeleting,
        handleUpdate: _handleUpdateProp,
        handleAdd: handleAddProp,
        handleRemove: handleRemoveProp,
        newEntityIndex: newPropIndex,
    } = useEntityState({
        entities: scenario?.props,
        onUpdateEntities: updateProps,
        deleteEntityAction: deletePropFromScenario,
        scenarioText: scenario?.scenario,
        entityType: "prop",
        defaultNewEntity: {
            name: "",
            description: "",
        },
        loadingStates: generatingPropImages,
    });

    const handleUpdateProp = useCallback(
        async (
            index: number,
            updatedProp: Prop,
            updateScenarioText?: boolean,
        ) => {
            let newScenarioText: string | undefined;
            if (updateScenarioText && scenario) {
                try {
                    newScenarioText = await updateScenarioTextAction(
                        scenario.scenario,
                        scenario.props[index]?.name || "",
                        updatedProp.name,
                        updatedProp.description,
                        "prop",
                    );
                } catch (e) {
                    console.error("Failed to update scenario text", e);
                    toast.error("Failed to update scenario text");
                }
            }
            _handleUpdateProp(index, updatedProp, newScenarioText);
        },
        [_handleUpdateProp, scenario],
    );

    const handleUpdateScenarioDescription = useCallback(
        (newDescription: string) => {
            if (scenario) {
                setScenario({ ...scenario, scenario: newDescription });
            }
        },
        [scenario, setScenario],
    );

    const handleUpdateMusic = useCallback(
        (newMusic: string) => {
            if (scenario) {
                setScenario({ ...scenario, music: newMusic });
            }
        },
        [scenario, setScenario],
    );

    return {
        scenario,
        isGeneratingStoryboard,
        handleGenerateStoryBoard,
        handleUpdateScenarioDescription,
        handleUpdateMusic,
        // Characters
        characters,
        isCharacterLoading,
        isCharacterDeleting,
        handleUpdateCharacter,
        handleAddCharacter,
        handleRemoveCharacter,
        handleRegenerateCharacterImage,
        handleUploadCharacterImage,
        newCharacterIndex,
        // Settings
        settings,
        isSettingLoading,
        isSettingDeleting,
        handleUpdateSetting,
        handleAddSetting,
        handleRemoveSetting,
        handleRegenerateSettingImage,
        handleUploadSettingImage,
        newSettingIndex,
        // Props
        props,
        isPropLoading,
        isPropDeleting,
        handleUpdateProp,
        handleAddProp,
        handleRemoveProp,
        handleRegeneratePropImage,
        handleUploadPropImage,
        newPropIndex,
    };
}
