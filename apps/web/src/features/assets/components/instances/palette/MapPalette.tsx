import { useForm, useWatch } from "react-hook-form";
import type { AssetDefinition } from "@standin/contracts";
import { SearchField } from "@/features/editor/components/views/SearchField";
import { useMapPalette } from "@/features/assets/queries/useMapPalette";
import { PaletteBody } from "./PaletteBody";

type Props = {
    mapId: string;
    onPick: (asset: AssetDefinition) => void;
    // The family to show as picked.
    selectedId?: string | null;
    // Hides the library's own Tiles tab, for hosts that have their own.
    hideTilesTab?: boolean;
};

type SearchValues = { search: string };

// Editor palette: one entry per family, shown by its base, in one tab per
// category that has assets (the server already sends them in order, by
// name), a separate Tiles group, and a search that crosses every category
// and hides the tabs while there is text.
export function MapPalette({
    mapId,
    onPick,
    selectedId,
    hideTilesTab = false,
}: Props) {
    const { tilesets, categories } = useMapPalette(mapId);
    const { register, control } = useForm<SearchValues>({
        defaultValues: { search: "" },
    });
    const search = useWatch({ control, name: "search" });

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 pt-3">
            <div className="px-3">
                <SearchField
                    {...register("search")}
                    placeholder="Buscar peça"
                />
            </div>
            <PaletteBody
                search={search}
                categories={categories}
                tilesets={tilesets}
                onPick={onPick}
                selectedId={selectedId}
                hideTilesTab={hideTilesTab}
            />
        </div>
    );
}
