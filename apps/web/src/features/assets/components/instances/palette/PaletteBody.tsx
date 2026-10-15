import type { AssetDefinition } from "@standin/contracts";
import type {
    PaletteCategories,
    PaletteTilesets,
} from "@/features/assets/types/mapPalette";
import { PALETTE_LOOKS } from "@/features/assets/consts/paletteLooks";
import type { PaletteLook } from "@/features/assets/types/paletteLook";
import { PaletteTabs } from "./PaletteTabs";

type Props = {
    search: string;
    categories: PaletteCategories;
    tilesets: PaletteTilesets;
    onPick: (asset: AssetDefinition) => void;
    // The family to show as picked.
    selectedId?: string | null;
    hideTilesTab?: boolean;
    look?: PaletteLook;
};

// What the palette shows under the search box: the tabs, always, with the
// families of the picked category filtered by the search text.
export const PaletteBody = ({
    search,
    categories,
    tilesets,
    onPick,
    selectedId,
    hideTilesTab,
    look = PALETTE_LOOKS.EDITOR,
}: Props) => (
    <PaletteTabs
        search={search}
        categories={categories}
        tilesets={tilesets}
        onPick={onPick}
        selectedId={selectedId}
        hideTilesTab={hideTilesTab}
        look={look}
    />
);
