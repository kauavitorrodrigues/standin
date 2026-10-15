import { LayersPopover } from "@/features/editor/components/instances/LayersPopover";
import { TilesContent } from "@/features/editor/components/instances/TilesContent";

type TilesTabProps = {
    mapId: string;
};

// The tiles tab: the library of tilesets and tiles, with the layers in a
// popover beside the search.
export const TilesTab = ({ mapId }: TilesTabProps) => (
    <TilesContent mapId={mapId} layers={<LayersPopover />} />
);
