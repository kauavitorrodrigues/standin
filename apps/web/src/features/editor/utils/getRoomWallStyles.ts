import {
    WALL_PIECES,
    getWallStyles,
    isWallComplete,
    type EditorModel,
} from "@standin/contracts";
import type { RoomWallStyle } from "@/features/editor/types/room-wall-style";

const SEPARATOR = "|";

export const toWallStyleValue = (
    tilesetId: string,
    tileIndex: number
): string => `${tilesetId}${SEPARATOR}${tileIndex}`;

// The complete wall styles of the library, one per style, each with the tile
// of its front wall. An incomplete style is left out, since the walls of a room
// need every piece.
export const getRoomWallStyles = (
    model: Readonly<Pick<EditorModel, "library">>
): RoomWallStyle[] =>
    model.library.tilesets.flatMap((tileset) =>
        getWallStyles(tileset.tileMeta ?? {})
            .filter(isWallComplete)
            .flatMap((style) => {
                const cover = style.pieces[WALL_PIECES.S]?.[0];
                if (!cover) return [];

                return [
                    {
                        value: toWallStyleValue(tileset.id, cover.index),
                        label: style.name,
                        tilesetId: tileset.id,
                        tileIndex: cover.index,
                    },
                ];
            })
    );

// The style the panel draws with: the chosen one while the library still has
// it, else the first, else null.
export const resolveRoomWallStyle = (
    styles: readonly RoomWallStyle[],
    chosen: string | undefined
): RoomWallStyle | null =>
    styles.find(({ value }) => value === chosen) ?? styles[0] ?? null;
