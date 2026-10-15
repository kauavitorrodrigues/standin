import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/toast";
import { SOLID_DETECT_MESSAGES } from "../consts/messages";
import type { FootprintMasks } from "../types/footprintMask";
import type { Crop, Footprint } from "../types/spriteGeometry";
import { detectFootprintMask } from "../utils/detectSolidMask";
import { readImagePixels } from "../utils/readImagePixels";
import { normalizeMask } from "../utils/footprintMask";

// How long the footprint rests before the drawing is read, so a drag over the
// image reads it once, where it stops.
const DETECT_DEBOUNCE_MS = 150;

type Params = {
    file: File;
    frame: Crop;
    footprint: Footprint;
    // Whether the drawing can be read: the asset is still and has a crop.
    enabled: boolean;
    onChange?: (masks: FootprintMasks) => void;
};

// The footprint always starts as the drawing: the cells where the PNG has
// enough pixels are occupied, and the collision follows them. It is read again
// whenever the crop changes, until the user paints a cell of his own. Then the
// cells are left alone until the crop changes again.
export const useSolidDetection = ({
    file,
    frame,
    footprint,
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
    // The latest of what the read needs, so the effect below only restarts when
    // the footprint changes and not on every render.
    const latest = useRef({ file, frame, footprint, onChange });
    useEffect(() => {
        latest.current = { file, frame, footprint, onChange };
    });

    useEffect(() => {
        if (!enabled || paintedFor.current === geometryKey) return;
        let stale = false;

        const detect = async () => {
            const current = latest.current;
            try {
                const pixels = await readImagePixels(current.file);
                if (stale || !pixels) return;
                const detected = detectFootprintMask(
                    pixels,
                    current.frame,
                    current.footprint
                );
                if (stale || !detected) return;
                current.onChange?.({
                    mask: normalizeMask(detected),
                    solidMask: null,
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
    }, [enabled, geometryKey]);

    // Called when the user paints a cell, so the drawing stops replacing it.
    const markPainted = () => {
        paintedFor.current = geometryKey;
    };

    return { markPainted };
};
