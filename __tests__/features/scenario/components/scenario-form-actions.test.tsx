import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ScenarioFormActions } from "@/app/features/scenario/components/scenario-form-actions";

describe("ScenarioFormActions", () => {
    const defaultProps = {
        onSave: vi.fn(),
        onCancel: vi.fn(),
        onDelete: vi.fn(),
        isSaving: false,
    };

    it("renders all buttons", () => {
        render(<ScenarioFormActions {...defaultProps} />);
        expect(screen.getByText(/Save/i)).toBeDefined();
        expect(screen.getByText(/Cancel/i)).toBeDefined();
        expect(screen.getByText(/Delete/i)).toBeDefined();
    });

    it("calls respective handlers when buttons are clicked", () => {
        render(<ScenarioFormActions {...defaultProps} />);

        fireEvent.click(screen.getByText(/Save/i));
        expect(defaultProps.onSave).toHaveBeenCalled();

        fireEvent.click(screen.getByText(/Cancel/i));
        expect(defaultProps.onCancel).toHaveBeenCalled();

        fireEvent.click(screen.getByText(/Delete/i));
        expect(defaultProps.onDelete).toHaveBeenCalled();
    });

    it("shows loading state on save button", () => {
        render(<ScenarioFormActions {...defaultProps} isSaving={true} />);
        const saveBtn = screen.getByRole("button", { name: /Saving/i });
        expect(saveBtn).toHaveProperty("disabled", true);
    });
});
