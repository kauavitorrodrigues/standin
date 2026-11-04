import { describe, expect, it } from "vitest";
import {
    ONBOARDING_TASK_KEYS,
    OnboardingProgressSchema,
    OnboardingTaskKeySchema,
} from "..";

describe("OnboardingTaskKeySchema", () => {
    it("accepts every task key", () => {
        for (const key of ONBOARDING_TASK_KEYS) {
            expect(OnboardingTaskKeySchema.safeParse(key).success).toBe(true);
        }
    });

    it("rejects a key that is not a task", () => {
        expect(OnboardingTaskKeySchema.safeParse("dance").success).toBe(false);
        expect(OnboardingTaskKeySchema.safeParse("").success).toBe(false);
    });
});

describe("OnboardingProgressSchema", () => {
    it("accepts a partial progress", () => {
        const parsed = OnboardingProgressSchema.safeParse({
            "claim-desk": { completedAt: "2026-11-04T10:00:00.000Z" },
        });
        expect(parsed.success).toBe(true);
    });
});
