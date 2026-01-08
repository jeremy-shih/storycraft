"use client";

import { useScenarioStore } from "@/app/features/scenario/stores/useScenarioStore";
import { useEditorStore } from "@/app/features/editor/stores/useEditorStore";
import { useScenario } from "@/app/features/scenario/hooks/use-scenario";
import { Scenario } from "@/app/types";

export function useSidebarActions() {
    const {
        setField,
        setScenario,
        reset: resetScenarioStore,
        isScenarioLoading,
    } = useScenarioStore();
    const {
        setActiveTab,
        setCurrentTime,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
    } = useEditorStore();
    const { setCurrentScenarioId } = useScenario();

    const handleSelectScenario = (
        selectedScenario: Scenario,
        scenarioId?: string,
    ) => {
        if (scenarioId) {
            setCurrentScenarioId(scenarioId);
        }

        setField("isScenarioLoading", true);
        setScenario(selectedScenario);
        setField("numScenes", selectedScenario.scenes?.length || 6);

        const allScenesHaveVideos =
            selectedScenario.scenes &&
            selectedScenario.scenes.length > 0 &&
            selectedScenario.scenes.every((scene) => scene.videoUri);

        if (allScenesHaveVideos) {
            setActiveTab("editor");
        } else if (
            selectedScenario.scenes &&
            selectedScenario.scenes.length > 0
        ) {
            setActiveTab("storyboard");
        } else {
            setActiveTab("scenario");
        }
    };

    const handleCreateNewStory = () => {
        resetScenarioStore();
        setCurrentTime(0);
        setCurrentScenarioId(null);
        setActiveTab("create");
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return {
        handleSelectScenario,
        handleCreateNewStory,
        toggleSidebar,
        isCollapsed: isSidebarCollapsed,
        isScenarioLoading,
    };
}
