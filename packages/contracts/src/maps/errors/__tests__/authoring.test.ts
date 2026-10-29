import { describe, expect, it } from "vitest";
import { BaseError } from "../../../errors/base";
import { StepOpsDidNotReplayError } from "../authoring";

describe("StepOpsDidNotReplayError", () => {
    const error = new StepOpsDidNotReplayError(3);

    it("is a BaseError with a stable code and status", () => {
        expect(error).toBeInstanceOf(BaseError);
        expect(error).toBeInstanceOf(StepOpsDidNotReplayError);
        expect(error.code).toBe("AUTHORING_STEP_OPS_DID_NOT_REPLAY");
        expect(error.status).toBe(500);
    });

    it("names the step", () => {
        expect(error.message).toBe("Step 3 built ops that do not replay.");
    });
});
