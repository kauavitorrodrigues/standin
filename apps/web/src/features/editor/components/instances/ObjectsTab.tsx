import type { AssetDefinition } from "@standin/contracts";
import { MapPalette } from "@/features/assets/components/instances/palette/MapPalette";
import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import type { EditorPalette } from "@/features/editor/types/editor-palette";

type ObjectsTabProps = {
    palette: EditorPalette;
};

// The library of objects. Picking one puts the editor in placing mode with
// that asset, and the pick stays highlighted until Esc, a click on it again
// or a change of tool cancels it.
export const ObjectsTab = ({ palette }: ObjectsTabProps) => {
    const store = useEditorStore();
    const placing = useEditorSelector((state) => state.placing);

    const handlePick = (asset: AssetDefinition) => {
        // Picking the asset that is already being placed turns the mode off.
        if (placing === asset.id) {
            store.cancelPlacing();
            return;
        }
        // Placing runs on the select tool, which owns the placement controller.
        store.setTool(EDITOR_TOOLS.SELECT);
        store.startPlacing(asset.id);
    };

    return (
        <MapPalette
            tilesets={palette.tilesets}
            categories={palette.categories}
            onPick={handlePick}
            selectedId={placing}
            hideTilesTab
        />
    );
};
