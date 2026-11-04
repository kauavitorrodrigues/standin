import { describe, expect, it } from "vitest";
import { parseOnboardingTasks } from "../utils/parseOnboardingTasks";

const at = "2026-11-04T10:00:00.000Z";

describe("parseOnboardingTasks", () => {
    it("keeps the completed tasks", () => {
        expect(
            parseOnboardingTasks({ "claim-desk": { completedAt: at } })
        ).toEqual({ "claim-desk": { completedAt: at } });
    });

    it("drops a key that is not a task anymore", () => {
        expect(
            parseOnboardingTasks({
                retired: { completedAt: at },
                "hang-out": { completedAt: at },
            })
        ).toEqual({ "hang-out": { completedAt: at } });
    });

    it("drops an invalid entry without hiding the others", () => {
        expect(
            parseOnboardingTasks({
                "claim-desk": { completedAt: "yesterday" },
                "navigate-office": "done",
                "hang-out": { completedAt: at },
            })
        ).toEqual({ "hang-out": { completedAt: at } });
    });

    it("answers empty for a value that is not an object", () => {
        expect(parseOnboardingTasks(null)).toEqual({});
        expect(parseOnboardingTasks([])).toEqual({});
        expect(parseOnboardingTasks("x")).toEqual({});
    });
});
