import { useLayoutEffect, useRef, useState } from "react";
import { TOOLBAR_ANCHOR_ATTRIBUTE } from "@/features/editor/consts/toolbar";

// Where the toolbar button named `anchorId` is, as the distance from the top
// of the area the element is placed in. The ref goes on the element that is
// placed. It is null until the button is found, and it is measured again when
// the area is resized.
export const useAnchorTop = (anchorId: string) => {
    const ref = useRef<HTMLDivElement>(null);
    const [top, setTop] = useState<number | null>(null);

    useLayoutEffect(() => {
        const area = ref.current?.offsetParent;
        if (!area) return;

        const measure = () => {
            const button = area.querySelector(
                `[${TOOLBAR_ANCHOR_ATTRIBUTE}="${anchorId}"]`
            );
            if (!button) return;
            setTop(
                button.getBoundingClientRect().top -
                    area.getBoundingClientRect().top
            );
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(area);
        return () => observer.disconnect();
    }, [anchorId]);

    return { ref, top };
};
