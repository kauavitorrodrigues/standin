import type { AssetDefinition } from "@standin/contracts";
import type {
    PaletteCategories,
    PaletteTilesets,
} from "@/features/assets/types/mapPalette";
import { PaletteSearchResults } from "../../views/palette/PaletteSearchResults";
import { PaletteTabs } from "./PaletteTabs";

type Props = {
    search: string;
    categories: PaletteCategories;
    tilesets: PaletteTilesets;
    onPick: (asset: AssetDefinition) => void;
};

// What the palette shows under the search box: the matches across every
// category while there is text, the tabs otherwise.
export const PaletteBody = ({
    search,
    categories,
    tilesets,
    onPick,
}: Props) => {
    if (search.trim() !== "") {
        return (
            <PaletteSearchResults
                search={search}
                families={categories.flatMap(({ families }) => families)}
                onPick={onPick}
            />
        );
    }

    return (
        <PaletteTabs
            categories={categories}
            tilesets={tilesets}
            onPick={onPick}
        />
    );
};
