import { StepOpsDidNotReplayError, replayOps } from "@standin/contracts";
import type { EditorModel, EditorOp } from "@standin/contracts";
import type { BuildStep, ComposeResult, ValidateOpsOptions } from "../types";
import { validateOps } from "../validate/validateOps";

/**
 * Runs the steps one after the other, each one on the model the earlier ones
 * left, and answers every op in order. The issues carry the index of the op in
 * the whole list, so they read like the ones the server answers for the same
 * draft. The finished list goes through `validateOps` once more, for the rules
 * that only hold for the whole draft (a door must end up on a room).
 */
export const composeOps = (
    model: EditorModel,
    steps: BuildStep[],
    options?: ValidateOpsOptions
): ComposeResult => {
    let current = model;
    const ops: EditorOp[] = [];
    const stepOfOp: number[] = [];

    for (const [stepIndex, step] of steps.entries()) {
        const built = step(current);
        if (!built.ok) {
            return {
                ok: false,
                stepIndex,
                issues: built.issues.map((found) =>
                    found.opIndex === undefined
                        ? found
                        : { ...found, opIndex: found.opIndex + ops.length }
                ),
            };
        }

        const replayed = replayOps(current, built.ops);
        if (!replayed.ok) throw new StepOpsDidNotReplayError(stepIndex);

        current = replayed.model;
        ops.push(...built.ops);
        stepOfOp.push(...built.ops.map(() => stepIndex));
    }

    const checked = validateOps(model, ops, options);
    if (checked.ok) return { ok: true, ops, model: checked.model };

    const at = checked.issues[0]?.opIndex ?? ops.length - 1;
    return {
        ok: false,
        stepIndex: stepOfOp[at] ?? Math.max(steps.length - 1, 0),
        issues: checked.issues,
    };
};
