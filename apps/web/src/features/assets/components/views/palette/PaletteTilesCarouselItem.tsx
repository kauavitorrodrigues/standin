import { LayersIcon } from "lucide-react";
import { CarouselIconItem } from "@/features/editor/components/views/CarouselIconItem";
import { TILES_TAB } from "@/features/assets/consts/palette";

type Props = {
    selected: string;
    onSelect: (category: string) => void;
    hidden?: boolean;
};

// The library's own Tiles entry. Hosts with their own tiles tab hide it.
export const PaletteTilesCarouselItem = ({
    selected,
    onSelect,
    hidden = false,
}: Props) => {
    if (hidden) return null;

    return (
        <CarouselIconItem
            icon={LayersIcon}
            label="Tiles"
            selected={selected === TILES_TAB}
            onSelect={() => onSelect(TILES_TAB)}
        />
    );
};
