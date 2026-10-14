import { LayersPopover } from "@/features/editor/components/instances/LayersPopover";
import { TilesContent } from "@/features/editor/components/instances/TilesContent";

import type { EditorPalette } from "@/features/editor/types/editor-palette";

type TilesTabProps = {
    palette: EditorPalette;
};

// The tiles tab: the library of tilesets and tiles, with the layers in a
// popover beside the search.
export const TilesTab = ({ palette }: TilesTabProps) => (
    <TilesContent palette={palette} layers={<LayersPopover />} />
);
