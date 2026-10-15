import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/toast";
import { AUTO_MARKS_MESSAGES } from "../consts/messages";
import type { Crop } from "../types/spriteGeometry";
import { detectCrop } from "../utils/detectCrop";
import { readImagePixels } from "../utils/readImagePixels";

type Params = {
    file: File;
    // The image is a still one with no crop marked yet, so there is room for
    // the drawing to suggest one.
    enabled: boolean;
    onDetect: (crop: Crop) => void;
};

// Marks the crop on its own when an image comes in: the smallest rectangle of
// whole tiles around the drawing, the transparent margin left out. It runs once
// per image once it has marked, so a crop the user changes or clears is never marked again.
export const useAutoMarks = ({ file, enabled, onDetect }: Params) => {
    const doneFor = useRef<string | null>(null);
    const fileKey = `${file.name}:${file.size}:${file.lastModified}`;
    // The latest handler, so the effect only restarts for a new image.
    const latest = useRef(onDetect);
    useEffect(() => {
        latest.current = onDetect;
    });

    useEffect(() => {
        if (!enabled || doneFor.current === fileKey) return;
        let stale = false;

        const detect = async () => {
            try {
                const pixels = await readImagePixels(file);
                if (stale || !pixels) return;
                const crop = detectCrop(pixels);
                if (stale || !crop) return;
                doneFor.current = fileKey;
                latest.current(crop);
            } catch {
                if (!stale) {
                    toast.add({
                        title: AUTO_MARKS_MESSAGES.FAILED,
                        type: "error",
                    });
                }
            }
        };

        void detect();
        return () => {
            stale = true;
        };
    }, [enabled, fileKey, file]);
};
