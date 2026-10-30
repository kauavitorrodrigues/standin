import { useEffect, useRef } from "react";

/** Draws the peaks as bars on a canvas, in the text color of the canvas. */
export const useWaveformCanvas = (peaks: Float32Array) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = getComputedStyle(canvas).color;
        const barWidth = canvas.width / peaks.length;
        peaks.forEach((peak, index) => {
            const height = Math.max(2, peak * canvas.height);
            context.fillRect(
                index * barWidth,
                (canvas.height - height) / 2,
                Math.max(1, barWidth - 1),
                height
            );
        });
    }, [peaks]);

    return canvasRef;
};
