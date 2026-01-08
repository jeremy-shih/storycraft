"use client";

import { useScenarioStore } from "@/app/features/scenario/stores/useScenarioStore";
import { useLoadingStore } from "@/app/features/shared/stores/useLoadingStore";
import { useCreateActions } from "@/app/features/create/hooks/use-create-actions";
import { type Language } from "@/app/types";
import { useShallow } from "zustand/react/shallow";

export function useCreateTabState() {
    const { scenario, numScenes, errorMessage, setField, updateScenario } =
        useScenarioStore(
            useShallow((state) => ({
                scenario: state.scenario,
                numScenes: state.numScenes,
                errorMessage: state.errorMessage,
                setField: state.setField,
                updateScenario: state.updateScenario,
            })),
        );

    const { scenario: isLoading } = useLoadingStore(
        useShallow((state) => ({ scenario: state.scenario })),
    );
    const { handleGenerateScenario } = useCreateActions();

    const {
        name,
        pitch,
        style,
        aspectRatio,
        durationSeconds,
        language,
        styleImageUri,
    } = scenario;

    const totalLength = numScenes * durationSeconds;

    const setName = (val: string) => updateScenario({ name: val });
    const setPitch = (val: string) => updateScenario({ pitch: val });
    const setNumScenes = (val: number) => setField("numScenes", val);
    const setStyle = (val: string) => updateScenario({ style: val });
    const setAspectRatio = (val: string) =>
        updateScenario({ aspectRatio: val });
    const setDurationSeconds = (val: number) =>
        updateScenario({ durationSeconds: val });
    const setLanguage = (val: Language) => updateScenario({ language: val });
    const setStyleImageUri = (val: string | null) =>
        updateScenario({ styleImageUri: val || undefined });

    const canGenerate = pitch.trim() !== "" && name.trim() !== "";

    return {
        name,
        setName,
        pitch,
        setPitch,
        numScenes,
        setNumScenes,
        style,
        setStyle,
        aspectRatio,
        setAspectRatio,
        durationSeconds,
        setDurationSeconds,
        language,
        setLanguage,
        styleImageUri: styleImageUri || null,
        setStyleImageUri,
        errorMessage,
        isLoading,
        totalLength,
        canGenerate,
        handleGenerateScenario,
    };
}
