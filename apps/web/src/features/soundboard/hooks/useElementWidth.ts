import { useEffect, useState } from "react";

/** The width of the content of an element, kept up to date as it resizes. */
export const useElementWidth = (element: HTMLElement | null): number => {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (!element) return;
        const observer = new ResizeObserver(([entry]) => {
            if (entry) setWidth(entry.contentRect.width);
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [element]);

    return width;
};
