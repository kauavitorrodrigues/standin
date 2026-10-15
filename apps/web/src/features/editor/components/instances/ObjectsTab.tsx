import type { AssetDefinition } from "@standin/contracts";
import type { PaletteLook } from "@/features/assets/types/paletteLook";
import { MapPalette } from "@/features/assets/components/instances/palette/MapPalette";
import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { getDoorPaletteReason } from "@/features/editor/utils/getDoorPaletteReason";
import type { EditorPalette } from "@/features/editor/types/editor-palette";

type ObjectsTabProps = {
    // The families the tab lists. The tiles and the areas are not used here.
    palette: Pick<EditorPalette, "tilesets" | "categories">;
    // How the palette looks. The editor panel by default.
    look?: PaletteLook;
    searchPlaceholder?: string;
    // Only in the area composer, where the area (not the map) is the room.
    areaIsRoom?: boolean;
};

// The library of objects. Picking one puts the editor in placing mode with
// that asset, and the pick stays highlighted until Esc, a click on it again
// or a change of tool cancels it.
export const ObjectsTab = ({
    palette,
    look,
    searchPlaceholder,
    areaIsRoom,
}: ObjectsTabProps) => {
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

    const getDisabledReason = (asset: AssetDefinition) =>
        getDoorPaletteReason(asset, areaIsRoom);

    return (
        <MapPalette
            tilesets={palette.tilesets}
            categories={palette.categories}
            onPick={handlePick}
            selectedId={placing}
            getDisabledReason={getDisabledReason}
            look={look}
            searchPlaceholder={searchPlaceholder}
            hideTilesTab
        />
    );
};
