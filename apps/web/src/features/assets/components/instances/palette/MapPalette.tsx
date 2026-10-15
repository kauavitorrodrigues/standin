import { useForm, useWatch } from "react-hook-form";
import type { AssetDefinition } from "@standin/contracts";
import { SearchField } from "@/features/editor/components/views/SearchField";
import type {
    PaletteCategories,
    PaletteTilesets,
} from "@/features/assets/types/mapPalette";
import { PALETTE_LOOKS } from "@/features/assets/consts/paletteLooks";
import type { PaletteLook } from "@/features/assets/types/paletteLook";
import { PaletteBody } from "./PaletteBody";

type Props = {
    tilesets: PaletteTilesets;
    categories: PaletteCategories;
    onPick: (asset: AssetDefinition) => void;
    // The family to show as picked.
    selectedId?: string | null;
    // Hides the library's own Tiles tab, for hosts that have their own.
    hideTilesTab?: boolean;
    // The text of the search box.
    searchPlaceholder?: string;
    // Why a family cannot be picked, or null when it can.
    getDisabledReason?: (asset: AssetDefinition) => string | null;
    look?: PaletteLook;
};

type SearchValues = { search: string };

// Editor palette: one entry per family, shown by its base, in one tab per
// category that has assets (the server already sends them in order, by
// name), a separate Tiles group, and a search that filters the families of
// the picked tab while the tabs stay, dimming the ones with no match.
export function MapPalette({
    tilesets,
    categories,
    onPick,
    selectedId,
    hideTilesTab = false,
    searchPlaceholder = "Buscar peça",
    getDisabledReason,
    look = PALETTE_LOOKS.EDITOR,
}: Props) {
    const { register, control } = useForm<SearchValues>({
        defaultValues: { search: "" },
    });
    const search = useWatch({ control, name: "search" });

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 pt-3">
            <div className="px-3">
                <SearchField
                    {...register("search")}
                    withIcon={look.searchIcon}
                    placeholder={searchPlaceholder}
                />
            </div>
            <PaletteBody
                search={search}
                categories={categories}
                tilesets={tilesets}
                onPick={onPick}
                selectedId={selectedId}
                hideTilesTab={hideTilesTab}
                getDisabledReason={getDisabledReason}
                look={look}
            />
        </div>
    );
}
