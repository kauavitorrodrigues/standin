import { useEffect, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { Tileset } from "@standin/contracts";
import { SearchField } from "@/features/editor/components/views/SearchField";
import { TileCategoryTabs } from "@/features/editor/components/views/panel/TileCategoryTabs";
import { TilesBody } from "@/features/editor/components/views/panel/TilesBody";
import { TilesetCarousel } from "@/features/editor/components/views/panel/TilesetCarousel";
import { TILE_PALETTE_CATEGORIES } from "@/features/editor/consts/tilePalette";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import type { PaletteTileCategory } from "@/features/editor/types/palette-tile";
import { getDefaultTileset } from "@/features/editor/utils/getDefaultTileset";
import { getPaletteTiles } from "@/features/editor/utils/getPaletteTiles";
import { searchTilesets } from "@/features/editor/utils/searchTilesets";

type TilesPickerProps = {
    tilesets: Tileset[];
    // Shown beside the search.
    layers?: ReactNode;
};

type PickerValues = {
    tilesetId: string;
    category: PaletteTileCategory;
    search: string;
};

// The search of tilesets by name, the carousel with the tilesets that match,
// the tabs of category and the grid of tiles, with the layers beside the
// search. Everything but the grid stays fixed, and the grid scrolls and only
// renders the rows in view.
// Picking a tile makes it the brush of the editor.
export const TilesPicker = ({ tilesets, layers }: TilesPickerProps) => {
    const store = useEditorStore();
    const brush = useEditorSelector((state) => state.brush);
    const { control, register, setValue } = useForm<PickerValues>({
        defaultValues: {
            tilesetId: getDefaultTileset(tilesets).id,
            category: TILE_PALETTE_CATEGORIES[0],
            search: "",
        },
    });
    const tilesetId = useWatch({ control, name: "tilesetId" });
    const category = useWatch({ control, name: "category" });
    const search = useWatch({ control, name: "search" });

    const tileset = tilesets.find(({ id }) => id === tilesetId) ?? tilesets[0];
    const allCount = getPaletteTiles(tileset, null).length;
    const tiles = getPaletteTiles(tileset, category);

    // The eyedropper changes the brush from the canvas: the tab shows the
    // tileset and the category of the tile.
    useEffect(() => {
        if (!brush) return;
        const picked = tilesets.find(({ id }) => id === brush.tilesetId);
        if (!picked) return;

        setValue("tilesetId", picked.id);
        const entry = picked.tileMeta?.[String(brush.tileIndex)];
        const pickedCategory = TILE_PALETTE_CATEGORIES.find(
            (category) => category === entry?.category
        );
        if (pickedCategory) setValue("category", pickedCategory);
    }, [brush, tilesets, setValue]);

    const handlePick = (tileIndex: number) => {
        store.pickTile({ tilesetId: tileset.id, tileIndex });
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 pt-3">
            <div className="flex flex-col gap-3 px-3">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <SearchField
                            {...register("search")}
                            placeholder="Buscar tileset"
                        />
                    </div>
                    {layers}
                </div>
                <TilesetCarousel
                    tilesets={searchTilesets(tilesets, search)}
                    selectedId={tileset.id}
                    onSelect={(next) => setValue("tilesetId", next)}
                />
                <TileCategoryTabs
                    value={category}
                    onValueChange={(next) => setValue("category", next)}
                />
            </div>
            <TilesBody
                tileset={tileset}
                allCount={allCount}
                tiles={tiles}
                brush={brush}
                onPick={handlePick}
            />
        </div>
    );
};
