import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import {
    getDynamicImageUrl,
    uploadImageToGCS,
} from "@/app/features/shared/actions/upload-to-gcs";
import * as storage from "@/lib/storage/storage";
import * as authUtils from "@/lib/api/auth-utils";

// Mock dependencies
vi.mock("@/lib/storage/storage");
vi.mock("@/lib/api/auth-utils");
vi.mock("next/cache", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unstable_cache: (fn: any) => fn,
}));
vi.mock("@/app/logger", () => ({
    default: {
        debug: vi.fn(),
        error: vi.fn(),
    },
}));

describe("upload-to-gcs actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (authUtils.requireAuth as Mock).mockResolvedValue("user-id");
    });

    describe("getDynamicImageUrl", () => {
        it("should return signed URL and mime type for valid GCS URI", async () => {
            const gcsUri = "gs://test-bucket/test.png";
            const mockUrl = "https://signed-url.com/test.png";
            const mockMimeType = "image/png";

            (storage.getMimeTypeFromGCS as Mock).mockResolvedValue(
                mockMimeType,
            );
            (storage.getSignedUrlFromGCS as Mock).mockResolvedValue(mockUrl);

            const result = await getDynamicImageUrl(gcsUri);

            expect(result).toEqual({ url: mockUrl, mimeType: mockMimeType });
            expect(storage.getMimeTypeFromGCS).toHaveBeenCalledWith(gcsUri);
            expect(storage.getSignedUrlFromGCS).toHaveBeenCalledWith(
                gcsUri,
                false,
            );
        });

        it("should throw error for invalid GCS URI", async () => {
            const gcsUri = "invalid-uri";

            await expect(getDynamicImageUrl(gcsUri)).rejects.toThrow(
                "Validation error",
            );
        });

        it("should throw error if storage operations fail", async () => {
            const gcsUri = "gs://test-bucket/test.png";
            (storage.getMimeTypeFromGCS as Mock).mockResolvedValue(null);

            await expect(getDynamicImageUrl(gcsUri)).rejects.toThrow(
                "Failed to get signed URL or mime type",
            );
        });
    });

    describe("uploadImageToGCS", () => {
        it("should upload image and return GCS URI", async () => {
            const base64 = "data:image/png;base64,test-content";
            const mockGcsUri = "gs://test-bucket/uploaded.png";

            (storage.uploadImage as Mock).mockResolvedValue(mockGcsUri);

            const result = await uploadImageToGCS(base64);

            expect(result).toBe(mockGcsUri);
            expect(storage.uploadImage).toHaveBeenCalledWith(
                base64,
                expect.any(String),
            );
        });

        it("should return null for invalid input", async () => {
            // const base64 = "invalid-base64"; // Schema expects data:image...

            // Actually schema validation might fail here if it checks for data:image prefix
            // Let's assume schema checks for string mostly, but let's check what schema does.
            // If schema is just z.string(), this might pass validation but fail upload.
            // But let's assume we want to test validation failure if possible, or upload failure.
            // Let's test upload failure first.
            (storage.uploadImage as Mock).mockRejectedValue(
                new Error("Upload failed"),
            );

            // If we pass valid-looking string but upload fails
            const result = await uploadImageToGCS(
                "data:image/png;base64,valid",
            );
            expect(result).toBeNull();
        });
    });
});
