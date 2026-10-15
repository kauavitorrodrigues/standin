import { useLayoutEffect, useRef, useState } from "react";

const GAP = 8;

// How many items fit in a row before the rest has to go to a "+N" popover.
// The caller renders an invisible copy of the items followed by the "+N"
// element inside `measureRef`, so every width is known without guessing.
export function useVisibleItemsCount(itemsKey: string, itemsLength: number) {
    const containerRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState(itemsLength);

    useLayoutEffect(() => {
        const container = containerRef.current;
        const measure = measureRef.current;
        if (!container || !measure) return;

        let frame: number | null = null;

        const compute = () => {
            frame = null;
            const containerWidth = container.clientWidth;
            const children = Array.from(measure.children) as HTMLElement[];
            const items = children.slice(0, itemsLength);
            const moreItem = children[itemsLength];
            if (items.length === 0) return;

            const widths = items.map((item) => item.offsetWidth);
            const totalWidth = widths.reduce(
                (sum, width, i) => sum + width + (i > 0 ? GAP : 0),
                0
            );

            if (totalWidth <= containerWidth) {
                setVisibleCount(itemsLength);
                return;
            }

            const moreWidth = GAP + (moreItem?.offsetWidth ?? 0);
            let total = 0;
            let count = 0;
            for (const width of widths) {
                const withItem = total + (count > 0 ? GAP : 0) + width;
                if (withItem + moreWidth > containerWidth) break;
                total = withItem;
                count++;
            }
            setVisibleCount(count);
        };

        const scheduleCompute = () => {
            if (frame !== null) return;
            frame = requestAnimationFrame(compute);
        };

        compute();

        const resizeObserver = new ResizeObserver(scheduleCompute);
        resizeObserver.observe(container);
        resizeObserver.observe(measure);

        return () => {
            if (frame !== null) cancelAnimationFrame(frame);
            resizeObserver.disconnect();
        };
    }, [itemsKey, itemsLength]);

    return {
        containerRef,
        measureRef,
        visibleCount: Math.min(visibleCount, itemsLength),
    };
}
