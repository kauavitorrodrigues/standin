import { useContext } from "react";
import { TileEditorContext } from "../../contexts/EditorContext";

export function useTileEditorContext() {
    const context = useContext(TileEditorContext);
    if (!context) {
        throw new Error(
            "useTileEditorContext must be used within a TileEditorProvider"
        );
    }
    return context;
}
