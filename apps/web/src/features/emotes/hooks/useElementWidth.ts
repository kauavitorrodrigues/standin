import { useCallback, useEffect, useState } from "react";

/**
 * The width of an element, kept up to date while it resizes. Null until the
 * first measure, so a caller can show everything for the first frame.
 *
 * @returns A ref callback to put on the element, and its width in px.
 */
export const useElementWidth = () => {
    const [width, setWidth] = useState<number | null>(null);
    const [element, setElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (!element) return;

        // The whole box, padding included, which is what the callers count
        // their slots against. The observer reports once as soon as it starts
        // watching.
        const observer = new ResizeObserver(() => {
            setWidth(element.getBoundingClientRect().width);
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [element]);

    const ref = useCallback((node: HTMLElement | null) => setElement(node), []);
    return { ref, width };
};
