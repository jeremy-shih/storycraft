import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ScenarioUpdateConfirmationDialog } from "@/app/features/scenario/components/scenario-update-confirmation-dialog";

describe("ScenarioUpdateConfirmationDialog", () => {
    const defaultProps = {
        open: true,
        onOpenChange: vi.fn(),
        onConfirm: vi.fn(),
        onDecline: vi.fn(),
    };

    it("renders correctly", () => {
        render(<ScenarioUpdateConfirmationDialog {...defaultProps} />);
        expect(screen.getByText("Update Scenario Text?")).toBeDefined();
        expect(
            screen.getByText(/Do you want to modify the scenario/),
        ).toBeDefined();
    });

    it("calls onConfirm when Yes clicked", () => {
        render(<ScenarioUpdateConfirmationDialog {...defaultProps} />);
        fireEvent.click(screen.getByText("Yes, update scenario"));
        expect(defaultProps.onConfirm).toHaveBeenCalled();
        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it("calls onDecline when No clicked", () => {
        render(<ScenarioUpdateConfirmationDialog {...defaultProps} />);
        fireEvent.click(screen.getByText("No, just save entity"));
        expect(defaultProps.onDecline).toHaveBeenCalled();
        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
});
