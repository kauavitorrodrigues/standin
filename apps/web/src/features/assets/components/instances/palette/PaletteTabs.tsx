import { useState } from "react";
import type { AssetDefinition } from "@standin/contracts";
import { PanelScroll } from "@/features/editor/components/layout/PanelScroll";
import { PaletteCategoryCarousel } from "@/features/assets/components/views/palette/PaletteCategoryCarousel";
import { PaletteFamilies } from "@/features/assets/components/views/palette/PaletteFamilies";
import { PaletteTilesContent } from "@/features/assets/components/views/palette/PaletteTilesContent";
import type {
    PaletteCategories,
    PaletteTilesets,
} from "@/features/assets/types/mapPalette";
import { getDefaultPaletteTab } from "@/features/assets/utils/getDefaultPaletteTab";

type Props = {
    categories: PaletteCategories;
    tilesets: PaletteTilesets;
    onPick: (asset: AssetDefinition) => void;
    // The family to show as picked.
    selectedId?: string | null;
    // Leaves the library's own Tiles tab out.
    hideTilesTab?: boolean;
};

// A carousel with every category, fixed at the top, and the families of the
// one picked under it, which are what scrolls. The library's own Tiles entry comes last.
export const PaletteTabs = ({
    categories,
    tilesets,
    onPick,
    selectedId,
    hideTilesTab = false,
}: Props) => {
    const [selected, setSelected] = useState(getDefaultPaletteTab(categories));
    const current = categories.find(({ category }) => category === selected);

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="px-3">
                <PaletteCategoryCarousel
                    categories={categories}
                    selected={selected}
                    onSelect={setSelected}
                    hideTilesTab={hideTilesTab}
                />
            </div>
            <PanelScroll>
                <PaletteFamilies
                    families={current?.families ?? []}
                    onPick={onPick}
                    selectedId={selectedId}
                />
                <PaletteTilesContent
                    tilesets={tilesets}
                    selected={selected}
                    hidden={hideTilesTab}
                />
            </PanelScroll>
        </div>
    );
};
