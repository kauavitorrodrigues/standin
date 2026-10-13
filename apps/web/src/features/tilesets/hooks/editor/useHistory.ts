import { useRef, useState, type RefObject } from "react";
import type { TileMeta } from "@standin/contracts";
import { TILE_HISTORY_LIMIT } from "../../consts/history";

type Params = {
    // The meta as it stands, kept up to date by whoever changes it.
    latest: RefObject<TileMeta>;
    // Puts a meta back, when a step is undone or redone.
    onRestore: (meta: TileMeta) => void;
};

// The steps of the editor, to undo and redo. A stroke (from the press of the
// pointer to its release) is one step however many tiles it changes, and a
// change made any other way (a key, a button) is a step of its own.
export const useTileHistory = ({ latest, onRestore }: Params) => {
    const past = useRef<TileMeta[]>([]);
    const future = useRef<TileMeta[]>([]);
    const stroke = useRef<TileMeta | null>(null);
    const [steps, setSteps] = useState({ undo: 0, redo: 0 });

    const sync = () =>
        setSteps({ undo: past.current.length, redo: future.current.length });

    const remember = (before: TileMeta) => {
        past.current = [...past.current, before].slice(-TILE_HISTORY_LIMIT);
        future.current = [];
        sync();
    };

    // Called right before a change. While a stroke is on, the step was already
    // taken when it began.
    const record = () => {
        if (stroke.current !== null) return;
        remember(latest.current);
    };

    const beginStroke = () => {
        stroke.current = latest.current;
    };

    const endStroke = () => {
        const before = stroke.current;
        stroke.current = null;
        if (before !== null && before !== latest.current) remember(before);
    };

    const undo = () => {
        const before = past.current.at(-1);
        if (!before) return;
        past.current = past.current.slice(0, -1);
        future.current = [...future.current, latest.current];
        onRestore(before);
        sync();
    };

    const redo = () => {
        const after = future.current.at(-1);
        if (!after) return;
        future.current = future.current.slice(0, -1);
        past.current = [...past.current, latest.current];
        onRestore(after);
        sync();
    };

    return {
        canUndo: steps.undo > 0,
        canRedo: steps.redo > 0,
        record,
        beginStroke,
        endStroke,
        undo,
        redo,
    };
};
