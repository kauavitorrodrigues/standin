import {
    AVATAR,
    AVATAR_FRAME_KINDS,
    PLAYER_DIRECTIONS,
    type PlayerDirection,
} from "@standin/contracts";
import {
    type LegPose,
    type SheetColor,
    GHOST_COLORS,
    GHOST_EYES,
    GHOST_LEG_HEIGHT,
    GHOST_LEGS,
    GHOST_SIT_LAP_ROWS,
    GHOST_SIT_TORSO_ROWS,
    GHOST_TORSO_ROWS,
} from "../../consts/sheet-art";
import { resolveFrameLift } from "./resolveFrameLift";
import { resolveStride } from "./resolveStride";
import {
    createSheet,
    createSprite,
    forEachSheetFrame,
    paintSprite,
    setSpritePixel,
    type SheetFrame,
    type Sprite,
} from "./sheetCanvas";

const OUTLINE_WIDTH = 1;
const EMPTY = ".";
const BODY = "#";
const SHADE = "s";
const EYE = "e";
const NEIGHBORS = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
] as const;

// The ghost as characters, one per pixel, before the outline.
type Grid = string[][];

type GhostPose = Pick<SheetFrame, "kind" | "step">;

const IDLE_POSE: GhostPose = { kind: AVATAR_FRAME_KINDS.IDLE, step: 0 };

type TorsoSource = "down" | "up" | "right";

const resolveTorsoSource = (direction: PlayerDirection): TorsoSource => {
    switch (direction) {
        case PLAYER_DIRECTIONS.DOWN:
            return "down";
        case PLAYER_DIRECTIONS.UP:
            return "up";
        case PLAYER_DIRECTIONS.LEFT:
        case PLAYER_DIRECTIONS.RIGHT:
            return "right";
    }
};

const resolveLegPoses = (
    direction: PlayerDirection,
    pose: GhostPose
): readonly LegPose[] => {
    const legs =
        resolveTorsoSource(direction) === "right"
            ? GHOST_LEGS.profile
            : GHOST_LEGS.front;

    switch (pose.kind) {
        case AVATAR_FRAME_KINDS.WALK:
        case AVATAR_FRAME_KINDS.RUN: {
            const stride = resolveStride(pose.step);
            return stride === null ? legs.IDLE : legs.WALK[stride];
        }
        case AVATAR_FRAME_KINDS.IDLE:
        case AVATAR_FRAME_KINDS.EMOTE:
        case AVATAR_FRAME_KINDS.SIT_LEGS:
        case AVATAR_FRAME_KINDS.SIT_CROSSED:
            return legs.IDLE;
    }
};

const buildTorsoGrid = (source: TorsoSource): Grid => {
    const grid = GHOST_TORSO_ROWS[source].map((row) => [...row]);

    for (const [x, y, w, h] of GHOST_EYES[source]) {
        for (let eyeY = y; eyeY < y + h; eyeY++) {
            for (let eyeX = x; eyeX < x + w; eyeX++) {
                grid[eyeY][eyeX] = EYE;
            }
        }
    }

    return grid;
};

// Legs that are behind are drawn first, so the ones ahead cover them.
const addLegs = (grid: Grid, legs: readonly LegPose[]): void => {
    const ordered = [...legs].sort(
        ([, , , a], [, , , b]) => Number(b) - Number(a)
    );

    for (const [x, w, lift, isBehind] of ordered) {
        const height = GHOST_LEG_HEIGHT - lift;
        const color = isBehind ? SHADE : BODY;
        for (let row = 0; row < height; row++) {
            const y = grid.length - GHOST_LEG_HEIGHT + row;
            for (let col = x; col < x + w; col++) grid[y][col] = color;
        }
    }
};

// The sitting ghost: the top of the torso over a lap. The profile has the legs
// going forward, so its rows are padded to the width of the lap.
const buildSitGrid = (source: TorsoSource): Grid => {
    const torso = buildTorsoGrid(source).slice(0, GHOST_SIT_TORSO_ROWS);
    const lap = GHOST_SIT_LAP_ROWS[source].map((row) => [...row]);
    const width = Math.max(torso[0].length, lap[0].length);
    const pad = (row: string[]): string[] => [
        ...row,
        ...Array.from({ length: width - row.length }, () => EMPTY),
    ];

    return [...torso, ...lap].map(pad);
};

// Sitting with the legs out in front shows them under the lap, seen from the
// front or from behind. The profile already has them forward.
const addLegsOut = (grid: Grid, source: TorsoSource): Grid => {
    if (source === "right") return grid;

    const width = grid[0].length;
    const legs = ["..######..######..", "..######..######.."];

    return [...grid, ...legs.map((row) => [...row].slice(0, width))];
};

const ARM_UP_ROWS = { from: 6, to: 13 };
const ARM_UP_WIDTH = 2;
const PROFILE_ARM_REACH = 3;

// The arms up: a bar on each side seen from the front or from behind, and one
// bar forward in the profile.
const raiseArms = (grid: Grid, source: TorsoSource): Grid => {
    const reach = source === "right" ? PROFILE_ARM_REACH : 0;
    const raised = grid.map((row) => [
        ...row,
        ...Array.from({ length: reach }, () => EMPTY),
    ]);
    const width = raised[0].length;

    for (let y = ARM_UP_ROWS.from; y <= ARM_UP_ROWS.to; y++) {
        for (let x = 0; x < ARM_UP_WIDTH; x++) {
            if (source !== "right") raised[y][x] = BODY;
            raised[y][width - 1 - x] = BODY;
        }
    }

    return raised;
};

const mirrorIfLeft = (grid: Grid, direction: PlayerDirection): Grid =>
    direction === PLAYER_DIRECTIONS.LEFT
        ? grid.map((row) => [...row].reverse())
        : grid;

const buildGhostGrid = (direction: PlayerDirection, pose: GhostPose): Grid => {
    const source = resolveTorsoSource(direction);

    switch (pose.kind) {
        case AVATAR_FRAME_KINDS.SIT_CROSSED:
            return mirrorIfLeft(buildSitGrid(source), direction);
        case AVATAR_FRAME_KINDS.SIT_LEGS:
            return mirrorIfLeft(
                addLegsOut(buildSitGrid(source), source),
                direction
            );
        default:
            break;
    }

    const torso = buildTorsoGrid(source);
    const width = torso[0].length;
    const legRows: Grid = Array.from({ length: GHOST_LEG_HEIGHT }, () =>
        Array.from({ length: width }, () => EMPTY)
    );
    const grid = [...torso, ...legRows];
    addLegs(grid, resolveLegPoses(direction, pose));

    // Facing left is facing right, flipped.
    const posed =
        pose.kind === AVATAR_FRAME_KINDS.EMOTE ? raiseArms(grid, source) : grid;

    return mirrorIfLeft(posed, direction);
};

const isFilled = (grid: Grid, x: number, y: number): boolean =>
    (grid[y]?.[x] ?? EMPTY) !== EMPTY;

const isNextToBody = (grid: Grid, x: number, y: number): boolean =>
    NEIGHBORS.some(([dx, dy]) => isFilled(grid, x + dx, y + dy));

const resolveGhostColor = (cell: string): SheetColor | null => {
    switch (cell) {
        case BODY:
            return GHOST_COLORS.BODY;
        case SHADE:
            return GHOST_COLORS.SHADE;
        case EYE:
            return GHOST_COLORS.EYE;
        default:
            return null;
    }
};

// The color of one pixel of the ghost, counted over the grid without outline.
const resolveGhostPixel = (
    grid: Grid,
    x: number,
    y: number
): SheetColor | null => {
    if (isFilled(grid, x, y)) return resolveGhostColor(grid[y][x]);
    if (isNextToBody(grid, x, y)) return GHOST_COLORS.OUTLINE;
    return null;
};

// The ghost seen from one direction in one frame of an animation: gray body,
// white outline around it and white eyes. It is as tall as `AVATAR.visible`.
export const buildGhostSprite = (
    direction: PlayerDirection,
    pose: GhostPose = IDLE_POSE
): Sprite => {
    const grid = buildGhostGrid(direction, pose);
    const sprite = createSprite(
        grid[0].length + OUTLINE_WIDTH * 2,
        grid.length + OUTLINE_WIDTH * 2
    );

    for (let y = -1; y <= grid.length; y++) {
        for (let x = -1; x <= grid[0].length; x++) {
            setSpritePixel(
                sprite,
                x + OUTLINE_WIDTH,
                y + OUTLINE_WIDTH,
                resolveGhostPixel(grid, x, y)
            );
        }
    }

    return sprite;
};

// The sheet of the ghost, in RGBA. The feet touch the anchor of the frame, the
// ghost turns its whole body to each direction and its legs walk.
export const buildGhostSheet = (): Uint8Array => {
    const sheet = createSheet();

    forEachSheetFrame((frame, cell) => {
        const sprite = buildGhostSprite(frame.direction, frame);
        paintSprite(sheet, cell, sprite, {
            x: Math.round(AVATAR.anchor.x - sprite.w / 2),
            y: AVATAR.anchor.y - sprite.h - resolveFrameLift(frame),
        });
    });

    return sheet;
};
