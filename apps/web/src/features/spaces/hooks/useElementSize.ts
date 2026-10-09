import { useLayoutEffect, useRef, useState } from "react";

type Size = { width: number; height: number };

// Measures an element and follows it as it is resized. useLayoutEffect so the
// first measurement lands before paint and nothing flashes at a wrong size.
export const useElementSize = <T extends HTMLElement>() => {
    const ref = useRef<T>(null);
    const [size, setSize] = useState<Size>({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        const update = () =>
            setSize({
                width: element.clientWidth,
                height: element.clientHeight,
            });
        update();

        const observer = new ResizeObserver(update);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return { ref, size };
};
