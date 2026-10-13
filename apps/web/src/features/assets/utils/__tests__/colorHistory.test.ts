import { describe, expect, it } from "vitest";
import {
    EMPTY_COLOR_HISTORY,
    commitRedo,
    commitUndo,
    nextRedo,
    nextUndo,
    recordColorChange,
} from "../colorHistory";

const first = { rowId: "r", from: "red", to: "blue" };
const second = { rowId: "r", from: "blue", to: "green" };

describe("colorHistory", () => {
    it("has nothing to undo or redo at first", () => {
        expect(nextUndo(EMPTY_COLOR_HISTORY)).toBeNull();
        expect(nextRedo(EMPTY_COLOR_HISTORY)).toBeNull();
        expect(commitUndo(EMPTY_COLOR_HISTORY)).toBe(EMPTY_COLOR_HISTORY);
    });

    it("undoes the last change and can redo it", () => {
        let history = recordColorChange(EMPTY_COLOR_HISTORY, first);
        history = recordColorChange(history, second);

        expect(nextUndo(history)).toEqual(second);
        history = commitUndo(history);
        expect(nextUndo(history)).toEqual(first);
        expect(nextRedo(history)).toEqual(second);

        history = commitRedo(history);
        expect(nextUndo(history)).toEqual(second);
        expect(nextRedo(history)).toBeNull();
    });

    it("drops the redo stack when a new change is recorded", () => {
        let history = recordColorChange(EMPTY_COLOR_HISTORY, first);
        history = commitUndo(history);
        expect(nextRedo(history)).toEqual(first);

        history = recordColorChange(history, second);
        expect(nextRedo(history)).toBeNull();
    });
});
