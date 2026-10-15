import type { ReactNode } from "react";
import type { TileMeta } from "@standin/contracts";
import { TileEditorContext } from "../../../contexts/EditorContext";
import { usePropertiesPanel } from "../../../hooks/editor/usePropertiesPanel";
import { useTileSheetEditor } from "../../../hooks/editor/useSheetEditor";
import type { TileSheetGrid } from "../../../types/sheet";

type Props = {
    url: string;
    grid: TileSheetGrid;
    meta: TileMeta;
    onChange: (meta: TileMeta) => void;
    savedMeta: TileMeta | null;
    imageInUse: boolean;
    disabled: boolean;
    children: ReactNode;
};

// Runs the tile editor once and hands it, with the sheet it works on, to every
// piece of the editor below it, so none of them needs it passed by hand.
export const TileEditorProvider = ({
    url,
    grid,
    meta,
    onChange,
    savedMeta,
    imageInUse,
    disabled,
    children,
}: Props) => {
    const editor = useTileSheetEditor({
        grid,
        meta,
        onChange,
        savedMeta,
        imageInUse,
        disabled,
    });
    const panel = usePropertiesPanel(!disabled);

    return (
        <TileEditorContext.Provider
            value={{ ...editor, ...panel, url, grid, meta, disabled }}
        >
            {children}
        </TileEditorContext.Provider>
    );
};
