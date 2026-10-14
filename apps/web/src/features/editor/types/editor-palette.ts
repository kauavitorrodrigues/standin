import type { LibraryPaletteArea, MapAreaStamp } from "@standin/contracts";
import type {
    PaletteCategories,
    PaletteTilesets,
} from "@/features/assets/types/mapPalette";

// What the panel lists, given by the shell that owns the library.
export type EditorPalette = {
    tilesets: PaletteTilesets;
    categories: PaletteCategories;
    areas: LibraryPaletteArea[];
    // Fetches the stamp of one area at one version. The shell binds it to the
    // route that serves the library of its map.
    fetchAreaStamp: (areaId: string, version: number) => Promise<MapAreaStamp>;
    isLoading: boolean;
    isError: boolean;
};
