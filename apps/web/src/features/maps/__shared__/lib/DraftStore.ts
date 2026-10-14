import { replayOps, UNDO_STACK_LIMIT } from "@standin/contracts";
import type { EditorModel, EditorOp } from "@standin/contracts";
import type { DraftRestoreResult } from "@/features/maps/__shared__/types/DraftRestoreResult";
import type { DraftGestureResult } from "@/features/maps/__shared__/types/DraftGestureResult";
import type { DraftState } from "@/features/maps/__shared__/types/DraftState";
import type { DraftSummary } from "@/features/maps/__shared__/types/DraftSummary";
import { applyEditorOps } from "@/features/maps/__shared__/utils/applyEditorOps";
import { getDraftSummary } from "@/features/maps/__shared__/utils/getDraftSummary";

type Listener = () => void;

const OK: DraftGestureResult = { ok: true };

// The draft of the map, outside React and without storage. A gesture (the
// operations of one stroke, drag or click) is the unit of undo. Every change
// builds a new state object, and a call that changes nothing notifies no one.
export class DraftStore {
    private state: DraftState;

    private readonly listeners = new Set<Listener>();

    // `onSummary` hears about the summary the interface shows (the EditorStore
    // takes it in `setDraftSummary`), and only when it changes.
    private readonly onSummary?: (summary: DraftSummary) => void;

    constructor(
        base: EditorModel,
        onSummary?: (summary: DraftSummary) => void
    ) {
        this.onSummary = onSummary;
        this.state = {
            base,
            draft: base,
            ops: [],
            undo: [],
            redo: [],
            change: "reset",
        };
        this.onSummary?.(getDraftSummary(this.state));
    }

    getState = (): DraftState => this.state;

    subscribe = (listener: Listener): (() => void) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    // Applies every operation on a copy. One failure leaves the draft as it was.
    dispatchGesture = (ops: readonly EditorOp[]): DraftGestureResult => {
        if (ops.length === 0) return OK;

        const result = applyEditorOps(this.state.draft, ops);
        if (!result.ok) return result;

        const entry = { ops: [...ops], inverse: result.inverse };
        this.commit({
            ...this.state,
            draft: result.model,
            ops: [...this.state.ops, ...entry.ops],
            undo: [...this.state.undo, entry].slice(-UNDO_STACK_LIMIT),
            redo: [],
            change: "gesture",
        });
        return OK;
    };

    undo = (): DraftGestureResult => {
        const entry = this.state.undo.at(-1);
        if (!entry) return OK;

        const result = applyEditorOps(this.state.draft, entry.inverse);
        if (!result.ok) return result;

        this.commit({
            ...this.state,
            draft: result.model,
            ops: this.state.ops.slice(
                0,
                this.state.ops.length - entry.ops.length
            ),
            undo: this.state.undo.slice(0, -1),
            redo: [...this.state.redo, entry],
            change: "history",
        });
        return OK;
    };

    redo = (): DraftGestureResult => {
        const entry = this.state.redo.at(-1);
        if (!entry) return OK;

        const result = applyEditorOps(this.state.draft, entry.ops);
        if (!result.ok) return result;

        this.commit({
            ...this.state,
            draft: result.model,
            ops: [...this.state.ops, ...entry.ops],
            undo: [...this.state.undo, entry].slice(-UNDO_STACK_LIMIT),
            redo: this.state.redo.slice(0, -1),
            change: "history",
        });
        return OK;
    };

    // Back to the published version, with no history.
    discard = (): void => {
        const { base, ops, undo, redo } = this.state;
        if (ops.length === 0 && undo.length === 0 && redo.length === 0) return;

        this.commit({
            base,
            draft: base,
            ops: [],
            undo: [],
            redo: [],
            change: "reset",
        });
    };

    // Puts a saved list of operations back on the base. There is no history
    // after it: what came before cannot be undone. One failing operation
    // leaves the draft as it was and answers its index.
    restore = (ops: readonly EditorOp[]): DraftRestoreResult => {
        const { base } = this.state;
        const result = replayOps(base, [...ops]);
        if (!result.ok) {
            return {
                ok: false,
                opIndex: result.opIndex,
                errors: result.errors,
            };
        }

        this.commit({
            base,
            draft: result.model,
            ops: [...ops],
            undo: [],
            redo: [],
            change: "reset",
        });
        return { ok: true };
    };

    // Swaps the base (after a publish, for example) and starts a clean draft.
    rebase = (base: EditorModel): void => {
        this.commit({
            base,
            draft: base,
            ops: [],
            undo: [],
            redo: [],
            change: "reset",
        });
    };

    private commit(next: DraftState): void {
        const previousSummary = getDraftSummary(this.state);
        this.state = next;
        const summary = getDraftSummary(next);

        if (!isSameSummary(previousSummary, summary)) this.onSummary?.(summary);
        this.listeners.forEach((listener) => listener());
    }
}

const isSameSummary = (a: DraftSummary, b: DraftSummary) =>
    a.hasChanges === b.hasChanges &&
    a.canUndo === b.canUndo &&
    a.canRedo === b.canRedo;

export const createDraftStore = (
    base: EditorModel,
    onSummary?: (summary: DraftSummary) => void
): DraftStore => new DraftStore(base, onSummary);
