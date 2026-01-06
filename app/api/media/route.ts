import { NextResponse } from "next/server";
import { getDynamicImageUrlSchema } from "@/app/schemas";
import { getDynamicImageUrl } from "@/app/features/shared/actions/upload-to-gcs";
import logger from "@/app/logger";
import { withAuth } from "@/lib/api/with-auth";
import { validateInput } from "@/lib/utils/validation";
import { errorResponse } from "@/lib/api/response";

export const GET = withAuth(async (req) => {
    const { searchParams } = new URL(req.url);
    const gcsUri = searchParams.get("uri");
    const download = searchParams.get("download") === "true";

    if (!gcsUri) {
        return errorResponse("Missing uri", "VALIDATION_ERROR", 400);
    }

    // Validate using existing schema
    const validation = validateInput(
        { gcsUri, download },
        getDynamicImageUrlSchema,
        "Invalid URI format",
    );

    if (!validation.success) {
        return validation.errorResponse;
    }

    try {
        const result = await getDynamicImageUrl(gcsUri, download);

        return NextResponse.json(result, {
            headers: {
                // cache for 10 minutes (600s)
                // Total age potential = Server Cache (45m) + Client Cache (10m) = 55m < 60m URL validity. Safe.
                "Cache-Control": "private, max-age=600",
            },
        });
    } catch (error) {
        logger.error("Error in URL API:", error);
        return errorResponse(
            "Internal Server Error",
            "INTERNAL_SERVER_ERROR",
            500,
        );
    }
});
