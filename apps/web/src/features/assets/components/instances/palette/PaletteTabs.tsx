import { useState } from "react";
import type { AssetDefinition } from "@standin/contracts";
import { PanelScroll } from "@/features/editor/components/layout/PanelScroll";
import { PaletteCategoryCarousel } from "@/features/assets/components/views/palette/PaletteCategoryCarousel";
import { PaletteCategoryContent } from "@/features/assets/components/views/palette/PaletteCategoryContent";
import { PaletteTilesContent } from "@/features/assets/components/views/palette/PaletteTilesContent";
import type {
    PaletteCategories,
    PaletteTilesets,
} from "@/features/assets/types/mapPalette";
import { PALETTE_LOOKS } from "@/features/assets/consts/paletteLooks";
import type { PaletteLook } from "@/features/assets/types/paletteLook";
import { getCategoriesWithoutMatch } from "@/features/assets/utils/getCategoriesWithoutMatch";
import { getDefaultPaletteTab } from "@/features/assets/utils/getDefaultPaletteTab";

type Props = {
    // The text of the search box. The tabs stay while there is text, and the
    // families of the picked one are filtered by it.
    search: string;
    categories: PaletteCategories;
    tilesets: PaletteTilesets;
    onPick: (asset: AssetDefinition) => void;
    // The family to show as picked.
    selectedId?: string | null;
    // Leaves the library's own Tiles tab out.
    hideTilesTab?: boolean;
    look?: PaletteLook;
};

// A carousel with every category, fixed at the top, and the families of the
// one picked under it, which are what scrolls. Search text filters those
// families and dims the categories with no match. The library's own Tiles entry comes last.
export const PaletteTabs = ({
    search,
    categories,
    tilesets,
    onPick,
    selectedId,
    hideTilesTab = false,
    look = PALETTE_LOOKS.EDITOR,
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
                    plain={look.plainTabs}
                    disabledCategories={getCategoriesWithoutMatch(
                        categories,
                        search
                    )}
                />
            </div>
            <PanelScroll>
                <PaletteCategoryContent
                    search={search}
                    families={current?.families ?? []}
                    onPick={onPick}
                    selectedId={selectedId}
                    showNames={look.names}
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
