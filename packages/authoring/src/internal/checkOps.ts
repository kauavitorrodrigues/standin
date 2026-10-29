import { replayOps, toPublishIssues } from "@standin/contracts";
import type { EditorModel, EditorOp } from "@standin/contracts";
import type { BuildResult } from "../types";

// Replays the ops of a builder on the model, so a builder only answers ops the
// shared rules accept. The issues keep the index of the op inside the list.
export const checkOps = (model: EditorModel, ops: EditorOp[]): BuildResult => {
    const replayed = replayOps(model, ops);
    if (replayed.ok) return { ok: true, ops };

    return {
        ok: false,
        issues: toPublishIssues(replayed.opIndex, replayed.errors),
    };
};
