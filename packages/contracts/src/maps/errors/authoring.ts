import { BaseError } from "../../errors/base";

const STEP_OPS_DID_NOT_REPLAY_STATUS = 500;

// A builder answered ops that do not replay on the model it was given. A
// builder replays its own ops before answering, so this is a bug in it.
export class StepOpsDidNotReplayError extends BaseError {
    constructor(stepIndex: number) {
        super(
            `Step ${stepIndex} built ops that do not replay.`,
            "AUTHORING_STEP_OPS_DID_NOT_REPLAY",
            STEP_OPS_DID_NOT_REPLAY_STATUS
        );
    }
}
