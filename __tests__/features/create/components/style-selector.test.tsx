import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StyleSelector } from "@/app/features/create/components/style-selector";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as storageActions from "@/app/features/shared/actions/storageActions";
import * as analyzeActions from "@/app/features/create/actions/analyze-style";
import { toast } from "sonner";

// Mock dependencies
vi.mock("@/app/features/shared/actions/storageActions", () => ({
    uploadStyleImageToGCS: vi.fn(),
    getSignedUrlAction: vi.fn(),
}));

vi.mock("@/app/features/create/actions/analyze-style", () => ({
    analyzeStyleImageAction: vi.fn(),
}));

vi.mock("next/image", () => ({
    default: ({ src, alt }: { src: string; alt: string }) => (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={src} alt={alt} />
    ),
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock Upload component icon to avoid issues
vi.mock("lucide-react", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as object),
        Upload: () => <div data-testid="upload-icon" />,
        Plus: () => <div data-testid="plus-icon" />,
        Loader2: () => <div data-testid="loader-icon" />,
        X: () => <div data-testid="close-icon" />,
    };
});

describe("StyleSelector", () => {
    const mockProps = {
        styles: [],
        onSelect: vi.fn(),
        styleImageUri: null,
        onStyleImageUpload: vi.fn(),
        currentStyle: "",
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (
            storageActions.getSignedUrlAction as unknown as ReturnType<
                typeof vi.fn
            >
        ).mockResolvedValue("https://signed-url.com/image.jpg");
    });

    it("should trigger style analysis after image upload", async () => {
        (
            storageActions.uploadStyleImageToGCS as unknown as ReturnType<
                typeof vi.fn
            >
        ).mockResolvedValue("gs://bucket/image.jpg");
        (
            analyzeActions.analyzeStyleImageAction as unknown as ReturnType<
                typeof vi.fn
            >
        ).mockResolvedValue({
            success: true,
            description: "Generated style description",
        });

        render(<StyleSelector {...mockProps} />);

        // Open dialog
        fireEvent.click(screen.getByText("Custom"));

        // Simulate file upload
        const file = new File(["dummy content"], "test.png", {
            type: "image/png",
        });
        // Use getByTestId or label for better selection if possible, but the label has "Click to upload..."
        const input = screen.getByLabelText(
            /Click to upload a reference image/i,
        );

        // Mock FileReader
        const originalFileReader = window.FileReader;
        // @ts-expect-error - mocking window.FileReader for testing
        window.FileReader = class {
            readAsDataURL() {
                // @ts-expect-error - onloadend exists on FileReader
                this.onloadend();
            }
            result = "base64-data";
        };

        fireEvent.change(input, { target: { files: [file] } });

        // Wait for upload and analysis
        await waitFor(() => {
            expect(storageActions.uploadStyleImageToGCS).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(analyzeActions.analyzeStyleImageAction).toHaveBeenCalledWith(
                "gs://bucket/image.jpg",
            );
        });

        // Check if description is updated
        expect(
            screen.getByDisplayValue("Generated style description"),
        ).toBeInTheDocument();

        // Restore FileReader
        window.FileReader = originalFileReader;
    });

    it("should show analyzing state during processing", async () => {
        (
            storageActions.uploadStyleImageToGCS as unknown as ReturnType<
                typeof vi.fn
            >
        ).mockResolvedValue("gs://bucket/image.jpg");

        // Delay analysis response
        (
            analyzeActions.analyzeStyleImageAction as unknown as ReturnType<
                typeof vi.fn
            >
        ).mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(
                        () => resolve({ success: true, description: "desc" }),
                        100,
                    ),
                ),
        );

        render(<StyleSelector {...mockProps} />);
        fireEvent.click(screen.getByText("Custom"));

        const file = new File(["dummy content"], "test.png", {
            type: "image/png",
        });
        const input = screen.getByLabelText(
            /Click to upload a reference image/i,
        );

        // Mock FileReader
        const originalFileReader = window.FileReader;
        // @ts-expect-error - mocking window.FileReader for testing
        window.FileReader = class {
            readAsDataURL() {
                // @ts-expect-error - onloadend exists on FileReader
                this.onloadend();
            }
            result = "base64-data";
        };

        fireEvent.change(input, { target: { files: [file] } });

        // Check for analyzing state (disabled textarea or placeholder)
        await waitFor(() => {
            expect(
                screen.getByPlaceholderText(/Analyzing visual style/i),
            ).toBeInTheDocument();
        });

        // Restore FileReader
        window.FileReader = originalFileReader;
    });

    it("should handle analysis failure gracefully", async () => {
        (
            storageActions.uploadStyleImageToGCS as unknown as ReturnType<
                typeof vi.fn
            >
        ).mockResolvedValue("gs://bucket/image.jpg");
        (
            analyzeActions.analyzeStyleImageAction as unknown as ReturnType<
                typeof vi.fn
            >
        ).mockResolvedValue({
            success: false,
            error: "Analysis failed",
        });

        render(<StyleSelector {...mockProps} />);
        fireEvent.click(screen.getByText("Custom"));

        const file = new File(["dummy content"], "test.png", {
            type: "image/png",
        });
        const input = screen.getByLabelText(
            /Click to upload a reference image/i,
        );

        const originalFileReader = window.FileReader;
        // @ts-expect-error - mocking window.FileReader for testing
        window.FileReader = class {
            readAsDataURL() {
                // @ts-expect-error - onloadend exists on FileReader
                this.onloadend();
            }
            result = "base64-data";
        };

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(analyzeActions.analyzeStyleImageAction).toHaveBeenCalled();
        });

        // The input should remain empty or current value (empty in this case)
        expect(screen.getByPlaceholderText(/Cinematic/i)).toHaveValue("");
        // Analyzing state should be gone
        expect(
            screen.queryByPlaceholderText(/Analyzing visual style/i),
        ).not.toBeInTheDocument();

        expect(toast.error).toHaveBeenCalledWith("Analysis failed");

        window.FileReader = originalFileReader;
    });
});
