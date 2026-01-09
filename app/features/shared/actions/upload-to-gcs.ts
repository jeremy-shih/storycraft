"use server";

import {
    getMimeTypeFromGCS,
    getSignedUrlFromGCS,
    uploadImage,
} from "@/lib/storage/storage";
import { unstable_cache as cache } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import logger from "@/app/logger";
import {
    getDynamicImageUrlSchema,
    uploadImageToGCSSchema,
} from "@/app/schemas";
import { requireAuth } from "@/lib/api/auth-utils";
import { validateActionInput } from "@/lib/utils/validation";

/**
 * Server Action to securely get a signed URL for a GCS object.
 * Uses unstable_cache for time-based caching.
 *
 * @param gcsUri The gs:// URI of the object.
 * @returns A promise that resolves to the signed URL string, or null if an error occurs or URI is invalid.
 */
export async function getDynamicImageUrl(
    gcsUri: string,
    download: boolean = false,
    refresh: boolean = false,
): Promise<{ url: string; mimeType: string }> {
    await requireAuth();
    validateActionInput(
        { gcsUri, download, refresh },
        getDynamicImageUrlSchema,
        "Validation error in getDynamicImageUrl",
    );

    // Call the cached function
    logger.debug(`getDynamicImageUrl: ${gcsUri} (refresh: ${refresh})`);

    const cacheFn = cache(
        async (
            uri: string,
            dl: boolean,
        ): Promise<{ url: string; mimeType: string }> => {
            logger.debug(`CACHE MISS: Fetching signed URL for ${uri}`);
            if (!uri || !uri.startsWith("gs://")) {
                logger.error(
                    `Invalid GCS URI passed to cached function: ${uri}`,
                );
                throw new Error(`Invalid GCS URI: ${uri}`);
            }
            try {
                // get mime type from gcs uri
                const mimeType = await getMimeTypeFromGCS(uri);
                // Call the original GCS function
                const url = await getSignedUrlFromGCS(uri, dl);

                if (!mimeType || !url) {
                    throw new Error("Failed to get signed URL or mime type");
                }

                return { url, mimeType };
            } catch (error) {
                logger.error(
                    `Error getting signed URL for ${uri} inside cache function:`,
                    error,
                );
                throw error;
            }
        },
        ["gcs-signed-url", gcsUri, String(download)], // Unique key per URI and download flag
        {
            revalidate: 60 * 45, // Revalidate every 45 minutes (2700 seconds) - Leaves 15m buffer with 60m expiry
            tags: ["gcs-url", gcsUri],
        },
    );

    if (refresh) {
        // When refreshing, we want to bypass the cache.
        logger.debug(`Refreshing signed URL for ${gcsUri} (bypassing cache)`);
        const mimeType = await getMimeTypeFromGCS(gcsUri);
        const url = await getSignedUrlFromGCS(gcsUri, download);

        if (!mimeType || !url) {
            throw new Error("Failed to refresh signed URL or mime type");
        }

        return { url, mimeType };
    }

    return cacheFn(gcsUri, download);
}

export async function uploadImageToGCS(base64: string): Promise<string | null> {
    await requireAuth();
    validateActionInput(
        { base64 },
        uploadImageToGCSSchema,
        "Validation error in uploadImageToGCS",
    );
    try {
        const gcsUri = await uploadImage(base64, uuidv4());
        return gcsUri;
    } catch (error) {
        logger.error("Error uploading image to GCS:", error);
        return null;
    }
}
