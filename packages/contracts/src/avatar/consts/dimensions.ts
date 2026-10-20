import { PLAYER_DIRECTIONS } from "../../game/enums/player";

// The only place with the size of the avatar. Everything else imports it.
// The sheet has the layout of the Gather avatar sheets, so sheets made for
// one work in the other: a single row of 72 frames of 32 x 64 px, the body in
// the lower half and the upper half free for hair and hats. The art is ours.
// The rest is provisional until it is measured in the lab.
// Raise it on every change of the grid or of the size, because every part and
// every assembled sheet depends on it.
export const AVATAR_GRID_VERSION = 0;

export const AVATAR = {
    // Size of one frame, in px.
    frame: { w: 32, h: 64 },
    // Grid of the sheet: one row of frames. `AVATAR_FRAMES` says which frame
    // each animation uses, and the frames no animation uses stay empty.
    sheet: { cols: 72, rows: 1 },
    // The point of the frame that touches the ground (center of the feet).
    anchor: { x: 16, y: 62 },
    // Size of the body without hat, as a reference.
    visible: { w: 20, h: 33 },
    // Collision body, centered on the anchor and growing upwards.
    body: { w: 24, h: 16 },
    // Click and hover area, from the anchor.
    hit: { w: 24, h: 36 },
    // Distance in px between the visible top and the name tag.
    nameTagGap: 4,
    // How many px of the avatar, from the feet up, the front of a seat piece
    // hides while it is sat.
    seatedCover: 14,
    // Reach of an interaction, from the anchor.
    interactRadius: 32,
} as const;

// Derived, never typed.
export const AVATAR_SHEET_PX = {
    w: AVATAR.sheet.cols * AVATAR.frame.w,
    h: AVATAR.sheet.rows * AVATAR.frame.h,
} as const;

// The directions in the order the preview turns through them.
export const AVATAR_SHEET_DIRECTIONS = [
    PLAYER_DIRECTIONS.DOWN,
    PLAYER_DIRECTIONS.LEFT,
    PLAYER_DIRECTIONS.UP,
    PLAYER_DIRECTIONS.RIGHT,
] as const;

// How many frames per second each animation plays. BLINK is one frame, so its
// length is set by the game (`AVATAR_BLINK`), not by the fps. The key of an
// animation in a scene is `{animation}_{direction}`, for example `WALK_left`.
export const AVATAR_ANIMATIONS = {
    IDLE: { fps: 1 },
    WALK: { fps: 8 },
    SIT: { fps: 1 },
    BLINK: { fps: 1 },
} as const;

export type AvatarAnimation = keyof typeof AVATAR_ANIMATIONS;

// The column of the sheet of each frame of each animation, in the order they
// play. Read from the Gather sheet of 72 frames: the standing poses start each
// direction (down 0, left 9, up 18, right 23), the walks are four frames per
// direction (down 32, left 40, up 48, right 56), and the sitting frames are
// down 68, left 14, up 21 and right 28. The other frames of the sheet (run,
// emotes and the rest of the poses) are not used yet.
export const AVATAR_FRAMES = {
    IDLE: {
        [PLAYER_DIRECTIONS.DOWN]: [0],
        [PLAYER_DIRECTIONS.LEFT]: [9],
        [PLAYER_DIRECTIONS.UP]: [18],
        [PLAYER_DIRECTIONS.RIGHT]: [23],
    },
    WALK: {
        [PLAYER_DIRECTIONS.DOWN]: [32, 33, 34, 35],
        [PLAYER_DIRECTIONS.LEFT]: [40, 41, 42, 43],
        [PLAYER_DIRECTIONS.UP]: [48, 49, 50, 51],
        [PLAYER_DIRECTIONS.RIGHT]: [56, 57, 58, 59],
    },
    SIT: {
        [PLAYER_DIRECTIONS.DOWN]: [68],
        [PLAYER_DIRECTIONS.LEFT]: [14],
        [PLAYER_DIRECTIONS.UP]: [21],
        [PLAYER_DIRECTIONS.RIGHT]: [28],
    },
    // The idle frame with the eyes closed, step 3 of each standing group. Up
    // shows no face, so it keeps its idle frame and the blink goes unseen.
    BLINK: {
        [PLAYER_DIRECTIONS.DOWN]: [3],
        [PLAYER_DIRECTIONS.LEFT]: [12],
        [PLAYER_DIRECTIONS.UP]: [18],
        [PLAYER_DIRECTIONS.RIGHT]: [26],
    },
} as const satisfies Record<
    AvatarAnimation,
    Record<(typeof AVATAR_SHEET_DIRECTIONS)[number], readonly number[]>
>;

// What each frame of the sheet shows. IDLE is standing, WALK and RUN are four
// frames each, SIT_LEGS is sitting with the legs out in front and SIT_CROSSED
// is sitting with the legs folded under, and EMOTE is the poses with the arms
// up. These come from reading the Gather sheet of 72 frames, so the frames
// without a game animation yet (run and the emotes) are still in their place
// for whoever edits the sheet in a drawing tool.
export const AVATAR_FRAME_KINDS = {
    IDLE: "IDLE",
    WALK: "WALK",
    RUN: "RUN",
    SIT_LEGS: "SIT_LEGS",
    SIT_CROSSED: "SIT_CROSSED",
    EMOTE: "EMOTE",
} as const;

export type AvatarFrameKind =
    (typeof AVATAR_FRAME_KINDS)[keyof typeof AVATAR_FRAME_KINDS];

type SheetGroup = {
    direction: (typeof AVATAR_SHEET_DIRECTIONS)[number];
    kind: AvatarFrameKind;
    // How many frames in a row, from the first one after the previous group.
    count: number;
};

const down = PLAYER_DIRECTIONS.DOWN;
const left = PLAYER_DIRECTIONS.LEFT;
const up = PLAYER_DIRECTIONS.UP;
const right = PLAYER_DIRECTIONS.RIGHT;
const { IDLE, WALK, RUN, SIT_LEGS, SIT_CROSSED, EMOTE } = AVATAR_FRAME_KINDS;

// The groups of frames, from the first column to the last: 0-4 down idle, 5-8
// down emote, 9-13 left idle, 14-17 left sit, 18-20 up idle, 21-22 up sit,
// 23-27 right idle, 28-31 right sit, 32-35 down walk, 36-39 down emote,
// 40-47 left walk and run, 48-55 up walk and run, 56-63 right walk and run,
// 64-67 down run and 68-71 down sit.
export const AVATAR_SHEET_LAYOUT: readonly SheetGroup[] = [
    { direction: down, kind: IDLE, count: 5 },
    { direction: down, kind: EMOTE, count: 4 },
    { direction: left, kind: IDLE, count: 5 },
    { direction: left, kind: SIT_LEGS, count: 4 },
    { direction: up, kind: IDLE, count: 3 },
    { direction: up, kind: SIT_CROSSED, count: 2 },
    { direction: right, kind: IDLE, count: 5 },
    { direction: right, kind: SIT_LEGS, count: 4 },
    { direction: down, kind: WALK, count: 4 },
    { direction: down, kind: EMOTE, count: 4 },
    { direction: left, kind: WALK, count: 4 },
    { direction: left, kind: RUN, count: 4 },
    { direction: up, kind: WALK, count: 4 },
    { direction: up, kind: RUN, count: 4 },
    { direction: right, kind: WALK, count: 4 },
    { direction: right, kind: RUN, count: 4 },
    { direction: down, kind: RUN, count: 4 },
    { direction: down, kind: SIT_CROSSED, count: 4 },
];

export type AvatarSheetSlot = {
    direction: (typeof AVATAR_SHEET_DIRECTIONS)[number];
    kind: AvatarFrameKind;
    // Position inside its group, from 0.
    step: number;
};

// One entry for each column of the sheet, in order.
export const AVATAR_SHEET_SLOTS: readonly AvatarSheetSlot[] =
    AVATAR_SHEET_LAYOUT.flatMap(({ direction, kind, count }) =>
        Array.from({ length: count }, (_, step) => ({
            direction,
            kind,
            step,
        }))
    );
