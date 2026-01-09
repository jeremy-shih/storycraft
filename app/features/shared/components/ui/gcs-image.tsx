"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { memo, useState } from "react";
import { clientLogger } from "@/lib/utils/client-logger";
import { Skeleton } from "@/components/ui/skeleton";

interface GcsImageProps {
    gcsUri: string | null;
    alt: string;
    className?: string;
    fill?: boolean;
    sizes?: string;
    priority?: boolean;
}

export const GcsImage = memo(function GcsImage({
    gcsUri,
    alt,
    className,
    fill = true,
    sizes,
    priority = false,
}: GcsImageProps) {
    const [retryCount, setRetryCount] = useState(0);

    const { data: imageData, isLoading } = useQuery({
        queryKey: ["image", gcsUri, retryCount],
        queryFn: async () => {
            if (!gcsUri) {
                return null;
            }
            if (!gcsUri.startsWith("gs://")) {
                clientLogger.error("Invalid GCS URI format:", gcsUri);
                return null;
            }
            try {
                const refresh = retryCount > 0;
                const response = await fetch(
                    `/api/media?uri=${encodeURIComponent(gcsUri)}${refresh ? "&refresh=true" : ""}`,
                );
                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch image URL: ${response.status}`,
                    );
                }
                const result = await response.json();
                return result;
            } catch (error) {
                clientLogger.error("Error fetching image URL:", error);
                throw error;
            }
        },
        enabled: !!gcsUri,
        // prevent infinite loop if backend error
        retry: (failureCount, error) => {
            if (error instanceof Error && error.message.includes("400"))
                return false;
            return failureCount < 2;
        },
        staleTime: retryCount > 0 ? 0 : 60 * 1000 * 10, // 10 minutes to match API cache, 0 if retrying
    });

    const imageUrl = imageData?.url || null;

    if (isLoading) {
        return (
            <div
                className={`relative h-full w-full overflow-hidden ${className}`}
            >
                <Skeleton className="absolute inset-0 h-full w-full" />
            </div>
        );
    }

    if (!imageUrl) {
        return (
            <div
                className={`bg-muted relative h-full w-full overflow-hidden ${className}`}
            >
                <Image
                    src="/placeholder.svg"
                    alt={alt}
                    className={className}
                    fill={fill}
                    sizes={sizes}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                        target.onerror = null; // Prevent infinite loop
                    }}
                />
            </div>
        );
    }

    return (
        <div
            className={`relative h-full w-full overflow-hidden bg-black ${className}`}
        >
            <Image
                src={imageUrl}
                alt={alt}
                className={className}
                fill={fill}
                sizes={sizes}
                priority={priority}
                onError={(e) => {
                    if (retryCount < 1) {
                        clientLogger.warn(
                            "Image failed to load, retrying with refresh...",
                            gcsUri,
                        );
                        setRetryCount((prev) => prev + 1);
                    } else {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                        target.onerror = null; // Prevent infinite loop
                    }
                }}
            />
        </div>
    );
});
