"use client";

import { useScenarioStore } from "@/app/features/scenario/stores/useScenarioStore";
import { useLoadingStore } from "@/app/features/shared/stores/useLoadingStore";
import { useCreateActions } from "@/app/features/create/hooks/use-create-actions";
import { type Language } from "@/app/types";
import { useShallow } from "zustand/react/shallow";

export function useCreateTabState() {
    const {
        name,
        pitch,
        numScenes,
        style,
        aspectRatio,
        durationSeconds,
        language,
        styleImageUri,
        errorMessage,
        setField,
    } = useScenarioStore(
        useShallow((state) => ({
            name: state.name,
            pitch: state.pitch,
            numScenes: state.numScenes,
            style: state.style,
            aspectRatio: state.aspectRatio,
            durationSeconds: state.durationSeconds,
            language: state.language,
            styleImageUri: state.styleImageUri,
            errorMessage: state.errorMessage,
            setField: state.setField,
        })),
    );

    const { scenario: isLoading } = useLoadingStore(
        useShallow((state) => ({ scenario: state.scenario })),
    );
    const { handleGenerateScenario } = useCreateActions();

    const totalLength = numScenes * durationSeconds;

    const setName = (val: string) => setField("name", val);
    const setPitch = (val: string) => setField("pitch", val);
    const setNumScenes = (val: number) => setField("numScenes", val);
    const setStyle = (val: string) => setField("style", val);
    const setAspectRatio = (val: string) => setField("aspectRatio", val);
    const setDurationSeconds = (val: number) =>
        setField("durationSeconds", val);
    const setLanguage = (val: Language) => setField("language", val);
    const setStyleImageUri = (val: string | null) =>
        setField("styleImageUri", val);

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
        styleImageUri,
        setStyleImageUri,
        errorMessage,
        isLoading,
        totalLength,
        canGenerate,
        handleGenerateScenario,
    };
}
