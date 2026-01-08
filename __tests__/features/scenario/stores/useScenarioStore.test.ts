import { describe, it, expect, beforeEach, vi, beforeAll } from "vitest";
import { Scenario } from "@/app/types";

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

vi.stubGlobal("localStorage", localStorageMock);

describe("useScenarioStore", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let useScenarioStore: any;

    beforeAll(async () => {
        // Import the store AFTER mocking localStorage
        const storeModule =
            await import("@/app/features/scenario/stores/useScenarioStore");
        useScenarioStore = storeModule.useScenarioStore;
    });

    beforeEach(() => {
        useScenarioStore.getState().reset();
    });

    it("should have initial state", () => {
        const state = useScenarioStore.getState();
        expect(state.currentScenarioId).toBeNull();
        expect(state.scenario.pitch).toBe("");
        expect(state.scenario.style).toBe("Photographic");
        expect(state.scenario).toBeDefined();
    });

    it("should update scenario fields using updateScenario", () => {
        useScenarioStore.getState().updateScenario({
            name: "Test Scenario",
            durationSeconds: 15,
        });

        const state = useScenarioStore.getState();
        expect(state.scenario.name).toBe("Test Scenario");
        expect(state.scenario.durationSeconds).toBe(15);
    });

    it("should set scenario", () => {
        const mockScenario = {
            id: "123",
            name: "Mock",
            scenes: [],
        } as unknown as Scenario;
        useScenarioStore.getState().setScenario(mockScenario);

        expect(useScenarioStore.getState().scenario).toEqual(mockScenario);
    });

    it("should set error message", () => {
        useScenarioStore.getState().setErrorMessage("Error occurred");
        expect(useScenarioStore.getState().errorMessage).toBe("Error occurred");
    });

    it("should reset to initial state", () => {
        useScenarioStore.getState().updateScenario({ name: "Modified" });
        useScenarioStore.getState().setErrorMessage("Some error");
        useScenarioStore.getState().reset();

        const state = useScenarioStore.getState();
        expect(state.scenario.name).toBe("");
        expect(state.errorMessage).toBeNull();
    });
});
