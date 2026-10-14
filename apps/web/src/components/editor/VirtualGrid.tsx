import { useRef, type ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { VIRTUAL_GRID_OVERSCAN } from "@/components/editor/consts/virtualGrid";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props<T> = {
    items: T[];
    columns: number;
    // Height of a row before it is measured.
    estimateRowHeight: number;
    getKey: (item: T) => string | number;
    renderItem: (item: T) => ReactNode;
};

const PADDING_PX = 12;

// A scrolling grid that renders only the rows in view. The rows are the
// virtual items, each one holds `columns` items, and the scroll area is the
// one of the panel. It fills the height that is left.
export const VirtualGrid = <T,>({
    items,
    columns,
    estimateRowHeight,
    getKey,
    renderItem,
}: Props<T>) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // The virtualizer is not memoizable by the compiler, and nothing here
    // relies on it being.
    // eslint-disable-next-line react-hooks/incompatible-library
    const virtualizer = useVirtualizer({
        count: Math.ceil(items.length / columns),
        estimateSize: () => estimateRowHeight,
        getScrollElement: () => scrollRef.current,
        overscan: VIRTUAL_GRID_OVERSCAN,
        paddingStart: PADDING_PX,
        paddingEnd: PADDING_PX,
    });

    return (
        <ScrollArea viewportRef={scrollRef} className="min-h-0 flex-1">
            <div
                className="relative w-full"
                style={{ height: `${virtualizer.getTotalSize()}px` }}
            >
                {virtualizer.getVirtualItems().map(({ index, start, key }) => (
                    <div
                        key={key}
                        ref={virtualizer.measureElement}
                        data-index={index}
                        className="absolute top-0 left-0 w-full px-3 pb-1.5"
                        style={{ transform: `translateY(${start}px)` }}
                    >
                        <div
                            className="grid justify-items-center"
                            style={{
                                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                            }}
                        >
                            {items
                                .slice(index * columns, (index + 1) * columns)
                                .map((item) => (
                                    <div key={getKey(item)}>
                                        {renderItem(item)}
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
};
