import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadImage } from "@/lib/storage/storage";

const mocks = vi.hoisted(() => {
    const mockSave = vi.fn().mockResolvedValue(undefined);
    const mockFile = vi.fn(() => ({
        save: mockSave,
    }));
    const mockBucket = vi.fn(() => ({
        file: mockFile,
    }));
    return {
        mockSave,
        mockFile,
        mockBucket,
    };
});

vi.mock("@google-cloud/storage", () => {
    return {
        Storage: class {
            bucket = mocks.mockBucket;
        },
    };
});

// Mock env
vi.mock("@/lib/utils/env", () => ({
    env: {
        PROJECT_ID: "test-project",
        GCS_VIDEOS_STORAGE_URI: "gs://test-bucket/videos",
    },
}));

vi.mock("@/app/logger", () => ({
    default: {
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}));

describe("uploadImage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should parse data URI correctly", async () => {
        const base64 = "data:image/jpeg;base64,SGVsbG8gV29ybGQ="; // "Hello World"
        const filename = "test.jpg";

        await uploadImage(base64, filename);

        expect(mocks.mockSave).toHaveBeenCalledWith(
            expect.any(Buffer),
            expect.objectContaining({
                metadata: expect.objectContaining({
                    contentType: "image/jpeg",
                }),
            }),
        );

        // Verify buffer content
        const buffer = mocks.mockSave.mock.calls[0][0];
        expect(buffer.toString()).toBe("Hello World");
    });

    it("should handle huge strings", async () => {
        // Create a large string (e.g. 5MB)
        const hugeData = "A".repeat(5 * 1024 * 1024);
        const base64 = `data:image/png;base64,${Buffer.from(hugeData).toString("base64")}`;
        const filename = "huge.png";

        await uploadImage(base64, filename);

        expect(mocks.mockSave).toHaveBeenCalled();
    });
});
