import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/toast";
import { SOLID_DETECT_MESSAGES } from "../consts/messages";
import type { FootprintMasks } from "../types/footprintMask";
import type { Crop, Footprint } from "../types/spriteGeometry";
import { detectSolidMask } from "../utils/detectSolidMask";
import { readImagePixels } from "../utils/readImagePixels";
import { normalizeSolidMask } from "../utils/solidMask";

// How long the footprint rests before the drawing is read, so a drag over the
// image reads it once, where it stops.
const DETECT_DEBOUNCE_MS = 150;

type Params = {
    file: File;
    frame: Crop;
    footprint: Footprint;
    masks: FootprintMasks;
    // Whether the asset has a collision to fill: it blocks the way, it is
    // still, and its footprint is marked.
    enabled: boolean;
    onChange?: (masks: FootprintMasks) => void;
};

// The collision always starts as the drawing: the cells where the PNG has
// enough pixels are solid. It is read again whenever the footprint or its
// tiles change, until the user paints a cell of his own. Then the collision is
// left alone until the footprint is marked again.
export const useSolidDetection = ({
    file,
    frame,
    footprint,
    masks,
    enabled,
    onChange,
}: Params) => {
    const paintedFor = useRef<string | null>(null);
    const geometryKey = JSON.stringify([
        file.name,
        file.size,
        frame,
        footprint,
    ]);
    const maskKey = JSON.stringify(masks.mask);
    // The latest of what the read needs, so the effect below only restarts when
    // the footprint changes and not on every render.
    const latest = useRef({ file, frame, footprint, masks, onChange });
    useEffect(() => {
        latest.current = { file, frame, footprint, masks, onChange };
    });

    useEffect(() => {
        if (!enabled || paintedFor.current === geometryKey) return;
        let stale = false;

        const detect = async () => {
            const current = latest.current;
            try {
                const pixels = await readImagePixels(current.file);
                if (stale || !pixels) return;
                const detected = detectSolidMask(
                    pixels,
                    current.frame,
                    current.footprint,
                    current.masks.mask
                );
                if (stale || !detected) return;
                current.onChange?.({
                    mask: current.masks.mask,
                    solidMask: normalizeSolidMask(
                        current.footprint,
                        current.masks.mask,
                        detected
                    ),
                });
            } catch {
                if (!stale) {
                    toast.add({
                        title: SOLID_DETECT_MESSAGES.FAILED,
                        type: "error",
                    });
                }
            }
        };

        const timer = setTimeout(() => void detect(), DETECT_DEBOUNCE_MS);
        return () => {
            stale = true;
            clearTimeout(timer);
        };
    }, [enabled, geometryKey, maskKey]);

    // Called when the user paints a cell, so the drawing stops replacing it.
    const markPainted = () => {
        paintedFor.current = geometryKey;
    };

    return { markPainted };
};
