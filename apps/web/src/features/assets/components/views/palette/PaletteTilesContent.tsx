import { TILES_TAB } from "@/features/assets/consts/palette";
import type { PaletteTilesets } from "@/features/assets/types/mapPalette";

type Props = {
    tilesets: PaletteTilesets;
    selected: string;
    hidden?: boolean;
};

export const PaletteTilesContent = ({
    tilesets,
    selected,
    hidden = false,
}: Props) => {
    if (hidden || selected !== TILES_TAB) return null;

    return (
        <ul className="flex flex-col gap-1">
            {tilesets.map(({ id, name, tileCount }) => (
                <li key={id} className="text-sm">
                    {name} ({tileCount} tiles)
                </li>
            ))}
        </ul>
    );
};
