import type Phaser from "phaser";
import { TILE_SIZE } from "@standin/contracts";
import type {
    WallTileDrawing,
    WallTileMeta,
} from "@/features/game/types/wall-tile";
import { buildWallTileDrawing } from "@/features/game/utils/buildWallTileDrawing";

type Cell = { column: number; row: number };

type Drawn = {
    images: Phaser.GameObjects.Image[];
    // The cell of the top, with the gid the foreground would hold there.
    top: (Cell & { gid: number }) | null;
};

const cellKey = ({ column, row }: Cell): string => `${column},${row}`;

// Draws the walls layer tile by tile, each one at the depth of its bottom edge,
// so an avatar goes behind a wall that is below it and over one that is above
// it. A tile layer has one depth for all of it, so it cannot do this. The top
// of a tall wall is a tile of the foreground layer, which is a layer of the
// tilemap: its cell is taken out of the layer and drawn here, with the wall.
export class WallTileRenderer {
    private readonly scene: Phaser.Scene;
    private readonly tilemap: Phaser.Tilemaps.Tilemap;
    private readonly mapHeightPx: number;
    private readonly metaOf: (gid: number) => WallTileMeta;
    private readonly foreground: Phaser.Tilemaps.TilemapLayer | null;
    private readonly drawn = new Map<string, Drawn>();
    private isVisible = true;

    constructor(
        scene: Phaser.Scene,
        tilemap: Phaser.Tilemaps.Tilemap,
        mapHeightPx: number,
        metaOf: (gid: number) => WallTileMeta,
        foreground: Phaser.Tilemaps.TilemapLayer | null
    ) {
        this.scene = scene;
        this.tilemap = tilemap;
        this.mapHeightPx = mapHeightPx;
        this.metaOf = metaOf;
        this.foreground = foreground;
    }

    // Draws, or redraws, the tile of a cell.
    set(column: number, row: number, gid: number): void {
        this.remove(column, row);
        const tileset = this.findTileset(gid);
        if (!tileset) return;

        const drawing = buildWallTileDrawing(
            this.metaOf(gid),
            row,
            tileset.firstgid,
            this.mapHeightPx
        );
        const images = this.drawSlices(tileset, gid, column, row, drawing);
        const top = this.drawTop(tileset, column, drawing, images);

        this.drawn.set(cellKey({ column, row }), { images, top });
    }

    remove(column: number, row: number): void {
        const key = cellKey({ column, row });
        const previous = this.drawn.get(key);
        if (!previous) return;

        previous.images.forEach((image) => image.destroy());
        this.drawn.delete(key);
    }

    setVisible(isVisible: boolean): void {
        this.isVisible = isVisible;
        this.drawn.forEach(({ images }) =>
            images.forEach((image) => image.setVisible(isVisible))
        );
    }

    // Whether the foreground tile on this cell is the top of the wall right
    // below it, which this renderer draws and the layer must not.
    isDerivedTop(column: number, row: number, gid: number): boolean {
        const wall = this.drawn.get(cellKey({ column, row: row + 1 }));
        return wall?.top?.gid === gid;
    }

    // The images on screen, for the map photo.
    getDisplays(): Phaser.GameObjects.Image[] {
        return [...this.drawn.values()].flatMap(({ images }) => images);
    }

    destroy(): void {
        this.drawn.forEach(({ images }) =>
            images.forEach((image) => image.destroy())
        );
        this.drawn.clear();
    }

    private findTileset(gid: number): Phaser.Tilemaps.Tileset | null {
        return (
            this.tilemap.tilesets.find(
                ({ firstgid, total }) =>
                    gid >= firstgid && gid < firstgid + total
            ) ?? null
        );
    }

    private drawSlices(
        tileset: Phaser.Tilemaps.Tileset,
        gid: number,
        column: number,
        row: number,
        drawing: WallTileDrawing
    ): Phaser.GameObjects.Image[] {
        return drawing.slices.flatMap(({ crop, depth }) => {
            const image = this.createImage(tileset, gid, column, row, depth);
            if (!image) return [];
            if (crop) image.setCrop(0, crop.y, TILE_SIZE, crop.height);
            return [image];
        });
    }

    private drawTop(
        tileset: Phaser.Tilemaps.Tileset,
        column: number,
        drawing: WallTileDrawing,
        images: Phaser.GameObjects.Image[]
    ): Drawn["top"] {
        if (!drawing.top) return null;
        const { row, gid, depth } = drawing.top;

        const image = this.createImage(tileset, gid, column, row, depth);
        if (image) images.push(image);
        // The layer cell with the same tile would draw it a second time.
        if (this.foreground?.getTileAt(column, row)?.index === gid) {
            this.foreground.removeTileAt(column, row, true, false);
        }

        return { column, row, gid };
    }

    private createImage(
        tileset: Phaser.Tilemaps.Tileset,
        gid: number,
        column: number,
        row: number,
        depth: number
    ): Phaser.GameObjects.Image | null {
        const texture = tileset.image;
        const coordinates = tileset.getTileTextureCoordinates(gid) as {
            x: number;
            y: number;
        } | null;
        if (!texture || !coordinates) return null;

        const frame = `wall-tile-${gid}`;
        if (!texture.has(frame)) {
            texture.add(
                frame,
                0,
                coordinates.x,
                coordinates.y,
                TILE_SIZE,
                TILE_SIZE
            );
        }

        return this.scene.add
            .image(column * TILE_SIZE, row * TILE_SIZE, texture.key, frame)
            .setOrigin(0, 0)
            .setDepth(depth)
            .setVisible(this.isVisible);
    }
}
