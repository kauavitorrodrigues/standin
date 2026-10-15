import { PublishValidationError, validateDoors } from "@standin/contracts";
import type { EditorModel } from "@standin/contracts";
import { toPublishIssues } from "./toPublishIssues";

// Refuses a model with a door that is not on the border of exactly one
// private zone. The check runs on the replayed model, so the issues point at
// the last operation of the draft, which is the one that produced the state.
export const assertDoorsInRooms = (
    model: EditorModel,
    opCount: number
): void => {
    const issues = validateDoors(model);
    if (issues.length === 0) return;

    throw new PublishValidationError(
        toPublishIssues(Math.max(opCount - 1, 0), issues)
    );
};
