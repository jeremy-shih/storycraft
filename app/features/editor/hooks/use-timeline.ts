import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { useDebounce } from "@/app/features/shared/hooks/use-debounce";
import {
    useSaveTimelineMutation,
    useResetTimelineMutation,
    fetchTimeline,
} from "./use-timeline-query";
import { TimelineLayer } from "@/app/types";

export function useTimeline() {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    const saveMutation = useSaveTimelineMutation();
    const resetMutation = useResetTimelineMutation();

    const loadTimeline = useCallback(async (scenarioId: string) => {
        return fetchTimeline(scenarioId);
    }, []);

    const saveTimeline = useCallback(
        (scenarioId: string, layers: TimelineLayer[]) => {
            if (!isAuthenticated) return;
            saveMutation.mutate({ scenarioId, layers });
        },
        [isAuthenticated, saveMutation],
    );

    const saveTimelineDebounced = useDebounce(saveTimeline, 2000);

    const resetTimeline = useCallback(
        async (scenarioId: string) => {
            if (!isAuthenticated) return;
            await resetMutation.mutateAsync(scenarioId);
        },
        [isAuthenticated, resetMutation],
    );

    return {
        saveTimelineDebounced,
        loadTimeline,
        resetTimeline,
        isAuthenticated,
    };
}
