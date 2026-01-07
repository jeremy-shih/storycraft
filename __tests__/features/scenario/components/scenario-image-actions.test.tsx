import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ScenarioImageActions } from "@/app/features/scenario/components/scenario-image-actions";

describe("ScenarioImageActions", () => {
    const defaultProps = {
        onRegenerate: vi.fn(),
        onUpload: vi.fn(),
        isLoading: false,
        entityType: "character",
    };

    it("renders both buttons", () => {
        render(<ScenarioImageActions {...defaultProps} />);
        expect(screen.getByText(/Regenerate/i)).toBeDefined();
        expect(screen.getByText(/Upload/i)).toBeDefined();
    });

    it("calls onRegenerate when button is clicked", () => {
        render(<ScenarioImageActions {...defaultProps} />);
        fireEvent.click(screen.getByText(/Regenerate/i));
        expect(defaultProps.onRegenerate).toHaveBeenCalled();
    });

    it("disables buttons when isLoading is true", () => {
        render(<ScenarioImageActions {...defaultProps} isLoading={true} />);
        expect(
            screen.getByRole("button", { name: /Regenerate/i }),
        ).toHaveProperty("disabled", true);
        expect(screen.getByRole("button", { name: /Upload/i })).toHaveProperty(
            "disabled",
            true,
        );
    });
});
