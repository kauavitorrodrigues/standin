import { useCallback, useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { PLAYER_DIRECTIONS } from "@standin/contracts";
import type { AvatarLayer, PlayerDirection } from "@standin/contracts";
import { PREVIEW_SCALE, PREVIEW_SCENE } from "../consts/editor/preview";
import { drawPreviewFrame, drawPreviewScene } from "../utils/drawPreview";
import {
    getDirectionFromKey,
    resolveFrameRect,
    rotateDirection,
} from "../utils/frames";
import { buildSheetCanvas } from "../utils/sheetCanvas";

type Params = {
    layers: readonly AvatarLayer[];
};

export const PREVIEW_CANVAS_SIZE = {
    width: PREVIEW_SCENE.w * PREVIEW_SCALE,
    height: PREVIEW_SCENE.h * PREVIEW_SCALE,
} as const;

// Draws the preview on a 2D canvas, outside Phaser. The avatar stands still
// facing the chosen direction and walks while the pointer is over it. Nothing
// is kept in React state: direction, sheet and animation live in refs and the
// canvas is redrawn when they change.
export const useAvatarPreviewCanvas = ({ layers }: Params) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sheetRef = useRef<HTMLCanvasElement | null>(null);
    const directionRef = useRef<PlayerDirection>(PLAYER_DIRECTIONS.DOWN);
    const animationRef = useRef<number | null>(null);
    const startedAtRef = useRef(0);

    const draw = useCallback(
        (now: number) => {
            const context = canvasRef.current?.getContext("2d");
            if (!context) return;

            context.clearRect(
                0,
                0,
                PREVIEW_CANVAS_SIZE.width,
                PREVIEW_CANVAS_SIZE.height
            );
            drawPreviewScene(context);

            const sheet = sheetRef.current;
            if (!sheet) return;

            const isWalking = animationRef.current !== null;
            const frame = resolveFrameRect(
                isWalking ? "WALK" : "IDLE",
                directionRef.current,
                now - startedAtRef.current
            );
            drawPreviewFrame(context, sheet, frame);
        },
        []
    );

    const stopWalking = useCallback(() => {
        if (animationRef.current === null) return;
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
        draw(0);
    }, [draw]);

    const startWalking = useCallback(() => {
        if (animationRef.current !== null || !sheetRef.current) return;
        startedAtRef.current = performance.now();
        const step = (now: number) => {
            draw(now);
            animationRef.current = requestAnimationFrame(step);
        };
        animationRef.current = requestAnimationFrame(step);
    }, [draw]);

    useEffect(() => {
        sheetRef.current = buildSheetCanvas(layers);
        draw(0);
    }, [layers, draw]);

    useEffect(() => stopWalking, [stopWalking]);

    const turn = useCallback(
        (direction: PlayerDirection) => {
            directionRef.current = direction;
            draw(performance.now());
        },
        [draw]
    );

    const handleClick = useCallback(
        () => turn(rotateDirection(directionRef.current)),
        [turn]
    );

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            const direction = getDirectionFromKey(event.key);
            if (direction === null) return;
            event.preventDefault();
            turn(direction);
        },
        [turn]
    );

    return {
        canvasRef,
        handlers: {
            onClick: handleClick,
            onKeyDown: handleKeyDown,
            onPointerEnter: startWalking,
            onPointerLeave: stopWalking,
        },
    };
};
