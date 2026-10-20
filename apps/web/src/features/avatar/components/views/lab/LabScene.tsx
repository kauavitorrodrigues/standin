import { AVATAR, TILE_SIZE } from "@standin/contracts";
import {
    LAB_DEPTH,
    LAB_LAYOUT,
    LAB_SCENE_TILES,
    LAB_SEAT,
} from "../../../consts/lab";
import { LabAvatar, type LabGuides } from "./LabAvatar";
import { LabBox } from "./LabBox";

type Props = {
    zoom: number;
    guides: LabGuides;
};

// The gap in px between the feet of an avatar and the piece it stands near.
const STANCE_GAP_PX = TILE_SIZE / 8;

const WIDTH_PX = LAB_SCENE_TILES.cols * TILE_SIZE;
const HEIGHT_PX = LAB_SCENE_TILES.rows * TILE_SIZE;

const WALL_TOP = LAB_LAYOUT.WALL_ROW * TILE_SIZE;
const WALL_BOTTOM = WALL_TOP + TILE_SIZE;
const DOOR_LEFT = LAB_LAYOUT.DOOR_COL * TILE_SIZE;

const TABLE_LEFT = LAB_LAYOUT.TABLE.col * TILE_SIZE;
const TABLE_WIDTH = LAB_LAYOUT.TABLE.cols * TILE_SIZE;
const TABLE_TOP = LAB_LAYOUT.TABLE.row * TILE_SIZE;
const TABLE_BOTTOM = TABLE_TOP + TILE_SIZE;

const CHAIR_LEFT = LAB_LAYOUT.CHAIR.col * TILE_SIZE;
const CHAIR_TOP = LAB_LAYOUT.CHAIR.row * TILE_SIZE;
const CHAIR_BOTTOM = CHAIR_TOP + TILE_SIZE;
const SEAT_X = CHAIR_LEFT + LAB_SEAT.dx;
const SEAT_Y = CHAIR_BOTTOM - LAB_SEAT.dy;

// The feet of an avatar standing in front of a piece, with the whole body
// below it.
const getFeetInFrontOf = (bottom: number): number =>
    bottom + AVATAR.body.h + STANCE_GAP_PX;

const GRID_LINE = "rgba(255, 255, 255, 0.14)";

const getWallColumns = (): number[] =>
    Array.from({ length: LAB_SCENE_TILES.cols }, (_, col) => col).filter(
        (col) => col !== LAB_LAYOUT.DOOR_COL
    );

// The test scene of the lab, in px of the game and scaled by a whole zoom: a
// grid of tiles, a thin wall with a door of one tile, a table of two tiles and
// a chair with its seat, and a ghost in each place that matters. The pieces
// are stacked with the same rule as the game (the Y of the bottom), so what
// shows here is what the player sees.
export const LabScene = ({ zoom, guides }: Props) => (
    <div
        className="border-border relative shrink-0 overflow-hidden border bg-emerald-950/40"
        style={{ width: WIDTH_PX * zoom, height: HEIGHT_PX * zoom }}
    >
        <div
            className="absolute top-0 left-0 origin-top-left"
            style={{
                width: WIDTH_PX,
                height: HEIGHT_PX,
                transform: `scale(${zoom})`,
                imageRendering: "pixelated",
                backgroundImage: `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px), linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px)`,
                backgroundSize: `${TILE_SIZE}px ${TILE_SIZE}px`,
            }}
        >
            {getWallColumns().map((col) => (
                <WallPiece key={col} left={col * TILE_SIZE} />
            ))}
            <LabBox
                isVisible
                left={DOOR_LEFT}
                top={WALL_TOP}
                width={TILE_SIZE}
                height={TILE_SIZE}
                zIndex={WALL_BOTTOM}
                className="outline outline-1 -outline-offset-1 outline-dashed outline-amber-300"
            />
            <LabBox
                isVisible
                left={TABLE_LEFT}
                top={TABLE_TOP}
                width={TABLE_WIDTH}
                height={TILE_SIZE}
                zIndex={TABLE_BOTTOM}
                className="bg-amber-800"
            />
            <LabBox
                isVisible
                left={CHAIR_LEFT}
                top={CHAIR_TOP}
                width={TILE_SIZE}
                height={TILE_SIZE}
                zIndex={CHAIR_BOTTOM}
                className="bg-sky-700"
            />
            <LabBox
                isVisible
                left={SEAT_X - 1}
                top={SEAT_Y - 1}
                width={2}
                height={2}
                zIndex={LAB_DEPTH.GUIDES}
                className="bg-white"
            />

            <LabAvatar
                name="Atrás da parede"
                x={TILE_SIZE * 1.5}
                feetY={WALL_TOP - STANCE_GAP_PX}
                guides={guides}
            />
            <LabAvatar
                name="Na frente da parede"
                x={TILE_SIZE * 3.5}
                feetY={getFeetInFrontOf(WALL_BOTTOM)}
                guides={guides}
            />
            <LabAvatar
                name="No vão da porta"
                x={DOOR_LEFT + TILE_SIZE / 2}
                feetY={WALL_BOTTOM - STANCE_GAP_PX}
                guides={guides}
            />
            <LabAvatar
                name="Atrás da mesa"
                x={TABLE_LEFT + TILE_SIZE}
                feetY={TABLE_TOP - STANCE_GAP_PX}
                guides={guides}
            />
            <LabAvatar
                name="Na frente da mesa"
                x={TABLE_LEFT + TILE_SIZE}
                feetY={getFeetInFrontOf(TABLE_BOTTOM)}
                guides={guides}
            />
            <LabAvatar
                name="Sentado"
                x={SEAT_X}
                feetY={SEAT_Y}
                animation="SIT"
                zIndex={LAB_DEPTH.SEATED}
                guides={guides}
            />
            <LabAvatar
                name="Andando"
                x={TILE_SIZE * 6.5}
                feetY={TILE_SIZE * 7.5}
                direction="right"
                animation="WALK"
                guides={guides}
            />
        </div>
    </div>
);

// One tile of the wall: the facade, which follows its bottom edge, and the cap
// above it, which is over every avatar.
const WallPiece = ({ left }: { left: number }) => (
    <>
        <LabBox
            isVisible
            left={left}
            top={WALL_TOP}
            width={TILE_SIZE}
            height={TILE_SIZE}
            zIndex={WALL_BOTTOM}
            className="bg-stone-500"
        />
        <LabBox
            isVisible
            left={left}
            top={WALL_TOP - TILE_SIZE}
            width={TILE_SIZE}
            height={TILE_SIZE}
            zIndex={LAB_DEPTH.CAP}
            className="bg-stone-400/90"
        />
    </>
);
