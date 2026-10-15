// In memory undo and redo of color changes. An undo is the inverse change, so
// each entry only needs the row and the two asset ids.
export type ColorChange = {
    rowId: string;
    from: string;
    to: string;
};

export type ColorHistory = {
    past: ColorChange[];
    future: ColorChange[];
};

export const EMPTY_COLOR_HISTORY: ColorHistory = { past: [], future: [] };

// A new change drops whatever could still be redone.
export const recordColorChange = (
    history: ColorHistory,
    change: ColorChange
): ColorHistory => ({ past: [...history.past, change], future: [] });

export const nextUndo = (history: ColorHistory): ColorChange | null =>
    history.past.at(-1) ?? null;

export const nextRedo = (history: ColorHistory): ColorChange | null =>
    history.future.at(-1) ?? null;

export const commitUndo = (history: ColorHistory): ColorHistory => {
    const change = nextUndo(history);
    if (!change) return history;
    return {
        past: history.past.slice(0, -1),
        future: [...history.future, change],
    };
};

export const commitRedo = (history: ColorHistory): ColorHistory => {
    const change = nextRedo(history);
    if (!change) return history;
    return {
        past: [...history.past, change],
        future: history.future.slice(0, -1),
    };
};
