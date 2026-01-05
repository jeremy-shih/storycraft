import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    getGcsDestination,
    uploadBufferToGcs,
} from "@/lib/utils/storage-utils";

const { mockBucket, mockFile, mockSave } = vi.hoisted(() => {
    const mockSave = vi.fn().mockResolvedValue(undefined);
    const mockFile = vi.fn().mockReturnValue({
        save: mockSave,
        cloudStorageURI: { href: "gs://test-bucket/test-path/test-file.mp3" },
    });
    const mockBucket = vi.fn().mockReturnValue({
        file: mockFile,
    });
    return { mockBucket, mockFile, mockSave };
});

vi.mock("@/lib/storage/storage", () => ({
    storage: {
        bucket: mockBucket,
    },
}));

describe("storage-utils", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset env var for consistent testing
        process.env.GCS_VIDEOS_STORAGE_URI = "gs://test-bucket/test-path";
    });

    describe("getGcsDestination", () => {
        it("should extract bucket name and destination path correctly", () => {
            const fileName = "test-file.mp3";
            const result = getGcsDestination(fileName);

            expect(result).toEqual({
                bucketName: "test-bucket",
                destinationPath: "test-path/test-file.mp3",
            });
        });

        it("should handle root bucket paths", () => {
            process.env.GCS_VIDEOS_STORAGE_URI = "gs://root-bucket";
            const fileName = "file.txt";
            const result = getGcsDestination(fileName);

            expect(result).toEqual({
                bucketName: "root-bucket",
                destinationPath: "file.txt",
            });
        });
    });

    describe("uploadBufferToGcs", () => {
        it("should upload buffer to GCS and return URI", async () => {
            const buffer = Buffer.from("test content");
            const fileName = "test-file.mp3";
            const contentType = "audio/mpeg";

            const result = await uploadBufferToGcs(
                buffer,
                fileName,
                contentType,
            );

            expect(mockBucket).toHaveBeenCalledWith("test-bucket");
            expect(mockFile).toHaveBeenCalledWith("test-path/test-file.mp3");
            expect(mockSave).toHaveBeenCalledWith(buffer, {
                metadata: { contentType },
            });
            expect(result).toBe("gs://test-bucket/test-path/test-file.mp3");
        });
    });
});
