/**
 * Extracts a readable error message from an unknown error object.
 * @param error The error object
 * @param fallback Fallback message if error is not an Error instance
 */
export function getErrorMessage(
    error: unknown,
    fallback: string = "An unknown error occurred",
): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
    ) {
        return (error as { message: string }).message;
    }
    return fallback;
}
