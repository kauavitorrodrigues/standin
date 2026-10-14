import { LayersPopover } from "@/features/maps/__shared__/components/instances/LayersPopover";
import { TilesContent } from "@/features/maps/__shared__/components/instances/TilesContent";

type TilesTabProps = {
    mapId: string;
};

// The tiles tab: the library of tilesets and tiles, with the layers in a
// popover beside the search.
export const TilesTab = ({ mapId }: TilesTabProps) => (
    <TilesContent mapId={mapId} layers={<LayersPopover />} />
);
