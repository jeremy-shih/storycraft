import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useScenarioItemEditor } from "@/app/features/scenario/hooks/use-scenario-item-editor";

describe("useScenarioItemEditor", () => {
    const initialEntity = {
        id: "1",
        name: "Test Entity",
        description: "Test Description",
    };

    it("should initialize with isEditing false and editedEntity matching initial entity", () => {
        const { result } = renderHook(() =>
            useScenarioItemEditor({
                entity: initialEntity,
                onUpdate: vi.fn(),
            }),
        );

        expect(result.current.isEditing).toBe(false);
        expect(result.current.editedEntity).toEqual(initialEntity);
    });

    it("should enter edit mode", () => {
        const { result } = renderHook(() =>
            useScenarioItemEditor({
                entity: initialEntity,
                onUpdate: vi.fn(),
            }),
        );

        act(() => {
            result.current.enterEditMode();
        });

        expect(result.current.isEditing).toBe(true);
    });

    it("should update editedEntity fields", () => {
        const { result } = renderHook(() =>
            useScenarioItemEditor({
                entity: initialEntity,
                onUpdate: vi.fn(),
            }),
        );

        act(() => {
            result.current.updateField("name", "New Name");
        });

        expect(result.current.editedEntity.name).toBe("New Name");
    });

    it("should cancel editing and reset editedEntity", () => {
        const { result } = renderHook(() =>
            useScenarioItemEditor({
                entity: initialEntity,
                onUpdate: vi.fn(),
            }),
        );

        act(() => {
            result.current.enterEditMode();
            result.current.updateField("name", "Changed");
        });

        expect(result.current.editedEntity.name).toBe("Changed");

        act(() => {
            result.current.handleCancel();
        });

        expect(result.current.isEditing).toBe(false);
        expect(result.current.editedEntity).toEqual(initialEntity);
    });

    it("should call onUpdate and exit edit mode on handleSave", async () => {
        const onUpdate = vi.fn().mockResolvedValue(undefined);
        const { result } = renderHook(() =>
            useScenarioItemEditor({
                entity: initialEntity,
                onUpdate,
            }),
        );

        act(() => {
            result.current.enterEditMode();
            result.current.updateField("name", "Saved Name");
        });

        await act(async () => {
            await result.current.handleSave();
        });

        expect(onUpdate).toHaveBeenCalledWith({
            ...initialEntity,
            name: "Saved Name",
        });
        expect(result.current.isEditing).toBe(false);
    });

    it("should stay in edit mode if onUpdate fails", async () => {
        const onUpdate = vi.fn().mockRejectedValue(new Error("Update failed"));
        const { result } = renderHook(() =>
            useScenarioItemEditor({
                entity: initialEntity,
                onUpdate,
            }),
        );

        act(() => {
            result.current.enterEditMode();
        });

        await act(async () => {
            try {
                await result.current.handleSave();
            } catch {
                // Expected error
            }
        });

        expect(result.current.isEditing).toBe(true);
    });
});
