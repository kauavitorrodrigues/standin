import type Phaser from "phaser";
import type { Tileset } from "@standin/contracts";
import { readWallTileMeta } from "@/features/game/renderers/readWallTileMeta";
import type { WallTileMeta } from "@/features/game/types/wall-tile";
import { toWallTileMeta } from "@/features/game/utils/wallTile";

type LibraryTileset = Pick<Tileset, "id" | "tileMeta">;

// Where the editor learns what a wall tile does. The library knows every
// tileset of the draft, the ones added by hand included, which have no tile
// properties in the tilemap. A tileset the library does not know is read from
// the tilemap, as the game does.
export class WallTileMetaSource {
    private readonly tilemap: Phaser.Tilemaps.Tilemap;
    private readonly library = new Map<string, LibraryTileset>();

    constructor(tilemap: Phaser.Tilemaps.Tilemap) {
        this.tilemap = tilemap;
    }

    setLibrary(tilesets: readonly LibraryTileset[]): void {
        tilesets.forEach((tileset) => this.library.set(tileset.id, tileset));
    }

    get = (gid: number): WallTileMeta => {
        const tileset = this.tilemap.tilesets.find(
            ({ firstgid, total }) => gid >= firstgid && gid < firstgid + total
        );
        const known = tileset ? this.library.get(tileset.name) : undefined;
        if (!tileset || !known) return readWallTileMeta(this.tilemap, gid);

        return toWallTileMeta(known.tileMeta?.[String(gid - tileset.firstgid)]);
    };
}
