import { useEffect, useRef } from "react";
import type { PixelRect } from "../types/editor";
import { getOpaqueBounds } from "../utils/getOpaqueBounds";

const loadImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
    });

// Draws a sprite cropped to a rect of its sheet (the whole image when there
// is none) and then trimmed to the box of its own non-transparent pixels. A
// part whose art sits in a corner of a tall, mostly empty frame renders as a
// tile close to its own size instead of as a mostly empty tile.
export const useTrimmedSprite = (front: string, rect: PixelRect | null) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || front === "") return;
        let cancelled = false;

        const draw = async () => {
            const images = await Promise.all([loadImage(front)]);
            if (cancelled) return;

            const crop = rect ?? {
                x: 0,
                y: 0,
                w: images[0].naturalWidth,
                h: images[0].naturalHeight,
            };

            const source = document.createElement("canvas");
            source.width = crop.w;
            source.height = crop.h;
            const sourceCtx = source.getContext("2d");
            if (!sourceCtx) return;
            for (const image of images) {
                sourceCtx.drawImage(
                    image,
                    crop.x,
                    crop.y,
                    crop.w,
                    crop.h,
                    0,
                    0,
                    crop.w,
                    crop.h
                );
            }

            const bounds = getOpaqueBounds(
                sourceCtx.getImageData(0, 0, crop.w, crop.h).data,
                crop.w,
                crop.h
            ) ?? { x: 0, y: 0, w: crop.w, h: crop.h };

            if (cancelled) return;
            canvas.width = bounds.w;
            canvas.height = bounds.h;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                source,
                bounds.x,
                bounds.y,
                bounds.w,
                bounds.h,
                0,
                0,
                bounds.w,
                bounds.h
            );
        };

        void draw();
        return () => {
            cancelled = true;
        };
    }, [front, rect]);

    return canvasRef;
};
