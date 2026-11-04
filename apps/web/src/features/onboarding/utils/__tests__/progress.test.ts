import { describe, expect, it } from "vitest";
import { ONBOARDING_TASKS } from "@standin/contracts";
import {
    areAllTasksDone,
    countDoneTasks,
    isTaskDone,
    withTaskDone,
} from "../progress";

const FIRST = "2026-01-01T00:00:00.000Z";
const LATER = "2026-02-02T00:00:00.000Z";

describe("progress", () => {
    it("counts nothing when the progress is not loaded", () => {
        expect(countDoneTasks(undefined)).toBe(0);
        expect(isTaskDone(undefined, ONBOARDING_TASKS.CLAIM_DESK)).toBe(false);
    });

    it("counts the tasks that have a completion", () => {
        const progress = {
            [ONBOARDING_TASKS.CLAIM_DESK]: { completedAt: FIRST },
            [ONBOARDING_TASKS.HANG_OUT]: { completedAt: FIRST },
        };
        expect(countDoneTasks(progress)).toBe(2);
        expect(areAllTasksDone(progress)).toBe(false);
    });

    it("knows when every task is done", () => {
        const progress = Object.fromEntries(
            Object.values(ONBOARDING_TASKS).map((key) => [
                key,
                { completedAt: FIRST },
            ])
        );
        expect(areAllTasksDone(progress)).toBe(true);
    });

    it("adds a task without touching the others", () => {
        const before = {
            [ONBOARDING_TASKS.HANG_OUT]: { completedAt: FIRST },
        };
        const after = withTaskDone(before, ONBOARDING_TASKS.CLAIM_DESK, LATER);
        expect(after).toEqual({
            [ONBOARDING_TASKS.HANG_OUT]: { completedAt: FIRST },
            [ONBOARDING_TASKS.CLAIM_DESK]: { completedAt: LATER },
        });
    });

    it("keeps the first completion time", () => {
        const before = {
            [ONBOARDING_TASKS.CLAIM_DESK]: { completedAt: FIRST },
        };
        const after = withTaskDone(before, ONBOARDING_TASKS.CLAIM_DESK, LATER);
        expect(after).toBe(before);
    });
});
