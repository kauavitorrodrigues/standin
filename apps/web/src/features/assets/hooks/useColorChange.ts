import { useState } from "react";
import { useChangeColor } from "@/features/assets/mutations/changeColor";
import {
    EMPTY_COLOR_HISTORY,
    commitRedo,
    commitUndo,
    nextRedo,
    nextUndo,
    recordColorChange,
    type ColorHistory,
} from "@/features/assets/utils/colorHistory";

type Params = {
    mapId: string;
    // Called after the server accepted the change, so the placed object can
    // point at its new asset locally.
    onAssetChanged: (rowId: string, assetId: string) => void;
};

export const useColorChange = ({ mapId, onAssetChanged }: Params) => {
    const [history, setHistory] = useState<ColorHistory>(EMPTY_COLOR_HISTORY);
    const mutation = useChangeColor();

    const apply = async (rowId: string, assetId: string) => {
        await mutation.mutateAsync({ mapId, rowId, assetId });
        onAssetChanged(rowId, assetId);
    };

    const change = async (rowId: string, from: string, to: string) => {
        await apply(rowId, to);
        setHistory((current) =>
            recordColorChange(current, { rowId, from, to })
        );
    };

    const undo = async () => {
        const entry = nextUndo(history);
        if (!entry) return;
        await apply(entry.rowId, entry.from);
        setHistory(commitUndo);
    };

    const redo = async () => {
        const entry = nextRedo(history);
        if (!entry) return;
        await apply(entry.rowId, entry.to);
        setHistory(commitRedo);
    };

    return {
        change,
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        isPending: mutation.isPending,
    };
};
