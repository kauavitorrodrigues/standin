import { AVATAR } from "@standin/contracts";

// Integer zoom of the editor preview, in screen px per art px.
export const PREVIEW_SCALE = 5;

// The fixed scene behind the avatar, in art px.
export const PREVIEW_SCENE = { w: 40, h: 56 } as const;

// Where the feet of the avatar stand in the scene, in art px.
export const PREVIEW_ANCHOR = {
    x: PREVIEW_SCENE.w / 2,
    y: Math.round(PREVIEW_SCENE.h * 0.78),
} as const;

// The wall ends here and the floor starts, in art px.
export const PREVIEW_FLOOR_Y = Math.round(PREVIEW_SCENE.h * 0.62);

// Top left corner of the frame in the scene, so the feet land on the anchor.
export const PREVIEW_FRAME_ORIGIN = {
    x: PREVIEW_ANCHOR.x - AVATAR.anchor.x,
    y: PREVIEW_ANCHOR.y - AVATAR.anchor.y,
} as const;

export const PREVIEW_COLORS = {
    WALL: "#EEF0F4",
    WALL_SHADE: "#E1E4EB",
    BASEBOARD: "#C9CEDA",
    FLOOR: "#CFE9C9",
    FLOOR_SHADE: "#C2E0BB",
} as const;

// Size of one tile of the checker pattern of the floor, in art px.
export const PREVIEW_FLOOR_TILE = 8;

// Zoom of the downloaded image, as decided in `plan.md` section 15.1.
export const AVATAR_DOWNLOAD_SCALE = 8;
export const AVATAR_DOWNLOAD_FILE_NAME = "avatar.png";
