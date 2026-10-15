import { TILE_SIZE, type TileMeta, type WallStyle } from "@standin/contracts";
import type { TileSheetGrid } from "../../../../types/sheet";
import { getTileCutoutStyle } from "../../../../utils/editor/getCutoutStyle";
import { getTileOrigin } from "../../../../utils/editor/getOrigin";
import {
    buildWallPreview,
    getPreviewTileOrder,
} from "../../../../utils/editor/wall/buildWallPreview";

type Props = {
    url: string;
    grid: TileSheetGrid;
    meta: TileMeta;
    style: WallStyle;
};

// The radius of the circle that stands for an avatar in the test room, the
// same as the avatar of the game.
const AVATAR_RADIUS = 8;

// A small room built from the pieces of the style, with an avatar behind the
// south wall and one in front of it. It only helps: it does not stop the save.
export const WallPreview = ({ url, grid, meta, style }: Props) => {
    const preview = buildWallPreview(meta, style);

    return (
        <div
            className="border-border bg-muted/30 relative mx-auto overflow-hidden rounded-md border"
            style={{
                width: preview.cols * TILE_SIZE,
                height: preview.rows * TILE_SIZE,
            }}
        >
            {preview.tiles.map((tile) => {
                const origin = getTileOrigin(tile.index, grid);
                return (
                    <div
                        key={`${tile.layer}-${tile.col}-${tile.row}`}
                        className="absolute"
                        style={{
                            left: tile.col * TILE_SIZE,
                            top: tile.row * TILE_SIZE,
                            width: TILE_SIZE,
                            height: TILE_SIZE,
                            zIndex: getPreviewTileOrder(tile),
                            ...getTileCutoutStyle({
                                url,
                                widthPx: grid.widthPx,
                                heightPx: grid.heightPx,
                                srcX: origin.x,
                                srcY: origin.y,
                                zoom: 1,
                            }),
                        }}
                    />
                );
            })}
            {preview.avatars.map((avatar) => (
                <div
                    key={avatar.label}
                    title={`Avatar ${avatar.label}`}
                    className="absolute rounded-full bg-orange-500"
                    style={{
                        left: avatar.x - AVATAR_RADIUS,
                        top: avatar.feetY - AVATAR_RADIUS * 2,
                        width: AVATAR_RADIUS * 2,
                        height: AVATAR_RADIUS * 2,
                        zIndex: avatar.feetY,
                    }}
                />
            ))}
        </div>
    );
};
