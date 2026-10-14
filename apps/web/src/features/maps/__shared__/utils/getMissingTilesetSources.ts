import type { MapLayout, Tileset } from "@standin/contracts";
import type { TilesetSource } from "@/features/maps/__shared__/types/tileset-source";

/**
 * The tilesets the layout declares that the tilemap does not have yet, with
 * what is needed to load them. A tileset the library does not know is left
 * out, because there is no image to draw it from.
 */
export const getMissingTilesetSources = (
    declared: MapLayout["tilesets"],
    known: ReadonlySet<string>,
    library: readonly Pick<Tileset, "id" | "url" | "margin" | "spacing">[]
): TilesetSource[] => {
    const libraryById = new Map(
        library.map((tileset) => [tileset.id, tileset])
    );

    return declared.flatMap((entry) => {
        if (known.has(entry.name)) return [];
        const tileset = libraryById.get(entry.name);
        if (!tileset) return [];

        return [
            {
                name: entry.name,
                firstgid: entry.firstgid,
                url: tileset.url,
                margin: tileset.margin,
                spacing: tileset.spacing,
            },
        ];
    });
};
