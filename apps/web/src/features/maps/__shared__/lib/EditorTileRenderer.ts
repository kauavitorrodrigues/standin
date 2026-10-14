import Phaser from "phaser";
import {
    TILE_SIZE,
    diffTileLayers,
    type CellDiff,
    type MapLayout,
    type Tileset,
} from "@standin/contracts";
import { buildTilesetAssetKey } from "@/features/game/utils/map";
import { loadTilesetTexture } from "@/features/maps/__shared__/lib/loadTilesetTexture";
import { getMissingTilesetSources } from "@/features/maps/__shared__/utils/getMissingTilesetSources";
import { planTileDiff } from "@/features/maps/__shared__/utils/planTileDiff";
import type { TilesetSource } from "@/features/maps/__shared__/types/tileset-source";

type TilesetLibrary = readonly Pick<
    Tileset,
    "id" | "url" | "margin" | "spacing"
>[];

type TilesetSettable = Phaser.Tilemaps.TilemapLayer & {
    setTilesets: (tilesets: Phaser.Tilemaps.Tileset[]) => void;
};

// Keeps the tile layers up to date cell by cell. Phaser 3.90 takes `putTileAt`
// and `removeTileAt` on a layer that is already on screen, and a tileset that
// the tilemap did not have is added by hand (see `addTileset`), so no layer is
// rebuilt. Collision is not recalculated: nobody walks in the editor.
//
// Calls run in order, one after the other, because a diff can have to wait for
// the image of a new tileset.
export class EditorTileRenderer {
    private readonly layers = new Map<string, Phaser.Tilemaps.TilemapLayer>();
    private readonly scene: Phaser.Scene;
    private readonly tilemap: Phaser.Tilemaps.Tilemap;
    private readonly mapId: string;
    // The layout the layers were built from, the base of the next diff.
    private layout: MapLayout;
    private tail: Promise<void> = Promise.resolve();

    constructor(
        scene: Phaser.Scene,
        tilemap: Phaser.Tilemaps.Tilemap,
        layers: readonly Phaser.Tilemaps.TilemapLayer[],
        mapId: string,
        layout: MapLayout
    ) {
        this.scene = scene;
        this.tilemap = tilemap;
        this.mapId = mapId;
        this.layout = layout;
        layers.forEach((layer) => this.layers.set(layer.layer.name, layer));
    }

    // The tile layers on screen, for the map photo.
    getLayers(): Phaser.Tilemaps.TilemapLayer[] {
        return [...this.layers.values()];
    }

    // Shows or hides each layer by name. A layer not in `visibility` is shown.
    setLayersVisible(visibility: Readonly<Record<string, boolean>>): void {
        this.layers.forEach((layer, name) => {
            layer.setVisible(visibility[name] ?? true);
        });
    }

    // Resolves when every queued diff has been drawn.
    settled(): Promise<void> {
        return this.tail;
    }

    // Puts and removes the cells of the diff. The tilesets of the gids must
    // already be in the tilemap, or the cells are skipped with a warning.
    applyTileDiff(diff: readonly CellDiff[]): Promise<void> {
        return this.enqueue(async () => this.paint(diff));
    }

    // Moves the drawing from the layout it has to `layout`: adds the tilesets
    // the library can supply, then applies the cells that differ.
    syncTiles(layout: MapLayout, library: TilesetLibrary = []): Promise<void> {
        const diff = diffTileLayers(this.layout, layout);
        this.layout = layout;

        return this.enqueue(async () => {
            const known = new Set(
                this.tilemap.tilesets.map(({ name }) => name)
            );
            const missing = getMissingTilesetSources(
                layout.tilesets,
                known,
                library
            );
            for (const source of missing) await this.addTileset(source);

            this.paint(diff);
        });
    }

    private enqueue(task: () => Promise<void> | void): Promise<void> {
        this.tail = this.tail.then(task).catch((error: unknown) => {
            console.error(error);
        });
        return this.tail;
    }

    private paint(diff: readonly CellDiff[]): void {
        for (const plan of planTileDiff(diff)) {
            const layer = this.layers.get(plan.layer);
            if (!layer) continue;

            for (const { x, y, gid } of plan.puts) {
                // Without the tileset, Phaser fails reading the tile index.
                if (this.tilemap.tiles[gid] === undefined) {
                    console.warn(
                        `Tile gid ${gid} has no tileset in the tilemap`
                    );
                    continue;
                }
                layer.putTileAt(gid, x, y, false);
            }
            for (const { x, y } of plan.removes) {
                layer.removeTileAt(x, y, true, false);
            }
        }
    }

    // `Tilemap.addTilesetImage` returns null for a name the Tiled JSON did not
    // declare, so the Tileset is built here, pushed into the tilemap, the gid
    // index is rebuilt with Phaser's own parser helper and every layer takes the
    // new list.
    private async addTileset(source: TilesetSource): Promise<void> {
        const key = buildTilesetAssetKey(this.mapId, source.name);
        const loaded = await loadTilesetTexture(this.scene, key, source.url);
        if (!loaded) {
            console.warn(`Tileset image ${source.name} did not load`);
            return;
        }
        if (this.tilemap.tilesets.some(({ name }) => name === source.name))
            return;

        const tileset = new Phaser.Tilemaps.Tileset(
            source.name,
            source.firstgid,
            TILE_SIZE,
            TILE_SIZE,
            source.margin,
            source.spacing
        );
        tileset.setImage(this.scene.textures.get(key));

        this.tilemap.tilesets.push(tileset);
        this.tilemap.tiles = Phaser.Tilemaps.Parsers.Tiled.BuildTilesetIndex(
            this.tilemap
        );
        this.layers.forEach((layer) =>
            // Public in Phaser 3.90 but missing from its type definitions.
            (layer as TilesetSettable).setTilesets(this.tilemap.tilesets)
        );
    }
}
