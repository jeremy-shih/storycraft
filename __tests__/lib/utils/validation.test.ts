import { describe, it, expect } from "vitest";
import { validateInput, validateActionInput } from "@/lib/utils/validation";
import { z } from "zod";

describe("validation utils", () => {
    const testSchema = z.object({
        name: z.string(),
        age: z.number(),
    });

    describe("validateInput", () => {
        it("should return success and data for valid input", () => {
            const input = { name: "John", age: 30 };
            const result = validateInput(input, testSchema);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(input);
            }
        });

        it("should return error response for invalid input", () => {
            const input = { name: "John", age: "invalid" };
            const result = validateInput(input, testSchema);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errorResponse).toBeDefined();
                expect(result.errorResponse.status).toBe(400);
            }
        });
    });

    describe("validateActionInput", () => {
        it("should return data for valid input", () => {
            const input = { name: "John", age: 30 };
            const result = validateActionInput(input, testSchema);

            expect(result).toEqual(input);
        });

        it("should throw error for invalid input", () => {
            const input = { name: "John", age: "invalid" };

            expect(() =>
                validateActionInput(input, testSchema, "Custom Error"),
            ).toThrow("Custom Error");
        });
    });
});
