import type { CSSProperties } from "react";
import { TILE_SIZE } from "@standin/contracts";
import { LAB_RULER_MINOR_STEP_PX } from "../../../consts/lab";

type Orientation = "horizontal" | "vertical";

type Props = {
    orientation: Orientation;
    // Length of the ruler, in px of the scene.
    length: number;
    zoom: number;
};

const MAJOR_TICK_PX = 10;
const MINOR_TICK_PX = 5;
const LABEL_SPACE_PX = 16;

// How thick a ruler is, so what sits beside it can leave the room.
export const LAB_RULER_THICKNESS_PX = MAJOR_TICK_PX + LABEL_SPACE_PX;

const getRulerSize = (
    orientation: Orientation,
    length: number
): CSSProperties => {
    switch (orientation) {
        case "horizontal":
            return { width: length, height: LAB_RULER_THICKNESS_PX };
        case "vertical":
            return { width: LAB_RULER_THICKNESS_PX, height: length };
    }
};

const getTickStyle = (
    orientation: Orientation,
    position: number,
    size: number
): CSSProperties => {
    switch (orientation) {
        case "horizontal":
            return { left: position, bottom: 0, width: 1, height: size };
        case "vertical":
            return { top: position, right: 0, height: 1, width: size };
    }
};

const getLabelStyle = (
    orientation: Orientation,
    position: number
): CSSProperties => {
    switch (orientation) {
        case "horizontal":
            return { left: position + 2, top: 0 };
        case "vertical":
            return { top: position + 1, left: 0 };
    }
};

// A ruler for the lab, in px of the scene and not of the screen: a tick for
// each cell of the solid mask and a number for each tile. It is drawn at the
// size of the zoom, outside the scaled scene, so the text stays sharp.
export const LabRuler = ({ orientation, length, zoom }: Props) => {
    const steps = Array.from(
        { length: length / LAB_RULER_MINOR_STEP_PX + 1 },
        (_, index) => index * LAB_RULER_MINOR_STEP_PX
    );

    return (
        <div
            className="text-muted-foreground relative shrink-0 text-[10px]"
            style={getRulerSize(orientation, length * zoom)}
            aria-hidden
        >
            {steps.map((position) => (
                <RulerTick
                    key={position}
                    orientation={orientation}
                    position={position}
                    zoom={zoom}
                />
            ))}
        </div>
    );
};

type TickProps = {
    orientation: Orientation;
    // In px of the scene.
    position: number;
    zoom: number;
};

const RulerTick = ({ orientation, position, zoom }: TickProps) => {
    const isMajor = position % TILE_SIZE === 0;
    const size = isMajor ? MAJOR_TICK_PX : MINOR_TICK_PX;

    return (
        <>
            <span
                className="bg-muted-foreground absolute"
                style={getTickStyle(orientation, position * zoom, size)}
            />
            <RulerLabel
                isVisible={isMajor}
                orientation={orientation}
                position={position * zoom}
                label={String(position)}
            />
        </>
    );
};

type LabelProps = {
    isVisible: boolean;
    orientation: Orientation;
    position: number;
    label: string;
};

const RulerLabel = ({
    isVisible,
    orientation,
    position,
    label,
}: LabelProps) => {
    if (!isVisible) return null;

    return (
        <span className="absolute" style={getLabelStyle(orientation, position)}>
            {label}
        </span>
    );
};
