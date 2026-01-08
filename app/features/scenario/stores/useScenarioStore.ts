import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Scenario, Language } from "@/app/types";

const DEFAULT_LANGUAGE: Language = {
    name: "English (United States)",
    code: "en-US",
};

interface ScenarioState {
    // Session state
    currentScenarioId: string | null;
    isScenarioLoading: boolean;

    // Transient Form state (not in Scenario interface)
    numScenes: number;
    withVoiceOver: boolean;

    // Source of Truth
    scenario: Scenario;
    errorMessage: string | null;
    videoUri: string | null;
    vttUri: string | null;

    // Actions
    setField: <K extends keyof ScenarioState>(
        field: K,
        value: ScenarioState[K],
    ) => void;
    updateScenario: (updates: Partial<Scenario>) => void;
    setScenario: (scenario: Scenario | undefined) => void;
    setErrorMessage: (message: string | null) => void;
    setVideoUri: (uri: string | null) => void;
    setVttUri: (uri: string | null) => void;
    reset: () => void;
}

const initialScenario: Scenario = {
    name: "",
    pitch: "",
    scenario: "",
    style: "Photographic",
    aspectRatio: "16:9",
    durationSeconds: 8,
    genre: "",
    mood: "",
    music: "",
    language: DEFAULT_LANGUAGE,
    characters: [],
    settings: [],
    props: [],
    scenes: [],
};

const initialState = {
    currentScenarioId: null,
    isScenarioLoading: false,
    numScenes: 6,
    withVoiceOver: false,
    scenario: initialScenario,
    errorMessage: null,
    videoUri: null,
    vttUri: null,
};

export const useScenarioStore = create<ScenarioState>()(
    devtools(
        persist(
            (set) => ({
                ...initialState,

                setField: (field, value) =>
                    set(
                        (state) => ({ ...state, [field]: value }),
                        false,
                        `set_${field}`,
                    ),

                updateScenario: (updates) =>
                    set(
                        (state) => ({
                            ...state,
                            scenario: { ...state.scenario, ...updates },
                        }),
                        false,
                        "updateScenario",
                    ),

                setScenario: (scenario) =>
                    set(
                        (state) => ({
                            ...state,
                            scenario: scenario
                                ? { ...scenario, scenes: scenario.scenes || [] }
                                : initialScenario,
                        }),
                        false,
                        "setScenario",
                    ),

                setErrorMessage: (errorMessage) => {
                    set({ errorMessage }, false, "setErrorMessage");
                },

                setVideoUri: (videoUri) =>
                    set({ videoUri }, false, "setVideoUri"),

                setVttUri: (vttUri) => set({ vttUri }, false, "setVttUri"),

                reset: () => set(initialState, false, "reset"),
            }),
            {
                name: "scenario-storage",
                partialize: (state) => ({
                    numScenes: state.numScenes,
                    withVoiceOver: state.withVoiceOver,
                    scenario: state.scenario,
                    currentScenarioId: state.currentScenarioId,
                    videoUri: state.videoUri,
                    vttUri: state.vttUri,
                }),
            },
        ),
    ),
);
