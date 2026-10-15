import type { PublishResult } from "@standin/contracts";
import type { ReleasedDesk } from "./released-desk";

export type PublishOutcome = {
    result: PublishResult;
    // Desks that lost their owner. The controller emits desk_released for each
    // one after the commit. Empty when the answer is a repeated publish.
    releasedDesks: ReleasedDesk[];
};
