import type { AssetDefinition } from "@standin/contracts";
import { PanelScroll } from "@/components/editor/PanelScroll";
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
    // The family to show as picked.
    selectedId?: string | null;
    hideTilesTab?: boolean;
};

// What the palette shows under the search box: the matches across every
// category while there is text, the tabs otherwise.
export const PaletteBody = ({
    search,
    categories,
    tilesets,
    onPick,
    selectedId,
    hideTilesTab,
}: Props) => {
    if (search.trim() !== "") {
        return (
            <PanelScroll>
                <PaletteSearchResults
                    search={search}
                    families={categories.flatMap(({ families }) => families)}
                    onPick={onPick}
                    selectedId={selectedId}
                />
            </PanelScroll>
        );
    }

    return (
        <PaletteTabs
            categories={categories}
            tilesets={tilesets}
            onPick={onPick}
            selectedId={selectedId}
            hideTilesTab={hideTilesTab}
        />
    );
};
