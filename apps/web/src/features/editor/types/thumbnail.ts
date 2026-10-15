import type Phaser from "phaser";

export type ThumbnailSize = {
    width: number;
    height: number;
};

// What a map photo is made of: tile layers and the objects placed on them.
export type ThumbnailDrawable =
    | Phaser.Tilemaps.TilemapLayer
    | Phaser.GameObjects.Image
    | Phaser.GameObjects.Sprite
    | Phaser.GameObjects.Rectangle;

// Where the editor sends the map photo. The page that opens the editor knows
// if the photo is missing and how to save it.
export type EditorThumbnailTarget = {
    missing: boolean;
    save: (blob: Blob) => Promise<unknown>;
};
