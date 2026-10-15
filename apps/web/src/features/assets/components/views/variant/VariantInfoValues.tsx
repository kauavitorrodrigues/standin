import { TILE_SIZE } from "@standin/contracts";
import { ROTATION_OPTIONS } from "../../../consts/rotationMeta";
import type { ImageSize } from "../../../queries/useImageSize";

type Frame = { w: number; h: number };

const inTiles = (px: number) => px / TILE_SIZE;

// The size of the PNG, in px and in tiles.
export const ImageSizeValue = ({ size }: { size: ImageSize | undefined }) => {
    if (!size) return <>Lendo...</>;
    return (
        <>
            {size.w} × {size.h} px ({inTiles(size.w)} × {inTiles(size.h)} tiles)
        </>
    );
};

type FrameProps = {
    size: ImageSize | undefined;
    // Null when the width does not divide into the frames of the strip.
    frame: Frame | null | undefined;
    frameCount: number;
};

// What the server reads as one frame of the PNG, or why it cannot.
export const FrameValue = ({ size, frame, frameCount }: FrameProps) => {
    if (!size) return <>Lendo...</>;
    if (!frame) return <>A largura não divide em {frameCount} frames iguais</>;
    return (
        <>
            {frame.w} × {frame.h} px ({inTiles(frame.w)} × {inTiles(frame.h)}{" "}
            tiles)
        </>
    );
};

// The rotation of the variation, as its option in the select calls it.
export const RotationValue = ({ rotation }: { rotation: string }) => {
    const option = ROTATION_OPTIONS.find(({ value }) => value === rotation);
    if (!option) return <>Sem rotação</>;
    return <>{option.label}</>;
};

type ColorProps = { colorKey: string; colorHex: string };

export const ColorValue = ({ colorKey, colorHex }: ColorProps) => {
    if (!colorKey) return <>Sem cor</>;
    return (
        <>
            {colorKey} ({colorHex})
        </>
    );
};

type FootprintProps = {
    // A new rotation has its own footprint, any other copies a sibling.
    isNewRotation: boolean;
    width: number | undefined;
    height: number | undefined;
    offsetX: number | undefined;
};

export const FootprintValue = ({
    isNewRotation,
    width,
    height,
    offsetX,
}: FootprintProps) => {
    if (!isNewRotation) return <>Copiada da rotação que já existe</>;
    return (
        <>
            {width} × {height} tiles, deslocamento {offsetX}
        </>
    );
};

type TargetProps = { targetX: number | undefined; targetY: number | undefined };

// The target of a teleport, once both cells are informed.
export const TeleportTargetValue = ({ targetX, targetY }: TargetProps) => {
    if (targetX === undefined || targetY === undefined) {
        return <>Ainda não informado</>;
    }
    return (
        <>
            Célula {targetX}, {targetY}
        </>
    );
};
