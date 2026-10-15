import type {
    PaletteCategories,
    PaletteTilesets,
} from "@/features/assets/types/mapPalette";

// What the panel lists, given by the shell that owns the library.
export type EditorPalette = {
    tilesets: PaletteTilesets;
    categories: PaletteCategories;
    isLoading: boolean;
    isError: boolean;
};
